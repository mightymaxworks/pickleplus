/**
 * PKL-278651-COACH-GOALS-PHASE2-SIMPLE - Simplified Coach-Player Goal Management
 * 
 * Phase 2 implementation for coach goal management using direct SQL
 * to avoid TypeScript schema conflicts while building the core functionality.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-07-02
 */

import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';

const router = Router();

// Validation schemas
const assignGoalSchema = z.object({
  playerUserId: z.number().min(1, "Player user ID required"),
  title: z.string().min(3, "Goal title required"),
  description: z.string().optional(),
  category: z.enum(["technical", "competitive", "social", "fitness", "mental"]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  targetDate: z.string().optional(),
  milestones: z.array(z.object({
    title: z.string().min(3, "Milestone title required"),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    orderIndex: z.number().default(0)
  })).optional()
});

const updateGoalStatusSchema = z.object({
  status: z.enum(["active", "completed", "paused", "abandoned"]),
  coachNotes: z.string().optional(),
  isCoachApproved: z.boolean().optional()
});

/**
 * GET /api/coach/goals/my-players
 * Get all goals for players coached by the current coach
 */
router.get('/my-players', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    
    // Check if user is a coach
    const coachResult = await db.execute(sql`
      SELECT id, user_id, bio, specialties 
      FROM coach_profiles 
      WHERE user_id = ${userId}
      LIMIT 1
    `);
    
    if (coachResult.rows.length === 0) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    // Get all goals where this coach is assigned
    const goalsResult = await db.execute(sql`
      SELECT 
        pg.*,
        u.username, u.first_name, u.last_name, u.display_name,
        (SELECT COUNT(*) FROM goal_milestones gm WHERE gm.goal_id = pg.id) as milestone_count,
        (SELECT COUNT(*) FROM goal_milestones gm WHERE gm.goal_id = pg.id AND gm.is_completed = true) as completed_milestones
      FROM player_goals pg
      JOIN users u ON pg.user_id = u.id
      WHERE pg.coach_id = ${userId}
      ORDER BY pg.last_activity_date DESC NULLS LAST
    `);

    const goals = goalsResult.rows.map((row: any) => ({
      ...row,
      player: {
        id: row.user_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: row.display_name
      },
      milestoneStats: {
        total: parseInt(row.milestone_count) || 0,
        completed: parseInt(row.completed_milestones) || 0
      }
    }));

    const summary = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      totalPlayers: new Set(goals.map(g => g.user_id)).size
    };

    res.json({
      success: true,
      goals,
      summary
    });
  } catch (error) {
    console.error('Error fetching coach goals:', error);
    res.status(500).json({ error: "Failed to fetch coach goals" });
  }
});

/**
 * POST /api/coach/goals/assign
 * Assign a new goal to a player
 */
router.post('/assign', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    const validatedData = assignGoalSchema.parse(req.body);
    
    // Verify coach status
    const coachResult = await db.execute(sql`
      SELECT id FROM coach_profiles WHERE user_id = ${userId} LIMIT 1
    `);
    
    if (coachResult.rows.length === 0) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    // Verify player exists
    const playerResult = await db.execute(sql`
      SELECT id, username, display_name FROM users WHERE id = ${validatedData.playerUserId} LIMIT 1
    `);
    
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const player = playerResult.rows[0] as any;

    // Create the goal
    const goalResult = await db.execute(sql`
      INSERT INTO player_goals (
        user_id, coach_id, title, description, category, priority, 
        target_date, status, progress_percentage, is_coach_approved,
        coach_last_review_date, last_activity_date, created_at, updated_at
      ) VALUES (
        ${validatedData.playerUserId}, ${userId}, ${validatedData.title}, 
        ${validatedData.description || null}, ${validatedData.category}, ${validatedData.priority},
        ${validatedData.targetDate || null}, 'active', 0, true,
        NOW(), NOW(), NOW(), NOW()
      ) RETURNING *
    `);

    const newGoal = goalResult.rows[0] as any;

    // Create milestones if provided
    const milestones = [];
    if (validatedData.milestones && validatedData.milestones.length > 0) {
      for (let i = 0; i < validatedData.milestones.length; i++) {
        const milestone = validatedData.milestones[i];
        const milestoneResult = await db.execute(sql`
          INSERT INTO goal_milestones (
            goal_id, title, description, order_index, target_date, 
            coach_approval_required, created_at, updated_at
          ) VALUES (
            ${newGoal.id}, ${milestone.title}, ${milestone.description || null},
            ${milestone.orderIndex || i}, ${milestone.dueDate || null},
            true, NOW(), NOW()
          ) RETURNING *
        `);
        milestones.push(milestoneResult.rows[0]);
      }
    }

    // Create initial progress snapshot
    await db.execute(sql`
      INSERT INTO goal_progress_snapshots (
        goal_id, progress_percentage, snapshot_reason, notes, snapshot_date, created_at
      ) VALUES (
        ${newGoal.id}, 0, 'goal_created_by_coach', 
        'Goal assigned by coach', NOW(), NOW()
      )
    `);

    res.status(201).json({
      success: true,
      goal: newGoal,
      milestones,
      message: `Goal successfully assigned to ${player.display_name || player.username}`
    });
  } catch (error) {
    console.error('Error assigning goal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid goal data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to assign goal to player" });
  }
});

/**
 * PUT /api/coach/goals/:goalId/status
 * Update goal status and approval by coach
 */
router.put('/:goalId/status', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    const goalId = parseInt(req.params.goalId);
    const validatedData = updateGoalStatusSchema.parse(req.body);
    
    // Verify this coach is assigned to the goal
    const goalResult = await db.execute(sql`
      SELECT * FROM player_goals 
      WHERE id = ${goalId} AND coach_id = ${userId}
      LIMIT 1
    `);
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found or not assigned to this coach" });
    }

    // Update goal status
    const updateResult = await db.execute(sql`
      UPDATE player_goals 
      SET 
        status = ${validatedData.status},
        ${validatedData.status === 'completed' ? sql`completed_date = NOW(), progress_percentage = 100,` : sql``}
        ${validatedData.isCoachApproved !== undefined ? sql`is_coach_approved = ${validatedData.isCoachApproved},` : sql``}
        coach_last_review_date = NOW(),
        last_activity_date = NOW(),
        updated_at = NOW()
      WHERE id = ${goalId}
      RETURNING *
    `);

    const updatedGoal = updateResult.rows[0] as any;

    // Create progress snapshot for status change
    await db.execute(sql`
      INSERT INTO goal_progress_snapshots (
        goal_id, progress_percentage, snapshot_reason, notes, snapshot_date, created_at
      ) VALUES (
        ${goalId}, ${updatedGoal.progress_percentage || 0}, 
        'coach_status_change_' || ${validatedData.status},
        ${validatedData.coachNotes || `Coach updated status to ${validatedData.status}`},
        NOW(), NOW()
      )
    `);

    res.json({
      success: true,
      goal: updatedGoal,
      message: `Goal status updated to ${validatedData.status}`
    });
  } catch (error) {
    console.error('Error updating goal status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid status data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update goal status" });
  }
});

/**
 * GET /api/coach/goals/:goalId/progress-history
 * Get detailed progress history for a specific goal
 */
router.get('/:goalId/progress-history', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    const goalId = parseInt(req.params.goalId);
    
    // Verify coach access to goal
    const goalResult = await db.execute(sql`
      SELECT pg.*, u.username, u.display_name
      FROM player_goals pg
      JOIN users u ON pg.user_id = u.id
      WHERE pg.id = ${goalId} AND pg.coach_id = ${userId}
      LIMIT 1
    `);
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: "Goal not found or not assigned to this coach" });
    }

    const goal = goalResult.rows[0] as any;

    // Get progress snapshots
    const progressResult = await db.execute(sql`
      SELECT * FROM goal_progress_snapshots 
      WHERE goal_id = ${goalId}
      ORDER BY snapshot_date DESC
    `);

    // Get milestones with completion status
    const milestonesResult = await db.execute(sql`
      SELECT * FROM goal_milestones
      WHERE goal_id = ${goalId}
      ORDER BY order_index ASC
    `);

    const progressHistory = progressResult.rows;
    const milestones = milestonesResult.rows;

    // Calculate progress trends
    const progressTrend = progressHistory.length > 1 
      ? (progressHistory[0] as any).progress_percentage - (progressHistory[1] as any).progress_percentage
      : 0;

    res.json({
      success: true,
      goal,
      progressHistory,
      milestones,
      analytics: {
        currentProgress: goal.progress_percentage || 0,
        progressTrend,
        totalSnapshots: progressHistory.length,
        lastUpdate: goal.last_activity_date,
        milestonesCompleted: milestones.filter((m: any) => m.is_completed).length,
        totalMilestones: milestones.length
      }
    });
  } catch (error) {
    console.error('Error fetching goal progress history:', error);
    res.status(500).json({ error: "Failed to fetch progress history" });
  }
});

/**
 * GET /api/coach/dashboard
 * Get comprehensive coach dashboard with player goal analytics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    
    // Verify coach status and get profile
    const coachResult = await db.execute(sql`
      SELECT * FROM coach_profiles 
      WHERE user_id = ${userId}
      LIMIT 1
    `);
    
    if (coachResult.rows.length === 0) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    const coachProfile = coachResult.rows[0] as any;

    // Get all goals assigned to this coach with player info
    const goalsResult = await db.execute(sql`
      SELECT 
        pg.*,
        u.username, u.first_name, u.last_name, u.display_name
      FROM player_goals pg
      JOIN users u ON pg.user_id = u.id
      WHERE pg.coach_id = ${userId}
    `);

    const allGoals = goalsResult.rows as any[];

    // Calculate dashboard analytics
    const totalGoals = allGoals.length;
    const activeGoals = allGoals.filter(g => g.status === 'active').length;
    const completedGoals = allGoals.filter(g => g.status === 'completed').length;
    const totalPlayers = new Set(allGoals.map(g => g.user_id)).size;
    
    // Category breakdown
    const categoryStats = allGoals.reduce((acc, g) => {
      const category = g.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average progress calculation
    const avgProgress = activeGoals > 0 
      ? Math.round(allGoals.filter(g => g.status === 'active')
          .reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / activeGoals)
      : 0;

    // Recent activity (goals with recent updates in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = allGoals
      .filter(g => g.last_activity_date && new Date(g.last_activity_date) > sevenDaysAgo)
      .sort((a, b) => new Date(b.last_activity_date).getTime() - new Date(a.last_activity_date).getTime())
      .slice(0, 10);

    // Players needing attention (low progress, no recent activity)
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const needsAttention = allGoals.filter(g => 
      g.status === 'active' && 
      (g.progress_percentage || 0) < 20 &&
      (!g.last_activity_date || new Date(g.last_activity_date) < fiveDaysAgo)
    );

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalGoals,
          activeGoals,
          completedGoals,
          totalPlayers,
          avgProgress,
          completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
        },
        categoryBreakdown: categoryStats,
        recentActivity: recentActivity.map(item => ({
          ...item,
          player: {
            id: item.user_id,
            username: item.username,
            firstName: item.first_name,
            lastName: item.last_name,
            displayName: item.display_name
          }
        })),
        needsAttention: needsAttention.map(item => ({
          ...item,
          player: {
            id: item.user_id,
            username: item.username,
            firstName: item.first_name,
            lastName: item.last_name,
            displayName: item.display_name
          }
        }))
      },
      coachProfile: {
        id: coachProfile.id,
        bio: coachProfile.bio,
        specializations: coachProfile.specialties,
        experienceYears: coachProfile.experience_years
      }
    });
  } catch (error) {
    console.error('Error fetching coach dashboard:', error);
    res.status(500).json({ error: "Failed to fetch coach dashboard" });
  }
});

export default router;