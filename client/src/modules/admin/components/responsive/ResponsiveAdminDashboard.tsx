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
import { RefreshCw, ChevronDown, Users, Activity, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "../dashboard/MetricCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  
  // Fetch dashboard data with proper type
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard', timePeriod],
    queryFn: async ({ queryKey }) => {
      const [_path, period] = queryKey as [string, DashboardTimePeriod];
      const response = await apiRequest(`/api/admin/dashboard?timePeriod=${period}`);
      return response.json();
    },
  });
  
  // Handle time period change
  const handleTimePeriodChange = (value: DashboardTimePeriod) => {
    setTimePeriod(value);
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
    if (!data?.layout) return [];
    
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
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary cards at the top */}
      {data && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Card className="bg-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-medium">Users</CardTitle>
              </div>
              <p className="text-xl font-bold mt-1">{data.totalUsers.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-medium">Matches</CardTitle>
              </div>
              <p className="text-xl font-bold mt-1">{data.totalMatches.toLocaleString()}</p>
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
                const categoryWidgets = data?.layout.widgets.filter(
                  (w: DashboardWidget) => w.category === category && w.widgetType !== DashboardWidgetType.METRIC_CARD
                );
                
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