import {
  users, type User, type InsertUser,
  tournaments, type Tournament, type InsertTournament,
  tournamentRegistrations, type TournamentRegistration, type InsertTournamentRegistration,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  activities, type Activity, type InsertActivity,
  redemptionCodes, type RedemptionCode, type InsertRedemptionCode,
  userRedemptions, type UserRedemption, type InsertUserRedemption,
  matches, type Match, type InsertMatch,
  rankingHistory, type RankingHistory, type InsertRankingHistory,
  coachingProfiles, type CoachingProfile, type InsertCoachingProfile,
  connections, type Connection, type InsertConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  getUserByPassportId(passportId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined>;
  updateUserXP(id: number, xpToAdd: number): Promise<User | undefined>;
  searchUsers(query: string, excludeUserId?: number): Promise<User[]>;
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  
  // Profile operations
  updateUserProfile(userId: number, profileData: any): Promise<User | undefined>;
  calculateProfileCompletion(userId: number): Promise<number>;
  updateProfileCompletionPercentage(userId: number, percentage: number): Promise<User | undefined>;
  getCompletedProfileFields(userId: number): Promise<string[]>;
  
  // Tournament operations
  getTournament(id: number): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  
  // Tournament registration operations
  registerForTournament(registration: InsertTournamentRegistration): Promise<TournamentRegistration>;
  getTournamentRegistration(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined>;
  getUserTournaments(userId: number): Promise<{tournament: Tournament, registration: TournamentRegistration}[]>;
  checkInUserForTournament(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<{achievement: Achievement, userAchievement: UserAchievement}[]>;
  unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  
  // Redemption code operations
  getRedemptionCodeByCode(code: string): Promise<RedemptionCode | undefined>;
  getRedemptionCode(id: number): Promise<RedemptionCode | undefined>;
  getAllRedemptionCodes(): Promise<RedemptionCode[]>;
  createRedemptionCode(redemptionCode: InsertRedemptionCode): Promise<RedemptionCode>;
  updateRedemptionCode(id: number, updates: Partial<InsertRedemptionCode>): Promise<RedemptionCode | undefined>;
  deleteRedemptionCode(id: number): Promise<boolean>;
  redeemCode(userRedemption: InsertUserRedemption): Promise<UserRedemption>;
  hasUserRedeemedCode(userId: number, codeId: number): Promise<boolean>;
  incrementRedemptionCodeCounter(codeId: number): Promise<RedemptionCode | undefined>;
  updateUserRedemption(userId: number, codeId: number, updates: Partial<UserRedemption>): Promise<UserRedemption | undefined>;
  getActiveRedemptionCodesCount(): Promise<number>;
  getRecentlyRedeemedCodes(limit: number): Promise<{code: RedemptionCode, user: User, redeemedAt: Date}[]>;
  getTotalXpAwarded(): Promise<number>;
  
  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatch(id: number): Promise<Match | undefined>;
  getUserMatches(userId: number, limit?: number): Promise<Match[]>;
  
  // Ranking operations
  updateUserRankingPoints(userId: number, pointsToAdd: number): Promise<User | undefined>;
  recordRankingChange(rankingHistory: InsertRankingHistory): Promise<RankingHistory>;
  getUserRankingHistory(userId: number, limit?: number): Promise<RankingHistory[]>;
  
  // Leaderboard operations
  getLeaderboard(limit: number): Promise<User[]>;
  getRankingLeaderboard(limit: number): Promise<User[]>;
  
  // Coaching profile operations
  getCoachingProfile(userId: number): Promise<CoachingProfile | undefined>;
  createCoachingProfile(profile: InsertCoachingProfile): Promise<CoachingProfile>;
  updateCoachingProfile(userId: number, updates: Partial<InsertCoachingProfile>): Promise<CoachingProfile | undefined>;
  getCoachingProfiles(limit: number, offset: number): Promise<CoachingProfile[]>;
  getVerifiedCoachingProfiles(limit: number, offset: number): Promise<CoachingProfile[]>;
  setPCPCertification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined>;
  setCoachingProfileActive(userId: number, isActive: boolean): Promise<CoachingProfile | undefined>;
  setAdminVerification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined>;
  
  // Connection operations (social features)
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: number): Promise<Connection | undefined>;
  updateConnectionStatus(id: number, status: string, endDate?: Date): Promise<Connection | undefined>;
  getUserSentConnections(userId: number, type?: string, status?: string): Promise<Connection[]>;
  getUserReceivedConnections(userId: number, type?: string, status?: string): Promise<Connection[]>;
  getActiveCoachingConnections(userId: number): Promise<{connection: Connection, user: User}[]>;
  getConnectionByUsers(requesterId: number, recipientId: number, type: string): Promise<Connection | undefined>;
  
  // Social features (for the dashboard)
  getSocialActivityFeed(userId: number, limit?: number): Promise<any[]>; // We'll define a more specific return type later
  getConnectionStats(userId: number): Promise<{total: number, byType: Record<string, number>}>;
  
  // Dashboard statistics methods
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  getActiveRedemptionCodesCount(): Promise<number>;
  getRecentlyRedeemedCodes(limit?: number): Promise<{code: RedemptionCode, user: User, redeemedAt: Date}[]>;
  getTotalXpAwarded(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tournaments: Map<number, Tournament>;
  private tournamentRegistrations: Map<number, TournamentRegistration>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private activities: Map<number, Activity>;
  private redemptionCodes: Map<number, RedemptionCode>;
  private userRedemptions: Map<number, UserRedemption>;
  private matches: Map<number, Match>;
  private rankingHistories: Map<number, RankingHistory>;
  private coachingProfiles: Map<number, CoachingProfile>;
  private connections: Map<number, Connection>;
  
  private userId: number;
  private tournamentId: number;
  private registrationId: number;
  private achievementId: number;
  private userAchievementId: number;
  private activityId: number;
  private redemptionCodeId: number;
  private userRedemptionId: number;
  private matchId: number;
  private rankingHistoryId: number;
  private coachingProfileId: number;
  private connectionId: number;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.tournamentRegistrations = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.activities = new Map();
    this.redemptionCodes = new Map();
    this.userRedemptions = new Map();
    this.matches = new Map();
    this.rankingHistories = new Map();
    this.coachingProfiles = new Map();
    this.connections = new Map();
    
    this.userId = 1;
    this.tournamentId = 1;
    this.registrationId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.activityId = 1;
    this.redemptionCodeId = 1;
    this.userRedemptionId = 1;
    this.matchId = 1;
    this.rankingHistoryId = 1;
    this.coachingProfileId = 1;
    this.connectionId = 1;
    
    // Initialize with sample achievements and redemption codes
    this.initSampleData();
  }
  
  private initSampleData() {
    // Add sample achievements
    const sampleAchievements: InsertAchievement[] = [
      {
        name: "Dink Master",
        description: "50 successful dinks",
        xpReward: 100,
        imageUrl: "dink_master.svg",
        category: "skill",
        requirement: 50
      },
      {
        name: "Tournament Finalist",
        description: "Reached final round",
        xpReward: 250,
        imageUrl: "tournament_finalist.svg",
        category: "tournament",
        requirement: 1
      },
      {
        name: "Social Butterfly",
        description: "Play with 10+ players",
        xpReward: 150,
        imageUrl: "social_butterfly.svg",
        category: "social",
        requirement: 10
      },
      {
        name: "Champion",
        description: "Win a tournament",
        xpReward: 500,
        imageUrl: "champion.svg",
        category: "tournament",
        requirement: 1
      },
      {
        name: "Match Maker",
        description: "Play 25 matches",
        xpReward: 200,
        imageUrl: "match_maker.svg",
        category: "matches",
        requirement: 25
      }
    ];
    
    sampleAchievements.forEach(achievement => {
      this.createAchievement(achievement);
    });
    
    // Add sample redemption codes
    const sampleCodes: InsertRedemptionCode[] = [
      {
        code: "WELCOME2023",
        xpReward: 100,
        description: "Welcome bonus for new players",
        isActive: true,
        expiresAt: new Date(2024, 11, 31)
      },
      {
        code: "SUMMERSLAM",
        xpReward: 250,
        description: "Summer Tournament special code",
        isActive: true,
        expiresAt: new Date(2023, 8, 30)
      }
    ];
    
    sampleCodes.forEach(code => {
      this.createRedemptionCode(code);
    });
    
    // Add sample tournament
    const now = new Date();
    const sampleTournament: InsertTournament = {
      name: "Spring Championship 2023",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 16),
      location: "Central Park Courts",
      description: "Annual spring championship with singles and doubles categories",
      imageUrl: "spring_championship.svg"
    };
    
    this.createTournament(sampleTournament);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === identifier || user.email === identifier
    );
  }
  
  async getUserByPassportId(passportId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.passportId === passportId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Ensure the data types match the schema definition
    const user: User = { 
      ...insertUser,
      id,
      createdAt,
      email: insertUser.email,
      passportId: insertUser.passportId || null,
      yearOfBirth: insertUser.yearOfBirth || null,
      location: insertUser.location || null,
      playingSince: insertUser.playingSince || null,
      skillLevel: insertUser.skillLevel || null,
      level: insertUser.level || 1,
      xp: insertUser.xp || 0,
      rankingPoints: insertUser.rankingPoints || 0,
      lastMatchDate: insertUser.lastMatchDate || null,
      totalMatches: insertUser.totalMatches || 0,
      matchesWon: insertUser.matchesWon || 0,
      totalTournaments: insertUser.totalTournaments || 0,
      profileCompletionPct: insertUser.profileCompletionPct || 0,
      isFoundingMember: insertUser.isFoundingMember || false
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserXP(id: number, xpToAdd: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    
    // Apply XP multiplier if the user is a founding member
    let finalXpToAdd = xpToAdd;
    if (user.isFoundingMember && user.xpMultiplier) {
      // xpMultiplier is stored as a percentage (e.g., 110 for 1.1x)
      finalXpToAdd = Math.floor(xpToAdd * (user.xpMultiplier / 100));
      console.log(`[XP] User ${id} is a founding member with multiplier ${user.xpMultiplier}%. Adding ${finalXpToAdd}XP instead of ${xpToAdd}XP`);
    }
    
    // Calculate new XP and level
    const newXP = currentXP + finalXpToAdd;
    
    // Simple level calculation: level up for every 1000 XP
    const xpPerLevel = 1000;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;
    
    const updatedUser = { 
      ...user, 
      xp: newXP,
      level: newLevel 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async searchUsers(query: string, excludeUserId?: number): Promise<User[]> {
    // Convert query to lowercase for case-insensitive search
    const lowercaseQuery = query.toLowerCase();
    
    // Search through all users
    return Array.from(this.users.values())
      .filter(user => {
        // Skip the current user if excludeUserId is provided
        if (excludeUserId && user.id === excludeUserId) {
          return false;
        }
        
        // Search by username, displayName, or email
        return (
          user.username.toLowerCase().includes(lowercaseQuery) ||
          (user.displayName && user.displayName.toLowerCase().includes(lowercaseQuery)) ||
          (user.email && user.email.toLowerCase().includes(lowercaseQuery))
        );
      })
      // Limit to 10 results for performance
      .slice(0, 10);
  }
  
  // Profile operations
  async updateUserProfile(userId: number, profileData: any): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Record the profile update time
    const profileLastUpdated = new Date();
    
    // Update the user with profile data
    const updatedUser = { 
      ...user, 
      ...profileData,
      profileLastUpdated
    };
    
    // Calculate the new profile completion percentage
    const completionPct = await this.calculateProfileCompletion(userId);
    updatedUser.profileCompletionPct = completionPct;
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async calculateProfileCompletion(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    // Define the fields that contribute to profile completion
    const profileFields = [
      'bio', 'location', 'skillLevel', 'playingSince', 
      'preferredPosition', 'paddleBrand', 'paddleModel', 
      'playingStyle', 'shotStrengths', 'preferredFormat', 
      'dominantHand', 'regularSchedule', 'lookingForPartners',
      'partnerPreferences', 'playerGoals', 'coach', 'clubs',
      'leagues', 'socialHandles', 'mobilityLimitations',
      'preferredMatchDuration', 'fitnessLevel'
    ];
    
    // Count how many fields are completed
    let completedFields = 0;
    for (const field of profileFields) {
      const value = user[field as keyof User];
      if (value !== undefined && value !== null && value !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof value === 'object' && !Array.isArray(value)) {
          const obj = value as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedFields++;
          }
        } else {
          completedFields++;
        }
      }
    }
    
    // Calculate percentage (0-100)
    return Math.round((completedFields / profileFields.length) * 100);
  }
  
  async updateProfileCompletionPercentage(userId: number, percentage: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      profileCompletionPct: percentage 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getCompletedProfileFields(userId: number): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Define the fields that contribute to profile completion
    const profileFields = [
      'bio', 'location', 'skillLevel', 'playingSince', 
      'preferredPosition', 'paddleBrand', 'paddleModel', 
      'playingStyle', 'shotStrengths', 'preferredFormat', 
      'dominantHand', 'regularSchedule', 'lookingForPartners',
      'partnerPreferences', 'playerGoals', 'coach', 'clubs',
      'leagues', 'socialHandles', 'mobilityLimitations',
      'preferredMatchDuration', 'fitnessLevel'
    ];
    
    // Check which fields are completed
    const completedFields: string[] = [];
    for (const field of profileFields) {
      const value = user[field as keyof User];
      if (value !== undefined && value !== null && value !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof value === 'object' && !Array.isArray(value)) {
          const obj = value as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedFields.push(field);
          }
        } else {
          completedFields.push(field);
        }
      }
    }
    
    return completedFields;
  }

  // Tournament operations
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.tournamentId++;
    const tournament: Tournament = { 
      ...insertTournament,
      id,
      description: insertTournament.description || null,
      imageUrl: insertTournament.imageUrl || null
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  // Tournament registration operations
  async registerForTournament(insertRegistration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const id = this.registrationId++;
    const createdAt = new Date();
    
    // Create object with all required properties explicitly set
    const registration: TournamentRegistration = { 
      userId: insertRegistration.userId,
      tournamentId: insertRegistration.tournamentId,
      id, 
      createdAt,
      status: insertRegistration.status || null,
      division: insertRegistration.division || null,
      checkedIn: false,
      placement: null // Required field in the schema
    };
    
    this.tournamentRegistrations.set(id, registration);
    return registration;
  }

  async getTournamentRegistration(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined> {
    return Array.from(this.tournamentRegistrations.values()).find(
      (reg) => reg.userId === userId && reg.tournamentId === tournamentId
    );
  }

  async getUserTournaments(userId: number): Promise<{tournament: Tournament, registration: TournamentRegistration}[]> {
    const registrations = Array.from(this.tournamentRegistrations.values()).filter(
      (reg) => reg.userId === userId
    );
    
    return registrations.map(registration => {
      const tournament = this.tournaments.get(registration.tournamentId)!;
      return { tournament, registration };
    });
  }

  async checkInUserForTournament(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined> {
    const registration = await this.getTournamentRegistration(userId, tournamentId);
    if (!registration) return undefined;
    
    const updatedRegistration = { ...registration, checkedIn: true };
    this.tournamentRegistrations.set(registration.id, updatedRegistration);
    return updatedRegistration;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const achievement: Achievement = { 
      ...insertAchievement, 
      id,
      imageUrl: insertAchievement.imageUrl || null
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<{achievement: Achievement, userAchievement: UserAchievement}[]> {
    const userAchievements = Array.from(this.userAchievements.values()).filter(
      (ua) => ua.userId === userId
    );
    
    return userAchievements.map(userAchievement => {
      const achievement = this.achievements.get(userAchievement.achievementId)!;
      return { achievement, userAchievement };
    });
  }

  async unlockAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementId++;
    const unlockedAt = new Date();
    const userAchievement: UserAchievement = { ...insertUserAchievement, id, unlockedAt };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const createdAt = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt,
      metadata: insertActivity.metadata || null
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
    
    return activities.slice(0, limit);
  }

  // Redemption code operations
  async getRedemptionCodeByCode(code: string): Promise<RedemptionCode | undefined> {
    return Array.from(this.redemptionCodes.values()).find(
      (rc) => rc.code === code && rc.isActive && (rc.expiresAt ? rc.expiresAt > new Date() : true)
    );
  }
  
  async getAllRedemptionCodes(): Promise<RedemptionCode[]> {
    return Array.from(this.redemptionCodes.values()).sort((a, b) => b.id - a.id);
  }

  async createRedemptionCode(insertRedemptionCode: InsertRedemptionCode): Promise<RedemptionCode> {
    const id = this.redemptionCodeId++;
    const redemptionCode: RedemptionCode = { 
      ...insertRedemptionCode, 
      id,
      description: insertRedemptionCode.description || null,
      isActive: insertRedemptionCode.isActive || null,
      expiresAt: insertRedemptionCode.expiresAt || null
    };
    this.redemptionCodes.set(id, redemptionCode);
    return redemptionCode;
  }

  async redeemCode(insertUserRedemption: InsertUserRedemption): Promise<UserRedemption> {
    const id = this.userRedemptionId++;
    const redeemedAt = new Date();
    const userRedemption: UserRedemption = { ...insertUserRedemption, id, redeemedAt };
    this.userRedemptions.set(id, userRedemption);
    return userRedemption;
  }

  async hasUserRedeemedCode(userId: number, codeId: number): Promise<boolean> {
    return Array.from(this.userRedemptions.values()).some(
      (ur) => ur.userId === userId && ur.codeId === codeId
    );
  }
  
  async updateUserRedemption(userId: number, codeId: number, updates: Partial<UserRedemption>): Promise<UserRedemption | undefined> {
    // Find the user redemption record
    const userRedemption = Array.from(this.userRedemptions.values()).find(
      (ur) => ur.userId === userId && ur.codeId === codeId
    );
    
    if (!userRedemption) return undefined;
    
    // Update the redemption with the new values
    const updatedRedemption = { ...userRedemption, ...updates };
    this.userRedemptions.set(userRedemption.id, updatedRedemption);
    
    return updatedRedemption;
  }
  
  async incrementRedemptionCodeCounter(codeId: number): Promise<RedemptionCode | undefined> {
    const code = this.redemptionCodes.get(codeId);
    if (!code) return undefined;
    
    // Increment the current redemptions counter
    const currentRedemptions = (code.currentRedemptions || 0) + 1;
    const updatedCode = { ...code, currentRedemptions };
    this.redemptionCodes.set(codeId, updatedCode);
    return updatedCode;
  }
  
  async getRedemptionCode(id: number): Promise<RedemptionCode | undefined> {
    return this.redemptionCodes.get(id);
  }
  
  async updateRedemptionCode(id: number, updates: Partial<InsertRedemptionCode>): Promise<RedemptionCode | undefined> {
    const code = this.redemptionCodes.get(id);
    if (!code) return undefined;
    
    const updatedCode = { ...code, ...updates };
    this.redemptionCodes.set(id, updatedCode);
    return updatedCode;
  }
  
  async deleteRedemptionCode(id: number): Promise<boolean> {
    // Check if the code has been redeemed by anyone
    const hasBeenRedeemed = Array.from(this.userRedemptions.values()).some(
      (redemption) => redemption.codeId === id
    );
    
    if (hasBeenRedeemed) {
      // If redeemed, just mark as inactive instead of deleting
      const code = this.redemptionCodes.get(id);
      if (code) {
        const updatedCode = { ...code, isActive: false };
        this.redemptionCodes.set(id, updatedCode);
      }
    } else {
      // If not redeemed, delete the code
      this.redemptionCodes.delete(id);
    }
    
    return true;
  }

  // Match operations
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.matchId++;
    const matchDate = new Date();
    
    const match: Match = {
      ...insertMatch,
      id,
      location: insertMatch.location || null,
      tournamentId: insertMatch.tournamentId || null,
      matchDate,
      notes: insertMatch.notes || null,
      playerOnePartnerId: insertMatch.playerOnePartnerId || null,
      playerTwoPartnerId: insertMatch.playerTwoPartnerId || null,
      formatType: insertMatch.formatType || "standard",
      scoringSystem: insertMatch.scoringSystem || "traditional",
      pointsToWin: insertMatch.pointsToWin || 11,
      gameScores: insertMatch.gameScores || null
    };
    
    this.matches.set(id, match);
    
    // Update user stats
    const player1 = await this.getUser(match.playerOneId);
    const player2 = await this.getUser(match.playerTwoId);
    
    if (player1) {
      const totalMatches = (player1.totalMatches || 0) + 1;
      const matchesWon = (player1.matchesWon || 0) + (match.winnerId === player1.id ? 1 : 0);
      await this.updateUser(player1.id, { 
        totalMatches, 
        matchesWon,
        lastMatchDate: matchDate
      });
    }
    
    if (player2) {
      const totalMatches = (player2.totalMatches || 0) + 1;
      const matchesWon = (player2.matchesWon || 0) + (match.winnerId === player2.id ? 1 : 0);
      await this.updateUser(player2.id, { 
        totalMatches, 
        matchesWon,
        lastMatchDate: matchDate
      });
    }
    
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getUserMatches(userId: number, limit: number = 10): Promise<Match[]> {
    const matches = Array.from(this.matches.values())
      .filter(match => match.playerOneId === userId || match.playerTwoId === userId)
      .sort((a, b) => {
        const aTime = a.matchDate ? a.matchDate.getTime() : 0;
        const bTime = b.matchDate ? b.matchDate.getTime() : 0;
        return bTime - aTime;
      });
    
    return matches.slice(0, limit);
  }
  
  // Ranking operations
  async updateUserRankingPoints(userId: number, pointsToAdd: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentPoints = user.rankingPoints || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    const updatedUser = { 
      ...user, 
      rankingPoints: newPoints
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async recordRankingChange(insertRankingHistory: InsertRankingHistory): Promise<RankingHistory> {
    const id = this.rankingHistoryId++;
    const createdAt = new Date();
    
    const rankingHistory: RankingHistory = {
      ...insertRankingHistory,
      id,
      createdAt,
      tournamentId: insertRankingHistory.tournamentId || null,
      matchId: insertRankingHistory.matchId || null
    };
    
    this.rankingHistories.set(id, rankingHistory);
    return rankingHistory;
  }
  
  async getUserRankingHistory(userId: number, limit: number = 10): Promise<RankingHistory[]> {
    const history = Array.from(this.rankingHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
    
    return history.slice(0, limit);
  }

  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, limit);
  }
  
  async getRankingLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0))
      .slice(0, limit);
  }
  
  // Coaching profile operations
  async getCoachingProfile(userId: number): Promise<CoachingProfile | undefined> {
    return Array.from(this.coachingProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createCoachingProfile(insertProfile: InsertCoachingProfile): Promise<CoachingProfile> {
    const id = this.coachingProfileId++;
    const createdAt = new Date();
    const profile: CoachingProfile = {
      ...insertProfile,
      id,
      createdAt,
      isActive: insertProfile.isActive || false,
      accessType: insertProfile.accessType,
      accessGrantedAt: insertProfile.accessGrantedAt || createdAt,
      isPCPCertified: insertProfile.isPCPCertified || false,
      isAdminVerified: insertProfile.isAdminVerified || false,
      yearsCoaching: insertProfile.yearsCoaching || null,
      certifications: insertProfile.certifications || [],
      teachingPhilosophy: insertProfile.teachingPhilosophy || null,
      hourlyRate: insertProfile.hourlyRate || null,
      packagePricing: insertProfile.packagePricing || [],
      specializations: insertProfile.specializations || [],
      coachingFormats: insertProfile.coachingFormats || [],
      country: insertProfile.country || null,
      stateProvince: insertProfile.stateProvince || null,
      city: insertProfile.city || null,
      facilities: insertProfile.facilities || [],
      travelRadius: insertProfile.travelRadius || null,
      availabilitySchedule: insertProfile.availabilitySchedule || {},
      studentSuccesses: insertProfile.studentSuccesses || [],
      contactPreferences: insertProfile.contactPreferences || {},
      updatedAt: null
    };
    
    this.coachingProfiles.set(id, profile);
    return profile;
  }

  async updateCoachingProfile(userId: number, updates: Partial<InsertCoachingProfile>): Promise<CoachingProfile | undefined> {
    const profile = await this.getCoachingProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.coachingProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getCoachingProfiles(limit: number = 10, offset: number = 0): Promise<CoachingProfile[]> {
    return Array.from(this.coachingProfiles.values())
      .filter(profile => profile.isActive)
      .sort((a, b) => {
        // Sort by verified status first (verified coaches first)
        if (a.isAdminVerified !== b.isAdminVerified) {
          return a.isAdminVerified ? -1 : 1;
        }
        
        // Then by PCP certification (certified coaches first)
        if (a.isPCPCertified !== b.isPCPCertified) {
          return a.isPCPCertified ? -1 : 1;
        }
        
        // Then by creation date (newest first)
        const aDate = a.createdAt ? a.createdAt.getTime() : 0;
        const bDate = b.createdAt ? b.createdAt.getTime() : 0;
        return bDate - aDate;
      })
      .slice(offset, offset + limit);
  }

  async getVerifiedCoachingProfiles(limit: number = 10, offset: number = 0): Promise<CoachingProfile[]> {
    return Array.from(this.coachingProfiles.values())
      .filter(profile => profile.isActive && profile.isAdminVerified)
      .sort((a, b) => {
        // Sort by PCP certification first (certified coaches first)
        if (a.isPCPCertified !== b.isPCPCertified) {
          return a.isPCPCertified ? -1 : 1;
        }
        
        // Then by creation date (newest first)
        const aDate = a.createdAt ? a.createdAt.getTime() : 0;
        const bDate = b.createdAt ? b.createdAt.getTime() : 0;
        return bDate - aDate;
      })
      .slice(offset, offset + limit);
  }

  async setPCPCertification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined> {
    const profile = await this.getCoachingProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      isPCPCertified: isVerified,
      updatedAt: new Date()
    };
    this.coachingProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async setCoachingProfileActive(userId: number, isActive: boolean): Promise<CoachingProfile | undefined> {
    const profile = await this.getCoachingProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      isActive,
      updatedAt: new Date()
    };
    this.coachingProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  async setAdminVerification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined> {
    const profile = await this.getCoachingProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { 
      ...profile, 
      isAdminVerified: isVerified,
      updatedAt: new Date()
    };
    this.coachingProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Connection operations (social features)
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Handle the message field by setting it to notes if provided
    const notes = connection.message || connection.notes || null;
    
    const conn: Connection = {
      ...connection,
      id,
      createdAt,
      updatedAt,
      status: connection.status || 'pending',
      metadata: connection.metadata || null,
      notes,
      // Handle optional fields with null defaults
      startDate: null,
      endDate: connection.endDate || null,
    };
    
    // Create an activity for the connection request
    if (connection.requesterId && connection.recipientId) {
      try {
        await this.createActivity({
          userId: connection.requesterId,
          type: `connection_request_${connection.type}`,
          targetId: connection.recipientId,
          metadata: {
            recipientId: connection.recipientId,
            connectionType: connection.type,
            connectionId: id
          }
        });
      } catch (error) {
        console.error("Failed to record connection request activity:", error);
      }
    }
    
    this.connections.set(id, conn);
    return conn;
  }
  
  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }
  
  async updateConnectionStatus(id: number, status: string, endDate?: Date): Promise<Connection | undefined> {
    const connection = await this.getConnection(id);
    if (!connection) return undefined;
    
    const now = new Date();
    const updatedConnection: Connection = { 
      ...connection, 
      status,
      updatedAt: now
    };
    
    // Update timestamps based on the new status
    if (status === 'accepted') {
      updatedConnection.startDate = now;
      
      // Create activity records for both users when connection is accepted
      try {
        // Activity for the requester (their request was accepted)
        await this.createActivity({
          userId: connection.requesterId,
          type: `connection_${connection.type}_accepted`,
          targetId: connection.recipientId,
          metadata: {
            connectionId: connection.id,
            recipientId: connection.recipientId,
            connectionType: connection.type
          }
        });
        
        // Activity for the recipient (they accepted the request)
        await this.createActivity({
          userId: connection.recipientId,
          type: `connection_${connection.type}_accept`,
          targetId: connection.requesterId,
          metadata: {
            connectionId: connection.id,
            requesterId: connection.requesterId,
            connectionType: connection.type
          }
        });
      } catch (error) {
        console.error("Failed to record connection acceptance activities:", error);
      }
    } else if (status === 'declined') {
      // Create activity for the requester (their request was declined)
      try {
        await this.createActivity({
          userId: connection.requesterId,
          type: `connection_${connection.type}_declined`,
          targetId: connection.recipientId,
          metadata: {
            connectionId: connection.id,
            recipientId: connection.recipientId,
            connectionType: connection.type
          }
        });
      } catch (error) {
        console.error("Failed to record connection declined activity:", error);
      }
    } else if (status === 'ended') {
      updatedConnection.endDate = endDate || now;
      
      // Create activities for both users when connection is ended
      try {
        await this.createActivity({
          userId: connection.requesterId,
          type: `connection_${connection.type}_ended`,
          targetId: connection.recipientId,
          metadata: {
            connectionId: connection.id,
            recipientId: connection.recipientId,
            connectionType: connection.type
          }
        });
        
        await this.createActivity({
          userId: connection.recipientId,
          type: `connection_${connection.type}_ended`,
          targetId: connection.requesterId,
          metadata: {
            connectionId: connection.id,
            requesterId: connection.requesterId,
            connectionType: connection.type
          }
        });
      } catch (error) {
        console.error("Failed to record connection ended activities:", error);
      }
    }
    
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }
  
  async getUserSentConnections(userId: number, type?: string, status?: string): Promise<Connection[]> {
    let connections = Array.from(this.connections.values())
      .filter(connection => connection.requesterId === userId);
    
    // Apply type filter if specified
    if (type) {
      connections = connections.filter(connection => connection.type === type);
    }
    
    // Apply status filter if specified
    if (status) {
      connections = connections.filter(connection => connection.status === status);
    }
    
    // Sort by creation date, newest first
    return connections.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }
  
  async getUserReceivedConnections(userId: number, type?: string, status?: string): Promise<Connection[]> {
    let connections = Array.from(this.connections.values())
      .filter(connection => connection.recipientId === userId);
    
    // Apply type filter if specified
    if (type) {
      connections = connections.filter(connection => connection.type === type);
    }
    
    // Apply status filter if specified
    if (status) {
      connections = connections.filter(connection => connection.status === status);
    }
    
    // Sort by creation date, newest first
    return connections.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }
  
  async getActiveCoachingConnections(userId: number): Promise<{connection: Connection, user: User}[]> {
    // Get all active coaching connections where this user is either the requester or recipient
    const connections = Array.from(this.connections.values())
      .filter(connection => 
        connection.type === 'coach' && 
        connection.status === 'accepted' && 
        (connection.requesterId === userId || connection.recipientId === userId)
      );
    
    // Create an array of connection+user pairs
    return Promise.all(connections.map(async connection => {
      let otherUserId: number;
      
      // Find the other user in the connection
      if (connection.requesterId === userId) {
        otherUserId = connection.recipientId;
      } else {
        otherUserId = connection.requesterId;
      }
      
      const user = await this.getUser(otherUserId);
      
      if (!user) {
        throw new Error(`User with ID ${otherUserId} not found`);
      }
      
      return {
        connection,
        user
      };
    }));
  }
  
  async getConnectionByUsers(requesterId: number, recipientId: number, type: string): Promise<Connection | undefined> {
    return Array.from(this.connections.values()).find(
      connection => 
        connection.requesterId === requesterId && 
        connection.recipientId === recipientId &&
        connection.type === type
    );
  }
  
  // Social features (for the dashboard)
  async getSocialActivityFeed(userId: number, limit: number = 10): Promise<any[]> {
    // First, get all connections for this user
    const sentConnections = await this.getUserSentConnections(userId);
    const receivedConnections = await this.getUserReceivedConnections(userId);
    const allConnections = [...sentConnections, ...receivedConnections];
    
    // Get the IDs of users this person is connected with
    const connectedUserIds = new Set<number>();
    allConnections.forEach(connection => {
      if (connection.requesterId !== userId) {
        connectedUserIds.add(connection.requesterId);
      }
      if (connection.recipientId !== userId) {
        connectedUserIds.add(connection.recipientId);
      }
    });
    
    // Get activities for the user and their connections
    let relevantActivities = Array.from(this.activities.values()).filter(activity => {
      // Include activities from the user and their connections
      return activity.userId === userId || connectedUserIds.has(activity.userId);
    });
    
    // Sort activities by date (newest first)
    relevantActivities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Limit the number of activities
    relevantActivities = relevantActivities.slice(0, limit);
    
    // Transform activities to the format expected by the frontend
    return Promise.all(relevantActivities.map(async activity => {
      const user = await this.getUser(activity.userId);
      
      if (!user) {
        throw new Error(`User with ID ${activity.userId} not found`);
      }
      
      // Map the activity type to the frontend's SocialActivityType
      let type: string = activity.type;
      if (activity.type === 'connection_request_sent') type = 'connection_request';
      if (activity.type === 'connection_accepted') type = 'connection_accepted';
      if (activity.type.includes('match')) type = 'match_played';
      if (activity.type.includes('tournament')) type = 'tournament_joined';
      if (activity.type.includes('achievement')) type = 'achievement_unlocked';
      
      // Create activity object with the format expected by the frontend
      return {
        id: activity.id,
        type,
        createdAt: activity.createdAt.toISOString(),
        actors: [{
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          avatarInitials: user.avatarInitials
        }],
        contextData: activity.metadata || {}
      };
    }));
  }
  
  async getConnectionStats(userId: number): Promise<{total: number, byType: Record<string, number>}> {
    const acceptedConnections = Array.from(this.connections.values()).filter(
      connection => 
        (connection.requesterId === userId || connection.recipientId === userId) &&
        connection.status === 'accepted'
    );
    
    const total = acceptedConnections.length;
    
    // Count connections by type
    const byType: Record<string, number> = {};
    acceptedConnections.forEach(connection => {
      const type = connection.type;
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return { total, byType };
  }
  
  // Dashboard statistics methods
  async getUserCount(): Promise<number> {
    return this.users.size;
  }
  
  async getActiveUserCount(): Promise<number> {
    // Get users active in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return Array.from(this.users.values()).filter(user => {
      return (
        (user.lastLoginAt && new Date(user.lastLoginAt) > thirtyDaysAgo) || 
        (user.lastMatchDate && new Date(user.lastMatchDate) > thirtyDaysAgo)
      );
    }).length;
  }
  
  async getActiveRedemptionCodesCount(): Promise<number> {
    // Count active redemption codes that haven't expired
    const now = new Date();
    
    return Array.from(this.redemptionCodes.values()).filter(code => {
      return (
        code.isActive && 
        (!code.expiresAt || new Date(code.expiresAt) > now)
      );
    }).length;
  }
  
  async getRecentlyRedeemedCodes(limit: number = 5): Promise<{code: RedemptionCode, user: User, redeemedAt: Date}[]> {
    // Get recently redeemed codes with user info
    const redemptions = Array.from(this.userRedemptions.values())
      .sort((a, b) => {
        // Sort by redeemedAt date descending (most recent first)
        const dateA = a.redeemedAt || new Date(0);
        const dateB = b.redeemedAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
    
    return redemptions.map(redemption => {
      const code = this.redemptionCodes.get(redemption.codeId)!;
      const user = this.users.get(redemption.userId)!;
      return {
        code,
        user,
        redeemedAt: redemption.redeemedAt || new Date()
      };
    });
  }
  
  async getTotalXpAwarded(): Promise<number> {
    // Calculate total XP awarded from redemption codes
    return Array.from(this.redemptionCodes.values()).reduce((total, code) => {
      const timesRedeemed = code.currentRedemptions || 0;
      return total + (code.xpReward * timesRedeemed);
    }, 0);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }
  
  async getActiveUserCount(): Promise<number> {
    // Get users active in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        or(
          // Active if they've logged in recently
          sql`${users.lastLoginAt} > ${thirtyDaysAgo}`,
          // Or if they've played a match recently
          sql`${users.lastMatchDate} > ${thirtyDaysAgo}`
        )
      );
    
    return result[0].count;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )
    );
    return user;
  }
  
  async getUserByPassportId(passportId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passportId, passportId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserXP(id: number, xpToAdd: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    
    // Apply XP multiplier if the user is a founding member
    let finalXpToAdd = xpToAdd;
    if (user.isFoundingMember && user.xpMultiplier) {
      // xpMultiplier is stored as a percentage (e.g., 110 for 1.1x)
      finalXpToAdd = Math.floor(xpToAdd * (user.xpMultiplier / 100));
      console.log(`[XP] User ${id} is a founding member with multiplier ${user.xpMultiplier}%. Adding ${finalXpToAdd}XP instead of ${xpToAdd}XP`);
    }
    
    // Calculate new XP and level
    const newXP = currentXP + finalXpToAdd;
    
    // Simple level calculation: level up for every 1000 XP
    const xpPerLevel = 1000;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;

    const [updatedUser] = await db.update(users)
      .set({ 
        xp: newXP,
        level: newLevel 
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async searchUsers(query: string, excludeUserId?: number): Promise<User[]> {
    // Convert query to lowercase for case-insensitive search with SQL ILIKE
    const searchPattern = `%${query}%`;
    
    // Create the base query
    let usersQuery = db.select().from(users)
      .where(
        or(
          sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(${users.displayName}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(${users.email}) LIKE LOWER(${searchPattern})`
        )
      );
    
    // Add exclusion of current user if provided
    if (excludeUserId) {
      usersQuery = usersQuery.where(sql`${users.id} <> ${excludeUserId}`);
    }
    
    // Execute query with limit
    const results = await usersQuery.limit(10);
    return results;
  }

  // Profile operations
  async updateUserProfile(userId: number, profileData: any): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Record the profile update time
    const profileLastUpdated = new Date();
    
    // Update the user with profile data
    const [updatedUser] = await db.update(users)
      .set({
        ...profileData,
        profileLastUpdated
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Calculate the new profile completion percentage
    const completionPct = await this.calculateProfileCompletion(userId);
    
    // Update profile completion if it changed
    if (completionPct !== (user.profileCompletionPct || 0)) {
      const [finalUser] = await db.update(users)
        .set({
          profileCompletionPct: completionPct
        })
        .where(eq(users.id, userId))
        .returning();
      
      return finalUser;
    }
    
    return updatedUser;
  }
  
  async calculateProfileCompletion(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    // Define the fields that contribute to profile completion
    const profileFields = [
      'bio', 'location', 'skillLevel', 'playingSince', 
      'preferredPosition', 'paddleBrand', 'paddleModel', 
      'playingStyle', 'shotStrengths', 'preferredFormat', 
      'dominantHand', 'regularSchedule', 'lookingForPartners',
      'partnerPreferences', 'playerGoals', 'coach', 'clubs',
      'leagues', 'socialHandles', 'mobilityLimitations',
      'preferredMatchDuration', 'fitnessLevel'
    ];
    
    // Count how many fields are completed
    let completedFields = 0;
    for (const field of profileFields) {
      const value = user[field as keyof User];
      if (value !== undefined && value !== null && value !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof value === 'object' && !Array.isArray(value)) {
          const obj = value as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedFields++;
          }
        } else {
          completedFields++;
        }
      }
    }
    
    // Calculate percentage (0-100)
    return Math.round((completedFields / profileFields.length) * 100);
  }
  
  async updateProfileCompletionPercentage(userId: number, percentage: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ 
        profileCompletionPct: percentage 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async getCompletedProfileFields(userId: number): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Define the fields that contribute to profile completion
    const profileFields = [
      'bio', 'location', 'skillLevel', 'playingSince', 
      'preferredPosition', 'paddleBrand', 'paddleModel', 
      'playingStyle', 'shotStrengths', 'preferredFormat', 
      'dominantHand', 'regularSchedule', 'lookingForPartners',
      'partnerPreferences', 'playerGoals', 'coach', 'clubs',
      'leagues', 'socialHandles', 'mobilityLimitations',
      'preferredMatchDuration', 'fitnessLevel'
    ];
    
    // Check which fields are completed
    const completedFields: string[] = [];
    for (const field of profileFields) {
      const value = user[field as keyof User];
      if (value !== undefined && value !== null && value !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof value === 'object' && !Array.isArray(value)) {
          const obj = value as Record<string, any>;
          if (Object.keys(obj).length > 0) {
            completedFields.push(field);
          }
        } else {
          completedFields.push(field);
        }
      }
    }
    
    return completedFields;
  }

  // Tournament operations
  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db.insert(tournaments).values(insertTournament).returning();
    return tournament;
  }

  // Tournament registration operations
  async registerForTournament(insertRegistration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const [registration] = await db.insert(tournamentRegistrations)
      .values({
        ...insertRegistration,
        checkedIn: false
      })
      .returning();
    return registration;
  }

  async getTournamentRegistration(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined> {
    const [registration] = await db.select()
      .from(tournamentRegistrations)
      .where(
        and(
          eq(tournamentRegistrations.userId, userId),
          eq(tournamentRegistrations.tournamentId, tournamentId)
        )
      );
    return registration;
  }

  async getUserTournaments(userId: number): Promise<{tournament: Tournament, registration: TournamentRegistration}[]> {
    const results = await db.select({
      tournament: tournaments,
      registration: tournamentRegistrations
    })
    .from(tournamentRegistrations)
    .innerJoin(tournaments, eq(tournamentRegistrations.tournamentId, tournaments.id))
    .where(eq(tournamentRegistrations.userId, userId));
    
    return results;
  }

  async checkInUserForTournament(userId: number, tournamentId: number): Promise<TournamentRegistration | undefined> {
    const [registration] = await db.update(tournamentRegistrations)
      .set({ checkedIn: true })
      .where(
        and(
          eq(tournamentRegistrations.userId, userId),
          eq(tournamentRegistrations.tournamentId, tournamentId)
        )
      )
      .returning();
    return registration;
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<{achievement: Achievement, userAchievement: UserAchievement}[]> {
    const results = await db.select({
      achievement: achievements,
      userAchievement: userAchievements
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
    
    return results;
  }

  async unlockAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db.insert(userAchievements)
      .values(insertUserAchievement)
      .returning();
    return userAchievement;
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const userActivities = await db.select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    
    return userActivities;
  }

  // Redemption code operations
  async getRedemptionCodeByCode(code: string): Promise<RedemptionCode | undefined> {
    try {
      // Make the code lookup case-insensitive by converting both sides to uppercase
      // Explicitly select only columns that exist in the database
      const [redemptionCode] = await db.select({
        id: redemptionCodes.id,
        code: redemptionCodes.code,
        xpReward: redemptionCodes.xpReward,
        description: redemptionCodes.description,
        isActive: redemptionCodes.isActive,
        expiresAt: redemptionCodes.expiresAt,
        isFoundingMemberCode: redemptionCodes.isFoundingMemberCode,
        maxRedemptions: redemptionCodes.maxRedemptions,
        currentRedemptions: redemptionCodes.currentRedemptions
      })
      .from(redemptionCodes)
      .where(sql`UPPER(${redemptionCodes.code}) = UPPER(${code})`);

      if (!redemptionCode) return undefined;
      
      // Then check if it's active and not expired
      if (!redemptionCode.isActive) return undefined;
      
      // If there's an expiry date, check if it's in the future
      if (redemptionCode.expiresAt) {
        const now = new Date();
        if (redemptionCode.expiresAt < now) return undefined;
      }
      
      // Add default values for missing fields to make it match the schema
      const completeRedemptionCode = {
        ...redemptionCode,
        isCoachAccessCode: false, // Default value
        codeType: "xp" // Default value
      };
      
      return completeRedemptionCode as RedemptionCode;
    } catch (error) {
      console.error('[getRedemptionCodeByCode] Error:', error);
      return undefined;
    }
  }
  
  async getAllRedemptionCodes(): Promise<RedemptionCode[]> {
    try {
      const allCodes = await db.select({
        id: redemptionCodes.id,
        code: redemptionCodes.code,
        xpReward: redemptionCodes.xpReward,
        description: redemptionCodes.description,
        isActive: redemptionCodes.isActive,
        expiresAt: redemptionCodes.expiresAt,
        isFoundingMemberCode: redemptionCodes.isFoundingMemberCode,
        isCoachAccessCode: redemptionCodes.isCoachAccessCode,
        codeType: redemptionCodes.codeType,
        maxRedemptions: redemptionCodes.maxRedemptions,
        currentRedemptions: redemptionCodes.currentRedemptions
      })
      .from(redemptionCodes)
      .orderBy(desc(redemptionCodes.id));
      
      return allCodes.map(code => {
        // Ensure all codes have proper defaults for any missing fields
        return {
          ...code,
          isCoachAccessCode: code.isCoachAccessCode || false,
          codeType: code.codeType || "xp"
        } as RedemptionCode;
      });
    } catch (error) {
      console.error('[getAllRedemptionCodes] Error:', error);
      return [];
    }
  }

  async createRedemptionCode(insertRedemptionCode: InsertRedemptionCode): Promise<RedemptionCode> {
    const [redemptionCode] = await db.insert(redemptionCodes)
      .values(insertRedemptionCode)
      .returning();
    return redemptionCode;
  }

  async redeemCode(insertUserRedemption: InsertUserRedemption): Promise<UserRedemption> {
    const [userRedemption] = await db.insert(userRedemptions)
      .values(insertUserRedemption)
      .returning();
    return userRedemption;
  }

  async hasUserRedeemedCode(userId: number, codeId: number): Promise<boolean> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(userRedemptions)
      .where(
        and(
          eq(userRedemptions.userId, userId),
          eq(userRedemptions.codeId, codeId)
        )
      );
    return result.count > 0;
  }
  
  async incrementRedemptionCodeCounter(codeId: number): Promise<RedemptionCode | undefined> {
    try {
      // Get current counter value
      const [redemptionCode] = await db.select({
        id: redemptionCodes.id,
        currentRedemptions: redemptionCodes.currentRedemptions
      })
        .from(redemptionCodes)
        .where(eq(redemptionCodes.id, codeId));
      
      if (!redemptionCode) return undefined;
      
      // Increment the counter
      const currentRedemptions = (redemptionCode.currentRedemptions || 0) + 1;
      
      // Update the code and return all fields
      const [updatedCode] = await db.update(redemptionCodes)
        .set({ currentRedemptions })
        .where(eq(redemptionCodes.id, codeId))
        .returning();
      
      if (!updatedCode) return undefined;
      
      return updatedCode;
    } catch (error) {
      console.error('[incrementRedemptionCodeCounter] Error:', error);
      return undefined;
    }
  }
  
  async getRedemptionCode(id: number): Promise<RedemptionCode | undefined> {
    try {
      const [redemptionCode] = await db.select()
        .from(redemptionCodes)
        .where(eq(redemptionCodes.id, id));
      
      return redemptionCode;
    } catch (error) {
      console.error('[getRedemptionCode] Error:', error);
      return undefined;
    }
  }
  
  async updateRedemptionCode(id: number, updates: Partial<InsertRedemptionCode>): Promise<RedemptionCode | undefined> {
    try {
      const [updatedCode] = await db.update(redemptionCodes)
        .set(updates)
        .where(eq(redemptionCodes.id, id))
        .returning();
      
      return updatedCode;
    } catch (error) {
      console.error('[updateRedemptionCode] Error:', error);
      return undefined;
    }
  }
  
  async deleteRedemptionCode(id: number): Promise<boolean> {
    try {
      // First check if there are any redemptions for this code
      const [usageResult] = await db.select({ count: sql<number>`count(*)` })
        .from(userRedemptions)
        .where(eq(userRedemptions.codeId, id));
      
      if (usageResult.count > 0) {
        // If code has been used, just mark it as inactive instead of deleting
        await db.update(redemptionCodes)
          .set({ isActive: false })
          .where(eq(redemptionCodes.id, id));
          
        return true;
      }
      
      // If no redemptions, we can safely delete the code
      const result = await db.delete(redemptionCodes)
        .where(eq(redemptionCodes.id, id));
      
      return true;
    } catch (error) {
      console.error('[deleteRedemptionCode] Error:', error);
      return false;
    }
  }
  
  async hasUserRedeemedCode(userId: number, codeId: number): Promise<boolean> {
    try {
      const [redemption] = await db.select()
        .from(userRedemptions)
        .where(
          and(
            eq(userRedemptions.userId, userId),
            eq(userRedemptions.codeId, codeId)
          )
        );
      
      return !!redemption;
    } catch (error) {
      console.error('[hasUserRedeemedCode] Error:', error);
      return false;
    }
  }
  
  async updateUserRedemption(userId: number, codeId: number, updates: Partial<UserRedemption>): Promise<UserRedemption | undefined> {
    try {
      const [updatedRedemption] = await db.update(userRedemptions)
        .set(updates)
        .where(
          and(
            eq(userRedemptions.userId, userId),
            eq(userRedemptions.codeId, codeId)
          )
        )
        .returning();
      
      return updatedRedemption;
    } catch (error) {
      console.error('[updateUserRedemption] Error:', error);
      return undefined;
    }
  }
  
  async incrementRedemptionCodeCounter(codeId: number): Promise<RedemptionCode | undefined> {
    try {
      const [code] = await db.select().from(redemptionCodes).where(eq(redemptionCodes.id, codeId));
      
      if (!code) return undefined;
      
      // Increment the current redemptions counter
      const currentRedemptions = (code.currentRedemptions || 0) + 1;
      
      const [updatedCode] = await db.update(redemptionCodes)
        .set({ currentRedemptions })
        .where(eq(redemptionCodes.id, codeId))
        .returning();
      
      return updatedCode;
    } catch (error) {
      console.error('[incrementRedemptionCodeCounter] Error:', error);
      return undefined;
    }
  }

  // Match operations
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    
    // Update user stats for player 1
    const player1 = await this.getUser(match.playerOneId);
    if (player1) {
      const totalMatches = (player1.totalMatches || 0) + 1;
      const matchesWon = (player1.matchesWon || 0) + (match.winnerId === player1.id ? 1 : 0);
      await this.updateUser(player1.id, { 
        totalMatches, 
        matchesWon,
        lastMatchDate: new Date()
      });
    }
    
    // Update user stats for player 2
    const player2 = await this.getUser(match.playerTwoId);
    if (player2) {
      const totalMatches = (player2.totalMatches || 0) + 1;
      const matchesWon = (player2.matchesWon || 0) + (match.winnerId === player2.id ? 1 : 0);
      await this.updateUser(player2.id, { 
        totalMatches, 
        matchesWon,
        lastMatchDate: new Date()
      });
    }
    
    return match;
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getUserMatches(userId: number, limit: number = 10): Promise<Match[]> {
    const userMatches = await db.select()
      .from(matches)
      .where(
        or(
          eq(matches.playerOneId, userId),
          eq(matches.playerTwoId, userId)
        )
      )
      .orderBy(desc(matches.matchDate))
      .limit(limit);
    
    return userMatches;
  }
  
  // Ranking operations
  async updateUserRankingPoints(userId: number, pointsToAdd: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentPoints = user.rankingPoints || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    const [updatedUser] = await db.update(users)
      .set({ rankingPoints: newPoints })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async recordRankingChange(insertRankingHistory: InsertRankingHistory): Promise<RankingHistory> {
    const [rankingHistoryRecord] = await db.insert(rankingHistory)
      .values(insertRankingHistory)
      .returning();
    
    return rankingHistoryRecord;
  }
  
  async getUserRankingHistory(userId: number, limit: number = 10): Promise<RankingHistory[]> {
    const history = await db.select()
      .from(rankingHistory)
      .where(eq(rankingHistory.userId, userId))
      .orderBy(desc(rankingHistory.createdAt))
      .limit(limit);
    
    return history;
  }

  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    const leaderboard = await db.select()
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);
    return leaderboard;
  }
  
  async getRankingLeaderboard(limit: number = 10): Promise<User[]> {
    const rankingLeaderboard = await db.select()
      .from(users)
      .orderBy(desc(users.rankingPoints))
      .limit(limit);
    return rankingLeaderboard;
  }
  
  // Coaching profile operations
  async getCoachingProfile(userId: number): Promise<CoachingProfile | undefined> {
    const [profile] = await db.select()
      .from(coachingProfiles)
      .where(eq(coachingProfiles.userId, userId));
    return profile;
  }

  async createCoachingProfile(insertProfile: InsertCoachingProfile): Promise<CoachingProfile> {
    const now = new Date();
    const defaultedProfile = {
      ...insertProfile,
      createdAt: now,
      isActive: insertProfile.isActive ?? false,
      accessGrantedAt: insertProfile.accessGrantedAt || now,
      isPCPCertified: insertProfile.isPCPCertified ?? false,
      isAdminVerified: insertProfile.isAdminVerified ?? false
    };
    
    const [profile] = await db.insert(coachingProfiles)
      .values(defaultedProfile)
      .returning();
    return profile;
  }

  async updateCoachingProfile(userId: number, updates: Partial<InsertCoachingProfile>): Promise<CoachingProfile | undefined> {
    const [updatedProfile] = await db.update(coachingProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(coachingProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getCoachingProfiles(limit: number = 10, offset: number = 0): Promise<CoachingProfile[]> {
    return await db.select()
      .from(coachingProfiles)
      .where(eq(coachingProfiles.isActive, true))
      .orderBy(
        desc(coachingProfiles.isAdminVerified),
        desc(coachingProfiles.isPCPCertified),
        desc(coachingProfiles.createdAt)
      )
      .limit(limit)
      .offset(offset);
  }

  async getVerifiedCoachingProfiles(limit: number = 10, offset: number = 0): Promise<CoachingProfile[]> {
    return await db.select()
      .from(coachingProfiles)
      .where(
        and(
          eq(coachingProfiles.isActive, true),
          eq(coachingProfiles.isAdminVerified, true)
        )
      )
      .orderBy(
        desc(coachingProfiles.isPCPCertified),
        desc(coachingProfiles.createdAt)
      )
      .limit(limit)
      .offset(offset);
  }

  async setPCPCertification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined> {
    const now = new Date();
    const [updatedProfile] = await db.update(coachingProfiles)
      .set({ 
        isPCPCertified: isVerified,
        updatedAt: now
      })
      .where(eq(coachingProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async setCoachingProfileActive(userId: number, isActive: boolean): Promise<CoachingProfile | undefined> {
    const now = new Date();
    const [updatedProfile] = await db.update(coachingProfiles)
      .set({ 
        isActive,
        updatedAt: now
      })
      .where(eq(coachingProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  async setAdminVerification(userId: number, isVerified: boolean): Promise<CoachingProfile | undefined> {
    const now = new Date();
    const [updatedProfile] = await db.update(coachingProfiles)
      .set({ 
        isAdminVerified: isVerified,
        updatedAt: now
      })
      .where(eq(coachingProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Connection operations (social features)
  async createConnection(connection: InsertConnection): Promise<Connection> {
    const [createdConnection] = await db.insert(connections)
      .values({
        ...connection,
        requestedAt: new Date()
      })
      .returning();
    
    return createdConnection;
  }
  
  async getConnection(id: number): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection;
  }
  
  async updateConnectionStatus(id: number, status: string, endDate?: Date): Promise<Connection | undefined> {
    const now = new Date();
    const updates: any = { status };
    
    // Set the appropriate timestamp based on status
    if (status === 'accepted') {
      updates.acceptedAt = now;
    } else if (status === 'declined') {
      updates.declinedAt = now;
    } else if (status === 'ended') {
      updates.endedAt = now;
      updates.endDate = endDate || now;
    }
    
    const [updatedConnection] = await db.update(connections)
      .set(updates)
      .where(eq(connections.id, id))
      .returning();
    
    return updatedConnection;
  }
  
  async getUserSentConnections(userId: number, type?: string, status?: string): Promise<Connection[]> {
    let query = db.select().from(connections).where(eq(connections.requesterId, userId));
    
    // Apply optional filters
    if (type) {
      query = query.where(eq(connections.type, type));
    }
    
    if (status) {
      query = query.where(eq(connections.status, status));
    }
    
    // Sort by most recent first
    query = query.orderBy(desc(connections.createdAt));
    
    return await query;
  }
  
  async getUserReceivedConnections(userId: number, type?: string, status?: string): Promise<Connection[]> {
    let query = db.select().from(connections).where(eq(connections.recipientId, userId));
    
    // Apply optional filters
    if (type) {
      query = query.where(eq(connections.type, type));
    }
    
    if (status) {
      query = query.where(eq(connections.status, status));
    }
    
    // Sort by most recent first
    query = query.orderBy(desc(connections.createdAt));
    
    return await query;
  }
  
  async getActiveCoachingConnections(userId: number): Promise<{connection: Connection, user: User}[]> {
    const activeConnections = await db.select({
      connection: connections,
      user: users
    })
    .from(connections)
    .where(
      and(
        eq(connections.type, 'coach'),
        eq(connections.status, 'accepted'),
        or(
          eq(connections.requesterId, userId),
          eq(connections.recipientId, userId)
        )
      )
    )
    .innerJoin(
      users,
      or(
        and(
          eq(connections.requesterId, userId),
          eq(connections.recipientId, users.id)
        ),
        and(
          eq(connections.recipientId, userId),
          eq(connections.requesterId, users.id)
        )
      )
    );
    
    return activeConnections;
  }
  
  async getConnectionByUsers(requesterId: number, recipientId: number, type: string): Promise<Connection | undefined> {
    const [connection] = await db.select()
      .from(connections)
      .where(
        and(
          eq(connections.requesterId, requesterId),
          eq(connections.recipientId, recipientId),
          eq(connections.type, type)
        )
      );
    
    return connection;
  }

  // Social features implementation
  async getSocialActivityFeed(userId: number, limit: number = 10): Promise<any[]> {
    // First, get all connections for this user
    const sentConnections = await this.getUserSentConnections(userId);
    const receivedConnections = await this.getUserReceivedConnections(userId);
    const allConnections = [...sentConnections, ...receivedConnections];
    
    // Get the IDs of users this person is connected with
    const connectedUserIds = new Set<number>();
    allConnections.forEach(connection => {
      if (connection.requesterId !== userId) {
        connectedUserIds.add(connection.requesterId);
      }
      if (connection.recipientId !== userId) {
        connectedUserIds.add(connection.recipientId);
      }
    });
    
    // Add the user's own ID to include their activities as well
    connectedUserIds.add(userId);
    
    // Convert Set to array for the SQL query
    const userIdsArray = Array.from(connectedUserIds);
    
    // Get activities for the user and their connections
    const relevantActivities = await db.select()
      .from(activities)
      .where(sql`${activities.userId} IN (${sql.join(userIdsArray, sql`, `)})`)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    
    // Transform activities to the format expected by the frontend
    const activityPromises = relevantActivities.map(async activity => {
      const user = await this.getUser(activity.userId);
      
      if (!user) {
        throw new Error(`User with ID ${activity.userId} not found`);
      }
      
      // Map the activity type to the frontend's SocialActivityType
      let type: string = activity.type;
      if (activity.type === 'connection_request_sent') type = 'connection_request';
      if (activity.type === 'connection_accepted') type = 'connection_accepted';
      if (activity.type.includes('match')) type = 'match_played';
      if (activity.type.includes('tournament')) type = 'tournament_joined';
      if (activity.type.includes('achievement')) type = 'achievement_unlocked';
      
      // Create activity object with the format expected by the frontend
      return {
        id: activity.id,
        type,
        createdAt: activity.createdAt.toISOString(),
        actors: [{
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          avatarInitials: user.avatarInitials
        }],
        contextData: activity.metadata || {}
      };
    });
    
    return Promise.all(activityPromises);
  }
  
  async getConnectionStats(userId: number): Promise<{total: number, byType: Record<string, number>}> {
    // Get all accepted connections for this user
    const acceptedConnections = await db.select()
      .from(connections)
      .where(
        and(
          or(
            eq(connections.requesterId, userId),
            eq(connections.recipientId, userId)
          ),
          eq(connections.status, 'accepted')
        )
      );
    
    const total = acceptedConnections.length;
    
    // Count connections by type
    const byType: Record<string, number> = {};
    acceptedConnections.forEach(connection => {
      const type = connection.type;
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return { total, byType };
  }
}

// Initialize sample data
async function initSampleData() {
  const achievementsCount = await db.select({ count: sql<number>`count(*)` }).from(achievements);
  if (achievementsCount[0].count === 0) {
    // Sample achievements
    const sampleAchievements: InsertAchievement[] = [
      {
        name: "Dink Master",
        description: "50 successful dinks",
        xpReward: 100,
        imageUrl: "dink_master.svg",
        category: "skill",
        requirement: 50
      },
      {
        name: "Tournament Finalist",
        description: "Reached final round",
        xpReward: 250,
        imageUrl: "tournament_finalist.svg",
        category: "tournament",
        requirement: 1
      },
      {
        name: "Social Butterfly",
        description: "Play with 10+ players",
        xpReward: 150,
        imageUrl: "social_butterfly.svg",
        category: "social",
        requirement: 10
      },
      {
        name: "Champion",
        description: "Win a tournament",
        xpReward: 500,
        imageUrl: "champion.svg",
        category: "tournament",
        requirement: 1
      },
      {
        name: "Match Maker",
        description: "Play 25 matches",
        xpReward: 200,
        imageUrl: "match_maker.svg",
        category: "matches",
        requirement: 25
      }
    ];
    
    await db.insert(achievements).values(sampleAchievements);
  }
  
  const redemptionCodesCount = await db.select({ count: sql<number>`count(*)` }).from(redemptionCodes);
  if (redemptionCodesCount[0].count === 0) {
    // Sample redemption codes
    const sampleCodes: InsertRedemptionCode[] = [
      {
        code: "WELCOME2023",
        xpReward: 100,
        description: "Welcome bonus for new players",
        isActive: true,
        expiresAt: new Date(2024, 11, 31)
      },
      {
        code: "SUMMERSLAM",
        xpReward: 250,
        description: "Summer Tournament special code",
        isActive: true,
        expiresAt: new Date(2023, 8, 30)
      }
    ];
    
    await db.insert(redemptionCodes).values(sampleCodes);
  }
  
  const tournamentsCount = await db.select({ count: sql<number>`count(*)` }).from(tournaments);
  if (tournamentsCount[0].count === 0) {
    // Sample tournament
    const now = new Date();
    const sampleTournament: InsertTournament = {
      name: "Spring Championship 2023",
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 16),
      location: "Central Park Courts",
      description: "Annual spring championship with singles and doubles categories",
      imageUrl: "spring_championship.svg"
    };
    
    await db.insert(tournaments).values(sampleTournament);
  }
  
  // Dashboard statistics methods
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }
  
  async getActiveUserCount(): Promise<number> {
    // Get users active in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        or(
          // Active if they've logged in recently
          sql`${users.lastLoginAt} > ${thirtyDaysAgo}`,
          // Or if they've played a match recently
          sql`${users.lastMatchDate} > ${thirtyDaysAgo}`
        )
      );
    
    return result[0].count;
  }
  
  async getActiveRedemptionCodesCount(): Promise<number> {
    // Count active redemption codes that haven't expired
    const now = new Date();
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(redemptionCodes)
      .where(
        and(
          eq(redemptionCodes.isActive, true),
          or(
            sql`${redemptionCodes.expiresAt} IS NULL`,
            sql`${redemptionCodes.expiresAt} > ${now}`
          )
        )
      );
    
    return result[0].count;
  }
  
  async getRecentlyRedeemedCodes(limit: number = 5): Promise<{code: RedemptionCode, user: User, redeemedAt: Date}[]> {
    // Get recently redeemed codes with user info
    const result = await db.select({
      code: redemptionCodes,
      user: users,
      redeemedAt: userRedemptions.redeemedAt
    })
    .from(userRedemptions)
    .innerJoin(redemptionCodes, eq(userRedemptions.codeId, redemptionCodes.id))
    .innerJoin(users, eq(userRedemptions.userId, users.id))
    .orderBy(desc(userRedemptions.redeemedAt))
    .limit(limit);
    
    return result.map(item => ({
      code: item.code,
      user: item.user,
      redeemedAt: item.redeemedAt || new Date() // Fallback in case redeemedAt is null
    }));
  }
  
  async getTotalXpAwarded(): Promise<number> {
    // Calculate total XP awarded from redemption codes
    const result = await db.select({
      total: sql<number>`COALESCE(SUM(${redemptionCodes.xpReward} * ${redemptionCodes.currentRedemptions}), 0)`
    })
    .from(redemptionCodes);
    
    return result[0].total || 0;
  }
}

// Initialize the database with sample data
initSampleData().catch(console.error);

// Use database storage for the app
export const storage = new DatabaseStorage();
