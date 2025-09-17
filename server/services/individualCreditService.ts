/**
 * INDIVIDUAL CREDIT SYSTEM SERVICE
 * 
 * Handles user credit top-ups, bonus calculations, and balance management
 * with UDF-compliant additive operations and comprehensive audit trails.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System  
 * Last Updated: September 17, 2025
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
import { digitalCurrencyUDF } from "../../shared/utils/digitalCurrencyValidation";

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
   * Calculate applicable bonuses for a credit top-up
   * UDF-Compliant: All bonus calculations use validated algorithms
   */
  async calculateBonuses(userId: number, amount: number, promoCode?: string): Promise<CreditBonus[]> {
    const bonuses: CreditBonus[] = [];
    
    try {
      // Check if first-time purchase
      const existingTransactions = await db
        .select()
        .from(digitalCreditsTransactions)
        .where(
          and(
            eq(digitalCreditsTransactions.userId, userId),
            eq(digitalCreditsTransactions.type, 'credit'),
            eq(digitalCreditsTransactions.status, 'completed')
          )
        )
        .limit(1);

      // First-time user bonus (15% bonus)
      if (existingTransactions.length === 0) {
        bonuses.push({
          type: 'first_time',
          percentage: 15,
          description: 'Welcome Bonus - 15% extra credits on your first purchase!',
          condition: 'First-time purchase'
        });
      }

      // Volume-based bonuses
      if (amount >= 10000) { // $100+
        bonuses.push({
          type: 'volume',
          percentage: 10,
          description: 'Volume Bonus - 10% extra for purchases $100+',
          condition: 'Purchase amount ≥ $100'
        });
      } else if (amount >= 5000) { // $50+
        bonuses.push({
          type: 'volume',
          percentage: 5,
          description: 'Volume Bonus - 5% extra for purchases $50+',
          condition: 'Purchase amount ≥ $50'
        });
      }

      // Promotional code bonuses
      if (promoCode) {
        const promoBonus = await this.validatePromoCode(promoCode, userId, amount);
        if (promoBonus) {
          bonuses.push(promoBonus);
        }
      }

      // Loyalty tier bonuses (based on total previous purchases)
      const loyaltyBonus = await this.calculateLoyaltyBonus(userId, amount);
      if (loyaltyBonus) {
        bonuses.push(loyaltyBonus);
      }

      return bonuses;

    } catch (error) {
      console.error('[CREDIT SERVICE] Error calculating bonuses:', error);
      return []; // Return empty bonuses on error rather than failing
    }
  }

  /**
   * Validate promotional code and return applicable bonus
   */
  private async validatePromoCode(promoCode: string, userId: number, amount: number): Promise<CreditBonus | null> {
    // Promotional codes database lookup would go here
    // For now, implement some standard promo codes
    const promoCodes: Record<string, CreditBonus> = {
      'WELCOME20': {
        type: 'promotional',
        percentage: 20,
        description: 'WELCOME20 - 20% bonus credits',
        condition: 'Valid promotional code'
      },
      'SUMMER25': {
        type: 'promotional',
        percentage: 25,
        description: 'SUMMER25 - 25% summer bonus',
        condition: 'Valid seasonal promotion'
      }
    };

    return promoCodes[promoCode.toUpperCase()] || null;
  }

  /**
   * Calculate loyalty bonus based on user's purchase history
   */
  private async calculateLoyaltyBonus(userId: number, currentAmount: number): Promise<CreditBonus | null> {
    try {
      // Calculate total previous purchases
      const totalPurchased = await db
        .select({ total: sum(digitalCreditsTransactions.amount) })
        .from(digitalCreditsTransactions)
        .where(
          and(
            eq(digitalCreditsTransactions.userId, userId),
            eq(digitalCreditsTransactions.type, 'credit'),
            eq(digitalCreditsTransactions.status, 'completed')
          )
        );

      const lifetime = Number(totalPurchased[0]?.total || 0);

      // Loyalty tier bonuses
      if (lifetime >= 100000) { // $1000+ lifetime
        return {
          type: 'loyalty',
          percentage: 8,
          description: 'Diamond Tier - 8% loyalty bonus',
          condition: 'Lifetime purchases ≥ $1000'
        };
      } else if (lifetime >= 50000) { // $500+ lifetime
        return {
          type: 'loyalty',
          percentage: 5,
          description: 'Gold Tier - 5% loyalty bonus',
          condition: 'Lifetime purchases ≥ $500'
        };
      } else if (lifetime >= 25000) { // $250+ lifetime
        return {
          type: 'loyalty',
          percentage: 3,
          description: 'Silver Tier - 3% loyalty bonus',
          condition: 'Lifetime purchases ≥ $250'
        };
      }

      return null;
    } catch (error) {
      console.error('[CREDIT SERVICE] Error calculating loyalty bonus:', error);
      return null;
    }
  }

  /**
   * Process credit top-up with bonus calculations
   * UDF-Compliant: Uses additive operations and complete audit trails
   */
  async processTopUp(request: TopUpRequest): Promise<TopUpResult> {
    const { userId, amount, paymentMethod, customerEmail, promoCode } = request;

    // Validate input using UDF utilities
    const validation = digitalCurrencyUDF.validateTopUpAmount(amount);
    if (!validation.isValid) {
      return {
        success: false,
        finalAmount: 0,
        bonusAmount: 0,
        balance: 0,
        error: validation.error
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

        // Calculate bonuses
        const bonuses = await this.calculateBonuses(userId, amount, promoCode);
        const totalBonusPercentage = bonuses.reduce((sum, bonus) => sum + bonus.percentage, 0);
        const bonusAmount = Math.floor(amount * (totalBonusPercentage / 100));
        const finalAmount = amount + bonusAmount;

        // Create transaction record (pending until payment confirmed)
        const transactionData: InsertDigitalCreditsTransaction = {
          userId,
          accountId: account[0].id,
          amount: finalAmount,
          type: 'credit',
          status: 'pending',
          description: `Credit top-up: $${(amount / 100).toFixed(2)}${bonusAmount > 0 ? ` + $${(bonusAmount / 100).toFixed(2)} bonus` : ''}`,
          metadata: {
            originalAmount: amount,
            bonusAmount,
            bonuses: bonuses.map(b => ({ type: b.type, percentage: b.percentage, description: b.description })),
            paymentMethod,
            customerEmail,
            promoCode: promoCode || null
          }
        };

        const newTransaction = await tx
          .insert(digitalCreditsTransactions)
          .values(transactionData)
          .returning();

        // For manual/test payments, immediately complete the transaction
        let updatedBalance = account[0].balance;
        if (paymentMethod === 'manual') {
          // UDF-Compliant: Additive balance update
          await tx
            .update(digitalCreditsAccounts)
            .set({
              balance: sql`${digitalCreditsAccounts.balance} + ${finalAmount}`,
              totalPurchased: sql`${digitalCreditsAccounts.totalPurchased} + ${finalAmount}`,
              updatedAt: new Date()
            })
            .where(eq(digitalCreditsAccounts.id, account[0].id));

          await tx
            .update(digitalCreditsTransactions)
            .set({
              status: 'completed',
              completedAt: new Date()
            })
            .where(eq(digitalCreditsTransactions.id, newTransaction[0].id));

          updatedBalance = account[0].balance + finalAmount;
        }

        console.log('[CREDIT SERVICE] Top-up processed:', {
          userId,
          amount,
          finalAmount,
          bonusAmount,
          transactionId: newTransaction[0].id,
          bonuses: bonuses.length
        });

        return {
          success: true,
          transactionId: newTransaction[0].id,
          finalAmount,
          bonusAmount,
          balance: updatedBalance,
          bonusType: bonuses.length > 0 ? bonuses[0].type : undefined
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

      // Determine loyalty tier
      const totalPurchased = account[0].totalPurchased;
      let loyaltyTier = 'Bronze';
      if (totalPurchased >= 100000) loyaltyTier = 'Diamond';
      else if (totalPurchased >= 50000) loyaltyTier = 'Gold';
      else if (totalPurchased >= 25000) loyaltyTier = 'Silver';

      return {
        balance: account[0].balance,
        totalPurchased: account[0].totalPurchased,
        totalSpent: account[0].totalSpent,
        recentTransactions,
        loyaltyTier
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
              eq(digitalCreditsTransactions.id, transactionId),
              eq(digitalCreditsTransactions.status, 'pending')
            )
          )
          .limit(1);

        if (transaction.length === 0) {
          console.error('[CREDIT SERVICE] Transaction not found or already completed:', transactionId);
          return false;
        }

        const txn = transaction[0];

        // UDF-Compliant: Additive balance update
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: sql`${digitalCreditsAccounts.balance} + ${txn.amount}`,
            totalPurchased: sql`${digitalCreditsAccounts.totalPurchased} + ${txn.amount}`,
            updatedAt: new Date()
          })
          .where(eq(digitalCreditsAccounts.id, txn.accountId));

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
          amount: txn.amount,
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