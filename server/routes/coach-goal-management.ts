/**
 * PKL-278651-COACH-GOALS-PHASE2 - Coach-Player Goal Management System
 * 
 * Phase 2 implementation enabling coaches to:
 * - Assign goals to players
 * - Create and manage milestones
 * - Track player progress across multiple goals
 * - Provide goal insights and recommendations
 * - Approve/modify player-created goals
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-07-02
 */

import { Router } from 'express';
import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { 
  playerGoals, 
  goalMilestones, 
  goalProgressSnapshots,
  insertPlayerGoalSchema,
  insertGoalMilestoneSchema,
  insertGoalProgressSnapshotSchema,
  type PlayerGoal,
  type GoalMilestone
} from '../../shared/schema/goals';
import { users } from '../../shared/schema';
// Use coach_profiles from main schema - we'll check the table directly
// import { coachProfiles } from '../../shared/schema/training-center';

const router = Router();

// Validation schemas for coach operations
const assignGoalSchema = insertPlayerGoalSchema.extend({
  playerUserId: z.number().min(1, "Player user ID required"),
  milestones: z.array(z.object({
    title: z.string().min(3, "Milestone title required"),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    orderIndex: z.number().default(0),
    requiresCoachValidation: z.boolean().default(true)
  })).optional()
});

const updateGoalStatusSchema = z.object({
  goalId: z.number().min(1),
  status: z.enum(["active", "completed", "paused", "abandoned"]),
  coachNotes: z.string().optional(),
  isCoachApproved: z.boolean().optional()
});

const createMilestoneSchema = insertGoalMilestoneSchema.extend({
  goalId: z.number().min(1, "Goal ID required")
});

const validateMilestoneSchema = z.object({
  milestoneId: z.number().min(1),
  isValidated: z.boolean(),
  validationNotes: z.string().optional(),
  celebrationMessage: z.string().optional(),
  xpReward: z.number().min(0).max(1000).default(50)
});

/**
 * GET /api/coach/goals/my-players
 * Get all goals for players coached by the current coach
 */
router.get('/my-players', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated user
    
    // Check if user is a coach via SQL query
    const coachResult = await db.execute(sql`
      SELECT * FROM coach_profiles WHERE user_id = ${userId} LIMIT 1
    `);
    const coachProfile = coachResult.rows[0];
    
    if (!coachProfile) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    // Get all goals where this coach is assigned
    const coachGoals = await db.select({
      goal: playerGoals,
      player: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName
      }
    })
    .from(playerGoals)
    .innerJoin(users, eq(playerGoals.userId, users.id))
    .where(eq(playerGoals.coachId, userId))
    .orderBy(desc(playerGoals.lastActivityDate));

    // Get milestone counts for each goal
    const goalIds = coachGoals.map(g => g.goal.id);
    const milestoneStats = goalIds.length > 0 ? await db.select({
      goalId: goalMilestones.goalId,
      total: sql<number>`count(*)`.as('total'),
      completed: sql<number>`sum(case when ${goalMilestones.isCompleted} then 1 else 0 end)`.as('completed')
    })
    .from(goalMilestones)
    .where(inArray(goalMilestones.goalId, goalIds))
    .groupBy(goalMilestones.goalId) : [];

    // Combine data with milestone statistics
    const goalsWithStats = coachGoals.map(item => ({
      ...item.goal,
      player: item.player,
      milestoneStats: milestoneStats.find(m => m.goalId === item.goal.id) || { total: 0, completed: 0 }
    }));

    res.json({
      success: true,
      goals: goalsWithStats,
      summary: {
        totalGoals: coachGoals.length,
        activeGoals: coachGoals.filter(g => g.goal.status === 'active').length,
        completedGoals: coachGoals.filter(g => g.goal.status === 'completed').length,
        totalPlayers: new Set(coachGoals.map(g => g.goal.userId)).size
      }
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
    const [coachProfile] = await db.select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId));
    
    if (!coachProfile) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    // Verify player exists
    const [player] = await db.select()
      .from(users)
      .where(eq(users.id, validatedData.playerUserId));
    
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Create the goal assigned by coach
    const goalData = {
      ...validatedData,
      userId: validatedData.playerUserId,
      coachId: userId,
      isCoachApproved: true, // Coach-assigned goals are automatically approved
      coachLastReviewDate: new Date(),
      lastActivityDate: new Date()
    };
    
    delete goalData.playerUserId;
    delete goalData.milestones;

    const [newGoal] = await db.insert(playerGoals)
      .values(goalData)
      .returning();

    // Create milestones if provided
    let milestones: GoalMilestone[] = [];
    if (validatedData.milestones && validatedData.milestones.length > 0) {
      const milestoneData = validatedData.milestones.map((milestone, index) => ({
        goalId: newGoal.id,
        title: milestone.title,
        description: milestone.description || null,
        orderIndex: milestone.orderIndex || index,
        dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
        requiresCoachValidation: milestone.requiresCoachValidation
      }));

      milestones = await db.insert(goalMilestones)
        .values(milestoneData)
        .returning();
    }

    // Create initial progress snapshot
    await db.insert(goalProgressSnapshots).values({
      goalId: newGoal.id,
      progressPercentage: 0,
      snapshotReason: 'goal_created_by_coach',
      notes: `Goal assigned by coach ${coachProfile.professionalBio ? 'with expertise in ' + coachProfile.specializations?.join(', ') : ''}`
    });

    res.status(201).json({
      success: true,
      goal: newGoal,
      milestones,
      message: `Goal successfully assigned to ${player.displayName || player.username}`
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
    const validatedData = updateGoalStatusSchema.parse({ ...req.body, goalId });
    
    // Verify this coach is assigned to the goal
    const [existingGoal] = await db.select()
      .from(playerGoals)
      .where(and(
        eq(playerGoals.id, goalId),
        eq(playerGoals.coachId, userId)
      ));
    
    if (!existingGoal) {
      return res.status(404).json({ error: "Goal not found or not assigned to this coach" });
    }

    // Update goal status
    const updateData: any = {
      status: validatedData.status,
      coachLastReviewDate: new Date(),
      lastActivityDate: new Date(),
      updatedAt: new Date()
    };

    if (validatedData.status === 'completed') {
      updateData.completedDate = new Date();
      updateData.progressPercentage = 100;
    }

    if (validatedData.isCoachApproved !== undefined) {
      updateData.isCoachApproved = validatedData.isCoachApproved;
    }

    const [updatedGoal] = await db.update(playerGoals)
      .set(updateData)
      .where(eq(playerGoals.id, goalId))
      .returning();

    // Create progress snapshot for status change
    await db.insert(goalProgressSnapshots).values({
      goalId: goalId,
      progressPercentage: updatedGoal.progressPercentage,
      snapshotReason: `coach_status_change_${validatedData.status}`,
      notes: validatedData.coachNotes || `Coach updated status to ${validatedData.status}`
    });

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
 * POST /api/coach/goals/:goalId/milestones
 * Create a new milestone for a goal
 */
router.post('/:goalId/milestones', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    const goalId = parseInt(req.params.goalId);
    const validatedData = createMilestoneSchema.parse({ ...req.body, goalId });
    
    // Verify coach has access to this goal
    const [goal] = await db.select()
      .from(playerGoals)
      .where(and(
        eq(playerGoals.id, goalId),
        eq(playerGoals.coachId, userId)
      ));
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found or not assigned to this coach" });
    }

    // Get current milestone count for order index
    const [countResult] = await db.select({
      count: sql<number>`count(*)`.as('count')
    })
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId));

    const milestoneData = {
      ...validatedData,
      orderIndex: validatedData.orderIndex || countResult.count,
      requiresCoachValidation: true // Coach-created milestones require validation by default
    };

    const [newMilestone] = await db.insert(goalMilestones)
      .values(milestoneData)
      .returning();

    // Update goal milestone count
    await db.update(playerGoals)
      .set({ 
        milestoneCount: sql`${playerGoals.milestoneCount} + 1`,
        lastActivityDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(playerGoals.id, goalId));

    res.status(201).json({
      success: true,
      milestone: newMilestone,
      message: "Milestone created successfully"
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid milestone data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create milestone" });
  }
});

/**
 * PUT /api/coach/milestones/:milestoneId/validate
 * Validate/approve a milestone completion
 */
router.put('/milestones/:milestoneId/validate', async (req, res) => {
  try {
    const userId = 1; // Mock authenticated coach
    const milestoneId = parseInt(req.params.milestoneId);
    const validatedData = validateMilestoneSchema.parse({ ...req.body, milestoneId });
    
    // Get milestone and verify coach access
    const [milestone] = await db.select({
      milestone: goalMilestones,
      goal: playerGoals
    })
    .from(goalMilestones)
    .innerJoin(playerGoals, eq(goalMilestones.goalId, playerGoals.id))
    .where(and(
      eq(goalMilestones.id, milestoneId),
      eq(playerGoals.coachId, userId)
    ));
    
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found or not accessible" });
    }

    // Update milestone validation
    const updateData: any = {
      isCoachValidated: validatedData.isValidated,
      coachValidationDate: new Date(),
      coachValidationNotes: validatedData.validationNotes,
      updatedAt: new Date()
    };

    if (validatedData.isValidated) {
      updateData.isCompleted = true;
      updateData.completedDate = new Date();
      updateData.celebrationMessage = validatedData.celebrationMessage || "Great job completing this milestone!";
      updateData.xpReward = validatedData.xpReward;
    }

    const [updatedMilestone] = await db.update(goalMilestones)
      .set(updateData)
      .where(eq(goalMilestones.id, milestoneId))
      .returning();

    // Update goal progress if milestone was validated
    if (validatedData.isValidated) {
      // Get total milestones and completed count
      const [stats] = await db.select({
        total: sql<number>`count(*)`.as('total'),
        completed: sql<number>`sum(case when ${goalMilestones.isCompleted} then 1 else 0 end)`.as('completed')
      })
      .from(goalMilestones)
      .where(eq(goalMilestones.goalId, milestone.goal.id));

      const newProgress = Math.round((stats.completed / stats.total) * 100);
      
      await db.update(playerGoals)
        .set({
          progressPercentage: newProgress,
          lastActivityDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, milestone.goal.id));

      // Create progress snapshot
      await db.insert(goalProgressSnapshots).values({
        goalId: milestone.goal.id,
        progressPercentage: newProgress,
        milestonesCompleted: stats.completed,
        totalMilestones: stats.total,
        snapshotReason: 'milestone_validated',
        notes: `Milestone "${updatedMilestone.title}" validated by coach`
      });
    }

    res.json({
      success: true,
      milestone: updatedMilestone,
      message: validatedData.isValidated ? "Milestone validated successfully" : "Milestone validation removed"
    });
  } catch (error) {
    console.error('Error validating milestone:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid validation data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to validate milestone" });
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
    const [goal] = await db.select()
      .from(playerGoals)
      .where(and(
        eq(playerGoals.id, goalId),
        eq(playerGoals.coachId, userId)
      ));
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found or not assigned to this coach" });
    }

    // Get progress snapshots
    const progressHistory = await db.select()
      .from(goalProgressSnapshots)
      .where(eq(goalProgressSnapshots.goalId, goalId))
      .orderBy(desc(goalProgressSnapshots.snapshotDate));

    // Get milestones with completion status
    const milestones = await db.select()
      .from(goalMilestones)
      .where(eq(goalMilestones.goalId, goalId))
      .orderBy(asc(goalMilestones.orderIndex));

    // Calculate progress trends
    const progressTrend = progressHistory.length > 1 
      ? progressHistory[0].progressPercentage - progressHistory[1].progressPercentage
      : 0;

    res.json({
      success: true,
      goal,
      progressHistory,
      milestones,
      analytics: {
        currentProgress: goal.progressPercentage,
        progressTrend,
        totalSnapshots: progressHistory.length,
        lastUpdate: goal.lastActivityDate,
        milestonesCompleted: milestones.filter(m => m.isCompleted).length,
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
    
    // Verify coach status
    const [coachProfile] = await db.select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId));
    
    if (!coachProfile) {
      return res.status(403).json({ error: "User is not a registered coach" });
    }

    // Get all goals assigned to this coach
    const allGoals = await db.select({
      goal: playerGoals,
      player: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName
      }
    })
    .from(playerGoals)
    .innerJoin(users, eq(playerGoals.userId, users.id))
    .where(eq(playerGoals.coachId, userId));

    // Calculate dashboard analytics
    const totalGoals = allGoals.length;
    const activeGoals = allGoals.filter(g => g.goal.status === 'active').length;
    const completedGoals = allGoals.filter(g => g.goal.status === 'completed').length;
    const totalPlayers = new Set(allGoals.map(g => g.goal.userId)).size;
    
    // Category breakdown
    const categoryStats = allGoals.reduce((acc, g) => {
      const category = g.goal.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average progress calculation
    const avgProgress = activeGoals > 0 
      ? Math.round(allGoals.filter(g => g.goal.status === 'active')
          .reduce((sum, g) => sum + g.goal.progressPercentage, 0) / activeGoals)
      : 0;

    // Recent activity (goals with recent updates)
    const recentActivity = allGoals
      .filter(g => g.goal.lastActivityDate && new Date(g.goal.lastActivityDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.goal.lastActivityDate!).getTime() - new Date(a.goal.lastActivityDate!).getTime())
      .slice(0, 10);

    // Players needing attention (low progress, no recent activity)
    const needsAttention = allGoals.filter(g => 
      g.goal.status === 'active' && 
      g.goal.progressPercentage < 20 &&
      (!g.goal.lastActivityDate || new Date(g.goal.lastActivityDate) < new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
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
          ...item.goal,
          player: item.player
        })),
        needsAttention: needsAttention.map(item => ({
          ...item.goal,
          player: item.player
        }))
      },
      coachProfile: {
        id: coachProfile.id,
        bio: coachProfile.professionalBio,
        specializations: coachProfile.specializations,
        experienceYears: coachProfile.yearsExperience
      }
    });
  } catch (error) {
    console.error('Error fetching coach dashboard:', error);
    res.status(500).json({ error: "Failed to fetch coach dashboard" });
  }
});

export default router;