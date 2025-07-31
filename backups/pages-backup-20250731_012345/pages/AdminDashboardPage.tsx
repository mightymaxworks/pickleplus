/**
 * PKL-278651-ADMIN-0012-PERF
 * Admin Dashboard Page with Performance Optimizations
 * 
 * Main dashboard for the admin functionality displaying registered admin dashboard cards.
 * This page implements the responsive approach to render different layouts based on device type.
 * Includes performance optimizations as part of PKL-278651-ADMIN-0012-PERF sprint.
 */

import React from 'react';
import ResponsiveAdminDashboard from '@/modules/admin/components/responsive/ResponsiveAdminDashboard';
import { useAdminDashboardCards, useAdminQuickActions } from '@/modules/admin/hooks/useAdminComponents';
import CacheWarmer from '@/modules/admin/components/performance/CacheWarmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Trophy, Calendar, Activity, BarChart2 } from 'lucide-react';

export default function AdminDashboardPage() {
  // These hooks will be used by the desktop version rendered via AdminLayout
  const dashboardCards = useAdminDashboardCards();
  const quickActions = useAdminQuickActions();
  
  return (
    <>
      {/* The CacheWarmer component proactively warms the cache for dashboard data */}
      <CacheWarmer />
      
      {/* Use the responsive component which will render either mobile or desktop version */}
      <ResponsiveAdminDashboard />
    </>
  );
}

interface DashboardStatCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
}

function DashboardStatCard({ title, value, change, description, icon }: DashboardStatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <p className="text-xs flex flex-wrap sm:flex-nowrap items-center mt-1">
          <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} font-medium mr-1`}>
            {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs">
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}