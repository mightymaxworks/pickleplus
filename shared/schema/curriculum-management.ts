// Sprint 1: Curriculum Management & Lesson Planning Schema
import { pgTable, serial, integer, varchar, text, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Drill Library Table - Core drill database with PCP rating system
export const drillLibrary = pgTable("drill_library", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "Dinks", "Third Shot Drop", etc.
  
  // Skill Level with PCP Rating Integration (2.0-8.0 scale)
  skillLevel: varchar("skill_level", { length: 50 }).notNull(), // "Beginner", "Intermediate", "Advanced", "Expert"
  minPcpRating: decimal("min_pcp_rating", { precision: 2, scale: 1 }), // 2.0-8.0 scale
  maxPcpRating: decimal("max_pcp_rating", { precision: 2, scale: 1 }), // 2.0-8.0 scale
  
  // Core Content from PCP Drill Handbook
  objective: text("objective").notNull(),
  setup: text("setup").notNull(),
  instructions: text("instructions").notNull(),
  keyFocus: text("key_focus").notNull(),
  
  // PCP 4-Dimensional Weighting (0-100 each, should sum to 100)
  technicalWeight: integer("technical_weight").default(0), // Technical skills focus
  tacticalWeight: integer("tactical_weight").default(0), // Strategy/decision-making
  physicalWeight: integer("physical_weight").default(0), // Fitness/movement
  mentalWeight: integer("mental_weight").default(0), // Concentration/pressure
  
  // Video Integration (YouTube primary, XiaoHongShu for China)
  youtubeUrl: varchar("youtube_url", { length: 500 }),
  xiaohongshuUrl: varchar("xiaohongshu_url", { length: 500 }),
  
  // Equipment & Logistics
  equipmentNeeded: text("equipment_needed"), // "Cones, markers, targets"
  playersRequired: integer("players_required").default(2),
  estimatedDuration: integer("estimated_duration_minutes"),
  courtArea: varchar("court_area", { length: 100 }), // "Kitchen line", "Baseline"
  
  // Progression & Organization
  originalNumber: integer("original_number"), // Preserve 1-11 numbering per category
  difficulty: integer("difficulty").default(1), // 1-5 internal difficulty rating
  prerequisites: text("prerequisites"), // "Must complete basic dink drills first"
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Curriculum Templates Table - Pre-built lesson structures
export const curriculumTemplates = pgTable("curriculum_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // "Beginner Dinking Fundamentals"
  skillLevel: varchar("skill_level", { length: 50 }).notNull(),
  minPcpRating: decimal("min_pcp_rating", { precision: 2, scale: 1 }),
  maxPcpRating: decimal("max_pcp_rating", { precision: 2, scale: 1 }),
  
  description: text("description").notNull(),
  objectives: text("objectives").notNull(), // Learning objectives for this template
  duration: integer("duration_minutes").notNull(), // Total template duration
  
  // Template structure (JSON array of drill IDs and phases)
  templateStructure: text("template_structure").notNull(), // JSON: {warmup: [drillIds], skill: [drillIds], practice: [drillIds]}
  
  // PCP Focus Distribution
  technicalFocus: integer("technical_focus").default(0),
  tacticalFocus: integer("tactical_focus").default(0),
  physicalFocus: integer("physical_focus").default(0),
  mentalFocus: integer("mental_focus").default(0),
  
  createdBy: integer("created_by"), // Coach who created template
  isPublic: boolean("is_public").default(true), // Available to all coaches
  usageCount: integer("usage_count").default(0), // Track popularity
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lesson Plans Table - Custom coach-created lessons
export const lessonPlans = pgTable("lesson_plans", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  templateId: integer("template_id"), // Optional: based on template
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetSkillLevel: varchar("target_skill_level", { length: 50 }),
  targetPcpRating: decimal("target_pcp_rating", { precision: 2, scale: 1 }),
  
  // Lesson structure (JSON with drill sequences and timing)
  lessonStructure: text("lesson_structure").notNull(), // JSON: detailed lesson plan
  totalDuration: integer("total_duration_minutes"),
  
  // Custom modifications from template
  customizations: text("customizations"), // JSON: modifications made to base template
  
  // Session goals and objectives
  primaryGoals: text("primary_goals"), // JSON array of main lesson goals
  secondaryGoals: text("secondary_goals"), // JSON array of secondary goals
  
  // Usage tracking
  timesUsed: integer("times_used").default(0),
  lastUsed: timestamp("last_used"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session Goals Table - Trackable lesson objectives
export const sessionGoals = pgTable("session_goals", {
  id: serial("id").primaryKey(),
  lessonPlanId: integer("lesson_plan_id"),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id"), // Optional: student-specific goals
  
  goalType: varchar("goal_type", { length: 100 }).notNull(), // "technique", "consistency", "accuracy", etc.
  goalDescription: text("goal_description").notNull(),
  targetMetric: varchar("target_metric", { length: 255 }), // "80% accuracy", "10 consecutive dinks"
  
  // Progress tracking
  isAchieved: boolean("is_achieved").default(false),
  achievedDate: timestamp("achieved_date"),
  progress: integer("progress").default(0), // 0-100 percentage
  notes: text("notes"),
  
  // Goal priority and tracking
  priority: varchar("priority", { length: 20 }).default("medium"), // "low", "medium", "high"
  dueDate: timestamp("due_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Drill Categories for organization
export const drillCategories = pgTable("drill_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  iconName: varchar("icon_name", { length: 50 }), // For UI icons
  color: varchar("color", { length: 20 }), // Category color coding
  isActive: boolean("is_active").default(true),
});

// Relations
export const drillLibraryRelations = relations(drillLibrary, ({ many }) => ({
  lessonPlanDrills: many(lessonPlans),
}));

export const curriculumTemplatesRelations = relations(curriculumTemplates, ({ many }) => ({
  lessonPlans: many(lessonPlans),
}));

export const lessonPlansRelations = relations(lessonPlans, ({ one, many }) => ({
  template: one(curriculumTemplates, {
    fields: [lessonPlans.templateId],
    references: [curriculumTemplates.id],
  }),
  sessionGoals: many(sessionGoals),
}));

export const sessionGoalsRelations = relations(sessionGoals, ({ one }) => ({
  lessonPlan: one(lessonPlans, {
    fields: [sessionGoals.lessonPlanId],
    references: [lessonPlans.id],
  }),
}));

// Zod Schemas for validation
export const insertDrillLibrarySchema = createInsertSchema(drillLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCurriculumTemplateSchema = createInsertSchema(curriculumTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonPlanSchema = createInsertSchema(lessonPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionGoalSchema = createInsertSchema(sessionGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type DrillLibrary = typeof drillLibrary.$inferSelect;
export type InsertDrillLibrary = z.infer<typeof insertDrillLibrarySchema>;

export type CurriculumTemplate = typeof curriculumTemplates.$inferSelect;
export type InsertCurriculumTemplate = z.infer<typeof insertCurriculumTemplateSchema>;

export type LessonPlan = typeof lessonPlans.$inferSelect;
export type InsertLessonPlan = z.infer<typeof insertLessonPlanSchema>;

export type SessionGoal = typeof sessionGoals.$inferSelect;
export type InsertSessionGoal = z.infer<typeof insertSessionGoalSchema>;

export type DrillCategory = typeof drillCategories.$inferSelect;

// Utility types for frontend
export type DrillWithCategory = DrillLibrary & {
  categoryName?: string;
};

export type LessonPlanWithTemplate = LessonPlan & {
  template?: CurriculumTemplate;
  sessionGoals?: SessionGoal[];
};