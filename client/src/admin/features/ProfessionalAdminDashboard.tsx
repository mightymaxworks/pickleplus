/**
 * Professional Admin Dashboard - Backend-style Interface
 * 
 * Connects to Admin API v1 endpoints for real data
 * Professional, utilitarian design focused on functionality
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  Activity, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface SystemOverview {
  totalUsers: number;
  totalMatches: number;
  totalTournaments: number;
  systemHealth: string;
  lastUpdated: string;
}

interface DashboardData {
  systemOverview: SystemOverview;
  userStatistics: {
    newUsersThisPeriod: number;
    activeUsersThisPeriod: number;
    userGrowthRate: number;
  };
  matchStatistics: {
    newMatchesThisPeriod: number;
    totalMatchesPlayed: number;
    averageMatchesPerUser: number;
    matchGrowthRate: number;
  };
}

export default function ProfessionalAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/v1/dashboard', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time system metrics and administration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={data?.systemOverview.systemHealth === 'healthy' ? 'default' : 'destructive'}
            className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300"
          >
            {data?.systemOverview.systemHealth === 'healthy' ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-600" />
            )}
            System {data?.systemOverview.systemHealth || 'Unknown'}
          </Badge>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="border-slate-300 text-slate-700"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.systemOverview.totalUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              +{data?.userStatistics.newUsersThisPeriod || 0} this period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Matches</CardTitle>
            <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.systemOverview.totalMatches?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              +{data?.matchStatistics.newMatchesThisPeriod || 0} this period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.userStatistics.activeUsersThisPeriod?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data?.userStatistics.userGrowthRate?.toFixed(1) || '0'}% growth rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tournaments</CardTitle>
            <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center">
              <Database className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data?.systemOverview.totalTournaments?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              System tournaments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full justify-between border-slate-300 text-slate-700 hover:bg-slate-50">
                <div className="flex items-center">
                  <Users className="mr-3 h-4 w-4" />
                  User Management
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-slate-300 text-slate-700 hover:bg-slate-50">
                <div className="flex items-center">
                  <Trophy className="mr-3 h-4 w-4" />
                  Match Administration
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-slate-300 text-slate-700 hover:bg-slate-50">
                <div className="flex items-center">
                  <BarChart3 className="mr-3 h-4 w-4" />
                  System Reports
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-slate-300 text-slate-700 hover:bg-slate-50">
                <div className="flex items-center">
                  <Database className="mr-3 h-4 w-4" />
                  Database Tools
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Average Matches per User</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {data?.matchStatistics.averageMatchesPerUser?.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">Match Growth Rate</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {data?.matchStatistics.matchGrowthRate?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">User Engagement Rate</span>
                <span className="font-semibold text-slate-900">
                  {((data?.userStatistics.activeUsersThisPeriod || 0) / (data?.systemOverview.totalUsers || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-slate-600">Last Data Refresh</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-4">
        Admin Dashboard v1.0 • Last updated: {data?.systemOverview.lastUpdated ? 
          new Date(data.systemOverview.lastUpdated).toLocaleString() : 
          'Unknown'
        }
      </div>
    </div>
  );
}