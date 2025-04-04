import { useState, useEffect, useCallback } from 'react';

// Define the Konami code sequence
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export function useKonamiCode() {
  const [konamiDetected, setKonamiDetected] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  
  // Reset the sequence and detection state
  const reset = useCallback(() => {
    setSequence([]);
    setKonamiDetected(false);
  }, []);
  
  // Handle keydown events to track the sequence
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Get the key from the event
    const key = event.key.toLowerCase();
    
    // Create a new sequence by adding the new key and removing old keys if needed
    let newSequence = [...sequence, event.key];
    
    // Only keep last N keys where N is the length of the Konami code
    if (newSequence.length > KONAMI_CODE.length) {
      newSequence = newSequence.slice(newSequence.length - KONAMI_CODE.length);
    }
    
    // Update the sequence
    setSequence(newSequence);
    
    // Check if the sequence matches the Konami code
    const isKonamiCode = KONAMI_CODE.every((code, index) => {
      const keyToCheck = newSequence[index];
      return keyToCheck && keyToCheck.toLowerCase() === code.toLowerCase();
    });
    
    // If the Konami code is detected, set the state
    if (isKonamiCode && !konamiDetected && newSequence.length === KONAMI_CODE.length) {
      setKonamiDetected(true);
    }
  }, [sequence, konamiDetected]);
  
  // Set up the event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return { konamiDetected, reset };
}