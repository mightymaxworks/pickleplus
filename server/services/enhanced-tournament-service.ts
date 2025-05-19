/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament Service
 * 
 * This service provides business logic and operations for the multi-event tournament system
 * with parent-child relationships and team tournament functionality.
 */

import { enhancedTournamentStorage } from '../storage/enhanced-tournament-storage';
import { tournamentStorage } from '../storage/tournament-storage';
import { db } from '../db';
import { eq, and, or, desc } from 'drizzle-orm';
import {
  type ParentTournament,
  type InsertParentTournament,
  type TournamentRelationship,
  type InsertTournamentRelationship,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type TeamTournamentRegistration,
  type InsertTeamTournamentRegistration,
  type Tournament,
  type InsertTournament,
  type User,
  tournaments,
  parentTournaments,
  tournamentRelationships
} from '@shared/schema';

/**
 * Service for managing multi-event tournaments and team tournament functionality
 */
export class EnhancedTournamentService {
  
  /**
   * Creates a new parent tournament with connected sub-events
   * @param parentData Data for the parent tournament
   * @param childTournaments Array of child tournament data
   * @param userId ID of the user creating the tournaments
   * @returns The created parent tournament
   */
  async createMultiEventTournament(
    parentData: InsertParentTournament,
    childTournaments: InsertTournament[],
    userId: number
  ): Promise<ParentTournament> {
    // Start a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx) => {
      // Create the parent tournament
      const parent = await enhancedTournamentStorage.createParentTournament(parentData);
      
      // Create each child tournament with a reference to the parent
      for (const childData of childTournaments) {
        // Add parent reference to child tournament
        const tournament = await tournamentStorage.createTournament({
          ...childData,
          parentTournamentId: parent.id,
          isSubEvent: true,
          // Ensure the creator is set
          createdById: userId,
          // Make sure dates align with parent tournament
          startDate: childData.startDate || parent.startDate,
          endDate: childData.endDate || parent.endDate,
        });
        
        // Create relationship record
        await enhancedTournamentStorage.createTournamentRelationship({
          parentTournamentId: parent.id,
          childTournamentId: tournament.id,
        });
        
        // Log the creation in audit logs
        await enhancedTournamentStorage.addTournamentAuditLog({
          tournamentId: tournament.id,
          parentTournamentId: parent.id,
          userId,
          action: 'create_child_tournament',
          details: {
            childTournamentId: tournament.id,
            childTournamentName: tournament.name,
            category: tournament.category,
            division: tournament.division
          }
        });
      }
      
      // Log the creation of the parent tournament
      await enhancedTournamentStorage.addTournamentAuditLog({
        parentTournamentId: parent.id,
        userId,
        action: 'create_parent_tournament',
        details: {
          parentTournamentName: parent.name,
          childTournamentCount: childTournaments.length
        }
      });
      
      return parent;
    });
  }
  
  /**
   * Gets a parent tournament with all its child tournaments
   * @param parentId ID of the parent tournament
   * @returns The parent tournament and all child tournaments
   */
  async getMultiEventTournament(parentId: number): Promise<{
    parent: ParentTournament,
    children: Tournament[]
  } | undefined> {
    const parent = await enhancedTournamentStorage.getParentTournamentById(parentId);
    
    if (!parent) {
      return undefined;
    }
    
    // Get all relationships for this parent
    const relationships = await enhancedTournamentStorage.getChildTournamentsByParentId(parentId);
    
    // Get all child tournaments
    const childIds = relationships.map(rel => rel.childTournamentId);
    const childTournaments: Tournament[] = [];
    
    for (const id of childIds) {
      const tournament = await tournamentStorage.getTournamentById(id);
      if (tournament) {
        childTournaments.push(tournament);
      }
    }
    
    return {
      parent,
      children: childTournaments
    };
  }
  
  /**
   * Updates a parent tournament and optionally its child tournaments
   * @param parentId ID of the parent tournament
   * @param parentData Update data for the parent tournament
   * @param updateChildDates Whether to update child tournament dates to match parent
   * @param userId ID of the user making the update
   * @returns The updated parent tournament
   */
  async updateMultiEventTournament(
    parentId: number,
    parentData: Partial<InsertParentTournament>,
    updateChildDates: boolean = false,
    userId: number
  ): Promise<ParentTournament | undefined> {
    return await db.transaction(async (tx) => {
      // Update the parent tournament
      const parent = await enhancedTournamentStorage.updateParentTournament(parentId, parentData);
      
      if (!parent) {
        return undefined;
      }
      
      // If requested, update dates on all child tournaments
      if (updateChildDates && (parentData.startDate || parentData.endDate)) {
        const relationships = await enhancedTournamentStorage.getChildTournamentsByParentId(parentId);
        
        for (const rel of relationships) {
          const updateData: Partial<InsertTournament> = {};
          
          if (parentData.startDate) {
            updateData.startDate = parentData.startDate;
          }
          
          if (parentData.endDate) {
            updateData.endDate = parentData.endDate;
          }
          
          await tournamentStorage.updateTournament(rel.childTournamentId, updateData);
        }
      }
      
      // Log the update
      await enhancedTournamentStorage.addTournamentAuditLog({
        parentTournamentId: parentId,
        userId,
        action: 'update_parent_tournament',
        details: {
          updatedFields: Object.keys(parentData),
          updatedChildDates: updateChildDates
        }
      });
      
      return parent;
    });
  }
  
  /**
   * Adds a new child tournament to an existing parent tournament
   * @param parentId ID of the parent tournament
   * @param childData Data for the new child tournament
   * @param userId ID of the user creating the tournament
   * @returns The created child tournament
   */
  async addChildTournament(
    parentId: number,
    childData: InsertTournament,
    userId: number
  ): Promise<Tournament | undefined> {
    const parent = await enhancedTournamentStorage.getParentTournamentById(parentId);
    
    if (!parent) {
      return undefined;
    }
    
    return await db.transaction(async (tx) => {
      // Create the child tournament
      const tournament = await tournamentStorage.createTournament({
        ...childData,
        parentTournamentId: parent.id,
        isSubEvent: true,
        createdById: userId,
        // Align dates with parent tournament if not specified
        startDate: childData.startDate || parent.startDate,
        endDate: childData.endDate || parent.endDate,
      });
      
      // Create relationship record
      await enhancedTournamentStorage.createTournamentRelationship({
        parentTournamentId: parent.id,
        childTournamentId: tournament.id,
      });
      
      // Log the addition
      await enhancedTournamentStorage.addTournamentAuditLog({
        tournamentId: tournament.id,
        parentTournamentId: parent.id,
        userId,
        action: 'add_child_tournament',
        details: {
          childTournamentName: tournament.name,
          category: tournament.category,
          division: tournament.division
        }
      });
      
      return tournament;
    });
  }
  
  /**
   * Creates a team and assigns members
   * @param teamData Data for the new team
   * @param memberIds IDs of the initial team members (captain already included in teamData)
   * @param userId ID of the user creating the team
   * @returns The created team with members
   */
  async createTeamWithMembers(
    teamData: InsertTeam,
    memberIds: { userId: number, role?: string }[],
    userId: number
  ): Promise<{ team: Team, members: TeamMember[] }> {
    return await db.transaction(async (tx) => {
      // Create the team
      const team = await enhancedTournamentStorage.createTeam(teamData);
      
      // Add captain automatically
      const captain = await enhancedTournamentStorage.addTeamMember({
        teamId: team.id,
        userId: teamData.captainId,
        role: 'captain',
        isActive: true,
        joinDate: new Date(),
      });
      
      // Add additional members
      const members: TeamMember[] = [captain];
      
      for (const member of memberIds) {
        // Skip the captain as they're already added
        if (member.userId === teamData.captainId) {
          continue;
        }
        
        const teamMember = await enhancedTournamentStorage.addTeamMember({
          teamId: team.id,
          userId: member.userId,
          role: member.role || 'player',
          isActive: true,
          joinDate: new Date()
        });
        
        members.push(teamMember);
      }
      
      return { team, members };
    });
  }
  
  /**
   * Registers a team for a tournament
   * @param teamId ID of the team to register
   * @param tournamentId ID of the tournament
   * @param userId ID of the user submitting the registration
   * @returns The team registration
   */
  async registerTeamForTournament(
    teamId: number,
    tournamentId: number,
    userId: number
  ): Promise<TeamTournamentRegistration | undefined> {
    const team = await enhancedTournamentStorage.getTeamById(teamId);
    const tournament = await tournamentStorage.getTournamentById(tournamentId);
    
    if (!team || !tournament) {
      return undefined;
    }
    
    // Check that the user is the team captain or tournament director
    const isTeamCaptain = team.captainId === userId;
    const tournamentDirectors = await enhancedTournamentStorage.getTournamentDirectorsByTournamentId(tournamentId);
    const isTournamentDirector = tournamentDirectors.some(director => director.userId === userId);
    
    if (!isTeamCaptain && !isTournamentDirector) {
      throw new Error('Only team captains or tournament directors can register teams');
    }
    
    // Register the team
    const registration = await enhancedTournamentStorage.registerTeamForTournament({
      teamId,
      tournamentId,
      status: 'pending',
      registrationDate: new Date()
    });
    
    // Log the registration
    await enhancedTournamentStorage.addTournamentAuditLog({
      tournamentId,
      userId,
      action: 'register_team',
      details: {
        teamId,
        teamName: team.name,
        registrationStatus: 'pending'
      }
    });
    
    return registration;
  }
  
  /**
   * Gets a list of teams registered for a tournament
   * @param tournamentId ID of the tournament
   * @returns Teams and their registration details
   */
  async getTeamsForTournament(tournamentId: number): Promise<Array<{ team: Team, registration: TeamTournamentRegistration }>> {
    const registrations = await enhancedTournamentStorage.getTeamRegistrationsByTournamentId(tournamentId);
    
    const result = [];
    
    for (const registration of registrations) {
      const team = await enhancedTournamentStorage.getTeamById(registration.teamId);
      
      if (team) {
        result.push({
          team,
          registration
        });
      }
    }
    
    return result;
  }
  
  /**
   * Updates the status of a team's tournament registration
   * @param registrationId ID of the registration to update
   * @param status New status ('pending', 'approved', 'rejected', 'withdrawn')
   * @param userId ID of the user updating the status
   * @returns The updated registration
   */
  async updateTeamRegistrationStatus(
    registrationId: number,
    status: string,
    userId: number
  ): Promise<TeamTournamentRegistration | undefined> {
    const registration = await enhancedTournamentStorage.getTeamTournamentRegistrationById(registrationId);
    
    if (!registration) {
      return undefined;
    }
    
    // Update the registration status
    const updated = await enhancedTournamentStorage.updateTeamRegistrationStatus(registrationId, status);
    
    if (updated) {
      // Log the update
      await enhancedTournamentStorage.addTournamentAuditLog({
        tournamentId: registration.tournamentId,
        userId,
        action: 'update_team_registration',
        details: {
          teamId: registration.teamId,
          registrationId,
          previousStatus: registration.status,
          newStatus: status
        }
      });
    }
    
    return updated;
  }
  
  /**
   * Creates a tournament template that can be reused
   * @param templateData Data for the new template
   * @returns The created template
   */
  async createTournamentTemplate(templateData: any): Promise<TournamentTemplate> {
    return await enhancedTournamentStorage.createTournamentTemplate(templateData);
  }
  
  /**
   * Creates a tournament from a template
   * @param templateId ID of the template to use
   * @param customData Custom data to override template defaults
   * @param userId ID of the user creating the tournament
   * @returns The created tournament
   */
  async createTournamentFromTemplate(
    templateId: number,
    customData: Partial<InsertTournament>,
    userId: number
  ): Promise<Tournament | undefined> {
    const template = await enhancedTournamentStorage.getTournamentTemplateById(templateId);
    
    if (!template) {
      return undefined;
    }
    
    // Merge template configuration with custom data
    const tournamentData: InsertTournament = {
      name: customData.name || template.name,
      description: customData.description || template.description,
      location: customData.location || '',
      category: customData.category || template.category || '',
      division: customData.division || template.division || '',
      format: customData.format || template.format || '',
      status: customData.status || 'upcoming',
      startDate: customData.startDate || new Date(),
      endDate: customData.endDate || new Date(Date.now() + 86400000), // Default to next day
      createdById: userId,
      configuration: {
        ...template.configuration,
        ...(customData.configuration || {})
      }
    };
    
    // Create the tournament
    const tournament = await tournamentStorage.createTournament(tournamentData);
    
    // Log the creation
    await enhancedTournamentStorage.addTournamentAuditLog({
      tournamentId: tournament.id,
      userId,
      action: 'create_from_template',
      details: {
        templateId,
        templateName: template.name
      }
    });
    
    return tournament;
  }
}

// Export a singleton instance
export const enhancedTournamentService = new EnhancedTournamentService();