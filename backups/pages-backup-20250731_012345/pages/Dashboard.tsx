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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <StandardLayout>
        <PassportDashboard onShowOnboarding={handleShowOnboarding} />
        {showOnboarding && (
          <WelcomeOnboarding 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
            forceShow={true}
          />
        )}
      </StandardLayout>
    </div>
  );
}