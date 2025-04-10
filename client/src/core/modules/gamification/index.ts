/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module
 * 
 * This is the main entry point for the gamification module.
 * It exports the public API for the module.
 */

// Export context and hooks
export { GamificationProvider, useGamification } from './context/GamificationContext';

// Export types that consumers might need
export type { 
  DiscoveryPoint,
  Campaign,
  Reward,
  DiscoveryNotification,
  DiscoveryTriggerType,
  TriggerConfig,
  CampaignStatus
} from './api/types';

// Re-export components that might be used by consumers
export { default as DiscoveryAlert } from './components/DiscoveryAlert';
export { default as RewardDisplay } from './components/RewardDisplay';
export { default as ProgressTracker } from './components/ProgressTracker';

// Export hook functions for convenience
export { 
  useDiscoveryTrigger,
  useKonamiCode,
  useDiscoveryTracking
} from './hooks';