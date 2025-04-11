/**
 * PKL-278651-ADMIN-0012-PERF
 * Dashboard Cache Warmer Component
 * 
 * This component proactively warms the cache for dashboard data
 * to provide a better user experience when users navigate to the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardTimePeriod } from '@shared/schema/admin/dashboard';

/**
 * Dashboard Cache Warmer
 * This invisible component pre-fetches dashboard data to keep the cache warm
 */
export function DashboardCacheWarmer() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Pre-fetch dashboard data for common time periods
    const timePeriods = [
      DashboardTimePeriod.DAY,
      DashboardTimePeriod.WEEK,
      DashboardTimePeriod.MONTH
    ];
    
    const warmCache = async () => {
      console.log('[CacheWarmer] Warming dashboard cache...');
      
      // Pre-fetch dashboard data for each time period
      for (const period of timePeriods) {
        await queryClient.prefetchQuery({
          queryKey: ['/api/admin/dashboard', { timePeriod: period }],
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
        
        console.log(`[CacheWarmer] Pre-fetched dashboard data for ${period}`);
      }
      
      console.log('[CacheWarmer] Dashboard cache warming complete');
    };
    
    // Warm the cache immediately
    warmCache();
    
    // Set up interval to refresh the cache periodically (every 5 minutes)
    const intervalId = setInterval(warmCache, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [queryClient]);
  
  // This component doesn't render anything
  return null;
}

/**
 * System Metrics Cache Warmer
 * Pre-fetches system metrics data to keep that specific cache warm
 */
export function SystemMetricsCacheWarmer() {
  // Pre-fetch system metrics
  const { refetch } = useQuery({
    queryKey: ['/api/admin/dashboard/metrics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  useEffect(() => {
    console.log('[CacheWarmer] Warming system metrics cache...');
    
    const warmMetricsCache = async () => {
      await refetch();
      console.log('[CacheWarmer] System metrics cache refreshed');
    };
    
    // Warm the cache immediately
    warmMetricsCache();
    
    // Set up interval to refresh the cache periodically (every 5 minutes)
    const intervalId = setInterval(warmMetricsCache, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  // This component doesn't render anything
  return null;
}

/**
 * Dashboard Widgets Cache Warmer
 * Pre-fetches dashboard widgets data to keep that specific cache warm
 */
export function DashboardWidgetsCacheWarmer() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Pre-fetch dashboard widgets for common time periods
    const timePeriods = [
      DashboardTimePeriod.DAY,
      DashboardTimePeriod.WEEK,
      DashboardTimePeriod.MONTH
    ];
    
    const warmWidgetsCache = async () => {
      console.log('[CacheWarmer] Warming dashboard widgets cache...');
      
      // Pre-fetch widgets for each time period
      for (const period of timePeriods) {
        await queryClient.prefetchQuery({
          queryKey: ['/api/admin/dashboard/widgets', { timePeriod: period }],
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
        
        console.log(`[CacheWarmer] Pre-fetched dashboard widgets for ${period}`);
      }
      
      console.log('[CacheWarmer] Dashboard widgets cache warming complete');
    };
    
    // Warm the cache immediately
    warmWidgetsCache();
    
    // Set up interval to refresh the cache periodically (every 5 minutes)
    const intervalId = setInterval(warmWidgetsCache, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [queryClient]);
  
  // This component doesn't render anything
  return null;
}

/**
 * Combined CacheWarmer component that includes all cache warming strategies
 */
export default function CacheWarmer() {
  return (
    <>
      <DashboardCacheWarmer />
      <SystemMetricsCacheWarmer />
      <DashboardWidgetsCacheWarmer />
    </>
  );
}