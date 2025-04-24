/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Onboarding Page
 * 
 * This page hosts the onboarding wizard for new users to set up their
 * CourtIQ profile and select their rating system.
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { OnboardingWizard } from '@/components/onboarding';
import { useAuth } from '@/lib/auth';

/**
 * OnboardingPage Component
 * 
 * Displays the onboarding wizard if the user is logged in, otherwise redirects to auth page.
 */
export default function OnboardingPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch onboarding status to check if user has already completed onboarding
  const { 
    data: onboardingStatus, 
    isLoading: isLoadingOnboarding 
  } = useQuery({
    queryKey: ['/api/courtiq/onboarding/status'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/courtiq/onboarding/status');
      if (!response.ok) throw new Error('Failed to fetch onboarding status');
      return response.json();
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Redirect to dashboard if onboarding is already completed
  useEffect(() => {
    if (onboardingStatus?.completed && !isLoadingOnboarding) {
      setLocation('/dashboard');
    }
  }, [onboardingStatus, isLoadingOnboarding, setLocation]);

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user && !isLoadingUser) {
      setLocation('/auth');
    }
  }, [user, isLoadingUser, setLocation]);

  // PKL-278651-COURTIQ-0002-GUIDANCE - This function is called when onboarding is complete
  // We intentionally do nothing here to prevent auto-redirect, letting the OnboardingComplete component
  // handle user navigation through its UI
  const handleOnboardingComplete = () => {
    console.log('[Onboarding] Completed, showing completion screen without redirect');
    // Do not navigate away automatically - display the completion guidance screen instead
  };

  // Loading state
  if (isLoadingUser || isLoadingOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading your profile...</h1>
        <p className="text-muted-foreground">Please wait while we prepare your onboarding experience.</p>
      </div>
    );
  }

  // Render onboarding wizard if user is logged in
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl mx-auto pt-12 pb-24 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to CourtIQ™</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let's set up your profile and get you started with our intelligent rating system.
            This quick process will help personalize your Pickle+ experience.
          </p>
        </div>
        
        <OnboardingWizard 
          userId={user?.id} 
          onComplete={handleOnboardingComplete} 
          className="mx-auto"
        />
      </div>
    </div>
  );
}