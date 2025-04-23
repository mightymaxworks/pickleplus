/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Types
 * 
 * This file defines the core types used throughout the Bounce testing system:
 * 1. TestRun and TestResult for tracking test execution
 * 2. BugFinding and BugReport for structured issue reporting
 * 3. Test configuration types for flexible test setup
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

/**
 * Severity levels for test findings
 */
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Test configuration options
 */
export interface BounceTestRunOptions {
  baseUrl: string;
  browser: 'chrome' | 'firefox' | 'safari';
  mobile?: boolean;
  coverage?: number;
  headless?: boolean;
  timeout?: number;
}

/**
 * Test run information
 */
export interface TestRun {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  options: BounceTestRunOptions;
  environment?: string;
}

/**
 * Test result information
 */
export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  duration: number;
  findings: BugFinding[];
}

/**
 * Bug finding information
 */
export interface BugFinding {
  id?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: string;
  steps?: string[];
  expectedResult?: string;
  actualResult?: string;
  fixPrompt?: string;
  screenshots?: string[];
  metadata?: Record<string, any>;
}

/**
 * Bug report statistics
 */
export interface BugReportStatistics {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Complete bug report
 */
export interface BugReport {
  id: string;
  title: string;
  timestamp: number;
  formattedDate: string;
  testRun: TestRun;
  findings: BugFinding[];
  statistics: BugReportStatistics;
  status: string;
  summary: string;
}