/**
 * PKL-278651-ADMIN-0011-DASH
 * Metric Card Component
 * 
 * This component displays a single metric card for the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetric, DashboardMetricTrend, DashboardMetricValueType } from "@shared/schema/admin/dashboard";
import { TrendingDown, TrendingUp, Minus, ArrowUpRight, Users, Activity, Calendar, BarChart2 } from "lucide-react";

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  // Format the value based on value type
  const formatValue = (value: string | number, valueType: DashboardMetricValueType): string => {
    if (typeof value === 'string') {
      return value;
    }
    
    switch (valueType) {
      case DashboardMetricValueType.PERCENTAGE:
        return `${value}%`;
      case DashboardMetricValueType.CURRENCY:
        return `$${value.toLocaleString()}`;
      case DashboardMetricValueType.RATING:
        return value.toString();
      case DashboardMetricValueType.NUMBER:
      default:
        return value.toLocaleString();
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: DashboardMetricTrend) => {
    switch (trend) {
      case DashboardMetricTrend.UP:
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case DashboardMetricTrend.DOWN:
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case DashboardMetricTrend.NEUTRAL:
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (metric.category) {
      case "user":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "match":
        return <Activity className="h-4 w-4 text-muted-foreground" />;
      case "event":
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
      case "engagement":
        return <BarChart2 className="h-4 w-4 text-muted-foreground" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Format the percent change to show + sign for positive values
  const formattedPercentChange = metric.percentChange !== undefined
    ? (metric.percentChange > 0 ? `+${metric.percentChange}%` : `${metric.percentChange}%`)
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center">
            {getCategoryIcon()}
            <span className="ml-2">{metric.title}</span>
          </div>
        </CardTitle>
        {getTrendIcon(metric.trend)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(metric.value, metric.valueType)}
        </div>
        {formattedPercentChange && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {formattedPercentChange} from previous period
          </p>
        )}
        {metric.description && (
          <CardDescription className="mt-2 text-xs">{metric.description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
}