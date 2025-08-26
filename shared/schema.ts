// Main schema file for Pickle+ global types and tables
import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Privacy-related tables are defined in ./schema/privacy.ts
import {
  userPrivacySettings,
  privacyProfiles,
  contactPreferences,
  insertUserPrivacySettingSchema,
  insertPrivacyProfileSchema,
  insertContactPreferenceSchema,
  type UserPrivacySetting,
  type InsertUserPrivacySetting,
  type PrivacyProfile,
  type InsertPrivacyProfile,
  type ContactPreference,
  type InsertContactPreference
} from "./schema/privacy";

// Community engagement tables are defined in ./schema/community-engagement.ts
import {
  communityActivities,
  communityEngagementMetrics,
  communityEngagementLevels,
  communityLeaderboards,
  insertCommunityActivitySchema,
  insertCommunityEngagementMetricsSchema as insertCommunityEngagementMetricSchema,
  insertCommunityEngagementLevelSchema,
  insertCommunityLeaderboardSchema,
  type CommunityActivity,
  type InsertCommunityActivity,
  type CommunityEngagementMetrics as CommunityEngagementMetric,
  type InsertCommunityEngagementMetrics as InsertCommunityEngagementMetric, 
  type CommunityEngagementLevel,
  type InsertCommunityEngagementLevel,
  type CommunityLeaderboard,
  type InsertCommunityLeaderboard,
  CommunityActivityType
} from "./schema/community-engagement";

// Import match statistics schema (PKL-278651-MATCH-0002-XR - Enhanced Match Recording System)
import './match-statistics-schema';

// Import event schema (PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System)
import { events, eventCheckIns, eventRegistrations, passportVerifications } from './schema/events';

// Import event templates schema (PKL-278651-COMM-0035-EVENT - Enhanced Event Display and Management)

// Import admin match management schema - Admin system for competitions and matches
import {
  competitions,
  adminMatches,
  playerMatchResults,
  pointAllocationRules,
  ageGroupMappings,
  competitionsRelations,
  adminMatchesRelations,
  playerMatchResultsRelations,
  ageGroupMappingsRelations,
  createCompetitionSchema,
  createMatchSchema,
  createPlayerResultSchema,
  allocatePointsSchema,
  calculateAgeGroup,
  POINT_ALLOCATION_RULES,
  type Competition,
  type InsertCompetition,
  type Match,
  type InsertMatch,
  type PlayerMatchResult,
  type InsertPlayerMatchResult,
  type MatchWithPlayers,
  type CompetitionWithMatches,
  type PointAllocationRule,
  type InsertPointAllocationRule,
  type AgeGroupMapping,
  type InsertAgeGroupMapping
} from './schema/admin-match-management';

// Import Bounce achievements schema (PKL-278651-BOUNCE-0004-GAME - Bounce Gamification)
import {
  bounceAchievements,
  userBounceAchievements,
  bounceAchievementsRelations,
  userBounceAchievementsRelations,
  insertBounceAchievementSchema,
  insertUserBounceAchievementSchema,
  type BounceAchievement,
  type InsertBounceAchievement,
  type UserBounceAchievement,
  type InsertUserBounceAchievement
} from './schema/bounce-achievements';

// Import XP system schema (PKL-278651-BOUNCE-0004-GAME - Bounce Gamification)
import {
  xpTransactions,
  xpServiceLevels,
  userXpLevels,
  xpTransactionsRelations,
  xpServiceLevelsRelations,
  userXpLevelsRelations,
  insertXpTransactionSchema,
  insertXpServiceLevelSchema,
  insertUserXpLevelSchema,
  type XpTransaction,
  type InsertXpTransaction,
  type XpServiceLevel,
  type InsertXpServiceLevel,
  type UserXpLevel,
  type InsertUserXpLevel,
  XP_SOURCE,
  XP_SOURCE_TYPE,
  XP_SERVICE_LEVEL
} from './schema/xp';
import { 
  eventTemplates,
  eventTemplatesRelations,
  insertEventTemplateSchema,
  type EventTemplate,
  type InsertEventTemplate
} from './schema/event-templates';

// Import media management schema (PKL-278651-COMM-0036-MEDIA - Community Media Management)
import {
  communityMedia,
  communityGalleries,
  galleryItems,
  communityMediaRelations,
  communityGalleriesRelations,
  galleryItemsRelations,
  insertMediaSchema,
  insertGallerySchema,
  insertGalleryItemSchema,
  MediaType,
  GalleryPrivacyLevel,
  type Media,
  type InsertMedia,
  type Gallery,
  type InsertGallery,
  type GalleryItem,
  type InsertGalleryItem,
  type MediaWithRelations,
  type GalleryWithRelations
} from './schema/media';

// Import student-coach connections schema
import {
  studentCoachConnections,
  insertStudentCoachConnectionSchema,
  createConnectionRequestSchema,
  processConnectionRequestSchema,
  type StudentCoachConnection,
  type InsertStudentCoachConnection,
  type CreateConnectionRequest,
  type ProcessConnectionRequest
} from './schema/student-coach-connections';

// XP system schema imports temporarily removed for deployment fix

// Charge card system schema (PKL-278651-CHARGE-CARD - Charge Card Payment System)
export const chargeCardPurchases = pgTable('charge_card_purchases', {
  id: serial('id').primaryKey(),
  purchaseType: varchar('purchase_type', { length: 20 }).notNull(), // 'individual' or 'group'
  organizerId: integer('organizer_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'processed', 'cancelled'
  paymentDetails: text('payment_details'), // offline payment info
  totalAmount: integer('total_amount'), // admin-entered total amount in cents
  isGroupPurchase: boolean('is_group_purchase').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
  processedBy: integer('processed_by').references(() => users.id),
});

export const chargeCardAllocations = pgTable('charge_card_allocations', {
  id: serial('id').primaryKey(),
  purchaseId: integer('purchase_id').references(() => chargeCardPurchases.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  allocatedAmount: integer('allocated_amount').notNull(), // admin-allocated amount in cents
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chargeCardBalances = pgTable('charge_card_balances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  currentBalance: integer('current_balance').notNull().default(0), // in cents
  totalCredits: integer('total_credits').notNull().default(0), // lifetime credits in cents
  totalSpent: integer('total_spent').notNull().default(0), // lifetime spent in cents
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const chargeCardTransactions = pgTable('charge_card_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'credit' or 'debit'
  amount: integer('amount').notNull(), // in cents
  description: text('description'),
  referenceId: integer('reference_id'), // purchase_id for credits, lesson_id for debits
  referenceType: varchar('reference_type', { length: 50 }), // 'charge_card_purchase', 'lesson_payment', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Add feature flags for access control
export const userFeatureFlags = pgTable('user_feature_flags', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  featureName: varchar('feature_name', { length: 100 }).notNull(), // 'charge_cards'
  isEnabled: boolean('is_enabled').notNull().default(false),
  enabledBy: integer('enabled_by').references(() => users.id),
  enabledAt: timestamp('enabled_at').defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  usedAt: timestamp('used_at'),
});

// Relations for charge card system
export const chargeCardPurchasesRelations = relations(chargeCardPurchases, ({ one, many }) => ({
  organizer: one(users, {
    fields: [chargeCardPurchases.organizerId],
    references: [users.id],
  }),
  processor: one(users, {
    fields: [chargeCardPurchases.processedBy],
    references: [users.id],
  }),
  allocations: many(chargeCardAllocations),
}));

export const chargeCardAllocationsRelations = relations(chargeCardAllocations, ({ one }) => ({
  purchase: one(chargeCardPurchases, {
    fields: [chargeCardAllocations.purchaseId],
    references: [chargeCardPurchases.id],
  }),
  user: one(users, {
    fields: [chargeCardAllocations.userId],
    references: [users.id],
  }),
}));

export const chargeCardBalancesRelations = relations(chargeCardBalances, ({ one }) => ({
  user: one(users, {
    fields: [chargeCardBalances.userId],
    references: [users.id],
  }),
}));

export const chargeCardTransactionsRelations = relations(chargeCardTransactions, ({ one }) => ({
  user: one(users, {
    fields: [chargeCardTransactions.userId],
    references: [users.id],
  }),
}));

// Zod schemas for charge card system
export const insertChargeCardPurchaseSchema = createInsertSchema(chargeCardPurchases);
export const insertChargeCardAllocationSchema = createInsertSchema(chargeCardAllocations);
export const insertChargeCardBalanceSchema = createInsertSchema(chargeCardBalances);
export const insertChargeCardTransactionSchema = createInsertSchema(chargeCardTransactions);
export const insertUserFeatureFlagSchema = createInsertSchema(userFeatureFlags);
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);

// Types for charge card system
export type ChargeCardPurchase = typeof chargeCardPurchases.$inferSelect;
export type InsertChargeCardPurchase = z.infer<typeof insertChargeCardPurchaseSchema>;
export type ChargeCardAllocation = typeof chargeCardAllocations.$inferSelect;
export type InsertChargeCardAllocation = z.infer<typeof insertChargeCardAllocationSchema>;
export type ChargeCardBalance = typeof chargeCardBalances.$inferSelect;
export type InsertChargeCardBalance = z.infer<typeof insertChargeCardBalanceSchema>;
export type ChargeCardTransaction = typeof chargeCardTransactions.$inferSelect;
export type InsertChargeCardTransaction = z.infer<typeof insertChargeCardTransactionSchema>;
export type UserFeatureFlag = typeof userFeatureFlags.$inferSelect;
export type InsertUserFeatureFlag = z.infer<typeof insertUserFeatureFlagSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Import API Gateway schema (PKL-278651-API-0001-GATEWAY - API Gateway & Developer Portal)
import {
  apiDeveloperAccounts,
  apiApplications,
  apiKeys,
  apiUsageLogs,
  apiRateLimits,
  apiDocumentation,
  apiWebhooks,
  apiWebhookDeliveryLogs
} from './schema/api-gateway';

// Import user roles schema (PKL-278651-AUTH-0016-PROLES - Persistent Role Management)
import {
  roles,
  userRoles,
  permissions,
  rolePermissions,
  roleAuditLogs,
  rolesRelations,
  userRolesRelations,
  permissionsRelations,
  rolePermissionsRelations,
  roleAuditLogsRelations,
  insertRoleSchema,
  insertUserRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  insertRoleAuditLogSchema,
  type Role,
  type InsertRole,
  type UserRole as DbUserRole,
  type InsertUserRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type RoleAuditLog,
  type InsertRoleAuditLog
} from './schema/user-roles';

// Import Referral system schema (PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker)
import {
  referrals,
  referralAchievements,
  pickleballTips,
  // referralsRelations,
  // referralAchievementsRelations,
  insertReferralSchema,
  insertReferralAchievementSchema,
  insertPickleballTipSchema,
  type Referral,
  type InsertReferral,
  type ReferralAchievement,
  type InsertReferralAchievement,
  type PickleballTip,
  type InsertPickleballTip
} from './schema/referrals';

// Import Coach Management system schema (PKL-278651-COACH-001 - Comprehensive Coach Application and Management System)
import {
  coachApplications,
  coachCertifications,
  coachProfiles,
  coachPayments,
  coachFacilityAssignments,
  coachReviews,
  coachApplicationsRelations,
  coachCertificationsRelations,
  coachProfilesRelations,
  coachReviewsRelations,
  insertCoachApplicationSchema,
  insertCoachCertificationSchema,
  insertCoachProfileSchema,
  insertCoachPaymentSchema,
  insertCoachReviewSchema,
  CoachApplicationStatus,
  CoachType,
  VerificationLevel,
  type CoachApplication,
  type InsertCoachApplication,
  type CoachCertification,
  type InsertCoachCertification,
  type CoachProfile,
  type InsertCoachProfile,
  type CoachPayment,
  type InsertCoachPayment,
  type CoachReview,
  type InsertCoachReview,
  type CoachApplicationStatusType,
  type CoachTypeType,
  type VerificationLevelType
} from './schema/coach-management';

// Import Coach Marketplace Discovery system schema (UDF: Coach Marketplace Discovery)
import {
  coachMarketplaceProfiles,
  coachSearchHistory,
  coachMarketplaceReviews,
  coachDiscoveryAnalytics,
  coachFavoriteLists,
  coachMarketplaceProfilesRelations,
  coachSearchHistoryRelations,
  coachMarketplaceReviewsRelations,
  coachDiscoveryAnalyticsRelations,
  coachFavoriteListsRelations,
  insertCoachMarketplaceProfileSchema,
  insertCoachSearchHistorySchema,
  insertCoachMarketplaceReviewSchema,
  insertCoachDiscoveryAnalyticsSchema,
  insertCoachFavoriteListSchema,
  coachSearchSchema,
  type CoachMarketplaceProfile,
  type InsertCoachMarketplaceProfile,
  type CoachSearchHistory,
  type InsertCoachSearchHistory,
  type CoachMarketplaceReview,
  type InsertCoachMarketplaceReview,
  type CoachDiscoveryAnalytics,
  type InsertCoachDiscoveryAnalytics,
  type CoachFavoriteList,
  type InsertCoachFavoriteList,
  type CoachSearchParams,
  type CoachWithMarketplaceData
} from './schema/coach-marketplace';

// Commented out duplicate import to fix conflicts
// Using the earlier import from admin-match-management instead

// Import Curriculum Management system schema (Sprint 1: Curriculum Management & Lesson Planning Foundation)
import {
  drillLibrary,
  curriculumTemplates,
  lessonPlans,
  sessionGoals,
  drillCategories,
  drillLibraryRelations,
  curriculumTemplatesRelations,
  lessonPlansRelations,
  sessionGoalsRelations,
  insertDrillLibrarySchema,
  insertCurriculumTemplateSchema,
  insertLessonPlanSchema,
  insertSessionGoalSchema,
  type DrillLibrary,
  type InsertDrillLibrary,
  type CurriculumTemplate,
  type InsertCurriculumTemplate,
  type LessonPlan,
  type InsertLessonPlan,
  type SessionGoal,
  type InsertSessionGoal,
  type DrillCategory,
  type DrillWithCategory,
  type LessonPlanWithTemplate
} from './schema/curriculum-management';

// Import Bounce testing system schema (PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System)
import {
  bounceTestRuns,
  bounceFindings,
  bounceEvidence,
  bounceSchedules,
  bounceInteractions,
  bounceTestRunsRelations,
  bounceFindingsRelations,
  bounceEvidenceRelations,
  bounceInteractionsRelations,
  insertBounceTestRunSchema,
  insertBounceFindingSchema,
  insertBounceEvidenceSchema,
  insertBounceScheduleSchema,
  insertBounceInteractionSchema,
  BounceTestRunStatus,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceEvidenceType,
  BounceInteractionType,
  type BounceTestRun,
  type InsertBounceTestRun,
  type BounceFinding,
  type InsertBounceFinding,
  type BounceEvidence,
  type InsertBounceEvidence,
  type BounceSchedule,
  type InsertBounceSchedule,
  type BounceInteraction,
  type InsertBounceInteraction
} from './schema/bounce';

// Bounce gamification schema already imported above

// Import CourtIQ™ Rating System schema (PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System)
import {
  courtiqUserRatings,
  courtiqRatingImpacts,
  matchAssessments,
  courtiqCalculationRules,
  courtiqPlayerAttributes,
  incompleteAssessments,
  courtiqUserRatingsRelations,
  courtiqRatingImpactsRelations,
  matchAssessmentsRelations,
  courtiqPlayerAttributesRelations,
  incompleteAssessmentsRelations,
  insertCourtiqUserRatingSchema,
  insertCourtiqRatingImpactSchema,
  insertMatchAssessmentSchema,
  insertCourtiqCalculationRuleSchema,
  insertCourtiqPlayerAttributeSchema,
  insertIncompleteAssessmentSchema,
  type CourtiqUserRating,
  type InsertCourtiqUserRating,
  type CourtiqRatingImpact,
  type InsertCourtiqRatingImpact,
  type MatchAssessment,
  type InsertMatchAssessment,
  type CourtiqCalculationRule,
  type InsertCourtiqCalculationRule,
  type CourtiqPlayerAttribute,
  type InsertCourtiqPlayerAttribute,
  type IncompleteAssessment,
  type InsertIncompleteAssessment
} from './schema/courtiq';

// Import Community schema (PKL-278651-COMM-0006-HUB - Community Hub Implementation)
import {
  communities,
  communityMembers,
  communityPosts,
  communityEvents,
  communityEventAttendees,
  communityPostComments,
  communityPostLikes,
  communityCommentLikes,
  communityInvitations,
  communityJoinRequests,
  communitiesRelations,
  communityMembersRelations,
  communityPostsRelations,
  communityEventsRelations,
  insertCommunitySchema,
  insertCommunityMemberSchema,
  insertCommunityPostSchema,
  insertCommunityEventSchema,
  insertCommunityEventAttendeeSchema,
  insertCommunityPostCommentSchema,
  type Community,
  type InsertCommunity,
  type CommunityMember,
  type InsertCommunityMember,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityEvent,
  type InsertCommunityEvent,
  type CommunityEventAttendee,
  type InsertCommunityEventAttendee,
  type CommunityPostComment,
  type InsertCommunityPostComment
} from './schema/community';

// Import tournament bracket schema (PKL-278651-TOURN-0001-BRCKT - Tournament Bracket System)
import {
  tournamentTeams,
  tournamentBrackets,
  tournamentRounds,
  tournamentBracketMatches,
  tournamentTeamsRelations,
  tournamentBracketsRelations,
  tournamentRoundsRelations,
  tournamentBracketMatchesRelations,
  insertTournamentTeamSchema,
  insertTournamentBracketSchema,
  insertTournamentRoundSchema,
  insertTournamentBracketMatchSchema,
  type TournamentTeam,
  type InsertTournamentTeam,
  type TournamentBracket,
  type InsertTournamentBracket,
  type TournamentRound,
  type InsertTournamentRound,
  type TournamentBracketMatch,
  type InsertTournamentBracketMatch
} from './schema/tournament-brackets';

// Import tournament relations for parent-child relationships (PKL-278651-TOURN-0015-MULTI)
// Note: Tournament relations are defined locally in this file

// Import enhanced tournament system schema (PKL-278651-TOURN-0015-MULTI - Multi-Event Tournament System)
import * as enhancedTournamentSystem from './schema/enhanced-tournament-system';

// Re-export the enhanced tournament system
export const parentTournaments = enhancedTournamentSystem.parentTournaments;
export const tournamentRelationships = enhancedTournamentSystem.tournamentRelationships;
export const teams = enhancedTournamentSystem.teams;
export const teamMembers = enhancedTournamentSystem.teamMembers;
export const teamTournamentRegistrations = enhancedTournamentSystem.teamTournamentRegistrations;
export const tournamentDirectors = enhancedTournamentSystem.tournamentDirectors;
export const tournamentCourts = enhancedTournamentSystem.tournamentCourts;
export const tournamentStatusHistory = enhancedTournamentSystem.tournamentStatusHistory;
export const tournamentTemplates = enhancedTournamentSystem.tournamentTemplates;
export const tournamentAuditLogs = enhancedTournamentSystem.tournamentAuditLogs;

// Re-export insert schemas
export const insertParentTournamentSchema = enhancedTournamentSystem.insertParentTournamentSchema;
export const insertTournamentRelationshipSchema = enhancedTournamentSystem.insertTournamentRelationshipSchema;
export const insertTeamSchema = enhancedTournamentSystem.insertTeamSchema;
export const insertTeamMemberSchema = enhancedTournamentSystem.insertTeamMemberSchema;
export const insertTeamTournamentRegistrationSchema = enhancedTournamentSystem.insertTeamTournamentRegistrationSchema;
export const insertTournamentDirectorSchema = enhancedTournamentSystem.insertTournamentDirectorSchema;
export const insertTournamentCourtSchema = enhancedTournamentSystem.insertTournamentCourtSchema;
export const insertTournamentStatusHistorySchema = enhancedTournamentSystem.insertTournamentStatusHistorySchema;
export const insertTournamentTemplateSchema = enhancedTournamentSystem.insertTournamentTemplateSchema;
export const insertTournamentAuditLogSchema = enhancedTournamentSystem.insertTournamentAuditLogSchema;

// Re-export types
export type ParentTournament = enhancedTournamentSystem.ParentTournament;
export type InsertParentTournament = enhancedTournamentSystem.InsertParentTournament;
export type TournamentRelationship = enhancedTournamentSystem.TournamentRelationship;
export type InsertTournamentRelationship = enhancedTournamentSystem.InsertTournamentRelationship;
export type Team = enhancedTournamentSystem.Team;
export type InsertTeam = enhancedTournamentSystem.InsertTeam;
export type TeamMember = enhancedTournamentSystem.TeamMember;
export type InsertTeamMember = enhancedTournamentSystem.InsertTeamMember;
export type TeamTournamentRegistration = enhancedTournamentSystem.TeamTournamentRegistration;
export type InsertTeamTournamentRegistration = enhancedTournamentSystem.InsertTeamTournamentRegistration;
export type TournamentDirector = enhancedTournamentSystem.TournamentDirector;
export type InsertTournamentDirector = enhancedTournamentSystem.InsertTournamentDirector;
export type TournamentCourt = enhancedTournamentSystem.TournamentCourt;
export type InsertTournamentCourt = enhancedTournamentSystem.InsertTournamentCourt;
export type TournamentStatusHistory = enhancedTournamentSystem.TournamentStatusHistory;
export type InsertTournamentStatusHistory = enhancedTournamentSystem.InsertTournamentStatusHistory;
export type TournamentTemplate = enhancedTournamentSystem.TournamentTemplate;
export type InsertTournamentTemplate = enhancedTournamentSystem.InsertTournamentTemplate;
export type TournamentAuditLog = enhancedTournamentSystem.TournamentAuditLog;
export type InsertTournamentAuditLog = enhancedTournamentSystem.InsertTournamentAuditLog;

// Import other tournament schemas
// The enhanced tournament system is now imported and exported above

// Import comprehensive tournament system schema (PKL-278651-TOURN-SYSTEM - Tournament Management System)
import {
  tournamentTiers,
  tournamentRoundPoints,
  tournamentCategories,
  tournamentAgeDivisions,
  tournamentTeamRules,
  roundRobinGroups,
  roundRobinMatches,
  tournamentPointsTransactions,
  tournamentWaitlist,
  tournamentSeries,
  tournamentSeriesEvents,
  tournamentTiersRelations,
  tournamentTeamRulesRelations,
  roundRobinGroupsRelations,
  roundRobinMatchesRelations,
  tournamentPointsTransactionsRelations,
  tournamentWaitlistRelations,
  tournamentSeriesRelations,
  tournamentSeriesEventsRelations,
  insertTournamentTierSchema,
  insertTournamentRoundPointsSchema,
  insertTournamentCategorySchema,
  insertTournamentAgeDivisionSchema,
  insertTournamentTeamRulesSchema,
  insertRoundRobinGroupSchema,
  insertRoundRobinMatchSchema,
  insertTournamentPointsTransactionSchema,
  insertTournamentWaitlistSchema,
  insertTournamentSeriesSchema,
  insertTournamentSeriesEventSchema,
  type TournamentTier,
  type InsertTournamentTier,
  type TournamentRoundPoint,
  type InsertTournamentRoundPoint,
  type TournamentCategory,
  type InsertTournamentCategory,
  type TournamentAgeDivision,
  type InsertTournamentAgeDivision,
  type TournamentTeamRule,
  type InsertTournamentTeamRule,
  type RoundRobinGroup,
  type InsertRoundRobinGroup,
  type RoundRobinMatch,
  type InsertRoundRobinMatch,
  type TournamentPointsTransaction,
  type InsertTournamentPointsTransaction,
  type TournamentWaitlistEntry,
  type InsertTournamentWaitlistEntry,
  type TournamentSeries,
  type InsertTournamentSeries,
  type TournamentSeriesEvent,
  type InsertTournamentSeriesEvent
} from './schema/tournament-system';

// Import goal-setting system schema (PKL-278651-COACH-GOALS-001 - Goal Setting Foundation)
import {
  playerGoals,
  goalMilestones,
  goalJournalEntries,
  goalProgressSnapshots,
  insertPlayerGoalSchema,
  insertGoalMilestoneSchema,
  insertGoalJournalEntrySchema,
  insertGoalProgressSnapshotSchema,
  GoalCategories,
  GoalStatus,
  GoalPriority,
  type PlayerGoal,
  type InsertPlayerGoal,
  type GoalMilestone,
  type InsertGoalMilestone,
  type GoalJournalEntry,
  type InsertGoalJournalEntry,
  type GoalProgressSnapshot,
  type InsertGoalProgressSnapshot,
  type GoalCategory,
  type GoalStatusType,
  type GoalPriorityType
} from './schema/goals';

// Coach-Student Assignment System will be defined below with the users table

// Import coach-match integration schema (PKL-278651-COACH-MATCH-INTEGRATION - Phase 1)
import {
  coachingSessionMatches,
  coachMatchInput,
  matchPcpAssessments,
  pointsAllocationExplanation,
  coachStudentProgress,
  coachingSessionMatchesRelations,
  coachMatchInputRelations,
  matchPcpAssessmentsRelations,
  pointsAllocationExplanationRelations,
  coachStudentProgressRelations,
  insertCoachingSessionMatchSchema,
  insertCoachMatchInputSchema,
  insertMatchPcpAssessmentSchema,
  insertPointsAllocationExplanationSchema,
  insertCoachStudentProgressSchema,
  MatchContext,
  CoachInputType,
  SkillCategory,
  type CoachingSessionMatch,
  type InsertCoachingSessionMatch,
  type CoachMatchInput,
  type InsertCoachMatchInput,
  type MatchPcpAssessment,
  type InsertMatchPcpAssessment,
  type PointsAllocationExplanation,
  type InsertPointsAllocationExplanation,
  type CoachStudentProgress,
  type InsertCoachStudentProgress
} from './schema/coach-match-integration';

// Import moderation schema (PKL-278651-COMM-0029-MOD - Enhanced Community Moderation Tools)
import {
  contentReports,
  moderationActions,
  communityRoles,
  contentApprovalQueue,
  contentFilterSettings,
  insertContentReportSchema,
  insertModerationActionSchema,
  insertCommunityRoleSchema,
  insertContentApprovalSchema,
  insertContentFilterSettingsSchema,
  type ContentReport,
  type InsertContentReport,
  type ModerationAction,
  type InsertModerationAction,
  type CommunityRole,
  type InsertCommunityRole,
  type ContentApproval,
  type InsertContentApproval,
  type ContentFilterSettings,
  type InsertContentFilterSettings
} from './schema/moderation';

// Notifications schema removed - causing startup issues

// Import S.A.G.E. coaching schema (PKL-278651-COACH-0001-CORE - Skills Assessment & Growth Engine)
import {
  coachingSessions as sageCoachingSessions,
  coachingInsights,
  trainingPlans,
  trainingExercises,
  coachingContentLibrary,
  userProgressLogs,
  coachingSessionsRelations as sageCoachingSessionsRelations,
  coachingInsightsRelations,
  trainingPlansRelations,
  trainingExercisesRelations,
  userProgressLogsRelations,
  insertCoachingSessionSchema as insertSageCoachingSessionSchema,
  insertCoachingInsightSchema,
  insertTrainingPlanSchema,
  insertTrainingExerciseSchema,
  insertCoachingContentLibrarySchema,
  insertUserProgressLogSchema,
  type CoachingSession as SageCoachingSession,
  type InsertCoachingSession as InsertSageCoachingSession,
  type CoachingInsight,
  type InsertCoachingInsight,
  type TrainingPlan,
  type InsertTrainingPlan,
  type TrainingExercise,
  type InsertTrainingExercise,
  type CoachingContentLibrary,
  type InsertCoachingContentLibrary,
  type UserProgressLog,
  type InsertUserProgressLog,
  DimensionCodes,
  // InsightTypes,
  // SessionTypes,
  type DimensionCode,
  // type InsightType
} from './schema/sage';

// Import Training Center Management schema (PKL-278651-TRAINING-CENTER-001)
import {
  trainingCenters,
  coachCertifications as trainingCoachCertifications,
  coachingSessions as trainingCoachingSessions,
  challenges,
  challengeCompletions,
  sessionNotes,
  digitalBadges,
  playerBadges,
  ratingProgressions,
  trainingCenterRelations,
  coachCertificationRelations as trainingCoachCertificationRelations,
  coachingSessionRelations as trainingCoachingSessionRelations,
  challengeRelations,
  challengeCompletionRelations,
  sessionNotesRelations,
  digitalBadgeRelations,
  playerBadgeRelations,
  ratingProgressionRelations,
  insertTrainingCenterSchema,
  insertCoachCertificationSchema as insertTrainingCoachCertificationSchema,
  insertCoachingSessionSchema as insertTrainingCoachingSessionSchema,
  insertChallengeSchema,
  insertChallengeCompletionSchema,
  insertSessionNotesSchema,
  insertDigitalBadgeSchema,
  insertPlayerBadgeSchema,
  insertRatingProgressionSchema,
  SessionType,
  ChallengeCategory,
  SkillLevel,
  SessionStatus,
  type TrainingCenter,
  type InsertTrainingCenter,
  type CoachCertification as TrainingCoachCertification,
  type InsertCoachCertification as InsertTrainingCoachCertification,
  type CoachingSession as TrainingCoachingSession,
  type InsertCoachingSession as InsertTrainingCoachingSession,
  type Challenge,
  type InsertChallenge,
  type ChallengeCompletion,
  type InsertChallengeCompletion,
  type SessionNotes,
  type InsertSessionNotes,
  type DigitalBadge,
  type InsertDigitalBadge,
  type PlayerBadge,
  type InsertPlayerBadge,
  type RatingProgression,
  type InsertRatingProgression
} from './schema/training-center';

// Import PCP Sequential Enforcement schema (Phase 4 - Critical Gap Implementation)
import {
  pcpCoachCertifications,
  pcpLevelRequirements,
  pcpSequentialValidationLog,
  pcpBusinessMetrics,
  pcpCoachCertificationsRelations,
  pcpSequentialValidationLogRelations,
  pcpBusinessMetricsRelations,
  insertPcpCoachCertificationSchema,
  insertPcpLevelRequirementSchema,
  insertPcpSequentialValidationLogSchema,
  insertPcpBusinessMetricsSchema,
  pcpLevelApplicationSchema,
  PCP_LEVELS,
  PCP_LEVEL_NAMES,
  COMMISSION_TIERS,
  type PcpCoachCertification,
  type InsertPcpCoachCertification,
  type PcpLevelRequirement,
  type InsertPcpLevelRequirement,
  type PcpSequentialValidationLog,
  type InsertPcpSequentialValidationLog,
  type PcpBusinessMetrics,
  type InsertPcpBusinessMetrics,
  type PcpLevelApplication,
  type PcpLevel,
  type CommissionTier,
  type ValidationResult,
  type PcpProgressionAnalytics
} from './schema/pcp-sequential-enforcement';

// Re-export PCP Sequential Enforcement
export {
  pcpCoachCertifications,
  pcpLevelRequirements,
  pcpSequentialValidationLog,
  pcpBusinessMetrics,
  pcpCoachCertificationsRelations,
  pcpSequentialValidationLogRelations,
  pcpBusinessMetricsRelations,
  insertPcpCoachCertificationSchema,
  insertPcpLevelRequirementSchema,
  insertPcpSequentialValidationLogSchema,
  insertPcpBusinessMetricsSchema,
  pcpLevelApplicationSchema,
  PCP_LEVELS,
  PCP_LEVEL_NAMES,
  COMMISSION_TIERS,
  type PcpCoachCertification,
  type InsertPcpCoachCertification,
  type PcpLevelRequirement,
  type InsertPcpLevelRequirement,
  type PcpSequentialValidationLog,
  type InsertPcpSequentialValidationLog,
  type PcpBusinessMetrics,
  type InsertPcpBusinessMetrics,
  type PcpLevelApplication,
  type PcpLevel,
  type CommissionTier,
  type ValidationResult,
  type PcpProgressionAnalytics
};

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: text("password").notNull(),
  displayName: varchar("display_name", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }), // 'male' or 'female'
  passportCode: varchar("passport_code", { length: 15 }).unique(), // alphanumeric passport code (8 chars for new users, legacy 7 chars supported)
  pointsLevel: integer("points_level").default(1),
  picklePoints: integer("pickle_points").default(0),
  avatarInitials: varchar("avatar_initials", { length: 10 }),
  lastMatchDate: timestamp("last_match_date"),
  totalMatches: integer("total_matches").default(0),
  matchesWon: integer("matches_won").default(0),
  totalTournaments: integer("total_tournaments").default(0),
  isFoundingMember: boolean("is_founding_member").default(false),
  isAdmin: boolean("is_admin").default(false),
  coachLevel: integer("coach_level").default(0), // 0=not coach, 1-5=coach levels L1-L5
  pointsMultiplier: integer("points_multiplier").default(100),
  profileCompletionPct: integer("profile_completion_pct").default(0),
  profileMilestonesAwarded: integer("profile_milestones_awarded").array().default([]),
  rankingPoints: integer("ranking_points").default(0), // DEPRECATED - for backward compatibility only
  singlesRankingPoints: integer("singles_ranking_points").default(0), // Singles-specific ranking points by category
  mensDoublesRankingPoints: integer("mens_doubles_ranking_points").default(0), // Men's doubles ranking points
  womensDoublesRankingPoints: integer("womens_doubles_ranking_points").default(0), // Women's doubles ranking points
  mixedDoublesMenRankingPoints: integer("mixed_doubles_men_ranking_points").default(0), // Mixed doubles men's ranking points
  mixedDoublesWomenRankingPoints: integer("mixed_doubles_women_ranking_points").default(0), // Mixed doubles women's ranking points
  isTestData: boolean("is_test_data").default(false), // PKL-278651-SEC-0002-TESTVIS - Test data visibility control
  // Note: rankingTier is calculated at runtime based on ranking points
  // rankingTier: varchar("ranking_tier", { length: 20 }).default("bronze"),
  // Note: consecutiveWins doesn't exist in the database
  // consecutiveWins: integer("consecutive_wins").default(0),
  
  // Basic profile fields
  playingSince: varchar("playing_since", { length: 50 }),
  skillLevel: varchar("skill_level", { length: 50 }),
  
  // Enhanced profile fields - Physical attributes
  height: integer("height"), // in cm
  reach: integer("reach"), // in cm
  
  // Equipment preferences
  preferredPosition: varchar("preferred_position", { length: 50 }),
  paddleBrand: varchar("paddle_brand", { length: 50 }),
  paddleModel: varchar("paddle_model", { length: 50 }),
  backupPaddleBrand: varchar("backup_paddle_brand", { length: 50 }),
  backupPaddleModel: varchar("backup_paddle_model", { length: 50 }),
  apparelBrand: varchar("apparel_brand", { length: 50 }),
  shoesBrand: varchar("shoes_brand", { length: 50 }),
  otherEquipment: text("other_equipment"),
  
  // Playing style and preferences
  playingStyle: varchar("playing_style", { length: 50 }),
  shotStrengths: varchar("shot_strengths", { length: 100 }),
  preferredFormat: varchar("preferred_format", { length: 50 }),
  dominantHand: varchar("dominant_hand", { length: 20 }),
  regularSchedule: varchar("regular_schedule", { length: 255 }),
  
  // Performance self-assessment (1-10 scale)
  forehandStrength: integer("forehand_strength"),
  backhandStrength: integer("backhand_strength"),
  servePower: integer("serve_power"),
  dinkAccuracy: integer("dink_accuracy"),
  thirdShotConsistency: integer("third_shot_consistency"),
  courtCoverage: integer("court_coverage"),
  
  // Match preferences
  preferredSurface: varchar("preferred_surface", { length: 50 }),
  indoorOutdoorPreference: varchar("indoor_outdoor_preference", { length: 20 }),
  competitiveIntensity: integer("competitive_intensity"),
  lookingForPartners: boolean("looking_for_partners").default(false),
  mentorshipInterest: boolean("mentorship_interest").default(false),
  playerGoals: text("player_goals"),
  preferredMatchDuration: varchar("preferred_match_duration", { length: 50 }),
  fitnessLevel: varchar("fitness_level", { length: 50 }),
  mobilityLimitations: text("mobility_limitations"),
  
  privateMessagePreference: varchar("private_message_preference", { length: 50 }).default("all"),
  
  // Location data
  homeCourtLocations: text("home_court_locations"), // Comma-separated or JSON string
  travelRadiusKm: integer("travel_radius_km"),
  
  // External Rating Systems - PKL-278651-EXTR-0001
  duprRating: varchar("dupr_rating", { length: 10 }),
  duprProfileUrl: varchar("dupr_profile_url", { length: 255 }),
  utprRating: varchar("utpr_rating", { length: 10 }),
  utprProfileUrl: varchar("utpr_profile_url", { length: 255 }),
  wprRating: varchar("wpr_rating", { length: 10 }),
  wprProfileUrl: varchar("wpr_profile_url", { length: 255 }),
  ifpRating: varchar("ifp_rating", { length: 10 }),
  ifpProfileUrl: varchar("ifp_profile_url", { length: 255 }),
  iptpaRating: varchar("iptpa_rating", { length: 10 }),
  iptpaProfileUrl: varchar("iptpa_profile_url", { length: 255 }),
  externalRatingsVerified: boolean("external_ratings_verified").default(false),
  lastExternalRatingUpdate: timestamp("last_external_rating_update"),
  
  // Additional fields for deployment compatibility
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  externalRatings: jsonb("external_ratings"),
  
  // Privacy settings - Default visibility profiles
  privacyProfile: varchar("privacy_profile", { length: 30 }).default("standard"),
  
  // Profile customization
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bannerPattern: varchar("banner_pattern", { length: 50 }),
  
  // System fields
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Coach-Student Assignment System - Simplified Coaching Implementation
export const coachStudentAssignments = pgTable("coach_student_assignments", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id), // Admin who made the assignment (nullable for student-initiated)
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Admin notes about the assignment
  
  // Student-initiated assignments
  initiatedByStudent: boolean("initiated_by_student").default(false),
  coachPassportCode: varchar("coach_passport_code", { length: 10 }), // For validation
  studentRequestDate: timestamp("student_request_date"),
  coachApprovedDate: timestamp("coach_approved_date"),
  status: varchar("status", { length: 20 }).default("active"), // "pending", "active", "inactive"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations for coach-student assignments
export const coachStudentAssignmentsRelations = relations(coachStudentAssignments, ({ one }) => ({
  coach: one(users, {
    fields: [coachStudentAssignments.coachId],
    references: [users.id],
    relationName: "coach_assignments"
  }),
  student: one(users, {
    fields: [coachStudentAssignments.studentId],
    references: [users.id],
    relationName: "student_assignments"
  }),
  assignedByUser: one(users, {
    fields: [coachStudentAssignments.assignedBy],
    references: [users.id],
    relationName: "assignment_admin"
  })
}));

// Standalone Youth Ranking System - PKL-278651-YOUTH-STANDALONE
// Each age category maintains completely separate point pools
export const userAgeGroupRankings = pgTable("user_age_group_rankings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ageCategory: varchar("age_category", { length: 10 }).notNull(), // 'U12', 'U14', 'U16', 'U18', 'Open', '35+', '50+', '60+', '70+'
  singlesPoints: integer("singles_points").default(0),
  mensDoublesPoints: integer("mens_doubles_points").default(0), // Men's doubles age group points
  womensDoublesPoints: integer("womens_doubles_points").default(0), // Women's doubles age group points
  mixedDoublesMenPoints: integer("mixed_doubles_men_points").default(0), // Mixed doubles men's age group points
  mixedDoublesWomenPoints: integer("mixed_doubles_women_points").default(0), // Mixed doubles women's age group points
  lastMatchDate: timestamp("last_match_date"),
  totalMatches: integer("total_matches").default(0),
  matchesWon: integer("matches_won").default(0),
  isActive: boolean("is_active").default(true),
  seasonYear: integer("season_year").default(2025), // For seasonal resets if needed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations for age group rankings
export const userAgeGroupRankingsRelations = relations(userAgeGroupRankings, ({ one }) => ({
  user: one(users, {
    fields: [userAgeGroupRankings.userId],
    references: [users.id],
  }),
}));

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  
  // Venue Details
  venueAddress: text("venue_address"),
  numberOfCourts: integer("number_of_courts"),
  courtSurface: varchar("court_surface", { length: 50 }).default("indoor"), // indoor, outdoor, hard, clay
  venueAmenities: text("venue_amenities").array(),
  parkingInfo: text("parking_info"),
  
  // Date & Time
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationStartDate: timestamp("registration_start_date"),
  registrationEndDate: timestamp("registration_end_date"),
  checkInTime: varchar("check_in_time", { length: 20 }),
  
  // Participants & Registration
  maxParticipants: integer("max_participants"),
  minParticipants: integer("min_participants"),
  currentParticipants: integer("current_participants").default(0),
  waitlistCapacity: integer("waitlist_capacity"),
  allowLateRegistration: boolean("allow_late_registration").default(false),
  lateRegistrationFee: integer("late_registration_fee"),
  
  // Tournament Structure
  format: varchar("format", { length: 50 }).notNull(),
  division: varchar("division", { length: 50 }).notNull(), // Age division (e.g., open, 35+, 50+, etc.)
  category: varchar("category", { length: 50 }).default("singles"), // Type of play (singles, doubles, mixed)
  seedingMethod: varchar("seeding_method", { length: 50 }).default("ranking"), // ranking, random, manual
  scoringFormat: varchar("scoring_format", { length: 50 }).default("best_of_3"), // best_of_3, race_to_11, etc.
  consolationBracket: boolean("consolation_bracket").default(false),
  
  // Eligibility & Requirements
  minRating: integer("min_rating"),
  maxRating: integer("max_rating"),
  ageRestrictions: text("age_restrictions"),
  skillLevelReq: varchar("skill_level_req", { length: 100 }),
  equipmentReq: text("equipment_req"),
  dressCode: text("dress_code"),
  
  // Financial
  entryFee: integer("entry_fee"),
  prizePool: integer("prize_pool"),
  prizeDistribution: text("prize_distribution"),
  paymentMethods: text("payment_methods").array(),
  refundPolicy: text("refund_policy"),
  refundDeadline: timestamp("refund_deadline"),
  
  // Rules & Policies
  withdrawalPolicy: text("withdrawal_policy"),
  withdrawalDeadline: timestamp("withdrawal_deadline"),
  codeOfConduct: text("code_of_conduct"),
  weatherPolicy: text("weather_policy"),
  
  // Tournament Management
  status: varchar("status", { length: 50 }).notNull().default("upcoming"),
  level: varchar("level", { length: 50 }).notNull().default("club"), // club, district, city, provincial, national, regional, international
  organizer: varchar("organizer", { length: 255 }),
  tournamentDirector: varchar("tournament_director", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  
  // Match Settings
  warmupTime: integer("warmup_time").default(5), // minutes
  breakTimeBetweenMatches: integer("break_time_between_matches").default(10), // minutes
  timeLimit: integer("time_limit"), // minutes per match if applicable
  
  // Event Details
  awards: text("awards"),
  ceremonytTime: varchar("ceremony_time", { length: 20 }),
  liveStreaming: boolean("live_streaming").default(false),
  featuredMatches: boolean("featured_matches").default(false),
  
  // Parent-child relationship for multi-event tournaments
  parentTournamentId: integer("parent_tournament_id"), // Will be linked in relations
  isParent: boolean("is_parent").default(false), // Indicates if this is a parent tournament
  isSubEvent: boolean("is_sub_event").default(false), // Indicates if this is a sub-event of a parent tournament
  
  // Team tournament specific fields (inherits all above fields for consistency)
  isTeamTournament: boolean("is_team_tournament").default(false), // Indicates if this is a team tournament
  teamSize: integer("team_size"), // Default team size
  minTeamSize: integer("min_team_size"), // Minimum players per team
  maxTeamSize: integer("max_team_size"), // Maximum players per team
  maxTeams: integer("max_teams"), // Maximum number of teams
  teamMatchFormat: jsonb("team_match_format"), // JSON config for match formats (singles, doubles, mixed)
  teamEligibilityRules: jsonb("team_eligibility_rules"), // JSON config for DUPR, ranking points, professional status rules
  teamLineupRules: jsonb("team_lineup_rules"), // JSON config for lineup submission and rotation rules
  
  isTestData: boolean("is_test_data").default(false), // PKL-278651-SEC-0002-TESTVIS - Test data visibility control
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament registrations table
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  registrationDate: timestamp("registration_date").defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("registered"),
  checkedIn: boolean("checked_in").default(false),
  checkInTime: timestamp("check_in_time"),
  seedNumber: integer("seed_number"),
  placement: integer("placement"),
  notes: text("notes"),
  
  // Team tournament specific fields (inherits all above fields for consistency)
  teamName: varchar("team_name", { length: 255 }), // Team name for team tournaments
  teamPlayers: jsonb("team_players"), // JSON array of team player details
  teamCaptain: varchar("team_captain", { length: 255 }), // Team captain name
  isTeamRegistration: boolean("is_team_registration").default(false), // Indicates if this is a team registration
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  badgeUrl: text("badge_url"),
  xpReward: integer("xp_reward").default(0),
  pointsReward: integer("points_reward").default(0),
  requirements: json("requirements"),
  isSecret: boolean("is_secret").default(false),
  difficulty: varchar("difficulty", { length: 50 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Re-export Bounce schema components
export {
  bounceTestRuns,
  bounceFindings,
  bounceEvidence,
  bounceSchedules,
  bounceInteractions,
  bounceTestRunsRelations,
  bounceFindingsRelations,
  bounceEvidenceRelations,
  bounceInteractionsRelations,
  insertBounceTestRunSchema,
  insertBounceFindingSchema,
  insertBounceEvidenceSchema,
  insertBounceScheduleSchema,
  insertBounceInteractionSchema,
  BounceTestRunStatus,
  BounceFindingSeverity, 
  BounceFindingStatus,
  BounceEvidenceType,
  BounceInteractionType,
  type BounceTestRun,
  type InsertBounceTestRun,
  type BounceFinding,
  type InsertBounceFinding,
  type BounceEvidence,
  type InsertBounceEvidence,
  type BounceSchedule,
  type InsertBounceSchedule,
  type BounceInteraction,
  type InsertBounceInteraction
};

// Re-export Bounce Gamification components
export {
  bounceAchievements,
  userBounceAchievements,
  bounceAchievementsRelations,
  userBounceAchievementsRelations,
  insertBounceAchievementSchema,
  insertUserBounceAchievementSchema,
  type BounceAchievement,
  type InsertBounceAchievement,
  type UserBounceAchievement,
  type InsertUserBounceAchievement
};

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  completedAt: timestamp("completed_at"),
  displayed: boolean("displayed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  metadata: json("metadata"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Redemption codes table
export const redemptionCodes = pgTable("redemption_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  xpBonus: integer("xp_bonus").default(0),
  pointsBonus: integer("points_bonus").default(0),
  multiplier: integer("multiplier").default(100), // 100 = 1.0x, 120 = 1.2x, etc.
  expirationDate: timestamp("expiration_date"),
  maxUses: integer("max_uses").default(1),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User redemptions table
export const userRedemptions = pgTable("user_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  redemptionCodeId: integer("redemption_code_id").notNull().references(() => redemptionCodes.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  xpGranted: integer("xp_granted").default(0),
  pointsGranted: integer("points_granted").default(0),
  multiplierGranted: integer("multiplier_granted").default(100),
  multiplierExpiration: timestamp("multiplier_expiration"),
  createdAt: timestamp("created_at").defaultNow()
});

// XP transactions table is defined in ./schema/xp.ts

// Profile completion tracking table - Tracks which profile fields have been completed
export const profileCompletionTracking = pgTable("profile_completion_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  xpAwarded: integer("xp_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Ranking transactions table - Tracks all ranking point awards
export const rankingTransactions = pgTable("ranking_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  matchId: integer("match_id").references(() => matches.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// Ranking tier history table - Tracks tier changes over time
export const rankingTierHistory = pgTable("ranking_tier_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  oldTier: varchar("old_tier", { length: 20 }).notNull(),
  newTier: varchar("new_tier", { length: 20 }).notNull(),
  rankingPoints: integer("ranking_points").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchDate: timestamp("match_date"),
  // Player information
  playerOneId: integer("player_one_id").notNull().references(() => users.id),
  playerTwoId: integer("player_two_id").notNull().references(() => users.id),
  playerOnePartnerId: integer("player_one_partner_id").references(() => users.id),
  playerTwoPartnerId: integer("player_two_partner_id").references(() => users.id),
  winnerId: integer("winner_id").notNull().references(() => users.id),
  
  // Score information
  scorePlayerOne: varchar("score_player_one", { length: 50 }).notNull(),
  scorePlayerTwo: varchar("score_player_two", { length: 50 }).notNull(),
  gameScores: json("game_scores"), // Array of game scores for multi-game matches
  
  // Match metadata
  formatType: varchar("format_type", { length: 50 }).notNull().default("singles"), // singles, doubles
  scoringSystem: varchar("scoring_system", { length: 50 }).notNull().default("traditional"), // traditional, rally
  pointsToWin: integer("points_to_win").notNull().default(11), // 11, 15, 21
  division: varchar("division", { length: 50 }).default("open"), // open, 19+, 35+, 50+, etc.
  matchType: varchar("match_type", { length: 50 }).notNull().default("casual"), // casual, league, tournament
  eventTier: varchar("event_tier", { length: 50 }).default("local"), // local, regional, national, international
  
  // Context information
  location: varchar("location", { length: 255 }),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  // Note: roundNumber and stageType don't exist in the database
  // roundNumber: integer("round_number"), // For tournament matches
  // stageType: varchar("stage_type", { length: 50 }), // main, qualifying, consolation
  isRated: boolean("is_rated").default(true),
  isVerified: boolean("is_verified").default(false), // Whether opponents have verified the result
  isTestData: boolean("is_test_data").default(false), // PKL-278651-SEC-0002-TESTVIS - Test data visibility control
  
  // VALMAT - Match Validation
  validationStatus: varchar("validation_status", { length: 50 }).notNull().default("pending"), // pending, validated, disputed, rejected
  validationCompletedAt: timestamp("validation_completed_at"),
  validationRequiredBy: timestamp("validation_required_by").defaultNow(),
  rankingPointMultiplier: integer("ranking_point_multiplier").default(100), // Percentage multiplier for ranking points
  dailyMatchCount: integer("daily_match_count").default(1), // Which match of the day is this
  
  // Additional information
  notes: text("notes"),
  xpAwarded: integer("xp_awarded").default(0),
  pointsAwarded: integer("points_awarded").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Ranking history table
export const rankingHistory = pgTable("ranking_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  oldRating: integer("old_rating").notNull(),
  newRating: integer("new_rating").notNull(),
  ratingChange: integer("rating_change").notNull(),
  matchId: integer("match_id").references(() => matches.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Coaching profiles table
export const coachingProfiles = pgTable("coaching_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  experience: integer("experience").notNull(), // Years of experience
  certifications: text("certifications").array(),
  specialties: text("specialties").array(),
  hourlyRate: integer("hourly_rate"),
  availability: json("availability"),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(0), // Average rating from students
  reviewCount: integer("review_count").default(0), // Number of reviews
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Connections table (for friend requests and connections)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, rejected
  type: varchar("type", { length: 50 }).notNull().default("friend"), // friend, coach, partner
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Profile themes table
export const profileThemes = pgTable("profile_themes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  primaryColor: varchar("primary_color", { length: 50 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 50 }).notNull(),
  accentColor: varchar("accent_color", { length: 50 }).notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).notNull(),
  textColor: varchar("text_color", { length: 50 }).notNull(),
  borderStyle: varchar("border_style", { length: 50 }).default("solid"),
  bannerUrl: text("banner_url"),
  isDefault: boolean("is_default").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// External accounts table
export const externalAccounts = pgTable("external_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(), // instagram, twitter, facebook, etc.
  profileUrl: text("profile_url").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User block list table
export const userBlockList = pgTable("user_block_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  tournamentRegistrations: many(tournamentRegistrations),
  userAchievements: many(userAchievements),
  activities: many(activities),
  userRedemptions: many(userRedemptions),
  rankingHistory: many(rankingHistory),
  rankingTransactions: many(rankingTransactions),
  rankingTierHistory: many(rankingTierHistory),
  coachingProfile: many(coachingProfiles),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "recipient" }),
  externalAccounts: many(externalAccounts),
  blockedUsers: many(userBlockList, { relationName: "blocker" }),
  // Add privacy-related relations
  privacySettings: many(userPrivacySettings),
  contactPreferences: many(contactPreferences),
  blockedBy: many(userBlockList, { relationName: "blocked" }),
  playerOneMatches: many(matches, { relationName: "playerOne" }),
  playerTwoMatches: many(matches, { relationName: "playerTwo" }),
  playerOnePartnerMatches: many(matches, { relationName: "playerOnePartner" }),
  playerTwoPartnerMatches: many(matches, { relationName: "playerTwoPartner" }),
  wonMatches: many(matches, { relationName: "winner" }),
  // Goal-setting system relations
  playerGoals: many(playerGoals, { relationName: "player" }),
  coachingGoals: many(playerGoals, { relationName: "coach" })
}));

// Goal-setting system relations
export const playerGoalsRelations = relations(playerGoals, ({ one, many }) => ({
  user: one(users, { fields: [playerGoals.userId], references: [users.id], relationName: "player" }),
  coach: one(users, { fields: [playerGoals.coachId], references: [users.id], relationName: "coach" }),
  parentGoal: one(playerGoals, { fields: [playerGoals.parentGoalId], references: [playerGoals.id] }),
  subGoals: many(playerGoals),
  milestones: many(goalMilestones),
  journalEntries: many(goalJournalEntries),
  progressSnapshots: many(goalProgressSnapshots)
}));

export const goalMilestonesRelations = relations(goalMilestones, ({ one }) => ({
  goal: one(playerGoals, { fields: [goalMilestones.goalId], references: [playerGoals.id] })
}));

export const goalJournalEntriesRelations = relations(goalJournalEntries, ({ one }) => ({
  goal: one(playerGoals, { fields: [goalJournalEntries.goalId], references: [playerGoals.id] })
}));

export const goalProgressSnapshotsRelations = relations(goalProgressSnapshots, ({ one }) => ({
  goal: one(playerGoals, { fields: [goalProgressSnapshots.goalId], references: [playerGoals.id] })
}));

// Tournament relations with parent-child relationships
export const tournamentRelations = relations(tournaments, ({ one, many }) => ({
  // Self-relation for parent-child relationship
  parentTournament: one(tournaments, {
    fields: [tournaments.parentTournamentId],
    references: [tournaments.id],
    relationName: "parent_tournament"
  }),
  childTournaments: many(tournaments, {
    relationName: "parent_tournament"
  }),
  // Standard tournament relations
  registrations: many(tournamentRegistrations),
  matches: many(matches),
  rankingTransactions: many(rankingTransactions)
}));

// Match relations
export const matchRelations = relations(matches, ({ one, many }) => ({
  playerOne: one(users, { fields: [matches.playerOneId], references: [users.id], relationName: "playerOne" }),
  playerTwo: one(users, { fields: [matches.playerTwoId], references: [users.id], relationName: "playerTwo" }),
  playerOnePartner: one(users, { fields: [matches.playerOnePartnerId], references: [users.id], relationName: "playerOnePartner" }),
  playerTwoPartner: one(users, { fields: [matches.playerTwoPartnerId], references: [users.id], relationName: "playerTwoPartner" }),
  winner: one(users, { fields: [matches.winnerId], references: [users.id], relationName: "winner" }),
  tournament: one(tournaments, { fields: [matches.tournamentId], references: [tournaments.id] }),
  rankingTransactions: many(rankingTransactions)
}));

// Create insert schema for user validation
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true
    // passportId is now included in the insertUserSchema
  });

// Create insert schemas for validation - unified schema supporting single, multi-event, and team tournaments
export const insertTournamentSchema = createInsertSchema(tournaments)
  .omit({ id: true, createdAt: true, updatedAt: true, currentParticipants: true })
  .extend({
    level: z.enum(['club', 'district', 'city', 'provincial', 'national', 'regional', 'international']).default('club'),
    startDate: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
    endDate: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
    registrationStartDate: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
    registrationEndDate: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
    
    // Multi-event tournament fields
    isParent: z.boolean().default(false).optional(),
    isSubEvent: z.boolean().default(false).optional(),
    parentTournamentId: z.number().optional(),
    
    // Team tournament fields
    isTeamTournament: z.boolean().default(false).optional(),
    teamSize: z.number().optional(),
    minTeamSize: z.number().optional(),
    maxTeamSize: z.number().optional(),
    maxTeams: z.number().optional(),
    teamMatchFormat: z.any().optional(), // JSON for team match configurations
    teamEligibilityRules: z.any().optional(), // JSON for eligibility rules
    teamLineupRules: z.any().optional(), // JSON for lineup rules
  });

// Unified tournament registration schema supporting both individual and team registrations
export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations)
  .omit({ id: true, createdAt: true, updatedAt: true, registrationDate: true })
  .extend({
    // Team registration fields
    isTeamRegistration: z.boolean().default(false).optional(),
    teamName: z.string().optional(),
    teamPlayers: z.any().optional(), // JSON array of team player details
    teamCaptain: z.string().optional(),
  });

export const insertAchievementSchema = createInsertSchema(achievements)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserAchievementSchema = createInsertSchema(userAchievements)
  .omit({ id: true, createdAt: true, updatedAt: true, unlockedAt: true });

export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, createdAt: true });

export const insertRedemptionCodeSchema = createInsertSchema(redemptionCodes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserRedemptionSchema = createInsertSchema(userRedemptions)
  .omit({ id: true, createdAt: true, redeemedAt: true });

// Create a more detailed match insert schema with validation
export const insertMatchSchema = createInsertSchema(matches)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    isVerified: true, 
    xpAwarded: true, 
    pointsAwarded: true,
    // VALMAT omissions - these are managed by the system
    validationStatus: true,
    validationCompletedAt: true,
    validationRequiredBy: true,
    rankingPointMultiplier: true,
    dailyMatchCount: true
  })
  .extend({
    // Make sure these fields are present
    playerOneId: z.number().int().positive(),
    playerTwoId: z.number().int().positive(),
    
    // Optional fields for doubles
    playerOnePartnerId: z.number().int().positive().optional(),
    playerTwoPartnerId: z.number().int().positive().optional(),
    
    // Match format validation
    formatType: z.enum(["singles", "doubles"]).default("singles"),
    scoringSystem: z.enum(["traditional", "rally"]).default("traditional"),
    pointsToWin: z.number().int().refine(value => [11, 15, 21].includes(value), {
      message: "Points to win must be 11, 15, or 21",
    }),
    
    // Match type validation
    matchType: z.enum(["casual", "league", "tournament"]).default("casual"),
    
    // Division validation
    division: z.enum(["open", "19+", "35+", "50+", "60+", "70+"]).default("open"),
  })
  .refine(data => {
    // Doubles matches must have partners
    if (data.formatType === "doubles") {
      return !!data.playerOnePartnerId && !!data.playerTwoPartnerId;
    }
    return true;
  }, {
    message: "Doubles matches require partner IDs",
    path: ["playerOnePartnerId"],
  })
  .refine(data => {
    // All players must be unique
    const players = [
      data.playerOneId, 
      data.playerTwoId, 
      data.playerOnePartnerId, 
      data.playerTwoPartnerId
    ].filter(Boolean);
    const uniquePlayers = new Set(players);
    return uniquePlayers.size === players.length;
  }, {
    message: "Each player can only appear once in a match",
    path: ["playerTwoId"],
  });

export const insertRankingHistorySchema = createInsertSchema(rankingHistory)
  .omit({ id: true, createdAt: true });

export const insertCoachingProfileSchema = createInsertSchema(coachingProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertConnectionSchema = createInsertSchema(connections)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertProfileThemeSchema = createInsertSchema(profileThemes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertExternalAccountSchema = createInsertSchema(externalAccounts)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserBlockListSchema = createInsertSchema(userBlockList)
  .omit({ id: true, createdAt: true });

export const insertProfileCompletionTrackingSchema = createInsertSchema(profileCompletionTracking)
  .omit({ id: true, createdAt: true, completedAt: true });

// Define TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProfileCompletionTracking = typeof profileCompletionTracking.$inferSelect;
export type InsertProfileCompletionTracking = z.infer<typeof insertProfileCompletionTrackingSchema>;

// Re-export privacy types from the schema/privacy.ts
export {
  UserPrivacySetting,
  InsertUserPrivacySetting,
  PrivacyProfile,
  InsertPrivacyProfile,
  ContactPreference,
  InsertContactPreference
};

// Re-export XP types from schema/xp.ts 
// These are exported from schema/xp.ts and imported/re-exported at the bottom of this file

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;
export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type RedemptionCode = typeof redemptionCodes.$inferSelect;
export type InsertRedemptionCode = z.infer<typeof insertRedemptionCodeSchema>;

export type UserRedemption = typeof userRedemptions.$inferSelect;
export type InsertUserRedemption = z.infer<typeof insertUserRedemptionSchema>;

// Re-export admin match management components
export {
  competitions,
  pointAllocationRules, 
  ageGroupMappings,
  competitionsRelations,
  ageGroupMappingsRelations,
  createCompetitionSchema,
  createMatchSchema,
  allocatePointsSchema,
  calculateAgeGroup,
  POINT_ALLOCATION_RULES,
  type Competition,
  type InsertCompetition,
  type MatchWithPlayers,
  type CompetitionWithMatches,
  type PointAllocationRule,
  type InsertPointAllocationRule,
  type AgeGroupMapping,
  type InsertAgeGroupMapping
} from './schema/admin-match-management';

// Admin matches are exported separately to avoid naming conflicts
export { 
  adminMatches, 
  playerMatchResults,
  adminMatchesRelations as matchesRelations,
  playerMatchResultsRelations,
  createPlayerResultSchema,
  type PlayerMatchResult,
  type InsertPlayerMatchResult
};

// Match type is now exported from admin match management re-export above

export type RankingHistory = typeof rankingHistory.$inferSelect;
export type InsertRankingHistory = z.infer<typeof insertRankingHistorySchema>;

export type CoachingProfile = typeof coachingProfiles.$inferSelect;
export type InsertCoachingProfile = z.infer<typeof insertCoachingProfileSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type ProfileTheme = typeof profileThemes.$inferSelect;
export type InsertProfileTheme = z.infer<typeof insertProfileThemeSchema>;

export type ExternalAccount = typeof externalAccounts.$inferSelect;
export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;

export type UserBlockList = typeof userBlockList.$inferSelect;
export type InsertUserBlockList = z.infer<typeof insertUserBlockListSchema>;

// Login schema for authentication
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

// Registration schema that extends insertUserSchema with password confirmation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6)
}).refine(data => {
  if (typeof data.password === 'string' && typeof data.confirmPassword === 'string') {
    return data.password === data.confirmPassword;
  }
  return false;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Redemption code schema
export const redeemCodeSchema = z.object({
  code: z.string().min(6).max(50)
});

// VALMAT - Match validation schemas
export const matchValidationSchema = z.object({
  matchId: z.number().int().positive(),
  status: z.enum(["confirmed", "disputed"]),
  notes: z.string().optional()
});

export const matchFeedbackSchema = z.object({
  matchId: z.number().int().positive(),
  enjoymentRating: z.number().int().min(1).max(5).optional(),
  skillMatchRating: z.number().int().min(1).max(5).optional(),
  comments: z.string().optional()
});

// External schema modules
import './schema/communication-preferences';
import './schema/partner-preferences';
import './match-statistics-schema'; // PKL-278651-MATCH-0002-XR - Enhanced Match Recording System

// VALMAT - Match Validation System
// Match validation table to track individual participants' validations
export const matchValidations = pgTable("match_validations", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, disputed
  validatedAt: timestamp("validated_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Match feedback table to collect optional player feedback
export const matchFeedback = pgTable("match_feedback", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  enjoymentRating: integer("enjoyment_rating"), // 1-5 star rating
  skillMatchRating: integer("skill_match_rating"), // 1-5 star rating
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow()
});

// User daily match count table to track diminishing returns
export const userDailyMatches = pgTable("user_daily_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchCount: integer("match_count").notNull().default(0), // How many matches played today
  matchDate: date("match_date").notNull(), // The date in question
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations for VALMAT tables
export const matchValidationRelations = relations(matchValidations, ({ one }) => ({
  match: one(matches, { fields: [matchValidations.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchValidations.userId], references: [users.id] })
}));

export const matchFeedbackRelations = relations(matchFeedback, ({ one }) => ({
  match: one(matches, { fields: [matchFeedback.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchFeedback.userId], references: [users.id] })
}));

export const userDailyMatchesRelations = relations(userDailyMatches, ({ one }) => ({
  user: one(users, { fields: [userDailyMatches.userId], references: [users.id] })
}));

// PKL-278651-COMM-0027-MOD - Community Moderation Tools
// Define relations for contentReports
export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  reporter: one(users, {
    fields: [contentReports.reporterId],
    references: [users.id],
    relationName: 'content_report_reporter'
  }),
  community: one(communities, {
    fields: [contentReports.communityId],
    references: [communities.id],
    relationName: 'content_report_community'
  }),
  reviewer: one(users, {
    fields: [contentReports.reviewerId],
    references: [users.id],
    relationName: 'content_report_reviewer'
  }),
}));

// Define relations for moderationActions
export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  community: one(communities, {
    fields: [moderationActions.communityId],
    references: [communities.id],
    relationName: 'moderation_action_community'
  }),
  moderator: one(users, {
    fields: [moderationActions.moderatorId],
    references: [users.id],
    relationName: 'moderation_action_moderator'
  }),
  targetUser: one(users, {
    fields: [moderationActions.targetUserId],
    references: [users.id],
    relationName: 'moderation_action_target_user'
  }),
}));

// Define relations for communityRoles
export const communityRolesRelations = relations(communityRoles, ({ one }) => ({
  community: one(communities, {
    fields: [communityRoles.communityId],
    references: [communities.id],
    relationName: 'community_role_community'
  }),
}));

// Notification relations removed - causing startup issues

// Import required types for enhanced match recording system
import { matchStatistics, performanceImpacts, matchHighlights } from './match-statistics-schema';

// Import assessment system schema
export * from './schema/assessment';

// Update match relations to include VALMAT tables and Enhanced Match Recording System tables
export const matchRelationsExtended = relations(matches, ({ one, many }) => ({
  playerOne: one(users, { fields: [matches.playerOneId], references: [users.id], relationName: "playerOne" }),
  playerTwo: one(users, { fields: [matches.playerTwoId], references: [users.id], relationName: "playerTwo" }),
  playerOnePartner: one(users, { fields: [matches.playerOnePartnerId], references: [users.id], relationName: "playerOnePartner" }),
  playerTwoPartner: one(users, { fields: [matches.playerTwoPartnerId], references: [users.id], relationName: "playerTwoPartner" }),
  winner: one(users, { fields: [matches.winnerId], references: [users.id], relationName: "winner" }),
  tournament: one(tournaments, { fields: [matches.tournamentId], references: [tournaments.id] }),
  validations: many(matchValidations),
  feedback: many(matchFeedback),
  xpTransactions: many(xpTransactions),
  rankingTransactions: many(rankingTransactions),
  // PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
  statistics: many(matchStatistics),
  performanceImpacts: many(performanceImpacts),
  highlights: many(matchHighlights)
}));

// Create insert schemas for VALMAT tables
export const insertMatchValidationSchema = createInsertSchema(matchValidations)
  .omit({ id: true, createdAt: true, validatedAt: true });

export const insertMatchFeedbackSchema = createInsertSchema(matchFeedback)
  .omit({ id: true, createdAt: true });

export const insertUserDailyMatchesSchema = createInsertSchema(userDailyMatches)
  .omit({ id: true, createdAt: true });

// Define TypeScript types for VALMAT
export type MatchValidation = typeof matchValidations.$inferSelect;
export type InsertMatchValidation = z.infer<typeof insertMatchValidationSchema>;

export type MatchFeedback = typeof matchFeedback.$inferSelect;
export type InsertMatchFeedback = z.infer<typeof insertMatchFeedbackSchema>;

export type UserDailyMatches = typeof userDailyMatches.$inferSelect;
export type InsertUserDailyMatches = z.infer<typeof insertUserDailyMatchesSchema>;

// Coach-Student Assignment System Types
export const insertCoachStudentAssignmentSchema = createInsertSchema(coachStudentAssignments)
  .omit({ id: true, assignedAt: true, createdAt: true, updatedAt: true });

export type CoachStudentAssignment = typeof coachStudentAssignments.$inferSelect;
export type InsertCoachStudentAssignment = z.infer<typeof insertCoachStudentAssignmentSchema>;

// Relations for XP and Ranking tables
// NOTE: We are using the relations from the xp schema directly
// The relations are defined there to match the actual schema

export const rankingTransactionRelations = relations(rankingTransactions, ({ one }) => ({
  user: one(users, { fields: [rankingTransactions.userId], references: [users.id] }),
  match: one(matches, { fields: [rankingTransactions.matchId], references: [matches.id] }),
  tournament: one(tournaments, { fields: [rankingTransactions.tournamentId], references: [tournaments.id] })
}));

export const rankingTierHistoryRelations = relations(rankingTierHistory, ({ one }) => ({
  user: one(users, { fields: [rankingTierHistory.userId], references: [users.id] })
}));

// XP and Ranking schemas
// insertXpTransactionSchema is now imported from schema/xp.ts

export const insertRankingTransactionSchema = createInsertSchema(rankingTransactions)
  .omit({ id: true, createdAt: true, timestamp: true });

export const insertRankingTierHistorySchema = createInsertSchema(rankingTierHistory)
  .omit({ id: true, createdAt: true, timestamp: true });

// XP and Ranking types
// These are now imported from ./schema/xp.ts

export type RankingTransaction = typeof rankingTransactions.$inferSelect;
export type InsertRankingTransaction = z.infer<typeof insertRankingTransactionSchema>;

export type RankingTierHistory = typeof rankingTierHistory.$inferSelect;
export type InsertRankingTierHistory = z.infer<typeof insertRankingTierHistorySchema>;

// Define the privacy settings relations after users table is defined
export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(users, {
    fields: [userPrivacySettings.userId],
    references: [users.id]
  })
}));

export const contactPreferencesRelations = relations(contactPreferences, ({ one }) => ({
  user: one(users, {
    fields: [contactPreferences.userId],
    references: [users.id]
  })
}));

// Export community engagement tables and schemas
export {
  communityActivities,
  communityEngagementMetrics,
  communityEngagementLevels,
  communityLeaderboards,
  insertCommunityActivitySchema,
  insertCommunityEngagementMetricSchema,
  insertCommunityEngagementLevelSchema,
  insertCommunityLeaderboardSchema,
  CommunityActivityType,
  CommunityActivity,
  InsertCommunityActivity,
  CommunityEngagementMetric,
  InsertCommunityEngagementMetric,
  CommunityEngagementLevel, 
  InsertCommunityEngagementLevel,
  CommunityLeaderboard,
  InsertCommunityLeaderboard
};

// Import and re-export XP system schema (PKL-278651-XP-0001-FOUND - XP System Foundation)
export {
  xpTransactions,
  xpServiceLevels,
  userXpLevels,
  xpTransactionsRelations,
  xpServiceLevelsRelations,
  userXpLevelsRelations,
  insertXpTransactionSchema,
  insertXpServiceLevelSchema,
  insertUserXpLevelSchema,
  XP_SOURCE,
  XP_SOURCE_TYPE,
  XP_SERVICE_LEVEL,
  type XpTransaction,
  type InsertXpTransaction,
  type XpServiceLevel,
  type InsertXpServiceLevel,
  type UserXpLevel,
  type InsertUserXpLevel
} from './schema/xp';

// Import and re-export Bounce automation schema (PKL-278651-BOUNCE-0005-AUTO - Bounce Automation)
import {
  bounceTestTemplates,
  bounceTestTemplatesRelations,
  insertBounceTestTemplateSchema,
  SCHEDULE_FREQUENCY,
  TEST_RUN_STATUS,
  bounceSchedules as bounceAutomationSchedules,
  bounceSchedulesRelations as bounceAutomationSchedulesRelations,
  bounceTestRuns as bounceAutomationTestRuns,
  bounceTestRunsRelations as bounceAutomationTestRunsRelations,
  insertBounceScheduleSchema as insertBounceAutomationScheduleSchema,
  insertBounceTestRunSchema as insertBounceAutomationTestRunSchema,
  type BounceTestTemplate,
  type InsertBounceTestTemplate,
  type BounceSchedule as BounceAutomationSchedule,
  type InsertBounceSchedule as InsertBounceAutomationSchedule,
  type BounceTestRun as BounceAutomationTestRun,
  type InsertBounceTestRun as InsertBounceAutomationTestRun
} from './schema/bounce-automation';

// Export Bounce automation components with unique names
export {
  bounceTestTemplates,
  bounceTestTemplatesRelations,
  insertBounceTestTemplateSchema,
  SCHEDULE_FREQUENCY,
  TEST_RUN_STATUS,
  bounceAutomationSchedules,
  bounceAutomationSchedulesRelations,
  bounceAutomationTestRuns,
  bounceAutomationTestRunsRelations,
  insertBounceAutomationScheduleSchema,
  insertBounceAutomationTestRunSchema,
  type BounceTestTemplate,
  type InsertBounceTestTemplate,
  type BounceAutomationSchedule,
  type InsertBounceAutomationSchedule,
  type BounceAutomationTestRun,
  type InsertBounceAutomationTestRun
};

// Export coach-match integration components (PKL-278651-COACH-MATCH-INTEGRATION - Phase 1)
export {
  coachingSessionMatches,
  coachMatchInput,
  matchPcpAssessments,
  pointsAllocationExplanation,
  coachStudentProgress,
  coachingSessionMatchesRelations,
  coachMatchInputRelations,
  matchPcpAssessmentsRelations,
  pointsAllocationExplanationRelations,
  coachStudentProgressRelations,
  insertCoachingSessionMatchSchema,
  insertCoachMatchInputSchema,
  insertMatchPcpAssessmentSchema,
  insertPointsAllocationExplanationSchema,
  insertCoachStudentProgressSchema,
  MatchContext,
  CoachInputType,
  SkillCategory,
  type CoachingSessionMatch,
  type InsertCoachingSessionMatch,
  type CoachMatchInput,
  type InsertCoachMatchInput,
  type MatchPcpAssessment,
  type InsertMatchPcpAssessment,
  type PointsAllocationExplanation,
  type InsertPointsAllocationExplanation,
  type CoachStudentProgress,
  type InsertCoachStudentProgress
};

// Add additional core schema exports here as the system grows

// Export community moderation schemas (PKL-278651-COMM-0029-MOD)
export {
  contentReports,
  moderationActions, 
  communityRoles,
  contentApprovalQueue,
  contentFilterSettings,
  insertContentReportSchema,
  insertModerationActionSchema,
  insertCommunityRoleSchema,
  insertContentApprovalSchema,
  insertContentFilterSettingsSchema,
  type ContentReport,
  type InsertContentReport,
  type ModerationAction,
  type InsertModerationAction,
  type CommunityRole,
  type InsertCommunityRole,
  type ContentApproval,
  type InsertContentApproval,
  type ContentFilterSettings,
  type InsertContentFilterSettings
};

// Export enhanced member management schemas (PKL-278651-COMM-0034-MEMBER)
export {
  communityPermissionTypes,
  communityRolePermissions,
  communityCustomRoles,
  communityRoleAssignments,
  communityMemberActionsLog,
  insertCommunityPermissionTypeSchema,
  insertCommunityRolePermissionSchema,
  insertCommunityCustomRoleSchema,
  insertCommunityRoleAssignmentSchema,
  insertCommunityMemberActionLogSchema,
  type CommunityPermissionType,
  type CommunityRolePermission,
  type CommunityCustomRole,
  type CommunityRoleAssignment,
  type CommunityMemberActionLog,
  type RoleWithPermissions,
  type PermissionGroup,
  MemberActionType
} from './schema/community-roles';

// Community notifications schemas removed - causing startup issues

// Export training center schemas (PKL-278651-TRAINING-CENTER-001)
export {
  trainingCenters,
  coachingSessions,
  challenges,
  challengeCompletions,
  digitalBadges,
  playerBadges,
  insertTrainingCenterSchema,
  insertCoachingSessionSchema,
  insertChallengeSchema,
  insertChallengeCompletionSchema,
  insertDigitalBadgeSchema,
  insertPlayerBadgeSchema,
  type TrainingCenter,
  type InsertTrainingCenter,
  type CoachingSession,
  type InsertCoachingSession,
  type Challenge,
  type InsertChallenge,
  type ChallengeCompletion,
  type InsertChallengeCompletion,
  type DigitalBadge,
  type InsertDigitalBadge,
  type PlayerBadge,
  type InsertPlayerBadge,
  SessionType,
  SessionStatus,
  ChallengeCategory,
  SkillLevel
};

// Community Challenges Schema (PKL-278651-GAMIF-CHAL-001)
export const communityChallenges = pgTable("community_challenges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("individual"), // individual, team, community
  category: varchar("category", { length: 20 }).notNull().default("technical"), // technical, tactical, social, consistency, special
  difficulty: integer("difficulty").notNull().default(1), // 1-5 stars
  duration: integer("duration").notNull(), // in days
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  maxParticipants: integer("max_participants"),
  requirements: jsonb("requirements").default([]), // Array of requirement strings
  picklePointsReward: integer("pickle_points_reward").default(0),
  pointsReward: integer("points_reward").default(0),
  badges: jsonb("badges").default([]), // Array of badge names
  specialReward: text("special_reward"),
  createdById: integer("created_by_id").references(() => users.id),
  facilities: jsonb("facilities").default([]), // Array of facility IDs
  teamSize: integer("team_size"),
  tags: jsonb("tags").default([]), // Array of tag strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => communityChallenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  progress: integer("progress").default(0),
  score: integer("score").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  teamId: integer("team_id")
});

export const challengeEvents = pgTable("challenge_events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("social"), // tournament, social, training, special
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  isVirtual: boolean("is_virtual").default(false),
  maxParticipants: integer("max_participants"),
  organizerId: integer("organizer_id").references(() => users.id),
  organizerName: varchar("organizer_name", { length: 100 }),
  organizerAvatar: text("organizer_avatar"),
  organizerRole: varchar("organizer_role", { length: 50 }),
  picklePointsReward: integer("pickle_points_reward").default(0),
  pointsReward: integer("points_reward").default(0),
  specialRewards: jsonb("special_rewards").default([]), // Array of special reward strings
  requirements: jsonb("requirements").default([]), // Array of requirement strings
  tags: jsonb("tags").default([]), // Array of tag strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const challengeEventParticipants = pgTable("challenge_event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => challengeEvents.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  registeredAt: timestamp("registered_at").defaultNow()
});

// Community challenges relations
export const communityChallengesRelations = relations(communityChallenges, ({ one, many }) => ({
  creator: one(users, { fields: [communityChallenges.createdById], references: [users.id] }),
  participants: many(challengeParticipants)
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(communityChallenges, { fields: [challengeParticipants.challengeId], references: [communityChallenges.id] }),
  user: one(users, { fields: [challengeParticipants.userId], references: [users.id] })
}));

export const challengeEventsRelations = relations(challengeEvents, ({ one, many }) => ({
  organizer: one(users, { fields: [challengeEvents.organizerId], references: [users.id] }),
  participants: many(challengeEventParticipants)
}));

export const challengeEventParticipantsRelations = relations(challengeEventParticipants, ({ one }) => ({
  event: one(challengeEvents, { fields: [challengeEventParticipants.eventId], references: [challengeEvents.id] }),
  user: one(users, { fields: [challengeEventParticipants.userId], references: [users.id] })
}));

// Community challenges schemas
export const insertCommunityChallengeSchema = createInsertSchema(communityChallenges)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants)
  .omit({ id: true, joinedAt: true });

export const insertChallengeEventSchema = createInsertSchema(challengeEvents)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertChallengeEventParticipantSchema = createInsertSchema(challengeEventParticipants)
  .omit({ id: true, registeredAt: true });

// Community challenges types
export type CommunityChallenge = typeof communityChallenges.$inferSelect;
export type InsertCommunityChallenge = z.infer<typeof insertCommunityChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type ChallengeEvent = typeof challengeEvents.$inferSelect;
export type InsertChallengeEvent = z.infer<typeof insertChallengeEventSchema>;

export type ChallengeEventParticipant = typeof challengeEventParticipants.$inferSelect;
export type InsertChallengeEventParticipant = z.infer<typeof insertChallengeEventParticipantSchema>;

// Re-export Goal-Setting System components
export {
  playerGoals,
  goalMilestones,
  goalJournalEntries,
  goalProgressSnapshots,
  insertPlayerGoalSchema,
  insertGoalMilestoneSchema,
  insertGoalJournalEntrySchema,
  insertGoalProgressSnapshotSchema,
  GoalCategories,
  GoalStatus,
  GoalPriority,
  type PlayerGoal,
  type InsertPlayerGoal,
  type GoalMilestone,
  type InsertGoalMilestone,
  type GoalJournalEntry,
  type InsertGoalJournalEntry,
  type GoalProgressSnapshot,
  type InsertGoalProgressSnapshot,
  type GoalCategory,
  type GoalStatusType,
  type GoalPriorityType
};

// Re-export Curriculum Management System components (Sprint 1)
export {
  drillLibrary,
  curriculumTemplates,
  lessonPlans,
  sessionGoals,
  drillCategories,
  drillLibraryRelations,
  curriculumTemplatesRelations,
  lessonPlansRelations,
  sessionGoalsRelations,
  insertDrillLibrarySchema,
  insertCurriculumTemplateSchema,
  insertLessonPlanSchema,
  insertSessionGoalSchema,
  type DrillLibrary,
  type InsertDrillLibrary,
  type CurriculumTemplate,
  type InsertCurriculumTemplate,
  type LessonPlan,
  type InsertLessonPlan,
  type SessionGoal,
  type InsertSessionGoal,
  type DrillCategory,
  type DrillWithCategory,
  type LessonPlanWithTemplate
};

// Zod schemas for youth ranking system
export const insertUserAgeGroupRankingSchema = createInsertSchema(userAgeGroupRankings);

// Types for youth ranking system
export type UserAgeGroupRanking = typeof userAgeGroupRankings.$inferSelect;
export type InsertUserAgeGroupRanking = z.infer<typeof insertUserAgeGroupRankingSchema>;

// Age category constants for standalone youth system
export const AGE_CATEGORIES = {
  YOUTH: ['U12', 'U14', 'U16', 'U18'] as const,
  ADULT: ['Open', '35+', '50+', '60+', '70+'] as const,
  ALL: ['U12', 'U14', 'U16', 'U18', 'Open', '35+', '50+', '60+', '70+'] as const
};

export type AgeCategory = typeof AGE_CATEGORIES.ALL[number];
export type YouthCategory = typeof AGE_CATEGORIES.YOUTH[number];
export type AdultCategory = typeof AGE_CATEGORIES.ADULT[number];