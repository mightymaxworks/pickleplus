/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Service Implementation
 * 
 * This file implements the FeedbackService following Framework 5.0 architecture.
 * It provides methods for submitting, retrieving, and managing bug reports.
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { bugReports, type InsertBugReport, type BugReport } from '../../../shared/bug-report-schema';
import { z } from 'zod';

/**
 * Interface defining the FeedbackService capabilities
 */
export interface IFeedbackService {
  submitBugReport(reportData: InsertBugReport): Promise<BugReport>;
  getBugReportById(id: number): Promise<BugReport | null>;
  listBugReports(options?: ListBugReportsOptions): Promise<BugReport[]>;
  updateBugReportStatus(id: number, status: BugReport['status'], adminNotes?: string): Promise<BugReport | null>;
  assignBugReport(id: number, assignedTo: number | null): Promise<BugReport | null>;
  getReportCountBySeverity(userId?: number): Promise<SeverityCount[]>;
}

/**
 * Options for listing bug reports
 */
export interface ListBugReportsOptions {
  status?: BugReport['status'];
  severity?: BugReport['severity'];
  userId?: number;
  limit?: number;
  offset?: number;
}

/**
 * Type for severity count statistics
 */
export interface SeverityCount {
  severity: BugReport['severity'];
  count: number;
}

/**
 * Implementation of the FeedbackService
 */
export class FeedbackService implements IFeedbackService {
  /**
   * Submit a new bug report
   */
  async submitBugReport(reportData: InsertBugReport): Promise<BugReport> {
    try {
      console.log('[FeedbackService] Submitting bug report:', { 
        title: reportData.title,
        severity: reportData.severity
      });
      
      // Set the current timestamp for created_at and updated_at
      const now = new Date();
      
      // Insert the bug report
      const [result] = await db.insert(bugReports).values({
        ...reportData,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      console.log('[FeedbackService] Bug report submitted successfully:', { id: result.id });
      
      return result;
    } catch (error) {
      console.error('[FeedbackService] Error submitting bug report:', error);
      throw new Error('Failed to submit bug report');
    }
  }

  /**
   * Get a bug report by ID
   */
  async getBugReportById(id: number): Promise<BugReport | null> {
    try {
      console.log(`[FeedbackService] Getting bug report with ID: ${id}`);
      
      const [report] = await db.select().from(bugReports).where(eq(bugReports.id, id));
      
      return report || null;
    } catch (error) {
      console.error(`[FeedbackService] Error getting bug report with ID ${id}:`, error);
      throw new Error('Failed to get bug report');
    }
  }

  /**
   * List bug reports with optional filtering
   */
  async listBugReports(options: ListBugReportsOptions = {}): Promise<BugReport[]> {
    try {
      console.log('[FeedbackService] Listing bug reports with options:', options);
      
      let query = db.select().from(bugReports);
      
      // Apply filters
      const conditions = [];
      
      if (options.status) {
        conditions.push(eq(bugReports.status, options.status));
      }
      
      if (options.severity) {
        conditions.push(eq(bugReports.severity, options.severity));
      }
      
      if (options.userId) {
        conditions.push(eq(bugReports.userId, options.userId));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting - newest first
      query = query.orderBy(desc(bugReports.createdAt));
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
      
      const reports = await query;
      
      console.log(`[FeedbackService] Found ${reports.length} bug reports`);
      
      return reports;
    } catch (error) {
      console.error('[FeedbackService] Error listing bug reports:', error);
      throw new Error('Failed to list bug reports');
    }
  }

  /**
   * Update a bug report's status
   */
  async updateBugReportStatus(
    id: number,
    status: BugReport['status'],
    adminNotes?: string
  ): Promise<BugReport | null> {
    try {
      console.log(`[FeedbackService] Updating bug report ${id} status to ${status}`);
      
      // Setup update data
      const updateData: Partial<BugReport> = {
        status,
        updatedAt: new Date()
      };
      
      // Add admin notes if provided
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      // Set resolvedAt if the status is 'resolved'
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
      
      // Update the bug report
      const [updatedReport] = await db
        .update(bugReports)
        .set(updateData)
        .where(eq(bugReports.id, id))
        .returning();
      
      console.log(`[FeedbackService] Bug report ${id} status updated successfully`);
      
      return updatedReport || null;
    } catch (error) {
      console.error(`[FeedbackService] Error updating bug report ${id} status:`, error);
      throw new Error('Failed to update bug report status');
    }
  }

  /**
   * Assign a bug report to a team member
   */
  async assignBugReport(id: number, assignedTo: number | null): Promise<BugReport | null> {
    try {
      console.log(`[FeedbackService] Assigning bug report ${id} to ${assignedTo || 'no one'}`);
      
      // Update the bug report
      const [updatedReport] = await db
        .update(bugReports)
        .set({
          assignedTo,
          updatedAt: new Date()
        })
        .where(eq(bugReports.id, id))
        .returning();
      
      console.log(`[FeedbackService] Bug report ${id} assigned successfully`);
      
      return updatedReport || null;
    } catch (error) {
      console.error(`[FeedbackService] Error assigning bug report ${id}:`, error);
      throw new Error('Failed to assign bug report');
    }
  }

  /**
   * Get count of bug reports by severity
   */
  async getReportCountBySeverity(userId?: number): Promise<SeverityCount[]> {
    try {
      console.log('[FeedbackService] Getting bug report counts by severity');
      
      // Define the base query for counting
      let query = db.select({
        severity: bugReports.severity,
        count: sql<number>`count(*)::int`
      }).from(bugReports);
      
      // Filter by user ID if provided
      if (userId) {
        query = query.where(eq(bugReports.userId, userId));
      }
      
      // Group by severity
      query = query.groupBy(bugReports.severity);
      
      const counts = await query;
      
      console.log('[FeedbackService] Bug report counts:', counts);
      
      // Make sure we have a count for all severities
      const allSeverities = ['low', 'medium', 'high', 'critical'] as const;
      const result: SeverityCount[] = [];
      
      for (const severity of allSeverities) {
        // Find the count for this severity
        const found = counts.find(row => row.severity === severity);
        
        // Add the count (or 0 if not found)
        result.push({
          severity: severity,
          count: found ? found.count : 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('[FeedbackService] Error getting bug report counts by severity:', error);
      throw new Error('Failed to get bug report counts');
    }
  }
}

// Export a singleton instance of the service
export const feedbackService = new FeedbackService();