import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is a mobile device
 * based on screen width
 * @param breakpoint The breakpoint to determine mobile view in pixels (default: 768)
 * @returns boolean indicating if the viewport width is less than the breakpoint
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < breakpoint);

    // Create handler for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}