import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  matches, type Match, type InsertMatch,
  type XpTransaction, type InsertXpTransaction
} from "@shared/schema";

// Import SAGE coaching schema (PKL-278651-COACH-0001-CORE - Skills Assessment & Growth Engine)
import {
  coachingSessions, coachingInsights, trainingPlans, trainingExercises, 
  coachingContentLibrary, userProgressLogs, coachingConversations, coachingMessages,
  coachingProfiles, journalEntries, journalPrompts, journalReflections,
  type CoachingSession, type InsertCoachingSession,
  type CoachingInsight, type InsertCoachingInsight,
  type TrainingPlan, type InsertTrainingPlan,
  type TrainingExercise, type InsertTrainingExercise,
  type CoachingContentLibrary, type InsertCoachingContentLibrary,
  type UserProgressLog, type InsertUserProgressLog,
  type CoachingConversation, type InsertCoachingConversation,
  type CoachingMessage, type InsertCoachingMessage,
  type CoachingProfile, type InsertCoachingProfile,
  type JournalEntry, type InsertJournalEntry,
  type JournalPrompt, type InsertJournalPrompt,
  type JournalReflection, type InsertJournalReflection,
  DimensionCodes, type DimensionCode
} from "@shared/schema/sage";

// Import SAGE Concierge schema (PKL-278651-SAGE-0015-CONCIERGE - SAGE Platform Concierge)
import {
  conciergeInteractions, conciergeRecommendations, conciergeNavigationStats,
  type ConciergeInteraction, type InsertConciergeInteraction, 
  type ConciergeRecommendation, type InsertConciergeRecommendation,
  type ConciergeNavigationStat, type InsertConciergeNavigationStat
} from "@shared/schema/sage-concierge";

// Import XP tables from their new modular location
import { xpTransactions } from "@shared/schema/xp";

// Import user roles schema (PKL-278651-AUTH-0016-PROLES - Persistent Role Management)
import {
  roles, userRoles, permissions, rolePermissions, roleAuditLogs,
  type Role, type InsertRole,
  type UserRole as DbUserRole, type InsertUserRole,
  type Permission, type InsertPermission,
  type RolePermission, type InsertRolePermission,
  type RoleAuditLog, type InsertRoleAuditLog
} from "@shared/schema/user-roles";

// PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
import {
  referrals,
  referralAchievements,
  pickleballTips,
  type Referral,
  type InsertReferral,
  type ReferralAchievement,
  type InsertReferralAchievement,
  type PickleballTip,
  type InsertPickleballTip
} from "@shared/schema/referrals";

// PKL-278651-COMM-0028-NOTIF-REALTIME - Real-time Notifications
import {
  userNotifications,
  notificationPreferences,
  type UserNotification,
  type InsertUserNotification,
  type NotificationPreference,
  type InsertNotificationPreference
} from "@shared/schema/notifications";

// PKL-278651-COMM-0034-MEMBER - Enhanced Member Management
import {
  communityPermissionTypes,
  communityRolePermissions,
  communityCustomRoles,
  communityRoleAssignments,
  communityMemberActionsLog,
  type CommunityPermissionType,
  type CommunityRolePermission,
  type CommunityCustomRole,
  type CommunityRoleAssignment,
  type CommunityMemberActionLog,
  type RoleWithPermissions,
  type PermissionGroup,
  MemberActionType
} from "@shared/schema";

// PKL-278651-ADMIN-0013-SEC - Admin Security Enhancements
import {
  auditLogs, type AuditLog, type InsertAuditLog,
  AuditAction, AuditResource
} from "@shared/schema/audit";

// PKL-278651-COMM-0006-HUB - Community Hub Implementation
import {
  communities, communityMembers, communityPosts, communityEvents, communityEventAttendees,
  communityPostComments, communityPostLikes, communityCommentLikes, communityInvitations,
  communityJoinRequests,
  type Community, type InsertCommunity,
  type CommunityMember, type InsertCommunityMember,
  type CommunityPost, type InsertCommunityPost,
  type CommunityEvent, type InsertCommunityEvent,
  type CommunityEventAttendee, type InsertCommunityEventAttendee,
  type CommunityPostComment, type InsertCommunityPostComment
} from "@shared/schema/community";

// Import community storage implementation
import { communityStorageImplementation, type CommunityStorage } from "./storage/community-storage";

// PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
import {
  matchStatistics, type InsertMatchStatistics,
  performanceImpacts, type InsertPerformanceImpact,
  matchHighlights, type InsertMatchHighlight
} from "@shared/match-statistics-schema";

// PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
// PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
// PKL-278651-CONN-0004-PASS-ADMIN - Passport Verification System
import {
  events, type Event, type InsertEvent,
  eventCheckIns, type EventCheckIn, type InsertEventCheckIn,
  eventRegistrations, type EventRegistration, type InsertEventRegistration,
  passportVerifications, type PassportVerification, type InsertPassportVerification
} from "@shared/schema/events";

// PKL-278651-TOURN-0001-BRCKT - Tournament Bracket System
import {
  tournamentBrackets, type TournamentBracket, type InsertTournamentBracket,
  tournamentRounds, type TournamentRound, type InsertTournamentRound,
  tournamentBracketMatches, type TournamentBracketMatch, type InsertTournamentBracketMatch,
  tournamentTeams, type TournamentTeam, type InsertTournamentTeam
} from "@shared/schema/tournament-brackets";

// Define types for database results
type MatchStatistics = typeof matchStatistics.$inferSelect;
type PerformanceImpact = typeof performanceImpacts.$inferSelect;
type MatchHighlight = typeof matchHighlights.$inferSelect;
import { db } from "./db";
import { eq, ne, and, or, desc, asc, sql, inArray, SQL } from "drizzle-orm";
import session from "express-session";
import { Store } from "express-session";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";

export interface IStorage {
  sessionStore: Store;
  
  // PKL-278651-SAGE-0002-CONV - SAGE Conversation Interface
  // Conversation operations
  createConversation(data: InsertCoachingConversation): Promise<CoachingConversation>;
  getConversation(id: number): Promise<CoachingConversation | undefined>;
  getConversationsByUserId(userId: number): Promise<CoachingConversation[]>;
  updateConversation(id: number, data: Partial<InsertCoachingConversation>): Promise<CoachingConversation>;
  getActiveConversation(userId: number): Promise<CoachingConversation | undefined>;
  
  // Message operations
  createMessage(data: InsertCoachingMessage): Promise<CoachingMessage>;
  getMessagesByConversationId(conversationId: number): Promise<CoachingMessage[]>;
  getRecentMessages(conversationId: number, limit: number): Promise<CoachingMessage[]>;
  updateMessageFeedback(id: number, feedback: 'positive' | 'negative' | null): Promise<CoachingMessage>;
  
  // Coaching profile operations
  getCoachingProfile(userId: number): Promise<CoachingProfile | undefined>;
  createCoachingProfile(data: InsertCoachingProfile): Promise<CoachingProfile>;
  updateCoachingProfile(userId: number, data: Partial<InsertCoachingProfile>): Promise<CoachingProfile>;
  
  // Journal integration operations
  getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]>;
  getJournalEntriesForUser(userId: number, limit?: number): Promise<JournalEntry[]>;
  
  // Court IQ operations
  getCourtIQRatings(userId: number): Promise<Record<DimensionCode, number>>;
  
  // PKL-278651-AUTH-0016-PROLES - Role Management
  // Role operations
  getAllRoles(): Promise<Role[]>;
  getRoleById(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(roleData: InsertRole): Promise<Role>;
  updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  // User role operations
  getUserRoles(userId: number): Promise<(DbUserRole & { role: Role })[]>;
  assignRoleToUser(userId: number, roleId: number, assignedBy?: number): Promise<DbUserRole>;
  removeRoleFromUser(userId: number, roleId: number): Promise<boolean>;
  hasRole(userId: number, roleName: string): Promise<boolean>;
  getUsersWithRole(roleId: number, options?: { limit?: number, offset?: number }): Promise<(DbUserRole & { user: User })[]>;
  
  // Role permissions operations
  getAllPermissions(): Promise<Permission[]>;
  getPermissionById(id: number): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  createPermission(permissionData: InsertPermission): Promise<Permission>;
  getRolePermissions(roleId: number): Promise<(RolePermission & { permission: Permission })[]>;
  assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean>;
  
  // Role audit operations
  createRoleAuditLog(logData: InsertRoleAuditLog): Promise<RoleAuditLog>;
  getRoleAuditLogs(filters?: { userId?: number, roleId?: number, action?: string, limit?: number, offset?: number }): Promise<RoleAuditLog[]>;
  
  // PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
  // Referral operations
  getReferralsByReferrerId(referrerId: number): Promise<Referral[]>;
  getReferralsByReferredUserId(referredUserId: number): Promise<Referral[]>;
  getReferralByUsers(referrerId: number, referredUserId: number): Promise<Referral | undefined>;
  createReferral(data: InsertReferral): Promise<Referral>;
  updateReferralActivityStatus(referralId: number, activityLevel: 'new' | 'casual' | 'active', matchesPlayed: number): Promise<Referral>;
  
  // Referral achievement operations
  getReferralAchievementsByUserId(userId: number): Promise<ReferralAchievement[]>;
  createReferralAchievement(data: InsertReferralAchievement): Promise<ReferralAchievement>;
  
  // Pickleball tips operations
  getPickleballTips(options?: { limit?: number, isActive?: boolean }): Promise<PickleballTip[]>;
  createPickleballTip(data: InsertPickleballTip): Promise<PickleballTip>;
  
  // Update user activity in referrals
  updateUserActivityInReferrals(userId: number, matchCount: number): Promise<void>;
  
  // Get community activity for ticker
  getCommunityActivity(limit?: number): Promise<any[]>;
  
  // Helper method to award XP
  awardXpToUser(userId: number, xpAmount: number, source: string): Promise<User | undefined>;
  
  // PKL-278651-SAGE-0015-CONCIERGE - SAGE Concierge operations
  createConciergeInteraction(interaction: InsertConciergeInteraction): Promise<ConciergeInteraction>;
  getConciergeInteractions(userId: number, limit?: number): Promise<ConciergeInteraction[]>;
  updateConciergeInteractionStatus(userId: number, target: string, isCompleted: boolean): Promise<void>;
  createConciergeRecommendation(recommendation: InsertConciergeRecommendation): Promise<ConciergeRecommendation>;
  getConciergeRecommendations(userId: number, limit?: number): Promise<ConciergeRecommendation[]>;
  markRecommendationViewed(id: number): Promise<void>;
  markRecommendationActioned(id: number): Promise<void>;
  updateConciergeNavigationStats(featureId: string, visited: boolean, completed: boolean): Promise<void>;
  getProfileCompletion(userId: number): Promise<{ percentage: number, fields: string[] } | undefined>;
  getUserRecentActivity(userId: number): Promise<string[]>;
  getDrillsByDimensionAndLevel(dimension: DimensionCode, level: number): Promise<any[]>;
  getUserTrainingPlans(userId: number): Promise<any[]>;
  getTrainingPlansByDimension(dimension: DimensionCode): Promise<any[]>;
  getTournamentsByDivision(division: string): Promise<any[]>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getAllActiveUserIds(): Promise<number[]>;
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

  // PKL-278651-CONN-0004-PASS-REG - Event Registration operations
  getEventRegistration(id: number): Promise<EventRegistration | undefined>;
  getEventRegistrations(eventId: number, limit?: number, offset?: number): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: number, limit?: number, offset?: number): Promise<EventRegistration[]>;
  registerUserForEvent(registrationData: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, updates: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined>;
  cancelEventRegistration(id: number): Promise<boolean>;
  isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean>;
  getEventRegistrationCount(eventId: number): Promise<number>;
  getRegisteredEvents(userId: number, limit?: number, offset?: number): Promise<Event[]>;
  
  // PKL-278651-CONN-0004-PASS-ADMIN - Passport Verification System
  logPassportVerification(verificationData: InsertPassportVerification): Promise<PassportVerification>;
  getPassportVerificationLogs(
    limit?: number, 
    offset?: number, 
    filters?: {
      passportCode?: string;
      userId?: number;
      eventId?: number;
      status?: string;
      verifiedBy?: number;
    }
  ): Promise<PassportVerification[]>;
  verifyPassportForEvent(passportCode: string, eventId?: number): Promise<{
    valid: boolean;
    userId?: number;
    username?: string;
    events?: Event[];
    message?: string;
  }>;
  
  // PKL-278651-ADMIN-0013-SEC - Admin Security Enhancements
  // Audit logging operations
  createAuditLog(logEntry: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: {
    limit?: number;
    offset?: number;
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    suspicious?: boolean;
  }): Promise<AuditLog[]>;

  // PKL-278651-TOURN-0001-BRCKT - Tournament Bracket System
  // Tournament Bracket operations
  getBracketById(id: number): Promise<TournamentBracket | undefined>;
  getBracketsByTournament(tournamentId: number): Promise<TournamentBracket[]>;
  createBracket(bracketData: InsertTournamentBracket): Promise<TournamentBracket>;
  updateBracket(id: number, updates: Partial<InsertTournamentBracket>): Promise<TournamentBracket | undefined>;
  deleteBracket(id: number): Promise<boolean>;

  // Tournament Bracket Match operations
  getBracketMatch(id: number): Promise<TournamentBracketMatch | undefined>;
  getMatchesByBracket(bracketId: number): Promise<TournamentBracketMatch[]>;
  getMatchesByRound(roundId: number): Promise<TournamentBracketMatch[]>;
  createBracketMatch(matchData: InsertTournamentBracketMatch): Promise<TournamentBracketMatch>;
  updateBracketMatch(id: number, updates: Partial<InsertTournamentBracketMatch>): Promise<TournamentBracketMatch | undefined>;
  recordMatchResult(matchId: number, resultData: {
    winnerId: number;
    loserId: number;
    score: string;
    scoreDetails?: any;
  }): Promise<TournamentBracketMatch | undefined>;
  
  // PKL-278651-COACH-0001-CORE - S.A.G.E. (Skills Assessment & Growth Engine)
  // Coaching Session operations
  createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSession(id: number): Promise<CoachingSession | undefined>;
  getCoachingSessionsByUserId(userId: number): Promise<CoachingSession[]>;
  updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession>;
  
  // Coaching Insight operations
  createCoachingInsight(data: InsertCoachingInsight): Promise<CoachingInsight>;
  getCoachingInsightsBySessionId(sessionId: number): Promise<CoachingInsight[]>;
  getCoachingInsightsByUserId(userId: number): Promise<CoachingInsight[]>;
  updateCoachingInsight(id: number, data: Partial<InsertCoachingInsight>): Promise<CoachingInsight>;
  
  // Training Plan operations
  createTrainingPlan(data: InsertTrainingPlan): Promise<TrainingPlan>;
  getTrainingPlan(id: number): Promise<TrainingPlan | undefined>;
  getTrainingPlansByUserId(userId: number): Promise<TrainingPlan[]>;
  updateTrainingPlan(id: number, data: Partial<InsertTrainingPlan>): Promise<TrainingPlan>;
  
  // Training Exercise operations
  createTrainingExercise(data: InsertTrainingExercise): Promise<TrainingExercise>;
  getTrainingExercisesByPlanId(planId: number): Promise<TrainingExercise[]>;
  updateTrainingExercise(id: number, data: Partial<InsertTrainingExercise>): Promise<TrainingExercise>;
  markExerciseComplete(id: number, completed: boolean): Promise<TrainingExercise>;
  
  // Coaching Content Library operations
  getCoachingContent(options?: { 
    contentType?: string, 
    dimensionCode?: DimensionCode, 
    skillLevel?: string, 
    tags?: string[],
    limit?: number
  }): Promise<CoachingContentLibrary[]>;
  createCoachingContent(data: InsertCoachingContentLibrary): Promise<CoachingContentLibrary>;
  
  // User Progress tracking
  logUserProgress(data: InsertUserProgressLog): Promise<UserProgressLog>;
  getUserProgressBySessionId(sessionId: number): Promise<UserProgressLog[]>;
  getUserProgressByPlanId(planId: number): Promise<UserProgressLog[]>;
  
  // PKL-278651-COMM-0028-NOTIF-REALTIME - Notification Operations
  // User notification operations
  getUserNotifications(userId: number, options?: {
    limit?: number;
    offset?: number;
    includeRead?: boolean;
    type?: string;
  }): Promise<UserNotification[]>;
  
  getUserNotificationById(notificationId: number): Promise<UserNotification | undefined>;
  
  createUserNotification(notification: InsertUserNotification): Promise<UserNotification>;
  
  createNotificationsForUsers(userIds: number[], notificationData: Omit<InsertUserNotification, 'userId'>): Promise<number>;
  
  markNotificationAsRead(notificationId: number): Promise<boolean>;
  
  markAllNotificationsAsRead(userId: number): Promise<number>;
  
  getUnreadNotificationCount(userId: number): Promise<number>;
  
  deleteNotification(notificationId: number): Promise<boolean>;
  
  deleteAllNotifications(userId: number): Promise<number>;
  
  // Notification preference operations
  getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]>;
  
  getUserNotificationPreferenceByType(userId: number, type: string): Promise<NotificationPreference | undefined>;
  
  updateNotificationPreference(userId: number, type: string, enabled: boolean, channels?: string[]): Promise<NotificationPreference>;
  
  // PKL-278651-COMM-0006-HUB - Community Hub Implementation
  // Community operations
  getCommunities(filters?: {
    location?: string;
    skillLevel?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Community[]>;
  
  getCommunityById(id: number): Promise<Community | undefined>;
  
  getCommunitiesByCreator(userId: number): Promise<Community[]>;
  
  createCommunity(communityData: InsertCommunity): Promise<Community>;
  
  updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined>;
  
  incrementCommunityMemberCount(communityId: number): Promise<void>;
  
  decrementCommunityMemberCount(communityId: number): Promise<void>;
  
  incrementCommunityEventCount(communityId: number): Promise<void>;
  
  decrementCommunityEventCount(communityId: number): Promise<void>;
  
  // Community members operations
  getCommunityMembers(communityId: number): Promise<(CommunityMember & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getCommunityMembership(communityId: number, userId: number): Promise<CommunityMember | undefined>;
  
  getCommunityMembershipsByUserId(userId: number): Promise<CommunityMember[]>;
  
  createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember>;
  
  updateCommunityMembership(communityId: number, userId: number, updates: Partial<InsertCommunityMember>): Promise<CommunityMember | undefined>;
  
  deleteCommunityMembership(communityId: number, userId: number): Promise<boolean>;
  
  getCommunityAdminCount(communityId: number): Promise<number>;
  
  // Community posts operations
  getCommunityPosts(communityId: number, options?: { limit?: number, offset?: number }): Promise<(CommunityPost & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getCommunityPostById(postId: number): Promise<CommunityPost | undefined>;
  
  createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost>;
  
  updateCommunityPost(postId: number, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  
  deleteCommunityPost(postId: number): Promise<boolean>;
  
  incrementPostCommentCount(postId: number): Promise<void>;
  
  decrementPostCommentCount(postId: number): Promise<void>;
  
  incrementPostLikeCount(postId: number): Promise<void>;
  
  decrementPostLikeCount(postId: number): Promise<void>;
  
  // Community events operations
  getCommunityEvents(communityId: number, options?: { limit?: number, offset?: number }): Promise<CommunityEvent[]>;
  
  getCommunityEventById(eventId: number): Promise<CommunityEvent | undefined>;
  
  createCommunityEvent(eventData: InsertCommunityEvent): Promise<CommunityEvent>;
  
  updateCommunityEvent(eventId: number, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined>;
  
  deleteCommunityEvent(eventId: number): Promise<boolean>;
  
  incrementEventAttendeeCount(eventId: number): Promise<void>;
  
  decrementEventAttendeeCount(eventId: number): Promise<void>;
  
  // Event attendance operations
  getEventAttendees(eventId: number): Promise<(CommunityEventAttendee & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getEventAttendance(eventId: number, userId: number): Promise<CommunityEventAttendee | undefined>;
  
  createEventAttendance(attendanceData: InsertCommunityEventAttendee): Promise<CommunityEventAttendee>;
  
  updateEventAttendance(eventId: number, userId: number, updates: Partial<InsertCommunityEventAttendee>): Promise<CommunityEventAttendee | undefined>;
  
  cancelEventAttendance(eventId: number, userId: number): Promise<boolean>;
  
  // Post comments operations
  getPostComments(postId: number): Promise<(CommunityPostComment & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  createCommunityPostComment(commentData: InsertCommunityPostComment): Promise<CommunityPostComment>;
  
  deleteComment(commentId: number): Promise<boolean>;
  
  // Post likes operations
  getPostLike(postId: number, userId: number): Promise<{ id: number } | undefined>;
  
  createPostLike(likeData: { postId: number, userId: number }): Promise<{ id: number }>;
  
  deletePostLike(postId: number, userId: number): Promise<boolean>;
  
  // Join requests operations
  createCommunityJoinRequest(requestData: { communityId: number, userId: number, message?: string }): Promise<{ id: number, status: string }>;
  
  getCommunityJoinRequests(communityId: number): Promise<any[]>;
  
  updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  /**
   * PKL-278651-AUTH-0016-PROLES - Role Management Implementation
   * Role operations
   */
  
  // Get all available roles
  async getAllRoles(): Promise<Role[]> {
    try {
      return await db.select().from(roles).orderBy(roles.priority);
    } catch (error) {
      console.error('[Storage] getAllRoles error:', error);
      return [];
    }
  }
  
  // Get a specific role by ID
  async getRoleById(id: number): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      return role;
    } catch (error) {
      console.error('[Storage] getRoleById error:', error);
      return undefined;
    }
  }
  
  // Get a specific role by name
  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.name, name));
      return role;
    } catch (error) {
      console.error('[Storage] getRoleByName error:', error);
      return undefined;
    }
  }
  
  // Create a new role
  async createRole(roleData: InsertRole): Promise<Role> {
    try {
      const [role] = await db.insert(roles).values(roleData).returning();
      return role;
    } catch (error) {
      console.error('[Storage] createRole error:', error);
      throw error;
    }
  }
  
  // Update an existing role
  async updateRole(id: number, updates: Partial<InsertRole>): Promise<Role | undefined> {
    try {
      const [updatedRole] = await db.update(roles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(roles.id, id))
        .returning();
      return updatedRole;
    } catch (error) {
      console.error('[Storage] updateRole error:', error);
      return undefined;
    }
  }
  
  // Delete a role
  async deleteRole(id: number): Promise<boolean> {
    try {
      // Check if role is in use
      const usersWithRole = await db.select().from(userRoles).where(eq(userRoles.roleId, id));
      if (usersWithRole.length > 0) {
        throw new Error('Cannot delete role that is assigned to users');
      }
      
      // Delete role permissions first
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      
      // Then delete the role
      const result = await db.delete(roles).where(eq(roles.id, id)).returning({ id: roles.id });
      return result.length > 0;
    } catch (error) {
      console.error('[Storage] deleteRole error:', error);
      throw error;
    }
  }
  
  /**
   * User role operations
   */
  
  // Get all roles for a user
  async getUserRoles(userId: number): Promise<(DbUserRole & { role: Role })[]> {
    try {
      return await db.select({
        userRole: userRoles,
        role: roles
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .then(results => results.map(({ userRole, role }) => ({ ...userRole, role })));
    } catch (error) {
      console.error('[Storage] getUserRoles error:', error);
      return [];
    }
  }
  
  // Assign a role to a user
  async assignRoleToUser(userId: number, roleId: number, assignedBy?: number): Promise<DbUserRole> {
    try {
      // Check if user already has this role
      const existingRole = await db.select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ));
      
      if (existingRole.length > 0) {
        // If role exists but is inactive, reactivate it
        if (!existingRole[0].isActive) {
          const [updatedRole] = await db.update(userRoles)
            .set({ 
              isActive: true,
              assignedBy: assignedBy || null,
              assignedAt: new Date()
            })
            .where(and(
              eq(userRoles.userId, userId),
              eq(userRoles.roleId, roleId)
            ))
            .returning();
            
          // Log the reactivation
          await this.createRoleAuditLog({
            userId,
            roleId,
            action: 'REACTIVATE',
            performedBy: assignedBy,
            performedAt: new Date(),
            notes: 'Role reactivated'
          });
          
          return updatedRole;
        }
        
        // Return the existing role
        return existingRole[0];
      }
      
      // Create a new role assignment
      const [newUserRole] = await db.insert(userRoles)
        .values({
          userId,
          roleId,
          assignedBy: assignedBy || null,
          assignedAt: new Date(),
          isActive: true
        })
        .returning();
      
      // Log the role assignment
      await this.createRoleAuditLog({
        userId,
        roleId,
        action: 'ASSIGN',
        performedBy: assignedBy,
        performedAt: new Date(),
        notes: 'Role assigned'
      });
      
      return newUserRole;
    } catch (error) {
      console.error('[Storage] assignRoleToUser error:', error);
      throw error;
    }
  }
  
  // Remove a role from a user
  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    try {
      // Soft delete by setting isActive to false
      const result = await db.update(userRoles)
        .set({ isActive: false })
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ))
        .returning({ id: userRoles.id });
      
      if (result.length > 0) {
        // Log the role removal
        await this.createRoleAuditLog({
          userId,
          roleId,
          action: 'REMOVE',
          performedAt: new Date(),
          notes: 'Role removed'
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Storage] removeRoleFromUser error:', error);
      return false;
    }
  }
  
  // Check if a user has a specific role
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    try {
      const role = await this.getRoleByName(roleName);
      if (!role) return false;
      
      const userRolesResult = await db.select()
        .from(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, role.id),
          eq(userRoles.isActive, true)
        ));
      
      return userRolesResult.length > 0;
    } catch (error) {
      console.error('[Storage] hasRole error:', error);
      return false;
    }
  }
  
  // Get all users with a specific role
  async getUsersWithRole(roleId: number, options?: { limit?: number, offset?: number }): Promise<(DbUserRole & { user: User })[]> {
    try {
      const limit = options?.limit || 100;
      const offset = options?.offset || 0;
      
      return await db.select({
        userRole: userRoles,
        user: users
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .where(and(
        eq(userRoles.roleId, roleId),
        eq(userRoles.isActive, true)
      ))
      .limit(limit)
      .offset(offset)
      .then(results => results.map(({ userRole, user }) => ({ ...userRole, user })));
    } catch (error) {
      console.error('[Storage] getUsersWithRole error:', error);
      return [];
    }
  }
  
  /**
   * Role permissions operations
   */
  
  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    try {
      return await db.select().from(permissions).orderBy(permissions.name);
    } catch (error) {
      console.error('[Storage] getAllPermissions error:', error);
      return [];
    }
  }
  
  // Get a specific permission by ID
  async getPermissionById(id: number): Promise<Permission | undefined> {
    try {
      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
      return permission;
    } catch (error) {
      console.error('[Storage] getPermissionById error:', error);
      return undefined;
    }
  }
  
  // Get a specific permission by name
  async getPermissionByName(name: string): Promise<Permission | undefined> {
    try {
      const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
      return permission;
    } catch (error) {
      console.error('[Storage] getPermissionByName error:', error);
      return undefined;
    }
  }
  
  // Create a new permission
  async createPermission(permissionData: InsertPermission): Promise<Permission> {
    try {
      const [permission] = await db.insert(permissions).values(permissionData).returning();
      return permission;
    } catch (error) {
      console.error('[Storage] createPermission error:', error);
      throw error;
    }
  }
  
  // Get all permissions assigned to a role
  async getRolePermissions(roleId: number): Promise<(RolePermission & { permission: Permission })[]> {
    try {
      return await db.select({
        rolePermission: rolePermissions,
        permission: permissions
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId))
      .then(results => results.map(({ rolePermission, permission }) => ({ ...rolePermission, permission })));
    } catch (error) {
      console.error('[Storage] getRolePermissions error:', error);
      return [];
    }
  }
  
  // Assign a permission to a role
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    try {
      // Check if permission is already assigned to role
      const existingPermission = await db.select()
        .from(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        ));
      
      if (existingPermission.length > 0) {
        return existingPermission[0];
      }
      
      // Create a new role permission
      const [newRolePermission] = await db.insert(rolePermissions)
        .values({
          roleId,
          permissionId
        })
        .returning();
      
      return newRolePermission;
    } catch (error) {
      console.error('[Storage] assignPermissionToRole error:', error);
      throw error;
    }
  }
  
  // Remove a permission from a role
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    try {
      const result = await db.delete(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        ))
        .returning({ id: rolePermissions.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('[Storage] removePermissionFromRole error:', error);
      return false;
    }
  }
  
  /**
   * Role audit operations
   */
  
  // Create a role audit log entry
  async createRoleAuditLog(logData: InsertRoleAuditLog): Promise<RoleAuditLog> {
    try {
      const [log] = await db.insert(roleAuditLogs).values(logData).returning();
      return log;
    } catch (error) {
      console.error('[Storage] createRoleAuditLog error:', error);
      throw error;
    }
  }
  
  // Get role audit logs with filtering
  async getRoleAuditLogs(filters?: { userId?: number, roleId?: number, action?: string, limit?: number, offset?: number }): Promise<RoleAuditLog[]> {
    try {
      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;
      
      let query = db.select().from(roleAuditLogs);
      
      // Apply filters
      if (filters?.userId) {
        query = query.where(eq(roleAuditLogs.userId, filters.userId));
      }
      
      if (filters?.roleId) {
        query = query.where(eq(roleAuditLogs.roleId, filters.roleId));
      }
      
      if (filters?.action) {
        query = query.where(eq(roleAuditLogs.action, filters.action));
      }
      
      // Apply pagination
      query = query.limit(limit).offset(offset).orderBy(desc(roleAuditLogs.performedAt));
      
      return await query;
    } catch (error) {
      console.error('[Storage] getRoleAuditLogs error:', error);
      return [];
    }
  }
  
  // PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
  // Referral operations
  
  // Get user's referrals for display on referral page
  async getUserReferrals(userId: number): Promise<any[]> {
    try {
      // Join with users table to get referral user details
      const results = await db
        .select({
          id: referrals.id,
          dateReferred: referrals.dateReferred,
          status: referrals.status,
          username: users.username,
          displayName: users.displayName,
          userId: users.id,
          matchesPlayed: users.totalMatches
        })
        .from(referrals)
        .innerJoin(users, eq(referrals.referredId, users.id))
        .where(eq(referrals.referrerId, userId));
      
      // Format results for display
      return results.map(r => ({
        id: r.id,
        username: r.username,
        displayName: r.displayName,
        dateReferred: r.dateReferred.toISOString(),
        // Determine activity level based on matches played
        activityLevel: r.matchesPlayed > 10 ? 'active' : r.matchesPlayed > 3 ? 'casual' : 'new',
        matchesPlayed: r.matchesPlayed || 0
      }));
    } catch (error) {
      console.error('Error getting user referrals:', error);
      return [];
    }
  }

  // Get referral stats for the user
  async getReferralStats(userId: number): Promise<any> {
    try {
      // Get total referrals
      const referralCount = await this.getUserReferralCount(userId);
      
      // Calculate active referrals (users who have played 5+ matches)
      const activeReferrals = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .innerJoin(users, eq(referrals.referredId, users.id))
        .where(and(
          eq(referrals.referrerId, userId),
          sql`${users.totalMatches} >= 5`
        ));
      
      // Get total XP earned from referrals
      const xpResults = await db
        .select({ total: sql<number>`sum(${xpTransactions.amount})` })
        .from(xpTransactions)
        .where(and(
          eq(xpTransactions.userId, userId),
          or(
            eq(xpTransactions.source, 'referral'),
            eq(xpTransactions.source, 'achievement_referral')
          )
        ));
      
      // Get next achievement
      const nextAchievement = await this.getNextAchievement(userId);
      
      return {
        totalReferrals: referralCount,
        activeReferrals: activeReferrals[0]?.count || 0,
        totalXpEarned: xpResults[0]?.total || 0,
        nextAchievement
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        totalXpEarned: 0,
        nextAchievement: {
          name: 'First Steps',
          requiredReferrals: 1
        }
      };
    }
  }

  // Get user's referral achievements
  async getReferralAchievements(userId: number): Promise<any[]> {
    try {
      // Get raw achievements data
      const achievements = await this.getReferralAchievementsByUserId(userId);
      
      // Define achievement info map for display
      const achievementInfo: Record<string, { name: string, description: string }> = {
        'first_steps': { 
          name: 'First Steps', 
          description: 'Refer your first pickleball friend'
        },
        'growing_circle': { 
          name: 'Growing Circle', 
          description: 'Refer 5 friends to the platform'
        },
        'community_builder': { 
          name: 'Community Builder', 
          description: 'Refer 15 friends to the platform'
        },
        'pickle_evangelist': { 
          name: 'Pickle Evangelist', 
          description: 'Refer 30 friends to the platform'
        },
        'founders_club': { 
          name: 'Founders Club', 
          description: 'Refer 50 friends to the platform'
        },
      };
      
      // Format achievements for display
      return achievements.map(achievement => ({
        id: achievement.id,
        name: achievementInfo[achievement.achievementId]?.name || achievement.achievementId,
        description: achievementInfo[achievement.achievementId]?.description || 'Achievement earned',
        xpAwarded: achievement.xpAwarded,
        dateEarned: achievement.dateEarned.toISOString()
      }));
    } catch (error) {
      console.error('Error getting user referral achievements:', error);
      return [];
    }
  }

  // Get referral tips for status ticker
  async getReferralTips(): Promise<any[]> {
    try {
      // Using SQL query to accommodate column name mismatch
      const result = await db.execute(
        `SELECT id, tip_content, display_priority, is_active, source 
         FROM pickleball_tips 
         WHERE is_active = true 
         ORDER BY RANDOM() 
         LIMIT 10`
      );
      
      // Convert the result to an array if it's not already
      const rows = Array.isArray(result) ? result : result.rows || [];
      
      return rows.map((tip: any) => ({
        id: tip.id,
        tip: tip.tip_content, // Map tip_content to tip for frontend consistency
        priority: tip.display_priority || 1
      }));
    } catch (error) {
      console.error('Error getting referral tips:', error);
      return [];
    }
  }

  // Get recent referral activity for status ticker
  async getRecentReferralActivity(): Promise<any[]> {
    try {
      // Get recent referrals with user info
      const activity = await db
        .select({
          id: referrals.id,
          date: referrals.dateReferred,
          xpAwarded: referrals.xpAwarded,
          referrerName: users.displayName,
          referrerUsername: users.username
        })
        .from(referrals)
        .innerJoin(users, eq(referrals.referrerId, users.id))
        .orderBy(desc(referrals.dateReferred))
        .limit(10);
      
      return activity.map(item => ({
        id: item.id,
        message: `${item.referrerName || item.referrerUsername} just earned ${item.xpAwarded} XP for referring a friend!`,
        timestamp: item.date.toISOString(),
        type: 'referral'
      }));
    } catch (error) {
      console.error('Error getting referral activity:', error);
      return [];
    }
  }
  
  // Helper: Get user's referral count
  async getUserReferralCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user referral count:', error);
      return 0;
    }
  }
  
  // Helper: Get user's earned referral achievements
  async getUserReferralAchievements(userId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(referralAchievements)
        .where(eq(referralAchievements.userId, userId));
    } catch (error) {
      console.error('Error getting user referral achievements:', error);
      return [];
    }
  }
  
  // Get the next achievement a user can earn
  async getNextAchievement(userId: number): Promise<{ name: string, requiredReferrals: number } | null> {
    try {
      const referralCount = await this.getUserReferralCount(userId);
      const earnedAchievements = await this.getUserReferralAchievements(userId);
      
      // Define achievements with their thresholds
      const achievements = [
        { id: 'first_steps', name: 'First Steps', threshold: 1 },
        { id: 'growing_circle', name: 'Growing Circle', threshold: 5 },
        { id: 'community_builder', name: 'Community Builder', threshold: 15 },
        { id: 'pickle_evangelist', name: 'Pickle Evangelist', threshold: 30 },
        { id: 'founders_club', name: 'Founders Club', threshold: 50 }
      ];
      
      // Find the next unearned achievement
      for (const achievement of achievements) {
        const achieved = earnedAchievements.some(a => a.achievementId === achievement.id);
        if (!achieved) {
          return {
            name: achievement.name,
            requiredReferrals: achievement.threshold
          };
        }
      }
      
      // If all achievements are earned
      return null;
    } catch (error) {
      console.error('Error getting next achievement:', error);
      return { 
        name: 'First Steps',
        requiredReferrals: 1
      };
    }
  }
  
  // Award a referral achievement to a user
  async awardReferralAchievement(userId: number, achievementId: string): Promise<ReferralAchievement> {
    try {
      // XP amounts for different achievements
      const xpRewards: Record<string, number> = {
        'first_steps': 20,
        'growing_circle': 50,
        'community_builder': 150,
        'pickle_evangelist': 300,
        'founders_club': 500
      };
      
      const xpAwarded = xpRewards[achievementId] || 0;
      
      const achievementData: InsertReferralAchievement = {
        userId,
        achievementId,
        xpAwarded
      };
      
      const achievement = await this.createReferralAchievement(achievementData);
      
      // Create XP transaction for the achievement
      if (xpAwarded > 0) {
        await this.awardXpToUser(userId, xpAwarded, 'achievement_referral');
      }
      
      return achievement;
    } catch (error) {
      console.error('Error awarding referral achievement:', error);
      throw error;
    }
  }
  
  async getReferralsByReferrerId(referrerId: number): Promise<Referral[]> {
    try {
      return await db.query.referrals.findMany({
        where: eq(referrals.referrerId, referrerId),
        with: {
          referredUser: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching referrals by referrer ID:', error);
      return [];
    }
  }

  async getReferralsByReferredUserId(referredUserId: number): Promise<Referral[]> {
    try {
      return await db.query.referrals.findMany({
        where: eq(referrals.referredUserId, referredUserId),
        with: {
          referrer: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching referrals by referred user ID:', error);
      return [];
    }
  }

  async getReferralByUsers(referrerId: number, referredUserId: number): Promise<Referral | undefined> {
    try {
      const results = await db.select().from(referrals).where(
        and(
          eq(referrals.referrerId, referrerId),
          eq(referrals.referredUserId, referredUserId)
        )
      );
      return results[0];
    } catch (error) {
      console.error('Error fetching referral by users:', error);
      return undefined;
    }
  }

  async createReferral(data: InsertReferral): Promise<Referral> {
    try {
      const [newReferral] = await db.insert(referrals).values(data).returning();
      return newReferral;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  async updateReferralActivityStatus(
    referralId: number, 
    activityLevel: 'new' | 'casual' | 'active', 
    matchesPlayed: number
  ): Promise<Referral> {
    try {
      const [updatedReferral] = await db.update(referrals)
        .set({ 
          activityLevel, 
          matchesPlayed,
          lastActive: new Date()
        })
        .where(eq(referrals.id, referralId))
        .returning();
      return updatedReferral;
    } catch (error) {
      console.error('Error updating referral activity status:', error);
      throw error;
    }
  }

  // Referral achievement operations
  async getReferralAchievementsByUserId(userId: number): Promise<ReferralAchievement[]> {
    try {
      return await db.select().from(referralAchievements).where(eq(referralAchievements.userId, userId));
    } catch (error) {
      console.error('Error fetching referral achievements by user ID:', error);
      return [];
    }
  }

  async createReferralAchievement(data: InsertReferralAchievement): Promise<ReferralAchievement> {
    try {
      const [newAchievement] = await db.insert(referralAchievements).values(data).returning();
      return newAchievement;
    } catch (error) {
      console.error('Error creating referral achievement:', error);
      throw error;
    }
  }

  // Pickleball tips operations
  async getPickleballTips(options: { limit?: number, isActive?: boolean } = {}): Promise<PickleballTip[]> {
    try {
      const { limit = 5, isActive = true } = options;
      
      let query = db.select().from(pickleballTips);
      
      if (isActive !== undefined) {
        query = query.where(eq(pickleballTips.isActive, isActive));
      }
      
      return await query.limit(limit).orderBy(pickleballTips.displayPriority);
    } catch (error) {
      console.error('Error fetching pickleball tips:', error);
      return [];
    }
  }

  async createPickleballTip(data: InsertPickleballTip): Promise<PickleballTip> {
    try {
      const [newTip] = await db.insert(pickleballTips).values(data).returning();
      return newTip;
    } catch (error) {
      console.error('Error creating pickleball tip:', error);
      throw error;
    }
  }

  // Update user activity in referrals
  async updateUserActivityInReferrals(userId: number, matchCount: number): Promise<void> {
    try {
      // Define activity thresholds
      const casualThreshold = 2; // 2+ matches = casual
      const activeThreshold = 5; // 5+ matches = active
      
      let activityLevel: 'new' | 'casual' | 'active' = 'new';
      
      if (matchCount >= activeThreshold) {
        activityLevel = 'active';
      } else if (matchCount >= casualThreshold) {
        activityLevel = 'casual';
      }
      
      // Update all referrals where this user was referred
      await db.update(referrals)
        .set({ 
          activityLevel, 
          matchesPlayed: matchCount,
          lastActive: new Date()
        })
        .where(eq(referrals.referredUserId, userId));
        
    } catch (error) {
      console.error('Error updating user activity in referrals:', error);
      throw error;
    }
  }

  // Get community activity for ticker
  async getCommunityActivity(limit: number = 5): Promise<any[]> {
    try {
      // Get recent user joins
      const recentJoins = await db.select({
        type: sql`'join'`.as('type'),
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        timestamp: users.createdAt
      })
      .from(users)
      .orderBy(sql`users.created_at DESC`)
      .limit(limit);
      
      // Get recent achievements
      const recentAchievements = await db.select({
        type: sql`'achievement'`.as('type'),
        userId: referralAchievements.userId,
        achievementName: referralAchievements.achievementName,
        timestamp: referralAchievements.dateAchieved
      })
      .from(referralAchievements)
      .orderBy(sql`referral_achievements.date_achieved DESC`)
      .limit(limit);
      
      // Combine and sort by timestamp (most recent first)
      const allActivities = [...recentJoins, ...recentAchievements]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      
      return allActivities;
    } catch (error) {
      console.error('Error fetching community activity:', error);
      return [];
    }
  }

  // Helper method to award XP
  async awardXpToUser(userId: number, xpAmount: number, source: string): Promise<User | undefined> {
    try {
      // First, update the user's XP
      const updatedUser = await this.updateUserXP(userId, xpAmount);
      
      // Also record an XP transaction
      await this.createXpTransaction({
        userId,
        amount: xpAmount,
        source,
        transactionType: 'credit'
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Error awarding XP to user:', error);
      return undefined;
    }
  }
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
    
    // Bind the database to community storage implementation
    communityStorageImplementation.getDb = () => db;
  }
  
  /**
   * PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
   * Helper method to add isTestData filter conditions based on user's admin status
   * @param isAdmin Boolean indicating if the current user is an admin
   * @returns SQL conditions for filtering test data
   */
  private getTestDataFilter(isAdmin: boolean): SQL<unknown> {
    if (isAdmin) {
      // Admins can see all data, no filtering needed
      return sql`TRUE`;
    } else {
      // Non-admins should not see test data
      return sql`is_test_data = FALSE OR is_test_data IS NULL`;
    }
  }
  
  /**
   * PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
   * Helper method to check if a user is an admin
   * @param userId User ID to check
   * @returns Boolean indicating if the user is an admin
   */
  private async isUserAdmin(userId: number | undefined | null): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const [user] = await db.select({ isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, userId));
      
      return user?.isAdmin === true;
    } catch (error) {
      console.error('[Storage] isUserAdmin error:', error);
      return false;
    }
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
      
      // CRITICAL: Make sure we have data to update
      if (!profileData || Object.keys(profileData).length === 0) {
        console.log(`[Storage] updateUserProfile - No valid fields to update, skipping SQL operation`);
        return currentUser; // Return the current user without performing update
      }
      
      // Log received data
      console.log(`[Storage] updateUserProfile - Original data:`, JSON.stringify(profileData, null, 2));
      
      // Note: The route has already mapped firstName to first_name and lastName to last_name
      // External ratings handling
      if ('duprRating' in profileData || 'utprRating' in profileData || 'wprRating' in profileData) {
        profileData.last_external_rating_update = new Date();
      }
      
      console.log(`[Storage] updateUserProfile - Processing data:`, JSON.stringify(profileData, null, 2));
      
      // Update the user profile with validated data
      let updatedUser;
      try {
        // This is the critical fix - ensure we actually have fields to update
        // before making the SQL query.
        if (Object.keys(profileData).length === 0) {
          console.log(`[Storage] updateUserProfile - No fields to update in SQL, returning current user.`);
          return currentUser;
        }
        
        const [result] = await db.update(users)
          .set(profileData)
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
        
        // Map back from database column names to camelCase for frontend use
        if ('first_name' in updatedUser) {
          (updatedUser as any).firstName = updatedUser.first_name;
        }
        if ('last_name' in updatedUser) {
          (updatedUser as any).lastName = updatedUser.last_name;
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
          
          // Map back from database column names to camelCase for frontend use
          if ('first_name' in finalUser) {
            (finalUser as any).firstName = finalUser.first_name;
          }
          if ('last_name' in finalUser) {
            (finalUser as any).lastName = finalUser.last_name;
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
      const result = await db.select({ count: sql`count(*)` }).from(users);
      console.log('[Storage] getUserCount result:', result);
      // Convert the count to a number explicitly (PostgreSQL returns count as string)
      const count = Number(result[0]?.count) || 0;
      console.log('[Storage] getUserCount converted count:', count);
      return count;
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
      
      const result = await db.select({ count: sql`count(*)` })
        .from(users)
        .where(sql`${users.lastMatchDate} > ${thirtyDaysAgo}`);
      
      console.log('[Storage] getActiveUserCount result:', result);
      // Convert the count to a number explicitly
      const count = Number(result[0]?.count) || 0;
      console.log('[Storage] getActiveUserCount converted count:', count);
      return count;
    } catch (error) {
      console.error('[storage] getActiveUserCount error:', error);
      return 0;
    }
  }
  
  // For user search, we only need a minimal set of user information
  async searchUsers(query: string, limit: number = 10, excludeUserId?: number, requestingUserId?: number): Promise<{ 
    id: number; 
    username: string; 
    displayName: string; 
    passportCode: string | null; 
    avatarUrl: string | null; 
    avatarInitials: string;
    rating: number | null;
  }[]> {
    try {
      console.log("[Storage] searchUsers called with query:", query, "limit:", limit, "excludeUserId:", excludeUserId, "requestingUserId:", requestingUserId || 'none');
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] searchUsers - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
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
        const searchCondition = or(
          sql`LOWER(${users.username}) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.displayName}, '')) LIKE LOWER(${searchPattern})`,
          sql`LOWER(COALESCE(${users.email}, '')) LIKE LOWER(${searchPattern})`
        );
        
        // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
        // Check if requesting user is admin and filter out test data for non-admins
        let whereClause;
        
        if (isAdmin) {
          // Admin can see test data
          whereClause = searchCondition;
          console.log("[Storage] searchUsers - Admin user, including test data in results");
        } else {
          // Non-admin users should not see test data or test users
          whereClause = and(
            searchCondition,
            sql`(${users.isTestData} = FALSE OR ${users.isTestData} IS NULL)`,
            // Filter out any username containing "test" (case insensitive)
            sql`LOWER(${users.username}) NOT LIKE '%test%'`,
            // Filter out any displayName containing "test" (case insensitive)
            sql`(${users.displayName} IS NULL OR LOWER(${users.displayName}) NOT LIKE '%test%')`
          );
          console.log("[Storage] searchUsers - Non-admin user, excluding test data and test users from results");
        }
        
        console.log("Search SQL:", whereClause);
        
        // PKL-278651-TOURN-0008-SRCH - Enhanced user search for tournament team registration
        // Execute the search query with Framework 5.0 reliability patterns
        // IMPORTANT: We're avoiding chaining multiple where clauses as that seems to be causing issues
        console.log('[PKL-278651-TOURN-0008-SRCH] Executing user search with enhanced reliability patterns');
        
        // Using explicit field selection with only known valid columns
        // Remove reference to users.rating which doesn't exist in the schema
        let results = await db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          email: users.email,
          passportCode: users.passportId,
          avatarInitials: users.avatarInitials,
          location: users.location,
          isTestData: users.isTestData,
          // Ratings are stored in other fields, not directly on users table
          duprRating: users.duprRating 
        })
        .from(users)
        .where(whereClause)
        .limit(limit);
        
        // If we need to exclude a user, do it in memory to avoid SQL issues
        if (numericExcludeId !== undefined) {
          results = results.filter(user => user.id !== numericExcludeId);
        }
        
        console.log(`Search found ${results.length} results for "${safeQuery}"`);
        console.log("Results:", results.map(u => `${u.id}: ${u.username}`).join(", "));
        
        // PKL-278651-TOURN-0008-SRCH - Ensure rating mapping doesn't access non-existent fields
        const mappedResults = results.map(user => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName || user.username,
          passportCode: user.passportCode || null, 
          avatarUrl: null, // Safe default
          avatarInitials: user.avatarInitials || (user.username ? user.username.substring(0, 2).toUpperCase() : "??"),
          // Use DUPR rating when available
          rating: user.duprRating ? parseFloat(user.duprRating) : null
        }));
        
        // Show what we're returning
        console.log("Returning", mappedResults.length, "user matches for", safeQuery);
        return mappedResults;
        
      } catch (dbError) {
        console.error("Database error in searchUsers:", dbError);
        
        // PKL-278651-TOURN-0008-SRCH - Fix fallback approach with Framework 5.0 reliability patterns
        console.log("[PKL-278651-TOURN-0008-SRCH] Trying fallback approach with robust field selection");
        try {
          // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
          // Apply test data filter in SQL for non-admin users
          let userQuery = db.select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            isTestData: users.isTestData,
            // Remove reference to non-existent users.rating field
            duprRating: users.duprRating
          }).from(users);
          
          // Filter out test data for non-admin users
          if (!isAdmin) {
            userQuery = userQuery.where(sql`(${users.isTestData} = FALSE OR ${users.isTestData} IS NULL)`);
            console.log("[Storage] searchUsers fallback - Non-admin user, excluding test data from results");
          } else {
            console.log("[Storage] searchUsers fallback - Admin user, including test data in results");
          }
          
          // Get users with appropriate test data visibility
          const allUsers = await userQuery.limit(100);
          
          console.log(`Got ${allUsers.length} total users for in-memory filtering (filtered by test data visibility: ${!isAdmin})`);
          
          // Filter in JS
          const lowercaseQuery = safeQuery.toLowerCase();
          const filteredUsers = allUsers.filter(user => {
            // Skip the excluded user if specified
            if (numericExcludeId && user.id === numericExcludeId) return false;
            
            // For non-admin users, filter out any test users (usernames containing "test")
            if (!isAdmin && 
                (user.username?.toLowerCase().includes("test") || 
                 user.displayName?.toLowerCase().includes("test"))) {
              return false;
            }
            
            // Match on username and displayName
            return (
              user.username?.toLowerCase().includes(lowercaseQuery) ||
              (user.displayName && user.displayName.toLowerCase().includes(lowercaseQuery))
            );
          }).slice(0, 10); // Limit to 10 results
          
          console.log(`Fallback filtering found ${filteredUsers.length} matches`);
          
          // PKL-278651-TOURN-0008-SRCH - Use consistent rating fallbacks in all code paths
          return filteredUsers.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            passportCode: null,
            avatarUrl: null,
            avatarInitials: user.username?.substring(0, 2).toUpperCase() || "??",
            // Use only DUPR rating, as the rating field doesn't exist
            rating: user.duprRating ? parseFloat(user.duprRating) : null
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
  async getMatch(id: number, requestingUserId?: number): Promise<Match | undefined> {
    try {
      // Validate id is a proper number to avoid database errors
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getMatch called with invalid ID: ${id}, converted to ${numericId}`);
        return undefined;
      }
      
      console.log(`[Storage] getMatch called with valid ID: ${numericId}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getMatch - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // Select all fields from the matches table
      const query = db.select()
        .from(matches)
        .where(eq(matches.id, numericId));
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Apply test data filter for non-admins
      if (!isAdmin) {
        query.where(sql`(${matches.isTestData} = FALSE OR ${matches.isTestData} IS NULL)`);
      }
      
      const [match] = await query;
      
      if (match) {
        console.log(`[Storage] getMatch - Retrieved match ${match.id} (filtered by test data visibility: ${!isAdmin})`);
      } else {
        // This could be due to either the match not existing or being test data for a non-admin user
        console.log(`[Storage] getMatch - No match found with ID ${numericId} (filtered by test data visibility: ${!isAdmin})`);
      }
      
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
  
  async getRecentMatches(userId: number, limit: number = 10, requestingUserId?: number): Promise<Match[]> {
    try {
      // Validate userId is a proper number to avoid database errors
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getRecentMatches called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getRecentMatches called with userId: ${numericUserId}, limit: ${limit}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getRecentMatches - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // Find matches where the user was a player or partner
      let query = db.select()
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, numericUserId),
            eq(matches.playerTwoId, numericUserId),
            eq(matches.playerOnePartnerId, numericUserId),
            eq(matches.playerTwoPartnerId, numericUserId)
          )
        );
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Apply test data filter for non-admins
      if (!isAdmin) {
        // Add an additional where clause for non-test data
        query = query.where(sql`(${matches.isTestData} = FALSE OR ${matches.isTestData} IS NULL)`);
      }
      
      // Apply sorting and limit
      query = query.orderBy(desc(matches.matchDate)).limit(limit);
      
      const recentMatches = await query;
      console.log(`[Storage] getRecentMatches - Retrieved ${recentMatches.length} matches (filtered by test data visibility: ${!isAdmin})`);
      
      return recentMatches;
    } catch (error) {
      console.error('[Storage] getRecentMatches error:', error);
      return [];
    }
  }
  
  async getMatchesByUser(userId: number, limit: number = 20, offset: number = 0, requestingUserId?: number): Promise<Match[]> {
    try {
      // Validate userId is a proper number to avoid database errors
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getMatchesByUser called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getMatchesByUser called with userId: ${numericUserId}, limit: ${limit}, offset: ${offset}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getMatchesByUser - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // Find matches where the user was a player or partner
      let query = db.select()
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, numericUserId),
            eq(matches.playerTwoId, numericUserId),
            eq(matches.playerOnePartnerId, numericUserId),
            eq(matches.playerTwoPartnerId, numericUserId)
          )
        );
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Apply test data filter for non-admins
      if (!isAdmin) {
        query = query.where(sql`(${matches.isTestData} = FALSE OR ${matches.isTestData} IS NULL)`);
      }
      
      // Apply sorting and pagination
      query = query.orderBy(desc(matches.matchDate))
        .limit(limit)
        .offset(offset);
      
      const userMatches = await query;
      console.log(`[Storage] getMatchesByUser - Retrieved ${userMatches.length} matches (filtered by test data visibility: ${!isAdmin})`);
      
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
  async getEvent(id: number, requestingUserId?: number): Promise<Event | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getEvent called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getEvent called with ID: ${numericId}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getEvent - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // PKL-278651-CONN-0005-DEFEVT compatibility update
      // Using safe SQL with column name aliasing and COALESCE for missing columns
      try {
        const result = await db.execute(sql`
          SELECT 
            id, name, description, location, 
            start_date_time as "startDateTime", 
            end_date_time as "endDateTime", 
            max_attendees as "maxAttendees", 
            current_attendees as "currentAttendees", 
            organizer_id as "organizerId",
            is_private as "isPrivate", 
            requires_check_in as "requiresCheckIn", 
            check_in_code as "checkInCode",
            event_type as "eventType", 
            is_test_data as "isTestData", 
            status,
            COALESCE(is_default, false) as "isDefault",
            COALESCE(hide_participant_count, false) as "hideParticipantCount",
            created_at as "createdAt", 
            updated_at as "updatedAt"
          FROM events 
          WHERE id = ${numericId}
          ${!isAdmin ? sql`AND (is_test_data = FALSE OR is_test_data IS NULL)` : sql``}
        `);
        
        const [event] = result;
        
        if (event) {
          console.log(`[Storage] getEvent - Retrieved event ${event.id} (filtered by test data visibility: ${!isAdmin})`);
        } else {
          // This could be due to either the event not existing or being test data for a non-admin user
          console.log(`[Storage] getEvent - No event found with ID ${numericId} (filtered by test data visibility: ${!isAdmin})`);
        }
        
        return event;
      } catch (sqlError) {
        console.error('[Storage] getEvent SQL error:', sqlError);
        
        // Fallback to standard query if the SQL fails due to missing columns
        const query = db.select()
          .from(events)
          .where(eq(events.id, numericId));
        
        // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
        // Apply test data filter for non-admins
        if (!isAdmin) {
          query.where(sql`(${events.isTestData} = FALSE OR ${events.isTestData} IS NULL)`);
        }
        
        const [event] = await query;
      
        if (event) {
          console.log(`[Storage] getEvent - Retrieved event ${event.id} (filtered by test data visibility: ${!isAdmin})`);
        } else {
          // This could be due to either the event not existing or being test data for a non-admin user
          console.log(`[Storage] getEvent - No event found with ID ${numericId} (filtered by test data visibility: ${!isAdmin})`);
        }
        
        return event;
      }
    } catch (error) {
      console.error('[Storage] getEvent error:', error);
      return undefined;
    }
  }
  
  async getEvents(limit: number = 100, offset: number = 0, filters?: Partial<Event>, requestingUserId?: number): Promise<Event[]> {
    try {
      console.log(`[Storage] getEvents called with limit: ${limit}, offset: ${offset}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getEvents - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      let query = db.select().from(events);
      
      // Apply filters if provided
      const conditions = [];
      
      // Apply test data filter based on admin status
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      if (!isAdmin) {
        conditions.push(sql`(${events.isTestData} = FALSE OR ${events.isTestData} IS NULL)`);
      }
      
      if (filters) {
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
      }
      
      // Apply all conditions if any exist
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply pagination
      query = query.limit(limit).offset(offset);
      
      // Sort by start date (most recent first)
      query = query.orderBy(desc(events.startDateTime));
      
      const eventList = await query;
      console.log(`[Storage] getEvents - Retrieved ${eventList.length} events (filtered by test data visibility: ${!isAdmin})`);
      return eventList;
    } catch (error) {
      console.error('[Storage] getEvents error:', error);
      return [];
    }
  }
  
  async getEventsByOrganizer(organizerId: number, limit: number = 100, offset: number = 0, requestingUserId?: number): Promise<Event[]> {
    try {
      const numericOrganizerId = Number(organizerId);
      
      if (isNaN(numericOrganizerId) || !Number.isFinite(numericOrganizerId) || numericOrganizerId < 1) {
        console.log(`[Storage] getEventsByOrganizer called with invalid organizerId: ${organizerId}`);
        return [];
      }
      
      console.log(`[Storage] getEventsByOrganizer called with organizerId: ${numericOrganizerId}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getEventsByOrganizer - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // Build the query with organizer filter
      let query = db.select()
        .from(events)
        .where(eq(events.organizerId, numericOrganizerId));
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Apply test data filter for non-admins
      if (!isAdmin) {
        // Add an additional where clause for non-test data
        query = query.where(sql`(${events.isTestData} = FALSE OR ${events.isTestData} IS NULL)`);
      }
      
      // Apply sorting and pagination
      query = query.orderBy(desc(events.startDateTime))
        .limit(limit)
        .offset(offset);
      
      const eventList = await query;
      console.log(`[Storage] getEventsByOrganizer - Retrieved ${eventList.length} events (filtered by test data visibility: ${!isAdmin})`);
      
      return eventList;
    } catch (error) {
      console.error('[Storage] getEventsByOrganizer error:', error);
      return [];
    }
  }
  
  async getUpcomingEvents(limit: number = 10, requestingUserId?: number): Promise<Event[]> {
    try {
      console.log(`[Storage] getUpcomingEvents called with limit: ${limit}, requestingUserId: ${requestingUserId || 'none'}`);
      
      // Check if the requesting user is an admin
      const isAdmin = requestingUserId ? await this.isUserAdmin(requestingUserId) : false;
      console.log(`[Storage] getUpcomingEvents - isAdmin check for user ${requestingUserId || 'none'}: ${isAdmin}`);
      
      // Use SQL template literal for safe query construction with proper date formatting
      const now = new Date();
      const formattedDate = now.toISOString();
      
      // Define the test data filter based on user's admin status
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      const testDataFilter = isAdmin 
        ? "" 
        : "AND (is_test_data = FALSE OR is_test_data IS NULL) ";
      
      // Use SQL with formatted date string - PKL-278651-CONN-0005-DEFEVT compatibility update
      // Include default events and add fallback for missing columns
      const upcomingEvents = await db.execute(sql`
        SELECT 
          id, name, description, location, 
          start_date_time as "startDateTime", 
          end_date_time as "endDateTime", 
          max_attendees as "maxAttendees", 
          current_attendees as "currentAttendees", 
          organizer_id as "organizerId",
          is_private as "isPrivate", 
          requires_check_in as "requiresCheckIn", 
          check_in_code as "checkInCode",
          event_type as "eventType", 
          is_test_data as "isTestData", 
          status,
          COALESCE(is_default, false) as "isDefault",
          COALESCE(hide_participant_count, false) as "hideParticipantCount",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM events 
        WHERE (status = 'upcoming' OR end_date_time >= ${formattedDate}) 
        AND is_private = false 
        ${sql.raw(testDataFilter)}
        ORDER BY COALESCE(is_default, false) DESC, start_date_time ASC 
        LIMIT ${limit};
      `);
      
      console.log(`[Storage] getUpcomingEvents found ${upcomingEvents.length} events (filtered by test data visibility: ${!isAdmin})`);
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

  // PKL-278651-CONN-0004-PASS-REG - Event Registration operations
  async getEventRegistration(id: number): Promise<EventRegistration | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getEventRegistration called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getEventRegistration called with ID: ${numericId}`);
      
      const [registration] = await db.select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.id, numericId));
      
      return registration;
    } catch (error) {
      console.error('[Storage] getEventRegistration error:', error);
      return undefined;
    }
  }
  
  async getEventRegistrations(eventId: number, limit: number = 100, offset: number = 0): Promise<EventRegistration[]> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] getEventRegistrations called with invalid eventId: ${eventId}`);
        return [];
      }
      
      console.log(`[Storage] getEventRegistrations called for event ID: ${numericEventId}`);
      
      const registrations = await db.select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, numericEventId))
        .orderBy(desc(eventRegistrations.registrationDate))
        .limit(limit)
        .offset(offset);
      
      return registrations;
    } catch (error) {
      console.error('[Storage] getEventRegistrations error:', error);
      return [];
    }
  }
  
  async getUserEventRegistrations(userId: number, limit: number = 100, offset: number = 0): Promise<EventRegistration[]> {
    try {
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getUserEventRegistrations called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getUserEventRegistrations called for user ID: ${numericUserId}`);
      
      const registrations = await db.select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.userId, numericUserId))
        .orderBy(desc(eventRegistrations.registrationDate))
        .limit(limit)
        .offset(offset);
      
      return registrations;
    } catch (error) {
      console.error('[Storage] getUserEventRegistrations error:', error);
      return [];
    }
  }
  
  async registerUserForEvent(registrationData: InsertEventRegistration): Promise<EventRegistration> {
    try {
      console.log(`[Storage] registerUserForEvent called for event ID: ${registrationData.eventId} and user ID: ${registrationData.userId}`);
      
      // Check if the user is already registered for this event
      const isRegistered = await this.isUserRegisteredForEvent(registrationData.eventId, registrationData.userId);
      
      if (isRegistered) {
        console.log(`[Storage] User ${registrationData.userId} is already registered for event ${registrationData.eventId}`);
        
        // Find and return the existing registration
        const [existingRegistration] = await db.select()
          .from(eventRegistrations)
          .where(
            and(
              eq(eventRegistrations.eventId, registrationData.eventId),
              eq(eventRegistrations.userId, registrationData.userId)
            )
          );
          
        if (existingRegistration) {
          return existingRegistration;
        }
      }
      
      // Add new registration
      const [registration] = await db.insert(eventRegistrations)
        .values(registrationData)
        .returning();
        
      console.log(`[Storage] User ${registrationData.userId} successfully registered for event ${registrationData.eventId}`);
      
      return registration;
    } catch (error) {
      console.error('[Storage] registerUserForEvent error:', error);
      throw new Error(`Failed to register user for event: ${error.message}`);
    }
  }
  
  async updateEventRegistration(id: number, updates: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateEventRegistration called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] updateEventRegistration called for registration ID: ${numericId}`);
      
      const [updatedRegistration] = await db.update(eventRegistrations)
        .set(updates)
        .where(eq(eventRegistrations.id, numericId))
        .returning();
        
      console.log(`[Storage] Registration ${numericId} updated successfully`);
      
      return updatedRegistration;
    } catch (error) {
      console.error('[Storage] updateEventRegistration error:', error);
      return undefined;
    }
  }
  
  async cancelEventRegistration(id: number): Promise<boolean> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] cancelEventRegistration called with invalid ID: ${id}`);
        return false;
      }
      
      console.log(`[Storage] cancelEventRegistration called for registration ID: ${numericId}`);
      
      // Update the registration status to 'cancelled' instead of deleting it
      const [cancelledRegistration] = await db.update(eventRegistrations)
        .set({ status: 'cancelled' })
        .where(eq(eventRegistrations.id, numericId))
        .returning();
        
      const success = !!cancelledRegistration;
      console.log(`[Storage] Registration ${numericId} cancelled: ${success}`);
      
      return success;
    } catch (error) {
      console.error('[Storage] cancelEventRegistration error:', error);
      return false;
    }
  }
  
  async isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean> {
    try {
      const numericEventId = Number(eventId);
      const numericUserId = Number(userId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1 ||
          isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] isUserRegisteredForEvent called with invalid IDs: eventId=${eventId}, userId=${userId}`);
        return false;
      }
      
      console.log(`[Storage] isUserRegisteredForEvent checking if user ${numericUserId} is registered for event ${numericEventId}`);
      
      const [registration] = await db.select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, numericEventId),
            eq(eventRegistrations.userId, numericUserId),
            eq(eventRegistrations.status, 'confirmed') // Only count confirmed registrations
          )
        );
        
      const isRegistered = !!registration;
      console.log(`[Storage] User ${numericUserId} is registered for event ${numericEventId}: ${isRegistered}`);
      
      return isRegistered;
    } catch (error) {
      console.error('[Storage] isUserRegisteredForEvent error:', error);
      return false;
    }
  }
  
  async getEventRegistrationCount(eventId: number): Promise<number> {
    try {
      const numericEventId = Number(eventId);
      
      if (isNaN(numericEventId) || !Number.isFinite(numericEventId) || numericEventId < 1) {
        console.log(`[Storage] getEventRegistrationCount called with invalid eventId: ${eventId}`);
        return 0;
      }
      
      console.log(`[Storage] getEventRegistrationCount called for event ID: ${numericEventId}`);
      
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, numericEventId),
            eq(eventRegistrations.status, 'confirmed') // Only count confirmed registrations
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[Storage] getEventRegistrationCount error:', error);
      return 0;
    }
  }
  
  async getRegisteredEvents(userId: number, limit: number = 100, offset: number = 0): Promise<Event[]> {
    try {
      const numericUserId = Number(userId);
      
      if (isNaN(numericUserId) || !Number.isFinite(numericUserId) || numericUserId < 1) {
        console.log(`[Storage] getRegisteredEvents called with invalid userId: ${userId}`);
        return [];
      }
      
      console.log(`[Storage] getRegisteredEvents called for user ID: ${numericUserId}`);
      
      // Get all events the user is registered for with confirmed status
      const result = await db
        .select({
          event: events,
        })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(
          and(
            eq(eventRegistrations.userId, numericUserId),
            eq(eventRegistrations.status, 'confirmed')
          )
        )
        .orderBy(asc(events.startDateTime))
        .limit(limit)
        .offset(offset);
      
      // Extract event objects from the joined result
      const registeredEvents = result.map(r => r.event);
      console.log(`[Storage] Found ${registeredEvents.length} registered events for user ${numericUserId}`);
      
      return registeredEvents;
    } catch (error) {
      console.error('[Storage] getRegisteredEvents error:', error);
      return [];
    }
  }

  // PKL-278651-CONN-0004-PASS-ADMIN - Passport Verification System
  async logPassportVerification(verificationData: InsertPassportVerification): Promise<PassportVerification> {
    try {
      console.log(`[Storage] logPassportVerification called with data:`, JSON.stringify(verificationData));
      
      if (!verificationData.passportCode || !verificationData.status) {
        throw new Error("Invalid verification data: missing required fields");
      }
      
      // Insert the verification record
      const [result] = await db.insert(passportVerifications)
        .values(verificationData)
        .returning();
      
      if (!result) {
        throw new Error("Failed to log passport verification in database");
      }
      
      return result;
    } catch (error) {
      console.error('[Storage] logPassportVerification error:', error);
      throw error;
    }
  }
  
  async getPassportVerificationLogs(
    limit: number = 100, 
    offset: number = 0, 
    filters?: {
      passportCode?: string;
      userId?: number;
      eventId?: number;
      status?: string;
      verifiedBy?: number;
    }
  ): Promise<PassportVerification[]> {
    try {
      console.log(`[Storage] getPassportVerificationLogs called with limit: ${limit}, offset: ${offset}`);
      
      let query = db.select()
        .from(passportVerifications);
      
      // Apply filters if provided
      if (filters) {
        const conditions = [];
        
        if (filters.passportCode) {
          conditions.push(eq(passportVerifications.passportCode, filters.passportCode));
        }
        
        if (filters.userId) {
          conditions.push(eq(passportVerifications.userId, filters.userId));
        }
        
        if (filters.eventId) {
          conditions.push(eq(passportVerifications.eventId, filters.eventId));
        }
        
        if (filters.status) {
          conditions.push(eq(passportVerifications.status, filters.status));
        }
        
        if (filters.verifiedBy) {
          conditions.push(eq(passportVerifications.verifiedBy, filters.verifiedBy));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      // Order by timestamp descending and apply pagination
      const logs = await query
        .orderBy(desc(passportVerifications.timestamp))
        .limit(limit)
        .offset(offset);
      
      return logs;
    } catch (error) {
      console.error('[Storage] getPassportVerificationLogs error:', error);
      return [];
    }
  }
  
  async verifyPassportForEvent(passportCode: string, eventId?: number): Promise<{
    valid: boolean;
    userId?: number;
    username?: string;
    events?: Event[];
    message?: string;
  }> {
    try {
      if (!passportCode) {
        return { valid: false, message: "Invalid passport code" };
      }
      
      console.log(`[Storage] verifyPassportForEvent called for passport code: ${passportCode}, eventId: ${eventId || 'none'}`);
      
      // Find the user with this passport code
      const user = await this.getUserByPassportCode(passportCode);
      
      if (!user) {
        return { valid: false, message: "Invalid passport: User not found" };
      }
      
      // If a specific event was provided, check if the user is registered for it
      if (eventId) {
        const isRegistered = await this.isUserRegisteredForEvent(eventId, user.id);
        
        if (!isRegistered) {
          return { 
            valid: false, 
            userId: user.id,
            username: user.username,
            message: "User is not registered for this event" 
          };
        }
        
        const isCheckedIn = await this.isUserCheckedIntoEvent(eventId, user.id);
        
        if (isCheckedIn) {
          return { 
            valid: false, 
            userId: user.id,
            username: user.username,
            message: "User is already checked in to this event" 
          };
        }
        
        // All checks passed, the passport is valid for this event
        return { 
          valid: true, 
          userId: user.id,
          username: user.username,
          message: "Passport valid for check-in" 
        };
      }
      
      // If no specific event provided, get all events the user is registered for
      const registeredEvents = await this.getRegisteredEvents(user.id);
      
      return { 
        valid: true, 
        userId: user.id,
        username: user.username,
        events: registeredEvents,
        message: `User has ${registeredEvents.length} registered events` 
      };
    } catch (error) {
      console.error('[Storage] verifyPassportForEvent error:', error);
      return { valid: false, message: "Server error verifying passport" };
    }
  }
  
  // PKL-278651-ADMIN-0013-SEC - Admin Security Enhancements
  // Audit logging operations
  async createAuditLog(logEntry: InsertAuditLog): Promise<AuditLog> {
    try {
      console.log(`[Storage] Creating audit log entry: ${JSON.stringify(logEntry)}`);
      
      // Insert the audit log entry
      const [entry] = await db.insert(auditLogs).values({
        ...logEntry,
        // Ensure correct types for enums
        action: logEntry.action.toString(), 
        resource: logEntry.resource.toString()
      }).returning();
      
      return {
        ...entry,
        // Convert string values back to enum types
        action: entry.action as AuditAction,
        resource: entry.resource as AuditResource
      };
    } catch (error) {
      console.error('[Storage] Error creating audit log:', error);
      // In case of error, return a minimum valid entry to avoid breaking the application flow
      return {
        id: 'error',
        timestamp: new Date(),
        userId: logEntry.userId,
        action: logEntry.action,
        resource: logEntry.resource,
        ipAddress: logEntry.ipAddress,
        resourceId: logEntry.resourceId || null,
        userAgent: logEntry.userAgent || null,
        statusCode: logEntry.statusCode || null,
        additionalData: logEntry.additionalData || null
      } as AuditLog;
    }
  }
  
  async getAuditLogs(
    filters: {
      limit?: number;
      offset?: number;
      userId?: number;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      suspicious?: boolean;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      // Default values if not provided
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      
      console.log(`[Storage] Getting audit logs with filters: ${JSON.stringify(filters)}`);
      
      // Start building the query
      let query = db.select().from(auditLogs);
      
      // Apply filters
      const conditions: SQL<unknown>[] = [];
      
      if (filters.userId) {
        conditions.push(eq(auditLogs.userId, filters.userId));
      }
      
      if (filters.action) {
        // Support partial action matching (e.g., "ADMIN_" to match all admin actions)
        if (filters.action.endsWith('_')) {
          conditions.push(sql`${auditLogs.action} LIKE ${filters.action + '%'}`);
        } else {
          conditions.push(eq(auditLogs.action, filters.action as any));
        }
      }
      
      if (filters.resource) {
        conditions.push(eq(auditLogs.resource, filters.resource as any));
      }
      
      // Add suspicious filter if true
      if (filters.suspicious) {
        conditions.push(sql`${auditLogs.additionalData}->>'suspicious' = 'true'`);
      }
      
      if (filters.startDate) {
        conditions.push(sql`${auditLogs.timestamp} >= ${filters.startDate}`);
      }
      
      if (filters.endDate) {
        conditions.push(sql`${auditLogs.timestamp} <= ${filters.endDate}`);
      }
      
      // Apply all conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Add order, limit and offset
      query = query.orderBy(desc(auditLogs.timestamp))
                 .limit(limit)
                 .offset(offset);
      
      // Execute the query
      const logs = await query;
      
      // Type cast to handle enum types
      return logs.map(log => ({
        ...log,
        action: log.action as AuditAction,
        resource: log.resource as AuditResource
      }));
    } catch (error) {
      console.error('[Storage] Error getting audit logs:', error);
      return [];
    }
  }

  // PKL-278651-TOURN-0001-BRCKT - Tournament Bracket System
  // Tournament Bracket operations
  async getBracketById(id: number): Promise<TournamentBracket | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getBracketById called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getBracketById called with ID: ${numericId}`);
      
      const [bracket] = await db.select()
        .from(tournamentBrackets)
        .where(eq(tournamentBrackets.id, numericId));
      
      return bracket;
    } catch (error) {
      console.error('[Storage] getBracketById error:', error);
      return undefined;
    }
  }
  
  async getBracketsByTournament(tournamentId: number): Promise<TournamentBracket[]> {
    try {
      const numericId = Number(tournamentId);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getBracketsByTournament called with invalid tournamentId: ${tournamentId}`);
        return [];
      }
      
      console.log(`[Storage] getBracketsByTournament called with tournamentId: ${numericId}`);
      
      const brackets = await db.select()
        .from(tournamentBrackets)
        .where(eq(tournamentBrackets.tournamentId, numericId))
        .orderBy(asc(tournamentBrackets.id));
      
      return brackets;
    } catch (error) {
      console.error('[Storage] getBracketsByTournament error:', error);
      return [];
    }
  }
  
  async createBracket(bracketData: InsertTournamentBracket): Promise<TournamentBracket> {
    try {
      console.log(`[Storage] createBracket called with data:`, JSON.stringify(bracketData, null, 2));
      
      const [bracket] = await db.insert(tournamentBrackets)
        .values(bracketData)
        .returning();
        
      return bracket;
    } catch (error) {
      console.error('[Storage] createBracket error:', error);
      throw new Error(`Failed to create bracket: ${error.message}`);
    }
  }
  
  async updateBracket(id: number, updates: Partial<InsertTournamentBracket>): Promise<TournamentBracket | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateBracket called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] updateBracket called with ID: ${numericId} and updates:`, JSON.stringify(updates, null, 2));
      
      const [updatedBracket] = await db.update(tournamentBrackets)
        .set(updates)
        .where(eq(tournamentBrackets.id, numericId))
        .returning();
        
      return updatedBracket;
    } catch (error) {
      console.error('[Storage] updateBracket error:', error);
      return undefined;
    }
  }
  
  async deleteBracket(id: number): Promise<boolean> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] deleteBracket called with invalid ID: ${id}`);
        return false;
      }
      
      console.log(`[Storage] deleteBracket called with ID: ${numericId}`);
      
      // Delete all associated matches first
      await db.delete(tournamentBracketMatches)
        .where(eq(tournamentBracketMatches.bracketId, numericId));
        
      // Delete all associated rounds
      await db.delete(tournamentRounds)
        .where(eq(tournamentRounds.bracketId, numericId));
        
      // Delete the bracket
      const result = await db.delete(tournamentBrackets)
        .where(eq(tournamentBrackets.id, numericId));
        
      console.log(`[Storage] deleteBracket result:`, result);
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteBracket error:', error);
      return false;
    }
  }
  
  // Tournament Bracket Match operations
  async getBracketMatch(id: number): Promise<TournamentBracketMatch | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getBracketMatch called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] getBracketMatch called with ID: ${numericId}`);
      
      const [match] = await db.select()
        .from(tournamentBracketMatches)
        .where(eq(tournamentBracketMatches.id, numericId));
      
      return match;
    } catch (error) {
      console.error('[Storage] getBracketMatch error:', error);
      return undefined;
    }
  }
  
  async getMatchesByBracket(bracketId: number): Promise<TournamentBracketMatch[]> {
    try {
      const numericId = Number(bracketId);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getMatchesByBracket called with invalid bracketId: ${bracketId}`);
        return [];
      }
      
      console.log(`[Storage] getMatchesByBracket called with bracketId: ${numericId}`);
      
      const matches = await db.select()
        .from(tournamentBracketMatches)
        .where(eq(tournamentBracketMatches.bracketId, numericId))
        .orderBy(asc(tournamentBracketMatches.roundId), asc(tournamentBracketMatches.matchNumber));
      
      return matches;
    } catch (error) {
      console.error('[Storage] getMatchesByBracket error:', error);
      return [];
    }
  }
  
  async getMatchesByRound(roundId: number): Promise<TournamentBracketMatch[]> {
    try {
      const numericId = Number(roundId);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] getMatchesByRound called with invalid roundId: ${roundId}`);
        return [];
      }
      
      console.log(`[Storage] getMatchesByRound called with roundId: ${numericId}`);
      
      const matches = await db.select()
        .from(tournamentBracketMatches)
        .where(eq(tournamentBracketMatches.roundId, numericId))
        .orderBy(asc(tournamentBracketMatches.matchNumber));
      
      return matches;
    } catch (error) {
      console.error('[Storage] getMatchesByRound error:', error);
      return [];
    }
  }
  
  async createBracketMatch(matchData: InsertTournamentBracketMatch): Promise<TournamentBracketMatch> {
    try {
      console.log(`[Storage] createBracketMatch called with data:`, JSON.stringify(matchData, null, 2));
      
      const [match] = await db.insert(tournamentBracketMatches)
        .values(matchData)
        .returning();
        
      return match;
    } catch (error) {
      console.error('[Storage] createBracketMatch error:', error);
      throw new Error(`Failed to create bracket match: ${error.message}`);
    }
  }
  
  async updateBracketMatch(id: number, updates: Partial<InsertTournamentBracketMatch>): Promise<TournamentBracketMatch | undefined> {
    try {
      const numericId = Number(id);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] updateBracketMatch called with invalid ID: ${id}`);
        return undefined;
      }
      
      console.log(`[Storage] updateBracketMatch called with ID: ${numericId} and updates:`, JSON.stringify(updates, null, 2));
      
      const [updatedMatch] = await db.update(tournamentBracketMatches)
        .set(updates)
        .where(eq(tournamentBracketMatches.id, numericId))
        .returning();
        
      return updatedMatch;
    } catch (error) {
      console.error('[Storage] updateBracketMatch error:', error);
      return undefined;
    }
  }
  
  async recordMatchResult(matchId: number, resultData: {
    winnerId: number;
    loserId: number;
    score: string;
    scoreDetails?: any;
  }): Promise<TournamentBracketMatch | undefined> {
    try {
      const numericId = Number(matchId);
      
      if (isNaN(numericId) || !Number.isFinite(numericId) || numericId < 1) {
        console.log(`[Storage] recordMatchResult called with invalid matchId: ${matchId}`);
        return undefined;
      }
      
      console.log(`[Storage] recordMatchResult called with matchId: ${numericId} and data:`, JSON.stringify(resultData, null, 2));
      
      // Get current match to verify it exists and to check next match
      const match = await this.getBracketMatch(numericId);
      if (!match) {
        console.error(`[Storage] recordMatchResult - Match with ID ${numericId} not found`);
        return undefined;
      }
      
      // Update the match with result data
      const updates: Partial<InsertTournamentBracketMatch> = {
        winnerId: resultData.winnerId,
        loserId: resultData.loserId,
        score: resultData.score,
        scoreDetails: resultData.scoreDetails ? JSON.stringify(resultData.scoreDetails) : null,
        status: 'completed',
        updatedAt: new Date().toISOString()
      };
      
      const updatedMatch = await this.updateBracketMatch(numericId, updates);
      
      // If this match feeds into another match, update the next match with the winner
      if (match.nextMatchId) {
        const nextMatch = await this.getBracketMatch(match.nextMatchId);
        if (nextMatch) {
          // Determine if the winner goes into team1 or team2 slot based on match number
          const isEvenMatch = match.matchNumber % 2 === 0;
          const nextMatchUpdate: Partial<InsertTournamentBracketMatch> = isEvenMatch 
            ? { team1Id: resultData.winnerId } 
            : { team2Id: resultData.winnerId };
            
          await this.updateBracketMatch(match.nextMatchId, nextMatchUpdate);
        }
      } else {
        // This was the final match, update the bracket status
        if (match.bracketId) {
          await this.updateBracket(match.bracketId, {
            status: 'completed',
            endDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      return updatedMatch;
    } catch (error) {
      console.error('[Storage] recordMatchResult error:', error);
      return undefined;
    }
  }
  // PKL-278651-COMM-0006-HUB - Community Hub Implementation
  // Community operations
  async getCommunities(filters = {}): Promise<Community[]> {
    return communityStorageImplementation.getCommunities(filters);
  }
  
  async getCommunityById(id: number): Promise<Community | undefined> {
    return communityStorageImplementation.getCommunityById(id);
  }
  
  async getCommunitiesByCreator(userId: number): Promise<Community[]> {
    return communityStorageImplementation.getCommunitiesByCreator(userId);
  }
  
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    return communityStorageImplementation.createCommunity(communityData);
  }
  
  async updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined> {
    return communityStorageImplementation.updateCommunity(id, updates);
  }
  
  async incrementCommunityMemberCount(communityId: number): Promise<void> {
    return communityStorageImplementation.incrementCommunityMemberCount(communityId);
  }
  
  async decrementCommunityMemberCount(communityId: number): Promise<void> {
    return communityStorageImplementation.decrementCommunityMemberCount(communityId);
  }
  
  async incrementCommunityEventCount(communityId: number): Promise<void> {
    return communityStorageImplementation.incrementCommunityEventCount(communityId);
  }
  
  async decrementCommunityEventCount(communityId: number): Promise<void> {
    return communityStorageImplementation.decrementCommunityEventCount(communityId);
  }
  
  // Community members operations
  async getCommunityMembers(communityId: number): Promise<(CommunityMember & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    return communityStorageImplementation.getCommunityMembers(communityId);
  }
  
  async getCommunityMembership(communityId: number, userId: number): Promise<CommunityMember | undefined> {
    return communityStorageImplementation.getCommunityMembership(communityId, userId);
  }
  
  async getCommunityMembershipsByUserId(userId: number): Promise<CommunityMember[]> {
    return communityStorageImplementation.getCommunityMembershipsByUserId(userId);
  }
  
  async createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember> {
    return communityStorageImplementation.createCommunityMember(memberData);
  }
  
  async updateCommunityMembership(communityId: number, userId: number, updates: Partial<InsertCommunityMember>): Promise<CommunityMember | undefined> {
    return communityStorageImplementation.updateCommunityMembership(communityId, userId, updates);
  }
  
  async deleteCommunityMembership(communityId: number, userId: number): Promise<boolean> {
    return communityStorageImplementation.deleteCommunityMembership(communityId, userId);
  }
  
  async getCommunityAdminCount(communityId: number): Promise<number> {
    return communityStorageImplementation.getCommunityAdminCount(communityId);
  }
  
  // Community posts operations
  async getCommunityPosts(communityId: number, options = {}): Promise<(CommunityPost & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    return communityStorageImplementation.getCommunityPosts(communityId, options);
  }
  
  async getCommunityPostById(postId: number): Promise<CommunityPost | undefined> {
    return communityStorageImplementation.getCommunityPostById(postId);
  }
  
  async createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost> {
    return communityStorageImplementation.createCommunityPost(postData);
  }
  
  async updateCommunityPost(postId: number, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    return communityStorageImplementation.updateCommunityPost(postId, updates);
  }
  
  async deleteCommunityPost(postId: number): Promise<boolean> {
    return communityStorageImplementation.deleteCommunityPost(postId);
  }
  
  async incrementPostCommentCount(postId: number): Promise<void> {
    return communityStorageImplementation.incrementPostCommentCount(postId);
  }
  
  async decrementPostCommentCount(postId: number): Promise<void> {
    return communityStorageImplementation.decrementPostCommentCount(postId);
  }
  
  async incrementPostLikeCount(postId: number): Promise<void> {
    return communityStorageImplementation.incrementPostLikeCount(postId);
  }
  
  async decrementPostLikeCount(postId: number): Promise<void> {
    return communityStorageImplementation.decrementPostLikeCount(postId);
  }
  
  // Community events operations
  async getCommunityEvents(communityId: number, options = {}): Promise<CommunityEvent[]> {
    return communityStorageImplementation.getCommunityEvents(communityId, options);
  }
  
  async getCommunityEventById(eventId: number): Promise<CommunityEvent | undefined> {
    return communityStorageImplementation.getCommunityEventById(eventId);
  }
  
  async createCommunityEvent(eventData: InsertCommunityEvent): Promise<CommunityEvent> {
    return communityStorageImplementation.createCommunityEvent(eventData);
  }
  
  async updateCommunityEvent(eventId: number, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined> {
    return communityStorageImplementation.updateCommunityEvent(eventId, updates);
  }
  
  async deleteCommunityEvent(eventId: number): Promise<boolean> {
    return communityStorageImplementation.deleteCommunityEvent(eventId);
  }
  
  async incrementEventAttendeeCount(eventId: number): Promise<void> {
    return communityStorageImplementation.incrementEventAttendeeCount(eventId);
  }
  
  async decrementEventAttendeeCount(eventId: number): Promise<void> {
    return communityStorageImplementation.decrementEventAttendeeCount(eventId);
  }
  
  // Event attendance operations
  async getEventAttendees(eventId: number): Promise<(CommunityEventAttendee & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    return communityStorageImplementation.getEventAttendees(eventId);
  }
  
  async getEventAttendance(eventId: number, userId: number): Promise<CommunityEventAttendee | undefined> {
    return communityStorageImplementation.getEventAttendance(eventId, userId);
  }
  
  async createEventAttendance(attendanceData: InsertCommunityEventAttendee): Promise<CommunityEventAttendee> {
    return communityStorageImplementation.createEventAttendance(attendanceData);
  }
  
  async updateEventAttendance(eventId: number, userId: number, updates: Partial<InsertCommunityEventAttendee>): Promise<CommunityEventAttendee | undefined> {
    return communityStorageImplementation.updateEventAttendance(eventId, userId, updates);
  }
  
  async cancelEventAttendance(eventId: number, userId: number): Promise<boolean> {
    return communityStorageImplementation.cancelEventAttendance(eventId, userId);
  }
  
  // Post comments operations
  async getPostComments(postId: number): Promise<(CommunityPostComment & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    return communityStorageImplementation.getPostComments(postId);
  }
  
  async createCommunityPostComment(commentData: InsertCommunityPostComment): Promise<CommunityPostComment> {
    return communityStorageImplementation.createCommunityPostComment(commentData);
  }
  
  async deleteComment(commentId: number): Promise<boolean> {
    return communityStorageImplementation.deleteComment(commentId);
  }
  
  // Post likes operations
  async getPostLike(postId: number, userId: number): Promise<{ id: number } | undefined> {
    return communityStorageImplementation.getPostLike(postId, userId);
  }
  
  async createPostLike(likeData: { postId: number, userId: number }): Promise<{ id: number }> {
    return communityStorageImplementation.createPostLike(likeData);
  }
  
  async deletePostLike(postId: number, userId: number): Promise<boolean> {
    return communityStorageImplementation.deletePostLike(postId, userId);
  }
  
  // Join requests operations
  async createCommunityJoinRequest(requestData: { communityId: number, userId: number, message?: string }): Promise<{ id: number, status: string }> {
    return communityStorageImplementation.createCommunityJoinRequest(requestData);
  }
  
  async getCommunityJoinRequests(communityId: number): Promise<any[]> {
    return communityStorageImplementation.getCommunityJoinRequests(communityId);
  }
  
  async updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any> {
    return communityStorageImplementation.updateJoinRequestStatus(requestId, status, reviewedByUserId);
  }
  
  // PKL-278651-COMM-0028-NOTIF-REALTIME - User notification methods
  
  /**
   * Get all active user IDs from the system
   * Used for broadcasting system-wide notifications
   */
  async getAllActiveUserIds(): Promise<number[]> {
    try {
      const result = await db.select({ id: users.id })
        .from(users)
        .where(and(
          eq(users.isActive, true),
          eq(users.isTestData, false)
        ));
      
      return result.map(user => user.id);
    } catch (error) {
      console.error('[Storage] getAllActiveUserIds error:', error);
      return [];
    }
  }
  
  /**
   * Get user notifications with filtering options
   */
  async getUserNotifications(
    userId: number, 
    options?: {
      limit?: number;
      offset?: number;
      includeRead?: boolean;
      type?: string;
    }
  ): Promise<UserNotification[]> {
    try {
      const { limit = 20, offset = 0, includeRead = false, type } = options || {};
      
      // Build query conditions
      const conditions = [];
      conditions.push(eq(userNotifications.userId, userId));
      conditions.push(isNull(userNotifications.deletedAt));
      
      if (!includeRead) {
        conditions.push(eq(userNotifications.isRead, false));
      }
      
      if (type) {
        conditions.push(eq(userNotifications.type, type));
      }
      
      // Execute query
      const notifications = await db.select()
        .from(userNotifications)
        .where(and(...conditions))
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit)
        .offset(offset);
      
      return notifications;
    } catch (error) {
      console.error('[Storage] getUserNotifications error:', error);
      return [];
    }
  }
  
  /**
   * Get a specific notification by ID
   */
  async getUserNotificationById(notificationId: number): Promise<UserNotification | undefined> {
    try {
      const [notification] = await db.select()
        .from(userNotifications)
        .where(and(
          eq(userNotifications.id, notificationId),
          isNull(userNotifications.deletedAt)
        ));
      
      return notification;
    } catch (error) {
      console.error('[Storage] getUserNotificationById error:', error);
      return undefined;
    }
  }
  
  /**
   * Create a notification for a user
   */
  async createUserNotification(notification: InsertUserNotification): Promise<UserNotification> {
    try {
      const [createdNotification] = await db.insert(userNotifications)
        .values(notification)
        .returning();
      
      return createdNotification;
    } catch (error) {
      console.error('[Storage] createUserNotification error:', error);
      throw error;
    }
  }
  
  /**
   * Create notifications for multiple users
   */
  async createNotificationsForUsers(
    userIds: number[], 
    notificationData: Omit<InsertUserNotification, 'userId'>
  ): Promise<number> {
    try {
      // Generate notifications for each user
      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId
      }));
      
      // Insert all notifications
      const result = await db.insert(userNotifications)
        .values(notifications)
        .returning({ id: userNotifications.id });
      
      return result.length;
    } catch (error) {
      console.error('[Storage] createNotificationsForUsers error:', error);
      return 0;
    }
  }
  
  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      await db.update(userNotifications)
        .set({ 
          isRead: true,
          updatedAt: new Date()
        })
        .where(eq(userNotifications.id, notificationId));
      
      return true;
    } catch (error) {
      console.error('[Storage] markNotificationAsRead error:', error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    try {
      const result = await db.update(userNotifications)
        .set({ 
          isRead: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.isRead, false),
          isNull(userNotifications.deletedAt)
        ))
        .returning({ id: userNotifications.id });
      
      return result.length;
    } catch (error) {
      console.error('[Storage] markAllNotificationsAsRead error:', error);
      return 0;
    }
  }
  
  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userNotifications)
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.isRead, false),
          isNull(userNotifications.deletedAt)
        ));
      
      return result?.count || 0;
    } catch (error) {
      console.error('[Storage] getUnreadNotificationCount error:', error);
      return 0;
    }
  }
  
  /**
   * Soft delete a notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      await db.update(userNotifications)
        .set({ deletedAt: new Date() })
        .where(eq(userNotifications.id, notificationId));
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteNotification error:', error);
      return false;
    }
  }
  
  /**
   * Soft delete all notifications for a user
   */
  async deleteAllNotifications(userId: number): Promise<number> {
    try {
      const result = await db.update(userNotifications)
        .set({ deletedAt: new Date() })
        .where(and(
          eq(userNotifications.userId, userId),
          isNull(userNotifications.deletedAt)
        ))
        .returning({ id: userNotifications.id });
      
      return result.length;
    } catch (error) {
      console.error('[Storage] deleteAllNotifications error:', error);
      return 0;
    }
  }
  
  /**
   * Get notification preferences for a user
   */
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]> {
    try {
      const preferences = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      
      return preferences;
    } catch (error) {
      console.error('[Storage] getUserNotificationPreferences error:', error);
      return [];
    }
  }
  
  /**
   * Get notification preference for a specific type
   */
  async getUserNotificationPreferenceByType(userId: number, type: string): Promise<NotificationPreference | undefined> {
    try {
      const [preference] = await db.select()
        .from(notificationPreferences)
        .where(and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.type, type)
        ));
      
      return preference;
    } catch (error) {
      console.error('[Storage] getUserNotificationPreferenceByType error:', error);
      return undefined;
    }
  }
  
  /**
   * Update notification preference
   */
  async updateNotificationPreference(userId: number, type: string, enabled: boolean, channels?: string[]): Promise<NotificationPreference> {
    try {
      // Check if preference exists
      const existingPref = await this.getUserNotificationPreferenceByType(userId, type);
      
      if (existingPref) {
        // Update existing preference
        const [updatedPref] = await db.update(notificationPreferences)
          .set({ 
            enabled, 
            channels: channels || existingPref.channels,
            updatedAt: new Date()
          })
          .where(and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.type, type)
          ))
          .returning();
        
        return updatedPref;
      } else {
        // Create new preference
        const [newPref] = await db.insert(notificationPreferences)
          .values({
            userId,
            type,
            enabled,
            channels: channels || ['app'],
            updatedAt: new Date()
          })
          .returning();
        
        return newPref;
      }
    } catch (error) {
      console.error('[Storage] updateNotificationPreference error:', error);
      throw error;
    }
  }

  /**
   * PKL-278651-COACH-0001-CORE - S.A.G.E. (Skills Assessment & Growth Engine)
   * SAGE Coaching Session operations
   */
  
  async createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession> {
    try {
      const [session] = await db.insert(coachingSessions).values(data).returning();
      return session;
    } catch (error) {
      console.error('[Storage] createCoachingSession error:', error);
      throw error;
    }
  }

  async getCoachingSession(id: number): Promise<CoachingSession | undefined> {
    try {
      const [session] = await db.select().from(coachingSessions).where(eq(coachingSessions.id, id));
      return session;
    } catch (error) {
      console.error('[Storage] getCoachingSession error:', error);
      return undefined;
    }
  }

  async getCoachingSessionsByUserId(userId: number): Promise<CoachingSession[]> {
    try {
      return await db.select()
        .from(coachingSessions)
        .where(eq(coachingSessions.userId, userId))
        .orderBy(desc(coachingSessions.createdAt));
    } catch (error) {
      console.error('[Storage] getCoachingSessionsByUserId error:', error);
      return [];
    }
  }

  async updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession> {
    try {
      const [updatedSession] = await db.update(coachingSessions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(coachingSessions.id, id))
        .returning();
      return updatedSession;
    } catch (error) {
      console.error('[Storage] updateCoachingSession error:', error);
      throw error;
    }
  }

  /**
   * SAGE Coaching Insight operations
   */
  
  async createCoachingInsight(data: InsertCoachingInsight): Promise<CoachingInsight> {
    try {
      const [insight] = await db.insert(coachingInsights).values(data).returning();
      return insight;
    } catch (error) {
      console.error('[Storage] createCoachingInsight error:', error);
      throw error;
    }
  }

  async getCoachingInsightsBySessionId(sessionId: number): Promise<CoachingInsight[]> {
    try {
      return await db.select()
        .from(coachingInsights)
        .where(eq(coachingInsights.sessionId, sessionId))
        .orderBy([desc(coachingInsights.priority), asc(coachingInsights.id)]);
    } catch (error) {
      console.error('[Storage] getCoachingInsightsBySessionId error:', error);
      return [];
    }
  }

  async getCoachingInsightsByUserId(userId: number): Promise<CoachingInsight[]> {
    try {
      // Join with sessions to filter by user
      const results = await db.select({
        insight: coachingInsights
      })
      .from(coachingInsights)
      .innerJoin(
        coachingSessions,
        eq(coachingInsights.sessionId, coachingSessions.id)
      )
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingInsights.createdAt));
      
      return results.map(r => r.insight);
    } catch (error) {
      console.error('[Storage] getCoachingInsightsByUserId error:', error);
      return [];
    }
  }

  async updateCoachingInsight(id: number, data: Partial<InsertCoachingInsight>): Promise<CoachingInsight> {
    try {
      const [updatedInsight] = await db.update(coachingInsights)
        .set(data)
        .where(eq(coachingInsights.id, id))
        .returning();
      return updatedInsight;
    } catch (error) {
      console.error('[Storage] updateCoachingInsight error:', error);
      throw error;
    }
  }

  /**
   * SAGE Training Plan operations
   */
  
  async createTrainingPlan(data: InsertTrainingPlan): Promise<TrainingPlan> {
    try {
      const [plan] = await db.insert(trainingPlans).values(data).returning();
      return plan;
    } catch (error) {
      console.error('[Storage] createTrainingPlan error:', error);
      throw error;
    }
  }

  async getTrainingPlan(id: number): Promise<TrainingPlan | undefined> {
    try {
      const [plan] = await db.select().from(trainingPlans).where(eq(trainingPlans.id, id));
      return plan;
    } catch (error) {
      console.error('[Storage] getTrainingPlan error:', error);
      return undefined;
    }
  }

  async getTrainingPlansByUserId(userId: number): Promise<TrainingPlan[]> {
    try {
      // Join with sessions to filter by user
      const results = await db.select({
        plan: trainingPlans
      })
      .from(trainingPlans)
      .innerJoin(
        coachingSessions,
        eq(trainingPlans.sessionId, coachingSessions.id)
      )
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(trainingPlans.createdAt));
      
      return results.map(r => r.plan);
    } catch (error) {
      console.error('[Storage] getTrainingPlansByUserId error:', error);
      return [];
    }
  }

  async updateTrainingPlan(id: number, data: Partial<InsertTrainingPlan>): Promise<TrainingPlan> {
    try {
      const [updatedPlan] = await db.update(trainingPlans)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(trainingPlans.id, id))
        .returning();
      return updatedPlan;
    } catch (error) {
      console.error('[Storage] updateTrainingPlan error:', error);
      throw error;
    }
  }

  /**
   * SAGE Training Exercise operations
   */
  
  async createTrainingExercise(data: InsertTrainingExercise): Promise<TrainingExercise> {
    try {
      const [exercise] = await db.insert(trainingExercises).values(data).returning();
      return exercise;
    } catch (error) {
      console.error('[Storage] createTrainingExercise error:', error);
      throw error;
    }
  }

  async getTrainingExercisesByPlanId(planId: number): Promise<TrainingExercise[]> {
    try {
      return await db.select()
        .from(trainingExercises)
        .where(eq(trainingExercises.planId, planId))
        .orderBy([asc(trainingExercises.dayNumber), asc(trainingExercises.orderInDay)]);
    } catch (error) {
      console.error('[Storage] getTrainingExercisesByPlanId error:', error);
      return [];
    }
  }

  async updateTrainingExercise(id: number, data: Partial<InsertTrainingExercise>): Promise<TrainingExercise> {
    try {
      const [updatedExercise] = await db.update(trainingExercises)
        .set(data)
        .where(eq(trainingExercises.id, id))
        .returning();
      return updatedExercise;
    } catch (error) {
      console.error('[Storage] updateTrainingExercise error:', error);
      throw error;
    }
  }

  async markExerciseComplete(id: number, completed: boolean): Promise<TrainingExercise> {
    try {
      const [updatedExercise] = await db.update(trainingExercises)
        .set({ isCompleted: completed })
        .where(eq(trainingExercises.id, id))
        .returning();
      return updatedExercise;
    } catch (error) {
      console.error('[Storage] markExerciseComplete error:', error);
      throw error;
    }
  }

  /**
   * SAGE Coaching Content Library operations
   */
  
  async getCoachingContent(options?: { 
    contentType?: string, 
    dimensionCode?: DimensionCode, 
    skillLevel?: string, 
    tags?: string[],
    limit?: number
  }): Promise<CoachingContentLibrary[]> {
    try {
      let query = db.select().from(coachingContentLibrary);
      
      if (options) {
        if (options.contentType) {
          query = query.where(eq(coachingContentLibrary.contentType, options.contentType));
        }
        
        if (options.dimensionCode) {
          query = query.where(eq(coachingContentLibrary.dimensionCode, options.dimensionCode));
        }
        
        if (options.skillLevel) {
          query = query.where(eq(coachingContentLibrary.skillLevel, options.skillLevel));
        }
        
        if (options.tags && options.tags.length > 0) {
          // Find content that contains any of the tags
          for (const tag of options.tags) {
            query = query.where(sql`${coachingContentLibrary.tags} LIKE ${`%${tag}%`}`);
          }
        }
        
        if (options.limit) {
          query = query.limit(options.limit);
        }
      }
      
      return await query.orderBy(desc(coachingContentLibrary.updatedAt));
    } catch (error) {
      console.error('[Storage] getCoachingContent error:', error);
      return [];
    }
  }

  async createCoachingContent(data: InsertCoachingContentLibrary): Promise<CoachingContentLibrary> {
    try {
      const [content] = await db.insert(coachingContentLibrary).values(data).returning();
      return content;
    } catch (error) {
      console.error('[Storage] createCoachingContent error:', error);
      throw error;
    }
  }

  /**
   * SAGE User Progress tracking
   */
  
  async logUserProgress(data: InsertUserProgressLog): Promise<UserProgressLog> {
    try {
      const [progressLog] = await db.insert(userProgressLogs).values(data).returning();
      return progressLog;
    } catch (error) {
      console.error('[Storage] logUserProgress error:', error);
      throw error;
    }
  }

  async getUserProgressBySessionId(sessionId: number): Promise<UserProgressLog[]> {
    try {
      return await db.select()
        .from(userProgressLogs)
        .where(eq(userProgressLogs.sessionId, sessionId))
        .orderBy(desc(userProgressLogs.createdAt));
    } catch (error) {
      console.error('[Storage] getUserProgressBySessionId error:', error);
      return [];
    }
  }

  async getUserProgressByPlanId(planId: number): Promise<UserProgressLog[]> {
    try {
      return await db.select()
        .from(userProgressLogs)
        .where(eq(userProgressLogs.planId, planId))
        .orderBy(desc(userProgressLogs.createdAt));
    } catch (error) {
      console.error('[Storage] getUserProgressByPlanId error:', error);
      return [];
    }
  }
  
  /**
   * PKL-278651-SAGE-0002-CONV - SAGE Conversational UI Implementation
   * Conversation operations
   */
   
  async createConversation(data: InsertCoachingConversation): Promise<CoachingConversation> {
    try {
      const [conversation] = await db.insert(coachingConversations).values(data).returning();
      return conversation;
    } catch (error) {
      console.error('[Storage] createConversation error:', error);
      throw error;
    }
  }
  
  async getConversation(id: number): Promise<CoachingConversation | undefined> {
    try {
      const [conversation] = await db.select().from(coachingConversations).where(eq(coachingConversations.id, id));
      return conversation;
    } catch (error) {
      console.error('[Storage] getConversation error:', error);
      return undefined;
    }
  }
  
  async getConversationsByUserId(userId: number): Promise<CoachingConversation[]> {
    try {
      return await db.select()
        .from(coachingConversations)
        .where(eq(coachingConversations.userId, userId))
        .orderBy(desc(coachingConversations.lastMessageAt));
    } catch (error) {
      console.error('[Storage] getConversationsByUserId error:', error);
      return [];
    }
  }
  
  async updateConversation(id: number, data: Partial<InsertCoachingConversation>): Promise<CoachingConversation> {
    try {
      const [updatedConversation] = await db.update(coachingConversations)
        .set(data)
        .where(eq(coachingConversations.id, id))
        .returning();
      return updatedConversation;
    } catch (error) {
      console.error('[Storage] updateConversation error:', error);
      throw error;
    }
  }
  
  async getActiveConversation(userId: number): Promise<CoachingConversation | undefined> {
    try {
      // Get the most recent non-archived conversation for this user
      const [conversation] = await db.select()
        .from(coachingConversations)
        .where(
          and(
            eq(coachingConversations.userId, userId),
            eq(coachingConversations.isArchived, false)
          )
        )
        .orderBy(desc(coachingConversations.lastMessageAt))
        .limit(1);
      
      return conversation;
    } catch (error) {
      console.error('[Storage] getActiveConversation error:', error);
      return undefined;
    }
  }
  
  /**
   * Message operations
   */
   
  async createMessage(data: InsertCoachingMessage): Promise<CoachingMessage> {
    try {
      const [message] = await db.insert(coachingMessages).values(data).returning();
      
      // Update the lastMessageAt timestamp in the conversation
      await db.update(coachingConversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(coachingConversations.id, data.conversationId));
        
      return message;
    } catch (error) {
      console.error('[Storage] createMessage error:', error);
      throw error;
    }
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<CoachingMessage[]> {
    try {
      return await db.select()
        .from(coachingMessages)
        .where(eq(coachingMessages.conversationId, conversationId))
        .orderBy(asc(coachingMessages.sentAt));
    } catch (error) {
      console.error('[Storage] getMessagesByConversationId error:', error);
      return [];
    }
  }
  
  async updateMessageFeedback(id: number, feedback: 'positive' | 'negative' | null): Promise<CoachingMessage> {
    try {
      const [updatedMessage] = await db.update(coachingMessages)
        .set({ feedback })
        .where(eq(coachingMessages.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error('[Storage] updateMessageFeedback error:', error);
      throw error;
    }
  }
  
  /**
   * PKL-278651-SAGE-0002-ADV - Advanced Dialogue Support
   * Get the most recent messages in a conversation
   */
  async getRecentMessages(conversationId: number, limit: number): Promise<CoachingMessage[]> {
    try {
      // Get the most recent messages in chronological order
      return await db
        .select()
        .from(coachingMessages)
        .where(eq(coachingMessages.conversationId, conversationId))
        .orderBy(desc(coachingMessages.sentAt))
        .limit(limit)
        .then(messages => messages.reverse()); // Reverse to get chronological order
    } catch (error) {
      console.error('[Storage] getRecentMessages error:', error);
      return [];
    }
  }
  
  /**
   * PKL-278651-SAGE-0004-COACH - SAGE Coaching Profiles
   * Get a user's coaching profile for personalized interactions
   */
  async getCoachingProfile(userId: number): Promise<CoachingProfile | undefined> {
    try {
      const [profile] = await db
        .select()
        .from(coachingProfiles)
        .where(eq(coachingProfiles.userId, userId));
      return profile;
    } catch (error) {
      console.error('[Storage] getCoachingProfile error:', error);
      return undefined;
    }
  }
  
  /**
   * Create a new coaching profile for a user
   */
  async createCoachingProfile(data: InsertCoachingProfile): Promise<CoachingProfile> {
    try {
      const [profile] = await db
        .insert(coachingProfiles)
        .values(data)
        .returning();
      return profile;
    } catch (error) {
      console.error('[Storage] createCoachingProfile error:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's coaching profile, creating it if it doesn't exist
   */
  async updateCoachingProfile(userId: number, data: Partial<InsertCoachingProfile>): Promise<CoachingProfile> {
    try {
      // First check if profile exists
      const existingProfile = await this.getCoachingProfile(userId);
      
      if (existingProfile) {
        // Update existing profile
        const [profile] = await db
          .update(coachingProfiles)
          .set(data)
          .where(eq(coachingProfiles.userId, userId))
          .returning();
        return profile;
      } else {
        // Create new profile if doesn't exist
        return this.createCoachingProfile({
          userId,
          ...data,
          lastInteractionAt: data.lastInteractionAt || new Date(),
          conversationCount: data.conversationCount || 0,
          trainingPlanCount: data.trainingPlanCount || 0,
          journalEntryCount: data.journalEntryCount || 0,
          interestsData: data.interestsData || {}
        });
      }
    } catch (error) {
      console.error('[Storage] updateCoachingProfile error:', error);
      throw error;
    }
  }
  
  /**
   * PKL-278651-SAGE-0003-JOURNAL - Journal Integration
   * Get the user's most recent journal entries
   */
  async getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]> {
    try {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[Storage] getRecentJournalEntries error:', error);
      return [];
    }
  }
  
  /**
   * Get journal entries for a user with optional limit
   * Extended method for SAGE Drill integration
   */
  async getJournalEntriesForUser(userId: number, limit: number = 5): Promise<JournalEntry[]> {
    try {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[Storage] getJournalEntriesForUser error:', error);
      return [];
    }
  }
  
  /**
   * Get the user's CourtIQ ratings for each dimension
   */
  async getCourtIQRatings(userId: number): Promise<Record<DimensionCode, number>> {
    try {
      // Check if user already has courtIQ ratings in their profile
      const profile = await this.getCoachingProfile(userId);
      if (profile?.metadata && typeof profile.metadata === 'object' && 'courtIQRatings' in profile.metadata) {
        return profile.metadata.courtIQRatings as Record<DimensionCode, number>;
      }
      
      // If not in profile, check for matches and calculate based on performance
      const matches = await this.getMatchesByUser(userId, 10);
      if (matches.length > 0) {
        // Calculate ratings based on match history
        // This is a simplified implementation - in a real system, this would be more sophisticated
        const winRate = matches.filter(m => 
          (m.playerAId === userId && m.scoreA > m.scoreB) || 
          (m.playerBId === userId && m.scoreB > m.scoreA)
        ).length / matches.length;
        
        const baseRating = Math.max(1, Math.min(5, Math.floor(winRate * 5) + 1));
        
        // Get user to check experience level
        const user = await this.getUser(userId);
        const xpFactor = user?.xp ? Math.min(1, user.xp / 1000) : 0;
        
        // Return ratings with slight variations
        return {
          TECH: Math.max(1, Math.min(5, baseRating + (Math.random() > 0.5 ? 1 : 0))),
          TACT: Math.max(1, Math.min(5, baseRating + (Math.random() > 0.7 ? 1 : 0))),
          PHYS: Math.max(1, Math.min(5, baseRating)),
          MENT: Math.max(1, Math.min(5, baseRating - (Math.random() > 0.6 ? 1 : 0) + (xpFactor > 0.5 ? 1 : 0))),
          CONS: Math.max(1, Math.min(5, baseRating + (xpFactor > 0.7 ? 1 : 0)))
        };
      }
      
      // Return default ratings if no matches or profile
      return { 
        TECH: 3, 
        TACT: 3, 
        PHYS: 3, 
        MENT: 3, 
        CONS: 3 
      };
    } catch (error) {
      console.error('[Storage] getCourtIQRatings error:', error);
      return { TECH: 3, TACT: 3, PHYS: 3, MENT: 3, CONS: 3 };
    }
  }
}

export const storage = new DatabaseStorage();
