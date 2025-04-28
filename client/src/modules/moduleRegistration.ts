/**
 * PKL-278651-JOUR-001: PickleJourney™ Module Registration
 * Add the picklejourney module to the imports
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { moduleRegistry } from '@/core/modules/moduleRegistry';

// Import modules
import { userModule } from '@/modules/user';
import { matchModule } from '@/modules/match';
import { tournamentModule } from '@/modules/tournament';
import { achievementModule } from '@/modules/achievement';
import { socialModule } from '@/modules/social';
import { coachingModule } from '@/modules/coaching';
import { guidanceMiniModule } from '@/modules/guidance-mini';
import { adminModule } from '@/modules/admin';
import { feedbackModule } from '@/modules/feedback/module';
import { pickleJourneyModule } from '@/modules/picklejourney'; // Add PickleJourney™ module

/**
 * Register a module with the registry
 */
export function registerModule(name: string, version: string) {
  // This is a stub for consistent API usage in module initialization
  console.log(`[Module Registration] Module ${name}@${version} registered`);
}

/**
 * Register all modules
 */
export function registerAllModules() {
  moduleRegistry.registerModule(userModule);
  moduleRegistry.registerModule(matchModule);
  moduleRegistry.registerModule(tournamentModule);
  moduleRegistry.registerModule(achievementModule);
  moduleRegistry.registerModule(socialModule);
  moduleRegistry.registerModule(coachingModule);
  moduleRegistry.registerModule(guidanceMiniModule);
  moduleRegistry.registerModule(adminModule);
  moduleRegistry.registerModule(feedbackModule);
  moduleRegistry.registerModule(pickleJourneyModule); // Register PickleJourney™ module
  
  console.log('All modules registered successfully.');
  console.log('Registered modules:', moduleRegistry.getAllModules().map((m) => `${m.name}@${m.version}`));
}

// Export the registry
export default moduleRegistry;