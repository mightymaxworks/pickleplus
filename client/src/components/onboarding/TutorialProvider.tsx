/**
 * PKL-278651-GAME-0002-TUT
 * Tutorial Provider Component (DISABLED)
 * 
 * PKL-278651-UIFIX-0003-CLEANUP: Tutorial component has been disabled for production.
 * The tutorial provider context remains available for backwards compatibility but
 * no longer shows the tutorial to any users.
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Local storage key for tracking tutorial completion
  const TUTORIAL_STORAGE_KEY = 'pickle_plus_tutorial_completed';
  
  // PKL-278651-UIFIX-0003-CLEANUP: Tutorial disabled for production
  useEffect(() => {
    if (user && !isLoading && !isInitialized) {
      setIsInitialized(true);
      
      // Mark all users as having completed the tutorial
      if (user?.id) {
        const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}`;
        localStorage.setItem(storageKey, 'true');
      }
      
      // Always mark as completed, never show the tutorial
      setHasCompletedTutorial(true);
      setShowTutorial(false);
    }
  }, [isLoading, user, isInitialized]);
  
  // Handle tutorial completion
  const handleTutorialComplete = () => {
    if (user?.id) {
      const storageKey = `${TUTORIAL_STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, 'true');
      setHasCompletedTutorial(true);
      setShowTutorial(false);
    }
  };
  
  // Reset tutorial function (disabled for production)
  const resetTutorial = () => {
    // PKL-278651-UIFIX-0003-CLEANUP: No-op for production
    console.log('Tutorial reset attempted but disabled for production');
    // Always maintain completed status
    setHasCompletedTutorial(true);
    setShowTutorial(false);
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
      
      {/* Render tutorial for authenticated users who haven't completed it, but never on landing page */}
      {showTutorial && user?.id && window.location.pathname !== '/' && (
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