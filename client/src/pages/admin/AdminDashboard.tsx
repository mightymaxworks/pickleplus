/**
 * Professional Admin Dashboard
 * 
 * Traditional backend-style administration interface
 * Connects to Admin API v1 endpoints for real data
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  Activity, 
  Settings, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface SystemOverview {
  totalUsers: number;
  totalMatches: number;
  totalTournaments: number;
  systemHealth: string;
  lastUpdated: string;
}

interface AdminDashboardData {
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

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/v1/dashboard', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <Button 
                  onClick={fetchDashboardData} 
                  className="mt-3"
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              System Overview & Management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={dashboardData?.systemOverview.systemHealth === 'healthy' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {dashboardData?.systemOverview.systemHealth === 'healthy' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {dashboardData?.systemOverview.systemHealth || 'Unknown'}
            </Badge>
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* System Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +{dashboardData?.userStatistics.newUsersThisPeriod} this period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Matches</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview.totalMatches.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +{dashboardData?.matchStatistics.newMatchesThisPeriod} this period
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.userStatistics.activeUsersThisPeriod.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboardData?.userStatistics.userGrowthRate.toFixed(1)}% growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tournaments</CardTitle>
              <Database className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.systemOverview.totalTournaments.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                System tournaments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Trophy className="mr-2 h-4 w-4" />
                View Matches
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                System Tools
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">System Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Avg Matches per User</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.matchStatistics.averageMatchesPerUser.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Match Growth Rate</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {dashboardData?.matchStatistics.matchGrowthRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-xs text-gray-500">
                  {dashboardData?.systemOverview.lastUpdated ? 
                    new Date(dashboardData.systemOverview.lastUpdated).toLocaleString() : 
                    'Unknown'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}