/**
 * PKL-278651-COMM-0006-HUB-SDK
 * Community Context Provider
 * 
 * This file provides the context provider for community-related state and operations.
 */

import React, { createContext, useContext, useState } from "react";
import { useLocation } from "wouter";
import { Community } from "@/types/community";
import { toast } from "@/hooks/use-toast";
import { useJoinCommunity, useLeaveCommunity, useCommunity } from "../hooks/useCommunity";

interface CommunityContextType {
  currentCommunityId: number | null;
  setCurrentCommunityId: (id: number | null) => void;
  
  // Actions
  viewCommunity: (id: number) => void;
  joinCommunity: (id: number, message?: string) => void;
  leaveCommunity: (id: number) => void;
  
  // State
  isJoining: boolean;
  isLeaving: boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [currentCommunityId, setCurrentCommunityId] = useState<number | null>(null);
  const [, navigate] = useLocation();
  
  // Mutations
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  
  // Actions
  const viewCommunity = (id: number) => {
    setCurrentCommunityId(id);
    navigate(`/communities/${id}`);
  };
  
  const joinCommunity = (communityId: number, message?: string) => {
    joinMutation.mutate({ communityId, message });
  };
  
  const leaveCommunity = (communityId: number) => {
    leaveMutation.mutate(communityId);
  };
  
  const value = {
    currentCommunityId,
    setCurrentCommunityId,
    viewCommunity,
    joinCommunity,
    leaveCommunity,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
  };
  
  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityContext() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunityContext must be used within a CommunityProvider");
  }
  return context;
}

/**
 * Hook that combines community context with data from the API
 */
export function useCommunityWithData(id: number) {
  const context = useCommunityContext();
  const { data: community, isLoading, error } = useCommunity(id);
  
  // Set the current community ID in the context when this hook is used
  React.useEffect(() => {
    if (id && id !== context.currentCommunityId) {
      context.setCurrentCommunityId(id);
    }
  }, [id, context]);
  
  return {
    ...context,
    community,
    isLoading,
    error,
  };
}