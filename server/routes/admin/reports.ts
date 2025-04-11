/**
 * PKL-278651-ADMIN-0010-REPORT
 * Admin Reporting API Routes
 * 
 * This file implements the API endpoints for the admin reporting system.
 */

import { Router } from 'express';
import { storage } from '../../storage';
import { ReportTimePeriod, ReportCategory, ReportChartType, ReportFilter } from '../../../shared/schema/admin/reports';
import { generateDemoTimeSeriesData, generateDemoCategoryData, generateDemoComparisonData } from '../../services/report-generator';
import { z } from 'zod';

// Define schemas for report filtering and configuration
const reportFilterSchema = z.object({
  timePeriod: z.nativeEnum(ReportTimePeriod).default(ReportTimePeriod.MONTH),
  category: z.nativeEnum(ReportCategory).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  chartType: z.nativeEnum(ReportChartType).optional(),
  page: z.number().default(1),
  limit: z.number().default(50)
});

const reportConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(ReportCategory),
  chartType: z.nativeEnum(ReportChartType),
  filters: reportFilterSchema,
  createdBy: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});

const insertReportConfigSchema = reportConfigSchema.omit({
  id: true, 
  createdAt: true, 
  updatedAt: true
});

// Define report types
const REPORT_TYPES = {
  USER_GROWTH: 'user_growth',
  MATCH_ACTIVITY: 'match_activity',
  ENGAGEMENT_METRICS: 'engagement_metrics',
  SYSTEM_PERFORMANCE: 'system_performance',
  RATING_DISTRIBUTION: 'rating_distribution',
  SKILL_PROGRESSION: 'skill_progression',
  TOURNAMENT_PARTICIPATION: 'tournament_participation',
  EVENT_ATTENDANCE: 'event_attendance',
  PICKLEBALL_USAGE: 'pickleball_usage'
} as const;

const router = Router();

/**
 * Get available report types
 */
router.get('/types', async (req, res) => {
  try {
    const reportTypes = Object.keys(REPORT_TYPES).map(key => ({
      id: REPORT_TYPES[key as keyof typeof REPORT_TYPES],
      name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      description: `Report for ${key.replace(/_/g, ' ').toLowerCase()}`,
      category: getReportCategory(REPORT_TYPES[key as keyof typeof REPORT_TYPES]),
      chartType: getDefaultChartType(REPORT_TYPES[key as keyof typeof REPORT_TYPES]),
    }));

    res.json(reportTypes);
  } catch (error) {
    console.error('Error fetching report types:', error);
    res.status(500).json({ error: 'Failed to fetch report types' });
  }
});

/**
 * Get user report data
 */
router.get('/user', async (req, res) => {
  try {
    const filter = reportFilterSchema.parse(req.query);
    
    // For now, we'll get some basic data
    // In a production environment, we would query the database for actual users
    const users = [];
    const totalUsers = 0;
    
    // Generate user growth time series data
    const timePeriod = filter.timePeriod || ReportTimePeriod.MONTH;
    const timeSeriesData = generateDemoTimeSeriesData(timePeriod, 'User Growth');
    
    // Response
    res.json({
      config: {
        id: 'user_growth',
        name: 'User Growth',
        description: 'User growth over time',
        category: ReportCategory.USER,
        chartType: ReportChartType.LINE,
        filters: filter,
        createdBy: req.user?.id || 1,
        createdAt: new Date().toISOString(),
      },
      data: timeSeriesData,
      metadata: {
        totalCount: totalUsers,
        pageCount: Math.ceil(totalUsers / filter.limit),
        currentPage: filter.page,
        hasNextPage: filter.page * filter.limit < totalUsers,
        hasPreviousPage: filter.page > 1,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ error: 'Failed to generate user report' });
  }
});

/**
 * Get match report data
 */
router.get('/match', async (req, res) => {
  try {
    const filter = reportFilterSchema.parse(req.query);
    
    // For now, we'll get some basic data
    // In a production environment, we would query the database for actual matches
    const matches = [];
    const totalMatches = 0;
    
    // Generate match activity data
    const categoryData = generateDemoCategoryData('Match Types');
    
    // Response
    res.json({
      config: {
        id: 'match_activity',
        name: 'Match Activity',
        description: 'Match activity statistics',
        category: ReportCategory.MATCH,
        chartType: ReportChartType.BAR,
        filters: filter,
        createdBy: req.user?.id || 1,
        createdAt: new Date().toISOString(),
      },
      data: categoryData,
      metadata: {
        totalCount: totalMatches,
        pageCount: Math.ceil(totalMatches / filter.limit),
        currentPage: filter.page,
        hasNextPage: filter.page * filter.limit < totalMatches,
        hasPreviousPage: filter.page > 1,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error generating match report:', error);
    res.status(500).json({ error: 'Failed to generate match report' });
  }
});

/**
 * Get engagement report data
 */
router.get('/engagement', async (req, res) => {
  try {
    const filter = reportFilterSchema.parse(req.query);
    
    // Generate engagement comparison data
    const comparisonData = generateDemoComparisonData('Engagement Metrics');
    
    // Response
    res.json({
      config: {
        id: 'engagement_metrics',
        name: 'Engagement Metrics',
        description: 'User engagement metrics comparison',
        category: ReportCategory.ENGAGEMENT,
        chartType: ReportChartType.BAR,
        filters: filter,
        createdBy: req.user?.id || 1,
        createdAt: new Date().toISOString(),
      },
      data: comparisonData,
      metadata: {
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error generating engagement report:', error);
    res.status(500).json({ error: 'Failed to generate engagement report' });
  }
});

/**
 * Save a report configuration
 */
router.post('/config', async (req, res) => {
  try {
    const reportConfig = insertReportConfigSchema.parse(req.body);
    
    // TODO: Save report configuration to database
    const savedConfig = {
      ...reportConfig,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.status(201).json(savedConfig);
  } catch (error) {
    console.error('Error saving report configuration:', error);
    res.status(400).json({ error: 'Invalid report configuration' });
  }
});

/**
 * Export a report
 */
router.post('/export', async (req, res) => {
  try {
    const { reportType, format, filters } = req.body;
    
    // Validate input
    if (!reportType || !format) {
      return res.status(400).json({ error: 'Report type and format are required' });
    }
    
    // Prepare response based on format
    let fileName;
    let contentType;
    let data;
    
    switch (format) {
      case 'csv':
        fileName = `${reportType}_${Date.now()}.csv`;
        contentType = 'text/csv';
        data = 'timestamp,value,label\n2025-01-01,100,Start\n2025-02-01,150,Growth\n2025-03-01,180,More Growth';
        break;
      case 'json':
        fileName = `${reportType}_${Date.now()}.json`;
        contentType = 'application/json';
        data = JSON.stringify({
          reportType,
          generatedAt: new Date().toISOString(),
          data: [
            { timestamp: '2025-01-01', value: 100, label: 'Start' },
            { timestamp: '2025-02-01', value: 150, label: 'Growth' },
            { timestamp: '2025-03-01', value: 180, label: 'More Growth' }
          ]
        }, null, 2);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }
    
    // Send file download response
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(data);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

/**
 * Get a report category based on report type
 */
function getReportCategory(reportType: string): ReportCategory {
  switch (reportType) {
    case REPORT_TYPES.USER_GROWTH:
      return ReportCategory.USER;
    case REPORT_TYPES.MATCH_ACTIVITY:
      return ReportCategory.MATCH;
    case REPORT_TYPES.ENGAGEMENT_METRICS:
      return ReportCategory.ENGAGEMENT;
    case REPORT_TYPES.SYSTEM_PERFORMANCE:
      return ReportCategory.SYSTEM;
    case REPORT_TYPES.RATING_DISTRIBUTION:
    case REPORT_TYPES.SKILL_PROGRESSION:
      return ReportCategory.USER;
    case REPORT_TYPES.TOURNAMENT_PARTICIPATION:
    case REPORT_TYPES.EVENT_ATTENDANCE:
    case REPORT_TYPES.PICKLEBALL_USAGE:
      return ReportCategory.MATCH;
    default:
      return ReportCategory.USER;
  }
}

/**
 * Get a default chart type based on report type
 */
function getDefaultChartType(reportType: string): ReportChartType {
  switch (reportType) {
    case REPORT_TYPES.USER_GROWTH:
    case REPORT_TYPES.MATCH_ACTIVITY:
      return ReportChartType.LINE;
    case REPORT_TYPES.ENGAGEMENT_METRICS:
      return ReportChartType.BAR;
    case REPORT_TYPES.SYSTEM_PERFORMANCE:
      return ReportChartType.AREA;
    case REPORT_TYPES.RATING_DISTRIBUTION:
      return ReportChartType.PIE;
    case REPORT_TYPES.SKILL_PROGRESSION:
      return ReportChartType.RADAR;
    case REPORT_TYPES.TOURNAMENT_PARTICIPATION:
    case REPORT_TYPES.EVENT_ATTENDANCE:
    case REPORT_TYPES.PICKLEBALL_USAGE:
      return ReportChartType.BAR;
    default:
      return ReportChartType.LINE;
  }
}

export default router;