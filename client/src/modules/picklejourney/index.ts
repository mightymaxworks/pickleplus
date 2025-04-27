/**
 * PKL-278651-JOUR-001: PickleJourney™ Module
 * 
 * Main export file for the PickleJourney™ emotionally intelligent journaling system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

// Export components
export { default as EmotionReporter } from './components/EmotionReporter';
export { default as JournalEntryForm } from './components/JournalEntryForm';
export { default as JournalTimeline } from './components/JournalTimeline';
export { default as EmotionalJourneyVisualization } from './components/EmotionalJourneyVisualization';

// Export hooks
export { default as useJournalEntry } from './hooks/useJournalEntry';
export { default as useEmotionDetection } from './hooks/useEmotionDetection';

// Export types
export * from './types';

// Module definition
export const pickleJourneyModule = {
  name: 'picklejourney',
  version: '1.0.0',
  initialize: () => {
    console.log('PickleJourney™ module initialized');
    return true;
  },
  exports: {
    components: {
      EmotionReporter: './components/EmotionReporter',
      JournalEntryForm: './components/JournalEntryForm',
      JournalTimeline: './components/JournalTimeline',
      EmotionalJourneyVisualization: './components/EmotionalJourneyVisualization'
    },
    hooks: {
      useJournalEntry: './hooks/useJournalEntry',
      useEmotionDetection: './hooks/useEmotionDetection'
    },
    types: './types'
  }
};