/**
 * PKL-278651-GAME-0001-MOD
 * useKonamiCode Hook
 * 
 * A hook that tracks keypresses and detects the Konami code or other custom key sequences.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Default Konami code: up, up, down, down, left, right, left, right, b, a
const DEFAULT_KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

interface UseKonamiCodeOptions {
  code?: string[];
  onDetected?: () => void;
  resetOnDetected?: boolean;
  timeLimit?: number;
}

interface UseKonamiCodeResult {
  konamiDetected: boolean;
  progress: number;
  reset: () => void;
}

export default function useKonamiCode({
  code = DEFAULT_KONAMI_CODE,
  onDetected,
  resetOnDetected = true,
  timeLimit = 5000, // 5 seconds between keypresses
}: UseKonamiCodeOptions = {}): UseKonamiCodeResult {
  const [konamiDetected, setKonamiDetected] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset the detection and key sequence
  const reset = useCallback(() => {
    setKonamiDetected(false);
    setKeySequence([]);
  }, []);

  // Process key presses
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Convert key to lowercase for case-insensitive matching
      const key = event.key;

      // Clear the timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to reset the sequence if no keys are pressed within the limit
      timeoutRef.current = setTimeout(() => {
        setKeySequence([]);
      }, timeLimit);

      // Add the new key to the sequence
      setKeySequence(prevSequence => {
        const newSequence = [...prevSequence, key];
        
        // Check if the new sequence matches the code
        const isKonami = isMatchingSequence(newSequence, code);
        
        if (isKonami) {
          setKonamiDetected(true);
          
          // Call the callback if provided
          if (onDetected) {
            onDetected();
          }
          
          // Reset immediately or keep the detected state
          if (resetOnDetected) {
            return [];
          }
        }
        
        // Keep only the relevant part of the sequence
        // If we have more keys than the code, remove the excess from the beginning
        return newSequence.length > code.length 
          ? newSequence.slice(newSequence.length - code.length) 
          : newSequence;
      });
    };
    
    // Check if sequences match (case-insensitive)
    const isMatchingSequence = (entered: string[], target: string[]): boolean => {
      if (entered.length < target.length) return false;
      
      // Get the latest portion of the entered sequence that matches the target length
      const relevantSequence = entered.slice(entered.length - target.length);
      
      // Compare each key
      return relevantSequence.every((key, index) => {
        // For letter keys, do case-insensitive comparison
        if (target[index].length === 1 && /[a-zA-Z]/.test(target[index])) {
          return key.toLowerCase() === target[index].toLowerCase();
        }
        // For special keys like ArrowUp, do exact comparison
        return key === target[index];
      });
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [code, onDetected, resetOnDetected, timeLimit]);
  
  // Calculate progress as percentage of completed sequence
  const progress = Math.min(
    100, 
    Math.floor((keySequence.length / code.length) * 100)
  );
  
  return { konamiDetected, progress, reset };
}