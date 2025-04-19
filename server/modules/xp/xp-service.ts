/**
 * PKL-278651-XP-0001-FOUND
 * XP Service
 * 
 * Core service for XP management, including awarding XP, tracking XP progress,
 * and determining user levels.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { ServerEventBus } from '../../core/events/server-event-bus';
import { eq, desc, asc, sql, and, gte } from 'drizzle-orm';
import { 
  xpTransactions, 
  xpLevelThresholds,
  users
} from '@shared/schema';

export interface AwardXpParams {
  userId: number;
  amount: number;
  source: string;
  sourceId?: string;
  sourceType?: string;
  description?: string;
}

export class XpService {
  /**
   * Award XP to a user
   */
  async awardXp(params: AwardXpParams): Promise<void> {
    try {
      const { userId, amount, source, sourceId, sourceType, description } = params;
      
      if (amount <= 0) {
        console.warn(`[XP] Cannot award non-positive XP amount: ${amount}`);
        return;
      }
      
      const now = new Date();
      
      // Insert XP transaction record
      const [xpTransaction] = await db.insert(xpTransactions).values({
        userId,
        amount,
        source,
        sourceId: sourceId || null,
        sourceType: sourceType || null,
        description: description || null,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      // Emit event for awarded XP
      ServerEventBus.publish('xp:awarded', {
        userId,
        amount,
        source,
        sourceId,
        sourceType,
        transactionId: xpTransaction.id,
        timestamp: now
      });
      
      console.log(`[XP] Awarded ${amount} XP to user ${userId} from ${source}`);
      
      // Check for level up
      await this.checkForLevelUp(userId);
    } catch (error) {
      console.error('[XP] Error awarding XP:', error);
      throw error;
    }
  }
  
  /**
   * Check if user leveled up and emit event if so
   */
  private async checkForLevelUp(userId: number): Promise<void> {
    try {
      // Get total XP for the user
      const totalXpResult = await db
        .select({
          totalXp: sql<number>`SUM(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const totalXp = totalXpResult[0]?.totalXp || 0;
      
      // Get level thresholds in ascending order
      const levelThresholds = await db.query.xpLevelThresholds.findMany({
        orderBy: (fields, { asc }) => [asc(fields.xpRequired)]
      });
      
      // Determine user's current level
      let currentLevel = 1;
      let previousLevel = 1;
      
      // Update current level based on XP thresholds
      if (levelThresholds && levelThresholds.length > 0) {
        for (const threshold of levelThresholds) {
          if (totalXp >= threshold.xpRequired) {
            previousLevel = currentLevel;
            currentLevel = threshold.level;
          } else {
            break;
          }
        }
      }
      
      // Update user's level in database if changed
      if (currentLevel > previousLevel) {
        // Emit level up event
        ServerEventBus.publish('xp:levelup', {
          userId,
          previousLevel,
          newLevel: currentLevel,
          totalXp,
          timestamp: new Date()
        });
        
        console.log(`[XP] User ${userId} leveled up from ${previousLevel} to ${currentLevel}`);
      }
    } catch (error) {
      console.error('[XP] Error checking for level up:', error);
    }
  }
  
  /**
   * Get XP information for a user
   */
  async getUserXpInfo(userId: number) {
    try {
      // Get total XP for the user
      const totalXpResult = await db
        .select({
          totalXp: sql<number>`SUM(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const totalXp = totalXpResult[0]?.totalXp || 0;
      
      // Get level thresholds in ascending order
      const levelThresholds = await db.query.xpLevelThresholds.findMany({
        orderBy: (fields, { asc }) => [asc(fields.xpRequired)]
      });
      
      // Determine user's current level and next level
      let currentLevel = 1;
      let nextLevel = 2;
      let currentLevelXp = 0;
      let nextLevelXp = 100;
      let currentLevelInfo = null;
      let nextLevelInfo = null;
      
      if (levelThresholds && levelThresholds.length > 0) {
        for (let i = 0; i < levelThresholds.length; i++) {
          if (totalXp >= levelThresholds[i].xpRequired) {
            currentLevel = levelThresholds[i].level;
            currentLevelXp = levelThresholds[i].xpRequired;
            currentLevelInfo = levelThresholds[i];
            
            if (i < levelThresholds.length - 1) {
              nextLevel = levelThresholds[i + 1].level;
              nextLevelXp = levelThresholds[i + 1].xpRequired;
              nextLevelInfo = levelThresholds[i + 1];
            } else {
              // Max level reached
              nextLevel = currentLevel;
              nextLevelXp = currentLevelXp;
              nextLevelInfo = currentLevelInfo;
            }
          } else {
            if (i > 0) {
              currentLevelInfo = levelThresholds[i - 1];
            }
            nextLevelInfo = levelThresholds[i];
            nextLevel = levelThresholds[i].level;
            nextLevelXp = levelThresholds[i].xpRequired;
            break;
          }
        }
      }
      
      // Calculate XP progress percentage to next level
      const xpForCurrentLevel = currentLevelXp;
      const xpForNextLevel = nextLevelXp;
      const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
      const currentXpProgress = totalXp - xpForCurrentLevel;
      const progressPercentage = xpNeededForNextLevel > 0
        ? Math.min(100, Math.floor((currentXpProgress / xpNeededForNextLevel) * 100))
        : 100;
      
      return {
        userId,
        totalXp,
        currentLevel,
        nextLevel,
        xpForCurrentLevel,
        xpForNextLevel,
        xpNeededForNextLevel,
        currentXpProgress,
        progressPercentage,
        currentLevelInfo,
        nextLevelInfo
      };
    } catch (error) {
      console.error('[XP] Error getting user XP info:', error);
      throw error;
    }
  }
  
  /**
   * Get XP transaction history for a user
   */
  async getUserXpTransactionHistory(userId: number, limit = 10, offset = 0) {
    try {
      const transactions = await db.query.xpTransactions.findMany({
        where: eq(xpTransactions.userId, userId),
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        limit,
        offset
      });
      
      // Get total count for pagination
      const totalCountResult = await db
        .select({
          count: sql<number>`COUNT(*)`
        })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const totalCount = totalCountResult[0]?.count || 0;
      
      return {
        transactions,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      console.error('[XP] Error getting user XP transaction history:', error);
      throw error;
    }
  }
  
  /**
   * Get XP leaderboard
   */
  async getXpLeaderboard(limit = 10, offset = 0) {
    try {
      // Get users with their total XP
      const usersWithXp = await db
        .select({
          userId: xpTransactions.userId,
          totalXp: sql<number>`SUM(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .groupBy(xpTransactions.userId)
        .orderBy(desc(sql<number>`SUM(${xpTransactions.amount})`))
        .limit(limit)
        .offset(offset);
      
      // Get user details for the leaderboard
      const leaderboardEntries = await Promise.all(
        usersWithXp.map(async (entry) => {
          const userResult = await db.query.users.findFirst({
            where: eq(users.id, entry.userId),
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          });
          
          const userXpInfo = await this.getUserXpInfo(entry.userId);
          
          return {
            userId: entry.userId,
            username: userResult?.username,
            displayName: userResult?.displayName || userResult?.username,
            avatarUrl: userResult?.avatarUrl,
            totalXp: entry.totalXp,
            level: userXpInfo.currentLevel
          };
        })
      );
      
      // Get total count for pagination
      const totalCountResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${xpTransactions.userId})`
        })
        .from(xpTransactions);
      
      const totalCount = totalCountResult[0]?.count || 0;
      
      return {
        leaderboard: leaderboardEntries,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      console.error('[XP] Error getting XP leaderboard:', error);
      throw error;
    }
  }
}