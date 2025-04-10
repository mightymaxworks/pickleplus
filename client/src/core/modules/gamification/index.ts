/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module
 * 
 * This is the main entry point for the gamification module.
 * It exports all components, hooks, and APIs for use in the application.
 */

// Export context and provider
export { 
  GamificationProvider, 
  useGamification 
} from './context/GamificationContext';

// Export API and types
export * as gamificationAPI from './api/gamificationAPI';
export * from './api/types';

// Export components
export * from './components';

// Export hooks
export * from './hooks';

/**
 * Initialize the gamification module
 * This function should be called once at the start of the application
 */
export function initGamificationModule() {
  console.log('Gamification module initialized');
  
  // Add global event listeners or perform other initialization as needed
  
  return {
    cleanup: () => {
      // Clean up any resources when the module is unloaded
      console.log('Gamification module cleanup');
    }
  };
}