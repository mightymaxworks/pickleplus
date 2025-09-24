/**
 * PCP (Player Competency Profile) Rating Calculation
 * 55-Skill Individual Tracking System
 */

// PCP Dynamic Category Weights - Progressive based on player level
export const DYNAMIC_PCP_WEIGHTS = {
  BEGINNER: {     // PCP < 3.0 - Foundation Phase
    TECHNICAL: 0.45,  // Must master fundamentals first
    ATHLETIC: 0.25,   // Movement foundation critical
    TOUCH: 0.15,      // Basic dinking introduction
    MENTAL: 0.10,     // Simple focus concepts
    POWER: 0.05       // Not relevant yet
  },
  INTERMEDIATE: { // PCP 3.0-4.0 - Development Phase
    TECHNICAL: 0.35,  // Still refining fundamentals
    TOUCH: 0.25,      // Soft game becoming important
    ATHLETIC: 0.20,   // Better movement patterns
    MENTAL: 0.15,     // Basic strategy awareness
    POWER: 0.05       // Still minimal
  },
  ADVANCED: {     // PCP 4.0-5.0 - Touch-Dominant Phase
    TOUCH: 0.45,      // TOUCH BECOMES DOMINANT - soft game mastery critical
    MENTAL: 0.25,     // Strategy & psychology important
    ATHLETIC: 0.15,   // Fitness enables touch execution
    POWER: 0.10,      // Tactical power usage
    TECHNICAL: 0.05   // MICRO WEIGHTAGE - fundamentals already mastered
  },
  EXPERT: {       // PCP 5.0-6.0 - Touch Mastery + Mental
    TOUCH: 0.50,      // TOUCH MASTERY - separation factor at elite level
    MENTAL: 0.30,     // Psychology of winning critical
    ATHLETIC: 0.15,   // Peak physical performance
    POWER: 0.03,      // Precise tactical power
    TECHNICAL: 0.02   // MICRO WEIGHTAGE - perfected fundamentals
  },
  MASTER: {       // PCP 6.0+ - Touch Perfection + Mental Toughness
    TOUCH: 0.55,      // TOUCH PERFECTION - ultimate differentiator
    MENTAL: 0.30,     // Elite mental game
    ATHLETIC: 0.14,   // Peak conditioning
    POWER: 0.01,      // Surgical precision only
    TECHNICAL: 0.00   // ZERO - completely mastered
  }
};

// Legacy static weights for backward compatibility
export const PCP_WEIGHTS = DYNAMIC_PCP_WEIGHTS.INTERMEDIATE;

// 55-Skill Categories
export const SKILL_CATEGORIES = {
  'Groundstrokes and Serves': [
    'Serve Power', 'Serve Placement', 'Forehand Flat Drive', 'Forehand Topspin Drive', 
    'Forehand Slice', 'Backhand Flat Drive', 'Backhand Topspin Drive', 'Backhand Slice',
    'Third Shot Drive', 'Forehand Return of Serve', 'Backhand Return of Serve'
  ],
  'Dinks and Resets': [
    'Forehand Topspin Dink', 'Forehand Dead Dink', 'Forehand Slice Dink',
    'Backhand Topspin Dink', 'Backhand Dead Dink', 'Backhand Slice Dink',
    'Forehand Third Shot Drop', 'Forehand Top Spin Third Shot Drop', 'Forehand Slice Third Shot Drop',
    'Backhand Third Shot Drop', 'Backhand Top Spin Third Shot Drop', 'Backhand Slice Third Shot Drop',
    'Forehand Resets', 'Backhand Resets', 'Forehand Lob', 'Backhand Lob',
    'Cross-Court Dinks', 'Kitchen Line Positioning'
  ],
  'Volleys and Smashes': [
    'Forehand Punch Volley', 'Forehand Roll Volley', 'Backhand Punch Volley',
    'Backhand Roll Volley', 'Forehand Overhead Smash', 'Backhand Overhead Smash'
  ],
  'Footwork & Fitness': [
    'Split Step Readiness', 'Lateral Shuffles', 'Crossover Steps', 'Court Recovery',
    'First Step Speed', 'Balance & Core Stability', 'Agility', 'Endurance Conditioning',
    'Leg Strength & Power', 'Transition Speed (Baseline to Kitchen)'
  ],
  'Mental Game': [
    'Staying Present', 'Resetting After Errors', 'Patience & Shot Selection', 'Positive Self-Talk',
    'Visualization', 'Pressure Handling', 'Focus Shifts', 'Opponent Reading',
    'Emotional Regulation', 'Competitive Confidence'
  ]
} as const;

// Type definitions
export type CategoryName = keyof typeof SKILL_CATEGORIES;
export type SkillName = typeof SKILL_CATEGORIES[CategoryName][number];
export type AssessmentData = Record<string, number>;

/**
 * Calculate average rating for a skill category
 */
function calculateCategoryAverage(category: CategoryName, assessmentData: AssessmentData): number {
  const categorySkills = SKILL_CATEGORIES[category];
  const ratings = categorySkills
    .map(skill => assessmentData[skill])
    .filter(rating => rating !== undefined && rating > 0);

  if (ratings.length === 0) return 1; // Default to minimum if no ratings

  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

// Skill floors prevent major backtracking once players reach weight level thresholds
export const SKILL_FLOORS = {
  BEGINNER: 0,      // No floor - can start anywhere
  INTERMEDIATE: 2.8, // Once you reach intermediate, floor at 2.8
  ADVANCED: 3.8,    // Once touch becomes dominant, floor at 3.8
  EXPERT: 4.8,      // Touch mastery achieved, floor at 4.8
  MASTER: 5.8       // Elite level achieved, floor at 5.8
} as const;

// Coach Level Weightings - Impact on player rating assessments
export const COACH_LEVEL_WEIGHTS = {
  1: 0.7,   // L1: Limited experience, reduced weighting
  2: 1.0,   // L2: Standard weighting baseline
  3: 1.8,   // L3: Experienced coach, higher trust
  4: 3.2,   // L4: Expert coach, significant authority
  5: 3.8    // L5: Master coach, maximum authority
} as const;

/**
 * Determine PCP weight level based on current or previous PCP rating
 */
function getPCPWeightLevel(currentPCP?: number, previousPCP?: number): keyof typeof DYNAMIC_PCP_WEIGHTS {
  // Use previous PCP for context if available, otherwise use estimated level
  const referencePCP = previousPCP || currentPCP || 2.5; // Default to beginner if no context
  
  if (referencePCP < 3.0) return 'BEGINNER';
  if (referencePCP < 4.0) return 'INTERMEDIATE';  
  if (referencePCP < 5.0) return 'ADVANCED';
  if (referencePCP < 6.0) return 'EXPERT';
  return 'MASTER';
}

/**
 * Apply skill floor protection to prevent major backtracking
 */
function applySkillFloor(newPCP: number, previousPCP: number, weightLevel: keyof typeof DYNAMIC_PCP_WEIGHTS): number {
  const floor = SKILL_FLOORS[weightLevel];
  
  // Apply skill floor - players cannot drop below their achieved level threshold
  const flooredPCP = Math.max(newPCP, floor);
  
  // Allow minor decline but prevent major regression (max 0.3 points per assessment)
  const maxDeclinePerAssessment = 0.3;
  const minimumAllowed = Math.max(floor, previousPCP - maxDeclinePerAssessment);
  
  return Math.max(flooredPCP, minimumAllowed);
}

/**
 * Calculate PCP rating with coach level weighting and skill floor protection
 * Algorithm: PCP = 2.0 + (weighted_average - 1.0) * (6.0/9.0)
 * Range: 2.0 to 8.0
 */
export function calculatePCPFromAssessment(
  assessmentData: AssessmentData, 
  context?: { 
    currentPCP?: number; 
    previousPCP?: number;
    coachLevel?: 1 | 2 | 3 | 4 | 5;
    assessmentMode?: 'quick' | 'full';
  }
) {
  // Calculate category averages from individual skills
  const categoryAverages = {
    touch: calculateCategoryAverage('Dinks and Resets', assessmentData),
    technical: calculateCategoryAverage('Groundstrokes and Serves', assessmentData),
    mental: calculateCategoryAverage('Mental Game', assessmentData),
    athletic: calculateCategoryAverage('Footwork & Fitness', assessmentData),
    power: calculateCategoryAverage('Volleys and Smashes', assessmentData)
  };

  // Determine appropriate weight level based on player progression
  const weightLevel = getPCPWeightLevel(context?.currentPCP, context?.previousPCP);
  const weights = DYNAMIC_PCP_WEIGHTS[weightLevel];

  // Calculate weighted average using dynamic weights
  const rawScore = (
    categoryAverages.touch * weights.TOUCH +
    categoryAverages.technical * weights.TECHNICAL +
    categoryAverages.mental * weights.MENTAL +
    categoryAverages.athletic * weights.ATHLETIC +
    categoryAverages.power * weights.POWER
  );

  // Convert to PCP rating scale (2.0 to 8.0)
  let pcpRating = 2.0 + (rawScore - 1.0) * (6.0 / 9.0);

  // Apply coach level weighting to the assessment
  const coachLevel = context?.coachLevel || 2; // Default to L2 (1.0x)
  const coachWeight = COACH_LEVEL_WEIGHTS[coachLevel];
  
  // Coach weighting affects the confidence/impact of the assessment
  // Higher level coaches have more authority in rating changes
  const assessmentImpact = coachWeight;
  
  // If there's a previous PCP, blend the new assessment with coach authority
  if (context?.previousPCP) {
    // Higher level coaches can make bigger changes, lower level coaches make smaller changes
    const changeAmount = (pcpRating - context.previousPCP) * assessmentImpact;
    pcpRating = context.previousPCP + changeAmount;
    
    // Apply skill floor protection
    pcpRating = applySkillFloor(pcpRating, context.previousPCP, weightLevel);
  }

  // Apply assessment mode modifier (quick vs full assessment)
  const assessmentMode = context?.assessmentMode || 'full';
  const modeModifier = assessmentMode === 'quick' ? 0.85 : 1.0; // Quick mode 15% penalty
  
  // Final PCP rating with all modifiers applied
  const finalPCP = Math.round(pcpRating * modeModifier * 100) / 100;

  return {
    pcpRating: finalPCP,
    rawPcpBeforeModifiers: Math.round(pcpRating * 100) / 100,
    categoryAverages,
    skillCount: Object.keys(assessmentData).length,
    rawScore,
    weightLevel,
    weightsUsed: weights,
    coachLevel,
    coachWeight: assessmentImpact,
    assessmentMode,
    modeModifier,
    skillFloorApplied: context?.previousPCP ? pcpRating !== (context.previousPCP + (pcpRating - context.previousPCP) * assessmentImpact) : false
  };
}

/**
 * Calculate multi-coach weighted PCP from multiple assessments
 * Implements time decay and coach level weighting aggregation
 */
export function calculateMultiCoachWeightedPCP(
  assessments: Array<{
    pcpRating: number;
    coachLevel: 1 | 2 | 3 | 4 | 5;
    assessmentDate: Date;
    assessmentMode: 'quick' | 'full';
  }>,
  timeWindowDays: number = 180
): {
  weightedPCP: number;
  confidenceScore: number;
  assessmentSummary: {
    totalAssessments: number;
    highestCoachLevel: number;
    timeSpan: number;
    averageCoachLevel: number;
  };
} {
  if (assessments.length === 0) {
    throw new Error('NO_ASSESSMENTS: Cannot calculate PCP without assessment data');
  }

  const currentDate = new Date();
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const assessment of assessments) {
    // Time decay calculation (linear decay over time window)
    const daysSinceAssessment = Math.floor(
      (currentDate.getTime() - assessment.assessmentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeDecayFactor = Math.max(0.5, 1 - (daysSinceAssessment / timeWindowDays)); // Min 0.5, max 1.0

    // Coach level weighting
    const coachWeight = COACH_LEVEL_WEIGHTS[assessment.coachLevel];

    // Assessment mode adjustment
    const modeMultiplier = assessment.assessmentMode === 'full' ? 1.0 : 0.85; // 15% penalty for quick mode

    // Calculate final weight for this assessment
    const finalWeight = timeDecayFactor * coachWeight * modeMultiplier;

    totalWeightedScore += assessment.pcpRating * finalWeight;
    totalWeight += finalWeight;
  }

  const weightedPCP = totalWeightedScore / totalWeight;
  
  // Calculate confidence score based on assessment quality
  const highestCoachLevel = Math.max(...assessments.map(a => a.coachLevel));
  const averageCoachLevel = assessments.reduce((sum, a) => sum + a.coachLevel, 0) / assessments.length;
  const fullAssessmentRatio = assessments.filter(a => a.assessmentMode === 'full').length / assessments.length;
  
  // Confidence increases with higher coach levels, more assessments, and full assessment ratio
  const confidenceScore = Math.min(0.98, 
    0.3 + // Base confidence
    (averageCoachLevel / 5) * 0.4 + // Coach level component (0-0.4)
    Math.min(assessments.length / 5, 1) * 0.2 + // Assessment count component (0-0.2)
    fullAssessmentRatio * 0.08 // Full assessment bonus (0-0.08)
  );

  return {
    weightedPCP: Math.round(weightedPCP * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    assessmentSummary: {
      totalAssessments: assessments.length,
      highestCoachLevel,
      timeSpan: timeWindowDays,
      averageCoachLevel: Math.round(averageCoachLevel * 10) / 10
    }
  };
}

/**
 * Calculate PCP rating from assessment data using legacy static weights
 * For backward compatibility - use calculatePCPFromAssessment for new implementations
 */
export function calculatePCPFromAssessmentLegacy(assessmentData: AssessmentData) {
  // Calculate category averages from individual skills
  const categoryAverages = {
    touch: calculateCategoryAverage('Dinks and Resets', assessmentData),
    technical: calculateCategoryAverage('Groundstrokes and Serves', assessmentData),
    mental: calculateCategoryAverage('Mental Game', assessmentData),
    athletic: calculateCategoryAverage('Footwork & Fitness', assessmentData),
    power: calculateCategoryAverage('Volleys and Smashes', assessmentData)
  };

  // Calculate weighted average using static weights
  const rawScore = (
    categoryAverages.touch * PCP_WEIGHTS.TOUCH +
    categoryAverages.technical * PCP_WEIGHTS.TECHNICAL +
    categoryAverages.mental * PCP_WEIGHTS.MENTAL +
    categoryAverages.athletic * PCP_WEIGHTS.ATHLETIC +
    categoryAverages.power * PCP_WEIGHTS.POWER
  );

  // Convert to PCP rating scale (2.0 to 8.0)
  const pcpRating = 2.0 + (rawScore - 1.0) * (6.0 / 9.0);

  return {
    pcpRating: Math.round(pcpRating * 100) / 100, // 2 decimal places
    categoryAverages,
    skillCount: Object.keys(assessmentData).length,
    rawScore
  };
}

/**
 * Get category weight for display
 */
export function getCategoryWeight(category: CategoryName): number {
  const weightMap: Record<CategoryName, number> = {
    'Dinks and Resets': PCP_WEIGHTS.TOUCH,
    'Groundstrokes and Serves': PCP_WEIGHTS.TECHNICAL,
    'Mental Game': PCP_WEIGHTS.MENTAL,
    'Footwork & Fitness': PCP_WEIGHTS.ATHLETIC,
    'Volleys and Smashes': PCP_WEIGHTS.POWER
  };
  
  return weightMap[category] || 0;
}

/**
 * Generate sample assessment data for testing
 */
export function generateSampleAssessment(baseRating: number = 5): AssessmentData {
  const assessmentData: AssessmentData = {};
  
  Object.values(SKILL_CATEGORIES).flat().forEach(skillName => {
    // Add variation (±2 points from base)
    const variation = Math.floor(Math.random() * 5) - 2;
    const rating = Math.max(1, Math.min(10, baseRating + variation));
    assessmentData[skillName] = rating;
  });
  
  return assessmentData;
}

// Alternative export name for backward compatibility
export const calculatePCPRating = calculatePCPFromAssessment;