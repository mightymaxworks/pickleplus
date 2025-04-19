/**
 * PKL-278651-COMM-0022-XP
 * Community XP Integration Module
 * 
 * This module integrates the Community Hub with the XP System,
 * awarding XP for community activities like creating posts, comments,
 * attending events, etc.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { xpTransactions, XP_SOURCE } from '../../../shared/schema/xp';
import { 
  communityActivities, 
  CommunityActivityType 
} from '../../../shared/schema/community-engagement';
// Import the ServerEventBus from the core events directory
// The file exists at server/core/events/server-event-bus.ts as verified
import { ServerEventBus, ServerEvents } from '../../core/events/server-event-bus';
import { ActivityMultiplierService } from './ActivityMultiplierService';

/**
 * XP values for different community activities
 * Maps activity types to their XP rewards
 */
export const COMMUNITY_XP_VALUES: Record<string, number> = {
  // Basic activities - using exact string values from CommunityActivityType enum
  [CommunityActivityType.POST_CREATED]: 5,
  [CommunityActivityType.COMMENT_ADDED]: 2,
  [CommunityActivityType.REACTION_ADDED]: 1,
  
  // Event-related activities
  [CommunityActivityType.EVENT_ATTENDED]: 5,
  'EVENT_CREATED': 10, // Special case not in enum
  
  // Community-building activities
  [CommunityActivityType.INVITATION_SENT]: 2,
  'CREATE_COMMUNITY': 25, // Special case not in enum
  'JOIN_COMMUNITY': 5,    // Special case not in enum
  
  // Engagement and quality
  [CommunityActivityType.PROFILE_UPDATED]: 3,
  [CommunityActivityType.DAILY_LOGIN]: 1,
  'FEATURED_POST': 15,     // Special case not in enum
  'WEEKLY_CONTRIBUTOR': 20,// Special awards
  'MONTHLY_CONTRIBUTOR': 50// Special awards
};

export class CommunityXpIntegration {
  private multiplierService: ActivityMultiplierService;
  
  constructor(multiplierService: ActivityMultiplierService) {
    this.multiplierService = multiplierService;
    this.setupEventListeners();
    
    // Initialize default multipliers for community activities
    this.multiplierService.initializeDefaultMultipliers()
      .then(() => console.log('[XP] Community multipliers initialized'))
      .catch(err => console.error('[XP] Error initializing community multipliers:', err));
      
    console.log('[XP] Community XP Integration initialized - Framework 5.1');
  }
  
  /**
   * Set up event listeners for community activities
   */
  private setupEventListeners() {
    console.log('[XP] Setting up community activity event listeners');

    // Listen for community activity events
    ServerEventBus.subscribe(ServerEvents.COMMUNITY_ACTIVITY_CREATED, async (data: {
      userId: number;
      communityId: number;
      activityType: CommunityActivityType | string; // Allow string to be more flexible with event types
      activityId?: number;
      metadata?: Record<string, any>;
    }) => {
      console.log(`[XP] Received community activity event: ${data.activityType} for user ${data.userId}`);
      await this.handleCommunityActivity(
        data.userId,
        data.communityId,
        data.activityType as any,
        data.activityId,
        data.metadata
      );
    });
    
    // Listen for other community-related events
    ServerEventBus.subscribe(ServerEvents.COMMUNITY_POST_CREATED, async (data: {
      userId: number;
      communityId: number;
      postId: number;
    }) => {
      await this.handleCommunityActivity(
        data.userId,
        data.communityId,
        CommunityActivityType.POST_CREATED,
        data.postId
      );
    });
    
    ServerEventBus.subscribe(ServerEvents.COMMUNITY_COMMENT_CREATED, async (data: {
      userId: number;
      communityId: number;
      commentId: number;
    }) => {
      await this.handleCommunityActivity(
        data.userId,
        data.communityId,
        CommunityActivityType.COMMENT_ADDED,
        data.commentId
      );
    });
    
    ServerEventBus.subscribe(ServerEvents.COMMUNITY_EVENT_ATTENDED, async (data: {
      userId: number;
      communityId: number;
      eventId: number;
    }) => {
      await this.handleCommunityActivity(
        data.userId,
        data.communityId,
        CommunityActivityType.EVENT_ATTENDED,
        data.eventId
      );
    });
  }
  
  /**
   * Handle a community activity and award XP
   */
  async handleCommunityActivity(
    userId: number,
    communityId: number,
    activityType: CommunityActivityType,
    activityId?: number,
    metadata?: Record<string, any>
  ) {
    try {
      // Determine XP amount based on activity type
      let baseXp = 0;
      
      // Look up XP value from our mapping
      baseXp = COMMUNITY_XP_VALUES[activityType] || 1;
      
      if (baseXp === 1 && !COMMUNITY_XP_VALUES[activityType]) {
        console.log(`[XP] Unknown activity type: ${activityType}, awarding default XP`);
      }
      
      // Apply PicklePulse multiplier
      const finalXp = await this.multiplierService.calculateXpForActivity(
        'community_' + activityType, 
        baseXp
      );
      
      // Award XP
      await this.awardCommunityXp(
        userId,
        finalXp,
        activityType,
        communityId,
        activityId,
        metadata
      );
      
      console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for ${activityType} in community ${communityId}`);
      
      return finalXp;
    } catch (error) {
      console.error('[XP] Error awarding community XP:', error);
      return 0;
    }
  }
  
  /**
   * Award XP for a community activity
   */
  private async awardCommunityXp(
    userId: number,
    amount: number,
    activityType: string,
    communityId: number,
    activityId?: number,
    metadata?: Record<string, any>
  ) {
    try {
      // Get user's current XP from users table
      const result = await db.execute(
        sql`SELECT xp FROM users WHERE id = ${userId}`
      );
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Parse the xp value from the result, ensuring it's a number
      const currentXp = (result.rows[0].xp !== null && result.rows[0].xp !== undefined) 
        ? Number(result.rows[0].xp) 
        : 0;
      
      // Add the amount to calculate the new total
      const newTotal = currentXp + amount;
      
      // Create XP transaction
      await db.insert(xpTransactions).values({
        userId,
        amount,
        source: XP_SOURCE.COMMUNITY,
        sourceType: activityType,
        sourceId: activityId,
        communityId,
        runningTotal: newTotal,
        description: `Community activity: ${activityType}`,
        metadata: metadata || {}
      });
      
      // Update user's XP
      await db.execute(
        sql`UPDATE users SET xp = ${newTotal} WHERE id = ${userId}`
      );
      
      // Check for level up (will be handled by a trigger or separate process)
      
      // Emit XP awarded event
      ServerEventBus.emit(ServerEvents.XP_AWARDED, {
        userId,
        amount,
        source: XP_SOURCE.COMMUNITY,
        sourceType: activityType,
        newTotal
      });
      
      return newTotal;
    } catch (error) {
      console.error('[XP] Error in awardCommunityXp:', error);
      throw error;
    }
  }
}

// Export constants for use in other modules
export { CommunityActivityType } from '../../../shared/schema/community-engagement';