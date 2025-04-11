/**
 * PKL-278651-ADMIN-0001-CORE
 * Admin Dashboard Page
 * 
 * Main dashboard for the admin functionality displaying registered admin dashboard cards
 */

import React from 'react';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { useAdminDashboardCards, useAdminQuickActions } from '@/modules/admin/hooks/useAdminComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Trophy, Calendar, Activity, BarChart2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const dashboardCards = useAdminDashboardCards();
  const quickActions = useAdminQuickActions();
  
  return (
    <AdminLayout title="Admin Dashboard">
      {/* Quick Actions Section */}
      {quickActions.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="flex items-center justify-center sm:justify-start w-full sm:w-auto h-14 sm:h-auto"
              >
                <span className="mr-2 flex-shrink-0">{action.icon}</span>
                <span className="text-xs sm:text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Dashboard Stats (These would be replaced by registered dashboard cards) */}
      {dashboardCards.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Default dashboard cards shown when no cards are registered */}
          <DashboardStatCard 
            title="Active Users" 
            value="2,849" 
            change="+12%" 
            description="Total active users" 
            icon={<Users className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
          
          <DashboardStatCard 
            title="Matches Recorded" 
            value="8,392" 
            change="+5%" 
            description="Total matches recorded" 
            icon={<Trophy className="text-amber-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
          
          <DashboardStatCard 
            title="Events This Month" 
            value="48" 
            change="+22%" 
            description="Scheduled events" 
            icon={<Calendar className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
          
          <DashboardStatCard 
            title="Active Tournaments" 
            value="12" 
            change="+3" 
            description="Currently running tournaments" 
            icon={<Trophy className="text-purple-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
          
          <DashboardStatCard 
            title="Average Session" 
            value="24m 32s" 
            change="+2m" 
            description="Time spent in app" 
            icon={<Clock className="text-indigo-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
          
          <DashboardStatCard 
            title="System Health" 
            value="99.8%" 
            change="+0.2%" 
            description="Overall system availability" 
            icon={<Activity className="text-emerald-500 h-4 w-4 sm:h-5 sm:w-5" />} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {dashboardCards.map((card) => {
            // Apply width styles based on the card's width property
            const widthClasses = {
              'full': 'col-span-1 sm:col-span-2 lg:col-span-3',
              'half': 'col-span-1 sm:col-span-2 lg:col-span-2',
              'third': 'col-span-1'
            };
            
            // Apply height styles based on the card's height property
            const heightClasses = {
              'small': 'h-auto',
              'medium': 'h-auto sm:h-40 md:h-48',
              'large': 'h-auto sm:h-60 md:h-80'
            };
            
            return (
              <div 
                key={card.id}
                className={`
                  ${card.width ? widthClasses[card.width] : widthClasses['third']} 
                  ${card.height ? heightClasses[card.height] : heightClasses['medium']}
                `}
              >
                <Card className="h-full">
                  <CardContent className="p-0 h-full">
                    <card.component />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Admin Activity Feed */}
      <div className="mt-6 sm:mt-8">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <BarChart2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#FF5722]" />
              Recent Admin Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest administrative actions in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {/* This would be populated from an API call */}
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                No recent activity to display. Activity will appear here when administrators make changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
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