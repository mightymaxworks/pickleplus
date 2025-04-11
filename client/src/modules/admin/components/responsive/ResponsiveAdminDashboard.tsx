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

interface ResponsiveAdminDashboardProps {
  title?: string;
}

export function ResponsiveAdminDashboard({ title = 'Admin Dashboard' }: ResponsiveAdminDashboardProps) {
  const deviceType = useDeviceType();
  
  // For mobile devices, render the mobile-optimized dashboard inside the regular AdminLayout
  if (deviceType === 'mobile') {
    return (
      <AdminLayout title={title}>
        <AdminDashboardMobile />
      </AdminLayout>
    );
  }
  
  // For tablets and desktops, use the regular dashboard
  // Still need to provide children prop even if it's empty
  return (
    <AdminLayout title={title}>
      {/* Desktop dashboard content will be rendered via AdminLayout */}
    </AdminLayout>
  );
}