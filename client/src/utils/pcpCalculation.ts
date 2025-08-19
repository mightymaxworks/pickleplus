/**
 * PCP Rating Calculation Utilities - Client Side
 * 
 * Client-side implementation for PCP rating calculations and validation.
 * Mirrors the server-side utilities for consistent behavior.
 * 
 * Reference: PCP_RATING_CALCULATION_ALGORITHM.md
 * UDF Compliance: UNIFIED_DEVELOPMENT_FRAMEWORK_BEST_PRACTICES.md
 */

// Re-export from shared utilities to maintain consistency
export {
  PCP_WEIGHTS,
  SKILL_CATEGORIES,
  calculatePCPRating,
  validateAssessmentData,
  calculateCategoryAverage,
  generatePCPBreakdown,
  createSampleAssessmentData,
  type SkillCategoryName,
  type SkillName,
  type AssessmentData,
  type CategoryAverages,
  type PCPCalculationResult
} from '../../shared/utils/pcpCalculation';

/**
 * Format PCP rating for display in UI components
 * 
 * @param rating - PCP rating value
 * @returns Formatted string for display
 */
export function formatPCPRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get PCP rating color based on value for UI styling
 * 
 * @param rating - PCP rating value
 * @returns Tailwind CSS color class
 */
export function getPCPRatingColor(rating: number): string {
  if (rating >= 7.0) return 'text-green-600';
  if (rating >= 6.0) return 'text-blue-600';
  if (rating >= 5.0) return 'text-yellow-600';
  if (rating >= 4.0) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get PCP rating label for display
 * 
 * @param rating - PCP rating value
 * @returns Human-readable skill level
 */
export function getPCPRatingLabel(rating: number): string {
  if (rating >= 7.5) return 'Elite';
  if (rating >= 7.0) return 'Advanced+';
  if (rating >= 6.0) return 'Advanced';
  if (rating >= 5.0) return 'Intermediate+';
  if (rating >= 4.0) return 'Intermediate';
  if (rating >= 3.0) return 'Beginner+';
  return 'Beginner';
}

/**
 * Validate skill assessment form data before submission
 * 
 * @param formData - Form data from assessment component
 * @returns Validation result with user-friendly messages
 */
export function validateAssessmentForm(formData: Record<string, any>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if basic form structure is correct
  if (!formData || typeof formData !== 'object') {
    errors.push('Assessment data is missing or invalid');
    return { isValid: false, errors, warnings };
  }
  
  // Import validation function (we'll handle the async nature in components)
  try {
    // This would typically be imported at the top, but for demo purposes:
    // const { validateAssessmentData, SKILL_CATEGORIES } = await import('../../shared/utils/pcpCalculation');
    
    // Basic validation for now - can be enhanced with full skill validation
    const skillCount = Object.keys(formData).length;
    
    if (skillCount < 50) {
      warnings.push(`Only ${skillCount} skills assessed. Complete assessment requires all 55 skills.`);
    }
    
    // Check for invalid ratings
    Object.entries(formData).forEach(([skill, rating]) => {
      if (typeof rating !== 'number' || rating < 1 || rating > 10) {
        errors.push(`Invalid rating for ${skill}: ${rating}. Must be between 1-10.`);
      }
    });
    
  } catch (error) {
    errors.push('Error validating assessment data');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}