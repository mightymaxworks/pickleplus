/**
 * PKL-278651-FF-0001-PROD
 * Production Feature Flags
 * 
 * This module defines feature flags specific to production deployment.
 * These flags allow for gradual integration of Framework 5.3 enhancements
 * without disrupting existing functionality.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import configService from '../config';

// Detect if we're in production
const isProd = configService.isProduction();

/**
 * Production feature flags
 * 
 * These flags control which production-specific enhancements are enabled.
 * Setting a flag to false will make the application fall back to the
 * Framework 5.2 behavior for that feature.
 */
export const productionFeatures = {
  // Database features
  enhancedConnectionPool: isProd, // Use larger connection pool with error handling
  connectionRetry: isProd, // Enable connection retry logic
  gracefulShutdown: isProd, // Enable graceful shutdown of database connections

  // Performance features
  responseCompression: isProd, // Enable response compression
  staticAssetCaching: isProd, // Enable aggressive caching for static assets
  apiResponseCaching: isProd, // Enable API response caching

  // Security features
  enhancedRateLimiting: isProd, // Enable stricter rate limiting
  securityHeaders: isProd, // Enable additional security headers
  csrfProtection: true, // CSRF protection is always enabled

  // Build features
  separatedBuild: isProd, // Use separate client/server build process
  
  // Framework 5.3 Phase 1 features (safe to enable in all environments)
  configurationService: true, // Use the new configuration service
  environmentSpecificConfig: true, // Use environment-specific configuration
  
  // Framework 5.3 Phase 2 features (require more testing)
  repositoryPattern: false, // Use repository pattern for database access
  serviceLayer: false, // Use service layer for business logic
  
  // Feature flags for specific application areas
  enhancedErrorHandling: isProd, // Enhanced error tracking and reporting
  productionMonitoring: isProd, // Production monitoring features
};

/**
 * Get the status of a feature flag
 * 
 * @param featureKey The name of the feature flag
 * @param defaultValue Default value if the flag isn't found
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(
  featureKey: keyof typeof productionFeatures,
  defaultValue = false
): boolean {
  // Allow environment variable override for testing
  const envOverride = process.env[`ENABLE_${featureKey.toUpperCase()}`];
  if (envOverride !== undefined) {
    return envOverride === 'true';
  }
  
  return productionFeatures[featureKey] ?? defaultValue;
}

/**
 * Get all enabled production features
 * 
 * @returns List of enabled feature keys
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(productionFeatures)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);
}