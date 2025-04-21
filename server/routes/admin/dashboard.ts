/**
 * PKL-278651-ADMIN-0012-PERF
 * Admin Dashboard Routes with Performance Optimizations
 * 
 * This file defines the API routes for the unified admin dashboard.
 * It includes performance optimizations as part of PKL-278651-ADMIN-0012-PERF sprint.
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
import NodeCache from "node-cache";

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
  
  // Create a shared cache for dashboard data
  // TTL set to 5 minutes (300 seconds)
  const dashboardCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

  /**
   * Get system metrics for the dashboard
   * GET /api/admin/dashboard/metrics
   */
  router.get(
    "/dashboard/metrics",
    isAdmin,
    async (req, res) => {
      try {
        const cacheKey = "system_metrics";
        
        // Check if we have cached data
        const cachedMetrics = dashboardCache.get(cacheKey);
        if (cachedMetrics) {
          console.log("[API] Returning cached system metrics");
          return res.status(200).json(cachedMetrics);
        }
        
        // Get system metrics
        const metrics = await dashboardGenerator.getSystemMetrics();
        
        // Cache the result
        dashboardCache.set(cacheKey, metrics);
        
        return res.status(200).json(metrics);
      } catch (error) {
        console.error("Error getting system metrics:", error);
        return res.status(500).json({
          error: "Failed to get system metrics"
        });
      }
    }
  );

  /**
   * Get dashboard widgets
   * GET /api/admin/dashboard/widgets
   */
  router.get(
    "/dashboard/widgets",
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
        
        // Create a cache key based on the time period and date range
        const cacheKey = `widgets_${timePeriod}_${startDate || ''}_${endDate || ''}`;
        
        // Check if we have cached data
        const cachedWidgets = dashboardCache.get(cacheKey);
        if (cachedWidgets) {
          console.log(`[API] Returning cached dashboard widgets for ${timePeriod}`);
          return res.status(200).json(cachedWidgets);
        }

        // Get dashboard widgets
        const widgets = await dashboardGenerator.getDashboardWidgets(timePeriod, startDate, endDate);
        
        // Cache the result
        dashboardCache.set(cacheKey, widgets);
        
        return res.status(200).json(widgets);
      } catch (error) {
        console.error("Error getting dashboard widgets:", error);
        return res.status(500).json({
          error: "Failed to get dashboard widgets"
        });
      }
    }
  );

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
        
        // Create a cache key based on the time period and date range
        const cacheKey = `dashboard_${timePeriod}_${startDate || ''}_${endDate || ''}`;
        
        // Check if we have cached data
        const cachedDashboard = dashboardCache.get(cacheKey);
        if (cachedDashboard) {
          console.log(`[API] Returning cached dashboard for ${timePeriod}`);
          return res.status(200).json(cachedDashboard);
        }

        // Get dashboard data
        const dashboard = await dashboardGenerator.getDashboard(timePeriod, startDate, endDate);

        // Get counts for dashboard metrics
        console.log("[API] Fetching dashboard metrics counts");
        const totalUsers = await storage.getUserCount();
        console.log("[API] Total users count from storage:", totalUsers);
        
        const totalMatches = await db.select({ count: sql`count(*)` })
          .from(matches)
          .execute()
          .then(result => {
            console.log("[API] Raw matches count result:", result);
            return Number(result[0]?.count) || 0;
          })
          .catch((err) => {
            console.error("[API] Error getting match count:", err);
            return 0;
          });
        console.log("[API] Total matches count:", totalMatches);
        
        const totalEvents = await db.select({ count: sql`count(*)` })
          .from(events)
          .execute()
          .then(result => {
            console.log("[API] Raw events count result:", result);
            return Number(result[0]?.count) || 0;
          })
          .catch((err) => {
            console.error("[API] Error getting event count:", err);
            return 0;
          });
        console.log("[API] Total events count:", totalEvents);
          
        // Create response object
        const responseData = {
          layout: dashboard,
          totalUsers,
          totalMatches,
          totalEvents,
          lastUpdated: new Date().toISOString()
        };
        
        console.log("[API] Response data metrics:", {
          totalUsers,
          totalMatches,
          totalEvents
        });
        
        // Cache the result
        dashboardCache.set(cacheKey, responseData);
          
        // Return dashboard data
        return res.status(200).json(responseData);
      } catch (error) {
        console.error("Error getting dashboard data:", error);
        return res.status(500).json({
          error: "Failed to get dashboard data"
        });
      }
    }
  );

  console.log("[API] Admin Dashboard routes registered (PKL-278651-ADMIN-0012-PERF)");
}