/**
 * PKL-278651-ADMIN-0015-USER
 * Admin Module Index
 * 
 * This file initializes and exports the admin module components.
 */

import { Router } from 'express';
import userManagementRoutes from './routes/user-management-routes';

// Create admin router
export const adminRouter = Router();

// Mount routes
adminRouter.use('/users', userManagementRoutes);

// Initialize admin module
export function initializeAdminModule() {
  console.log('[API] Initializing Admin Module (PKL-278651-ADMIN-0015-USER)');
  return adminRouter;
}