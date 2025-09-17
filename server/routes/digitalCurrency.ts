/**
 * DIGITAL CURRENCY API ROUTES - UDF-COMPLIANT IMPLEMENTATION
 * 
 * RESTful API endpoints for Pickle Credits system with Wise payment integration.
 * All routes enforce UDF algorithm compliance and maintain complete audit trails.
 * 
 * Version: 1.0.0 - Sprint 1: Foundation & Digital Currency Core
 * Last Updated: September 17, 2025
 * 
 * SECURITY REQUIREMENTS:
 * - All routes require user authentication
 * - Wise webhook endpoints validate signatures
 * - Rate limiting applied to prevent abuse
 * - Complete audit logging for financial transactions
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { digitalCurrencyService } from '../services/digitalCurrencyService';
import { digitalCurrencyUDF } from '../../shared/utils/digitalCurrencyValidation';
import { parseRawBody, verifyWiseSignature, ensureIdempotency } from '../middleware/webhookSecurity';

const router = Router();

// Rate limiting for financial operations
const financialRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many financial requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const topUpSchema = z.object({
  amount: z.number().min(digitalCurrencyUDF.constants.MIN_TOP_UP_AMOUNT, 'Minimum top-up amount not met'),
  customerEmail: z.string().email('Valid email required'),
});

const giftCardPurchaseSchema = z.object({
  amount: z.number().refine(
    (val) => [2500, 5000, 10000, 25000, 50000].includes(val),
    'Invalid gift card denomination'
  ),
  recipientEmail: z.string().email('Valid recipient email required').optional(),
});

const giftCardRedeemSchema = z.object({
  code: z.string().length(8, 'Gift card code must be 8 characters'),
  redemptionAmount: z.number().positive('Redemption amount must be positive').optional(),
});

/**
 * AUTHENTICATED ROUTE MIDDLEWARE
 * Ensures user is logged in before accessing credit routes
 */
function requireAuth(req: any, res: any, next: any) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

/**
 * GET /api/credits/account
 * Get user's credit account balance and summary
 */
router.get('/account', requireAuth, async (req: any, res: any) => {
  try {
    const account = await digitalCurrencyService.getOrCreateAccount(req.user.id);
    
    res.json({
      success: true,
      data: {
        balance: account.balance,
        totalPurchased: account.totalPurchased,
        totalSpent: account.totalSpent,
        balanceDisplay: `$${(account.balance / 100).toFixed(2)}`,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }
    });
  } catch (error) {
    console.error('Account fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account information',
      code: 'ACCOUNT_FETCH_ERROR'
    });
  }
});

/**
 * POST /api/credits/top-up
 * Process credit top-up via Wise payment integration
 */
router.post('/top-up', financialRateLimit, requireAuth, async (req: any, res: any) => {
  try {
    const validation = topUpSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { amount, customerEmail } = validation.data;

    // Validate daily limits
    const limitValidation = await digitalCurrencyService.validateDailyLimits(
      req.user.id,
      amount,
      'individual'
    );

    if (!limitValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Daily limit exceeded',
        details: limitValidation.errors,
        remainingDaily: limitValidation.remainingDaily,
        code: 'DAILY_LIMIT_EXCEEDED'
      });
    }

    // Create pending payment transaction (async processing)
    const pendingPayment = await digitalCurrencyService.createPendingTopUp({
      userId: req.user.id,
      amount,
      customerEmail,
      description: `Pickle Credits top-up: $${(amount / 100).toFixed(2)}`
    });

    if (!pendingPayment.success) {
      return res.status(400).json({
        success: false,
        error: 'Payment initialization failed',
        details: pendingPayment.errors,
        code: 'PAYMENT_INIT_ERROR'
      });
    }

    // Return 202 Accepted for async processing
    res.status(202).json({
      success: true,
      status: 'pending',
      data: {
        transactionId: pendingPayment.transactionId,
        wiseTransactionId: pendingPayment.wiseTransactionId,
        amount: amount,
        amountDisplay: `$${(amount / 100).toFixed(2)}`,
        status: 'pending',
        expectedBonusCredits: pendingPayment.expectedBonusCredits,
        expectedPicklePoints: pendingPayment.expectedPicklePoints
      },
      message: 'Payment initiated. You will be credited once payment is confirmed.',
      webhookProcessing: true
    });

  } catch (error) {
    console.error('Top-up processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Top-up processing failed',
      code: 'TOP_UP_ERROR'
    });
  }
});

/**
 * POST /api/credits/gift-cards/purchase
 * Purchase gift card via Wise payment
 */
router.post('/gift-cards/purchase', financialRateLimit, requireAuth, async (req: any, res: any) => {
  try {
    const validation = giftCardPurchaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gift card purchase data',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { amount, recipientEmail } = validation.data;

    // Process Wise payment
    const wisePayment = await digitalCurrencyService.processWisePayment({
      amount,
      currency: 'USD',
      userId: req.user.id,
      customerEmail: req.user.email || req.body.customerEmail,
      description: `Gift card purchase: $${(amount / 100).toFixed(2)}`,
      metadata: {
        userId: req.user.id,
        type: 'gift_card_purchase',
        recipientEmail
      }
    });

    if (wisePayment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment processing failed',
        paymentStatus: wisePayment.status,
        code: 'PAYMENT_FAILED'
      });
    }

    // Generate gift card
    const result = await digitalCurrencyService.generateGiftCard({
      amount,
      purchaserId: req.user.id,
      recipientEmail,
      wiseTransactionId: wisePayment.transactionId
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Gift card generation failed',
        details: result.errors,
        code: 'GIFT_CARD_ERROR'
      });
    }

    res.json({
      success: true,
      data: {
        giftCard: {
          code: result.code,
          amount: result.giftCard.amount,
          amountDisplay: `$${(result.giftCard.amount / 100).toFixed(2)}`,
          recipientEmail: result.giftCard.recipientEmail,
          createdAt: result.giftCard.createdAt
        },
        paymentInfo: {
          wiseTransactionId: wisePayment.transactionId,
          fee: wisePayment.fee
        }
      },
      message: `Gift card ${result.code} created successfully`
    });

  } catch (error) {
    console.error('Gift card purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Gift card purchase failed',
      code: 'GIFT_CARD_PURCHASE_ERROR'
    });
  }
});

/**
 * POST /api/credits/gift-cards/redeem
 * Redeem gift card for account credits
 */
router.post('/gift-cards/redeem', requireAuth, async (req: any, res: any) => {
  try {
    const validation = giftCardRedeemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid redemption data',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { code, redemptionAmount } = validation.data;

    const result = await digitalCurrencyService.redeemGiftCard({
      code: code.toUpperCase(),
      userId: req.user.id,
      redemptionAmount
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Gift card redemption failed',
        details: result.errors,
        code: 'REDEMPTION_ERROR'
      });
    }

    res.json({
      success: true,
      data: {
        creditsAdded: result.creditsAdded,
        creditsAddedDisplay: `$${(result.creditsAdded / 100).toFixed(2)}`,
        remainingBalance: result.remainingBalance,
        remainingBalanceDisplay: `$${(result.remainingBalance / 100).toFixed(2)}`
      },
      message: `Successfully redeemed $${(result.creditsAdded / 100).toFixed(2)} from gift card`
    });

  } catch (error) {
    console.error('Gift card redemption error:', error);
    res.status(500).json({
      success: false,
      error: 'Gift card redemption failed',
      code: 'REDEMPTION_ERROR'
    });
  }
});

/**
 * GET /api/credits/history
 * Get paginated transaction history
 */
router.get('/history', requireAuth, async (req: any, res: any) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await digitalCurrencyService.getTransactionHistory(
      req.user.id,
      limit,
      offset
    );

    res.json({
      success: true,
      data: {
        transactions: result.transactions.map(t => ({
          ...t,
          amountDisplay: `${t.amount >= 0 ? '+' : ''}$${(t.amount / 100).toFixed(2)}`,
          balanceAfterDisplay: `$${(t.balanceAfter / 100).toFixed(2)}`
        })),
        totalCount: result.totalCount,
        currentBalance: result.currentBalance,
        currentBalanceDisplay: `$${(result.currentBalance / 100).toFixed(2)}`,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < result.totalCount
        }
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history',
      code: 'HISTORY_ERROR'
    });
  }
});

/**
 * GET /api/credits/limits
 * Get current daily spending limits and usage
 */
router.get('/limits', requireAuth, async (req: any, res: any) => {
  try {
    const limitInfo = await digitalCurrencyService.validateDailyLimits(
      req.user.id,
      0, // Check current usage without adding amount
      'individual'
    );

    // Calculate daily limit based on user type
    const dailyLimit = digitalCurrencyUDF.constants.DAILY_INDIVIDUAL_LIMIT;
    const usedToday = dailyLimit - limitInfo.remainingDaily;

    res.json({
      success: true,
      data: {
        dailyLimit: dailyLimit,
        dailyLimitDisplay: `$${(dailyLimit / 100).toFixed(2)}`,
        remainingDaily: limitInfo.remainingDaily,
        remainingDailyDisplay: `$${(limitInfo.remainingDaily / 100).toFixed(2)}`,
        usedToday: usedToday,
        usedTodayDisplay: `$${(usedToday / 100).toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('Limits check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch limit information',
      code: 'LIMITS_ERROR'
    });
  }
});

/**
 * SECURE WISE WEBHOOK ENDPOINT
 * Handle payment status updates from Wise with production-grade security
 * CRITICAL: Uses middleware for signature verification, raw body parsing, and idempotency
 */
router.post('/webhooks/wise', 
  parseRawBody(),
  verifyWiseSignature(),
  ensureIdempotency(),
  async (req: any, res: any) => {
    try {
      const event = req.wiseEvent;
      console.log('[WISE WEBHOOK] Processing verified event:', {
        eventId: event.eventId,
        eventType: event.type,
        resourceId: event.resource?.id,
        status: event.resource?.status
      });

      // Handle different event types asynchronously
      switch (event.type) {
        case 'transfer.state-change':
          await digitalCurrencyService.handleTransferStateChange(event);
          break;
        case 'payment.completed':
          await digitalCurrencyService.handlePaymentCompleted(event);
          break;
        default:
          console.log(`[WISE WEBHOOK] Unhandled event type: ${event.type}`);
      }
      
      // Acknowledge successful processing
      res.status(200).json({ 
        received: true,
        eventId: event.eventId,
        processed: true
      });
      
    } catch (error) {
      console.error('[WISE WEBHOOK] Processing error:', error);
      res.status(500).json({ 
        error: 'Webhook processing failed',
        eventId: req.wiseEvent?.eventId
      });
    }
  }
);

export { router as digitalCurrencyRoutes };