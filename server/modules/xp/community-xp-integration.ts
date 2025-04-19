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
 */

import { db } from '../../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { xpTransactions, XP_SOURCE } from '../../../shared/schema/xp';
import { 
  communityActivities, 
  CommunityActivityType 
} from '../../../shared/schema/community-engagement';
import { ServerEventBus, ServerEvents } from '../../core/events/server-event-bus';
import { ActivityMultiplierService } from './ActivityMultiplierService';

// XP values for different community activities
export const COMMUNITY_XP_VALUES = {
  // Basic activities
  POST_CREATED: 5,  // Matches CommunityActivityType.POST_CREATED
  COMMENT_ADDED: 2, // Matches CommunityActivityType.COMMENT_ADDED
  REACTION_ADDED: 1,  // Matches CommunityActivityType.REACTION_ADDED
  
  // Event-related activities
  EVENT_CREATED: 10, // Currently not in enum but should be added
  EVENT_ATTENDED: 5, // Matches CommunityActivityType.EVENT_ATTENDED
  
  // Community-building activities
  CREATE_COMMUNITY: 25, // Currently not in enum but should be added
  JOIN_COMMUNITY: 5,    // Currently not in enum but should be added
  INVITATION_SENT: 2,   // Matches CommunityActivityType.INVITATION_SENT
  
  // Engagement and quality
  PROFILE_UPDATED: 3,    // Matches CommunityActivityType.PROFILE_UPDATED
  DAILY_LOGIN: 1,        // Matches CommunityActivityType.DAILY_LOGIN
  FEATURED_POST: 15,     // Currently not in enum but should be added
  WEEKLY_CONTRIBUTOR: 20,// Special awards not in basic enum
  MONTHLY_CONTRIBUTOR: 50// Special awards not in basic enum
};

export class CommunityXpIntegration {
  private multiplierService: ActivityMultiplierService;
  
  constructor(multiplierService: ActivityMultiplierService) {
    this.multiplierService = multiplierService;
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for community activities
   */
  private setupEventListeners() {
    // Listen for community activity events
    ServerEventBus.subscribe(ServerEvents.COMMUNITY_ACTIVITY_CREATED, async (data: {
      userId: number;
      communityId: number;
      activityType: CommunityActivityType;
      activityId?: number;
      metadata?: Record<string, any>;
    }) => {
      await this.handleCommunityActivity(
        data.userId,
        data.communityId,
        data.activityType,
        data.activityId,
        data.metadata
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
      
      switch (activityType) {
        case CommunityActivityType.POST_CREATED:
          baseXp = COMMUNITY_XP_VALUES.POST_CREATED;
          break;
        case CommunityActivityType.COMMENT_ADDED:
          baseXp = COMMUNITY_XP_VALUES.COMMENT_ADDED;
          break;
        case CommunityActivityType.REACTION_ADDED:
          baseXp = COMMUNITY_XP_VALUES.REACTION_ADDED;
          break;
        case CommunityActivityType.EVENT_ATTENDED:
          baseXp = COMMUNITY_XP_VALUES.EVENT_ATTENDED;
          break;
        case CommunityActivityType.PROFILE_UPDATED:
          baseXp = COMMUNITY_XP_VALUES.PROFILE_UPDATED;
          break;
        case CommunityActivityType.INVITATION_SENT:
          baseXp = COMMUNITY_XP_VALUES.INVITATION_SENT;
          break;
        case CommunityActivityType.DAILY_LOGIN:
          baseXp = COMMUNITY_XP_VALUES.DAILY_LOGIN;
          break;
        // Handle special cases not in the enum
        case 'EVENT_CREATED' as any:
          baseXp = COMMUNITY_XP_VALUES.EVENT_CREATED;
          break;
        case 'CREATE_COMMUNITY' as any:
          baseXp = COMMUNITY_XP_VALUES.CREATE_COMMUNITY;
          break;
        case 'JOIN_COMMUNITY' as any:
          baseXp = COMMUNITY_XP_VALUES.JOIN_COMMUNITY;
          break;
        case 'FEATURED_POST' as any:
          baseXp = COMMUNITY_XP_VALUES.FEATURED_POST;
          break;
        default:
          baseXp = 1; // Default minimal XP
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
      // Get user's current XP
      const [userXp] = await db
        .select({ xp: sql<number>`xp` })
        .from(sql.raw('users'))
        .where(eq(sql.raw('id'), userId));
      
      if (!userXp) {
        throw new Error(`User ${userId} not found`);
      }
      
      const currentXp = userXp.xp || 0;
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
      await db
        .update(sql.raw('users'))
        .set({ xp: newTotal })
        .where(eq(sql.raw('id'), userId));
      
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