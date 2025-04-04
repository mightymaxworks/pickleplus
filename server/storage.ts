import {
  users,
  tournaments,
  tournamentParticipants,
  matches,
  achievements,
  userAchievements,
  xpCodes,
  userCodeRedemptions,
  type User,
  type InsertUser,
  type Tournament,
  type InsertTournament,
  type TournamentParticipant,
  type InsertTournamentParticipant,
  type Match,
  type InsertMatch,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type XpCode,
  type InsertXpCode,
  type UserCodeRedemption,
  type InsertUserCodeRedemption
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPlayerId(playerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getTopUsers(limit: number): Promise<User[]>;

  // Tournament methods
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournament(id: number): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined>;

  // Tournament Participant methods
  registerUserForTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant>;
  getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]>;
  getUserTournaments(userId: number): Promise<{ tournament: Tournament, participant: TournamentParticipant }[]>;
  checkInUserToTournament(userId: number, tournamentId: number): Promise<TournamentParticipant | undefined>;

  // Match methods
  createMatch(match: InsertMatch): Promise<Match>;
  getUserMatches(userId: number): Promise<Match[]>;
  getRecentMatches(limit: number): Promise<Match[]>;

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<{ achievement: Achievement, userAchievement: UserAchievement }[]>;
  updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement>;
  completeUserAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  getRecentAchievements(userId: number, limit: number): Promise<{ achievement: Achievement, userAchievement: UserAchievement }[]>;

  // XP Code methods
  createXpCode(code: InsertXpCode): Promise<XpCode>;
  getXpCodeByCode(code: string): Promise<XpCode | undefined>;
  redeemXpCode(redemption: InsertUserCodeRedemption): Promise<UserCodeRedemption>;
  isCodeRedeemedByUser(userId: number, code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tournaments: Map<number, Tournament>;
  private tournamentParticipants: Map<number, TournamentParticipant>;
  private matches: Map<number, Match>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private xpCodes: Map<number, XpCode>;
  private userCodeRedemptions: Map<number, UserCodeRedemption>;
  
  private currentId: {
    users: number;
    tournaments: number;
    tournamentParticipants: number;
    matches: number;
    achievements: number;
    userAchievements: number;
    xpCodes: number;
    userCodeRedemptions: number;
  };

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.tournamentParticipants = new Map();
    this.matches = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.xpCodes = new Map();
    this.userCodeRedemptions = new Map();
    
    this.currentId = {
      users: 1,
      tournaments: 1,
      tournamentParticipants: 1,
      matches: 1,
      achievements: 1,
      userAchievements: 1,
      xpCodes: 1,
      userCodeRedemptions: 1
    };

    // Initialize with sample achievements
    this.initializeAchievements();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByPlayerId(playerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.playerId === playerId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const playerId = `PB-${nanoid(5).toUpperCase()}`;
    const user: User = { ...insertUser, id, playerId, totalMatches: 0, wins: 0, losses: 0 };
    this.users.set(id, user);
    
    // Create initial user achievements
    const allAchievements = await this.getAllAchievements();
    for (const achievement of allAchievements) {
      await this.updateUserAchievementProgress(id, achievement.id, 0);
    }
    
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getTopUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Tournament methods
  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.currentId.tournaments++;
    const tournament: Tournament = { ...insertTournament, id };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (!tournament) return undefined;
    
    const updatedTournament = { ...tournament, status };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  // Tournament Participant methods
  async registerUserForTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant> {
    const id = this.currentId.tournamentParticipants++;
    const participant: TournamentParticipant = { ...data, id };
    this.tournamentParticipants.set(id, participant);
    return participant;
  }

  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    return Array.from(this.tournamentParticipants.values())
      .filter(p => p.tournamentId === tournamentId);
  }

  async getUserTournaments(userId: number): Promise<{ tournament: Tournament, participant: TournamentParticipant }[]> {
    const userParticipations = Array.from(this.tournamentParticipants.values())
      .filter(p => p.userId === userId);
    
    const result = [];
    for (const participant of userParticipations) {
      const tournament = await this.getTournament(participant.tournamentId);
      if (tournament) {
        result.push({ tournament, participant });
      }
    }
    
    return result;
  }

  async checkInUserToTournament(userId: number, tournamentId: number): Promise<TournamentParticipant | undefined> {
    const participant = Array.from(this.tournamentParticipants.values())
      .find(p => p.userId === userId && p.tournamentId === tournamentId);
    
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, status: "checked-in" };
    this.tournamentParticipants.set(participant.id, updatedParticipant);
    return updatedParticipant;
  }

  // Match methods
  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentId.matches++;
    const match: Match = { ...insertMatch, id };
    this.matches.set(id, match);
    
    // Update user stats
    const winnerIds = match.winnerIds as number[];
    const loserIds = match.loserIds as number[];
    
    const allPlayerIds = [...winnerIds, ...loserIds];
    for (const playerId of allPlayerIds) {
      const user = await this.getUser(playerId);
      if (user) {
        const isWinner = winnerIds.includes(playerId);
        const updatedUser = {
          ...user,
          totalMatches: user.totalMatches + 1,
          wins: isWinner ? user.wins + 1 : user.wins,
          losses: !isWinner ? user.losses + 1 : user.losses,
          xp: user.xp + match.xpEarned,
        };
        
        // Update rating
        const ratingChange = match.ratingChange as Record<string, number>;
        if (ratingChange[playerId]) {
          updatedUser.rating += ratingChange[playerId];
        }
        
        this.users.set(playerId, updatedUser);
        
        // Check and update achievements
        await this.checkAndUpdateAchievements(playerId);
      }
    }
    
    return match;
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => {
        const players = [...(match.winnerIds as number[]), ...(match.loserIds as number[])];
        return players.includes(userId);
      })
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  }

  async getRecentMatches(limit: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, limit);
  }

  // Achievement methods
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId.achievements++;
    const achievement: Achievement = { ...insertAchievement, id };
    this.achievements.set(id, achievement);
    
    // Create user achievement entries for all users
    const allUsers = await this.getAllUsers();
    for (const user of allUsers) {
      await this.updateUserAchievementProgress(user.id, id, 0);
    }
    
    return achievement;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<{ achievement: Achievement, userAchievement: UserAchievement }[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    const result = [];
    for (const userAchievement of userAchievements) {
      const achievement = await this.achievements.get(userAchievement.achievementId);
      if (achievement) {
        result.push({ achievement, userAchievement });
      }
    }
    
    return result;
  }

  async updateUserAchievementProgress(userId: number, achievementId: number, progress: number): Promise<UserAchievement> {
    const existingUserAchievement = Array.from(this.userAchievements.values())
      .find(ua => ua.userId === userId && ua.achievementId === achievementId);
    
    if (existingUserAchievement) {
      const updatedUserAchievement = {
        ...existingUserAchievement,
        progress: progress,
      };
      this.userAchievements.set(existingUserAchievement.id, updatedUserAchievement);
      return updatedUserAchievement;
    } else {
      const id = this.currentId.userAchievements++;
      const userAchievement: UserAchievement = {
        id,
        userId,
        achievementId,
        progress,
        completed: false,
        completedDate: null,
      };
      this.userAchievements.set(id, userAchievement);
      return userAchievement;
    }
  }

  async completeUserAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const userAchievement = Array.from(this.userAchievements.values())
      .find(ua => ua.userId === userId && ua.achievementId === achievementId);
    
    if (!userAchievement) {
      throw new Error("User achievement not found");
    }
    
    const achievement = await this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error("Achievement not found");
    }
    
    // Update user achievement
    const now = new Date();
    const updatedUserAchievement = {
      ...userAchievement,
      completed: true,
      completedDate: now,
      progress: achievement.requiredValue,
    };
    this.userAchievements.set(userAchievement.id, updatedUserAchievement);
    
    // Add XP reward to user
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = {
        ...user,
        xp: user.xp + achievement.xpReward,
      };
      this.users.set(userId, updatedUser);
    }
    
    return updatedUserAchievement;
  }

  async getRecentAchievements(userId: number, limit: number): Promise<{ achievement: Achievement, userAchievement: UserAchievement }[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId && ua.completed)
      .sort((a, b) => {
        if (!a.completedDate || !b.completedDate) return 0;
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      })
      .slice(0, limit);
    
    const result = [];
    for (const userAchievement of userAchievements) {
      const achievement = await this.achievements.get(userAchievement.achievementId);
      if (achievement) {
        result.push({ achievement, userAchievement });
      }
    }
    
    return result;
  }

  // XP Code methods
  async createXpCode(insertXpCode: InsertXpCode): Promise<XpCode> {
    const id = this.currentId.xpCodes++;
    const xpCode: XpCode = { ...insertXpCode, id };
    this.xpCodes.set(id, xpCode);
    return xpCode;
  }

  async getXpCodeByCode(code: string): Promise<XpCode | undefined> {
    return Array.from(this.xpCodes.values())
      .find(xpCode => xpCode.code === code);
  }

  async redeemXpCode(insertRedemption: InsertUserCodeRedemption): Promise<UserCodeRedemption> {
    const id = this.currentId.userCodeRedemptions++;
    const redemption: UserCodeRedemption = { ...insertRedemption, id };
    this.userCodeRedemptions.set(id, redemption);
    
    // Mark code as used
    const xpCode = await this.xpCodes.get(redemption.codeId);
    if (xpCode) {
      const updatedXpCode = { ...xpCode, isUsed: true };
      this.xpCodes.set(xpCode.id, updatedXpCode);
      
      // Add XP to user
      const user = await this.getUser(redemption.userId);
      if (user) {
        const updatedUser = { ...user, xp: user.xp + xpCode.xpValue };
        this.users.set(user.id, updatedUser);
      }
    }
    
    return redemption;
  }

  async isCodeRedeemedByUser(userId: number, code: string): Promise<boolean> {
    const xpCode = await this.getXpCodeByCode(code);
    if (!xpCode) return false;
    
    return Array.from(this.userCodeRedemptions.values())
      .some(redemption => redemption.userId === userId && redemption.codeId === xpCode.id);
  }

  // Helper methods
  private async checkAndUpdateAchievements(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    const allAchievements = await this.getAllAchievements();
    const userMatches = await this.getUserMatches(userId);
    
    for (const achievement of allAchievements) {
      // Check different achievement types
      switch (achievement.category) {
        case 'matches':
          await this.updateUserAchievementProgress(userId, achievement.id, user.totalMatches);
          if (user.totalMatches >= achievement.requiredValue) {
            await this.completeUserAchievement(userId, achievement.id);
          }
          break;
        case 'wins':
          await this.updateUserAchievementProgress(userId, achievement.id, user.wins);
          if (user.wins >= achievement.requiredValue) {
            await this.completeUserAchievement(userId, achievement.id);
          }
          break;
        case 'streak':
          // Calculate current win streak
          let streak = 0;
          for (const match of userMatches) {
            const winnerIds = match.winnerIds as number[];
            if (winnerIds.includes(userId)) {
              streak++;
            } else {
              break;
            }
          }
          await this.updateUserAchievementProgress(userId, achievement.id, streak);
          if (streak >= achievement.requiredValue) {
            await this.completeUserAchievement(userId, achievement.id);
          }
          break;
        // Add more achievement types as needed
      }
    }
  }

  private async initializeAchievements(): Promise<void> {
    // Basic achievements
    await this.createAchievement({
      name: "Hot Streak",
      description: "Win 5 matches in a row",
      iconClass: "fas fa-fire",
      requiredValue: 5,
      category: "streak",
      xpReward: 100
    });
    
    await this.createAchievement({
      name: "Tournament Finalist",
      description: "Reach finals in any tournament",
      iconClass: "fas fa-trophy",
      requiredValue: 1,
      category: "tournament",
      xpReward: 150
    });
    
    await this.createAchievement({
      name: "Consistent Player",
      description: "Play 20 matches in 30 days",
      iconClass: "fas fa-calendar-check",
      requiredValue: 20,
      category: "matches",
      xpReward: 200
    });
    
    await this.createAchievement({
      name: "Social Butterfly",
      description: "Play with 10 different partners",
      iconClass: "fas fa-users",
      requiredValue: 10,
      category: "social",
      xpReward: 100
    });
  }
}

export const storage = new MemStorage();
