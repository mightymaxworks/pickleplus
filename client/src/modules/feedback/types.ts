/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Types for feedback module
 */

export interface BugReportButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface BugReportFormProps {
  currentPage: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export interface BugReportFormData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  isReproducible: boolean;
  includeUserInfo: boolean;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: {
    name: string;
    version: string;
    os: string;
  };
}

export interface BugReportStatsProps {
  timeFrame?: 'day' | 'week' | 'month' | 'all';
}

export interface BugReportStat {
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
}

export interface BugReportApiResponse {
  success: boolean;
  message: string;
  bugReportId?: number;
}