/**
 * PKL-278651-JOUR-001.2: Journal Entry Hook
 * 
 * A hook that provides methods to create, read, update, and delete journal entries
 * with emotion detection and pattern analysis.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry, EmotionalState } from '../types';
import { nanoid } from 'nanoid';

/**
 * Hook for managing journal entries
 */
export function useJournalEntry() {
  // Store journal entries in localStorage
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journal-entries', []);
  
  /**
   * Create a new journal entry
   */
  const createEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: nanoid(),
    };
    
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, [setEntries]);
  
  /**
   * Get a specific journal entry by ID
   */
  const getEntry = useCallback((id: string) => {
    return entries.find(entry => entry.id === id);
  }, [entries]);
  
  /**
   * Update an existing journal entry
   */
  const updateEntry = useCallback((id: string, updatedEntry: Partial<JournalEntry>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updatedEntry } 
          : entry
      )
    );
  }, [setEntries]);
  
  /**
   * Delete a journal entry
   */
  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setEntries]);
  
  /**
   * Get entries filtered by various criteria
   */
  const getEntries = useCallback((options?: {
    limit?: number;
    emotionalState?: EmotionalState;
    fromDate?: Date;
    toDate?: Date;
    visibility?: string;
    matchId?: string;
    tags?: string[];
  }) => {
    let filtered = [...entries];
    
    // Apply filters
    if (options?.emotionalState) {
      filtered = filtered.filter(entry => entry.emotionalState === options.emotionalState);
    }
    
    if (options?.fromDate) {
      filtered = filtered.filter(entry => new Date(entry.createdAt) >= options.fromDate!);
    }
    
    if (options?.toDate) {
      filtered = filtered.filter(entry => new Date(entry.createdAt) <= options.toDate!);
    }
    
    if (options?.visibility) {
      filtered = filtered.filter(entry => entry.visibility === options.visibility);
    }
    
    if (options?.matchId) {
      filtered = filtered.filter(entry => entry.matchId === options.matchId);
    }
    
    if (options?.tags && options.tags.length > 0) {
      filtered = filtered.filter(entry => 
        entry.tags?.some(tag => options.tags?.includes(tag))
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply limit
    if (options?.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  }, [entries]);
  
  /**
   * Get entries by emotional state
   */
  const getEntriesByEmotionalState = useCallback((emotionalState: EmotionalState) => {
    return getEntries({ emotionalState });
  }, [getEntries]);
  
  /**
   * Get entries from a specific date range
   */
  const getEntriesByDateRange = useCallback((fromDate: Date, toDate: Date) => {
    return getEntries({ fromDate, toDate });
  }, [getEntries]);
  
  /**
   * Get entries with a specific tag
   */
  const getEntriesByTag = useCallback((tag: string) => {
    return getEntries({ tags: [tag] });
  }, [getEntries]);
  
  /**
   * Count entries by emotional state
   */
  const countByEmotionalState = useCallback(() => {
    const counts: Record<EmotionalState, number> = {
      'frustrated-disappointed': 0,
      'anxious-uncertain': 0,
      'neutral-focused': 0,
      'excited-proud': 0,
      'determined-growth': 0
    };
    
    entries.forEach(entry => {
      counts[entry.emotionalState]++;
    });
    
    return counts;
  }, [entries]);
  
  /**
   * Clear all journal entries (for testing)
   */
  const clearAllEntries = useCallback(() => {
    setEntries([]);
  }, [setEntries]);
  
  return {
    entries,
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    getEntries,
    getEntriesByEmotionalState,
    getEntriesByDateRange,
    getEntriesByTag,
    countByEmotionalState,
    clearAllEntries
  };
}

export default useJournalEntry;