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
  ratingStatus: 'PROVISIONAL' | 'CONFIRMED';
  statusReason: string;
  daysUntilExpiration?: number;
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
    hasL4PlusValidation: boolean;
    highestCoachLevel: number;
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
 * Validate assessment requirements and determine rating status
 */
export function validateAssessmentRequirements(assessments: CoachAssessment[]): {
  isValid: boolean;
  reason?: string;
  requiresHigherLevelValidation?: boolean;
  ratingStatus: 'PROVISIONAL' | 'CONFIRMED';
  statusReason: string;
  daysUntilExpiration?: number;
} {
  if (assessments.length === 0) {
    return { 
      isValid: false, 
      reason: "No assessments provided",
      ratingStatus: 'PROVISIONAL',
      statusReason: "No assessments available"
    };
  }

  const maxLevel = Math.max(...assessments.map(a => a.coachLevel));
  const hasL4Plus = assessments.some(a => a.coachLevel >= 4);
  const latestAssessment = assessments.reduce((latest, current) => 
    current.assessmentDate > latest.assessmentDate ? current : latest
  );
  const daysSinceLatest = Math.floor((Date.now() - latestAssessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));

  // CONFIRMED RATING: Requires L4+ coach assessment
  if (hasL4Plus) {
    const l4PlusAssessments = assessments.filter(a => a.coachLevel >= 4);
    const latestL4Plus = l4PlusAssessments.reduce((latest, current) => 
      current.assessmentDate > latest.assessmentDate ? current : latest
    );
    const daysSinceL4Plus = Math.floor((Date.now() - latestL4Plus.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceL4Plus > 120) {
      return {
        isValid: false,
        reason: "L4+ assessment expired - confirmed ratings valid for 120 days",
        ratingStatus: 'PROVISIONAL',
        statusReason: "L4+ confirmation expired",
        daysUntilExpiration: 0
      };
    }

    return {
      isValid: true,
      ratingStatus: 'CONFIRMED',
      statusReason: `Confirmed by L${latestL4Plus.coachLevel} coach`,
      daysUntilExpiration: 120 - daysSinceL4Plus
    };
  }

  // PROVISIONAL RATING: L1-L3 assessments only
  const maxProvisionalDays = maxLevel <= 2 ? 60 : 90; // L3 gets longer provisional period
  
  if (daysSinceLatest > maxProvisionalDays) {
    return {
      isValid: false,
      reason: `Provisional rating expired - L${maxLevel} assessments valid for ${maxProvisionalDays} days`,
      requiresHigherLevelValidation: true,
      ratingStatus: 'PROVISIONAL',
      statusReason: "Provisional rating expired - requires L4+ confirmation",
      daysUntilExpiration: 0
    };
  }

  return {
    isValid: true,
    requiresHigherLevelValidation: true,
    ratingStatus: 'PROVISIONAL',
    statusReason: `Provisional rating - requires L4+ coach confirmation`,
    daysUntilExpiration: maxProvisionalDays - daysSinceLatest
  };
}

/**
 * Main function to calculate weighted PCP rating from multiple coach assessments
 */
export function calculateWeightedPCP(assessments: CoachAssessment[]): WeightedPCPResult {
  // Validate assessment requirements
  const assessmentValidation = validateAssessmentRequirements(assessments);
  if (!assessmentValidation.isValid) {
    throw new Error(`Assessment validation failed: ${assessmentValidation.reason}`);
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

  // Get rating status from validation
  const ratingValidation = validateAssessmentRequirements(assessments);

  // Calculate quality metrics
  const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0) / 4;
  const averageCoachLevel = assessments.reduce((sum, a) => sum + a.coachLevel, 0) / assessments.length;
  const consensusScore = calculateConsensus(categoryScores);
  const hasL4PlusValidation = assessments.some(a => a.coachLevel >= 4);
  const highestCoachLevel = Math.max(...assessments.map(a => a.coachLevel));

  return {
    finalPCPRating: Math.round(finalPCPRating * 100) / 100, // 2 decimal precision
    ratingStatus: ratingValidation.ratingStatus,
    statusReason: ratingValidation.statusReason,
    daysUntilExpiration: ratingValidation.daysUntilExpiration,
    categoryBreakdown,
    contributingAssessments,
    qualityMetrics: {
      totalWeight,
      assessmentCount: assessments.length,
      averageCoachLevel,
      consensusScore,
      hasL4PlusValidation,
      highestCoachLevel
    }
  };
}

/**
 * Utility to identify assessments requiring higher-level validation
 */
export function getAssessmentsRequiringValidation(assessments: CoachAssessment[]): CoachAssessment[] {
  return assessments.filter(assessment => {
    const daysSince = Math.floor((Date.now() - assessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
    const maxDays = assessment.coachLevel <= 2 ? 60 : 90;
    return assessment.coachLevel <= 3 && daysSince > maxDays;
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
      recommendedCoachLevel: 4,
      reason: "Initial L4+ assessment required for confirmed rating"
    };
  }

  const latestAssessment = assessments.reduce((latest, current) => 
    current.assessmentDate > latest.assessmentDate ? current : latest
  );

  const daysSinceLatest = Math.floor((Date.now() - latestAssessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
  const maxLevel = Math.max(...assessments.map(a => a.coachLevel));
  const hasL4Plus = assessments.some(a => a.coachLevel >= 4);

  // If no L4+ assessment exists, recommend L4+ for confirmation
  if (!hasL4Plus) {
    return {
      recommendedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      recommendedCoachLevel: 4,
      reason: "L4+ assessment required to confirm provisional rating"
    };
  }

  // If L4+ assessment is expiring soon
  const l4PlusAssessments = assessments.filter(a => a.coachLevel >= 4);
  const latestL4Plus = l4PlusAssessments.reduce((latest, current) => 
    current.assessmentDate > latest.assessmentDate ? current : latest
  );
  const daysSinceL4Plus = Math.floor((Date.now() - latestL4Plus.assessmentDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceL4Plus > 90) {
    return {
      recommendedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      recommendedCoachLevel: 4,
      reason: "L4+ reassessment needed to maintain confirmed status"
    };
  }

  // Standard reassessment timeline
  const nextDate = new Date(latestL4Plus.assessmentDate);
  nextDate.setDate(nextDate.getDate() + 120);

  return {
    recommendedDate: nextDate,
    recommendedCoachLevel: 4,
    reason: "Scheduled L4+ reassessment to maintain confirmed rating"
  };
}