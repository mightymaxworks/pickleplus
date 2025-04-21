/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Dashboard Component
 * 
 * This component displays the main dashboard for the Bounce automated testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Play, Settings, Ban } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BounceTestRunStatus, BounceFindingSeverity, BounceFindingStatus } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const BounceDashboard: React.FC = () => {
  const { data: testRunsData, isLoading: isLoadingTestRuns } = useQuery({
    queryKey: ['/api/admin/bounce/test-runs'],
    queryFn: async () => {
      return apiRequest<any>('/api/admin/bounce/test-runs');
    }
  });

  const { data: findingsData, isLoading: isLoadingFindings } = useQuery({
    queryKey: ['/api/admin/bounce/findings'],
    queryFn: async () => {
      return apiRequest<any>('/api/admin/bounce/findings?status=open');
    }
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case BounceTestRunStatus.RUNNING:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Running</Badge>;
      case BounceTestRunStatus.COMPLETED:
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case BounceTestRunStatus.FAILED:
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case BounceFindingSeverity.CRITICAL:
        return <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>;
      case BounceFindingSeverity.MODERATE:
        return <Badge className="bg-orange-500 hover:bg-orange-600">Moderate</Badge>;
      case BounceFindingSeverity.LOW:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bounce Testing Dashboard</h1>
          <p className="text-muted-foreground">Monitor automated tests and manage issues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Play size={16} />
            Start New Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingTestRuns ? <Skeleton className="h-7 w-16" /> : '94%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFindings ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                findingsData?.findings.length || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoadingFindings ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${findingsData?.findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length || 0} critical, 
                 ${findingsData?.findings.filter(f => f.severity === BounceFindingSeverity.MODERATE).length || 0} moderate`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Test Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingTestRuns ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                testRunsData?.testRuns?.[0]?.status || 'No data'
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoadingTestRuns ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                testRunsData?.testRuns?.[0]?.createdAt
                  ? `${new Date(testRunsData.testRuns[0].createdAt).toLocaleString()}`
                  : 'No recent tests'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test-runs" className="w-full">
        <TabsList>
          <TabsTrigger value="test-runs">Test Runs</TabsTrigger>
          <TabsTrigger value="issues">Open Issues</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="test-runs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Runs</CardTitle>
              <CardDescription>
                View and manage automated test executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTestRuns ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : testRunsData?.testRuns?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {testRunsData.testRuns.map((run: any) => (
                      <div key={run.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h4 className="font-medium">Test Run #{run.id}</h4>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(run.startTime).toLocaleString()}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {renderStatusBadge(run.status)}
                            <Badge variant="outline">{run.browsers}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No test runs found</AlertTitle>
                  <AlertDescription>
                    No automated test runs have been executed yet.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Issues</CardTitle>
              <CardDescription>
                Issues discovered by Bounce automated testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFindings ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : findingsData?.findings?.length ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {findingsData.findings.map((finding: any) => (
                      <div key={finding.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{finding.findingId}: {finding.description}</h4>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {finding.area}
                          </span>
                          {finding.path && (
                            <span className="flex items-center">
                              <Ban className="mr-1 h-3 w-3" />
                              {finding.path}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {renderSeverityBadge(finding.severity)}
                          <Badge variant="outline">{finding.browser}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>All clear!</AlertTitle>
                  <AlertDescription>
                    No open issues found. All tests are passing successfully.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Schedules</CardTitle>
              <CardDescription>
                Configure automated test scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Coming Soon</AlertTitle>
                  <AlertDescription>
                    Automated test scheduling will be available in the next sprint.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BounceDashboard;