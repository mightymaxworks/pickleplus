/**
 * PKL-278651-XP-0002-UI
 * useXpProgress Hook
 * 
 * Custom hook to fetch and manage XP progress data. Supports tracking level changes
 * and triggering level-up notifications.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { XpProgressData } from '../components/XpProgressTracker';

interface UseXpProgressOptions {
  userId?: number;
  enableLevelUpDetection?: boolean;
  refetchInterval?: number | false;
}

interface UseXpProgressReturn {
  xpProgress: XpProgressData | undefined;
  isLoading: boolean;
  error: Error | null;
  hasLeveledUp: boolean;
  previousLevel: number;
  dismissLevelUp: () => void;
  refetch: () => void;
}

/**
 * useXpProgress Hook
 * 
 * Fetches and manages XP progress data with level-up tracking
 */
const useXpProgress = ({
  userId,
  enableLevelUpDetection = true,
  refetchInterval = false
}: UseXpProgressOptions = {}): UseXpProgressReturn => {
  // Track if user has leveled up
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(0);
  
  // Keep track of the last seen level
  const lastLevelRef = useRef<number | null>(null);
  
  // Fetch XP progress data
  const {
    data: xpProgress,
    isLoading,
    error,
    refetch
  } = useQuery<XpProgressData>({
    queryKey: ['/api/xp/progress', userId],
    enabled: true,
    refetchInterval,
  });
  
  // Detect level ups
  useEffect(() => {
    if (!enableLevelUpDetection || !xpProgress) return;
    
    const currentLevel = xpProgress.currentLevel;
    
    // If we have a last level and the current level is higher
    if (
      lastLevelRef.current !== null && 
      currentLevel > lastLevelRef.current
    ) {
      setPreviousLevel(lastLevelRef.current);
      setHasLeveledUp(true);
    }
    
    // Update last seen level
    lastLevelRef.current = currentLevel;
  }, [xpProgress, enableLevelUpDetection]);
  
  // Function to dismiss level up notification
  const dismissLevelUp = () => {
    setHasLeveledUp(false);
  };
  
  return {
    xpProgress,
    isLoading,
    error,
    hasLeveledUp,
    previousLevel,
    dismissLevelUp,
    refetch
  };
};

export default useXpProgress;