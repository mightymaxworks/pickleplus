/**
 * PKL-278651-JOUR-002.3: Emotion Context
 * 
 * A context provider for managing emotion detection and sharing emotional state
 * across the PickleJourney™ components. This allows the UI to adapt based on
 * the user's detected emotional state.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { EmotionalState, EmotionDetectionResult } from '../types';

// Define the context shape
interface EmotionContextType {
  // Current emotional state
  currentEmotionalState: EmotionalState;
  
  // History of detected emotions
  detectionHistory: EmotionDetectionResult[];
  
  // Report a new emotional state (self-reporting)
  reportEmotionalState: (state: EmotionalState) => EmotionDetectionResult;
  
  // Detect emotion from text input
  detectEmotionFromText: (text: string) => EmotionDetectionResult;
  
  // Helper functions for UI adaptation
  getEmotionalTone: () => 'negative' | 'neutral' | 'positive' | 'growth';
  getEmotionalColor: () => string;
  getEmotionalIntensity: () => 'low' | 'medium' | 'high';
  
  // Determine if the emotional state has been stable or is changing frequently
  isEmotionallyStable: () => boolean;
}

// Create the context with null default
export const EmotionContext = createContext<EmotionContextType | null>(null);

// Provider component props
interface EmotionProviderProps {
  children: ReactNode;
}

/**
 * Provider component for emotion context
 */
export function EmotionProvider({ children }: EmotionProviderProps) {
  // Use the emotion detection hook
  const {
    currentEmotionalState,
    detectionHistory,
    reportEmotionalState,
    detectEmotionFromText
  } = useEmotionDetection();
  
  // Helper to categorize emotional states into tones
  const getEmotionalTone = () => {
    switch (currentEmotionalState) {
      case 'frustrated-disappointed':
      case 'anxious-uncertain':
        return 'negative';
      case 'neutral-focused':
        return 'neutral';
      case 'excited-proud':
        return 'positive';
      case 'determined-growth':
        return 'growth';
      default:
        return 'neutral';
    }
  };
  
  // Helper to map emotional states to color themes
  const getEmotionalColor = () => {
    switch (currentEmotionalState) {
      case 'frustrated-disappointed':
        return 'text-red-600';
      case 'anxious-uncertain':
        return 'text-amber-500';
      case 'neutral-focused':
        return 'text-blue-500';
      case 'excited-proud':
        return 'text-green-500';
      case 'determined-growth':
        return 'text-purple-500';
      default:
        return 'text-blue-500';
    }
  };
  
  // Helper to determine emotional intensity
  const getEmotionalIntensity = () => {
    // Get the 3 most recent detections
    const recentDetections = detectionHistory.slice(0, 3);
    
    // Calculate average confidence
    const avgConfidence = recentDetections.reduce(
      (sum: number, detection: EmotionDetectionResult) => sum + detection.confidence, 
      0
    ) / (recentDetections.length || 1);
    
    if (avgConfidence > 0.8) return 'high';
    if (avgConfidence > 0.5) return 'medium';
    return 'low';
  };
  
  // Helper to determine emotional stability
  const isEmotionallyStable = () => {
    // If we have very few detections, assume stability
    if (detectionHistory.length < 3) return true;
    
    // Get the 5 most recent detections
    const recentDetections = detectionHistory.slice(0, 5);
    
    // Count distinct emotional states
    const distinctEmotions = new Set(
      recentDetections.map((detection: EmotionDetectionResult) => detection.primaryEmotion)
    );
    
    // If there are 3 or more different emotions in the last 5 detections,
    // the emotional state is considered unstable
    return distinctEmotions.size < 3;
  };
  
  // Create the context value object
  const contextValue = useMemo<EmotionContextType>(() => ({
    currentEmotionalState,
    detectionHistory,
    reportEmotionalState,
    detectEmotionFromText,
    getEmotionalTone,
    getEmotionalColor,
    getEmotionalIntensity,
    isEmotionallyStable
  }), [
    currentEmotionalState, 
    detectionHistory, 
    reportEmotionalState, 
    detectEmotionFromText
  ]);
  
  return (
    <EmotionContext.Provider value={contextValue}>
      {children}
    </EmotionContext.Provider>
  );
}

/**
 * Custom hook for using the emotion context
 */
export function useEmotion() {
  const context = useContext(EmotionContext);
  
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  
  return context;
}