/**
 * PKL-278651-XP-0004-MATCH
 * Match XP Integration Module
 * 
 * This module integrates the Match Recording system with the XP System,
 * awarding XP for match activities like recording matches, winning matches,
 * playing first match of the day, etc.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { 
  xpTransactions,
  XP_SOURCE
} from '../../../shared/schema/xp';

import { 
  matches,
  users
} from '../../../shared/schema';

import { ServerEventBus, ServerEvents } from '../../core/events';
import { ActivityMultiplierService } from './ActivityMultiplierService';

/**
 * XP values for different match activities
 * Maps activity types to their XP rewards
 */
export const MATCH_XP_VALUES: Record<string, number> = {
  // Basic match activities
  'MATCH_RECORDED': 5,   // Recording any match
  'MATCH_WON': 2,        // Bonus for winning a match
  'FIRST_MATCH_OF_DAY': 3, // Bonus for first match of the day
  
  // Match types (bonuses)
  'TOURNAMENT_MATCH': 3, // Bonus for tournament matches
  'LEAGUE_MATCH': 2,     // Bonus for league matches
  
  // Streak bonuses
  'THREE_MATCH_STREAK': 2,  // Played 3 matches in a week
  'FIVE_MATCH_STREAK': 5,   // Played 5 matches in a week
  'TEN_MATCH_STREAK': 10,   // Played 10 matches in a week
};

export class MatchXpIntegration {
  private multiplierService: ActivityMultiplierService;
  
  constructor(multiplierService: ActivityMultiplierService) {
    this.multiplierService = multiplierService;
    this.setupEventListeners();
    
    // Initialize default multipliers for match activities
    this.multiplierService.initializeDefaultMultipliers()
      .then(() => console.log('[XP] Match multipliers initialized'))
      .catch(err => console.error('[XP] Error initializing match multipliers:', err));
      
    console.log('[XP] Match XP Integration initialized - Framework 5.1');
  }
  
  /**
   * Set up event listeners for match activities
   */
  private setupEventListeners() {
    console.log('[XP] Setting up match activity event listeners');

    // Listen for match recorded events
    ServerEventBus.subscribe(ServerEvents.MATCH_RECORDED, async (data: {
      matchId: number;
      userId: number;
      matchType?: string;
      players: Array<{id: number, role: string, winner: boolean}>;
    }) => {
      console.log(`[XP] Received match recorded event for match ${data.matchId} by user ${data.userId}`);
      
      try {
        // Award XP for recording the match to the user who recorded it
        await this.awardMatchRecordingXp(
          data.userId,
          data.matchId,
          data.matchType || 'casual'
        );
        
        // Award XP to all players in the match
        for (const player of data.players) {
          // Skip if this is the user who recorded the match (already awarded)
          if (player.id === data.userId) continue;
          
          // Award match participation XP
          await this.awardMatchParticipationXp(
            player.id,
            data.matchId,
            data.matchType || 'casual'
          );
          
          // Award bonus XP for winners
          if (player.winner) {
            await this.awardMatchWinXp(
              player.id,
              data.matchId
            );
          }
        }
        
        // Check for first match of day bonus
        await this.checkFirstMatchOfDayBonus(data.userId, data.matchId);
        
        // Check for match streaks
        await this.checkMatchStreaks(data.userId);
      } catch (error) {
        console.error('[XP] Error processing match XP:', error);
      }
    });
    
    // Add more event listeners as needed for other match-related events
  }
  
  /**
   * Award XP for recording a match
   */
  private async awardMatchRecordingXp(
    userId: number,
    matchId: number,
    matchType: string
  ): Promise<number> {
    try {
      // Base XP for recording a match
      let baseXp = MATCH_XP_VALUES['MATCH_RECORDED'];
      
      // Apply match type bonus if applicable
      if (matchType === 'tournament' && MATCH_XP_VALUES['TOURNAMENT_MATCH']) {
        baseXp += MATCH_XP_VALUES['TOURNAMENT_MATCH'];
      } else if (matchType === 'league' && MATCH_XP_VALUES['LEAGUE_MATCH']) {
        baseXp += MATCH_XP_VALUES['LEAGUE_MATCH'];
      }
      
      // Apply PicklePulse multiplier
      const finalXp = await this.multiplierService.calculateXpForActivity(
        'match_recording', 
        baseXp
      );
      
      // Award the XP
      await this.awardMatchXp(
        userId,
        finalXp,
        'MATCH_RECORDED',
        matchId,
        { matchType }
      );
      
      console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for recording match ${matchId}`);
      return finalXp;
    } catch (error) {
      console.error('[XP] Error awarding match recording XP:', error);
      return 0;
    }
  }
  
  /**
   * Award XP for participating in a match
   */
  private async awardMatchParticipationXp(
    userId: number,
    matchId: number,
    matchType: string
  ): Promise<number> {
    try {
      // Base XP for participating in a match
      let baseXp = MATCH_XP_VALUES['MATCH_RECORDED'];
      
      // Apply match type bonus if applicable
      if (matchType === 'tournament' && MATCH_XP_VALUES['TOURNAMENT_MATCH']) {
        baseXp += MATCH_XP_VALUES['TOURNAMENT_MATCH'];
      } else if (matchType === 'league' && MATCH_XP_VALUES['LEAGUE_MATCH']) {
        baseXp += MATCH_XP_VALUES['LEAGUE_MATCH'];
      }
      
      // Apply PicklePulse multiplier
      const finalXp = await this.multiplierService.calculateXpForActivity(
        'match_participation', 
        baseXp
      );
      
      // Award the XP
      await this.awardMatchXp(
        userId,
        finalXp,
        'MATCH_PARTICIPATION',
        matchId,
        { matchType }
      );
      
      console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for participating in match ${matchId}`);
      return finalXp;
    } catch (error) {
      console.error('[XP] Error awarding match participation XP:', error);
      return 0;
    }
  }
  
  /**
   * Award bonus XP for winning a match
   */
  private async awardMatchWinXp(
    userId: number,
    matchId: number
  ): Promise<number> {
    try {
      // Base XP for winning a match
      const baseXp = MATCH_XP_VALUES['MATCH_WON'];
      
      // Apply PicklePulse multiplier
      const finalXp = await this.multiplierService.calculateXpForActivity(
        'match_win', 
        baseXp
      );
      
      // Award the XP
      await this.awardMatchXp(
        userId,
        finalXp,
        'MATCH_WON',
        matchId
      );
      
      console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for winning match ${matchId}`);
      return finalXp;
    } catch (error) {
      console.error('[XP] Error awarding match win XP:', error);
      return 0;
    }
  }
  
  /**
   * Check if this is the user's first match of the day and award bonus XP if it is
   */
  private async checkFirstMatchOfDayBonus(
    userId: number,
    matchId: number
  ): Promise<number> {
    try {
      // Get the start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user has already played a match today
      const result = await db.execute(
        sql`SELECT COUNT(*) AS match_count 
            FROM ${xpTransactions} 
            WHERE user_id = ${userId} 
            AND source = ${XP_SOURCE.MATCH}
            AND source_type = 'MATCH_RECORDED'
            AND created_at >= ${today.toISOString()}`
      );
      
      // If this is the first match of the day (count = 1, the one we just recorded)
      if (result.rows && result.rows.length > 0 && Number(result.rows[0].match_count) === 1) {
        // Base XP for first match of the day
        const baseXp = MATCH_XP_VALUES['FIRST_MATCH_OF_DAY'];
        
        // Apply PicklePulse multiplier
        const finalXp = await this.multiplierService.calculateXpForActivity(
          'first_match_of_day', 
          baseXp
        );
        
        // Award the XP
        await this.awardMatchXp(
          userId,
          finalXp,
          'FIRST_MATCH_OF_DAY',
          matchId
        );
        
        console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for first match of day`);
        return finalXp;
      }
      
      return 0;
    } catch (error) {
      console.error('[XP] Error checking first match of day bonus:', error);
      return 0;
    }
  }
  
  /**
   * Check for match streak bonuses (3, 5, 10 matches in a week)
   */
  private async checkMatchStreaks(userId: number): Promise<void> {
    try {
      // Get the start of the week (last 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      // Count matches in the last week
      const result = await db.execute(
        sql`SELECT COUNT(*) AS match_count 
            FROM ${xpTransactions} 
            WHERE user_id = ${userId} 
            AND source = ${XP_SOURCE.MATCH}
            AND source_type = 'MATCH_RECORDED'
            AND created_at >= ${weekStart.toISOString()}`
      );
      
      if (!result.rows || result.rows.length === 0) return;
      
      const matchCount = Number(result.rows[0].match_count);
      
      // Check for 10-match streak (only award if exactly 10 to avoid duplicates)
      if (matchCount === 10 && MATCH_XP_VALUES['TEN_MATCH_STREAK']) {
        await this.awardMatchXp(
          userId,
          MATCH_XP_VALUES['TEN_MATCH_STREAK'],
          'TEN_MATCH_STREAK',
          null,
          { matchCount }
        );
        console.log(`[XP] Awarded ${MATCH_XP_VALUES['TEN_MATCH_STREAK']} XP to user ${userId} for 10-match streak`);
      }
      // Check for 5-match streak (only award if exactly 5 to avoid duplicates)
      else if (matchCount === 5 && MATCH_XP_VALUES['FIVE_MATCH_STREAK']) {
        await this.awardMatchXp(
          userId,
          MATCH_XP_VALUES['FIVE_MATCH_STREAK'],
          'FIVE_MATCH_STREAK',
          null,
          { matchCount }
        );
        console.log(`[XP] Awarded ${MATCH_XP_VALUES['FIVE_MATCH_STREAK']} XP to user ${userId} for 5-match streak`);
      }
      // Check for 3-match streak (only award if exactly 3 to avoid duplicates)
      else if (matchCount === 3 && MATCH_XP_VALUES['THREE_MATCH_STREAK']) {
        await this.awardMatchXp(
          userId,
          MATCH_XP_VALUES['THREE_MATCH_STREAK'],
          'THREE_MATCH_STREAK',
          null,
          { matchCount }
        );
        console.log(`[XP] Awarded ${MATCH_XP_VALUES['THREE_MATCH_STREAK']} XP to user ${userId} for 3-match streak`);
      }
    } catch (error) {
      console.error('[XP] Error checking match streaks:', error);
    }
  }
  
  /**
   * Common method to award XP for match-related activities
   */
  private async awardMatchXp(
    userId: number,
    amount: number,
    activityType: string,
    matchId: number | null,
    metadata: Record<string, any> = {}
  ): Promise<number> {
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
        source: XP_SOURCE.MATCH,
        sourceType: activityType,
        sourceId: matchId,
        runningTotal: newTotal,
        description: `Match activity: ${activityType}`,
        matchId,
        metadata: metadata || {}
      });
      
      // Update user's XP
      await db.execute(
        sql`UPDATE users SET xp = ${newTotal} WHERE id = ${userId}`
      );
      
      // Emit XP awarded event
      ServerEventBus.emit(ServerEvents.XP_AWARDED, {
        userId,
        amount,
        source: XP_SOURCE.MATCH,
        sourceType: activityType,
        newTotal
      });
      
      return newTotal;
    } catch (error) {
      console.error('[XP] Error in awardMatchXp:', error);
      throw error;
    }
  }
}