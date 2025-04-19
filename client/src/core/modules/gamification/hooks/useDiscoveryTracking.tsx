/**
 * PKL-278651-XP-0002-UI
 * useDiscoveryTracking Hook
 * 
 * This hook provides functionality for tracking user discoveries and easter eggs.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

// Define the discovery type
export interface Discovery {
  id: number;
  code: string;
  name: string;
  discovered: boolean;
  timestamp?: string;
}

// Define the campaign type
export interface DiscoveryCampaign {
  id: number;
  name: string;
  description: string;
  discoveries: Discovery[];
  isCompleted?: boolean;
  progress?: number;
}

interface UseDiscoveryTrackingProps {
  campaignId?: number;
  localStorageKey?: string;
  onCampaignComplete?: () => void;
}

export function useDiscoveryTracking({
  campaignId,
  localStorageKey = 'pickle_plus_discoveries',
  onCampaignComplete
}: UseDiscoveryTrackingProps = {}) {
  // State for tracking campaigns and discoveries
  const [campaigns, setCampaigns] = useState<DiscoveryCampaign[]>([]);

  // Load existing discovery data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(localStorageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCampaigns(parsedData);
      } catch (error) {
        console.error('Error loading discovery data:', error);
      }
    }
  }, [localStorageKey]);

  // Save discovery data to localStorage when it changes
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(campaigns));
    }
  }, [campaigns, localStorageKey]);

  // Add a new discovery campaign
  const addCampaign = useCallback((campaign: DiscoveryCampaign) => {
    setCampaigns(prev => {
      // Check if campaign already exists
      const exists = prev.some(c => c.id === campaign.id);
      if (exists) {
        return prev;
      }
      
      // Calculate campaign progress
      const discoveredCount = campaign.discoveries.filter(d => d.discovered).length;
      const progress = Math.round((discoveredCount / campaign.discoveries.length) * 100);
      
      // Add new campaign with progress
      return [
        ...prev,
        {
          ...campaign,
          isCompleted: progress === 100,
          progress
        }
      ];
    });
  }, []);

  // Track a discovery
  const trackDiscovery = useCallback((code: string) => {
    setCampaigns(prev => {
      // Find relevant campaign(s) containing this discovery code
      const newCampaigns = prev.map(campaign => {
        const discoveryIndex = campaign.discoveries.findIndex(d => d.code === code);
        
        // If discovery not found in this campaign or already discovered, return campaign unchanged
        if (discoveryIndex === -1 || campaign.discoveries[discoveryIndex].discovered) {
          return campaign;
        }
        
        // Create new discoveries array with this discovery marked as discovered
        const newDiscoveries = [...campaign.discoveries];
        newDiscoveries[discoveryIndex] = {
          ...newDiscoveries[discoveryIndex],
          discovered: true,
          timestamp: new Date().toISOString()
        };
        
        // Calculate new progress
        const discoveredCount = newDiscoveries.filter(d => d.discovered).length;
        const progress = Math.round((discoveredCount / newDiscoveries.length) * 100);
        const isCompleted = progress === 100;
        
        // Handle campaign completion
        if (isCompleted && !campaign.isCompleted && onCampaignComplete && campaign.id === campaignId) {
          // Use setTimeout to avoid calling during render
          setTimeout(() => {
            onCampaignComplete();
          }, 0);
        }
        
        return {
          ...campaign,
          discoveries: newDiscoveries,
          progress,
          isCompleted
        };
      });
      
      return newCampaigns;
    });
  }, [campaignId, onCampaignComplete]);

  // Check if a specific discovery has been made
  const isDiscovered = useCallback((code: string): boolean => {
    return campaigns.some(campaign => 
      campaign.discoveries.some(d => d.code === code && d.discovered)
    );
  }, [campaigns]);

  // Get campaign progress
  const getCampaignProgress = useCallback((id: number): number => {
    const campaign = campaigns.find(c => c.id === id);
    return campaign?.progress || 0;
  }, [campaigns]);

  // Check if a campaign is completed
  const isCampaignCompleted = useCallback((id: number): boolean => {
    const campaign = campaigns.find(c => c.id === id);
    return campaign?.isCompleted || false;
  }, [campaigns]);

  return {
    campaigns,
    addCampaign,
    trackDiscovery,
    isDiscovered,
    getCampaignProgress,
    isCampaignCompleted
  };
}

export default useDiscoveryTracking;