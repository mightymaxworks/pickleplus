/**
 * Users Admin API Router
 * 
 * PKL-278651-ADMIN-API-002
 * Simplified user management endpoints using existing schema
 */
import express from 'express';
import { eq, sql, desc, like, and } from 'drizzle-orm';
import { db } from '../../../db';
import { users } from '../../../../shared/schema';
import { z } from 'zod';

// Simplified admin auth
const simpleAdminAuth = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
};

// Input validation schemas
const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export function createUsersAdminRouter(): express.Router {
  const router = express.Router();

  /**
   * GET /api/admin/v1/users
   * List users with pagination and search
   */
  router.get('/', simpleAdminAuth, async (req, res) => {
    try {
      const { page, limit, search } = getUsersQuerySchema.parse(req.query);
      const offset = (page - 1) * limit;

      let query = db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        rankingPoints: users.rankingPoints,
        picklePoints: users.picklePoints,
      }).from(users);

      if (search) {
        query = query.where(
          sql`${users.username} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`
        );
      }

      const userList = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
      const totalCount = await db.select({ count: sql<number>`count(*)` }).from(users);

      res.json({
        users: userList,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Users list error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  /**
   * GET /api/admin/v1/users/:id
   * Get specific user details
   */
  router.get('/:id', simpleAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive fields
      const { password, ...userInfo } = user[0];
      res.json(userInfo);
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  /**
   * GET /api/admin/v1/users/stats
   * Get user statistics
   */
  router.get('/stats', simpleAdminAuth, async (req, res) => {
    try {
      const stats = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isAdmin, true)),
        db.select({ 
          avgRanking: sql<number>`avg(${users.rankingPoints})`,
          maxRanking: sql<number>`max(${users.rankingPoints})`
        }).from(users)
      ]);

      res.json({
        totalUsers: stats[0][0]?.count || 0,
        adminUsers: stats[1][0]?.count || 0,
        averageRankingPoints: Math.round(stats[2][0]?.avgRanking || 0),
        maxRankingPoints: stats[2][0]?.maxRanking || 0,
      });
    } catch (error) {
      console.error('User stats error:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  return router;
}