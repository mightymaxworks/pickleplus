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
    console.log('Onboarding completed');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    console.log('Onboarding skipped');
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    console.log('Show onboarding triggered');
    setShowOnboarding(true);
  };

  return (
    <StandardLayout>
      <PassportDashboard onShowOnboarding={handleShowOnboarding} />
      {showOnboarding && (
        <WelcomeOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </StandardLayout>
  );
}