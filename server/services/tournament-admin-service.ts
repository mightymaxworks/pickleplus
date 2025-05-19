/**
 * PKL-278651-TOURN-0015-MULTI - Tournament Admin Service
 * 
 * This service provides CRUD operations for tournament management,
 * with special support for multi-event tournaments.
 */

import { db } from '../db';
import { eq, and, or, isNull } from 'drizzle-orm';
import { 
  tournaments, 
  parentTournaments, 
  tournamentRelationships,
  teams,
  teamMembers,
  teamTournamentRegistrations,
  tournamentStatusHistory,
  tournamentDirectors,
  tournamentCourts,
  tournamentTemplates,
  tournamentAuditLogs
} from '@shared/schema';
import { insertParentTournamentSchema, insertTournamentRelationshipSchema, InsertTeam } from '@shared/schema';

/**
 * Tournament Admin Service
 * 
 * Provides comprehensive CRUD operations for tournaments with special handling
 * for multi-event tournaments with parent-child relationships.
 */
export class TournamentAdminService {
  
  /**
   * Get all parent tournaments
   */
  async getAllParentTournaments() {
    try {
      return await db.select().from(parentTournaments).orderBy(parentTournaments.startDate);
    } catch (error) {
      console.error('Error fetching parent tournaments:', error);
      throw new Error('Failed to fetch parent tournaments');
    }
  }

  /**
   * Get parent tournament by ID
   */
  async getParentTournamentById(id: number) {
    try {
      const [parentTournament] = await db
        .select()
        .from(parentTournaments)
        .where(eq(parentTournaments.id, id));
      
      return parentTournament;
    } catch (error) {
      console.error(`Error fetching parent tournament with ID ${id}:`, error);
      throw new Error(`Failed to fetch parent tournament with ID ${id}`);
    }
  }

  /**
   * Create a new parent tournament
   */
  async createParentTournament(tournamentData: typeof insertParentTournamentSchema._type) {
    try {
      const [newParentTournament] = await db
        .insert(parentTournaments)
        .values(tournamentData)
        .returning();
      
      return newParentTournament;
    } catch (error) {
      console.error('Error creating parent tournament:', error);
      throw new Error('Failed to create parent tournament');
    }
  }

  /**
   * Update a parent tournament
   */
  async updateParentTournament(id: number, tournamentData: Partial<typeof insertParentTournamentSchema._type>) {
    try {
      const [updatedParentTournament] = await db
        .update(parentTournaments)
        .set({
          ...tournamentData,
          updatedAt: new Date()
        })
        .where(eq(parentTournaments.id, id))
        .returning();
      
      return updatedParentTournament;
    } catch (error) {
      console.error(`Error updating parent tournament with ID ${id}:`, error);
      throw new Error(`Failed to update parent tournament with ID ${id}`);
    }
  }

  /**
   * Delete a parent tournament
   * Note: This will not delete child tournaments, but will break the relationship
   */
  async deleteParentTournament(id: number) {
    try {
      // First, remove all relationships
      await db
        .delete(tournamentRelationships)
        .where(eq(tournamentRelationships.parentTournamentId, id));

      // Then delete the parent tournament
      const [deletedParentTournament] = await db
        .delete(parentTournaments)
        .where(eq(parentTournaments.id, id))
        .returning();
      
      return deletedParentTournament;
    } catch (error) {
      console.error(`Error deleting parent tournament with ID ${id}:`, error);
      throw new Error(`Failed to delete parent tournament with ID ${id}`);
    }
  }

  /**
   * Get all tournaments related to a parent tournament
   */
  async getChildTournaments(parentId: number) {
    try {
      const relationships = await db
        .select({
          relationship: tournamentRelationships,
          tournament: tournaments
        })
        .from(tournamentRelationships)
        .innerJoin(tournaments, eq(tournamentRelationships.childTournamentId, tournaments.id))
        .where(eq(tournamentRelationships.parentTournamentId, parentId));
      
      return relationships.map(r => r.tournament);
    } catch (error) {
      console.error(`Error fetching child tournaments for parent ID ${parentId}:`, error);
      throw new Error(`Failed to fetch child tournaments for parent ID ${parentId}`);
    }
  }

  /**
   * Add a tournament as a child of a parent tournament
   */
  async addChildTournament(parentId: number, childId: number) {
    try {
      // Check if relationship already exists
      const [existingRelationship] = await db
        .select()
        .from(tournamentRelationships)
        .where(and(
          eq(tournamentRelationships.parentTournamentId, parentId),
          eq(tournamentRelationships.childTournamentId, childId)
        ));
      
      if (existingRelationship) {
        return existingRelationship;
      }

      // Update the child tournament to mark it as a sub-event
      await db
        .update(tournaments)
        .set({
          isSubEvent: true,
          parentTournamentId: parentId,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, childId));

      // Create the relationship
      const [newRelationship] = await db
        .insert(tournamentRelationships)
        .values({
          parentTournamentId: parentId,
          childTournamentId: childId
        })
        .returning();
      
      return newRelationship;
    } catch (error) {
      console.error(`Error adding child tournament ${childId} to parent ${parentId}:`, error);
      throw new Error(`Failed to add child tournament ${childId} to parent ${parentId}`);
    }
  }

  /**
   * Remove a tournament as a child of a parent tournament
   */
  async removeChildTournament(parentId: number, childId: number) {
    try {
      // Update the child tournament to unmark it as a sub-event
      await db
        .update(tournaments)
        .set({
          isSubEvent: false,
          parentTournamentId: null,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, childId));

      // Delete the relationship
      const [deletedRelationship] = await db
        .delete(tournamentRelationships)
        .where(and(
          eq(tournamentRelationships.parentTournamentId, parentId),
          eq(tournamentRelationships.childTournamentId, childId)
        ))
        .returning();
      
      return deletedRelationship;
    } catch (error) {
      console.error(`Error removing child tournament ${childId} from parent ${parentId}:`, error);
      throw new Error(`Failed to remove child tournament ${childId} from parent ${parentId}`);
    }
  }

  /**
   * Create a new team
   */
  async createTeam(teamData: InsertTeam) {
    try {
      const [newTeam] = await db
        .insert(teams)
        .values(teamData)
        .returning();
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(id: number) {
    try {
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, id));
      
      return team;
    } catch (error) {
      console.error(`Error fetching team with ID ${id}:`, error);
      throw new Error(`Failed to fetch team with ID ${id}`);
    }
  }

  /**
   * Update a team
   */
  async updateTeam(id: number, teamData: Partial<InsertTeam>) {
    try {
      const [updatedTeam] = await db
        .update(teams)
        .set({
          ...teamData,
          updatedAt: new Date()
        })
        .where(eq(teams.id, id))
        .returning();
      
      return updatedTeam;
    } catch (error) {
      console.error(`Error updating team with ID ${id}:`, error);
      throw new Error(`Failed to update team with ID ${id}`);
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(id: number) {
    try {
      // First, delete all team members
      await db
        .delete(teamMembers)
        .where(eq(teamMembers.teamId, id));

      // Then, delete all team registrations
      await db
        .delete(teamTournamentRegistrations)
        .where(eq(teamTournamentRegistrations.teamId, id));

      // Finally, delete the team
      const [deletedTeam] = await db
        .delete(teams)
        .where(eq(teams.id, id))
        .returning();
      
      return deletedTeam;
    } catch (error) {
      console.error(`Error deleting team with ID ${id}:`, error);
      throw new Error(`Failed to delete team with ID ${id}`);
    }
  }

  /**
   * Log a tournament audit event
   */
  async logTournamentAudit(auditData: {
    tournamentId?: number;
    parentTournamentId?: number;
    userId: number;
    action: string;
    details?: Record<string, any>;
  }) {
    try {
      const [auditEntry] = await db
        .insert(tournamentAuditLogs)
        .values({
          tournamentId: auditData.tournamentId,
          parentTournamentId: auditData.parentTournamentId,
          userId: auditData.userId,
          action: auditData.action,
          details: auditData.details || {}
        })
        .returning();
      
      return auditEntry;
    } catch (error) {
      console.error('Error logging tournament audit:', error);
      throw new Error('Failed to log tournament audit');
    }
  }

  /**
   * Create a tournament template
   */
  async createTournamentTemplate(templateData: {
    name: string;
    description?: string;
    createdById: number;
    isPublic: boolean;
    configuration: Record<string, any>;
    category?: string;
    division?: string;
    format?: string;
  }) {
    try {
      const [newTemplate] = await db
        .insert(tournamentTemplates)
        .values(templateData)
        .returning();
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating tournament template:', error);
      throw new Error('Failed to create tournament template');
    }
  }

  /**
   * Get all tournament templates
   */
  async getAllTournamentTemplates() {
    try {
      return await db
        .select()
        .from(tournamentTemplates)
        .orderBy(tournamentTemplates.name);
    } catch (error) {
      console.error('Error fetching tournament templates:', error);
      throw new Error('Failed to fetch tournament templates');
    }
  }

  /**
   * Get tournament template by ID
   */
  async getTournamentTemplateById(id: number) {
    try {
      const [template] = await db
        .select()
        .from(tournamentTemplates)
        .where(eq(tournamentTemplates.id, id));
      
      return template;
    } catch (error) {
      console.error(`Error fetching tournament template with ID ${id}:`, error);
      throw new Error(`Failed to fetch tournament template with ID ${id}`);
    }
  }

  /**
   * Update a tournament template
   */
  async updateTournamentTemplate(id: number, templateData: Partial<{
    name: string;
    description?: string;
    isPublic: boolean;
    configuration: Record<string, any>;
    category?: string;
    division?: string;
    format?: string;
  }>) {
    try {
      const [updatedTemplate] = await db
        .update(tournamentTemplates)
        .set({
          ...templateData,
          updatedAt: new Date()
        })
        .where(eq(tournamentTemplates.id, id))
        .returning();
      
      return updatedTemplate;
    } catch (error) {
      console.error(`Error updating tournament template with ID ${id}:`, error);
      throw new Error(`Failed to update tournament template with ID ${id}`);
    }
  }

  /**
   * Delete a tournament template
   */
  async deleteTournamentTemplate(id: number) {
    try {
      const [deletedTemplate] = await db
        .delete(tournamentTemplates)
        .where(eq(tournamentTemplates.id, id))
        .returning();
      
      return deletedTemplate;
    } catch (error) {
      console.error(`Error deleting tournament template with ID ${id}:`, error);
      throw new Error(`Failed to delete tournament template with ID ${id}`);
    }
  }

  /**
   * Register a team for a tournament
   */
  async registerTeamForTournament(registrationData: {
    teamId: number;
    tournamentId: number;
    status?: string;
    seedNumber?: number;
    notes?: string;
  }) {
    try {
      const [newRegistration] = await db
        .insert(teamTournamentRegistrations)
        .values(registrationData)
        .returning();
      
      return newRegistration;
    } catch (error) {
      console.error(`Error registering team ${registrationData.teamId} for tournament ${registrationData.tournamentId}:`, error);
      throw new Error(`Failed to register team for tournament`);
    }
  }

  /**
   * Get all teams registered for a tournament
   */
  async getTeamsForTournament(tournamentId: number) {
    try {
      const registrations = await db
        .select({
          registration: teamTournamentRegistrations,
          team: teams
        })
        .from(teamTournamentRegistrations)
        .innerJoin(teams, eq(teamTournamentRegistrations.teamId, teams.id))
        .where(eq(teamTournamentRegistrations.tournamentId, tournamentId));
      
      return registrations.map(r => ({
        ...r.team,
        registrationStatus: r.registration.status,
        seedNumber: r.registration.seedNumber,
        registrationDate: r.registration.registrationDate,
        notes: r.registration.notes
      }));
    } catch (error) {
      console.error(`Error fetching teams for tournament ${tournamentId}:`, error);
      throw new Error(`Failed to fetch teams for tournament ${tournamentId}`);
    }
  }

  /**
   * Change tournament status and log the change
   */
  async changeTournamentStatus(
    tournamentId: number, 
    newStatus: string, 
    changedById: number,
    reason?: string
  ) {
    try {
      // Get current status
      const [tournament] = await db
        .select({ status: tournaments.status })
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId));

      if (!tournament) {
        throw new Error(`Tournament with ID ${tournamentId} not found`);
      }

      const previousStatus = tournament.status;

      // Update status
      const [updatedTournament] = await db
        .update(tournaments)
        .set({
          status: newStatus,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, tournamentId))
        .returning();

      // Log status change
      await db
        .insert(tournamentStatusHistory)
        .values({
          tournamentId,
          previousStatus,
          newStatus,
          changedById,
          reason
        });

      return updatedTournament;
    } catch (error) {
      console.error(`Error changing status for tournament ${tournamentId}:`, error);
      throw new Error(`Failed to change status for tournament ${tournamentId}`);
    }
  }

  /**
   * Add a tournament director
   */
  async addTournamentDirector(directorData: {
    tournamentId: number;
    userId: number;
    role: string;
    assignedBy: number;
  }) {
    try {
      const [newDirector] = await db
        .insert(tournamentDirectors)
        .values(directorData)
        .returning();
      
      return newDirector;
    } catch (error) {
      console.error(`Error adding director to tournament ${directorData.tournamentId}:`, error);
      throw new Error(`Failed to add director to tournament ${directorData.tournamentId}`);
    }
  }

  /**
   * Remove a tournament director
   */
  async removeTournamentDirector(tournamentId: number, userId: number) {
    try {
      const [removedDirector] = await db
        .delete(tournamentDirectors)
        .where(and(
          eq(tournamentDirectors.tournamentId, tournamentId),
          eq(tournamentDirectors.userId, userId)
        ))
        .returning();
      
      return removedDirector;
    } catch (error) {
      console.error(`Error removing director from tournament ${tournamentId}:`, error);
      throw new Error(`Failed to remove director from tournament ${tournamentId}`);
    }
  }

  /**
   * Get all directors for a tournament
   */
  async getTournamentDirectors(tournamentId: number) {
    try {
      // Join with users table to get user details
      const directors = await db
        .select({
          id: tournamentDirectors.id,
          tournamentId: tournamentDirectors.tournamentId,
          userId: tournamentDirectors.userId,
          role: tournamentDirectors.role,
          assignedAt: tournamentDirectors.assignedAt,
          userName: users.username,  // This assumes users table has username field
          displayName: users.displayName  // This assumes users table has displayName field
        })
        .from(tournamentDirectors)
        .innerJoin(users, eq(tournamentDirectors.userId, users.id))
        .where(eq(tournamentDirectors.tournamentId, tournamentId));
      
      return directors;
    } catch (error) {
      console.error(`Error fetching directors for tournament ${tournamentId}:`, error);
      throw new Error(`Failed to fetch directors for tournament ${tournamentId}`);
    }
  }

  /**
   * Add a court to a tournament
   */
  async addTournamentCourt(courtData: {
    tournamentId: number;
    courtNumber: string;
    courtName?: string;
    location?: string;
  }) {
    try {
      const [newCourt] = await db
        .insert(tournamentCourts)
        .values(courtData)
        .returning();
      
      return newCourt;
    } catch (error) {
      console.error(`Error adding court to tournament ${courtData.tournamentId}:`, error);
      throw new Error(`Failed to add court to tournament ${courtData.tournamentId}`);
    }
  }

  /**
   * Update a tournament court
   */
  async updateTournamentCourt(id: number, courtData: Partial<{
    courtNumber: string;
    courtName: string;
    location: string;
    status: string;
  }>) {
    try {
      const [updatedCourt] = await db
        .update(tournamentCourts)
        .set({
          ...courtData,
          updatedAt: new Date()
        })
        .where(eq(tournamentCourts.id, id))
        .returning();
      
      return updatedCourt;
    } catch (error) {
      console.error(`Error updating court with ID ${id}:`, error);
      throw new Error(`Failed to update court with ID ${id}`);
    }
  }

  /**
   * Remove a tournament court
   */
  async removeTournamentCourt(id: number) {
    try {
      const [removedCourt] = await db
        .delete(tournamentCourts)
        .where(eq(tournamentCourts.id, id))
        .returning();
      
      return removedCourt;
    } catch (error) {
      console.error(`Error removing court with ID ${id}:`, error);
      throw new Error(`Failed to remove court with ID ${id}`);
    }
  }

  /**
   * Get all courts for a tournament
   */
  async getTournamentCourts(tournamentId: number) {
    try {
      return await db
        .select()
        .from(tournamentCourts)
        .where(eq(tournamentCourts.tournamentId, tournamentId))
        .orderBy(tournamentCourts.courtNumber);
    } catch (error) {
      console.error(`Error fetching courts for tournament ${tournamentId}:`, error);
      throw new Error(`Failed to fetch courts for tournament ${tournamentId}`);
    }
  }
}

// Export singleton instance
export const tournamentAdminService = new TournamentAdminService();