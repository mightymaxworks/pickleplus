/**
 * PKL-278651-COMM-0036-MEDIA-QUOTA
 * Quota Utility Functions
 * 
 * Provides utilities for formatting and displaying storage quota information
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Format bytes to human-readable size
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string (e.g. "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Calculate percentage of used quota
 * @param bytesUsed Number of bytes used
 * @param quotaBytes Total quota in bytes
 * @returns Percentage used (0-100)
 */
export function calculatePercentUsed(bytesUsed: number, quotaBytes: number): number {
  if (quotaBytes === 0) return 100; // Prevent division by zero
  return Math.min(100, Math.round((bytesUsed / quotaBytes) * 100));
}

/**
 * Get status color based on quota usage
 * @param percentUsed Percentage of quota used (0-100)
 * @returns CSS color class
 */
export function getQuotaStatusColor(percentUsed: number): string {
  if (percentUsed >= 90) return 'text-destructive';
  if (percentUsed >= 75) return 'text-warning';
  return 'text-success';
}

/**
 * Get progress bar color based on quota usage
 * @param percentUsed Percentage of quota used (0-100) 
 * @returns CSS color class
 */
export function getProgressBarColor(percentUsed: number): string {
  if (percentUsed >= 90) return 'bg-destructive';
  if (percentUsed >= 75) return 'bg-warning';
  return 'bg-success';
}

/**
 * Calculate compression ratio as a percentage
 * @param originalSize Original file size in bytes
 * @param compressedSize Compressed file size in bytes
 * @returns Percentage saved as a string (e.g. "75%")
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): string {
  if (originalSize === 0) return '0%';
  const ratio = 100 - Math.round((compressedSize / originalSize) * 100);
  return `${ratio}%`;
}

/**
 * Format file size with difference
 * @param oldSize Original size in bytes
 * @param newSize New size in bytes
 * @returns Formatted string (e.g. "1.5 MB → 500 KB (-75%)")
 */
export function formatSizeWithDifference(oldSize: number, newSize: number): string {
  const oldFormatted = formatBytes(oldSize);
  const newFormatted = formatBytes(newSize);
  const ratio = calculateCompressionRatio(oldSize, newSize);
  
  return `${oldFormatted} → ${newFormatted} (-${ratio})`;
}

/**
 * Determine file type from MIME type or extension
 * @param mimeType MIME type string
 * @param filename Optional filename with extension
 * @returns File type category
 */
export function getFileType(mimeType: string, filename?: string): 'image' | 'video' | 'document' | 'other' {
  if (!mimeType && !filename) return 'other';
  
  // Check by MIME type first
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (
      mimeType === 'application/pdf' ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text/')
    ) {
      return 'document';
    }
  }
  
  // Fall back to checking file extension if filename is provided
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'other';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }
    
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv'].includes(ext)) {
      return 'video';
    }
    
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'md'].includes(ext)) {
      return 'document';
    }
  }
  
  return 'other';
}

/**
 * Format function for JSX quota indicator
 * @param usedPercent Percentage of quota used
 * @param label Optional label
 * @returns Object with classes and styles to display quota
 */
export function formatQuotaIndicator(usedPercent: number, label?: string) {
  const statusColor = getQuotaStatusColor(usedPercent);
  const progressColor = getProgressBarColor(usedPercent);
  
  return {
    containerClass: "flex flex-col w-full gap-1",
    labelClass: `text-xs ${statusColor}`,
    barContainerClass: "h-2 w-full bg-muted rounded-full overflow-hidden",
    progressBarClass: `h-full ${progressColor} transition-all duration-500 ease-in-out`,
    progressBarStyle: { width: `${usedPercent}%` },
    textContainerClass: "flex justify-between text-xs text-muted-foreground",
    label: label,
    usedPercent: usedPercent
  };
}