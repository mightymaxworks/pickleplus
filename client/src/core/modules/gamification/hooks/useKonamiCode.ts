/**
 * PKL-278651-GAME-0001-MOD
 * useKonamiCode Hook
 * 
 * A hook that enables the Konami Code easter egg functionality.
 * The Konami Code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A
 */

import { useState, useEffect, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA'
];

interface UseKonamiCodeProps {
  onKonami?: () => void;
  resetOnSuccess?: boolean;
  disabled?: boolean;
}

/**
 * A hook that enables the Konami Code easter egg functionality.
 * The Konami Code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A
 * 
 * @param {UseKonamiCodeProps} props - The hook properties
 * @param {Function} [props.onKonami] - Callback function to run when the Konami code is successfully entered
 * @param {boolean} [props.resetOnSuccess=true] - Whether to reset the code entry after a successful entry
 * @param {boolean} [props.disabled=false] - Whether the Konami code functionality is disabled
 * @returns {object} - State object containing whether the Konami code was activated
 */
export default function useKonamiCode({
  onKonami,
  resetOnSuccess = true,
  disabled = false
}: UseKonamiCodeProps = {}) {
  // Track the keys that have been pressed
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  
  // Track whether the Konami code has been activated
  const [konamiActivated, setKonamiActivated] = useState(false);
  
  // Handle key presses
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // If disabled, do nothing
    if (disabled) return;
    
    // If Konami code has been activated and we're not resetting, do nothing
    if (konamiActivated && !resetOnSuccess) return;
    
    // Get the key code from the event
    const { code } = event;
    
    // Update the array of keys pressed
    setKeysPressed(prevKeys => {
      // Get the expected key at this position
      const expectedKey = KONAMI_CODE[prevKeys.length];
      
      // If the key matches what we expect next in the sequence
      if (code === expectedKey) {
        // Add this key to the array
        const newKeys = [...prevKeys, code];
        
        // If the full Konami code has been entered
        if (newKeys.length === KONAMI_CODE.length) {
          // Activate the Konami code
          setKonamiActivated(true);
          
          // Call the callback function
          if (onKonami) onKonami();
          
          // Reset the keys if needed
          return resetOnSuccess ? [] : newKeys;
        }
        
        return newKeys;
      }
      
      // If this is the first key in the sequence and it's the first key of the Konami code
      if (code === KONAMI_CODE[0]) {
        return [code];
      }
      
      // Otherwise reset the sequence
      return [];
    });
  }, [disabled, konamiActivated, resetOnSuccess, onKonami]);
  
  // Set up the event listener
  useEffect(() => {
    // If disabled, don't set up the listener
    if (disabled) return;
    
    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, handleKeyDown]);
  
  // Return the state of the Konami code
  return {
    konamiActivated,
    progress: keysPressed.length / KONAMI_CODE.length,
    reset: () => {
      setKeysPressed([]);
      setKonamiActivated(false);
    }
  };
}