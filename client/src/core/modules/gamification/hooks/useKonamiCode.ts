/**
 * PKL-278651-GAME-0001-MOD
 * useKonamiCode Hook
 * 
 * A hook that listens for the Konami Code keyboard sequence and triggers a callback when detected.
 * The Konami Code is: Up, Up, Down, Down, Left, Right, Left, Right, B, A
 */

import { useState, useEffect, useCallback } from 'react';

interface UseKonamiCodeProps {
  onKonami: () => void;
  allowMultipleTriggers?: boolean;
  resetTimeout?: number;
}

// Define the key sequence for the Konami Code
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

/**
 * A hook that listens for the Konami Code keyboard sequence and triggers a callback when detected.
 * 
 * @param {UseKonamiCodeProps} props - The hook properties
 * @param {Function} props.onKonami - Callback function to trigger when the Konami Code is detected
 * @param {boolean} [props.allowMultipleTriggers=false] - Whether to allow the code to be triggered multiple times
 * @param {number} [props.resetTimeout=10000] - Time in milliseconds to reset the sequence if not completed
 * @returns {boolean} - Whether the Konami Code was triggered
 */
export default function useKonamiCode({
  onKonami,
  allowMultipleTriggers = false,
  resetTimeout = 10000
}: UseKonamiCodeProps): boolean {
  // State to track the current position in the sequence
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  
  // State to track whether the Konami Code was triggered
  const [konamiTriggered, setKonamiTriggered] = useState(false);
  
  // Timer reference for sequence reset
  const [resetTimer, setResetTimer] = useState<number | null>(null);
  
  // Handle key press events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // If already triggered and multiple triggers not allowed, exit
      if (konamiTriggered && !allowMultipleTriggers) return;
      
      // Get the pressed key
      const key = event.key.toLowerCase();
      
      // Update keys pressed
      const updatedKeysPressed = [...keysPressed, key];
      setKeysPressed(updatedKeysPressed);
      
      // Reset the timer
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      
      // Start a new reset timer
      const newTimer = window.setTimeout(() => {
        setKeysPressed([]);
      }, resetTimeout);
      
      setResetTimer(newTimer);
      
      // Check if the Konami Code sequence is matched
      const codeMatched = isKonamiCodeMatched(updatedKeysPressed);
      
      if (codeMatched) {
        // Trigger the callback
        onKonami();
        
        // Mark as triggered
        setKonamiTriggered(true);
        
        // Reset the sequence
        setKeysPressed([]);
        
        // Reset the triggered state after a delay if multiple triggers are allowed
        if (allowMultipleTriggers) {
          setTimeout(() => {
            setKonamiTriggered(false);
          }, 1000);
        }
      }
    },
    [keysPressed, konamiTriggered, allowMultipleTriggers, onKonami, resetTimer, resetTimeout]
  );
  
  // Check if the Konami Code sequence is matched
  const isKonamiCodeMatched = (keys: string[]): boolean => {
    // Must have at least as many keys as the Konami Code
    if (keys.length < KONAMI_CODE.length) return false;
    
    // Get the last n keys where n is the length of the Konami Code
    const lastKeys = keys.slice(keys.length - KONAMI_CODE.length);
    
    // Check if the last keys match the Konami Code
    for (let i = 0; i < KONAMI_CODE.length; i++) {
      if (lastKeys[i].toLowerCase() !== KONAMI_CODE[i].toLowerCase()) {
        return false;
      }
    }
    
    return true;
  };
  
  // Add and remove the event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clear any existing timer
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
    };
  }, [handleKeyDown, resetTimer]);
  
  return konamiTriggered;
}