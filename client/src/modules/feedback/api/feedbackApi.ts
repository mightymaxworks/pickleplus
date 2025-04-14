/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback API Functions
 * 
 * This file contains API functions for the feedback system.
 */

import { apiRequest } from '@/lib/queryClient';
import { 
  BugReportFormData, 
  BugReportSubmitResponse, 
  BugReport,
  BugReportSeverityCount
} from '../types';

/**
 * Submit a bug report
 */
export async function submitBugReport(data: BugReportFormData): Promise<BugReportSubmitResponse> {
  const response = await apiRequest({
    url: '/api/feedback/bug-report',
    method: 'POST',
    data
  });
  
  return response.json();
}

/**
 * Get bug report statistics by severity
 */
export async function getBugReportStats(): Promise<BugReportSeverityCount[]> {
  const response = await apiRequest({
    url: '/api/feedback/bug-report/stats',
    method: 'GET'
  });
  
  return response.json();
}

/**
 * Get all bug reports
 */
export async function getAllBugReports(): Promise<BugReport[]> {
  const response = await apiRequest({
    url: '/api/feedback/bug-report',
    method: 'GET'
  });
  
  return response.json();
}