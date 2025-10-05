/**
 * Challenge Routes - Sprint 2: Gaming HUD Enhancement
 * Handles match challenge creation, acceptance, and notifications
 */

import { Router } from 'express';
import { db } from '../db';
import { matchChallenges, users } from '../../shared/schema';
import { insertMatchChallengeSchema, respondToChallengeSchema } from '../../shared/schema/match-challenges';
import { eq, and, or, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

/**
 * POST /api/challenges/create
 * Create a new match challenge
 */
router.post('/create', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const validatedData = insertMatchChallengeSchema.parse({
      ...req.body,
      challengerId: userId,
      expiresAt: req.body.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h default
    });

    // Create challenge record
    const [challenge] = await db.insert(matchChallenges)
      .values({
        challengerId: validatedData.challengerId,
        challengedId: validatedData.challengedId,
        matchType: validatedData.matchType,
        challengerPartnerId: validatedData.challengerPartnerId || null,
        status: 'pending',
        createdVia: validatedData.createdVia,
        sourceContext: validatedData.sourceContext || null,
        message: validatedData.message || null,
        expiresAt: validatedData.expiresAt
      })
      .returning();

    // Get challenger details for notification
    const [challenger] = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      passportCode: users.passportCode
    })
    .from(users)
    .where(eq(users.id, userId));

    // Get partner details if doubles/mixed
    let partnerName = null;
    if (validatedData.challengerPartnerId) {
      const [partner] = await db.select({
        displayName: users.displayName,
        username: users.username
      })
      .from(users)
      .where(eq(users.id, validatedData.challengerPartnerId));
      
      partnerName = partner?.displayName || partner?.username || 'Partner';
    }

    // Create notification for challenged player
    await db.execute(sql`
      INSERT INTO user_notifications (user_id, type, title, message, reference_id, reference_type, link, is_read)
      VALUES (
        ${validatedData.challengedId},
        'challenge',
        'New Match Challenge!',
        ${`${challenger.displayName || challenger.username} challenged you to a ${validatedData.matchType} match${partnerName ? ` with partner ${partnerName}` : ''}. Respond within 24h!`},
        ${challenge.id},
        'match_challenge',
        ${`/match-arena?challenge=${challenge.id}`},
        false
      )
    `);

    // Broadcast notification via WebSocket
    const notificationWS = (global as any).notificationWS;
    if (notificationWS) {
      notificationWS.sendToUser(validatedData.challengedId.toString(), {
        type: 'challenge',
        data: {
          challengeId: challenge.id,
          challengerName: challenger.displayName || challenger.username,
          matchType: validatedData.matchType,
          partnerName,
          expiresAt: challenge.expiresAt
        }
      });
    }

    res.json({
      success: true,
      challenge: {
        id: challenge.id,
        status: challenge.status,
        expiresAt: challenge.expiresAt
      }
    });

  } catch (error) {
    console.error('[Challenge Routes] Error creating challenge:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid challenge data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

/**
 * POST /api/challenges/:id/respond
 * Accept or decline a challenge
 */
router.post('/:id/respond', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challengeId = parseInt(req.params.id);
    const { action, partnerId } = respondToChallengeSchema.parse({ ...req.body, challengeId });

    // Get challenge
    const [challenge] = await db.select()
      .from(matchChallenges)
      .where(eq(matchChallenges.id, challengeId));

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify user is the challenged player
    if (challenge.challengedId !== userId) {
      return res.status(403).json({ error: 'Not authorized to respond to this challenge' });
    }

    // Check if expired
    if (new Date(challenge.expiresAt) < new Date()) {
      await db.update(matchChallenges)
        .set({ status: 'expired' })
        .where(eq(matchChallenges.id, challengeId));
      
      return res.status(400).json({ error: 'Challenge has expired' });
    }

    // Update challenge status
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const updateData: any = {
      status: newStatus,
      respondedAt: new Date()
    };

    // If accepting doubles/mixed, set partner
    if (action === 'accept' && (challenge.matchType === 'doubles' || challenge.matchType === 'mixed')) {
      if (!partnerId) {
        return res.status(400).json({ error: 'Partner required for doubles/mixed matches' });
      }
      updateData.challengedPartnerId = partnerId;
    }

    await db.update(matchChallenges)
      .set(updateData)
      .where(eq(matchChallenges.id, challengeId));

    // Notify challenger
    const actionText = action === 'accept' ? 'accepted' : 'declined';
    const [challenged] = await db.select({
      displayName: users.displayName,
      username: users.username
    })
    .from(users)
    .where(eq(users.id, userId));

    await db.execute(sql`
      INSERT INTO user_notifications (user_id, type, title, message, reference_id, reference_type, link, is_read)
      VALUES (
        ${challenge.challengerId},
        'challenge_response',
        ${`Challenge ${actionText}!`},
        ${`${challenged.displayName || challenged.username} ${actionText} your ${challenge.matchType} challenge${action === 'accept' ? '. Prepare for battle!' : '.'}`},
        ${challenge.id},
        'match_challenge',
        ${action === 'accept' ? `/match-arena?challenge=${challenge.id}` : null},
        false
      )
    `);

    // WebSocket notification
    const notificationWS = (global as any).notificationWS;
    if (notificationWS) {
      notificationWS.sendToUser(challenge.challengerId.toString(), {
        type: 'challenge_response',
        data: {
          challengeId: challenge.id,
          respondedBy: challenged.displayName || challenged.username,
          action,
          matchType: challenge.matchType
        }
      });
    }

    res.json({
      success: true,
      challenge: {
        id: challenge.id,
        status: newStatus
      }
    });

  } catch (error) {
    console.error('[Challenge Routes] Error responding to challenge:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid response data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to respond to challenge' });
  }
});

/**
 * GET /api/challenges/incoming
 * Get pending challenges for current user
 */
router.get('/incoming', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challenges = await db.select({
      id: matchChallenges.id,
      matchType: matchChallenges.matchType,
      status: matchChallenges.status,
      message: matchChallenges.message,
      createdAt: matchChallenges.createdAt,
      expiresAt: matchChallenges.expiresAt,
      challengerName: users.displayName,
      challengerUsername: users.username
    })
    .from(matchChallenges)
    .innerJoin(users, eq(matchChallenges.challengerId, users.id))
    .where(and(
      eq(matchChallenges.challengedId, userId),
      eq(matchChallenges.status, 'pending')
    ))
    .orderBy(sql`${matchChallenges.createdAt} DESC`);

    res.json({ challenges });

  } catch (error) {
    console.error('[Challenge Routes] Error fetching incoming challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

/**
 * GET /api/challenges/sent
 * Get challenges sent by current user
 */
router.get('/sent', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challenges = await db.select({
      id: matchChallenges.id,
      matchType: matchChallenges.matchType,
      status: matchChallenges.status,
      message: matchChallenges.message,
      createdAt: matchChallenges.createdAt,
      expiresAt: matchChallenges.expiresAt,
      respondedAt: matchChallenges.respondedAt,
      challengedName: users.displayName,
      challengedUsername: users.username
    })
    .from(matchChallenges)
    .innerJoin(users, eq(matchChallenges.challengedId, users.id))
    .where(eq(matchChallenges.challengerId, userId))
    .orderBy(sql`${matchChallenges.createdAt} DESC`);

    res.json({ challenges });

  } catch (error) {
    console.error('[Challenge Routes] Error fetching sent challenges:', error);
    res.status(500).json({ error: 'Failed to fetch sent challenges' });
  }
});

/**
 * GET /api/challenges/:id
 * Get challenge details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challengeId = parseInt(req.params.id);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    // Fetch challenge with all player details
    const [challenge] = await db.select()
      .from(matchChallenges)
      .where(eq(matchChallenges.id, challengeId));

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify user is involved in this challenge
    const isInvolved = 
      challenge.challengerId === userId ||
      challenge.challengedId === userId ||
      challenge.challengerPartnerId === userId ||
      challenge.challengedPartnerId === userId;

    if (!isInvolved) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch all player details
    const [challenger] = await db.select().from(users).where(eq(users.id, challenge.challengerId));
    const [challenged] = await db.select().from(users).where(eq(users.id, challenge.challengedId));
    
    let challengerPartner = null;
    let challengedPartner = null;

    if (challenge.challengerPartnerId) {
      [challengerPartner] = await db.select().from(users).where(eq(users.id, challenge.challengerPartnerId));
    }
    if (challenge.challengedPartnerId) {
      [challengedPartner] = await db.select().from(users).where(eq(users.id, challenge.challengedPartnerId));
    }

    res.json({
      id: challenge.id,
      matchType: challenge.matchType,
      status: challenge.status,
      message: challenge.message,
      createdAt: challenge.createdAt,
      expiresAt: challenge.expiresAt,
      sourceContext: challenge.sourceContext,
      challenger: {
        id: challenger.id,
        displayName: challenger.displayName,
        username: challenger.username,
        passportCode: challenger.passportCode,
        rankingPoints: challenger.rankingPoints
      },
      challenged: {
        id: challenged.id,
        displayName: challenged.displayName,
        username: challenged.username,
        passportCode: challenged.passportCode,
        rankingPoints: challenged.rankingPoints
      },
      challengerPartner: challengerPartner ? {
        id: challengerPartner.id,
        displayName: challengerPartner.displayName,
        username: challengerPartner.username,
        passportCode: challengerPartner.passportCode,
        rankingPoints: challengerPartner.rankingPoints
      } : null,
      challengedPartner: challengedPartner ? {
        id: challengedPartner.id,
        displayName: challengedPartner.displayName,
        username: challengedPartner.username,
        passportCode: challengedPartner.passportCode,
        rankingPoints: challengedPartner.rankingPoints
      } : null
    });

  } catch (error) {
    console.error('[Challenge Routes] Error fetching challenge details:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

/**
 * POST /api/challenges/:id/ready
 * Mark player as ready for match
 */
router.post('/:id/ready', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challengeId = parseInt(req.params.id);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    const { ready } = req.body;
    if (typeof ready !== 'boolean') {
      return res.status(400).json({ error: 'Ready status must be boolean' });
    }

    // Fetch challenge
    const [challenge] = await db.select()
      .from(matchChallenges)
      .where(eq(matchChallenges.id, challengeId));

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify user is involved
    const isInvolved = 
      challenge.challengerId === userId ||
      challenge.challengedId === userId ||
      challenge.challengerPartnerId === userId ||
      challenge.challengedPartnerId === userId;

    if (!isInvolved) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update ready status based on user role
    const updateData: any = {};
    if (challenge.challengerId === userId) {
      updateData.challengerReady = ready;
    } else if (challenge.challengedId === userId) {
      updateData.challengedReady = ready;
    } else if (challenge.challengerPartnerId === userId) {
      updateData.challengerPartnerReady = ready;
    } else if (challenge.challengedPartnerId === userId) {
      updateData.challengedPartnerReady = ready;
    }

    await db.update(matchChallenges)
      .set(updateData)
      .where(eq(matchChallenges.id, challengeId));

    // Check if all players are ready
    const [updatedChallenge] = await db.select().from(matchChallenges).where(eq(matchChallenges.id, challengeId));
    const allReady = 
      updatedChallenge.challengerReady &&
      updatedChallenge.challengedReady &&
      (updatedChallenge.challengerPartnerId ? updatedChallenge.challengerPartnerReady : true) &&
      (updatedChallenge.challengedPartnerId ? updatedChallenge.challengedPartnerReady : true);

    res.json({
      success: true,
      allReady
    });

  } catch (error) {
    console.error('[Challenge Routes] Error updating ready status:', error);
    res.status(500).json({ error: 'Failed to update ready status' });
  }
});

/**
 * GET /api/challenges/:id/status
 * Get current ready status for all players
 */
router.get('/:id/status', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const challengeId = parseInt(req.params.id);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    const [challenge] = await db.select()
      .from(matchChallenges)
      .where(eq(matchChallenges.id, challengeId));

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Verify user is involved
    const isInvolved = 
      challenge.challengerId === userId ||
      challenge.challengedId === userId ||
      challenge.challengerPartnerId === userId ||
      challenge.challengedPartnerId === userId;

    if (!isInvolved) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allReady = 
      challenge.challengerReady &&
      challenge.challengedReady &&
      (challenge.challengerPartnerId ? challenge.challengerPartnerReady : true) &&
      (challenge.challengedPartnerId ? challenge.challengedPartnerReady : true);

    res.json({
      challengerReady: challenge.challengerReady || false,
      challengedReady: challenge.challengedReady || false,
      challengerPartnerReady: challenge.challengerPartnerReady || false,
      challengedPartnerReady: challenge.challengedPartnerReady || false,
      allReady
    });

  } catch (error) {
    console.error('[Challenge Routes] Error fetching ready status:', error);
    res.status(500).json({ error: 'Failed to fetch ready status' });
  }
});

export default router;
