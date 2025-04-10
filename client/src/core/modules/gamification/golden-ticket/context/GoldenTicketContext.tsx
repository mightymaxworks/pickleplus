/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Context Provider
 * 
 * Context provider for managing golden ticket state and interactions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { checkForGoldenTicket, getGoldenTicketById, claimGoldenTicket } from '../api/goldenTicketApi';
import type { GoldenTicket, GoldenTicketClaim } from '@shared/golden-ticket.schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GoldenTicketContextType {
  currentTicket: (GoldenTicket & { 
    sponsorName?: string; 
    sponsorLogoUrl?: string;
    sponsorWebsite?: string;
  }) | null;
  isTicketVisible: boolean;
  showTicket: () => void;
  hideTicket: () => void;
  claimTicket: () => Promise<GoldenTicketClaim | null>;
  isClaimLoading: boolean;
  hasChecked: boolean;
}

const GoldenTicketContext = createContext<GoldenTicketContextType | null>(null);

/**
 * Hook for accessing the golden ticket context
 */
export const useGoldenTicket = () => {
  const context = useContext(GoldenTicketContext);
  if (!context) {
    throw new Error('useGoldenTicket must be used within a GoldenTicketProvider');
  }
  return context;
};

export const GoldenTicketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentTicket, setCurrentTicket] = useState<(GoldenTicket & { 
    sponsorName?: string; 
    sponsorLogoUrl?: string;
    sponsorWebsite?: string;
  }) | null>(null);
  const [isTicketVisible, setIsTicketVisible] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Query for checking if a golden ticket should be shown
  const { refetch } = useQuery({
    queryKey: ['golden-ticket-check'],
    queryFn: checkForGoldenTicket,
    enabled: false, // We'll manually trigger this
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Throttled function to check for golden tickets
  const checkForTicket = useCallback(
    throttle(() => {
      if (!user) return;
      
      // Check local storage for last check time
      const lastCheck = localStorage.getItem('goldenTicketLastCheck');
      const now = Date.now();
      
      // Only check if it's been at least 1 minute since the last check
      if (!lastCheck || now - parseInt(lastCheck, 10) > 60000) {
        localStorage.setItem('goldenTicketLastCheck', now.toString());
        
        refetch().then(result => {
          setHasChecked(true);
          
          if (result.data?.result === 'show-ticket' && result.data.ticketId) {
            getGoldenTicketById(result.data.ticketId).then(ticket => {
              if (ticket) {
                setCurrentTicket(ticket);
                // Auto-show after a short delay to let the page load
                setTimeout(() => {
                  setIsTicketVisible(true);
                }, 1500);
              }
            });
          }
        });
      }
    }, 5000), // Throttle to at most once every 5 seconds
    [refetch, user]
  );
  
  // Check for golden tickets on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      checkForTicket();
    };
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial check
    if (!hasChecked && user) {
      checkForTicket();
    }
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [checkForTicket, hasChecked, user]);
  
  // Show the ticket programmatically
  const showTicket = useCallback(() => {
    if (currentTicket) {
      setIsTicketVisible(true);
    }
  }, [currentTicket]);
  
  // Hide the ticket
  const hideTicket = useCallback(() => {
    setIsTicketVisible(false);
  }, []);
  
  // Claim a golden ticket
  const claimTicket = useCallback(async (): Promise<GoldenTicketClaim | null> => {
    if (!currentTicket) return null;
    
    setIsClaimLoading(true);
    try {
      const claim = await claimGoldenTicket(currentTicket.id);
      setIsClaimLoading(false);
      
      if (claim) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['golden-ticket-my-tickets'] });
        
        toast({
          title: 'Golden Ticket Claimed!',
          description: 'You have successfully claimed this golden ticket.',
          variant: 'default',
        });
      }
      
      return claim;
    } catch (error) {
      console.error('Failed to claim golden ticket:', error);
      setIsClaimLoading(false);
      
      toast({
        title: 'Claim Failed',
        description: 'There was an error claiming this ticket. Please try again.',
        variant: 'destructive',
      });
      
      return null;
    }
  }, [currentTicket, queryClient, toast]);
  
  // Clear the current ticket when the user changes
  useEffect(() => {
    if (!user) {
      setCurrentTicket(null);
      setIsTicketVisible(false);
    }
  }, [user]);
  
  return (
    <GoldenTicketContext.Provider
      value={{
        currentTicket,
        isTicketVisible,
        showTicket,
        hideTicket,
        claimTicket,
        isClaimLoading,
        hasChecked
      }}
    >
      {children}
    </GoldenTicketContext.Provider>
  );
};