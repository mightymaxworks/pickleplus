/**
 * DIGITAL CURRENCY SERVICE - UDF-COMPLIANT IMPLEMENTATION
 * 
 * Core service for managing Pickle Credits with strict UDF algorithm compliance.
 * Integrates with Wise payment processing and maintains complete financial audit trails.
 * 
 * Version: 1.0.0 - Sprint 1: Foundation & Digital Currency Core
 * Last Updated: September 17, 2025
 * 
 * CRITICAL UDF REQUIREMENTS:
 * - All credit operations must be additive and auditable
 * - All transactions must pass validateCreditTransaction()
 * - Pickle Points must be calculated using 3:1 ratio
 * - Complete Wise payment integration with webhook validation
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, sum, sql } from "drizzle-orm";
import postgres from "postgres";
import { 
  digitalCreditsAccounts,
  digitalCreditsTransactions, 
  digitalGiftCards,
  digitalCreditsTransfers,
  users,
  type DigitalCreditsAccount,
  type InsertDigitalCreditsAccount,
  type DigitalCreditsTransaction,
  type InsertDigitalCreditsTransaction,
  type DigitalGiftCard,
  type InsertDigitalGiftCard
} from "../../shared/schema";

import { 
  digitalCurrencyUDF,
  CreditTransactionType,
  type CreditTransactionValidation,
  type PicklePointsCalculation,
  type GiftCardValidation
} from "../../shared/utils/digitalCurrencyValidation";

import { currencyService, SUPPORTED_CURRENCIES, type SupportedCurrency } from './currencyService';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

/**
 * WISE PAYMENT INTEGRATION INTERFACE
 * Secure wrapper for Wise API calls with UDF validation
 */
interface WisePaymentRequest {
  amount: number; // Amount in local currency (not cents)
  currency: SupportedCurrency; // Now supports all defined currencies
  userId: number;
  customerEmail: string;
  description: string;
  metadata?: Record<string, any>;
}

interface WisePaymentResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  amount: number;
  fee: number;
  netAmount: number;
  transactionId: string;
  webhookUrl?: string;
}

/**
 * CORE DIGITAL CURRENCY SERVICE CLASS
 * UDF-compliant implementation with complete audit trails
 */
export class DigitalCurrencyService {
  
  /**
   * UDF-COMPLIANT: Get or create user credit account
   * CRITICAL: Maintains additive balance operations only
   */
  async getOrCreateAccount(userId: number): Promise<DigitalCreditsAccount> {
    try {
      // Check if account exists
      const existingAccount = await db
        .select()
        .from(digitalCreditsAccounts)
        .where(eq(digitalCreditsAccounts.userId, userId))
        .limit(1);

      if (existingAccount.length > 0) {
        return existingAccount[0];
      }

      // Create new account with zero balance
      const newAccount: InsertDigitalCreditsAccount = {
        userId,
        balance: 0,
        totalPurchased: 0,
        totalSpent: 0
      };

      const createdAccount = await db
        .insert(digitalCreditsAccounts)
        .values(newAccount)
        .returning();

      return createdAccount[0];
    } catch (error) {
      throw new Error(`Failed to get or create account: ${error}`);
    }
  }

  /**
   * UDF-COMPLIANT: Process credit top-up with bonus calculation
   * CRITICAL: Uses validateCreditTransaction() for compliance
   */
  async processTopUp(request: {
    userId: number;
    amount: number;
    currency?: SupportedCurrency; // Add currency support
    wiseTransactionId: string;
    customerEmail: string;
  }): Promise<{
    success: boolean;
    account: DigitalCreditsAccount;
    transaction: DigitalCreditsTransaction;
    picklePointsAwarded: number;
    bonusCredits: number;
    errors: string[];
  }> {
    try {
      const account = await this.getOrCreateAccount(request.userId);
      
      // Calculate bonus credits
      const bonusCalculation = digitalCurrencyUDF.calculateTopUpBonus(request.amount);
      const totalCredits = bonusCalculation.totalCredits;
      
      // UDF VALIDATION: Validate the main credit transaction
      const creditValidation: CreditTransactionValidation = {
        userId: request.userId,
        amount: totalCredits,
        type: CreditTransactionType.TOP_UP,
        currentBalance: account.balance,
        expectedBalanceAfter: account.balance + totalCredits,
        wiseTransactionId: request.wiseTransactionId,
        referenceType: 'wise_payment'
      };

      const validation = digitalCurrencyUDF.validateCreditTransaction(creditValidation);
      if (!validation.isValid) {
        return {
          success: false,
          account,
          transaction: {} as DigitalCreditsTransaction,
          picklePointsAwarded: 0,
          bonusCredits: 0,
          errors: validation.errors
        };
      }

      // Calculate Pickle Points (3:1 ratio)
      const pointsCalculation: PicklePointsCalculation = {
        creditsAmount: totalCredits,
        pointsRatio: digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO,
        expectedPoints: Math.floor(totalCredits * digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO),
        transactionType: CreditTransactionType.TOP_UP
      };

      const pointsValidation = digitalCurrencyUDF.calculatePicklePointsReward(pointsCalculation);
      if (!pointsValidation.isValid) {
        return {
          success: false,
          account,
          transaction: {} as DigitalCreditsTransaction,
          picklePointsAwarded: 0,
          bonusCredits: 0,
          errors: pointsValidation.errors
        };
      }

      // Execute transaction in database
      const newBalance = account.balance + totalCredits;
      const newTotalPurchased = account.totalPurchased + totalCredits;

      // Create transaction record
      const transactionData: InsertDigitalCreditsTransaction = {
        userId: request.userId,
        amount: totalCredits,
        type: CreditTransactionType.TOP_UP,
        referenceType: 'wise_payment',
        wiseTransactionId: request.wiseTransactionId,
        wiseTransferState: 'completed',
        description: `Credit top-up: $${(request.amount / 100).toFixed(2)} + bonus $${(bonusCalculation.bonusAmount / 100).toFixed(2)}`,
        balanceAfter: newBalance,
        picklePointsAwarded: pointsValidation.pointsAwarded
      };

      const transaction = await db.transaction(async (tx) => {
        // Insert transaction record
        const createdTransaction = await tx
          .insert(digitalCreditsTransactions)
          .values(transactionData)
          .returning();

        // Update account balance additively (UDF compliance)
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: newBalance,
            totalPurchased: newTotalPurchased
          })
          .where(eq(digitalCreditsAccounts.userId, request.userId));

        return createdTransaction[0];
      });

      // Get updated account
      const updatedAccount = await this.getOrCreateAccount(request.userId);

      // TODO: Award Pickle Points to ranking system (integrate with existing point system)
      
      return {
        success: true,
        account: updatedAccount,
        transaction,
        picklePointsAwarded: pointsValidation.pointsAwarded,
        bonusCredits: bonusCalculation.bonusAmount,
        errors: []
      };

    } catch (error) {
      throw new Error(`Top-up processing failed: ${error}`);
    }
  }

  /**
   * UDF-COMPLIANT: Generate gift card with unique code
   * CRITICAL: Ensures partial redemption capability
   */
  async generateGiftCard(request: {
    amount: number;
    purchaserId: number;
    recipientEmail?: string;
    wiseTransactionId: string;
  }): Promise<{
    success: boolean;
    giftCard: DigitalGiftCard;
    code: string;
    errors: string[];
  }> {
    try {
      // Validate amount is a valid denomination
      const validDenominations = [2500, 5000, 10000, 25000, 50000];
      if (!validDenominations.includes(request.amount)) {
        return {
          success: false,
          giftCard: {} as DigitalGiftCard,
          code: '',
          errors: [`Invalid gift card amount. Must be one of: ${validDenominations.map(d => `$${d/100}`).join(', ')}`]
        };
      }

      // Generate unique 8-character code
      const code = this.generateGiftCardCode();
      
      // Verify code is unique
      const existingCard = await db
        .select()
        .from(digitalGiftCards)
        .where(eq(digitalGiftCards.code, code))
        .limit(1);

      if (existingCard.length > 0) {
        // Retry with new code
        return this.generateGiftCard(request);
      }

      // Create gift card record
      const giftCardData: InsertDigitalGiftCard = {
        code,
        amount: request.amount,
        remainingBalance: request.amount,
        purchaserId: request.purchaserId,
        recipientEmail: request.recipientEmail,
        wiseTransactionId: request.wiseTransactionId
      };

      const giftCard = await db
        .insert(digitalGiftCards)
        .values(giftCardData)
        .returning();

      return {
        success: true,
        giftCard: giftCard[0],
        code,
        errors: []
      };

    } catch (error) {
      throw new Error(`Gift card generation failed: ${error}`);
    }
  }

  /**
   * UDF-COMPLIANT: Redeem gift card with partial balance support
   * CRITICAL: Uses validateGiftCardRedemption() for integrity
   */
  async redeemGiftCard(request: {
    code: string;
    userId: number;
    redemptionAmount?: number; // Optional: for partial redemption
  }): Promise<{
    success: boolean;
    creditsAdded: number;
    remainingBalance: number;
    errors: string[];
  }> {
    try {
      // Find gift card
      const giftCard = await db
        .select()
        .from(digitalGiftCards)
        .where(eq(digitalGiftCards.code, request.code))
        .limit(1);

      if (giftCard.length === 0) {
        return {
          success: false,
          creditsAdded: 0,
          remainingBalance: 0,
          errors: ['Gift card not found']
        };
      }

      const card = giftCard[0];
      const redemptionAmount = request.redemptionAmount || card.remainingBalance;

      // UDF VALIDATION: Validate gift card redemption
      const validation: GiftCardValidation = {
        code: request.code,
        amount: card.amount,
        remainingBalance: card.remainingBalance,
        purchaserId: card.purchaserId,
        isValidRedemption: true,
        redemptionAmount
      };

      const redemptionValidation = digitalCurrencyUDF.validateGiftCardRedemption(validation);
      if (!redemptionValidation.isValid) {
        return {
          success: false,
          creditsAdded: 0,
          remainingBalance: card.remainingBalance,
          errors: redemptionValidation.errors
        };
      }

      // Get user account
      const account = await this.getOrCreateAccount(request.userId);

      // UDF VALIDATION: Validate credit transaction
      const creditValidation: CreditTransactionValidation = {
        userId: request.userId,
        amount: redemptionAmount,
        type: CreditTransactionType.GIFT_REDEMPTION,
        currentBalance: account.balance,
        expectedBalanceAfter: account.balance + redemptionAmount,
        referenceType: 'gift_card_redemption'
      };

      const creditValidationResult = digitalCurrencyUDF.validateCreditTransaction(creditValidation);
      if (!creditValidationResult.isValid) {
        return {
          success: false,
          creditsAdded: 0,
          remainingBalance: card.remainingBalance,
          errors: creditValidationResult.errors
        };
      }

      // Execute redemption in transaction
      const result = await db.transaction(async (tx) => {
        // Update gift card balance
        const newGiftCardBalance = redemptionValidation.newRemainingBalance;
        const isFullyRedeemed = newGiftCardBalance === 0;
        
        await tx
          .update(digitalGiftCards)
          .set({
            remainingBalance: newGiftCardBalance,
            isRedeemed: isFullyRedeemed,
            redeemedAt: isFullyRedeemed ? new Date() : undefined,
            recipientUserId: request.userId
          })
          .where(eq(digitalGiftCards.id, card.id));

        // Create credit transaction
        const transactionData: InsertDigitalCreditsTransaction = {
          userId: request.userId,
          amount: redemptionAmount,
          type: CreditTransactionType.GIFT_REDEMPTION,
          referenceId: card.id,
          referenceType: 'gift_card_redemption',
          description: `Gift card redemption: ${request.code} - $${(redemptionAmount / 100).toFixed(2)}`,
          balanceAfter: account.balance + redemptionAmount,
          picklePointsAwarded: 0 // No points for gift card redemption
        };

        await tx
          .insert(digitalCreditsTransactions)
          .values(transactionData);

        // Update user account additively
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: account.balance + redemptionAmount,
            updatedAt: new Date()
          })
          .where(eq(digitalCreditsAccounts.userId, request.userId));

        return {
          creditsAdded: redemptionAmount,
          remainingBalance: newGiftCardBalance
        };
      });

      return {
        success: true,
        creditsAdded: result.creditsAdded,
        remainingBalance: result.remainingBalance,
        errors: []
      };

    } catch (error) {
      throw new Error(`Gift card redemption failed: ${error}`);
    }
  }

  /**
   * UDF-COMPLIANT: Get user transaction history with pagination
   * CRITICAL: Maintains complete audit trail visibility
   */
  async getTransactionHistory(userId: number, limit: number = 50, offset: number = 0): Promise<{
    transactions: DigitalCreditsTransaction[];
    totalCount: number;
    currentBalance: number;
  }> {
    try {
      const account = await this.getOrCreateAccount(userId);
      
      const transactions = await db
        .select()
        .from(digitalCreditsTransactions)
        .where(eq(digitalCreditsTransactions.userId, userId))
        .orderBy(desc(digitalCreditsTransactions.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(digitalCreditsTransactions)
        .where(eq(digitalCreditsTransactions.userId, userId));

      return {
        transactions,
        totalCount: countResult[0].count,
        currentBalance: account.balance
      };

    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error}`);
    }
  }

  /**
   * UTILITY: Generate unique 8-character gift card code
   * Format: XXXXXXXX (letters and numbers, no ambiguous characters)
   */
  private generateGiftCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Remove ambiguous characters: 0, O, I, L, 1
    const unambiguousChars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += unambiguousChars.charAt(Math.floor(Math.random() * unambiguousChars.length));
    }
    return code;
  }

  /**
   * WISE INTEGRATION: Process payment via Wise API
   * CRITICAL: Secure handling of payment processing
   */
  async processWisePayment(request: WisePaymentRequest): Promise<WisePaymentResponse> {
    try {
      // In production, this would make actual Wise API calls
      // For now, simulate successful payment processing
      
      const mockWiseResponse: WisePaymentResponse = {
        id: `wise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        amount: request.amount,
        fee: Math.floor(request.amount * 0.029), // 2.9% fee simulation
        netAmount: request.amount - Math.floor(request.amount * 0.029),
        transactionId: `txn_${Date.now()}`
      };

      return mockWiseResponse;

    } catch (error) {
      throw new Error(`Wise payment processing failed: ${error}`);
    }
  }

  /**
   * ASYNC PROCESSING: Create pending top-up transaction
   * CRITICAL: Prepares transaction for async webhook completion
   */
  async createPendingTopUp(request: {
    userId: number;
    amount: number;
    customerEmail: string;
    description: string;
  }): Promise<{
    success: boolean;
    transactionId: string;
    wiseTransactionId: string;
    expectedBonusCredits: number;
    expectedPicklePoints: number;
    errors: string[];
  }> {
    try {
      const account = await this.getOrCreateAccount(request.userId);
      
      // Calculate bonus and points (for display, not credited yet)
      const bonusCalculation = digitalCurrencyUDF.calculateTopUpBonus(request.amount);
      const totalCredits = bonusCalculation.totalCredits;
      
      const pointsCalculation: PicklePointsCalculation = {
        creditsAmount: totalCredits,
        pointsRatio: digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO,
        expectedPoints: Math.floor(totalCredits * digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO),
        transactionType: CreditTransactionType.TOP_UP
      };

      // Simulate Wise payment initiation
      const wisePayment = await this.processWisePayment({
        amount: request.amount,
        currency: 'USD',
        userId: request.userId,
        customerEmail: request.customerEmail,
        description: request.description
      });

      // Create pending transaction record
      const transactionData: InsertDigitalCreditsTransaction = {
        userId: request.userId,
        amount: totalCredits,
        type: CreditTransactionType.TOP_UP,
        referenceType: 'wise_payment',
        wiseTransactionId: wisePayment.transactionId,
        wiseTransferState: 'pending',
        description: `${request.description} (pending confirmation)`,
        balanceAfter: account.balance, // Balance unchanged until confirmed
        picklePointsAwarded: 0 // Points not awarded until confirmed
      };

      const pendingTransaction = await db
        .insert(digitalCreditsTransactions)
        .values(transactionData)
        .returning();

      return {
        success: true,
        transactionId: pendingTransaction[0].id.toString(),
        wiseTransactionId: wisePayment.transactionId,
        expectedBonusCredits: bonusCalculation.bonusAmount,
        expectedPicklePoints: pointsCalculation.expectedPoints,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        transactionId: '',
        wiseTransactionId: '',
        expectedBonusCredits: 0,
        expectedPicklePoints: 0,
        errors: [`Failed to create pending top-up: ${error}`]
      };
    }
  }

  /**
   * WEBHOOK HANDLER: Process Wise transfer state changes
   * CRITICAL: Updates transaction status based on webhook events
   */
  async handleTransferStateChange(event: any): Promise<void> {
    try {
      const transfer = event.resource;
      const wiseTransactionId = transfer.id;
      const newStatus = transfer.status;
      
      console.log(`[WEBHOOK HANDLER] Transfer ${wiseTransactionId} status: ${newStatus}`);
      
      // Find pending transaction
      const existingTransactions = await db
        .select()
        .from(digitalCreditsTransactions)
        .where(eq(digitalCreditsTransactions.wiseTransactionId, wiseTransactionId))
        .limit(1);

      if (existingTransactions.length === 0) {
        console.warn(`[WEBHOOK HANDLER] No transaction found for Wise ID: ${wiseTransactionId}`);
        return;
      }

      const transaction = existingTransactions[0];
      
      // Only process if status changed to completed
      if (newStatus === 'completed' && transaction.wiseTransferState !== 'completed') {
        await this.completeTransaction(transaction.id, wiseTransactionId);
      } else if (newStatus === 'failed') {
        await this.failTransaction(transaction.id, wiseTransactionId);
      }
      
    } catch (error) {
      console.error('[WEBHOOK HANDLER] Transfer state change error:', error);
      throw error;
    }
  }

  /**
   * WEBHOOK HANDLER: Process completed payments from Wise
   * CRITICAL: Credits user accounts after verified payment completion
   */
  async handlePaymentCompleted(event: any): Promise<void> {
    try {
      const payment = event.resource;
      console.log(`[WEBHOOK HANDLER] Payment completed: ${payment.id}`);
      
      // Find and complete associated transaction
      await this.handleTransferStateChange(event);
      
    } catch (error) {
      console.error('[WEBHOOK HANDLER] Payment completion error:', error);
      throw error;
    }
  }

  /**
   * INTERNAL: Complete pending transaction (called by webhook)
   * CRITICAL: Atomically credits account and updates transaction status
   */
  private async completeTransaction(transactionId: number, wiseTransactionId: string): Promise<void> {
    try {
      return await db.transaction(async (tx) => {
        // Get transaction details
        const transactions = await tx
          .select()
          .from(digitalCreditsTransactions)
          .where(eq(digitalCreditsTransactions.id, transactionId))
          .limit(1);

        if (transactions.length === 0) {
          throw new Error(`Transaction ${transactionId} not found`);
        }

        const transaction = transactions[0];
        const userId = transaction.userId;
        const amount = transaction.amount;

        // Calculate Pickle Points
        const pointsCalculation: PicklePointsCalculation = {
          creditsAmount: amount,
          pointsRatio: digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO,
          expectedPoints: Math.floor(amount * digitalCurrencyUDF.constants.PICKLE_POINTS_RATIO),
          transactionType: CreditTransactionType.TOP_UP
        };

        const pointsValidation = digitalCurrencyUDF.calculatePicklePointsReward(pointsCalculation);
        const picklePointsAwarded = pointsValidation.pointsAwarded;

        // Get current account state
        const account = await this.getOrCreateAccount(userId);
        const newBalance = account.balance + amount;
        const newTotalPurchased = account.totalPurchased + amount;

        // Update account balance additively (UDF compliance)
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: newBalance,
            totalPurchased: newTotalPurchased
          })
          .where(eq(digitalCreditsAccounts.userId, userId));

        // Update transaction status
        await tx
          .update(digitalCreditsTransactions)
          .set({
            wiseTransferState: 'completed',
            balanceAfter: newBalance,
            picklePointsAwarded: picklePointsAwarded,
            description: transaction.description ? transaction.description.replace('(pending confirmation)', '(confirmed)') : 'Transaction confirmed'
          })
          .where(eq(digitalCreditsTransactions.id, transactionId));

        console.log(`[WEBHOOK HANDLER] Transaction ${transactionId} completed successfully:`, {
          userId,
          amount,
          newBalance,
          picklePointsAwarded
        });
      });
    } catch (error) {
      console.error(`[WEBHOOK HANDLER] Failed to complete transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * INTERNAL: Mark transaction as failed
   * CRITICAL: Updates transaction status without crediting account
   */
  private async failTransaction(transactionId: number, wiseTransactionId: string): Promise<void> {
    try {
      await db
        .update(digitalCreditsTransactions)
        .set({
          wiseTransferState: 'failed',
          description: sql`${digitalCreditsTransactions.description} || ' (payment failed)'`
        })
        .where(eq(digitalCreditsTransactions.id, transactionId));

      console.log(`[WEBHOOK HANDLER] Transaction ${transactionId} marked as failed`);
    } catch (error) {
      console.error(`[WEBHOOK HANDLER] Failed to mark transaction ${transactionId} as failed:`, error);
      throw error;
    }
  }

  /**
   * UDF-COMPLIANT: Validate daily spending limits
   * CRITICAL: Regulatory compliance and fraud prevention
   */
  async validateDailyLimits(userId: number, amount: number, userType: 'individual' | 'corporate' = 'individual'): Promise<{
    isValid: boolean;
    remainingDaily: number;
    errors: string[];
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's spending
      const todaySpending = await db
        .select({ totalSpent: sum(digitalCreditsTransactions.amount) })
        .from(digitalCreditsTransactions)
        .where(
          and(
            eq(digitalCreditsTransactions.userId, userId),
            sql`${digitalCreditsTransactions.createdAt} >= ${today.toISOString()}`,
            sql`${digitalCreditsTransactions.createdAt} < ${tomorrow.toISOString()}`,
            sql`${digitalCreditsTransactions.amount} > 0` // Only count positive amounts (top-ups)
          )
        );

      const currentDailySpent = Number(todaySpending[0]?.totalSpent || 0);

      return digitalCurrencyUDF.validateDailyLimits(
        userId,
        amount,
        currentDailySpent,
        userType
      );

    } catch (error) {
      throw new Error(`Daily limit validation failed: ${error}`);
    }
  }
}

// Export singleton instance for use in routes
export const digitalCurrencyService = new DigitalCurrencyService();