/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Facility manager dashboard with booking overview, revenue tracking and analytics
 * Priority 1: Basic Facility Dashboard
 */

import React, { useState } from 'react';
import { MobilePage, SectionCard, ResponsiveGrid, DataListItem } from '@/components/mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Plus,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { format } from "date-fns";

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

const MobileStatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: string;
  testId?: string;
}> = ({ title, value, change, changeLabel, icon, color = "text-primary", testId }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
      <p className="text-xl font-bold text-gray-900" data-testid={testId}>{value}</p>
      {change !== undefined && (
        <p className={`text-xs flex items-center gap-1 mt-1 ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}% {changeLabel}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-full bg-primary/10 flex-shrink-0 ml-3 ${color}`}>
      {icon}
    </div>
  </div>
);

const FacilityManagerDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Handle button clicks with coming soon functionality
  const handleAddBooking = () => {
    alert('Add Booking feature coming soon! This will open a booking form to schedule new court reservations.');
  };

  const handleSettings = () => {
    alert('Facility Settings coming soon! This will open facility configuration options.');
  };

  const handleBlockTimeSlot = () => {
    alert('Block Time Slot feature coming soon! This will allow you to mark time slots as unavailable.');
  };

  const handleViewSchedule = () => {
    alert('View Schedule feature coming soon! This will show the full facility schedule.');
  };

  const handleViewReports = () => {
    alert('View Reports feature coming soon! This will display detailed analytics and reports.');
  };

  // Fetch facility booking summary
  const { data: bookingSummary, isLoading: summaryLoading } = useQuery<BookingSummary>({
    queryKey: ['/api/facility-manager/summary', selectedTimeRange],
    queryFn: async () => {
      const response = await apiRequest(`/api/facility-manager/summary?range=${selectedTimeRange}`);
      return await response.json();
    }
  });

  // Fetch detailed facility stats
  const { data: facilityStats, isLoading: statsLoading } = useQuery<FacilityStats>({
    queryKey: ['/api/facility-manager/stats', selectedTimeRange],
    queryFn: async () => {
      const response = await apiRequest(`/api/facility-manager/stats?range=${selectedTimeRange}`);
      return await response.json();
    }
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const renderTimeRangeFilter = () => (
    <div className="flex overflow-x-auto gap-2 pb-2">
      <Button
        variant={selectedTimeRange === 'today' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedTimeRange('today')}
        className="whitespace-nowrap min-w-[80px] min-h-[44px]"
        data-testid="button-range-today"
      >
        Today
      </Button>
      <Button
        variant={selectedTimeRange === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedTimeRange('week')}
        className="whitespace-nowrap min-w-[80px] min-h-[44px]"
        data-testid="button-range-week"
      >
        Week
      </Button>
      <Button
        variant={selectedTimeRange === 'month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedTimeRange('month')}
        className="whitespace-nowrap min-w-[80px] min-h-[44px]"
        data-testid="button-range-month"
      >
        Month
      </Button>
    </div>
  );

  const renderKeyMetrics = () => (
    <SectionCard 
      title="Key Metrics" 
      actions={renderTimeRangeFilter()}
    >
      <ResponsiveGrid colsSm={1} colsMd={2} gap="sm">
        <MobileStatCard
          title="Total Revenue"
          value={formatCurrency(bookingSummary?.totalRevenue || 0)}
          change={15.2}
          changeLabel="from last period"
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-600"
          testId="text-metric-revenue"
        />
        <MobileStatCard
          title="Total Bookings"
          value={bookingSummary?.totalBookings || 0}
          change={8.4}
          changeLabel="from last period"
          icon={<Calendar className="w-5 h-5" />}
          color="text-blue-600"
          testId="text-metric-bookings"
        />
        <MobileStatCard
          title="Court Utilization"
          value={`${bookingSummary?.utilizationRate || 0}%`}
          change={3.1}
          changeLabel="utilization rate"
          icon={<BarChart3 className="w-5 h-5" />}
          color="text-purple-600"
          testId="text-metric-utilization"
        />
        <MobileStatCard
          title="Average Rating"
          value={`${bookingSummary?.averageRating || 0}/5`}
          change={0.2}
          changeLabel="rating improvement"
          icon={<Star className="w-5 h-5" />}
          color="text-yellow-600"
          testId="text-metric-rating"
        />
      </ResponsiveGrid>
    </SectionCard>

  );

  const renderRecentBookings = () => (
    <SectionCard 
      title="Recent Bookings" 
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          className="min-h-[44px] min-w-[44px]"
          data-testid="button-view-all-bookings"
        >
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>
      }
    >
      {summaryLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-3 rounded-lg">
              <div className="rounded-full bg-gray-200 h-10 w-10 flex-shrink-0"></div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16 flex-shrink-0"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-testid="recent-bookings-list">
          {bookingSummary?.recentBookings?.map((booking) => (
            <div key={booking.id} data-testid={`row-booking-${booking.id}`}>
              <DataListItem
                icon={<Users className="w-5 h-5 text-primary" />}
                title={booking.playerName}
                subtitle={`${format(new Date(booking.date), 'MMM d')} at ${booking.time} • ${booking.duration}min`}
                value={formatCurrency(booking.amount)}
                badge={
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className="text-xs"
                    data-testid={`badge-status-${booking.status}`}
                  >
                    {booking.status}
                  </Badge>
                }
              />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );

  const renderPopularTimeSlots = () => (
    <SectionCard title="Popular Time Slots">
      {summaryLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
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
          {bookingSummary?.popularTimeSlots?.slice(0, 4).map((slot) => (
            <div key={slot.time} data-testid={`row-timeslot-${slot.time.replace(':', '-')}`}>
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
    </SectionCard>

  );

  const renderQuickActions = () => (
    <SectionCard 
      title="Quick Actions"
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] min-w-[44px]"
              data-testid="trigger-quick-actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-block-time-slot" onClick={handleBlockTimeSlot}>
              <Plus className="w-4 h-4" />
              Block Time Slot
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-view-schedule" onClick={handleViewSchedule}>
              <Calendar className="w-4 h-4" />
              View Schedule
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-facility-settings" onClick={handleSettings}>
              <Settings className="w-4 h-4" />
              Facility Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" data-testid="menu-view-reports" onClick={handleViewReports}>
              <Activity className="w-4 h-4" />
              View Reports
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <ResponsiveGrid colsSm={2} colsMd={2} gap="sm">
        <Button 
          variant="outline" 
          className="h-16 flex-col gap-2 min-h-[64px]"
          data-testid="button-quick-add-booking"
          onClick={handleAddBooking}
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Booking</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col gap-2 min-h-[64px]"
          data-testid="button-quick-schedule"
          onClick={handleViewSchedule}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm">Schedule</span>
        </Button>
      </ResponsiveGrid>
    </SectionCard>
  );

  const renderAnalytics = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="analytics">
        <AccordionTrigger 
          className="text-base font-medium min-h-[44px]"
          data-testid="accordion-analytics"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics & Reports
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Revenue Analytics */}
          <SectionCard title="Revenue Analytics">
            <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Revenue chart coming soon</p>
              </div>
            </div>
          </SectionCard>

          {/* Court Utilization */}
          <SectionCard title="Court Utilization">
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3" data-testid="court-utilization">
                {facilityStats?.courtUtilization?.slice(0, 3).map((court) => (
                  <div key={court.court} data-testid={`row-court-${court.court}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Court {court.court}</span>
                      <span className="text-sm text-gray-500">{court.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
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
          </SectionCard>

          {/* Customer Satisfaction */}
          <SectionCard title="Customer Satisfaction">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {facilityStats?.customerSatisfaction?.rating || 4.8}/5
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(facilityStats?.customerSatisfaction?.rating || 4.8) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {facilityStats?.customerSatisfaction?.reviews || 127} reviews
              </p>
            </div>
          </SectionCard>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <MobilePage 
      title="Facility Dashboard"
      stickyActions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px]"
            data-testid="button-sticky-settings"
            onClick={handleSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            className="flex-1 min-h-[44px] bg-primary hover:bg-primary/90"
            data-testid="button-sticky-add-booking"
            onClick={handleAddBooking}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Booking
          </Button>
        </div>
      }
    >
      {/* Key Metrics */}
      {renderKeyMetrics()}
      
      {/* Recent Activity */}
      {renderRecentBookings()}
      
      {/* Popular Time Slots */}
      {renderPopularTimeSlots()}
      
      {/* Quick Actions */}
      {renderQuickActions()}
      
      {/* Analytics - Collapsible */}
      {renderAnalytics()}
    </MobilePage>
  );
};

export default FacilityManagerDashboard;