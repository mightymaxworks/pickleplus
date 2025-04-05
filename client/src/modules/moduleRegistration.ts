/**
 * Module Registration
 * 
 * This file registers all modules with the module registry.
 * It serves as the central place to import and register modules.
 */

import { moduleRegistry } from '@/core/modules/moduleRegistry';

// Import all modules
import { userModule } from './user';
import { matchModule } from './match';
import { tournamentModule } from './tournament';
import { achievementModule } from './achievement';
import { socialModule } from './social';
import { coachingModule } from './coaching';

/**
 * Register all modules with the module registry
 */
export function registerAllModules(): void {
  // Register each module
  moduleRegistry.registerModule(userModule);
  moduleRegistry.registerModule(matchModule);
  moduleRegistry.registerModule(tournamentModule);
  moduleRegistry.registerModule(achievementModule);
  moduleRegistry.registerModule(socialModule);
  moduleRegistry.registerModule(coachingModule);
  
  console.log('All modules registered successfully.');
  console.log('Registered modules:', moduleRegistry.getAllModules().map(m => `${m.name}@${m.version}`));
}

/**
 * Check if a module is registered
 * @param name The name of the module to check
 * @returns Whether the module is registered
 */
export function isModuleRegistered(name: string): boolean {
  return moduleRegistry.hasModule(name);
}

/**
 * Get a module's API
 * @param name The name of the module to get
 * @returns The module's exports (API)
 */
export function getModuleAPI<T>(name: string): T {
  return moduleRegistry.getModule(name).exports as T;
}