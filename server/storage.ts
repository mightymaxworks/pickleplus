import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  matches, type Match, type InsertMatch,
  tournaments,
  type XpTransaction, type InsertXpTransaction,
  activities, type InsertActivity
} from "@shared/schema";

// Define coach types directly since they're not exported from schema yet
interface CoachApplication {
  id: number;
  userId: number;
  coachType: string;
  applicationStatus: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: number;
  rejectionReason?: string;
  experienceYears: number;
  teachingPhilosophy: string;
  specializations: string[];
  availabilityData: Record<string, any>;
  previousExperience?: string;
  refContacts: any[];
  backgroundCheckConsent: boolean;
  insuranceDetails: Record<string, any>;
  emergencyContact: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertCoachApplication {
  userId: number;
  coachType?: string;
  applicationStatus?: string;
  experienceYears: number;
  teachingPhilosophy: string;
  specializations: string[];
  availabilityData: Record<string, any>;
  previousExperience?: string;
  refContacts?: any[];
  backgroundCheckConsent: boolean;
  insuranceDetails?: Record<string, any>;
  emergencyContact?: Record<string, any>;
}

interface CoachCertification {
  id: number;
  applicationId: number;
  certificationType: string;
  issuingOrganization: string;
  certificationNumber?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  documentUrl?: string;
  verificationStatus: string;
  verifiedBy?: number;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertCoachCertification {
  applicationId: number;
  certificationType: string;
  issuingOrganization: string;
  certificationNumber?: string;
  issuedDate?: Date;
  expirationDate?: Date;
  documentUrl?: string;
  verificationStatus?: string;
  notes?: string;
}

interface CoachProfile {
  id: number;
  userId: number;
  coachType: string;
  verificationLevel: string;
  isActive: boolean;
  bio?: string;
  specializations: string[];
  teachingStyle?: string;
  languagesSpoken: string[];
  hourlyRate?: number;
  sessionTypes: string[];
  availabilitySchedule: Record<string, any>;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  studentRetentionRate: number;
  approvedAt?: Date;
  approvedBy?: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertCoachProfile {
  userId: number;
  coachType: string;
  verificationLevel?: string;
  isActive?: boolean;
  bio?: string;
  specializations: string[];
  teachingStyle?: string;
  languagesSpoken?: string[];
  hourlyRate?: number;
  sessionTypes?: string[];
  availabilitySchedule?: Record<string, any>;
}

interface CoachReview {
  id: number;
  coachId: number;
  studentId: number;
  sessionId?: number;
  rating: number;
  reviewText?: string;
  reviewDate: Date;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertCoachReview {
  coachId: number;
  studentId: number;
  sessionId?: number;
  rating: number;
  reviewText?: string;
  isVerified?: boolean;
  isPublic?: boolean;
}

interface CoachingSession {
  id: number;
  coachId: number;
  studentId: number;
  sessionType: string;
  sessionStatus: string;
  scheduledAt: Date;
  durationMinutes: number;
  locationType?: string;
  locationDetails?: string;
  priceAmount?: number;
  currency: string;
  paymentStatus: string;
  sessionNotes?: string;
  feedbackForStudent?: string;
  studentGoals: any[];
  sessionSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InsertCoachingSession {
  coachId: number;
  studentId: number;
  sessionType: string;
  sessionStatus?: string;
  scheduledAt: Date;
  durationMinutes?: number;
  locationType?: string;
  locationDetails?: string;
  priceAmount?: number;
  currency?: string;
  paymentStatus?: string;
  sessionNotes?: string;
  feedbackForStudent?: string;
  studentGoals?: any[];
  sessionSummary?: string;
}

import { communityStorageImplementation, type CommunityStorage } from './storage/community-storage';

import { generateUniquePassportCode } from './utils/passport-generator';
import { db } from "./db";
import { eq, desc, asc, and, or, gte, lte, count, sum, avg, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage extends CommunityStorage {
  sessionStore: any;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPassportCode(passportCode: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateUserProfile(id: number, profileData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  searchPlayers(query: string): Promise<User[]>;
  
  // Password reset operations
  createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ email: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  // Profile completion tracking
  getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined>;
  updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking>;
  
  // User roles operations
  getUserRoles(userId: number): Promise<any[]>;
  
  // Coach operations
  getCoaches(): Promise<User[]>;
  
  // Coach Application operations
  createCoachApplication(data: InsertCoachApplication): Promise<CoachApplication>;
  getCoachApplication(id: number): Promise<CoachApplication | undefined>;
  getCoachApplicationByUserId(userId: number): Promise<CoachApplication | undefined>;
  updateCoachApplicationStatus(id: number, status: string, reviewerId?: number, rejectionReason?: string): Promise<CoachApplication>;
  
  // Coach Profile operations
  createCoachProfile(data: InsertCoachProfile): Promise<CoachProfile>;
  getCoachProfile(userId: number): Promise<CoachProfile | undefined>;
  updateCoachProfile(userId: number, data: Partial<InsertCoachProfile>): Promise<CoachProfile>;
  
  // Coach Certification operations
  addCoachCertification(data: InsertCoachCertification): Promise<CoachCertification>;
  getCoachCertifications(applicationId: number): Promise<CoachCertification[]>;
  
  // Coach Review operations
  createCoachReview(data: InsertCoachReview): Promise<CoachReview>;
  getCoachReviews(coachId: number): Promise<CoachReview[]>;
  
  // Coaching Session operations
  createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSessions(coachId: number): Promise<CoachingSession[]>;
  
  // Admin Coach Role Management operations
  updateCoachRoles(coachId: number, roleData: any): Promise<void>;
  getAllCoaches(): Promise<any[]>;
  logAdminAction(actionData: any): Promise<void>;
  
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
  
  // Calendar operations
  getWeeklyClassSchedule(centerId: number): Promise<any[]>;
  getClassesForDate(centerId: number, date: Date): Promise<any[]>;
  getClassDetails(classId: number): Promise<any>;
  getClassEnrollment(classId: number, playerId: number): Promise<any>;
  enrollInClass(enrollment: any): Promise<any>;
  cancelClassEnrollment(classId: number, playerId: number): Promise<boolean>;
  getUserEnrolledClasses(playerId: number, upcomingOnly: boolean): Promise<any[]>;
  createClassTemplate(template: any): Promise<any>;
  generateClassInstances(templateId: number, startDate: Date, endDate: Date, skipDates: Date[]): Promise<any[]>;
  getAvailableCoachesAtCenter(centerId: number): Promise<any[]>;
  getTrainingCenter(centerId: number): Promise<any>;
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
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    });
  }

  // Database access method for community operations
  getDb(): any {
    return db;
  }

  // Community operations - delegate to community storage implementation
  async getCommunities(filters?: any): Promise<any[]> {
    return await communityStorageImplementation.getCommunities.call({ getDb: () => db }, filters);
  }

  async getRecommendedCommunities(userId: number, limit?: number): Promise<any[]> {
    return await communityStorageImplementation.getRecommendedCommunities.call({ getDb: () => db }, userId, limit);
  }

  async getCommunityById(id: number): Promise<any> {
    return await communityStorageImplementation.getCommunityById.call({ getDb: () => db }, id);
  }

  async getCommunitiesByCreator(userId: number): Promise<any[]> {
    return await communityStorageImplementation.getCommunitiesByCreator.call({ getDb: () => db }, userId);
  }

  async createCommunity(communityData: any): Promise<any> {
    return await communityStorageImplementation.createCommunity.call({ getDb: () => db }, communityData);
  }

  async updateCommunity(id: number, updates: any): Promise<any> {
    return await communityStorageImplementation.updateCommunity.call({ getDb: () => db }, id, updates);
  }

  async incrementCommunityMemberCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.incrementCommunityMemberCount.call({ getDb: () => db }, communityId);
  }

  async decrementCommunityMemberCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.decrementCommunityMemberCount.call({ getDb: () => db }, communityId);
  }

  async incrementCommunityEventCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.incrementCommunityEventCount.call({ getDb: () => db }, communityId);
  }

  async decrementCommunityEventCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.decrementCommunityEventCount.call({ getDb: () => db }, communityId);
  }

  async incrementCommunityPostCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.incrementCommunityPostCount.call({ getDb: () => db }, communityId);
  }

  async decrementCommunityPostCount(communityId: number): Promise<void> {
    return await communityStorageImplementation.decrementCommunityPostCount.call({ getDb: () => db }, communityId);
  }

  async getCommunityMembers(communityId: number): Promise<any[]> {
    return await communityStorageImplementation.getCommunityMembers.call({ getDb: () => db }, communityId);
  }

  async getCommunityMembership(communityId: number, userId: number): Promise<any> {
    return await communityStorageImplementation.getCommunityMembership.call({ getDb: () => db }, communityId, userId);
  }

  async getCommunityMembershipsByUserId(userId: number): Promise<any[]> {
    return await communityStorageImplementation.getCommunityMembershipsByUserId.call({ getDb: () => db }, userId);
  }

  async createCommunityMember(memberData: any): Promise<any> {
    return await communityStorageImplementation.createCommunityMember.call({ getDb: () => db }, memberData);
  }

  async updateCommunityMembership(communityId: number, userId: number, updates: any): Promise<any> {
    return await communityStorageImplementation.updateCommunityMembership.call({ getDb: () => db }, communityId, userId, updates);
  }

  async deleteCommunityMembership(communityId: number, userId: number): Promise<boolean> {
    return await communityStorageImplementation.deleteCommunityMembership.call({ getDb: () => db }, communityId, userId);
  }

  async getCommunityAdminCount(communityId: number): Promise<number> {
    return await communityStorageImplementation.getCommunityAdminCount.call({ getDb: () => db }, communityId);
  }

  async getCommunityPosts(communityId: number, options?: any): Promise<any[]> {
    return await communityStorageImplementation.getCommunityPosts.call({ getDb: () => db }, communityId, options);
  }

  async getCommunityPostById(postId: number): Promise<any> {
    return await communityStorageImplementation.getCommunityPostById.call({ getDb: () => db }, postId);
  }

  async createCommunityPost(postData: any): Promise<any> {
    return await communityStorageImplementation.createCommunityPost.call({ getDb: () => db }, postData);
  }

  async updateCommunityPost(postId: number, updates: any): Promise<any> {
    return await communityStorageImplementation.updateCommunityPost.call({ getDb: () => db }, postId, updates);
  }

  async deleteCommunityPost(postId: number): Promise<boolean> {
    return await communityStorageImplementation.deleteCommunityPost.call({ getDb: () => db }, postId);
  }

  async incrementPostCommentCount(postId: number): Promise<void> {
    return await communityStorageImplementation.incrementPostCommentCount.call({ getDb: () => db }, postId);
  }

  async decrementPostCommentCount(postId: number): Promise<void> {
    return await communityStorageImplementation.decrementPostCommentCount.call({ getDb: () => db }, postId);
  }

  async incrementPostLikeCount(postId: number): Promise<void> {
    return await communityStorageImplementation.incrementPostLikeCount.call({ getDb: () => db }, postId);
  }

  async decrementPostLikeCount(postId: number): Promise<void> {
    return await communityStorageImplementation.decrementPostLikeCount.call({ getDb: () => db }, postId);
  }

  async getCommunityEvents(communityId: number, options?: any): Promise<any[]> {
    return await communityStorageImplementation.getCommunityEvents.call({ getDb: () => db }, communityId, options);
  }

  async getCommunityEventById(eventId: number): Promise<any> {
    return await communityStorageImplementation.getCommunityEventById.call({ getDb: () => db }, eventId);
  }

  async createCommunityEvent(eventData: any): Promise<any> {
    return await communityStorageImplementation.createCommunityEvent.call({ getDb: () => db }, eventData);
  }

  async updateCommunityEvent(eventId: number, updates: any): Promise<any> {
    return await communityStorageImplementation.updateCommunityEvent.call({ getDb: () => db }, eventId, updates);
  }

  async deleteCommunityEvent(eventId: number): Promise<boolean> {
    return await communityStorageImplementation.deleteCommunityEvent.call({ getDb: () => db }, eventId);
  }

  async incrementEventAttendeeCount(eventId: number): Promise<void> {
    return await communityStorageImplementation.incrementEventAttendeeCount.call({ getDb: () => db }, eventId);
  }

  async decrementEventAttendeeCount(eventId: number): Promise<void> {
    return await communityStorageImplementation.decrementEventAttendeeCount.call({ getDb: () => db }, eventId);
  }

  async getEventAttendees(eventId: number): Promise<any[]> {
    return await communityStorageImplementation.getEventAttendees.call({ getDb: () => db }, eventId);
  }

  async getEventAttendance(eventId: number, userId: number): Promise<any> {
    return await communityStorageImplementation.getEventAttendance.call({ getDb: () => db }, eventId, userId);
  }

  async createEventAttendance(attendanceData: any): Promise<any> {
    return await communityStorageImplementation.createEventAttendance.call({ getDb: () => db }, attendanceData);
  }

  async updateEventAttendance(eventId: number, userId: number, updates: any): Promise<any> {
    return await communityStorageImplementation.updateEventAttendance.call({ getDb: () => db }, eventId, userId, updates);
  }

  async cancelEventAttendance(eventId: number, userId: number): Promise<boolean> {
    return await communityStorageImplementation.cancelEventAttendance.call({ getDb: () => db }, eventId, userId);
  }

  async getPostComments(postId: number): Promise<any[]> {
    return await communityStorageImplementation.getPostComments.call({ getDb: () => db }, postId);
  }

  async createCommunityPostComment(commentData: any): Promise<any> {
    return await communityStorageImplementation.createCommunityPostComment.call({ getDb: () => db }, commentData);
  }

  async deleteComment(commentId: number): Promise<boolean> {
    return await communityStorageImplementation.deleteComment.call({ getDb: () => db }, commentId);
  }

  async getPostLike(postId: number, userId: number): Promise<any> {
    return await communityStorageImplementation.getPostLike.call({ getDb: () => db }, postId, userId);
  }

  async createPostLike(likeData: any): Promise<any> {
    return await communityStorageImplementation.createPostLike.call({ getDb: () => db }, likeData);
  }

  async deletePostLike(postId: number, userId: number): Promise<boolean> {
    return await communityStorageImplementation.deletePostLike.call({ getDb: () => db }, postId, userId);
  }

  async createCommunityJoinRequest(requestData: any): Promise<any> {
    return await communityStorageImplementation.createCommunityJoinRequest.call({ getDb: () => db }, requestData);
  }

  async getCommunityJoinRequests(communityId: number): Promise<any[]> {
    return await communityStorageImplementation.getCommunityJoinRequests.call({ getDb: () => db }, communityId);
  }

  async updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any> {
    return await communityStorageImplementation.updateJoinRequestStatus.call({ getDb: () => db }, requestId, status, reviewedByUserId);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPassportCode(passportCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passportCode, passportCode));
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

  async searchPlayers(query: string): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const results = await db.select()
      .from(users)
      .where(
        or(
          sql`LOWER(${users.username}) LIKE ${searchTerm}`,
          sql`LOWER(${users.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.passportCode}) LIKE ${searchTerm}`,
          sql`LOWER(CONCAT(${users.firstName}, ' ', ${users.lastName})) LIKE ${searchTerm}`
        )
      )
      .limit(20)
      .orderBy(users.username);
    
    return results;
  }

  // Password reset operations - implemented as memory store for now
  private passwordResetTokens = new Map<string, { email: string; expiresAt: Date }>();

  async createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<void> {
    this.passwordResetTokens.set(token, { email, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<{ email: string; expiresAt: Date } | undefined> {
    const tokenData = this.passwordResetTokens.get(token);
    if (tokenData && tokenData.expiresAt > new Date()) {
      return tokenData;
    }
    return undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    this.passwordResetTokens.delete(token);
  }

  async getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined> {
    return undefined; // Placeholder
  }

  async updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking> {
    return {} as ProfileCompletionTracking; // Placeholder
  }

  async getUserRoles(userId: number): Promise<any[]> {
    // Return empty roles array for new users - no special roles assigned
    return [];
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

  // Training Center operations
  async getTrainingCenterByQrCode(qrCode: string): Promise<any> {
    const [center] = await db.execute(sql`
      SELECT * FROM training_centers 
      WHERE qr_code = ${qrCode} AND is_active = true
    `);
    return center;
  }

  async getActiveTrainingCenters(): Promise<any[]> {
    const centers = await db.execute(sql`
      SELECT * FROM training_centers 
      WHERE is_active = true
      ORDER BY name
    `);
    return centers;
  }

  async getAvailableCoach(centerId: number): Promise<any> {
    const [coach] = await db.execute(sql`
      SELECT u.* FROM users u
      WHERE u.is_coach = true
      AND u.id NOT IN (
        SELECT DISTINCT cs.coach_id 
        FROM coaching_sessions cs 
        WHERE cs.center_id = ${centerId} 
        AND cs.status = 'active'
      )
      LIMIT 1
    `);
    return coach;
  }

  async getCoaches(): Promise<User[]> {
    const coaches = await db.select()
      .from(users)
      .where(eq(users.isCoach, true))
      .orderBy(asc(users.firstName));
    return coaches;
  }

  async getAvailableCoachesAtCenter(centerId: number): Promise<any[]> {
    // Return mock coaches with comprehensive data for testing
    return [
      {
        id: 2,
        name: "Coach Alex",
        fullName: "Alexandra Rodriguez",
        displayName: "Coach Alex",
        username: "coach_alex",
        profileImage: "/uploads/coaches/alexandra-rodriguez.jpg",
        specializations: ["Forehand Technique", "Strategy", "Doubles Play"],
        hourlyRate: 75,
        experience: "8 years",
        certifications: ["USAPA Certified", "PPR Level 3"],
        accolades: ["2023 Regional Coach of the Year", "Tournament Champion 2022", "Advanced Coaching Certification"]
      },
      {
        id: 3,
        name: "Coach Maria",
        fullName: "Maria Santos",
        displayName: "Coach Maria",
        username: "coach_maria",
        profileImage: "/uploads/coaches/maria-santos.jpg",
        specializations: ["Serve Development", "Mental Game", "Tournament Prep"],
        hourlyRate: 85,
        experience: "12 years",
        certifications: ["USAPA Master Trainer", "Sports Psychology Certified"],
        accolades: ["National Tournament Finalist", "Mental Performance Specialist", "Elite Coach Recognition"]
      },
      {
        id: 4,
        name: "Coach David",
        fullName: "David Thompson",
        displayName: "Coach David",
        username: "coach_david",
        profileImage: "/uploads/coaches/david-thompson.jpg",
        specializations: ["Backhand Fundamentals", "Footwork", "Beginner Training"],
        hourlyRate: 65,
        experience: "5 years",
        certifications: ["USAPA Certified", "Youth Training Specialist"],
        accolades: ["Rising Coach Award 2023", "Community Impact Recognition", "Skills Development Expert"]
      }
    ];
  }

  async getTrainingCenter(centerId: number): Promise<any> {
    // Return mock training center data
    return {
      id: centerId,
      name: "Community Sports Hub",
      address: "123 Sports Complex Drive",
      city: "Singapore",
      qrCode: "TC001-SG",
      courtCount: 6,
      operatingHours: {
        weekday: "6:00 AM - 10:00 PM",
        weekend: "7:00 AM - 9:00 PM"
      }
    };
  }

  async getActiveSessionForPlayer(playerId: number): Promise<any> {
    const [session] = await db.execute(sql`
      SELECT cs.*, tc.name as center_name, u.display_name as coach_name
      FROM coaching_sessions cs
      JOIN training_centers tc ON cs.center_id = tc.id
      JOIN users u ON cs.coach_id = u.id
      WHERE cs.player_id = ${playerId} 
      AND cs.status = 'active'
    `);
    return session;
  }

  async createCoachingSession(sessionData: any): Promise<any> {
    const [session] = await db.execute(sql`
      INSERT INTO coaching_sessions (
        player_id, coach_id, center_id, session_type, 
        check_in_time, status
      ) VALUES (
        ${sessionData.playerId}, ${sessionData.coachId}, ${sessionData.centerId},
        ${sessionData.sessionType}, ${sessionData.checkInTime.toISOString()}, 
        ${sessionData.status}
      ) RETURNING *
    `);
    return session;
  }

  async getCoachingSessionById(sessionId: number): Promise<any> {
    const [session] = await db.execute(sql`
      SELECT * FROM coaching_sessions WHERE id = ${sessionId}
    `);
    return session;
  }

  async updateCoachingSession(sessionId: number, updateData: any): Promise<any> {
    const updates = [];
    const values = [];
    
    if (updateData.playerGoals) {
      updates.push('player_goals = ?');
      values.push(updateData.playerGoals);
    }
    if (updateData.skillsFocused) {
      updates.push('skills_focused = ?');
      values.push(JSON.stringify(updateData.skillsFocused));
    }
    if (updateData.status) {
      updates.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.checkOutTime) {
      updates.push('check_out_time = ?');
      values.push(updateData.checkOutTime.toISOString());
    }
    if (updateData.actualDuration) {
      updates.push('actual_duration = ?');
      values.push(updateData.actualDuration);
    }
    if (updateData.coachObservations) {
      updates.push('coach_observations = ?');
      values.push(updateData.coachObservations);
    }
    if (updateData.sessionNotes) {
      updates.push('session_notes = ?');
      values.push(updateData.sessionNotes);
    }

    values.push(sessionId);
    
    const [session] = await db.execute(sql`
      UPDATE coaching_sessions 
      SET ${sql.raw(updates.join(', '))} 
      WHERE id = ${sessionId} 
      RETURNING *
    `);
    return session;
  }

  async getChallengesBySkillLevel(skillLevel: string): Promise<any[]> {
    const challenges = await db.execute(sql`
      SELECT * FROM challenges 
      WHERE skill_level = ${skillLevel} AND is_active = true
      ORDER BY difficulty_rating, name
    `);
    return challenges;
  }

  async getChallengeById(challengeId: number): Promise<any> {
    const [challenge] = await db.execute(sql`
      SELECT * FROM challenges WHERE id = ${challengeId}
    `);
    return challenge;
  }

  async createChallengeCompletion(completionData: any): Promise<any> {
    const [completion] = await db.execute(sql`
      INSERT INTO challenge_completions (
        session_id, challenge_id, player_id, coach_id,
        is_completed, actual_result, success_rate, time_spent,
        coach_notes, improvement_areas, next_recommendations, completed_at
      ) VALUES (
        ${completionData.sessionId}, ${completionData.challengeId}, 
        ${completionData.playerId}, ${completionData.coachId},
        ${completionData.isCompleted}, ${JSON.stringify(completionData.actualResult)},
        ${completionData.successRate}, ${completionData.timeSpent},
        ${completionData.coachNotes}, ${JSON.stringify(completionData.improvementAreas)},
        ${completionData.nextRecommendations}, ${completionData.completedAt.toISOString()}
      ) RETURNING *
    `);
    return completion;
  }

  async awardPlayerBadge(badgeData: any): Promise<any> {
    const [badge] = await db.execute(sql`
      INSERT INTO player_badges (
        player_id, badge_name, session_id, challenge_id, coach_id, earned_at
      ) VALUES (
        ${badgeData.playerId}, ${badgeData.badgeName}, ${badgeData.sessionId},
        ${badgeData.challengeId}, ${badgeData.coachId}, ${badgeData.earnedAt.toISOString()}
      ) RETURNING *
    `);
    return badge;
  }

  async getSessionSummary(sessionId: number): Promise<any> {
    const summary = await db.execute(sql`
      SELECT 
        cs.*,
        COUNT(cc.id) as challenges_completed,
        COUNT(CASE WHEN cc.is_completed = true THEN 1 END) as challenges_successful,
        COUNT(pb.id) as badges_earned
      FROM coaching_sessions cs
      LEFT JOIN challenge_completions cc ON cs.id = cc.session_id
      LEFT JOIN player_badges pb ON cs.id = pb.session_id
      WHERE cs.id = ${sessionId}
      GROUP BY cs.id
    `);
    return summary[0];
  }

  async getPlayerTrainingProgress(playerId: number): Promise<any> {
    const progress = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cc.id) as total_challenges_completed,
        ROUND(AVG(CASE WHEN cc.is_completed = true THEN 100.0 ELSE 0.0 END), 2) as success_rate,
        COUNT(pb.id) as badges_earned
      FROM coaching_sessions cs
      LEFT JOIN challenge_completions cc ON cs.id = cc.session_id
      LEFT JOIN player_badges pb ON cs.id = pb.session_id
      WHERE cs.player_id = ${playerId}
    `);
    
    const recentSessions = await db.execute(sql`
      SELECT cs.*, tc.name as center_name, u.display_name as coach_name
      FROM coaching_sessions cs
      JOIN training_centers tc ON cs.center_id = tc.id
      JOIN users u ON cs.coach_id = u.id
      WHERE cs.player_id = ${playerId}
      ORDER BY cs.check_in_time DESC
      LIMIT 5
    `);

    return {
      ...progress[0],
      recentSessions,
      skillProgression: []
    };
  }

  // Calendar operations
  async getWeeklyClassSchedule(centerId: number): Promise<any[]> {
    const templates = await db.execute(sql`
      SELECT 
        ct.*,
        u.display_name as coach_name
      FROM class_templates ct
      JOIN users u ON ct.coach_id = u.id
      WHERE ct.center_id = ${centerId} 
      AND ct.is_active = true
      ORDER BY ct.day_of_week, ct.start_time
    `);
    return templates;
  }

  async getClassesForDate(centerId: number, date: Date): Promise<any[]> {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    const classes = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        ct.skill_level,
        ct.max_participants,
        u.display_name as coach_name,
        COUNT(ce.id) as current_enrollment
      FROM class_instances ci
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      LEFT JOIN class_enrollments ce ON ci.id = ce.class_instance_id 
        AND ce.attendance_status != 'cancelled'
      WHERE ci.center_id = ${centerId}
      AND DATE(ci.class_date) = ${dateStr}
      AND ci.status = 'scheduled'
      GROUP BY ci.id, ct.id, u.id
      ORDER BY ci.start_time
    `);
    return classes;
  }

  async getClassDetails(classId: number): Promise<any> {
    const classDetails = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        ct.skill_level,
        ct.max_participants,
        ct.price_per_session,
        u.display_name as coach_name,
        tc.name as center_name,
        COUNT(ce.id) as current_enrollment
      FROM class_instances ci
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      JOIN training_centers tc ON ci.center_id = tc.id
      LEFT JOIN class_enrollments ce ON ci.id = ce.class_instance_id 
        AND ce.attendance_status != 'cancelled'
      WHERE ci.id = ${classId}
      GROUP BY ci.id, ct.id, u.id, tc.id
    `);
    return classDetails[0];
  }

  async getClassEnrollment(classId: number, playerId: number): Promise<any> {
    const enrollment = await db.execute(sql`
      SELECT * FROM class_enrollments 
      WHERE class_instance_id = ${classId} 
      AND player_id = ${playerId}
      AND attendance_status != 'cancelled'
    `);
    return enrollment[0];
  }

  async enrollInClass(enrollment: any): Promise<any> {
    const [newEnrollment] = await db.execute(sql`
      INSERT INTO class_enrollments 
      (class_instance_id, player_id, enrollment_type)
      VALUES (${enrollment.classInstanceId}, ${enrollment.playerId}, ${enrollment.enrollmentType})
      RETURNING *
    `);

    // Update class enrollment count
    await db.execute(sql`
      UPDATE class_instances 
      SET current_enrollment = current_enrollment + 1
      WHERE id = ${enrollment.classInstanceId}
    `);

    return newEnrollment;
  }

  async cancelClassEnrollment(classId: number, playerId: number): Promise<boolean> {
    const result = await db.execute(sql`
      UPDATE class_enrollments 
      SET attendance_status = 'cancelled'
      WHERE class_instance_id = ${classId} 
      AND player_id = ${playerId}
      AND attendance_status != 'cancelled'
    `);

    if (result.rowCount > 0) {
      // Update class enrollment count
      await db.execute(sql`
        UPDATE class_instances 
        SET current_enrollment = current_enrollment - 1
        WHERE id = ${classId}
      `);
      return true;
    }
    return false;
  }

  async getUserEnrolledClasses(playerId: number, upcomingOnly: boolean): Promise<any[]> {
    const timeFilter = upcomingOnly ? sql`AND ci.start_time > NOW()` : sql``;
    
    const classes = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        u.display_name as coach_name,
        tc.name as center_name,
        ce.enrollment_type,
        ce.enrolled_at,
        ce.attendance_status
      FROM class_enrollments ce
      JOIN class_instances ci ON ce.class_instance_id = ci.id
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      JOIN training_centers tc ON ci.center_id = tc.id
      WHERE ce.player_id = ${playerId}
      AND ce.attendance_status != 'cancelled'
      ${timeFilter}
      ORDER BY ci.start_time
    `);
    return classes;
  }

  async createClassTemplate(template: any): Promise<any> {
    const [newTemplate] = await db.execute(sql`
      INSERT INTO class_templates 
      (center_id, coach_id, name, description, category, skill_level, 
       max_participants, duration, price_per_session, goals, 
       day_of_week, start_time, end_time)
      VALUES (${template.centerId}, ${template.coachId}, ${template.name}, 
              ${template.description}, ${template.category}, ${template.skillLevel},
              ${template.maxParticipants}, ${template.duration}, ${template.pricePerSession},
              ${JSON.stringify(template.goals)}, ${template.dayOfWeek}, 
              ${template.startTime}, ${template.endTime})
      RETURNING *
    `);
    return newTemplate;
  }

  async generateClassInstances(templateId: number, startDate: Date, endDate: Date, skipDates: Date[]): Promise<any[]> {
    // Get template details
    const template = await db.execute(sql`
      SELECT * FROM class_templates WHERE id = ${templateId}
    `);
    
    if (!template[0]) return [];
    
    const templateData = template[0];
    const instances = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (current.getDay() === templateData.day_of_week) {
        const shouldSkip = skipDates.some(skipDate => 
          skipDate.toDateString() === current.toDateString()
        );
        
        if (!shouldSkip) {
          const startTime = new Date(current);
          const [hours, minutes] = templateData.start_time.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + templateData.duration);

          const [instance] = await db.execute(sql`
            INSERT INTO class_instances 
            (template_id, center_id, coach_id, class_date, start_time, end_time, max_participants)
            VALUES (${templateId}, ${templateData.center_id}, ${templateData.coach_id},
                    ${current.toISOString()}, ${startTime.toISOString()}, ${endTime.toISOString()},
                    ${templateData.max_participants})
            RETURNING *
          `);
          instances.push(instance);
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return instances;
  }

  // Coach Application operations
  async createCoachApplication(data: InsertCoachApplication): Promise<CoachApplication> {
    const result = await db.execute(sql`
      INSERT INTO coach_applications (
        user_id, coach_type, application_status, experience_years, teaching_philosophy,
        specializations, availability_data, previous_experience, ref_contacts,
        background_check_consent, insurance_details, emergency_contact,
        submitted_at, created_at, updated_at
      ) VALUES (
        ${data.userId}, ${data.coachType || 'independent'}, ${data.applicationStatus || 'pending'},
        ${data.experienceYears}, ${data.teachingPhilosophy},
        ${JSON.stringify(data.specializations)}, ${JSON.stringify(data.availabilityData)},
        ${data.previousExperience || ''}, ${JSON.stringify(data.refContacts || [])},
        ${data.backgroundCheckConsent}, ${JSON.stringify(data.insuranceDetails || {})},
        ${JSON.stringify(data.emergencyContact || {})},
        NOW(), NOW(), NOW()
      ) RETURNING *
    `);
    return result.rows[0] as any;
  }

  async getCoachApplication(id: number): Promise<CoachApplication | undefined> {
    const result = await db.execute(sql`
      SELECT * FROM coach_applications WHERE id = ${id}
    `);
    return result.rows[0] as any;
  }

  async getCoachApplicationByUserId(userId: number): Promise<CoachApplication | undefined> {
    const result = await db.execute(sql`
      SELECT * FROM coach_applications 
      WHERE user_id = ${userId} 
      ORDER BY submitted_at DESC 
      LIMIT 1
    `);
    return result.rows[0] as any;
  }

  async updateCoachApplicationStatus(id: number, status: string, reviewerId?: number, rejectionReason?: string): Promise<CoachApplication> {
    const result = await db.execute(sql`
      UPDATE coach_applications 
      SET application_status = ${status}, 
          reviewed_at = NOW(), 
          updated_at = NOW(),
          reviewer_id = ${reviewerId || null},
          rejection_reason = ${rejectionReason || null}
      WHERE id = ${id} 
      RETURNING *
    `);
    return result.rows[0] as any;
  }

  // Coach Profile operations
  async createCoachProfile(data: InsertCoachProfile): Promise<CoachProfile> {
    const [profile] = await db
      .insert(coachProfiles)
      .values({
        ...data,
        approvedAt: new Date(),
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return profile;
  }

  async getCoachProfile(userId: number): Promise<CoachProfile | undefined> {
    const [profile] = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId));
    return profile;
  }

  async updateCoachProfile(userId: number, data: Partial<InsertCoachProfile>): Promise<CoachProfile> {
    const [profile] = await db
      .update(coachProfiles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(coachProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Coach Certification operations
  async addCoachCertification(data: InsertCoachCertification): Promise<CoachCertification> {
    const [certification] = await db
      .insert(coachCertifications)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return certification;
  }

  async getCoachCertifications(applicationId: number): Promise<CoachCertification[]> {
    return db
      .select()
      .from(coachCertifications)
      .where(eq(coachCertifications.applicationId, applicationId))
      .orderBy(desc(coachCertifications.createdAt));
  }

  // Coach Review operations
  async createCoachReview(data: InsertCoachReview): Promise<CoachReview> {
    const [review] = await db
      .insert(coachReviews)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return review;
  }

  async getCoachReviews(coachId: number): Promise<CoachReview[]> {
    return db
      .select()
      .from(coachReviews)
      .where(eq(coachReviews.coachId, coachId))
      .orderBy(desc(coachReviews.createdAt));
  }

  // Coaching Session operations
  async createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession> {
    const [session] = await db
      .insert(coachingSessions)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return session;
  }

  async getCoachingSessions(coachId: number): Promise<CoachingSession[]> {
    return db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.coachId, coachId))
      .orderBy(desc(coachingSessions.scheduledAt));
  }

  async getCoaches(): Promise<User[]> {
    // Get users who have approved coach profiles
    const coaches = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        passportCode: users.passportCode,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .innerJoin(coachProfiles, eq(users.id, coachProfiles.userId))
      .where(eq(coachProfiles.isActive, true));
    
    return coaches;
  }

  // Admin Coach Role Management Methods
  async updateCoachRoles(coachId: number, roleData: any): Promise<void> {
    try {
      // Get the coach profile first
      const [profile] = await db
        .select()
        .from(coachProfiles)
        .where(eq(coachProfiles.userId, coachId));

      if (!profile) {
        throw new Error('Coach profile not found');
      }

      // Update coach profile with new role information
      const activeRoles = roleData.roles.map((r: any) => r.roleType);
      const primaryRole = activeRoles[0] || 'independent';

      await db
        .update(coachProfiles)
        .set({
          coachType: primaryRole,
          updatedAt: new Date()
        })
        .where(eq(coachProfiles.userId, coachId));

      // If facility role is assigned, create facility assignment record
      if (activeRoles.includes('facility') && roleData.facilityId) {
        await db.execute(sql`
          INSERT INTO coach_facility_assignments (coach_id, facility_id, assignment_date, is_active, notes)
          VALUES (${coachId}, ${roleData.facilityId}, NOW(), true, ${roleData.notes || ''})
          ON CONFLICT (coach_id, facility_id) 
          DO UPDATE SET is_active = true, notes = EXCLUDED.notes, updated_at = NOW()
        `);
      }

      console.log(`Coach roles updated for user ${coachId}: ${activeRoles.join(', ')}`);
    } catch (error) {
      console.error('Error updating coach roles:', error);
      throw error;
    }
  }

  // Admin coach management methods
  async getAllCoachApplications(): Promise<any[]> {
    try {
      const applications = await db.execute(sql`
        SELECT 
          ca.*,
          u.username as user_name,
          u.email as user_email
        FROM coach_applications ca
        LEFT JOIN users u ON ca.user_id = u.id
        ORDER BY ca.submitted_at DESC
      `);
      
      return applications.rows;
    } catch (error) {
      console.error('Error fetching coach applications:', error);
      throw error;
    }
  }

  async updateCoachApplicationStatus(applicationId: number, statusData: any): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE coach_applications 
        SET 
          application_status = ${statusData.status},
          admin_notes = ${statusData.adminNotes || ''},
          reviewed_by = ${statusData.reviewedBy},
          reviewed_at = ${statusData.reviewedAt}
        WHERE id = ${applicationId}
      `);
    } catch (error) {
      console.error('Error updating coach application status:', error);
      throw error;
    }
  }

  async createCoachProfile(profileData: any): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO coach_profiles (
          user_id, name, bio, specialties, certifications, 
          experience_years, rating, total_reviews, hourly_rate,
          is_verified, availability_schedule, created_at, updated_at
        ) VALUES (
          ${profileData.userId},
          ${profileData.name},
          ${profileData.bio},
          ${JSON.stringify(profileData.specialties)},
          ${JSON.stringify(profileData.certifications)},
          ${profileData.experienceYears},
          ${profileData.rating},
          ${profileData.totalReviews},
          ${profileData.hourlyRate},
          ${profileData.isVerified},
          ${JSON.stringify(profileData.availabilitySchedule)},
          NOW(),
          NOW()
        )
      `);
    } catch (error) {
      console.error('Error creating coach profile:', error);
      throw error;
    }
  }

  async getCoachPerformanceMetrics(coachId: number): Promise<any> {
    try {
      const performance = await db.execute(sql`
        SELECT 
          cp.*,
          u.username,
          u.email,
          COUNT(DISTINCT cs.id) as total_sessions,
          AVG(cr.rating) as average_rating,
          COUNT(DISTINCT cr.id) as total_reviews
        FROM coach_profiles cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN coaching_sessions cs ON cp.user_id = cs.coach_id
        LEFT JOIN coach_reviews cr ON cp.user_id = cr.coach_id
        WHERE cp.user_id = ${coachId}
        GROUP BY cp.id, u.username, u.email
      `);
      
      return performance.rows[0] || null;
    } catch (error) {
      console.error('Error fetching coach performance metrics:', error);
      throw error;
    }
  }

  async updateCoachVerificationStatus(coachId: number, verificationData: any): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE coach_profiles 
        SET 
          is_verified = ${verificationData.isVerified},
          updated_at = NOW()
        WHERE user_id = ${coachId}
      `);
    } catch (error) {
      console.error('Error updating coach verification status:', error);
      throw error;
    }
  }

  async getAllCoachesWithDetails(): Promise<any[]> {
    try {
      const coaches = await db.execute(sql`
        SELECT 
          cp.*,
          u.username,
          u.email,
          u.display_name,
          ARRAY_AGG(DISTINCT cfa.facility_id) FILTER (WHERE cfa.is_active = true) as facility_assignments
        FROM coach_profiles cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN coach_facility_assignments cfa ON cp.user_id = cfa.coach_id AND cfa.is_active = true
        GROUP BY cp.id, u.username, u.email, u.display_name
        ORDER BY cp.created_at DESC
      `);
      
      return coaches.rows;
    } catch (error) {
      console.error('Error fetching coaches with details:', error);
      throw error;
    }
  }

  async assignCoachToFacility(assignmentData: any): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO coach_facility_assignments (
          coach_id, facility_id, assignment_date, is_active, notes, created_at, updated_at
        ) VALUES (
          ${assignmentData.coachId},
          ${assignmentData.facilityId},
          ${assignmentData.assignmentDate},
          ${assignmentData.isActive},
          ${assignmentData.notes},
          NOW(),
          NOW()
        )
        ON CONFLICT (coach_id, facility_id) 
        DO UPDATE SET 
          is_active = EXCLUDED.is_active,
          notes = EXCLUDED.notes,
          updated_at = NOW()
      `);
    } catch (error) {
      console.error('Error assigning coach to facility:', error);
      throw error;
    }
  }

  async removeCoachFromFacility(coachId: number, facilityId: number): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE coach_facility_assignments 
        SET is_active = false, updated_at = NOW()
        WHERE coach_id = ${coachId} AND facility_id = ${facilityId}
      `);
    } catch (error) {
      console.error('Error removing coach from facility:', error);
      throw error;
    }
  }

  async logAdminAction(actionData: any): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO admin_action_logs (
          admin_id, action_type, target_id, target_type, details, timestamp
        ) VALUES (
          ${actionData.adminId},
          ${actionData.actionType},
          ${actionData.targetId},
          ${actionData.targetType},
          ${JSON.stringify(actionData.details)},
          NOW()
        )
      `);
    } catch (error) {
      console.error('Error logging admin action:', error);
      throw error;
    }
  }

  async getAllCoaches(): Promise<any[]> {
    try {
      const coaches = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          u.display_name,
          u.email,
          u.avatar_url,
          cp.name,
          cp.bio,
          cp.specialties,
          cp.is_verified,
          cp.rating,
          cp.total_reviews,
          cp.created_at,
          ARRAY_AGG(DISTINCT cfa.facility_id) FILTER (WHERE cfa.is_active = true) as facility_assignments
        FROM users u
        INNER JOIN coach_profiles cp ON u.id = cp.user_id
        LEFT JOIN coach_facility_assignments cfa ON u.id = cfa.coach_id AND cfa.is_active = true
        WHERE cp.is_active = true
        GROUP BY u.id, u.username, u.first_name, u.last_name, u.email, u.profile_image_url,
                 cp.coach_type, cp.is_active, cp.average_rating, cp.total_sessions, cp.created_at
        ORDER BY cp.created_at DESC
      `);

      return coaches.rows.map((coach: any) => ({
        id: coach.id,
        userId: coach.id,
        username: coach.username,
        displayName: coach.display_name,
        email: coach.email,
        profileImageUrl: coach.profile_image_url,
        coachType: coach.coach_type,
        isActive: coach.is_active,
        averageRating: coach.average_rating,
        totalSessions: coach.total_sessions,
        createdAt: coach.created_at,
        facilityAssignments: coach.facility_assignments || []
      }));
    } catch (error) {
      console.error('Error fetching all coaches:', error);
      return [];
    }
  }

  async logAdminAction(actionData: any): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO admin_action_logs (admin_id, action_type, target_id, target_type, details, timestamp)
        VALUES (${actionData.adminId}, ${actionData.action}, ${actionData.targetId}, 'coach', ${JSON.stringify(actionData.details)}, NOW())
      `);
      console.log(`Admin action logged: ${actionData.action} by admin ${actionData.adminId}`);
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw error for logging failure
    }
  }
}

export const storage = new DatabaseStorage();