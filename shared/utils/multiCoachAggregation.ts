/**
 * Multi-Coach Weighted Aggregation System
 * 
 * Handles aggregation of assessments from multiple coaches with different levels,
 * applying exponential weighting based on coach certification levels.
 * 
 * Coach Level Weights:
 * L1: 0.7x (Provisional coaches - limited weight)
 * L2: 1.0x (Base certified coaches) 
 * L3: 1.8x (Senior coaches - higher authority)
 * L4: 3.2x (Master coaches - significant authority)
 * L5: 3.8x (Elite coaches - highest authority)
 */

export interface AssessmentRecord {
  id: string;
  studentId: string;
  coachId: string;
  coachName: string;
  coachLevel: number;
  assessmentMode: 'quick' | 'full';
  pcpRating: number;
  assessmentData: Record<string, number>;
  assessmentDate: Date;
  totalSkills: number;
}

export interface AggregatedRating {
  finalPCPRating: number;
  contributingAssessments: number;
  totalWeight: number;
  coachLevelBreakdown: Record<string, { count: number; avgWeight: number; contribution: number }>;
  confidenceLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXPERT';
  dominantCoachLevel: number;
  ratingStatus: 'PROVISIONAL' | 'VERIFIED';
}

/**
 * Coach level weighting multipliers
 * Exponential scale to reflect certification difficulty and authority
 */
export const COACH_LEVEL_WEIGHTS = {
  1: 0.7,   // L1 - Minimal weight (developing coaches)
  2: 1.0,   // L2 - Base weight (standard certified)
  3: 1.8,   // L3 - Elevated weight (senior expertise)
  4: 3.2,   // L4 - High weight (master level authority)
  5: 3.8    // L5 - Maximum weight (elite coaching authority)
} as const;

/**
 * Determines confidence level based on total weighted assessments
 * and coach level distribution
 */
function calculateConfidenceLevel(
  totalWeight: number, 
  hasL4PlusCoach: boolean,
  assessmentCount: number
): 'LOW' | 'MODERATE' | 'HIGH' | 'EXPERT' {
  // EXPERT level requires L4+ coach validation
  if (hasL4PlusCoach && totalWeight >= 6.0) return 'EXPERT';
  if (hasL4PlusCoach && totalWeight >= 3.2) return 'HIGH';
  if (totalWeight >= 3.6) return 'HIGH';
  if (totalWeight >= 2.0 || assessmentCount >= 3) return 'MODERATE';
  return 'LOW';
}

/**
 * Determines if rating is VERIFIED (L4+ coach involved) or PROVISIONAL
 */
function determineRatingStatus(coachLevels: number[]): 'PROVISIONAL' | 'VERIFIED' {
  return coachLevels.some(level => level >= 4) ? 'VERIFIED' : 'PROVISIONAL';
}

/**
 * Aggregates multiple coach assessments using weighted averaging
 * 
 * @param assessments - Array of assessment records from different coaches
 * @returns Aggregated rating with confidence metrics and breakdown
 */
export function aggregateMultiCoachRatings(assessments: AssessmentRecord[]): AggregatedRating {
  if (assessments.length === 0) {
    throw new Error('Cannot aggregate empty assessment array');
  }

  if (assessments.length === 1) {
    // Single assessment - return with appropriate confidence
    const assessment = assessments[0];
    const weight = COACH_LEVEL_WEIGHTS[assessment.coachLevel as keyof typeof COACH_LEVEL_WEIGHTS] || 1.0;
    const hasL4Plus = assessment.coachLevel >= 4;
    
    return {
      finalPCPRating: assessment.pcpRating,
      contributingAssessments: 1,
      totalWeight: weight,
      coachLevelBreakdown: {
        [`L${assessment.coachLevel}`]: {
          count: 1,
          avgWeight: weight,
          contribution: 100
        }
      },
      confidenceLevel: calculateConfidenceLevel(weight, hasL4Plus, 1),
      dominantCoachLevel: assessment.coachLevel,
      ratingStatus: determineRatingStatus([assessment.coachLevel])
    };
  }

  // Multi-coach aggregation
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const coachLevelBreakdown: Record<string, { count: number; avgWeight: number; contribution: number }> = {};
  const coachLevels: number[] = [];

  // Calculate weighted sum and track coach level distribution
  for (const assessment of assessments) {
    const weight = COACH_LEVEL_WEIGHTS[assessment.coachLevel as keyof typeof COACH_LEVEL_WEIGHTS] || 1.0;
    const weightedScore = assessment.pcpRating * weight;
    
    totalWeightedScore += weightedScore;
    totalWeight += weight;
    coachLevels.push(assessment.coachLevel);

    const levelKey = `L${assessment.coachLevel}`;
    if (!coachLevelBreakdown[levelKey]) {
      coachLevelBreakdown[levelKey] = { count: 0, avgWeight: 0, contribution: 0 };
    }
    coachLevelBreakdown[levelKey].count++;
    coachLevelBreakdown[levelKey].avgWeight = weight;
    coachLevelBreakdown[levelKey].contribution += (weight / totalWeight) * 100;
  }

  // Calculate final aggregated rating
  const finalPCPRating = totalWeightedScore / totalWeight;

  // Determine dominant coach level (highest level with assessments)
  const dominantCoachLevel = Math.max(...coachLevels);
  const hasL4PlusCoach = coachLevels.some(level => level >= 4);

  // Calculate confidence level
  const confidenceLevel = calculateConfidenceLevel(
    totalWeight, 
    hasL4PlusCoach, 
    assessments.length
  );

  // Determine rating status
  const ratingStatus = determineRatingStatus(coachLevels);

  console.log(`[MULTI-COACH AGGREGATION] Processed ${assessments.length} assessments`);
  console.log(`[MULTI-COACH AGGREGATION] Final PCP: ${finalPCPRating.toFixed(2)} (Confidence: ${confidenceLevel}, Status: ${ratingStatus})`);
  console.log(`[MULTI-COACH AGGREGATION] Coach levels: ${coachLevels.join(', ')}, Dominant: L${dominantCoachLevel}`);

  return {
    finalPCPRating: Number(finalPCPRating.toFixed(2)), // 2 decimal precision
    contributingAssessments: assessments.length,
    totalWeight,
    coachLevelBreakdown,
    confidenceLevel,
    dominantCoachLevel,
    ratingStatus
  };
}

/**
 * Validates if a new assessment should be accepted based on existing assessments
 * 
 * @param existingAssessments - Current assessments for the student
 * @param newAssessment - Proposed new assessment
 * @returns Whether the new assessment should be accepted
 */
export function validateNewAssessment(
  existingAssessments: AssessmentRecord[], 
  newAssessment: Partial<AssessmentRecord>
): { valid: boolean; reason?: string } {
  // Prevent coaches from assessing themselves multiple times in short periods
  const recentSameCoachAssessments = existingAssessments.filter(
    assessment => 
      assessment.coachId === newAssessment.coachId &&
      Date.now() - new Date(assessment.assessmentDate).getTime() < 24 * 60 * 60 * 1000 // 24 hours
  );

  if (recentSameCoachAssessments.length > 0) {
    return {
      valid: false,
      reason: `Coach ${newAssessment.coachId} has already assessed this student in the last 24 hours`
    };
  }

  return { valid: true };
}

/**
 * Gets the most authoritative PCP rating for a student
 * Prioritizes L4+ coach assessments for official ratings
 */
export function getOfficialPCPRating(aggregatedRating: AggregatedRating): {
  rating: number;
  isOfficial: boolean;
  status: string;
} {
  const isOfficial = aggregatedRating.ratingStatus === 'VERIFIED' && 
                     aggregatedRating.confidenceLevel !== 'LOW';

  return {
    rating: aggregatedRating.finalPCPRating,
    isOfficial,
    status: isOfficial ? 
      `OFFICIAL (${aggregatedRating.confidenceLevel} confidence, ${aggregatedRating.contributingAssessments} assessments)` :
      `PROVISIONAL (${aggregatedRating.confidenceLevel} confidence, requires L4+ validation)`
  };
}