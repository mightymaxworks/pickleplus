/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Dashboard Component
 * 
 * This component displays overview statistics and charts for the Bounce testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  Play, 
  Calendar, 
  Clock, 
  Bug,
  BarChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BounceFindingSeverity } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

const BounceDashboard: React.FC = () => {
  // Get dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/bounce/dashboard'],
    queryFn: async () => {
      return apiRequest<any>('/api/admin/bounce/dashboard');
    }
  });

  // Get recent test runs
  const { data: testRunsData, isLoading: isLoadingTestRuns } = useQuery({
    queryKey: ['/api/admin/bounce/test-runs'],
    queryFn: async () => {
      return apiRequest<any>('/api/admin/bounce/test-runs?limit=5');
    }
  });

  const findingsBySeverity = React.useMemo(() => {
    if (!data?.findings) return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    
    const critical = data.findings.filter((f: any) => f.severity === BounceFindingSeverity.CRITICAL).length;
    const high = data.findings.filter((f: any) => f.severity === BounceFindingSeverity.HIGH).length;
    const medium = data.findings.filter((f: any) => f.severity === BounceFindingSeverity.MEDIUM).length;
    const low = data.findings.filter((f: any) => f.severity === BounceFindingSeverity.LOW).length;
    
    return {
      critical,
      high,
      medium,
      low,
      total: critical + high + medium + low
    };
  }, [data?.findings]);

  const calculateTestSuccess = () => {
    if (!testRunsData?.testRuns || testRunsData.testRuns.length === 0) return 0;
    
    const successfulRuns = testRunsData.testRuns.filter((run: any) => 
      run.completedAt && run.success
    ).length;
    
    return Math.round((successfulRuns / testRunsData.testRuns.length) * 100);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Findings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {findingsBySeverity.total}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Critical</span>
                <span className="font-medium">{findingsBySeverity.critical}</span>
              </div>
              <Progress value={findingsBySeverity.critical / (findingsBySeverity.total || 1) * 100} className="h-1 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-red-500" />
              
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">High</span>
                <span className="font-medium">{findingsBySeverity.high}</span>
              </div>
              <Progress value={findingsBySeverity.high / (findingsBySeverity.total || 1) * 100} className="h-1 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-orange-500" />
              
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium">{findingsBySeverity.medium}</span>
              </div>
              <Progress value={findingsBySeverity.medium / (findingsBySeverity.total || 1) * 100} className="h-1 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-yellow-500" />
              
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Low</span>
                <span className="font-medium">{findingsBySeverity.low}</span>
              </div>
              <Progress value={findingsBySeverity.low / (findingsBySeverity.total || 1) * 100} className="h-1 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTestRuns ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {testRunsData?.testRuns?.length || 0}
              </div>
            )}
            <div className="mt-4">
              <div className="mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">{calculateTestSuccess()}%</span>
                </div>
                <Progress value={calculateTestSuccess()} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-muted-foreground">Most Stable Area:</span>
                  <span className="font-medium ml-auto">
                    {data?.mostStableArea || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                  <span className="text-muted-foreground">Most Error-Prone Area:</span>
                  <span className="font-medium ml-auto">
                    {data?.mostErrorProneArea || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testing Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">
                {data?.coveragePercentage || 0}%
              </div>
            )}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Coverage</span>
                <span className="font-medium">{data?.coveragePercentage || 0}%</span>
              </div>
              <Progress 
                value={data?.coveragePercentage || 0} 
                className="h-1"
              />
              
              <div className="flex items-center justify-between text-xs pt-2">
                <div>
                  <span className="text-muted-foreground">Tested Components</span>
                  <div className="font-medium">{data?.testedComponents || 0}</div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Total Components</span>
                  <div className="font-medium">{data?.totalComponents || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
          <CardDescription>
            The most recent automated test executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTestRuns ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : testRunsData?.testRuns?.length ? (
            <div className="space-y-4">
              {testRunsData.testRuns.map((run: any) => (
                <div 
                  key={run.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium">{run.name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(run.startedAt).toLocaleDateString()}
                      <Clock className="h-3 w-3 ml-3 mr-1" />
                      {new Date(run.startedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Bug className="h-4 w-4 mr-1 text-red-500" />
                      <span className="text-sm">{run.findingsCount || 0}</span>
                    </div>
                    {run.success ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <Check className="h-3 w-3 mr-1" /> Success
                      </Badge>
                    ) : run.completedAt ? (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" /> Failed
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        <Play className="h-3 w-3 mr-1" /> Running
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No test runs have been executed yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Badge variant="outline" className="cursor-default">
            <BarChart className="h-3 w-3 mr-1" />
            Detailed metrics available in Sprint 2
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BounceDashboard;