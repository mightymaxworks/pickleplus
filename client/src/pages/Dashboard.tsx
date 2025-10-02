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

import React, { useState, useCallback } from 'react';
import PassportDashboard from '@/components/dashboard/PassportDashboard';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { queryClient } from '@/lib/queryClient';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/matches'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/rankings'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/achievements'] })
      ]);
    },
    threshold: 80
  });

  // Update local user when auth user changes
  React.useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleFieldChange = useCallback(async (field: string, value: any) => {
    console.log('Field changed:', field, value);
    
    // Handle full user update from API response
    if (field === '_fullUserUpdate') {
      setLocalUser(value);
      return;
    }
    
    // For individual field updates, update local state immediately
    if (localUser) {
      setLocalUser({
        ...localUser,
        [field]: value
      });
    }
  }, [localUser]);

  // Show loading state if user is not available
  if (!localUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('action.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      {isPulling && (
        <div 
          className={cn(
            "ptr-indicator bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2",
            pullDistance > 80 ? "pulling" : ""
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span className="text-sm font-medium">
            {isRefreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </div>
      )}
      <PassportDashboard 
        user={localUser} 
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