/**
 * PKL-278651-COMM-0034-MEMBER
 * Community Roles Schema
 * 
 * This file defines the tables and types for enhanced community member management.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../schema";
import { communities, communityMembers } from "./community";

/**
 * Enum for member action types
 */
export enum MemberActionType {
  PROMOTE = "promote",
  DEMOTE = "demote",
  REMOVE = "remove",
  BAN = "ban",
  UNBAN = "unban",
  ADD_ROLE = "add_role",
  REMOVE_ROLE = "remove_role",
  CHANGE_PRIMARY_ROLE = "change_primary_role"
}

/**
 * Community Permission Types Table
 * Defines the available permission types in the system with descriptions
 */
export const communityPermissionTypes = pgTable("community_permission_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Community Role Permissions Table
 * Maps base roles (admin, moderator, member) to their default permissions
 */
export const communityRolePermissions = pgTable("community_role_permissions", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'admin', 'moderator', 'member'
  permissionType: varchar("permission_type", { length: 50 }).notNull(),
  allowed: boolean("allowed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Community Custom Roles Table
 * Defines custom roles that can be assigned to members
 */
export const communityCustomRoles = pgTable("community_custom_roles", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).notNull().default("#6366f1"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Community Role Assignments Table
 * Maps users to their custom roles in communities
 */
export const communityRoleAssignments = pgTable("community_role_assignments", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customRoleId: integer("custom_role_id").notNull().references(() => communityCustomRoles.id, { onDelete: "cascade" }),
  assignedByUserId: integer("assigned_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Community Member Actions Log Table
 * Tracks all member management actions for audit purposes
 */
export const communityMemberActionsLog = pgTable("community_member_actions_log", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  performedByUserId: integer("performed_by_user_id").notNull().references(() => users.id),
  targetUserIds: integer("target_user_ids").array().notNull(),
  actionDetails: jsonb("action_details"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const communityPermissionTypesRelations = relations(communityPermissionTypes, ({ many }) => ({
  rolePermissions: many(communityRolePermissions)
}));

export const communityRolePermissionsRelations = relations(communityRolePermissions, ({ one }) => ({
  community: one(communities, {
    fields: [communityRolePermissions.communityId],
    references: [communities.id]
  }),
  permissionType: one(communityPermissionTypes, {
    fields: [communityRolePermissions.permissionType],
    references: [communityPermissionTypes.name]
  })
}));

export const communityCustomRolesRelations = relations(communityCustomRoles, ({ one, many }) => ({
  community: one(communities, {
    fields: [communityCustomRoles.communityId],
    references: [communities.id]
  }),
  assignments: many(communityRoleAssignments)
}));

export const communityRoleAssignmentsRelations = relations(communityRoleAssignments, ({ one }) => ({
  community: one(communities, {
    fields: [communityRoleAssignments.communityId],
    references: [communities.id]
  }),
  user: one(users, {
    fields: [communityRoleAssignments.userId],
    references: [users.id]
  }),
  customRole: one(communityCustomRoles, {
    fields: [communityRoleAssignments.customRoleId],
    references: [communityCustomRoles.id]
  }),
  assignedBy: one(users, {
    fields: [communityRoleAssignments.assignedByUserId],
    references: [users.id]
  })
}));

export const communityMemberActionsLogRelations = relations(communityMemberActionsLog, ({ one }) => ({
  community: one(communities, {
    fields: [communityMemberActionsLog.communityId],
    references: [communities.id]
  }),
  performedBy: one(users, {
    fields: [communityMemberActionsLog.performedByUserId],
    references: [users.id]
  })
}));

// Create Zod schemas for data validation
export const insertCommunityPermissionTypeSchema = createInsertSchema(communityPermissionTypes);

export const insertCommunityRolePermissionSchema = createInsertSchema(communityRolePermissions);

export const insertCommunityCustomRoleSchema = createInsertSchema(communityCustomRoles);

export const insertCommunityRoleAssignmentSchema = createInsertSchema(communityRoleAssignments);

export const insertCommunityMemberActionLogSchema = createInsertSchema(communityMemberActionsLog, {
  actionType: (schema) => z.nativeEnum(MemberActionType)
});

// Types for DB inference
export type CommunityPermissionType = typeof communityPermissionTypes.$inferSelect;
export type CommunityRolePermission = typeof communityRolePermissions.$inferSelect;
export type CommunityCustomRole = typeof communityCustomRoles.$inferSelect;
export type CommunityRoleAssignment = typeof communityRoleAssignments.$inferSelect;
export type CommunityMemberActionLog = typeof communityMemberActionsLog.$inferSelect;

// Custom types for the API
export interface RoleWithPermissions {
  roleName: string;
  permissions: Record<string, boolean>;
}

export interface PermissionGroup {
  category: string;
  permissions: {
    name: string;
    displayName: string;
    description: string;
  }[];
}