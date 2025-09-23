/**
 * Multi-Coach Weighted Aggregation Algorithm
 * 
 * Advanced algorithm for aggregating multiple coach assessments with:
 * - L1-L5 coach level weighting (0.7x to 3.8x)
 * - Time decay functions for assessment freshness
 * - Category-specific confidence factors
 * - Statistical confidence calculations
 * - PROVISIONAL vs CONFIRMED rating handling
 * - Cross-validation consistency analysis
 * 
 * UDF Compliance: Rules 31-34 (Enhanced Coach Assessment System)
 * 
 * @version 2.0.0
 * @lastModified September 23, 2025
 */

import { SKILL_CATEGORIES, CategoryName, getCategoryWeight } from './pcpCalculationSimple';

// Coach Level Weights (L1 to L5)
export const COACH_LEVEL_WEIGHTS = {
  1: 0.7,   // L1 coaches - reduced weight due to limited experience
  2: 1.0,   // L2 coaches - baseline weight
  3: 1.8,   // L3 coaches - increased weight with certification
  4: 3.2,   // L4 coaches - high weight, can create CONFIRMED ratings
  5: 3.8    // L5 coaches - maximum weight, expert level
} as const;

// Time decay factors (in days)
const TIME_DECAY_FACTORS = {
  excellent: 30,    // 95%+ confidence maintained for 30 days
  good: 60,         // 90%+ confidence maintained for 60 days 
  moderate: 120,    // 80%+ confidence maintained for 120 days
  poor: 180         // 60%+ confidence maintained for 180 days
} as const;

// Mapping from SKILL_CATEGORIES display names to internal category names
const CATEGORY_NAME_MAPPING = {
  'Groundstrokes and Serves': 'technical',
  'Dinks and Resets': 'touch',
  'Volleys and Smashes': 'power',
  'Footwork & Fitness': 'athletic',
  'Mental Game': 'mental'
} as const;

// Category confidence factors based on assessment completeness
const CATEGORY_CONFIDENCE_FACTORS = {
  'touch': { skills: 16, weight: 0.25, difficulty: 1.2 },
  'technical': { skills: 11, weight: 0.25, difficulty: 1.0 },
  'mental': { skills: 13, weight: 0.20, difficulty: 1.4 },
  'athletic': { skills: 8, weight: 0.15, difficulty: 0.9 },
  'power': { skills: 7, weight: 0.15, difficulty: 1.1 }
} as const;

export interface CoachAssessment {
  id: number;
  coachId: number;
  coachLevel: number;
  coachName: string;
  assessmentDate: Date;
  sessionType: 'quick_mode' | 'full_assessment';
  skillRatings: Record<string, number>;
  basePCP: number;
  assessmentConfidence: number;
  ratingStatus: 'PROVISIONAL' | 'CONFIRMED';
  skillsAssessed: number;
  totalSkillsPossible: number;
  categoryScores: Record<CategoryName, {
    average: number;
    skillsAssessed: number;
    totalSkills: number;
    confidence: number;
  }>;
}

export interface AggregationResult {
  finalPCP: number;
  aggregatedConfidence: number;
  contributingAssessments: number;
  weightedContributions: Array<{
    coachId: number;
    coachName: string;
    coachLevel: number;
    weight: number;
    timeDecayFactor: number;
    contribution: number;
    ratingStatus: string;
  }>;
  categoryBreakdown: Record<CategoryName, {
    aggregatedScore: number;
    confidence: number;
    assessmentsUsed: number;
    mostRecentDate: Date;
  }>;
  statisticalAnalysis: {
    variance: number;
    standardDeviation: number;
    consistencyScore: number;
    outlierAssessments: number[];
    recommendedConfidenceLevel: number;
  };
  qualityMetrics: {
    overallReliability: number;
    temporalReliability: number;
    coachConsensus: number;
    assessmentCoverage: number;
  };
}

/**
 * Calculate time decay factor for an assessment
 * More recent assessments have higher weight
 */
export function calculateTimeDecay(assessmentDate: Date, currentDate: Date = new Date()): number {
  const daysDiff = Math.max(0, (currentDate.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Exponential decay with plateau for very recent assessments
  if (daysDiff <= 7) return 1.0;  // No decay for first week
  if (daysDiff <= 30) return 0.95; // Minimal decay for first month
  if (daysDiff <= 60) return 0.90; // Light decay for first 2 months
  if (daysDiff <= 120) return 0.80; // Moderate decay up to 4 months
  if (daysDiff <= 180) return 0.65; // Heavy decay up to 6 months
  
  // Asymptotic approach to minimum value
  return Math.max(0.3, 0.65 * Math.exp(-daysDiff / 365));
}

/**
 * Calculate category-specific confidence factor
 * Based on skill coverage and assessment difficulty
 */
export function calculateCategoryConfidence(
  categoryName: CategoryName,
  skillsAssessed: number,
  assessmentType: 'quick_mode' | 'full_assessment'
): number {
  // Map display name to internal name
  const internalName = CATEGORY_NAME_MAPPING[categoryName as keyof typeof CATEGORY_NAME_MAPPING];
  const categoryInfo = CATEGORY_CONFIDENCE_FACTORS[internalName];
  if (!categoryInfo) return 0.5;

  const coverageRatio = skillsAssessed / categoryInfo.skills;
  const baseConfidence = Math.min(1.0, coverageRatio * 0.9 + 0.1); // Min 10% confidence

  // Adjust for assessment type
  const typeMultiplier = assessmentType === 'full_assessment' ? 1.0 : 0.75;

  // Adjust for category difficulty
  const difficultyAdjustment = 1.0 / categoryInfo.difficulty;

  return Math.min(0.98, baseConfidence * typeMultiplier * difficultyAdjustment);
}

/**
 * Detect statistical outliers using IQR method
 */
export function detectOutliers(values: number[]): number[] {
  if (values.length < 4) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.map((value, index) => 
    value < lowerBound || value > upperBound ? index : -1
  ).filter(index => index !== -1);
}

/**
 * Calculate coach consensus score
 * Higher scores indicate better agreement between coaches
 */
export function calculateCoachConsensus(assessments: CoachAssessment[]): number {
  if (assessments.length < 2) return 1.0;

  const pcpValues = assessments.map(a => a.basePCP);
  const mean = pcpValues.reduce((sum, val) => sum + val, 0) / pcpValues.length;
  const variance = pcpValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pcpValues.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;

  // Consensus score decreases with higher coefficient of variation
  return Math.max(0.1, 1.0 - Math.min(1.0, coefficientOfVariation * 2));
}

/**
 * Main aggregation algorithm for multiple coach assessments
 */
export function aggregateMultipleCoachAssessments(
  assessments: CoachAssessment[],
  options: {
    includeProvisional?: boolean;
    minimumAssessments?: number;
    maximumAge?: number; // days
    categorySpecific?: boolean;
  } = {}
): AggregationResult {
  const {
    includeProvisional = true,
    minimumAssessments = 1,
    maximumAge = 365,
    categorySpecific = true
  } = options;

  // Filter assessments based on options
  const currentDate = new Date();
  let filteredAssessments = assessments.filter(assessment => {
    const daysDiff = (currentDate.getTime() - assessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > maximumAge) return false;
    if (!includeProvisional && assessment.ratingStatus === 'PROVISIONAL') return false;
    
    return true;
  });

  if (filteredAssessments.length < minimumAssessments) {
    throw new Error(`Insufficient assessments: ${filteredAssessments.length} found, ${minimumAssessments} required`);
  }

  // Sort by date (most recent first) for processing
  filteredAssessments = filteredAssessments.sort(
    (a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime()
  );

  // Calculate weighted contributions
  const contributions: AggregationResult['weightedContributions'] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Category-specific aggregation
  const categoryBreakdown: AggregationResult['categoryBreakdown'] = {} as any;
  
  for (const categoryName of Object.keys(SKILL_CATEGORIES) as CategoryName[]) {
    categoryBreakdown[categoryName] = {
      aggregatedScore: 0,
      confidence: 0,
      assessmentsUsed: 0,
      mostRecentDate: new Date(0)
    };
  }

  // Process each assessment
  for (const assessment of filteredAssessments) {
    const baseWeight = COACH_LEVEL_WEIGHTS[assessment.coachLevel as keyof typeof COACH_LEVEL_WEIGHTS] || 1.0;
    const timeDecayFactor = calculateTimeDecay(assessment.assessmentDate, currentDate);
    
    // Additional multipliers
    const statusMultiplier = assessment.ratingStatus === 'CONFIRMED' ? 1.0 : 0.85;
    const completenessMultiplier = Math.sqrt(assessment.skillsAssessed / assessment.totalSkillsPossible);
    
    const finalWeight = baseWeight * timeDecayFactor * statusMultiplier * completenessMultiplier;
    
    const contribution = assessment.basePCP * finalWeight;
    totalWeightedScore += contribution;
    totalWeight += finalWeight;

    contributions.push({
      coachId: assessment.coachId,
      coachName: assessment.coachName,
      coachLevel: assessment.coachLevel,
      weight: finalWeight,
      timeDecayFactor,
      contribution: contribution / finalWeight, // Normalized contribution
      ratingStatus: assessment.ratingStatus
    });

    // Category-specific aggregation
    if (categorySpecific) {
      for (const [categoryName, categoryData] of Object.entries(assessment.categoryScores)) {
        const catName = categoryName as CategoryName;
        const categoryWeight = finalWeight * categoryData.confidence;
        
        categoryBreakdown[catName].aggregatedScore += categoryData.average * categoryWeight;
        categoryBreakdown[catName].confidence += categoryWeight;
        categoryBreakdown[catName].assessmentsUsed += 1;
        
        if (assessment.assessmentDate > categoryBreakdown[catName].mostRecentDate) {
          categoryBreakdown[catName].mostRecentDate = assessment.assessmentDate;
        }
      }
    }
  }

  // Finalize category scores
  for (const categoryName of Object.keys(categoryBreakdown) as CategoryName[]) {
    if (categoryBreakdown[categoryName].confidence > 0) {
      categoryBreakdown[categoryName].aggregatedScore /= categoryBreakdown[categoryName].confidence;
      categoryBreakdown[categoryName].confidence /= categoryBreakdown[categoryName].assessmentsUsed;
    }
  }

  // Calculate final PCP
  const finalPCP = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  // Statistical analysis
  const pcpValues = filteredAssessments.map(a => a.basePCP);
  const mean = pcpValues.reduce((sum, val) => sum + val, 0) / pcpValues.length;
  const variance = pcpValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pcpValues.length;
  const standardDeviation = Math.sqrt(variance);
  const outlierIndices = detectOutliers(pcpValues);
  const consistencyScore = calculateCoachConsensus(filteredAssessments);

  // Quality metrics
  const overallReliability = Math.min(1.0, totalWeight / (filteredAssessments.length * 2.0));
  const temporalReliability = filteredAssessments.reduce((sum, a) => 
    sum + calculateTimeDecay(a.assessmentDate), 0) / filteredAssessments.length;
  const coachConsensus = consistencyScore;
  const assessmentCoverage = filteredAssessments.reduce((sum, a) => 
    sum + (a.skillsAssessed / a.totalSkillsPossible), 0) / filteredAssessments.length;

  // Confidence calculation
  const baseConfidence = Math.min(0.95, 
    (overallReliability * 0.3) + 
    (temporalReliability * 0.2) + 
    (coachConsensus * 0.3) + 
    (assessmentCoverage * 0.2)
  );

  const assessmentBonus = Math.min(0.05, filteredAssessments.length * 0.01);
  const aggregatedConfidence = Math.min(0.98, baseConfidence + assessmentBonus);

  return {
    finalPCP,
    aggregatedConfidence,
    contributingAssessments: filteredAssessments.length,
    weightedContributions: contributions,
    categoryBreakdown,
    statisticalAnalysis: {
      variance,
      standardDeviation,
      consistencyScore,
      outlierAssessments: outlierIndices,
      recommendedConfidenceLevel: aggregatedConfidence
    },
    qualityMetrics: {
      overallReliability,
      temporalReliability,
      coachConsensus,
      assessmentCoverage
    }
  };
}

/**
 * Create assessment record from coach session data
 * Helper function to convert session data to standardized format
 */
export function createAssessmentRecord(
  sessionId: number,
  coachId: number,
  coachLevel: number,
  coachName: string,
  assessmentDate: Date,
  sessionType: 'quick_mode' | 'full_assessment',
  skillRatings: Record<string, number>,
  basePCP: number,
  assessmentConfidence: number
): CoachAssessment {
  // Calculate category scores
  const categoryScores: CoachAssessment['categoryScores'] = {} as any;
  
  for (const [categoryName, skills] of Object.entries(SKILL_CATEGORIES)) {
    const catName = categoryName as CategoryName;
    const internalName = CATEGORY_NAME_MAPPING[catName as keyof typeof CATEGORY_NAME_MAPPING];
    
    const categorySkillRatings = skills
      .map(skill => skillRatings[skill])
      .filter(rating => rating !== undefined);
    
    if (categorySkillRatings.length > 0) {
      const average = categorySkillRatings.reduce((sum, rating) => sum + rating, 0) / categorySkillRatings.length;
      const confidence = calculateCategoryConfidence(catName, categorySkillRatings.length, sessionType);
      
      categoryScores[catName] = {
        average,
        skillsAssessed: categorySkillRatings.length,
        totalSkills: skills.length,
        confidence
      };
    } else {
      categoryScores[catName] = {
        average: 0,
        skillsAssessed: 0,
        totalSkills: skills.length,
        confidence: 0
      };
    }
  }

  const skillsAssessed = Object.keys(skillRatings).length;
  const totalSkillsPossible = sessionType === 'quick_mode' ? 10 : 55;
  const ratingStatus: 'PROVISIONAL' | 'CONFIRMED' = coachLevel >= 4 ? 'CONFIRMED' : 'PROVISIONAL';

  return {
    id: sessionId,
    coachId,
    coachLevel,
    coachName,
    assessmentDate,
    sessionType,
    skillRatings,
    basePCP,
    assessmentConfidence,
    ratingStatus,
    skillsAssessed,
    totalSkillsPossible,
    categoryScores
  };
}

export default {
  aggregateMultipleCoachAssessments,
  createAssessmentRecord,
  calculateTimeDecay,
  calculateCategoryConfidence,
  detectOutliers,
  calculateCoachConsensus,
  COACH_LEVEL_WEIGHTS,
  CATEGORY_CONFIDENCE_FACTORS
};