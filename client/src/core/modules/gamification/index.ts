/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module
 * 
 * This file exports the entire gamification module with all its components, hooks, and utilities.
 * The module enables discovery-based gamification features throughout the Pickle+ platform.
 */

// Re-export the components
import * as GamificationComponents from './components';
export { GamificationComponents };

// Re-export the hooks
import * as GamificationHooks from './hooks';
export { GamificationHooks };

// Export types
import { Reward } from './components/DiscoveryAlert';
import { Campaign } from './components/ProgressTracker';
import { DiscoveryItem, DiscoveryCampaign } from './hooks/useDiscoveryTracking';

export type { 
  Reward,
  Campaign,
  DiscoveryItem,
  DiscoveryCampaign
};

// Direct component and hook exports for convenience
export { 
  DiscoveryAlert, 
  RewardDisplay, 
  ProgressTracker 
} from './components';

export { 
  useKonamiCode, 
  useDiscoveryTrigger, 
  useDiscoveryTracking 
} from './hooks';