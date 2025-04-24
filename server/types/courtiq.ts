/**
 * PKL-278651-COACH-0004-COURTIQ-TYPES
 * CourtIQ Type Definitions
 * 
 * This file defines types related to the CourtIQ dimensional
 * rating system and processing.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

/**
 * The five dimensions of CourtIQ
 */
export type DimensionCode = 'TECH' | 'TACT' | 'PHYS' | 'MENT' | 'CONS';

/**
 * Full dimension name mapping
 */
export const dimensionNames: Record<DimensionCode, string> = {
  'TECH': 'Technical Skills',
  'TACT': 'Tactical Awareness',
  'PHYS': 'Physical Fitness',
  'MENT': 'Mental Toughness',
  'CONS': 'Consistency'
};

/**
 * Result of a CourtIQ analysis
 */
export interface CourtIQAnalysis {
  /** The primary CourtIQ dimension detected in content */
  primaryDimension: DimensionCode;
  
  /** Secondary dimension found (if any) */
  secondaryDimension?: DimensionCode;
  
  /** The specific skill/area within the dimension */
  specificArea?: string;
  
  /** The confidence level of the detection (1-5) */
  confidence: number;
  
  /** Whether the content indicates an issue rather than a strength */
  hasIssue: boolean;
  
  /** The specific issue identified, if any */
  specificIssue?: string;
  
  /** Whether the user is actively seeking improvement */
  seekingImprovement: boolean;
  
  /** The intensity level of concern or interest (1-5) */
  intensity: number;
  
  /** Keywords detected in the analysis */
  keywordsDetected: string[];
}

/**
 * Result of a mental state analysis 
 */
export interface MentalStateAnalysis {
  /** The primary mental state detected */
  primaryState: string;
  
  /** The intensity level (1-5) */
  intensity: number;
  
  /** Confidence level in the analysis (1-5) */
  confidence: number;
  
  /** Whether the state indicates an issue to address */
  hasIssue: boolean;
  
  /** Specific issue identified if hasIssue is true */
  specificIssue?: string;
  
  /** Whether the mental state is related to a match */
  isMatchRelated: boolean;
  
  /** The sentiment (positive, negative, neutral) */
  sentiment: 'positive' | 'negative' | 'neutral';
  
  /** The most relevant CourtIQ dimension */
  relevantDimension: DimensionCode;
  
  /** Whether the user is seeking advice */
  seeksAdvice: boolean;
}