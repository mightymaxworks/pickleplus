/**
 * PKL-278651-GAME-0001-MOD
 * useDiscoveryTracking Hook
 * 
 * This hook tracks user discoveries and provides progress information.
 */

import { useState, useEffect, useCallback } from 'react';

// Types for the hook
export interface DiscoveryItem {
  id: number;
  code: string;
  name: string;
  discovered: boolean;
  discoveredAt?: Date;
}

export interface DiscoveryCampaign {
  id: number;
  name: string;
  description: string;
  discoveries: DiscoveryItem[];
  completionPercentage: number;
  isComplete: boolean;
}

export interface UseDiscoveryTrackingOptions {
  campaignId?: number;
  onCampaignComplete?: (campaignId: number) => void;
  localStorageKey?: string;
}

/**
 * useDiscoveryTracking Hook
 * 
 * Tracks user discoveries and provides progress information.
 * Can persist progress to localStorage optionally.
 * 
 * @param {UseDiscoveryTrackingOptions} options - Configuration options
 * @returns {object} - Methods and state for discovery tracking
 */
export default function useDiscoveryTracking({
  campaignId,
  onCampaignComplete,
  localStorageKey = 'pickle_plus_discoveries'
}: UseDiscoveryTrackingOptions = {}) {
  // State to track discoveries
  const [campaigns, setCampaigns] = useState<DiscoveryCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current campaign if an ID is provided
  const currentCampaign = campaignId 
    ? campaigns.find(c => c.id === campaignId) 
    : campaigns[0];
  
  // Load discoveries from localStorage on mount
  useEffect(() => {
    try {
      setLoading(true);
      const savedData = localStorage.getItem(localStorageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          setCampaigns(parsedData);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading discovery data:', err);
      setError('Failed to load discovery data');
      setLoading(false);
    }
  }, [localStorageKey]);
  
  // Save discoveries to localStorage when they change
  useEffect(() => {
    if (campaigns.length > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(campaigns));
      } catch (err) {
        console.error('Error saving discovery data:', err);
        setError('Failed to save discovery data');
      }
    }
  }, [campaigns, localStorageKey]);
  
  // Track a discovery
  const trackDiscovery = useCallback((discoveryCode: string) => {
    setCampaigns(prevCampaigns => {
      // Create a copy of the campaigns
      const updatedCampaigns = [...prevCampaigns];
      
      // Find the campaign containing this discovery
      let found = false;
      for (const campaign of updatedCampaigns) {
        const discoveryIndex = campaign.discoveries.findIndex(d => d.code === discoveryCode);
        
        if (discoveryIndex >= 0) {
          found = true;
          
          // Skip if already discovered
          if (campaign.discoveries[discoveryIndex].discovered) {
            return prevCampaigns;
          }
          
          // Mark as discovered
          campaign.discoveries[discoveryIndex] = {
            ...campaign.discoveries[discoveryIndex],
            discovered: true,
            discoveredAt: new Date()
          };
          
          // Update campaign completion metrics
          const discoveredCount = campaign.discoveries.filter(d => d.discovered).length;
          const totalCount = campaign.discoveries.length;
          const newCompletionPercentage = Math.round((discoveredCount / totalCount) * 100);
          const wasComplete = campaign.isComplete;
          const isNowComplete = discoveredCount === totalCount;
          
          campaign.completionPercentage = newCompletionPercentage;
          campaign.isComplete = isNowComplete;
          
          // If campaign was just completed, trigger callback
          if (!wasComplete && isNowComplete && onCampaignComplete) {
            onCampaignComplete(campaign.id);
          }
          
          break;
        }
      }
      
      if (!found) {
        console.warn(`Discovery code not found in any campaign: ${discoveryCode}`);
        return prevCampaigns;
      }
      
      return updatedCampaigns;
    });
  }, [onCampaignComplete]);
  
  // Reset all discoveries or for a specific campaign
  const resetDiscoveries = useCallback((specificCampaignId?: number) => {
    setCampaigns(prevCampaigns => {
      // If no specific campaign ID, reset all
      if (specificCampaignId === undefined) {
        return prevCampaigns.map(campaign => ({
          ...campaign,
          completionPercentage: 0,
          isComplete: false,
          discoveries: campaign.discoveries.map(d => ({
            ...d,
            discovered: false,
            discoveredAt: undefined
          }))
        }));
      }
      
      // Otherwise reset just the specified campaign
      return prevCampaigns.map(campaign => {
        if (campaign.id === specificCampaignId) {
          return {
            ...campaign,
            completionPercentage: 0,
            isComplete: false,
            discoveries: campaign.discoveries.map(d => ({
              ...d,
              discovered: false,
              discoveredAt: undefined
            }))
          };
        }
        return campaign;
      });
    });
  }, []);
  
  // Add a new campaign
  const addCampaign = useCallback((campaign: Omit<DiscoveryCampaign, 'completionPercentage' | 'isComplete'>) => {
    setCampaigns(prevCampaigns => [
      ...prevCampaigns,
      {
        ...campaign,
        completionPercentage: 0,
        isComplete: false
      }
    ]);
  }, []);
  
  // Calculate stats for all campaigns
  const totalStats = campaigns.reduce((stats, campaign) => {
    const discoveredCount = campaign.discoveries.filter(d => d.discovered).length;
    const totalCount = campaign.discoveries.length;
    
    return {
      totalDiscoveries: stats.totalDiscoveries + totalCount,
      discoveredCount: stats.discoveredCount + discoveredCount,
      completedCampaigns: stats.completedCampaigns + (campaign.isComplete ? 1 : 0)
    };
  }, {
    totalDiscoveries: 0,
    discoveredCount: 0,
    completedCampaigns: 0
  });
  
  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    totalStats,
    trackDiscovery,
    resetDiscoveries,
    addCampaign
  };
}