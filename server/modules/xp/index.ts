/**
 * PKL-278651-XP-0002-UI / PKL-278651-COMM-0022-XP / PKL-278651-XP-0004-MATCH / PKL-278651-XP-0005-ACHIEVE
 * XP Module Entry Point
 * 
 * Exports and registers XP system routes and components.
 * 
 * @framework Framework5.1
 * @version 1.3.0
 * @lastModified 2025-04-19
 */

import express from 'express';
import xpRoutes from './xp-routes';
import { XpService } from './xp-service';
import { ActivityMultiplierService } from './ActivityMultiplierService';
import { CommunityXpIntegration } from './community-xp-integration';
import { MatchXpIntegration } from './match-xp-integration';
import { AchievementXpIntegration } from './achievement-integration';

// Shared services
let communityXpIntegration: CommunityXpIntegration | null = null;
let matchXpIntegration: MatchXpIntegration | null = null;
let achievementXpIntegration: AchievementXpIntegration | null = null;
let activityMultiplierService: ActivityMultiplierService | null = null;

// Initialize the module and register routes
export function initializeXpModule(app: express.Express): void {
  // Initialize services
  if (!activityMultiplierService) {
    activityMultiplierService = new ActivityMultiplierService();
    console.log('[XP] ActivityMultiplierService initialized');
  }
  
  // Register routes with '/api/xp' prefix
  app.use('/api/xp', xpRoutes);
  
  // PKL-278651-COMM-0022-XP: Initialize Community XP Integration
  if (!communityXpIntegration && activityMultiplierService) {
    communityXpIntegration = new CommunityXpIntegration(activityMultiplierService);
    console.log('[XP] Community XP Integration initialized');
  }
  
  // PKL-278651-XP-0004-MATCH: Initialize Match XP Integration
  if (!matchXpIntegration && activityMultiplierService) {
    matchXpIntegration = new MatchXpIntegration(activityMultiplierService);
    console.log('[XP] Match XP Integration initialized');
  }
  
  // PKL-278651-XP-0005-ACHIEVE: Initialize Achievement XP Integration
  if (!achievementXpIntegration && activityMultiplierService) {
    achievementXpIntegration = new AchievementXpIntegration(activityMultiplierService);
    console.log('[XP] Achievement XP Integration initialized');
  }
  
  console.log('[XP] Module initialized successfully');
}

// Export services for use in other modules
export { 
  XpService, 
  activityMultiplierService, 
  communityXpIntegration,
  matchXpIntegration,
  achievementXpIntegration
};