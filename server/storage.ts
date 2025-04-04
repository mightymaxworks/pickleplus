import {
  users, type User, type InsertUser,
  tournaments, type Tournament, type InsertTournament,
  tournamentRegistrations, type TournamentRegistration, type InsertTournamentRegistration,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  activities, type Activity, type InsertActivity,
  redemptionCodes, type RedemptionCode, type InsertRedemptionCode,
  userRedemptions, type UserRedemption, type InsertUserRedemption
} from "@shared/schema";

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
  
  // Leaderboard operations
  getLeaderboard(limit: number): Promise<User[]>;
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
  
  private userId: number;
  private tournamentId: number;
  private registrationId: number;
  private achievementId: number;
  private userAchievementId: number;
  private activityId: number;
  private redemptionCodeId: number;
  private userRedemptionId: number;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.tournamentRegistrations = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.activities = new Map();
    this.redemptionCodes = new Map();
    this.userRedemptions = new Map();
    
    this.userId = 1;
    this.tournamentId = 1;
    this.registrationId = 1;
    this.achievementId = 1;
    this.userAchievementId = 1;
    this.activityId = 1;
    this.redemptionCodeId = 1;
    this.userRedemptionId = 1;
    
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

  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
