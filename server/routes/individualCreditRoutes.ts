/**
 * INDIVIDUAL CREDIT SYSTEM API ROUTES
 * 
 * RESTful endpoints for individual credit top-ups, bonus calculations,
 * and balance management with comprehensive UDF compliance.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System
 * Last Updated: September 17, 2025
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const router = Router();

// Rate limiting for credit operations
const creditRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 credit operations per window
  message: { error: 'Too many credit requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const topUpSchema = z.object({
  amount: z.number().min(500, 'Minimum top-up amount is $5.00'),
  customerEmail: z.string().email('Valid email required'),
  paymentMethod: z.enum(['wise', 'stripe', 'manual']).default('wise'),
  promoCode: z.string().optional(),
});

/**
 * AUTHENTICATED ROUTE MIDDLEWARE
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
 * GET /api/individual-credits/account
 * Get user's credit account summary with balance and transaction history
 */
router.get('/account', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // Mock response for now - will be replaced with actual service call
    const mockSummary = {
      balance: 0,
      totalPurchased: 0,
      totalSpent: 0,
      loyaltyTier: 'Bronze',
      recentTransactions: []
    };

    res.json({
      success: true,
      data: {
        balance: mockSummary.balance,
        balanceFormatted: `$${(mockSummary.balance / 100).toFixed(2)}`,
        totalPurchased: mockSummary.totalPurchased,
        totalPurchasedFormatted: `$${(mockSummary.totalPurchased / 100).toFixed(2)}`,
        totalSpent: mockSummary.totalSpent,
        totalSpentFormatted: `$${(mockSummary.totalSpent / 100).toFixed(2)}`,
        loyaltyTier: mockSummary.loyaltyTier,
        recentTransactions: mockSummary.recentTransactions
      }
    });

  } catch (error) {
    console.error('[INDIVIDUAL CREDITS] Account fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account information'
    });
  }
});

/**
 * POST /api/individual-credits/calculate-bonus
 * Calculate potential bonuses for a top-up amount
 */
router.post('/calculate-bonus', requireAuth, async (req: any, res: any) => {
  try {
    const { amount, promoCode } = req.body;
    const userId = req.user.id;

    if (!amount || amount < 500) {
      return res.status(400).json({
        success: false,
        error: 'Minimum top-up amount is $5.00'
      });
    }

    // Mock bonus calculation - will be replaced with actual service call
    let bonusPercentage = 0;
    const bonuses = [];

    // Volume bonus
    if (amount >= 10000) { // $100+
      bonusPercentage += 10;
      bonuses.push({
        type: 'volume',
        percentage: 10,
        description: 'Volume Bonus - 10% extra for purchases $100+',
        condition: 'Purchase amount ≥ $100'
      });
    } else if (amount >= 5000) { // $50+
      bonusPercentage += 5;
      bonuses.push({
        type: 'volume',
        percentage: 5,
        description: 'Volume Bonus - 5% extra for purchases $50+',
        condition: 'Purchase amount ≥ $50'
      });
    }

    const bonusAmount = Math.floor(amount * (bonusPercentage / 100));
    const finalAmount = amount + bonusAmount;

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        originalAmountFormatted: `$${(amount / 100).toFixed(2)}`,
        bonusAmount,
        bonusAmountFormatted: `$${(bonusAmount / 100).toFixed(2)}`,
        finalAmount,
        finalAmountFormatted: `$${(finalAmount / 100).toFixed(2)}`,
        totalBonusPercentage: bonusPercentage,
        bonuses
      }
    });

  } catch (error) {
    console.error('[INDIVIDUAL CREDITS] Bonus calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate bonuses'
    });
  }
});

/**
 * POST /api/individual-credits/top-up
 * Process a credit top-up with bonus calculations
 */
router.post('/top-up', requireAuth, creditRateLimit, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const validatedData = topUpSchema.parse(req.body);

    // Mock top-up processing - will be replaced with actual service call
    const amount = validatedData.amount;
    const bonusAmount = Math.floor(amount * 0.05); // 5% bonus for mock
    const finalAmount = amount + bonusAmount;

    console.log('[INDIVIDUAL CREDITS] Mock top-up processed:', {
      userId,
      amount,
      finalAmount,
      bonusAmount
    });

    res.json({
      success: true,
      data: {
        transactionId: Date.now(),
        finalAmount,
        finalAmountFormatted: `$${(finalAmount / 100).toFixed(2)}`,
        bonusAmount,
        bonusAmountFormatted: `$${(bonusAmount / 100).toFixed(2)}`,
        balance: finalAmount,
        balanceFormatted: `$${(finalAmount / 100).toFixed(2)}`,
        bonusType: 'volume'
      },
      message: 'Credit top-up processed successfully!'
    });

  } catch (error) {
    console.error('[INDIVIDUAL CREDITS] Top-up error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process top-up'
    });
  }
});

/**
 * GET /api/individual-credits/tiers
 * Get information about loyalty tiers and requirements
 */
router.get('/tiers', requireAuth, async (req: any, res: any) => {
  try {
    const tiers = [
      {
        name: 'Bronze',
        requirement: 0,
        requirementFormatted: '$0',
        benefits: 'Standard credit rates',
        bonus: 0,
        current: true
      },
      {
        name: 'Silver',
        requirement: 25000,
        requirementFormatted: '$250',
        benefits: '3% bonus on all purchases',
        bonus: 3,
        current: false
      },
      {
        name: 'Gold',
        requirement: 50000,
        requirementFormatted: '$500',
        benefits: '5% bonus on all purchases',
        bonus: 5,
        current: false
      },
      {
        name: 'Diamond',
        requirement: 100000,
        requirementFormatted: '$1,000',
        benefits: '8% bonus on all purchases',
        bonus: 8,
        current: false
      }
    ];

    res.json({
      success: true,
      data: {
        currentTier: 'Bronze',
        totalPurchased: 0,
        totalPurchasedFormatted: '$0.00',
        tiers
      }
    });

  } catch (error) {
    console.error('[INDIVIDUAL CREDITS] Tiers fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tier information'
    });
  }
});

export { router as individualCreditRoutes };