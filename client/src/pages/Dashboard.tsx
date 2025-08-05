/**
 * PKL-278651-DASH-0011-PASSPORT
 * Player Passport Dashboard Component
 * 
 * Updated to use the PassportDashboard component featuring prominent QR code
 * functionality and Pickle Points integration. Replaces horizontal scrolling
 * with clean, passport-style tabbed layout.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import React, { useState } from 'react';
import PassportDashboard from '@/components/dashboard/PassportDashboard';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleFieldChange = (field: string, value: any) => {
    // Handle field changes - could update user context or make API calls
    console.log('Field changed:', field, value);
  };

  // Show loading state if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <PassportDashboard 
        user={user} 
        onFieldChange={handleFieldChange}
      />
      {showOnboarding && (
        <WelcomeOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          forceShow={true}
        />
      )}
    </div>
  );
}