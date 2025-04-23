/**
 * PKL-278651-GAME-0002-TUT
 * Tutorial Provider Component
 * 
 * This component provides a context for application-wide tutorials and guided tours.
 */

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  elementSelector?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onComplete?: () => void;
};

export type TutorialFlow = {
  id: string;
  name: string;
  steps: TutorialStep[];
  isRequired?: boolean;
  requiredPath?: string;
};

type TutorialContextType = {
  activeTutorial: TutorialFlow | null;
  currentStepIndex: number;
  completedTutorials: string[];
  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTutorial: () => void;
  skipTutorial: (tutorialId: string) => void;
  isStepActive: (tutorialId: string, stepId: string) => boolean;
  isTutorialCompleted: (tutorialId: string) => boolean;
  registerTutorial: (tutorial: TutorialFlow) => void;
};

// Default context value
const defaultValue: TutorialContextType = {
  activeTutorial: null,
  currentStepIndex: 0,
  completedTutorials: [],
  startTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTutorial: () => {},
  skipTutorial: () => {},
  isStepActive: () => false,
  isTutorialCompleted: () => false,
  registerTutorial: () => {},
};

// Create context
const TutorialContext = createContext<TutorialContextType>(defaultValue);

// Available tutorials in the application
const availableTutorials: Record<string, TutorialFlow> = {};

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTutorial, setActiveTutorial] = useState<TutorialFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useLocalStorage<string[]>('pkl_completed_tutorials', []);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Start tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = availableTutorials[tutorialId];
    if (!tutorial) return;

    // If tutorial is required for a specific path, navigate there
    if (tutorial.requiredPath) {
      navigate(tutorial.requiredPath);
    }

    // Set active tutorial and reset step index
    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);

    // Show initial toast
    toast({
      title: `Tutorial: ${tutorial.name}`,
      description: `Starting the ${tutorial.name} tutorial. Press next to continue.`,
    });
  }, [navigate, toast]);

  // Next step
  const nextStep = useCallback(() => {
    if (!activeTutorial) return;

    // Execute onComplete for current step if available
    const currentStep = activeTutorial.steps[currentStepIndex];
    if (currentStep?.onComplete) {
      currentStep.onComplete();
    }

    // Move to next step or end tutorial
    if (currentStepIndex < activeTutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Complete the tutorial
      const newCompletedList = [...completedTutorials];
      if (!newCompletedList.includes(activeTutorial.id)) {
        newCompletedList.push(activeTutorial.id);
        setCompletedTutorials(newCompletedList);
      }
      
      // Clear active tutorial
      setActiveTutorial(null);
      
      // Show completion toast
      toast({
        title: 'Tutorial Complete',
        description: `You've completed the ${activeTutorial.name} tutorial!`,
      });
    }
  }, [activeTutorial, currentStepIndex, completedTutorials, setCompletedTutorials, toast]);

  // Previous step
  const prevStep = useCallback(() => {
    if (!activeTutorial || currentStepIndex <= 0) return;
    setCurrentStepIndex(prev => prev - 1);
  }, [activeTutorial, currentStepIndex]);

  // End tutorial
  const endTutorial = useCallback(() => {
    if (!activeTutorial) return;
    
    // Mark as completed
    const newCompletedList = [...completedTutorials];
    if (!newCompletedList.includes(activeTutorial.id)) {
      newCompletedList.push(activeTutorial.id);
      setCompletedTutorials(newCompletedList);
    }
    
    // Clear active tutorial
    setActiveTutorial(null);
  }, [activeTutorial, completedTutorials, setCompletedTutorials]);

  // Skip tutorial
  const skipTutorial = useCallback((tutorialId: string) => {
    const newCompletedList = [...completedTutorials];
    if (!newCompletedList.includes(tutorialId)) {
      newCompletedList.push(tutorialId);
      setCompletedTutorials(newCompletedList);
    }
    
    // If this is the active tutorial, clear it
    if (activeTutorial?.id === tutorialId) {
      setActiveTutorial(null);
    }
  }, [activeTutorial, completedTutorials, setCompletedTutorials]);

  // Check if step is active
  const isStepActive = useCallback((tutorialId: string, stepId: string) => {
    if (!activeTutorial || activeTutorial.id !== tutorialId) return false;
    return activeTutorial.steps[currentStepIndex]?.id === stepId;
  }, [activeTutorial, currentStepIndex]);

  // Check if tutorial is completed
  const isTutorialCompleted = useCallback((tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  }, [completedTutorials]);

  // Register a new tutorial flow
  const registerTutorial = useCallback((tutorial: TutorialFlow) => {
    availableTutorials[tutorial.id] = tutorial;
  }, []);

  // Context value
  const contextValue = {
    activeTutorial,
    currentStepIndex,
    completedTutorials,
    startTutorial,
    nextStep,
    prevStep,
    endTutorial,
    skipTutorial,
    isStepActive,
    isTutorialCompleted,
    registerTutorial,
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

// Hook to use tutorial context
export const useTutorial = () => useContext(TutorialContext);

export default TutorialProvider;