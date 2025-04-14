/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Module
 * 
 * This file defines the feedback module for registration with the module registry.
 */

import { Module } from '@/core/modules/moduleRegistry';
import { BugReportButton } from './components/BugReportButton';
import { BugReportForm } from './components/BugReportForm';
import { BugReportStats } from './components/BugReportStats';
import { submitBugReport, getBugReportStats, getBrowserInfo } from './api/feedbackApi';

/**
 * Feedback module definition
 */
export const feedbackModule: Module = {
  name: 'feedback',
  version: '1.0.0',
  exports: {
    // Components
    BugReportButton,
    BugReportForm,
    BugReportStats,
    
    // API Functions
    submitBugReport,
    getBugReportStats,
    getBrowserInfo
  }
};