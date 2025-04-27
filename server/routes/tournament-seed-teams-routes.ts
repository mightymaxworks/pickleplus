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

      // Process the team assignments by updating match data in the database
      console.log('[Seed Teams] Processing team assignments:', seedAssignments);
      
      // Get bracket details to make sure it exists
      const bracket = await storage.getBracketById(bracketId);
      if (!bracket) {
        return res.status(404).json({ error: 'Bracket not found' });
      }
      
      // Update matches with team assignments
      for (const assignment of seedAssignments) {
        const { matchId, position, teamId } = assignment;
        console.log(`[Seed Teams] Updating match ${matchId}, position ${position} with team ${teamId}`);
        
        try {
          // Get the match to verify it exists
          const match = await storage.getBracketMatch(matchId);
          if (!match) {
            console.error(`[Seed Teams] Match ${matchId} not found`);
            continue;
          }
          
          // Update team assignment based on position
          if (position === 1) {
            await storage.updateBracketMatch(matchId, { team1Id: teamId });
          } else if (position === 2) {
            await storage.updateBracketMatch(matchId, { team2Id: teamId });
          }
        } catch (error) {
          console.error(`[Seed Teams] Error updating match ${matchId}:`, error);
        }
      }

      // For now, log the activity to console
      // We'll implement proper audit logging in a subsequent PR
      console.log('[Seed Teams] Audit log entry would be created:', {
        userId: req.user?.id || 0,
        action: 'SEED_TEAMS',
        resource: 'BRACKET',
        resourceId: bracketId.toString(),
        additionalData: {
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