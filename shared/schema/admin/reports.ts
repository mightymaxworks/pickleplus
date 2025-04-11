/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting Schema
 * 
 * This file defines the data structures for admin reporting features.
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

// Time periods for reports
export enum ReportTimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

// Report categories
export enum ReportCategory {
  USER = 'user',
  MATCH = 'match',
  ENGAGEMENT = 'engagement',
  ACTIVITY = 'activity',
  PERFORMANCE = 'performance',
  SYSTEM = 'system'
}

// Report data types
export enum ReportChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  RADAR = 'radar',
  TABLE = 'table'
}

// Report format for export
export enum ReportExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'excel'
}

// Base schema for report filters
export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timePeriod: z.nativeEnum(ReportTimePeriod).optional(),
  categories: z.array(z.nativeEnum(ReportCategory)).optional(),
  userIds: z.array(z.number()).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

// Base types for different chart datasets
export const timeSeriesDataSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
  label: z.string().optional(),
});

export const categoryDataSchema = z.object({
  category: z.string(),
  value: z.number(),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const comparisonDataSchema = z.object({
  name: z.string(),
  current: z.number(),
  previous: z.number(),
  change: z.number(),
  percentChange: z.number(),
});

// Report configuration schema
export const reportConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(ReportCategory),
  chartType: z.nativeEnum(ReportChartType),
  filters: reportFilterSchema.optional(),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday, 6 = Saturday
    dayOfMonth: z.number().min(1).max(31).optional(),
    time: z.string().optional(), // HH:MM format
    recipients: z.array(z.string()).optional(),
    exportFormat: z.nativeEnum(ReportExportFormat).optional(),
  }).optional(),
  createdBy: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Report response schema
export const reportResponseSchema = z.object({
  config: reportConfigSchema,
  data: z.union([
    z.array(timeSeriesDataSchema),
    z.array(categoryDataSchema),
    z.array(comparisonDataSchema),
    z.array(z.record(z.string(), z.any())), // For table data with flexible columns
  ]),
  metadata: z.object({
    totalCount: z.number().optional(),
    pageCount: z.number().optional(),
    currentPage: z.number().optional(),
    hasNextPage: z.boolean().optional(),
    hasPreviousPage: z.boolean().optional(),
    generatedAt: z.string(),
  }),
});

// Types based on schemas
export type ReportFilter = z.infer<typeof reportFilterSchema>;
export type TimeSeriesData = z.infer<typeof timeSeriesDataSchema>;
export type CategoryData = z.infer<typeof categoryDataSchema>;
export type ComparisonData = z.infer<typeof comparisonDataSchema>;
export type ReportConfig = z.infer<typeof reportConfigSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;

// Insert types (for creating new report configurations)
export const insertReportConfigSchema = createInsertSchema(reportConfigSchema).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertReportConfig = z.infer<typeof insertReportConfigSchema>;

// The most common report types that will be implemented
export const REPORT_TYPES = {
  USER_GROWTH: 'user_growth',
  MATCH_ACTIVITY: 'match_activity',
  ENGAGEMENT_METRICS: 'engagement_metrics',
  SYSTEM_PERFORMANCE: 'system_performance',
  RATING_DISTRIBUTION: 'rating_distribution',
  SKILL_PROGRESSION: 'skill_progression',
  TOURNAMENT_PARTICIPATION: 'tournament_participation',
  EVENT_ATTENDANCE: 'event_attendance',
  PICKLEBALL_USAGE: 'pickleball_usage',
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];