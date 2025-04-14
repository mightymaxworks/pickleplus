/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback Module Definition
 * 
 * This file defines the module interface for the feedback system.
 */

import { Module } from '@/core/modules/moduleRegistry';
import { BugReportButton } from './components/BugReportButton';
import { BugReportForm } from './components/BugReportForm';
import { BugReportStats } from './components/BugReportStats';
import * as feedbackApi from './api/feedbackApi';
import * as types from './types';

/**
 * Feedback module interface
 */
export const feedbackModule: Module = {
  name: 'feedback',
  version: '1.0.0',
  exports: {
    // Components
    BugReportButton,
    BugReportForm,
    BugReportStats,
    
    // API methods
    api: feedbackApi,
    
    // Types
    types
  }
};