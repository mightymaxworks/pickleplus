/**
 * PKL-278651-SAGE-0009-JOURNALREF - SAGE Journal Integration Service
 * 
 * This service integrates journal analysis with the SAGE coaching system
 * to provide personalized recommendations based on journal content.
 */

import { JournalEntry } from '@shared/schema/journal';
import { FlexibleJournalEntry } from './sageDrillsIntegration';
import { analyzeJournalEntry, analyzeJournalHistory, JournalAnalysisResult } from './journalAnalyzer';
import { PickleballRule } from './simple-pickleball-rules';

export interface JournalReferenceSummary {
  relevantEntries: {
    id: number;
    date: string;
    summary: string;
    keywords: string[];
    sentiment: number;
  }[];
  keyInsights: string[];
  matchingRule?: string;
  confidenceScore: number;
}

/**
 * Generate a summary of a journal entry for use in references
 */
function summarizeEntry(entry: JournalEntry, analysis: JournalAnalysisResult): string {
  const sentences = entry.content
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Select key sentences based on keywords and sentiment
  const keywordSentences = sentences.filter(sentence => {
    return analysis.keywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    );
  });
  
  // Add sentences with improvement areas
  const improvementSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return analysis.improvementAreas.some(area => 
      lowerSentence.includes(area) || 
      lowerSentence.includes('improve') || 
      lowerSentence.includes('work on') || 
      lowerSentence.includes('struggling')
    );
  });
  
  // Add sentences with strong sentiment
  const sentimentSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const positiveTerms = ['great', 'excellent', 'amazing', 'progress', 'success'];
    const negativeTerms = ['terrible', 'awful', 'frustrated', 'struggle', 'difficult'];
    
    return positiveTerms.some(term => lowerSentence.includes(term)) ||
           negativeTerms.some(term => lowerSentence.includes(term));
  });
  
  // Combine unique sentences
  const uniqueSentences = new Set([
    ...keywordSentences, 
    ...improvementSentences,
    ...sentimentSentences
  ]);
  
  // If we have enough sentences, use them, otherwise fall back to the first few sentences
  if (uniqueSentences.size >= 2) {
    return Array.from(uniqueSentences).slice(0, 3).join(' ');
  } else {
    return sentences.slice(0, 2).join(' ');
  }
}

/**
 * Find journal entries relevant to a specific query
 */
export function findRelevantJournalEntries(
  query: string,
  entries: JournalEntry[]
): JournalReferenceSummary {
  if (!entries || entries.length === 0) {
    return {
      relevantEntries: [],
      keyInsights: [],
      confidenceScore: 0
    };
  }
  
  // Extract key terms from the query
  const queryTerms = query.toLowerCase()
    .replace(/[.,?!;:()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Analyze each journal entry
  const analyzedEntries = entries.map(entry => ({
    entry,
    analysis: analyzeJournalEntry(entry)
  }));
  
  // Score each entry for relevance to the query
  const scoredEntries = analyzedEntries.map(({ entry, analysis }) => {
    let score = 0;
    
    // Match query terms with keywords
    queryTerms.forEach(term => {
      if (analysis.keywords.some(keyword => keyword.includes(term))) {
        score += 3;
      }
      
      // Check content for query term
      if (entry.content.toLowerCase().includes(term)) {
        score += 1;
      }
    });
    
    // Higher score for entries with technical terms
    score += analysis.technicalTerms.length * 0.5;
    
    // Higher score for entries with clear improvement or success areas
    score += (analysis.improvementAreas.length + analysis.successAreas.length) * 0.5;
    
    // Higher score for recent entries
    const entryDate = new Date(entry.createdAt);
    const daysAgo = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - Math.min(5, daysAgo / 7)); // Bonus for entries in the last 5 weeks
    
    return {
      entry,
      analysis,
      score
    };
  });
  
  // Sort by relevance score
  scoredEntries.sort((a, b) => b.score - a.score);
  
  // Take top relevant entries
  const topEntries = scoredEntries.slice(0, 3);
  
  // Calculate confidence based on relevance scores
  const maxPossibleScore = 10; // Approximate max possible score
  const avgScore = topEntries.reduce((sum, item) => sum + item.score, 0) / Math.max(1, topEntries.length);
  const confidenceScore = Math.min(0.9, avgScore / maxPossibleScore);
  
  // Format relevant entries
  const relevantEntries = topEntries.map(({ entry, analysis }) => ({
    id: entry.id,
    date: new Date(entry.createdAt).toLocaleDateString(),
    summary: summarizeEntry(entry, analysis),
    keywords: analysis.keywords.slice(0, 5),
    sentiment: analysis.sentimentScore
  }));
  
  // Generate key insights
  const keyInsights = generateKeyInsights(topEntries.map(item => item.analysis), queryTerms);
  
  // Find matching rule
  const matchingRule = findMatchingRuleFromJournals(queryTerms, topEntries.map(item => item.analysis));
  
  return {
    relevantEntries,
    keyInsights,
    matchingRule,
    confidenceScore
  };
}

/**
 * Generate key insights from analyses
 */
function generateKeyInsights(
  analyses: JournalAnalysisResult[],
  queryTerms: string[]
): string[] {
  if (analyses.length === 0) return [];
  
  const insights: string[] = [];
  
  // Common improvement areas
  const improvementAreas = new Set<string>();
  analyses.forEach(analysis => {
    analysis.improvementAreas.forEach(area => improvementAreas.add(area));
  });
  
  if (improvementAreas.size > 0) {
    const areasList = Array.from(improvementAreas).slice(0, 3).join(', ');
    insights.push(`You've mentioned wanting to improve your ${areasList} in your journal.`);
  }
  
  // Success areas
  const successAreas = new Set<string>();
  analyses.forEach(analysis => {
    analysis.successAreas.forEach(area => successAreas.add(area));
  });
  
  if (successAreas.size > 0) {
    const areasList = Array.from(successAreas).slice(0, 2).join(' and ');
    insights.push(`You've noted progress in ${areasList} in your journal entries.`);
  }
  
  // Sentiment insights
  const sentiments = analyses.map(a => a.sentimentScore);
  const avgSentiment = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
  
  if (avgSentiment < -0.3) {
    insights.push('Your recent journal entries suggest some frustration with your progress.');
  } else if (avgSentiment > 0.3) {
    insights.push('Your journal entries reflect positive experiences and progress.');
  }
  
  // Focus area insights
  const focusAreaCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.focusAreas.forEach(area => {
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });
  });
  
  const topFocusAreas = Object.entries(focusAreaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([area]) => area);
  
  if (topFocusAreas.length > 0) {
    insights.push(`You've been focusing on ${topFocusAreas.join(' and ')} aspects of your game.`);
  }
  
  // Query-specific insights
  const relevantKeywords = new Set<string>();
  analyses.forEach(analysis => {
    analysis.keywords.forEach(keyword => {
      if (queryTerms.some(term => keyword.includes(term) || term.includes(keyword))) {
        relevantKeywords.add(keyword);
      }
    });
  });
  
  if (relevantKeywords.size > 0) {
    const keywordList = Array.from(relevantKeywords).slice(0, 3).join(', ');
    insights.push(`Your journal mentions ${keywordList} which is relevant to your question.`);
  }
  
  return insights;
}

/**
 * Find a rule that matches journal entries
 */
function findMatchingRuleFromJournals(
  queryTerms: string[], 
  analyses: JournalAnalysisResult[]
): string | undefined {
  // Common rule categories in pickleball
  const ruleCategories = [
    'serve', 'kitchen', 'non-volley zone', 'nvz', 
    'scoring', 'double bounce', 'fault', 'out',
    'line call', 'foot fault', 'volley'
  ];
  
  // Check if any rule categories appear in both query and journals
  const matchingRuleTerms = ruleCategories.filter(rule => {
    const ruleTerms = rule.split(' ');
    
    // Rule term appears in query
    const inQuery = ruleTerms.some(term => 
      queryTerms.includes(term) || queryTerms.some(q => q.includes(term))
    );
    
    // Rule term appears in journal keywords
    const inJournals = analyses.some(analysis => 
      analysis.keywords.some(keyword => 
        ruleTerms.some(term => keyword.includes(term))
      )
    );
    
    return inQuery && inJournals;
  });
  
  return matchingRuleTerms[0];
}

/**
 * Generate personalized rule recommendations based on journal content
 */
export function generatePersonalizedRuleRecommendations(
  rule: PickleballRule,
  entries: JournalEntry[]
): string[] {
  if (!entries || entries.length === 0) {
    return [];
  }
  
  // Analyze journal history
  const journalHistory = analyzeJournalHistory(entries);
  
  // Personalized recommendations based on rule category and journal insights
  const recommendations: string[] = [];
  
  // Kitchen rule recommendations
  if (rule.id.includes('kitchen') || rule.id.includes('non-volley')) {
    // Check if player struggles with discipline around the kitchen
    const kitchenIssues = entries.some(entry => 
      entry.content.toLowerCase().includes('kitchen fault') ||
      entry.content.toLowerCase().includes('kitchen violation') ||
      entry.content.toLowerCase().includes('step in the kitchen')
    );
    
    if (kitchenIssues) {
      recommendations.push(
        "Based on your journal entries, you might benefit from specific kitchen line awareness drills. " +
        "Try practicing dinks while keeping one foot on a line 1-2 feet behind the kitchen line."
      );
    }
    
    // Check if player mentions momentum issues
    const momentumIssues = entries.some(entry => 
      entry.content.toLowerCase().includes('momentum') ||
      entry.content.toLowerCase().includes('follow through') ||
      entry.content.toLowerCase().includes('balance')
    );
    
    if (momentumIssues) {
      recommendations.push(
        "Your journal mentions balance challenges. To avoid momentum carrying you into the kitchen, " +
        "practice volleys with a hard stop after each shot, focusing on controlling your forward movement."
      );
    }
  }
  
  // Serve rule recommendations
  if (rule.id.includes('serve')) {
    // Check if player has mentioned serve issues
    const serveIssues = entries.some(entry => 
      entry.content.toLowerCase().includes('serve fault') ||
      entry.content.toLowerCase().includes('foot fault') ||
      entry.content.toLowerCase().includes('illegal serve')
    );
    
    if (serveIssues) {
      recommendations.push(
        "I notice you've mentioned serve challenges in your journal. Try using visual markers behind the baseline " +
        "during practice to help maintain proper foot positioning on your serves."
      );
    }
    
    // Check for consistency mentions
    const consistencyMentions = journalHistory.persistentImprovementAreas.includes('consistency');
    
    if (consistencyMentions) {
      recommendations.push(
        "You've written about consistency in your journal. For more consistent serves, try reducing power " +
        "and focusing on placement accuracy, especially when serving to the backhand side."
      );
    }
  }
  
  // Double bounce rule recommendations
  if (rule.id.includes('double-bounce')) {
    // Check for mentions of double bounce issues
    const doubleBounceIssues = entries.some(entry => 
      entry.content.toLowerCase().includes('double bounce') ||
      entry.content.toLowerCase().includes('two bounce') ||
      entry.content.toLowerCase().includes('rush to net')
    );
    
    if (doubleBounceIssues) {
      recommendations.push(
        "Your journal mentions the double bounce rule. During practice, verbalize 'bounce' after each bounce " +
        "to help track the double bounce requirement and avoid premature volleying."
      );
    }
    
    // Check for patience mentions
    const patienceMentions = journalHistory.persistentImprovementAreas.includes('patience');
    
    if (patienceMentions) {
      recommendations.push(
        "I see you've been working on patience in your game. Remember that the double bounce rule " +
        "naturally enforces patience. Use this time to prepare your position rather than rushing forward."
      );
    }
  }
  
  // Scoring rule recommendations
  if (rule.id.includes('scoring')) {
    // Check for mentions of scoring confusion
    const scoringIssues = entries.some(entry => 
      entry.content.toLowerCase().includes('score confusion') ||
      entry.content.toLowerCase().includes('forgot score') ||
      entry.content.toLowerCase().includes('wrong score') ||
      entry.content.toLowerCase().includes('scoring mistake')
    );
    
    if (scoringIssues) {
      recommendations.push(
        "Your journal mentions score confusion. Practice verbally announcing the complete score " +
        "before each serve, even during casual practice sessions, to build the habit."
      );
    }
  }
  
  // General recommendations based on sentiment
  if (journalHistory.sentimentTrend === 'declining') {
    recommendations.push(
      "I notice some frustration in your recent journal entries. Remember that mastering rules " +
      "takes time. Focus on one aspect of this rule during each practice session."
    );
  }
  
  // If we have progressive success areas, acknowledge them
  if (journalHistory.progressiveSuccessAreas.length > 0) {
    recommendations.push(
      `Your journal shows great progress with ${journalHistory.progressiveSuccessAreas[0]}. ` +
      `Apply the same focused practice approach to mastering this rule.`
    );
  }
  
  return recommendations;
}

/**
 * Generate follow-up questions based on journal content
 */
export function generateJournalBasedFollowUps(
  rule: PickleballRule,
  entries: JournalEntry[]
): string[] {
  if (!entries || entries.length === 0) {
    return [];
  }
  
  const followUps: string[] = [];
  
  // Analyze entries
  const analyses = entries.map(entry => analyzeJournalEntry(entry));
  
  // Find common focus areas
  const focusAreaCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.focusAreas.forEach(area => {
      focusAreaCounts[area] = (focusAreaCounts[area] || 0) + 1;
    });
  });
  
  const topFocusAreas = Object.entries(focusAreaCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([area]) => area);
  
  // Generate follow-ups based on focus areas and rule category
  
  // Technical focus area
  if (topFocusAreas.includes('technical')) {
    if (rule.id.includes('kitchen') || rule.id.includes('non-volley')) {
      followUps.push("Would you like drills to improve your dinking technique near the kitchen line?");
    } else if (rule.id.includes('serve')) {
      followUps.push("Would you like to explore different serve techniques that can improve consistency?");
    } else if (rule.id.includes('double-bounce')) {
      followUps.push("Would you like tips on proper shot selection during the two-bounce sequence?");
    }
  }
  
  // Tactical focus area
  if (topFocusAreas.includes('tactical')) {
    if (rule.id.includes('kitchen') || rule.id.includes('non-volley')) {
      followUps.push("Would you like strategies for controlling the kitchen line without violating the rules?");
    } else if (rule.id.includes('serve')) {
      followUps.push("Would you like tactical advice on serve placement based on your opponent's position?");
    } else if (rule.id.includes('double-bounce')) {
      followUps.push("Would you like to learn about court positioning strategies during the double bounce sequence?");
    }
  }
  
  // Mental focus area
  if (topFocusAreas.includes('mental')) {
    followUps.push("Would you like mental techniques to help you maintain focus on the rules during intense play?");
  }
  
  // Check journal for specific mentions related to the rule
  const ruleTerms = rule.name.toLowerCase().split(' ');
  const ruleMentions = entries.filter(entry => 
    ruleTerms.some(term => entry.content.toLowerCase().includes(term))
  );
  
  if (ruleMentions.length > 0) {
    followUps.push("You've mentioned this rule in your journal. Would you like specific advice on the challenges you've documented?");
  }
  
  // Return unique follow-ups, or a default if none were generated
  return followUps.length > 0 ? followUps : ["Would you like more personalized advice based on your playing style?"];
}