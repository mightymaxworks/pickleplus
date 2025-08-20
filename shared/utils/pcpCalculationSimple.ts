/**
 * Simplified PCP Calculation Utilities for Progressive Assessment
 * Type-safe implementation for Coach Dashboard integration
 */

// Weights for PCP calculation (System B: standardized across platform)
export const PCP_WEIGHTS = {
  TOUCH: 0.30,      // Dinks/Resets - Most critical
  TECHNICAL: 0.25,  // Groundstrokes/Serves 
  MENTAL: 0.20,     // Mental Game
  ATHLETIC: 0.15,   // Footwork/Fitness
  POWER: 0.10       // Volleys/Smashes
} as const;

// Complete 55-skill framework for progressive assessment
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
    'Forehand Resets', 'Backhand Resets', 'Forehand Lob', 'Backhand Lob'
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

export type CategoryName = keyof typeof SKILL_CATEGORIES;
export type SkillName = typeof SKILL_CATEGORIES[CategoryName][number];

/**
 * Get the weight for a category in PCP calculation
 */
export function getCategoryWeight(categoryName: CategoryName): number {
  switch (categoryName) {
    case 'Dinks and Resets': return PCP_WEIGHTS.TOUCH;
    case 'Groundstrokes and Serves': return PCP_WEIGHTS.TECHNICAL;
    case 'Mental Game': return PCP_WEIGHTS.MENTAL;
    case 'Footwork & Fitness': return PCP_WEIGHTS.ATHLETIC;
    case 'Volleys and Smashes': return PCP_WEIGHTS.POWER;
    default: return 0;
  }
}

/**
 * Calculate average rating for a specific category
 */
function calculateCategoryAverage(categoryName: CategoryName, assessmentData: AssessmentData): number {
  const skills = SKILL_CATEGORIES[categoryName];
  const skillRatings = skills.map(skill => assessmentData[skill]).filter(rating => rating > 0);
  
  if (skillRatings.length === 0) return 0;
  return skillRatings.reduce((sum, rating) => sum + rating, 0) / skillRatings.length;
}

export interface AssessmentData {
  [skillName: string]: number;
}

export interface PCPCalculationResult {
  pcpRating: number;
  categoryAverages: {
    touch: number;
    technical: number;
    mental: number;
    athletic: number;
    power: number;
  };
  skillCount: number;
  rawScore: number;
}

/**
 * Calculate PCP rating from assessment data
 */
export function calculatePCPRating(assessmentData: AssessmentData): PCPCalculationResult {
  const categoryAverages = {
    touch: calculateCategoryAverage('Dinks and Resets', assessmentData),
    technical: calculateCategoryAverage('Groundstrokes and Serves', assessmentData),
    mental: calculateCategoryAverage('Mental Game', assessmentData),
    athletic: calculateCategoryAverage('Footwork & Fitness', assessmentData),
    power: calculateCategoryAverage('Volleys and Smashes', assessmentData)
  };

  // Calculate weighted average
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
 * Get category weight for display
 */
export function getCategoryWeight(category: CategoryName): number {
  const weightMap: Record<CategoryName, number> = {
    'Touch': PCP_WEIGHTS.TOUCH,
    'Technical': PCP_WEIGHTS.TECHNICAL,
    'Mental': PCP_WEIGHTS.MENTAL,
    'Athletic': PCP_WEIGHTS.ATHLETIC,
    'Power': PCP_WEIGHTS.POWER
  };
  
  return weightMap[category];
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