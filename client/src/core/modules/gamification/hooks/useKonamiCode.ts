/**
 * PKL-278651-GAME-0001-MOD
 * useKonamiCode Hook
 * 
 * A hook that detects the Konami code sequence (up, up, down, down, left, right, left, right, B, A)
 * and triggers a callback when detected.
 */

import { useEffect, useState, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 
  'ArrowUp', 
  'ArrowDown', 
  'ArrowDown', 
  'ArrowLeft', 
  'ArrowRight', 
  'ArrowLeft', 
  'ArrowRight', 
  'b', 
  'a'
];

interface UseKonamiCodeOptions {
  onKonami: () => void;
  resetOnSuccess?: boolean;
}

export default function useKonamiCode({ 
  onKonami, 
  resetOnSuccess = true 
}: UseKonamiCodeOptions): { 
  keysPressed: string[];
  isActivated: boolean;
  reset: () => void;
} {
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  
  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Get the key from the event
      const key = event.key.toLowerCase();
      
      // Update the keys pressed state by adding the new key
      setKeysPressed((prev) => {
        // Create a new array with the current keys and the new key
        const updatedKeys = [...prev, key];
        
        // Only keep the last N keys (where N is the length of the Konami code)
        if (updatedKeys.length > KONAMI_CODE.length) {
          return updatedKeys.slice(-KONAMI_CODE.length);
        }
        
        return updatedKeys;
      });
    },
    []
  );
  
  // Check if the Konami code has been entered
  useEffect(() => {
    // If there are not enough keys pressed, no need to check
    if (keysPressed.length < KONAMI_CODE.length) {
      return;
    }
    
    // Check if the keys pressed match the Konami code
    const isKonamiCode = keysPressed.join('').toLowerCase() === 
      KONAMI_CODE.join('').toLowerCase();
    
    if (isKonamiCode && !isActivated) {
      // Execute the callback
      onKonami();
      setIsActivated(true);
      
      // Reset if needed
      if (resetOnSuccess) {
        setKeysPressed([]);
      }
    }
  }, [keysPressed, onKonami, isActivated, resetOnSuccess]);
  
  // Add and remove the keydown event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Function to reset the state
  const reset = useCallback(() => {
    setKeysPressed([]);
    setIsActivated(false);
  }, []);
  
  return { keysPressed, isActivated, reset };
}