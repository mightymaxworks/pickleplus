/**
 * Guidance Mini Module
 * 
 * This lightweight module provides guidance features such as the Bounce mascot
 * that appears on the landing page, offering helpful tips and Easter eggs.
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus } from '@/core/events/eventBus';

/**
 * Export the module interface
 */
export const guidanceMiniModule: Module = {
  name: 'guidance-mini',
  version: '1.0.0',
  
  // Define module exports
  exports: {
    // Add module-specific exports here if needed
  }
};

/**
 * Initialize and register the guidance-mini module
 * This lightweight module provides the Bounce mascot on the landing page
 */
export function registerGuidanceMiniModule() {
  // Set up event subscriptions
  const unsubscribe = eventBus.subscribe('app:landingPageViewed', () => {
    console.log('Landing page viewed, guidance mini activated');
  });
  
  // This function is kept for direct imports
  return guidanceMiniModule;
}