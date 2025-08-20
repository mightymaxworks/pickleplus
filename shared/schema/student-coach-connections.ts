import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Student-initiated coach connection requests table
export const studentCoachConnections = pgTable("student_coach_connections", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  coachId: integer("coach_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  studentRequestDate: timestamp("student_request_date").defaultNow().notNull(),
  coachApprovedDate: timestamp("coach_approved_date"),
  coachRejectedDate: timestamp("coach_rejected_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertStudentCoachConnectionSchema = createInsertSchema(studentCoachConnections);

export const createConnectionRequestSchema = insertStudentCoachConnectionSchema.pick({
  coachId: true,
});

export const processConnectionRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

// Types
export type StudentCoachConnection = typeof studentCoachConnections.$inferSelect;
export type InsertStudentCoachConnection = typeof studentCoachConnections.$inferInsert;
export type CreateConnectionRequest = z.infer<typeof createConnectionRequestSchema>;
export type ProcessConnectionRequest = z.infer<typeof processConnectionRequestSchema>;

// Relations will be defined in main schema.ts to avoid circular imports