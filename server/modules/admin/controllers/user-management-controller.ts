/**
 * PKL-278651-ADMIN-0015-USER
 * User Management Controller
 * 
 * This controller handles logic for enhanced user management operations.
 */

import { Request, Response } from 'express';
import { eq, and, or, like, desc, asc, sql, isNull } from 'drizzle-orm';
import { db } from '../../../db';
import { users } from '../../../../shared/schema';
import { 
  adminUserNotes, 
  adminUserActions, 
  userPermissionOverrides,
  userLoginHistory,
  userAccountStatus,
  insertAdminUserNoteSchema,
  insertAdminUserActionSchema,
  insertUserAccountStatusSchema
} from '../../../../shared/schema/admin/user-management';
import { z } from 'zod';

/**
 * Get users with pagination, filtering, and sorting
 */
export async function getUsers(req: Request, res: Response) {
  try {
    // Parse query parameters with validation
    const queryParamsSchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      search: z.string().optional(),
      filter: z.string().optional(),
      sortBy: z.string().default('createdAt'),
      sortDir: z.enum(['asc', 'desc']).default('desc')
    });

    const { page, limit, search, filter, sortBy, sortDir } = queryParamsSchema.parse({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      filter: req.query.filter,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    let whereClause: any = {};

    if (search) {
      whereClause = or(
        like(users.username, `%${search}%`),
        like(users.email, `%${search}%`),
        like(users.displayName, `%${search}%`),
        like(users.passportId, `%${search}%`)
      );
    }

    // Apply role filters
    if (filter) {
      switch (filter) {
        case 'admin':
          whereClause = and(whereClause, eq(users.isAdmin, true));
          break;
        case 'founding':
          whereClause = and(whereClause, eq(users.isFoundingMember, true));
          break;
        case 'active':
          whereClause = and(whereClause, eq(users.lastMatchDate, isNull(users.lastMatchDate).not()));
          break;
        // Add more filters as needed
      }
    }

    // Get users with pagination and filtering
    const usersData = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(
        sortDir === 'desc' 
          ? desc(users[sortBy as keyof typeof users]) 
          : asc(users[sortBy as keyof typeof users])
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(whereClause);

    const totalCount = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      users: usersData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}

/**
 * Get detailed user profile by ID
 */
export async function getUserDetails(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get user details
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's admin notes
    const notes = await db
      .select({
        id: adminUserNotes.id,
        note: adminUserNotes.note,
        visibility: adminUserNotes.visibility,
        createdAt: adminUserNotes.createdAt,
        authorId: adminUserNotes.authorId,
        authorUsername: users.username
      })
      .from(adminUserNotes)
      .innerJoin(users, eq(adminUserNotes.authorId, users.id))
      .where(eq(adminUserNotes.userId, userId))
      .orderBy(desc(adminUserNotes.createdAt));

    // Get user's account status
    const status = await db
      .select()
      .from(userAccountStatus)
      .where(eq(userAccountStatus.userId, userId))
      .orderBy(desc(userAccountStatus.createdAt))
      .limit(1);

    // Get recent admin actions
    const recentActions = await db
      .select({
        id: adminUserActions.id,
        actionType: adminUserActions.actionType,
        description: adminUserActions.description,
        createdAt: adminUserActions.createdAt,
        adminId: adminUserActions.adminId,
        adminUsername: users.username
      })
      .from(adminUserActions)
      .innerJoin(users, eq(adminUserActions.adminId, users.id))
      .where(eq(adminUserActions.userId, userId))
      .orderBy(desc(adminUserActions.createdAt))
      .limit(5);

    // Get user permission overrides
    const permissions = await db
      .select()
      .from(userPermissionOverrides)
      .where(eq(userPermissionOverrides.userId, userId))
      .orderBy(desc(userPermissionOverrides.createdAt));

    // Get recent login history
    const loginHistory = await db
      .select()
      .from(userLoginHistory)
      .where(eq(userLoginHistory.userId, userId))
      .orderBy(desc(userLoginHistory.loginAt))
      .limit(10);

    return res.status(200).json({
      user: userData[0],
      notes,
      accountStatus: status.length ? status[0] : null,
      recentActions,
      permissions,
      loginHistory
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ message: 'Failed to fetch user details' });
  }
}

/**
 * Add admin note to user
 */
export async function addUserNote(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate request body
    const validatedData = insertAdminUserNoteSchema.parse(req.body);
    
    // Insert note
    const [newNote] = await db
      .insert(adminUserNotes)
      .values({
        userId,
        authorId: req.user!.id, // Admin ID from auth middleware
        note: validatedData.note,
        visibility: validatedData.visibility
      })
      .returning();

    // Log admin action
    await db.insert(adminUserActions).values({
      userId,
      adminId: req.user!.id,
      actionType: 'ADD_NOTE',
      description: `Added ${validatedData.visibility} note to user`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(201).json(newNote);
  } catch (error) {
    console.error('Error adding user note:', error);
    return res.status(500).json({ message: 'Failed to add user note' });
  }
}

/**
 * Update user account status
 */
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate request body
    const validatedData = insertUserAccountStatusSchema.parse(req.body);
    
    // Insert account status
    const [newStatus] = await db
      .insert(userAccountStatus)
      .values({
        userId,
        status: validatedData.status,
        reason: validatedData.reason,
        changedById: req.user!.id,
        expiresAt: validatedData.expiresAt
      })
      .returning();

    // Log admin action
    await db.insert(adminUserActions).values({
      userId,
      adminId: req.user!.id,
      actionType: 'UPDATE_STATUS',
      description: `Updated user status to ${validatedData.status}`,
      metadata: JSON.stringify({ reason: validatedData.reason }),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json(newStatus);
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
}

/**
 * Update user profile data (admin version with more capabilities)
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Define updateable fields
    const updateableFields = [
      'username', 'email', 'displayName', 'firstName', 'lastName',
      'location', 'bio', 'isAdmin', 'isFoundingMember', 'passportId',
      'yearOfBirth', 'level', 'xp', 'privacyProfile'
    ];

    // Create a schema for validation
    const updateSchema = z.object({
      username: z.string().min(3).optional(),
      email: z.string().email().optional(),
      displayName: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      location: z.string().optional(),
      bio: z.string().optional(),
      isAdmin: z.boolean().optional(),
      isFoundingMember: z.boolean().optional(),
      passportId: z.string().optional(),
      yearOfBirth: z.number().int().optional(),
      level: z.number().int().optional(),
      xp: z.number().int().optional(),
      privacyProfile: z.string().optional(),
      // Add more fields as needed
    });

    // Validate request body
    const validatedData = updateSchema.parse(req.body);
    
    // Filter to only include fields that are in the updateableFields list
    const updateData: Record<string, any> = {};
    Object.keys(validatedData).forEach(key => {
      if (updateableFields.includes(key)) {
        updateData[key] = validatedData[key as keyof typeof validatedData];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        lastUpdated: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Log admin action
    await db.insert(adminUserActions).values({
      userId,
      adminId: req.user!.id,
      actionType: 'UPDATE_PROFILE',
      description: `Updated user profile fields: ${Object.keys(updateData).join(', ')}`,
      metadata: JSON.stringify(updateData),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Failed to update user profile' });
  }
}

/**
 * Get admin actions for a user
 */
export async function getUserAdminActions(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Parse query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get admin actions
    const actions = await db
      .select({
        id: adminUserActions.id,
        actionType: adminUserActions.actionType,
        description: adminUserActions.description,
        metadata: adminUserActions.metadata,
        createdAt: adminUserActions.createdAt,
        adminId: adminUserActions.adminId,
        adminUsername: users.username
      })
      .from(adminUserActions)
      .innerJoin(users, eq(adminUserActions.adminId, users.id))
      .where(eq(adminUserActions.userId, userId))
      .orderBy(desc(adminUserActions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(adminUserActions)
      .where(eq(adminUserActions.userId, userId));

    const totalCount = Number(totalCountResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      actions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching user admin actions:', error);
    return res.status(500).json({ message: 'Failed to fetch user admin actions' });
  }
}

/**
 * Record admin action
 */
export async function recordAdminAction(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = insertAdminUserActionSchema.parse(req.body);
    
    // Insert admin action
    const [newAction] = await db
      .insert(adminUserActions)
      .values({
        ...validatedData,
        adminId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      })
      .returning();

    return res.status(201).json(newAction);
  } catch (error) {
    console.error('Error recording admin action:', error);
    return res.status(500).json({ message: 'Failed to record admin action' });
  }
}

/**
 * Get stats about users
 */
export async function getUserStats(req: Request, res: Response) {
  try {
    // Get total user count
    const totalUsersResult = await db
      .select({ count: sql`count(*)` })
      .from(users);
    
    // Get admin count
    const adminsResult = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, true));
    
    // Get founding members count
    const foundingMembersResult = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.isFoundingMember, true));
    
    // Get active users (played a match in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`${users.lastMatchDate} >= ${thirtyDaysAgo}`);
    
    // Get new users (created in the last 30 days)
    const newUsersResult = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);
    
    // Get top 5 users by ranking points
    const topRankedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        rankingPoints: users.rankingPoints,
        level: users.level
      })
      .from(users)
      .orderBy(desc(users.rankingPoints))
      .limit(5);

    return res.status(200).json({
      totalUsers: Number(totalUsersResult[0].count),
      admins: Number(adminsResult[0].count),
      foundingMembers: Number(foundingMembersResult[0].count),
      activeUsers: Number(activeUsersResult[0].count),
      newUsers: Number(newUsersResult[0].count),
      topRankedUsers
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ message: 'Failed to fetch user stats' });
  }
}