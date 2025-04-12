/**
 * PKL-278651-TOURN-0003-MATCH
 * Tournament Bracket Team Seeding Routes
 * 
 * This file contains routes for seeding teams in tournament brackets.
 */

import { Router } from 'express';
import { IStorage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
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

      // Get bracket data
      const bracket = await storage.getBracketById(bracketId);
      if (!bracket) {
        return res.status(404).json({ error: 'Bracket not found' });
      }

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

      // Update matches with the assigned teams
      for (const assignment of seedAssignments) {
        const { matchId, position, teamId } = assignment;
        
        // Get the match
        const match = await storage.getMatchById(matchId);
        if (!match) {
          console.error(`Match ${matchId} not found when seeding teams`);
          continue;
        }
        
        // Update team in the correct position
        if (position === 1) {
          await storage.updateMatch(matchId, { team1Id: teamId });
        } else if (position === 2) {
          await storage.updateMatch(matchId, { team2Id: teamId });
        }
      }

      // Log the seeding activity
      await storage.createAuditLog({
        userId: req.user.id,
        action: 'SEED_TEAMS',
        resource: 'BRACKET',
        resourceId: bracketId,
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