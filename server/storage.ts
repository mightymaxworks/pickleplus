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
  rankingHistory, type RankingHistory, type InsertRankingHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined>;
  updateUserXP(id: number, xpToAdd: number): Promise<User | undefined>;
  
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
  createRedemptionCode(redemptionCode: InsertRedemptionCode): Promise<RedemptionCode>;
  redeemCode(userRedemption: InsertUserRedemption): Promise<UserRedemption>;
  hasUserRedeemedCode(userId: number, codeId: number): Promise<boolean>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Ensure the data types match the schema definition
    const user: User = { 
      ...insertUser,
      id,
      createdAt,
      location: insertUser.location || null,
      playingSince: insertUser.playingSince || null,
      skillLevel: insertUser.skillLevel || null,
      level: insertUser.level || 1,
      xp: insertUser.xp || 0,
      rankingPoints: insertUser.rankingPoints || 0,
      lastMatchDate: insertUser.lastMatchDate || null,
      totalMatches: insertUser.totalMatches || 0,
      matchesWon: insertUser.matchesWon || 0,
      totalTournaments: insertUser.totalTournaments || 0
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
    
    // Calculate new XP and level
    const newXP = currentXP + xpToAdd;
    
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
      notes: insertMatch.notes || null
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
    const xpPerLevel = 1000;
    const newXP = currentXP + xpToAdd;
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
    const now = new Date();
    const [redemptionCode] = await db.select()
      .from(redemptionCodes)
      .where(
        and(
          eq(redemptionCodes.code, code),
          eq(redemptionCodes.isActive, true),
          sql`${redemptionCodes.expiresAt} IS NULL OR ${redemptionCodes.expiresAt} > ${now}`
        )
      );
    return redemptionCode;
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
}

// Initialize the database with sample data
initSampleData().catch(console.error);

// Use database storage for the app
export const storage = new DatabaseStorage();
