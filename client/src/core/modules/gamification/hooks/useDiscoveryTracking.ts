/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTracking Hook
 * 
 * A hook that tracks discoveries for a specific campaign.
 */

import { useMemo } from 'react';
import { useGamification } from '../context/GamificationContext';

interface UseDiscoveryTrackingOptions {
  campaignId?: number;
}

interface UseDiscoveryTrackingResult {
  totalDiscoveries: number;
  discoveredCount: number;
  completionPercentage: number;
  isComplete: boolean;
  discoveredCodes: string[];
  getNextHint: () => string | null;
}

export default function useDiscoveryTracking({
  campaignId
}: UseDiscoveryTrackingOptions = {}): UseDiscoveryTrackingResult {
  const { state, getActiveCampaignIds, getCampaignProgress } = useGamification();
  
  // Get active campaign IDs if not specified
  const activeCampaignIds = useMemo(() => {
    return campaignId ? [campaignId] : getActiveCampaignIds();
  }, [campaignId, getActiveCampaignIds]);
  
  // Calculate total stats across all specified campaigns
  const stats = useMemo(() => {
    let totalDiscoveries = 0;
    let discoveredCount = 0;
    const discoveredCodes: string[] = [];
    
    // Process each campaign
    activeCampaignIds.forEach(id => {
      const progress = getCampaignProgress(id);
      if (progress) {
        totalDiscoveries += progress.totalDiscoveries;
        discoveredCount += progress.discoveredCount;
      }
    });
    
    // Get all discovered codes
    Object.entries(state.userDiscoveries).forEach(([code, status]) => {
      if (status.discovered) {
        discoveredCodes.push(code);
      }
    });
    
    const completionPercentage = totalDiscoveries > 0 
      ? Math.round((discoveredCount / totalDiscoveries) * 100) 
      : 0;
      
    const isComplete = completionPercentage >= 100;
    
    return {
      totalDiscoveries,
      discoveredCount,
      completionPercentage,
      isComplete,
      discoveredCodes
    };
  }, [activeCampaignIds, getCampaignProgress, state.userDiscoveries]);
  
  // Get next hint (simplified placeholder implementation)
  const getNextHint = (): string | null => {
    // In a real implementation, this would look up available hints
    // based on the user's current progress and return an appropriate hint
    
    // For now, return a placeholder message based on progress
    if (stats.isComplete) {
      return null; // No more hints if complete
    }
    
    if (stats.completionPercentage > 75) {
      return "You're almost there! Look for hidden interactions in areas you haven't explored yet.";
    } else if (stats.completionPercentage > 50) {
      return "You're making great progress! Try using keyboard shortcuts or exploring the settings.";
    } else if (stats.completionPercentage > 25) {
      return "Keep exploring! Some discoveries may be hidden in profile-related features.";
    } else {
      return "Just starting out? Try clicking on logos or exploring the landing page carefully.";
    }
  };
  
  return {
    ...stats,
    getNextHint
  };
}