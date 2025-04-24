/**
 * PKL-278651-COACH-0005-KNOWLEDGE
 * Pickleball Knowledge Integration System
 * 
 * This file integrates the various pickleball knowledge components (rules,
 * shots, terminology) into a unified system that can be used by SAGE
 * for comprehensive pickleball coaching and information.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { isRuleQuestion, findRulesForQuestion, generateRuleResponse, PickleballRule } from './pickleballRules.fixed';
import { isShotQuestion, analyzeShotReference, generateShotResponse, ShotAnalysis } from './shotRecognition';
import { isTerminologyQuestion, findTerminology, generateTerminologyResponse, detectUnfamiliarTerminology, TerminologyLevel, PickleballTerm } from './pickleballVocabulary';

/**
 * Types of pickleball knowledge queries
 */
export enum KnowledgeQueryType {
  RULE = 'rule',
  SHOT = 'shot',
  TERMINOLOGY = 'terminology',
  GENERAL = 'general',
  ADVICE = 'advice',
  UNKNOWN = 'unknown'
}

/**
 * Result from analyzing a pickleball knowledge query
 */
export interface KnowledgeQueryAnalysis {
  /** The type of query detected */
  queryType: KnowledgeQueryType;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Specific rules that match the query, if applicable */
  matchingRules?: PickleballRule[];
  /** Shot analysis results, if applicable */
  shotAnalysis?: ShotAnalysis;
  /** Terminology matches, if applicable */
  terminologyMatches?: PickleballTerm[];
  /** Whether advice is being sought */
  seekingAdvice: boolean;
  /** The specific subject of the query */
  subject?: string;
}

/**
 * Request context information
 */
export interface ContextInfo {
  /** The player's approximate skill level */
  playerLevel?: TerminologyLevel;
  /** Previous query topics for context */
  previousQueryTopics?: string[];
  /** The player's preferred shot types (if known) */
  preferredShots?: string[];
  /** The player's known areas of interest */
  interests?: string[];
}

/**
 * Response options for knowledge generation
 */
export interface ResponseOptions {
  /** Whether to include additional educational content */
  includeEducational?: boolean;
  /** Whether to adjust for the player's skill level */
  adjustForSkillLevel?: boolean;
  /** Whether to include follow-up questions */
  includeFollowUps?: boolean;
  /** Maximum response length (approximate) */
  maxLength?: number;
  /** Whether to use more casual language */
  casualLanguage?: boolean;
}

/**
 * Analyze a pickleball knowledge query to determine its type and extract relevant information
 */
export function analyzeKnowledgeQuery(query: string, context?: ContextInfo): KnowledgeQueryAnalysis {
  query = query.trim();
  
  // Initialize with unknown type
  const analysis: KnowledgeQueryAnalysis = {
    queryType: KnowledgeQueryType.UNKNOWN,
    confidence: 1,
    seekingAdvice: false
  };
  
  // Check if seeking advice
  const adviceIndicators = [
    'how do i', 'how to', 'help with', 'improve', 'better', 'advice', 
    'struggling with', 'problem with', 'teach me', 'explain', 'tips',
    'suggestions', 'what should i', 'best way'
  ];
  
  analysis.seekingAdvice = adviceIndicators.some(indicator => 
    query.toLowerCase().includes(indicator)
  );
  
  // Determine query type with confidence levels
  if (isRuleQuestion(query)) {
    analysis.queryType = KnowledgeQueryType.RULE;
    analysis.matchingRules = findRulesForQuestion(query);
    analysis.confidence = analysis.matchingRules.length > 0 ? 4 : 2;
    
    // Extract subject from matching rules
    if (analysis.matchingRules.length > 0) {
      analysis.subject = analysis.matchingRules[0].name;
    }
  }
  else if (isShotQuestion(query)) {
    analysis.queryType = KnowledgeQueryType.SHOT;
    analysis.shotAnalysis = analyzeShotReference(query);
    analysis.confidence = analysis.shotAnalysis.confidence;
    analysis.subject = analysis.shotAnalysis.primaryShot;
  }
  else if (isTerminologyQuestion(query)) {
    analysis.queryType = KnowledgeQueryType.TERMINOLOGY;
    analysis.terminologyMatches = findTerminology(query);
    analysis.confidence = analysis.terminologyMatches.length > 0 ? 4 : 2;
    
    // Extract subject from matching terminology
    if (analysis.terminologyMatches && analysis.terminologyMatches.length > 0) {
      analysis.subject = analysis.terminologyMatches[0].term;
    }
  }
  else if (analysis.seekingAdvice) {
    // If seeking advice but not clearly about rules, shots, or terminology
    analysis.queryType = KnowledgeQueryType.ADVICE;
    analysis.confidence = 3;
    
    // Try to extract subject from the query
    const subjectIndicators = [
      'about', 'with', 'on', 'for', 'regarding', 'playing', 'my'
    ];
    
    for (const indicator of subjectIndicators) {
      const pattern = new RegExp(`${indicator}\\s+([\\w\\s]+)`, 'i');
      const match = query.match(pattern);
      if (match && match[1]) {
        analysis.subject = match[1].trim();
        break;
      }
    }
  }
  else {
    // Default to general pickleball query
    analysis.queryType = KnowledgeQueryType.GENERAL;
    analysis.confidence = 2;
  }
  
  return analysis;
}

/**
 * Generate a response to a pickleball knowledge query
 */
export function generateKnowledgeResponse(
  query: string, 
  context?: ContextInfo,
  options: ResponseOptions = {}
): string {
  // Set default options
  const defaultOptions: Required<ResponseOptions> = {
    includeEducational: true,
    adjustForSkillLevel: true,
    includeFollowUps: true,
    maxLength: 500,
    casualLanguage: true
  };
  
  const resolvedOptions = { ...defaultOptions, ...options };
  const analysis = analyzeKnowledgeQuery(query, context);
  let response = '';
  
  // Generate response based on query type
  switch (analysis.queryType) {
    case KnowledgeQueryType.RULE:
      response = generateRuleResponse(query);
      break;
      
    case KnowledgeQueryType.SHOT:
      if (analysis.shotAnalysis) {
        response = generateShotResponse(analysis.shotAnalysis);
      }
      break;
      
    case KnowledgeQueryType.TERMINOLOGY:
      if (analysis.subject) {
        response = generateTerminologyResponse(analysis.subject);
      }
      break;
      
    case KnowledgeQueryType.ADVICE:
      // For advice, try to use the best match from any knowledge source
      if (analysis.shotAnalysis && analysis.shotAnalysis.confidence >= 3) {
        response = generateShotResponse(analysis.shotAnalysis);
      } 
      else if (analysis.matchingRules && analysis.matchingRules.length > 0) {
        response = generateRuleResponse(query);
      }
      else {
        // Generic advice when no specific topic is detected
        response = generateGenericAdvice(analysis.subject || '');
      }
      break;
      
    case KnowledgeQueryType.GENERAL:
    case KnowledgeQueryType.UNKNOWN:
      // For general or unknown queries, provide a generic response
      response = generateGenericResponse(query);
      break;
  }
  
  // Add educational content if appropriate
  if (resolvedOptions.includeEducational && analysis.queryType !== KnowledgeQueryType.UNKNOWN) {
    const educationalContent = generateEducationalContent(analysis, context);
    if (educationalContent && response.length + educationalContent.length <= resolvedOptions.maxLength) {
      response += `\n\n${educationalContent}`;
    }
  }
  
  // Add follow-up questions if appropriate
  if (resolvedOptions.includeFollowUps) {
    const followUps = generateFollowUpQuestions(analysis, context);
    if (followUps && response.length + followUps.length <= resolvedOptions.maxLength) {
      response += `\n\n${followUps}`;
    }
  }
  
  // Check for terminology that might be unfamiliar
  if (resolvedOptions.adjustForSkillLevel && context?.playerLevel) {
    const unfamiliarTerms = detectUnfamiliarTerminology(response, context.playerLevel);
    if (unfamiliarTerms.length > 0) {
      const explanations = unfamiliarTerms.map(term => `**${term.term}**: ${term.definition}`).join('\n\n');
      
      if (response.length + explanations.length <= resolvedOptions.maxLength) {
        response += `\n\n**Terminology Explained:**\n\n${explanations}`;
      }
    }
  }
  
  return response;
}

/**
 * Generate a generic response when no specific query type is detected
 */
function generateGenericResponse(query: string): string {
  const genericResponses = [
    "I'd be happy to help with your pickleball questions. Could you provide more specific details about what you'd like to know?",
    "As your pickleball coach, I can help with rules, shots, strategy, and terminology. What specific aspect are you interested in?",
    "I'm here to assist with all aspects of pickleball. To provide the most helpful information, could you clarify your question?",
    "I can help with anything pickleball-related - from basic rules to advanced techniques. What would you like to focus on?"
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

/**
 * Generate generic advice when a subject is detected but no specific knowledge matches
 */
function generateGenericAdvice(subject: string): string {
  if (!subject) {
    return "I'd be happy to offer advice on improving your pickleball game. What specific aspect would you like help with? For example, I can provide tips on serves, dinks, strategy, footwork, or any other area.";
  }
  
  return `To improve your ${subject} in pickleball, I recommend focusing on consistent practice with proper technique. Would you like specific advice on technique, drills, or strategic applications for ${subject}?`;
}

/**
 * Generate additional educational content related to the query
 */
function generateEducationalContent(analysis: KnowledgeQueryAnalysis, context?: ContextInfo): string {
  if (!analysis.subject) {
    return '';
  }
  
  // Educational content based on query type
  switch (analysis.queryType) {
    case KnowledgeQueryType.RULE:
      return "Understanding the rules helps you play more confidently and avoid unnecessary faults. Consider reviewing the official USAP rulebook for a deeper understanding.";
      
    case KnowledgeQueryType.SHOT:
      return "Developing a variety of shots will make you a more versatile player. Each shot has specific situational advantages, so practice recognizing when to use different shots during match play.";
      
    case KnowledgeQueryType.TERMINOLOGY:
      return "As you continue playing pickleball, you'll become more familiar with the terminology. Understanding these terms helps with communication on the court and following strategy discussions.";
      
    default:
      return '';
  }
}

/**
 * Generate follow-up questions based on the analysis
 */
function generateFollowUpQuestions(analysis: KnowledgeQueryAnalysis, context?: ContextInfo): string {
  if (!analysis.subject) {
    return '';
  }
  
  // Follow-up based on query type
  switch (analysis.queryType) {
    case KnowledgeQueryType.RULE:
      return "Would you like me to explain how this rule applies in specific game situations? Or are there other rules you'd like to understand better?";
      
    case KnowledgeQueryType.SHOT:
      return "Would you like to know about specific drills to practice this shot? Or would you prefer information about when to strategically use this shot during a game?";
      
    case KnowledgeQueryType.TERMINOLOGY:
      return "Are there other pickleball terms you'd like me to explain? Or would you like to know how this concept applies in game situations?";
      
    case KnowledgeQueryType.ADVICE:
      return "What specific aspects of your game would you like to focus on improving? Or do you have any particular challenges you're facing on the court?";
      
    default:
      return "What other pickleball topics would you like to explore or questions do you have?";
  }
}

/**
 * Check if SAGE should defer to pickleball knowledge system
 * 
 * This function helps determine if a message should be processed by
 * the pickleball knowledge system rather than general SAGE processing
 */
export function shouldDeferToPickleballKnowledge(message: string): boolean {
  const analysis = analyzeKnowledgeQuery(message);
  
  // Defer to pickleball knowledge system if confidence is high
  return analysis.confidence >= 3;
}

/**
 * Process a message through the pickleball knowledge system
 * 
 * This is the main entry point for SAGE to use the pickleball knowledge system
 */
export function processPickleballKnowledgeQuery(
  message: string,
  context?: ContextInfo,
  options?: ResponseOptions
): string {
  // If should not defer to pickleball knowledge, return empty string
  if (!shouldDeferToPickleballKnowledge(message)) {
    return '';
  }
  
  // Generate response
  return generateKnowledgeResponse(message, context, options);
}