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
      query = query.where(eq(tournaments.category, category as string));
    }
    
    if (division) {
      // Age division (Open, 35+, etc.)
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
    
    // Combine data
    const result = {
      ...tournament[0],
      currentRegistrations: registrationsCount[0].count,
      brackets: [] // Placeholder for brackets until we implement full tournament bracket functionality
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
    console.log('Tournament creation request body:', req.body);
    
    // Transform between camelCase and snake_case as needed
    const transformedData = {
      ...req.body,
      // Convert snake_case form fields back to camelCase for validation
      startDate: req.body.start_date || req.body.startDate,
      endDate: req.body.end_date || req.body.endDate,
      registrationStartDate: req.body.registration_start_date || req.body.registrationStartDate,
      registrationEndDate: req.body.registration_end_date || req.body.registrationEndDate,
      venueAddress: req.body.venue_address || req.body.venueAddress,
      numberOfCourts: req.body.number_of_courts || req.body.numberOfCourts,
      courtSurface: req.body.court_surface || req.body.courtSurface,
      maxParticipants: req.body.max_participants || req.body.maxParticipants,
      minParticipants: req.body.min_participants || req.body.minParticipants,
      minRating: req.body.min_rating || req.body.minRating,
      maxRating: req.body.max_rating || req.body.maxRating,
      entryFee: req.body.entry_fee || req.body.entryFee,
      earlyBirdFee: req.body.early_bird_fee || req.body.earlyBirdFee,
      lateRegistrationFee: req.body.late_registration_fee || req.body.lateRegistrationFee,
      prizePool: req.body.prize_pool || req.body.prizePool,
      contactEmail: req.body.contact_email || req.body.contactEmail,
      contactPhone: req.body.contact_phone || req.body.contactPhone,
      // Remove snake_case duplicates
      start_date: undefined,
      end_date: undefined,
      registration_start_date: undefined,
      registration_end_date: undefined,
      venue_address: undefined,
      number_of_courts: undefined,
      court_surface: undefined,
      max_participants: undefined,
      min_participants: undefined,
      min_rating: undefined,
      max_rating: undefined,
      entry_fee: undefined,
      early_bird_fee: undefined,
      late_registration_fee: undefined,
      prize_pool: undefined,
      contact_email: undefined,
      contact_phone: undefined
    };

    // Remove undefined fields
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    console.log('Transformed tournament data:', transformedData);
    
    const validated = insertTournamentSchema.safeParse(transformedData);
    
    if (!validated.success) {
      console.log('Validation errors:', validated.error.format());
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
      .set({ currentParticipants: (tournament.currentParticipants || 0) + 1 })
      .where(eq(tournaments.id, parseInt(id)));
    
    res.status(201).json(registration[0]);
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ message: 'Failed to register for tournament' });
  }
});

/**
 * GET /api/tournaments/:id/registration/check
 * Check if the authenticated user is registered for a tournament
 */
router.get('/:id/registration/check', isAuthenticated, async (req: Request, res: Response) => {
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
    
    res.status(200).json(existingRegistration[0]);
  } catch (error) {
    console.error('Error checking tournament registration status:', error);
    res.status(500).json({ message: 'Failed to check registration status' });
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
      .set({ currentParticipants: Math.max(0, (tournament.currentParticipants || 0) - 1) })
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
    // Return predefined tournament tiers
    const tiers = [
      { id: 1, name: 'Club Tournament', code: 'CLUB', pointsMultiplier: 1.0, description: 'Local club level tournaments', badgeUrl: '', requiresVerification: false, active: true },
      { id: 2, name: 'District Tournament', code: 'DISTRICT', pointsMultiplier: 1.1, description: 'District level tournaments', badgeUrl: '', requiresVerification: false, active: true },
      { id: 3, name: 'City Tournament', code: 'CITY', pointsMultiplier: 1.2, description: 'City championship tournaments', badgeUrl: '', requiresVerification: true, active: true },
      { id: 4, name: 'Provincial Tournament', code: 'PROVINCIAL', pointsMultiplier: 1.5, description: 'Provincial level championships', badgeUrl: '', requiresVerification: true, active: true },
      { id: 5, name: 'National Tournament', code: 'NATIONAL', pointsMultiplier: 1.8, description: 'National championships', badgeUrl: '', requiresVerification: true, active: true },
      { id: 6, name: 'Regional Tournament', code: 'REGIONAL', pointsMultiplier: 2.2, description: 'Multi-country regional tournaments', badgeUrl: '', requiresVerification: true, active: true },
      { id: 7, name: 'International Tournament', code: 'INTERNATIONAL', pointsMultiplier: 3.0, description: 'International championship tournaments', badgeUrl: '', requiresVerification: true, active: true }
    ];
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
    // Return predefined tournament categories
    const categories = [
      { id: 1, name: 'Singles', code: 'SINGLES', playersPerTeam: 1, description: 'Individual competition', active: true },
      { id: 2, name: 'Doubles', code: 'DOUBLES', playersPerTeam: 2, description: 'Two players of the same gender', active: true },
      { id: 3, name: 'Mixed Doubles', code: 'MIXED', playersPerTeam: 2, description: 'One male and one female player', active: true }
    ];
    
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
    // Return predefined tournament age divisions
    const divisions = [
      { id: 1, name: 'Open Division', code: 'OPEN', minAge: 19, maxAge: null, description: 'Open to all players 19 and older', active: true },
      { id: 2, name: '35+ Division', code: '35_PLUS', minAge: 35, maxAge: null, description: 'Players 35 and older', active: true },
      { id: 3, name: '50+ Division', code: '50_PLUS', minAge: 50, maxAge: null, description: 'Players 50 and older', active: true },
      { id: 4, name: '65+ Division', code: '65_PLUS', minAge: 65, maxAge: null, description: 'Players 65 and older', active: true },
      { id: 5, name: 'Junior Division', code: 'JUNIOR', minAge: 12, maxAge: 18, description: 'Players between 12-18 years', active: true }
    ];
    
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
    // Return predefined tournament round points
    const roundPoints = [
      { id: 1, roundName: 'R64', displayName: 'Round of 64', pointsAwarded: 10, roundOrder: 1, active: true },
      { id: 2, roundName: 'R32', displayName: 'Round of 32', pointsAwarded: 15, roundOrder: 2, active: true },
      { id: 3, roundName: 'R16', displayName: 'Round of 16', pointsAwarded: 25, roundOrder: 3, active: true },
      { id: 4, roundName: 'QF', displayName: 'Quarter-Finals', pointsAwarded: 40, roundOrder: 4, active: true },
      { id: 5, roundName: 'SF', displayName: 'Semi-Finals', pointsAwarded: 60, roundOrder: 5, active: true },
      { id: 6, roundName: 'F', displayName: 'Finals', pointsAwarded: 80, roundOrder: 6, active: true },
      { id: 7, roundName: 'Champion', displayName: 'Champion', pointsAwarded: 100, roundOrder: 7, active: true }
    ];
    
    res.json(roundPoints);
  } catch (error) {
    console.error('Error getting tournament round points:', error);
    res.status(500).json({ message: 'Failed to get tournament round points' });
  }
});

export default router;