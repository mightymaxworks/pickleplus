/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Device Detection Utility
 * 
 * This utility provides functions for detecting device types and
 * adjusting UI components based on screen size.
 */

import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Device types supported by the system
 */
export enum DeviceType {
  Mobile = 0,
  Tablet = 1,
  Laptop = 2,
  Desktop = 3
}

/**
 * Breakpoints for different device types in pixels
 */
export const BREAKPOINTS = {
  mobile: 640,   // max-width for mobile devices
  tablet: 1024,  // max-width for tablet devices
  laptop: 1440,  // max-width for laptop devices
  // anything larger is considered a desktop
};

/**
 * Get the current device type based on window width
 * This function should be called inside components, not outside the React rendering lifecycle
 */
export function getDeviceType(): DeviceType {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return DeviceType.Desktop; // Default to desktop for SSR
  }
  
  const width = window.innerWidth;
  
  if (width <= BREAKPOINTS.mobile) {
    return DeviceType.Mobile;
  } else if (width <= BREAKPOINTS.tablet) {
    return DeviceType.Tablet;
  } else if (width <= BREAKPOINTS.laptop) {
    return DeviceType.Laptop;
  } else {
    return DeviceType.Desktop;
  }
}

/**
 * Hook to determine if the current device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`);
}

/**
 * Hook to determine if the current device is a tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`);
}

/**
 * Hook to determine if the current device is mobile or tablet (small screens)
 */
export function useIsSmallScreen(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet}px)`);
}

/**
 * Get appropriate padding based on device type
 */
export function getResponsivePadding(deviceType: DeviceType): string {
  switch (deviceType) {
    case DeviceType.Mobile:
      return 'px-2 py-2';
    case DeviceType.Tablet:
      return 'px-4 py-3';
    default:
      return 'px-6 py-4';
  }
}

/**
 * Get appropriate font size based on device type
 */
export function getResponsiveFontSize(deviceType: DeviceType, size: 'heading' | 'subheading' | 'body' | 'small'): string {
  if (deviceType === DeviceType.Mobile) {
    switch (size) {
      case 'heading':
        return 'text-xl';
      case 'subheading':
        return 'text-lg';
      case 'body':
        return 'text-sm';
      case 'small':
        return 'text-xs';
    }
  } else if (deviceType === DeviceType.Tablet) {
    switch (size) {
      case 'heading':
        return 'text-2xl';
      case 'subheading':
        return 'text-xl';
      case 'body':
        return 'text-base';
      case 'small':
        return 'text-sm';
    }
  } else {
    switch (size) {
      case 'heading':
        return 'text-3xl';
      case 'subheading':
        return 'text-2xl';
      case 'body':
        return 'text-base';
      case 'small':
        return 'text-sm';
    }
  }
}