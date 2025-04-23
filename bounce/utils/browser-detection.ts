/**
 * PKL-278651-BOUNCE-0001-BROWSER
 * Browser Detection Utilities
 * 
 * This file provides utilities for detecting browser information:
 * 1. Identifying browser type and version
 * 2. Determining operating system
 * 3. Checking viewport dimensions
 * 4. Detecting mobile devices
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  isMobile: boolean;
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Get detailed information about the current browser environment
 * @returns Browser information or null if not in a browser environment
 */
export function getBrowserInfo(): BrowserInfo | null {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }
  
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let os = 'Unknown';
  let isMobile = false;
  
  // Detect browser
  if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    browserName = 'Samsung Browser';
    browserVersion = userAgent.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
    browserVersion = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Trident') > -1) {
    browserName = 'Internet Explorer';
    browserVersion = userAgent.match(/rv:([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge (Legacy)';
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge (Chromium)';
    browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  }
  
  // Detect OS
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
    if (userAgent.indexOf('Windows NT 10.0') > -1) os += ' 10';
    else if (userAgent.indexOf('Windows NT 6.3') > -1) os += ' 8.1';
    else if (userAgent.indexOf('Windows NT 6.2') > -1) os += ' 8';
    else if (userAgent.indexOf('Windows NT 6.1') > -1) os += ' 7';
    else if (userAgent.indexOf('Windows NT 6.0') > -1) os += ' Vista';
    else if (userAgent.indexOf('Windows NT 5.1') > -1) os += ' XP';
  } else if (userAgent.indexOf('Macintosh') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
    const match = userAgent.match(/Android ([0-9.]+)/);
    if (match) os += ` ${match[1]}`;
    isMobile = true;
  } else if (userAgent.indexOf('iOS') > -1 || (userAgent.indexOf('Mac') > -1 && 'ontouchend' in document)) {
    os = 'iOS';
    isMobile = true;
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  }
  
  // If not explicitly set as mobile by OS, check common mobile identifiers
  if (!isMobile) {
    isMobile = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
  
  // Get viewport dimensions
  const viewport = {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  };
  
  return {
    name: browserName,
    version: browserVersion,
    os,
    isMobile,
    viewport
  };
}

/**
 * Checks if the current browser is Safari
 * @returns true if the browser is Safari, false otherwise
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  return userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1;
}

/**
 * Checks if the current browser is running on a mobile device
 * @returns true if on a mobile device, false otherwise
 */
export function isMobileDevice(): boolean {
  const info = getBrowserInfo();
  return info?.isMobile || false;
}

/**
 * Gets a string representation of the browser environment
 * @returns Descriptive string of the browser environment
 */
export function getBrowserEnvironmentString(): string {
  const info = getBrowserInfo();
  if (!info) return 'Non-browser environment';
  
  return `${info.name} ${info.version} on ${info.os}${info.isMobile ? ' (Mobile)' : ''}`;
}