/**
 * PKL-278651-SAGE-0003-JOURNAL
 * SAGE Journaling System Routes
 * 
 * This file contains the API routes for the SAGE Journaling System.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import express, { Request, Response } from "express";
import { db } from "../db";
import { 
  journalEntries, 
  journalPrompts, 
  journalReflections,
  insertJournalEntrySchema,
  insertJournalReflectionSchema,
  JournalEntryTypes,
  MoodTypes
} from "../../shared/schema/sage";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../shared/schema";
import { isAuthenticated } from "../middleware/auth";

// Validation schema for creating a journal entry
const createJournalEntrySchema = insertJournalEntrySchema.extend({
  mood: z.enum([
    MoodTypes.excellent, 
    MoodTypes.good, 
    MoodTypes.neutral, 
    MoodTypes.low, 
    MoodTypes.poor
  ]),
  entryType: z.enum([
    JournalEntryTypes.free_form,
    JournalEntryTypes.guided,
    JournalEntryTypes.reflection,
    JournalEntryTypes.training_log
  ])
});

export function registerJournalRoutes(app: express.Express) {
  console.log('[API] Registering SAGE Journal API routes');

  /**
   * GET /api/coach/journal/entries
   * Get all journal entries for the current user
   */
  app.get("/api/coach/journal/entries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const entries = await db
        .select({
          id: journalEntries.id,
          title: journalEntries.title,
          content: journalEntries.content,
          mood: journalEntries.mood,
          entryType: journalEntries.entryType,
          createdAt: journalEntries.createdAt,
          updatedAt: journalEntries.updatedAt,
          isPrivate: journalEntries.isPrivate,
          dimensionCode: journalEntries.dimensionCode,
          tags: journalEntries.tags,
          sessionId: journalEntries.sessionId,
          matchId: journalEntries.matchId
        })
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt));
      
      res.status(200).json(entries);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error getting journal entries:", error);
      res.status(500).json({ message: "Failed to retrieve journal entries" });
    }
  });

  /**
   * GET /api/coach/journal/entries/:id
   * Get a specific journal entry by ID
   */
  app.get("/api/coach/journal/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const entryId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const [entry] = await db
        .select({
          id: journalEntries.id,
          title: journalEntries.title,
          content: journalEntries.content,
          mood: journalEntries.mood,
          entryType: journalEntries.entryType,
          createdAt: journalEntries.createdAt,
          updatedAt: journalEntries.updatedAt,
          isPrivate: journalEntries.isPrivate,
          dimensionCode: journalEntries.dimensionCode,
          tags: journalEntries.tags,
          sessionId: journalEntries.sessionId,
          matchId: journalEntries.matchId
        })
        .from(journalEntries)
        .where(and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, userId)
        ));
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Get reflections for this entry
      const reflections = await db
        .select()
        .from(journalReflections)
        .where(eq(journalReflections.entryId, entryId));
      
      res.status(200).json({ ...entry, reflections });
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error getting journal entry:", error);
      res.status(500).json({ message: "Failed to retrieve journal entry" });
    }
  });

  /**
   * POST /api/coach/journal/entries
   * Create a new journal entry
   */
  app.post("/api/coach/journal/entries", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = createJournalEntrySchema.parse({
        ...req.body,
        userId
      });
      
      const [newEntry] = await db
        .insert(journalEntries)
        .values(validatedData)
        .returning();
      
      // Generate a reflection for the entry if it's not a simple training log
      if (validatedData.entryType !== JournalEntryTypes.training_log) {
        await generateReflection(newEntry.id, validatedData.content);
      }
      
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error creating journal entry:", error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  /**
   * PUT /api/coach/journal/entries/:id
   * Update an existing journal entry
   */
  app.put("/api/coach/journal/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const entryId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, userId)
        ));
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      const validatedData = createJournalEntrySchema.partial().parse({
        ...req.body,
        updatedAt: new Date()
      });
      
      const [updatedEntry] = await db
        .update(journalEntries)
        .set(validatedData)
        .where(eq(journalEntries.id, entryId))
        .returning();
      
      res.status(200).json(updatedEntry);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error updating journal entry:", error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  /**
   * DELETE /api/coach/journal/entries/:id
   * Delete a journal entry
   */
  app.delete("/api/coach/journal/entries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const entryId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      // Check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, userId)
        ));
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // First delete related reflections
      await db
        .delete(journalReflections)
        .where(eq(journalReflections.entryId, entryId));
      
      // Then delete the entry
      await db
        .delete(journalEntries)
        .where(eq(journalEntries.id, entryId));
      
      res.status(200).json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  /**
   * GET /api/coach/journal/prompts
   * Get all active journal prompts
   */
  app.get("/api/coach/journal/prompts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const dimensionCode = req.query.dimension as string | undefined;
      const promptType = req.query.type as string | undefined;
      const skillLevel = req.query.level as string | undefined;
      
      // Build conditions array
      const conditions = [eq(journalPrompts.isActive, true)];
      
      // Add optional filters
      if (dimensionCode) {
        conditions.push(eq(journalPrompts.dimensionCode, dimensionCode));
      }
      
      if (promptType) {
        conditions.push(eq(journalPrompts.promptType, promptType));
      }
      
      if (skillLevel) {
        conditions.push(eq(journalPrompts.skillLevel, skillLevel));
      }
      
      // Execute query with all conditions
      const prompts = await db
        .select()
        .from(journalPrompts)
        .where(and(...conditions));
      
      res.status(200).json(prompts);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error getting journal prompts:", error);
      res.status(500).json({ message: "Failed to retrieve journal prompts" });
    }
  });

  /**
   * GET /api/coach/journal/prompts/random
   * Get a random journal prompt
   */
  app.get("/api/coach/journal/prompts/random", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const dimensionCode = req.query.dimension as string | undefined;
      const promptType = req.query.type as string | undefined;
      const skillLevel = req.query.level as string | undefined;
      
      // Build conditions array
      const conditions = [eq(journalPrompts.isActive, true)];
      
      // Add optional filters
      if (dimensionCode) {
        conditions.push(eq(journalPrompts.dimensionCode, dimensionCode));
      }
      
      if (promptType) {
        conditions.push(eq(journalPrompts.promptType, promptType));
      }
      
      if (skillLevel) {
        conditions.push(eq(journalPrompts.skillLevel, skillLevel));
      }
      
      // Execute query with all conditions
      const [prompt] = await db
        .select()
        .from(journalPrompts)
        .where(and(...conditions))
        .orderBy(sql`RANDOM()`)
        .limit(1);
      
      if (!prompt) {
        return res.status(404).json({ message: "No matching prompts found" });
      }
      
      res.status(200).json(prompt);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error getting random journal prompt:", error);
      res.status(500).json({ message: "Failed to retrieve random journal prompt" });
    }
  });

  /**
   * POST /api/coach/journal/reflections/:entryId/feedback
   * Add user feedback to a journal reflection
   */
  app.post("/api/coach/journal/reflections/:reflectionId/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const reflectionId = parseInt(req.params.reflectionId);
      const { feedback } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (isNaN(reflectionId)) {
        return res.status(400).json({ message: "Invalid reflection ID" });
      }
      
      if (!feedback || !["helpful", "not_helpful"].includes(feedback)) {
        return res.status(400).json({ message: "Invalid feedback value" });
      }
      
      // Get the reflection
      const [reflection] = await db
        .select({
          id: journalReflections.id,
          entryId: journalReflections.entryId
        })
        .from(journalReflections)
        .where(eq(journalReflections.id, reflectionId));
      
      if (!reflection) {
        return res.status(404).json({ message: "Reflection not found" });
      }
      
      // Verify that the reflection belongs to an entry owned by the current user
      const [entry] = await db
        .select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.id, reflection.entryId),
          eq(journalEntries.userId, userId)
        ));
      
      if (!entry) {
        return res.status(403).json({ message: "Not authorized to provide feedback for this reflection" });
      }
      
      // Update the reflection with the feedback
      const [updatedReflection] = await db
        .update(journalReflections)
        .set({
          userFeedback: feedback,
          isRead: true
        })
        .where(eq(journalReflections.id, reflectionId))
        .returning();
      
      res.status(200).json(updatedReflection);
    } catch (error) {
      console.error("[SAGE-JOURNAL] Error adding feedback to reflection:", error);
      res.status(500).json({ message: "Failed to add feedback to reflection" });
    }
  });

  console.log('[API] SAGE Journal API routes registered successfully');
}

/**
 * Generate a reflection for a journal entry
 * This is a simple rule-based system to generate reflections
 */
async function generateReflection(entryId: number, content: string) {
  try {
    // Get additional information about the entry
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, entryId));
    
    if (!entry) {
      console.error("[SAGE-JOURNAL] Error generating reflection: Entry not found");
      return;
    }
    
    // Get user information
    const [user] = await db
      .select({
        username: users.username
      })
      .from(users)
      .where(eq(users.id, entry.userId));
    
    // Simple rule-based reflection generation
    let reflectionContent = "";
    let insightType = "reflection";
    
    // Check for mood patterns
    if (entry.mood === "excellent" || entry.mood === "good") {
      reflectionContent = `Great job on your positivity, ${user?.username || "Player"}! I notice that you're feeling ${entry.mood} about this experience. What specific actions or mindsets contributed to this positive feeling? Try to identify patterns you can repeat in the future.`;
      insightType = "strength";
    } else if (entry.mood === "low" || entry.mood === "poor") {
      reflectionContent = `I notice you're feeling ${entry.mood} today, ${user?.username || "Player"}. Remember that challenging moments are opportunities for growth. What specific aspects were most difficult, and what resources might help you approach similar situations differently next time?`;
      insightType = "opportunity";
    } else {
      reflectionContent = `Thank you for sharing your thoughts, ${user?.username || "Player"}. Consistent reflection is a powerful tool for improvement. What patterns do you notice in your entries over time?`;
      insightType = "reflection";
    }
    
    // Check content length
    if (content.length < 50) {
      reflectionContent += " Consider providing more details in your journal entries to help identify more specific patterns and opportunities for growth.";
    } else if (content.length > 500) {
      reflectionContent += " I appreciate your thorough reflection. This level of detail helps create a clear picture of your experience.";
    }
    
    // Add dimension-specific reflection if available
    if (entry.dimensionCode) {
      switch (entry.dimensionCode) {
        case "TECH":
          reflectionContent += " For technical skill development, remember that focused, deliberate practice with specific goals tends to be more effective than general practice.";
          break;
        case "TACT":
          reflectionContent += " When developing tactical awareness, try to analyze one specific scenario from different perspectives to deepen your understanding.";
          break;
        case "PHYS":
          reflectionContent += " For physical fitness improvements, consistency and recovery are just as important as the intensity of your training.";
          break;
        case "MENT":
          reflectionContent += " Mental toughness develops through intentional practice of specific mental skills, just like physical skills.";
          break;
        case "CONS":
          reflectionContent += " Consistency comes from building reliable routines and systems that support your goals, even when motivation fluctuates.";
          break;
      }
    }
    
    // Create the reflection
    await db.insert(journalReflections).values({
      entryId: entry.id,
      content: reflectionContent,
      insightType,
      isRead: false
    });
    
    console.log("[SAGE-JOURNAL] Generated reflection for entry", entry.id);
  } catch (error) {
    console.error("[SAGE-JOURNAL] Error generating reflection:", error);
  }
}