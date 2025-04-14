/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Types
 * 
 * This file defines the types used in the feedback module.
 */

/**
 * Bug report severity levels
 */
export type BugReportSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Bug report status values
 */
export type BugReportStatus = 'new' | 'in_progress' | 'resolved' | 'wont_fix' | 'duplicate';

/**
 * Bug report form data interface
 */
export interface BugReportFormData {
  title: string;
  description: string;
  severity: BugReportSeverity;
  currentPage: string;
  stepsToReproduce?: string;
  isReproducible: boolean;
  includeUserInfo: boolean;
  screenshot?: File;
  screenSize?: string;
}

/**
 * Bug report interface as returned from the API
 */
export interface BugReport {
  id: number;
  title: string;
  description: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  currentPage: string;
  userId: number | null;
  userAgent?: string;
  browserInfo?: string;
  screenSize?: string;
  ipAddress?: string;
  userInfo?: string;
  screenshotPath?: string;
  stepsToReproduce?: string;
  isReproducible: boolean;
  assignedTo?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

/**
 * Bug report statistics by severity
 */
export interface BugReportSeverityCount {
  severity: BugReportSeverity;
  count: number;
}

/**
 * API response for bug report submission
 */
export interface BugReportSubmitResponse {
  success: boolean;
  message: string;
  reportId?: number;
  error?: string;
}