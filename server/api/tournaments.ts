/**
 * PKL-278651-TOURN-SYSTEM
 * Tournament Management System API
 * 
 * This file contains the API endpoints for the Tournament Management System.
 */

import express, { Request, Response } from 'express';
import { db } from '../db';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { 
  tournaments, 
  tournamentRegistrations, 
  tournamentTeams,
  tournamentBrackets,
  tournamentRoundPoints,
  tournamentTiers,
  tournamentCategories,
  tournamentAgeDivisions,
  insertTournamentSchema,
  insertTournamentRegistrationSchema
} from '@shared/schema';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/tournaments
 * Get all tournaments with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      category, 
      division, 
      tier, 
      startDate, 
      endDate,
      format,
      limit = 20,
      offset = 0
    } = req.query;

    let query = db.select().from(tournaments);

    // Apply filters if provided
    if (status) {
      query = query.where(eq(tournaments.status, status as string));
    }
    
    if (format) {
      query = query.where(eq(tournaments.format, format as string));
    }
    
    if (category) {
      query = query.where(eq(tournaments.division, category as string));
    }
    
    if (division) {
      // This is for age division
      query = query.where(eq(tournaments.division, division as string));
    }
    
    if (tier) {
      query = query.where(eq(tournaments.level, tier as string));
    }
    
    if (startDate) {
      query = query.where(gte(tournaments.startDate, new Date(startDate as string)));
    }
    
    if (endDate) {
      query = query.where(lte(tournaments.endDate, new Date(endDate as string)));
    }

    // Apply pagination
    query = query.limit(Number(limit)).offset(Number(offset));
    
    // Order by start date
    query = query.orderBy(asc(tournaments.startDate));
    
    const result = await query;
    
    res.json(result);
  } catch (error) {
    console.error('Error getting tournaments:', error);
    res.status(500).json({ message: 'Failed to get tournaments' });
  }
});

/**
 * GET /api/tournaments/:id
 * Get a specific tournament by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const tournament = await db.select().from(tournaments)
      .where(eq(tournaments.id, parseInt(id)))
      .limit(1);
    
    if (tournament.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Get current registration count
    const registrationsCount = await db.select({ count: sql<number>`count(*)` }).from(tournamentRegistrations)
      .where(eq(tournamentRegistrations.tournamentId, parseInt(id)));
    
    // Get brackets if any
    const brackets = await db.select().from(tournamentBrackets)
      .where(eq(tournamentBrackets.tournamentId, parseInt(id)));
    
    // Combine data
    const result = {
      ...tournament[0],
      currentRegistrations: registrationsCount[0].count,
      brackets: brackets
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error getting tournament:', error);
    res.status(500).json({ message: 'Failed to get tournament' });
  }
});

/**
 * POST /api/tournaments
 * Create a new tournament (admin only)
 */
router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const validated = insertTournamentSchema.safeParse(req.body);
    
    if (!validated.success) {
      return res.status(400).json({ errors: validated.error.format() });
    }
    
    const tournament = await db.insert(tournaments).values(validated.data).returning();
    
    res.status(201).json(tournament[0]);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ message: 'Failed to create tournament' });
  }
});

/**
 * PATCH /api/tournaments/:id
 * Update a tournament (admin only)
 */
router.patch('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if tournament exists
    const existingTournament = await db.select().from(tournaments)
      .where(eq(tournaments.id, parseInt(id)));
    
    if (existingTournament.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Update the tournament
    const updatedTournament = await db.update(tournaments)
      .set(req.body)
      .where(eq(tournaments.id, parseInt(id)))
      .returning();
    
    res.json(updatedTournament[0]);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ message: 'Failed to update tournament' });
  }
});

/**
 * DELETE /api/tournaments/:id
 * Delete a tournament (admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if tournament exists
    const existingTournament = await db.select().from(tournaments)
      .where(eq(tournaments.id, parseInt(id)));
    
    if (existingTournament.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Check if tournament has registrations
    const registrationsCount = await db.select({ count: sql<number>`count(*)` }).from(tournamentRegistrations)
      .where(eq(tournamentRegistrations.tournamentId, parseInt(id)));
    
    if (registrationsCount[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete tournament with existing registrations' });
    }
    
    // Delete the tournament
    await db.delete(tournaments).where(eq(tournaments.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ message: 'Failed to delete tournament' });
  }
});

/**
 * GET /api/tournaments/:id/registrations
 * Get all registrations for a tournament
 */
router.get('/:id/registrations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const registrations = await db.select().from(tournamentRegistrations)
      .where(eq(tournamentRegistrations.tournamentId, parseInt(id)));
    
    res.json(registrations);
  } catch (error) {
    console.error('Error getting tournament registrations:', error);
    res.status(500).json({ message: 'Failed to get tournament registrations' });
  }
});

/**
 * POST /api/tournaments/:id/register
 * Register for a tournament
 */
router.post('/:id/register', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if tournament exists
    const tournamentData = await db.select().from(tournaments)
      .where(eq(tournaments.id, parseInt(id)));
    
    if (tournamentData.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournament = tournamentData[0];
    
    // Check if registration is open
    const now = new Date();
    if (tournament.registrationStartDate && new Date(tournament.registrationStartDate) > now) {
      return res.status(400).json({ message: 'Registration is not open yet' });
    }
    
    if (tournament.registrationEndDate && new Date(tournament.registrationEndDate) < now) {
      return res.status(400).json({ message: 'Registration is closed' });
    }
    
    // Check if user is already registered
    const existingRegistration = await db.select().from(tournamentRegistrations)
      .where(and(
        eq(tournamentRegistrations.tournamentId, parseInt(id)),
        eq(tournamentRegistrations.userId, userId)
      ));
    
    if (existingRegistration.length > 0) {
      return res.status(400).json({ message: 'You are already registered for this tournament' });
    }
    
    // Check if tournament is full
    const registrationsCount = await db.select({ count: sql<number>`count(*)` }).from(tournamentRegistrations)
      .where(eq(tournamentRegistrations.tournamentId, parseInt(id)));
    
    if (tournament.maxParticipants && registrationsCount[0].count >= tournament.maxParticipants) {
      // TODO: Add to waitlist instead
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    // Register for the tournament
    const validated = insertTournamentRegistrationSchema.safeParse({
      tournamentId: parseInt(id),
      userId,
      status: 'registered'
    });
    
    if (!validated.success) {
      return res.status(400).json({ errors: validated.error.format() });
    }
    
    const registration = await db.insert(tournamentRegistrations).values(validated.data).returning();
    
    // Update the tournament's current participants count
    await db.update(tournaments)
      .set({ currentParticipants: tournament.currentParticipants + 1 })
      .where(eq(tournaments.id, parseInt(id)));
    
    res.status(201).json(registration[0]);
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ message: 'Failed to register for tournament' });
  }
});

/**
 * DELETE /api/tournaments/:id/register
 * Withdraw from a tournament
 */
router.delete('/:id/register', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if user is registered for the tournament
    const existingRegistration = await db.select().from(tournamentRegistrations)
      .where(and(
        eq(tournamentRegistrations.tournamentId, parseInt(id)),
        eq(tournamentRegistrations.userId, userId)
      ));
    
    if (existingRegistration.length === 0) {
      return res.status(404).json({ message: 'You are not registered for this tournament' });
    }
    
    // Get tournament data
    const tournamentData = await db.select().from(tournaments)
      .where(eq(tournaments.id, parseInt(id)));
    
    if (tournamentData.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const tournament = tournamentData[0];
    
    // Check if withdrawal is allowed (tournament hasn't started)
    const now = new Date();
    if (new Date(tournament.startDate) <= now) {
      return res.status(400).json({ message: 'Cannot withdraw after tournament has started' });
    }
    
    // Delete the registration
    await db.delete(tournamentRegistrations)
      .where(and(
        eq(tournamentRegistrations.tournamentId, parseInt(id)),
        eq(tournamentRegistrations.userId, userId)
      ));
    
    // Update the tournament's current participants count
    await db.update(tournaments)
      .set({ currentParticipants: Math.max(0, tournament.currentParticipants - 1) })
      .where(eq(tournaments.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error withdrawing from tournament:', error);
    res.status(500).json({ message: 'Failed to withdraw from tournament' });
  }
});

/**
 * GET /api/tournaments/tiers
 * Get all tournament tiers
 */
router.get('/tiers/all', async (req: Request, res: Response) => {
  try {
    const tiers = await db.select().from(tournamentTiers)
      .where(eq(tournamentTiers.active, true))
      .orderBy(asc(tournamentTiers.pointsMultiplier));
    
    res.json(tiers);
  } catch (error) {
    console.error('Error getting tournament tiers:', error);
    res.status(500).json({ message: 'Failed to get tournament tiers' });
  }
});

/**
 * GET /api/tournaments/categories
 * Get all tournament categories
 */
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(tournamentCategories)
      .where(eq(tournamentCategories.active, true));
    
    res.json(categories);
  } catch (error) {
    console.error('Error getting tournament categories:', error);
    res.status(500).json({ message: 'Failed to get tournament categories' });
  }
});

/**
 * GET /api/tournaments/divisions
 * Get all tournament age divisions
 */
router.get('/divisions/all', async (req: Request, res: Response) => {
  try {
    const divisions = await db.select().from(tournamentAgeDivisions)
      .where(eq(tournamentAgeDivisions.active, true))
      .orderBy(asc(tournamentAgeDivisions.minAge));
    
    res.json(divisions);
  } catch (error) {
    console.error('Error getting tournament age divisions:', error);
    res.status(500).json({ message: 'Failed to get tournament age divisions' });
  }
});

/**
 * GET /api/tournaments/rounds/points
 * Get round points structure
 */
router.get('/rounds/points', async (req: Request, res: Response) => {
  try {
    const roundPoints = await db.select().from(tournamentRoundPoints)
      .where(eq(tournamentRoundPoints.active, true))
      .orderBy(asc(tournamentRoundPoints.roundOrder));
    
    res.json(roundPoints);
  } catch (error) {
    console.error('Error getting tournament round points:', error);
    res.status(500).json({ message: 'Failed to get tournament round points' });
  }
});

export default router;