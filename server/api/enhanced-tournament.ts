/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament API Routes
 * 
 * API routes for the multi-event tournament system with parent-child relationships
 * and team tournament functionality.
 */

import express from 'express';
import { enhancedTournamentService } from '../services/enhanced-tournament-service';
import { enhancedTournamentStorage } from '../storage/enhanced-tournament-storage';
import { isAuthenticated, isAdmin, isTournamentDirector } from '../middleware/auth-middleware';
import {
  insertParentTournamentSchema,
  insertTeamSchema,
  insertTournamentTemplateSchema
} from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

/**
 * Get all parent tournaments
 * GET /api/enhanced-tournaments/parents
 */
router.get('/parents', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeTestData = req.query.includeTestData === 'true';
    
    const parents = await enhancedTournamentStorage.getAllParentTournaments({
      limit,
      offset,
      includeTestData
    });
    
    res.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching parent tournaments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parent tournaments'
    });
  }
});

/**
 * Get a specific parent tournament with all its child tournaments
 * GET /api/enhanced-tournaments/parents/:id
 */
router.get('/parents/:id', async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    
    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parent tournament ID'
      });
    }
    
    const tournament = await enhancedTournamentService.getMultiEventTournament(parentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Parent tournament not found'
      });
    }
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Error fetching parent tournament:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch parent tournament'
    });
  }
});

/**
 * Create a new parent tournament with child tournaments
 * POST /api/enhanced-tournaments/parents
 */
router.post('/parents', isAuthenticated, async (req, res) => {
  try {
    const { parentData, childTournaments } = req.body;
    
    // Validate parent tournament data
    const parsedParentData = insertParentTournamentSchema.parse(parentData);

    // Create the multi-event tournament
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const parent = await enhancedTournamentService.createMultiEventTournament(
      parsedParentData,
      childTournaments,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error creating parent tournament:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create parent tournament'
    });
  }
});

/**
 * Update a parent tournament
 * PATCH /api/enhanced-tournaments/parents/:id
 */
router.patch('/parents/:id', isAuthenticated, async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    
    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parent tournament ID'
      });
    }
    
    const { parentData, updateChildDates } = req.body;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Update the parent tournament
    const parent = await enhancedTournamentService.updateMultiEventTournament(
      parentId,
      parentData,
      updateChildDates || false,
      req.user.id
    );
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent tournament not found'
      });
    }
    
    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Error updating parent tournament:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update parent tournament'
    });
  }
});

/**
 * Add a child tournament to a parent tournament
 * POST /api/enhanced-tournaments/parents/:id/children
 */
router.post('/parents/:id/children', isAuthenticated, async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    
    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parent tournament ID'
      });
    }
    
    const childData = req.body;
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Add the child tournament
    const child = await enhancedTournamentService.addChildTournament(
      parentId,
      childData,
      req.user.id
    );
    
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Parent tournament not found'
      });
    }
    
    res.status(201).json({
      success: true,
      data: child
    });
  } catch (error) {
    console.error('Error adding child tournament:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to add child tournament'
    });
  }
});

/**
 * Get all teams
 * GET /api/enhanced-tournaments/teams
 */
router.get('/teams', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeTestData = req.query.includeTestData === 'true';
    
    const teams = await enhancedTournamentStorage.getAllTeams({
      limit,
      offset,
      includeTestData
    });
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams'
    });
  }
});

/**
 * Get a specific team
 * GET /api/enhanced-tournaments/teams/:id
 */
router.get('/teams/:id', async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    if (isNaN(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID'
      });
    }
    
    const team = await enhancedTournamentStorage.getTeamById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Get team members
    const members = await enhancedTournamentStorage.getTeamMembersByTeamId(teamId);
    
    res.json({
      success: true,
      data: {
        team,
        members
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team'
    });
  }
});

/**
 * Create a new team with members
 * POST /api/enhanced-tournaments/teams
 */
router.post('/teams', isAuthenticated, async (req, res) => {
  try {
    const { teamData, memberIds } = req.body;
    
    // Validate team data
    const parsedTeamData = insertTeamSchema.parse(teamData);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Create the team with members
    const team = await enhancedTournamentService.createTeamWithMembers(
      parsedTeamData,
      memberIds || [],
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create team'
    });
  }
});

/**
 * Update a team
 * PATCH /api/enhanced-tournaments/teams/:id
 */
router.patch('/teams/:id', isAuthenticated, async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    if (isNaN(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID'
      });
    }
    
    // Get team to check if user is captain
    const team = await enhancedTournamentStorage.getTeamById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Check if user is captain or admin
    if (team.captainId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team captains or admins can update teams'
      });
    }
    
    // Update the team
    const updatedTeam = await enhancedTournamentStorage.updateTeam(teamId, req.body);
    
    res.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update team'
    });
  }
});

/**
 * Get team members
 * GET /api/enhanced-tournaments/teams/:id/members
 */
router.get('/teams/:id/members', async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    if (isNaN(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID'
      });
    }
    
    const members = await enhancedTournamentStorage.getTeamMembersByTeamId(teamId);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

/**
 * Add a team member
 * POST /api/enhanced-tournaments/teams/:id/members
 */
router.post('/teams/:id/members', isAuthenticated, async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    if (isNaN(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID'
      });
    }
    
    // Get team to check if user is captain
    const team = await enhancedTournamentStorage.getTeamById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Check if user is captain or admin
    if (team.captainId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team captains or admins can add team members'
      });
    }
    
    const { userId, role = 'player' } = req.body;
    
    // Add the team member
    const member = await enhancedTournamentStorage.addTeamMember({
      teamId,
      userId,
      role,
      isActive: true,
      joinDate: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to add team member'
    });
  }
});

/**
 * Remove a team member
 * DELETE /api/enhanced-tournaments/teams/members/:id
 */
router.delete('/teams/members/:id', isAuthenticated, async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team member ID'
      });
    }
    
    // Get the member to check team
    const member = await enhancedTournamentStorage.getTeamMemberById(memberId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }
    
    // Get team to check if user is captain
    const team = await enhancedTournamentStorage.getTeamById(member.teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Check if user is captain or admin
    if (team.captainId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only team captains or admins can remove team members'
      });
    }
    
    // Remove the team member
    await enhancedTournamentStorage.removeTeamMember(memberId);
    
    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

/**
 * Register a team for a tournament
 * POST /api/enhanced-tournaments/tournaments/:id/teams
 */
router.post('/tournaments/:id/teams', isAuthenticated, async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    
    if (isNaN(tournamentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tournament ID'
      });
    }
    
    const { teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Register the team
    const registration = await enhancedTournamentService.registerTeamForTournament(
      teamId,
      tournamentId,
      req.user.id
    );
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Tournament or team not found'
      });
    }
    
    res.status(201).json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error registering team for tournament:', error);
    
    if (error instanceof Error) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to register team'
    });
  }
});

/**
 * Get teams registered for a tournament
 * GET /api/enhanced-tournaments/tournaments/:id/teams
 */
router.get('/tournaments/:id/teams', async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    
    if (isNaN(tournamentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tournament ID'
      });
    }
    
    const teams = await enhancedTournamentService.getTeamsForTournament(tournamentId);
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams for tournament:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams'
    });
  }
});

/**
 * Update team registration status
 * PATCH /api/enhanced-tournaments/team-registrations/:id
 */
router.patch('/team-registrations/:id', isAuthenticated, async (req, res) => {
  try {
    const registrationId = parseInt(req.params.id);
    
    if (isNaN(registrationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid registration ID'
      });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Get the registration to check tournament
    const registration = await enhancedTournamentStorage.getTeamTournamentRegistrationById(registrationId);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }
    
    // Check if user is tournament director or admin
    const tournamentDirectors = await enhancedTournamentStorage.getTournamentDirectorsByTournamentId(registration.tournamentId);
    const isTournamentDirector = tournamentDirectors.some(director => director.userId === req.user?.id);
    
    if (!isTournamentDirector && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only tournament directors or admins can update registration status'
      });
    }
    
    // Update the registration
    const updatedRegistration = await enhancedTournamentService.updateTeamRegistrationStatus(
      registrationId,
      status,
      req.user.id
    );
    
    res.json({
      success: true,
      data: updatedRegistration
    });
  } catch (error) {
    console.error('Error updating team registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update registration'
    });
  }
});

/**
 * Get all tournament templates
 * GET /api/enhanced-tournaments/templates
 */
router.get('/templates', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const isPublic = req.query.isPublic === 'true';
    
    const templates = await enhancedTournamentStorage.getAllTournamentTemplates({
      limit,
      offset,
      isPublic
    });
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching tournament templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tournament templates'
    });
  }
});

/**
 * Get templates created by a user
 * GET /api/enhanced-tournaments/templates/user
 */
router.get('/templates/user', isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const templates = await enhancedTournamentStorage.getTournamentTemplatesByUserId(req.user.id);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user templates'
    });
  }
});

/**
 * Create a tournament template
 * POST /api/enhanced-tournaments/templates
 */
router.post('/templates', isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const templateData = {
      ...req.body,
      createdById: req.user.id
    };
    
    // Validate template data
    const parsedTemplateData = insertTournamentTemplateSchema.parse(templateData);
    
    // Create the template
    const template = await enhancedTournamentStorage.createTournamentTemplate(parsedTemplateData);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating tournament template:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create tournament template'
    });
  }
});

/**
 * Create a tournament from a template
 * POST /api/enhanced-tournaments/templates/:id/create-tournament
 */
router.post('/templates/:id/create-tournament', isAuthenticated, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const customData = req.body;
    
    // Create the tournament from template
    const tournament = await enhancedTournamentService.createTournamentFromTemplate(
      templateId,
      customData,
      req.user.id
    );
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Error creating tournament from template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tournament from template'
    });
  }
});

/**
 * Add a tournament director
 * POST /api/enhanced-tournaments/tournaments/:id/directors
 */
router.post('/tournaments/:id/directors', isAuthenticated, async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    
    if (isNaN(tournamentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tournament ID'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    const { userId, role = 'director' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Check if current user is already a director or admin
    const tournamentDirectors = await enhancedTournamentStorage.getTournamentDirectorsByTournamentId(tournamentId);
    const isCurrentUserDirector = tournamentDirectors.some(director => director.userId === req.user?.id);
    
    if (!isCurrentUserDirector && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only existing tournament directors or admins can add new directors'
      });
    }
    
    // Add the tournament director
    const director = await enhancedTournamentStorage.assignTournamentDirector({
      tournamentId,
      userId,
      role,
      assignedAt: new Date(),
      assignedById: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: director
    });
  } catch (error) {
    console.error('Error adding tournament director:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add tournament director'
    });
  }
});

/**
 * Get tournament directors
 * GET /api/enhanced-tournaments/tournaments/:id/directors
 */
router.get('/tournaments/:id/directors', async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id);
    
    if (isNaN(tournamentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tournament ID'
      });
    }
    
    const directors = await enhancedTournamentStorage.getTournamentDirectorsByTournamentId(tournamentId);
    
    res.json({
      success: true,
      data: directors
    });
  } catch (error) {
    console.error('Error fetching tournament directors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tournament directors'
    });
  }
});

/**
 * Remove a tournament director
 * DELETE /api/enhanced-tournaments/directors/:id
 */
router.delete('/directors/:id', isAuthenticated, async (req, res) => {
  try {
    const directorId = parseInt(req.params.id);
    
    if (isNaN(directorId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid director ID'
      });
    }
    
    // Get the director to check tournament
    const director = await enhancedTournamentStorage.getTournamentDirectorById(directorId);
    
    if (!director) {
      return res.status(404).json({
        success: false,
        error: 'Tournament director not found'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Check if current user is already a director or admin
    const tournamentDirectors = await enhancedTournamentStorage.getTournamentDirectorsByTournamentId(director.tournamentId);
    const isCurrentUserDirector = tournamentDirectors.some(d => d.userId === req.user?.id);
    
    if (!isCurrentUserDirector && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only existing tournament directors or admins can remove directors'
      });
    }
    
    // Remove the tournament director
    await enhancedTournamentStorage.removeTournamentDirector(directorId);
    
    res.json({
      success: true,
      message: 'Tournament director removed successfully'
    });
  } catch (error) {
    console.error('Error removing tournament director:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove tournament director'
    });
  }
});

export default router;