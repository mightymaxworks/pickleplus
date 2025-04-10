/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTrigger Hook
 * 
 * This hook allows triggering discovery events based on user interactions.
 */

import { useState, useEffect, useCallback } from 'react';

// Types for the hook
export interface DiscoveryTriggerOptions {
  code: string;
  triggerAction?: 'click' | 'hover' | 'keyboard' | 'timer' | 'custom';
  targetSelector?: string;
  onDiscover?: (code: string) => void;
  customCondition?: () => boolean;
  delay?: number;
  enabled?: boolean;
}

/**
 * useDiscoveryTrigger Hook
 * 
 * Sets up event listeners to trigger discoveries based on user interactions.
 * Supports multiple trigger types: click, hover, keyboard, timer, or custom.
 * 
 * @param {DiscoveryTriggerOptions} options - Configuration options for the discovery trigger
 * @returns {object} - Methods to manually trigger and reset discovery state
 */
export default function useDiscoveryTrigger({
  code,
  triggerAction = 'click',
  targetSelector,
  onDiscover,
  customCondition,
  delay = 0,
  enabled = true
}: DiscoveryTriggerOptions) {
  // State to track discovery
  const [discovered, setDiscovered] = useState(false);
  
  // Function to handle discovery
  const handleDiscovery = useCallback(() => {
    if (!enabled || discovered) return;
    
    // If there's a delay, wait before triggering
    if (delay > 0) {
      setTimeout(() => {
        setDiscovered(true);
        if (onDiscover) onDiscover(code);
      }, delay);
    } else {
      setDiscovered(true);
      if (onDiscover) onDiscover(code);
    }
  }, [code, delay, discovered, enabled, onDiscover]);
  
  // Setup event listeners based on triggerAction
  useEffect(() => {
    if (!enabled || discovered) return;
    
    let targetElement: HTMLElement | null = null;
    let timerId: NodeJS.Timeout | null = null;
    
    // Find target element if selector is provided
    if (targetSelector) {
      targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Discovery trigger target not found: ${targetSelector}`);
        return;
      }
    }
    
    // Setup event listeners based on trigger type
    switch (triggerAction) {
      case 'click':
        if (targetElement) {
          const clickHandler = () => handleDiscovery();
          targetElement.addEventListener('click', clickHandler);
          return () => targetElement?.removeEventListener('click', clickHandler);
        }
        break;
        
      case 'hover':
        if (targetElement) {
          const hoverHandler = () => handleDiscovery();
          targetElement.addEventListener('mouseenter', hoverHandler);
          return () => targetElement?.removeEventListener('mouseenter', hoverHandler);
        }
        break;
        
      case 'keyboard':
        const keyHandler = (e: KeyboardEvent) => {
          if (e.code === 'KeyD' && e.ctrlKey && e.shiftKey) {
            handleDiscovery();
          }
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
        
      case 'timer':
        timerId = setTimeout(() => {
          handleDiscovery();
        }, delay || 3000);
        return () => {
          if (timerId) clearTimeout(timerId);
        };
        
      case 'custom':
        if (customCondition && customCondition()) {
          handleDiscovery();
        }
        break;
    }
  }, [triggerAction, targetSelector, handleDiscovery, discovered, enabled, customCondition, delay]);
  
  // Method to manually trigger discovery
  const trigger = useCallback(() => {
    handleDiscovery();
  }, [handleDiscovery]);
  
  // Method to reset discovery state
  const reset = useCallback(() => {
    setDiscovered(false);
  }, []);
  
  return {
    discovered,
    trigger,
    reset
  };
}