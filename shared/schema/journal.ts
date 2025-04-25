/**
 * Journal Entry Schema
 * PKL-278651-SAGE-0008-JOURNAL - Schema for journal entries
 */
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Journal Entry table 
 */
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  skillLevel: text("skill_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define types from the schema
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// Create zod schema for validation
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const selectJournalEntrySchema = createInsertSchema(journalEntries);

// Validation schema with extended validation
export const journalEntryValidationSchema = insertJournalEntrySchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Journal entry must be at least 10 characters"),
  mood: z.string().optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});