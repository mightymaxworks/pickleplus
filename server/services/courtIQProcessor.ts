/**
 * PKL-278651-COACH-0004-COURTIQ-PROC
 * CourtIQ Processor for SAGE
 * 
 * This file provides methods to integrate all five dimensions of CourtIQ (Technical,
 * Tactical, Physical, Mental, Consistency) and provide comprehensive analysis and
 * responses to player messages.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';
import { analyzeMentalState, MentalStateAnalysis } from './mentalStateProcessor';
import { analyzeTechnicalSkills, TechnicalSkillsAnalysis } from './technicalSkillsProcessor';
import { analyzeTacticalAwareness, TacticalAwarenessAnalysis } from './tacticalAwarenessProcessor';
import { analyzePhysicalFitness, PhysicalFitnessAnalysis } from './physicalFitnessProcessor';
import { analyzeConsistency, ConsistencyAnalysis } from './consistencyProcessor';
import { 
  generateMentalStateResponse, 
  generateTechnicalResponse,
  generateTacticalResponse, 
  generateFitnessResponse,
  generateConsistencyResponse 
} from './courtIQResponses';

/**
 * Result from performing a comprehensive CourtIQ analysis of a message
 */
export interface CourtIQAnalysis {
  /** The primary dimension detected in the message */
  primaryDimension: DimensionCode;
  /** The confidence level (1-5) for the primary dimension */
  primaryConfidence: number;
  /** The secondary dimension detected in the message, if any */
  secondaryDimension?: DimensionCode;
  /** The confidence level (1-5) for the secondary dimension */
  secondaryConfidence?: number;
  /** Whether the message indicates a specific issue/problem */
  hasIssue: boolean;
  /** The specific issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking advice/help */
  seekingAdvice: boolean;
  /** Individual dimension analysis results */
  dimensionAnalysis: {
    mental: MentalStateAnalysis;
    technical: TechnicalSkillsAnalysis;
    tactical: TacticalAwarenessAnalysis;
    physical: PhysicalFitnessAnalysis;
    consistency: ConsistencyAnalysis;
  };
}

/**
 * Performs a comprehensive analysis across all CourtIQ dimensions
 */
export function analyzeCourtIQ(message: string): CourtIQAnalysis {
  // Perform individual dimension analyses
  const mentalAnalysis = analyzeMentalState(message);
  const technicalAnalysis = analyzeTechnicalSkills(message);
  const tacticalAnalysis = analyzeTacticalAwareness(message);
  const physicalAnalysis = analyzePhysicalFitness(message);
  const consistencyAnalysis = analyzeConsistency(message);
  
  // Compile all dimension analyses
  const dimensionAnalysis = {
    mental: mentalAnalysis,
    technical: technicalAnalysis,
    tactical: tacticalAnalysis,
    physical: physicalAnalysis,
    consistency: consistencyAnalysis
  };
  
  // Determine primary and secondary dimensions based on confidence scores
  const dimensionConfidences: [DimensionCode, number][] = [
    ['MENT', mentalAnalysis.confidence],
    ['TECH', technicalAnalysis.confidence],
    ['TACT', tacticalAnalysis.confidence],
    ['PHYS', physicalAnalysis.confidence],
    ['CONS', consistencyAnalysis.confidence]
  ];
  
  // Sort by confidence score (descending)
  dimensionConfidences.sort((a, b) => b[1] - a[1]);
  
  // Extract primary and secondary dimensions
  const primaryDimension = dimensionConfidences[0][0];
  const primaryConfidence = dimensionConfidences[0][1];
  
  // Only include secondary dimension if confidence is at least 2
  let secondaryDimension: DimensionCode | undefined = undefined;
  let secondaryConfidence: number | undefined = undefined;
  
  if (dimensionConfidences[1][1] >= 2) {
    secondaryDimension = dimensionConfidences[1][0];
    secondaryConfidence = dimensionConfidences[1][1];
  }
  
  // Determine if the message indicates an issue across any dimension
  const hasIssue = 
    mentalAnalysis.hasIssue || 
    technicalAnalysis.hasIssue || 
    tacticalAnalysis.hasIssue || 
    physicalAnalysis.hasIssue || 
    consistencyAnalysis.hasIssue;
  
  // Identify specific issue from the primary dimension
  let specificIssue: string | undefined = undefined;
  
  if (primaryDimension === 'MENT' && mentalAnalysis.hasIssue) {
    specificIssue = `Mental issue related to ${mentalAnalysis.primaryState}`;
  } else if (primaryDimension === 'TECH' && technicalAnalysis.hasIssue) {
    specificIssue = technicalAnalysis.specificIssue;
  } else if (primaryDimension === 'TACT' && tacticalAnalysis.hasIssue) {
    specificIssue = tacticalAnalysis.specificIssue;
  } else if (primaryDimension === 'PHYS' && physicalAnalysis.hasIssue) {
    specificIssue = physicalAnalysis.specificIssue;
  } else if (primaryDimension === 'CONS' && consistencyAnalysis.hasIssue) {
    specificIssue = consistencyAnalysis.specificIssue;
  }
  
  // Determine if the user is seeking advice
  const seekingAdvice = 
    mentalAnalysis.seeksAdvice || 
    technicalAnalysis.seekingTechniqueAdvice || 
    tacticalAnalysis.seekingTacticalAdvice || 
    physicalAnalysis.seekingFitnessAdvice || 
    consistencyAnalysis.seekingConsistencyAdvice;
  
  return {
    primaryDimension,
    primaryConfidence,
    secondaryDimension,
    secondaryConfidence,
    hasIssue,
    specificIssue,
    seekingAdvice,
    dimensionAnalysis
  };
}

/**
 * Integrates individual dimension responses to generate a comprehensive CourtIQ response
 */
export function generateCourtIQResponse(
  analysis: CourtIQAnalysis, 
  userName: string
): string {
  const { 
    primaryDimension, 
    secondaryDimension, 
    dimensionAnalysis 
  } = analysis;
  
  // Get responses from each relevant dimension
  let primaryResponse = '';
  let secondaryResponse = '';
  
  // Generate primary dimension response
  if (primaryDimension === 'MENT') {
    primaryResponse = generateMentalStateResponse(dimensionAnalysis.mental, userName);
  } else if (primaryDimension === 'TECH') {
    primaryResponse = generateTechnicalResponse(dimensionAnalysis.technical, userName);
  } else if (primaryDimension === 'TACT') {
    primaryResponse = generateTacticalResponse(dimensionAnalysis.tactical, userName);
  } else if (primaryDimension === 'PHYS') {
    primaryResponse = generateFitnessResponse(dimensionAnalysis.physical, userName);
  } else if (primaryDimension === 'CONS') {
    primaryResponse = generateConsistencyResponse(dimensionAnalysis.consistency, userName);
  }
  
  // Generate secondary dimension response if applicable
  if (secondaryDimension === 'MENT') {
    secondaryResponse = generateMentalStateResponse(dimensionAnalysis.mental, userName);
  } else if (secondaryDimension === 'TECH') {
    secondaryResponse = generateTechnicalResponse(dimensionAnalysis.technical, userName);
  } else if (secondaryDimension === 'TACT') {
    secondaryResponse = generateTacticalResponse(dimensionAnalysis.tactical, userName);
  } else if (secondaryDimension === 'PHYS') {
    secondaryResponse = generateFitnessResponse(dimensionAnalysis.physical, userName);
  } else if (secondaryDimension === 'CONS') {
    secondaryResponse = generateConsistencyResponse(dimensionAnalysis.consistency, userName);
  }
  
  // If we have responses from both dimensions, combine them thoughtfully
  if (primaryResponse && secondaryResponse) {
    // Extract first paragraph from each response
    const primaryParagraph = primaryResponse.split('\n\n')[0];
    const secondaryParagraphs = secondaryResponse.split('\n\n').slice(1).join('\n\n');
    
    return `${primaryParagraph}\n\n${secondaryParagraphs}\n\nI notice that there are both ${dimensionCodeToName(primaryDimension)} and ${dimensionCodeToName(secondaryDimension)} aspects to your question. Would you like me to focus more specifically on one of these dimensions of your game?`;
  }
  
  // If we only have a primary response, use that
  if (primaryResponse) {
    return primaryResponse;
  }
  
  // Fallback response if no specific dimension was confidently detected
  return `I'd like to help you with your pickleball development, ${userName}. Could you provide a bit more detail about what specific aspect of your game you're looking to improve? I can offer guidance on technical skills, tactical awareness, physical fitness, mental toughness, or consistency - all key dimensions of the CourtIQ system.`;
}

/**
 * Helper function to convert dimension codes to display names
 */
function dimensionCodeToName(code: DimensionCode): string {
  switch (code) {
    case 'TECH': return 'Technical Skills';
    case 'TACT': return 'Tactical Awareness';
    case 'PHYS': return 'Physical Fitness';
    case 'MENT': return 'Mental Toughness';
    case 'CONS': return 'Consistency';
    default: return 'Unknown Dimension';
  }
}