/**
 * PKL-278651-COACH-0003-TERM-PROC
 * Pickleball Terminology Processor for SAGE
 * 
 * This file provides methods to process and incorporate pickleball terminology
 * into SAGE responses, enhancing its ability to recognize and address
 * sport-specific concepts in conversations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';
import { detectPickleballTerms, PickleballTerm, getTermsByDimension } from './pickleballTerminology';

/**
 * Result from analyzing a message for pickleball terminology
 */
export interface TermAnalysisResult {
  /** Terms detected in the message */
  detectedTerms: PickleballTerm[];
  /** Primary term to focus response on (if multiple terms found) */
  primaryTerm?: PickleballTerm;
  /** Suggested dimension based on terms */
  suggestedDimension?: DimensionCode;
  /** Whether the message contains specific term-related issues */
  hasSpecificIssue: boolean;
  /** The specific issue identified, if any */
  specificIssue?: string;
  /** Additional context extracted from message */
  context: {
    isQuestion: boolean;
    seekingAdvice: boolean;
    mentionsImprovement: boolean;
    mentionsDrills: boolean;
  };
}

/**
 * Analyzes a message for pickleball terminology and extracts context
 */
export function analyzePickleballTerminology(message: string): TermAnalysisResult {
  const lowerMessage = message.toLowerCase();
  const detectedTerms = detectPickleballTerms(message);
  
  // Initialize the result
  const result: TermAnalysisResult = {
    detectedTerms,
    hasSpecificIssue: false,
    context: {
      isQuestion: lowerMessage.includes('?') || 
                 lowerMessage.includes('how') || 
                 lowerMessage.includes('what') ||
                 lowerMessage.includes('why') ||
                 lowerMessage.includes('when') ||
                 lowerMessage.includes('where') ||
                 lowerMessage.includes('who') ||
                 lowerMessage.includes('which'),
      seekingAdvice: lowerMessage.includes('advice') || 
                     lowerMessage.includes('help') || 
                     lowerMessage.includes('tip') ||
                     lowerMessage.includes('improve') ||
                     lowerMessage.includes('better') ||
                     lowerMessage.includes('fix') ||
                     lowerMessage.includes('correct'),
      mentionsImprovement: lowerMessage.includes('improve') || 
                           lowerMessage.includes('better') || 
                           lowerMessage.includes('practice') ||
                           lowerMessage.includes('learn') ||
                           lowerMessage.includes('master') ||
                           lowerMessage.includes('work on'),
      mentionsDrills: lowerMessage.includes('drill') || 
                      lowerMessage.includes('exercise') || 
                      lowerMessage.includes('practice') ||
                      lowerMessage.includes('training')
    }
  };
  
  // If no terms detected, return early
  if (detectedTerms.length === 0) {
    return result;
  }
  
  // Determine the primary term (the one most likely to be the focus)
  // Prioritize terms that are mentioned first in the message
  if (detectedTerms.length === 1) {
    result.primaryTerm = detectedTerms[0];
  } else if (detectedTerms.length > 1) {
    let earliestPosition = message.length;
    let primaryTermIndex = 0;
    
    detectedTerms.forEach((term, index) => {
      // Check the position of the main term
      const termPosition = lowerMessage.indexOf(term.term.toLowerCase());
      if (termPosition !== -1 && termPosition < earliestPosition) {
        earliestPosition = termPosition;
        primaryTermIndex = index;
      }
      
      // Also check aliases
      term.aliases.forEach(alias => {
        const aliasPosition = lowerMessage.indexOf(alias.toLowerCase());
        if (aliasPosition !== -1 && aliasPosition < earliestPosition) {
          earliestPosition = aliasPosition;
          primaryTermIndex = index;
        }
      });
    });
    
    result.primaryTerm = detectedTerms[primaryTermIndex];
  }
  
  // Determine the suggested dimension based on the primary term
  if (result.primaryTerm) {
    result.suggestedDimension = result.primaryTerm.primaryDimension;
  }
  
  // Check for specific issues with the primary term
  if (result.primaryTerm) {
    const term = result.primaryTerm;
    
    // Check if any common issues for this term are mentioned
    term.commonIssues.forEach(issue => {
      const lowerIssue = issue.toLowerCase();
      // Check if keywords from the issue are in the message
      const issueKeywords = lowerIssue.split(' ')
        .filter(word => word.length > 3) // Only use significant words
        .map(word => word.replace(/[.,;:!?]/g, '')); // Remove punctuation
        
      const issueMatches = issueKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (issueMatches) {
        result.hasSpecificIssue = true;
        result.specificIssue = issue;
      }
    });
    
    // If no specific issue was found but there are problem indicators, use a generic issue
    if (!result.hasSpecificIssue && 
        (lowerMessage.includes('problem') || 
         lowerMessage.includes('trouble') || 
         lowerMessage.includes('struggle') || 
         lowerMessage.includes('difficult') ||
         lowerMessage.includes('can\'t') ||
         lowerMessage.includes('cannot') ||
         lowerMessage.includes('hard time'))) {
      result.hasSpecificIssue = true;
      result.specificIssue = term.commonIssues[0]; // Use the first common issue as default
    }
  }
  
  return result;
}

/**
 * Generates a response focused on addressing pickleball terminology
 */
export function generateTerminologyResponse(
  analysis: TermAnalysisResult,
  userName: string,
  recentJournalEntries: any[] = []
): string {
  // If no terms detected, return empty string to indicate fallback to standard response
  if (analysis.detectedTerms.length === 0) {
    return '';
  }
  
  const { primaryTerm, hasSpecificIssue, specificIssue, context } = analysis;
  
  // If no primary term identified, return empty string
  if (!primaryTerm) {
    return '';
  }
  
  // Find any journal entries related to this term's dimensions
  const relatedJournalEntries = recentJournalEntries.filter(entry => 
    entry.dimensionCode === primaryTerm.primaryDimension || 
    primaryTerm.secondaryDimensions.includes(entry.dimensionCode)
  );
  
  const hasRelatedJournals = relatedJournalEntries.length > 0;
  const journalReference = hasRelatedJournals 
    ? `I notice from your journal entries that you've been working on your ${primaryTerm.primaryDimension} skills, which is directly relevant to mastering the ${primaryTerm.term}. ` 
    : '';
  
  // Generate different responses based on the context
  if (context.isQuestion && context.seekingAdvice) {
    // User is asking a specific question seeking advice
    return `${primaryTerm.term} is an important aspect of pickleball. ${primaryTerm.description} ${journalReference}
    
${hasSpecificIssue 
  ? `For your specific issue with ${specificIssue}, I recommend: \n- ${primaryTerm.improvementTips.slice(0, 3).join('\n- ')}` 
  : `Here are some tips to master this technique: \n- ${primaryTerm.improvementTips.join('\n- ')}`}

${context.mentionsDrills 
  ? `These drills will help you improve:\n- ${primaryTerm.drills.join('\n- ')}` 
  : `Would you like some specific drills to practice this skill?`}`;
  } 
  else if (context.mentionsImprovement) {
    // User is talking about improving this aspect
    return `Improving your ${primaryTerm.term} technique is a great focus area, ${userName}. ${primaryTerm.description} ${journalReference}
    
Here's how you can develop this skill:
- ${primaryTerm.improvementTips.join('\n- ')}

${context.mentionsDrills 
  ? `Try these targeted drills:\n- ${primaryTerm.drills.join('\n- ')}` 
  : `Would you like me to recommend some specific drills to practice this skill?`}

Would you like to journal about your progress with the ${primaryTerm.term} technique after your next practice session?`;
  }
  else if (hasSpecificIssue) {
    // User is describing a problem with this term
    return `I understand you're having trouble with ${primaryTerm.term}, specifically with ${specificIssue}. ${journalReference}
    
This is a common challenge that many players face. Here's how to address it:
- ${primaryTerm.improvementTips.slice(0, 3).join('\n- ')}

${context.mentionsDrills 
  ? `These focused drills will help:\n- ${primaryTerm.drills.slice(0, 2).join('\n- ')}` 
  : `I can suggest some specific drills to help with this - would that be helpful?`}

Have you been tracking your progress with this aspect of your game in your journal?`;
  }
  else {
    // Generic response about this term
    return `The ${primaryTerm.term} is a key element of pickleball. ${primaryTerm.description} ${journalReference}
    
Many players work to refine this aspect of their game. Some tips to consider:
- ${primaryTerm.improvementTips.slice(0, 3).join('\n- ')}

Would you like more specific advice on how to improve your ${primaryTerm.term} technique or some drills to practice?`;
  }
}