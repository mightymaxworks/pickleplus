/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Facility manager dashboard with booking overview, revenue tracking and analytics
 * Priority 1: Basic Facility Dashboard
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  MapPin,
  Building2,
  Star,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import { format, subDays, startOfMonth } from "date-fns";

interface BookingSummary {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  todayBookings: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
  popularTimeSlots: Array<{ time: string; bookings: number }>;
  recentBookings: Array<{
    id: number;
    playerName: string;
    date: string;
    time: string;
    duration: number;
    amount: number;
    status: string;
  }>;
}

interface FacilityStats {
  courtUtilization: Array<{ court: number; utilization: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  bookingsByTime: Array<{ hour: number; bookings: number }>;
  customerSatisfaction: { rating: number; reviews: number };
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, change, changeLabel, icon, color = "text-primary" }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm flex items-center gap-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}% {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-primary/10 ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const FacilityManagerDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Fetch facility booking summary
  const { data: bookingSummary, isLoading: summaryLoading } = useQuery<BookingSummary>({
    queryKey: ['/api/facility-manager/summary', selectedTimeRange],
    queryFn: () => apiRequest(`/api/facility-manager/summary?range=${selectedTimeRange}`)
  });

  // Fetch detailed facility stats
  const { data: facilityStats, isLoading: statsLoading } = useQuery<FacilityStats>({
    queryKey: ['/api/facility-manager/stats', selectedTimeRange],
    queryFn: () => apiRequest(`/api/facility-manager/stats?range=${selectedTimeRange}`)
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      
      {/* Key Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Key Metrics</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTimeRange === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('today')}
            >
              Today
            </Button>
            <Button
              variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('week')}
            >
              This Week
            </Button>
            <Button
              variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('month')}
            >
              This Month
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(bookingSummary?.totalRevenue || 0)}
            change={15.2}
            changeLabel="from last period"
            icon={<DollarSign className="w-5 h-5" />}
            color="text-green-600"
          />
          <StatCard
            title="Total Bookings"
            value={bookingSummary?.totalBookings || 0}
            change={8.4}
            changeLabel="from last period"
            icon={<Calendar className="w-5 h-5" />}
            color="text-blue-600"
          />
          <StatCard
            title="Court Utilization"
            value={`${bookingSummary?.utilizationRate || 0}%`}
            change={3.1}
            changeLabel="utilization rate"
            icon={<BarChart3 className="w-5 h-5" />}
            color="text-purple-600"
          />
          <StatCard
            title="Average Rating"
            value={`${bookingSummary?.averageRating || 0}/5`}
            change={0.2}
            changeLabel="rating improvement"
            icon={<Star className="w-5 h-5" />}
            color="text-yellow-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="recent-bookings-list">
                  {bookingSummary?.recentBookings?.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.playerName}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.date), 'MMM d')} at {booking.time} • {booking.duration}min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(booking.amount)}</p>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4" data-testid="popular-timeslots">
                {bookingSummary?.popularTimeSlots?.map((slot, index) => (
                  <div key={slot.time}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{slot.time}</span>
                      <span className="text-sm text-gray-500">{slot.bookings} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(slot.bookings / (bookingSummary?.popularTimeSlots?.[0]?.bookings || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span>Block Time</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span>View Schedule</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span>Facility Settings</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Activity className="w-5 h-5" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      
      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart coming soon</p>
              <p className="text-sm text-gray-400">Integration with charts library in progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Court Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Court Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4" data-testid="court-utilization">
                {facilityStats?.courtUtilization?.map((court, index) => (
                  <div key={court.court}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Court {court.court}</span>
                      <span className="text-sm text-gray-500">{court.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          court.utilization > 80 ? 'bg-green-500' : 
                          court.utilization > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${court.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {facilityStats?.customerSatisfaction?.rating || 4.8}/5
              </div>
              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.floor(facilityStats?.customerSatisfaction?.rating || 4.8) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Based on {facilityStats?.customerSatisfaction?.reviews || 127} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <StandardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facility Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your facility operations and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalyticsTab()}
          </TabsContent>
        </Tabs>

      </div>
    </StandardLayout>
  );
};

export default FacilityManagerDashboard;