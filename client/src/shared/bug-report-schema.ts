/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Schema
 * 
 * This file defines the TypeScript interfaces for bug report data structures.
 */

/**
 * Status of a bug report
 */
export enum BugReportStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  WONT_FIX = 'wont_fix',
  DUPLICATE = 'duplicate'
}

/**
 * Severity of a bug report
 */
export enum BugReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Bug report interface
 */
export interface BugReport {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshotPath?: string;
  screenshots?: string[];
  deviceInfo?: string;
  browserInfo?: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  assignedTo?: number;
  assignedToName?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  currentPage?: string;
  screenSize?: string;
  isReproducible?: boolean;
  userInfo?: string;
}

/**
 * Input for creating a new bug report
 */
export interface CreateBugReportInput {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: string[];
  deviceInfo?: string;
  browserInfo?: string;
  severity: BugReportSeverity;
}

/**
 * Input for updating a bug report status
 */
export interface UpdateBugReportStatusInput {
  status: BugReportStatus;
  adminNotes?: string;
}

/**
 * Input for assigning a bug report to a team member
 */
export interface AssignBugReportInput {
  assignedTo: number | null;
}