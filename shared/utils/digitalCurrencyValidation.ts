/**
 * DIGITAL CURRENCY SYSTEM - UDF ALGORITHM VALIDATION UTILITIES
 * 
 * MANDATORY IMPORT: All credit calculation components MUST import and use these utilities
 * to ensure compliance with UDF principles and financial integrity.
 * 
 * Version: 1.0.0 - Sprint 1: Foundation & Digital Currency Core
 * Last Updated: September 17, 2025
 * Source of Truth: PICKLEPLUS_ADVANCED_FACILITY_MANAGEMENT_DEVELOPMENT_PLAN.md
 * 
 * CRITICAL VALIDATION: ALL CREDIT OPERATIONS MUST BE ADDITIVE AND AUDITABLE
 * - validateCreditTransaction() prevents destructive balance operations
 * - All database operations must preserve complete audit trails
 * - System enforces financial data integrity and compliance
 */

// Digital currency validation utilities can operate independently from algorithm validation
// Future integration with algorithmValidation utilities can be added as needed

// ========================================
// DIGITAL CURRENCY CONSTANTS (IMMUTABLE)
// ========================================
export const PICKLE_CREDITS_CONSTANTS = {
  // Pickle Points earning ratio: 3 points per 1 credit purchased
  PICKLE_POINTS_RATIO: 3.0,
  
  // Minimum transaction amounts (in cents)
  MIN_TOP_UP_AMOUNT: 500, // $5.00 minimum
  MIN_TRANSFER_AMOUNT: 100, // $1.00 minimum
  MIN_GIFT_CARD_AMOUNT: 2500, // $25.00 minimum
  
  // Bonus thresholds and rates
  BONUS_THRESHOLD_TIER_1: 10000, // $100.00 - 7% bonus
  BONUS_THRESHOLD_TIER_2: 50000, // $500.00 - 15% bonus
  BONUS_RATE_TIER_1: 0.07,
  BONUS_RATE_TIER_2: 0.15,
  
  // Gift card denominations (in cents)
  GIFT_CARD_DENOMINATIONS: [2500, 5000, 10000, 25000, 50000], // $25, $50, $100, $250, $500
  
  // Transaction limits (daily, in cents)
  DAILY_INDIVIDUAL_LIMIT: 100000, // $1,000
  DAILY_CORPORATE_LIMIT: 5000000, // $50,000
  
  // Gift card specific limits
  MIN_REDEMPTION_AMOUNT: 100 // $1.00 minimum redemption
} as const;

// ========================================
// TRANSACTION VALIDATION INTERFACES
// ========================================
export interface CreditTransactionValidation {
  userId: number;
  amount: number;
  type: CreditTransactionType;
  currentBalance: number;
  expectedBalanceAfter: number;
  picklePointsAwarded?: number;
  wiseTransactionId?: string;
  referenceType?: string;
}

export interface PicklePointsCalculation {
  creditsAmount: number;
  pointsRatio: number;
  expectedPoints: number;
  transactionType: CreditTransactionType;
}

export enum CreditTransactionType {
  TOP_UP = 'top_up',
  PROGRAM_PURCHASE = 'program_purchase',
  GIFT_REDEMPTION = 'gift_redemption',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  GIFT_CARD_PURCHASE = 'gift_card_purchase',
  BONUS_CREDIT = 'bonus_credit',
  PICKLE_POINTS_MATCH_REWARD = 'pickle_points_match_reward'
}

export interface GiftCardValidation {
  code: string;
  amount: number;
  remainingBalance: number;
  purchaserId: number;
  isValidRedemption: boolean;
  redemptionAmount: number;
}

// ========================================
// CORE VALIDATION FUNCTIONS
// ========================================

/**
 * UDF-COMPLIANT: Validate credit transaction follows additive principles
 * CRITICAL: Prevents balance replacement, ensures audit trail integrity
 */
export function validateCreditTransaction(validation: CreditTransactionValidation): {
  isValid: boolean;
  errors: string[];
  balanceAfterTransaction: number;
  auditMetadata: Record<string, any>;
} {
  const errors: string[] = [];
  const auditMetadata: Record<string, any> = {
    validatedAt: new Date().toISOString(),
    userId: validation.userId,
    transactionType: validation.type,
    algorithm: 'UDF_ADDITIVE_CREDIT_SYSTEM_v1.0.0'
  };

  // UDF Rule 1: All operations must be additive
  const calculatedBalance = validation.currentBalance + validation.amount;
  if (calculatedBalance !== validation.expectedBalanceAfter) {
    errors.push(
      `UDF VIOLATION: Balance calculation mismatch. ` +
      `Expected: ${validation.expectedBalanceAfter}, ` +
      `Calculated: ${calculatedBalance} ` +
      `(current: ${validation.currentBalance} + amount: ${validation.amount})`
    );
  }

  // UDF Rule 2: Negative balances not allowed for debits
  if (validation.amount < 0 && calculatedBalance < 0) {
    errors.push(
      `UDF VIOLATION: Insufficient balance. ` +
      `Current: ${validation.currentBalance}, Requested: ${Math.abs(validation.amount)}`
    );
  }

  // UDF Rule 3: Transaction amount validation
  const absoluteAmount = Math.abs(validation.amount);
  if (absoluteAmount === 0) {
    errors.push('UDF VIOLATION: Zero-amount transactions not permitted');
  }

  // UDF Rule 4: Minimum amount validation for specific transaction types
  if (validation.type === CreditTransactionType.TOP_UP && 
      absoluteAmount < PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT) {
    errors.push(
      `UDF VIOLATION: Top-up below minimum. ` +
      `Required: ${PICKLE_CREDITS_CONSTANTS.MIN_TOP_UP_AMOUNT}, Provided: ${absoluteAmount}`
    );
  }

  // UDF Rule 5: Audit trail requirements
  if (!validation.wiseTransactionId && 
      [CreditTransactionType.TOP_UP, CreditTransactionType.GIFT_CARD_PURCHASE].includes(validation.type)) {
    errors.push('UDF VIOLATION: Missing Wise transaction ID for payment-based transaction');
  }

  auditMetadata.errors = errors;
  auditMetadata.balanceCalculation = {
    current: validation.currentBalance,
    amount: validation.amount,
    expected: validation.expectedBalanceAfter,
    calculated: calculatedBalance
  };

  return {
    isValid: errors.length === 0,
    errors,
    balanceAfterTransaction: calculatedBalance,
    auditMetadata
  };
}

/**
 * UDF-COMPLIANT: Calculate Pickle Points with 3:1 ratio
 * CRITICAL: Must integrate with existing ranking system additively
 */
export function calculatePicklePointsReward(calculation: PicklePointsCalculation): {
  isValid: boolean;
  pointsAwarded: number;
  errors: string[];
  auditMetadata: Record<string, any>;
} {
  const errors: string[] = [];
  const auditMetadata: Record<string, any> = {
    validatedAt: new Date().toISOString(),
    algorithm: 'UDF_PICKLE_POINTS_3_TO_1_RATIO_v1.0.0'
  };

  // UDF Rule 1: Validate points ratio is exactly 3.0
  if (calculation.pointsRatio !== PICKLE_CREDITS_CONSTANTS.PICKLE_POINTS_RATIO) {
    errors.push(
      `UDF VIOLATION: Incorrect points ratio. ` +
      `Expected: ${PICKLE_CREDITS_CONSTANTS.PICKLE_POINTS_RATIO}, ` +
      `Provided: ${calculation.pointsRatio}`
    );
  }

  // UDF Rule 2: Only award points for purchase transactions
  const eligibleTypes = [
    CreditTransactionType.TOP_UP,
    CreditTransactionType.GIFT_CARD_PURCHASE,
    CreditTransactionType.BONUS_CREDIT
  ];
  
  if (!eligibleTypes.includes(calculation.transactionType)) {
    return {
      isValid: true,
      pointsAwarded: 0,
      errors: [],
      auditMetadata: {
        ...auditMetadata,
        reason: 'Transaction type not eligible for points',
        transactionType: calculation.transactionType
      }
    };
  }

  // UDF Rule 3: Calculate points additively
  const calculatedPoints = Math.floor(calculation.creditsAmount * calculation.pointsRatio);
  if (calculatedPoints !== calculation.expectedPoints) {
    errors.push(
      `UDF VIOLATION: Points calculation mismatch. ` +
      `Expected: ${calculation.expectedPoints}, ` +
      `Calculated: ${calculatedPoints} ` +
      `(credits: ${calculation.creditsAmount} × ratio: ${calculation.pointsRatio})`
    );
  }

  auditMetadata.calculation = {
    creditsAmount: calculation.creditsAmount,
    pointsRatio: calculation.pointsRatio,
    expectedPoints: calculation.expectedPoints,
    calculatedPoints: calculatedPoints
  };

  return {
    isValid: errors.length === 0,
    pointsAwarded: calculatedPoints,
    errors,
    auditMetadata
  };
}

/**
 * UDF-COMPLIANT: Calculate bonus credits for large purchases
 * CRITICAL: Bonus calculations must be transparent and auditable
 */
export function calculateTopUpBonus(amount: number): {
  bonusAmount: number;
  bonusRate: number;
  totalCredits: number;
  auditMetadata: Record<string, any>;
} {
  let bonusRate = 0;
  
  if (amount >= PICKLE_CREDITS_CONSTANTS.BONUS_THRESHOLD_TIER_2) {
    bonusRate = PICKLE_CREDITS_CONSTANTS.BONUS_RATE_TIER_2;
  } else if (amount >= PICKLE_CREDITS_CONSTANTS.BONUS_THRESHOLD_TIER_1) {
    bonusRate = PICKLE_CREDITS_CONSTANTS.BONUS_RATE_TIER_1;
  }
  
  const bonusAmount = Math.floor(amount * bonusRate);
  const totalCredits = amount + bonusAmount;
  
  return {
    bonusAmount,
    bonusRate,
    totalCredits,
    auditMetadata: {
      validatedAt: new Date().toISOString(),
      algorithm: 'UDF_BONUS_CALCULATION_v1.0.0',
      calculation: {
        baseAmount: amount,
        bonusRate,
        bonusAmount,
        totalCredits
      }
    }
  };
}

/**
 * UDF-COMPLIANT: Validate gift card operations
 * CRITICAL: Prevents double spending and ensures partial redemption integrity
 */
export function validateGiftCardRedemption(validation: GiftCardValidation): {
  isValid: boolean;
  newRemainingBalance: number;
  errors: string[];
  auditMetadata: Record<string, any>;
} {
  const errors: string[] = [];
  const auditMetadata: Record<string, any> = {
    validatedAt: new Date().toISOString(),
    giftCardCode: validation.code,
    algorithm: 'UDF_GIFT_CARD_VALIDATION_v1.0.0'
  };

  // UDF Rule 1: Redemption amount cannot exceed remaining balance
  if (validation.redemptionAmount > validation.remainingBalance) {
    errors.push(
      `UDF VIOLATION: Redemption exceeds balance. ` +
      `Requested: ${validation.redemptionAmount}, ` +
      `Available: ${validation.remainingBalance}`
    );
  }

  // UDF Rule 2: Gift card code must be unique and valid format
  if (!validation.code || validation.code.length !== 8) {
    errors.push('UDF VIOLATION: Invalid gift card code format');
  }

  // UDF Rule 3: Calculate new balance additively (subtraction)
  const newRemainingBalance = validation.remainingBalance - validation.redemptionAmount;
  if (newRemainingBalance < 0) {
    errors.push('UDF VIOLATION: Negative gift card balance not permitted');
  }

  auditMetadata.redemption = {
    originalAmount: validation.amount,
    remainingBalance: validation.remainingBalance,
    redemptionAmount: validation.redemptionAmount,
    newRemainingBalance: newRemainingBalance
  };

  return {
    isValid: errors.length === 0,
    newRemainingBalance,
    errors,
    auditMetadata
  };
}

/**
 * UDF-COMPLIANT: Validate daily transaction limits
 * CRITICAL: Prevents abuse and ensures regulatory compliance
 */
export function validateDailyLimits(
  userId: number, 
  amount: number, 
  currentDailySpent: number, 
  userType: 'individual' | 'corporate' = 'individual'
): {
  isValid: boolean;
  dailyLimit: number;
  remainingDaily: number;
  errors: string[];
} {
  const dailyLimit = userType === 'corporate' 
    ? PICKLE_CREDITS_CONSTANTS.DAILY_CORPORATE_LIMIT
    : PICKLE_CREDITS_CONSTANTS.DAILY_INDIVIDUAL_LIMIT;
    
  const projectedDailySpent = currentDailySpent + amount;
  const remainingDaily = Math.max(0, dailyLimit - currentDailySpent);
  
  const errors: string[] = [];
  
  if (projectedDailySpent > dailyLimit) {
    errors.push(
      `UDF VIOLATION: Daily limit exceeded. ` +
      `Limit: ${dailyLimit}, Current: ${currentDailySpent}, Requested: ${amount}`
    );
  }
  
  return {
    isValid: errors.length === 0,
    dailyLimit,
    remainingDaily,
    errors
  };
}

/**
 * EXPORT ALL UDF VALIDATION FUNCTIONS
 * Must be imported by all digital currency components
 */
export const digitalCurrencyUDF = {
  validateCreditTransaction,
  calculatePicklePointsReward,
  calculateTopUpBonus,
  validateGiftCardRedemption,
  validateDailyLimits,
  constants: PICKLE_CREDITS_CONSTANTS,
  types: {
    CreditTransactionType,
  }
} as const;

// ========================================
// GIFT CARD CODE GENERATION UTILITY
// ========================================
export function generateGiftCardCode(): string {
  // SECURITY: Use cryptographically secure random generation
  const crypto = require('crypto');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  // Generate 3 segments of 4 characters each: XXXX-XXXX-XXXX
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      segment += chars.charAt(randomIndex);
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

// Functions and constants are already exported as named exports above
// digitalCurrencyUDF provides a convenient grouped export for easier importing