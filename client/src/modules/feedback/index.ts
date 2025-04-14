/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback module index file
 * 
 * This file exports all components and types for the feedback module.
 */

// Export all components
export { BugReportButton } from './components/BugReportButton';
export { BugReportForm } from './components/BugReportForm';
export { BugReportStats } from './components/BugReportStats';

// Export all API functions
export {
  submitBugReport,
  getBugReportStats,
  getBrowserInfo
} from './api/feedbackApi';

// Export all types
export type {
  BugReportButtonProps,
  BugReportFormProps,
  BugReportFormData,
  BugReportStatsProps,
  BugReportStat,
  BugReportApiResponse
} from './types';