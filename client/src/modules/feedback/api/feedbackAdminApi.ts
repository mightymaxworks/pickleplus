/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Admin API functions for the feedback module
 * 
 * This file defines the API functions for interacting with the feedback API from the admin interface.
 */

import { BugReport } from '@/shared/bug-report-schema';

/**
 * Get all bug reports with optional filtering
 */
export async function getAllBugReports(params?: {
  status?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}): Promise<BugReport[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  
  if (params?.severity) {
    queryParams.append('severity', params.severity);
  }
  
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params?.offset) {
    queryParams.append('offset', params.offset.toString());
  }
  
  const queryString = queryParams.toString();
  const url = `/api/admin/feedback/bug-reports${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bug reports: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as BugReport[];
}

/**
 * Get a specific bug report by ID
 */
export async function getBugReportById(id: number): Promise<BugReport> {
  const response = await fetch(`/api/admin/feedback/bug-reports/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bug report: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as BugReport;
}

/**
 * Update a bug report's status
 */
export async function updateBugReportStatus(
  id: number, 
  status: string, 
  adminNotes?: string
): Promise<BugReport> {
  const response = await fetch(`/api/admin/feedback/bug-reports/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, adminNotes })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update bug report status: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as BugReport;
}

/**
 * Assign a bug report to a team member
 */
export async function assignBugReport(
  id: number, 
  assignedTo: number | null
): Promise<BugReport> {
  const response = await fetch(`/api/admin/feedback/bug-reports/${id}/assign`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ assignedTo })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to assign bug report: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data as BugReport;
}