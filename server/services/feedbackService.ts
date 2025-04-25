/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback Service
 * 
 * This service handles operations related to the comprehensive feedback system
 * that will drive continuous improvement of drills and training plans in SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import { db } from '../db';
import { 
  enhancedFeedback, 
  feedbackImprovementPlans, 
  feedbackImplementations,
  feedbackAnalytics,
  feedbackNotifications,
  userFeedbackParticipation,
  type EnhancedFeedback,
  type InsertEnhancedFeedback,
  type FeedbackImprovementPlan,
  type InsertFeedbackImprovementPlan,
  type FeedbackImplementation,
  type InsertFeedbackImplementation,
  FeedbackTypeEnum,
  FeedbackSentimentEnum
} from '../../shared/schema/feedback';
import { eq, and, inArray, desc, gte, lte, sql } from 'drizzle-orm';

/**
 * Submit new feedback for a drill, training plan, or other item
 */
export async function submitFeedback(feedbackData: InsertEnhancedFeedback): Promise<EnhancedFeedback> {
  // Insert the feedback
  const [insertedFeedback] = await db
    .insert(enhancedFeedback)
    .values(feedbackData)
    .returning();
  
  // Update user's feedback participation stats
  await updateUserFeedbackStats(feedbackData.userId);
  
  // Update item's average rating
  await updateItemRatingStats(feedbackData.itemType, feedbackData.itemId);
  
  // Analyze feedback for sentiment (simplified version - in real implementation would use NLP)
  await analyzeFeedbackSentiment(insertedFeedback.id);
  
  return insertedFeedback;
}

/**
 * Update existing feedback
 */
export async function updateFeedback(id: number, feedbackData: Partial<InsertEnhancedFeedback>): Promise<EnhancedFeedback> {
  const [updatedFeedback] = await db
    .update(enhancedFeedback)
    .set({
      ...feedbackData,
      updatedAt: new Date()
    })
    .where(eq(enhancedFeedback.id, id))
    .returning();
  
  // Update item's average rating if ratings were changed
  if (
    feedbackData.overallRating !== undefined || 
    feedbackData.clarityRating !== undefined || 
    feedbackData.difficultyRating !== undefined || 
    feedbackData.enjoymentRating !== undefined || 
    feedbackData.effectivenessRating !== undefined
  ) {
    await updateItemRatingStats(updatedFeedback.itemType, updatedFeedback.itemId);
  }
  
  return updatedFeedback;
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: number): Promise<EnhancedFeedback | undefined> {
  const [feedback] = await db
    .select()
    .from(enhancedFeedback)
    .where(eq(enhancedFeedback.id, id))
    .limit(1);
  
  return feedback;
}

/**
 * Get all feedback for a specific item
 */
export async function getFeedbackForItem(itemType: string, itemId: number, options: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} = {}): Promise<{data: EnhancedFeedback[], total: number}> {
  const { limit = 20, offset = 0, sortBy = 'createdAt', sortDirection = 'desc' } = options;
  
  // Get the total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(enhancedFeedback)
    .where(and(
      eq(enhancedFeedback.itemType, itemType),
      eq(enhancedFeedback.itemId, itemId)
    ));
  
  // Get the paginated data
  const feedbackItems = await db
    .select()
    .from(enhancedFeedback)
    .where(and(
      eq(enhancedFeedback.itemType, itemType),
      eq(enhancedFeedback.itemId, itemId)
    ))
    .orderBy(desc(enhancedFeedback.createdAt))
    .limit(limit)
    .offset(offset);
  
  return {
    data: feedbackItems,
    total: count
  };
}

/**
 * Get all feedback submitted by a user
 */
export async function getUserFeedback(userId: number, options: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} = {}): Promise<{data: EnhancedFeedback[], total: number}> {
  const { limit = 20, offset = 0, sortBy = 'createdAt', sortDirection = 'desc' } = options;
  
  // Get the total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(enhancedFeedback)
    .where(eq(enhancedFeedback.userId, userId));
  
  // Get the paginated data
  const feedbackItems = await db
    .select()
    .from(enhancedFeedback)
    .where(eq(enhancedFeedback.userId, userId))
    .orderBy(desc(enhancedFeedback.createdAt))
    .limit(limit)
    .offset(offset);
  
  return {
    data: feedbackItems,
    total: count
  };
}

/**
 * Create a new improvement plan based on feedback
 */
export async function createImprovementPlan(planData: InsertFeedbackImprovementPlan): Promise<FeedbackImprovementPlan> {
  const [insertedPlan] = await db
    .insert(feedbackImprovementPlans)
    .values(planData)
    .returning();
  
  // Update feedback status to 'reviewed' for all feedback IDs in the plan
  if (planData.feedbackIds && planData.feedbackIds.length > 0) {
    await db
      .update(enhancedFeedback)
      .set({
        status: 'reviewed',
        reviewedBy: planData.createdBy,
        reviewedAt: new Date()
      })
      .where(inArray(enhancedFeedback.id, planData.feedbackIds));
  }
  
  return insertedPlan;
}

/**
 * Implement changes from an improvement plan
 */
export async function implementChanges(improvementPlanId: number, implementationData: Omit<InsertFeedbackImplementation, 'improvementPlanId'>): Promise<FeedbackImplementation> {
  // Get the plan
  const [plan] = await db
    .select()
    .from(feedbackImprovementPlans)
    .where(eq(feedbackImprovementPlans.id, improvementPlanId));
  
  if (!plan) {
    throw new Error(`Improvement plan with ID ${improvementPlanId} not found`);
  }
  
  // Insert the implementation record
  const [implementation] = await db
    .insert(feedbackImplementations)
    .values({
      ...implementationData,
      improvementPlanId
    })
    .returning();
  
  // Update the plan status
  await db
    .update(feedbackImprovementPlans)
    .set({
      status: 'completed',
      completedAt: new Date()
    })
    .where(eq(feedbackImprovementPlans.id, improvementPlanId));
  
  // Update feedback statuses
  if (plan.feedbackIds && plan.feedbackIds.length > 0) {
    await db
      .update(enhancedFeedback)
      .set({
        status: 'implemented'
      })
      .where(inArray(enhancedFeedback.id, plan.feedbackIds));
  }
  
  return implementation;
}

/**
 * Notify users that their feedback led to changes
 */
export async function notifyUsers(implementationId: number, message: string): Promise<void> {
  // Get the implementation
  const [implementation] = await db
    .select()
    .from(feedbackImplementations)
    .where(eq(feedbackImplementations.id, implementationId));
  
  if (!implementation) {
    throw new Error(`Implementation with ID ${implementationId} not found`);
  }
  
  // Get the plan
  const [plan] = await db
    .select()
    .from(feedbackImprovementPlans)
    .where(eq(feedbackImprovementPlans.id, implementation.improvementPlanId));
  
  if (!plan || !plan.feedbackIds || plan.feedbackIds.length === 0) {
    return;
  }
  
  // Get the feedback items to find user IDs
  const feedbackItems = await db
    .select()
    .from(enhancedFeedback)
    .where(inArray(enhancedFeedback.id, plan.feedbackIds));
  
  // Create notifications for each user
  const uniqueUserIds = [...new Set(feedbackItems.map(f => f.userId))];
  
  for (const userId of uniqueUserIds) {
    const userFeedbackIds = feedbackItems
      .filter(f => f.userId === userId)
      .map(f => f.id);
    
    if (userFeedbackIds.length > 0) {
      // Insert a notification for this user
      await db
        .insert(feedbackNotifications)
        .values({
          userId,
          feedbackId: userFeedbackIds[0], // Just reference the first feedback for simplicity
          implementationId,
          message,
          sentAt: new Date()
        });
      
      // Update user participation stats
      await db
        .update(userFeedbackParticipation)
        .set({
          helpfulFeedbackCount: sql`helpful_feedback_count + 1`
        })
        .where(eq(userFeedbackParticipation.user_id, userId));
    }
  }
  
  // Mark implementation as having notified users
  await db
    .update(feedbackImplementations)
    .set({
      notifiedUsers: true
    })
    .where(eq(feedbackImplementations.id, implementationId));
}

/**
 * Get analytics for an item (drill, training plan, etc.)
 */
export async function getItemAnalytics(itemType: string, itemId: number): Promise<any> {
  // Check if we have pre-calculated analytics
  const [existingAnalytics] = await db
    .select()
    .from(feedbackAnalytics)
    .where(and(
      eq(feedbackAnalytics.itemType, itemType),
      eq(feedbackAnalytics.itemId, itemId)
    ));
  
  if (existingAnalytics) {
    return existingAnalytics;
  }
  
  // If not, calculate them on the fly
  const feedbackItems = await db
    .select()
    .from(enhancedFeedback)
    .where(and(
      eq(enhancedFeedback.itemType, itemType),
      eq(enhancedFeedback.itemId, itemId)
    ));
  
  if (feedbackItems.length === 0) {
    return {
      itemType,
      itemId,
      averageRatings: {
        overall: null,
        clarity: null,
        difficulty: null,
        enjoyment: null,
        effectiveness: null
      },
      ratingCounts: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      feedbackCount: 0,
      sentimentBreakdown: {
        positive: 0,
        negative: 0,
        neutral: 0,
        mixed: 0
      }
    };
  }
  
  // Calculate average ratings
  const totalRatings = {
    overall: 0,
    clarity: 0,
    difficulty: 0,
    enjoyment: 0,
    effectiveness: 0
  };
  
  const validRatingCounts = {
    overall: 0,
    clarity: 0,
    difficulty: 0,
    enjoyment: 0,
    effectiveness: 0
  };
  
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };
  
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0
  };
  
  for (const feedback of feedbackItems) {
    // Overall rating
    totalRatings.overall += feedback.overallRating;
    validRatingCounts.overall++;
    ratingDistribution[feedback.overallRating as 1|2|3|4|5]++;
    
    // Clarity rating
    if (feedback.clarityRating) {
      totalRatings.clarity += feedback.clarityRating;
      validRatingCounts.clarity++;
    }
    
    // Difficulty rating
    if (feedback.difficultyRating) {
      totalRatings.difficulty += feedback.difficultyRating;
      validRatingCounts.difficulty++;
    }
    
    // Enjoyment rating
    if (feedback.enjoymentRating) {
      totalRatings.enjoyment += feedback.enjoymentRating;
      validRatingCounts.enjoyment++;
    }
    
    // Effectiveness rating
    if (feedback.effectivenessRating) {
      totalRatings.effectiveness += feedback.effectivenessRating;
      validRatingCounts.effectiveness++;
    }
    
    // Sentiment
    if (feedback.sentiment) {
      sentimentCounts[feedback.sentiment as keyof typeof sentimentCounts]++;
    }
  }
  
  const averageRatings = {
    overall: validRatingCounts.overall > 0 ? totalRatings.overall / validRatingCounts.overall : null,
    clarity: validRatingCounts.clarity > 0 ? totalRatings.clarity / validRatingCounts.clarity : null,
    difficulty: validRatingCounts.difficulty > 0 ? totalRatings.difficulty / validRatingCounts.difficulty : null,
    enjoyment: validRatingCounts.enjoyment > 0 ? totalRatings.enjoyment / validRatingCounts.enjoyment : null,
    effectiveness: validRatingCounts.effectiveness > 0 ? totalRatings.effectiveness / validRatingCounts.effectiveness : null
  };
  
  const sentimentBreakdown = {
    positive: feedbackItems.length > 0 ? sentimentCounts.positive / feedbackItems.length : 0,
    negative: feedbackItems.length > 0 ? sentimentCounts.negative / feedbackItems.length : 0,
    neutral: feedbackItems.length > 0 ? sentimentCounts.neutral / feedbackItems.length : 0,
    mixed: feedbackItems.length > 0 ? sentimentCounts.mixed / feedbackItems.length : 0
  };
  
  // Generate analytics object
  const analytics = {
    itemType,
    itemId,
    averageRatings,
    ratingCounts: ratingDistribution,
    feedbackCount: feedbackItems.length,
    sentimentBreakdown
  };
  
  return analytics;
}

// Helper functions

/**
 * Update a user's feedback participation stats
 */
async function updateUserFeedbackStats(userId: number): Promise<void> {
  // Check if the user already has a participation record
  const [participation] = await db
    .select()
    .from(userFeedbackParticipation)
    .where(eq(userFeedbackParticipation.user_id, userId));
  
  if (participation) {
    // Update existing record
    await db
      .update(userFeedbackParticipation)
      .set({
        totalFeedbackSubmitted: participation.totalFeedbackSubmitted + 1,
        lastFeedbackAt: new Date()
      })
      .where(eq(userFeedbackParticipation.user_id, userId));
  } else {
    // Create new record
    await db
      .insert(userFeedbackParticipation)
      .values({
        user_id: userId,
        totalFeedbackSubmitted: 1,
        helpfulFeedbackCount: 0,
        lastFeedbackAt: new Date()
      });
  }
}

/**
 * Update the average rating for an item based on all feedback
 */
async function updateItemRatingStats(itemType: string, itemId: number): Promise<void> {
  // For drills, we'll update the averageFeedbackRating in the pickleballDrills table
  if (itemType === 'drill') {
    const [{ avgRating }] = await db
      .select({
        avgRating: sql<number>`avg(overall_rating)`
      })
      .from(enhancedFeedback)
      .where(and(
        eq(enhancedFeedback.itemType, 'drill'),
        eq(enhancedFeedback.itemId, itemId)
      ));
    
    if (avgRating) {
      // Update the drill's average rating
      await db.execute(sql`
        UPDATE pickleball_drills
        SET average_feedback_rating = ${Math.round(avgRating)}
        WHERE id = ${itemId}
      `);
    }
  }
  
  // Update or insert analytics record
  const analytics = await getItemAnalytics(itemType, itemId);
  
  // Check if we already have an analytics record
  const [existingAnalytics] = await db
    .select()
    .from(feedbackAnalytics)
    .where(and(
      eq(feedbackAnalytics.itemType, itemType),
      eq(feedbackAnalytics.itemId, itemId)
    ));
  
  if (existingAnalytics) {
    // Update existing record
    await db
      .update(feedbackAnalytics)
      .set({
        averageRatings: analytics.averageRatings,
        ratingCounts: analytics.ratingCounts,
        feedbackCount: analytics.feedbackCount,
        sentimentBreakdown: analytics.sentimentBreakdown,
        lastUpdatedAt: new Date()
      })
      .where(and(
        eq(feedbackAnalytics.itemType, itemType),
        eq(feedbackAnalytics.itemId, itemId)
      ));
  } else {
    // Insert new record
    await db
      .insert(feedbackAnalytics)
      .values({
        itemType,
        itemId,
        averageRatings: analytics.averageRatings,
        ratingCounts: analytics.ratingCounts,
        feedbackCount: analytics.feedbackCount,
        sentimentBreakdown: analytics.sentimentBreakdown,
        lastUpdatedAt: new Date()
      });
  }
}

/**
 * Analyze feedback text for sentiment (simplified version)
 * In a real implementation, this would use NLP or call an external API
 */
async function analyzeFeedbackSentiment(feedbackId: number): Promise<void> {
  const [feedback] = await db
    .select()
    .from(enhancedFeedback)
    .where(eq(enhancedFeedback.id, feedbackId));
  
  if (!feedback) return;
  
  // This is a very simple implementation for demonstration
  // In reality, you would use a proper NLP service or library
  let sentiment: typeof FeedbackSentimentEnum._type = 'neutral';
  let keywords: string[] = [];
  
  // Combine all text fields
  const textFields = [
    feedback.positiveFeedback || '',
    feedback.improvementFeedback || '',
    feedback.specificChallenges || '',
    feedback.suggestions || ''
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Simple keyword extraction - in reality, would use NLP techniques
  const possibleKeywords = [
    'clear', 'unclear', 'difficult', 'easy', 'fun', 'boring', 'effective',
    'ineffective', 'helpful', 'unhelpful', 'challenging', 'simple',
    'confusing', 'intuitive', 'engaging', 'time-consuming', 'quick',
    'frustrating', 'rewarding', 'repetitive', 'innovative', 'practical',
    'impractical', 'enjoyed', 'disliked', 'improvement', 'video', 'instructions'
  ];
  
  for (const keyword of possibleKeywords) {
    if (textFields.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // Simple sentiment analysis - in reality, would use NLP
  const positiveWords = ['good', 'great', 'excellent', 'helpful', 'effective', 'clear', 'fun', 'enjoyed', 'easy', 'like', 'positive', 'useful', 'valuable'];
  const negativeWords = ['bad', 'poor', 'unhelpful', 'ineffective', 'unclear', 'boring', 'difficult', 'confusing', 'disliked', 'hate', 'negative', 'useless', 'waste'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (textFields.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (textFields.includes(word)) negativeCount++;
  }
  
  if (positiveCount > 0 && negativeCount > 0) {
    sentiment = 'mixed';
  } else if (positiveCount > 0) {
    sentiment = 'positive';
  } else if (negativeCount > 0) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  // Find similar feedback (simplified implementation)
  const similarFeedbackIds: number[] = [];
  
  // Update the feedback with the analysis results
  await db
    .update(enhancedFeedback)
    .set({
      sentiment,
      keywords,
      similarFeedbackIds,
      // Simple actionable insights generation based on sentiment and keywords
      actionableInsights: generateActionableInsights(sentiment, keywords, feedback.overallRating)
    })
    .where(eq(enhancedFeedback.id, feedbackId));
}

/**
 * Generate actionable insights based on sentiment analysis (simplified)
 * In reality, would use more sophisticated NLP and ML techniques
 */
function generateActionableInsights(
  sentiment: typeof FeedbackSentimentEnum._type,
  keywords: string[],
  rating: number
): string | null {
  if (keywords.length === 0) return null;
  
  const insights: string[] = [];
  
  // Low ratings with negative sentiment
  if (rating <= 2 && (sentiment === 'negative' || sentiment === 'mixed')) {
    if (keywords.includes('unclear') || keywords.includes('confusing')) {
      insights.push('Instructions may need clarification.');
    }
    
    if (keywords.includes('difficult') || keywords.includes('challenging')) {
      insights.push('Consider adjusting difficulty level or providing more guidance.');
    }
    
    if (keywords.includes('boring') || keywords.includes('repetitive')) {
      insights.push('Consider adding more variety or engaging elements.');
    }
    
    if (keywords.includes('time-consuming')) {
      insights.push('Look for ways to streamline the activity.');
    }
  }
  
  // Mid ratings with mixed sentiment
  if (rating === 3 && sentiment === 'mixed') {
    if (keywords.includes('video')) {
      insights.push('Consider enhancing video demonstrations.');
    }
    
    if (keywords.includes('instructions')) {
      insights.push('Instructions may benefit from more detail or examples.');
    }
    
    if (keywords.includes('challenging')) {
      insights.push('Consider offering progressive difficulty options.');
    }
  }
  
  // High ratings with positive sentiment - improvement opportunities
  if (rating >= 4 && sentiment === 'positive') {
    if (keywords.includes('fun') || keywords.includes('engaging')) {
      insights.push('The engaging aspects could be emphasized in similar activities.');
    }
    
    if (keywords.includes('effective') || keywords.includes('helpful')) {
      insights.push('Consider using similar teaching methods in other activities.');
    }
  }
  
  return insights.length > 0 ? insights.join(' ') : null;
}