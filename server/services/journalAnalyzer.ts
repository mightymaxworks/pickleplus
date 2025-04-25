/**
 * PKL-278651-SAGE-0008-JOURNAL - Journal Analysis System
 * 
 * This service extracts key information from journal entries and provides 
 * analysis that can be referenced by the SAGE coaching system.
 */

import { JournalEntry } from '@shared/schema/journal';
import { FlexibleJournalEntry } from './sageDrillsIntegration';

export interface JournalAnalysisResult {
  keywords: string[];
  technicalTerms: string[];
  sentimentScore: number;  // -1 to 1, negative to positive
  focusAreas: string[];
  confidenceLevel: number;  // 0 to 1
  improvementAreas: string[];
  successAreas: string[];
  difficulty: 'low' | 'medium' | 'high';
}

/**
 * Technical pickleball terms we want to recognize in journal entries
 */
const PICKLEBALL_TECHNICAL_TERMS = [
  'dink', 'third shot drop', 'reset', 'erne', 'stack', 'kitchen',
  'non-volley zone', 'nvz', 'volley', 'groundstroke', 'serve',
  'return', 'backhand', 'forehand', 'overhead', 'smash', 'cross-court',
  'down the line', 'atp', 'around the post', 'poach', 'lob', 'spin',
  'drive', 'slice', 'topspin', 'drop shot', 'punch volley', 'block volley',
  'stacking', 'switch', 'even formation', 'traditional formation'
];

/**
 * Improvement areas we want to recognize in journal entries
 */
const IMPROVEMENT_AREAS = [
  'consistency', 'accuracy', 'placement', 'power', 'speed',
  'reaction time', 'court coverage', 'footwork', 'strategy',
  'patience', 'shot selection', 'anticipation', 'position',
  'communication', 'recovery', 'focus', 'stamina', 'mental game',
  'confidence'
];

/**
 * Extract keywords from a journal entry based on pickleball terminology
 */
function extractKeywords(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  const keywordSet = new Set<string>();

  // Single-word matches
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9-]/g, '');
    if (cleanWord.length > 2 && PICKLEBALL_TECHNICAL_TERMS.includes(cleanWord)) {
      keywordSet.add(cleanWord);
    }
  }

  // Multi-word matches
  for (const term of PICKLEBALL_TECHNICAL_TERMS) {
    if (term.includes(' ') && normalizedText.includes(term)) {
      keywordSet.add(term);
    }
  }

  return Array.from(keywordSet);
}

/**
 * Extract improvement areas mentioned in the journal entry
 */
function extractImprovementAreas(text: string): string[] {
  const normalizedText = text.toLowerCase();
  return IMPROVEMENT_AREAS.filter(area => {
    // Check for patterns like "need to improve", "working on", "struggle with"
    return (
      normalizedText.includes(`improve ${area}`) ||
      normalizedText.includes(`improve my ${area}`) ||
      normalizedText.includes(`better ${area}`) ||
      normalizedText.includes(`work on ${area}`) ||
      normalizedText.includes(`working on ${area}`) ||
      normalizedText.includes(`struggle with ${area}`) ||
      normalizedText.includes(`struggling with ${area}`) ||
      normalizedText.includes(`difficult ${area}`) ||
      normalizedText.includes(`hard time with ${area}`) ||
      normalizedText.includes(`problem with ${area}`) ||
      normalizedText.includes(`issues with ${area}`)
    );
  });
}

/**
 * Extract areas where the player is feeling successful
 */
function extractSuccessAreas(text: string): string[] {
  const normalizedText = text.toLowerCase();
  return IMPROVEMENT_AREAS.filter(area => {
    // Check for patterns indicating success
    return (
      normalizedText.includes(`good ${area}`) ||
      normalizedText.includes(`great ${area}`) ||
      normalizedText.includes(`strong ${area}`) ||
      normalizedText.includes(`improved ${area}`) ||
      normalizedText.includes(`confident ${area}`) ||
      normalizedText.includes(`happy with my ${area}`) ||
      normalizedText.includes(`proud of my ${area}`)
    );
  });
}

/**
 * Perform simple sentiment analysis on text
 * Returns a score from -1 (very negative) to 1 (very positive)
 */
function analyzeSentiment(text: string): number {
  const normalizedText = text.toLowerCase();
  
  // Very basic sentiment analysis
  const positiveTerms = [
    'good', 'great', 'excellent', 'amazing', 'happy', 'proud',
    'confident', 'improvement', 'better', 'progress', 'success',
    'win', 'winning', 'won', 'victory', 'enjoy', 'enjoyed', 'fun',
    'proud', 'improved', 'improving', 'strength', 'strong'
  ];
  
  const negativeTerms = [
    'bad', 'terrible', 'awful', 'poor', 'disappointed', 'disappointing',
    'struggle', 'struggling', 'difficult', 'hard', 'frustrating',
    'frustrated', 'upset', 'lose', 'losing', 'lost', 'failure',
    'weak', 'mistake', 'error', 'wrong', 'problem', 'issue', 'tired'
  ];
  
  let positiveCount = 0;
  for (const term of positiveTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const matches = normalizedText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  let negativeCount = 0;
  for (const term of negativeTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    const matches = normalizedText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  const totalWords = normalizedText.split(/\s+/).length;
  if (totalWords === 0) return 0;
  
  // Calculate sentiment score, normalize to -1 to 1 range
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return 0;
  
  return (positiveCount - negativeCount) / Math.max(1, totalSentimentWords);
}

/**
 * Determine the focus areas of a journal entry
 */
function determineFocusAreas(text: string, keywords: string[]): string[] {
  const normalizedText = text.toLowerCase();
  const focusAreas = new Set<string>();
  
  // Map keywords to broader categories
  const keywordMap: Record<string, string[]> = {
    'technical': ['dink', 'serve', 'backhand', 'forehand', 'volley', 'overhead', 'smash', 'groundstroke', 'third shot drop', 'reset', 'erne', 'drop shot'],
    'tactical': ['strategy', 'positioning', 'court coverage', 'shot selection', 'anticipation', 'stack', 'stacking', 'switch', 'formation'],
    'physical': ['footwork', 'speed', 'recovery', 'stamina', 'reaction', 'power'],
    'mental': ['focus', 'confidence', 'patience', 'mental game', 'concentration', 'consistency', 'pressure'],
    'doubles': ['communication', 'partner', 'team', 'poach', 'stacking', 'switch']
  };
  
  // Add focus areas based on keywords
  for (const keyword of keywords) {
    for (const [area, relatedKeywords] of Object.entries(keywordMap)) {
      if (relatedKeywords.some(k => keyword.includes(k))) {
        focusAreas.add(area);
      }
    }
  }
  
  // Check for specific mentions of CourtIQ dimensions
  if (normalizedText.includes('technical') || normalizedText.includes('technique')) {
    focusAreas.add('technical');
  }
  if (normalizedText.includes('tactic') || normalizedText.includes('strategy')) {
    focusAreas.add('tactical');
  }
  if (normalizedText.includes('physical') || normalizedText.includes('fitness')) {
    focusAreas.add('physical');
  }
  if (normalizedText.includes('mental') || normalizedText.includes('focus') || normalizedText.includes('confidence')) {
    focusAreas.add('mental');
  }
  if (normalizedText.includes('partner') || normalizedText.includes('doubles') || normalizedText.includes('team')) {
    focusAreas.add('doubles');
  }
  
  return Array.from(focusAreas);
}

/**
 * Estimate the difficulty level expressed in the journal
 */
function estimateDifficulty(text: string): 'low' | 'medium' | 'high' {
  const normalizedText = text.toLowerCase();
  
  // Terms indicating high difficulty
  const highDifficultyTerms = [
    'very difficult', 'extremely difficult', 'really hard', 'very challenging',
    'impossible', 'hardest', 'struggling a lot', 'major problem', 'can\'t seem to'
  ];
  
  // Terms indicating medium difficulty
  const mediumDifficultyTerms = [
    'difficult', 'challenging', 'hard', 'struggle', 'problem',
    'not easy', 'working on', 'trying to improve'
  ];
  
  // Terms indicating low difficulty
  const lowDifficultyTerms = [
    'easy', 'simple', 'straightforward', 'making progress',
    'getting better', 'improving', 'confident'
  ];
  
  // Check for high difficulty terms
  for (const term of highDifficultyTerms) {
    if (normalizedText.includes(term)) {
      return 'high';
    }
  }
  
  // Check for low difficulty terms
  for (const term of lowDifficultyTerms) {
    if (normalizedText.includes(term)) {
      return 'low';
    }
  }
  
  // Check for medium difficulty terms
  for (const term of mediumDifficultyTerms) {
    if (normalizedText.includes(term)) {
      return 'medium';
    }
  }
  
  // Default to medium if no specific indicators
  return 'medium';
}

/**
 * Calculate a confidence level for the analysis
 * Higher confidence when we have more keywords and clear sentiment
 */
function calculateConfidence(analysis: Partial<JournalAnalysisResult>): number {
  let confidence = 0;
  
  // More keywords = higher confidence
  confidence += Math.min(0.3, analysis.keywords?.length || 0 * 0.05);
  
  // Strong sentiment = higher confidence
  confidence += Math.min(0.3, Math.abs(analysis.sentimentScore || 0) * 0.3);
  
  // More focus areas = higher confidence
  confidence += Math.min(0.2, (analysis.focusAreas?.length || 0) * 0.04);
  
  // More improvement areas = higher confidence
  confidence += Math.min(0.2, (analysis.improvementAreas?.length || 0) * 0.04);
  
  return Math.min(1, confidence + 0.2); // Base confidence of 0.2
}

/**
 * Analyze a journal entry to extract useful information for SAGE
 */
export function analyzeJournalEntry(entry: JournalEntry | FlexibleJournalEntry): JournalAnalysisResult {
  const text = entry.content;
  
  // Extract keywords
  const keywords = extractKeywords(text);
  const technicalTerms = keywords.filter(k => 
    PICKLEBALL_TECHNICAL_TERMS.includes(k)
  );
  
  // Extract improvement areas
  const improvementAreas = extractImprovementAreas(text);
  const successAreas = extractSuccessAreas(text);
  
  // Calculate sentiment
  const sentimentScore = analyzeSentiment(text);
  
  // Determine focus areas
  const focusAreas = determineFocusAreas(text, keywords);
  
  // Estimate difficulty
  const difficulty = estimateDifficulty(text);
  
  // Build initial analysis
  const analysis: Partial<JournalAnalysisResult> = {
    keywords,
    technicalTerms,
    sentimentScore,
    focusAreas,
    improvementAreas,
    successAreas,
    difficulty
  };
  
  // Calculate confidence level
  const confidenceLevel = calculateConfidence(analysis);
  
  return {
    ...analysis,
    confidenceLevel
  } as JournalAnalysisResult;
}

/**
 * Extract relevant patterns from multiple journal entries
 */
export function analyzeJournalHistory(entries: (JournalEntry | FlexibleJournalEntry)[]): {
  commonKeywords: string[];
  persistentImprovementAreas: string[];
  progressiveSuccessAreas: string[];
  sentimentTrend: 'improving' | 'declining' | 'stable';
  mostDiscussedFocusAreas: string[];
} {
  if (entries.length === 0) {
    return {
      commonKeywords: [],
      persistentImprovementAreas: [],
      progressiveSuccessAreas: [],
      sentimentTrend: 'stable',
      mostDiscussedFocusAreas: []
    };
  }
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Analyze each entry
  const analyses = sortedEntries.map(entry => analyzeJournalEntry(entry));
  
  // Find common keywords
  const keywordCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  const commonKeywords = Object.entries(keywordCounts)
    .filter(([_, count]) => count >= Math.max(2, Math.ceil(entries.length * 0.3)))
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);
  
  // Find persistent improvement areas
  const improvementAreaCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.improvementAreas.forEach(area => {
      improvementAreaCounts[area] = (improvementAreaCounts[area] || 0) + 1;
    });
  });
  
  const persistentImprovementAreas = Object.entries(improvementAreaCounts)
    .filter(([_, count]) => count >= Math.max(2, Math.ceil(entries.length * 0.3)))
    .sort((a, b) => b[1] - a[1])
    .map(([area]) => area);
  
  // Track areas that started as improvement areas but became success areas
  const progressiveSuccessAreas: string[] = [];
  const recentEntries = sortedEntries.slice(0, Math.min(3, sortedEntries.length));
  const olderEntries = sortedEntries.slice(Math.min(3, sortedEntries.length));
  
  if (olderEntries.length > 0) {
    const recentAnalyses = recentEntries.map(entry => analyzeJournalEntry(entry));
    const olderAnalyses = olderEntries.map(entry => analyzeJournalEntry(entry));
    
    const recentSuccessSet = new Set<string>();
    recentAnalyses.forEach(analysis => {
      analysis.successAreas.forEach(area => recentSuccessSet.add(area));
    });
    
    const olderImprovementSet = new Set<string>();
    olderAnalyses.forEach(analysis => {
      analysis.improvementAreas.forEach(area => olderImprovementSet.add(area));
    });
    
    // Areas that were improvement needs in older entries but successes in recent ones
    Array.from(recentSuccessSet).forEach(area => {
      if (olderImprovementSet.has(area)) {
        progressiveSuccessAreas.push(area);
      }
    });
  }
  
  // Determine sentiment trend
  let sentimentTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (analyses.length >= 3) {
    const recentSentiments = analyses.slice(0, Math.ceil(analyses.length / 2))
      .map(a => a.sentimentScore);
    const olderSentiments = analyses.slice(Math.ceil(analyses.length / 2))
      .map(a => a.sentimentScore);
    
    const recentAvg = recentSentiments.reduce((sum, val) => sum + val, 0) / recentSentiments.length;
    const olderAvg = olderSentiments.reduce((sum, val) => sum + val, 0) / olderSentiments.length;
    
    if (recentAvg > olderAvg + 0.15) {
      sentimentTrend = 'improving';
    } else if (recentAvg < olderAvg - 0.15) {
      sentimentTrend = 'declining';
    }
  }
  
  // Find most discussed focus areas
  const focusAreaCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.focusAreas.forEach(area => {
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });
  });
  
  const mostDiscussedFocusAreas = Object.entries(focusAreaCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([area]) => area);
  
  return {
    commonKeywords,
    persistentImprovementAreas,
    progressiveSuccessAreas,
    sentimentTrend,
    mostDiscussedFocusAreas
  };
}