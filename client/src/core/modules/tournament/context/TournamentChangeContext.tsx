/**
 * PKL-278651-TOURN-0015-SYNC
 * Enhanced Tournament Change Context
 * 
 * This context provides a reliable way to notify components that a tournament has been created or updated
 * Framework 5.0: Enhanced with specific change types, event tracking, and optimized refresh mechanisms
 */

import { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';

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
  metadata?: Record<string, unknown>; // Additional data about the change
}

// Store multiple change events to prevent race conditions
interface EventsStore {
  globalTimestamp: number;
  events: TournamentChangeEvent[];
  maxEvents: number;
}

interface TournamentChangeContextType {
  // Read-only access to change state
  lastChangeTimestamp: number;
  lastChangeEvent: TournamentChangeEvent | null;
  
  // Change notification methods
  notifyTournamentChanged: () => void;
  notifySpecificChange: (changeType: TournamentChangeType, entityId?: number, metadata?: Record<string, unknown>) => void;
  
  // Change detection methods
  isChangedSince: (timestamp: number, changeType?: TournamentChangeType, entityId?: number) => boolean;
  getChangesSince: (timestamp: number) => TournamentChangeEvent[];
  
  // Utilities
  clearChangeEvents: () => void;
}

const TournamentChangeContext = createContext<TournamentChangeContextType | undefined>(undefined);

interface TournamentChangeProviderProps {
  children: ReactNode;
  maxEventsToStore?: number;
}

export function TournamentChangeProvider({ 
  children, 
  maxEventsToStore = 50
}: TournamentChangeProviderProps) {
  // Use ref for event storage to prevent unnecessary re-renders
  const eventsStoreRef = useRef<EventsStore>({
    globalTimestamp: Date.now(),
    events: [],
    maxEvents: maxEventsToStore
  });
  
  // State for the last event to trigger UI updates when needed
  const [lastChangeEvent, setLastChangeEvent] = useState<TournamentChangeEvent | null>(null);
  
  console.log(`[PKL-278651-TOURN-0015-SYNC][Context] TournamentChangeProvider initialized at ${new Date().toISOString()}`);

  // Generic function to notify that a tournament has been changed (backward compatibility)
  const notifyTournamentChanged = useCallback(() => {
    const newTimestamp = Date.now();
    const newEvent: TournamentChangeEvent = {
      type: 'tournament_updated',
      timestamp: newTimestamp
    };
    
    console.log(`[PKL-278651-TOURN-0015-SYNC][Context] Tournament change notified at ${new Date(newTimestamp).toISOString()}`);
    
    // Update the events store
    eventsStoreRef.current.globalTimestamp = newTimestamp;
    eventsStoreRef.current.events.push(newEvent);
    
    // Trim events array if it exceeds the maximum size
    if (eventsStoreRef.current.events.length > eventsStoreRef.current.maxEvents) {
      eventsStoreRef.current.events = eventsStoreRef.current.events.slice(
        eventsStoreRef.current.events.length - eventsStoreRef.current.maxEvents
      );
    }
    
    // Update last event state to trigger UI updates
    setLastChangeEvent(newEvent);
  }, []);

  // Enhanced specific change notification with event type and ID
  const notifySpecificChange = useCallback((
    changeType: TournamentChangeType, 
    entityId?: number,
    metadata?: Record<string, unknown>
  ) => {
    const newTimestamp = Date.now();
    const newEvent: TournamentChangeEvent = {
      type: changeType,
      entityId,
      timestamp: newTimestamp,
      metadata
    };
    
    console.log(
      `[PKL-278651-TOURN-0015-SYNC][Context] Specific change notified: ${changeType}`, 
      entityId ? `for entity ${entityId}` : '', 
      `at ${new Date(newTimestamp).toISOString()}`
    );
    
    // Update the events store
    eventsStoreRef.current.globalTimestamp = newTimestamp;
    eventsStoreRef.current.events.push(newEvent);
    
    // Trim events array if it exceeds the maximum size
    if (eventsStoreRef.current.events.length > eventsStoreRef.current.maxEvents) {
      eventsStoreRef.current.events = eventsStoreRef.current.events.slice(
        eventsStoreRef.current.events.length - eventsStoreRef.current.maxEvents
      );
    }
    
    // Update last event state to trigger UI updates
    setLastChangeEvent(newEvent);
  }, []);

  // Check if there was a change since a given timestamp, with optional filtering by type and entity
  const isChangedSince = useCallback((
    timestamp: number, 
    changeType?: TournamentChangeType, 
    entityId?: number
  ): boolean => {
    // If the timestamp is in the future or invalid, return false
    if (!timestamp || timestamp > Date.now()) {
      return false;
    }
    
    // First check against global timestamp for quick rejection
    if (eventsStoreRef.current.globalTimestamp <= timestamp) {
      return false;
    }
    
    // If no specific change type is requested, we already know there was a change
    if (!changeType) {
      return true;
    }
    
    // Otherwise, find a matching event in the events array
    return eventsStoreRef.current.events.some(event => {
      // Event must be newer than the timestamp
      if (event.timestamp <= timestamp) {
        return false;
      }
      
      // Event type must match
      if (event.type !== changeType) {
        return false;
      }
      
      // If entity ID is specified, it must match (undefined entityId matches any event)
      if (entityId !== undefined && event.entityId !== undefined) {
        return event.entityId === entityId;
      }
      
      // If we're not checking entity ID or the event doesn't have one
      return true;
    });
  }, []);

  // Get all changes since a given timestamp
  const getChangesSince = useCallback((timestamp: number): TournamentChangeEvent[] => {
    // If the timestamp is in the future or invalid, return empty array
    if (!timestamp || timestamp > Date.now()) {
      return [];
    }
    
    // Return all events newer than the timestamp
    return eventsStoreRef.current.events.filter(event => event.timestamp > timestamp);
  }, []);

  // Clear all change events (useful for testing or resetting state)
  const clearChangeEvents = useCallback(() => {
    const newTimestamp = Date.now();
    eventsStoreRef.current = {
      globalTimestamp: newTimestamp,
      events: [],
      maxEvents: eventsStoreRef.current.maxEvents
    };
    setLastChangeEvent(null);
    console.log(`[PKL-278651-TOURN-0015-SYNC][Context] Change events cleared at ${new Date(newTimestamp).toISOString()}`);
  }, []);

  // Exposed context value with memoized functions
  const contextValue: TournamentChangeContextType = {
    lastChangeTimestamp: eventsStoreRef.current.globalTimestamp,
    lastChangeEvent,
    notifyTournamentChanged,
    notifySpecificChange,
    isChangedSince,
    getChangesSince,
    clearChangeEvents
  };

  return (
    <TournamentChangeContext.Provider value={contextValue}>
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