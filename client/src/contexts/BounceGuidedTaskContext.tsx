/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceGuidedTaskContext - Context for managing guided tasks for the Bounce testing system.
 * Provides the state and functions needed for tasks, steps, and verification.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  GuidedTask, 
  GuidedTaskContextType, 
  TaskCompletionData, 
  VerificationData 
} from '@/types/bounce';

// Create the context with default values
const GuidedTaskContext = createContext<GuidedTaskContextType>({
  tasks: [],
  activeTaskId: null,
  isTestingModeActive: false,
  isFloatingWidgetVisible: false,
  setActiveTask: () => {},
  setTasks: () => {},
  addTask: () => {},
  completeTask: () => {},
  setTestingMode: () => {},
  setFloatingWidgetVisibility: () => {},
  getStepProgress: () => 0,
});

interface GuidedTaskProviderProps {
  children: ReactNode;
}

export const GuidedTaskProvider: React.FC<GuidedTaskProviderProps> = ({ children }) => {
  // State for tasks
  const [tasks, setTasks] = useState<GuidedTask[]>([]);
  
  // Active task ID
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  // Testing mode status
  const [isTestingModeActive, setIsTestingModeActive] = useState(false);
  
  // Floating widget visibility
  const [isFloatingWidgetVisible, setIsFloatingWidgetVisible] = useState(false);
  
  // Add a new task
  const addTask = (task: GuidedTask) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };
  
  // Complete a task
  const completeTask = (taskId: string, completionData: TaskCompletionData) => {
    setTasks((prevTasks) => 
      prevTasks.filter((task) => task.id !== taskId)
    );
    
    // Clear active task if it was the completed one
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
    
    // Optionally call an API or service to log completion
    console.log(`Task ${taskId} completed with data:`, completionData);
  };
  
  // Set the active task
  const setActiveTask = (taskId: string | null) => {
    setActiveTaskId(taskId);
  };
  
  // Set the testing mode status
  const setTestingMode = (isActive: boolean) => {
    setIsTestingModeActive(isActive);
    
    // If deactivating, also hide the widget
    if (!isActive) {
      setIsFloatingWidgetVisible(false);
    }
  };
  
  // Set floating widget visibility
  const setFloatingWidgetVisibility = (isVisible: boolean) => {
    setIsFloatingWidgetVisible(isVisible);
  };
  
  // Calculate step progress for a task (percentage)
  const getStepProgress = (taskId: string): number => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.steps || task.steps.length === 0) {
      return 0;
    }
    
    // For demonstration, return progress based on step index
    // In a real implementation, this would be tracked in task state
    return Math.round((task.currentStepIndex || 0) * 100 / task.steps.length);
  };
  
  // Create the context value
  const contextValue: GuidedTaskContextType = {
    tasks,
    activeTaskId,
    isTestingModeActive,
    isFloatingWidgetVisible,
    setActiveTask,
    setTasks,
    addTask,
    completeTask,
    setTestingMode,
    setFloatingWidgetVisibility,
    getStepProgress,
  };
  
  return (
    <GuidedTaskContext.Provider value={contextValue}>
      {children}
    </GuidedTaskContext.Provider>
  );
};

// Hook for using the guided task context
export const useGuidedTask = () => useContext(GuidedTaskContext);