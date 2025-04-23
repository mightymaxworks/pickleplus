/**
 * Feature Flags for Pickle+ Frontend-First Architecture
 * 
 * This system enables granular control of which features use frontend-first approach
 * vs. making direct API calls. This allows for progressive implementation and testing.
 * 
 * @module featureFlags
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

// Storage key for persisting flag overrides
const FEATURE_FLAGS_STORAGE_KEY = 'pickle_plus_feature_flags';

// Default flag configuration
const defaultFlags: FeatureFlags = {
  // Storage and sync features
  enableLocalStorageFirst: true,
  enableBackgroundSync: true,
  enableSyncRetries: true,
  enableConflictResolution: false,

  // Form-specific frontend-first flags
  enableMatchRecordingFrontendFirst: true,
  enableMatchAssessmentFrontendFirst: true,
  enableProfileUpdatesFrontendFirst: false,
  enableTournamentsFrontendFirst: false,
  enableCommunityPostsFrontendFirst: false,
  
  // Optimization features
  enableDataPrefetching: false,
  
  // UI features
  showSyncStatus: true,
  showOfflineIndicator: true,
  enableOptimisticUI: true,
  
  // Developer features
  enableDevTools: false,
  
  // Environment switches
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Feature flag interface
export interface FeatureFlags {
  enableLocalStorageFirst: boolean;
  enableBackgroundSync: boolean;
  enableSyncRetries: boolean;
  enableConflictResolution: boolean;
  
  enableMatchRecordingFrontendFirst: boolean;
  enableMatchAssessmentFrontendFirst: boolean;
  enableProfileUpdatesFrontendFirst: boolean;
  enableTournamentsFrontendFirst: boolean;
  enableCommunityPostsFrontendFirst: boolean;
  
  enableDataPrefetching: boolean;
  
  showSyncStatus: boolean;
  showOfflineIndicator: boolean;
  enableOptimisticUI: boolean;
  
  enableDevTools: boolean;
  
  isProduction: boolean;
  isTest: boolean;
}

/**
 * Load saved flag overrides from localStorage
 */
function loadFlagOverrides(): Partial<FeatureFlags> {
  try {
    const savedFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    return savedFlags ? JSON.parse(savedFlags) : {};
  } catch (error) {
    console.error('Error loading feature flag overrides:', error);
    return {};
  }
}

/**
 * Save flag overrides to localStorage
 */
function saveFlagOverrides(overrides: Partial<FeatureFlags>): void {
  try {
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Error saving feature flag overrides:', error);
  }
}

// Initialize with saved overrides
const overrides = loadFlagOverrides();
let currentFlags: FeatureFlags = { ...defaultFlags, ...overrides };

// Query parameter overrides - useful for testing
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Check for special development mode param
  if (params.get('dev_mode') === 'true') {
    currentFlags.enableDevTools = true;
  }
  
  // Check for frontend-first flag override
  const frontendFirst = params.get('frontend_first');
  if (frontendFirst === 'true' || frontendFirst === 'false') {
    const value = frontendFirst === 'true';
    currentFlags.enableLocalStorageFirst = value;
    currentFlags.enableMatchRecordingFrontendFirst = value;
    currentFlags.enableMatchAssessmentFrontendFirst = value;
    currentFlags.enableProfileUpdatesFrontendFirst = value;
    currentFlags.enableTournamentsFrontendFirst = value;
    currentFlags.enableCommunityPostsFrontendFirst = value;
  }
}

/**
 * Get current feature flag values
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...currentFlags };
}

/**
 * Set specific feature flag values
 * @param flags Partial feature flags object to update
 */
export function setFeatureFlags(flags: Partial<FeatureFlags>): void {
  currentFlags = { ...currentFlags, ...flags };
  saveFlagOverrides(flags);
}

/**
 * Get a specific feature flag value
 * @param flagName The name of the flag to get
 */
export function getFeatureFlag<K extends keyof FeatureFlags>(flagName: K): FeatureFlags[K] {
  return currentFlags[flagName];
}

/**
 * Reset all feature flags to default values
 */
export function resetFeatureFlags(): void {
  currentFlags = { ...defaultFlags };
  localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
}

/**
 * Check if we should use frontend-first approach for a specific feature
 * @param feature The feature name to check
 */
export function useFrontendFirst(feature: 'match' | 'assessment' | 'profile' | 'tournament' | 'community'): boolean {
  // First check global frontend-first flag
  if (!currentFlags.enableLocalStorageFirst) {
    return false;
  }
  
  // Then check feature-specific flag
  switch (feature) {
    case 'match':
      return currentFlags.enableMatchRecordingFrontendFirst;
    case 'assessment':
      return currentFlags.enableMatchAssessmentFrontendFirst;
    case 'profile':
      return currentFlags.enableProfileUpdatesFrontendFirst;
    case 'tournament':
      return currentFlags.enableTournamentsFrontendFirst;
    case 'community':
      return currentFlags.enableCommunityPostsFrontendFirst;
    default:
      return false;
  }
}

/**
 * Enable a specific feature flag
 * @param flagName The name of the flag to enable
 */
export function enableFeature<K extends keyof FeatureFlags>(flagName: K): void {
  setFeatureFlags({ [flagName]: true } as Partial<FeatureFlags>);
}

/**
 * Disable a specific feature flag
 * @param flagName The name of the flag to disable
 */
export function disableFeature<K extends keyof FeatureFlags>(flagName: K): void {
  setFeatureFlags({ [flagName]: false } as Partial<FeatureFlags>);
}

/**
 * Reset a specific feature flag to its default value
 * @param flagName The name of the flag to reset
 */
export function resetFeature<K extends keyof FeatureFlags>(flagName: K): void {
  setFeatureFlags({ [flagName]: defaultFlags[flagName] } as Partial<FeatureFlags>);
}

// For backward compatibility with older code
export const Features = {
  ENHANCED_PROFILE: 'enableOptimisticUI',
  FRONTEND_FIRST: 'enableLocalStorageFirst',
  BACKGROUND_SYNC: 'enableBackgroundSync',
  SHOW_SYNC_STATUS: 'showSyncStatus'
} as const;

// Export the feature flags as a singleton
const featureFlags = {
  getFeatureFlags,
  setFeatureFlags,
  getFeatureFlag,
  resetFeatureFlags,
  useFrontendFirst,
  enableFeature,
  disableFeature,
  resetFeature
};

export default featureFlags;