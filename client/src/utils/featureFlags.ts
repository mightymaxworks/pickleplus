/**
 * PKL-278651 Feature Flag System
 * Controls rollout of enhanced components with fallback support
 */

export const FEATURE_FLAGS = {
  // Core UI Components
  PKL_ENHANCED_PASSPORT: process.env.VITE_ENABLE_ENHANCED_PASSPORT === 'true',
  PKL_ENHANCED_MATCH_RECORDER: process.env.VITE_ENABLE_ENHANCED_MATCH_RECORDER === 'true',
  PKL_ENHANCED_RANKING: process.env.VITE_ENABLE_ENHANCED_RANKING === 'true',
  PKL_ENHANCED_COACHING: process.env.VITE_ENABLE_ENHANCED_COACHING === 'true',
  PKL_ENHANCED_COMMUNITY: process.env.VITE_ENABLE_ENHANCED_COMMUNITY === 'true',
  
  // Additional Features
  PKL_ENHANCED_NAVIGATION: process.env.VITE_ENABLE_ENHANCED_NAVIGATION === 'true',
  PKL_ENHANCED_TOURNAMENTS: process.env.VITE_ENABLE_ENHANCED_TOURNAMENTS === 'true',
  PKL_ENHANCED_TRAINING_CENTERS: process.env.VITE_ENABLE_ENHANCED_TRAINING_CENTERS === 'true',
  
  // Global Settings
  PKL_FORCE_MOBILE_OPTIMIZATIONS: process.env.VITE_FORCE_MOBILE_OPTIMIZATIONS === 'true',
  PKL_ENABLE_PERFORMANCE_MONITORING: process.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  // Check localStorage for user-specific overrides (for rollback scenarios)
  const localOverride = localStorage.getItem(`feature_${flag}`);
  if (localOverride !== null) {
    return localOverride === 'true';
  }
  
  // Check for rollback flags
  const rollbackKey = `rollback_${flag}`;
  if (localStorage.getItem(rollbackKey) === 'true') {
    return false;
  }
  
  return FEATURE_FLAGS[flag];
}

/**
 * Enable/disable feature flag for current user session
 */
export function setFeatureFlag(flag: FeatureFlagKey, enabled: boolean): void {
  localStorage.setItem(`feature_${flag}`, enabled.toString());
}

/**
 * Clear user-specific feature flag overrides
 */
export function clearFeatureFlags(): void {
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    localStorage.removeItem(`feature_${flag}`);
    localStorage.removeItem(`rollback_${flag}`);
  });
}

/**
 * Get all feature flag states
 */
export function getFeatureFlagStatus(): Record<string, boolean> {
  return Object.fromEntries(
    Object.keys(FEATURE_FLAGS).map(flag => [
      flag, 
      isFeatureEnabled(flag as FeatureFlagKey)
    ])
  );
}

/**
 * Development helper to enable all PKL-278651 features
 */
export function enableAllPKLFeatures(): void {
  if (process.env.NODE_ENV === 'development') {
    Object.keys(FEATURE_FLAGS).forEach(flag => {
      if (flag.startsWith('PKL_')) {
        setFeatureFlag(flag as FeatureFlagKey, true);
      }
    });
    console.log('All PKL-278651 features enabled for development');
  }
}

/**
 * Emergency rollback function
 */
export function emergencyRollback(): void {
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    localStorage.setItem(`rollback_${flag}`, 'true');
  });
  
  console.warn('Emergency rollback activated - all enhanced features disabled');
  window.location.reload();
}