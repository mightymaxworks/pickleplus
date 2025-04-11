/**
 * PKL-278651-ADMIN-0011-DASH
 * Chart Widget Component
 * 
 * This component displays a chart widget for the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWidget as ChartWidgetType, DashboardChartType } from "@shared/schema/admin/dashboard";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from "recharts";

interface ChartWidgetProps {
  widget: ChartWidgetType;
}

// Define color palette for charts
const CHART_COLORS = [
  "#FF5722", // Primary (Pickle+)
  "#2196F3", // Secondary
  "#4CAF50", // Accent
  "#9C27B0", // Additional colors
  "#FF9800",
  "#03A9F4",
  "#E91E63",
  "#8BC34A",
];

export function ChartWidget({ widget }: ChartWidgetProps) {
  // Build chart based on chart type
  const renderChart = () => {
    if (!widget.chartData || 
        !widget.chartData.series || 
        widget.chartData.series.length === 0 || 
        widget.chartData.series.some(s => !s.data || s.data.length === 0)) {
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (widget.chartType) {
      case DashboardChartType.LINE:
        return renderLineChart();
      case DashboardChartType.BAR:
        return renderBarChart();
      case DashboardChartType.PIE:
        return renderPieChart();
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Render a line chart
  const renderLineChart = () => {
    // Transform series data to recharts format
    const transformedData: Record<string, any>[] = [];
    if (widget.chartData?.series && widget.chartData.series.length > 0) {
      const firstSeries = widget.chartData.series[0];
      if (firstSeries.data) {
        for (let i = 0; i < firstSeries.data.length; i++) {
          const dataPoint: Record<string, any> = { 
            name: firstSeries.data[i].label 
          };
          
          widget.chartData.series.forEach((series, seriesIndex) => {
            if (series.data && series.data[i]) {
              const seriesKey = series.name || `series${seriesIndex + 1}`;
              dataPoint[seriesKey] = series.data[i].value;
              if (series.data[i].secondaryValue !== undefined) {
                dataPoint[`${seriesKey}_secondary`] = series.data[i].secondaryValue;
              }
            }
          });
          
          transformedData.push(dataPoint);
        }
      }
    }
    
    // Generate data keys from all series
    const dataKeys = widget.chartData?.series?.map(series => series.name || '') || [];
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={transformedData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
            axisLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.9)', 
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff'
            }} 
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={widget.chartData.series[index]?.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render a bar chart
  const renderBarChart = () => {
    // Transform series data to recharts format
    const transformedData: Record<string, any>[] = [];
    if (widget.chartData?.series && widget.chartData.series.length > 0) {
      const firstSeries = widget.chartData.series[0];
      if (firstSeries.data) {
        for (let i = 0; i < firstSeries.data.length; i++) {
          const dataPoint: Record<string, any> = { 
            name: firstSeries.data[i].label 
          };
          
          widget.chartData.series.forEach((series, seriesIndex) => {
            if (series.data && series.data[i]) {
              const seriesKey = series.name || `series${seriesIndex + 1}`;
              dataPoint[seriesKey] = series.data[i].value;
              if (series.data[i].secondaryValue !== undefined) {
                dataPoint[`${seriesKey}_secondary`] = series.data[i].secondaryValue;
              }
            }
          });
          
          transformedData.push(dataPoint);
        }
      }
    }
    
    // Generate data keys from all series
    const dataKeys = widget.chartData?.series?.map(series => series.name || '') || [];
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={transformedData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
            axisLine={{ stroke: 'rgba(156, 163, 175, 0.5)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.9)', 
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff'
            }} 
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={widget.chartData.series[index]?.color || CHART_COLORS[index % CHART_COLORS.length]}
              name={key}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render a pie chart
  const renderPieChart = () => {
    // Transform series data to pie chart format
    type PieDataItem = {
      name: string;
      value: number;
    };
    
    const pieData: PieDataItem[] = [];
    if (widget.chartData?.series && widget.chartData.series.length > 0) {
      // For pie charts, we typically take the first series only
      const series = widget.chartData.series[0];
      if (series.data) {
        series.data.forEach(item => {
          pieData.push({
            name: item.label,
            value: item.value
          });
        });
      }
    }
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.9)', 
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff'
            }} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        {renderChart()}
      </CardContent>
    </Card>
  );
}