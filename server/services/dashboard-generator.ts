/**
 * PKL-278651-ADMIN-0011-DASH
 * Admin Dashboard Generator Service
 * 
 * This service generates dashboard data for the admin unified dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import { db } from "../db";
import { users, matches } from "@shared/schema";
import { events, eventCheckIns } from "@shared/schema/events";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import {
  DashboardMetricCategory,
  DashboardMetricSentiment,
  DashboardMetricTrend,
  DashboardMetricValueType,
  DashboardWidgetType,
  DashboardChartType,
  DashboardAlertType,
  DashboardTimePeriod,
  DashboardLayout,
  DashboardMetric,
  ChartData,
  TableData,
  DashboardWidget
} from "@shared/schema/admin/dashboard";
import { IStorage } from "../storage";

/**
 * Service class that generates dashboard data
 */
export class DashboardGenerator {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Get time-based comparison data for metrics
   * @param timePeriod - The time period to consider
   */
  private async getTimeComparison(timePeriod: DashboardTimePeriod): Promise<{
    currentStartDate: Date;
    previousStartDate: Date;
    currentLabel: string;
    previousLabel: string;
  }> {
    const now = new Date();
    let currentStartDate: Date;
    let previousStartDate: Date;
    let currentLabel: string;
    let previousLabel: string;

    // Calculate date ranges based on time period
    switch (timePeriod) {
      case DashboardTimePeriod.DAY:
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        currentLabel = "Today";
        previousLabel = "Yesterday";
        break;
      case DashboardTimePeriod.WEEK:
        const currentDay = now.getDay();
        const daysFromSunday = currentDay === 0 ? 0 : currentDay;
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromSunday);
        previousStartDate = new Date(
          currentStartDate.getFullYear(),
          currentStartDate.getMonth(),
          currentStartDate.getDate() - 7
        );
        currentLabel = "This Week";
        previousLabel = "Last Week";
        break;
      case DashboardTimePeriod.MONTH:
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        currentLabel = "This Month";
        previousLabel = "Last Month";
        break;
      case DashboardTimePeriod.QUARTER:
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousStartDate = new Date(
          currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear(),
          currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3,
          1
        );
        currentLabel = `Q${currentQuarter + 1}`;
        previousLabel = `Q${currentQuarter === 0 ? 4 : currentQuarter}`;
        break;
      case DashboardTimePeriod.YEAR:
        currentStartDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        currentLabel = now.getFullYear().toString();
        previousLabel = (now.getFullYear() - 1).toString();
        break;
      default:
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        currentLabel = "This Month";
        previousLabel = "Last Month";
    }

    return {
      currentStartDate,
      previousStartDate,
      currentLabel,
      previousLabel
    };
  }

  /**
   * Get user metrics for the dashboard
   * @param timePeriod - The time period to consider
   */
  private async getUserMetrics(timePeriod: DashboardTimePeriod): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];
    const { currentStartDate, previousStartDate } = await this.getTimeComparison(timePeriod);

    try {
      // Total users metric
      const totalUsers = await this.storage.getUserCount();
      
      // New users in current period
      const newUsersCurrentPeriod = await db.select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, currentStartDate))
        .execute()
        .then(result => result[0]?.count || 0);
      
      // New users in previous period
      const newUsersPreviousPeriod = await db.select({ count: count() })
        .from(users)
        .where(
          and(
            gte(users.createdAt, previousStartDate),
            sql`${users.createdAt} < ${currentStartDate}`
          )
        )
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Calculate trend and percent change
      const userPercentChange = newUsersPreviousPeriod === 0 
        ? 100 
        : Math.round(((newUsersCurrentPeriod - newUsersPreviousPeriod) / newUsersPreviousPeriod) * 100);
      
      const userTrend = userPercentChange > 0 
        ? DashboardMetricTrend.UP 
        : userPercentChange < 0 
          ? DashboardMetricTrend.DOWN 
          : DashboardMetricTrend.NEUTRAL;
      
      const userSentiment = userPercentChange > 0 
        ? DashboardMetricSentiment.POSITIVE 
        : userPercentChange < 0 
          ? DashboardMetricSentiment.NEGATIVE 
          : DashboardMetricSentiment.NEUTRAL;

      // Add total users metric
      metrics.push({
        id: "total-users",
        title: "Total Users",
        value: totalUsers,
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.USER,
        description: "Total registered users in the system"
      });

      // Add new users metric
      metrics.push({
        id: "new-users",
        title: "New Users",
        value: newUsersCurrentPeriod,
        previousValue: newUsersPreviousPeriod,
        valueType: DashboardMetricValueType.NUMBER,
        trend: userTrend,
        percentChange: userPercentChange,
        sentiment: userSentiment,
        category: DashboardMetricCategory.USER,
        description: "New user registrations in selected time period"
      });

      // Commenting out the average rating query since userRatings table is not available
      // Will use a fixed value for now
      const avgRating = 500; // Default value representing 5.0 on the 0-9 scale

      metrics.push({
        id: "avg-rating",
        title: "Avg CourtIQ™ Rating",
        value: (avgRating / 100).toFixed(1),
        valueType: DashboardMetricValueType.RATING,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.USER,
        description: "Average CourtIQ™ rating across all users"
      });

      return metrics;
    } catch (error) {
      console.error("Error getting user metrics:", error);
      return [];
    }
  }

  /**
   * Get match metrics for the dashboard
   * @param timePeriod - The time period to consider
   */
  private async getMatchMetrics(timePeriod: DashboardTimePeriod): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];
    const { currentStartDate, previousStartDate } = await this.getTimeComparison(timePeriod);

    try {
      // Total matches metric
      const totalMatches = await db.select({ count: count() })
        .from(matches)
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Matches in current period
      const matchesCurrentPeriod = await db.select({ count: count() })
        .from(matches)
        .where(gte(matches.matchDate, currentStartDate))
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Matches in previous period
      const matchesPreviousPeriod = await db.select({ count: count() })
        .from(matches)
        .where(
          and(
            gte(matches.matchDate, previousStartDate),
            sql`${matches.matchDate} < ${currentStartDate}`
          )
        )
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Calculate trend and percent change
      const matchPercentChange = matchesPreviousPeriod === 0 
        ? 100 
        : Math.round(((matchesCurrentPeriod - matchesPreviousPeriod) / matchesPreviousPeriod) * 100);
      
      const matchTrend = matchPercentChange > 0 
        ? DashboardMetricTrend.UP 
        : matchPercentChange < 0 
          ? DashboardMetricTrend.DOWN 
          : DashboardMetricTrend.NEUTRAL;
      
      const matchSentiment = matchPercentChange > 0 
        ? DashboardMetricSentiment.POSITIVE 
        : matchPercentChange < 0 
          ? DashboardMetricSentiment.NEGATIVE 
          : DashboardMetricSentiment.NEUTRAL;

      // Add total matches metric
      metrics.push({
        id: "total-matches",
        title: "Total Matches",
        value: totalMatches,
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.MATCH,
        description: "Total matches recorded in the system"
      });

      // Add new matches metric
      metrics.push({
        id: "new-matches",
        title: "Recent Matches",
        value: matchesCurrentPeriod,
        previousValue: matchesPreviousPeriod,
        valueType: DashboardMetricValueType.NUMBER,
        trend: matchTrend,
        percentChange: matchPercentChange,
        sentiment: matchSentiment,
        category: DashboardMetricCategory.MATCH,
        description: "Matches recorded in selected time period"
      });

      return metrics;
    } catch (error) {
      console.error("Error getting match metrics:", error);
      return [];
    }
  }

  /**
   * Get event metrics for the dashboard
   * @param timePeriod - The time period to consider
   */
  private async getEventMetrics(timePeriod: DashboardTimePeriod): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];
    const { currentStartDate, previousStartDate } = await this.getTimeComparison(timePeriod);

    try {
      // Total events
      const totalEvents = await db.select({ count: count() })
        .from(events)
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Events in current period
      const eventsCurrentPeriod = await db.select({ count: count() })
        .from(events)
        .where(gte(events.startDateTime, currentStartDate.toISOString()))
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Events in previous period
      const eventsPreviousPeriod = await db.select({ count: count() })
        .from(events)
        .where(
          and(
            gte(events.startDateTime, previousStartDate.toISOString()),
            sql`${events.startDateTime} < ${currentStartDate.toISOString()}`
          )
        )
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Check-ins in current period
      const checkInsCurrentPeriod = await db.select({ count: count() })
        .from(eventCheckIns)
        .innerJoin(events, eq(eventCheckIns.eventId, events.id))
        .where(gte(events.startDateTime, currentStartDate.toISOString()))
        .execute()
        .then(result => result[0]?.count || 0);
      
      // Calculate trend and percent change
      const eventPercentChange = eventsPreviousPeriod === 0 
        ? 100 
        : Math.round(((eventsCurrentPeriod - eventsPreviousPeriod) / eventsPreviousPeriod) * 100);
      
      const eventTrend = eventPercentChange > 0 
        ? DashboardMetricTrend.UP 
        : eventPercentChange < 0 
          ? DashboardMetricTrend.DOWN 
          : DashboardMetricTrend.NEUTRAL;
      
      const eventSentiment = eventPercentChange > 0 
        ? DashboardMetricSentiment.POSITIVE 
        : eventPercentChange < 0 
          ? DashboardMetricSentiment.NEGATIVE 
          : DashboardMetricSentiment.NEUTRAL;

      // Add total events metric
      metrics.push({
        id: "total-events",
        title: "Total Events",
        value: totalEvents,
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.EVENT,
        description: "Total events in the system"
      });

      // Add upcoming events metric
      metrics.push({
        id: "upcoming-events",
        title: "Upcoming Events",
        value: eventsCurrentPeriod,
        previousValue: eventsPreviousPeriod,
        valueType: DashboardMetricValueType.NUMBER,
        trend: eventTrend,
        percentChange: eventPercentChange,
        sentiment: eventSentiment,
        category: DashboardMetricCategory.EVENT,
        description: "Upcoming events in selected time period"
      });

      // Add event check-ins metric
      metrics.push({
        id: "event-check-ins",
        title: "Event Check-ins",
        value: checkInsCurrentPeriod,
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.EVENT,
        description: "Total event check-ins in selected time period"
      });

      return metrics;
    } catch (error) {
      console.error("Error getting event metrics:", error);
      return [];
    }
  }

  /**
   * Get engagement metrics for the dashboard
   * @param timePeriod - The time period to consider
   */
  private async getEngagementMetrics(timePeriod: DashboardTimePeriod): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];
    const { currentStartDate, previousStartDate } = await this.getTimeComparison(timePeriod);

    try {
      // Calculate user-to-match ratio
      const totalUsers = await this.storage.getUserCount();
      const totalMatches = await db.select({ count: count() })
        .from(matches)
        .execute()
        .then(result => result[0]?.count || 0);
      
      const matchesPerUser = totalUsers === 0 ? 0 : (totalMatches / totalUsers).toFixed(1);
      
      // Add engagement metrics
      metrics.push({
        id: "matches-per-user",
        title: "Matches per User",
        value: matchesPerUser,
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.ENGAGEMENT,
        description: "Average number of matches per user"
      });

      // Calculate platform engagement (ratio of active to total users)
      // A user is considered active if they've participated in a match or event recently
      const activeUserCount = await this.getActiveUserCount(currentStartDate);
      const activeUserPercent = totalUsers === 0 ? 0 : Math.round((activeUserCount / totalUsers) * 100);
      
      metrics.push({
        id: "platform-engagement",
        title: "Platform Engagement",
        value: activeUserPercent,
        valueType: DashboardMetricValueType.PERCENTAGE,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: activeUserPercent > 50 ? DashboardMetricSentiment.POSITIVE : DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.ENGAGEMENT,
        description: "Percentage of users active in selected time period"
      });

      return metrics;
    } catch (error) {
      console.error("Error getting engagement metrics:", error);
      return [];
    }
  }

  /**
   * Get active user count for a given time period
   * @param startDate - The start date to consider for activity
   */
  private async getActiveUserCount(startDate: Date): Promise<number> {
    try {
      // Get user IDs from recent matches
      const activeUserIdsFromMatches = await db
        .selectDistinct({ userId: matches.playerOneId })
        .from(matches)
        .where(gte(matches.matchDate, startDate.toISOString()))
        .execute()
        .then(results => results.map(r => r.userId));
      
      // Get user IDs from event check-ins
      const activeUserIdsFromEvents = await db
        .selectDistinct({ userId: eventCheckIns.userId })
        .from(eventCheckIns)
        .innerJoin(events, eq(eventCheckIns.eventId, events.id))
        .where(gte(events.startDateTime, startDate.toISOString()))
        .execute()
        .then(results => results.map(r => r.userId));
      
      // Combine and deduplicate user IDs
      const activeUserIds = new Set([...activeUserIdsFromMatches, ...activeUserIdsFromEvents]);
      
      return activeUserIds.size;
    } catch (error) {
      console.error("Error getting active user count:", error);
      return 0;
    }
  }

  /**
   * Get system metrics for the dashboard
   */
  private async getSystemMetrics(): Promise<DashboardMetric[]> {
    const metrics: DashboardMetric[] = [];

    try {
      // System uptime - this is a placeholder
      metrics.push({
        id: "system-uptime",
        title: "System Uptime",
        value: "99.9%",
        valueType: DashboardMetricValueType.PERCENTAGE,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.POSITIVE,
        category: DashboardMetricCategory.SYSTEM,
        description: "System uptime percentage"
      });

      // API response time - this is a placeholder
      metrics.push({
        id: "api-response-time",
        title: "API Response Time",
        value: "245",
        valueType: DashboardMetricValueType.NUMBER,
        trend: DashboardMetricTrend.NEUTRAL,
        sentiment: DashboardMetricSentiment.NEUTRAL,
        category: DashboardMetricCategory.SYSTEM,
        description: "Average API response time in ms"
      });

      return metrics;
    } catch (error) {
      console.error("Error getting system metrics:", error);
      return [];
    }
  }

  /**
   * Get chart data for the dashboard
   * @param timePeriod - The time period to consider
   */
  private async getUserGrowthChartData(timePeriod: DashboardTimePeriod): Promise<ChartData> {
    try {
      const { currentStartDate, previousStartDate, currentLabel, previousLabel } = await this.getTimeComparison(timePeriod);

      // For simplicity, we're using placeholder data here
      // In a real implementation, this would query the database for time-series data
      const currentPeriodData = [
        { label: "Week 1", value: 42 },
        { label: "Week 2", value: 55 },
        { label: "Week 3", value: 72 },
        { label: "Week 4", value: 90 }
      ];

      const previousPeriodData = [
        { label: "Week 1", value: 35 },
        { label: "Week 2", value: 48 },
        { label: "Week 3", value: 60 },
        { label: "Week 4", value: 75 }
      ];

      return {
        title: "User Growth",
        series: [
          {
            name: currentLabel,
            data: currentPeriodData
          },
          {
            name: previousLabel,
            data: previousPeriodData
          }
        ],
        xAxisLabel: "Time",
        yAxisLabel: "Users"
      };
    } catch (error) {
      console.error("Error getting user growth chart data:", error);
      return {
        title: "User Growth",
        series: [],
        xAxisLabel: "Time",
        yAxisLabel: "Users"
      };
    }
  }

  /**
   * Get match distribution chart data
   */
  private async getMatchDistributionChartData(): Promise<ChartData> {
    try {
      // For simplicity, we're using placeholder data here
      // In a real implementation, this would query the database for match types
      return {
        title: "Match Distribution",
        series: [
          {
            name: "Match Types",
            data: [
              { label: "Singles", value: 35 },
              { label: "Doubles", value: 55 },
              { label: "Mixed", value: 10 }
            ]
          }
        ]
      };
    } catch (error) {
      console.error("Error getting match distribution chart data:", error);
      return {
        title: "Match Distribution",
        series: []
      };
    }
  }

  /**
   * Get recent users table data
   */
  private async getRecentUsersTableData(): Promise<TableData> {
    try {
      const recentUsers = await db.select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
        email: users.email
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5)
      .execute();

      return {
        title: "Recent Users",
        columns: [
          { key: "username", title: "Username", sortable: true },
          { key: "email", title: "Email", sortable: true },
          { key: "createdAt", title: "Joined", sortable: true }
        ],
        rows: recentUsers.map(user => ({
          id: user.id.toString(),
          username: user.username,
          email: user.email || "N/A",
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"
        })),
        totalCount: recentUsers.length
      };
    } catch (error) {
      console.error("Error getting recent users table data:", error);
      return {
        title: "Recent Users",
        columns: [],
        rows: []
      };
    }
  }

  /**
   * Get dashboard widgets
   * @param timePeriod - The time period to consider
   */
  private async getDashboardWidgets(timePeriod: DashboardTimePeriod): Promise<DashboardWidget[]> {
    const widgets: DashboardWidget[] = [];
    
    try {
      // Get all metrics
      const userMetrics = await this.getUserMetrics(timePeriod);
      const matchMetrics = await this.getMatchMetrics(timePeriod);
      const eventMetrics = await this.getEventMetrics(timePeriod);
      const engagementMetrics = await this.getEngagementMetrics(timePeriod);
      const systemMetrics = await this.getSystemMetrics();
      
      // Create metric card widgets
      [...userMetrics, ...matchMetrics, ...eventMetrics, ...engagementMetrics, ...systemMetrics].forEach((metric, index) => {
        widgets.push({
          id: `metric-card-${metric.id}`,
          title: metric.title,
          widgetType: DashboardWidgetType.METRIC_CARD,
          category: metric.category,
          colSpan: 1,
          rowSpan: 1,
          priority: index + 1,
          metric
        });
      });
      
      // Add chart widgets
      const userGrowthChartData = await this.getUserGrowthChartData(timePeriod);
      widgets.push({
        id: "user-growth-chart",
        title: "User Growth",
        widgetType: DashboardWidgetType.CHART,
        chartType: DashboardChartType.LINE,
        category: DashboardMetricCategory.USER,
        colSpan: 2,
        rowSpan: 1,
        priority: 1,
        chartData: userGrowthChartData
      });
      
      const matchDistributionChartData = await this.getMatchDistributionChartData();
      widgets.push({
        id: "match-distribution-chart",
        title: "Match Distribution",
        widgetType: DashboardWidgetType.CHART,
        chartType: DashboardChartType.PIE,
        category: DashboardMetricCategory.MATCH,
        colSpan: 2,
        rowSpan: 1,
        priority: 2,
        chartData: matchDistributionChartData
      });
      
      // Add table widgets
      const recentUsersTableData = await this.getRecentUsersTableData();
      widgets.push({
        id: "recent-users-table",
        title: "Recent Users",
        widgetType: DashboardWidgetType.TABLE,
        category: DashboardMetricCategory.USER,
        colSpan: 2,
        rowSpan: 2,
        priority: 3,
        tableData: recentUsersTableData
      });
      
      // Add alert widgets
      // Only add if there's something important to alert about
      if (await this.shouldShowSystemAlert()) {
        widgets.push({
          id: "system-alert",
          title: "System Alert",
          widgetType: DashboardWidgetType.ALERT,
          alertType: DashboardAlertType.INFO,
          category: DashboardMetricCategory.SYSTEM,
          colSpan: 4,
          rowSpan: 1,
          priority: 0, // High priority
          message: "System maintenance scheduled for April 12, 2025 at 2:00 AM EST. Expected downtime: 30 minutes.",
          actionLink: "/admin/system/maintenance",
          actionText: "View Details",
          dismissible: true
        });
      }
      
      // Add action card widgets
      widgets.push({
        id: "quick-actions-card",
        title: "Quick Actions",
        widgetType: DashboardWidgetType.ACTION_CARD,
        category: DashboardMetricCategory.SYSTEM,
        colSpan: 1,
        rowSpan: 2,
        priority: 4,
        description: "Frequently used admin actions",
        actions: [
          {
            id: "create-user",
            label: "Create User",
            link: "/admin/users/create",
            icon: "user-plus"
          },
          {
            id: "create-event",
            label: "Create Event",
            link: "/admin/events/create",
            icon: "calendar-plus"
          },
          {
            id: "view-reports",
            label: "View Reports",
            link: "/admin/reporting",
            icon: "bar-chart"
          },
          {
            id: "system-settings",
            label: "System Settings",
            link: "/admin/settings",
            icon: "settings"
          }
        ]
      });
      
      return widgets;
    } catch (error) {
      console.error("Error getting dashboard widgets:", error);
      return [];
    }
  }

  /**
   * Check if we should show a system alert
   */
  private async shouldShowSystemAlert(): Promise<boolean> {
    // This is a placeholder - in a real implementation, this would check for actual alerts
    return true;
  }

  /**
   * Get the unified admin dashboard data
   * @param timePeriod - The time period to consider
   */
  public async getDashboard(timePeriod: DashboardTimePeriod = DashboardTimePeriod.MONTH): Promise<DashboardLayout> {
    try {
      const widgets = await this.getDashboardWidgets(timePeriod);
      
      // Get summary counts for reference
      const totalUsers = await this.storage.getUserCount();
      const totalMatches = await db.select({ count: count() })
        .from(matches)
        .execute()
        .then(result => result[0]?.count || 0);
      const totalEvents = await db.select({ count: count() })
        .from(events)
        .execute()
        .then(result => result[0]?.count || 0);
      
      return {
        id: "admin-dashboard",
        title: "Admin Dashboard",
        widgets,
        timePeriod
      };
    } catch (error) {
      console.error("Error getting dashboard:", error);
      return {
        id: "admin-dashboard",
        title: "Admin Dashboard",
        widgets: [],
        timePeriod
      };
    }
  }
}

/**
 * Create a dashboard generator instance with the given storage interface
 * @param storage - Storage interface to use
 */
export function createDashboardGenerator(storage: IStorage): DashboardGenerator {
  return new DashboardGenerator(storage);
}