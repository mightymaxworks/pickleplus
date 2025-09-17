/**
 * GIFT CARD SERVICE
 * 
 * Comprehensive gift card management system with purchase, generation,
 * and redemption capabilities. Includes partial redemption support and
 * complete audit trail compliance.
 * 
 * Version: 1.0.0 - Sprint 1: Gift Card System
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and additive operations
 */

import { db } from '../db';
import { 
  digitalGiftCards, 
  digitalCreditsTransactions, 
  digitalCreditsAccounts,
  InsertDigitalGiftCard,
  InsertDigitalCreditsTransaction
} from '../../shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { 
  validateCreditTransaction,
  PICKLE_CREDITS_CONSTANTS,
  CreditTransactionType,
  generateGiftCardCode
} from '../../shared/utils/digitalCurrencyValidation';

interface GiftCardPurchaseRequest {
  amount: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName: string;
  message?: string;
  deliveryDate?: Date;
  paymentMethod: 'wise' | 'stripe';
}

interface GiftCardRedemptionRequest {
  giftCardCode: string;
  amountToRedeem?: number; // Optional for partial redemption
}

interface GiftCardPurchaseResult {
  success: boolean;
  giftCardId?: number;
  giftCardCode?: string;
  amount?: number;
  error?: string;
}

interface GiftCardRedemptionResult {
  success: boolean;
  amountRedeemed?: number;
  remainingBalance?: number;
  transactionId?: number;
  error?: string;
}

class GiftCardService {

  /**
   * Purchase a new gift card with UDF-compliant validation
   */
  async purchaseGiftCard(
    purchaserUserId: number,
    request: GiftCardPurchaseRequest
  ): Promise<GiftCardPurchaseResult> {
    try {
      const { amount, recipientEmail, recipientName, senderName, message, deliveryDate } = request;

      // UDF Validation: Minimum amount check
      if (amount < PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT) {
        return {
          success: false,
          error: `Minimum gift card amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT / 100).toFixed(2)}`
        };
      }

      return await db.transaction(async (tx: any) => {
        // Generate unique gift card code
        const giftCardCode = generateGiftCardCode();

        // Create PENDING gift card record - activated only after payment confirmation
        const giftCardData: InsertDigitalGiftCard = {
          code: 'PENDING', // Temporary code until payment confirmed
          amount,
          remainingBalance: amount,
          purchaserId: purchaserUserId,
          recipientEmail: recipientEmail || null
        };

        const newGiftCard = await tx
          .insert(digitalGiftCards)
          .values(giftCardData)
          .returning();

        // Return pending gift card ID for webhook completion
        // Actual gift card code generated upon payment confirmation

        console.log('[GIFT CARD] Purchase initiated:', {
          giftCardId: newGiftCard[0].id,
          amount,
          purchaserUserId
          // No gift card code logged for security
        });

        return {
          success: true,
          giftCardId: newGiftCard[0].id,
          amount,
          // No gift card code returned until payment confirmed
          status: 'pending_payment'
        };
      });

    } catch (error) {
      console.error('[GIFT CARD] Purchase error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: 'Failed to process gift card purchase'
      };
    }
  }

  /**
   * Redeem a gift card with partial redemption support
   */
  async redeemGiftCard(
    redeemerUserId: number,
    request: GiftCardRedemptionRequest
  ): Promise<GiftCardRedemptionResult> {
    try {
      const { giftCardCode, amountToRedeem } = request;

      return await db.transaction(async (tx: any) => {
        // Find the gift card
        const giftCard = await tx
          .select()
          .from(digitalGiftCards)
          .where(
            and(
              eq(digitalGiftCards.code, giftCardCode),
              gte(digitalGiftCards.remainingBalance, 1) // Must have balance
            )
          )
          .limit(1);

        if (giftCard.length === 0) {
          return {
            success: false,
            error: 'Gift card not found or has no remaining balance'
          };
        }

        const card = giftCard[0];
        const redemptionAmount = amountToRedeem || card.remainingBalance; // Full redemption if no amount specified

        // Validate redemption amount
        if (redemptionAmount > card.remainingBalance) {
          return {
            success: false,
            error: `Redemption amount ($${(redemptionAmount / 100).toFixed(2)}) exceeds remaining balance ($${(card.remainingBalance / 100).toFixed(2)})`
          };
        }

        if (redemptionAmount < PICKLE_CREDITS_CONSTANTS.MIN_REDEMPTION_AMOUNT) {
          return {
            success: false,
            error: `Minimum redemption amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_REDEMPTION_AMOUNT / 100).toFixed(2)}`
          };
        }

        // Get or create user's credit account
        let account = await tx
          .select()
          .from(digitalCreditsAccounts)
          .where(eq(digitalCreditsAccounts.userId, redeemerUserId))
          .limit(1);

        if (account.length === 0) {
          // Create new account for first-time user
          const newAccount = await tx
            .insert(digitalCreditsAccounts)
            .values({
              userId: redeemerUserId,
              balance: 0,
              totalPurchased: 0,
              totalSpent: 0
            })
            .returning();
          account = newAccount;
        }

        // UDF Validation: Validate the redemption transaction
        const transactionValidation = validateCreditTransaction({
          userId: redeemerUserId,
          amount: redemptionAmount,
          type: CreditTransactionType.GIFT_REDEMPTION,
          currentBalance: account[0].balance,
          expectedBalanceAfter: account[0].balance + redemptionAmount
        });

        if (!transactionValidation.isValid) {
          return {
            success: false,
            error: `Transaction validation failed: ${transactionValidation.errors.join(', ')}`
          };
        }

        // ATOMIC redemption with race condition protection
        const redemptionResult = await tx
          .update(digitalGiftCards)
          .set({
            remainingBalance: sql`${digitalGiftCards.remainingBalance} - ${redemptionAmount}`,
            redeemedAt: sql`CASE WHEN ${digitalGiftCards.remainingBalance} - ${redemptionAmount} <= 0 THEN NOW() ELSE ${digitalGiftCards.redeemedAt} END`,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(digitalGiftCards.id, card.id),
              gte(digitalGiftCards.remainingBalance, redemptionAmount) // Atomic balance check
            )
          )
          .returning({ remainingBalance: digitalGiftCards.remainingBalance });

        if (redemptionResult.length === 0) {
          return {
            success: false,
            error: 'Insufficient gift card balance or concurrent redemption'
          };
        }

        const newRemainingBalance = redemptionResult[0].remainingBalance;

        // UDF-Compliant: Additive balance update
        await tx
          .update(digitalCreditsAccounts)
          .set({
            balance: sql`${digitalCreditsAccounts.balance} + ${redemptionAmount}`,
            updatedAt: new Date()
          })
          .where(eq(digitalCreditsAccounts.id, account[0].id));

        // Create redemption transaction record
        const redemptionTransactionData: InsertDigitalCreditsTransaction = {
          userId: redeemerUserId,
          amount: redemptionAmount,
          type: CreditTransactionType.GIFT_REDEMPTION,
          description: `Gift card redemption: $${(redemptionAmount / 100).toFixed(2)}`,
          balanceAfter: account[0].balance + redemptionAmount,
          referenceType: 'gift_card',
          referenceId: card.id
        };

        const redemptionTransaction = await tx
          .insert(digitalCreditsTransactions)
          .values(redemptionTransactionData)
          .returning();

        console.log('[GIFT CARD] Redemption completed:', {
          giftCardId: card.id,
          giftCardCode: giftCardCode.substring(0, 8) + '****', // Masked for security
          redeemerUserId,
          amountRedeemed: redemptionAmount,
          remainingBalance: newRemainingBalance,
          transactionId: redemptionTransaction[0].id
        });

        return {
          success: true,
          amountRedeemed: redemptionAmount,
          remainingBalance: newRemainingBalance,
          transactionId: redemptionTransaction[0].id
        };
      });

    } catch (error) {
      console.error('[GIFT CARD] Redemption error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: 'Failed to process gift card redemption'
      };
    }
  }

  /**
   * Get gift card details by code
   */
  async getGiftCardByCode(giftCardCode: string): Promise<any> {
    try {
      const giftCard = await db
        .select({
          id: digitalGiftCards.id,
          code: digitalGiftCards.code,
          amount: digitalGiftCards.amount,
          remainingBalance: digitalGiftCards.remainingBalance,
          purchaserId: digitalGiftCards.purchaserId,
          recipientEmail: digitalGiftCards.recipientEmail,
          createdAt: digitalGiftCards.createdAt,
          redeemedAt: digitalGiftCards.redeemedAt
        })
        .from(digitalGiftCards)
        .where(eq(digitalGiftCards.code, giftCardCode))
        .limit(1);

      if (giftCard.length === 0) {
        return null;
      }

      return {
        ...giftCard[0],
        amountFormatted: `$${(giftCard[0].amount / 100).toFixed(2)}`,
        remainingBalanceFormatted: `$${(giftCard[0].remainingBalance / 100).toFixed(2)}`,
        isRedeemable: giftCard[0].remainingBalance > 0
      };

    } catch (error) {
      console.error('[GIFT CARD] Lookup error:', {
        message: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Get user's purchased gift cards
   */
  async getUserPurchasedGiftCards(userId: number): Promise<any[]> {
    try {
      const giftCards = await db
        .select({
          id: digitalGiftCards.id,
          code: digitalGiftCards.code,
          amount: digitalGiftCards.amount,
          remainingBalance: digitalGiftCards.remainingBalance,
          purchaserId: digitalGiftCards.purchaserId,
          recipientEmail: digitalGiftCards.recipientEmail,
          recipientUserId: digitalGiftCards.recipientUserId,
          createdAt: digitalGiftCards.createdAt,
          redeemedAt: digitalGiftCards.redeemedAt
        })
        .from(digitalGiftCards)
        .where(eq(digitalGiftCards.purchaserId, userId))
        .orderBy(digitalGiftCards.createdAt);

      return giftCards.map((card: any) => ({
        ...card,
        amountFormatted: `$${(card.amount / 100).toFixed(2)}`,
        remainingBalanceFormatted: `$${(card.remainingBalance / 100).toFixed(2)}`,
        isActive: card.remainingBalance > 0
      }));

    } catch (error) {
      console.error('[GIFT CARD] User cards lookup error:', {
        message: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Complete a pending gift card purchase (called by webhook)
   */
  async completeGiftCardPurchase(giftCardId: number, wiseTransferId?: string): Promise<{ success: boolean; giftCardCode?: string }> {
    try {
      return await db.transaction(async (tx: any) => {
        // Get the pending gift card
        const giftCard = await tx
          .select()
          .from(digitalGiftCards)
          .where(
            and(
              eq(digitalGiftCards.id, giftCardId),
              eq(digitalGiftCards.code, 'PENDING') // Only activate pending cards
            )
          )
          .limit(1);

        if (giftCard.length === 0) {
          console.error('[GIFT CARD] Pending gift card not found:', giftCardId);
          return { success: false };
        }

        // Generate secure gift card code
        const giftCardCode = generateGiftCardCode();

        // Activate the gift card with secure code
        const updateResult = await tx
          .update(digitalGiftCards)
          .set({
            code: giftCardCode,
            activatedAt: new Date(),
            updatedAt: new Date(),
            wiseTransactionId: wiseTransferId
          })
          .where(
            and(
              eq(digitalGiftCards.id, giftCardId),
              eq(digitalGiftCards.code, 'PENDING') // Double-check still pending
            )
          )
          .returning({ id: digitalGiftCards.id });

        if (updateResult.length === 0) {
          console.error('[GIFT CARD] Failed to activate gift card - already processed?:', giftCardId);
          return { success: false };
        }

        console.log('[GIFT CARD] Purchase completed:', {
          giftCardId,
          giftCardCode: giftCardCode.substring(0, 8) + '****', // Masked in logs
          amount: giftCard[0].amount,
          wiseTransferId
        });

        return { success: true, giftCardCode };
      });

    } catch (error) {
      console.error('[GIFT CARD] Error completing purchase:', error);
      return { success: false };
    }
  }
}

export const giftCardService = new GiftCardService();