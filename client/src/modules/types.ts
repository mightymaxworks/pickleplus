/**
 * Module type definitions
 * 
 * This file contains interface definitions for all modules
 * It serves as a contract between modules
 */

import { User, Tournament, Match, Achievement, Connection, CoachProfile } from '@shared/schema';

// User Module Interface
export interface UserModuleAPI {
  // User authentication
  login: (username: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  
  // Profile management
  updateProfile: (userData: any) => Promise<User>;
  getPassportQR: (userId: number) => string;
  
  // XP and tier
  getUserXP: (userId: number) => Promise<number>;
  getUserTier: (userId: number) => Promise<string>;
}

// Match Module Interface
export interface MatchModuleAPI {
  // Match recording
  recordMatch: (matchData: any) => Promise<Match>;
  getMatches: (userId: number) => Promise<Match[]>;
  
  // Match analytics
  getMatchStats: (userId: number) => Promise<any>;
}

// Tournament Module Interface
export interface TournamentModuleAPI {
  // Tournament management
  getTournaments: () => Promise<Tournament[]>;
  registerForTournament: (tournamentId: number, userId: number) => Promise<void>;
  checkInToTournament: (tournamentId: number, userId: number) => Promise<void>;
  
  // User tournaments
  getUserTournaments: (userId: number) => Promise<Tournament[]>;
}

// Achievement Module Interface
export interface AchievementModuleAPI {
  // Achievements
  getAchievements: () => Promise<Achievement[]>;
  getUserAchievements: (userId: number) => Promise<Achievement[]>;
  
  // Activity tracking
  getUserActivities: (userId: number) => Promise<any[]>;
  
  // Redemption codes
  redeemCode: (code: string, userId: number) => Promise<any>;
}

// Social Module Interface
export interface SocialModuleAPI {
  // Connections
  getConnections: (userId: number) => Promise<Connection[]>;
  requestConnection: (requesterId: number, recipientId: number) => Promise<Connection>;
  respondToConnection: (connectionId: number, status: string) => Promise<Connection>;
  
  // Player search
  searchPlayers: (query: string) => Promise<User[]>;
}

// Coaching Module Interface
export interface CoachModuleAPI {
  // Coach profiles
  getCoachProfile: (userId: number) => Promise<CoachProfile | null>;
  createCoachProfile: (profileData: any) => Promise<CoachProfile>;
  updateCoachProfile: (profileData: any) => Promise<CoachProfile>;
  
  // Coach access
  requestCoachAccess: (userId: number) => Promise<void>;
  
  // Coaching sessions
  bookCoachingSession: (coachId: number, studentId: number, sessionData: any) => Promise<any>;
}