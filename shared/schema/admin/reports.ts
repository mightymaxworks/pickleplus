/**
 * PKL-278651-ADMIN-0010-REPORT
 * Reporting Module Schema
 * 
 * This file defines the types and schemas for the reporting module.
 */

/**
 * Report time period options
 */
export enum ReportTimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

/**
 * Report category options
 */
export enum ReportCategory {
  USER = 'user',
  MATCH = 'match',
  ENGAGEMENT = 'engagement',
  SYSTEM = 'system'
}

/**
 * Report chart type options
 */
export enum ReportChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
  RADAR = 'radar'
}

/**
 * Time series data for charts
 */
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

/**
 * Category data for pie charts and similar visualizations
 */
export interface CategoryData {
  category: string;
  value: number;
  label?: string;
  color?: string;
}

/**
 * Comparison data for comparing current vs previous period
 */
export interface ComparisonData {
  name: string;
  current: number;
  previous: number;
  percentChange: number;
}

/**
 * Report filter options
 */
export interface ReportFilter {
  timePeriod: ReportTimePeriod;
  category?: ReportCategory;
  startDate?: string;
  endDate?: string;
  chartType?: ReportChartType;
}

/**
 * User report data
 */
export interface UserReportData {
  newUsers: TimeSeriesData[];
  activeUsers: TimeSeriesData[];
  usersByRegion: CategoryData[];
}

/**
 * Match report data
 */
export interface MatchReportData {
  matchesByType: CategoryData[];
  matchesByStatus: CategoryData[];
  matchesOverTime: TimeSeriesData[];
}

/**
 * Engagement report data
 */
export interface EngagementReportData {
  loginActivity: TimeSeriesData[];
  featureUsage: CategoryData[];
  comparison: ComparisonData[];
}