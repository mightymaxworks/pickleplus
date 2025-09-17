/**
 * GIFT CARD SYSTEM API ROUTES
 * 
 * RESTful endpoints for gift card purchase, redemption, and management
 * with comprehensive UDF compliance and security measures.
 * 
 * Version: 1.0.0 - Sprint 1: Gift Card System
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and service layer
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { giftCardService } from '../services/giftCardService';
import { PICKLE_CREDITS_CONSTANTS } from '../../shared/utils/digitalCurrencyValidation';
import { isAuthenticated } from '../auth';

const router = Router();

// Rate limiting for gift card operations - enhanced security
const giftCardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 gift card operations per window
  message: { error: 'Too many gift card requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas using UDF constants
const purchaseSchema = z.object({
  amount: z.number().min(PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT, `Minimum gift card amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT / 100).toFixed(2)}`),
  recipientEmail: z.string().email('Valid email required').optional(),
  recipientName: z.string().min(1, 'Recipient name required').max(100),
  senderName: z.string().min(1, 'Sender name required').max(100),
  message: z.string().max(500, 'Message too long').optional(),
  deliveryDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  paymentMethod: z.enum(['wise', 'stripe']).default('wise')
});

const redemptionSchema = z.object({
  giftCardCode: z.string().min(1, 'Gift card code required'),
  amountToRedeem: z.number().min(PICKLE_CREDITS_CONSTANTS.MIN_REDEMPTION_AMOUNT).optional()
});

const lookupSchema = z.object({
  giftCardCode: z.string().min(1, 'Gift card code required')
});

/**
 * POST /api/gift-cards/purchase
 * Purchase a new gift card with payment processing
 */
router.post('/purchase', isAuthenticated, giftCardRateLimit, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const validatedData = purchaseSchema.parse(req.body);

    const result = await giftCardService.purchaseGiftCard(userId, validatedData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        giftCardId: result.giftCardId,
        giftCardCode: result.giftCardCode,
        amount: result.amount,
        amountFormatted: `$${(result.amount! / 100).toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('[GIFT CARDS] Purchase error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to process gift card purchase'
    });
  }
});

/**
 * POST /api/gift-cards/redeem
 * Redeem a gift card with partial redemption support
 */
router.post('/redeem', isAuthenticated, giftCardRateLimit, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const validatedData = redemptionSchema.parse(req.body);

    const result = await giftCardService.redeemGiftCard(userId, validatedData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        amountRedeemed: result.amountRedeemed,
        amountRedeemedFormatted: `$${(result.amountRedeemed! / 100).toFixed(2)}`,
        remainingBalance: result.remainingBalance,
        remainingBalanceFormatted: `$${(result.remainingBalance! / 100).toFixed(2)}`,
        transactionId: result.transactionId
      }
    });

  } catch (error) {
    console.error('[GIFT CARDS] Redemption error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to process gift card redemption'
    });
  }
});

/**
 * GET /api/gift-cards/lookup/:code
 * Look up gift card details by code
 */
router.get('/lookup/:code', async (req: any, res: any) => {
  try {
    const { code } = req.params;
    
    if (!code || code.length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Gift card code required'
      });
    }

    const giftCard = await giftCardService.getGiftCardByCode(code);

    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: 'Gift card not found'
      });
    }

    res.json({
      success: true,
      data: giftCard
    });

  } catch (error) {
    console.error('[GIFT CARDS] Lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup gift card'
    });
  }
});

/**
 * GET /api/gift-cards/my-cards
 * Get user's purchased gift cards
 */
router.get('/my-cards', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const giftCards = await giftCardService.getUserPurchasedGiftCards(userId);

    res.json({
      success: true,
      data: {
        giftCards,
        totalCount: giftCards.length
      }
    });

  } catch (error) {
    console.error('[GIFT CARDS] User cards fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gift cards'
    });
  }
});

/**
 * GET /api/gift-cards/denominations
 * Get available gift card denominations
 */
router.get('/denominations', async (req: any, res: any) => {
  try {
    const denominations = PICKLE_CREDITS_CONSTANTS.GIFT_CARD_DENOMINATIONS.map(amount => ({
      amount,
      amountFormatted: `$${(amount / 100).toFixed(2)}`
    }));

    res.json({
      success: true,
      data: {
        denominations,
        minAmount: PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT,
        minAmountFormatted: `$${(PICKLE_CREDITS_CONSTANTS.MIN_GIFT_CARD_AMOUNT / 100).toFixed(2)}`
      }
    });

  } catch (error) {
    console.error('[GIFT CARDS] Denominations fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch denominations'
    });
  }
});

export { router as giftCardRoutes };