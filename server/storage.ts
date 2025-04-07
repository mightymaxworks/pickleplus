import {
  users, type User, type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, or, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import { Store } from "express-session";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";

export interface IStorage {
  sessionStore: Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  getUserByPassportId(passportId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined>;
  updateUserXP(id: number, xpToAdd: number): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  searchUsers(query: string, excludeUserId?: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getUser called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] getUser called with valid ID: ${numericId}`);
      
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        displayName: users.displayName,
        yearOfBirth: users.yearOfBirth,
        passportId: users.passportId,
        location: users.location,
        playingSince: users.playingSince,
        skillLevel: users.skillLevel,
        level: users.level,
        xp: users.xp,
        rankingPoints: users.rankingPoints,
        lastMatchDate: users.lastMatchDate,
        avatarInitials: users.avatarInitials,
        totalMatches: users.totalMatches,
        matchesWon: users.matchesWon,
        totalTournaments: users.totalTournaments,
        isFoundingMember: users.isFoundingMember,
        isAdmin: users.isAdmin,
        xpMultiplier: users.xpMultiplier,
        bio: users.bio,
        preferredPosition: users.preferredPosition,
        paddleBrand: users.paddleBrand,
        paddleModel: users.paddleModel,
        playingStyle: users.playingStyle,
        shotStrengths: users.shotStrengths,
        preferredFormat: users.preferredFormat,
        dominantHand: users.dominantHand,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.id, numericId));
      
      // Add the missing fields that are expected in the User type
      if (user) {
        (user as any).avatarUrl = null;
        (user as any).profileCompletionPct = 0;
        (user as any).regularSchedule = null;
      }
      
      return user;
    } catch (error) {
      console.error('[Storage] getUser error:', error);
      return undefined;
    }
  }
  
  // Explicit implementation of getUserById for database storage
  async getUserById(id: number): Promise<User | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getUserById called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      // Delegate to the original getUser method
      return this.getUser(numericId);
    } catch (error) {
      console.error('[Storage] getUserById error:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Validate username parameter
      if (!username || typeof username !== 'string') {
        console.log(`[Storage] getUserByUsername called with invalid username: ${username}`);
        return undefined;
      }
      
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        displayName: users.displayName,
        yearOfBirth: users.yearOfBirth,
        passportId: users.passportId,
        location: users.location,
        playingSince: users.playingSince,
        skillLevel: users.skillLevel,
        level: users.level,
        xp: users.xp,
        rankingPoints: users.rankingPoints,
        lastMatchDate: users.lastMatchDate,
        avatarInitials: users.avatarInitials,
        totalMatches: users.totalMatches,
        matchesWon: users.matchesWon,
        totalTournaments: users.totalTournaments,
        isFoundingMember: users.isFoundingMember,
        isAdmin: users.isAdmin,
        xpMultiplier: users.xpMultiplier,
        bio: users.bio,
        preferredPosition: users.preferredPosition,
        paddleBrand: users.paddleBrand,
        paddleModel: users.paddleModel,
        playingStyle: users.playingStyle,
        shotStrengths: users.shotStrengths,
        preferredFormat: users.preferredFormat,
        dominantHand: users.dominantHand,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.username, username));
      
      // Add the missing fields that are expected in the User type
      if (user) {
        (user as any).avatarUrl = null;
        (user as any).profileCompletionPct = 0;
        (user as any).regularSchedule = null;
      }
      
      return user;
    } catch (error) {
      console.error('[Storage] getUserByUsername error:', error);
      return undefined;
    }
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        displayName: users.displayName,
        yearOfBirth: users.yearOfBirth,
        passportId: users.passportId,
        location: users.location,
        playingSince: users.playingSince,
        skillLevel: users.skillLevel,
        level: users.level,
        xp: users.xp,
        rankingPoints: users.rankingPoints,
        lastMatchDate: users.lastMatchDate,
        avatarInitials: users.avatarInitials,
        totalMatches: users.totalMatches,
        matchesWon: users.matchesWon,
        totalTournaments: users.totalTournaments,
        isFoundingMember: users.isFoundingMember,
        isAdmin: users.isAdmin,
        xpMultiplier: users.xpMultiplier,
        bio: users.bio,
        preferredPosition: users.preferredPosition,
        paddleBrand: users.paddleBrand,
        paddleModel: users.paddleModel,
        playingStyle: users.playingStyle,
        shotStrengths: users.shotStrengths,
        preferredFormat: users.preferredFormat,
        dominantHand: users.dominantHand,
        createdAt: users.createdAt,
      }).from(users).where(
        or(
          eq(users.username, identifier),
          eq(users.email, identifier)
        )
      );
      
      // Add the missing fields that are expected in the User type
      if (user) {
        (user as any).avatarUrl = null;
        (user as any).profileCompletionPct = 0;
        (user as any).regularSchedule = null;
      }
      
      return user;
    } catch (error) {
      console.error('[Storage] getUserByIdentifier error:', error);
      return undefined;
    }
  }
  
  async getUserByPassportId(passportId: string): Promise<User | undefined> {
    try {
      // Validate passportId is not empty or invalid
      if (!passportId || typeof passportId !== 'string' || passportId.trim() === '') {
        console.log(`[Storage] getUserByPassportId called with invalid passportId: ${passportId}`);
        return undefined;
      }
      
      console.log(`[Storage] getUserByPassportId called with passportId: ${passportId}`);
      
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        displayName: users.displayName,
        yearOfBirth: users.yearOfBirth,
        passportId: users.passportId,
        location: users.location,
        playingSince: users.playingSince,
        skillLevel: users.skillLevel,
        level: users.level,
        xp: users.xp,
        rankingPoints: users.rankingPoints,
        lastMatchDate: users.lastMatchDate,
        avatarInitials: users.avatarInitials,
        totalMatches: users.totalMatches,
        matchesWon: users.matchesWon,
        totalTournaments: users.totalTournaments,
        isFoundingMember: users.isFoundingMember,
        isAdmin: users.isAdmin,
        xpMultiplier: users.xpMultiplier,
        bio: users.bio,
        preferredPosition: users.preferredPosition,
        paddleBrand: users.paddleBrand,
        paddleModel: users.paddleModel,
        playingStyle: users.playingStyle,
        shotStrengths: users.shotStrengths,
        preferredFormat: users.preferredFormat,
        dominantHand: users.dominantHand,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.passportId, passportId));
      
      // Add the missing fields that are expected in the User type
      if (user) {
        (user as any).avatarUrl = null;
        (user as any).profileCompletionPct = 0;
        (user as any).regularSchedule = null;
      }
      
      return user;
    } catch (error) {
      console.error('[Storage] getUserByPassportId error:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateUser called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] updateUser called with valid ID: ${numericId}`);
      
      const [updatedUser] = await db.update(users)
        .set(update)
        .where(eq(users.id, numericId))
        .returning();
        
      return updatedUser;
    } catch (error) {
      console.error('[Storage] updateUser error:', error);
      return undefined;
    }
  }

  async updateUserXP(id: number, xpToAdd: number): Promise<User | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateUserXP called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] updateUserXP called with valid ID: ${numericId} and XP to add: ${xpToAdd}`);
      
      const user = await this.getUser(numericId);
      if (!user) {
        console.log(`[Storage] updateUserXP - User with ID ${numericId} not found`);
        return undefined;
      }

      const currentXP = user.xp || 0;
      const currentLevel = user.level || 1;
      
      // Apply XP multiplier if the user is a founding member
      let finalXpToAdd = xpToAdd;
      if (user.isFoundingMember && user.xpMultiplier) {
        // xpMultiplier is stored as a percentage (e.g., 110 for 1.1x)
        finalXpToAdd = Math.floor(xpToAdd * (user.xpMultiplier / 100));
        console.log(`[XP] User ${numericId} is a founding member with multiplier ${user.xpMultiplier}%. Adding ${finalXpToAdd}XP instead of ${xpToAdd}XP`);
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
        .where(eq(users.id, numericId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('[Storage] updateUserXP error:', error);
      return undefined;
    }
  }
  
  async getUserCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(users);
      return result[0].count;
    } catch (error) {
      console.error('[storage] getUserCount error:', error);
      return 0;
    }
  }
  
  async getActiveUserCount(): Promise<number> {
    try {
      // Get users active in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.lastMatchDate} > ${thirtyDaysAgo}`);
      
      return result[0].count;
    } catch (error) {
      console.error('[storage] getActiveUserCount error:', error);
      return 0;
    }
  }
  
  async searchUsers(query: string, excludeUserId?: number): Promise<User[]> {
    try {
      console.log("Storage searchUsers called with query:", query, "excludeUserId:", excludeUserId);
      
      // Input validation for query
      if (!query || typeof query !== 'string') {
        console.log("Invalid query:", query, "Returning empty array");
        return [];
      }
      
      // Check if excludeUserId is valid
      let numericExcludeId: number | undefined = undefined;
      if (excludeUserId !== undefined) {
        // Convert to number if it's a string
        numericExcludeId = (typeof excludeUserId === 'string') 
          ? Number(excludeUserId) 
          : Number(excludeUserId);
        
        // Validate it's a proper number
        if (isNaN(numericExcludeId) || !Number.isFinite(numericExcludeId) || numericExcludeId < 1) {
          console.log("Invalid excludeUserId:", excludeUserId, "converted to", numericExcludeId, "- Using no exclusion");
          numericExcludeId = undefined;
        } else {
          console.log("Valid excludeUserId:", numericExcludeId);
        }
      }
      
      // Convert query to lowercase for case-insensitive search with SQL ILIKE
      const searchPattern = `%${query}%`;
      console.log("Search pattern:", searchPattern);
      
      // Create the base query
      let queryBuilder = db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          passportId: users.passportId,
          avatarInitials: users.avatarInitials
        }).from(users);
        
      // Add the search condition
      queryBuilder = queryBuilder.where(
        or(
          sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.displayName}, '')) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.email}, '')) LIKE LOWER(${searchPattern})`
        )
      );
      
      // Add exclusion of current user if provided with a valid number
      if (numericExcludeId !== undefined) {
        console.log("Excluding user with ID:", numericExcludeId);
        
        // Create a separate condition for the exclusion to avoid SQL syntax errors
        queryBuilder = queryBuilder.where(
          sql`${users.id} != ${numericExcludeId}`
        );
      }
      
      // Log the prepared query for debugging
      console.log("Executing user search query with pattern:", searchPattern);
      
      try {
        // Execute query with limit and return results
        const results = await queryBuilder.limit(10);
        console.log(`Search for "${query}" found ${results.length} results`);
        
        // Map results to the correct shape and add any missing properties
        const mappedResults = results.map(user => ({
          ...user,
          avatarUrl: null,
          // Add other fields required by the User type but not included in the select
          password: "", // This will never be sent to the client
          bio: null,
          yearOfBirth: null,
          location: null,
          playingSince: null,
          skillLevel: null,
          level: 1,
          xp: 0,
          rankingPoints: 0,
          lastMatchDate: null,
          totalMatches: 0,
          matchesWon: 0,
          totalTournaments: 0,
          isFoundingMember: false,
          isAdmin: false,
          xpMultiplier: 100,
          preferredPosition: null,
          paddleBrand: null,
          paddleModel: null,
          playingStyle: null,
          shotStrengths: null,
          preferredFormat: null,
          dominantHand: null,
          createdAt: null,
          profileCompletionPct: 0,
          regularSchedule: null
        }));
        
        return mappedResults;
      } catch (dbError) {
        console.error("[searchUsers] Database query error:", dbError);
        if (dbError instanceof Error) {
          console.error("[searchUsers] Error message:", dbError.message);
          console.error("[searchUsers] Error stack:", dbError.stack);
        }
        // Return empty array on database error
        return [];
      }
    } catch (error) {
      console.error("[searchUsers] Error:", error);
      if (error instanceof Error) {
        console.error("[searchUsers] Error message:", error.message);
        console.error("[searchUsers] Error stack:", error.stack);
      }
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
