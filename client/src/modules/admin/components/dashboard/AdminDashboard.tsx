/**
 * PKL-278651-ADMIN-0011-DASH
 * Admin Dashboard Component
 * 
 * This component implements the main admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardTimePeriod } from "@shared/schema/admin/dashboard";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, DownloadIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminDashboard() {
  const [timePeriod, setTimePeriod] = useState<DashboardTimePeriod>(DashboardTimePeriod.MONTH);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
  // Format date for API in ISO string format
  const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return date.toISOString();
  };
  
  // Fetch dashboard data with performance optimizations
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/admin/dashboard', timePeriod, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async ({ queryKey }) => {
      const [_path, period, startDate, endDate] = queryKey;
      
      let url = `/api/admin/dashboard?timePeriod=${period}`;
      
      // Add custom date range if applicable
      if (period === DashboardTimePeriod.CUSTOM && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      console.log(`[PERF] Fetching dashboard data for period: ${period}`);
      const startTime = performance.now();
      
      // Use the enhanced apiRequest with caching support
      const response = await apiRequest('GET', url, undefined, { 
        cacheDuration: 60, // Cache for 60 seconds
        forceFresh: false  // Use cache if available
      });
      
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      console.log(`[PERF] Dashboard data fetched in ${duration.toFixed(2)}ms`);
      
      return data;
    },
    // Performance settings for the admin dashboard
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes 
    refetchOnWindowFocus: false
  });
  
  // Handle time period change
  const handleTimePeriodChange = (value: DashboardTimePeriod) => {
    setTimePeriod(value);
    
    // Clear custom dates when switching to predefined periods
    if (value !== DashboardTimePeriod.CUSTOM) {
      setStartDate(undefined);
      setEndDate(undefined);
    } else if (!startDate) {
      // Set default date range (last 30 days) when switching to custom period
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setStartDate(start);
      setEndDate(end);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dashboard Refreshed",
      description: "Dashboard data has been updated.",
    });
  };
  
  // Generate a downloadable JSON of the dashboard data
  const handleDownload = () => {
    if (!data) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `admin-dashboard-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Dashboard Downloaded",
      description: "Dashboard data has been downloaded as JSON.",
    });
  };
  
  // Format the last updated time
  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              data?.lastUpdated && `Last updated: ${formatLastUpdated(data.lastUpdated)}`
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DashboardTimePeriod.DAY}>Today</SelectItem>
              <SelectItem value={DashboardTimePeriod.WEEK}>This Week</SelectItem>
              <SelectItem value={DashboardTimePeriod.MONTH}>This Month</SelectItem>
              <SelectItem value={DashboardTimePeriod.QUARTER}>This Quarter</SelectItem>
              <SelectItem value={DashboardTimePeriod.YEAR}>This Year</SelectItem>
              <SelectItem value={DashboardTimePeriod.CUSTOM}>Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Custom date range pickers */}
          {timePeriod === DashboardTimePeriod.CUSTOM && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[140px] justify-start text-left text-xs"
                    size="sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    disabled={(date) => endDate ? date > endDate : false}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[140px] justify-start text-left text-xs"
                    size="sm"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleDownload} disabled={!data}>
            <DownloadIcon className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[120px] w-full rounded-md" />
          ))}
        </div>
      ) : data?.layout ? (
        <DashboardGrid dashboard={data.layout} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No dashboard data available</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
      
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{data.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Total Matches</h3>
            <p className="text-3xl font-bold">{data.totalMatches.toLocaleString()}</p>
          </div>
          <div className="bg-muted/40 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Total Events</h3>
            <p className="text-3xl font-bold">{data.totalEvents.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}