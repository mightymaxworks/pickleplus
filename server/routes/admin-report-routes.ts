/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Routes Registration
 * 
 * This file registers the admin reporting API routes with the Express app.
 */

import express from "express";
import { isAuthenticated, isAdmin } from "../auth";
import reportRoutes from "./admin/reports";

export function registerAdminReportRoutes(app: express.Express) {
  console.log("[API] Registering Admin Reporting routes (PKL-278651-ADMIN-0010-REPORT)");
  // Register admin report routes with authentication middleware
  app.use("/api/admin/reports", isAuthenticated, isAdmin, reportRoutes);
}