/**
 * PKL-278651-SAGE-0009-DRILLS - SAGE Drills Integration
 * 
 * This service integrates the SAGE coaching system with the pickleball drills
 * database to provide personalized training recommendations.
 */

import { drillsService } from './drillsService';
import { PickleballDrill } from '@shared/schema/drills';
import { JournalEntry } from '@shared/schema/journal';
import { PickleballRule } from './simple-pickleball-rules';
import { findRelevantJournalEntries, JournalReferenceSummary } from './sageJournalIntegration';

// Flexible JournalEntry for integration with different types
export interface FlexibleJournalEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood?: string | null;
  skillLevel?: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Allow for additional properties
}

export interface DrillRecommendationContext {
  query: string;
  playerLevel?: 'beginner' | 'intermediate' | 'advanced';
  journals?: FlexibleJournalEntry[];
  matchingRules?: PickleballRule[];
}

export interface DrillRecommendationResult {
  drills: PickleballDrill[];
  recommendationText: string;
  recommendationConfidence: number;
  focusAreas: string[];
}

/**
 * SAGE Drills Integration Service
 */
export class SageDrillsIntegration {
  /**
   * Get drill recommendations based on a conversation query
   */
  async getRecommendationsForQuery(
    context: DrillRecommendationContext,
    userId: number,
    conversationId?: string
  ): Promise<DrillRecommendationResult> {
    const { query, playerLevel = 'intermediate', journals = [], matchingRules = [] } = context;
    
    // Extract focus areas from the query and journals
    const focusAreas = this.extractFocusAreas(query, journals);
    
    // Extract related rules IDs
    const relatedRuleIds = matchingRules.map(rule => rule.id);
    
    // Get drill recommendations
    const drills = await drillsService.recommendDrills({
      userId,
      skillLevel: playerLevel,
      focusAreas,
      relatedRules: relatedRuleIds,
      journalEntries: journals,
      conversationId,
      limit: 3
    });
    
    // Generate recommendation text
    const recommendationText = this.generateRecommendationText(
      drills, query, focusAreas, playerLevel, journals.length > 0
    );
    
    // Calculate confidence level
    const recommendationConfidence = this.calculateRecommendationConfidence(
      drills, focusAreas, relatedRuleIds.length, journals.length > 0
    );
    
    return {
      drills,
      recommendationText,
      recommendationConfidence,
      focusAreas
    };
  }
  
  /**
   * Extract focus areas from query and journals
   */
  private extractFocusAreas(query: string, journals: FlexibleJournalEntry[]): string[] {
    const focusAreas: Set<string> = new Set();
    
    // Standard focus areas that we recognize in queries
    const focusAreaKeywords: Record<string, string[]> = {
      'technical': ['technique', 'skill', 'stroke', 'hit', 'serve', 'dink', 'volley', 'backhand', 'forehand'],
      'footwork': ['footwork', 'foot', 'movement', 'position', 'step', 'stance'],
      'kitchen': ['kitchen', 'non-volley', 'nvz', 'net', 'court position'],
      'strategy': ['strategy', 'tactic', 'plan', 'approach', 'pattern'],
      'consistency': ['consistency', 'consistent', 'error', 'mistake', 'fault'],
      'accuracy': ['accuracy', 'accurate', 'precision', 'target', 'aim'],
      'power': ['power', 'strength', 'force', 'hard', 'speed'],
      'mental': ['mental', 'focus', 'concentrate', 'confidence', 'pressure', 'stress'],
      'doubles': ['partner', 'team', 'doubles', 'communicate', 'coordination']
    };
    
    // Check query for focus area keywords
    const lowerQuery = query.toLowerCase();
    for (const [area, keywords] of Object.entries(focusAreaKeywords)) {
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          focusAreas.add(area);
          break; // Once we match a keyword for an area, move to the next area
        }
      }
    }
    
    // If journals are provided, extract focus areas from them
    if (journals.length > 0) {
      // Get journal relevance
      const journalRef = findRelevantJournalEntries(query, journals);
      
      // Add focus areas from journal analysis
      journalRef.keyInsights.forEach(insight => {
        for (const [area, keywords] of Object.entries(focusAreaKeywords)) {
          for (const keyword of keywords) {
            if (insight.toLowerCase().includes(keyword)) {
              focusAreas.add(area);
              break;
            }
          }
        }
      });
    }
    
    // If we couldn't identify any focus areas, add defaults based on common query categories
    if (focusAreas.size === 0) {
      if (lowerQuery.includes('kitchen') || lowerQuery.includes('non-volley') || lowerQuery.includes('nvz')) {
        focusAreas.add('kitchen');
      } else if (lowerQuery.includes('serve') || lowerQuery.includes('service')) {
        focusAreas.add('technical');
        focusAreas.add('consistency');
      } else if (lowerQuery.includes('double bounce') || lowerQuery.includes('two bounce')) {
        focusAreas.add('footwork');
        focusAreas.add('consistency');
      } else {
        // Default fallback
        focusAreas.add('consistency');
      }
    }
    
    return Array.from(focusAreas);
  }
  
  /**
   * Generate recommendation text based on drills and context
   */
  private generateRecommendationText(
    drills: PickleballDrill[],
    query: string,
    focusAreas: string[],
    playerLevel: string,
    hasJournals: boolean
  ): string {
    if (drills.length === 0) {
      return "I don't have any specific drills to recommend for this topic at the moment. Would you like me to suggest some general pickleball practice strategies instead?";
    }
    
    let text = "";
    
    // Introduction that references the query context
    if (query.toLowerCase().includes('kitchen') || focusAreas.includes('kitchen')) {
      text += "Based on your interest in kitchen/non-volley zone play, ";
    } else if (query.toLowerCase().includes('serve') || query.toLowerCase().includes('service')) {
      text += "To help improve your serving technique, ";
    } else if (query.toLowerCase().includes('double bounce') || query.toLowerCase().includes('two bounce')) {
      text += "For working on your double bounce rule discipline, ";
    } else {
      text += `To help with your ${focusAreas.join(' and ')} skills, `;
    }
    
    // Add personalization if we have journal entries
    if (hasJournals) {
      text += "and considering the challenges you've mentioned in your journal, ";
    }
    
    // Main recommendation text
    text += `I'd recommend ${drills.length > 1 ? 'these' : 'this'} ${playerLevel}-level drill${drills.length > 1 ? 's' : ''}:\n\n`;
    
    // Add drill details
    drills.forEach((drill, index) => {
      text += `${index + 1}. **${drill.name}** - ${this.summarizeDrill(drill)}\n\n`;
    });
    
    // Add call to action
    text += "Would you like more details on any of these drills or would you prefer recommendations for a different skill area?";
    
    return text;
  }
  
  /**
   * Create a brief summary of a drill
   */
  private summarizeDrill(drill: PickleballDrill): string {
    // Format duration
    const duration = drill.duration === 1 
      ? "1 minute" 
      : `${drill.duration} minutes`;
    
    // Format participants
    const participants = drill.participants === 1
      ? "solo drill"
      : drill.participants === 2
        ? "partner drill" 
        : "group drill";
    
    // Main summary
    let summary = `A ${duration} ${participants} focusing on ${drill.focusAreas.slice(0, 2).join(' and ')}`;
    
    // Add equipment if relevant
    if (drill.equipment.length > 0 && 
        !drill.equipment.every(e => e === 'paddle' || e === 'ball' || e === 'court')) {
      const specialEquipment = drill.equipment.filter(
        e => e !== 'paddle' && e !== 'ball' && e !== 'court'
      );
      if (specialEquipment.length > 0) {
        summary += ` (requires ${specialEquipment.join(', ')})`;
      }
    }
    
    // Add a key success metric
    if (drill.successMetrics && drill.successMetrics.length > 0) {
      summary += `. Success goal: ${drill.successMetrics[0]}`;
    }
    
    return summary;
  }
  
  /**
   * Calculate confidence level in our recommendations
   */
  private calculateRecommendationConfidence(
    drills: PickleballDrill[],
    focusAreas: string[],
    matchingRuleCount: number,
    hasJournals: boolean
  ): number {
    // Base confidence starts at 0.5
    let confidence = 0.5;
    
    // No drills = very low confidence
    if (drills.length === 0) {
      return 0.1;
    }
    
    // More drills = higher confidence (up to +0.2)
    confidence += Math.min(0.2, drills.length * 0.1);
    
    // Clear focus areas = higher confidence
    confidence += Math.min(0.2, focusAreas.length * 0.05);
    
    // Matching rules = higher confidence
    confidence += Math.min(0.1, matchingRuleCount * 0.05);
    
    // Journal data = higher confidence
    if (hasJournals) {
      confidence += 0.1;
    }
    
    // Well-rated drills = higher confidence
    const averageRating = drills.reduce((sum, drill) => 
      sum + (drill.averageFeedbackRating || 3), 0) / drills.length;
    
    if (averageRating > 4) {
      confidence += 0.1;
    } else if (averageRating < 3) {
      confidence -= 0.1;
    }
    
    return Math.min(0.95, Math.max(0.1, confidence));
  }
  
  /**
   * Generate detailed instructions for a specific drill
   */
  getDetailedDrillInstructions(drill: PickleballDrill): string {
    let instructions = `# ${drill.name}\n\n`;
    
    // Basic information
    instructions += `**Level:** ${drill.skillLevel}\n`;
    instructions += `**Category:** ${drill.category}\n`;
    instructions += `**Focus Areas:** ${drill.focusAreas.join(', ')}\n`;
    instructions += `**Duration:** ${drill.duration} minutes\n`;
    instructions += `**Participants:** ${drill.participants}\n`;
    instructions += `**Equipment Needed:** ${drill.equipment.join(', ')}\n\n`;
    
    // Setup
    instructions += `## Setup\n${drill.setupInstructions}\n\n`;
    
    // Execution steps
    instructions += "## Steps\n";
    drill.executionSteps.forEach((step, index) => {
      instructions += `${index + 1}. ${step}\n`;
    });
    instructions += "\n";
    
    // Success metrics
    instructions += "## Success Metrics\n";
    drill.successMetrics.forEach(metric => {
      instructions += `- ${metric}\n`;
    });
    instructions += "\n";
    
    // Progression options
    if (drill.progressionOptions && drill.progressionOptions.length > 0) {
      instructions += "## Progression Options\n";
      drill.progressionOptions.forEach(option => {
        instructions += `- ${option}\n`;
      });
      instructions += "\n";
    }
    
    // Coaching tips
    if (drill.coachingTips && drill.coachingTips.length > 0) {
      instructions += "## Coaching Tips\n";
      drill.coachingTips.forEach(tip => {
        instructions += `- ${tip}\n`;
      });
    }
    
    return instructions;
  }
}

// Export a singleton instance
export const sageDrillsIntegration = new SageDrillsIntegration();