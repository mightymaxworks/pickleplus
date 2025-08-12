// Simple Admin Match Management API Routes - Fixed Version
import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { competitions } from '../../../shared/schema/admin-match-management';
import { users } from '../../../shared/schema';
import { createCompetitionSchema } from '../../../shared/schema/admin-match-management';

const router = Router();

// Get all competitions
router.get('/competitions', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('[Admin Match Management] Getting competitions');
    
    const result = await db.select({
      id: competitions.id,
      name: competitions.name,
      description: competitions.description,
      type: competitions.type,
      startDate: competitions.startDate,
      endDate: competitions.endDate,
      status: competitions.status,
      maxParticipants: competitions.maxParticipants,
      entryFee: competitions.entryFee,
      prizePool: competitions.prizePool,
      pointsMultiplier: competitions.pointsMultiplier,
      createdAt: competitions.createdAt,
    })
    .from(competitions)
    .orderBy(desc(competitions.createdAt));

    console.log(`[Admin Match Management] Found ${result.length} competitions`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Admin Match Management] Error fetching competitions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch competitions'
    });
  }
});

// Create a new competition
router.post('/competitions', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('[Admin Match Management] Creating competition with data:', req.body);
    
    const competitionData = createCompetitionSchema.parse({
      ...req.body,
      createdBy: req.user!.id
    });
    
    console.log('[Admin Match Management] Parsed competition data:', competitionData);

    const [newCompetition] = await db.insert(competitions)
      .values(competitionData)
      .returning();

    console.log('[Admin Match Management] Competition created successfully:', newCompetition);

    res.json({
      success: true,
      data: newCompetition
    });
  } catch (error) {
    console.error('[Admin Match Management] Error creating competition:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create competition'
    });
  }
});

// Placeholder endpoints for other operations
router.get('/matches', requireAuth, requireAdmin, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/players/available', requireAuth, requireAdmin, async (req, res) => {
  try {
    const players = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username
    }).from(users).limit(50);
    
    res.json({ success: true, data: players });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

export default router;