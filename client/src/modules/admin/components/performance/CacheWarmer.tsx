/**
 * PKL-278651-ADMIN-0012-PERF
 * Dashboard Cache Warmer Component
 * 
 * This component proactively warms the cache for dashboard data
 * to provide a better user experience when users navigate to the admin dashboard.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardTimePeriod } from "@shared/schema/admin/dashboard";
import { apiRequest } from "@/lib/queryClient";

// Cache warming intervals in milliseconds
const CACHE_WARMING_INTERVALS = {
  HIGH_PRIORITY: 5 * 60 * 1000,   // 5 minutes
  MEDIUM_PRIORITY: 15 * 60 * 1000, // 15 minutes
  LOW_PRIORITY: 30 * 60 * 1000    // 30 minutes
};

// The pre-warmed time periods (most common used by users)
const PREWARMED_TIME_PERIODS = [
  DashboardTimePeriod.DAY,
  DashboardTimePeriod.WEEK,
  DashboardTimePeriod.MONTH
];

/**
 * Dashboard Cache Warmer
 * This invisible component pre-fetches dashboard data to keep the cache warm
 */
export function DashboardCacheWarmer() {
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of warm-up completion status
  const warmupCompletedRef = useRef<Record<DashboardTimePeriod, boolean>>({
    [DashboardTimePeriod.DAY]: false,
    [DashboardTimePeriod.WEEK]: false,
    [DashboardTimePeriod.MONTH]: false,
    [DashboardTimePeriod.QUARTER]: false,
    [DashboardTimePeriod.YEAR]: false,
    [DashboardTimePeriod.CUSTOM]: false,
  });

  // Cache warming function
  const warmCache = async () => {
    console.log("[PERF] Running dashboard cache warming cycle...");
    const startTime = performance.now();

    for (const period of PREWARMED_TIME_PERIODS) {
      if (!warmupCompletedRef.current[period]) {
        try {
          const url = `/api/admin/dashboard?timePeriod=${period}`;
          console.log(`[PERF] Pre-warming cache for ${period} dashboard data...`);
          
          // Use the enhanced apiRequest with caching support
          const response = await apiRequest('GET', url, undefined, { cacheDuration: 120 });
          const data = await response.json();
          
          // Update the query cache with this data
          queryClient.setQueryData(['/api/admin/dashboard', period], data);
          
          // Mark this period as completed
          warmupCompletedRef.current[period] = true;
          console.log(`[PERF] Successfully pre-warmed cache for ${period} dashboard data`);
        } catch (error) {
          console.error(`[PERF] Error pre-warming cache for ${period} dashboard:`, error);
        }
      }
    }
    
    const duration = performance.now() - startTime;
    console.log(`[PERF] Cache warming cycle completed in ${duration.toFixed(2)}ms`);
  };

  useEffect(() => {
    // Initial cache warming when component mounts
    warmCache();
    
    // Set up interval for periodic cache warming
    timerRef.current = setInterval(() => {
      // For each warm-up cycle, reset completion status for all periods
      // This ensures the cache stays fresh
      Object.keys(warmupCompletedRef.current).forEach(key => {
        warmupCompletedRef.current[key as DashboardTimePeriod] = false;
      });
      
      warmCache();
    }, CACHE_WARMING_INTERVALS.MEDIUM_PRIORITY);
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * System Metrics Cache Warmer
 * Pre-fetches system metrics data to keep that specific cache warm
 */
export function SystemMetricsCacheWarmer() {
  const queryClient = useQueryClient();
  
  // Fetch and cache system metrics on component mount
  useQuery({
    queryKey: ['/api/admin/system-metrics'],
    queryFn: async () => {
      console.log("[PERF] Pre-warming system metrics cache...");
      const startTime = performance.now();
      
      try {
        const response = await apiRequest('GET', '/api/admin/system-metrics', undefined, { 
          cacheDuration: 120
        });
        
        const data = await response.json();
        
        const duration = performance.now() - startTime;
        console.log(`[PERF] System metrics cache warmed in ${duration.toFixed(2)}ms`);
        
        return data;
      } catch (error) {
        console.error("[PERF] Failed to pre-warm system metrics:", error);
        throw error;
      }
    },
    // Only fetch once and keep in cache for a long time
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false
  });
  
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
    </>
  );
}