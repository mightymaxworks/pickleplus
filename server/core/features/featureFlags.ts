/**
 * Server-side Feature Flags System
 * 
 * This provides similar functionality to the client-side feature flags
 * but is designed for server-side use.
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  enabledForUserIds?: number[];
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
export const serverFeatureFlags = new FeatureToggleSystem();

// Register server-side features
serverFeatureFlags.registerFeatures([
  {
    name: 'match-recording-api',
    enabled: false, // Coming April 13
    description: 'API endpoints for match recording',
  },
  {
    name: 'coaching-api',
    enabled: false, // Coming May 15
    description: 'API endpoints for coaching',
  },
  {
    name: 'achievement-tracking',
    enabled: true,
    description: 'Track and award achievements',
  },
  // QR Code API Feature Flags (PKL-278651-CONN-0002-QR)
  {
    name: 'player-qr-scanning-api',
    enabled: false, // Coming post-April 13 launch
    description: 'API endpoints for player QR code scanning',
  },
  {
    name: 'quick-match-recording-api',
    enabled: false, // Coming post-April 13 launch
    description: 'API endpoints for quick match recording via QR codes',
  },
  {
    name: 'event-check-in-api',
    enabled: false, // Coming post-April 13 launch
    description: 'API endpoints for event check-in via QR codes',
  },
]);