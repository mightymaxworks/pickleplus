/**
 * PKL-278651-ADMIN-0015-USER
 * User Management Controller
 * 
 * This file contains the controller logic for the user management feature
 */

import { db } from '../../../db';
import { eq, sql, desc, asc, and, or, like, isNull } from 'drizzle-orm';
import { users, matches } from '../../../../shared/schema';
import { 
  adminUserNotes, 
  adminUserActions, 
  userAccountStatus,
  userLoginHistory,
  userPermissionOverrides
} from '../../../../shared/schema/admin/user-management';

/**
 * User Management Controller
 */
export class UserManagementController {
  /**
   * Get users with pagination, filtering, and sorting
   */
  async getUsers({ 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortDir = 'desc',
    search,
    filter
  }: {
    page: number;
    limit: number;
    sortBy: string;
    sortDir: string;
    search?: string;
    filter?: string;
  }) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query conditions
      let conditions = sql`1=1`;
      
      // Add search condition if provided
      if (search) {
        conditions = and(
          conditions,
          or(
            like(users.username, `%${search}%`),
            like(users.displayName, `%${search}%`),
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.passportId, `%${search}%`)
          )
        );
      }
      
      // Add filter condition if provided
      if (filter) {
        switch (filter) {
          case 'admin':
            conditions = and(conditions, eq(users.isAdmin, true));
            break;
          case 'founding':
            conditions = and(conditions, eq(users.isFoundingMember, true));
            break;
          case 'active':
            conditions = and(conditions, sql`(
              users.last_activity > NOW() - INTERVAL '30 days'
            )`);
            break;
          // Add more filters as needed
        }
      }
      
      // Determine sort direction
      const sortDirection = sortDir === 'asc' ? asc : desc;
      
      // Define a default sort column
      let sortColumn = users.createdAt;
      
      // Map frontend field names to database column names - with null check
      if (sortBy) {
        const sortMapping: Record<string, any> = {
          createdAt: users.createdAt,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          lastLogin: users.lastLoginAt,
          xp: users.xp,
          level: users.level,
          rankingPoints: users.rankingPoints
        };
        
        // Only assign if mapping exists
        if (sortMapping[sortBy]) {
          sortColumn = sortMapping[sortBy];
        }
      }
      
      // Count total users matching the conditions
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(conditions);
      
      // Get users with pagination
      const usersData = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          displayName: users.displayName,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
          avatarInitials: users.avatarInitials,
          passportId: users.passportId,
          xp: users.xp,
          level: users.level,
          rankingPoints: users.rankingPoints,
          isAdmin: users.isAdmin,
          isCoach: users.isCoach,
          isFoundingMember: users.isFoundingMember,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          profileCompletionPct: users.profileCompletionPct
        })
        .from(users)
        .where(conditions)
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);
      
      return {
        users: usersData,
        pagination: {
          page,
          pageSize: limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("[UserManagementController] Error getting users:", error);
      throw error;
    }
  }
  
  /**
   * Get detailed user information including notes, account status, etc.
   */
  async getUserDetails(userId: number) {
    try {
      // Get user basic info
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then(res => res[0]);
      
      if (!user) {
        return { user: null };
      }
      
      // Remove sensitive information
      const { password, ...safeUser } = user;
      
      // Get user notes
      const notes = await db
        .select({
          id: adminUserNotes.id,
          userId: adminUserNotes.userId,
          authorId: adminUserNotes.authorId,
          authorName: users.displayName,
          note: adminUserNotes.note,
          visibility: adminUserNotes.visibility,
          createdAt: adminUserNotes.createdAt,
          updatedAt: adminUserNotes.updatedAt
        })
        .from(adminUserNotes)
        .innerJoin(users, eq(adminUserNotes.authorId, users.id))
        .where(eq(adminUserNotes.userId, userId))
        .orderBy(desc(adminUserNotes.createdAt));
      
      // Get account status
      const accountStatus = await db
        .select({
          id: userAccountStatus.id,
          userId: userAccountStatus.userId,
          status: userAccountStatus.status,
          reason: userAccountStatus.reason,
          changedById: userAccountStatus.changedById,
          changedByName: users.displayName,
          createdAt: userAccountStatus.createdAt,
          expiresAt: userAccountStatus.expiresAt
        })
        .from(userAccountStatus)
        .innerJoin(users, eq(userAccountStatus.changedById, users.id))
        .where(eq(userAccountStatus.userId, userId))
        .orderBy(desc(userAccountStatus.createdAt))
        .limit(1)
        .then(res => res[0] || null);
      
      // Get recent actions
      const recentActions = await db
        .select({
          id: adminUserActions.id,
          userId: adminUserActions.userId,
          adminId: adminUserActions.adminId,
          adminName: users.displayName,
          action: adminUserActions.action,
          details: adminUserActions.details,
          createdAt: adminUserActions.createdAt,
          ipAddress: adminUserActions.ipAddress,
          userAgent: adminUserActions.userAgent
        })
        .from(adminUserActions)
        .innerJoin(users, eq(adminUserActions.adminId, users.id))
        .where(eq(adminUserActions.userId, userId))
        .orderBy(desc(adminUserActions.createdAt))
        .limit(10);
      
      // Get permission overrides
      const permissions = await db
        .select()
        .from(userPermissionOverrides)
        .where(eq(userPermissionOverrides.userId, userId));
      
      // Get login history
      const loginHistory = await db
        .select()
        .from(userLoginHistory)
        .where(eq(userLoginHistory.userId, userId))
        .orderBy(desc(userLoginHistory.timestamp))
        .limit(10);
      
      return {
        user: safeUser,
        notes,
        accountStatus,
        recentActions,
        permissions,
        loginHistory
      };
    } catch (error) {
      console.error("[UserManagementController] Error getting user details:", error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: number, profileData: any) {
    try {
      // Only allow updating certain fields
      const allowedFields = [
        'displayName', 'firstName', 'lastName', 'email', 
        'avatarUrl', 'bio', 'isAdmin', 'isCoach',
        'passportId', 'isFoundingMember', 'isTestData'
      ];
      
      // Filter out disallowed fields
      const filteredData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (field in profileData) {
          filteredData[field] = profileData[field];
        }
      }
      
      // Add updatedAt field
      filteredData.updatedAt = new Date();
      
      // Update user
      await db
        .update(users)
        .set(filteredData)
        .where(eq(users.id, userId));
      
      // Get updated user
      const updatedUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then(res => res[0]);
      
      // Remove sensitive information
      const { password, ...safeUser } = updatedUser;
      
      return safeUser;
    } catch (error) {
      console.error("[UserManagementController] Error updating user profile:", error);
      throw error;
    }
  }
  
  /**
   * Add note to user
   */
  async addUserNote(
    userId: number, 
    authorId: number, 
    data: { note: string; visibility: 'admin' | 'system' }
  ) {
    try {
      // Insert note
      const result = await db
        .insert(adminUserNotes)
        .values({
          userId,
          authorId,
          note: data.note,
          visibility: data.visibility,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Record action
      await this.recordAdminAction(userId, authorId, 'add_note', {
        noteId: result[0].id,
        visibility: data.visibility
      });
      
      // Get author name
      const author = await db
        .select({ displayName: users.displayName })
        .from(users)
        .where(eq(users.id, authorId))
        .then(res => res[0]);
      
      return {
        ...result[0],
        authorName: author?.displayName
      };
    } catch (error) {
      console.error("[UserManagementController] Error adding user note:", error);
      throw error;
    }
  }
  
  /**
   * Update user account status
   */
  async updateUserStatus(
    userId: number,
    adminId: number,
    data: { 
      status: string; 
      reason?: string;
      expiresAt?: Date;
    }
  ) {
    try {
      // Insert status
      const result = await db
        .insert(userAccountStatus)
        .values({
          userId,
          status: data.status,
          reason: data.reason,
          changedById: adminId,
          createdAt: new Date(),
          expiresAt: data.expiresAt
        })
        .returning();
      
      // Record action
      await this.recordAdminAction(userId, adminId, 'update_status', {
        statusId: result[0].id,
        status: data.status,
        reason: data.reason,
        expiresAt: data.expiresAt
      });
      
      // Get admin name
      const admin = await db
        .select({ displayName: users.displayName })
        .from(users)
        .where(eq(users.id, adminId))
        .then(res => res[0]);
      
      return {
        ...result[0],
        changedByName: admin?.displayName
      };
    } catch (error) {
      console.error("[UserManagementController] Error updating user status:", error);
      throw error;
    }
  }
  
  /**
   * Get user action history
   */
  async getUserActions(userId: number, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Count total actions
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminUserActions)
        .where(eq(adminUserActions.userId, userId));
      
      // Get actions with pagination
      const actions = await db
        .select({
          id: adminUserActions.id,
          userId: adminUserActions.userId,
          adminId: adminUserActions.adminId,
          adminName: users.displayName,
          action: adminUserActions.action,
          details: adminUserActions.details,
          createdAt: adminUserActions.createdAt,
          ipAddress: adminUserActions.ipAddress,
          userAgent: adminUserActions.userAgent
        })
        .from(adminUserActions)
        .innerJoin(users, eq(adminUserActions.adminId, users.id))
        .where(eq(adminUserActions.userId, userId))
        .orderBy(desc(adminUserActions.createdAt))
        .limit(limit)
        .offset(offset);
      
      return {
        actions,
        pagination: {
          page,
          pageSize: limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("[UserManagementController] Error getting user actions:", error);
      throw error;
    }
  }
  
  /**
   * Perform an admin action on a user
   */
  async performAdminAction(
    userId: number,
    adminId: number,
    actionType: string,
    actionData: any
  ) {
    try {
      switch (actionType) {
        case 'note':
          await this.addUserNote(userId, adminId, {
            note: actionData.note,
            visibility: actionData.visibility || 'admin'
          });
          return { success: true, message: 'Note added successfully' };
          
        case 'status':
          await this.updateUserStatus(userId, adminId, {
            status: actionData.status,
            reason: actionData.statusReason,
            expiresAt: actionData.statusExpiration ? new Date(actionData.statusExpiration) : undefined
          });
          return { success: true, message: 'Status updated successfully' };
          
        case 'permission':
          // Implement permission update logic
          return { success: true, message: 'Permission updated successfully' };
          
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      console.error("[UserManagementController] Error performing admin action:", error);
      throw error;
    }
  }
  
  /**
   * Get matches for a specific user
   */
  async getUserMatches(userId: number, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Count total matches
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(matches)
        .where(sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(players::jsonb) AS player
          WHERE (player->>'userId')::int = ${userId}
        )`);
      
      // Get matches with pagination
      const matchesData = await db
        .select()
        .from(matches)
        .where(sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(players::jsonb) AS player
          WHERE (player->>'userId')::int = ${userId}
        )`)
        .orderBy(desc(matches.createdAt))
        .limit(limit)
        .offset(offset);
      
      return {
        matches: matchesData,
        pagination: {
          page,
          pageSize: limit,
          totalItems: Number(count),
          totalPages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error("[UserManagementController] Error getting user matches:", error);
      throw error;
    }
  }
  
  /**
   * Record an admin action
   */
  private async recordAdminAction(
    userId: number,
    adminId: number,
    action: string,
    details: any
  ) {
    try {
      await db
        .insert(adminUserActions)
        .values({
          userId,
          adminId,
          action,
          details: JSON.stringify(details),
          createdAt: new Date()
        });
    } catch (error) {
      console.error("[UserManagementController] Error recording admin action:", error);
      // Don't throw error to prevent disrupting the main operation
    }
  }
}