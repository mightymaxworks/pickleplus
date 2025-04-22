/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceGuidedTaskContext - Provides state management for guided task completion
 * in the Bounce testing system. This context tracks the progress of multi-step
 * tasks and manages verification data for each step.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';

// Verification types supported by the system
export type VerificationType = 'screenshot' | 'code' | 'selection' | 'observation';

// Step definition for guided tasks
export interface GuidedTaskStep {
  id: string;
  title: string;
  instructions: string;
  verificationType: VerificationType;
  verificationPrompt: string;
  educationalContent?: string;
  xpReward: number;
}

// Full task definition
export interface GuidedTask {
  id: string;
  area: string;
  title: string;
  description: string;
  steps: GuidedTaskStep[];
  totalXpReward: number;
  created: Date;
}

// Verification data types
export type VerificationData = {
  stepId: string;
  type: VerificationType;
  data: any;
  timestamp: Date;
};

// State for the guided task context
export interface GuidedTaskState {
  activeTaskId: string | null;
  currentStepIndex: number;
  isTestingModeActive: boolean;
  tasks: GuidedTask[];
  completedStepIds: string[];
  verificationData: Record<string, VerificationData>;
  isFloatingWidgetVisible: boolean;
}

// Initial state
const initialState: GuidedTaskState = {
  activeTaskId: null,
  currentStepIndex: 0,
  isTestingModeActive: false,
  tasks: [],
  completedStepIds: [],
  verificationData: {},
  isFloatingWidgetVisible: false
};

// Action types
type ActionType =
  | { type: 'SET_ACTIVE_TASK'; payload: string | null }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_TESTING_MODE'; payload: boolean }
  | { type: 'ADD_TASK'; payload: GuidedTask }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: { stepId: string; verificationData: VerificationData } }
  | { type: 'RESET_TASK_PROGRESS'; payload: string }
  | { type: 'TOGGLE_FLOATING_WIDGET' }
  | { type: 'SET_FLOATING_WIDGET_VISIBILITY'; payload: boolean };

// Reducer function
function guidedTaskReducer(state: GuidedTaskState, action: ActionType): GuidedTaskState {
  switch (action.type) {
    case 'SET_ACTIVE_TASK':
      return {
        ...state,
        activeTaskId: action.payload,
        currentStepIndex: 0
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStepIndex: action.payload
      };
    
    case 'SET_TESTING_MODE':
      return {
        ...state,
        isTestingModeActive: action.payload
      };
    
    case 'ADD_TASK':
      // Avoid duplicate tasks
      if (state.tasks.some(task => task.id === action.payload.id)) {
        return state;
      }
      
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
    
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        activeTaskId: state.activeTaskId === action.payload ? null : state.activeTaskId
      };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedStepIds: [...state.completedStepIds, action.payload.stepId],
        verificationData: {
          ...state.verificationData,
          [action.payload.stepId]: action.payload.verificationData
        }
      };
    
    case 'RESET_TASK_PROGRESS':
      const taskToReset = state.tasks.find(task => task.id === action.payload);
      
      if (!taskToReset) {
        return state;
      }
      
      const stepIdsToRemove = taskToReset.steps.map(step => step.id);
      const updatedCompletedStepIds = state.completedStepIds.filter(
        id => !stepIdsToRemove.includes(id)
      );
      
      const updatedVerificationData = { ...state.verificationData };
      stepIdsToRemove.forEach(id => {
        delete updatedVerificationData[id];
      });
      
      return {
        ...state,
        completedStepIds: updatedCompletedStepIds,
        verificationData: updatedVerificationData,
        currentStepIndex: 0
      };
    
    case 'TOGGLE_FLOATING_WIDGET':
      return {
        ...state,
        isFloatingWidgetVisible: !state.isFloatingWidgetVisible
      };
    
    case 'SET_FLOATING_WIDGET_VISIBILITY':
      return {
        ...state,
        isFloatingWidgetVisible: action.payload
      };
    
    default:
      return state;
  }
}

// Context definition
interface GuidedTaskContextType extends GuidedTaskState {
  setActiveTask: (taskId: string | null) => void;
  setCurrentStep: (stepIndex: number) => void;
  setTestingMode: (isActive: boolean) => void;
  addTask: (task: GuidedTask) => void;
  removeTask: (taskId: string) => void;
  completeStep: (stepId: string, verificationData: VerificationData) => void;
  resetTaskProgress: (taskId: string) => void;
  toggleFloatingWidget: () => void;
  setFloatingWidgetVisibility: (isVisible: boolean) => void;
  
  // Helper computed properties
  activeTask: GuidedTask | null;
  currentStep: GuidedTaskStep | null;
  isCurrentStepCompleted: boolean;
  taskProgress: (taskId: string) => { completed: number; total: number; percentage: number };
}

// Create the context
const GuidedTaskContext = createContext<GuidedTaskContextType | undefined>(undefined);

// Provider component
export function GuidedTaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(guidedTaskReducer, initialState);
  const bounceAwareness = useBounceAwareness();
  
  // Effect to activate testing mode when Bounce is active
  useEffect(() => {
    if (bounceAwareness.isActive && !state.isTestingModeActive) {
      dispatch({ type: 'SET_TESTING_MODE', payload: true });
    }
  }, [bounceAwareness.isActive, state.isTestingModeActive]);
  
  // Helper computed properties
  const activeTask = state.activeTaskId 
    ? state.tasks.find(task => task.id === state.activeTaskId) || null 
    : null;
  
  const currentStep = activeTask && activeTask.steps[state.currentStepIndex] 
    ? activeTask.steps[state.currentStepIndex] 
    : null;
  
  const isCurrentStepCompleted = currentStep 
    ? state.completedStepIds.includes(currentStep.id) 
    : false;
  
  const taskProgress = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const stepIds = task.steps.map(step => step.id);
    const completedSteps = state.completedStepIds.filter(id => stepIds.includes(id));
    const completed = completedSteps.length;
    const total = task.steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };
  
  // Actions
  const setActiveTask = (taskId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_TASK', payload: taskId });
  };
  
  const setCurrentStep = (stepIndex: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex });
  };
  
  const setTestingMode = (isActive: boolean) => {
    dispatch({ type: 'SET_TESTING_MODE', payload: isActive });
  };
  
  const addTask = (task: GuidedTask) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };
  
  const removeTask = (taskId: string) => {
    dispatch({ type: 'REMOVE_TASK', payload: taskId });
  };
  
  const completeStep = (stepId: string, verificationData: VerificationData) => {
    dispatch({
      type: 'COMPLETE_STEP',
      payload: { stepId, verificationData }
    });
  };
  
  const resetTaskProgress = (taskId: string) => {
    dispatch({ type: 'RESET_TASK_PROGRESS', payload: taskId });
  };
  
  const toggleFloatingWidget = () => {
    dispatch({ type: 'TOGGLE_FLOATING_WIDGET' });
  };
  
  const setFloatingWidgetVisibility = (isVisible: boolean) => {
    dispatch({ type: 'SET_FLOATING_WIDGET_VISIBILITY', payload: isVisible });
  };
  
  const value: GuidedTaskContextType = {
    ...state,
    setActiveTask,
    setCurrentStep,
    setTestingMode,
    addTask,
    removeTask,
    completeStep,
    resetTaskProgress,
    toggleFloatingWidget,
    setFloatingWidgetVisibility,
    
    // Computed properties
    activeTask,
    currentStep,
    isCurrentStepCompleted,
    taskProgress
  };
  
  return (
    <GuidedTaskContext.Provider value={value}>
      {children}
    </GuidedTaskContext.Provider>
  );
}

// Custom hook to use the context
export function useGuidedTask() {
  const context = useContext(GuidedTaskContext);
  
  if (context === undefined) {
    throw new Error('useGuidedTask must be used within a GuidedTaskProvider');
  }
  
  return context;
}

// Helper hook to generate demo tasks for development
export function useDemoGuidedTasks() {
  const { addTask } = useGuidedTask();
  
  const createDemoTask = () => {
    const taskId = `task-${Date.now()}`;
    const demoTask: GuidedTask = {
      id: taskId,
      area: 'Tournament Registration',
      title: 'Test the Tournament Registration Flow',
      description: 'Verify that users can successfully register for tournaments and receive confirmation.',
      created: new Date(),
      totalXpReward: 45,
      steps: [
        {
          id: `${taskId}-step-1`,
          title: 'Navigate to Tournaments',
          instructions: 'Go to the Tournaments section by clicking on "Tournaments" in the main navigation.',
          verificationType: 'observation',
          verificationPrompt: 'What types of tournaments do you see listed on the page?',
          educationalContent: 'The tournament page shows both upcoming and past tournaments, with filters for different skill levels.',
          xpReward: 5
        },
        {
          id: `${taskId}-step-2`,
          title: 'Open Tournament Details',
          instructions: 'Click on any upcoming tournament to view its details.',
          verificationType: 'observation',
          verificationPrompt: 'What information is displayed on the tournament details page?',
          educationalContent: 'Tournament details include date, location, format, entry fee, and registration deadline.',
          xpReward: 10
        },
        {
          id: `${taskId}-step-3`,
          title: 'Begin Registration',
          instructions: 'Click the "Register" button on the tournament details page.',
          verificationType: 'screenshot',
          verificationPrompt: 'Take a screenshot of the registration form.',
          educationalContent: 'The registration form collects player information and division preferences.',
          xpReward: 15
        },
        {
          id: `${taskId}-step-4`,
          title: 'Submit Registration',
          instructions: 'Fill out the registration form with test data and submit it.',
          verificationType: 'code',
          verificationPrompt: 'Enter the confirmation code shown after submission.',
          educationalContent: 'After submission, users receive a confirmation code they can use to verify their registration status.',
          xpReward: 15
        }
      ]
    };
    
    addTask(demoTask);
    return taskId;
  };
  
  return { createDemoTask };
}