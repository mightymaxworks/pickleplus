/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Responsive Passport Verification Component
 * 
 * This component serves as an adapter that renders either the desktop or mobile
 * version of the Passport Verification based on the detected device type.
 */

import React from 'react';
import { useDeviceType } from '@/modules/admin/utils/deviceDetection';
import PassportVerificationMobile from '@/modules/admin/components/mobile/PassportVerificationMobile';
import { AdminLayout } from '@/modules/admin/components/AdminLayout';
import PassportVerificationDashboard from '@/components/admin/PassportVerificationDashboard';

interface ResponsivePassportVerificationProps {
  title?: string;
}

export function ResponsivePassportVerification({ title = 'Passport Verification' }: ResponsivePassportVerificationProps) {
  const deviceType = useDeviceType();
  
  // For mobile devices, render the mobile-optimized verification component
  if (deviceType === 'mobile') {
    return (
      <AdminLayout title={title}>
        <PassportVerificationMobile />
      </AdminLayout>
    );
  }
  
  // For tablets and desktops, use the regular verification dashboard
  return (
    <AdminLayout title={title}>
      <PassportVerificationDashboard />
    </AdminLayout>
  );
}