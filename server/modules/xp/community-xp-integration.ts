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
  CREATE_POST: 5,
  CREATE_COMMENT: 2,
  LIKE_POST: 1,
  LIKE_COMMENT: 1,
  
  // Event-related activities
  CREATE_EVENT: 10,
  JOIN_EVENT: 3,
  ATTEND_EVENT: 5,
  
  // Community-building activities
  CREATE_COMMUNITY: 25,
  JOIN_COMMUNITY: 5,
  INVITE_MEMBER: 2,
  
  // Engagement and quality
  FEATURED_POST: 15,
  WEEKLY_CONTRIBUTOR: 20,
  MONTHLY_CONTRIBUTOR: 50
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
        case 'create_post':
          baseXp = COMMUNITY_XP_VALUES.CREATE_POST;
          break;
        case 'create_comment':
          baseXp = COMMUNITY_XP_VALUES.CREATE_COMMENT;
          break;
        case 'like_post':
          baseXp = COMMUNITY_XP_VALUES.LIKE_POST;
          break;
        case 'like_comment':
          baseXp = COMMUNITY_XP_VALUES.LIKE_COMMENT;
          break;
        case 'create_event':
          baseXp = COMMUNITY_XP_VALUES.CREATE_EVENT;
          break;
        case 'join_event':
          baseXp = COMMUNITY_XP_VALUES.JOIN_EVENT;
          break;
        case 'attend_event':
          baseXp = COMMUNITY_XP_VALUES.ATTEND_EVENT;
          break;
        case 'create_community':
          baseXp = COMMUNITY_XP_VALUES.CREATE_COMMUNITY;
          break;
        case 'join_community':
          baseXp = COMMUNITY_XP_VALUES.JOIN_COMMUNITY;
          break;
        case 'invite_member':
          baseXp = COMMUNITY_XP_VALUES.INVITE_MEMBER;
          break;
        case 'featured_post':
          baseXp = COMMUNITY_XP_VALUES.FEATURED_POST;
          break;
        default:
          baseXp = 1; // Default minimal XP
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