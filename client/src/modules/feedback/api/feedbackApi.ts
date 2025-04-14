/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Feedback API client functions
 */

import { BugReportFormData, BugReportApiResponse, BugReportStat } from '../types';

/**
 * Submit a bug report to the server
 */
export async function submitBugReport(data: BugReportFormData): Promise<BugReportApiResponse> {
  try {
    const response = await fetch('/api/feedback/bug-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return {
      success: false,
      message: 'Failed to submit bug report. Please try again later.',
    };
  }
}

/**
 * Get bug report statistics
 */
export async function getBugReportStats(timeFrame: string = 'all'): Promise<BugReportStat[]> {
  try {
    const response = await fetch(`/api/feedback/stats?timeFrame=${timeFrame}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data.stats || [];
  } catch (error) {
    console.error('Error getting bug report stats:', error);
    return [];
  }
}

/**
 * Get browser information
 */
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  let osName = "Unknown";
  
  // Browser detection
  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edge") === -1 && userAgent.indexOf("Edg") === -1) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
    browserVersion = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || "Unknown";
  }
  
  // OS detection
  if (userAgent.indexOf("Windows") > -1) {
    osName = "Windows";
  } else if (userAgent.indexOf("Mac") > -1) {
    osName = "MacOS";
  } else if (userAgent.indexOf("Linux") > -1) {
    osName = "Linux";
  } else if (userAgent.indexOf("Android") > -1) {
    osName = "Android";
  } else if (userAgent.indexOf("iOS") > -1 || (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1)) {
    osName = "iOS";
  }
  
  return {
    name: browserName,
    version: browserVersion,
    os: osName
  };
}