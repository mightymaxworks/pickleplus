/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Module Entry Point
 * 
 * This file exports the feedback module and its components.
 */

// Export the module definition
export { feedbackModule } from './module';

// Re-export components
export { BugReportButton } from './components/BugReportButton';
export { BugReportForm } from './components/BugReportForm';
export { BugReportStats } from './components/BugReportStats';

// Re-export API functions
export * as feedbackApi from './api/feedbackApi';

// Re-export types
export * from './types';