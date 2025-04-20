/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement API Routes
 * 
 * This module defines API routes for accessing community engagement metrics,
 * including member activity, participation metrics, and leaderboards.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 */

import express, { Request, Response } from 'express';
import { communityEngagementStorage } from './engagement-storage';
import { isAuthenticated } from '../../auth';
import { insertCommunityActivitySchema, CommunityActivityType } from '@shared/schema/community-engagement';
import { db } from '../../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Create router
const router = express.Router();

/**
 * Record a new community activity
 * POST /api/communities/:communityId/engagement/activity
 */
router.post('/:communityId/engagement/activity', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = req.user!.id;
    
    // Validate input
    const validation = insertCommunityActivitySchema.safeParse({
      ...req.body,
      userId,
      communityId
    });
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid activity data', 
        errors: validation.error.flatten()
      });
    }
    
    // Record the activity
    const activity = await communityEngagementStorage.recordActivity(validation.data);
    
    res.status(201).json(activity);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error recording activity:', error);
    res.status(500).json({ message: 'Failed to record activity' });
  }
});

/**
 * Get top contributors for a community
 * GET /api/communities/:communityId/engagement/top-contributors
 */
router.get('/:communityId/engagement/top-contributors', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Get top contributors
    const contributors = await communityEngagementStorage.getTopContributors(communityId, limit);
    
    // Fetch user details for each contributor
    const contributorsWithDetails = await Promise.all(
      contributors.map(async (contributor) => {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        })
        .from(users)
        .where(eq(users.id, contributor.userId));
        
        // Return combined data
        return {
          ...contributor,
          user: user ? user : null
        };
      })
    );
    
    res.json(contributorsWithDetails);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching top contributors:', error);
    res.status(500).json({ message: 'Failed to fetch top contributors' });
  }
});

/**
 * Get recent activities in a community
 * GET /api/communities/:communityId/engagement/recent-activities
 */
router.get('/:communityId/engagement/recent-activities', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    // Get recent activities
    const activities = await communityEngagementStorage.getRecentActivities(communityId, limit);
    
    // Fetch user details for each activity
    const activitiesWithUserDetails = await Promise.all(
      activities.map(async (activity) => {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        })
        .from(users)
        .where(eq(users.id, activity.userId));
        
        // Return combined data
        return {
          ...activity,
          user: user ? user : null
        };
      })
    );
    
    res.json(activitiesWithUserDetails);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching recent activities:', error);
    res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
});

/**
 * Get user's engagement metrics for a community
 * GET /api/communities/:communityId/engagement/user/:userId
 */
router.get('/:communityId/engagement/user/:userId', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = parseInt(req.params.userId);
    
    // Get user engagement metrics
    const metrics = await communityEngagementStorage.getUserEngagement(userId, communityId);
    
    if (!metrics) {
      return res.status(404).json({ message: 'Engagement metrics not found' });
    }
    
    // Get user details
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, userId));
    
    // Get engagement levels for context
    const levels = await communityEngagementStorage.getEngagementLevels(communityId);
    
    // Find current level and next level
    const currentLevelIndex = levels.findIndex(level => level.levelName === metrics.engagementLevel);
    const nextLevel = levels[currentLevelIndex + 1] || null;
    
    // Calculate points needed for next level
    const pointsToNextLevel = nextLevel 
      ? nextLevel.pointThreshold - metrics.totalPoints 
      : 0;
    
    res.json({
      metrics,
      user: user || null,
      currentLevel: levels[currentLevelIndex] || null,
      nextLevel,
      pointsToNextLevel
    });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching user engagement:', error);
    res.status(500).json({ message: 'Failed to fetch user engagement metrics' });
  }
});

/**
 * Get current user's engagement metrics for a community
 * GET /api/communities/:communityId/engagement/me
 */
router.get('/:communityId/engagement/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = req.user!.id;
    
    // Get user engagement metrics
    const metrics = await communityEngagementStorage.getUserEngagement(userId, communityId);
    
    if (!metrics) {
      return res.status(404).json({ message: 'Engagement metrics not found' });
    }
    
    // Get engagement levels for context
    const levels = await communityEngagementStorage.getEngagementLevels(communityId);
    
    // Find current level and next level
    const currentLevelIndex = levels.findIndex(level => level.levelName === metrics.engagementLevel);
    const nextLevel = levels[currentLevelIndex + 1] || null;
    
    // Calculate points needed for next level
    const pointsToNextLevel = nextLevel 
      ? nextLevel.pointThreshold - metrics.totalPoints 
      : 0;
    
    res.json({
      metrics,
      currentLevel: levels[currentLevelIndex] || null,
      nextLevel,
      pointsToNextLevel
    });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching user engagement:', error);
    res.status(500).json({ message: 'Failed to fetch user engagement metrics' });
  }
});

/**
 * Get community activity summary (counts by type)
 * GET /api/communities/:communityId/engagement/summary
 */
router.get('/:communityId/engagement/summary', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Get activity summary
    const summary = await communityEngagementStorage.getCommunityActivitySummary(communityId);
    
    res.json(summary);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching activity summary:', error);
    res.status(500).json({ message: 'Failed to fetch activity summary' });
  }
});

/**
 * Get community activity trends (daily counts)
 * GET /api/communities/:communityId/engagement/trends
 */
router.get('/:communityId/engagement/trends', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    // Get activity trends
    const trends = await communityEngagementStorage.getCommunityActivityTrends(communityId, days);
    
    res.json(trends);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching activity trends:', error);
    res.status(500).json({ message: 'Failed to fetch activity trends' });
  }
});

/**
 * Get all engagement levels for a community
 * GET /api/communities/:communityId/engagement/levels
 */
router.get('/:communityId/engagement/levels', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Get engagement levels
    const levels = await communityEngagementStorage.getEngagementLevels(communityId);
    
    res.json(levels);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching engagement levels:', error);
    res.status(500).json({ message: 'Failed to fetch engagement levels' });
  }
});

/**
 * Get community leaderboard
 * GET /api/communities/:communityId/engagement/leaderboard
 * PKL-278651-COMM-0021-ENGAGE: Leaderboard API implementation
 */
router.get('/:communityId/engagement/leaderboard', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const leaderboardType = (req.query.type as string) || 'overall';
    const timePeriod = (req.query.period as string) || 'week';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    // Validate leaderboard type
    const validTypes = ['overall', 'posts', 'comments', 'events'];
    if (!validTypes.includes(leaderboardType)) {
      return res.status(400).json({ 
        message: 'Invalid leaderboard type', 
        validTypes
      });
    }
    
    // Validate time period
    const validPeriods = ['day', 'week', 'month', 'year', 'all-time'];
    if (!validPeriods.includes(timePeriod)) {
      return res.status(400).json({ 
        message: 'Invalid time period', 
        validPeriods
      });
    }
    
    // Get leaderboard data
    const leaderboard = await communityEngagementStorage.getCommunityLeaderboard(
      communityId,
      leaderboardType,
      timePeriod,
      limit
    );
    
    res.json(leaderboard);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get user's position in a community leaderboard
 * GET /api/communities/:communityId/engagement/leaderboard/position
 * PKL-278651-COMM-0021-ENGAGE: User leaderboard position endpoint
 */
router.get('/:communityId/engagement/leaderboard/position', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = req.user!.id;
    const leaderboardType = (req.query.type as string) || 'overall';
    const timePeriod = (req.query.period as string) || 'week';
    
    // Get user's position
    const position = await communityEngagementStorage.getUserLeaderboardPosition(
      userId,
      communityId,
      leaderboardType,
      timePeriod
    );
    
    if (!position) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }
    
    res.json(position);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error fetching user leaderboard position:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard position' });
  }
});

/**
 * Generate or refresh a community leaderboard
 * POST /api/communities/:communityId/engagement/leaderboard/generate
 * PKL-278651-COMM-0021-ENGAGE: Leaderboard generation endpoint
 */
router.post('/:communityId/engagement/leaderboard/generate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const leaderboardType = (req.body.type as string) || 'overall';
    const timePeriod = (req.body.period as string) || 'week';
    
    // Check if user has permission (community admin or moderator)
    // This would typically check the user's role in the community
    
    // Generate leaderboard
    await communityEngagementStorage.generateLeaderboard(
      communityId,
      leaderboardType,
      timePeriod
    );
    
    res.status(201).json({ message: 'Leaderboard generated successfully' });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Error generating leaderboard:', error);
    res.status(500).json({ message: 'Failed to generate leaderboard' });
  }
});

// Export router
export const communityEngagementRoutes = router;