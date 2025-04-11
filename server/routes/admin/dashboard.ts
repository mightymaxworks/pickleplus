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
import { isAdmin } from "../../auth";
import { IStorage } from "../../storage";
import { db } from "../../db";
import { events } from "@shared/schema/events";
import { matches } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Register admin dashboard routes
 * @param router - Express router to attach routes to
 * @param storage - Storage interface to use
 */
export function registerAdminDashboardRoutes(
  router: express.Router,
  storage: IStorage
): void {
  const dashboardGenerator = createDashboardGenerator(storage);

  /**
   * Get dashboard data
   * GET /api/admin/dashboard
   */
  router.get(
    "/dashboard",
    isAdmin,
    async (req, res) => {
      try {
        // Parse and validate time period from query parameter
        const timePeriodSchema = z.enum([
          DashboardTimePeriod.DAY,
          DashboardTimePeriod.WEEK,
          DashboardTimePeriod.MONTH,
          DashboardTimePeriod.QUARTER,
          DashboardTimePeriod.YEAR,
          DashboardTimePeriod.CUSTOM
        ]);

        const timePeriod = timePeriodSchema.parse(
          req.query.timePeriod || DashboardTimePeriod.MONTH
        );
        
        // Get custom date range if applicable
        let startDate: string | undefined;
        let endDate: string | undefined;
        
        if (timePeriod === DashboardTimePeriod.CUSTOM) {
          startDate = req.query.startDate as string;
          endDate = req.query.endDate as string;
          
          if (!startDate || !endDate) {
            return res.status(400).json({
              error: "Start date and end date are required for custom time period"
            });
          }
          
          // Validate dates
          try {
            new Date(startDate);
            new Date(endDate);
          } catch (e) {
            return res.status(400).json({
              error: "Invalid date format"
            });
          }
        }

        // Get dashboard data
        const dashboard = await dashboardGenerator.getDashboard(timePeriod, startDate, endDate);

        // Get counts for dashboard metrics
        const totalUsers = await storage.getUserCount();
        const totalMatches = await db.select({ count: sql`count(*)` })
          .from(matches)
          .execute()
          .then(result => Number(result[0]?.count) || 0)
          .catch(() => 0);
        const totalEvents = await db.select({ count: sql`count(*)` })
          .from(events)
          .execute()
          .then(result => Number(result[0]?.count) || 0)
          .catch(() => 0);
          
        // Return dashboard data
        return res.status(200).json({
          layout: dashboard,
          totalUsers,
          totalMatches,
          totalEvents,
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