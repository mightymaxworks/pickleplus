/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Promotional System Routes
 * 
 * API routes for the golden ticket promotional feature.
 */

import express, { Request, Response } from 'express';
import { db } from '../db';
import { sql, and, eq, gt, gte, lte } from 'drizzle-orm';
import { isAdmin, isAuthenticated } from '../auth';
import { 
  goldenTickets, 
  goldenTicketClaims, 
  sponsors, 
  insertGoldenTicketSchema,
  insertSponsorSchema
} from '../../shared/golden-ticket.schema';
import { nanoid } from 'nanoid';

/**
 * Register golden ticket routes
 */
export function registerGoldenTicketRoutes(app: express.Express) {
  console.log('[Routes] Registering golden ticket routes');

  // Check for a golden ticket to appear
  app.get('/api/golden-ticket/check', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      
      // Check if user has any active claims in the last 24 hours
      const recentClaims = await db.query.goldenTicketClaims.findMany({
        where: and(
          eq(goldenTicketClaims.userId, userId),
          gte(goldenTicketClaims.claimedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      });
      
      if (recentClaims.length > 0) {
        return res.json({ result: 'no-ticket' });
      }
      
      // Find active tickets
      const activeTickets = await db.query.goldenTickets.findMany({
        where: and(
          eq(goldenTickets.status, 'active'),
          lte(goldenTickets.startDate, new Date()),
          gte(goldenTickets.endDate, new Date()),
          sql`${goldenTickets.currentClaims} < ${goldenTickets.maxClaims}`
        )
      });
      
      if (activeTickets.length === 0) {
        return res.json({ result: 'no-ticket' });
      }
      
      // Random chance based on appearance rate (1-100%)
      const randomTicket = activeTickets[Math.floor(Math.random() * activeTickets.length)];
      const randomNum = Math.random() * 100;
      
      if (randomNum <= randomTicket.appearanceRate) {
        return res.json({ result: 'show-ticket', ticketId: randomTicket.id });
      } else {
        return res.json({ result: 'no-ticket' });
      }
    } catch (error) {
      console.error('Error checking for golden ticket:', error);
      res.status(500).json({ error: 'Failed to check for golden ticket' });
    }
  });
  
  // Get a specific golden ticket
  app.get('/api/golden-ticket/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      
      // Get the ticket with sponsor info
      const ticket = await db.query.goldenTickets.findFirst({
        where: eq(goldenTickets.id, ticketId),
        with: {
          sponsor: true
        }
      });
      
      if (!ticket) {
        return res.status(404).json({ error: 'Golden ticket not found' });
      }
      
      // Format response
      const response = {
        ...ticket,
        sponsorName: ticket.sponsor?.name,
        sponsorLogoUrl: ticket.sponsor?.logoUrl,
        sponsorWebsite: ticket.sponsor?.websiteUrl
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error getting golden ticket:', error);
      res.status(500).json({ error: 'Failed to retrieve golden ticket' });
    }
  });
  
  // Claim a golden ticket
  app.post('/api/golden-ticket/claim', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const ticketId = req.body.ticketId;
      
      if (!ticketId) {
        return res.status(400).json({ error: 'Missing ticket ID' });
      }
      
      // Check if ticket exists and is active
      const ticket = await db.query.goldenTickets.findFirst({
        where: and(
          eq(goldenTickets.id, ticketId),
          eq(goldenTickets.status, 'active'),
          lte(goldenTickets.startDate, new Date()),
          gte(goldenTickets.endDate, new Date())
        )
      });
      
      if (!ticket) {
        return res.status(404).json({ error: 'Golden ticket not found or inactive' });
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
      
      // Check if max claims reached
      if (ticket.currentClaims >= ticket.maxClaims) {
        return res.status(400).json({ error: 'Maximum claims reached for this ticket' });
      }
      
      // Create claim and update claim count
      const [claim] = await db.transaction(async (tx) => {
        // Insert new claim
        const newClaims = await tx.insert(goldenTicketClaims)
          .values({
            ticketId,
            userId,
            redemptionCode: nanoid(10).toUpperCase()
          })
          .returning();
        
        // Update current claims count
        await tx.update(goldenTickets)
          .set({ 
            currentClaims: ticket.currentClaims + 1,
            // If max claims reached, set to completed
            status: ticket.currentClaims + 1 >= ticket.maxClaims ? 'completed' : 'active' 
          })
          .where(eq(goldenTickets.id, ticketId));
          
        return newClaims;
      });
      
      res.json({
        success: true,
        claim
      });
    } catch (error) {
      console.error('Error claiming golden ticket:', error);
      res.status(500).json({ error: 'Failed to claim golden ticket' });
    }
  });

  // Get user's claimed tickets
  app.get('/api/golden-ticket/my-tickets', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      
      const claims = await db.query.goldenTicketClaims.findMany({
        where: eq(goldenTicketClaims.userId, userId),
        with: {
          ticket: {
            with: {
              sponsor: true
            }
          }
        },
        orderBy: (fields, { desc }) => [desc(fields.claimedAt)]
      });
      
      res.json(claims);
    } catch (error) {
      console.error('Error getting user tickets:', error);
      res.status(500).json({ error: 'Failed to retrieve user tickets' });
    }
  });

  /**
   * Admin routes
   */

  // Get all golden tickets (admin only)
  app.get('/api/admin/golden-tickets', isAdmin, async (req: Request, res: Response) => {
    try {
      const tickets = await db.query.goldenTickets.findMany({
        with: {
          sponsor: true
        },
        orderBy: (fields, { desc }) => [desc(fields.createdAt)]
      });
      
      res.json(tickets);
    } catch (error) {
      console.error('Error getting all golden tickets:', error);
      res.status(500).json({ error: 'Failed to retrieve golden tickets' });
    }
  });
  
  // Create golden ticket (admin only)
  app.post('/api/admin/golden-tickets', isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = insertGoldenTicketSchema.parse(req.body);
      
      // Create ticket
      const newTickets = await db.insert(goldenTickets)
        .values(validatedData)
        .returning();
      
      res.json(newTickets[0]);
    } catch (error) {
      console.error('Error creating golden ticket:', error);
      res.status(500).json({ error: 'Failed to create golden ticket' });
    }
  });
  
  // Update golden ticket (admin only)
  app.put('/api/admin/golden-tickets/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      
      const updateResult = await db.update(goldenTickets)
        .set(req.body)
        .where(eq(goldenTickets.id, ticketId))
        .returning();
      
      if (updateResult.length === 0) {
        return res.status(404).json({ error: 'Golden ticket not found' });
      }
      
      res.json(updateResult[0]);
    } catch (error) {
      console.error('Error updating golden ticket:', error);
      res.status(500).json({ error: 'Failed to update golden ticket' });
    }
  });
  
  // Get all sponsors (admin only)
  app.get('/api/admin/sponsors', isAdmin, async (req: Request, res: Response) => {
    try {
      const allSponsors = await db.query.sponsors.findMany({
        orderBy: (fields, { asc }) => [asc(fields.name)]
      });
      res.json(allSponsors);
    } catch (error) {
      console.error('Error getting all sponsors:', error);
      res.status(500).json({ error: 'Failed to retrieve sponsors' });
    }
  });
  
  // Create sponsor (admin only)
  app.post('/api/admin/sponsors', isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = insertSponsorSchema.parse(req.body);
      
      const newSponsors = await db.insert(sponsors)
        .values(validatedData)
        .returning();
      
      res.json(newSponsors[0]);
    } catch (error) {
      console.error('Error creating sponsor:', error);
      res.status(500).json({ error: 'Failed to create sponsor' });
    }
  });
  
  // Get all ticket claims (admin only)
  app.get('/api/admin/ticket-claims', isAdmin, async (req: Request, res: Response) => {
    try {
      const claims = await db.query.goldenTicketClaims.findMany({
        with: {
          ticket: true,
          user: true
        },
        orderBy: (fields, { desc }) => [desc(fields.claimedAt)]
      });
      
      res.json(claims);
    } catch (error) {
      console.error('Error getting ticket claims:', error);
      res.status(500).json({ error: 'Failed to retrieve ticket claims' });
    }
  });

  // Update claim status (admin only)
  app.put('/api/admin/ticket-claims/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const claimId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const updateResult = await db.update(goldenTicketClaims)
        .set({ 
          status,
          redemptionDate: status === 'redeemed' ? new Date() : undefined,
          updatedAt: new Date()
        })
        .where(eq(goldenTicketClaims.id, claimId))
        .returning();
      
      if (updateResult.length === 0) {
        return res.status(404).json({ error: 'Claim not found' });
      }
      
      res.json(updateResult[0]);
    } catch (error) {
      console.error('Error updating claim status:', error);
      res.status(500).json({ error: 'Failed to update claim status' });
    }
  });
}