import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  matches, type Match, type InsertMatch,
  tournaments,
  type XpTransaction, type InsertXpTransaction,
  activities, type InsertActivity
} from "@shared/schema";

import { generateUniquePassportCode } from './utils/passport-generator';
import { db } from "./db";
import { eq, desc, asc, and, or, gte, lte, count, sum, avg, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateUserProfile(id: number, profileData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // Profile completion tracking
  getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined>;
  updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking>;
  
  // Placeholder methods for build compatibility
  awardXpToUser(userId: number, amount: number, source: string): Promise<void>;
  createConciergeInteraction(data: any): Promise<any>;
  getConciergeInteractions(): Promise<any[]>;
  updateConciergeInteractionStatus(): Promise<void>;
  getUserCount(): Promise<number>;
  getMatchCount(): Promise<number>;
  getTournamentCount(): Promise<number>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getMatchStats(userId: number, timeRange?: string): Promise<any>;
  getPicklePoints(userId: number): Promise<number>;
  getTournamentParticipationByUser(userId: number): Promise<any[]>;
  createAuditLog(data: any): Promise<void>;
  
  // Training Center operations
  getTrainingCenterByQrCode(qrCode: string): Promise<any>;
  getActiveTrainingCenters(): Promise<any[]>;
  getAvailableCoach(centerId: number): Promise<any>;
  getActiveSessionForPlayer(playerId: number): Promise<any>;
  createCoachingSession(sessionData: any): Promise<any>;
  getCoachingSessionById(sessionId: number): Promise<any>;
  updateCoachingSession(sessionId: number, updateData: any): Promise<any>;
  getChallengesBySkillLevel(skillLevel: string): Promise<any[]>;
  getChallengeById(challengeId: number): Promise<any>;
  createChallengeCompletion(completionData: any): Promise<any>;
  awardPlayerBadge(badgeData: any): Promise<any>;
  getSessionSummary(sessionId: number): Promise<any>;
  getPlayerTrainingProgress(playerId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = { ...insertUser };
    if (!userData.passportCode) {
      userData.passportCode = await generateUniquePassportCode();
    }
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profileData: Partial<InsertUser>): Promise<User> {
    console.log(`[Storage] Updating profile for user ${id} with data:`, profileData);
    const [user] = await db.update(users)
      .set(profileData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    console.log(`[Storage] Profile updated successfully for user ${id}`);
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined> {
    return undefined; // Placeholder
  }

  async updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking> {
    return {} as ProfileCompletionTracking; // Placeholder
  }

  async awardXpToUser(userId: number, amount: number, source: string): Promise<void> {
    console.log('XP award placeholder:', userId, amount, source);
  }
  
  async createConciergeInteraction(data: any): Promise<any> {
    return { id: 1 };
  }
  
  async getConciergeInteractions(): Promise<any[]> {
    return [];
  }
  
  async updateConciergeInteractionStatus(): Promise<void> {}

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }

  async getMatchCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(matches);
    return result[0]?.count || 0;
  }

  async getTournamentCount(): Promise<number> {
    // Return placeholder count for tournaments
    return 0;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    const userMatches = await db.select()
      .from(matches)
      .where(or(eq(matches.playerOneId, userId), eq(matches.playerTwoId, userId)))
      .orderBy(desc(matches.createdAt))
      .limit(50);
    return userMatches;
  }

  async getMatchStats(userId: number, timeRange?: string): Promise<any> {
    const userMatches = await this.getMatchesByUser(userId);
    
    const totalMatches = userMatches.length;
    const matchesWon = userMatches.filter(match => match.winnerId === userId).length;
    const winRate = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;
    
    return {
      totalMatches,
      matchesWon,
      matchesLost: totalMatches - matchesWon,
      winRate: Math.round(winRate * 100) / 100,
      recentMatches: userMatches.slice(0, 5)
    };
  }

  async getPicklePoints(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.picklePoints || 0;
  }

  async getTournamentParticipationByUser(userId: number): Promise<any[]> {
    // Query tournament registrations for the user
    const registrations = await db.select()
      .from(tournaments)
      .where(sql`${tournaments.id} IN (
        SELECT tournament_id FROM tournament_registrations 
        WHERE user_id = ${userId}
      )`)
      .limit(50);
    
    return registrations.map(tournament => ({
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      division: tournament.division,
      format: tournament.format,
      startDate: tournament.startDate,
      level: tournament.level || 'local'
    }));
  }

  async createAuditLog(data: any): Promise<void> {
    console.log('Audit log entry:', data);
  }
}

export const storage = new DatabaseStorage();