/**
 * PKL-278651-TOURN-0013-API
 * Tournament Bracket Types
 * 
 * This file defines the types for the tournament bracket module.
 */

// Tournament Bracket
export interface TournamentBracket {
  id: number;
  tournamentId: number;
  name: string;
  status: string;
  bracketType: string;
  startDate?: string;
  endDate?: string;
  teamsCount: number;
  roundsCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Tournament Round
export interface TournamentRound {
  id: number;
  bracketId: number;
  roundNumber: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

// Tournament Bracket Match
export interface TournamentBracketMatch {
  id: number;
  bracketId: number;
  roundId: number;
  matchNumber: number;
  team1Id: number | null;
  team2Id: number | null;
  team1Name?: string;
  team2Name?: string;
  team1Score?: number | null;
  team2Score?: number | null;
  winner?: number | null;
  status: string;
  scheduledTime?: string;
  courtNumber?: number | null;
  nextMatchId?: number | null;
  createdAt: string;
  updatedAt?: string;
}

// Complete bracket data returned from the API
export interface BracketData {
  bracket: TournamentBracket;
  rounds: TournamentRound[];
  matches: TournamentBracketMatch[];
}