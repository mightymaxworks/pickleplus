/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Stats Component
 * 
 * This component displays bug report statistics by severity.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBugReportStats } from '../api/feedbackApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bug, BugOff, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BugReportStatsProps {
  /** Custom class name for the component */
  className?: string;
}

/**
 * Get the appropriate icon for a severity level
 */
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Zap className="h-4 w-4 text-destructive" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'medium':
      return <Bug className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <BugOff className="h-4 w-4 text-green-500" />;
    default:
      return <Bug className="h-4 w-4" />;
  }
};

/**
 * Get the color for a severity level
 */
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-destructive text-destructive-foreground';
    case 'high':
      return 'bg-amber-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-primary text-primary-foreground';
  }
};

export function BugReportStats({ className = '' }: BugReportStatsProps) {
  // Fetch bug report statistics
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['bugReportStats'],
    queryFn: getBugReportStats,
  });
  
  // Calculate total issues
  const totalIssues = stats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  
  // Calculate percentages for progress bars
  const getPercentage = (count: number): number => {
    if (totalIssues === 0) return 0;
    return Math.round((count / totalIssues) * 100);
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Bug Report Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Bug Report Statistics</CardTitle>
          <CardDescription>Error loading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There was an error loading the bug report statistics. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats || stats.length === 0 || totalIssues === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Bug Report Statistics</CardTitle>
          <CardDescription>No bug reports yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There are no bug reports in the system yet. When users report bugs, statistics will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bug Report Statistics</CardTitle>
        <CardDescription>Bug reports by severity level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.severity} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(stat.severity)}
                  <span className="text-sm font-medium capitalize">
                    {stat.severity} ({stat.count})
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {getPercentage(stat.count)}%
                </span>
              </div>
              <Progress 
                value={getPercentage(stat.count)} 
                className={`h-2 ${getSeverityColor(stat.severity)}`} 
              />
            </div>
          ))}
          
          <div className="pt-2 text-sm text-muted-foreground text-right">
            Total: {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}