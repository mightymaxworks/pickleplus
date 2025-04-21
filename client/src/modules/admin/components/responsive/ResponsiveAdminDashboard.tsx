/**
 * PKL-278651-ADMIN-0011-DASH
 * Responsive Admin Dashboard Component
 * 
 * This component implements a mobile-optimized version of the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  DashboardTimePeriod, 
  DashboardMetricCategory,
  DashboardWidget,
  DashboardWidgetType,
  MetricCardWidget,
  ChartWidget,
  TableWidget,
  AlertWidget,
  ActionCardWidget
} from "@shared/schema/admin/dashboard";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, ChevronDown, Users, Activity, Calendar as CalendarIcon, BarChart2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "../dashboard/MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getResponsivePadding, useIsMobile } from "../../utils/deviceDetection";

export default function ResponsiveAdminDashboard() {
  const [timePeriod, setTimePeriod] = useState<DashboardTimePeriod>(DashboardTimePeriod.MONTH);
  const [selectedCategory, setSelectedCategory] = useState<DashboardMetricCategory | 'all'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDatePickers, setShowDatePickers] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const padding = getResponsivePadding(isMobile ? 0 : 1);
  
  // Define dashboard data interface
  interface DashboardData {
    layout: {
      widgets: DashboardWidget[];
    };
    totalUsers: number;
    totalMatches: number;
    totalEvents: number;
    lastUpdated: string;
  }
  
  // Format date for API in YYYY-MM-DD format
  const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return format(date, 'yyyy-MM-dd');
  };
  
  // Fetch dashboard data with proper type and performance optimizations
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData, Error>({
    queryKey: ['/api/admin/dashboard', timePeriod, startDate, endDate],
    queryFn: async ({ queryKey }) => {
      const [_path, period, startDate, endDate] = queryKey as [string, DashboardTimePeriod, Date | undefined, Date | undefined];
      
      let url = `/api/admin/dashboard?timePeriod=${period}&nocache=true`;
      
      // Add start and end dates for custom period
      if (period === DashboardTimePeriod.CUSTOM) {
        const formattedStartDate = formatDateForAPI(startDate as Date);
        const formattedEndDate = formatDateForAPI(endDate as Date);
        
        if (!formattedStartDate || !formattedEndDate) {
          throw new Error('Start and end dates are required for custom time period');
        }
        
        url += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }
      
      console.log(`[PERF][Mobile] Fetching dashboard data for period: ${period} (with nocache=true)`);
      const startTime = performance.now();
      
      // Force fresh data with the nocache parameter
      const response = await apiRequest('GET', url, undefined, {
        cacheDuration: 0, // Don't cache
        forceFresh: true  // Always get fresh data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Dashboard data fetch failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      console.log(`[PERF][Mobile] Dashboard data fetched in ${duration.toFixed(2)}ms`);
      
      // Debug logging for dashboard data
      console.log('[DEBUG] Dashboard data response:', data);
      if (data.totalUsers !== undefined) {
        console.log('[DEBUG] Total users:', data.totalUsers, 'type:', typeof data.totalUsers);
      }
      if (data.totalMatches !== undefined) {
        console.log('[DEBUG] Total matches:', data.totalMatches, 'type:', typeof data.totalMatches);
      }
      if (data.totalEvents !== undefined) {
        console.log('[DEBUG] Total events:', data.totalEvents, 'type:', typeof data.totalEvents);
      }
      
      return data;
    },
    // Performance optimized settings for mobile
    staleTime: 3 * 60 * 1000, // Consider fresh for 3 minutes (longer for mobile to reduce battery usage)
    gcTime: 15 * 60 * 1000,   // Keep in cache for 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: !(timePeriod === DashboardTimePeriod.CUSTOM && (!startDate || !endDate)), // Only enable when appropriate dates are set
  });
  
  // Handle time period change
  const handleTimePeriodChange = (value: DashboardTimePeriod) => {
    setTimePeriod(value);
    
    // Handle custom date range selection
    if (value === DashboardTimePeriod.CUSTOM) {
      setShowDatePickers(true);
      // Set default date range (last 30 days) if no dates are selected
      if (!startDate) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setStartDate(start);
        setEndDate(end);
      }
    } else {
      setShowDatePickers(false);
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as DashboardMetricCategory | 'all');
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "Dashboard data has been updated.",
    });
  };
  
  // Get icon for category
  const getCategoryIcon = (category: DashboardMetricCategory) => {
    switch (category) {
      case DashboardMetricCategory.USER:
        return <Users className="h-4 w-4 mr-2" />;
      case DashboardMetricCategory.MATCH:
        return <Activity className="h-4 w-4 mr-2" />;
      case DashboardMetricCategory.EVENT:
        return <Calendar className="h-4 w-4 mr-2" />;
      case DashboardMetricCategory.ENGAGEMENT:
        return <BarChart2 className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  // Filter widgets by category
  const getFilteredWidgets = () => {
    if (!data?.layout?.widgets) return [];
    
    if (selectedCategory === 'all') {
      return data.layout.widgets;
    }
    
    return data.layout.widgets.filter((widget: DashboardWidget) => widget.category === selectedCategory);
  };
  
  if (isError) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md">
        <h2 className="font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button variant="destructive" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${padding}`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Mobile-optimized view</p>
      </div>
      
      <div className="flex justify-between items-center gap-2">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center">
                All Categories
              </div>
            </SelectItem>
            <SelectItem value={DashboardMetricCategory.USER}>
              <div className="flex items-center">
                {getCategoryIcon(DashboardMetricCategory.USER)}
                Users
              </div>
            </SelectItem>
            <SelectItem value={DashboardMetricCategory.MATCH}>
              <div className="flex items-center">
                {getCategoryIcon(DashboardMetricCategory.MATCH)}
                Matches
              </div>
            </SelectItem>
            <SelectItem value={DashboardMetricCategory.EVENT}>
              <div className="flex items-center">
                {getCategoryIcon(DashboardMetricCategory.EVENT)}
                Events
              </div>
            </SelectItem>
            <SelectItem value={DashboardMetricCategory.ENGAGEMENT}>
              <div className="flex items-center">
                {getCategoryIcon(DashboardMetricCategory.ENGAGEMENT)}
                Engagement
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DashboardTimePeriod.DAY}>Day</SelectItem>
              <SelectItem value={DashboardTimePeriod.WEEK}>Week</SelectItem>
              <SelectItem value={DashboardTimePeriod.MONTH}>Month</SelectItem>
              <SelectItem value={DashboardTimePeriod.QUARTER}>Quarter</SelectItem>
              <SelectItem value={DashboardTimePeriod.YEAR}>Year</SelectItem>
              <SelectItem value={DashboardTimePeriod.CUSTOM}>Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Custom date range pickers */}
      {showDatePickers && (
        <div className="flex flex-col space-y-2 mt-3 border rounded-md p-3 bg-card">
          <h3 className="text-sm font-medium mb-2">Custom Date Range</h3>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Start Date</span>
              <div className="border p-3 rounded-md">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      toast({
                        title: "Start Date Selected",
                        description: `Start date set to ${format(date, "MMM d, yyyy")}`,
                      });
                    }
                  }}
                  className="rounded-md border"
                  initialFocus={false}
                  disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-1 mt-4">
              <span className="text-xs text-muted-foreground">End Date</span>
              <div className="border p-3 rounded-md">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(date);
                      toast({
                        title: "End Date Selected",
                        description: `End date set to ${format(date, "MMM d, yyyy")}`,
                      });
                    }
                  }}
                  className="rounded-md border"
                  initialFocus={false}
                  disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                />
              </div>
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="mt-2" 
            onClick={() => {
              if (startDate && endDate) {
                // Make sure we refetch with the updated dates
                const urlParams = new URLSearchParams();
                urlParams.set('timePeriod', DashboardTimePeriod.CUSTOM);
                urlParams.set('startDate', format(startDate, 'yyyy-MM-dd'));
                urlParams.set('endDate', format(endDate, 'yyyy-MM-dd'));
                
                // Force a refetch with updated query parameters
                refetch();
                
                toast({
                  title: "Custom Range Applied",
                  description: `Data updated for period ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}`,
                });
              } else {
                toast({
                  variant: "destructive",
                  title: "Missing Dates",
                  description: "Please select both start and end dates.",
                });
              }
            }}
          >
            Apply Date Range
          </Button>
        </div>
      )}
      
      {/* Summary cards at the top */}
      {data && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Card className="bg-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-medium">Users</CardTitle>
              </div>
              <p className="text-xl font-bold mt-1">
                {data.totalUsers !== undefined ? data.totalUsers.toLocaleString() : "—"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-medium">Matches</CardTitle>
              </div>
              <p className="text-xl font-bold mt-1">
                {data.totalMatches !== undefined ? data.totalMatches.toLocaleString() : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Main content */}
      {isLoading ? (
        <div className="space-y-4 mt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[120px] w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-4 mt-2">
          {/* First display metric cards */}
          {getFilteredWidgets()
            .filter((widget: DashboardWidget) => widget.widgetType === DashboardWidgetType.METRIC_CARD)
            .map((widget: DashboardWidget) => {
              // Use proper type narrowing for TypeScript
              if (widget.widgetType === DashboardWidgetType.METRIC_CARD) {
                return (
                  <div key={widget.id}>
                    <MetricCard metric={widget.metric} />
                  </div>
                );
              }
              return null;
            })}
            
          {/* Then display other widgets in an accordion */}
          {selectedCategory === 'all' && (
            <Accordion type="single" collapsible className="w-full">
              {Object.values(DashboardMetricCategory).map(category => {
                const categoryWidgets = data?.layout?.widgets?.filter(
                  (w: DashboardWidget) => w.category === category && w.widgetType !== DashboardWidgetType.METRIC_CARD
                ) || [];
                
                if (!categoryWidgets || categoryWidgets.length === 0) return null;
                
                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-4 pt-2">
                        {categoryWidgets.map((widget: DashboardWidget) => (
                          <div key={widget.id} className="border rounded-md shadow-sm bg-card p-3">
                            <h3 className="font-medium mb-2 text-sm">{widget.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {widget.widgetType === DashboardWidgetType.CHART && "Chart data available on desktop view"}
                              {widget.widgetType === DashboardWidgetType.TABLE && "Table data available on desktop view"}
                              {widget.widgetType === DashboardWidgetType.ACTION_CARD && "Quick actions available on desktop view"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}