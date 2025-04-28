/**
 * PKL-278651-JOUR-002.3: Emotion Detection Hook
 * 
 * Custom hook for emotion detection that provides methods for:
 * - Detecting emotions from text input
 * - Allowing users to report their own emotional state
 * - Maintaining a history of detected emotions
 * - Providing the current emotional state
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { EmotionalState, EmotionDetectionResult } from '../types';

export function useEmotionDetection() {
  // Default emotional state
  const [currentEmotionalState, setCurrentEmotionalState] = 
    useState<EmotionalState>('neutral-focused');
  
  // History of detected emotions
  const [detectionHistory, setDetectionHistory] = useState<EmotionDetectionResult[]>([]);
  
  // Emotion detection algorithm (simplified for prototype)
  const detectEmotionFromText = useCallback((text: string): EmotionDetectionResult => {
    // Text-based emotional keywords
    const emotionKeywords = {
      'frustrated-disappointed': [
        'frustrated', 'disappointing', 'upset', 'annoyed', 'failed', 
        'mistake', 'error', 'lose', 'loss', 'defeat', 'setback', 'struggling'
      ],
      'anxious-uncertain': [
        'nervous', 'anxious', 'worried', 'unsure', 'uncertain', 'concern', 
        'fear', 'stress', 'pressure', 'doubt', 'hesitant', 'afraid'
      ],
      'neutral-focused': [
        'okay', 'fine', 'normal', 'adequate', 'working', 'focusing', 
        'concentrating', 'steady', 'stable', 'routine', 'regular', 'standard'
      ],
      'excited-proud': [
        'excited', 'happy', 'proud', 'thrilled', 'accomplished', 'achievement', 
        'success', 'win', 'victory', 'celebration', 'joy', 'delighted'
      ],
      'determined-growth': [
        'determined', 'growth', 'improve', 'learning', 'develop', 'progress', 
        'advance', 'better', 'stronger', 'persistent', 'goal', 'focus'
      ]
    };

    // Normalize and tokenize the input text
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\W+/);
    
    // Count occurrences of emotion keywords
    const emotionCounts: Record<EmotionalState, number> = {
      'frustrated-disappointed': 0,
      'anxious-uncertain': 0,
      'neutral-focused': 0,
      'excited-proud': 0,
      'determined-growth': 0
    };
    
    // Process text to find emotional indicators
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (normalizedText.includes(keyword)) {
          emotionCounts[emotion as EmotionalState] += 1;
        }
      });
    });
    
    // Find the dominant emotion
    let dominantEmotion: EmotionalState = 'neutral-focused';
    let highestCount = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > highestCount) {
        highestCount = count;
        dominantEmotion = emotion as EmotionalState;
      }
    });
    
    // Calculate a confidence score (max count / total words, capped at 0.9)
    let confidenceScore = Math.min(0.90, highestCount / words.length);
    
    // If no strong signals, default to a neutral state with low confidence
    if (highestCount === 0) {
      dominantEmotion = 'neutral-focused';
      confidenceScore = 0.3;
    }
    
    // Create the detection result
    const result: EmotionDetectionResult = {
      primaryEmotion: dominantEmotion,
      confidence: confidenceScore,
      timestamp: new Date(),
      source: 'text-analysis'
    };
    
    // Update the current emotional state if confidence is high enough
    if (confidenceScore > 0.4) {
      setCurrentEmotionalState(dominantEmotion);
      
      // Add to history
      setDetectionHistory(prev => [result, ...prev].slice(0, 20));
    }
    
    return result;
  }, []);
  
  // Allow users to directly report their emotional state
  const reportEmotionalState = useCallback((state: EmotionalState): EmotionDetectionResult => {
    const result: EmotionDetectionResult = {
      primaryEmotion: state,
      confidence: 0.95, // High confidence for self-reporting
      timestamp: new Date(),
      source: 'user-reported'
    };
    
    // Update the current emotional state
    setCurrentEmotionalState(state);
    
    // Add to history
    setDetectionHistory(prev => [result, ...prev].slice(0, 20));
    
    return result;
  }, []);
  
  // Add a simulated initial detection if history is empty
  useEffect(() => {
    if (detectionHistory.length === 0) {
      const initialState: EmotionalState = 'neutral-focused';
      const initialDetection: EmotionDetectionResult = {
        primaryEmotion: initialState,
        confidence: 0.7,
        timestamp: new Date(),
        source: 'interaction-pattern'
      };
      
      setDetectionHistory([initialDetection]);
      setCurrentEmotionalState(initialState);
    }
  }, []);
  
  return {
    currentEmotionalState,
    detectionHistory,
    detectEmotionFromText,
    reportEmotionalState
  };
}

export default useEmotionDetection;