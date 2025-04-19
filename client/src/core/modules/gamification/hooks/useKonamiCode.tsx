/**
 * PKL-278651-XP-0002-UI
 * useKonamiCode Hook
 * 
 * This hook detects the Konami Code sequence for easter eggs.
 * Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
 * 
 * @framework Framework5.1
 * @version 1.0.0
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
  onComplete?: () => void;
  resetOnComplete?: boolean;
}

export function useKonamiCode({
  onComplete,
  resetOnComplete = true
}: UseKonamiCodeOptions = {}) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);

  // Check if the entered sequence matches the Konami Code
  const checkSequence = useCallback(() => {
    const isMatch = sequence.length === KONAMI_CODE.length && 
      sequence.every((key, index) => key === KONAMI_CODE[index]);
    
    if (isMatch && !isActivated) {
      setIsActivated(true);
      if (onComplete) {
        onComplete();
      }
      if (resetOnComplete) {
        setSequence([]);
      }
    }
    
    return isMatch;
  }, [sequence, isActivated, onComplete, resetOnComplete]);

  // Reset the sequence
  const resetSequence = useCallback(() => {
    setSequence([]);
    setIsActivated(false);
  }, []);

  // Keydown event handler
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      // Convert key to lowercase for case-insensitive matching
      const key = e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'a' 
        ? e.key.toLowerCase() 
        : e.key;
      
      setSequence(prev => {
        const newSequence = [...prev, key];
        
        // Keep only the last N keys, where N is the length of the Konami Code
        if (newSequence.length > KONAMI_CODE.length) {
          return newSequence.slice(newSequence.length - KONAMI_CODE.length);
        }
        
        return newSequence;
      });
    };
    
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  // Check the sequence whenever it changes
  useEffect(() => {
    if (sequence.length === KONAMI_CODE.length) {
      checkSequence();
    }
  }, [sequence, checkSequence]);

  return {
    isActivated,
    resetSequence
  };
}

export default useKonamiCode;