/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Routes
 * 
 * API routes for the golden ticket promotional system.
 */

import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { isAdmin, isAuthenticated } from '../auth';
import { asc, desc, eq, and, sql, gt, lt, ilike, inArray } from 'drizzle-orm';
import { 
  sponsors, 
  goldenTickets, 
  goldenTicketClaims,
  insertSponsorSchema,
  insertGoldenTicketSchema,
  insertGoldenTicketClaimSchema
} from '../../shared/golden-ticket.schema';
import { extractFilterParams } from '../utils/query-helpers';

const router = Router();

// CLAIM ROUTES (USER)

/**
 * Get all claims for the current user
 */
router.get('/claims', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const claims = await db.query.goldenTicketClaims.findMany({
      where: eq(goldenTicketClaims.userId, userId),
      with: {
        ticket: true
      },
      orderBy: [desc(goldenTicketClaims.claimedAt)]
    });

    return res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get available tickets (not claimed by current user)
 */
router.get('/tickets', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const now = new Date();
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get IDs of tickets already claimed by this user
    const claimedTicketsQuery = await db.query.goldenTicketClaims.findMany({
      where: eq(goldenTicketClaims.userId, userId),
      columns: {
        ticketId: true
      }
    });
    
    const claimedTicketIds = claimedTicketsQuery.map(claim => claim.ticketId);

    // Get active tickets not claimed by this user
    const tickets = await db.query.goldenTickets.findMany({
      where: and(
        eq(goldenTickets.status, 'active'),
        gt(goldenTickets.endDate, now),
        lt(goldenTickets.startDate, now),
        // Only include tickets where currentClaims < maxClaims
        sql`${goldenTickets.currentClaims} < ${goldenTickets.maxClaims}`,
        // Exclude tickets already claimed by this user
        claimedTicketIds.length > 0 
          ? sql`${goldenTickets.id} NOT IN (${claimedTicketIds.join(',')})` 
          : undefined
      ),
      with: {
        sponsor: true
      }
    });

    return res.json(tickets);
  } catch (error) {
    console.error('Error fetching available tickets:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Claim a ticket
 */
router.post('/tickets/:id/claim', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const ticketId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Validate that ticket exists, is active, and can be claimed
    const ticket = await db.query.goldenTickets.findFirst({
      where: and(
        eq(goldenTickets.id, ticketId),
        eq(goldenTickets.status, 'active'),
        gt(goldenTickets.endDate, new Date()),
        lt(goldenTickets.startDate, new Date())
      )
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not available or does not exist' });
    }

    if (ticket.currentClaims >= ticket.maxClaims) {
      return res.status(400).json({ error: 'Maximum claims reached for this ticket' });
    }

    // Check if user already claimed this ticket
    const existingClaim = await db.query.goldenTicketClaims.findFirst({
      where: and(
        eq(goldenTicketClaims.ticketId, ticketId),
        eq(goldenTicketClaims.userId, userId)
      )
    });

    if (existingClaim) {
      return res.status(400).json({ error: 'You have already claimed this ticket' });
    }

    // Create claim in a transaction
    await db.transaction(async (tx) => {
      // Increment current claims
      await tx.update(goldenTickets)
        .set({ currentClaims: sql`${goldenTickets.currentClaims} + 1` })
        .where(eq(goldenTickets.id, ticketId));
      
      // Insert claim
      const claim = await tx.insert(goldenTicketClaims)
        .values({
          ticketId,
          userId,
          status: 'pending'
        })
        .returning();

      return claim[0];
    });

    // Get the newly created claim with ticket information
    const newClaim = await db.query.goldenTicketClaims.findFirst({
      where: and(
        eq(goldenTicketClaims.ticketId, ticketId),
        eq(goldenTicketClaims.userId, userId)
      ),
      with: {
        ticket: true
      }
    });

    return res.status(201).json(newClaim);
  } catch (error) {
    console.error('Error claiming ticket:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update claim details (shipping address, etc.)
 */
router.patch('/claims/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const claimId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isNaN(claimId)) {
      return res.status(400).json({ error: 'Invalid claim ID' });
    }

    // Verify claim belongs to user
    const existingClaim = await db.query.goldenTicketClaims.findFirst({
      where: and(
        eq(goldenTicketClaims.id, claimId),
        eq(goldenTicketClaims.userId, userId)
      )
    });

    if (!existingClaim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Validate request body
    const schema = z.object({
      shippingAddress: z.string().optional(),
    });

    const parsedData = schema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Update claim
    const updated = await db.update(goldenTicketClaims)
      .set({
        ...parsedData.data,
        updatedAt: new Date()
      })
      .where(eq(goldenTicketClaims.id, claimId))
      .returning();

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error updating claim:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ADMIN ROUTES

/**
 * Get all claims (admin)
 */
router.get('/admin/claims', isAdmin, async (req: Request, res: Response) => {
  try {
    const { sort, order, status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Filter parameters
    const filters = [];
    
    if (status) {
      filters.push(eq(goldenTicketClaims.status, String(status)));
    }

    // Query with filters
    const claims = await db.query.goldenTicketClaims.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        ticket: true,
        user: true
      },
      orderBy: sort && order 
        ? order === 'desc' 
          ? [desc(goldenTicketClaims[sort as keyof typeof goldenTicketClaims])] 
          : [asc(goldenTicketClaims[sort as keyof typeof goldenTicketClaims])]
        : [desc(goldenTicketClaims.claimedAt)],
      limit: Number(limit),
      offset
    });

    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` })
      .from(goldenTicketClaims)
      .where(filters.length > 0 ? and(...filters) : undefined);
    
    const total = Number(countResult[0]?.count || '0');

    return res.json({
      claims,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get all tickets (admin)
 */
router.get('/admin/tickets', isAdmin, async (req: Request, res: Response) => {
  try {
    const { sort, order, status, search, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Filter parameters
    const filters = [];
    
    if (status) {
      filters.push(eq(goldenTickets.status, String(status)));
    }
    
    if (search) {
      filters.push(
        or(
          ilike(goldenTickets.title, `%${search}%`),
          ilike(goldenTickets.campaignId, `%${search}%`),
          ilike(goldenTickets.description, `%${search}%`)
        )
      );
    }

    // Query with filters
    const tickets = await db.query.goldenTickets.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        sponsor: true
      },
      orderBy: sort && order 
        ? order === 'desc' 
          ? [desc(goldenTickets[sort as keyof typeof goldenTickets])] 
          : [asc(goldenTickets[sort as keyof typeof goldenTickets])]
        : [desc(goldenTickets.createdAt)],
      limit: Number(limit),
      offset
    });

    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` })
      .from(goldenTickets)
      .where(filters.length > 0 ? and(...filters) : undefined);
    
    const total = Number(countResult[0]?.count || '0');

    return res.json({
      tickets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get all sponsors (admin)
 */
router.get('/admin/sponsors', isAdmin, async (req: Request, res: Response) => {
  try {
    const { sort, order, active, search, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Filter parameters
    const filters = [];
    
    if (active !== undefined) {
      filters.push(eq(sponsors.active, active === 'true'));
    }
    
    if (search) {
      filters.push(
        or(
          ilike(sponsors.name, `%${search}%`),
          ilike(sponsors.description, `%${search}%`)
        )
      );
    }

    // Query with filters
    const sponsorsList = await db.query.sponsors.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: sort && order 
        ? order === 'asc' 
          ? [asc(sponsors[sort as keyof typeof sponsors])] 
          : [desc(sponsors[sort as keyof typeof sponsors])]
        : [asc(sponsors.name)],
      limit: Number(limit),
      offset
    });

    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` })
      .from(sponsors)
      .where(filters.length > 0 ? and(...filters) : undefined);
    
    const total = Number(countResult[0]?.count || '0');

    return res.json({
      sponsors: sponsorsList,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update claim status (admin)
 */
router.patch('/admin/claims/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const claimId = parseInt(req.params.id);
    
    if (isNaN(claimId)) {
      return res.status(400).json({ error: 'Invalid claim ID' });
    }

    // Validate request body
    const schema = z.object({
      status: z.enum(['pending', 'approved', 'fulfilled', 'rejected', 'expired']),
      fulfillmentDetails: z.string().optional(),
      shippingTrackingCode: z.string().optional(),
      adminNotes: z.string().optional()
    });

    const parsedData = schema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Update claim
    const updated = await db.update(goldenTicketClaims)
      .set({
        ...parsedData.data,
        updatedAt: new Date()
      })
      .where(eq(goldenTicketClaims.id, claimId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error updating claim:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create ticket (admin)
 */
router.post('/admin/tickets', isAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsedData = insertGoldenTicketSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Create ticket
    const ticket = await db.insert(goldenTickets)
      .values({
        ...parsedData.data,
        currentAppearances: 0,
        currentClaims: 0
      })
      .returning();

    return res.status(201).json(ticket[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update ticket (admin)
 */
router.patch('/admin/tickets/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Validate request body against a partial schema
    const updateSchema = insertGoldenTicketSchema.partial();
    const parsedData = updateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Update ticket
    const updated = await db.update(goldenTickets)
      .set({
        ...parsedData.data,
        updatedAt: new Date()
      })
      .where(eq(goldenTickets.id, ticketId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete ticket (admin)
 */
router.delete('/admin/tickets/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Check if claims exist
    const claimsCount = await db.select({ count: sql`count(*)` })
      .from(goldenTicketClaims)
      .where(eq(goldenTicketClaims.ticketId, ticketId));
    
    if (Number(claimsCount[0]?.count || '0') > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete ticket with existing claims',
        suggestion: 'Set status to cancelled instead'
      });
    }

    // Delete ticket
    await db.delete(goldenTickets)
      .where(eq(goldenTickets.id, ticketId));

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create sponsor (admin)
 */
router.post('/admin/sponsors', isAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsedData = insertSponsorSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Create sponsor
    const sponsor = await db.insert(sponsors)
      .values(parsedData.data)
      .returning();

    return res.status(201).json(sponsor[0]);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update sponsor (admin)
 */
router.patch('/admin/sponsors/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const sponsorId = parseInt(req.params.id);
    
    if (isNaN(sponsorId)) {
      return res.status(400).json({ error: 'Invalid sponsor ID' });
    }

    // Validate request body against a partial schema
    const updateSchema = insertSponsorSchema.partial();
    const parsedData = updateSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      return res.status(400).json({ 
        error: 'Invalid data', 
        details: parsedData.error.errors 
      });
    }

    // Update sponsor
    const updated = await db.update(sponsors)
      .set({
        ...parsedData.data,
        updatedAt: new Date()
      })
      .where(eq(sponsors.id, sponsorId))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete sponsor (admin)
 */
router.delete('/admin/sponsors/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const sponsorId = parseInt(req.params.id);
    
    if (isNaN(sponsorId)) {
      return res.status(400).json({ error: 'Invalid sponsor ID' });
    }

    // Check if tickets with this sponsor exist
    const ticketCount = await db.select({ count: sql`count(*)` })
      .from(goldenTickets)
      .where(eq(goldenTickets.sponsorId, sponsorId));
    
    if (Number(ticketCount[0]?.count || '0') > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete sponsor with existing tickets',
        suggestion: 'Set active to false instead'
      });
    }

    // Delete sponsor
    await db.delete(sponsors)
      .where(eq(sponsors.id, sponsorId));

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export function registerGoldenTicketRoutes(app: Express) {
  app.use('/api/golden-ticket', router);
  console.log('[API] Golden Ticket routes registered');
}

export default router;