/**
 * PKL-278651-JOUR-002: PickleJourney™ Module
 * 
 * Main export file for the PickleJourney™ emotionally intelligent journaling system.
 * Updated for multi-role support in JOUR-002 sprint.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-04-28
 */

// Export components
export { default as EmotionReporter } from './components/EmotionReporter';
export { default as JournalEntryForm } from './components/JournalEntryForm';
export { default as JournalTimeline } from './components/JournalTimeline';
export { default as EmotionalJourneyVisualization } from './components/EmotionalJourneyVisualization';

// Export hooks
export { default as useJournalEntry } from './hooks/useJournalEntry';
export { default as useEmotionDetection } from './hooks/useEmotionDetection';
export { useJourneyRoles } from './hooks/useJourneyRoles';

// Export contexts
export { 
  JourneyRoleProvider, 
  JourneyRoleContext,
  DEFAULT_ROLE_METADATA 
} from './contexts/JourneyRoleContext';

// Export types
export * from './types';

// Module definition
export const pickleJourneyModule = {
  name: 'picklejourney',
  version: '2.0.0',
  initialize: () => {
    console.log('PickleJourney™ module initialized with multi-role support');
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
      useEmotionDetection: './hooks/useEmotionDetection',
      useJourneyRoles: './hooks/useJourneyRoles'
    },
    contexts: {
      JourneyRoleContext: './contexts/JourneyRoleContext'
    },
    types: './types'
  }
};