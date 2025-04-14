/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Stats Component
 * 
 * This component displays bug report statistics by severity.
 */

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react';

import { getBugReportStats } from '../api/feedbackApi';
import { BugReportSeverity, BugReportSeverityCount } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Props for the BugReportStats component
 */
interface BugReportStatsProps {
  /** Custom class name for the component */
  className?: string;
}

/**
 * Get the appropriate icon for a severity level
 */
function getSeverityIcon(severity: BugReportSeverity) {
  switch (severity) {
    case 'critical':
      return <AlertOctagon className="h-5 w-5" />;
    case 'high':
      return <AlertCircle className="h-5 w-5" />;
    case 'medium':
      return <AlertTriangle className="h-5 w-5" />;
    case 'low':
      return <Info className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
}

/**
 * Get the color for a severity level
 */
function getSeverityColor(severity: BugReportSeverity) {
  switch (severity) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-blue-500';
    default:
      return 'text-blue-500';
  }
}

/**
 * Bug report statistics component
 */
export function BugReportStats({ className = '' }: BugReportStatsProps) {
  // Fetch bug report statistics
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/feedback/bug-report/stats'],
    queryFn: getBugReportStats
  });
  
  // If there's an error, show an error message
  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Bug Report Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load statistics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Bug Report Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Show skeleton loader while loading
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : data && data.length > 0 ? (
          // Show statistics when loaded
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.map((stat: BugReportSeverityCount) => (
              <div 
                key={stat.severity}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <div className="flex items-center space-x-2">
                  <span className={getSeverityColor(stat.severity)}>
                    {getSeverityIcon(stat.severity)}
                  </span>
                  <span className="font-medium capitalize">{stat.severity}</span>
                </div>
                <span className="text-lg font-semibold">{stat.count}</span>
              </div>
            ))}
          </div>
        ) : (
          // Show message when there are no bug reports
          <p className="text-muted-foreground text-center py-2">
            No bug reports submitted yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}