/**
 * PKL-278651-COMM-0036-MEDIA-QUOTA
 * Community Media Storage Quota Utilities
 * 
 * Helper functions for managing and displaying community storage quotas
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Format bytes to human-readable string with appropriate unit
 * @param bytes Number of bytes
 * @param decimals Number of decimal places in output
 * @returns Formatted string with unit (e.g. "2.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Calculate percentage of quota used
 * @param used Bytes used
 * @param total Total quota in bytes
 * @returns Percentage (0-100)
 */
export function calculateQuotaPercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

/**
 * Get color for quota usage indicator based on percentage used
 * @param percentage Percentage of quota used (0-100)
 * @returns CSS color class
 */
export function getQuotaStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-destructive bg-destructive/20';
  if (percentage >= 75) return 'text-amber-500 bg-amber-500/20';
  return 'text-emerald-500 bg-emerald-500/20';
}

/**
 * Get threshold level based on percentage
 * @param percentage Percentage of quota used (0-100)
 * @returns Threshold level description
 */
export function getQuotaThresholdLevel(percentage: number): string {
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'good';
}

/**
 * Determine if a file can be uploaded given current quota usage
 * @param fileSize Size of file in bytes
 * @param usedBytes Bytes already used
 * @param quotaBytes Total quota in bytes
 * @returns Boolean indicating if file can be uploaded
 */
export function canUploadFile(fileSize: number, usedBytes: number, quotaBytes: number): boolean {
  return (usedBytes + fileSize) <= quotaBytes;
}

/**
 * Get default quota based on community tier
 * @param tier Community tier ('free', 'basic', 'premium', 'enterprise')
 * @returns Quota in bytes
 */
export function getDefaultQuota(tier: string): number {
  switch (tier.toLowerCase()) {
    case 'free':
      return 50 * 1024 * 1024; // 50MB
    case 'basic':
      return 250 * 1024 * 1024; // 250MB
    case 'premium':
      return 1024 * 1024 * 1024; // 1GB
    case 'enterprise':
      return 10 * 1024 * 1024 * 1024; // 10GB
    default:
      return 100 * 1024 * 1024; // 100MB default
  }
}