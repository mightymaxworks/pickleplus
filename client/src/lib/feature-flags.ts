/**
 * PKL-278651-CONFIG-0003-FEAT - Feature Flags System
 * 
 * This file provides a centralized feature flag management system 
 * for controlling feature availability and behavior throughout the app.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

// Flag types for specific behavior control
export type OptimisticUIFlag = "enableOptimisticUI" | "disableOptimisticUI";
export type LocalStorageFirstFlag = "enableLocalStorageFirst" | "disableLocalStorageFirst";
export type BackgroundSyncFlag = "enableBackgroundSync" | "disableBackgroundSync";
export type SyncStatusFlag = "showSyncStatus" | "hideSyncStatus";

// Feature flag configuration map
export const FEATURE_FLAGS = {
  // Profile features
  ENHANCED_PROFILE: "enableOptimisticUI" as OptimisticUIFlag,
  PASSPORT_QR: "enableOptimisticUI" as OptimisticUIFlag,
  GUIDANCE_MASCOT: "enableOptimisticUI" as OptimisticUIFlag,
  
  // Data management and sync strategies
  FRONTEND_FIRST: "enableLocalStorageFirst" as LocalStorageFirstFlag,
  BACKGROUND_SYNC: "enableBackgroundSync" as BackgroundSyncFlag,
  SHOW_SYNC_STATUS: "showSyncStatus" as SyncStatusFlag,
  
  // Add the new Optimized Profile feature flag
  OPTIMIZED_PROFILE: "enableLocalStorageFirst" as LocalStorageFirstFlag
};

// Helper function to check if a feature is enabled
export function isFeatureEnabled(featureKey: keyof typeof FEATURE_FLAGS): boolean {
  const flagValue = FEATURE_FLAGS[featureKey];
  return flagValue.startsWith('enable');
}

// Helper to get stored feature preference (if available)
export function getStoredFeaturePreference(featureKey: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(`feature_${featureKey}`);
  }
  return null;
}

// Set feature preference in storage
export function setFeaturePreference(featureKey: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`feature_${featureKey}`, value);
  }
}