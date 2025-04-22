/**
 * PKL-278651-BOUNCE-0014-CICD - Bounce Reporting Index
 * 
 * Central export point for bug report generators
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { BugReportGenerator } from './bug-report-generator';
import { EnhancedReportGenerator } from './enhanced-report-generator';

// Export singleton instances of report generators
export const bugReportGenerator = new BugReportGenerator();
export const enhancedReportGenerator = new EnhancedReportGenerator();