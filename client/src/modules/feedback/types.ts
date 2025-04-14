/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Module Types
 * 
 * This file contains type definitions for the feedback module.
 */

/**
 * Severity levels for bug reports
 */
export type BugReportSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status options for bug reports
 */
export type BugReportStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';

/**
 * Data for submitting a bug report
 */
export interface BugReportFormData {
  /** Title of the bug report */
  title: string;
  
  /** Detailed description of the bug */
  description: string;
  
  /** URL where the bug was encountered */
  url: string;
  
  /** Severity level of the bug */
  severity: BugReportSeverity;
  
  /** User's browser information */
  browser?: string;
  
  /** User's operating system */
  os?: string;
  
  /** Steps to reproduce the bug */
  stepsToReproduce?: string;
  
  /** Expected behavior */
  expectedBehavior?: string;
  
  /** Actual behavior observed */
  actualBehavior?: string;
}

/**
 * Response from the bug report submission API
 */
export interface BugReportSubmitResponse {
  /** Whether the submission was successful */
  success: boolean;
  
  /** Message about the submission result */
  message: string;
  
  /** ID of the created bug report (if successful) */
  reportId?: number;
}

/**
 * Bug report object returned from the API
 */
export interface BugReport {
  /** Unique ID of the bug report */
  id: number;
  
  /** Title of the bug report */
  title: string;
  
  /** Detailed description of the bug */
  description: string;
  
  /** URL where the bug was encountered */
  url: string;
  
  /** Severity level of the bug */
  severity: BugReportSeverity;
  
  /** Current status of the bug report */
  status: BugReportStatus;
  
  /** ID of the user who submitted the report */
  userId: number;
  
  /** Username of the user who submitted the report */
  username?: string;
  
  /** User's browser information */
  browser?: string;
  
  /** User's operating system */
  os?: string;
  
  /** Steps to reproduce the bug */
  stepsToReproduce?: string;
  
  /** Expected behavior */
  expectedBehavior?: string;
  
  /** Actual behavior observed */
  actualBehavior?: string;
  
  /** When the report was created */
  createdAt: string;
  
  /** When the report was last updated */
  updatedAt: string;
  
  /** When the report was resolved (if resolved) */
  resolvedAt?: string;
}

/**
 * Count of bug reports by severity
 */
export interface BugReportSeverityCount {
  /** The severity level */
  severity: BugReportSeverity;
  
  /** Number of reports with this severity */
  count: number;
}

/**
 * Props for the BugReportButton component
 */
export interface BugReportButtonProps {
  /** Position of the button on the screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}