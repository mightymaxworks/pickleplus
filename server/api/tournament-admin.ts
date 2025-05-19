/**
 * PKL-278651-TOURN-0015-MULTI - Tournament Admin API Routes
 * 
 * This file implements the API routes for tournament management,
 * with special support for multi-event tournaments.
 */

import express from 'express';
import { tournamentAdminService } from '../services/tournament-admin-service';
import { z } from 'zod';
import { insertParentTournamentSchema, insertTeamSchema } from '@shared/schema';

const router = express.Router();

/**
 * Authentication middleware
 */
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Admin authorization middleware
 */
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Validation schemas
const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const relationshipParamsSchema = z.object({
  parentId: z.coerce.number().int().positive(),
  childId: z.coerce.number().int().positive()
});

const statusChangeSchema = z.object({
  newStatus: z.string(),
  reason: z.string().optional()
});

const templateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  configuration: z.record(z.any()),
  category: z.string().optional(),
  division: z.string().optional(),
  format: z.string().optional()
});

const courtSchema = z.object({
  courtNumber: z.string().min(1),
  courtName: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional()
});

const directorSchema = z.object({
  userId: z.number().int().positive(),
  role: z.string().default('director')
});

/**
 * GET /api/tournament-admin/parent-tournaments
 * Get all parent tournaments
 */
router.get('/parent-tournaments', isAuthenticated, async (req, res) => {
  try {
    const parentTournaments = await tournamentAdminService.getAllParentTournaments();
    res.json(parentTournaments);
  } catch (error) {
    console.error('Error fetching parent tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch parent tournaments' });
  }
});

/**
 * GET /api/tournament-admin/parent-tournaments/:id
 * Get a parent tournament by ID
 */
router.get('/parent-tournaments/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const parentTournament = await tournamentAdminService.getParentTournamentById(id);
    
    if (!parentTournament) {
      return res.status(404).json({ error: 'Parent tournament not found' });
    }
    
    res.json(parentTournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching parent tournament:', error);
    res.status(500).json({ error: 'Failed to fetch parent tournament' });
  }
});

/**
 * POST /api/tournament-admin/parent-tournaments
 * Create a new parent tournament
 */
router.post('/parent-tournaments', isAdmin, async (req, res) => {
  try {
    const tournamentData = insertParentTournamentSchema.parse(req.body);
    const newParentTournament = await tournamentAdminService.createParentTournament(tournamentData);
    
    // Log audit
    await tournamentAdminService.logTournamentAudit({
      parentTournamentId: newParentTournament.id,
      userId: req.user.id,
      action: 'create_parent_tournament',
      details: { tournament: newParentTournament }
    });
    
    res.status(201).json(newParentTournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tournament data', details: error.errors });
    }
    
    console.error('Error creating parent tournament:', error);
    res.status(500).json({ error: 'Failed to create parent tournament' });
  }
});

/**
 * PUT /api/tournament-admin/parent-tournaments/:id
 * Update a parent tournament
 */
router.put('/parent-tournaments/:id', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const tournamentData = insertParentTournamentSchema.partial().parse(req.body);
    
    const updatedTournament = await tournamentAdminService.updateParentTournament(id, tournamentData);
    
    if (!updatedTournament) {
      return res.status(404).json({ error: 'Parent tournament not found' });
    }
    
    // Log audit
    await tournamentAdminService.logTournamentAudit({
      parentTournamentId: id,
      userId: req.user.id,
      action: 'update_parent_tournament',
      details: { updates: tournamentData }
    });
    
    res.json(updatedTournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error updating parent tournament:', error);
    res.status(500).json({ error: 'Failed to update parent tournament' });
  }
});

/**
 * DELETE /api/tournament-admin/parent-tournaments/:id
 * Delete a parent tournament
 */
router.delete('/parent-tournaments/:id', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    
    const deletedTournament = await tournamentAdminService.deleteParentTournament(id);
    
    if (!deletedTournament) {
      return res.status(404).json({ error: 'Parent tournament not found' });
    }
    
    // Log audit
    await tournamentAdminService.logTournamentAudit({
      userId: req.user.id,
      action: 'delete_parent_tournament',
      details: { tournament: deletedTournament }
    });
    
    res.json({ success: true, message: 'Parent tournament deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error deleting parent tournament:', error);
    res.status(500).json({ error: 'Failed to delete parent tournament' });
  }
});

/**
 * GET /api/tournament-admin/parent-tournaments/:id/children
 * Get all child tournaments for a parent tournament
 */
router.get('/parent-tournaments/:id/children', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const childTournaments = await tournamentAdminService.getChildTournaments(id);
    res.json(childTournaments);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching child tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch child tournaments' });
  }
});

/**
 * POST /api/tournament-admin/parent-tournaments/:parentId/children/:childId
 * Add a child tournament to a parent tournament
 */
router.post('/parent-tournaments/:parentId/children/:childId', isAdmin, async (req, res) => {
  try {
    const { parentId, childId } = relationshipParamsSchema.parse({
      parentId: req.params.parentId,
      childId: req.params.childId
    });
    
    const relationship = await tournamentAdminService.addChildTournament(parentId, childId);
    
    // Log audit
    await tournamentAdminService.logTournamentAudit({
      parentTournamentId: parentId,
      tournamentId: childId,
      userId: req.user.id,
      action: 'add_child_tournament',
      details: { relationship }
    });
    
    res.status(201).json(relationship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    console.error('Error adding child tournament:', error);
    res.status(500).json({ error: 'Failed to add child tournament' });
  }
});

/**
 * DELETE /api/tournament-admin/parent-tournaments/:parentId/children/:childId
 * Remove a child tournament from a parent tournament
 */
router.delete('/parent-tournaments/:parentId/children/:childId', isAdmin, async (req, res) => {
  try {
    const { parentId, childId } = relationshipParamsSchema.parse({
      parentId: req.params.parentId,
      childId: req.params.childId
    });
    
    const relationship = await tournamentAdminService.removeChildTournament(parentId, childId);
    
    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    
    // Log audit
    await tournamentAdminService.logTournamentAudit({
      parentTournamentId: parentId,
      tournamentId: childId,
      userId: req.user.id,
      action: 'remove_child_tournament'
    });
    
    res.json({ success: true, message: 'Child tournament removed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    console.error('Error removing child tournament:', error);
    res.status(500).json({ error: 'Failed to remove child tournament' });
  }
});

/**
 * POST /api/tournament-admin/teams
 * Create a new team
 */
router.post('/teams', isAuthenticated, async (req, res) => {
  try {
    const teamData = insertTeamSchema.parse({
      ...req.body,
      captainId: req.user.id // The creator is the captain by default
    });
    
    const newTeam = await tournamentAdminService.createTeam(teamData);
    
    res.status(201).json(newTeam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid team data', details: error.errors });
    }
    
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

/**
 * GET /api/tournament-admin/teams/:id
 * Get a team by ID
 */
router.get('/teams/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const team = await tournamentAdminService.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

/**
 * PUT /api/tournament-admin/teams/:id
 * Update a team
 */
router.put('/teams/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    
    // Get the team to check if the user is the captain
    const team = await tournamentAdminService.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Only captains or admins can update teams
    if (team.captainId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the team captain or admins can update the team' });
    }
    
    const teamData = insertTeamSchema.partial().parse(req.body);
    
    const updatedTeam = await tournamentAdminService.updateTeam(id, teamData);
    
    res.json(updatedTeam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

/**
 * DELETE /api/tournament-admin/teams/:id
 * Delete a team
 */
router.delete('/teams/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    
    // Get the team to check if the user is the captain
    const team = await tournamentAdminService.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Only captains or admins can delete teams
    if (team.captainId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only the team captain or admins can delete the team' });
    }
    
    const deletedTeam = await tournamentAdminService.deleteTeam(id);
    
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

/**
 * POST /api/tournament-admin/tournaments/:id/status
 * Change tournament status
 */
router.post('/tournaments/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const { newStatus, reason } = statusChangeSchema.parse(req.body);
    
    const updatedTournament = await tournamentAdminService.changeTournamentStatus(
      id, 
      newStatus, 
      req.user.id,
      reason
    );
    
    res.json(updatedTournament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error changing tournament status:', error);
    res.status(500).json({ error: 'Failed to change tournament status' });
  }
});

/**
 * POST /api/tournament-admin/templates
 * Create a tournament template
 */
router.post('/templates', isAdmin, async (req, res) => {
  try {
    const templateData = templateSchema.parse({
      ...req.body,
      createdById: req.user.id
    });
    
    const newTemplate = await tournamentAdminService.createTournamentTemplate(templateData);
    
    res.status(201).json(newTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid template data', details: error.errors });
    }
    
    console.error('Error creating tournament template:', error);
    res.status(500).json({ error: 'Failed to create tournament template' });
  }
});

/**
 * GET /api/tournament-admin/templates
 * Get all tournament templates
 */
router.get('/templates', isAuthenticated, async (req, res) => {
  try {
    const templates = await tournamentAdminService.getAllTournamentTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching tournament templates:', error);
    res.status(500).json({ error: 'Failed to fetch tournament templates' });
  }
});

/**
 * GET /api/tournament-admin/tournaments/:id/teams
 * Get all teams registered for a tournament
 */
router.get('/tournaments/:id/teams', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const teams = await tournamentAdminService.getTeamsForTournament(id);
    res.json(teams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching teams for tournament:', error);
    res.status(500).json({ error: 'Failed to fetch teams for tournament' });
  }
});

/**
 * POST /api/tournament-admin/tournaments/:id/directors
 * Add a tournament director
 */
router.post('/tournaments/:id/directors', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const { userId, role } = directorSchema.parse(req.body);
    
    const director = await tournamentAdminService.addTournamentDirector({
      tournamentId: id,
      userId,
      role,
      assignedBy: req.user.id
    });
    
    res.status(201).json(director);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error adding tournament director:', error);
    res.status(500).json({ error: 'Failed to add tournament director' });
  }
});

/**
 * GET /api/tournament-admin/tournaments/:id/directors
 * Get all directors for a tournament
 */
router.get('/tournaments/:id/directors', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const directors = await tournamentAdminService.getTournamentDirectors(id);
    res.json(directors);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching tournament directors:', error);
    res.status(500).json({ error: 'Failed to fetch tournament directors' });
  }
});

/**
 * DELETE /api/tournament-admin/tournaments/:id/directors/:userId
 * Remove a tournament director
 */
router.delete('/tournaments/:id/directors/:userId', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const { userId } = idParamSchema.parse({ id: req.params.userId });
    
    const director = await tournamentAdminService.removeTournamentDirector(id, userId);
    
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }
    
    res.json({ success: true, message: 'Director removed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    console.error('Error removing tournament director:', error);
    res.status(500).json({ error: 'Failed to remove tournament director' });
  }
});

/**
 * POST /api/tournament-admin/tournaments/:id/courts
 * Add a court to a tournament
 */
router.post('/tournaments/:id/courts', isAdmin, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const courtData = courtSchema.parse(req.body);
    
    const court = await tournamentAdminService.addTournamentCourt({
      tournamentId: id,
      ...courtData
    });
    
    res.status(201).json(court);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error adding tournament court:', error);
    res.status(500).json({ error: 'Failed to add tournament court' });
  }
});

/**
 * GET /api/tournament-admin/tournaments/:id/courts
 * Get all courts for a tournament
 */
router.get('/tournaments/:id/courts', isAuthenticated, async (req, res) => {
  try {
    const { id } = idParamSchema.parse({ id: req.params.id });
    const courts = await tournamentAdminService.getTournamentCourts(id);
    res.json(courts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    console.error('Error fetching tournament courts:', error);
    res.status(500).json({ error: 'Failed to fetch tournament courts' });
  }
});

export default router;