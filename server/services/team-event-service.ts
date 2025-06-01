/**
 * PKL-278651-TEAM-0001-SERVICE - Team Event Management Service
 * 
 * Provides business logic for flexible team event management including:
 * - Team template CRUD operations
 * - Constraint validation engine
 * - Team formation and roster management
 * - Real-time validation feedback
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

import { db } from "../db";
import { eq, and, inArray, sql } from "drizzle-orm";

// Import team event types (will need to fix imports once schema is integrated)
interface TeamEventTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  minPlayers: number;
  maxPlayers: number;
  allowSubstitutes: boolean;
  maxSubstitutes?: number;
  isActive: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamEventConstraint {
  id: number;
  templateId: number;
  constraintType: 'no_repeat_players' | 'skill_level_range' | 'gender_requirement' | 'age_requirement' | 'organization_limit' | 'custom';
  parameters: Record<string, any>;
  errorMessage: string;
  isActive: boolean;
  priority: number;
  createdAt: Date;
}

interface Team {
  id: number;
  tournamentId: number;
  templateId?: number;
  name: string;
  status: 'forming' | 'complete' | 'active' | 'inactive' | 'disbanded';
  captainUserId?: number;
  notes?: string;
  registrationData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  disbandedAt?: Date;
}

interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: 'captain' | 'co_captain' | 'member' | 'substitute';
  isSubstitute: boolean;
  positionRequirements?: Record<string, any>;
  joinedAt: Date;
  leftAt?: Date;
  invitedAt?: Date;
  invitationAccepted?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  constraintType: string;
  message: string;
  affectedPlayers?: number[];
}

interface ValidationWarning {
  message: string;
  recommendation?: string;
}

export class TeamEventService {
  
  /**
   * TEAM TEMPLATE MANAGEMENT
   */
  
  async createTeamTemplate(templateData: Omit<TeamEventTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamEventTemplate> {
    const result = await db.execute(sql`
      INSERT INTO team_event_templates (
        name, description, category, min_players, max_players, 
        allow_substitutes, max_substitutes, is_active, created_by
      ) VALUES (
        ${templateData.name}, ${templateData.description}, ${templateData.category},
        ${templateData.minPlayers}, ${templateData.maxPlayers},
        ${templateData.allowSubstitutes}, ${templateData.maxSubstitutes},
        ${templateData.isActive}, ${templateData.createdBy}
      ) RETURNING *
    `);
    
    return result.rows[0] as TeamEventTemplate;
  }
  
  async getTeamTemplates(activeOnly: boolean = true): Promise<TeamEventTemplate[]> {
    const condition = activeOnly ? sql`WHERE is_active = true` : sql``;
    const result = await db.execute(sql`
      SELECT * FROM team_event_templates ${condition}
      ORDER BY created_at DESC
    `);
    
    return result.rows as TeamEventTemplate[];
  }
  
  async getTeamTemplate(id: number): Promise<TeamEventTemplate | null> {
    const result = await db.execute(sql`
      SELECT * FROM team_event_templates WHERE id = ${id}
    `);
    
    return result.rows[0] as TeamEventTemplate || null;
  }
  
  async updateTeamTemplate(id: number, updates: Partial<TeamEventTemplate>): Promise<TeamEventTemplate | null> {
    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');
    
    const result = await db.execute(sql`
      UPDATE team_event_templates 
      SET ${sql.raw(setClause)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    
    return result.rows[0] as TeamEventTemplate || null;
  }
  
  /**
   * CONSTRAINT MANAGEMENT
   */
  
  async addConstraintToTemplate(templateId: number, constraint: Omit<TeamEventConstraint, 'id' | 'templateId' | 'createdAt'>): Promise<TeamEventConstraint> {
    const result = await db.execute(sql`
      INSERT INTO team_event_constraints (
        template_id, constraint_type, parameters, error_message,
        is_active, priority
      ) VALUES (
        ${templateId}, ${constraint.constraintType}, ${JSON.stringify(constraint.parameters)},
        ${constraint.errorMessage}, ${constraint.isActive}, ${constraint.priority}
      ) RETURNING *
    `);
    
    return result.rows[0] as TeamEventConstraint;
  }
  
  async getTemplateConstraints(templateId: number): Promise<TeamEventConstraint[]> {
    const result = await db.execute(sql`
      SELECT * FROM team_event_constraints 
      WHERE template_id = ${templateId} AND is_active = true
      ORDER BY priority ASC, created_at ASC
    `);
    
    return result.rows as TeamEventConstraint[];
  }
  
  /**
   * TEAM MANAGEMENT
   */
  
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const result = await db.execute(sql`
      INSERT INTO teams (
        tournament_id, template_id, name, status, captain_user_id,
        notes, registration_data
      ) VALUES (
        ${teamData.tournamentId}, ${teamData.templateId}, ${teamData.name},
        ${teamData.status}, ${teamData.captainUserId}, ${teamData.notes},
        ${JSON.stringify(teamData.registrationData)}
      ) RETURNING *
    `);
    
    return result.rows[0] as Team;
  }
  
  async getTeamsByTournament(tournamentId: number): Promise<Team[]> {
    const result = await db.execute(sql`
      SELECT * FROM teams 
      WHERE tournament_id = ${tournamentId}
      ORDER BY created_at DESC
    `);
    
    return result.rows as Team[];
  }
  
  async getTeam(id: number): Promise<Team | null> {
    const result = await db.execute(sql`
      SELECT * FROM teams WHERE id = ${id}
    `);
    
    return result.rows[0] as Team || null;
  }
  
  /**
   * TEAM MEMBER MANAGEMENT
   */
  
  async addTeamMember(memberData: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> {
    const result = await db.execute(sql`
      INSERT INTO team_members (
        team_id, user_id, role, is_substitute, position_requirements,
        invited_at, invitation_accepted
      ) VALUES (
        ${memberData.teamId}, ${memberData.userId}, ${memberData.role},
        ${memberData.isSubstitute}, ${JSON.stringify(memberData.positionRequirements)},
        ${memberData.invitedAt}, ${memberData.invitationAccepted}
      ) RETURNING *
    `);
    
    return result.rows[0] as TeamMember;
  }
  
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const result = await db.execute(sql`
      SELECT tm.*, u.username, u.email, u.ranking 
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ${teamId} AND tm.left_at IS NULL
      ORDER BY tm.role ASC, tm.joined_at ASC
    `);
    
    return result.rows as TeamMember[];
  }
  
  async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
    const result = await db.execute(sql`
      UPDATE team_members 
      SET left_at = NOW()
      WHERE team_id = ${teamId} AND user_id = ${userId}
    `);
    
    return result.rowCount > 0;
  }
  
  /**
   * CONSTRAINT VALIDATION ENGINE
   */
  
  async validateTeamComposition(teamId: number): Promise<ValidationResult> {
    const team = await this.getTeam(teamId);
    if (!team || !team.templateId) {
      return { isValid: false, errors: [{ constraintType: 'system', message: 'Team or template not found' }], warnings: [] };
    }
    
    const template = await this.getTeamTemplate(team.templateId);
    const constraints = await this.getTemplateConstraints(team.templateId);
    const members = await this.getTeamMembers(teamId);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate player count
    if (members.length < template!.minPlayers) {
      errors.push({
        constraintType: 'player_count',
        message: `Team needs at least ${template!.minPlayers} players (currently has ${members.length})`
      });
    }
    
    if (members.length > template!.maxPlayers) {
      errors.push({
        constraintType: 'player_count',
        message: `Team exceeds maximum of ${template!.maxPlayers} players (currently has ${members.length})`
      });
    }
    
    // Validate each constraint
    for (const constraint of constraints) {
      const constraintResult = await this.validateConstraint(constraint, team, members);
      if (!constraintResult.isValid) {
        errors.push(...constraintResult.errors);
      }
      warnings.push(...constraintResult.warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private async validateConstraint(constraint: TeamEventConstraint, team: Team, members: TeamMember[]): Promise<ValidationResult> {
    switch (constraint.constraintType) {
      case 'no_repeat_players':
        return this.validateNoRepeatPlayers(constraint, team, members);
      case 'skill_level_range':
        return this.validateSkillLevelRange(constraint, team, members);
      case 'gender_requirement':
        return this.validateGenderRequirement(constraint, team, members);
      default:
        return { isValid: true, errors: [], warnings: [] };
    }
  }
  
  private async validateNoRepeatPlayers(constraint: TeamEventConstraint, team: Team, members: TeamMember[]): Promise<ValidationResult> {
    const scope = constraint.parameters.scope || 'tournament';
    const userIds = members.map(m => m.userId);
    
    let scopeCondition = '';
    if (scope === 'tournament') {
      scopeCondition = `AND t.tournament_id = ${team.tournamentId}`;
    }
    
    const result = await db.execute(sql`
      SELECT tm.user_id, COUNT(*) as team_count, STRING_AGG(t.name, ', ') as team_names
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = ANY(${userIds}) AND tm.left_at IS NULL
      ${sql.raw(scopeCondition)}
      GROUP BY tm.user_id
      HAVING COUNT(*) > 1
    `);
    
    const errors: ValidationError[] = result.rows.map(row => ({
      constraintType: 'no_repeat_players',
      message: `Player is already on another team: ${row.team_names}`,
      affectedPlayers: [row.user_id]
    }));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  private async validateSkillLevelRange(constraint: TeamEventConstraint, team: Team, members: TeamMember[]): Promise<ValidationResult> {
    const { maxDifference, minRating, maxRating } = constraint.parameters;
    const userIds = members.map(m => m.userId);
    
    const result = await db.execute(sql`
      SELECT user_id, ranking FROM users 
      WHERE id = ANY(${userIds}) AND ranking IS NOT NULL
    `);
    
    const ratings = result.rows.map(row => row.ranking);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (ratings.length < members.length) {
      warnings.push({
        message: 'Some players do not have skill ratings assigned',
        recommendation: 'Assign ratings to all players for accurate validation'
      });
    }
    
    if (ratings.length >= 2) {
      const minTeamRating = Math.min(...ratings);
      const maxTeamRating = Math.max(...ratings);
      
      if (maxDifference && (maxTeamRating - minTeamRating) > maxDifference) {
        errors.push({
          constraintType: 'skill_level_range',
          message: `Team skill range (${maxTeamRating - minTeamRating}) exceeds maximum allowed (${maxDifference})`
        });
      }
      
      if (minRating && minTeamRating < minRating) {
        errors.push({
          constraintType: 'skill_level_range',
          message: `Team has players below minimum rating (${minRating})`
        });
      }
      
      if (maxRating && maxTeamRating > maxRating) {
        errors.push({
          constraintType: 'skill_level_range',
          message: `Team has players above maximum rating (${maxRating})`
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private async validateGenderRequirement(constraint: TeamEventConstraint, team: Team, members: TeamMember[]): Promise<ValidationResult> {
    const { male, female, flexible, nonBinary } = constraint.parameters;
    const userIds = members.map(m => m.userId);
    
    const result = await db.execute(sql`
      SELECT gender, COUNT(*) as count 
      FROM users 
      WHERE id = ANY(${userIds}) AND gender IS NOT NULL
      GROUP BY gender
    `);
    
    const genderCounts = result.rows.reduce((acc, row) => {
      acc[row.gender] = row.count;
      return acc;
    }, {} as Record<string, number>);
    
    const errors: ValidationError[] = [];
    
    if (!flexible) {
      if (male && (genderCounts.male || 0) !== male) {
        errors.push({
          constraintType: 'gender_requirement',
          message: `Team must have exactly ${male} male player(s) (currently has ${genderCounts.male || 0})`
        });
      }
      
      if (female && (genderCounts.female || 0) !== female) {
        errors.push({
          constraintType: 'gender_requirement',
          message: `Team must have exactly ${female} female player(s) (currently has ${genderCounts.female || 0})`
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  /**
   * BULK OPERATIONS
   */
  
  async validateAllTeamsInTournament(tournamentId: number): Promise<Record<number, ValidationResult>> {
    const teams = await this.getTeamsByTournament(tournamentId);
    const results: Record<number, ValidationResult> = {};
    
    for (const team of teams) {
      results[team.id] = await this.validateTeamComposition(team.id);
    }
    
    return results;
  }
  
  async getTeamFormationProgress(tournamentId: number): Promise<{
    totalTeams: number;
    completeTeams: number;
    formingTeams: number;
    constraintViolations: number;
  }> {
    const teams = await this.getTeamsByTournament(tournamentId);
    const validationResults = await this.validateAllTeamsInTournament(tournamentId);
    
    return {
      totalTeams: teams.length,
      completeTeams: teams.filter(t => t.status === 'complete').length,
      formingTeams: teams.filter(t => t.status === 'forming').length,
      constraintViolations: Object.values(validationResults).filter(r => !r.isValid).length
    };
  }
}

export const teamEventService = new TeamEventService();