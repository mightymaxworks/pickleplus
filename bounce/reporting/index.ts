/**
 * PKL-278651-BOUNCE-0013-CICD - Reporting Module
 * 
 * Exports various report generators for the Bounce testing system
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { EnhancedReportGenerator } from './enhanced-report-generator';
import { BugReportGenerator } from './bug-report-generator';

// Create and export report generator instances
export const enhancedReportGenerator = new EnhancedReportGenerator();
export const bugReportGenerator = new BugReportGenerator();

// Export all types from the individual files
export * from './enhanced-report-generator';
export * from './bug-report-generator';