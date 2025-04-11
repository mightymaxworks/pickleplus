/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Mobile-Optimized Admin Dashboard
 * 
 * This component provides a streamlined administrative dashboard optimized for mobile devices.
 * It focuses on essential administrative functions and task-oriented grouping.
 */

import React from 'react';
import { useLocation } from 'wouter';
import { useAdminDashboardCards, useAdminQuickActions } from '@/modules/admin/hooks/useAdminComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  Settings,
  Clock,
  Activity,
  BarChart2,
  Shield
} from 'lucide-react';

export default function AdminDashboardMobile() {
  const dashboardCards = useAdminDashboardCards();
  const quickActions = useAdminQuickActions();
  const [, navigate] = useLocation();
  
  return (
    <div className="space-y-4 pb-20">
      {/* Admin Header with shield icon */}
      <div className="flex items-center mb-4">
        <Shield className="text-[#FF5722] mr-2 h-5 w-5" />
        <h1 className="text-lg font-bold">Admin Dashboard</h1>
      </div>
      
      {/* Quick Action Tabs - Mobile-optimized with icons */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="actions" className="flex flex-col items-center py-2">
            <LayoutDashboard className="h-4 w-4 mb-1" />
            <span className="text-xs">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex flex-col items-center py-2">
            <BarChart2 className="h-4 w-4 mb-1" />
            <span className="text-xs">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex flex-col items-center py-2">
            <Activity className="h-4 w-4 mb-1" />
            <span className="text-xs">Activity</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription className="text-xs">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.length > 0 ? (
                  quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={action.onClick}
                      className="flex flex-col items-center justify-center h-20 text-center"
                    >
                      <span className="mb-2">{action.icon}</span>
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))
                ) : (
                  <>
                    <ActionButton 
                      icon={<Users className="h-4 w-4 text-blue-500" />} 
                      label="Users" 
                      onClick={() => navigate('/admin/users')} 
                    />
                    <ActionButton 
                      icon={<Calendar className="h-4 w-4 text-green-500" />} 
                      label="Events" 
                      onClick={() => navigate('/admin/events')} 
                    />
                    <ActionButton 
                      icon={<Trophy className="h-4 w-4 text-amber-500" />} 
                      label="Tournaments" 
                      onClick={() => navigate('/admin/tournaments')} 
                    />
                    <ActionButton 
                      icon={<Settings className="h-4 w-4 text-gray-500" />} 
                      label="Settings" 
                      onClick={() => navigate('/admin/settings')} 
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-0">
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 gap-3 pr-3">
              {dashboardCards.length === 0 ? (
                // Default stats if no custom dashboard cards are registered
                <>
                  <MobileStatCard 
                    title="Active Users" 
                    value="2,849" 
                    change="+12%" 
                    description="Total active users" 
                    icon={<Users className="text-blue-500" />} 
                  />
                  
                  <MobileStatCard 
                    title="Matches Recorded" 
                    value="8,392" 
                    change="+5%" 
                    description="Total matches recorded" 
                    icon={<Trophy className="text-amber-500" />} 
                  />
                  
                  <MobileStatCard 
                    title="Events This Month" 
                    value="48" 
                    change="+22%" 
                    description="Scheduled events" 
                    icon={<Calendar className="text-green-500" />} 
                  />
                  
                  <MobileStatCard 
                    title="Active Tournaments" 
                    value="12" 
                    change="+3" 
                    description="Currently running tournaments" 
                    icon={<Trophy className="text-purple-500" />} 
                  />
                  
                  <MobileStatCard 
                    title="Average Session" 
                    value="24m 32s" 
                    change="+2m" 
                    description="Time spent in app" 
                    icon={<Clock className="text-indigo-500" />} 
                  />
                  
                  <MobileStatCard 
                    title="System Health" 
                    value="99.8%" 
                    change="+0.2%" 
                    description="Overall system availability" 
                    icon={<Activity className="text-emerald-500" />} 
                  />
                </>
              ) : (
                // Render registered dashboard cards
                dashboardCards.map((card) => (
                  <Card key={card.id} className="h-auto">
                    <CardContent className="p-0 h-full">
                      <card.component />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Activity className="mr-2 h-4 w-4 text-[#FF5722]" />
                Recent Admin Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Latest administrative actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* This would be populated from an API call */}
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  No recent activity to display. Activity will appear here when administrators make changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for Quick Action buttons
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex flex-col items-center justify-center h-20 text-center"
    >
      <span className="mb-2">{icon}</span>
      <span className="text-xs">{label}</span>
    </Button>
  );
}

// Helper component for mobile-optimized stat cards
interface MobileStatCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ReactNode;
}

function MobileStatCard({ title, value, change, description, icon }: MobileStatCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card className="h-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <p className="text-xs flex flex-wrap items-center mt-1">
          <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} font-medium mr-1`}>
            {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-[10px]">
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}