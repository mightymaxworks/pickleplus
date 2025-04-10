/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTrigger Hook
 * 
 * A hook that provides a way to trigger discoveries in the UI.
 */

import { useCallback, useRef } from 'react';
import { useGamification } from '../context/GamificationContext';
import type { TriggerConfig } from '../api/types';

interface UseDiscoveryTriggerOptions {
  code: string;
  triggerConfig?: TriggerConfig;
  onDiscovered?: () => void;
  context?: Record<string, any>;
}

interface UseDiscoveryTriggerResult {
  isDiscovered: boolean;
  triggerDiscovery: () => Promise<boolean>;
  markElementForDiscovery: (element: HTMLElement) => void;
}

export default function useDiscoveryTrigger({
  code,
  triggerConfig,
  onDiscovered,
  context
}: UseDiscoveryTriggerOptions): UseDiscoveryTriggerResult {
  const { state, triggerDiscovery, checkDiscovery } = useGamification();
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Check if this discovery has already been found
  const isDiscovered = checkDiscovery(code);

  // Function to trigger the discovery
  const handleTriggerDiscovery = useCallback(async () => {
    // Don't trigger if already discovered
    if (isDiscovered) {
      return false;
    }
    
    // Trigger the discovery
    const triggered = await triggerDiscovery(code, {
      ...context,
      location: window.location.pathname,
      timestamp: new Date().toISOString(),
      triggerType: triggerConfig?.type
    });
    
    // Call the callback if the discovery was triggered successfully
    if (triggered && onDiscovered) {
      onDiscovered();
    }
    
    return triggered;
  }, [code, context, isDiscovered, onDiscovered, triggerDiscovery, triggerConfig]);
  
  // Mark an element to be used for discovery triggering
  const markElementForDiscovery = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    
    // If the trigger type is 'click', add a click event listener
    if (triggerConfig?.type === 'click') {
      const handleClick = () => {
        handleTriggerDiscovery();
      };
      
      element.addEventListener('click', handleClick);
      
      // Clean up function - would be returned from a useEffect in a real implementation
      return () => {
        element.removeEventListener('click', handleClick);
      };
    }
    
    // Additional trigger types would be handled here
    
    return () => {};
  }, [handleTriggerDiscovery, triggerConfig]);
  
  return {
    isDiscovered,
    triggerDiscovery: handleTriggerDiscovery,
    markElementForDiscovery
  };
}