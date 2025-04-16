/**
 * PKL-278651-ADMIN-0015-USER
 * User Management Routes
 * 
 * This file contains the routes for the user management feature
 */

import express, { Request, Response } from 'express';
import { UserManagementController } from '../controllers/user-management-controller';

const router = express.Router();
const controller = new UserManagementController();

/**
 * Get users list with pagination, filtering, and sorting
 * GET /api/admin/users
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortDir = 'desc',
      search,
      filter
    } = req.query;
    
    // Parse parameters with proper defaults and validation 
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const sortByStr = (sortBy as string) || 'createdAt';
    const sortDirStr = ['asc', 'desc'].includes(sortDir as string) ? (sortDir as string) : 'desc';

    const result = await controller.getUsers({
      page: pageNum,
      limit: limitNum,
      sortBy: sortByStr,
      sortDir: sortDirStr,
      search: search as string || undefined,
      filter: filter as string || undefined
    });
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

/**
 * Get user details including notes, account status, etc.
 * GET /api/admin/users/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const result = await controller.getUserDetails(userId);
    
    if (!result.user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error getting user details:", error);
    res.status(500).json({ error: "Failed to get user details" });
  }
});

/**
 * Update user profile
 * PATCH /api/admin/users/:id/profile
 */
router.patch('/:id/profile', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const result = await controller.updateUserProfile(userId, req.body);
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

/**
 * Add note to user
 * POST /api/admin/users/:id/notes
 */
router.post('/:id/notes', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const { note, visibility } = req.body;
    
    if (!note) {
      return res.status(400).json({ error: "Note content is required" });
    }
    
    const result = await controller.addUserNote(userId, req.user!.id, {
      note,
      visibility: visibility || 'admin'
    });
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error adding user note:", error);
    res.status(500).json({ error: "Failed to add user note" });
  }
});

/**
 * Update user account status
 * PUT /api/admin/users/:id/status
 */
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const { status, reason, expiresAt } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    const result = await controller.updateUserStatus(userId, req.user!.id, {
      status,
      reason,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

/**
 * Get user action history
 * GET /api/admin/users/:id/actions
 */
router.get('/:id/actions', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const result = await controller.getUserActions(userId, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error getting user actions:", error);
    res.status(500).json({ error: "Failed to get user actions" });
  }
});

/**
 * Perform an admin action on a user
 * POST /api/admin/users/actions
 */
router.post('/actions', async (req: Request, res: Response) => {
  try {
    const { userId, actionType, ...actionData } = req.body;
    
    if (!userId || !actionType) {
      return res.status(400).json({ error: "User ID and action type are required" });
    }
    
    const result = await controller.performAdminAction(
      parseInt(userId),
      req.user!.id,
      actionType,
      actionData
    );
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error performing admin action:", error);
    res.status(500).json({ error: "Failed to perform admin action" });
  }
});

/**
 * Get matches for a specific user
 * GET /api/admin/users/:id/matches
 */
router.get('/:id/matches', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const result = await controller.getUserMatches(userId, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error("[Admin API] Error getting user matches:", error);
    res.status(500).json({ error: "Failed to get user matches" });
  }
});

export default router;