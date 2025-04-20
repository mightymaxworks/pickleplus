/**
 * PKL-278651-COMM-0034-MEMBER
 * Community Roles Schema
 * 
 * This file defines the schema for the enhanced community member management.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { pgTable, serial, varchar, boolean, timestamp, integer, json, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { communities, communityMembers } from './community';
import { users } from '../schema';
import { relations } from 'drizzle-orm';

// Permission types table
export const communityPermissionTypes = pgTable('community_permission_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Role permissions table
export const communityRolePermissions = pgTable('community_role_permissions', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  role: varchar('role', { length: 50 }).notNull(),
  permissionType: varchar('permission_type', { length: 50 }).notNull().references(() => communityPermissionTypes.name),
  isGranted: boolean('is_granted').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    rolePermUnique: uniqueIndex('role_perm_unique_idx').on(table.communityId, table.role, table.permissionType)
  };
});

// Custom roles table
export const communityCustomRoles = pgTable('community_custom_roles', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }),
  icon: varchar('icon', { length: 50 }),
  displayOrder: integer('display_order').default(0),
  isAssignable: boolean('is_assignable').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    nameUnique: uniqueIndex('custom_role_name_unique_idx').on(table.communityId, table.name)
  };
});

// Role assignments table
export const communityRoleAssignments = pgTable('community_role_assignments', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').notNull().references(() => users.id),
  customRoleId: integer('custom_role_id').notNull().references(() => communityCustomRoles.id),
  assignedByUserId: integer('assigned_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    assignmentUnique: uniqueIndex('role_assignment_unique_idx').on(table.communityId, table.userId, table.customRoleId)
  };
});

// Member actions log table
export const communityMemberActionsLog = pgTable('community_member_actions_log', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  actionType: varchar('action_type', { length: 50 }).notNull(),
  performedByUserId: integer('performed_by_user_id').references(() => users.id),
  targetUserIds: json('target_user_ids').$type<number[]>().notNull(),
  actionDetails: json('action_details'),
  createdAt: timestamp('created_at').defaultNow()
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
  roleAssignments: many(communityRoleAssignments)
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

// Export Zod schemas
export const insertCommunityPermissionTypeSchema = createInsertSchema(communityPermissionTypes);
export const insertCommunityRolePermissionSchema = createInsertSchema(communityRolePermissions);
export const insertCommunityCustomRoleSchema = createInsertSchema(communityCustomRoles);
export const insertCommunityRoleAssignmentSchema = createInsertSchema(communityRoleAssignments);
export const insertCommunityMemberActionLogSchema = createInsertSchema(communityMemberActionsLog);

// Export types
export type CommunityPermissionType = z.infer<typeof insertCommunityPermissionTypeSchema>;
export type CommunityRolePermission = z.infer<typeof insertCommunityRolePermissionSchema>;
export type CommunityCustomRole = z.infer<typeof insertCommunityCustomRoleSchema>;
export type CommunityRoleAssignment = z.infer<typeof insertCommunityRoleAssignmentSchema>;
export type CommunityMemberActionLog = z.infer<typeof insertCommunityMemberActionLogSchema>;

// Additional types for frontend use
export interface RoleWithPermissions {
  roleName: string;
  permissions: {
    [key: string]: boolean;
  };
  members?: number;
}

export interface PermissionGroup {
  category: string;
  permissions: {
    name: string;
    description: string;
    isGranted: boolean;
  }[];
}

export enum MemberActionType {
  PROMOTE = 'promote',
  DEMOTE = 'demote',
  REMOVE = 'remove',
  ADD_ROLE = 'add_role',
  REMOVE_ROLE = 'remove_role',
  CHANGE_PRIMARY_ROLE = 'change_primary_role',
  BAN = 'ban',
  UNBAN = 'unban',
  BULK_INVITE = 'bulk_invite'
}