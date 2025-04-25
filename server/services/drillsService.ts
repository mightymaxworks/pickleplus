/**
 * PKL-278651-SAGE-0009-DRILLS - Drills Service
 * 
 * This service provides CRUD operations for managing pickleball drills
 * and related drill recommendations. It also includes drill search and 
 * recommendation logic for SAGE integration.
 */

import { 
  PickleballDrill, InsertPickleballDrill, 
  pickleballDrills, DrillFeedback, 
  drillFeedback, DrillRecommendation, 
  drillRecommendations, SkillLevel, Category,
  drillGenerationParams, InsertDrillGenerationParam
} from '@shared/schema/drills';
import { db } from '../db';
import { eq, and, or, like, desc, SQL, sql } from 'drizzle-orm';
import { JournalEntry } from '@shared/schema/journal';
import { analyzeJournalEntry } from './journalAnalyzer';

/**
 * DrillSearchParams type for filtering drill search
 */
interface DrillSearchParams {
  category?: Category;
  skillLevel?: SkillLevel;
  focusArea?: string;
  minDuration?: number;
  maxDuration?: number;
  participants?: number;
  keyword?: string;
  status?: 'active' | 'archived' | 'draft';
  limit?: number;
  offset?: number;
}

/**
 * DrillRecommendationParams type for customizing recommendations
 */
interface DrillRecommendationParams {
  userId: number;
  skillLevel?: SkillLevel;
  category?: Category;
  focusAreas?: string[];
  relatedRules?: string[];
  conversationId?: string;
  journalEntries?: JournalEntry[];
  limit?: number;
}

/**
 * Main drills service class
 */
export class DrillsService {
  /**
   * Create a new drill
   */
  async createDrill(drill: InsertPickleballDrill): Promise<PickleballDrill> {
    const [newDrill] = await db.insert(pickleballDrills)
      .values(drill)
      .returning();
    
    return newDrill;
  }
  
  /**
   * Get a drill by ID
   */
  async getDrillById(id: number): Promise<PickleballDrill | undefined> {
    const [drill] = await db.select()
      .from(pickleballDrills)
      .where(eq(pickleballDrills.id, id));
    
    return drill;
  }
  
  /**
   * Update a drill
   */
  async updateDrill(id: number, updates: Partial<PickleballDrill>): Promise<PickleballDrill | undefined> {
    // Add last modified timestamp
    const updatedDrill = {
      ...updates,
      lastModifiedAt: new Date()
    };
    
    const [updated] = await db.update(pickleballDrills)
      .set(updatedDrill)
      .where(eq(pickleballDrills.id, id))
      .returning();
    
    return updated;
  }
  
  /**
   * Archive a drill (soft delete)
   */
  async archiveDrill(id: number): Promise<boolean> {
    const [archived] = await db.update(pickleballDrills)
      .set({ 
        status: 'archived',
        lastModifiedAt: new Date()
      })
      .where(eq(pickleballDrills.id, id))
      .returning();
    
    return !!archived;
  }
  
  /**
   * Search drills based on various parameters
   */
  async searchDrills(params: DrillSearchParams): Promise<{
    drills: PickleballDrill[];
    total: number;
  }> {
    const {
      category, skillLevel, focusArea, minDuration, maxDuration,
      participants, keyword, status = 'active', limit = 20, offset = 0
    } = params;
    
    // Build the where conditions
    const conditions: SQL[] = [eq(pickleballDrills.status, status)];
    
    if (category) {
      conditions.push(eq(pickleballDrills.category, category));
    }
    
    if (skillLevel) {
      conditions.push(eq(pickleballDrills.skillLevel, skillLevel));
    }
    
    if (focusArea) {
      // Array contains check for PostgreSQL
      conditions.push(sql`${pickleballDrills.focusAreas} @> ARRAY[${focusArea}]`);
    }
    
    if (minDuration !== undefined) {
      conditions.push(sql`${pickleballDrills.duration} >= ${minDuration}`);
    }
    
    if (maxDuration !== undefined) {
      conditions.push(sql`${pickleballDrills.duration} <= ${maxDuration}`);
    }
    
    if (participants !== undefined) {
      conditions.push(eq(pickleballDrills.participants, participants));
    }
    
    if (keyword) {
      conditions.push(
        or(
          like(pickleballDrills.name, `%${keyword}%`),
          like(pickleballDrills.setupInstructions, `%${keyword}%`)
        )
      );
    }
    
    // Get total count for pagination
    const [countResult] = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(pickleballDrills)
    .where(and(...conditions));
    
    const total = countResult?.count || 0;
    
    // Get the drills
    const drills = await db.select()
      .from(pickleballDrills)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(pickleballDrills.createdAt));
    
    return { drills, total };
  }
  
  /**
   * Submit feedback for a drill
   */
  async submitDrillFeedback(feedback: {
    drillId: number;
    userId: number;
    rating: number;
    comment?: string;
    helpfulnessRating?: number;
    difficultyRating?: number;
  }): Promise<DrillFeedback> {
    const [newFeedback] = await db.insert(drillFeedback)
      .values({
        ...feedback,
        completedAt: new Date()
      })
      .returning();

    // Update average rating on the drill
    await this.updateDrillAverageRating(feedback.drillId);
    
    return newFeedback;
  }
  
  /**
   * Update the average rating for a drill
   */
  private async updateDrillAverageRating(drillId: number): Promise<void> {
    const [result] = await db.select({
      avgRating: sql<number>`AVG(${drillFeedback.rating})`
    })
    .from(drillFeedback)
    .where(eq(drillFeedback.drillId, drillId));
    
    if (result?.avgRating) {
      await db.update(pickleballDrills)
        .set({ 
          averageFeedbackRating: Math.round(result.avgRating * 10) / 10,
          lastModifiedAt: new Date()
        })
        .where(eq(pickleballDrills.id, drillId));
    }
  }
  
  /**
   * Record a drill recommendation
   */
  async recordDrillRecommendation(recommendation: {
    drillId: number;
    userId: number;
    conversationId?: string;
    context?: string;
  }): Promise<DrillRecommendation> {
    const [newRecommendation] = await db.insert(drillRecommendations)
      .values(recommendation)
      .returning();
    
    // Update recommendation count on the drill
    await db.update(pickleballDrills)
      .set({ 
        recommendationCount: sql`${pickleballDrills.recommendationCount} + 1`,
        lastRecommendedAt: new Date()
      })
      .where(eq(pickleballDrills.id, recommendation.drillId));
    
    return newRecommendation;
  }
  
  /**
   * Update drill recommendation status (viewed, saved, completed)
   */
  async updateDrillRecommendationStatus(id: number, updates: {
    viewed?: boolean;
    saved?: boolean;
    completed?: boolean;
  }): Promise<DrillRecommendation | undefined> {
    const [updated] = await db.update(drillRecommendations)
      .set(updates)
      .where(eq(drillRecommendations.id, id))
      .returning();
    
    return updated;
  }
  
  /**
   * Find the most suitable drills based on various parameters
   */
  async recommendDrills(params: DrillRecommendationParams): Promise<PickleballDrill[]> {
    const {
      userId, skillLevel, category, focusAreas = [],
      relatedRules = [], journalEntries = [], limit = 3
    } = params;
    
    // Base conditions - only recommend active drills
    const conditions: SQL[] = [eq(pickleballDrills.status, 'active')];
    
    // Add skill level filter if provided
    if (skillLevel) {
      conditions.push(eq(pickleballDrills.skillLevel, skillLevel));
    }
    
    // Add category filter if provided
    if (category) {
      conditions.push(eq(pickleballDrills.category, category));
    }
    
    // Get the drills that match our basic criteria
    let drills = await db.select()
      .from(pickleballDrills)
      .where(and(...conditions));
    
    // Calculate relevance score for each drill
    const scoredDrills = drills.map(drill => {
      let score = 0;
      
      // Higher score for matching focus areas
      focusAreas.forEach(area => {
        if (drill.focusAreas.includes(area)) {
          score += 2;
        }
      });
      
      // Higher score for matching related rules
      relatedRules.forEach(rule => {
        if (drill.relatedRules?.includes(rule)) {
          score += 3;
        }
      });
      
      // Add journal analysis insights for more personalized scoring
      if (journalEntries.length > 0) {
        const journalScores = this.scoreBasedOnJournals(drill, journalEntries);
        score += journalScores;
      }
      
      // Higher ratings get a small boost
      if (drill.averageFeedbackRating) {
        score += (drill.averageFeedbackRating - 3) * 0.5; // -1 to +1 range
      }
      
      return { drill, score };
    });
    
    // Sort by score (highest first) and take the top N
    scoredDrills.sort((a, b) => b.score - a.score);
    const recommendations = scoredDrills.slice(0, limit).map(item => item.drill);
    
    // Record these recommendations
    for (const drill of recommendations) {
      await this.recordDrillRecommendation({
        drillId: drill.id,
        userId,
        conversationId: params.conversationId,
        context: `Focus areas: ${focusAreas.join(', ')}, Rules: ${relatedRules.join(', ')}`
      });
    }
    
    return recommendations;
  }
  
  /**
   * Score drills based on journal entries
   */
  private scoreBasedOnJournals(drill: PickleballDrill, journals: JournalEntry[]): number {
    let score = 0;
    
    // Analyze the most recent journal entries
    const recentJournals = journals.slice(0, 5);
    
    for (const journal of recentJournals) {
      const analysis = analyzeJournalEntry(journal);
      
      // Match drill focus areas with journal keywords
      for (const keyword of analysis.keywords) {
        if (drill.focusAreas.some(area => area.includes(keyword) || keyword.includes(area))) {
          score += 1;
        }
        
        // Check drill name and instructions for keyword matches
        if (drill.name.toLowerCase().includes(keyword.toLowerCase()) ||
            drill.setupInstructions.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.5;
        }
      }
      
      // Match drill focus with improvement areas from journal
      for (const area of analysis.improvementAreas) {
        if (drill.focusAreas.some(focus => focus.includes(area) || area.includes(focus))) {
          score += 2; // Higher score for improvement areas
        }
      }
      
      // Consider sentiment - recommend encouraging drills for negative sentiment
      if (analysis.sentimentScore < -0.3 && drill.coachingTips?.some(tip => 
          tip.toLowerCase().includes('confidence') || 
          tip.toLowerCase().includes('progress') ||
          tip.toLowerCase().includes('success'))) {
        score += 1;
      }
    }
    
    return score;
  }
  
  /**
   * Request AI drill generation
   */
  async requestDrillGeneration(params: InsertDrillGenerationParam): Promise<number> {
    const [result] = await db.insert(drillGenerationParams)
      .values(params)
      .returning();
    
    return result.id;
  }
  
  /**
   * Update AI generation result
   */
  async updateDrillGenerationResult(id: number, resultDrillId: number): Promise<boolean> {
    const [updated] = await db.update(drillGenerationParams)
      .set({ 
        resultDrillId,
        status: 'completed'
      })
      .where(eq(drillGenerationParams.id, id))
      .returning();
    
    return !!updated;
  }
  
  /**
   * Update AI generation error
   */
  async updateDrillGenerationError(id: number, error: string): Promise<boolean> {
    const [updated] = await db.update(drillGenerationParams)
      .set({ 
        error,
        status: 'failed'
      })
      .where(eq(drillGenerationParams.id, id))
      .returning();
    
    return !!updated;
  }
}

// Export a singleton instance
export const drillsService = new DrillsService();