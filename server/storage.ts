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
      
      // More detailed logging
      if (!query) {
        console.log("Search query is empty or null, returning empty array");
        return [];
      }
      
      // Extra safety for query parameter - ensure it's a string and trim it
      const safeQuery = String(query).trim();
      if (safeQuery.length < 2) {
        console.log("Search query is too short (needs 2+ chars), returning empty array");
        return [];
      }
      
      // Simply check if there are any users at all - for debugging
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      console.log("Total users in database:", userCount[0].count);
      
      // Handle excludeUserId validation
      let numericExcludeId: number | undefined = undefined;
      
      if (excludeUserId !== undefined && excludeUserId !== null) {
        // Make sure we're dealing with a number
        const tempId = typeof excludeUserId === 'number' ? excludeUserId : Number(excludeUserId);
        
        if (!isNaN(tempId) && tempId > 0) {
          numericExcludeId = tempId;
          console.log("Will exclude user ID:", numericExcludeId, "from search results");
        } else {
          console.log("Invalid excludeUserId:", excludeUserId, "converted to", tempId, "- Will not exclude any users");
        }
      }
      
      // Create a simple pattern for SQL LIKE
      const searchPattern = `%${safeQuery}%`;
      
      try {
        // First try - get simplified data just to ensure query works
        console.log("Executing basic user search with pattern:", searchPattern);
        
        // Simple query to test database search functionality
        const testResults = await db.select({ 
          id: users.id, 
          username: users.username,
          displayName: users.displayName
        })
        .from(users)
        .where(
          or(
            sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
            sql`LOWER(COALESCE(${users.displayName}, '')) LIKE LOWER(${searchPattern})`
          )
        )
        .limit(10);
        
        console.log("Search test query found:", testResults.length, "results");
        console.log("Test results:", testResults.map(u => `${u.id}: ${u.username}`).join(", "));
      
        // Now that we verified search works, build full query
        let fullQuery = db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          passportId: users.passportId,
          avatarInitials: users.avatarInitials,
          location: users.location
        })
        .from(users)
        .where(
          or(
            sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
            sql`LOWER(COALESCE(${users.displayName}, '')) LIKE LOWER(${searchPattern})`,
            sql`LOWER(COALESCE(${users.email}, '')) LIKE LOWER(${searchPattern})`
          )
        );
        
        // Add exclusion if needed
        if (numericExcludeId !== undefined) {
          fullQuery = fullQuery.where(ne(users.id, numericExcludeId));
        }
        
        // Execute full query with results
        const results = await fullQuery.limit(10);
        console.log(`Full search for "${safeQuery}" found ${results.length} results`);
        
        // Map to complete User objects with default values for missing fields
        const mappedResults = results.map(user => ({
          ...user,
          password: "", // This will never be sent to client
          bio: null,
          yearOfBirth: null,
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
          avatarUrl: null,
          profileCompletionPct: 0,
          regularSchedule: null
        }));
        
        // Show what we're returning
        console.log("Returning", mappedResults.length, "user matches for", safeQuery);
        return mappedResults;
        
      } catch (dbError) {
        console.error("Database error in searchUsers:", dbError);
        
        // Try a fallback approach - get all users and filter in memory
        console.log("Trying fallback approach - get all users and filter in JS");
        try {
          const allUsers = await db.select({
            id: users.id,
            username: users.username,
            displayName: users.displayName
          }).from(users).limit(100);
          
          console.log(`Got ${allUsers.length} total users for in-memory filtering`);
          
          // Filter in JS
          const lowercaseQuery = safeQuery.toLowerCase();
          const filteredUsers = allUsers.filter(user => {
            // Skip the excluded user if specified
            if (numericExcludeId && user.id === numericExcludeId) return false;
            
            // Match on username and displayName
            return (
              user.username?.toLowerCase().includes(lowercaseQuery) ||
              (user.displayName && user.displayName.toLowerCase().includes(lowercaseQuery))
            );
          }).slice(0, 10); // Limit to 10 results
          
          console.log(`Fallback filtering found ${filteredUsers.length} matches`);
          
          // Map to full User objects with defaults
          return filteredUsers.map(user => ({
            ...user,
            email: null,
            password: "",
            bio: null,
            yearOfBirth: null,
            passportId: null,
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
            avatarInitials: user.username?.substring(0, 2).toUpperCase() || "??",
            avatarUrl: null,
            profileCompletionPct: 0,
            regularSchedule: null
          }));
        } catch (fallbackError) {
          console.error("Fallback search approach also failed:", fallbackError);
          return []; // Empty array as last resort
        }
      }
    } catch (outerError) {
      console.error("Outer error in searchUsers:", outerError);
      return []; // Empty array as last resort
    }
  }
}

export const storage = new DatabaseStorage();
