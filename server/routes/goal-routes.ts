/**
 * PKL-278651-COACH-GOALS-001 - Goal-Setting API Routes
 * 
 * API endpoints for player goal management in the coach-player ecosystem.
 * Supports CRUD operations for goals and milestone tracking.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import type { Express } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import {
  playerGoals,
  goalMilestones,
  goalJournalEntries,
  goalProgressSnapshots,
  insertPlayerGoalSchema,
  insertGoalMilestoneSchema,
  type InsertPlayerGoal,
  type InsertGoalMilestone,
  GoalStatus
} from "@shared/schema";

// Validation schemas
const createGoalSchema = insertPlayerGoalSchema.extend({
  milestones: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    targetDate: z.date()
  })).optional()
});

const updateGoalSchema = insertPlayerGoalSchema.partial().omit({ userId: true });

export function registerGoalRoutes(app: Express) {
  
  // Get all goals for authenticated user
  app.get("/api/goals", async (req, res) => {
    try {
      // TODO: Get actual user ID from session when authentication is fixed
      const userId = 1; // Using test user for now
      
      const goals = await db
        .select()
        .from(playerGoals)
        .where(eq(playerGoals.userId, userId))
        .orderBy(desc(playerGoals.createdAt));

      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ 
        error: "Failed to fetch goals",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a new goal
  app.post("/api/goals", async (req, res) => {
    try {
      // TODO: Get actual user ID from session when authentication is fixed
      const userId = 1; // Using test user for now
      
      const goalData: InsertPlayerGoal = {
        userId,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority,
        status: "active",
        targetDate: req.body.targetDate || null,
        difficultyLevel: req.body.difficultyLevel || 1,
        progressPercentage: 0,
        isPublic: req.body.isPublic || false,
        shareWithCommunity: req.body.shareWithCommunity || false,
        motivationNote: req.body.motivationNote || null,
        successCriteria: req.body.successCriteria || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newGoal] = await db.insert(playerGoals).values(goalData).returning();

      res.status(201).json({
        success: true,
        goal: newGoal,
        message: "Goal created successfully"
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ 
        error: "Failed to create goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a specific goal with milestones
  app.get("/api/goals/:goalId", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // This would be req.user.id in production

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Get the goal
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

      // Get milestones for the goal
      const milestones = await db
        .select()
        .from(goalMilestones)
        .where(eq(goalMilestones.goalId, goalId))
        .orderBy(goalMilestones.orderIndex);

      res.json({
        ...goal,
        milestones
      });
    } catch (error) {
      console.error("Error fetching goal:", error);
      res.status(500).json({ 
        error: "Failed to fetch goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create a new goal
  app.post("/api/goals", async (req, res) => {
    try {
      const userId = 1; // This would be req.user.id in production
      
      // Validate the request body
      const validation = createGoalSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed",
          details: validation.error.errors
        });
      }

      const { milestones, ...goalData } = validation.data;
      
      // Add userId to goal data
      const goalToCreate = {
        ...goalData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Start a transaction to create goal and milestones
      const result = await db.transaction(async (tx) => {
        // Create the goal
        const [newGoal] = await tx
          .insert(playerGoals)
          .values(goalToCreate)
          .returning();

        // Create milestones if provided
        const createdMilestones = [];
        if (milestones && milestones.length > 0) {
          for (const milestone of milestones) {
            const [createdMilestone] = await tx
              .insert(goalMilestones)
              .values({
                goalId: newGoal.id,
                title: milestone.title,
                description: milestone.description || null,
                targetDate: milestone.targetDate,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();
            createdMilestones.push(createdMilestone);
          }
        }

        return {
          goal: newGoal,
          milestones: createdMilestones
        };
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ 
        error: "Failed to create goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update a goal
  app.patch("/api/goals/:goalId", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const userId = 1; // This would be req.user.id in production

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      // Validate the request body
      const validation = updateGoalSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed",
          details: validation.error.errors
        });
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

      // Update the goal
      const [updatedGoal] = await db
        .update(playerGoals)
        .set({
          ...validation.data,
          updatedAt: new Date()
        })
        .where(eq(playerGoals.id, goalId))
        .returning();

      res.json(updatedGoal);
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
      const userId = 1; // This would be req.user.id in production

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

      // Delete in transaction (cascading delete for milestones, journal entries, etc.)
      await db.transaction(async (tx) => {
        // Delete related records first
        await tx.delete(goalProgressSnapshots).where(eq(goalProgressSnapshots.goalId, goalId));
        await tx.delete(goalJournalEntries).where(eq(goalJournalEntries.goalId, goalId));
        await tx.delete(goalMilestones).where(eq(goalMilestones.goalId, goalId));
        
        // Delete the goal
        await tx.delete(playerGoals).where(eq(playerGoals.id, goalId));
      });

      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ 
        error: "Failed to delete goal",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get goals assigned by a coach (for coach view)
  app.get("/api/goals/assigned", async (req, res) => {
    try {
      const coachId = 1; // This would be req.user.id in production
      
      const assignedGoals = await db
        .select()
        .from(playerGoals)
        .where(eq(playerGoals.coachId, coachId))
        .orderBy(desc(playerGoals.createdAt));

      res.json(assignedGoals);
    } catch (error) {
      console.error("Error fetching assigned goals:", error);
      res.status(500).json({ 
        error: "Failed to fetch assigned goals",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update goal progress
  app.patch("/api/goals/:goalId/progress", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const { progressPercentage, notes } = req.body;
      const userId = 1; // This would be req.user.id in production

      if (isNaN(goalId)) {
        return res.status(400).json({ error: "Invalid goal ID" });
      }

      if (typeof progressPercentage !== "number" || progressPercentage < 0 || progressPercentage > 100) {
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

      // Update goal progress in transaction
      const result = await db.transaction(async (tx) => {
        // Update the goal
        const [updatedGoal] = await tx
          .update(playerGoals)
          .set({
            progressPercentage,
            status: progressPercentage >= 100 ? GoalStatus.COMPLETED : GoalStatus.ACTIVE,
            completedDate: progressPercentage >= 100 ? new Date() : null,
            updatedAt: new Date()
          })
          .where(eq(playerGoals.id, goalId))
          .returning();

        // Create a progress snapshot
        if (notes) {
          await tx
            .insert(goalProgressSnapshots)
            .values({
              goalId,
              progressPercentage,
              notes,
              snapshotDate: new Date(),
              createdAt: new Date()
            });
        }

        return updatedGoal;
      });

      res.json(result);
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ 
        error: "Failed to update goal progress",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}