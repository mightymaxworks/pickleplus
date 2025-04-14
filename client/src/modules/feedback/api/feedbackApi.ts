/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback API Client
 * 
 * This file defines the API client for the feedback module.
 */

import { apiRequest } from '@/lib/queryClient';
import { BugReport, BugReportFormData, BugReportSeverityCount, BugReportSubmitResponse } from '../types';

/**
 * Submit a bug report to the server
 */
export async function submitBugReport(formData: FormData): Promise<BugReportSubmitResponse> {
  return apiRequest('/api/feedback/bug-report', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type as browser will set it with correct boundary for FormData
  });
}

/**
 * Get bug report statistics by severity
 */
export async function getBugReportStats(): Promise<BugReportSeverityCount[]> {
  return apiRequest('/api/feedback/bug-reports/stats');
}

/**
 * Get user's submitted bug reports
 */
export async function getUserBugReports(): Promise<BugReport[]> {
  return apiRequest('/api/feedback/my-reports');
}

/**
 * Prepare form data for submission
 */
export function prepareBugReportFormData(data: BugReportFormData): FormData {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('severity', data.severity);
  formData.append('currentPage', data.currentPage);
  formData.append('includeUserInfo', String(data.includeUserInfo));
  formData.append('isReproducible', String(data.isReproducible));
  
  // Add optional fields
  if (data.stepsToReproduce) {
    formData.append('stepsToReproduce', data.stepsToReproduce);
  }
  
  if (data.screenSize) {
    formData.append('screenSize', data.screenSize);
  }
  
  // Add screenshot if provided
  if (data.screenshot) {
    formData.append('screenshot', data.screenshot);
  }
  
  return formData;
}