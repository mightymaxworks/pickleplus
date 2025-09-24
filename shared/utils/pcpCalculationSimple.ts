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
 * Calculate PCP rating using dynamic progressive weighting system
 * Algorithm: PCP = 2.0 + (weighted_average - 1.0) * (6.0/9.0)
 * Range: 2.0 to 8.0
 */
export function calculatePCPFromAssessment(
  assessmentData: AssessmentData, 
  context?: { currentPCP?: number; previousPCP?: number }
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
  const pcpRating = 2.0 + (rawScore - 1.0) * (6.0 / 9.0);

  return {
    pcpRating: Math.round(pcpRating * 100) / 100, // 2 decimal places
    categoryAverages,
    skillCount: Object.keys(assessmentData).length,
    rawScore,
    weightLevel,
    weightsUsed: weights
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