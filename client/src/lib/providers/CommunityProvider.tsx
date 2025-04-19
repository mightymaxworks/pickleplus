/**
 * PKL-278651-COMM-0014-CONT
 * Enhanced Community Context Provider
 * 
 * This file provides the enhanced context provider for community-related state and operations.
 * It implements caching, error handling, and improved type safety for the Community Hub module.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Community, CommunityEvent, CommunityMember } from "@/types/community";
import { toast } from "@/hooks/use-toast";
import { 
  useJoinCommunity, 
  useLeaveCommunity, 
  useCommunity, 
  useCommunityEvents,
  useCommunityMembers,
  useCommunityPosts
} from "../hooks/useCommunity";
import { queryClient } from "@/lib/queryClient";

/**
 * Community context interface with enhanced type safety and additional properties
 */
interface CommunityContextType {
  // Core state
  currentCommunityId: number | null;
  setCurrentCommunityId: (id: number | null) => void;
  
  // Navigation actions
  viewCommunity: (id: number) => void;
  viewCommunityEvents: (id: number) => void;
  viewCommunityMembers: (id: number) => void;
  
  // Community membership actions
  joinCommunity: (id: number, message?: string) => void;
  leaveCommunity: (id: number) => void;
  
  // Loading states
  isJoining: boolean;
  isLeaving: boolean;
  
  // Error handling
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  
  // Cache management
  invalidateCommunityCache: (communityId?: number) => Promise<void>;
  prefetchCommunityData: (communityId: number) => Promise<void>;
}

// Create context with undefined default value
const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

/**
 * Enhanced Community Provider component
 */
export function CommunityProvider({ children }: { children: React.ReactNode }) {
  // Community state
  const [currentCommunityId, setCurrentCommunityId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [, navigate] = useLocation();
  
  // Mutations for community interactions
  const joinMutation = useJoinCommunity({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have joined the community",
        variant: "default",
      });
      // Invalidate cache to refetch community data
      invalidateCommunityCache(currentCommunityId);
    },
    onError: (error) => {
      setError(error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const leaveMutation = useLeaveCommunity({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You have left the community",
        variant: "default",
      });
      // Invalidate cache to refetch community data
      invalidateCommunityCache(currentCommunityId);
    },
    onError: (error) => {
      setError(error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Navigation actions
  const viewCommunity = useCallback((id: number) => {
    setCurrentCommunityId(id);
    navigate(`/communities/${id}`);
  }, [navigate]);
  
  const viewCommunityEvents = useCallback((id: number) => {
    setCurrentCommunityId(id);
    navigate(`/communities/${id}?tab=events`);
  }, [navigate]);
  
  const viewCommunityMembers = useCallback((id: number) => {
    setCurrentCommunityId(id);
    navigate(`/communities/${id}?tab=members`);
  }, [navigate]);
  
  // Community actions
  const joinCommunity = useCallback((communityId: number, message?: string) => {
    joinMutation.mutate({ communityId, message });
  }, [joinMutation]);
  
  const leaveCommunity = useCallback((communityId: number) => {
    leaveMutation.mutate(communityId);
  }, [leaveMutation]);
  
  // Cache management
  const invalidateCommunityCache = useCallback(async (communityId?: number) => {
    if (communityId) {
      // Invalidate specific community data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/members`] }),
        queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/posts`] })
      ]);
    } else {
      // Invalidate all community data
      await queryClient.invalidateQueries({ queryKey: ['/api/communities'] });
    }
  }, []);
  
  // Prefetch community data for smoother UX
  const prefetchCommunityData = useCallback(async (communityId: number) => {
    if (!communityId) return;
    
    try {
      await Promise.all([
        // Prefetch basic community info
        queryClient.prefetchQuery({
          queryKey: [`/api/communities/${communityId}`],
          queryFn: () => fetch(`/api/communities/${communityId}`).then(res => res.json())
        }),
        // Prefetch community events
        queryClient.prefetchQuery({
          queryKey: [`/api/communities/${communityId}/events`],
          queryFn: () => fetch(`/api/communities/${communityId}/events`).then(res => res.json())
        }),
        // Prefetch community members
        queryClient.prefetchQuery({
          queryKey: [`/api/communities/${communityId}/members`],
          queryFn: () => fetch(`/api/communities/${communityId}/members?limit=5`).then(res => res.json())
        })
      ]);
    } catch (error) {
      console.error("Error prefetching community data:", error);
    }
  }, []);
  
  // Context value
  const value = {
    currentCommunityId,
    setCurrentCommunityId,
    viewCommunity,
    viewCommunityEvents,
    viewCommunityMembers,
    joinCommunity,
    leaveCommunity,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    error,
    setError,
    clearError,
    invalidateCommunityCache,
    prefetchCommunityData
  };
  
  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

/**
 * Hook to use the community context
 * Ensures the context is used within a provider
 */
export function useCommunityContext() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunityContext must be used within a CommunityProvider");
  }
  return context;
}

/**
 * Enhanced hook that combines community context with data from the API
 * Provides automatic error handling and seamless data access
 */
export function useCommunityWithData(id: number) {
  const context = useCommunityContext();
  const { 
    data: community, 
    isLoading, 
    error,
    isError,
    refetch
  } = useCommunity(id);
  
  // Debug logging for community loading state
  useEffect(() => {
    console.log(`[PKL-278651-COMM-0017-SEARCH] useCommunityWithData(${id}):`, 
      'Loading:', isLoading, 
      'Error:', isError ? 'Yes' : 'No', 
      'Community:', community ? 'Found' : 'Not Found'
    );
    
    if (isError) {
      console.error('[PKL-278651-COMM-0017-SEARCH] Community load error:', error);
    }
  }, [id, community, isLoading, isError, error]);
  
  // Set the current community ID in the context when this hook is used
  useEffect(() => {
    if (id && id !== context.currentCommunityId) {
      context.setCurrentCommunityId(id);
      console.log(`[PKL-278651-COMM-0017-SEARCH] Setting current community ID to ${id}`);
    }
    
    // Prefetch data for smoother experience - but only if ID is valid
    if (id > 0) {
      console.log(`[PKL-278651-COMM-0017-SEARCH] Prefetching data for community ${id}`);
      context.prefetchCommunityData(id);
    }
    
    // Handle errors
    if (isError && error) {
      console.error(`[PKL-278651-COMM-0017-SEARCH] Setting error for community ${id}:`, error);
      context.setError(error as Error);
    }
    
    return () => {
      // Clean up error when unmounting
      context.clearError();
    };
  }, [id, context, error, isError]);
  
  // Add retry function for community data
  const retryLoadCommunity = useCallback(() => {
    console.log(`[PKL-278651-COMM-0017-SEARCH] Retrying load for community ${id}`);
    return refetch();
  }, [id, refetch]);
  
  return {
    ...context,
    community,
    isLoading,
    error,
    retryLoadCommunity,
    // Additional convenience fields
    isMember: community?.isMember || false,
    isAdmin: community?.role === 'admin',
    isModerator: community?.role === 'moderator',
  };
}