/**
 * PKL-278651-GAME-0001-MOD
 * useKonamiCode Hook
 * 
 * This hook implements the classic Konami Code sequence detection
 * (Up, Up, Down, Down, Left, Right, Left, Right, B, A).
 */

import { useState, useEffect, useCallback } from 'react';

// The Konami Code sequence
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

export interface UseKonamiCodeOptions {
  onComplete?: () => void;
  resetOnComplete?: boolean;
}

/**
 * useKonamiCode Hook
 * 
 * Detects when the user enters the Konami Code sequence
 * 
 * @param {UseKonamiCodeOptions} options - Configuration options
 * @returns {object} - Konami code state and control methods
 */
export default function useKonamiCode({
  onComplete,
  resetOnComplete = true
}: UseKonamiCodeOptions = {}) {
  // Track the sequence of keys that have been pressed
  const [sequence, setSequence] = useState<string[]>([]);
  // Track if the Konami Code has been activated
  const [konamiActivated, setKonamiActivated] = useState(false);
  
  // Check if the current sequence matches the Konami Code
  const checkKonamiCode = useCallback(() => {
    // Compare the current sequence with the Konami Code
    const isKonamiCode = sequence.length === KONAMI_CODE.length &&
      sequence.every((key, index) => key === KONAMI_CODE[index]);
    
    if (isKonamiCode && !konamiActivated) {
      // Activate the Konami Code
      setKonamiActivated(true);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Reset the sequence if configured to do so
      if (resetOnComplete) {
        setSequence([]);
      }
    }
    
    return isKonamiCode;
  }, [sequence, konamiActivated, onComplete, resetOnComplete]);
  
  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Use event.code for better key identification
    const key = event.code;
    
    // Get the expected next key in the sequence
    const expectedKey = KONAMI_CODE[sequence.length];
    
    if (key === expectedKey) {
      // Key matches the next expected key in the sequence
      const newSequence = [...sequence, key];
      setSequence(newSequence);
      
      // If the sequence is complete, check if it's the Konami Code
      if (newSequence.length === KONAMI_CODE.length) {
        checkKonamiCode();
      }
    } else {
      // Incorrect key, reset the sequence
      // If the key is the first key of the Konami Code, start a new sequence
      if (key === KONAMI_CODE[0]) {
        setSequence([key]);
      } else {
        setSequence([]);
      }
    }
  }, [sequence, checkKonamiCode]);
  
  // Reset the Konami Code state
  const reset = useCallback(() => {
    setSequence([]);
    setKonamiActivated(false);
  }, []);
  
  // Set up the event listener when the component mounts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return {
    konamiActivated,
    sequence,
    progress: sequence.length / KONAMI_CODE.length,
    reset
  };
}