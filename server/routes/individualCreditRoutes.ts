/**
 * INDIVIDUAL CREDIT SYSTEM API ROUTES
 * 
 * RESTful endpoints for individual credit top-ups, bonus calculations,
 * and balance management with comprehensive UDF compliance.
 * 
 * Version: 1.0.0 - Sprint 1: Individual Credit System
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and service layer
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { individualCreditService } from '../services/individualCreditService';
import { PICKLE_CREDITS_CONSTANTS } from '../../shared/utils/digitalCurrencyValidation';

const router = Router();

// Rate limiting for credit operations - enhanced security
const creditRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 credit operations per window
  message: { error: 'Too many credit requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas using UDF constants
const topUpSchema = z.object({
  amount: z.number().min(PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT, `Minimum top-up amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT / 100).toFixed(2)}`),
  customerEmail: z.string().email('Valid email required'),
  paymentMethod: z.enum(['wise', 'stripe']).default('wise'), // SECURITY: Removed 'manual' - requires admin privileges
  promoCode: z.string().optional(),
});

// Import authentication middleware - consistent with existing system
import { isAuthenticated } from '../auth';

/**
 * GET /api/individual-credits/account
 * Get user's credit account summary with balance and transaction history
 */
router.get('/account', isAuthenticated, async (req: any, res: any) => {

  try {
    const userId = req.user.id;
    const summary = await individualCreditService.getUserCreditSummary(userId);

    res.json({
      success: true,
      data: {
        balance: summary.balance,
        balanceFormatted: `$${(summary.balance / 100).toFixed(2)}`,
        totalPurchased: summary.totalPurchased,
        totalPurchasedFormatted: `$${(summary.totalPurchased / 100).toFixed(2)}`,
        totalSpent: summary.totalSpent,
        totalSpentFormatted: `$${(summary.totalSpent / 100).toFixed(2)}`,
        loyaltyTier: summary.loyaltyTier,
        recentTransactions: summary.recentTransactions.map(txn => ({
          ...txn,
          amountFormatted: `$${(txn.amount / 100).toFixed(2)}`,
          createdAt: txn.createdAt
        }))
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
 * Calculate potential bonuses for a top-up amount using UDF-compliant calculations
 */
router.post('/calculate-bonus', isAuthenticated, async (req: any, res: any) => {

  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount < PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: `Minimum top-up amount is $${(PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT / 100).toFixed(2)}`
      });
    }

    // Use UDF-compliant bonus calculation
    const { calculateTopUpBonus } = await import('../../shared/utils/digitalCurrencyValidation');
    const bonusCalc = calculateTopUpBonus(amount);

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        originalAmountFormatted: `$${(amount / 100).toFixed(2)}`,
        bonusAmount: bonusCalc.bonusAmount,
        bonusAmountFormatted: `$${(bonusCalc.bonusAmount / 100).toFixed(2)}`,
        finalAmount: bonusCalc.totalCredits,
        finalAmountFormatted: `$${(bonusCalc.totalCredits / 100).toFixed(2)}`,
        bonusRate: bonusCalc.bonusRate,
        auditMetadata: bonusCalc.auditMetadata
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
 * Process a credit top-up with UDF-compliant bonus calculations
 */
router.post('/top-up', isAuthenticated, creditRateLimit, async (req: any, res: any) => {

  try {
    const userId = req.user.id;
    const validatedData = topUpSchema.parse(req.body);

    const topUpRequest = {
      userId,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      customerEmail: validatedData.customerEmail,
      promoCode: validatedData.promoCode
    };

    const result = await individualCreditService.processTopUp(topUpRequest);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Top-up processing failed'
      });
    }

    res.json({
      success: true,
      data: {
        transactionId: result.transactionId,
        finalAmount: result.finalAmount,
        finalAmountFormatted: `$${(result.finalAmount / 100).toFixed(2)}`,
        bonusAmount: result.bonusAmount,
        bonusAmountFormatted: `$${(result.bonusAmount / 100).toFixed(2)}`,
        balance: result.balance,
        balanceFormatted: `$${(result.balance / 100).toFixed(2)}`,
        wiseTransferId: result.wiseTransferId
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
router.get('/tiers', isAuthenticated, async (req: any, res: any) => {

  try {
    const userId = req.user.id;
    const loyaltyInfo = await individualCreditService.getLoyaltyTierInfo(userId);

    const tiers = [
      {
        name: 'Bronze',
        requirement: 0,
        requirementFormatted: '$0',
        benefits: 'Standard credit rates',
        bonus: 0,
        current: loyaltyInfo.currentTier === 'Bronze'
      },
      {
        name: 'Silver',
        requirement: 25000,
        requirementFormatted: '$250',
        benefits: '3% bonus on all purchases',
        bonus: 3,
        current: loyaltyInfo.currentTier === 'Silver'
      },
      {
        name: 'Gold',
        requirement: 50000,
        requirementFormatted: '$500',
        benefits: '5% bonus on all purchases',
        bonus: 5,
        current: loyaltyInfo.currentTier === 'Gold'
      },
      {
        name: 'Diamond',
        requirement: 100000,
        requirementFormatted: '$1,000',
        benefits: '8% bonus on all purchases',
        bonus: 8,
        current: loyaltyInfo.currentTier === 'Diamond'
      }
    ];

    res.json({
      success: true,
      data: {
        currentTier: loyaltyInfo.currentTier,
        totalPurchased: loyaltyInfo.totalPurchased,
        totalPurchasedFormatted: `$${(loyaltyInfo.totalPurchased / 100).toFixed(2)}`,
        nextTierRequirement: loyaltyInfo.nextTierRequirement,
        nextTierName: loyaltyInfo.nextTierName,
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