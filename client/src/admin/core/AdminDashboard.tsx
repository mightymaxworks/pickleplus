/**
 * Modern Admin Dashboard
 * 
 * PKL-278651-ADMIN-UI-002
 * Comprehensive admin overview with real-time metrics and quick actions
 * UDF Rule 21 Compliance - Admin UI/UX Standards
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Shield,
  BarChart3,
  Settings,
  RefreshCw,
  Calendar,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AdminLayout } from './AdminLayout';
import { cn } from '@/lib/utils';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  pendingVerifications: number;
  systemHealth: number;
  revenue: number;
  alerts: AdminAlert[];
  recentActivity: AdminActivity[];
}

interface AdminAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  urgent?: boolean;
}

interface AdminActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'default' | 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = 'default' 
}) => {
  const colorClasses = {
    default: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  };

  const iconColorClasses = {
    default: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', colorClasses[color])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColorClasses[color])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-2",
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            <TrendingUp className={cn(
              "h-3 w-3 mr-1",
              trend.direction === 'down' && 'rotate-180'
            )} />
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock data - In real implementation, this would come from API
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-metrics', refreshKey],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        totalUsers: 15420,
        activeUsers: 8765,
        totalMatches: 45230,
        pendingVerifications: 23,
        systemHealth: 98.5,
        revenue: 125400,
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'High Server Load',
            description: 'Database queries taking longer than usual',
            timestamp: '2 minutes ago',
          },
          {
            id: '2',
            type: 'error',
            title: 'Failed Payment Processing',
            description: '3 subscription renewals failed',
            timestamp: '15 minutes ago',
            urgent: true,
          },
          {
            id: '3',
            type: 'info',
            title: 'Maintenance Scheduled',
            description: 'System maintenance at 2 AM EST',
            timestamp: '1 hour ago',
          },
        ],
        recentActivity: [
          {
            id: '1',
            action: 'User registration approved',
            user: 'admin@pickle.plus',
            timestamp: '5 minutes ago',
            status: 'success',
          },
          {
            id: '2',
            action: 'Match verification updated',
            user: 'moderator@pickle.plus',
            timestamp: '12 minutes ago',
            status: 'success',
          },
          {
            id: '3',
            action: 'Bulk data import initiated',
            user: 'admin@pickle.plus',
            timestamp: '25 minutes ago',
            status: 'pending',
          },
        ],
      };
    },
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const dashboardActions = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
        Refresh
      </Button>
      <Button size="sm">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </Button>
    </div>
  );

  if (error) {
    return (
      <AdminLayout title="Dashboard" actions={dashboardActions}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" actions={dashboardActions}>
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers.toLocaleString() || '---'}
            description="Registered platform users"
            icon={Users}
            trend={{ value: 12, direction: 'up' }}
            color="success"
          />
          <MetricCard
            title="Active Users"
            value={metrics?.activeUsers.toLocaleString() || '---'}
            description="Users active in last 30 days"
            icon={Activity}
            trend={{ value: 8, direction: 'up' }}
            color="default"
          />
          <MetricCard
            title="Total Matches"
            value={metrics?.totalMatches.toLocaleString() || '---'}
            description="Matches recorded on platform"
            icon={BarChart3}
            trend={{ value: 15, direction: 'up' }}
            color="default"
          />
          <MetricCard
            title="System Health"
            value={`${metrics?.systemHealth || 0}%`}
            description="Overall platform performance"
            icon={Shield}
            color={metrics?.systemHealth && metrics.systemHealth > 95 ? 'success' : 'warning'}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Pending Verifications"
            value={metrics?.pendingVerifications || 0}
            description="Matches awaiting verification"
            icon={Clock}
            color={metrics?.pendingVerifications && metrics.pendingVerifications > 20 ? 'warning' : 'default'}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${(metrics?.revenue || 0).toLocaleString()}`}
            description="Current month earnings"
            icon={DollarSign}
            trend={{ value: 23, direction: 'up' }}
            color="success"
          />
          <MetricCard
            title="Server Uptime"
            value="99.9%"
            description="Last 30 days availability"
            icon={CheckCircle}
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Recent system notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mt-2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  metrics?.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        alert.type === 'error' ? 'bg-red-500' : 
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          {alert.urgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {alert.description}
                        </p>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Admin Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest administrative actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mt-2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  metrics?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{activity.action}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          by {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 
                                activity.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Activity className="h-6 w-6" />
                <span className="text-sm">Match Verification</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Settings className="h-6 w-6" />
                <span className="text-sm">System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;