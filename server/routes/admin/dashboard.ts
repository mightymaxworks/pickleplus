/**
 * PKL-278651-ADMIN-0011-DASH
 * Admin Dashboard Routes
 * 
 * This file defines the API routes for the unified admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import express from "express";
import { z } from "zod";
import { createDashboardGenerator } from "../../services/dashboard-generator";
import { DashboardTimePeriod } from "@shared/schema/admin/dashboard";
import { ensureAdmin } from "../../middleware/auth";
import { StorageInterface } from "../../storage";

/**
 * Register admin dashboard routes
 * @param router - Express router to attach routes to
 * @param storage - Storage interface to use
 */
export function registerAdminDashboardRoutes(
  router: express.Router,
  storage: StorageInterface
): void {
  const dashboardGenerator = createDashboardGenerator(storage);

  /**
   * Get dashboard data
   * GET /api/admin/dashboard
   */
  router.get(
    "/dashboard",
    ensureAdmin,
    async (req, res) => {
      try {
        // Parse and validate time period from query parameter
        const timePeriodSchema = z.enum([
          DashboardTimePeriod.DAY,
          DashboardTimePeriod.WEEK,
          DashboardTimePeriod.MONTH,
          DashboardTimePeriod.QUARTER,
          DashboardTimePeriod.YEAR
        ]);

        const timePeriod = timePeriodSchema.parse(
          req.query.timePeriod || DashboardTimePeriod.MONTH
        );

        // Get dashboard data
        const dashboard = await dashboardGenerator.getDashboard(timePeriod);

        // Return dashboard data
        return res.status(200).json({
          layout: dashboard,
          totalUsers: await storage.getUserCount(),
          totalMatches: await storage.getMatchCount(),
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error getting dashboard data:", error);
        return res.status(500).json({
          error: "Failed to get dashboard data"
        });
      }
    }
  );

  console.log("[API] Admin Dashboard routes registered (PKL-278651-ADMIN-0011-DASH)");
}