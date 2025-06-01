/**
 * PKL-278651-TEAM-0001-SCHEMA - Flexible Team Event System
 * 
 * This schema supports variable team sizes, flexible constraints, and diverse tournament formats.
 * Designed to handle everything from traditional doubles to large corporate team challenges.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { tournaments } from "../schema";

// Enums for team event system
export const teamStatusEnum = pgEnum('team_status', [
  'forming',      // Team is being assembled
  'complete',     // Team has required players
  'active',       // Team is participating in tournament
  'inactive',     // Team is temporarily inactive
  'disbanded'     // Team is permanently disbanded
]);

export const teamMemberRoleEnum = pgEnum('team_member_role', [
  'captain',      // Team captain (can modify roster)
  'co_captain',   // Assistant captain
  'member',       // Regular team member
  'substitute'    // Substitute player
]);

export const constraintTypeEnum = pgEnum('constraint_type', [
  'no_repeat_players',    // Players cannot be on multiple teams
  'skill_level_range',    // Team skill level constraints
  'gender_requirement',   // Gender ratio requirements
  'age_requirement',      // Age-based constraints
  'organization_limit',   // Corporate/organization constraints
  'custom'               // Custom business rules
]);

// Team Event Templates - Reusable configurations for different tournament formats
export const teamEventTemplates = pgTable('team_event_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // 'doubles', 'corporate', 'recreational', etc.
  
  // Player configuration
  minPlayers: integer('min_players').notNull(),
  maxPlayers: integer('max_players').notNull(),
  allowSubstitutes: boolean('allow_substitutes').default(false),
  maxSubstitutes: integer('max_substitutes'),
  
  // Template metadata
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Team Event Constraints - Flexible rule engine for team validation
export const teamEventConstraints = pgTable('team_event_constraints', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').references(() => teamEventTemplates.id, { onDelete: 'cascade' }),
  constraintType: constraintTypeEnum('constraint_type').notNull(),
  
  // Flexible parameters stored as JSON
  parameters: jsonb('parameters').notNull(),
  errorMessage: text('error_message').notNull(),
  
  // Constraint metadata
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(100), // Lower = higher priority
  createdAt: timestamp('created_at').defaultNow()
});

// Teams - Instances of team event templates for specific tournaments
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id, { onDelete: 'cascade' }),
  templateId: integer('template_id').references(() => teamEventTemplates.id),
  
  // Team details
  name: varchar('name', { length: 255 }).notNull(),
  status: teamStatusEnum('status').default('forming'),
  captainUserId: integer('captain_user_id').references(() => users.id),
  
  // Team metadata
  notes: text('notes'),
  registrationData: jsonb('registration_data'), // Flexible data for specific tournament needs
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  activatedAt: timestamp('activated_at'),
  disbandedAt: timestamp('disbanded_at')
});

// Team Members - Flexible player assignments with roles and positions
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Member role and status
  role: teamMemberRoleEnum('role').default('member'),
  isSubstitute: boolean('is_substitute').default(false),
  
  // Flexible position data for complex formats
  positionRequirements: jsonb('position_requirements'), // e.g., {"court": 1, "rotation": "A"}
  
  // Member metadata
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
  invitedAt: timestamp('invited_at'),
  invitationAccepted: boolean('invitation_accepted')
});

// Team Match History - Track team performance as a unit
export const teamMatches = pgTable('team_matches', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id),
  team1Id: integer('team1_id').references(() => teams.id),
  team2Id: integer('team2_id').references(() => teams.id),
  
  // Match details
  winnerId: integer('winner_id').references(() => teams.id),
  score: text('score'), // Flexible score format
  matchData: jsonb('match_data'), // Detailed match information
  
  // Timestamps
  scheduledAt: timestamp('scheduled_at'),
  playedAt: timestamp('played_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const teamEventTemplatesRelations = relations(teamEventTemplates, ({ many, one }) => ({
  constraints: many(teamEventConstraints),
  teams: many(teams),
  creator: one(users, {
    fields: [teamEventTemplates.createdBy],
    references: [users.id]
  })
}));

export const teamEventConstraintsRelations = relations(teamEventConstraints, ({ one }) => ({
  template: one(teamEventTemplates, {
    fields: [teamEventConstraints.templateId],
    references: [teamEventTemplates.id]
  })
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [teams.tournamentId],
    references: [tournaments.id]
  }),
  template: one(teamEventTemplates, {
    fields: [teams.templateId],
    references: [teamEventTemplates.id]
  }),
  captain: one(users, {
    fields: [teams.captainUserId],
    references: [users.id]
  }),
  members: many(teamMembers),
  homeMatches: many(teamMatches, { relationName: "team1" }),
  awayMatches: many(teamMatches, { relationName: "team2" })
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id]
  })
}));

export const teamMatchesRelations = relations(teamMatches, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [teamMatches.tournamentId],
    references: [tournaments.id]
  }),
  team1: one(teams, {
    fields: [teamMatches.team1Id],
    references: [teams.id],
    relationName: "team1"
  }),
  team2: one(teams, {
    fields: [teamMatches.team2Id],
    references: [teams.id],
    relationName: "team2"
  }),
  winner: one(teams, {
    fields: [teamMatches.winnerId],
    references: [teams.id]
  })
}));

// Zod schemas for validation
export const insertTeamEventTemplateSchema = createInsertSchema(teamEventTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTeamEventConstraintSchema = createInsertSchema(teamEventConstraints).omit({
  id: true,
  createdAt: true
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true
});

export const insertTeamMatchSchema = createInsertSchema(teamMatches).omit({
  id: true,
  createdAt: true
});

// TypeScript types
export type TeamEventTemplate = typeof teamEventTemplates.$inferSelect;
export type InsertTeamEventTemplate = z.infer<typeof insertTeamEventTemplateSchema>;

export type TeamEventConstraint = typeof teamEventConstraints.$inferSelect;
export type InsertTeamEventConstraint = z.infer<typeof insertTeamEventConstraintSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type TeamMatch = typeof teamMatches.$inferSelect;
export type InsertTeamMatch = z.infer<typeof insertTeamMatchSchema>;

// Constraint parameter schemas for type safety
export const noRepeatPlayersSchema = z.object({
  scope: z.enum(['tournament', 'season', 'global']),
  exemptions: z.array(z.number()).optional() // User IDs exempt from this rule
});

export const skillLevelRangeSchema = z.object({
  maxDifference: z.number().min(0).max(5),
  averageRequired: z.boolean().optional(),
  minRating: z.number().min(1).max(6).optional(),
  maxRating: z.number().min(1).max(6).optional()
});

export const genderRequirementSchema = z.object({
  male: z.number().min(0),
  female: z.number().min(0),
  flexible: z.boolean().default(false), // Allow some flexibility in requirements
  nonBinary: z.number().min(0).optional()
});

export const ageRequirementSchema = z.object({
  minAge: z.number().min(0).optional(),
  maxAge: z.number().min(0).optional(),
  averageAge: z.number().min(0).optional(),
  seniorDivision: z.boolean().optional() // 50+ requirements
});

// Helper types for UI
export type TeamStatus = typeof teams.status.enumValues[number];
export type TeamMemberRole = typeof teamMembers.role.enumValues[number];
export type ConstraintType = typeof teamEventConstraints.constraintType.enumValues[number];

/**
 * USER SCENARIOS DOCUMENTATION
 * 
 * Scenario 1: Corporate Tournament (6-8 players)
 * - Template: minPlayers=6, maxPlayers=8, allowSubstitutes=true
 * - Constraints: no_repeat_players (scope: tournament)
 * - Use case: Company events with employee teams
 * 
 * Scenario 2: Elite League (2 players + 1 substitute)
 * - Template: minPlayers=2, maxPlayers=2, allowSubstitutes=true, maxSubstitutes=1
 * - Constraints: skill_level_range (maxDifference: 0.5), gender_requirement (if mixed)
 * - Use case: High-level competitive doubles
 * 
 * Scenario 3: Community Recreation (2-4 flexible)
 * - Template: minPlayers=2, maxPlayers=4, allowSubstitutes=true
 * - Constraints: skill_level_range (minRating: 2.0, maxRating: 3.5)
 * - Use case: Casual community leagues
 * 
 * Scenario 4: Multi-Format Series (variable by month)
 * - Multiple templates for different months
 * - Constraints: Variable based on format
 * - Use case: Season-long series with changing formats
 * 
 * IMPLEMENTATION PHASES:
 * 
 * Phase 1: Core Flexibility ✅
 * - Variable team size support
 * - Basic constraint engine (no repeat players, skill ranges)
 * - Template creation and reuse
 * - Simple team formation workflow
 * 
 * Phase 2: Advanced Constraints (Next)
 * - Gender requirements
 * - Position-specific roles
 * - Custom business rules
 * - Exception handling workflow
 * 
 * Phase 3: Automation & Intelligence (Future)
 * - Auto-assignment suggestions
 * - Constraint optimization recommendations
 * - Predictive team formation
 * - Advanced reporting and analytics
 */