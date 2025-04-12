/**
 * PKL-278651-TOURN-0003-MATCH
 * Register Tournament Seed Teams Routes
 * 
 * Registration file for tournament bracket team seeding routes
 */

import { Router } from 'express';
import { IStorage } from '../storage';
import registerTournamentSeedTeamsRoutes from './tournament-seed-teams-routes';

export default function(router: Router, storage: IStorage) {
  // Register routes for tournament bracket team seeding
  registerTournamentSeedTeamsRoutes(router, storage);
}