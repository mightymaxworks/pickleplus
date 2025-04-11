/**
 * Feature Flag Helper Utilities
 * 
 * These functions help manage feature flags in development and testing environments.
 */

import { useEffect, useState } from 'react';
import { featureFlags } from '@/core/features/featureFlags';
import { useAuth } from '@/hooks/useAuth';

/**
 * Feature flag names that can be toggled
 */
export enum Features {
  ENHANCED_PROFILE = 'enhanced_profile',
  MATCH_RECORDING = 'match-recording',
  PLAYER_QR_SCANNING = 'player-qr-scanning',
  QUICK_MATCH_RECORDING = 'quick-match-recording',
  EVENT_CHECK_IN = 'event-check-in',
  TOURNAMENTS = 'tournament-registration',
  ACHIEVEMENTS = 'achievements',
  LEADERBOARD = 'leaderboard'
}

/**
 * Enable a feature flag temporarily (for the current session)
 * This is used by the development test pages to enable features for testing
 * without affecting the main application's default settings.
 * 
 * @param featureName The name of the feature to enable
 */
export const enableFeature = (featureName: string): void => {
  // We're creating a simplified version that just modifies the in-memory state
  const existingFeatures = featureFlags.getAllFeatures();
  
  // Find the feature
  const featureToEnable = existingFeatures.find(f => f.name === featureName);
  
  if (featureToEnable) {
    // Force enable in memory - this won't persist across page refreshes
    // but is useful for testing
    featureToEnable.enabled = true;
    
    console.log(`Feature "${featureName}" temporarily enabled for this session.`);
    
    // Force a React re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('feature-flag-changed', { detail: featureName }));
  } else {
    console.warn(`Feature "${featureName}" not found and cannot be enabled.`);
  }
};

/**
 * Disable a feature flag temporarily (for the current session)
 * 
 * @param featureName The name of the feature to disable
 */
export const disableFeature = (featureName: string): void => {
  // Similar to enableFeature but sets to false
  const existingFeatures = featureFlags.getAllFeatures();
  const featureToDisable = existingFeatures.find(f => f.name === featureName);
  
  if (featureToDisable) {
    featureToDisable.enabled = false;
    console.log(`Feature "${featureName}" temporarily disabled for this session.`);
    window.dispatchEvent(new CustomEvent('feature-flag-changed', { detail: featureName }));
  } else {
    console.warn(`Feature "${featureName}" not found and cannot be disabled.`);
  }
};

/**
 * Reset a feature flag to its default value
 * This removes any local storage overrides and resets to the system default
 * 
 * @param featureName The name of the feature to reset
 */
export const resetFeature = (featureName: string): void => {
  // In our simplified system, we'll just reload the page to reset to default values
  localStorage.removeItem(`feature_${featureName}`);
  console.log(`Feature "${featureName}" has been reset to default.`);
  window.location.reload();
};

/**
 * React hook to check if a feature is enabled
 * This hook automatically handles user-specific checks and re-renders
 * when feature flags change
 * 
 * @param featureName The name of the feature to check
 * @returns Whether the feature is enabled
 */
export function useFeatureFlag(featureName: string): boolean {
  const { user } = useAuth();
  const userId = user?.id;
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the feature is enabled now
    const checkFeature = () => {
      const enabled = featureFlags.isEnabled(featureName, userId);
      setIsEnabled(enabled);
    };
    
    // Check initially
    checkFeature();
    
    // Listen for feature flag changes
    const handleFeatureChange = (event: CustomEvent) => {
      if (event.detail === featureName) {
        checkFeature();
      }
    };
    
    // Add event listener
    window.addEventListener(
      'feature-flag-changed', 
      handleFeatureChange as EventListener
    );
    
    // Cleanup
    return () => {
      window.removeEventListener(
        'feature-flag-changed', 
        handleFeatureChange as EventListener
      );
    };
  }, [featureName, userId]);
  
  return isEnabled;
}