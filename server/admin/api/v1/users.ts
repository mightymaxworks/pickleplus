/**
 * Users Admin API Router
 * 
 * PKL-278651-ADMIN-API-002
 * Comprehensive user management admin endpoints
 * UDF Rule 18-20 Compliance - Admin controls with security and audit
 */
import express from 'express';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { users } from '../../../../shared/schema';
import { 
  requireAdminRole, 
  requirePermission, 
  withAudit,
  AdminRole,
  AdminActionType,
  AdminRequest 
} from '../../core/security';
import { z } from 'zod';

// Input validation schemas
const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['username', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'suspended', 'all']).default('all'),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

export function createUsersAdminRouter(): express.Router {
  const router = express.Router();

  /**
   * GET /api/admin/v1/users
   * List all users with pagination, search, and filtering
   */
  router.get('/',
    requirePermission('read', 'users'),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'users_list'),
    async (req: AdminRequest, res) => {
      try {
        const query = getUsersQuerySchema.parse(req.query);
        
        let userQuery = db.select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          isActive: users.isActive,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lastLogin: users.lastLogin,
          // Security-sensitive info only for higher roles
          ...(req.adminContext?.role === AdminRole.SUPER_ADMIN || req.adminContext?.role === AdminRole.ADMIN ? {
            passwordResetToken: users.passwordResetToken,
            emailVerificationToken: users.emailVerificationToken,
          } : {})
        }).from(users);

        // Apply search filter
        if (query.search) {
          userQuery = userQuery.where(
            sql`${users.username} ILIKE ${`%${query.search}%`} OR ${users.email} ILIKE ${`%${query.search}%`}`
          );
        }

        // Apply status filter
        if (query.status !== 'all') {
          const isActive = query.status === 'active';
          userQuery = userQuery.where(eq(users.isActive, isActive));
        }

        // Apply sorting
        const sortColumn = users[query.sortBy as keyof typeof users];
        if (sortColumn) {
          userQuery = query.sortOrder === 'desc' 
            ? userQuery.orderBy(desc(sortColumn))
            : userQuery.orderBy(sortColumn);
        }

        // Apply pagination
        const offset = (query.page - 1) * query.limit;
        userQuery = userQuery.limit(query.limit).offset(offset);

        const usersList = await userQuery;
        
        // Get total count for pagination
        const [{ count }] = await db.select({ 
          count: sql<number>`count(*)::int` 
        }).from(users);

        res.json({
          users: usersList,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count,
            pages: Math.ceil(count / query.limit)
          },
          filters: {
            search: query.search,
            status: query.status,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder
          }
        });
      } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    }
  );

  /**
   * GET /api/admin/v1/users/:id
   * Get detailed user information
   */
  router.get('/:id',
    requirePermission('read', 'users'),
    withAudit(AdminActionType.VIEW_FINANCIAL_DATA, 'user_details'),
    async (req: AdminRequest, res) => {
      try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data based on admin role
        if (req.adminContext?.role !== AdminRole.SUPER_ADMIN) {
          delete (user as any).passwordResetToken;
          delete (user as any).emailVerificationToken;
        }

        res.json({ user });
      } catch (error) {
        console.error('User details error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
      }
    }
  );

  /**
   * PUT /api/admin/v1/users/:id
   * Update user information
   */
  router.put('/:id',
    requirePermission('update', 'users'),
    withAudit(AdminActionType.UPDATE_USER, 'user_update'),
    async (req: AdminRequest, res) => {
      try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        const updateData = updateUserSchema.parse(req.body);

        // Get current state for audit
        const currentUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!currentUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Perform update
        const [updatedUser] = await db.update(users)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        // Store state for audit
        res.locals.newState = updatedUser;

        res.json({ 
          user: updatedUser,
          message: 'User updated successfully' 
        });
      } catch (error) {
        console.error('User update error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update user' });
      }
    }
  );

  /**
   * POST /api/admin/v1/users
   * Create new user (admin-created accounts)
   */
  router.post('/',
    requirePermission('create', 'users'),
    withAudit(AdminActionType.CREATE_USER, 'user_creation'),
    async (req: AdminRequest, res) => {
      try {
        const userData = createUserSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: sql`${users.username} = ${userData.username} OR ${users.email} = ${userData.email}`,
        });

        if (existingUser) {
          return res.status(409).json({ error: 'User with this username or email already exists' });
        }

        // Hash password (you'd use bcrypt in real implementation)
        const hashedPassword = userData.password; // Placeholder - implement proper hashing

        const [newUser] = await db.insert(users).values({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isActive: true,
          isVerified: true, // Admin-created accounts are pre-verified
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        // Store for audit
        res.locals.newState = newUser;

        // Remove password from response
        const { password, ...userResponse } = newUser;

        res.status(201).json({ 
          user: userResponse,
          message: 'User created successfully' 
        });
      } catch (error) {
        console.error('User creation error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  );

  /**
   * DELETE /api/admin/v1/users/:id
   * Suspend/deactivate user (we don't actually delete users)
   */
  router.delete('/:id',
    requirePermission('delete', 'users'),
    withAudit(AdminActionType.SUSPEND_USER, 'user_suspension'),
    async (req: AdminRequest, res) => {
      try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Get current state for audit
        const currentUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!currentUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Suspend user instead of deleting
        const [suspendedUser] = await db.update(users)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        res.locals.newState = suspendedUser;

        res.json({ 
          message: 'User suspended successfully',
          user: suspendedUser 
        });
      } catch (error) {
        console.error('User suspension error:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
      }
    }
  );

  /**
   * POST /api/admin/v1/users/:id/restore
   * Restore suspended user
   */
  router.post('/:id/restore',
    requirePermission('update', 'users'),
    withAudit(AdminActionType.RESTORE_USER, 'user_restoration'),
    async (req: AdminRequest, res) => {
      try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
          return res.status(400).json({ error: 'Invalid user ID' });
        }

        const [restoredUser] = await db.update(users)
          .set({
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        if (!restoredUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.locals.newState = restoredUser;

        res.json({ 
          message: 'User restored successfully',
          user: restoredUser 
        });
      } catch (error) {
        console.error('User restoration error:', error);
        res.status(500).json({ error: 'Failed to restore user' });
      }
    }
  );

  return router;
}