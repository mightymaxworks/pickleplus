/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament API
 * 
 * API endpoints for multi-event tournaments, team tournaments, and advanced tournament management
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { 
  insertParentTournamentSchema,
  insertTournamentRelationshipSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTeamTournamentRegistrationSchema,
  type InsertParentTournament,
  type InsertTournament
} from '../../shared/schema';

// Multi-event tournament creation schema
const createMultiEventTournamentSchema = z.object({
  // Parent tournament details
  name: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  venue: z.string().optional(),
  level: z.enum(['club', 'district', 'city', 'provincial', 'national', 'regional', 'international']),
  
  // Event configuration
  divisions: z.array(z.string()).min(1),
  categories: z.array(z.string()).min(1),
  format: z.enum(['elimination', 'round-robin', 'hybrid', 'swiss']),
  
  // Registration settings
  registrationDeadline: z.string().transform(str => new Date(str)).optional(),
  registrationFee: z.number().min(0).optional(),
  isPublic: z.boolean().default(true),
  maxParticipantsPerEvent: z.number().min(4).optional(),
  
  // Advanced settings
  allowWaitlist: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
});

// Team creation schema
const createTeamSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  captainId: z.number(),
  teamType: z.enum(['standard', 'recreational', 'competitive', 'club', 'elite']).default('standard'),
  location: z.string().optional(),
  members: z.array(z.object({
    userId: z.number(),
    role: z.enum(['captain', 'player', 'alternate', 'coach', 'manager']).default('player'),
    position: z.string().optional(),
    notes: z.string().optional()
  })).optional()
});

// Team tournament registration schema
const teamTournamentRegistrationSchema = z.object({
  teamId: z.number(),
  tournamentId: z.number(),
  notes: z.string().optional()
});

/**
 * Create a multi-event tournament with multiple child tournaments
 */
export async function createMultiEventTournament(req: Request, res: Response) {
  try {
    const validatedData = createMultiEventTournamentSchema.parse(req.body);
    
    // Create parent tournament
    const parentTournamentData: InsertParentTournament = {
      name: validatedData.name,
      description: validatedData.description,
      location: validatedData.venue,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      registrationStartDate: new Date(), // Start registration immediately
      registrationEndDate: validatedData.registrationDeadline,
      organizer: 'Tournament Admin', // TODO: Get from authenticated user
      status: 'upcoming',
      isTestData: false
    };

    const parentTournament = await storage.createParentTournament(parentTournamentData);
    
    // Create child tournaments for each division/category combination
    const childTournaments = [];
    
    for (const division of validatedData.divisions) {
      for (const category of validatedData.categories) {
        const childTournamentData: InsertTournament = {
          name: `${validatedData.name} - ${category} ${division}`,
          description: `${category} ${division} division of ${validatedData.name}`,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          location: validatedData.venue || '',
          format: validatedData.format,
          category: category,
          division: division,
          level: validatedData.level,
          maxParticipants: validatedData.maxParticipantsPerEvent,
          registrationFee: validatedData.registrationFee,
          isPublic: validatedData.isPublic,
          allowWaitlist: validatedData.allowWaitlist,
          requireApproval: validatedData.requireApproval,
          emailNotifications: validatedData.emailNotifications,
          status: 'upcoming',
          isTestData: false,
          parentTournamentId: parentTournament.id
        };

        const childTournament = await storage.createTournament(childTournamentData);
        childTournaments.push(childTournament);

        // Create relationship record
        await storage.createTournamentRelationship({
          parentTournamentId: parentTournament.id,
          childTournamentId: childTournament.id
        });
      }
    }

    // Create audit log
    await storage.createTournamentAuditLog({
      parentTournamentId: parentTournament.id,
      userId: 1, // TODO: Get from authenticated user
      action: 'MULTI_EVENT_TOURNAMENT_CREATED',
      details: {
        childTournamentCount: childTournaments.length,
        divisions: validatedData.divisions,
        categories: validatedData.categories
      }
    });

    res.status(201).json({
      success: true,
      parentTournament,
      subTournaments: childTournaments,
      message: `Multi-event tournament created with ${childTournaments.length} events`
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Multi-event creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create multi-event tournament',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get all parent tournaments with their child tournaments
 */
export async function getMultiEventTournaments(req: Request, res: Response) {
  try {
    const parentTournaments = await storage.getParentTournamentsWithChildren();
    
    res.json({
      success: true,
      data: parentTournaments
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Get multi-event tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-event tournaments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create a team
 */
export async function createTeam(req: Request, res: Response) {
  try {
    const validatedData = createTeamSchema.parse(req.body);
    
    // Create the team
    const teamData = {
      name: validatedData.name,
      description: validatedData.description,
      logoUrl: validatedData.logoUrl,
      captainId: validatedData.captainId,
      teamType: validatedData.teamType,
      location: validatedData.location,
      isActive: true,
      isTestData: false
    };

    const team = await storage.createTeam(teamData);

    // Add team members if provided
    if (validatedData.members && validatedData.members.length > 0) {
      for (const member of validatedData.members) {
        await storage.createTeamMember({
          teamId: team.id,
          userId: member.userId,
          role: member.role,
          position: member.position,
          notes: member.notes,
          isActive: true
        });
      }
    }

    // Create audit log
    await storage.createTournamentAuditLog({
      userId: validatedData.captainId,
      action: 'TEAM_CREATED',
      details: {
        teamId: team.id,
        teamName: team.name,
        memberCount: validatedData.members?.length || 1
      }
    });

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully'
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Team creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Register a team for a tournament
 */
export async function registerTeamForTournament(req: Request, res: Response) {
  try {
    const validatedData = teamTournamentRegistrationSchema.parse(req.body);
    
    // Check if team is already registered
    const existingRegistration = await storage.getTeamTournamentRegistration(
      validatedData.teamId, 
      validatedData.tournamentId
    );

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'Team is already registered for this tournament'
      });
    }

    // Create registration
    const registration = await storage.createTeamTournamentRegistration({
      teamId: validatedData.teamId,
      tournamentId: validatedData.tournamentId,
      status: 'pending',
      notes: validatedData.notes,
      registrationDate: new Date()
    });

    // Create audit log
    await storage.createTournamentAuditLog({
      tournamentId: validatedData.tournamentId,
      userId: 1, // TODO: Get from authenticated user
      action: 'TEAM_REGISTERED',
      details: {
        teamId: validatedData.teamId,
        registrationId: registration.id
      }
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Team registered for tournament successfully'
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Team registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register team for tournament',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get teams with their members
 */
export async function getTeams(req: Request, res: Response) {
  try {
    const teams = await storage.getTeamsWithMembers();
    
    res.json({
      success: true,
      data: teams
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get tournament templates
 */
export async function getTournamentTemplates(req: Request, res: Response) {
  try {
    const templates = await storage.getTournamentTemplates();
    
    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('[Enhanced Tournaments] Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}