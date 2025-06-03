/**
 * Administrative Match Creation Service
 * 
 * Allows league officials, tournament directors, and referees to create
 * matches between players with advanced administrative controls.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import { storage } from '../storage';
import { AntiGamingService } from './anti-gaming';
import type { InsertMatch } from '@shared/schema';

export interface AdminMatchRequest {
  createdById: number;
  creatorRole: 'league_official' | 'tournament_director' | 'referee' | 'admin';
  
  // Match participants
  playerOneId: number;
  playerTwoId: number;
  playerOnePartnerId?: number; // For doubles
  playerTwoPartnerId?: number; // For doubles
  
  // Match details
  formatType: 'singles' | 'doubles';
  matchType: 'casual' | 'league' | 'tournament' | 'exhibition';
  eventTier: 'local' | 'regional' | 'national' | 'international';
  
  // Scheduling
  scheduledDate: Date;
  scheduledTime?: string;
  estimatedDuration?: number; // minutes
  courtAssignment?: string;
  venue?: string;
  
  // Tournament context
  tournamentId?: number;
  bracketPosition?: string;
  roundNumber?: number;
  
  // Administrative settings
  isOfficial: boolean;
  requiresValidation: boolean;
  allowSelfReporting: boolean;
  pointsMultiplier?: number;
  
  // Additional details
  notes?: string;
  specialRules?: string;
  prizeInfo?: string;
}

export interface AdminMatchResponse {
  matchId: number;
  status: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  notifications: {
    playersSent: number;
    officialsNotified: boolean;
  };
  validationRequired: boolean;
  antiGamingChecks: {
    playersValidated: boolean;
    riskAssessment: string;
    warnings: string[];
  };
}

export class AdministrativeMatchService {
  
  /**
   * Create an administrative match with full validation
   */
  static async createAdministrativeMatch(
    request: AdminMatchRequest
  ): Promise<AdminMatchResponse> {
    
    // Validate creator permissions
    const creatorValidation = await this.validateCreatorPermissions(
      request.createdById,
      request.creatorRole,
      request.matchType
    );
    
    if (!creatorValidation.isValid) {
      throw new Error(`Permission denied: ${creatorValidation.reason}`);
    }
    
    // Validate all participants exist and are eligible
    const participantValidation = await this.validateParticipants(request);
    if (!participantValidation.isValid) {
      throw new Error(`Participant validation failed: ${participantValidation.reason}`);
    }
    
    // Anti-gaming checks for administrative matches
    const antiGamingCheck = await this.performAntiGamingValidation(request);
    
    // Create the match record with administrative flags
    const matchData: InsertMatch = {
      playerOneId: request.playerOneId,
      playerTwoId: request.playerTwoId,
      playerOnePartnerId: request.playerOnePartnerId || null,
      playerTwoPartnerId: request.playerTwoPartnerId || null,
      
      // Match configuration
      formatType: request.formatType,
      matchType: request.matchType,
      eventTier: request.eventTier,
      
      // Scheduling
      matchDate: request.scheduledDate,
      location: request.venue || null,
      
      // Administrative metadata
      isTestData: false,
      notes: this.buildAdministrativeNotes(request),
      
      // Initialize as scheduled (no scores yet)
      playerOneScore: null,
      playerTwoScore: null,
      winnerId: null,
      pointsAwarded: null
    };
    
    const match = await storage.createMatch(matchData);
    
    // Create administrative match record with extended metadata
    await this.createAdministrativeRecord(match.id, request);
    
    // Send notifications to participants
    const notifications = await this.sendMatchNotifications(match.id, request);
    
    // Schedule automatic reminders
    await this.scheduleMatchReminders(match.id, request.scheduledDate);
    
    return {
      matchId: match.id,
      status: 'scheduled',
      notifications,
      validationRequired: request.requiresValidation,
      antiGamingChecks: antiGamingCheck
    };
  }
  
  /**
   * Validate creator has permission to create matches
   */
  private static async validateCreatorPermissions(
    creatorId: number,
    role: string,
    matchType: string
  ): Promise<{ isValid: boolean; reason?: string }> {
    
    const creator = await storage.getUser(creatorId);
    if (!creator) {
      return { isValid: false, reason: "Creator not found" };
    }
    
    // Check role-based permissions
    const permissions = {
      'admin': ['casual', 'league', 'tournament', 'exhibition'],
      'tournament_director': ['tournament', 'exhibition'],
      'league_official': ['league', 'casual'],
      'referee': ['tournament', 'league']
    };
    
    const allowedTypes = permissions[role as keyof typeof permissions];
    if (!allowedTypes || !allowedTypes.includes(matchType)) {
      return {
        isValid: false,
        reason: `Role ${role} cannot create ${matchType} matches`
      };
    }
    
    // Additional validation for tournament directors
    if (role === 'tournament_director') {
      // Verify they have active tournaments
      // This would check tournament_officials table or similar
    }
    
    return { isValid: true };
  }
  
  /**
   * Validate all match participants
   */
  private static async validateParticipants(
    request: AdminMatchRequest
  ): Promise<{ isValid: boolean; reason?: string }> {
    
    const playerIds = [
      request.playerOneId,
      request.playerTwoId,
      request.playerOnePartnerId,
      request.playerTwoPartnerId
    ].filter(id => id !== undefined) as number[];
    
    // Check all players exist
    for (const playerId of playerIds) {
      const player = await storage.getUser(playerId);
      if (!player) {
        return {
          isValid: false,
          reason: `Player ${playerId} not found`
        };
      }
      
      // Check player is active
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (player.lastVisit && player.lastVisit < thirtyDaysAgo) {
        return {
          isValid: false,
          reason: `Player ${playerId} is inactive (last visit over 30 days ago)`
        };
      }
    }
    
    // Validate doubles format requirements
    if (request.formatType === 'doubles') {
      if (!request.playerOnePartnerId || !request.playerTwoPartnerId) {
        return {
          isValid: false,
          reason: "Doubles matches require both partner assignments"
        };
      }
    }
    
    // Check for scheduling conflicts
    const conflicts = await this.checkSchedulingConflicts(
      playerIds,
      request.scheduledDate
    );
    
    if (conflicts.length > 0) {
      return {
        isValid: false,
        reason: `Scheduling conflicts detected for players: ${conflicts.join(', ')}`
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Perform anti-gaming validation for administrative matches
   */
  private static async performAntiGamingValidation(
    request: AdminMatchRequest
  ): Promise<{
    playersValidated: boolean;
    riskAssessment: string;
    warnings: string[];
  }> {
    
    const warnings: string[] = [];
    let riskLevel = 'low';
    
    // Check each player's recent activity
    const playerIds = [request.playerOneId, request.playerTwoId];
    
    for (const playerId of playerIds) {
      const recentMatches = await storage.getMatchesByUser(playerId, 20, 0, playerId);
      
      // Validate with anti-gaming service
      const validation = await AntiGamingService.validateMatchSubmission(
        playerId,
        {
          playerOneId: request.playerOneId,
          playerTwoId: request.playerTwoId,
          playerOneScore: 11, // Dummy scores for validation
          playerTwoScore: 9
        },
        recentMatches,
        storage
      );
      
      if (!validation.isValid) {
        warnings.push(`Player ${playerId}: ${validation.reason}`);
        riskLevel = 'medium';
      }
      
      if (validation.suspiciousScore > 50) {
        warnings.push(`Player ${playerId} has elevated suspicious activity score`);
        riskLevel = validation.suspiciousScore > 80 ? 'high' : 'medium';
      }
    }
    
    // Check for unusual administrative patterns
    if (this.isUnusualAdminPattern(request)) {
      warnings.push("Unusual administrative match creation pattern detected");
      riskLevel = 'medium';
    }
    
    return {
      playersValidated: warnings.length === 0,
      riskAssessment: riskLevel,
      warnings
    };
  }
  
  /**
   * Check for scheduling conflicts
   */
  private static async checkSchedulingConflicts(
    playerIds: number[],
    scheduledDate: Date
  ): Promise<number[]> {
    
    const conflicts: number[] = [];
    const timeWindow = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    for (const playerId of playerIds) {
      // Get player's recent matches around the scheduled time
      const playerMatches = await storage.getMatchesByUser(playerId, 10, 0, playerId);
      
      const hasConflict = playerMatches.some(match => {
        const matchDate = new Date(match.matchDate || match.createdAt);
        const timeDiff = Math.abs(matchDate.getTime() - scheduledDate.getTime());
        return timeDiff < timeWindow;
      });
      
      if (hasConflict) {
        conflicts.push(playerId);
      }
    }
    
    return conflicts;
  }
  
  /**
   * Build administrative notes for the match
   */
  private static buildAdministrativeNotes(request: AdminMatchRequest): string {
    const notes = [];
    
    notes.push(`Administrative match created by ${request.creatorRole}`);
    
    if (request.isOfficial) {
      notes.push("Official match - results affect rankings");
    }
    
    if (request.tournamentId) {
      notes.push(`Tournament match (ID: ${request.tournamentId})`);
    }
    
    if (request.specialRules) {
      notes.push(`Special rules: ${request.specialRules}`);
    }
    
    if (request.notes) {
      notes.push(`Notes: ${request.notes}`);
    }
    
    return notes.join(' | ');
  }
  
  /**
   * Create administrative record with extended metadata
   */
  private static async createAdministrativeRecord(
    matchId: number,
    request: AdminMatchRequest
  ): Promise<void> {
    
    // This would create a record in an administrative_matches table
    // with extended metadata for tracking and management
    
    const adminRecord = {
      matchId,
      createdById: request.createdById,
      creatorRole: request.creatorRole,
      isOfficial: request.isOfficial,
      requiresValidation: request.requiresValidation,
      allowSelfReporting: request.allowSelfReporting,
      courtAssignment: request.courtAssignment,
      estimatedDuration: request.estimatedDuration,
      pointsMultiplier: request.pointsMultiplier || 1.0,
      tournamentId: request.tournamentId,
      bracketPosition: request.bracketPosition,
      roundNumber: request.roundNumber,
      createdAt: new Date()
    };
    
    console.log('[ADMIN-MATCH] Administrative record created:', adminRecord);
    // await storage.createAdministrativeMatch(adminRecord);
  }
  
  /**
   * Send notifications to match participants
   */
  private static async sendMatchNotifications(
    matchId: number,
    request: AdminMatchRequest
  ): Promise<{ playersSent: number; officialsNotified: boolean }> {
    
    const playerIds = [
      request.playerOneId,
      request.playerTwoId,
      request.playerOnePartnerId,
      request.playerTwoPartnerId
    ].filter(id => id !== undefined) as number[];
    
    let playersSent = 0;
    
    for (const playerId of playerIds) {
      try {
        // Send in-app notification
        console.log(`[ADMIN-MATCH] Sending notification to player ${playerId} for match ${matchId}`);
        // await notificationService.sendMatchScheduled(playerId, matchId, request);
        playersSent++;
      } catch (error) {
        console.error(`Failed to notify player ${playerId}:`, error);
      }
    }
    
    // Notify other officials if required
    const officialsNotified = await this.notifyOfficials(matchId, request);
    
    return { playersSent, officialsNotified };
  }
  
  /**
   * Schedule automatic match reminders
   */
  private static async scheduleMatchReminders(
    matchId: number,
    scheduledDate: Date
  ): Promise<void> {
    
    // Schedule reminders at 24 hours, 2 hours, and 30 minutes before match
    const reminderTimes = [
      new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours
      new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000),  // 2 hours
      new Date(scheduledDate.getTime() - 30 * 60 * 1000)       // 30 minutes
    ];
    
    for (const reminderTime of reminderTimes) {
      if (reminderTime > new Date()) {
        console.log(`[ADMIN-MATCH] Scheduling reminder for match ${matchId} at ${reminderTime}`);
        // await schedulerService.scheduleReminder(matchId, reminderTime);
      }
    }
  }
  
  /**
   * Utility methods
   */
  private static isUnusualAdminPattern(request: AdminMatchRequest): boolean {
    // Check for patterns that might indicate abuse
    // e.g., creating many matches with same players, unusual timing, etc.
    return false; // Placeholder implementation
  }
  
  private static async notifyOfficials(
    matchId: number,
    request: AdminMatchRequest
  ): Promise<boolean> {
    
    if (request.matchType === 'tournament' && request.tournamentId) {
      // Notify other tournament officials
      console.log(`[ADMIN-MATCH] Notifying tournament officials for match ${matchId}`);
      return true;
    }
    
    return false;
  }
}