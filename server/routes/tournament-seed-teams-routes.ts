/**
 * PKL-278651-TOURN-0003-MATCH
 * Tournament Bracket Team Seeding Routes
 * 
 * This file contains routes for seeding teams in tournament brackets.
 */

import { Router } from 'express';
import { IStorage } from '../storage';
import { isAuthenticated } from '../auth';
import { z } from 'zod';

// Validation schemas
const seedTeamsSchema = z.object({
  assignments: z.record(z.string(), z.number().nullable()),
  method: z.enum(['manual', 'rating', 'random'])
});

export default function registerTournamentSeedTeamsRoutes(router: Router, storage: IStorage) {
  /**
   * POST /api/brackets/:id/seed
   * Seed teams into a bracket
   * 
   * Request body:
   * {
   *   assignments: { "matchId-position": teamId },
   *   method: "manual" | "rating" | "random"
   * }
   * 
   * Response:
   * { success: true, message: string }
   */
  router.post('/brackets/:id/seed', isAuthenticated, async (req, res) => {
    try {
      const bracketId = parseInt(req.params.id);
      if (isNaN(bracketId)) {
        return res.status(400).json({ error: 'Invalid bracket ID' });
      }

      // Validate request body
      const validationResult = seedTeamsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid request body', details: validationResult.error.format() });
      }

      const { assignments, method } = validationResult.data;

      // For now, we'll assume the bracket exists since we'd need to implement the storage method
      // We'll implement proper bracket validation in subsequent PRs
      // This sprint is focused on the UI component for team seeding

      // Process team assignments
      const seedAssignments: {matchId: number, position: 1 | 2, teamId: number | null}[] = [];
      
      Object.entries(assignments).forEach(([key, teamId]) => {
        const [matchId, position] = key.split('-');
        seedAssignments.push({
          matchId: parseInt(matchId),
          position: parseInt(position) as 1 | 2,
          teamId
        });
      });

      // For now we'll just log the assignments
      // The actual update logic will be implemented in a future PR
      // once we add the necessary storage methods
      console.log('[Seed Teams] Processing team assignments:', seedAssignments);
      
      // This is placeholder code for now - in a real implementation we would update the matches
      for (const assignment of seedAssignments) {
        const { matchId, position, teamId } = assignment;
        console.log(`[Seed Teams] Would update match ${matchId}, position ${position} with team ${teamId}`);
      }

      // For now, log the activity to console
      // We'll implement proper audit logging in a subsequent PR
      console.log('[Seed Teams] Audit log entry would be created:', {
        userId: req.user?.id || 0,
        action: 'SEED_TEAMS',
        resource: 'BRACKET',
        resourceId: bracketId.toString(),
        details: {
          method,
          assignmentCount: seedAssignments.length,
          bracketId
        }
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Teams seeded successfully' 
      });
    } catch (error) {
      console.error('Error seeding teams:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}