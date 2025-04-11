/**
 * PKL-278651-ADMIN-0011-DASH
 * Admin Dashboard Schema
 * 
 * This file defines the data structures for the unified admin dashboard.
 * It implements schema definitions according to PKL-278651 Framework 5.0
 * and follows the modular architecture principles.
 */

import { z } from "zod";

/**
 * Defines dashboard metric categories
 */
export enum DashboardMetricCategory {
  USER = "user",
  MATCH = "match",
  EVENT = "event",
  ENGAGEMENT = "engagement",
  SYSTEM = "system"
}

/**
 * Defines dashboard time periods for metrics
 */
export enum DashboardTimePeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
  CUSTOM = "custom"
}

/**
 * Defines dashboard metric value types
 */
export enum DashboardMetricValueType {
  NUMBER = "number",
  PERCENTAGE = "percentage",
  CURRENCY = "currency",
  RATING = "rating"
}

/**
 * Defines dashboard metric trend directions
 */
export enum DashboardMetricTrend {
  UP = "up",
  DOWN = "down",
  NEUTRAL = "neutral"
}

/**
 * Defines dashboard metric sentiment
 */
export enum DashboardMetricSentiment {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral"
}

/**
 * Defines single metric data structure
 */
export const dashboardMetricSchema = z.object({
  id: z.string(),
  title: z.string(),
  value: z.union([z.number(), z.string()]),
  previousValue: z.union([z.number(), z.string(), z.null()]).optional(),
  valueType: z.nativeEnum(DashboardMetricValueType),
  trend: z.nativeEnum(DashboardMetricTrend),
  percentChange: z.number().optional(),
  sentiment: z.nativeEnum(DashboardMetricSentiment),
  category: z.nativeEnum(DashboardMetricCategory),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export type DashboardMetric = z.infer<typeof dashboardMetricSchema>;

/**
 * Defines dashboard widget type
 */
export enum DashboardWidgetType {
  METRIC_CARD = "metric_card",
  CHART = "chart",
  TABLE = "table",
  ALERT = "alert",
  ACTION_CARD = "action_card"
}

/**
 * Defines chart types for dashboard widgets
 */
export enum DashboardChartType {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  AREA = "area"
}

/**
 * Defines dashboard alert types
 */
export enum DashboardAlertType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success"
}

/**
 * Defines chart data point schema
 */
export const chartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  secondaryValue: z.number().optional(),
});

export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;

/**
 * Defines chart data series schema
 */
export const chartDataSeriesSchema = z.object({
  name: z.string(),
  data: z.array(chartDataPointSchema),
  color: z.string().optional(),
});

export type ChartDataSeries = z.infer<typeof chartDataSeriesSchema>;

/**
 * Defines chart data schema
 */
export const chartDataSchema = z.object({
  title: z.string(),
  series: z.array(chartDataSeriesSchema),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
});

export type ChartData = z.infer<typeof chartDataSchema>;

/**
 * Defines table data row schema
 */
export const tableDataRowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));

export type TableDataRow = z.infer<typeof tableDataRowSchema>;

/**
 * Defines table column schema
 */
export const tableColumnSchema = z.object({
  key: z.string(),
  title: z.string(),
  sortable: z.boolean().optional(),
});

export type TableColumn = z.infer<typeof tableColumnSchema>;

/**
 * Defines table data schema
 */
export const tableDataSchema = z.object({
  title: z.string(),
  columns: z.array(tableColumnSchema),
  rows: z.array(tableDataRowSchema),
  totalCount: z.number().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export type TableData = z.infer<typeof tableDataSchema>;

/**
 * Defines dashboard widget base schema
 */
const dashboardWidgetBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  widgetType: z.nativeEnum(DashboardWidgetType),
  category: z.nativeEnum(DashboardMetricCategory),
  colSpan: z.number().min(1).max(4).default(1),
  rowSpan: z.number().min(1).max(4).default(1),
  priority: z.number().default(10),
  refreshInterval: z.number().optional(), // in seconds
});

/**
 * Defines metric card widget schema
 */
export const metricCardWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal(DashboardWidgetType.METRIC_CARD),
  metric: dashboardMetricSchema,
});

export type MetricCardWidget = z.infer<typeof metricCardWidgetSchema>;

/**
 * Defines chart widget schema
 */
export const chartWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal(DashboardWidgetType.CHART),
  chartType: z.nativeEnum(DashboardChartType),
  chartData: chartDataSchema,
});

export type ChartWidget = z.infer<typeof chartWidgetSchema>;

/**
 * Defines table widget schema
 */
export const tableWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal(DashboardWidgetType.TABLE),
  tableData: tableDataSchema,
});

export type TableWidget = z.infer<typeof tableWidgetSchema>;

/**
 * Defines alert widget schema
 */
export const alertWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal(DashboardWidgetType.ALERT),
  alertType: z.nativeEnum(DashboardAlertType),
  message: z.string(),
  actionLink: z.string().optional(),
  actionText: z.string().optional(),
  dismissible: z.boolean().default(true),
});

export type AlertWidget = z.infer<typeof alertWidgetSchema>;

/**
 * Defines action card widget schema
 */
export const actionCardWidgetSchema = dashboardWidgetBaseSchema.extend({
  widgetType: z.literal(DashboardWidgetType.ACTION_CARD),
  description: z.string(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    link: z.string(),
    icon: z.string().optional(),
  })),
});

export type ActionCardWidget = z.infer<typeof actionCardWidgetSchema>;

/**
 * Dashboard widget union type
 */
export const dashboardWidgetSchema = z.union([
  metricCardWidgetSchema,
  chartWidgetSchema,
  tableWidgetSchema,
  alertWidgetSchema,
  actionCardWidgetSchema,
]);

export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;

/**
 * Defines dashboard layout schema
 */
export const dashboardLayoutSchema = z.object({
  id: z.string(),
  title: z.string(),
  widgets: z.array(dashboardWidgetSchema),
  timePeriod: z.nativeEnum(DashboardTimePeriod).default(DashboardTimePeriod.MONTH),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

/**
 * Dashboard filter schema
 */
export const dashboardFilterSchema = z.object({
  timePeriod: z.nativeEnum(DashboardTimePeriod),
  categories: z.array(z.nativeEnum(DashboardMetricCategory)).optional(),
  startDate: z.string().optional(), // ISO string format for custom date range
  endDate: z.string().optional(), // ISO string format for custom date range
});

export type DashboardFilter = z.infer<typeof dashboardFilterSchema>;

/**
 * Dashboard response schema
 */
export const dashboardResponseSchema = z.object({
  layout: dashboardLayoutSchema,
  totalUsers: z.number(),
  totalMatches: z.number(),
  totalEvents: z.number(),
  lastUpdated: z.string(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;