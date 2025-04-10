/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module
 * 
 * This module provides gamification features to the application.
 * It includes components for displaying discoveries, rewards, and progress.
 * It also includes hooks for triggering discoveries.
 */

// Core gamification context and provider
import { GamificationProvider, GamificationContext, useGamification } from './context/GamificationContext';

// API
import * as gamificationAPI from './api/gamificationAPI';
import * as gamificationTypes from './api/types';

// Engine
import * as discoveryEngine from './engine/discoveryEngine';

// Components
import { DiscoveryAlert, RewardDisplay, ProgressTracker } from './components';

// Hooks
import { useDiscoveryTrigger, useKonamiCode, useDiscoveryTracking } from './hooks';

// Export all
export {
  // Context
  GamificationProvider,
  GamificationContext,
  useGamification,
  
  // API
  gamificationAPI,
  gamificationTypes,
  
  // Engine
  discoveryEngine,
  
  // Components
  DiscoveryAlert,
  RewardDisplay,
  ProgressTracker,
  
  // Hooks
  useDiscoveryTrigger,
  useKonamiCode,
  useDiscoveryTracking
};