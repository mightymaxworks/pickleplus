/**
 * PKL-278651-ADMIN-0011-DASH
 * Admin Dashboard Routes Registration
 * 
 * This file registers the admin dashboard API routes with the Express app.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import express from "express";
import { isAuthenticated, isAdmin } from "../auth";
import { storage } from "../storage";

// Create a new router for admin dashboard routes
const dashboardRouter = express.Router();

// Import dashboard routes
import { registerAdminDashboardRoutes } from "./admin/dashboard";

// Register dashboard routes
registerAdminDashboardRoutes(dashboardRouter, storage);

/**
 * Register admin dashboard routes with the Express app
 * @param app - Express application
 */
export function registerAdminDashboardRoutes(app: express.Express) {
  console.log("[API] Registering Admin Dashboard routes (PKL-278651-ADMIN-0011-DASH)");
  // Register admin dashboard routes with authentication middleware
  app.use("/api/admin", isAuthenticated, isAdmin, dashboardRouter);
}