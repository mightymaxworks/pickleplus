// Feature flags system for Pickle+
import { useEffect, useState } from 'react';

// Locked features
export const Features = {
  TOURNAMENTS: 'tournaments',
  ACHIEVEMENTS: 'achievements',
  LEADERBOARD: 'leaderboard',
  PASSPORT_QR: 'passport_qr',
  QUICK_MATCH: 'quick_match',
  SOCIAL_CONNECTIONS: 'social_connections',
  GUIDANCE_MASCOT: 'guidance_mascot_enabled',
  ENHANCED_PROFILE: 'enhanced_profile'
};

// Singapore launch date: April 12th, 2025, 22:00 Singapore Time (GMT+8)
const LAUNCH_DATE = new Date('2025-04-12T22:00:00+08:00');

interface FeatureState {
  [key: string]: boolean;
}

// Default state - passport QR is enabled, other features are locked
const DEFAULT_STATE: FeatureState = {
  [Features.TOURNAMENTS]: false,
  [Features.ACHIEVEMENTS]: false,
  [Features.LEADERBOARD]: false,
  [Features.PASSPORT_QR]: true, // Passport QR is enabled immediately
  [Features.QUICK_MATCH]: false,
  [Features.SOCIAL_CONNECTIONS]: true, // Social connections enabled for testing
  [Features.GUIDANCE_MASCOT]: true, // Guidance mascot enabled by default
  [Features.ENHANCED_PROFILE]: true, // Enable enhanced profile features
};

// Check if we've passed the launch date
function isAfterLaunchDate(): boolean {
  const now = new Date();
  return now >= LAUNCH_DATE;
}

// Check local storage for manual override
function checkLocalStorageOverride(feature: string): boolean | null {
  const storedValue = localStorage.getItem(`feature_${feature}`);
  if (storedValue === null) return null;
  return storedValue === 'true';
}

// Hook to check if a feature is enabled
export function useFeatureFlag(feature: string): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if feature should be enabled
    const checkFeatureStatus = () => {
      // First check for manual override
      const override = checkLocalStorageOverride(feature);
      if (override !== null) {
        setIsEnabled(override);
        return;
      }
      
      // Then check launch date
      if (isAfterLaunchDate()) {
        setIsEnabled(true);
        return;
      }
      
      // Default to locked state
      setIsEnabled(DEFAULT_STATE[feature] || false);
    };
    
    // Check initially
    checkFeatureStatus();
    
    // Set up interval to check periodically (every minute)
    const interval = setInterval(checkFeatureStatus, 60000);
    
    return () => clearInterval(interval);
  }, [feature]);
  
  return isEnabled;
}

// Admin function to manually enable a feature (for development/testing)
export function enableFeature(feature: string): void {
  localStorage.setItem(`feature_${feature}`, 'true');
  // Force refresh to apply changes
  window.location.reload();
}

// Admin function to manually disable a feature
export function disableFeature(feature: string): void {
  localStorage.setItem(`feature_${feature}`, 'false');
  // Force refresh to apply changes
  window.location.reload();
}

// Admin function to reset a feature to default behavior (based on launch date)
export function resetFeature(feature: string): void {
  localStorage.removeItem(`feature_${feature}`);
  // Force refresh to apply changes
  window.location.reload();
}