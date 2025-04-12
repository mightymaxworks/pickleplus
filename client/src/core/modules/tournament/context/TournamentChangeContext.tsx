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
  | 'tournament_deleted'
  | 'bracket_created'
  | 'bracket_updated'
  | 'bracket_deleted'
  | 'bracket_published'
  | 'teams_seeded'
  | 'teams_unseeded'
  | 'match_result_recorded'
  | 'match_result_updated'
  | 'match_result_deleted'
  | 'team_registered'
  | 'team_unregistered'
  | 'bracket_structure_changed'
  | 'match_teams_changed'
  | 'match_date_changed';

/**
 * Standardized event interface with detailed metadata for Framework 5.0 state tracking
 */
interface TournamentChangeEvent {
  type: TournamentChangeType;
  entityId?: number; // ID of the affected entity (tournament, bracket, etc.)
  timestamp: number;
  origin?: 'user_action' | 'system' | 'api_response' | 'background_sync'; // Source of the change
  severity?: 'low' | 'medium' | 'high' | 'critical'; // Importance of the change for prioritization
  relatedEntityIds?: number[]; // Other entities affected by this change
  isDelayedNotification?: boolean; // Flag for events sent as part of race condition prevention
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
  notifySpecificChange: (
    changeType: TournamentChangeType, 
    entityId?: number, 
    metadata?: Record<string, unknown>,
    options?: {
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      relatedEntityIds?: number[];
      isDelayedNotification?: boolean;
    }
  ) => void;
  
  // Change detection methods
  isChangedSince: (
    timestamp: number, 
    changeType?: TournamentChangeType, 
    entityId?: number,
    options?: {
      includeRelatedEntities?: boolean;
      minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
    }
  ) => boolean;
  
  getChangesSince: (
    timestamp: number,
    options?: {
      changeTypes?: TournamentChangeType[];
      entityIds?: number[];
      includeRelatedEntities?: boolean;
      minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
      excludeDelayedNotifications?: boolean;
    }
  ) => TournamentChangeEvent[];
  
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

  // Helper function to create and process change events (internal use only)
  const processChangeEvent = (
    type: TournamentChangeType,
    entityId?: number,
    metadata?: Record<string, unknown>,
    options?: {
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      relatedEntityIds?: number[];
      isDelayedNotification?: boolean;
    }
  ) => {
    const newTimestamp = Date.now();
    
    // Create enhanced event with all Framework 5.0 properties
    const newEvent: TournamentChangeEvent = {
      type,
      entityId,
      timestamp: newTimestamp,
      origin: options?.origin || 'system',
      severity: options?.severity || 'medium',
      relatedEntityIds: options?.relatedEntityIds,
      isDelayedNotification: options?.isDelayedNotification || false,
      metadata
    };
    
    // Log the event creation
    console.log(
      `[PKL-278651-TOURN-0015-SYNC][Context] Change notified: ${type}`, 
      entityId ? `for entity ${entityId}` : '', 
      `at ${new Date(newTimestamp).toISOString()}`,
      newEvent.origin ? `origin: ${newEvent.origin}` : '',
      newEvent.severity ? `severity: ${newEvent.severity}` : '',
      newEvent.isDelayedNotification ? '(delayed notification)' : ''
    );
    
    // Log related entities when available
    if (newEvent.relatedEntityIds && newEvent.relatedEntityIds.length > 0) {
      console.log(`[PKL-278651-TOURN-0015-SYNC][Context] Related entities:`, newEvent.relatedEntityIds);
    }
    
    // Update the events store with optimized insertion
    eventsStoreRef.current.globalTimestamp = newTimestamp;
    eventsStoreRef.current.events.push(newEvent);
    
    // Trim events array if it exceeds the maximum size using efficient slice
    if (eventsStoreRef.current.events.length > eventsStoreRef.current.maxEvents) {
      const excessCount = eventsStoreRef.current.events.length - eventsStoreRef.current.maxEvents;
      eventsStoreRef.current.events = eventsStoreRef.current.events.slice(excessCount);
    }
    
    // Update last event state to trigger UI updates
    setLastChangeEvent(newEvent);
    
    return newEvent;
  };

  // Enhanced specific change notification with comprehensive Framework 5.0 event system
  const notifySpecificChange = useCallback((
    changeType: TournamentChangeType, 
    entityId?: number,
    metadata?: Record<string, unknown>,
    options?: {
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      relatedEntityIds?: number[];
      isDelayedNotification?: boolean;
    }
  ) => {
    return processChangeEvent(changeType, entityId, metadata, options);
  }, []);
  
  // Enhanced backwards compatibility function that leverages the enhanced event system
  const notifyTournamentChanged = useCallback(() => {
    // Create the primary notification
    const newEvent = processChangeEvent('tournament_updated', undefined, undefined, {
      origin: 'system',
      severity: 'medium'
    });
    
    // For greater compatibility, use a redundant refresh by triggering a secondary event after a delay
    setTimeout(() => {
      processChangeEvent('tournament_updated', undefined, undefined, {
        origin: 'system',
        severity: 'low',
        isDelayedNotification: true
      });
    }, 300);
    
    return newEvent;
  }, []);

  // Enhanced isChangedSince with comprehensive Framework 5.0 event filtering
  const isChangedSince = useCallback((
    timestamp: number, 
    changeType?: TournamentChangeType, 
    entityId?: number,
    options?: {
      includeRelatedEntities?: boolean;
      minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
    }
  ): boolean => {
    // If the timestamp is in the future or invalid, return false
    if (!timestamp || timestamp > Date.now()) {
      return false;
    }
    
    // Performance optimization: First check against global timestamp for quick rejection
    if (eventsStoreRef.current.globalTimestamp <= timestamp) {
      return false;
    }
    
    // If no specific change type is requested and we don't need to filter on additional criteria, we already know there was a change
    if (!changeType && !options) {
      return true;
    }
    
    // Map severity levels to numeric values for comparison
    const severityLevels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    
    // If minimum severity is specified, get its numeric level
    const minSeverityLevel = options?.minimumSeverity ? 
      severityLevels[options.minimumSeverity] : 0;
    
    // Find a matching event in the events array using enhanced filtering
    return eventsStoreRef.current.events.some(event => {
      // Performance optimization: Event must be newer than the timestamp (most efficient check first)
      if (event.timestamp <= timestamp) {
        return false;
      }
      
      // Only filter by type if one was specified
      if (changeType && event.type !== changeType) {
        return false;
      }
      
      // Filter by entityId if specified
      if (entityId !== undefined) {
        // If includeRelatedEntities is true, check both the direct entity and related entities
        if (options?.includeRelatedEntities && event.relatedEntityIds?.includes(entityId)) {
          // Found in related entities
        } 
        // If entity ID doesn't match directly and we're not checking related entities, or it's not in related entities
        else if (event.entityId !== entityId) {
          return false;
        }
      }
      
      // Filter by origin if specified
      if (options?.origin && event.origin !== options.origin) {
        return false;
      }
      
      // Filter by minimum severity if specified
      if (minSeverityLevel > 0 && event.severity) {
        const eventSeverityLevel = severityLevels[event.severity];
        if (eventSeverityLevel < minSeverityLevel) {
          return false;
        }
      }
      
      // If all filters pass, the event matches
      return true;
    });
  }, []);

  // Enhanced getChangesSince with Framework 5.0 filtering capabilities
  const getChangesSince = useCallback((
    timestamp: number,
    options?: {
      changeTypes?: TournamentChangeType[];
      entityIds?: number[];
      includeRelatedEntities?: boolean;
      minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
      origin?: 'user_action' | 'system' | 'api_response' | 'background_sync';
      excludeDelayedNotifications?: boolean;
    }
  ): TournamentChangeEvent[] => {
    // If the timestamp is in the future or invalid, return empty array
    if (!timestamp || timestamp > Date.now()) {
      return [];
    }
    
    // Performance optimization: Quick check if any events exist after the timestamp
    if (eventsStoreRef.current.globalTimestamp <= timestamp) {
      return [];
    }
    
    // Map severity levels to numeric values for comparison
    const severityLevels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    
    // If minimum severity is specified, get its numeric level
    const minSeverityLevel = options?.minimumSeverity ? 
      severityLevels[options.minimumSeverity] : 0;
    
    // Return filtered events newer than the timestamp
    return eventsStoreRef.current.events.filter(event => {
      // Basic timestamp check
      if (event.timestamp <= timestamp) {
        return false;
      }
      
      // Filter by change types if specified
      if (options?.changeTypes && options.changeTypes.length > 0) {
        if (!options.changeTypes.includes(event.type)) {
          return false;
        }
      }
      
      // Filter by entityIds if specified
      if (options?.entityIds && options.entityIds.length > 0) {
        const directMatch = event.entityId !== undefined && options.entityIds.includes(event.entityId);
        const relatedMatch = options.includeRelatedEntities && 
          event.relatedEntityIds && 
          event.relatedEntityIds.some(id => options.entityIds!.includes(id));
          
        if (!directMatch && !relatedMatch) {
          return false;
        }
      }
      
      // Filter by origin if specified
      if (options?.origin && event.origin !== options.origin) {
        return false;
      }
      
      // Filter by minimum severity if specified
      if (minSeverityLevel > 0 && event.severity) {
        const eventSeverityLevel = severityLevels[event.severity];
        if (eventSeverityLevel < minSeverityLevel) {
          return false;
        }
      }
      
      // Filter out delayed notifications if specified
      if (options?.excludeDelayedNotifications && event.isDelayedNotification) {
        return false;
      }
      
      // If all filters pass, include the event
      return true;
    });
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