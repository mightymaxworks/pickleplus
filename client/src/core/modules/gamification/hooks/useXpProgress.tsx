/**
 * PKL-278651-XP-0002-UI
 * useXpProgress Hook
 * 
 * This hook provides XP data and level progression for a user.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

// Define types
export interface XpProgressData {
  currentXp: number;
  currentLevel: number;
  nextLevelXp: number;
  totalXpForCurrentLevel: number;
  levelName: string;
  levelBenefits: string[];
  isKeyLevel: boolean;
}

export interface XpTransaction {
  id: number;
  amount: number;
  source: string;
  timestamp: string;
  details?: string;
  multiplier?: number;
}

function useXpProgress() {
  // This would be fetched from the API in a real implementation
  const [xpData, setXpData] = useState<XpProgressData>({
    currentXp: 520,
    currentLevel: 5,
    nextLevelXp: 750,
    totalXpForCurrentLevel: 400,
    levelName: "Skilled Enthusiast",
    levelBenefits: [
      "Access to tournament creation",
      "Custom profile badge"
    ],
    isKeyLevel: false
  });

  const [transactions, setTransactions] = useState<XpTransaction[]>([
    {
      id: 1,
      amount: 5,
      source: 'match_played',
      timestamp: '2025-04-18T14:35:00Z',
      details: 'Match against David Johnson',
      multiplier: 1
    },
    {
      id: 2,
      amount: 3,
      source: 'first_daily_match',
      timestamp: '2025-04-18T14:35:10Z',
      details: 'First match of the day bonus'
    },
    {
      id: 3,
      amount: 2,
      source: 'match_win',
      timestamp: '2025-04-18T14:35:20Z',
      details: 'Victory bonus'
    },
    {
      id: 4,
      amount: 1,
      source: 'community_post',
      timestamp: '2025-04-17T10:22:00Z',
      details: 'Posted in Chicago Picklers'
    },
    {
      id: 5,
      amount: 10,
      source: 'tournament_completion',
      timestamp: '2025-04-15T16:45:00Z',
      details: 'Completed Spring Tournament',
      multiplier: 1.5
    }
  ]);

  const [isLevelUp, setIsLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(0);

  // This simulates detecting a level-up event
  useEffect(() => {
    // For demo purposes, don't actually show the level up automatically
    // Just make it ready for manual triggering
    if (xpData && !previousLevel) {
      setPreviousLevel(xpData.currentLevel - 1);
    }
  }, [xpData, previousLevel]);

  // Level-up simulation (for demo only)
  const simulateLevelUp = () => {
    setIsLevelUp(true);
  };

  // Dismiss level-up notification
  const dismissLevelUp = () => {
    setIsLevelUp(false);
  };

  // Calculate level progress within current level
  const levelProgress = xpData.currentXp - xpData.totalXpForCurrentLevel;
  const nextLevelThreshold = xpData.nextLevelXp - xpData.totalXpForCurrentLevel;
  const progressPercentage = Math.round((levelProgress / nextLevelThreshold) * 100);
  const xpToNextLevel = xpData.nextLevelXp - xpData.currentXp;

  return {
    xpData,
    transactions,
    isLevelUp,
    previousLevel,
    levelProgress,
    nextLevelThreshold,
    progressPercentage,
    xpToNextLevel,
    simulateLevelUp,
    dismissLevelUp
  };
}

export default useXpProgress;