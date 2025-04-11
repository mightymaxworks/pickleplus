/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Responsive Admin Dashboard Component
 * 
 * This component serves as an adapter that renders either the desktop or mobile
 * version of the Admin Dashboard based on the detected device type.
 */

import React from 'react';
import { useDeviceType } from '@/modules/admin/utils/deviceDetection';
import AdminDashboardMobile from '@/modules/admin/components/mobile/AdminDashboardMobile';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import { useAdminDashboardCards, useAdminQuickActions } from '@/modules/admin/hooks/useAdminComponents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminDashboardCard, AdminQuickAction } from '@/modules/admin/types';

interface ResponsiveAdminDashboardProps {
  title?: string;
}

export function ResponsiveAdminDashboard({ title = 'Admin Dashboard' }: ResponsiveAdminDashboardProps) {
  const deviceType = useDeviceType();
  const dashboardCards = useAdminDashboardCards();
  const quickActions = useAdminQuickActions();
  
  // For mobile devices, render the mobile-optimized dashboard inside the regular AdminLayout
  if (deviceType === 'mobile') {
    return (
      <AdminLayout title={title}>
        <AdminDashboardMobile />
      </AdminLayout>
    );
  }
  
  // For tablets and desktops, use the existing desktop dashboard content in AdminLayout
  return (
    <AdminLayout title={title}>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {quickActions.length > 0 ? (
            quickActions.map((action: AdminQuickAction) => (
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
            ))
          ) : (
            <div className="text-sm text-gray-500">No quick actions available</div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {dashboardCards.length > 0 ? (
          dashboardCards.map((card: AdminDashboardCard) => {
            // Apply width styles based on the card's width property
            const widthClasses: Record<string, string> = {
              'full': 'col-span-1 sm:col-span-2 lg:col-span-3',
              'half': 'col-span-1 sm:col-span-2 lg:col-span-2',
              'third': 'col-span-1'
            };
            
            // Apply height styles based on the card's height property
            const heightClasses: Record<string, string> = {
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
          })
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
            No dashboard cards available
          </div>
        )}
      </div>
    </AdminLayout>
  );
}