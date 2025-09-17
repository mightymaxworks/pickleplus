/**
 * INDIVIDUAL CREDIT SYSTEM SERVICE
 * 
 * Handles user credit top-ups, bonus calculations, and balance management
 * with UDF-compliant additive operations and comprehensive audit trails.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System  
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and bonus calculations
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, sum, desc, sql } from "drizzle-orm";
import postgres from "postgres";
import { 
  digitalCreditsAccounts, 
  digitalCreditsTransactions,
  type DigitalCreditsAccount,
  type DigitalCreditsTransaction,
  type InsertDigitalCreditsTransaction
} from "../../shared/schema";
import { 
  digitalCurrencyUDF,
  calculateTopUpBonus,
  validateCreditTransaction,
  calculatePicklePointsReward,
  PICKLE_CREDITS_CONSTANTS
} from "../../shared/utils/digitalCurrencyValidation";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

export interface TopUpRequest {
  userId: number;
  amount: number; // Amount in cents
  paymentMethod: 'wise' | 'stripe' | 'manual';
  customerEmail: string;
  promoCode?: string;
}

export interface TopUpResult {
  success: boolean;
  transactionId?: number;
  finalAmount: number; // Amount after bonuses
  bonusAmount: number;
  bonusType?: string;
  balance: number;
  wiseTransferId?: string;
  error?: string;
}

export interface CreditBonus {
  type: 'volume' | 'first_time' | 'promotional' | 'loyalty';
  percentage: number;
  description: string;
  condition: string;
}

export class IndividualCreditService {
  
  /**
   * Get loyalty tier information based on user's purchase history
   * UDF-Compliant: Uses centralized tier thresholds
   */
  async getLoyaltyTierInfo(userId: number): Promise<{
    currentTier: string;
    totalPurchased: number;
    nextTierRequirement?: number;
    nextTierName?: string;
  }> {
    try {
      // Get account information for total purchased
      const account = await db
        .select()
        .from(digitalCreditsAccounts)
        .where(eq(digitalCreditsAccounts.userId, userId))
        .limit(1);

      const totalPurchased = account[0]?.totalPurchased || 0;

      // Define loyalty tiers using UDF constants
      const tiers = [
        { name: 'Bronze', requirement: 0 },
        { name: 'Silver', requirement: 25000 }, // $250
        { name: 'Gold', requirement: 50000 },   // $500
        { name: 'Diamond', requirement: 100000 } // $1000
      ];

      let currentTier = 'Bronze';
      let nextTierRequirement: number | undefined;
      let nextTierName: string | undefined;

      for (let i = tiers.length - 1; i >= 0; i--) {
        if (totalPurchased >= tiers[i].requirement) {
          currentTier = tiers[i].name;
          if (i < tiers.length - 1) {
            nextTierRequirement = tiers[i + 1].requirement;
            nextTierName = tiers[i + 1].name;
          }
          break;
        }
      }

      return {
        currentTier,
        totalPurchased,
        nextTierRequirement,
        nextTierName
      };

    } catch (error) {
      console.error('[CREDIT SERVICE] Error getting loyalty tier:', error);
      return {
        currentTier: 'Bronze',
        totalPurchased: 0
      };
    }
  }

  /**
   * Process credit top-up with bonus calculations
   * UDF-Compliant: Uses additive operations and complete audit trails
   */
  async processTopUp(request: TopUpRequest): Promise<TopUpResult> {
    const { userId, amount, paymentMethod, customerEmail, promoCode } = request;

    // Validate minimum amount using UDF constants
    if (amount < PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT) {
      return {
        success: false,
        finalAmount: 0,
        bonusAmount: 0,
        balance: 0,
        error: `Minimum top-up amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT / 100).toFixed(2)}`
      };
    }

    try {
      return await db.transaction(async (tx) => {
        // Get or create user's credit account
        let account = await tx
          .select()
          .from(digitalCreditsAccounts)
          .where(eq(digitalCreditsAccounts.userId, userId))
          .limit(1);

        if (account.length === 0) {
          // Create new account
          const newAccount = await tx
            .insert(digitalCreditsAccounts)
            .values({
              userId,
              balance: 0,
              totalPurchased: 0,
              totalSpent: 0
            })
            .returning();
          account = newAccount;
        }

        // UDF-Compliant: Use centralized bonus calculation
        const bonusCalc = calculateTopUpBonus(amount);
        const bonusAmount = bonusCalc.bonusAmount;
        const finalAmount = bonusCalc.totalCredits;

        // UDF Validation: Validate transaction before processing
        const transactionValidation = validateCreditTransaction({
          userId,
          amount: finalAmount,
          type: 'credit',
          currentBalance: account[0].balance,
          expectedBalanceAfter: account[0].balance + finalAmount
        });

        if (!transactionValidation.isValid) {
          return {
            success: false,
            finalAmount: 0,
            bonusAmount: 0,
            balance: account[0].balance,
            error: `Transaction validation failed: ${transactionValidation.errors.join(', ')}`
          };
        }

        // Create transaction record (pending until payment confirmed)
        const transactionData: InsertDigitalCreditsTransaction = {
          userId,
          amount: finalAmount,
          type: 'credit',
          status: 'pending', // SECURITY: Explicit pending status - requires webhook completion
          description: `Credit top-up: $${(amount / 100).toFixed(2)}${bonusAmount > 0 ? ` + $${(bonusAmount / 100).toFixed(2)} bonus` : ''}`,
          balanceAfter: account[0].balance + finalAmount,
          metadata: {
            originalAmount: amount,
            bonusAmount,
            bonusCalc: bonusCalc.auditMetadata,
            paymentMethod,
            customerEmail,
            promoCode: promoCode || null
          }
        };

        const newTransaction = await tx
          .insert(digitalCreditsTransactions)
          .values(transactionData)
          .returning();

        // SECURITY: Manual payments removed from public API - all transactions now require webhook completion
        // Transactions are created as 'pending' and completed via verified payment provider webhooks only

        console.log('[CREDIT SERVICE] Top-up processed:', {
          userId,
          amount,
          finalAmount,
          bonusAmount,
          transactionId: newTransaction[0].id
        });

        return {
          success: true,
          transactionId: newTransaction[0].id,
          finalAmount,
          bonusAmount,
          balance: account[0].balance, // Current balance unchanged until webhook completion
          bonusType: bonusAmount > 0 ? 'volume' : undefined
        };
      });

    } catch (error) {
      console.error('[CREDIT SERVICE] Top-up processing error:', error);
      return {
        success: false,
        finalAmount: 0,
        bonusAmount: 0,
        balance: 0,
        error: 'Failed to process top-up'
      };
    }
  }

  /**
   * Get user's current balance and transaction history
   */
  async getUserCreditSummary(userId: number): Promise<{
    balance: number;
    totalPurchased: number;
    totalSpent: number;
    recentTransactions: DigitalCreditsTransaction[];
    loyaltyTier: string;
  }> {
    try {
      // Get account information
      const account = await db
        .select()
        .from(digitalCreditsAccounts)
        .where(eq(digitalCreditsAccounts.userId, userId))
        .limit(1);

      if (account.length === 0) {
        return {
          balance: 0,
          totalPurchased: 0,
          totalSpent: 0,
          recentTransactions: [],
          loyaltyTier: 'Bronze'
        };
      }

      // Get recent transactions
      const recentTransactions = await db
        .select()
        .from(digitalCreditsTransactions)
        .where(eq(digitalCreditsTransactions.userId, userId))
        .orderBy(desc(digitalCreditsTransactions.createdAt))
        .limit(10);

      // Get loyalty tier using centralized method
      const loyaltyInfo = await this.getLoyaltyTierInfo(userId);

      return {
        balance: account[0].balance,
        totalPurchased: account[0].totalPurchased,
        totalSpent: account[0].totalSpent,
        recentTransactions,
        loyaltyTier: loyaltyInfo.currentTier
      };

    } catch (error) {
      console.error('[CREDIT SERVICE] Error getting user summary:', error);
      throw error;
    }
  }

  /**
   * Complete a pending top-up transaction (called by webhook)
   */
  async completeTopUp(transactionId: number, wiseTransferId?: string): Promise<boolean> {
    try {
      return await db.transaction(async (tx) => {
        // Get the pending transaction
        const transaction = await tx
          .select()
          .from(digitalCreditsTransactions)
          .where(
            and(
              eq(digitalCreditsTransactions.id, transactionId)
            )
          )
          .limit(1);

        if (transaction.length === 0) {
          console.error('[CREDIT SERVICE] Transaction not found:', transactionId);
          return false;
        }

        const txn = transaction[0];
        
        // Skip if already completed
        if (txn.completedAt) {
          console.log('[CREDIT SERVICE] Transaction already completed:', transactionId);
          return true;
        }

        // Get original amount from metadata for proper accounting
        const originalAmount = txn.metadata?.originalAmount || txn.amount;

        // UDF-Compliant: Additive balance update - find account by userId since accountId might not be set
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: sql`${digitalCreditsAccounts.balance} + ${txn.amount}`,
            totalPurchased: sql`${digitalCreditsAccounts.totalPurchased} + ${originalAmount}`, // Only paid amount, not bonus
            updatedAt: new Date()
          })
          .where(eq(digitalCreditsAccounts.userId, txn.userId));

        // Mark transaction as completed
        await tx
          .update(digitalCreditsTransactions)
          .set({
            status: 'completed',
            completedAt: new Date(),
            wiseTransactionId: wiseTransferId
          })
          .where(eq(digitalCreditsTransactions.id, transactionId));

        console.log('[CREDIT SERVICE] Top-up completed:', {
          transactionId,
          userId: txn.userId,
          totalAmount: txn.amount,
          paidAmount: originalAmount,
          wiseTransferId
        });

        return true;
      });

    } catch (error) {
      console.error('[CREDIT SERVICE] Error completing top-up:', error);
      return false;
    }
  }
}

export const individualCreditService = new IndividualCreditService();