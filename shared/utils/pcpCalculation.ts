/**
 * PCP Rating Calculation Utilities
 * 
 * Official implementation of the UDF-compliant PCP rating algorithm.
 * This is the ONLY authorized source for PCP calculations.
 * 
 * Reference: PCP_RATING_CALCULATION_ALGORITHM.md
 * UDF Compliance: UNIFIED_DEVELOPMENT_FRAMEWORK_BEST_PRACTICES.md
 */

// UDF-Mandated Weights (DO NOT MODIFY without UDF documentation update)
export const PCP_WEIGHTS = {
  TOUCH: 0.30,      // Dinks/Resets - Most critical for competitive play
  TECHNICAL: 0.25,  // Groundstrokes/Serves - Foundation skills
  MENTAL: 0.20,     // Mental Game - Separates good from great players
  ATHLETIC: 0.15,   // Footwork/Fitness - Enables all other skills
  POWER: 0.10       // Volleys/Smashes - Important but situational
} as const;

// Official 55-Skill Categories Mapping with proper TypeScript typing
export const SKILL_CATEGORIES = {
  'Groundstrokes and Serves': [
    'Serve Power', 'Serve Placement', 'Forehand Flat Drive', 'Forehand Topspin Drive',
    'Forehand Slice', 'Backhand Flat Drive', 'Backhand Topspin Drive', 'Backhand Slice',
    'Third Shot Drive', 'Forehand Return of Serve', 'Backhand Return of Serve'
  ],
  'Dinks and Resets': [
    'Forehand Topspin Dink', 'Forehand Dead Dink', 'Forehand Slice Dink', 'Backhand Topspin Dink',
    'Backhand Dead Dink', 'Backhand Slice Dink', 'Forehand Third Shot Drop', 'Forehand Top Spin Third Shot Drop',
    'Forehand Slice Third Shot Drop', 'Backhand Third Shot Drop', 'Backhand Top Spin Third Shot Drop',
    'Backhand Slice Third Shot Drop', 'Forehand Resets', 'Backhand Resets', 'Forehand Lob', 'Backhand Lob'
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

export type SkillCategoryName = keyof typeof SKILL_CATEGORIES;
export type SkillName = typeof SKILL_CATEGORIES[SkillCategoryName][number];

export interface AssessmentData {
  [skillName: string]: number; // 1-10 rating
}

export interface CategoryAverages {
  technical: number;
  touch: number;
  power: number;
  athletic: number;
  mental: number;
}

export interface IndividualSkillRating {
  currentRating: number;
  lastAssessed: string;
  assessmentCount: number;
  lastCoachId?: number;
  trendDirection?: 'improving' | 'stable' | 'declining';
  monthlyChange?: number;
}

export interface PlayerSkillProfile {
  [skillName: string]: IndividualSkillRating;
}

export interface PCPCalculationResult {
  pcpRating: number;
  rawWeightedScore: number;
  categoryAverages: CategoryAverages;
  calculationTimestamp: string;
  totalSkillsAssessed: number;
  isComplete: boolean; // All 55 skills present
  skillFreshness: SkillFreshnessInfo;
  confidenceScore: number;
}

export interface SkillFreshnessInfo {
  touch: CategoryFreshness;
  technical: CategoryFreshness;
  power: CategoryFreshness;
  athletic: CategoryFreshness;
  mental: CategoryFreshness;
}

export interface CategoryFreshness {
  oldestAssessment: string;
  daysSince: number;
  status: 'current' | 'aging' | 'stale';
  skillsNeedingUpdate: string[];
}

/**
 * Calculate the average rating for a specific skill category
 * 
 * @param assessmentData - Object containing skill name -> rating mappings
 * @param categoryName - Name of the category to calculate average for
 * @returns Average rating for the category (0 if no skills found)
 */
export function calculateCategoryAverage(
  assessmentData: AssessmentData, 
  categoryName: SkillCategoryName
): number {
  const categorySkills = SKILL_CATEGORIES[categoryName];
  let totalScore = 0;
  let skillCount = 0;
  
  categorySkills.forEach(skillName => {
    if (assessmentData[skillName] !== undefined && assessmentData[skillName] !== null) {
      const rating = assessmentData[skillName];
      
      // Validate rating is within valid range
      if (rating >= 1 && rating <= 10) {
        totalScore += rating;
        skillCount++;
      }
    }
  });
  
  return skillCount > 0 ? totalScore / skillCount : 0;
}

/**
 * Validate that assessment data contains all required skills
 * 
 * @param assessmentData - Assessment data to validate
 * @returns Object with validation results
 */
export function validateAssessmentData(assessmentData: AssessmentData): {
  isValid: boolean;
  missingSkills: string[];
  invalidRatings: string[];
  totalSkills: number;
} {
  const missingSkills: string[] = [];
  const invalidRatings: string[] = [];
  let totalSkills = 0;
  
  Object.values(SKILL_CATEGORIES).flat().forEach(skillName => {
    totalSkills++;
    
    if (assessmentData[skillName] === undefined || assessmentData[skillName] === null) {
      missingSkills.push(skillName);
    } else {
      const rating = assessmentData[skillName];
      if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        invalidRatings.push(`${skillName}: ${rating}`);
      }
    }
  });
  
  return {
    isValid: missingSkills.length === 0 && invalidRatings.length === 0,
    missingSkills,
    invalidRatings,
    totalSkills
  };
}

/**
 * Calculate PCP rating using the official UDF algorithm
 * 
 * @param assessmentData - Complete 55-skill assessment data
 * @returns Comprehensive calculation result with audit trail
 */
export function calculatePCPRating(assessmentData: AssessmentData): PCPCalculationResult {
  const calculationTimestamp = new Date().toISOString();
  
  // Validate input data
  const validation = validateAssessmentData(assessmentData);
  
  // Calculate category averages
  const categoryAverages: CategoryAverages = {
    technical: calculateCategoryAverage(assessmentData, 'Groundstrokes and Serves'),
    touch: calculateCategoryAverage(assessmentData, 'Dinks and Resets'),
    power: calculateCategoryAverage(assessmentData, 'Volleys and Smashes'),
    athletic: calculateCategoryAverage(assessmentData, 'Footwork & Fitness'),
    mental: calculateCategoryAverage(assessmentData, 'Mental Game')
  };
  
  // Apply UDF-mandated weighted calculation
  const rawWeightedScore = (
    categoryAverages.touch * PCP_WEIGHTS.TOUCH +
    categoryAverages.technical * PCP_WEIGHTS.TECHNICAL +
    categoryAverages.mental * PCP_WEIGHTS.MENTAL +
    categoryAverages.athletic * PCP_WEIGHTS.ATHLETIC +
    categoryAverages.power * PCP_WEIGHTS.POWER
  );
  
  // Scale to PCP range (2.0 - 8.0) using official formula
  const pcpRating = 2.0 + (rawWeightedScore - 1.0) * (6.0 / 9.0);
  
  // Round to exactly 1 decimal place (UDF requirement)
  const finalPCPRating = Math.round(pcpRating * 10) / 10;
  
  return {
    pcpRating: finalPCPRating,
    rawWeightedScore: Math.round(rawWeightedScore * 100) / 100, // 2 decimal places
    categoryAverages,
    calculationTimestamp,
    totalSkillsAssessed: validation.totalSkills - validation.missingSkills.length,
    isComplete: validation.isValid,
    skillFreshness: calculateSkillFreshness(assessmentData),
    confidenceScore: calculateConfidenceScore(assessmentData)
  };
}

/**
 * Generate detailed breakdown of PCP calculation for transparency
 * 
 * @param result - PCP calculation result
 * @returns Human-readable calculation breakdown
 */
export function generatePCPBreakdown(result: PCPCalculationResult): string {
  const { categoryAverages, rawWeightedScore, pcpRating } = result;
  
  return `
PCP Rating Calculation Breakdown:
================================

Category Averages:
• Touch (Dinks/Resets): ${categoryAverages.touch.toFixed(1)} × ${PCP_WEIGHTS.TOUCH} = ${(categoryAverages.touch * PCP_WEIGHTS.TOUCH).toFixed(2)}
• Technical (Groundstrokes/Serves): ${categoryAverages.technical.toFixed(1)} × ${PCP_WEIGHTS.TECHNICAL} = ${(categoryAverages.technical * PCP_WEIGHTS.TECHNICAL).toFixed(2)}
• Mental Game: ${categoryAverages.mental.toFixed(1)} × ${PCP_WEIGHTS.MENTAL} = ${(categoryAverages.mental * PCP_WEIGHTS.MENTAL).toFixed(2)}
• Athletic (Footwork/Fitness): ${categoryAverages.athletic.toFixed(1)} × ${PCP_WEIGHTS.ATHLETIC} = ${(categoryAverages.athletic * PCP_WEIGHTS.ATHLETIC).toFixed(2)}
• Power (Volleys/Smashes): ${categoryAverages.power.toFixed(1)} × ${PCP_WEIGHTS.POWER} = ${(categoryAverages.power * PCP_WEIGHTS.POWER).toFixed(2)}

Raw Weighted Score: ${rawWeightedScore}
Final PCP Rating: ${pcpRating} (scaled from 1-10 range to 2.0-8.0 range)

Skills Assessed: ${result.totalSkillsAssessed}/55
Complete Assessment: ${result.isComplete ? 'Yes' : 'No'}
Calculated: ${result.calculationTimestamp}
  `.trim();
}

/**
 * Create sample assessment data for testing purposes
 * 
 * @param baseRating - Base rating to use (will add random variation)
 * @returns Complete 55-skill assessment data
 */
export function createSampleAssessmentData(baseRating: number = 6): AssessmentData {
  const assessmentData: AssessmentData = {};
  
  Object.values(SKILL_CATEGORIES).flat().forEach(skillName => {
    // Add some realistic variation (±2 points from base)
    const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const rating = Math.max(1, Math.min(10, baseRating + variation));
    assessmentData[skillName] = rating;
  });
  
  return assessmentData;
}

// Progressive assessment helper functions
export function calculatePCPRatingFromProfile(skillProfile: PlayerSkillProfile): PCPCalculationResult {
  // Convert skill profile to assessment data format
  const assessmentData: AssessmentData = {};
  
  for (const [skillName, skillRating] of Object.entries(skillProfile)) {
    assessmentData[skillName] = skillRating.currentRating;
  }
  
  return calculatePCPRating(assessmentData);
}

export function calculateSkillFreshness(assessmentData: AssessmentData): SkillFreshnessInfo {
  const now = new Date();
  
  const calculateCategoryFreshness = (categoryName: string): CategoryFreshness => {
    const categorySkills = SKILL_CATEGORIES[categoryName] || [];
    const skillsNeedingUpdate: string[] = [];
    let oldestAssessment = now.toISOString();
    let maxDays = 0;
    
    categorySkills.forEach(skill => {
      if (assessmentData[skill]) {
        // For basic implementation, assume all skills are fresh (would be enhanced with actual timestamps)
        const daysSince = 0; // Would calculate from actual assessment date
        if (daysSince > 90) skillsNeedingUpdate.push(skill);
        if (daysSince > maxDays) {
          maxDays = daysSince;
          oldestAssessment = now.toISOString(); // Would use actual assessment date
        }
      }
    });
    
    let status: 'current' | 'aging' | 'stale' = 'current';
    if (maxDays > 180) status = 'stale';
    else if (maxDays > 90) status = 'aging';
    
    return {
      oldestAssessment,
      daysSince: maxDays,
      status,
      skillsNeedingUpdate
    };
  };
  
  return {
    touch: calculateCategoryFreshness('Dinks and Resets'),
    technical: calculateCategoryFreshness('Groundstrokes and Serves'),
    power: calculateCategoryFreshness('Volleys and Smashes'),
    athletic: calculateCategoryFreshness('Footwork & Fitness'),
    mental: calculateCategoryFreshness('Mental Game')
  };
}

export function calculateSkillFreshnessFromProfile(skillProfile: PlayerSkillProfile): SkillFreshnessInfo {
  const now = new Date();
  
  const calculateCategoryFreshness = (categoryName: string): CategoryFreshness => {
    const categorySkills = SKILL_CATEGORIES[categoryName] || [];
    const skillsNeedingUpdate: string[] = [];
    let oldestAssessment = now.toISOString();
    let maxDays = 0;
    
    categorySkills.forEach(skill => {
      const skillData = skillProfile[skill];
      if (skillData) {
        const assessmentDate = new Date(skillData.lastAssessed);
        const daysSince = Math.floor((now.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince > 90) skillsNeedingUpdate.push(skill);
        if (daysSince > maxDays) {
          maxDays = daysSince;
          oldestAssessment = skillData.lastAssessed;
        }
      }
    });
    
    let status: 'current' | 'aging' | 'stale' = 'current';
    if (maxDays > 180) status = 'stale';
    else if (maxDays > 90) status = 'aging';
    
    return {
      oldestAssessment,
      daysSince: maxDays,
      status,
      skillsNeedingUpdate
    };
  };
  
  return {
    touch: calculateCategoryFreshness('Dinks and Resets'),
    technical: calculateCategoryFreshness('Groundstrokes and Serves'),
    power: calculateCategoryFreshness('Volleys and Smashes'),
    athletic: calculateCategoryFreshness('Footwork & Fitness'),
    mental: calculateCategoryFreshness('Mental Game')
  };
}

export function calculateConfidenceScore(assessmentData: AssessmentData): number {
  const totalSkills = 55;
  const assessedSkills = Object.keys(assessmentData).length;
  const completeness = assessedSkills / totalSkills;
  
  // Base confidence on completeness (would be enhanced with freshness data)
  return Math.round(completeness * 100) / 100;
}

export function calculateConfidenceScoreFromProfile(skillProfile: PlayerSkillProfile): number {
  const totalSkills = 55;
  const assessedSkills = Object.keys(skillProfile).length;
  const now = new Date();
  
  let freshnessScore = 0;
  let totalWeight = 0;
  
  Object.values(skillProfile).forEach(skill => {
    const assessmentDate = new Date(skill.lastAssessed);
    const daysSince = Math.floor((now.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Fresh assessments (0-30 days): weight 1.0
    // Current assessments (30-90 days): weight 0.8
    // Aging assessments (90-180 days): weight 0.5
    // Stale assessments (180+ days): weight 0.2
    let weight = 1.0;
    if (daysSince > 180) weight = 0.2;
    else if (daysSince > 90) weight = 0.5;
    else if (daysSince > 30) weight = 0.8;
    
    freshnessScore += weight;
    totalWeight += 1.0;
  });
  
  const completeness = assessedSkills / totalSkills;
  const freshness = totalWeight > 0 ? freshnessScore / totalWeight : 0;
  
  // Combine completeness and freshness for final confidence
  const confidence = (completeness * 0.7) + (freshness * 0.3);
  return Math.round(confidence * 100) / 100;
}

export function updatePlayerSkillRating(
  skillProfile: PlayerSkillProfile,
  skillName: string,
  newRating: number,
  coachId: number
): PlayerSkillProfile {
  const existingSkill = skillProfile[skillName];
  const now = new Date().toISOString();
  
  const updatedSkill: IndividualSkillRating = {
    currentRating: newRating,
    lastAssessed: now,
    assessmentCount: existingSkill ? existingSkill.assessmentCount + 1 : 1,
    lastCoachId: coachId,
    trendDirection: existingSkill ? 
      (newRating > existingSkill.currentRating ? 'improving' : 
       newRating < existingSkill.currentRating ? 'declining' : 'stable') : 'stable',
    monthlyChange: existingSkill ? newRating - existingSkill.currentRating : 0
  };
  
  return {
    ...skillProfile,
    [skillName]: updatedSkill
  };
}

// Export validation functions for external use
export {
  validateAssessmentData as validatePCPAssessmentData,
  calculateCategoryAverage as calculatePCPCategoryAverage
};