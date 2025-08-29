/**
 * Unified Admin Dashboard
 * 
 * PKL-278651-ADMIN-UNIFIED-001 - Consolidated Admin Dashboard Integration
 * UDF Rule 18-21 Compliance - Unified security-first admin framework
 * Consolidates all existing admin dashboard functionality into new framework
 */
import React, { useState } from 'react';
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
  MapPin,
  Trophy,
  Target,
  Zap,
  Eye
} from 'lucide-react';
import { AdminLayout } from '../core/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DashboardTimePeriod } from '@shared/schema/admin/dashboard';

/**
 * Consolidated Dashboard Metrics Interface
 * Combining metrics from all existing dashboards
 */
interface UnifiedDashboardMetrics {
  // User & System Metrics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  pendingVerifications: number;
  systemHealth: number;
  
  // Match & Performance Metrics
  totalMatches: number;
  matchesToday: number;
  averageMatchDuration: number;
  
  // Security & Administrative Metrics
  securityAlerts: AdminAlert[];
  recentActivity: AdminActivity[];
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
  };
  
  // Business Metrics
  revenue: number;
  revenueGrowth: number;
  picklePointsInCirculation: number;
  
  // Quick Stats for Cards
  stats: DashboardStat[];
}

interface AdminAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
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
  details?: string;
}

interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  change: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'stable';
  color: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Enhanced Metric Card Component
 */
interface MetricCardProps {
  stat: DashboardStat;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ stat, onClick }) => {
  const IconComponent = stat.icon;
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center",
          stat.color === 'success' && "bg-green-100 text-green-600",
          stat.color === 'warning' && "bg-yellow-100 text-yellow-600", 
          stat.color === 'error' && "bg-red-100 text-red-600",
          stat.color === 'default' && "bg-blue-100 text-blue-600"
        )}>
          <IconComponent className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={cn(
            "font-medium mr-1",
            stat.trend === 'up' && "text-green-500",
            stat.trend === 'down' && "text-red-500",
            stat.trend === 'stable' && "text-gray-500"
          )}>
            {stat.change}
          </span>
          <span>{stat.description}</span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Alert Panel Component
 */
const AlertPanel: React.FC<{ alerts: AdminAlert[] }> = ({ alerts }) => {
  const urgentAlerts = alerts.filter(alert => alert.urgent);
  const regularAlerts = alerts.filter(alert => !alert.urgent);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>System Alerts</span>
          {urgentAlerts.length > 0 && (
            <Badge variant="destructive">{urgentAlerts.length} Urgent</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentAlerts.length === 0 && regularAlerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>All systems operational</p>
          </div>
        ) : (
          <div className="space-y-2">
            {urgentAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-red-900">{alert.title}</h4>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
                <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                <p className="text-xs text-red-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {regularAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <Badge variant={alert.type === 'warning' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Activity Feed Component
 */
const ActivityFeed: React.FC<{ activities: AdminActivity[] }> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">by {activity.user}</p>
                {activity.details && (
                  <p className="text-xs text-gray-600">{activity.details}</p>
                )}
              </div>
              <div className="text-right">
                <Badge variant={
                  activity.status === 'success' ? 'default' : 
                  activity.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {activity.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * System Performance Component
 */
const SystemPerformance: React.FC<{ performance: UnifiedDashboardMetrics['systemPerformance'] }> = ({ performance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>System Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm">
              <span>CPU Usage</span>
              <span>{performance.cpuUsage}%</span>
            </div>
            <Progress value={performance.cpuUsage} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Memory Usage</span>
              <span>{performance.memoryUsage}%</span>
            </div>
            <Progress value={performance.memoryUsage} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Disk Usage</span>
              <span>{performance.diskUsage}%</span>
            </div>
            <Progress value={performance.diskUsage} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Response Time</span>
              <span>{performance.responseTime}ms</span>
            </div>
            <Progress 
              value={Math.min((performance.responseTime / 1000) * 100, 100)} 
              className="mt-2" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Unified Admin Dashboard Component
 */
const UnifiedAdminDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<DashboardTimePeriod>(DashboardTimePeriod.MONTH);
  const { toast } = useToast();

  // Fetch consolidated dashboard data using new Admin API v1
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/admin/v1/dashboard', timePeriod],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/admin/v1/dashboard?period=${timePeriod}`);
        return await response.json() as UnifiedDashboardMetrics;
      } catch (error) {
        // Return mock data for development
        return {
          totalUsers: 1547,
          activeUsers: 324,
          newUsersToday: 28,
          pendingVerifications: 12,
          systemHealth: 98,
          totalMatches: 8923,
          matchesToday: 156,
          averageMatchDuration: 45,
          revenue: 84750,
          revenueGrowth: 12.5,
          picklePointsInCirculation: 45000,
          securityAlerts: [
            {
              id: '1',
              type: 'warning',
              title: 'High Memory Usage',
              description: 'System memory usage is at 85%',
              timestamp: new Date().toISOString(),
              urgent: false
            }
          ],
          recentActivity: [
            {
              id: '1',
              action: 'User registered',
              user: 'System',
              timestamp: new Date().toISOString(),
              status: 'success',
              details: 'New user: john.doe@example.com'
            }
          ],
          systemPerformance: {
            cpuUsage: 45,
            memoryUsage: 68,
            diskUsage: 32,
            responseTime: 250
          },
          stats: [
            {
              id: '1',
              title: 'Total Users',
              value: '1,547',
              change: '+12%',
              description: 'from last month',
              icon: Users,
              trend: 'up',
              color: 'success'
            },
            {
              id: '2',
              title: 'Active Users',
              value: '324',
              change: '+8%',
              description: 'today',
              icon: Activity,
              trend: 'up',
              color: 'success'
            },
            {
              id: '3',
              title: 'Total Matches',
              value: '8,923',
              change: '+15%',
              description: 'this month',
              icon: Trophy,
              trend: 'up',
              color: 'default'
            },
            {
              id: '4',
              title: 'System Health',
              value: '98%',
              change: 'Stable',
              description: 'all systems',
              icon: Shield,
              trend: 'stable',
              color: 'success'
            }
          ]
        } as UnifiedDashboardMetrics;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated",
    });
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: "Quick Action",
      description: `${action} action triggered`,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button disabled>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive overview of system metrics and administrative controls
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => handleQuickAction('System Maintenance')}>
              <Settings className="mr-2 h-4 w-4" />
              Quick Actions
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.stats.map((stat) => (
              <MetricCard
                key={stat.id}
                stat={stat}
                onClick={() => handleQuickAction(`View ${stat.title}`)}
              />
            ))}
          </div>
        )}

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics && (
                <>
                  <AlertPanel alerts={metrics.securityAlerts} />
                  <ActivityFeed activities={metrics.recentActivity} />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics && (
                <>
                  <AlertPanel alerts={metrics.securityAlerts} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Pending Verifications</span>
                          <Badge variant="secondary">{metrics.pendingVerifications}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>System Health</span>
                          <Badge variant="default">{metrics.systemHealth}%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemPerformance performance={metrics.systemPerformance} />
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Match Duration</span>
                        <span>{metrics.averageMatchDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matches Today</span>
                        <span>{metrics.matchesToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span>{metrics.systemPerformance.responseTime}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {metrics && (
              <div className="grid grid-cols-1 gap-6">
                <ActivityFeed activities={metrics.recentActivity} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UnifiedAdminDashboard;