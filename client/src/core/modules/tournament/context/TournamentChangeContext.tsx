/**
 * PKL-278651-TOURN-0014-SEED
 * Enhanced Tournament Change Context
 * 
 * This context provides a way to notify components that a tournament has been created or updated
 * Framework 5.0: Enhanced with specific change types and optimized refresh mechanisms
 */

import { createContext, useContext, useState, ReactNode } from 'react';

// Define different types of tournament changes for targeted refreshes
export type TournamentChangeType = 
  | 'tournament_created'
  | 'tournament_updated'
  | 'bracket_created'
  | 'bracket_updated'
  | 'teams_seeded'
  | 'match_result_recorded'
  | 'team_registered';

interface TournamentChangeEvent {
  type: TournamentChangeType;
  entityId?: number; // ID of the affected entity (tournament, bracket, etc.)
  timestamp: number;
}

interface TournamentChangeContextType {
  lastChangeTimestamp: number;
  lastChangeEvent: TournamentChangeEvent | null;
  notifyTournamentChanged: () => void;
  notifySpecificChange: (changeType: TournamentChangeType, entityId?: number) => void;
  isChangedSince: (timestamp: number, changeType?: TournamentChangeType, entityId?: number) => boolean;
}

const TournamentChangeContext = createContext<TournamentChangeContextType | undefined>(undefined);

interface TournamentChangeProviderProps {
  children: ReactNode;
}

export function TournamentChangeProvider({ children }: TournamentChangeProviderProps) {
  // Track the last time a tournament was changed with a timestamp
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState<number>(Date.now());
  // Track the specific details of the last change
  const [lastChangeEvent, setLastChangeEvent] = useState<TournamentChangeEvent | null>(null);
  
  console.log('[Context] TournamentChangeProvider initialized with timestamp:', lastChangeTimestamp);

  // Generic function to notify that a tournament has been changed (backward compatibility)
  const notifyTournamentChanged = () => {
    const newTimestamp = Date.now();
    console.log('[Context] Tournament change notified. Old timestamp:', lastChangeTimestamp, 'New timestamp:', newTimestamp);
    setLastChangeTimestamp(newTimestamp);
    setLastChangeEvent({
      type: 'tournament_updated',
      timestamp: newTimestamp
    });
  };

  // Enhanced specific change notification with event type and ID
  const notifySpecificChange = (changeType: TournamentChangeType, entityId?: number) => {
    const newTimestamp = Date.now();
    console.log(
      `[Context] Specific change notified: ${changeType}`, 
      entityId ? `for entity ${entityId}` : '', 
      `at ${new Date(newTimestamp).toISOString()}`
    );
    setLastChangeTimestamp(newTimestamp);
    setLastChangeEvent({
      type: changeType,
      entityId,
      timestamp: newTimestamp
    });
  };

  // Check if there was a change since a given timestamp, with optional filtering by type and entity
  const isChangedSince = (timestamp: number, changeType?: TournamentChangeType, entityId?: number): boolean => {
    // If no specific change type is requested, check against the global timestamp
    if (!changeType) {
      return lastChangeTimestamp > timestamp;
    }
    
    // Otherwise, check if there was a specific change event that matches the criteria
    if (lastChangeEvent && lastChangeEvent.timestamp > timestamp) {
      // First verify the change type matches
      const typeMatches = lastChangeEvent.type === changeType;
      
      // If entity ID is specified, check that too
      if (entityId !== undefined && lastChangeEvent.entityId !== undefined) {
        return typeMatches && lastChangeEvent.entityId === entityId;
      }
      
      // If we're not checking entity ID or the event doesn't have one
      return typeMatches;
    }
    
    return false;
  };

  return (
    <TournamentChangeContext.Provider
      value={{
        lastChangeTimestamp,
        lastChangeEvent,
        notifyTournamentChanged,
        notifySpecificChange,
        isChangedSince
      }}
    >
      {children}
    </TournamentChangeContext.Provider>
  );
}

// Custom hook to use the context
export function useTournamentChanges() {
  const context = useContext(TournamentChangeContext);
  
  if (context === undefined) {
    throw new Error('useTournamentChanges must be used within a TournamentChangeProvider');
  }
  
  return context;
}