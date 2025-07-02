/**
 * PKL-278651-PHASE1-GOALS-SIMPLIFIED - Simplified Goal Routes for Phase 1
 * 
 * Simplified API endpoints focused on player-only Phase 1 features:
 * - Goal CRUD operations
 * - Progress updates 
 * - Goal completion
 * - Basic milestone management
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import type { Express } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { playerGoals } from "@shared/schema";

export function registerSimplifiedGoalRoutes(app: Express) {
  
  // Get all goals for authenticated user
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = 1; // Using test user for now
      
      const goals = await db
        .select()
        .from(playerGoals)
        .where(eq(playerGoals.userId, userId))
        .orderBy(desc(playerGoals.createdAt));

      const goalsWithMilestones = goals.map(goal => ({
        ...goal,
        milestones: [], // Simplified for Phase 1
        progressNotes: goal.motivationNote || ""
      }));

      res.json(goalsWithMilestones);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ 
        error: "Failed to fetch goals",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a new goal (simplified)
  app.post("/api/goals", async (req, res) => {
    try {
      const userId = 1; // Using test user for now
      const {
        title,
        description,
        category,
        priority = 'medium',
        targetDate
      } = req.body;

      if (!title || title.trim().length < 3) {
        return res.status(400).json({ error: "Goal title must be at least 3 characters" });
      }

      if (!category) {
        return res.status(400).json({ error: "Goal category is required" });
      }

      // Create goal with minimal required fields
      const [newGoal] = await db
        .insert(playerGoals)
        .values({
          userId,
          title: title.trim(),
          description: description?.trim() || null,
          category,
          priority,
          status: 'active',
          targetDate: targetDate || null,
          progressPercentage: 0,
          isPublic: false,
          shareWithCommunity: false
        })
        .returning();

      res.status(201).json({
        ...newGoal,
        milestones: [],
        progressNotes: ""
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ 
        error: "Failed to create goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update goal progress
  app.put("/api/goals/:goalId/progress", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now
      const { progressPercentage, progressNotes } = req.body;

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ error: "Progress percentage must be between 0 and 100" });
      }

      // Check if goal exists and belongs to user
      const [existingGoal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Update goal progress - store notes in motivationNote field for now
      const [updatedGoal] = await db
        .update(playerGoals)
        .set({
          progressPercentage,
          motivationNote: progressNotes || existingGoal.motivationNote,
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, goalId))
        .returning();

      res.json({
        ...updatedGoal,
        milestones: [],
        progressNotes: updatedGoal.motivationNote || ""
      });
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ 
        error: "Failed to update progress",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Complete a goal
  app.put("/api/goals/:goalId/complete", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Check if goal exists and belongs to user
      const [existingGoal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Mark goal as completed
      const [completedGoal] = await db
        .update(playerGoals)
        .set({
          status: 'completed',
          progressPercentage: 100,
          completedDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, goalId))
        .returning();

      res.json({
        ...completedGoal,
        milestones: [],
        progressNotes: completedGoal.motivationNote || ""
      });
    } catch (error) {
      console.error("Error completing goal:", error);
      res.status(500).json({ 
        error: "Failed to complete goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Simplified milestone endpoints (returning empty for Phase 1)
  app.post("/api/goals/:goalId/milestones", async (req, res) => {
    try {
      // For Phase 1, just return a mock milestone
      const { title } = req.body;
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: "Milestone title is required" });
      }

      // Return a mock milestone for Phase 1
      res.status(201).json({
        id: Date.now(), // Temporary ID
        title: title.trim(),
        description: null,
        completed: false,
        targetDate: null,
        completedDate: null
      });
    } catch (error) {
      console.error("Error adding milestone:", error);
      res.status(500).json({ 
        error: "Failed to add milestone",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/goals/:goalId/milestones/:milestoneId/toggle", async (req, res) => {
    try {
      // For Phase 1, just return a mock toggle response
      res.json({
        id: parseInt(req.params.milestoneId),
        title: "Mock Milestone",
        description: null,
        completed: true,
        targetDate: null,
        completedDate: new Date()
      });
    } catch (error) {
      console.error("Error toggling milestone:", error);
      res.status(500).json({ 
        error: "Failed to toggle milestone",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update a goal (basic)
  app.patch("/api/goals/:goalId", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Check if goal exists and belongs to user
      const [existingGoal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Update allowed fields
      const allowedUpdates = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority,
        targetDate: req.body.targetDate,
        progressPercentage: req.body.progressPercentage
      };

      // Remove undefined fields
      const updates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid updates provided" });
      }

      // Update the goal
      const [updatedGoal] = await db
        .update(playerGoals)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, goalId))
        .returning();

      res.json({
        ...updatedGoal,
        milestones: [],
        progressNotes: updatedGoal.motivationNote || ""
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ 
        error: "Failed to update goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete a goal
  app.delete("/api/goals/:goalId", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Check if goal exists and belongs to user
      const [existingGoal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Delete the goal
      await db.delete(playerGoals).where(eq(playerGoals.id, goalId));

      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ 
        error: "Failed to delete goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===== PHASE 1 FOUNDATION FEATURES =====
  
  // Goal History & Analytics
  app.get("/api/goals/history", async (req, res) => {
    try {
      const userId = 1; // Using test user for now
      const { limit = 10, period = 'all' } = req.query;
      
      let dateFilter = {};
      if (period !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
      }

      const goals = await db
        .select()
        .from(playerGoals)
        .where(eq(playerGoals.userId, userId))
        .orderBy(desc(playerGoals.updatedAt))
        .limit(parseInt(limit as string));

      // Calculate analytics
      const analytics = {
        totalGoals: goals.length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        averageProgress: goals.length > 0 
          ? Math.round(goals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / goals.length)
          : 0,
        completionRate: goals.length > 0 
          ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
          : 0,
        recentActivity: goals.slice(0, 5).map(g => ({
          id: g.id,
          title: g.title,
          status: g.status,
          progress: g.progressPercentage,
          lastUpdate: g.updatedAt
        }))
      };

      res.json({
        analytics,
        goals: goals.map(g => ({
          ...g,
          milestones: [],
          progressNotes: g.motivationNote || ""
        }))
      });
    } catch (error) {
      console.error("Error fetching goal history:", error);
      res.status(500).json({ 
        error: "Failed to fetch goal history",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Goal Analytics Dashboard
  app.get("/api/goals/analytics", async (req, res) => {
    try {
      const userId = 1; // Using test user for now
      
      const goals = await db
        .select()
        .from(playerGoals)
        .where(eq(playerGoals.userId, userId));

      // Weekly progress tracking
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayGoals = goals.filter(g => {
          const updated = new Date(g.updatedAt || g.createdAt);
          return updated >= dayStart && updated <= dayEnd;
        });
        
        weeklyProgress.push({
          date: dayStart.toISOString().split('T')[0],
          activeGoals: dayGoals.filter(g => g.status === 'active').length,
          completedGoals: dayGoals.filter(g => g.status === 'completed').length,
          averageProgress: dayGoals.length > 0 
            ? Math.round(dayGoals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / dayGoals.length)
            : 0
        });
      }

      // Category analysis
      const categoryStats = goals.reduce((acc, goal) => {
        const category = goal.category || 'uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0, averageProgress: 0 };
        }
        acc[category].total++;
        if (goal.status === 'completed') acc[category].completed++;
        acc[category].averageProgress += goal.progressPercentage || 0;
        return acc;
      }, {} as Record<string, any>);

      // Calculate averages for categories
      Object.keys(categoryStats).forEach(category => {
        categoryStats[category].averageProgress = Math.round(
          categoryStats[category].averageProgress / categoryStats[category].total
        );
        categoryStats[category].completionRate = Math.round(
          (categoryStats[category].completed / categoryStats[category].total) * 100
        );
      });

      // Success patterns
      const successPatterns = {
        bestPerformingCategory: Object.entries(categoryStats).reduce((best, [cat, stats]) => 
          stats.completionRate > (best.completionRate || 0) ? { category: cat, ...stats } : best, {}),
        streakData: {
          currentStreak: 0, // Will implement streak logic in Phase 2
          longestStreak: 0,
          lastActivity: goals.length > 0 ? Math.max(...goals.map(g => new Date(g.updatedAt || g.createdAt).getTime())) : null
        }
      };

      res.json({
        summary: {
          totalGoals: goals.length,
          completedGoals: goals.filter(g => g.status === 'completed').length,
          activeGoals: goals.filter(g => g.status === 'active').length,
          overallProgress: goals.length > 0 
            ? Math.round(goals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / goals.length)
            : 0
        },
        weeklyProgress,
        categoryStats,
        successPatterns,
        insights: [
          `You have ${goals.filter(g => g.status === 'active').length} active goals in progress`,
          `Your average progress across all goals is ${goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / goals.length) : 0}%`,
          `You've completed ${goals.filter(g => g.status === 'completed').length} goals so far`
        ]
      });
    } catch (error) {
      console.error("Error fetching goal analytics:", error);
      res.status(500).json({ 
        error: "Failed to fetch goal analytics",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhanced Progress Tracking with History
  app.post("/api/goals/:goalId/progress-entry", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now
      const { progressPercentage, notes, sessionType = 'manual' } = req.body;

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Check if goal exists and belongs to user
      const [existingGoal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!existingGoal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Update goal with new progress
      const [updatedGoal] = await db
        .update(playerGoals)
        .set({
          progressPercentage: Math.max(existingGoal.progressPercentage || 0, progressPercentage),
          motivationNote: notes || existingGoal.motivationNote,
          lastActivityDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, goalId))
        .returning();

      // Phase 1: Simple response, Phase 2 will add detailed progress history
      res.json({
        success: true,
        goal: {
          ...updatedGoal,
          milestones: [],
          progressNotes: updatedGoal.motivationNote || ""
        },
        progressEntry: {
          id: Date.now(), // Mock ID for Phase 1
          goalId,
          progressPercentage,
          notes,
          sessionType,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error("Error adding progress entry:", error);
      res.status(500).json({ 
        error: "Failed to add progress entry",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Goal Insights and Recommendations
  app.get("/api/goals/:goalId/insights", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // Using test user for now

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      const [goal] = await db
        .select()
        .from(playerGoals)
        .where(and(
          eq(playerGoals.id, goalId),
          eq(playerGoals.userId, userId)
        ));

      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Calculate insights based on goal data
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(goal.createdDate).getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - new Date(goal.updatedAt || goal.createdDate).getTime()) / (1000 * 60 * 60 * 24));
      const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
      const daysUntilTarget = targetDate ? Math.floor((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

      const insights = {
        progress: {
          current: goal.progressPercentage || 0,
          trend: daysSinceCreated > 0 ? Math.round((goal.progressPercentage || 0) / daysSinceCreated * 7) : 0, // Weekly rate
          status: goal.progressPercentage >= 75 ? 'excellent' : goal.progressPercentage >= 50 ? 'good' : goal.progressPercentage >= 25 ? 'fair' : 'needs-attention'
        },
        timeline: {
          daysActive: daysSinceCreated,
          daysSinceUpdate: daysSinceLastUpdate,
          daysUntilTarget,
          onTrack: daysUntilTarget && daysSinceCreated > 0 ? (goal.progressPercentage || 0) / daysSinceCreated * daysUntilTarget >= 100 : null
        },
        recommendations: [],
        motivationalTips: []
      };

      // Generate recommendations
      if (daysSinceLastUpdate > 7) {
        insights.recommendations.push("Consider updating your progress - it's been a while since your last entry");
      }
      if ((goal.progressPercentage || 0) < 25 && daysSinceCreated > 14) {
        insights.recommendations.push("Try breaking this goal into smaller, more manageable milestones");
      }
      if (daysUntilTarget && daysUntilTarget < 30 && (goal.progressPercentage || 0) < 70) {
        insights.recommendations.push("Your target date is approaching - consider focusing more time on this goal");
      }
      if ((goal.progressPercentage || 0) > 80) {
        insights.recommendations.push("You're doing great! Keep up the momentum to reach completion");
      }

      // Generate motivational tips
      if (goal.category === 'technical') {
        insights.motivationalTips.push("Technical skills improve with consistent practice - even 15 minutes daily makes a difference");
      }
      if (goal.category === 'fitness') {
        insights.motivationalTips.push("Physical goals respond well to gradual progression - listen to your body");
      }
      if (goal.category === 'mental') {
        insights.motivationalTips.push("Mental skills develop through reflection and mindful practice");
      }

      res.json(insights);
    } catch (error) {
      console.error("Error fetching goal insights:", error);
      res.status(500).json({ 
        error: "Failed to fetch goal insights",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}