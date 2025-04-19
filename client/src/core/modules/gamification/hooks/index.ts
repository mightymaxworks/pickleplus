/**
 * PKL-278651-XP-0002-UI
 * Gamification Hooks Index
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import useXpProgress from './useXpProgress';
import useKonamiCode from './useKonamiCode';
import useDiscoveryTracking, { 
  Discovery, 
  DiscoveryCampaign 
} from './useDiscoveryTracking';

// Export types from files
export type { Discovery, DiscoveryCampaign } from './useDiscoveryTracking';
export type { XpProgressData, XpTransaction } from './useXpProgress';

// Export hooks
export {
  useXpProgress,
  useKonamiCode,
  useDiscoveryTracking
};