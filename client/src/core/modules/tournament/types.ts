/**
 * PKL-278651-TOURN-0001-TYPES / PKL-278651-TOURN-0003.2-TYPE
 * Tournament Type Definitions
 * 
 * Shared type definitions for the tournament module components
 * Following Framework 5.0 principles for reliability and clean interfaces
 */

// Compatible interface that handles both null and undefined for optional fields
export interface Tournament {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  registrationStartDate?: Date | string | null;
  registrationEndDate?: Date | string | null;
  format?: string;
  division?: string;
  level?: string;
  status?: string;
  // Additional fields that might be used in the component
  participantsCount?: number;
  bracketCount?: number;
}

/**
 * PKL-278651-TOURN-0003.2-TYPE
 * Tournament Bracket Type Definitions
 * 
 * Type definitions for tournament bracket visualization and management
 */

export interface TournamentBracket {
  id: number;
  tournamentId: number;
  name: string;
  bracketType: string;
  status: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  teamsCount: number;
  roundsCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TournamentRound {
  id: number;
  bracketId: number;
  roundNumber: number;
  name: string;
  status?: string;
}

export interface TournamentTeam {
  id: number;
  teamName: string;
  members?: TournamentTeamMember[];
}

export interface TournamentTeamMember {
  id: number;
  userId: number;
  teamId: number;
  username?: string;
  displayName?: string | null;
  role?: string;
}

export interface TournamentMatch {
  id: number;
  bracketId?: number;
  roundId: number;
  matchNumber: number;
  team1Id: number | null;
  team2Id: number | null;
  team1: TournamentTeam | null;
  team2: TournamentTeam | null;
  winnerId: number | null;
  loserId?: number | null;
  score: string | null;
  scoreDetails?: any | null;
  status: string;
  matchDate?: string | null;
  notes?: string | null;
  team1PointsAwarded?: number | null;
  team2PointsAwarded?: number | null;
}

/**
 * PKL-278651-TOURN-0003.2-TYPE
 * Tournament API Response Types
 */

export interface BracketData {
  bracket: TournamentBracket;
  rounds: TournamentRound[];
  matches: TournamentMatch[];
  teams: TournamentTeam[];
}

export interface MatchResult {
  winnerId: number;
  loserId: number;
  score: string;
  notes?: string;
  scoreDetails?: any;
}

/**
 * PKL-278651-TOURN-0003.2-TYPE
 * Tournament Error Types
 */

export enum TournamentErrorCode {
  MATCH_NOT_FOUND = 'MATCH_NOT_FOUND',
  INVALID_TEAMS = 'INVALID_TEAMS',
  MATCH_ALREADY_COMPLETED = 'MATCH_ALREADY_COMPLETED',
  BRACKET_NOT_FOUND = 'BRACKET_NOT_FOUND',
  TOURNAMENT_NOT_FOUND = 'TOURNAMENT_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface TournamentError {
  code: TournamentErrorCode;
  message: string;
  details?: any;
}