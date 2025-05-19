/**
 * PKL-278651-TOURN-0015-MULTI - Enhanced Tournament System Storage
 * 
 * This service provides storage access methods for the enhanced tournament system
 * with parent-child relationships and team tournament functionality.
 */

import { db } from '../db';
import { eq, and, desc, asc, isNull, or, gte, lte, sql } from 'drizzle-orm';
import { 
  // Enhanced tournament system tables
  parentTournaments,
  tournamentRelationships,
  teams,
  teamMembers,
  teamTournamentRegistrations,
  tournamentDirectors,
  tournamentCourts,
  tournamentStatusHistory,
  tournamentTemplates,
  tournamentAuditLogs,
  
  // Related standard tables
  tournaments,
  users,
  
  // Types
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
  type TournamentDirector,
  type InsertTournamentDirector,
  type TournamentCourt,
  type InsertTournamentCourt,
  type TournamentStatusHistory,
  type InsertTournamentStatusHistory,
  type TournamentTemplate,
  type InsertTournamentTemplate,
  type TournamentAuditLog,
  type InsertTournamentAuditLog
} from '@shared/schema';

/**
 * Enhanced Tournament System Storage Interface
 */
export interface IEnhancedTournamentStorage {
  // Parent Tournament Methods
  createParentTournament(data: InsertParentTournament): Promise<ParentTournament>;
  getParentTournamentById(id: number): Promise<ParentTournament | undefined>;
  getAllParentTournaments(options?: { limit?: number, offset?: number, includeTestData?: boolean }): Promise<ParentTournament[]>;
  updateParentTournament(id: number, data: Partial<InsertParentTournament>): Promise<ParentTournament | undefined>;
  deleteParentTournament(id: number): Promise<boolean>;
  
  // Tournament Relationship Methods
  createTournamentRelationship(data: InsertTournamentRelationship): Promise<TournamentRelationship>;
  getTournamentRelationshipById(id: number): Promise<TournamentRelationship | undefined>;
  getChildTournamentsByParentId(parentId: number): Promise<TournamentRelationship[]>;
  deleteTournamentRelationship(id: number): Promise<boolean>;
  
  // Team Methods
  createTeam(data: InsertTeam): Promise<Team>;
  getTeamById(id: number): Promise<Team | undefined>;
  getAllTeams(options?: { limit?: number, offset?: number, includeTestData?: boolean }): Promise<Team[]>;
  getTeamsByCaptainId(captainId: number): Promise<Team[]>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Member Methods
  addTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  getTeamMemberById(id: number): Promise<TeamMember | undefined>;
  getTeamMembersByTeamId(teamId: number): Promise<TeamMember[]>;
  getTeamMembersByUserId(userId: number): Promise<TeamMember[]>;
  removeTeamMember(id: number): Promise<boolean>;
  updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined>;
  
  // Team Tournament Registration Methods
  registerTeamForTournament(data: InsertTeamTournamentRegistration): Promise<TeamTournamentRegistration>;
  getTeamTournamentRegistrationById(id: number): Promise<TeamTournamentRegistration | undefined>;
  getTeamRegistrationsByTournamentId(tournamentId: number): Promise<TeamTournamentRegistration[]>;
  getTeamRegistrationsByTeamId(teamId: number): Promise<TeamTournamentRegistration[]>;
  updateTeamRegistrationStatus(id: number, status: string): Promise<TeamTournamentRegistration | undefined>;
  deleteTeamRegistration(id: number): Promise<boolean>;
  
  // Tournament Director Methods
  assignTournamentDirector(data: InsertTournamentDirector): Promise<TournamentDirector>;
  getTournamentDirectorById(id: number): Promise<TournamentDirector | undefined>;
  getTournamentDirectorsByTournamentId(tournamentId: number): Promise<TournamentDirector[]>;
  getTournamentsByDirectorId(userId: number): Promise<TournamentDirector[]>;
  removeTournamentDirector(id: number): Promise<boolean>;
  
  // Tournament Court Methods
  addTournamentCourt(data: InsertTournamentCourt): Promise<TournamentCourt>;
  getTournamentCourtById(id: number): Promise<TournamentCourt | undefined>;
  getTournamentCourtsByTournamentId(tournamentId: number): Promise<TournamentCourt[]>;
  updateTournamentCourtStatus(id: number, status: string): Promise<TournamentCourt | undefined>;
  deleteTournamentCourt(id: number): Promise<boolean>;
  
  // Tournament Status History Methods
  addTournamentStatusChange(data: InsertTournamentStatusHistory): Promise<TournamentStatusHistory>;
  getTournamentStatusHistoryById(id: number): Promise<TournamentStatusHistory | undefined>;
  getTournamentStatusHistoryByTournamentId(tournamentId: number): Promise<TournamentStatusHistory[]>;
  
  // Tournament Template Methods
  createTournamentTemplate(data: InsertTournamentTemplate): Promise<TournamentTemplate>;
  getTournamentTemplateById(id: number): Promise<TournamentTemplate | undefined>;
  getAllTournamentTemplates(options?: { limit?: number, offset?: number, isPublic?: boolean }): Promise<TournamentTemplate[]>;
  getTournamentTemplatesByUserId(userId: number): Promise<TournamentTemplate[]>;
  updateTournamentTemplate(id: number, data: Partial<InsertTournamentTemplate>): Promise<TournamentTemplate | undefined>;
  deleteTournamentTemplate(id: number): Promise<boolean>;
  
  // Tournament Audit Log Methods
  addTournamentAuditLog(data: InsertTournamentAuditLog): Promise<TournamentAuditLog>;
  getTournamentAuditLogsById(id: number): Promise<TournamentAuditLog | undefined>;
  getTournamentAuditLogsByTournamentId(tournamentId: number): Promise<TournamentAuditLog[]>;
  getTournamentAuditLogsByParentTournamentId(parentTournamentId: number): Promise<TournamentAuditLog[]>;
  getTournamentAuditLogsByUserId(userId: number): Promise<TournamentAuditLog[]>;
}

/**
 * Enhanced Tournament System Storage Implementation
 */
export class EnhancedTournamentStorage implements IEnhancedTournamentStorage {
  // Parent Tournament Methods
  async createParentTournament(data: InsertParentTournament): Promise<ParentTournament> {
    const [parent] = await db
      .insert(parentTournaments)
      .values(data)
      .returning();
    return parent;
  }

  async getParentTournamentById(id: number): Promise<ParentTournament | undefined> {
    const [parent] = await db
      .select()
      .from(parentTournaments)
      .where(eq(parentTournaments.id, id));
    return parent;
  }

  async getAllParentTournaments(options?: { limit?: number, offset?: number, includeTestData?: boolean }): Promise<ParentTournament[]> {
    const { limit = 100, offset = 0, includeTestData = false } = options || {};
    
    let query = db.select().from(parentTournaments);
    
    if (!includeTestData) {
      query = query.where(eq(parentTournaments.isTestData, false));
    }
    
    return query
      .orderBy(desc(parentTournaments.startDate))
      .limit(limit)
      .offset(offset);
  }

  async updateParentTournament(id: number, data: Partial<InsertParentTournament>): Promise<ParentTournament | undefined> {
    const [updated] = await db
      .update(parentTournaments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parentTournaments.id, id))
      .returning();
    return updated;
  }

  async deleteParentTournament(id: number): Promise<boolean> {
    try {
      await db
        .delete(parentTournaments)
        .where(eq(parentTournaments.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting parent tournament:', error);
      return false;
    }
  }

  // Tournament Relationship Methods
  async createTournamentRelationship(data: InsertTournamentRelationship): Promise<TournamentRelationship> {
    const [relationship] = await db
      .insert(tournamentRelationships)
      .values(data)
      .returning();
    return relationship;
  }

  async getTournamentRelationshipById(id: number): Promise<TournamentRelationship | undefined> {
    const [relationship] = await db
      .select()
      .from(tournamentRelationships)
      .where(eq(tournamentRelationships.id, id));
    return relationship;
  }

  async getChildTournamentsByParentId(parentId: number): Promise<TournamentRelationship[]> {
    return db
      .select()
      .from(tournamentRelationships)
      .where(eq(tournamentRelationships.parentTournamentId, parentId));
  }

  async deleteTournamentRelationship(id: number): Promise<boolean> {
    try {
      await db
        .delete(tournamentRelationships)
        .where(eq(tournamentRelationships.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting tournament relationship:', error);
      return false;
    }
  }

  // Team Methods
  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(data)
      .returning();
    return team;
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    return team;
  }

  async getAllTeams(options?: { limit?: number, offset?: number, includeTestData?: boolean }): Promise<Team[]> {
    const { limit = 100, offset = 0, includeTestData = false } = options || {};
    
    let query = db.select().from(teams);
    
    if (!includeTestData) {
      query = query.where(eq(teams.isTestData, false));
    }
    
    return query
      .orderBy(asc(teams.name))
      .limit(limit)
      .offset(offset);
  }

  async getTeamsByCaptainId(captainId: number): Promise<Team[]> {
    return db
      .select()
      .from(teams)
      .where(eq(teams.captainId, captainId));
  }

  async updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: number): Promise<boolean> {
    try {
      await db
        .delete(teams)
        .where(eq(teams.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  }

  // Team Member Methods
  async addTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values(data)
      .returning();
    return member;
  }

  async getTeamMemberById(id: number): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));
    return member;
  }

  async getTeamMembersByTeamId(teamId: number): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
  }

  async getTeamMembersByUserId(userId: number): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));
  }

  async removeTeamMember(id: number): Promise<boolean> {
    try {
      await db
        .delete(teamMembers)
        .where(eq(teamMembers.id, id));
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return false;
    }
  }

  async updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set({ role, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  // Team Tournament Registration Methods
  async registerTeamForTournament(data: InsertTeamTournamentRegistration): Promise<TeamTournamentRegistration> {
    const [registration] = await db
      .insert(teamTournamentRegistrations)
      .values(data)
      .returning();
    return registration;
  }

  async getTeamTournamentRegistrationById(id: number): Promise<TeamTournamentRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(teamTournamentRegistrations)
      .where(eq(teamTournamentRegistrations.id, id));
    return registration;
  }

  async getTeamRegistrationsByTournamentId(tournamentId: number): Promise<TeamTournamentRegistration[]> {
    return db
      .select()
      .from(teamTournamentRegistrations)
      .where(eq(teamTournamentRegistrations.tournamentId, tournamentId));
  }

  async getTeamRegistrationsByTeamId(teamId: number): Promise<TeamTournamentRegistration[]> {
    return db
      .select()
      .from(teamTournamentRegistrations)
      .where(eq(teamTournamentRegistrations.teamId, teamId));
  }

  async updateTeamRegistrationStatus(id: number, status: string): Promise<TeamTournamentRegistration | undefined> {
    const [updated] = await db
      .update(teamTournamentRegistrations)
      .set({ status, updatedAt: new Date() })
      .where(eq(teamTournamentRegistrations.id, id))
      .returning();
    return updated;
  }

  async deleteTeamRegistration(id: number): Promise<boolean> {
    try {
      await db
        .delete(teamTournamentRegistrations)
        .where(eq(teamTournamentRegistrations.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting team tournament registration:', error);
      return false;
    }
  }

  // Tournament Director Methods
  async assignTournamentDirector(data: InsertTournamentDirector): Promise<TournamentDirector> {
    const [director] = await db
      .insert(tournamentDirectors)
      .values(data)
      .returning();
    return director;
  }

  async getTournamentDirectorById(id: number): Promise<TournamentDirector | undefined> {
    const [director] = await db
      .select()
      .from(tournamentDirectors)
      .where(eq(tournamentDirectors.id, id));
    return director;
  }

  async getTournamentDirectorsByTournamentId(tournamentId: number): Promise<TournamentDirector[]> {
    return db
      .select()
      .from(tournamentDirectors)
      .where(eq(tournamentDirectors.tournamentId, tournamentId));
  }

  async getTournamentsByDirectorId(userId: number): Promise<TournamentDirector[]> {
    return db
      .select()
      .from(tournamentDirectors)
      .where(eq(tournamentDirectors.userId, userId));
  }

  async removeTournamentDirector(id: number): Promise<boolean> {
    try {
      await db
        .delete(tournamentDirectors)
        .where(eq(tournamentDirectors.id, id));
      return true;
    } catch (error) {
      console.error('Error removing tournament director:', error);
      return false;
    }
  }

  // Tournament Court Methods
  async addTournamentCourt(data: InsertTournamentCourt): Promise<TournamentCourt> {
    const [court] = await db
      .insert(tournamentCourts)
      .values(data)
      .returning();
    return court;
  }

  async getTournamentCourtById(id: number): Promise<TournamentCourt | undefined> {
    const [court] = await db
      .select()
      .from(tournamentCourts)
      .where(eq(tournamentCourts.id, id));
    return court;
  }

  async getTournamentCourtsByTournamentId(tournamentId: number): Promise<TournamentCourt[]> {
    return db
      .select()
      .from(tournamentCourts)
      .where(eq(tournamentCourts.tournamentId, tournamentId));
  }

  async updateTournamentCourtStatus(id: number, status: string): Promise<TournamentCourt | undefined> {
    const [updated] = await db
      .update(tournamentCourts)
      .set({ status, updatedAt: new Date() })
      .where(eq(tournamentCourts.id, id))
      .returning();
    return updated;
  }

  async deleteTournamentCourt(id: number): Promise<boolean> {
    try {
      await db
        .delete(tournamentCourts)
        .where(eq(tournamentCourts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting tournament court:', error);
      return false;
    }
  }

  // Tournament Status History Methods
  async addTournamentStatusChange(data: InsertTournamentStatusHistory): Promise<TournamentStatusHistory> {
    const [history] = await db
      .insert(tournamentStatusHistory)
      .values(data)
      .returning();
    return history;
  }

  async getTournamentStatusHistoryById(id: number): Promise<TournamentStatusHistory | undefined> {
    const [history] = await db
      .select()
      .from(tournamentStatusHistory)
      .where(eq(tournamentStatusHistory.id, id));
    return history;
  }

  async getTournamentStatusHistoryByTournamentId(tournamentId: number): Promise<TournamentStatusHistory[]> {
    return db
      .select()
      .from(tournamentStatusHistory)
      .where(eq(tournamentStatusHistory.tournamentId, tournamentId))
      .orderBy(desc(tournamentStatusHistory.changedAt));
  }

  // Tournament Template Methods
  async createTournamentTemplate(data: InsertTournamentTemplate): Promise<TournamentTemplate> {
    const [template] = await db
      .insert(tournamentTemplates)
      .values(data)
      .returning();
    return template;
  }

  async getTournamentTemplateById(id: number): Promise<TournamentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(tournamentTemplates)
      .where(eq(tournamentTemplates.id, id));
    return template;
  }

  async getAllTournamentTemplates(options?: { limit?: number, offset?: number, isPublic?: boolean }): Promise<TournamentTemplate[]> {
    const { limit = 100, offset = 0, isPublic } = options || {};
    
    let query = db.select().from(tournamentTemplates);
    
    if (isPublic !== undefined) {
      query = query.where(eq(tournamentTemplates.isPublic, isPublic));
    }
    
    return query
      .orderBy(asc(tournamentTemplates.name))
      .limit(limit)
      .offset(offset);
  }

  async getTournamentTemplatesByUserId(userId: number): Promise<TournamentTemplate[]> {
    return db
      .select()
      .from(tournamentTemplates)
      .where(
        or(
          eq(tournamentTemplates.createdById, userId),
          eq(tournamentTemplates.isPublic, true)
        )
      )
      .orderBy(asc(tournamentTemplates.name));
  }

  async updateTournamentTemplate(id: number, data: Partial<InsertTournamentTemplate>): Promise<TournamentTemplate | undefined> {
    const [updated] = await db
      .update(tournamentTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tournamentTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTournamentTemplate(id: number): Promise<boolean> {
    try {
      await db
        .delete(tournamentTemplates)
        .where(eq(tournamentTemplates.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting tournament template:', error);
      return false;
    }
  }

  // Tournament Audit Log Methods
  async addTournamentAuditLog(data: InsertTournamentAuditLog): Promise<TournamentAuditLog> {
    const [log] = await db
      .insert(tournamentAuditLogs)
      .values(data)
      .returning();
    return log;
  }

  async getTournamentAuditLogsById(id: number): Promise<TournamentAuditLog | undefined> {
    const [log] = await db
      .select()
      .from(tournamentAuditLogs)
      .where(eq(tournamentAuditLogs.id, id));
    return log;
  }

  async getTournamentAuditLogsByTournamentId(tournamentId: number): Promise<TournamentAuditLog[]> {
    return db
      .select()
      .from(tournamentAuditLogs)
      .where(eq(tournamentAuditLogs.tournamentId, tournamentId))
      .orderBy(desc(tournamentAuditLogs.timestamp));
  }

  async getTournamentAuditLogsByParentTournamentId(parentTournamentId: number): Promise<TournamentAuditLog[]> {
    return db
      .select()
      .from(tournamentAuditLogs)
      .where(eq(tournamentAuditLogs.parentTournamentId, parentTournamentId))
      .orderBy(desc(tournamentAuditLogs.timestamp));
  }

  async getTournamentAuditLogsByUserId(userId: number): Promise<TournamentAuditLog[]> {
    return db
      .select()
      .from(tournamentAuditLogs)
      .where(eq(tournamentAuditLogs.userId, userId))
      .orderBy(desc(tournamentAuditLogs.timestamp));
  }
}

// Export singleton instance
export const enhancedTournamentStorage = new EnhancedTournamentStorage();