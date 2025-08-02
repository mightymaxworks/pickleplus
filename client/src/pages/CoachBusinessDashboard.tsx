/**
 * Coach Business Dashboard - Phase 2B: Advanced Business Intelligence
 * Comprehensive analytics and optimization tools for coaches
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Target, 
  Star, 
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  MessageSquare,
  Eye,
  UserPlus
} from 'lucide-react';

const CoachBusinessDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Fetch comprehensive business analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/coach/business/revenue-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/coach/business/revenue-analytics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch revenue analytics');
      return response.json();
    }
  });

  const { data: clientMetrics, isLoading: clientLoading } = useQuery({
    queryKey: ['/api/coach/business/client-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/coach/business/client-metrics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch client metrics');
      return response.json();
    }
  });

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['/api/coach/business/schedule-optimization'],
    queryFn: async () => {
      const response = await fetch('/api/coach/business/schedule-optimization', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schedule optimization');
      return response.json();
    }
  });

  const { data: marketingMetrics, isLoading: marketingLoading } = useQuery({
    queryKey: ['/api/coach/business/marketing-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/coach/business/marketing-metrics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch marketing metrics');
      return response.json();
    }
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ['/api/coach/business/performance-kpis'],
    queryFn: async () => {
      const response = await fetch('/api/coach/business/performance-kpis', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch performance KPIs');
      return response.json();
    }
  });

  const isLoading = revenueLoading || clientLoading || scheduleLoading || marketingLoading || kpiLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business analytics...</p>
        </div>
      </div>
    );
  }

  const revenue = revenueData?.data || {};
  const clients = clientMetrics?.data || {};
  const schedule = scheduleData?.data || {};
  const marketing = marketingMetrics?.data || {};
  const kpis = kpiData?.data || {};

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">Advanced analytics and optimization tools for your coaching business</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedTimeframe === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('week')}
          >
            Week
          </Button>
          <Button 
            variant={selectedTimeframe === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('month')}
          >
            Month
          </Button>
          <Button 
            variant={selectedTimeframe === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedTimeframe('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.monthlyRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{revenue.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {clients.newClientsThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Utilization</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedule.utilization?.toFixed(1) || 0}%</div>
            <Progress value={schedule.utilization || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.clientSatisfactionScore?.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">
              Average rating out of 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Comprehensive revenue tracking and projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">${revenue.monthlyRevenue?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Year</p>
                    <p className="text-2xl font-bold">${revenue.yearlyRevenue?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${revenue.totalEarnings?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Session Rate</p>
                    <p className="text-2xl font-bold">${revenue.averageSessionRate || 95}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>Revenue growth and trends analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Growth</span>
                    <Badge variant="default">+{revenue.revenueGrowth || 12.5}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sessions This Month</span>
                    <span className="font-medium">{revenue.sessionsThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Payouts</span>
                    <span className="font-medium">${revenue.pendingPayouts?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                
                {revenue.topEarningDays && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Top Earning Days</p>
                    <div className="flex flex-wrap gap-1">
                      {revenue.topEarningDays.map((day: string, index: number) => (
                        <Badge key={index} variant="outline">{day}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Analytics */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Overview
                </CardTitle>
                <CardDescription>Comprehensive client relationship metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold">{clients.totalClients || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">{clients.activeClients || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold">{clients.clientRetentionRate || 85}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Sessions/Client</p>
                    <p className="text-2xl font-bold">{clients.averageSessionsPerClient?.toFixed(1) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Clients
                </CardTitle>
                <CardDescription>Students with highest improvement rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.topPerformingClients?.map((client: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.sessions} sessions</p>
                      </div>
                      <Badge variant="default">+{client.improvement}% improvement</Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No client data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Optimization */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule Analysis
                </CardTitle>
                <CardDescription>Optimize your availability for maximum revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Utilization</span>
                    <span className="font-medium">{schedule.utilization?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={schedule.utilization || 0} className="w-full" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Peak Hours</p>
                  <div className="flex flex-wrap gap-1">
                    {schedule.peakHours?.map((hour: string, index: number) => (
                      <Badge key={index} variant="default">{hour}</Badge>
                    )) || <p className="text-sm text-muted-foreground">No peak hours data</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Low Demand Slots</p>
                  <div className="flex flex-wrap gap-1">
                    {schedule.lowDemandSlots?.map((slot: string, index: number) => (
                      <Badge key={index} variant="outline">{slot}</Badge>
                    )) || <p className="text-sm text-muted-foreground">No low demand data</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rate Optimization
                </CardTitle>
                <CardDescription>Suggested pricing adjustments for better revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedule.suggestedRateAdjustments?.map((adjustment: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm">{adjustment.timeSlot}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Current: </span>
                        <span className="line-through">${adjustment.currentRate}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Suggested: </span>
                        <span className="font-medium text-green-600">${adjustment.suggestedRate}</span>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No rate optimization data available</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketing Analytics */}
        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Marketing Performance
                </CardTitle>
                <CardDescription>Track your marketing efforts and conversion rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Views</p>
                    <p className="text-2xl font-bold">{marketing.profileViews || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inquiries</p>
                    <p className="text-2xl font-bold">{marketing.inquiries || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{marketing.conversionRate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold">{marketing.reviewMetrics?.averageRating?.toFixed(1) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Reviews
                </CardTitle>
                <CardDescription>Latest client feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketing.reviewMetrics?.recentReviews?.map((review: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recent reviews available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals & KPIs */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Goals
                </CardTitle>
                <CardDescription>Track your progress toward business objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpis.goals && Object.entries(kpis.goals).map(([key, goal]: [string, any]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} />
                    <p className="text-xs text-muted-foreground">
                      Progress: {goal.progress || Math.round((goal.current / goal.target) * 100)}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements & Recommendations
                </CardTitle>
                <CardDescription>Your accomplishments and growth opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {kpis.achievements?.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className={`h-5 w-5 ${achievement.earned ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No achievements data available</p>}

                {kpis.recommendations && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {kpis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-xs text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachBusinessDashboard;