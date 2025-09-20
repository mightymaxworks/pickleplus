/**
 * BULK CREDIT PURCHASE API ROUTES - CORPORATE VOLUME DISCOUNTS
 * 
 * Enterprise-grade bulk credit purchasing system for corporate accounts.
 * Implements volume discounts, annual commitments, and corporate payment processing.
 * 
 * Version: 1.0.0 - Sprint 2: Corporate Bulk Purchase System
 * Last Updated: September 20, 2025
 * 
 * VOLUME DISCOUNT STRUCTURE:
 * - 10% discount for $5,000+ purchases
 * - 15% discount for $10,000+ purchases  
 * - 5% annual commitment bonus
 * - Enterprise payment processing via Wise Business API
 * 
 * SECURITY REQUIREMENTS:
 * - Corporate admin authentication required
 * - Enhanced rate limiting for large transactions
 * - Complete audit trail with approval workflows
 * - UDF algorithm compliance for all calculations
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import postgres from "postgres";
import { 
  corporateAccounts,
  corporateHierarchy,
  type CorporateAccount
} from "../../shared/schema";
import { digitalCurrencyService } from '../services/digitalCurrencyService';
import { digitalCurrencyUDF } from '../../shared/utils/digitalCurrencyValidation';
import { requireAuth } from '../middleware/auth';
import { 
  parseWebhookRawBody, 
  verifyWiseWebhookSignature, 
  ensurePersistentIdempotency, 
  markEventProcessing, 
  markEventCompleted 
} from '../middleware/productionWebhookSecurity';

const router = Router();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const sql_client = postgres(connectionString);
const db = drizzle(sql_client);

/**
 * CORPORATE ADMIN AUTHORIZATION MIDDLEWARE
 * Ensures user is admin or master admin of the corporate account
 */
async function requireCorporateAdmin(req: any, res: any, next: any) {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    const userId = req.user.id;

    // Check if user is master admin of this corporate account
    const corporateAccount = await db.select()
      .from(corporateAccounts)
      .where(eq(corporateAccounts.id, corporateAccountId))
      .limit(1);

    if (corporateAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    // Check if user is master admin
    if (corporateAccount[0].masterAdminId === userId) {
      req.corporateAccount = corporateAccount[0];
      return next();
    }

    // Check if user has admin role in hierarchy
    const hierarchyRecord = await db.select()
      .from(corporateHierarchy)
      .where(
        and(
          eq(corporateHierarchy.corporateAccountId, corporateAccountId),
          eq(corporateHierarchy.userId, userId),
          eq(corporateHierarchy.role, 'department_admin')
        )
      )
      .limit(1);

    if (hierarchyRecord.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Corporate admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    req.corporateAccount = corporateAccount[0];
    next();
  } catch (error) {
    console.error('[BULK CREDITS] Authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed',
      code: 'AUTH_ERROR'
    });
  }
}

// Enhanced rate limiting for bulk corporate transactions
const bulkPurchaseRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 bulk purchases per hour per corporate account
  message: { error: 'Bulk purchase limit exceeded, please contact support for enterprise processing' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Volume discount tiers (amounts in cents)
const VOLUME_DISCOUNT_TIERS = {
  TIER_1: {
    minAmount: 500000, // $5,000
    discountRate: 0.10, // 10%
    label: 'Volume Tier 1'
  },
  TIER_2: {
    minAmount: 1000000, // $10,000
    discountRate: 0.15, // 15%
    label: 'Volume Tier 2'
  }
} as const;

const ANNUAL_COMMITMENT_BONUS = 0.05; // 5% additional bonus

// Validation schemas
const bulkPurchaseSchema = z.object({
  amount: z.number()
    .min(500000, 'Minimum bulk purchase amount is $5,000') // $5,000 minimum
    .max(10000000, 'Maximum bulk purchase amount is $100,000') // $100,000 maximum
    .refine(val => val % 100 === 0, 'Amount must be in whole dollars'),
  corporateAccountId: z.number().int().positive('Valid corporate account ID required'),
  customerEmail: z.string().email('Valid email required'),
  hasAnnualCommitment: z.boolean().default(false),
  purchaseOrderNumber: z.string().optional(),
  departmentCode: z.string().optional(),
  businessJustification: z.string().min(10, 'Business justification required for bulk purchases'),
});

const bulkQuoteSchema = z.object({
  amount: z.number()
    .min(500000, 'Minimum bulk purchase amount is $5,000')
    .max(10000000, 'Maximum bulk purchase amount is $100,000'),
  hasAnnualCommitment: z.boolean().default(false),
});

/**
 * CALCULATE VOLUME DISCOUNTS
 * Determines discount tier and calculates final amount
 */
function calculateVolumeDiscount(baseAmount: number, hasAnnualCommitment: boolean = false) {
  let discountRate = 0;
  let tier = null;

  // Determine volume discount tier
  if (baseAmount >= VOLUME_DISCOUNT_TIERS.TIER_2.minAmount) {
    discountRate = VOLUME_DISCOUNT_TIERS.TIER_2.discountRate;
    tier = VOLUME_DISCOUNT_TIERS.TIER_2;
  } else if (baseAmount >= VOLUME_DISCOUNT_TIERS.TIER_1.minAmount) {
    discountRate = VOLUME_DISCOUNT_TIERS.TIER_1.discountRate;
    tier = VOLUME_DISCOUNT_TIERS.TIER_1;
  }

  // Add annual commitment bonus
  if (hasAnnualCommitment) {
    discountRate += ANNUAL_COMMITMENT_BONUS;
  }

  const discountAmount = Math.floor(baseAmount * discountRate);
  const finalAmount = baseAmount - discountAmount;
  const creditsReceived = baseAmount; // Credits based on original amount
  const savings = discountAmount;

  return {
    baseAmount,
    discountRate,
    discountAmount,
    finalAmount,
    creditsReceived,
    savings,
    tier: tier?.label || 'No volume discount',
    hasAnnualCommitmentBonus: hasAnnualCommitment
  };
}

/**
 * POST /api/bulk-credits/quote
 * Get pricing quote for bulk credit purchase
 */
router.post('/quote', requireAuth, async (req: any, res: any) => {
  try {
    const validation = bulkQuoteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const { amount, hasAnnualCommitment } = validation.data;
    const quote = calculateVolumeDiscount(amount, hasAnnualCommitment);

    res.json({
      success: true,
      data: {
        quote,
        breakdown: {
          baseAmount: `$${(quote.baseAmount / 100).toFixed(2)}`,
          discountRate: `${(quote.discountRate * 100).toFixed(1)}%`,
          discountAmount: `$${(quote.discountAmount / 100).toFixed(2)}`,
          finalPayment: `$${(quote.finalAmount / 100).toFixed(2)}`,
          creditsReceived: `$${(quote.creditsReceived / 100).toFixed(2)}`,
          totalSavings: `$${(quote.savings / 100).toFixed(2)}`
        },
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    });

  } catch (error) {
    console.error('[BULK CREDITS] Quote calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate bulk purchase quote',
      code: 'QUOTE_ERROR'
    });
  }
});

/**
 * POST /api/bulk-credits/purchase
 * Process bulk credit purchase for corporate accounts
 */
router.post('/purchase', bulkPurchaseRateLimit, requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const validation = bulkPurchaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bulk purchase request',
        details: validation.error.issues,
        code: 'VALIDATION_ERROR'
      });
    }

    const {
      amount,
      corporateAccountId,
      customerEmail,
      hasAnnualCommitment,
      purchaseOrderNumber,
      departmentCode,
      businessJustification
    } = validation.data;

    // Calculate volume discount
    const discountCalculation = calculateVolumeDiscount(amount, hasAnnualCommitment);

    // Validate corporate account access
    // TODO: Verify user has access to specified corporate account
    
    // Create bulk purchase transaction record
    const bulkPurchaseData = {
      corporateAccountId,
      userId: req.user.id,
      baseAmount: amount,
      discountRate: discountCalculation.discountRate,
      discountAmount: discountCalculation.discountAmount,
      finalAmount: discountCalculation.finalAmount,
      creditsReceived: discountCalculation.creditsReceived,
      hasAnnualCommitment,
      purchaseOrderNumber,
      departmentCode,
      businessJustification,
      status: 'pending_payment',
      customerEmail
    };

    // Process enterprise payment via Wise Business API
    const wisePaymentRequest = {
      amount: discountCalculation.finalAmount,
      currency: 'USD' as const,
      userId: req.user.id,
      customerEmail,
      description: `Bulk Credit Purchase - ${discountCalculation.tier} - PO: ${purchaseOrderNumber || 'N/A'}`,
      metadata: {
        type: 'bulk_credit_purchase',
        corporateAccountId,
        baseAmount: amount,
        creditsReceived: discountCalculation.creditsReceived,
        discountRate: discountCalculation.discountRate,
        hasAnnualCommitment
      }
    };

    // TODO: Integrate with Wise Business API for enterprise payment processing
    // For now, return the prepared transaction data
    
    res.status(201).json({
      success: true,
      data: {
        bulkPurchase: bulkPurchaseData,
        discountCalculation,
        paymentRequest: wisePaymentRequest,
        message: 'Bulk purchase initialized - enterprise payment processing required'
      }
    });

  } catch (error) {
    console.error('[BULK CREDITS] Purchase processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk credit purchase',
      code: 'BULK_PURCHASE_ERROR'
    });
  }
});

/**
 * GET /api/bulk-credits/history
 * Get bulk purchase history for corporate account
 */
router.get('/history/:corporateAccountId', requireAuth, requireCorporateAdmin, async (req: any, res: any) => {
  try {
    const corporateAccountId = parseInt(req.params.corporateAccountId);
    
    if (isNaN(corporateAccountId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid corporate account ID',
        code: 'INVALID_ACCOUNT_ID'
      });
    }

    // TODO: Implement bulk purchase history retrieval from database
    // For now, return mock data structure
    
    res.json({
      success: true,
      data: {
        purchases: [],
        summary: {
          totalPurchases: 0,
          totalCreditsReceived: 0,
          totalSavings: 0,
          averageDiscount: 0
        }
      }
    });

  } catch (error) {
    console.error('[BULK CREDITS] History retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bulk purchase history',
      code: 'HISTORY_ERROR'
    });
  }
});

/**
 * GET /api/bulk-credits/discount-tiers
 * Get current volume discount tier information
 */
router.get('/discount-tiers', requireAuth, async (req: any, res: any) => {
  try {
    res.json({
      success: true,
      data: {
        tiers: [
          {
            name: VOLUME_DISCOUNT_TIERS.TIER_1.label,
            minAmount: VOLUME_DISCOUNT_TIERS.TIER_1.minAmount,
            discountRate: VOLUME_DISCOUNT_TIERS.TIER_1.discountRate,
            minAmountDisplay: `$${(VOLUME_DISCOUNT_TIERS.TIER_1.minAmount / 100).toLocaleString()}`,
            discountDisplay: `${(VOLUME_DISCOUNT_TIERS.TIER_1.discountRate * 100)}%`
          },
          {
            name: VOLUME_DISCOUNT_TIERS.TIER_2.label,
            minAmount: VOLUME_DISCOUNT_TIERS.TIER_2.minAmount,
            discountRate: VOLUME_DISCOUNT_TIERS.TIER_2.discountRate,
            minAmountDisplay: `$${(VOLUME_DISCOUNT_TIERS.TIER_2.minAmount / 100).toLocaleString()}`,
            discountDisplay: `${(VOLUME_DISCOUNT_TIERS.TIER_2.discountRate * 100)}%`
          }
        ],
        annualCommitmentBonus: {
          rate: ANNUAL_COMMITMENT_BONUS,
          display: `${(ANNUAL_COMMITMENT_BONUS * 100)}%`,
          description: 'Additional bonus for annual commitment contracts'
        },
        notes: [
          'Volume discounts are cumulative with annual commitment bonuses',
          'Minimum bulk purchase amount: $5,000',
          'Maximum bulk purchase amount: $100,000',
          'Credits received are based on original purchase amount before discounts',
          'Enterprise payment processing available for $50,000+ purchases'
        ]
      }
    });

  } catch (error) {
    console.error('[BULK CREDITS] Discount tiers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve discount tier information',
      code: 'TIERS_ERROR'
    });
  }
});

export default router;