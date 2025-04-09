import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  xpTransactions, type XpTransaction, type InsertXpTransaction
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
  updateUserProfile(id: number, profileData: any): Promise<User | undefined>;
  updateUserXP(id: number, xpToAdd: number): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  searchUsers(query: string, excludeUserId?: number): Promise<{ 
    id: number; 
    username: string; 
    displayName: string; 
    passportId: string | null; 
    avatarUrl: string | null; 
    avatarInitials: string; 
  }[]>;
  
  // Profile Completion Tracking
  getCompletedProfileFields(userId: number): Promise<ProfileCompletionTracking[]>;
  recordProfileFieldCompletion(userId: number, fieldName: string, xpAwarded: number): Promise<ProfileCompletionTracking>;
  checkProfileFieldCompletion(userId: number, fieldName: string): Promise<boolean>;
  
  // XP Transactions
  createXpTransaction(transaction: Omit<InsertXpTransaction, 'timestamp'>): Promise<XpTransaction>;
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
      
      // Select all fields from the user table
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, numericId));
      
      // Add any missing fields expected in the User type, but don't override existing values
      if (user) {
        if (!('avatarUrl' in user)) {
          (user as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (user.profileCompletionPct === undefined || user.profileCompletionPct === null) {
          (user as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in user)) {
          (user as any).regularSchedule = null;
        }
        
        // Log the fields we care about for debugging
        console.log(`[Storage] Retrieved user ${numericId} with profileCompletionPct=${user.profileCompletionPct}, paddleBrand=${user.paddleBrand}, paddleModel=${user.paddleModel}`);
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
      
      // Select all fields from the user table
      const [user] = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      // Add any missing fields expected in the User type
      if (user) {
        if (!('avatarUrl' in user)) {
          (user as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (user.profileCompletionPct === undefined || user.profileCompletionPct === null) {
          (user as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in user)) {
          (user as any).regularSchedule = null;
        }
      }
      
      return user;
    } catch (error) {
      console.error('[Storage] getUserByUsername error:', error);
      return undefined;
    }
  }
  
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    try {
      if (!identifier || typeof identifier !== 'string') {
        console.log(`[Storage] getUserByIdentifier called with invalid identifier: ${identifier}`);
        return undefined;
      }
      
      // Select all fields from the user table
      const [user] = await db.select()
        .from(users)
        .where(
          or(
            eq(users.username, identifier),
            eq(users.email, identifier)
          )
        );
      
      // Add any missing fields expected in the User type
      if (user) {
        if (!('avatarUrl' in user)) {
          (user as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (user.profileCompletionPct === undefined || user.profileCompletionPct === null) {
          (user as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in user)) {
          (user as any).regularSchedule = null;
        }
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
      
      // Select all fields from the user table
      const [user] = await db.select()
        .from(users)
        .where(eq(users.passportId, passportId));
      
      // Add any missing fields expected in the User type
      if (user) {
        if (!('avatarUrl' in user)) {
          (user as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (user.profileCompletionPct === undefined || user.profileCompletionPct === null) {
          (user as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in user)) {
          (user as any).regularSchedule = null;
        }
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
      
      // Update the user record
      const [updatedUser] = await db.update(users)
        .set(update)
        .where(eq(users.id, numericId))
        .returning();
      
      // Add any missing fields expected in the User type
      if (updatedUser) {
        if (!('avatarUrl' in updatedUser)) {
          (updatedUser as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (updatedUser.profileCompletionPct === undefined || updatedUser.profileCompletionPct === null) {
          (updatedUser as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in updatedUser)) {
          (updatedUser as any).regularSchedule = null;
        }
      }
      
      return updatedUser;
    } catch (error) {
      console.error('[Storage] updateUser error:', error);
      return undefined;
    }
  }
  
  async updateUserProfile(id: number, profileData: any): Promise<User | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateUserProfile called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] updateUserProfile called with valid ID: ${numericId}`);
      
      // Get the current user to calculate profile completion
      const currentUser = await this.getUser(numericId);
      if (!currentUser) {
        console.log(`[Storage] updateUserProfile - User with ID ${numericId} not found`);
        return undefined;
      }
      
      // Calculate previous profile completion percentage
      const previousCompletion = this.calculateProfileCompletion(currentUser);
      
      // Filter out any properties that don't belong to the users table
      const validData: Record<string, any> = {};
      Object.keys(profileData).forEach(key => {
        if (key in users) {
          validData[key] = profileData[key];
        }
      });
      
      // Update the user profile with validated data
      const [updatedUser] = await db.update(users)
        .set(validData)
        .where(eq(users.id, numericId))
        .returning();
        
      if (!updatedUser) {
        console.log(`[Storage] updateUserProfile - Failed to update user with ID ${numericId}`);
        return undefined;
      }
      
      // Calculate new profile completion percentage
      const newCompletion = this.calculateProfileCompletion(updatedUser);
      
      // Add any missing fields expected in the User type
      if (updatedUser) {
        if (!('avatarUrl' in updatedUser)) {
          (updatedUser as any).avatarUrl = null;
        }
        
        if (!('regularSchedule' in updatedUser)) {
          (updatedUser as any).regularSchedule = null;
        }
      }
      
      // Update the profile completion percentage if it changed
      if (newCompletion !== previousCompletion) {
        console.log(`[Storage] updateUserProfile - Profile completion changed from ${previousCompletion}% to ${newCompletion}% for user ${numericId}`);
        
        const [finalUser] = await db.update(users)
          .set({ profileCompletionPct: newCompletion })
          .where(eq(users.id, numericId))
          .returning();
        
        // Add any missing fields to finalUser too
        if (finalUser) {
          if (!('avatarUrl' in finalUser)) {
            (finalUser as any).avatarUrl = null;
          }
          
          if (!('regularSchedule' in finalUser)) {
            (finalUser as any).regularSchedule = null;
          }
        }
        
        return finalUser;
      }
      
      return updatedUser;
    } catch (error) {
      console.error('[Storage] updateUserProfile error:', error);
      return undefined;
    }
  }
  
  // Method to calculate profile completion percentage
  calculateProfileCompletion(user: User | number): number {
    // If a numeric ID is passed, get the user first
    if (typeof user === 'number') {
      const userId = user;
      return this.getUser(userId).then(userObj => {
        if (!userObj) return 0;
        return this.calculateProfileCompletion(userObj);
      }) as unknown as number;
    }
    if (!user) return 0;
    
    // Define the fields that contribute to profile completion with their weights
    const profileFields: { [key: string]: number } = {
      bio: 5,
      location: 5,
      skillLevel: 5,
      playingSince: 5,
      preferredFormat: 5,
      dominantHand: 5,
      preferredPosition: 5,
      paddleBrand: 5,
      paddleModel: 5,
      playingStyle: 5,
      shotStrengths: 5,
      regularSchedule: 5,
      lookingForPartners: 5,
      partnerPreferences: 5,
      playerGoals: 5,
      coach: 5,
      clubs: 5,
      leagues: 5,
      socialHandles: 5,
      mobilityLimitations: 3,
      preferredMatchDuration: 3,
      fitnessLevel: 4
    };
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    // Calculate total weight and completed weight
    for (const field in profileFields) {
      const weight = profileFields[field];
      totalWeight += weight;
      
      // Check if this field has been completed
      const value = (user as any)[field];
      if (value !== undefined && value !== null && value !== '') {
        // For objects like socialHandles, check if there's at least one property
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (Object.keys(value).length > 0) {
            completedWeight += weight;
          }
        } else {
          completedWeight += weight;
        }
      }
    }
    
    // Calculate percentage (0-100)
    return Math.round((completedWeight / totalWeight) * 100);
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
      
      // Add any missing fields expected in the User type
      if (updatedUser) {
        if (!('avatarUrl' in updatedUser)) {
          (updatedUser as any).avatarUrl = null;
        }
        
        // Use default profileCompletionPct from database if available, otherwise 0
        if (updatedUser.profileCompletionPct === undefined || updatedUser.profileCompletionPct === null) {
          (updatedUser as any).profileCompletionPct = 0;
        }
        
        if (!('regularSchedule' in updatedUser)) {
          (updatedUser as any).regularSchedule = null;
        }
      }
      
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
  
  // For user search, we only need a minimal set of user information
  async searchUsers(query: string, excludeUserId?: number): Promise<{ 
    id: number; 
    username: string; 
    displayName: string; 
    passportId: string | null; 
    avatarUrl: string | null; 
    avatarInitials: string; 
  }[]> {
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
        // We'll perform a direct search without any preliminary checks
        console.log("Executing direct user search with pattern:", searchPattern);
        
        // Build the search query with the where clause directly
        const whereClause = or(
          sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.displayName}, '')) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.email}, '')) LIKE LOWER(${searchPattern})`
        );
        
        console.log("Search SQL:", whereClause);
        
        // Execute the search query
        // IMPORTANT: We're avoiding chaining multiple where clauses as that seems to be causing issues
        let results = await db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          passportId: users.passportId,
          avatarInitials: users.avatarInitials,
          location: users.location
        })
        .from(users)
        .where(whereClause)
        .limit(10);
        
        // If we need to exclude a user, do it in memory to avoid SQL issues
        if (numericExcludeId !== undefined) {
          results = results.filter(user => user.id !== numericExcludeId);
        }
        
        console.log(`Search found ${results.length} results for "${safeQuery}"`);
        console.log("Results:", results.map(u => `${u.id}: ${u.username}`).join(", "));
        
        // Just return the simplified results since we only need id, name and avatar for search
        const mappedResults = results.map(user => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          passportId: user.passportId || null,
          avatarUrl: null, // Safe default
          avatarInitials: user.avatarInitials || (user.username ? user.username.substring(0, 2).toUpperCase() : "??")
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
          
          // Map to simplified user objects with only what we need for the player select
          return filteredUsers.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            passportId: null,
            avatarUrl: null,
            avatarInitials: user.username?.substring(0, 2).toUpperCase() || "??"
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

  // Profile Completion Tracking methods
  async getCompletedProfileFields(userId: number): Promise<ProfileCompletionTracking[]> {
    try {
      // Validate userId
      const numericId = Number(userId);
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getCompletedProfileFields called with invalid ID: ${userId}`);
        return [];
      }

      // Get all completed profile fields for this user
      const completedFields = await db.select()
        .from(profileCompletionTracking)
        .where(eq(profileCompletionTracking.userId, numericId));
      
      return completedFields;
    } catch (error) {
      console.error('[Storage] getCompletedProfileFields error:', error);
      return [];
    }
  }

  async recordProfileFieldCompletion(userId: number, fieldName: string, xpAwarded: number): Promise<ProfileCompletionTracking> {
    try {
      // Validate params
      const numericId = Number(userId);
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] recordProfileFieldCompletion called with invalid ID: ${userId}`);
        throw new Error('Invalid user ID');
      }

      if (!fieldName || typeof fieldName !== 'string') {
        console.log(`[Storage] recordProfileFieldCompletion called with invalid fieldName: ${fieldName}`);
        throw new Error('Invalid field name');
      }

      const numericXp = Number(xpAwarded);
      if (isNaN(numericXp) || !Number.isFinite(numericXp) || numericXp < 0) {
        console.log(`[Storage] recordProfileFieldCompletion called with invalid XP amount: ${xpAwarded}`);
        throw new Error('Invalid XP amount');
      }

      // Record the completion in the database
      const [record] = await db.insert(profileCompletionTracking)
        .values({
          userId: numericId,
          fieldName: fieldName,
          xpAwarded: numericXp
        })
        .returning();

      return record;
    } catch (error) {
      console.error('[Storage] recordProfileFieldCompletion error:', error);
      throw error;
    }
  }

  async checkProfileFieldCompletion(userId: number, fieldName: string): Promise<boolean> {
    try {
      // Validate params
      const numericId = Number(userId);
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] checkProfileFieldCompletion called with invalid ID: ${userId}`);
        return false;
      }

      if (!fieldName || typeof fieldName !== 'string') {
        console.log(`[Storage] checkProfileFieldCompletion called with invalid fieldName: ${fieldName}`);
        return false;
      }

      // Check if there's a record for this field
      const existingRecord = await db.select()
        .from(profileCompletionTracking)
        .where(
          and(
            eq(profileCompletionTracking.userId, numericId),
            eq(profileCompletionTracking.fieldName, fieldName)
          )
        )
        .limit(1);

      // Return true if a record exists, false otherwise
      return existingRecord.length > 0;
    } catch (error) {
      console.error('[Storage] checkProfileFieldCompletion error:', error);
      return false;
    }
  }

  // XP Transaction methods
  async createXpTransaction(transaction: Omit<InsertXpTransaction, 'timestamp'>): Promise<XpTransaction> {
    try {
      if (!transaction.userId || !transaction.amount || !transaction.source) {
        console.log(`[Storage] createXpTransaction called with invalid transaction:`, transaction);
        throw new Error('Invalid XP transaction data');
      }

      // Create the transaction record
      const [record] = await db.insert(xpTransactions)
        .values(transaction)
        .returning();

      return record;
    } catch (error) {
      console.error('[Storage] createXpTransaction error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
