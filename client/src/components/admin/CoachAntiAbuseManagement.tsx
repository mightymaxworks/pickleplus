/**
 * Coach Anti-Abuse Management Dashboard
 * 
 * Comprehensive admin interface for monitoring and managing coach assessment
 * anti-abuse controls including rate limiting, anomaly detection, and review queues.
 * 
 * Features:
 * - Real-time abuse detection dashboard
 * - Admin review queue for flagged activities  
 * - Rate limiting controls and overrides
 * - Anomaly pattern analysis
 * - Coach behavior analytics
 * - Automated response configuration
 * 
 * UDF Compliance: Rules 31-34 (Enhanced Coach Assessment System)
 * 
 * @version 2.0.0
 * @lastModified September 23, 2025
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Activity,
  Users,
  Clock,
  Eye,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Download,
  Ban,
  UserCheck,
  AlertOctagon,
  BarChart3,
  Calendar,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AbuseLogEntry {
  id: number;
  coachId: number;
  coachName: string;
  coachLevel: number;
  targetStudentId?: number;
  studentName?: string;
  activityType: string;
  anomalyFlags: string[];
  anomalyScore: number;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  reviewStatus: 'pending' | 'approved' | 'flagged' | 'blocked';
  reviewedBy?: number;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface CoachAbuseStats {
  totalFlags: number;
  pendingReview: number;
  blockedCoaches: number;
  dailyAssessments: number;
  dailyLimit: number;
  anomalousActivities: number;
  topAnomalyPatterns: Array<{
    pattern: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface RateLimitOverride {
  coachId: number;
  newLimit: number;
  expiresAt: string;
  reason: string;
}

export function CoachAntiAbuseManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Fetch abuse statistics and dashboard data
  const { data: abuseStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/coach-discovery/abuse-stats', selectedTimeframe],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/coach-discovery/abuse-stats?timeframe=${selectedTimeframe}`);
      return response.json() as Promise<CoachAbuseStats>;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch abuse log entries
  const { data: abuseLog, isLoading: logLoading } = useQuery({
    queryKey: ['/api/coach-discovery/abuse-log', reviewFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reviewFilter !== 'all') params.append('status', reviewFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await apiRequest('GET', `/api/coach-discovery/abuse-log?${params.toString()}`);
      return response.json() as Promise<{ logs: AbuseLogEntry[] }>;
    }
  });

  // Review abuse log entry
  const reviewEntry = useMutation({
    mutationFn: async ({ entryId, action, notes }: { entryId: number; action: string; notes?: string }) => {
      const response = await apiRequest('POST', '/api/coach-discovery/review-abuse-entry', {
        entryId,
        action,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-log'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-stats'] });
      toast({
        title: "Review Complete",
        description: "Abuse entry has been reviewed and action taken.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to process review action",
        variant: "destructive",
      });
    }
  });

  // Apply rate limit override
  const applyRateLimitOverride = useMutation({
    mutationFn: async (override: RateLimitOverride) => {
      const response = await apiRequest('POST', '/api/coach-discovery/rate-limit-override', override);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rate Limit Override Applied",
        description: "Coach rate limit has been temporarily modified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Override Failed",
        description: error.message || "Failed to apply rate limit override",
        variant: "destructive",
      });
    }
  });

  // Block/unblock coach
  const toggleCoachBlock = useMutation({
    mutationFn: async ({ coachId, action, reason }: { coachId: number; action: 'block' | 'unblock'; reason: string }) => {
      const response = await apiRequest('POST', '/api/coach-discovery/toggle-coach-block', {
        coachId,
        action,
        reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-log'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-stats'] });
      toast({
        title: "Coach Status Updated",
        description: "Coach block status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update coach status",
        variant: "destructive",
      });
    }
  });

  // Filter abuse log entries
  const filteredLogs = useMemo(() => {
    if (!abuseLog?.logs) return [];
    return abuseLog.logs.filter(log => {
      if (reviewFilter !== 'all' && log.reviewStatus !== reviewFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.coachName.toLowerCase().includes(query) ||
          log.studentName?.toLowerCase().includes(query) ||
          log.activityType.toLowerCase().includes(query) ||
          log.anomalyFlags.some(flag => flag.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [abuseLog?.logs, reviewFilter, searchQuery]);

  const getSeverityColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      flagged: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      blocked: { color: 'bg-gray-100 text-gray-800', icon: Ban }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading anti-abuse dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="coach-antiabuse-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Anti-Abuse Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage coach assessment system integrity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/coach-discovery/abuse-log'] });
            }}
            data-testid="refresh-dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Flags</p>
                <p className="text-3xl font-bold text-red-600">{abuseStats?.totalFlags || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedTimeframe} timeframe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{abuseStats?.pendingReview || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Requires admin attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Coaches</p>
                <p className="text-3xl font-bold text-gray-600">{abuseStats?.blockedCoaches || 0}</p>
              </div>
              <Ban className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Currently blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Assessments</p>
                <p className="text-3xl font-bold text-blue-600">{abuseStats?.dailyAssessments || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress 
                value={abuseStats?.dailyLimit ? (abuseStats.dailyAssessments / abuseStats.dailyLimit) * 100 : 0} 
                className="h-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {abuseStats?.dailyAssessments || 0} / {abuseStats?.dailyLimit || 0} limit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="review-queue">Review Queue</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Anomaly Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5" />
                Top Anomaly Patterns
              </CardTitle>
              <CardDescription>
                Most frequent suspicious behavior patterns detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abuseStats && abuseStats.topAnomalyPatterns?.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{pattern.pattern}</p>
                      <p className="text-sm text-gray-600">Occurrences: {pattern.count}</p>
                    </div>
                    <Badge variant={
                      pattern.severity === 'high' ? 'destructive' :
                      pattern.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {pattern.severity}
                    </Badge>
                  </div>
                ))}
                {(!abuseStats || !abuseStats.topAnomalyPatterns || abuseStats.topAnomalyPatterns.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No anomaly patterns detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Alert */}
          {abuseStats && (abuseStats.anomalousActivities || 0) > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{abuseStats?.anomalousActivities || 0} anomalous activities</strong> detected in the selected timeframe. 
                Review the queue to take appropriate action.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="review-queue" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by coach name, student, or activity type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-abuse-logs"
              />
            </div>
            
            <Select value={reviewFilter} onValueChange={setReviewFilter as any}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Abuse Log Entries */}
          <div className="space-y-4">
            {logLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading abuse log entries...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No abuse entries found</p>
              </div>
            ) : (
              filteredLogs.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-red-400" data-testid={`abuse-entry-${entry.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Coach: {entry.coachName} (L{entry.coachLevel})
                          </h3>
                          {getStatusBadge(entry.reviewStatus)}
                          <Badge 
                            className={`px-2 py-1 text-xs ${getSeverityColor(entry.anomalyScore)}`}
                          >
                            Score: {(entry.anomalyScore * 100).toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Activity: <span className="font-medium">{entry.activityType}</span></p>
                            {entry.studentName && (
                              <p className="text-sm text-gray-600">Target: <span className="font-medium">{entry.studentName}</span></p>
                            )}
                            <p className="text-sm text-gray-600">Time: {new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            {entry.ipAddress && (
                              <p className="text-sm text-gray-600">IP: <span className="font-mono text-xs">{entry.ipAddress}</span></p>
                            )}
                            {entry.deviceFingerprint && (
                              <p className="text-sm text-gray-600">Device: <span className="font-mono text-xs">{entry.deviceFingerprint}</span></p>
                            )}
                          </div>
                        </div>

                        {entry.anomalyFlags && entry.anomalyFlags.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Anomaly Flags:</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.anomalyFlags.map((flag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {entry.reviewNotes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Review Notes:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{entry.reviewNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        {entry.reviewStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => reviewEntry.mutate({ entryId: entry.id, action: 'approve', notes: 'Approved by admin' })}
                              disabled={reviewEntry.isPending}
                              data-testid={`approve-entry-${entry.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => reviewEntry.mutate({ entryId: entry.id, action: 'flag', notes: 'Flagged for suspicious activity' })}
                              disabled={reviewEntry.isPending}
                              data-testid={`flag-entry-${entry.id}`}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Flag
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleCoachBlock.mutate({ coachId: entry.coachId, action: 'block', reason: 'Blocked due to suspicious activity' })}
                              disabled={toggleCoachBlock.isPending}
                              data-testid={`block-coach-${entry.coachId}`}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Block Coach
                            </Button>
                          </>
                        )}
                        
                        {entry.reviewStatus === 'blocked' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCoachBlock.mutate({ coachId: entry.coachId, action: 'unblock', reason: 'Unblocked by admin review' })}
                            disabled={toggleCoachBlock.isPending}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Unblock
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Management</CardTitle>
              <CardDescription>
                Manage coach assessment rate limits and apply temporary overrides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  <strong>Default Limits:</strong> L1: 3/day, L2: 5/day, L3: 7/day, L4+: 10/day
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Coach ID"
                    type="number"
                    data-testid="rate-limit-coach-id"
                  />
                  <Input
                    placeholder="New Limit"
                    type="number"
                    data-testid="rate-limit-new-limit"
                  />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Reason for rate limit override..."
                  className="min-h-20"
                  data-testid="rate-limit-reason"
                />
                
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Apply Rate Limit Override
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Activity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Activity trend analytics coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Geographic analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CoachAntiAbuseManagement;