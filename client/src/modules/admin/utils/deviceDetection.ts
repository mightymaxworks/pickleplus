/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Device Detection Utility
 * 
 * This utility provides functions to detect device types and screen sizes,
 * enabling conditional rendering of mobile-optimized components.
 */

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Breakpoint definitions for responsive design
export const BREAKPOINTS = {
  mobile: 640, // Max width for mobile devices (smartphones)
  tablet: 768, // Max width for tablet devices
  desktop: 1024, // Min width for desktop devices
};

/**
 * Custom hook to detect if the current device is a mobile device
 * @returns {boolean} True if the device is a mobile device
 */
export function useMobileDetection(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`);
}

/**
 * Custom hook to detect if the current device is a tablet
 * @returns {boolean} True if the device is a tablet
 */
export function useTabletDetection(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`);
}

/**
 * Custom hook to determine the current device type
 * @returns {'mobile' | 'tablet' | 'desktop'} The current device type
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useMobileDetection();
  const isTablet = useTabletDetection();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Helper function to generate class names based on device type
 * @param {Object} classNames Object containing class names for different device types
 * @param {string} defaultClassName Default class name to use if no specific class is provided
 * @param {'mobile' | 'tablet' | 'desktop'} deviceType The current device type
 * @returns {string} The appropriate class name for the current device type
 */
export function getResponsiveClassName(
  classNames: { 
    mobile?: string; 
    tablet?: string; 
    desktop?: string; 
  }, 
  defaultClassName: string = '',
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string {
  if (deviceType === 'mobile' && classNames.mobile) {
    return classNames.mobile;
  }
  
  if (deviceType === 'tablet' && classNames.tablet) {
    return classNames.tablet;
  }
  
  if (deviceType === 'desktop' && classNames.desktop) {
    return classNames.desktop;
  }
  
  return defaultClassName;
}

/**
 * Component helper to conditionally render based on device type
 * @param {Object} components Object containing components for different device types
 * @param {React.ReactNode} defaultComponent Default component to render if no specific component is provided
 * @param {'mobile' | 'tablet' | 'desktop'} deviceType The current device type
 * @returns {React.ReactNode} The appropriate component for the current device type
 */
export function getResponsiveComponent(
  components: { 
    mobile?: React.ReactNode; 
    tablet?: React.ReactNode; 
    desktop?: React.ReactNode; 
  }, 
  defaultComponent: React.ReactNode = null,
  deviceType: 'mobile' | 'tablet' | 'desktop'
): React.ReactNode {
  if (deviceType === 'mobile' && components.mobile) {
    return components.mobile;
  }
  
  if (deviceType === 'tablet' && components.tablet) {
    return components.tablet;
  }
  
  if (deviceType === 'desktop' && components.desktop) {
    return components.desktop;
  }
  
  return defaultComponent;
}