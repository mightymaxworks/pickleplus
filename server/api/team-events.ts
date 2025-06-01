/**
 * PKL-278651-TEAM-0001-API - Team Event Management API Routes
 * 
 * REST API endpoints for flexible team event management including:
 * - Team template CRUD operations
 * - Team formation and roster management
 * - Constraint validation and error handling
 * - Real-time team composition validation
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

import { Router, Request, Response } from "express";
import { teamEventService } from "../services/team-event-service";

const router = Router();

// Middleware to check admin permissions
const requireAdmin = (req: Request, res: Response, next: any) => {
  // For now, assume user is authenticated and has admin rights
  // In production, this would check actual admin permissions
  next();
};

/**
 * TEAM TEMPLATE ENDPOINTS
 */

// GET /api/team-templates - Get all team event templates
router.get("/team-templates", requireAdmin, async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const templates = await teamEventService.getTeamTemplates(activeOnly);
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error("Error fetching team templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team templates",
      error: error.message
    });
  }
});

// GET /api/team-templates/:id - Get specific team template with constraints
router.get("/team-templates/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    const template = await teamEventService.getTeamTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Team template not found"
      });
    }
    
    const constraints = await teamEventService.getTemplateConstraints(templateId);
    
    res.json({
      success: true,
      data: {
        ...template,
        constraints
      }
    });
  } catch (error) {
    console.error("Error fetching team template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team template",
      error: error.message
    });
  }
});

// POST /api/team-templates - Create new team template
router.post("/team-templates", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, category, minPlayers, maxPlayers, allowSubstitutes, maxSubstitutes, constraints } = req.body;
    
    // Validation
    if (!name || !minPlayers || !maxPlayers) {
      return res.status(400).json({
        success: false,
        message: "Name, minPlayers, and maxPlayers are required"
      });
    }
    
    if (minPlayers > maxPlayers) {
      return res.status(400).json({
        success: false,
        message: "Minimum players cannot exceed maximum players"
      });
    }
    
    // Create template
    const template = await teamEventService.createTeamTemplate({
      name,
      description,
      category,
      minPlayers,
      maxPlayers,
      allowSubstitutes: allowSubstitutes || false,
      maxSubstitutes,
      isActive: true,
      createdBy: 1 // TODO: Get from authenticated user
    });
    
    // Add constraints if provided
    if (constraints && Array.isArray(constraints)) {
      for (const constraint of constraints) {
        await teamEventService.addConstraintToTemplate(template.id, {
          constraintType: constraint.type,
          parameters: constraint.parameters,
          errorMessage: constraint.errorMessage,
          isActive: true,
          priority: constraint.priority || 100
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: template,
      message: "Team template created successfully"
    });
  } catch (error) {
    console.error("Error creating team template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create team template",
      error: error.message
    });
  }
});

/**
 * TEAM MANAGEMENT ENDPOINTS
 */

// GET /api/tournaments/:tournamentId/teams - Get all teams for a tournament
router.get("/tournaments/:tournamentId/teams", requireAdmin, async (req: Request, res: Response) => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const teams = await teamEventService.getTeamsByTournament(tournamentId);
    
    // Get team formation progress
    const progress = await teamEventService.getTeamFormationProgress(tournamentId);
    
    res.json({
      success: true,
      data: {
        teams,
        progress
      }
    });
  } catch (error) {
    console.error("Error fetching tournament teams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tournament teams",
      error: error.message
    });
  }
});

// POST /api/tournaments/:tournamentId/teams - Create new team
router.post("/tournaments/:tournamentId/teams", requireAdmin, async (req: Request, res: Response) => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const { name, templateId, captainUserId, notes, registrationData } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required"
      });
    }
    
    const team = await teamEventService.createTeam({
      tournamentId,
      templateId,
      name,
      status: 'forming',
      captainUserId,
      notes,
      registrationData
    });
    
    res.status(201).json({
      success: true,
      data: team,
      message: "Team created successfully"
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create team",
      error: error.message
    });
  }
});

// GET /api/teams/:teamId - Get team details with members
router.get("/teams/:teamId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const team = await teamEventService.getTeam(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    const members = await teamEventService.getTeamMembers(teamId);
    const validation = await teamEventService.validateTeamComposition(teamId);
    
    res.json({
      success: true,
      data: {
        ...team,
        members,
        validation
      }
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team details",
      error: error.message
    });
  }
});

// POST /api/teams/:teamId/members - Add member to team
router.post("/teams/:teamId/members", requireAdmin, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const { userId, role, isSubstitute, positionRequirements } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const member = await teamEventService.addTeamMember({
      teamId,
      userId,
      role: role || 'member',
      isSubstitute: isSubstitute || false,
      positionRequirements,
      invitedAt: new Date(),
      invitationAccepted: true // Auto-accept for admin-created assignments
    });
    
    // Validate team composition after adding member
    const validation = await teamEventService.validateTeamComposition(teamId);
    
    res.status(201).json({
      success: true,
      data: {
        member,
        validation
      },
      message: "Team member added successfully"
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    
    // Handle duplicate member error
    if (error.message.includes('duplicate key')) {
      return res.status(409).json({
        success: false,
        message: "Player is already on this team"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to add team member",
      error: error.message
    });
  }
});

// DELETE /api/teams/:teamId/members/:userId - Remove member from team
router.delete("/teams/:teamId/members/:userId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const userId = parseInt(req.params.userId);
    
    const success = await teamEventService.removeTeamMember(teamId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Team member not found"
      });
    }
    
    // Validate team composition after removing member
    const validation = await teamEventService.validateTeamComposition(teamId);
    
    res.json({
      success: true,
      data: { validation },
      message: "Team member removed successfully"
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove team member",
      error: error.message
    });
  }
});

/**
 * VALIDATION ENDPOINTS
 */

// GET /api/teams/:teamId/validate - Validate team composition
router.get("/teams/:teamId/validate", requireAdmin, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const validation = await teamEventService.validateTeamComposition(teamId);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error("Error validating team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate team composition",
      error: error.message
    });
  }
});

// GET /api/tournaments/:tournamentId/validate - Validate all teams in tournament
router.get("/tournaments/:tournamentId/validate", requireAdmin, async (req: Request, res: Response) => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);
    const validationResults = await teamEventService.validateAllTeamsInTournament(tournamentId);
    
    const summary = {
      totalTeams: Object.keys(validationResults).length,
      validTeams: Object.values(validationResults).filter(r => r.isValid).length,
      invalidTeams: Object.values(validationResults).filter(r => !r.isValid).length,
      totalErrors: Object.values(validationResults).reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: Object.values(validationResults).reduce((sum, r) => sum + r.warnings.length, 0)
    };
    
    res.json({
      success: true,
      data: {
        summary,
        results: validationResults
      }
    });
  } catch (error) {
    console.error("Error validating tournament teams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate tournament teams",
      error: error.message
    });
  }
});

/**
 * SAMPLE DATA ENDPOINTS (for testing)
 */

// POST /api/team-templates/samples - Create sample templates
router.post("/team-templates/samples", requireAdmin, async (req: Request, res: Response) => {
  try {
    const samples = [
      {
        name: "Traditional Doubles",
        description: "Standard pickleball doubles format",
        category: "doubles",
        minPlayers: 2,
        maxPlayers: 2,
        allowSubstitutes: true,
        maxSubstitutes: 1,
        constraints: [
          {
            type: "no_repeat_players",
            parameters: { scope: "tournament" },
            errorMessage: "Players cannot be on multiple teams in this tournament",
            priority: 100
          }
        ]
      },
      {
        name: "Corporate Team Challenge",
        description: "Large team format for corporate events",
        category: "corporate",
        minPlayers: 6,
        maxPlayers: 8,
        allowSubstitutes: true,
        maxSubstitutes: 4,
        constraints: [
          {
            type: "no_repeat_players",
            parameters: { scope: "tournament" },
            errorMessage: "Employees cannot be on multiple teams",
            priority: 100
          }
        ]
      }
    ];
    
    const createdTemplates = [];
    for (const sample of samples) {
      const template = await teamEventService.createTeamTemplate({
        name: sample.name,
        description: sample.description,
        category: sample.category,
        minPlayers: sample.minPlayers,
        maxPlayers: sample.maxPlayers,
        allowSubstitutes: sample.allowSubstitutes,
        maxSubstitutes: sample.maxSubstitutes,
        isActive: true,
        createdBy: 1
      });
      
      for (const constraint of sample.constraints) {
        await teamEventService.addConstraintToTemplate(template.id, {
          constraintType: constraint.type as any,
          parameters: constraint.parameters,
          errorMessage: constraint.errorMessage,
          isActive: true,
          priority: constraint.priority
        });
      }
      
      createdTemplates.push(template);
    }
    
    res.status(201).json({
      success: true,
      data: createdTemplates,
      message: "Sample templates created successfully"
    });
  } catch (error) {
    console.error("Error creating sample templates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sample templates",
      error: error.message
    });
  }
});

export default router;