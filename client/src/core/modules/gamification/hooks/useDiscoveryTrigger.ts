/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTrigger Hook
 * 
 * A hook that provides functionality to trigger discoveries based on user actions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import { TriggerConfig } from '../api/types';

interface UseDiscoveryTriggerProps {
  code: string;
  config: TriggerConfig;
  context?: Record<string, any>;
  onTrigger?: (success: boolean) => void;
  disabled?: boolean;
}

/**
 * A hook that provides functionality to trigger discoveries based on user actions.
 * 
 * @param {UseDiscoveryTriggerProps} props - The hook properties
 * @param {string} props.code - The discovery code to trigger
 * @param {TriggerConfig} props.config - Configuration for how the discovery is triggered
 * @param {Record<string, any>} [props.context] - Additional context to pass to the discovery
 * @param {Function} [props.onTrigger] - Callback function to trigger when the discovery is triggered
 * @param {boolean} [props.disabled] - Whether the discovery trigger is disabled
 * @returns {boolean} - Whether the discovery was triggered
 */
export default function useDiscoveryTrigger({
  code,
  config,
  context,
  onTrigger,
  disabled = false
}: UseDiscoveryTriggerProps): boolean {
  // Get gamification context
  const { triggerDiscovery, checkDiscovery } = useGamification();
  
  // State to track whether the discovery was triggered
  const [triggered, setTriggered] = useState(false);
  
  // Check if the discovery has already been found
  const alreadyDiscovered = checkDiscovery(code);
  
  // Function to handle discovery trigger
  const handleTrigger = useCallback(async () => {
    if (disabled || triggered || alreadyDiscovered) return;
    
    try {
      // Trigger the discovery
      const success = await triggerDiscovery(code, context);
      
      // Update state
      setTriggered(success);
      
      // Call callback if provided
      if (onTrigger) {
        onTrigger(success);
      }
    } catch (error) {
      console.error(`Error triggering discovery (${code}):`, error);
      
      // Call callback with failure
      if (onTrigger) {
        onTrigger(false);
      }
    }
  }, [code, context, disabled, triggered, alreadyDiscovered, triggerDiscovery, onTrigger]);
  
  // Set up triggers based on config
  useEffect(() => {
    if (disabled || triggered || alreadyDiscovered) return;
    
    // Initialize based on trigger type
    switch (config.type) {
      case 'click': {
        // Set up click trigger
        const selector = config.params?.selector;
        if (!selector) return;
        
        const elements = document.querySelectorAll(selector);
        
        const clickHandler = () => {
          handleTrigger();
        };
        
        // Add click event listeners
        elements.forEach(element => {
          element.addEventListener('click', clickHandler);
        });
        
        // Clean up
        return () => {
          elements.forEach(element => {
            element.removeEventListener('click', clickHandler);
          });
        };
      }
      
      case 'hover': {
        // Set up hover trigger
        const selector = config.params?.selector;
        if (!selector) return;
        
        const elements = document.querySelectorAll(selector);
        
        const hoverHandler = () => {
          handleTrigger();
        };
        
        // Add hover event listeners
        elements.forEach(element => {
          element.addEventListener('mouseenter', hoverHandler);
        });
        
        // Clean up
        return () => {
          elements.forEach(element => {
            element.removeEventListener('mouseenter', hoverHandler);
          });
        };
      }
      
      case 'timer': {
        // Set up timer trigger
        const delay = config.params?.delay || 5000;
        
        const timerId = setTimeout(() => {
          handleTrigger();
        }, delay);
        
        // Clean up
        return () => {
          clearTimeout(timerId);
        };
      }
      
      case 'location': {
        // Trigger based on URL location
        const path = config.params?.path;
        if (!path) return;
        
        // Check if current path matches
        if (window.location.pathname === path || 
            window.location.pathname.startsWith(path)) {
          handleTrigger();
        }
        
        // No cleanup needed
        return;
      }
      
      // Other trigger types could be implemented here
      
      default:
        // No trigger set up
        return;
    }
  }, [config, disabled, triggered, alreadyDiscovered, handleTrigger]);
  
  return triggered;
}