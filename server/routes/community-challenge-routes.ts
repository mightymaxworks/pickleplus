import { Router } from 'express';
import { storage } from '../storage';
import { 
  communityChallenges,
  challengeParticipants,
  challengeEvents,
  challengeEventParticipants,
  insertCommunityChallengeSchema,
  insertChallengeParticipantSchema,
  insertChallengeEventSchema,
  insertChallengeEventParticipantSchema,
  type CommunityChallenge,
  type ChallengeParticipant,
  type ChallengeEvent
} from '@shared/schema';
import { eq, desc, and, gte, lte, count, sql } from 'drizzle-orm';
import { db } from '../db';

const router = Router();

// Get all active challenges
router.get('/challenges', async (req, res) => {
  try {
    const { category, type, status = 'active' } = req.query;
    
    let whereConditions = [];
    
    if (status === 'active') {
      whereConditions.push(
        eq(communityChallenges.isActive, true),
        lte(communityChallenges.startDate, new Date()),
        gte(communityChallenges.endDate, new Date())
      );
    } else if (status === 'upcoming') {
      whereConditions.push(
        eq(communityChallenges.isActive, true),
        gte(communityChallenges.startDate, new Date())
      );
    } else if (status === 'completed') {
      whereConditions.push(
        lte(communityChallenges.endDate, new Date())
      );
    }
    
    if (category) {
      whereConditions.push(eq(communityChallenges.category, category as string));
    }
    
    if (type) {
      whereConditions.push(eq(communityChallenges.type, type as string));
    }

    const challengesWithParticipants = await db
      .select({
        challenge: communityChallenges,
        participantCount: count(challengeParticipants.id),
      })
      .from(communityChallenges)
      .leftJoin(challengeParticipants, eq(communityChallenges.id, challengeParticipants.challengeId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(communityChallenges.id)
      .orderBy(desc(communityChallenges.createdAt));

    // Transform to match frontend interface
    const formattedChallenges = challengesWithParticipants.map(({ challenge, participantCount }) => ({
      id: challenge.id.toString(),
      name: challenge.name,
      description: challenge.description,
      type: challenge.type as 'individual' | 'team' | 'community',
      category: challenge.category as 'technical' | 'tactical' | 'social' | 'consistency' | 'special',
      difficulty: challenge.difficulty as 1 | 2 | 3 | 4 | 5,
      duration: challenge.duration,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isActive: challenge.isActive,
      participantCount: participantCount || 0,
      maxParticipants: challenge.maxParticipants,
      requirements: Array.isArray(challenge.requirements) ? challenge.requirements : [],
      rewards: {
        picklePoints: challenge.picklePointsReward || 0,
        points: challenge.pointsReward || 0,
        badges: Array.isArray(challenge.badges) ? challenge.badges : [],
        specialReward: challenge.specialReward || undefined
      },
      createdBy: {
        id: challenge.createdById?.toString() || 'system',
        name: 'System', // We'll enhance this with actual user data later
        role: 'system' as const
      },
      facilities: Array.isArray(challenge.facilities) ? challenge.facilities : [],
      teamSize: challenge.teamSize,
      tags: Array.isArray(challenge.tags) ? challenge.tags : []
    }));

    res.json({
      success: true,
      challenges: formattedChallenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges'
    });
  }
});

// Get user's challenge participation
router.get('/challenges/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const userChallenges = await db
      .select({
        challenge: communityChallenges,
        participation: challengeParticipants,
        participantCount: count(challengeParticipants.id),
      })
      .from(challengeParticipants)
      .innerJoin(communityChallenges, eq(challengeParticipants.challengeId, communityChallenges.id))
      .leftJoin(
        sql`(SELECT challenge_id, COUNT(*) as total_participants FROM challenge_participants GROUP BY challenge_id)`,
        sql`subquery.challenge_id = ${communityChallenges.id}`
      )
      .where(eq(challengeParticipants.userId, userId))
      .groupBy(communityChallenges.id, challengeParticipants.id)
      .orderBy(desc(challengeParticipants.joinedAt));

    const formattedChallenges = userChallenges.map(({ challenge, participation, participantCount }) => ({
      id: challenge.id.toString(),
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      category: challenge.category,
      difficulty: challenge.difficulty,
      duration: challenge.duration,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isActive: challenge.isActive,
      participantCount: participantCount || 0,
      isJoined: true,
      progress: {
        current: participation.progress || 0,
        target: 100, // This should be calculated based on challenge requirements
        percentage: Math.round(((participation.progress || 0) / 100) * 100)
      },
      rewards: {
        picklePoints: challenge.picklePointsReward || 0,
        points: challenge.pointsReward || 0,
        badges: Array.isArray(challenge.badges) ? challenge.badges : [],
        specialReward: challenge.specialReward || undefined
      },
      tags: Array.isArray(challenge.tags) ? challenge.tags : []
    }));

    res.json({
      success: true,
      challenges: formattedChallenges
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user challenges'
    });
  }
});

// Join a challenge
router.post('/challenges/:challengeId/join', async (req, res) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    const { userId } = req.body;

    if (!challengeId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID and user ID are required'
      });
    }

    // Check if challenge exists and is active
    const challenge = await db
      .select()
      .from(communityChallenges)
      .where(eq(communityChallenges.id, challengeId))
      .limit(1);

    if (!challenge.length) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge[0].isActive) {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not active'
      });
    }

    // Check if user is already participating
    const existingParticipation = await db
      .select()
      .from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ))
      .limit(1);

    if (existingParticipation.length) {
      return res.status(400).json({
        success: false,
        message: 'User is already participating in this challenge'
      });
    }

    // Add user to challenge
    const newParticipation = await db
      .insert(challengeParticipants)
      .values({
        challengeId,
        userId,
        progress: 0,
        score: 0
      })
      .returning();

    res.json({
      success: true,
      participation: newParticipation[0],
      message: 'Successfully joined challenge'
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join challenge'
    });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { type, status = 'upcoming' } = req.query;
    
    let whereConditions = [];
    
    if (status === 'upcoming') {
      whereConditions.push(gte(challengeEvents.startDate, new Date()));
    } else if (status === 'ongoing') {
      whereConditions.push(
        lte(challengeEvents.startDate, new Date()),
        gte(challengeEvents.endDate, new Date())
      );
    } else if (status === 'past') {
      whereConditions.push(lte(challengeEvents.endDate, new Date()));
    }
    
    if (type) {
      whereConditions.push(eq(challengeEvents.type, type as string));
    }

    const eventsWithParticipants = await db
      .select({
        event: challengeEvents,
        participantCount: count(challengeEventParticipants.id),
      })
      .from(challengeEvents)
      .leftJoin(challengeEventParticipants, eq(challengeEvents.id, challengeEventParticipants.eventId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(challengeEvents.id)
      .orderBy(challengeEvents.startDate);

    // Transform to match frontend interface
    const formattedEvents = eventsWithParticipants.map(({ event, participantCount }) => ({
      id: event.id.toString(),
      name: event.name,
      description: event.description,
      type: event.type as 'tournament' | 'social' | 'training' | 'special',
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      isVirtual: event.isVirtual,
      participantCount: participantCount || 0,
      maxParticipants: event.maxParticipants,
      organizer: {
        name: event.organizerName || 'Community Team',
        avatar: event.organizerAvatar,
        role: event.organizerRole || 'Organizer'
      },
      rewards: {
        picklePoints: event.picklePointsReward || 0,
        points: event.pointsReward || 0,
        specialRewards: Array.isArray(event.specialRewards) ? event.specialRewards : []
      },
      requirements: Array.isArray(event.requirements) ? event.requirements : [],
      tags: Array.isArray(event.tags) ? event.tags : []
    }));

    res.json({
      success: true,
      events: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Join an event
router.post('/events/:eventId/join', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and user ID are required'
      });
    }

    // Check if event exists
    const event = await db
      .select()
      .from(challengeEvents)
      .where(eq(challengeEvents.id, eventId))
      .limit(1);

    if (!event.length) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is already registered
    const existingRegistration = await db
      .select()
      .from(challengeEventParticipants)
      .where(and(
        eq(challengeEventParticipants.eventId, eventId),
        eq(challengeEventParticipants.userId, userId)
      ))
      .limit(1);

    if (existingRegistration.length) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered for this event'
      });
    }

    // Add user to event
    const newRegistration = await db
      .insert(challengeEventParticipants)
      .values({
        eventId,
        userId
      })
      .returning();

    res.json({
      success: true,
      registration: newRegistration[0],
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join event'
    });
  }
});

// Admin: Create a new challenge
router.post('/admin/challenges', async (req, res) => {
  try {
    const challengeData = insertCommunityChallengeSchema.parse(req.body);
    
    const newChallenge = await db
      .insert(communityChallenges)
      .values(challengeData)
      .returning();

    res.json({
      success: true,
      challenge: newChallenge[0],
      message: 'Challenge created successfully'
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge'
    });
  }
});

// Admin: Create a new event
router.post('/admin/events', async (req, res) => {
  try {
    const eventData = insertCommunityEventSchema.parse(req.body);
    
    const newEvent = await db
      .insert(communityEvents)
      .values(eventData)
      .returning();

    res.json({
      success: true,
      event: newEvent[0],
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

export default router;