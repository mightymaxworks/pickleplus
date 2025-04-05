/**
 * Feature Toggle System
 * 
 * This system allows for:
 * - Feature flags for gradual rollout
 * - A/B testing capabilities
 * - User-specific feature access
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  enabledForUserIds?: number[];
  rolloutPercentage?: number;
  description?: string;
}

class FeatureToggleSystem {
  private features: Map<string, FeatureFlag> = new Map();

  /**
   * Register a new feature flag
   * @param feature The feature flag to register
   */
  registerFeature(feature: FeatureFlag): void {
    this.features.set(feature.name, feature);
  }

  /**
   * Register multiple feature flags at once
   * @param features The feature flags to register
   */
  registerFeatures(features: FeatureFlag[]): void {
    features.forEach(feature => this.registerFeature(feature));
  }

  /**
   * Check if a feature is enabled
   * @param featureName The name of the feature to check
   * @param userId Optional user ID to check against user-specific flags
   * @returns Whether the feature is enabled
   */
  isEnabled(featureName: string, userId?: number): boolean {
    if (!this.features.has(featureName)) return false;
    
    const feature = this.features.get(featureName)!;
    
    // Global toggle
    if (!feature.enabled) return false;
    
    // User specific toggle
    if (userId && feature.enabledForUserIds) {
      return feature.enabledForUserIds.includes(userId);
    }
    
    // Percentage rollout
    if (userId && feature.rolloutPercentage) {
      // Simple hash function to determine if user is in rollout
      // This ensures the same user always gets the same experience
      const hash = userId % 100;
      return hash < feature.rolloutPercentage;
    }
    
    return feature.enabled;
  }

  /**
   * Get all registered features
   * @returns All registered feature flags
   */
  getAllFeatures(): FeatureFlag[] {
    return Array.from(this.features.values());
  }
}

// Create and export a singleton instance
export const featureFlags = new FeatureToggleSystem();

// Register core features
featureFlags.registerFeatures([
  {
    name: 'match-recording',
    enabled: false, // Coming April 13
    description: 'Record match results and track performance',
  },
  {
    name: 'coaching-features',
    enabled: false, // Coming May 15
    description: 'Coach profiles and coaching session booking',
  },
  {
    name: 'tournament-registration',
    enabled: true,
    description: 'Register for tournaments and check in via QR code',
  },
  {
    name: 'achievements',
    enabled: true,
    description: 'Unlock achievements and earn XP',
  },
  {
    name: 'social-connections',
    enabled: true,
    description: 'Connect with other players and view their profiles',
  },
]);