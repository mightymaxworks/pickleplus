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
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from "recharts";
import { useTheme } from "@/hooks/use-theme";

// Define interface for component props
interface ChartWidgetProps {
  widget: ChartWidgetType;
}

// Define color palette for charts
const CHART_COLORS = ["#FF5722", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#795548"];
const PIE_COLORS = ["#FF5722", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#795548"];

export function ChartWidget({ widget }: ChartWidgetProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  
  // Convert chart data to format expected by Recharts
  const chartData = widget.chartData.series.length > 0 && widget.chartData.series[0].data.map((point, index) => {
    const dataPoint: Record<string, any> = {
      name: point.label,
    };
    
    // Add values from all series
    widget.chartData.series.forEach((series, seriesIndex) => {
      if (series.data[index]) {
        dataPoint[series.name] = series.data[index].value;
      }
    });
    
    return dataPoint;
  });
  
  // Determine axis and text colors based on theme
  const axisColor = isDarkTheme ? "#888888" : "#666666";
  const textColor = isDarkTheme ? "#DDDDDD" : "#333333";
  
  // Helper function to generate the appropriate chart type
  const renderChart = () => {
    switch (widget.chartType) {
      case DashboardChartType.LINE:
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333333" : "#EEEEEE"} />
              <XAxis 
                dataKey="name" 
                stroke={axisColor} 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={axisColor} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
                  color: textColor,
                  border: `1px solid ${isDarkTheme ? "#333333" : "#EEEEEE"}`
                }} 
              />
              <Legend />
              {widget.chartData.series.map((series, index) => (
                <Line
                  key={series.name}
                  type="monotone"
                  dataKey={series.name}
                  stroke={series.color || CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case DashboardChartType.BAR:
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333333" : "#EEEEEE"} />
              <XAxis 
                dataKey="name" 
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
                  color: textColor,
                  border: `1px solid ${isDarkTheme ? "#333333" : "#EEEEEE"}`
                }} 
              />
              <Legend />
              {widget.chartData.series.map((series, index) => (
                <Bar
                  key={series.name}
                  dataKey={series.name}
                  fill={series.color || CHART_COLORS[index % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case DashboardChartType.PIE:
        // For pie charts, we use only the first series data
        const pieData = widget.chartData.series[0]?.data.map((item) => ({
          name: item.label,
          value: item.value
        })) || [];
        
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
                  color: textColor,
                  border: `1px solid ${isDarkTheme ? "#333333" : "#EEEEEE"}`
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case DashboardChartType.AREA:
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333333" : "#EEEEEE"} />
              <XAxis 
                dataKey="name" 
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkTheme ? "#1E1E1E" : "#FFFFFF",
                  color: textColor,
                  border: `1px solid ${isDarkTheme ? "#333333" : "#EEEEEE"}`
                }} 
              />
              <Legend />
              {widget.chartData.series.map((series, index) => (
                <Area
                  key={series.name}
                  type="monotone"
                  dataKey={series.name}
                  stroke={series.color || CHART_COLORS[index % CHART_COLORS.length]}
                  fill={`${series.color || CHART_COLORS[index % CHART_COLORS.length]}33`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-2">
        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
}