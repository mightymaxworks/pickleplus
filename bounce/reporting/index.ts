/**
 * PKL-278651-BOUNCE-0023-REPORTING - Bounce Reporting Module
 * 
 * Exports all reporting functionality
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { generateReport } from './bug-report-generator';
import { generateReportWithPrompts } from './bug-report-generator-with-prompts';
import { generateFixPrompt } from './fix-prompts';

export const bugReportGenerator = {
  generateReport,
  generateReportWithPrompts
};

export const fixPromptGenerator = {
  generateFixPrompt
};

export {
  generateReport,
  generateReportWithPrompts,
  generateFixPrompt
};