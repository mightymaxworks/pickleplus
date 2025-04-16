/**
 * PKL-278651-ADMIN-0015-USER
 * Enhanced User Management Routes
 * 
 * This file defines API routes for enhanced user management functionality.
 */

import { Router } from 'express';
import { 
  getUsers,
  getUserDetails,
  addUserNote,
  updateUserStatus,
  updateUserProfile,
  getUserAdminActions,
  recordAdminAction,
  getUserStats
} from '../controllers/user-management-controller';
import { isAuthenticated, isAdmin } from '../../../auth';

const router = Router();

// Apply admin authentication to all routes
router.use(isAuthenticated, isAdmin);

// Get user stats for dashboard
router.get('/stats', getUserStats);

// Get users with pagination, filtering, and sorting
router.get('/', getUsers);

// Get detailed user profile
router.get('/:id', getUserDetails);

// Add admin note to user
router.post('/:id/notes', addUserNote);

// Update user account status
router.post('/:id/status', updateUserStatus);

// Update user profile (admin version)
router.patch('/:id/profile', updateUserProfile);

// Get admin actions for a user
router.get('/:id/actions', getUserAdminActions);

// Record admin action
router.post('/actions', recordAdminAction);

export default router;