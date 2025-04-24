/**
 * PKL-278651-COACH-0005-INTEGRATION
 * SAGE Pickleball Knowledge Integration
 * 
 * This file connects the pickleball knowledge system to the SAGE engine,
 * allowing SAGE to leverage comprehensive pickleball expertise when
 * communicating with players.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { processPickleballKnowledgeQuery, shouldDeferToPickleballKnowledge, ContextInfo, ResponseOptions } from './pickleballKnowledgeSystem';
import { TerminologyLevel } from './pickleballVocabulary';
import { CourtIQAnalysis } from '../types/courtiq';

/**
 * SAGE message type extension for pickleball knowledge
 */
export enum SagePickleballMessageType {
  RULE_QUESTION = 'rule_question',
  SHOT_ADVICE = 'shot_advice',
  TERMINOLOGY_EXPLANATION = 'terminology_explanation',
  PICKLEBALL_STRATEGY = 'pickleball_strategy'
}

/**
 * Extended SAGE response with pickleball knowledge
 */
export interface SagePickleballResponse {
  /** The response message */
  message: string;
  /** Whether pickleball knowledge was used */
  usedPickleballKnowledge: boolean;
  /** The CourtIQ dimension most relevant to the response */
  relevantDimension?: string;
  /** Whether the response contains technical advice */
  containsTechnicalAdvice: boolean;
  /** Whether additional resources might be helpful */
  suggestAdditionalResources: boolean;
  /** Specific drill recommendations, if applicable */
  recommendedDrills?: string[];
}

/**
 * Convert skill level to terminology level
 */
function skillLevelToTerminologyLevel(skillLevel: string): TerminologyLevel {
  // Skill levels are often represented as 2.5, 3.0, 3.5, 4.0, 4.5, 5.0
  const skillNumber = parseFloat(skillLevel);
  
  if (skillNumber < 3.5) {
    return TerminologyLevel.BEGINNER;
  } else if (skillNumber < 4.5) {
    return TerminologyLevel.INTERMEDIATE;
  } else {
    return TerminologyLevel.ADVANCED;
  }
}

/**
 * Create context information from player data and conversation history
 */
export function createPickleballContext(
  playerSkillLevel?: string,
  playerInterests?: string[],
  preferredShots?: string[],
  previousMessages?: string[]
): ContextInfo {
  const context: ContextInfo = {};
  
  // Convert skill level to terminology level
  if (playerSkillLevel) {
    context.playerLevel = skillLevelToTerminologyLevel(playerSkillLevel);
  } else {
    context.playerLevel = TerminologyLevel.BEGINNER; // Default to beginner if unknown
  }
  
  // Add interests
  if (playerInterests && playerInterests.length > 0) {
    context.interests = playerInterests;
  }
  
  // Add preferred shots
  if (preferredShots && preferredShots.length > 0) {
    context.preferredShots = preferredShots;
  }
  
  // Extract query topics from previous messages
  if (previousMessages && previousMessages.length > 0) {
    context.previousQueryTopics = extractTopicsFromMessages(previousMessages);
  }
  
  return context;
}

/**
 * Extract potential topic keywords from previous messages
 */
function extractTopicsFromMessages(messages: string[]): string[] {
  const topics: Set<string> = new Set();
  
  // List of common pickleball topics to look for
  const commonTopics = [
    'dink', 'serve', 'third shot', 'kitchen', 'volley', 'drop', 'drive',
    'stacking', 'strategy', 'footwork', 'positioning', 'doubles', 'singles',
    'rules', 'scoring', 'faults'
  ];
  
  // Check the last 5 messages or fewer if there aren't that many
  const recentMessages = messages.slice(-5);
  
  recentMessages.forEach(message => {
    const lowerMessage = message.toLowerCase();
    
    commonTopics.forEach(topic => {
      if (lowerMessage.includes(topic)) {
        topics.add(topic);
      }
    });
  });
  
  return Array.from(topics);
}

/**
 * Create response options from CourtIQ analysis
 */
export function createResponseOptions(courtIQAnalysis?: CourtIQAnalysis): ResponseOptions {
  const options: ResponseOptions = {
    includeEducational: true,
    adjustForSkillLevel: true,
    includeFollowUps: true
  };
  
  // If there's CourtIQ analysis, adjust options
  if (courtIQAnalysis) {
    // For beginners or those seeking improvement, provide more educational content
    options.includeEducational = courtIQAnalysis.seekingImprovement || courtIQAnalysis.confidence < 3;
    
    // For higher intensity or issues, include follow-ups
    options.includeFollowUps = courtIQAnalysis.hasIssue || courtIQAnalysis.intensity > 3;
    
    // Always adjust for skill level
    options.adjustForSkillLevel = true;
  }
  
  return options;
}

/**
 * Process a message through SAGE with pickleball knowledge integration
 */
export function processSageMessageWithPickleballKnowledge(
  message: string,
  playerSkillLevel?: string,
  playerInterests?: string[],
  preferredShots?: string[],
  previousMessages?: string[],
  courtIQAnalysis?: CourtIQAnalysis
): SagePickleballResponse {
  // Check if we should defer to the pickleball knowledge system
  const shouldDefer = shouldDeferToPickleballKnowledge(message);
  
  if (!shouldDefer) {
    // If not deferring, return a null response to indicate SAGE should use its normal processing
    return {
      message: '',
      usedPickleballKnowledge: false,
      containsTechnicalAdvice: false,
      suggestAdditionalResources: false
    };
  }
  
  // Create context and options
  const context = createPickleballContext(
    playerSkillLevel,
    playerInterests,
    preferredShots,
    previousMessages
  );
  
  const options = createResponseOptions(courtIQAnalysis);
  
  // Process the query through the pickleball knowledge system
  const response = processPickleballKnowledgeQuery(message, context, options);
  
  // Create the SAGE response
  const sageResponse: SagePickleballResponse = {
    message: response,
    usedPickleballKnowledge: true,
    containsTechnicalAdvice: responseContainsTechnicalAdvice(response),
    suggestAdditionalResources: responseSuggestsResources(response, message)
  };
  
  // Add the relevant CourtIQ dimension
  if (courtIQAnalysis) {
    sageResponse.relevantDimension = courtIQAnalysis.primaryDimension;
  } else {
    sageResponse.relevantDimension = determineRelevantDimension(message, response);
  }
  
  // Add drill recommendations if appropriate
  if (sageResponse.containsTechnicalAdvice) {
    sageResponse.recommendedDrills = generateDrillRecommendations(message, response);
  }
  
  return sageResponse;
}

/**
 * Determine if a response contains technical advice
 */
function responseContainsTechnicalAdvice(response: string): boolean {
  const technicalIndicators = [
    'technique', 'grip', 'stance', 'paddle', 'position', 'footwork', 
    'motion', 'form', 'mechanics', 'backswing', 'follow through',
    'practice', 'drill', 'exercise', 'training'
  ];
  
  const lowerResponse = response.toLowerCase();
  return technicalIndicators.some(indicator => lowerResponse.includes(indicator));
}

/**
 * Determine if a response should suggest additional resources
 */
function responseSuggestsResources(response: string, query: string): boolean {
  // If the query explicitly asks for resources
  if (query.toLowerCase().includes('resource') || 
      query.toLowerCase().includes('more information') ||
      query.toLowerCase().includes('where can i learn')) {
    return true;
  }
  
  // If the response is lengthy and complex
  if (response.length > 400 && response.split('.').length > 10) {
    return true;
  }
  
  // If the response mentions advanced concepts
  const advancedConcepts = [
    'advanced', 'complex', 'professional', 'tournament', 'competitive',
    'detailed', 'in-depth', 'advanced'
  ];
  
  const lowerResponse = response.toLowerCase();
  return advancedConcepts.some(concept => lowerResponse.includes(concept));
}

/**
 * Determine the relevant CourtIQ dimension based on message and response
 */
function determineRelevantDimension(message: string, response: string): string {
  const combined = (message + ' ' + response).toLowerCase();
  
  // Technical Skills indicators
  const technicalIndicators = [
    'technique', 'grip', 'stroke', 'paddle', 'mechanics', 'form',
    'backhand', 'forehand', 'dink', 'serve', 'volley', 'drop shot',
    'swing', 'contact', 'hit', 'shot'
  ];
  
  // Tactical Awareness indicators
  const tacticalIndicators = [
    'strategy', 'position', 'court', 'opponent', 'pattern', 'anticipate',
    'placement', 'target', 'formation', 'stack', 'switch', 'alignment',
    'plan', 'tactical', 'decision', 'approach'
  ];
  
  // Physical Fitness indicators
  const physicalIndicators = [
    'fitness', 'strength', 'conditioning', 'mobility', 'agility', 'speed',
    'endurance', 'footwork', 'movement', 'balance', 'training', 'exercise',
    'warm-up', 'stretch', 'injury', 'recovery'
  ];
  
  // Mental Toughness indicators
  const mentalIndicators = [
    'mental', 'focus', 'concentration', 'confidence', 'pressure', 'stress',
    'anxiety', 'mindset', 'visualization', 'emotional', 'control', 'calm',
    'nervous', 'distraction', 'frustration', 'attitude'
  ];
  
  // Consistency indicators
  const consistencyIndicators = [
    'consistency', 'reliable', 'steady', 'error', 'mistake', 'percentage',
    'variability', 'repeatable', 'routine', 'practice', 'habit', 'pattern',
    'dependable', 'accuracy', 'precision'
  ];
  
  // Count matches for each dimension
  let technicalCount = technicalIndicators.filter(i => combined.includes(i)).length;
  let tacticalCount = tacticalIndicators.filter(i => combined.includes(i)).length;
  let physicalCount = physicalIndicators.filter(i => combined.includes(i)).length;
  let mentalCount = mentalIndicators.filter(i => combined.includes(i)).length;
  let consistencyCount = consistencyIndicators.filter(i => combined.includes(i)).length;
  
  // Determine max count
  const maxCount = Math.max(
    technicalCount,
    tacticalCount,
    physicalCount,
    mentalCount,
    consistencyCount
  );
  
  // Return the dimension with the most matches
  if (maxCount === technicalCount) return 'TECH';
  if (maxCount === tacticalCount) return 'TACT';
  if (maxCount === physicalCount) return 'PHYS';
  if (maxCount === mentalCount) return 'MENT';
  if (maxCount === consistencyCount) return 'CONS';
  
  // Default to Technical if no clear winner
  return 'TECH';
}

/**
 * Generate drill recommendations based on the message and response
 */
function generateDrillRecommendations(message: string, response: string): string[] {
  const combined = (message + ' ' + response).toLowerCase();
  const drills: string[] = [];
  
  // Dink drills
  if (combined.includes('dink')) {
    drills.push('Dink Rally Drill: Practice controlled dinking with a partner, focusing on keeping the ball low and in the kitchen.');
    drills.push('Figure-Eight Dinking: Practice cross-court dinks with a partner in a figure-eight pattern to develop angle control.');
  }
  
  // Serve drills
  if (combined.includes('serve')) {
    drills.push('Serve Target Practice: Place targets in different areas of the service court and aim for precision.');
    drills.push('Serve and Return Drill: Practice serves followed by return positioning to develop complete serve sequence.');
  }
  
  // Third shot drills
  if (combined.includes('third shot') || combined.includes('transition')) {
    drills.push('Third Shot Drop Drill: Practice serving, return, and executing a controlled third shot drop that lands in the kitchen.');
    drills.push('Third Shot Progression: Practice third shot drop followed by moving to the kitchen line as a team.');
  }
  
  // Volley drills
  if (combined.includes('volley')) {
    drills.push('Rapid Fire Volleys: Have a partner feed quick volleys to develop reaction time and hand speed.');
    drills.push('Volley-to-Volley Drill: Practice controlled volleys with a partner, focusing on placement rather than power.');
  }
  
  // Reset drills
  if (combined.includes('reset') || combined.includes('block')) {
    drills.push('Reset Drill: Have a partner hit firm shots at you while you practice absorbing the pace and resetting with soft kitchen shots.');
    drills.push('Block and Move Drill: Practice blocking hard shots while maintaining proper positioning after the block.');
  }
  
  // If no specific drills matched, provide general options
  if (drills.length === 0) {
    drills.push('Kitchen Line Dinking: Practice controlled dinking at the kitchen line, focusing on ball control and paddle angle.');
    drills.push('Transition Drill: Practice moving from the baseline to the kitchen line with appropriate shot selection.');
  }
  
  // Return up to 2 drills
  return drills.slice(0, 2);
}