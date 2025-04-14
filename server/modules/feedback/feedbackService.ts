/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Service Implementation
 * 
 * This file implements the FeedbackService following Framework 5.0 architecture.
 * It provides methods for submitting, retrieving, and managing bug reports.
 */

import { db } from '../../storage';
import { bugReports, type InsertBugReport, type BugReport } from '@/shared/bug-report-schema';
import { and, eq, desc, sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { users } from '@/shared/schema';

/**
 * Interface defining the FeedbackService capabilities
 */
export interface IFeedbackService {
  submitBugReport(reportData: InsertBugReport): Promise<BugReport>;
  getBugReportById(id: number): Promise<BugReport | null>;
  listBugReports(options?: ListBugReportsOptions): Promise<BugReport[]>;
  updateBugReportStatus(id: number, status: BugReport['status'], adminNotes?: string): Promise<BugReport | null>;
  assignBugReport(id: number, assignedTo: number | null): Promise<BugReport | null>;
  getReportCountBySeverity(): Promise<SeverityCount[]>;
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
      // Ensure uploads directory exists
      if (reportData.screenshotPath) {
        const dir = path.dirname(reportData.screenshotPath);
        await fs.mkdir(dir, { recursive: true });
      }
      
      // Insert the bug report
      const result = await db.insert(bugReports)
        .values({
          ...reportData,
          updatedAt: new Date(),
          createdAt: new Date()
        })
        .returning();
      
      // Log the submission for auditing
      console.log(`[FeedbackService] Bug report submitted: ID ${result[0].id}`);
      
      return result[0];
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
      const result = await db.query.bugReports.findFirst({
        where: eq(bugReports.id, id)
      });
      
      return result || null;
    } catch (error) {
      console.error(`[FeedbackService] Error getting bug report ${id}:`, error);
      throw new Error('Failed to retrieve bug report');
    }
  }
  
  /**
   * List bug reports with optional filtering
   */
  async listBugReports(options: ListBugReportsOptions = {}): Promise<BugReport[]> {
    try {
      const { status, severity, userId, limit = 100, offset = 0 } = options;
      
      // Build the query conditions
      const conditions = [];
      
      if (status) {
        conditions.push(eq(bugReports.status, status));
      }
      
      if (severity) {
        conditions.push(eq(bugReports.severity, severity));
      }
      
      if (userId) {
        conditions.push(eq(bugReports.userId, userId));
      }
      
      // Execute the query with conditions
      const result = await db.query.bugReports.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: [desc(bugReports.createdAt)],
        limit,
        offset
      });
      
      return result;
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
      // Prepare update data
      const updateData: Partial<BugReport> = {
        status,
        updatedAt: new Date()
      };
      
      // Add admin notes if provided
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      // Add resolvedAt timestamp if status is resolved or closed
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
      
      // Update the bug report
      const result = await db.update(bugReports)
        .set(updateData)
        .where(eq(bugReports.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`[FeedbackService] Error updating bug report ${id}:`, error);
      throw new Error('Failed to update bug report status');
    }
  }
  
  /**
   * Assign a bug report to a team member
   */
  async assignBugReport(id: number, assignedTo: number | null): Promise<BugReport | null> {
    try {
      // If assignedTo is provided, verify the user exists
      if (assignedTo) {
        const userExists = await db.query.users.findFirst({
          where: eq(users.id, assignedTo)
        });
        
        if (!userExists) {
          throw new Error(`User with ID ${assignedTo} not found`);
        }
      }
      
      // Update the bug report
      const result = await db.update(bugReports)
        .set({
          assignedTo,
          updatedAt: new Date()
        })
        .where(eq(bugReports.id, id))
        .returning();
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`[FeedbackService] Error assigning bug report ${id}:`, error);
      throw new Error('Failed to assign bug report');
    }
  }
  
  /**
   * Get count of bug reports by severity
   */
  async getReportCountBySeverity(): Promise<SeverityCount[]> {
    try {
      const result = await db.execute(sql`
        SELECT severity, COUNT(*) as count
        FROM bug_reports
        GROUP BY severity
        ORDER BY CASE 
          WHEN severity = 'critical' THEN 1
          WHEN severity = 'high' THEN 2
          WHEN severity = 'medium' THEN 3
          WHEN severity = 'low' THEN 4
          ELSE 5
        END
      `);
      
      return result.rows.map(row => ({
        severity: row.severity as BugReport['severity'],
        count: parseInt(row.count as string)
      }));
    } catch (error) {
      console.error('[FeedbackService] Error getting report count by severity:', error);
      throw new Error('Failed to get report statistics');
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();