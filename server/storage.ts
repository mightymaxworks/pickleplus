import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  xpTransactions, type XpTransaction, type InsertXpTransaction,
  matches, type Match, type InsertMatch
} from "@shared/schema";

// PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
import {
  matchStatistics, type InsertMatchStatistics,
  performanceImpacts, type InsertPerformanceImpact,
  matchHighlights, type InsertMatchHighlight
} from "@shared/match-statistics-schema";

// PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
// PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
import {
  events, type Event, type InsertEvent,
  eventCheckIns, type EventCheckIn, type InsertEventCheckIn,
  eventRegistrations, type EventRegistration, type InsertEventRegistration
} from "@shared/schema/events";

// Define types for database results
type MatchStatistics = typeof matchStatistics.$inferSelect;
type PerformanceImpact = typeof performanceImpacts.$inferSelect;
type MatchHighlight = typeof matchHighlights.$inferSelect;
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
  getUserByPassportCode(passportCode: string): Promise<User | undefined>;
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
    passportCode: string | null; 
    avatarUrl: string | null; 
    avatarInitials: string; 
  }[]>;
  
  // Profile Completion Tracking
  getCompletedProfileFields(userId: number): Promise<ProfileCompletionTracking[]>;
  recordProfileFieldCompletion(userId: number, fieldName: string, xpAwarded: number): Promise<ProfileCompletionTracking>;
  checkProfileFieldCompletion(userId: number, fieldName: string): Promise<boolean>;
  
  // XP Transactions
  createXpTransaction(transaction: Omit<InsertXpTransaction, 'timestamp'>): Promise<XpTransaction>;
  
  // PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
  // Match operations
  getMatch(id: number): Promise<Match | undefined>;
  getRecentMatches(userId: number, limit?: number): Promise<Match[]>;
  getMatchesByUser(userId: number, limit?: number, offset?: number): Promise<Match[]>;
  createMatch(matchData: InsertMatch): Promise<Match>;
  
  // Match Statistics
  getMatchStatistics(matchId: number): Promise<MatchStatistics | undefined>;
  createMatchStatistics(stats: InsertMatchStatistics): Promise<MatchStatistics>;
  updateMatchStatistics(id: number, updates: Partial<InsertMatchStatistics>): Promise<MatchStatistics | undefined>;
  
  // Performance Impacts
  getPerformanceImpacts(matchId: number, userId?: number): Promise<PerformanceImpact[]>;
  createPerformanceImpact(impact: InsertPerformanceImpact): Promise<PerformanceImpact>;
  
  // Match Highlights
  getMatchHighlights(matchId: number, userId?: number): Promise<MatchHighlight[]>;
  createMatchHighlight(highlight: InsertMatchHighlight): Promise<MatchHighlight>;
  
  // PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(limit?: number, offset?: number, filters?: Partial<Event>): Promise<Event[]>;
  getEventsByOrganizer(organizerId: number, limit?: number, offset?: number): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  createEvent(eventData: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event Check-in operations
  getEventCheckIn(id: number): Promise<EventCheckIn | undefined>;
  getEventCheckIns(eventId: number, limit?: number, offset?: number): Promise<EventCheckIn[]>;
  getUserEventCheckIns(userId: number, limit?: number, offset?: number): Promise<EventCheckIn[]>;
  checkUserIntoEvent(checkInData: InsertEventCheckIn): Promise<EventCheckIn>;
  getEventAttendees(eventId: number, limit?: number, offset?: number): Promise<User[]>;
  isUserCheckedIntoEvent(eventId: number, userId: number): Promise<boolean>;
  getEventCheckInCounts(eventId: number): Promise<number>;
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
        
        // Log external ratings for debugging
        console.log(`[Storage] External ratings for user ${numericId}: DUPR=${user.duprRating || 'None'}, UTPR=${user.utprRating || 'None'}, WPR=${user.wprRating || 'None'}, Verified=${user.externalRatingsVerified}, Last Updated=${user.lastExternalRatingUpdate || 'Never'}`);
        
        // Debug if properties are missing from the user object
        if (!('duprRating' in user)) {
          console.log(`[Storage] CRITICAL ERROR: duprRating property is missing from user object!`);
        }
        if (!('duprProfileUrl' in user)) {
          console.log(`[Storage] CRITICAL ERROR: duprProfileUrl property is missing from user object!`);
        }
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
  
  async getUserByPassportCode(passportCode: string): Promise<User | undefined> {
    try {
      // Validate passportCode is not empty or invalid
      if (!passportCode || typeof passportCode !== 'string' || passportCode.trim() === '') {
        console.log(`[Storage] getUserByPassportCode called with invalid passport code: ${passportCode}`);
        return undefined;
      }
      
      console.log(`[Storage] getUserByPassportCode called with passport code: ${passportCode}`);
      
      // Select all fields from the user table
      const [user] = await db.select()
        .from(users)
        .where(eq(users.passportId, passportCode));
      
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
      console.error('[Storage] getUserByPassportCode error:', error);
      return undefined;
    }
  }
  
  async getUserByPassportId(passportId: string): Promise<User | undefined> {
    try {
      // Validate passportId is not empty or invalid
      if (!passportId || typeof passportId !== 'string' || passportId.trim() === '') {
        console.log(`[Storage] getUserByPassportId called with invalid passport ID: ${passportId}`);
        return undefined;
      }
      
      console.log(`[Storage] getUserByPassportId called with passport ID: ${passportId}`);
      
      // First try with the raw passport ID
      let user;
      [user] = await db.select()
        .from(users)
        .where(eq(users.passportId, passportId));
        
      // If not found, try to add PKL- prefix and dashes
      if (!user) {
        // Try different formats
        const formattedId = `PKL-${passportId.substring(0, 3)}-${passportId.substring(3)}`;
        [user] = await db.select()
          .from(users)
          .where(eq(users.passportId, formattedId));
      }
      
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
      // but make sure to keep external rating fields
      const validData: Record<string, any> = {};
      
      // Log all keys available in the profileData object
      console.log(`[Storage] updateUserProfile - Fields in request:`, Object.keys(profileData));
      console.log(`[Storage] updateUserProfile - Complete profileData:`, JSON.stringify(profileData, null, 2));
      
      // DEBUG: Print all columns in the users table
      console.log(`[Storage] All users table columns:`, Object.keys(users));
      
      // List of all external rating fields - map them to database column names
      const externalRatingFieldsMap: Record<string, string> = {
        'duprRating': 'dupr_rating',
        'duprProfileUrl': 'dupr_profile_url',
        'utprRating': 'utpr_rating',
        'utprProfileUrl': 'utpr_profile_url',
        'wprRating': 'wpr_rating',
        'wprProfileUrl': 'wpr_profile_url',
        'externalRatingsVerified': 'external_ratings_verified',
        'lastExternalRatingUpdate': 'last_external_rating_update'
      };
      
      // IMPORTANT DEBUG: Check what's in the profileData object
      console.log(`[Storage] updateUserProfile - JSON stringified profileData:`, JSON.stringify(profileData));
      
      // Map camelCase field names to snake_case database column names for external ratings
      Object.keys(profileData).forEach(key => {
        if (externalRatingFieldsMap[key]) {
          // Use the mapped database column name
          const dbColumnName = externalRatingFieldsMap[key];
          validData[dbColumnName] = profileData[key];
          console.log(`[Storage] updateUserProfile - Including mapped field: ${key} -> ${dbColumnName} with value:`, profileData[key]);
        } 
        // Also include any fields that exist directly in the schema
        else if (key in users) {
          validData[key] = profileData[key];
          console.log(`[Storage] updateUserProfile - Including direct field: ${key} with value:`, profileData[key]);
        } else {
          console.log(`[Storage] updateUserProfile - Skipping field not in schema: ${key}`);
        }
      });
      
      // CRITICAL: Force add the values for external ratings if they exist in the profileData
      // This is a workaround for the mapping issue
      if (profileData.duprRating) {
        validData.dupr_rating = profileData.duprRating;
        console.log(`[Storage] updateUserProfile - Force adding dupr_rating with value:`, profileData.duprRating);
      }
      if (profileData.duprProfileUrl) {
        validData.dupr_profile_url = profileData.duprProfileUrl;
        console.log(`[Storage] updateUserProfile - Force adding dupr_profile_url with value:`, profileData.duprProfileUrl);
      }
      if (profileData.utprRating) {
        validData.utpr_rating = profileData.utprRating;
        console.log(`[Storage] updateUserProfile - Force adding utpr_rating with value:`, profileData.utprRating);
      }
      if (profileData.utprProfileUrl) {
        validData.utpr_profile_url = profileData.utprProfileUrl;
        console.log(`[Storage] updateUserProfile - Force adding utpr_profile_url with value:`, profileData.utprProfileUrl);
      }
      if (profileData.wprRating) {
        validData.wpr_rating = profileData.wprRating;
        console.log(`[Storage] updateUserProfile - Force adding wpr_rating with value:`, profileData.wprRating);
      }
      if (profileData.wprProfileUrl) {
        validData.wpr_profile_url = profileData.wprProfileUrl;
        console.log(`[Storage] updateUserProfile - Force adding wpr_profile_url with value:`, profileData.wprProfileUrl);
      }
      
      // Add last external rating update timestamp
      validData.last_external_rating_update = new Date().toISOString();
      
      // Update the user profile with validated data
      console.log(`[Storage] updateUserProfile - SQL UPDATE operation. Data to update:`, JSON.stringify(validData, null, 2));
      console.log(`[Storage] updateUserProfile - Updating user with id=${numericId}`);
      
      let updatedUser;
      try {
        const [result] = await db.update(users)
          .set(validData)
          .where(eq(users.id, numericId))
          .returning();
        
        updatedUser = result;
        console.log(`[Storage] updateUserProfile - SQL UPDATE successful. Updated user data:`, JSON.stringify(updatedUser, null, 2));
      } catch (sqlError) {
        console.error(`[Storage] updateUserProfile - SQL UPDATE ERROR:`, sqlError);
        throw sqlError;
      }
        
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
    passportCode: string | null; 
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
          passportCode: users.passportId,
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
          passportCode: user.passportCode || null, 
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
            passportCode: null,
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
  
  // PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getMatch called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] getMatch called with valid ID: ${numericId}`);
      
      // Select all fields from the matches table
      const [match] = await db.select()
        .from(matches)
        .where(eq(matches.id, numericId));
      
      return match;
    } catch (error) {
      console.error('[Storage] getMatch error:', error);
      return undefined;
    }
  }
  
  async createMatch(matchData: InsertMatch): Promise<Match> {
    try {
      console.log(`[Storage] createMatch called with data:`, JSON.stringify(matchData));
      
      // Insert the match record
      const [match] = await db.insert(matches)
        .values(matchData)
        .returning();
      
      if (!match) {
        throw new Error("Failed to create match in database");
      }
      
      return match;
    } catch (error) {
      console.error('[Storage] createMatch error:', error);
      throw error;
    }
  }
  
  async getRecentMatches(userId: number, limit: number = 10): Promise<Match[]> {
    try {
      // Validate userId is a proper number to avoid database errors
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getRecentMatches called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getRecentMatches called with userId: ${numericUserId}, limit: ${limit}`);
      
      // Find matches where the user was a player or partner
      const recentMatches = await db.select()
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, numericUserId),
            eq(matches.playerTwoId, numericUserId),
            eq(matches.playerOnePartnerId, numericUserId),
            eq(matches.playerTwoPartnerId, numericUserId)
          )
        )
        .orderBy(desc(matches.matchDate))
        .limit(limit);
      
      return recentMatches;
    } catch (error) {
      console.error('[Storage] getRecentMatches error:', error);
      return [];
    }
  }
  
  async getMatchesByUser(userId: number, limit: number = 20, offset: number = 0): Promise<Match[]> {
    try {
      // Validate userId is a proper number to avoid database errors
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getMatchesByUser called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getMatchesByUser called with userId: ${numericUserId}, limit: ${limit}, offset: ${offset}`);
      
      // Find matches where the user was a player or partner
      const userMatches = await db.select()
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, numericUserId),
            eq(matches.playerTwoId, numericUserId),
            eq(matches.playerOnePartnerId, numericUserId),
            eq(matches.playerTwoPartnerId, numericUserId)
          )
        )
        .orderBy(desc(matches.matchDate))
        .limit(limit)
        .offset(offset);
      
      return userMatches;
    } catch (error) {
      console.error('[Storage] getMatchesByUser error:', error);
      return [];
    }
  }
  
  // Match Statistics
  async getMatchStatistics(matchId: number): Promise<MatchStatistics | undefined> {
    try {
      // Validate matchId is a proper number to avoid database errors
      const numericId = Number(matchId);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getMatchStatistics called with invalid matchId: ${matchId}`);
        return undefined;
      }
      
      console.log(`[Storage] getMatchStatistics called with valid matchId: ${numericId}`);
      
      // Select all fields from the match_statistics table
      const [stats] = await db.select()
        .from(matchStatistics)
        .where(eq(matchStatistics.matchId, numericId));
      
      return stats;
    } catch (error) {
      console.error('[Storage] getMatchStatistics error:', error);
      return undefined;
    }
  }
  
  async createMatchStatistics(stats: InsertMatchStatistics): Promise<MatchStatistics> {
    try {
      console.log(`[Storage] createMatchStatistics called with data:`, JSON.stringify(stats));
      
      if (!stats.matchId) {
        console.log(`[Storage] createMatchStatistics called with invalid stats: missing matchId`);
        throw new Error("Invalid match statistics: missing matchId");
      }
      
      // Insert the match statistics record
      const [result] = await db.insert(matchStatistics)
        .values(stats)
        .returning();
      
      if (!result) {
        throw new Error("Failed to create match statistics in database");
      }
      
      return result;
    } catch (error) {
      console.error('[Storage] createMatchStatistics error:', error);
      throw error;
    }
  }
  
  async updateMatchStatistics(id: number, updates: Partial<InsertMatchStatistics>): Promise<MatchStatistics | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateMatchStatistics called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] updateMatchStatistics called with valid ID: ${numericId} and updates:`, JSON.stringify(updates));
      
      // Update the match statistics record
      const [updatedStats] = await db.update(matchStatistics)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(matchStatistics.id, numericId))
        .returning();
      
      return updatedStats;
    } catch (error) {
      console.error('[Storage] updateMatchStatistics error:', error);
      return undefined;
    }
  }
  
  // Performance Impacts
  async getPerformanceImpacts(matchId: number, userId?: number): Promise<PerformanceImpact[]> {
    try {
      // Validate matchId is a proper number to avoid database errors
      const numericMatchId = Number(matchId);
      
      if (isNaN(numericMatchId) || !Number.isFinite(numericMatchId) || numericMatchId < 1) {
        console.log(`[Storage] getPerformanceImpacts called with invalid matchId: ${matchId}`);
        return [];
      }
      
      console.log(`[Storage] getPerformanceImpacts called with valid matchId: ${numericMatchId}`);
      
      // If userId is provided, query with both match and user filters
      if (userId) {
        const numericUserId = Number(userId);
        
        if (!isNaN(numericUserId) && Number.isFinite(numericUserId) && numericUserId >= 1) {
          const impacts = await db.select().from(performanceImpacts)
            .where(and(
              eq(performanceImpacts.matchId, numericMatchId),
              eq(performanceImpacts.userId, numericUserId)
            ));
          return impacts;
        }
      }
      
      // If no valid userId, just filter by matchId
      const impacts = await db.select().from(performanceImpacts)
        .where(eq(performanceImpacts.matchId, numericMatchId));
      
      return impacts;
    } catch (error) {
      console.error('[Storage] getPerformanceImpacts error:', error);
      return [];
    }
  }
  
  async createPerformanceImpact(impact: InsertPerformanceImpact): Promise<PerformanceImpact> {
    try {
      console.log(`[Storage] createPerformanceImpact called with data:`, JSON.stringify(impact));
      
      if (!impact.matchId || !impact.userId) {
        console.log(`[Storage] createPerformanceImpact called with invalid impact: missing required fields`);
        throw new Error("Invalid performance impact: missing required fields");
      }
      
      // Insert the performance impact record
      const [result] = await db.insert(performanceImpacts)
        .values(impact)
        .returning();
      
      if (!result) {
        throw new Error("Failed to create performance impact in database");
      }
      
      return result;
    } catch (error) {
      console.error('[Storage] createPerformanceImpact error:', error);
      throw error;
    }
  }
  
  // Match Highlights
  async getMatchHighlights(matchId: number, userId?: number): Promise<MatchHighlight[]> {
    try {
      // Validate matchId is a proper number to avoid database errors
      const numericMatchId = Number(matchId);
      
      if (isNaN(numericMatchId) || !Number.isFinite(numericMatchId) || numericMatchId < 1) {
        console.log(`[Storage] getMatchHighlights called with invalid matchId: ${matchId}`);
        return [];
      }
      
      console.log(`[Storage] getMatchHighlights called with valid matchId: ${numericMatchId}`);
      
      // If userId is provided, query with both match and user filters
      if (userId) {
        const numericUserId = Number(userId);
        
        if (!isNaN(numericUserId) && Number.isFinite(numericUserId) && numericUserId >= 1) {
          const highlights = await db.select().from(matchHighlights)
            .where(and(
              eq(matchHighlights.matchId, numericMatchId),
              eq(matchHighlights.userId, numericUserId)
            ));
          return highlights;
        }
      }
      
      // If no valid userId, just filter by matchId
      const highlights = await db.select().from(matchHighlights)
        .where(eq(matchHighlights.matchId, numericMatchId));
      
      return highlights;
    } catch (error) {
      console.error('[Storage] getMatchHighlights error:', error);
      return [];
    }
  }
  
  async createMatchHighlight(highlight: InsertMatchHighlight): Promise<MatchHighlight> {
    try {
      console.log(`[Storage] createMatchHighlight called with data:`, JSON.stringify(highlight));
      
      if (!highlight.matchId || !highlight.userId || !highlight.highlightType || !highlight.description) {
        console.log(`[Storage] createMatchHighlight called with invalid highlight: missing required fields`);
        throw new Error("Invalid match highlight: missing required fields");
      }
      
      // Insert the match highlight record
      const [result] = await db.insert(matchHighlights)
        .values(highlight)
        .returning();
      
      if (!result) {
        throw new Error("Failed to create match highlight in database");
      }
      
      return result;
    } catch (error) {
      console.error('[Storage] createMatchHighlight error:', error);
      throw error;
    }
  }

  // PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getEvent called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getEvent called with ID: ${numericId}`);
      
      const [event] = await db.select()
        .from(events)
        .where(eq(events.id, numericId));
      
      return event;
    } catch (error) {
      console.error('[Storage] getEvent error:', error);
      return undefined;
    }
  }
  
  async getEvents(limit: number = 100, offset: number = 0, filters?: Partial<Event>): Promise<Event[]> {
    try {
      console.log(`[Storage] getEvents called with limit: ${limit}, offset: ${offset}`);
      
      let query = db.select().from(events);
      
      // Apply filters if provided
      if (filters) {
        const conditions = [];
        
        if (filters.eventType) {
          conditions.push(eq(events.eventType, filters.eventType));
        }
        
        if (filters.status) {
          conditions.push(eq(events.status, filters.status));
        }
        
        if (filters.isPrivate !== undefined) {
          conditions.push(eq(events.isPrivate, filters.isPrivate));
        }
        
        if (filters.requiresCheckIn !== undefined) {
          conditions.push(eq(events.requiresCheckIn, filters.requiresCheckIn));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      // Apply pagination
      query = query.limit(limit).offset(offset);
      
      // Sort by start date (most recent first)
      query = query.orderBy(desc(events.startDateTime));
      
      const eventList = await query;
      return eventList;
    } catch (error) {
      console.error('[Storage] getEvents error:', error);
      return [];
    }
  }
  
  async getEventsByOrganizer(organizerId: number, limit: number = 100, offset: number = 0): Promise<Event[]> {
    try {
      const numericOrganizerId = Number(organizerId);
      
      if (isNaN(numericOrganizerId) || !Number.isFinite(numericOrganizerId) || numericOrganizerId < 1) {
        console.log(`[Storage] getEventsByOrganizer called with invalid organizerId: ${organizerId}`);
        return [];
      }
      
      console.log(`[Storage] getEventsByOrganizer called with organizerId: ${numericOrganizerId}`);
      
      const eventList = await db.select()
        .from(events)
        .where(eq(events.organizerId, numericOrganizerId))
        .orderBy(desc(events.startDateTime))
        .limit(limit)
        .offset(offset);
      
      return eventList;
    } catch (error) {
      console.error('[Storage] getEventsByOrganizer error:', error);
      return [];
    }
  }
  
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    try {
      console.log(`[Storage] getUpcomingEvents called with limit: ${limit}`);
      
      // Use SQL template literal for safe query construction with proper date formatting
      const now = new Date();
      const formattedDate = now.toISOString();
      
      // Use SQL with formatted date string
      const upcomingEvents = await db.execute(sql`
        SELECT * FROM events 
        WHERE (status = 'upcoming' OR end_date_time >= ${formattedDate}) 
        AND is_private = false 
        ORDER BY start_date_time ASC 
        LIMIT ${limit};
      `);
      
      console.log(`[Storage] getUpcomingEvents found ${upcomingEvents.length} events`);
      return upcomingEvents as unknown as Event[];
    } catch (error) {
      console.error('[Storage] getUpcomingEvents error:', error);
      return [];
    }
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    try {
      console.log(`[Storage] createEvent called with data:`, JSON.stringify(eventData));
      
      if (!eventData.name || !eventData.startDateTime || !eventData.endDateTime) {
        console.log(`[Storage] createEvent called with invalid event: missing required fields`);
        throw new Error("Invalid event: missing required fields");
      }
      
      // Ensure dates are properly parsed
      const processedData = {
        ...eventData,
        startDateTime: new Date(eventData.startDateTime),
        endDateTime: new Date(eventData.endDateTime)
      };
      
      // Process optional dates if they exist
      if (eventData.registrationStartDate) {
        processedData.registrationStartDate = new Date(eventData.registrationStartDate);
      }
      
      if (eventData.registrationEndDate) {
        processedData.registrationEndDate = new Date(eventData.registrationEndDate);
      }
      
      console.log(`[Storage] Inserting event with processed data:`, processedData);
      
      const [result] = await db.insert(events)
        .values(processedData)
        .returning();
      
      if (!result) {
        throw new Error("Failed to create event in database");
      }
      
      return result;
    } catch (error) {
      console.error('[Storage] createEvent error:', error);
      throw error;
    }
  }
  
  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateEvent called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] updateEvent called for event ID: ${numericId}`);
      
      // Process data for update - convert string dates to Date objects
      const processedUpdates: any = { ...updates };
      
      // Handle date fields
      if (updates.startDateTime) {
        processedUpdates.startDateTime = new Date(updates.startDateTime);
      }
      
      if (updates.endDateTime) {
        processedUpdates.endDateTime = new Date(updates.endDateTime);
      }
      
      if (updates.registrationStartDate) {
        processedUpdates.registrationStartDate = new Date(updates.registrationStartDate);
      }
      
      if (updates.registrationEndDate) {
        processedUpdates.registrationEndDate = new Date(updates.registrationEndDate);
      }
      
      // Set updated timestamp
      processedUpdates.updatedAt = new Date();
      
      console.log(`[Storage] Updating event with processed data:`, processedUpdates);
      
      const [updatedEvent] = await db.update(events)
        .set(processedUpdates)
        .where(eq(events.id, numericId))
        .returning();
      
      return updatedEvent;
    } catch (error) {
      console.error('[Storage] updateEvent error:', error);
      return undefined;
    }
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] deleteEvent called with invalid ID: ${id}`);
        return false;
      }
      
      console.log(`[Storage] deleteEvent called for event ID: ${numericId}`);
      
      // First delete all check-ins for this event
      await db.delete(eventCheckIns)
        .where(eq(eventCheckIns.eventId, numericId));
      
      // Then delete the event
      const result = await db.delete(events)
        .where(eq(events.id, numericId));
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteEvent error:', error);
      return false;
    }
  }
  
  // Event Check-in operations
  async getEventCheckIn(id: number): Promise<EventCheckIn | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getEventCheckIn called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getEventCheckIn called with ID: ${numericId}`);
      
      const [checkIn] = await db.select()
        .from(eventCheckIns)
        .where(eq(eventCheckIns.id, numericId));
      
      return checkIn;
    } catch (error) {
      console.error('[Storage] getEventCheckIn error:', error);
      return undefined;
    }
  }
  
  async getEventCheckIns(eventId: number, limit: number = 100, offset: number = 0): Promise<EventCheckIn[]> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] getEventCheckIns called with invalid eventId: ${eventId}`);
        return [];
      }
      
      console.log(`[Storage] getEventCheckIns called for event ID: ${numericEventId}`);
      
      const checkIns = await db.select()
        .from(eventCheckIns)
        .where(eq(eventCheckIns.eventId, numericEventId))
        .orderBy(desc(eventCheckIns.checkInTime))
        .limit(limit)
        .offset(offset);
      
      return checkIns;
    } catch (error) {
      console.error('[Storage] getEventCheckIns error:', error);
      return [];
    }
  }
  
  async getUserEventCheckIns(userId: number, limit: number = 100, offset: number = 0): Promise<EventCheckIn[]> {
    try {
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getUserEventCheckIns called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getUserEventCheckIns called for user ID: ${numericUserId}`);
      
      const checkIns = await db.select()
        .from(eventCheckIns)
        .where(eq(eventCheckIns.userId, numericUserId))
        .orderBy(desc(eventCheckIns.checkInTime))
        .limit(limit)
        .offset(offset);
      
      return checkIns;
    } catch (error) {
      console.error('[Storage] getUserEventCheckIns error:', error);
      return [];
    }
  }
  
  async checkUserIntoEvent(checkInData: InsertEventCheckIn): Promise<EventCheckIn> {
    try {
      console.log(`[Storage] checkUserIntoEvent called with data:`, JSON.stringify(checkInData));
      
      if (!checkInData.eventId || !checkInData.userId) {
        console.log(`[Storage] checkUserIntoEvent called with invalid checkIn: missing required fields`);
        throw new Error("Invalid check-in: missing required fields");
      }
      
      // Check if user is already checked in
      const existingCheckIns = await db.select()
        .from(eventCheckIns)
        .where(
          and(
            eq(eventCheckIns.eventId, checkInData.eventId),
            eq(eventCheckIns.userId, checkInData.userId)
          )
        );
      
      if (existingCheckIns.length > 0) {
        console.log(`[Storage] User ${checkInData.userId} is already checked in to event ${checkInData.eventId}`);
        return existingCheckIns[0];
      }
      
      // Insert the check-in record
      const [result] = await db.insert(eventCheckIns)
        .values(checkInData)
        .returning();
      
      if (!result) {
        throw new Error("Failed to create event check-in in database");
      }
      
      // Update event attendance count
      await this.updateEventAttendanceCount(checkInData.eventId);
      
      return result;
    } catch (error) {
      console.error('[Storage] checkUserIntoEvent error:', error);
      throw error;
    }
  }
  
  async getEventAttendees(eventId: number, limit: number = 100, offset: number = 0): Promise<User[]> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] getEventAttendees called with invalid eventId: ${eventId}`);
        return [];
      }
      
      console.log(`[Storage] getEventAttendees called for event ID: ${numericEventId}`);
      
      // Join event check-ins with users to get attendee details
      const attendees = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        passportId: users.passportId,
        avatarUrl: users.avatarUrl,
        avatarInitials: users.avatarInitials,
        checkInTime: eventCheckIns.checkInTime,
        checkInMethod: eventCheckIns.checkInMethod
      })
      .from(eventCheckIns)
      .innerJoin(users, eq(eventCheckIns.userId, users.id))
      .where(eq(eventCheckIns.eventId, numericEventId))
      .orderBy(desc(eventCheckIns.checkInTime))
      .limit(limit)
      .offset(offset);
      
      return attendees;
    } catch (error) {
      console.error('[Storage] getEventAttendees error:', error);
      return [];
    }
  }
  
  async isUserCheckedIntoEvent(eventId: number, userId: number): Promise<boolean> {
    try {
      const numericEventId = Number(eventId);
      const numericUserId = Number(userId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1 ||
          isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] isUserCheckedIntoEvent called with invalid parameters: eventId=${eventId}, userId=${userId}`);
        return false;
      }
      
      console.log(`[Storage] isUserCheckedIntoEvent called for event ID: ${numericEventId} and user ID: ${numericUserId}`);
      
      const checkIns = await db.select()
        .from(eventCheckIns)
        .where(
          and(
            eq(eventCheckIns.eventId, numericEventId),
            eq(eventCheckIns.userId, numericUserId)
          )
        );
      
      return checkIns.length > 0;
    } catch (error) {
      console.error('[Storage] isUserCheckedIntoEvent error:', error);
      return false;
    }
  }
  
  async getEventCheckInCounts(eventId: number): Promise<number> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] getEventCheckInCounts called with invalid eventId: ${eventId}`);
        return 0;
      }
      
      console.log(`[Storage] getEventCheckInCounts called for event ID: ${numericEventId}`);
      
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(eventCheckIns)
        .where(eq(eventCheckIns.eventId, numericEventId));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[Storage] getEventCheckInCounts error:', error);
      return 0;
    }
  }

  // Helper method to update event attendance count
  private async updateEventAttendanceCount(eventId: number): Promise<void> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] updateEventAttendanceCount called with invalid eventId: ${eventId}`);
        return;
      }
      
      // Get current check-in count
      const count = await this.getEventCheckInCounts(numericEventId);
      
      // Update the event record
      await db.update(events)
        .set({ currentAttendees: count })
        .where(eq(events.id, numericEventId));
        
      console.log(`[Storage] Updated event ${numericEventId} attendance count to ${count}`);
    } catch (error) {
      console.error('[Storage] updateEventAttendanceCount error:', error);
    }
  }
}

export const storage = new DatabaseStorage();
