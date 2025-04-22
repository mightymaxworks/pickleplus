/**
 * PKL-278651-BOUNCE-0025-TYPES - Bounce Types
 * 
 * This module defines the types used throughout the Bounce testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

/**
 * Test run status enum
 */
export enum BounceTestRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Finding severity enum
 */
export enum BounceFindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
}

/**
 * Test run options
 */
export interface BounceTestRunOptions {
  baseUrl: string;
  browser: 'chrome' | 'firefox' | 'safari';
  mobile: boolean;
  coverage: number;
  headless: boolean;
  timeout: number;
}

/**
 * Test run interface
 */
export interface BounceTestRun {
  id: number;
  name: string;
  status: BounceTestRunStatus;
  base_url: string;
  browser: string;
  mobile: boolean;
  created_at: string;
  completed_at?: string;
  screenshot_path?: string;
}

/**
 * Finding interface
 */
export interface BounceFinding {
  id: number;
  test_run_id: number;
  title: string;
  description: string;
  severity: BounceFindingSeverity;
  area: string;
  steps_to_reproduce?: string;
  actual_result?: string;
  expected_result?: string;
  affected_url?: string;
  framework_id?: string;
}

/**
 * Fix prompt interface
 */
export interface FixPrompt {
  actionItems: string[];
  codeExamples: string;
  testingSteps: string[];
}

/**
 * Fix strategy interface
 */
export interface FixStrategy {
  approach: string;
  recommendations: string[];
  codePatterns: string;
  testingRecommendations: string[];
}