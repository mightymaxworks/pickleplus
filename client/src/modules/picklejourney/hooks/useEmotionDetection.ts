/**
 * PKL-278651-JOUR-001.2: Emotion Detection Hook
 * 
 * A hook that provides emotion detection capabilities for the PickleJourney™ system,
 * handling both user-reported emotions and detected emotions from text.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EmotionalState, EmotionDetectionResult } from '../types';

/**
 * Simple emotion detection patterns for demonstration
 * In a production system, this would be replaced with a more sophisticated
 * NLP-based emotion detection system or API
 */
const emotionPatterns = {
  'frustrated-disappointed': [
    'frustrated', 'disappointing', 'disappointing', 'lost', 'upset', 'sad',
    'angry', 'annoyed', 'failed', 'mistake', 'struggled', 'terrible',
    'worst', 'hate', 'miss', 'bad', 'worst'
  ],
  'anxious-uncertain': [
    'anxious', 'nervous', 'worried', 'uncertain', 'doubt', 'fear', 'afraid',
    'scared', 'stress', 'pressure', 'panic', 'unsure', 'concern', 'wonder'
  ],
  'neutral-focused': [
    'okay', 'fine', 'normal', 'neutral', 'average', 'focused', 'working',
    'playing', 'learning', 'practice', 'training', 'regular', 'standard'
  ],
  'excited-proud': [
    'excited', 'happy', 'thrilled', 'proud', 'great', 'amazing', 'wonderful',
    'excellent', 'fantastic', 'awesome', 'perfect', 'love', 'enjoy', 'win'
  ],
  'determined-growth': [
    'determined', 'motivated', 'inspired', 'focused', 'committed', 'dedicated',
    'improving', 'progress', 'growth', 'better', 'stronger', 'learn', 'goal'
  ]
};

/**
 * Hook for detecting and tracking emotional states
 */
export function useEmotionDetection() {
  // Store the current emotional state
  const [currentEmotionalState, setCurrentEmotionalState] = useState<EmotionalState>('neutral-focused');
  
  // Store detection history in localStorage
  const [detectionHistory, setDetectionHistory] = useLocalStorage<EmotionDetectionResult[]>(
    'emotion-detection-history', 
    []
  );
  
  // Report an emotional state (user self-reporting)
  const reportEmotionalState = useCallback((state: EmotionalState) => {
    setCurrentEmotionalState(state);
    
    // Record this detection
    const newDetection: EmotionDetectionResult = {
      primaryEmotion: state,
      confidence: 1.0, // User-reported emotions have 100% confidence
      timestamp: new Date(),
      source: 'user-reported'
    };
    
    setDetectionHistory(prev => [newDetection, ...prev]);
    
    return newDetection;
  }, [setDetectionHistory]);
  
  // Detect emotion from text input
  const detectEmotionFromText = useCallback((text: string): EmotionDetectionResult => {
    // Simple emotion detection based on keyword matching
    // In a real system, this would use NLP or a sentiment analysis API
    const wordCounts: Record<EmotionalState, number> = {
      'frustrated-disappointed': 0,
      'anxious-uncertain': 0,
      'neutral-focused': 0,
      'excited-proud': 0,
      'determined-growth': 0
    };
    
    // Normalize and split the text
    const words = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/);
    
    // Count emotional keywords
    for (const word of words) {
      for (const [emotion, patterns] of Object.entries(emotionPatterns) as [EmotionalState, string[]][]) {
        if (patterns.includes(word)) {
          wordCounts[emotion]++;
        }
      }
    }
    
    // Find the dominant emotion
    let dominantEmotion: EmotionalState = 'neutral-focused';
    let maxCount = 0;
    
    for (const [emotion, count] of Object.entries(wordCounts) as [EmotionalState, number][]) {
      if (count > maxCount) {
        dominantEmotion = emotion;
        maxCount = count;
      }
    }
    
    // Calculate confidence based on relative presence of emotion words
    const totalEmotionWords = Object.values(wordCounts).reduce((a, b) => a + b, 0);
    const confidence = totalEmotionWords > 0 
      ? Math.min(0.9, (wordCounts[dominantEmotion] / totalEmotionWords) * 1.5) 
      : 0.3;
    
    // If confidence is too low, default to neutral
    if (confidence < 0.4) {
      dominantEmotion = 'neutral-focused';
    }
    
    // Create detection result
    const result: EmotionDetectionResult = {
      primaryEmotion: dominantEmotion,
      confidence,
      timestamp: new Date(),
      source: 'text-analysis'
    };
    
    // If confidence is high enough, update current state and record
    if (confidence > 0.6) {
      setCurrentEmotionalState(dominantEmotion);
      setDetectionHistory(prev => [result, ...prev]);
    }
    
    return result;
  }, [setDetectionHistory]);
  
  // Initialize with a default emotional state on first load
  useEffect(() => {
    // If there's no previous detection, record the default state
    if (detectionHistory.length === 0) {
      const initialDetection: EmotionDetectionResult = {
        primaryEmotion: 'neutral-focused',
        confidence: 0.7,
        timestamp: new Date(),
        source: 'interaction-pattern'
      };
      
      setDetectionHistory([initialDetection]);
    } else {
      // Otherwise, restore the most recent state
      setCurrentEmotionalState(detectionHistory[0].primaryEmotion);
    }
  }, [detectionHistory, setDetectionHistory]);
  
  return {
    currentEmotionalState,
    detectionHistory,
    reportEmotionalState,
    detectEmotionFromText
  };
}

export default useEmotionDetection;