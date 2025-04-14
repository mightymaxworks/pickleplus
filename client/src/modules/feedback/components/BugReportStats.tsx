/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Stats Component
 * 
 * This component displays statistics about bug reports.
 */

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RefreshCw, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { BugReportStatsProps, BugReportStat } from '../types';
import { getBugReportStats } from '../api/feedbackApi';

// Colors for different severity levels
const COLORS = {
  low: '#22c55e',     // green-500
  medium: '#eab308',  // yellow-500
  high: '#f97316',    // amber-500
  critical: '#ef4444' // red-500
};

/**
 * Bug report statistics component
 */
export function BugReportStats({ timeFrame = 'week' }: BugReportStatsProps) {
  const [stats, setStats] = useState<BugReportStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrame);
  
  useEffect(() => {
    fetchStats();
  }, [selectedTimeFrame]);
  
  /**
   * Fetch bug report statistics from the server
   */
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getBugReportStats(selectedTimeFrame);
      setStats(data);
    } catch (error) {
      console.error('Error fetching bug report stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Get total number of reports across all severities
   */
  const getTotalReports = () => {
    return stats.reduce((total, stat) => total + stat.count, 0);
  };
  
  /**
   * Render a placeholder while loading
   */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bug Report Statistics
          </CardTitle>
          <CardDescription>Loading bug report data...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-48 h-48 rounded-full">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="mt-4 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  /**
   * Render no data state
   */
  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bug Report Statistics
          </CardTitle>
          <CardDescription>No bug reports found for this period</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          <div className="text-center text-muted-foreground">
            <p>No bug reports have been submitted during this time frame.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedTimeFrame('all')}
            >
              View All Time
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  /**
   * Format time frame text for display
   */
  const getTimeFrameText = () => {
    switch (selectedTimeFrame) {
      case 'day': return 'Past 24 Hours';
      case 'week': return 'Past Week';
      case 'month': return 'Past Month';
      case 'all': return 'All Time';
      default: return 'Custom Period';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bug Report Statistics
          </CardTitle>
          <CardDescription>
            {getTimeFrameText()} - {getTotalReports()} reports
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedTimeFrame}
            onValueChange={(value) => {
              if (value === 'day' || value === 'week' || value === 'month' || value === 'all') {
                setSelectedTimeFrame(value);
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="severity"
                  label={({ severity }) => severity}
                >
                  {stats.map((entry) => (
                    <Cell 
                      key={`cell-${entry.severity}`} 
                      fill={COLORS[entry.severity]} 
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} reports`, `${name} severity`]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 w-full gap-2">
            {stats.map((stat) => (
              <div
                key={stat.severity}
                className="flex flex-col items-center p-2 rounded-md"
                style={{ backgroundColor: `${COLORS[stat.severity]}20` }}
              >
                <span className="text-sm font-medium capitalize">{stat.severity}</span>
                <span className="text-2xl font-bold">{stat.count}</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round((stat.count / getTotalReports()) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}