/**
 * PKL-278651-GAME-0002-TUT
 * Tutorial Provider Component
 * 
 * This component manages the first-time user tutorial experience.
 * It determines when to show the tutorial based on user login status
 * and whether they have seen the tutorial before.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import FirstTimeUserTutorial from './FirstTimeUserTutorial';
import { useAuth } from '@/hooks/useAuth';

// Context to track tutorial state
interface TutorialContextType {
  hasCompletedTutorial: boolean;
  resetTutorial: () => void;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType>({
  hasCompletedTutorial: false,
  resetTutorial: () => {},
  skipTutorial: () => {}
});

// Hook to access tutorial context
export const useTutorial = () => useContext(TutorialContext);

export interface TutorialProviderProps {
  children: React.ReactNode;
}

/**
 * TutorialProvider Component
 * 
 * Provides tutorial state management and conditionally renders the
 * first-time user tutorial based on user status and tutorial history.
 */
const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Local storage key for tracking tutorial completion
  const TUTORIAL_STORAGE_KEY = 'pickle_plus_tutorial_completed';
  
  // Check if user has completed tutorial on mount
  useEffect(() => {
    if (user && !isLoading) {
      // If we have a user ID, use a user-specific key
      const storageKey = user?.id 
        ? `${TUTORIAL_STORAGE_KEY}_${user.id}` 
        : TUTORIAL_STORAGE_KEY;
        
      const completedStatus = localStorage.getItem(storageKey);
      const hasCompleted = completedStatus === 'true';
      
      setHasCompletedTutorial(hasCompleted);
      
      // Show tutorial for first-time authenticated users who haven't completed it
      if (!hasCompleted && user?.id) {
        setShowTutorial(true);
      }
    }
  }, [isLoading, user]);
  
  // Handle tutorial completion
  const handleTutorialComplete = () => {
    if (user?.id) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
      setShowTutorial(false);
    }
  };
  
  // Reset tutorial for testing purposes
  const resetTutorial = () => {
    if (user?.id) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}`;
      localStorage.removeItem(storageKey);
      setHasCompletedTutorial(false);
      setShowTutorial(true);
    }
  };
  
  // Skip tutorial
  const skipTutorial = () => {
    if (user?.id) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
      setShowTutorial(false);
    }
  };
  
  // Provide tutorial context
  const tutorialContextValue: TutorialContextType = {
    hasCompletedTutorial,
    resetTutorial,
    skipTutorial
  };
  
  return (
    <TutorialContext.Provider value={tutorialContextValue}>
      {children}
      
      {/* Render tutorial for authenticated users who haven't completed it */}
      {showTutorial && user?.id && (
        <FirstTimeUserTutorial
          isFirstTimeUser={true} 
          userId={user.id}
          onComplete={handleTutorialComplete}
        />
      )}
    </TutorialContext.Provider>
  );
};

export default TutorialProvider;