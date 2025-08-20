/**
 * Coach Level Weighted Assessment Algorithm
 * 
 * This module implements sophisticated weighting for PCP assessments based on
 * coach certification levels (L1-L5), ensuring higher-level coaches have 
 * appropriate influence on player ratings while maintaining assessment integrity.
 */

export interface CoachAssessment {
  id: string;
  coachId: number;
  coachLevel: number; // 1-5
  studentId: number;
  assessmentDate: Date;
  scores: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  skillRatings: Record<string, number>;
  sessionNotes?: string;
}

export interface WeightedPCPResult {
  finalPCPRating: number;
  categoryBreakdown: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  contributingAssessments: {
    coachId: number;
    coachLevel: number;
    weight: number;
    confidence: number;
    recency: number;
  }[];
  qualityMetrics: {
    totalWeight: number;
    assessmentCount: number;
    averageCoachLevel: number;
    consensusScore: number; // 0-1, higher = more agreement
  };
}

/**
 * Coach level base weight multipliers
 * Adjusted to reflect certification difficulty with larger gaps at higher levels
 */
const COACH_LEVEL_WEIGHTS: Record<number, number> = {
  1: 0.7,   // Minimal influence - foundational assessment only
  2: 1.0,   // Standard baseline - enhanced technical knowledge
  3: 1.8,   // 80% increase - advanced tactical understanding
  4: 3.2,   // 220% increase - expert-level analysis (largest gap)
  5: 3.8    // 280% increase - master-level assessment authority
};

/**
 * Confidence factors by coach level and skill category
 * Reflects specialized training and expertise areas
 */
const CONFIDENCE_FACTORS: Record<number, Record<string, number>> = {
  1: { technical: 0.8, tactical: 0.7, physical: 0.9, mental: 0.6 },
  2: { technical: 0.9, tactical: 0.8, physical: 0.9, mental: 0.7 },
  3: { technical: 0.95, tactical: 0.9, physical: 0.9, mental: 0.8 },
  4: { technical: 0.98, tactical: 0.95, physical: 0.92, mental: 0.9 },
  5: { technical: 1.0, tactical: 0.98, physical: 0.95, mental: 0.95 }
};

/**
 * Calculate time-based weight decay for assessment recency
 */
export function calculateTimeWeight(assessmentDate: Date): number {
  const daysSince = Math.floor((Date.now() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0.5, 1.0 - (daysSince / 90)); // 90-day half-life
}

/**
 * Get base weight multiplier for coach level
 */
export function getCoachLevelWeight(coachLevel: number): number {
  return COACH_LEVEL_WEIGHTS[coachLevel] || 1.0;
}

/**
 * Get confidence factors for coach level
 */
export function getConfidenceFactors(coachLevel: number): Record<string, number> {
  return CONFIDENCE_FACTORS[coachLevel] || CONFIDENCE_FACTORS[1];
}

/**
 * Calculate consensus score (agreement between assessments)
 */
function calculateConsensus(categoryScores: Record<string, number[]>): number {
  let totalVariance = 0;
  let categoryCount = 0;

  for (const [category, scores] of Object.entries(categoryScores)) {
    if (scores.length < 2) continue;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    totalVariance += variance;
    categoryCount++;
  }

  if (categoryCount === 0) return 1.0;
  
  const avgVariance = totalVariance / categoryCount;
  return Math.max(0, 1.0 - (avgVariance / 25)); // Normalize to 0-1 scale
}

/**
 * Validate assessment requirements based on coach levels
 */
export function validateAssessmentRequirements(assessments: CoachAssessment[]): {
  isValid: boolean;
  reason?: string;
  requiresHigherLevelValidation?: boolean;
} {
  if (assessments.length === 0) {
    return { isValid: false, reason: "No assessments provided" };
  }

  const maxLevel = Math.max(...assessments.map(a => a.coachLevel));
  const hasL3Plus = assessments.some(a => a.coachLevel >= 3);
  const hasL4Plus = assessments.some(a => a.coachLevel >= 4);

  // Single assessment validation
  if (assessments.length === 1) {
    const assessment = assessments[0];
    const daysSince = Math.floor((Date.now() - assessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (assessment.coachLevel <= 2 && daysSince > 30) {
      return { 
        isValid: false, 
        reason: "L1-L2 assessments require validation from L3+ within 30 days",
        requiresHigherLevelValidation: true
      };
    }

    if (assessment.coachLevel >= 3 && daysSince > 90) {
      return { 
        isValid: false, 
        reason: "Assessment expired - L3+ assessments valid for 90 days"
      };
    }
  }

  // Multi-coach assessment validation
  if (assessments.length >= 2) {
    if (hasL3Plus || hasL4Plus) {
      return { isValid: true };
    }

    return { 
      isValid: false, 
      reason: "Multiple L1-L2 assessments require L3+ validation",
      requiresHigherLevelValidation: true
    };
  }

  return { isValid: true };
}

/**
 * Main function to calculate weighted PCP rating from multiple coach assessments
 */
export function calculateWeightedPCP(assessments: CoachAssessment[]): WeightedPCPResult {
  // Validate assessment requirements
  const validation = validateAssessmentRequirements(assessments);
  if (!validation.isValid) {
    throw new Error(`Assessment validation failed: ${validation.reason}`);
  }

  const categories = ['technical', 'tactical', 'physical', 'mental'] as const;
  const categoryWeightedScores: Record<string, number> = {};
  const categoryWeights: Record<string, number> = {};
  const categoryScores: Record<string, number[]> = {};
  const contributingAssessments: WeightedPCPResult['contributingAssessments'] = [];

  // Initialize tracking structures
  categories.forEach(category => {
    categoryWeightedScores[category] = 0;
    categoryWeights[category] = 0;
    categoryScores[category] = [];
  });

  // Process each assessment
  for (const assessment of assessments) {
    const baseWeight = getCoachLevelWeight(assessment.coachLevel);
    const confidenceFactors = getConfidenceFactors(assessment.coachLevel);
    const timeWeight = calculateTimeWeight(assessment.assessmentDate);

    let assessmentTotalWeight = 0;

    // Process each category
    for (const category of categories) {
      const categoryScore = assessment.scores[category];
      const categoryConfidence = confidenceFactors[category];
      const finalWeight = baseWeight * categoryConfidence * timeWeight;

      categoryWeightedScores[category] += categoryScore * finalWeight;
      categoryWeights[category] += finalWeight;
      categoryScores[category].push(categoryScore);
      assessmentTotalWeight += finalWeight;
    }

    // Track contributing assessment details
    contributingAssessments.push({
      coachId: assessment.coachId,
      coachLevel: assessment.coachLevel,
      weight: baseWeight,
      confidence: Object.values(confidenceFactors).reduce((sum, val) => sum + val, 0) / 4,
      recency: timeWeight
    });
  }

  // Calculate final category averages
  const categoryBreakdown: WeightedPCPResult['categoryBreakdown'] = {
    technical: categoryWeightedScores.technical / categoryWeights.technical,
    tactical: categoryWeightedScores.tactical / categoryWeights.tactical,
    physical: categoryWeightedScores.physical / categoryWeights.physical,
    mental: categoryWeightedScores.mental / categoryWeights.mental
  };

  // Calculate final PCP using standard PCP methodology with weighted scores
  const finalPCPRating = (
    categoryBreakdown.technical * 0.4 +  // 40% technical
    categoryBreakdown.tactical * 0.25 +  // 25% tactical
    categoryBreakdown.physical * 0.2 +   // 20% physical
    categoryBreakdown.mental * 0.15      // 15% mental
  );

  // Calculate quality metrics
  const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0) / 4;
  const averageCoachLevel = assessments.reduce((sum, a) => sum + a.coachLevel, 0) / assessments.length;
  const consensusScore = calculateConsensus(categoryScores);

  return {
    finalPCPRating: Math.round(finalPCPRating * 100) / 100, // 2 decimal precision
    categoryBreakdown,
    contributingAssessments,
    qualityMetrics: {
      totalWeight,
      assessmentCount: assessments.length,
      averageCoachLevel,
      consensusScore
    }
  };
}

/**
 * Utility to identify assessments requiring higher-level validation
 */
export function getAssessmentsRequiringValidation(assessments: CoachAssessment[]): CoachAssessment[] {
  return assessments.filter(assessment => {
    const daysSince = Math.floor((Date.now() - assessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
    return assessment.coachLevel <= 2 && daysSince > 30;
  });
}

/**
 * Calculate recommended next assessment timeline based on current assessments
 */
export function getNextAssessmentRecommendation(assessments: CoachAssessment[]): {
  recommendedDate: Date;
  recommendedCoachLevel: number;
  reason: string;
} {
  if (assessments.length === 0) {
    return {
      recommendedDate: new Date(),
      recommendedCoachLevel: 1,
      reason: "Initial assessment required"
    };
  }

  const latestAssessment = assessments.reduce((latest, current) => 
    current.assessmentDate > latest.assessmentDate ? current : latest
  );

  const daysSinceLatest = Math.floor((Date.now() - latestAssessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
  const maxLevel = Math.max(...assessments.map(a => a.coachLevel));

  if (maxLevel <= 2 && daysSinceLatest > 20) {
    return {
      recommendedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      recommendedCoachLevel: 3,
      reason: "L3+ validation required for L1-L2 assessments"
    };
  }

  if (maxLevel >= 3 && daysSinceLatest > 60) {
    return {
      recommendedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      recommendedCoachLevel: maxLevel,
      reason: "Regular reassessment recommended"
    };
  }

  // Standard reassessment timeline
  const nextDate = new Date(latestAssessment.assessmentDate);
  nextDate.setDate(nextDate.getDate() + (maxLevel >= 3 ? 90 : 30));

  return {
    recommendedDate: nextDate,
    recommendedCoachLevel: maxLevel,
    reason: "Scheduled reassessment"
  };
}