/**
 * PKL-278651-TOURN-0001-FORM
 * Tournament Change Context
 * 
 * This context provides a way to notify components that a tournament has been created or updated
 * Framework 5.0: Prioritizing reliability over complexity
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface TournamentChangeContextType {
  lastChangeTimestamp: number;
  notifyTournamentChanged: () => void;
}

const TournamentChangeContext = createContext<TournamentChangeContextType | undefined>(undefined);

interface TournamentChangeProviderProps {
  children: ReactNode;
}

export function TournamentChangeProvider({ children }: TournamentChangeProviderProps) {
  // Track the last time a tournament was changed with a timestamp
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState<number>(Date.now());
  
  console.log('[Context] TournamentChangeProvider initialized with timestamp:', lastChangeTimestamp);

  // Function to notify that a tournament has been changed
  const notifyTournamentChanged = () => {
    const newTimestamp = Date.now();
    console.log('[Context] Tournament change notified. Old timestamp:', lastChangeTimestamp, 'New timestamp:', newTimestamp);
    setLastChangeTimestamp(newTimestamp);
  };

  return (
    <TournamentChangeContext.Provider
      value={{
        lastChangeTimestamp,
        notifyTournamentChanged,
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