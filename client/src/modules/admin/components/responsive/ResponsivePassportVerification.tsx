/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Responsive Passport Verification
 * 
 * This component renders either the mobile or desktop version of the 
 * passport verification interface based on the current device type.
 */

import React from 'react';
import { useIsMobile } from '@/modules/admin/utils/deviceDetection';
import PassportVerificationMobile from '../mobile/PassportVerificationMobile';

// Note: In a real implementation, you would import the desktop version too
// For now we'll stub it with a placeholder
const PassportVerificationDesktop = () => (
  <div className="container mx-auto py-6 px-4 max-w-6xl">
    <div className="flex flex-col gap-1 mb-6">
      <h1 className="text-2xl font-bold tracking-tight">Passport Verification</h1>
      <p className="text-muted-foreground">
        Complete passport verification system for PicklePass™
      </p>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Verification form would go here */}
        <div className="h-64 border rounded-md flex items-center justify-center bg-secondary/10">
          <p className="text-muted-foreground">Desktop Verification Form</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Recent verifications would go here */}
        <div className="h-64 border rounded-md flex items-center justify-center bg-secondary/10">
          <p className="text-muted-foreground">Desktop Verification History</p>
        </div>
      </div>
    </div>
  </div>
);

export default function ResponsivePassportVerification() {
  const isMobile = useIsMobile();
  
  // Render the appropriate component based on device type
  return isMobile ? <PassportVerificationMobile /> : <PassportVerificationDesktop />;
}