/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament System Schema
 * 
 * This schema provides support for multi-event tournaments with parent-child relationships,
 * as well as comprehensive team tournament functionality.
 */

import { pgTable, serial, varchar, text, timestamp, integer, boolean, json, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tournaments, users } from "../schema";

// Parent tournaments table
export const parentTournaments = pgTable("parent_tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationStartDate: timestamp("registration_start_date"),
  registrationEndDate: timestamp("registration_end_date"),
  organizer: varchar("organizer", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 255 }),
  bannerUrl: varchar("banner_url", { length: 255 }),
  websiteUrl: varchar("website_url", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("upcoming"),
  isTestData: boolean("is_test_data").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relationships between parent and child tournaments
export const tournamentRelationships = pgTable("tournament_relationships", {
  id: serial("id").primaryKey(),
  parentTournamentId: integer("parent_tournament_id").notNull().references(() => parentTournaments.id),
  childTournamentId: integer("child_tournament_id").notNull().references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Team types enum for different kinds of teams
export const teamTypeEnum = pgEnum('team_type', ['standard', 'recreational', 'competitive', 'club', 'elite']);

// Teams for team-based tournaments
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 255 }),
  captainId: integer("captain_id").notNull().references(() => users.id),
  teamType: teamTypeEnum("team_type").default('standard'),
  location: varchar("location", { length: 255 }),
  averageRating: integer("average_rating"),
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  isActive: boolean("is_active").default(true),
  isTestData: boolean("is_test_data").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Team member roles enum
export const teamMemberRoleEnum = pgEnum('team_member_role', ['captain', 'player', 'alternate', 'coach', 'manager']);

// Team members (players on a team)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: teamMemberRoleEnum("role").default('player'),
  isActive: boolean("is_active").default(true),
  joinDate: timestamp("join_date").defaultNow(),
  notes: text("notes"),
  position: varchar("position", { length: 50 }), // For doubles teams: left/right side preference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Team tournament registrations
export const teamTournamentRegistrations = pgTable("team_tournament_registrations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected, waitlisted
  seedNumber: integer("seed_number"), // For tournament seeding
  registrationDate: timestamp("registration_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament directors (people who manage a tournament)
export const tournamentDirectors = pgTable("tournament_directors", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).default("director").notNull(), // director, assistant, scorekeeper, etc.
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").notNull().references(() => users.id), // Who assigned this director
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament courts
export const tournamentCourts = pgTable("tournament_courts", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  courtNumber: varchar("court_number", { length: 20 }).notNull(), // Court identifier
  courtName: varchar("court_name", { length: 100 }), // Optional friendly name
  location: varchar("location", { length: 255 }), // Physical location details
  status: varchar("status", { length: 50 }).default("available").notNull(), // available, in-use, maintenance, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament status history (for tracking status changes)
export const tournamentStatusHistory = pgTable("tournament_status_history", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  previousStatus: varchar("previous_status", { length: 50 }).notNull(),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  changedById: integer("changed_by_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

// Tournament templates (for quickly creating similar tournaments)
export const tournamentTemplates = pgTable("tournament_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false).notNull(),
  configuration: json("configuration").notNull(),
  category: varchar("category", { length: 50 }), // singles, doubles, mixed
  division: varchar("division", { length: 50 }), // age group
  format: varchar("format", { length: 50 }), // elimination, round robin, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament audit logs (for tracking changes)
export const tournamentAuditLogs = pgTable("tournament_audit_logs", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  parentTournamentId: integer("parent_tournament_id").references(() => parentTournaments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: json("details"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Define relations
export const parentTournamentRelations = relations(parentTournaments, ({ many }) => ({
  childTournaments: many(tournamentRelationships)
}));

export const tournamentRelationshipsRelations = relations(tournamentRelationships, ({ one }) => ({
  parentTournament: one(parentTournaments, {
    fields: [tournamentRelationships.parentTournamentId],
    references: [parentTournaments.id]
  }),
  childTournament: one(tournaments, {
    fields: [tournamentRelationships.childTournamentId],
    references: [tournaments.id]
  })
}));

export const teamRelations = relations(teams, ({ one, many }) => ({
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id]
  }),
  members: many(teamMembers),
  registrations: many(teamTournamentRegistrations)
}));

export const teamMemberRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id]
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id]
  })
}));

export const teamTournamentRegistrationRelations = relations(teamTournamentRegistrations, ({ one }) => ({
  team: one(teams, {
    fields: [teamTournamentRegistrations.teamId],
    references: [teams.id]
  }),
  tournament: one(tournaments, {
    fields: [teamTournamentRegistrations.tournamentId],
    references: [tournaments.id]
  })
}));

export const tournamentDirectorRelations = relations(tournamentDirectors, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentDirectors.tournamentId],
    references: [tournaments.id]
  }),
  user: one(users, {
    fields: [tournamentDirectors.userId],
    references: [users.id]
  }),
  assignedByUser: one(users, {
    fields: [tournamentDirectors.assignedBy],
    references: [users.id]
  })
}));

export const tournamentCourtRelations = relations(tournamentCourts, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentCourts.tournamentId],
    references: [tournaments.id]
  })
}));

export const tournamentStatusHistoryRelations = relations(tournamentStatusHistory, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentStatusHistory.tournamentId],
    references: [tournaments.id]
  }),
  changedBy: one(users, {
    fields: [tournamentStatusHistory.changedById],
    references: [users.id]
  })
}));

export const tournamentTemplateRelations = relations(tournamentTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [tournamentTemplates.createdById],
    references: [users.id]
  })
}));

export const tournamentAuditLogRelations = relations(tournamentAuditLogs, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentAuditLogs.tournamentId],
    references: [tournaments.id],
    relationName: "tournament_audit_logs"
  }),
  parentTournament: one(parentTournaments, {
    fields: [tournamentAuditLogs.parentTournamentId],
    references: [parentTournaments.id],
    relationName: "parent_tournament_audit_logs"
  }),
  user: one(users, {
    fields: [tournamentAuditLogs.userId],
    references: [users.id]
  })
}));

// Define insert schemas
export const insertParentTournamentSchema = createInsertSchema(parentTournaments);
export const insertTournamentRelationshipSchema = createInsertSchema(tournamentRelationships);
export const insertTeamSchema = createInsertSchema(teams);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertTeamTournamentRegistrationSchema = createInsertSchema(teamTournamentRegistrations);
export const insertTournamentDirectorSchema = createInsertSchema(tournamentDirectors);
export const insertTournamentCourtSchema = createInsertSchema(tournamentCourts);
export const insertTournamentStatusHistorySchema = createInsertSchema(tournamentStatusHistory);
export const insertTournamentTemplateSchema = createInsertSchema(tournamentTemplates);
export const insertTournamentAuditLogSchema = createInsertSchema(tournamentAuditLogs);

// Define types
export type ParentTournament = typeof parentTournaments.$inferSelect;
export type InsertParentTournament = z.infer<typeof insertParentTournamentSchema>;

export type TournamentRelationship = typeof tournamentRelationships.$inferSelect;
export type InsertTournamentRelationship = z.infer<typeof insertTournamentRelationshipSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type TeamTournamentRegistration = typeof teamTournamentRegistrations.$inferSelect;
export type InsertTeamTournamentRegistration = z.infer<typeof insertTeamTournamentRegistrationSchema>;

export type TournamentDirector = typeof tournamentDirectors.$inferSelect;
export type InsertTournamentDirector = z.infer<typeof insertTournamentDirectorSchema>;

export type TournamentCourt = typeof tournamentCourts.$inferSelect;
export type InsertTournamentCourt = z.infer<typeof insertTournamentCourtSchema>;

export type TournamentStatusHistory = typeof tournamentStatusHistory.$inferSelect;
export type InsertTournamentStatusHistory = z.infer<typeof insertTournamentStatusHistorySchema>;

export type TournamentTemplate = typeof tournamentTemplates.$inferSelect;
export type InsertTournamentTemplate = z.infer<typeof insertTournamentTemplateSchema>;

export type TournamentAuditLog = typeof tournamentAuditLogs.$inferSelect;
export type InsertTournamentAuditLog = z.infer<typeof insertTournamentAuditLogSchema>;