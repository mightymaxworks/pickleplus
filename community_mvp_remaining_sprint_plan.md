# Community MVP Remaining Features Sprint Plan
**Created: April 19, 2025 - 2:30 PM ET**
**Framework: 5.2**

This document outlines the sprint plan to complete the remaining Community MVP features following Framework 5.2 principles. It covers only the features that need to be implemented to complete the MVP, based on assessment of existing functionality.

## Remaining Features Roadmap

| Sprint ID | Feature | Priority | Complexity | Duration | Status |
|-----------|---------|----------|------------|----------|--------|
| PKL-278651-COMM-0027-MOD | Community Moderation Tools | Critical | Medium | 3 days | Planned |
| PKL-278651-COMM-0028-NOTIF | Community Notifications | High | Medium | 2 days | Planned |
| PKL-278651-COMM-0029-DISC | Enhanced Community Discovery | High | Medium | 3 days | Planned |

## Sprint 1: Community Moderation & Notifications
**Sprint ID: PKL-278651-COMM-0027-MOD + PKL-278651-COMM-0028-NOTIF**
**Start Date/Time: April 24, 2025 - 9:00 AM ET**
**End Date/Time: April 28, 2025 - 5:00 PM ET**

### Pre-Implementation Analysis
**Timestamp: April 19, 2025 - 2:35 PM ET**

#### Current State Assessment
Analysis of the current codebase reveals that the community framework has been established with post and event functionality, but lacks robust moderation tools and a notification system necessary for an engaged community ecosystem.

#### Related Files
| File Path | Purpose | Integration Points |
|-----------|---------|-------------------|
| shared/schema.ts | Database schema | Community moderation/notification tables |
| server/modules/community/moderation-service.ts | Moderation service | Community, User services |
| server/modules/community/notification-service.ts | Notification service | Community, User services |
| server/routes/community-routes.ts | API endpoints | Service integration, Auth middleware |
| client/src/components/moderation/ReportForm.tsx | Content reporting | Moderation API |
| client/src/components/moderation/ModerationQueue.tsx | Moderation dashboard | Moderation API |
| client/src/components/notifications/NotificationBell.tsx | Notification UI | Notification API, User context |
| client/src/components/notifications/NotificationCenter.tsx | Notification display | Notification API, User context |

### Module 1: Community Moderation Tools
**Implementation Timestamp: April 24, 2025 - 9:00 AM ET**

#### Step 1: Schema Updates
**Timestamp: April 24, 2025 - 9:15 AM ET**

```typescript
/**
 * [PKL-278651-COMM-0027-MOD] Community Moderation Schema
 * Implementation timestamp: 2025-04-24 09:15 ET
 * 
 * Schema enhancements for community moderation functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing schema
 * - Maintains backward compatibility
 */
// In shared/schema.ts

// Content reports for moderation
export const contentReports = pgTable('content_reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').notNull().references(() => users.id),
  communityId: integer('community_id').notNull().references(() => communities.id),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'post', 'comment', 'event'
  contentId: integer('content_id').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  details: text('details'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'reviewed', 'resolved', 'rejected'
  reviewerId: integer('reviewer_id').references(() => users.id),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  action: varchar('action', { length: 50 }), // 'no_action', 'warning', 'remove_content', 'mute_user', 'ban_user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Community moderation actions
export const moderationActions = pgTable('moderation_actions', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  moderatorId: integer('moderator_id').notNull().references(() => users.id),
  targetUserId: integer('target_user_id').notNull().references(() => users.id),
  actionType: varchar('action_type', { length: 50 }).notNull(), // 'warning', 'mute', 'ban', 'unban'
  reason: text('reason'),
  expiresAt: timestamp('expires_at'), // For temporary actions
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Community role management
export const communityRoles = pgTable('community_roles', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  permissions: text('permissions').notNull(), // JSON string of permissions
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create type definitions
export type ContentReport = typeof contentReports.$inferSelect;
export type InsertContentReport = typeof contentReports.$inferInsert;
export type ModerationAction = typeof moderationActions.$inferSelect;
export type InsertModerationAction = typeof moderationActions.$inferInsert;
export type CommunityRole = typeof communityRoles.$inferSelect;
export type InsertCommunityRole = typeof communityRoles.$inferInsert;
```

#### Step 2: Moderation Service
**Timestamp: April 24, 2025 - 11:00 AM ET**

```typescript
/**
 * [PKL-278651-COMM-0027-MOD] Community Moderation Service
 * Implementation timestamp: 2025-04-24 11:00 ET
 * 
 * Core service for community content moderation.
 * 
 * Framework 5.2 compliance verified:
 * - Follows service pattern
 * - Clear interface and responsibilities
 */
// Create/update server/modules/community/moderation-service.ts

import { db } from '../../db';
import { 
  contentReports, 
  moderationActions, 
  communityMembers,
  communities,
  communityPosts,
  postComments,
  communityEvents,
  InsertContentReport, 
  InsertModerationAction 
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class ModerationService {
  /**
   * Create a new content report
   */
  async createReport(reportData: InsertContentReport): Promise<number> {
    try {
      // Validate content exists based on content type
      await this.validateReportContent(reportData);

      // Check if user has already reported this content
      const existingReport = await db.select()
        .from(contentReports)
        .where(
          and(
            eq(contentReports.reporterId, reportData.reporterId),
            eq(contentReports.contentType, reportData.contentType),
            eq(contentReports.contentId, reportData.contentId)
          )
        )
        .limit(1);

      if (existingReport.length > 0) {
        throw new Error('You have already reported this content');
      }

      // Create the report
      const [result] = await db.insert(contentReports)
        .values(reportData)
        .returning({ id: contentReports.id });

      // Notify community moderators of the new report
      await this.notifyModerators(reportData.communityId, result.id);
      
      return result.id;
    } catch (error) {
      console.error('[Moderation] Error creating report:', error);
      throw error;
    }
  }

  /**
   * Validate that the reported content exists
   */
  private async validateReportContent(reportData: InsertContentReport): Promise<void> {
    const { contentType, contentId } = reportData;

    if (contentType === 'post') {
      const post = await db.select()
        .from(communityPosts)
        .where(eq(communityPosts.id, contentId))
        .limit(1);

      if (post.length === 0) {
        throw new Error('Post not found');
      }
    } else if (contentType === 'comment') {
      const comment = await db.select()
        .from(postComments)
        .where(eq(postComments.id, contentId))
        .limit(1);

      if (comment.length === 0) {
        throw new Error('Comment not found');
      }
    } else if (contentType === 'event') {
      const event = await db.select()
        .from(communityEvents)
        .where(eq(communityEvents.id, contentId))
        .limit(1);

      if (event.length === 0) {
        throw new Error('Event not found');
      }
    } else {
      throw new Error('Invalid content type');
    }
  }

  /**
   * Notify community moderators about a new report
   */
  private async notifyModerators(communityId: number, reportId: number): Promise<void> {
    try {
      // Get all moderators and admins for the community
      const moderators = await db.select({
        userId: communityMembers.userId,
      })
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          sql`${communityMembers.role} IN ('admin', 'moderator')`
        )
      );

      // Get community name for notification
      const [community] = await db.select({
        name: communities.name,
      })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

      if (!community) {
        throw new Error('Community not found');
      }

      // Create notifications for all moderators
      const notificationService = await import('./notification-service');
      
      for (const moderator of moderators) {
        await notificationService.default.createNotification({
          userId: moderator.userId,
          type: 'moderation_report',
          title: 'New content report',
          message: `A new content report has been submitted in community ${community.name}`,
          referenceType: 'report',
          referenceId: reportId,
          communityId,
        });
      }
    } catch (error) {
      console.error('[Moderation] Error notifying moderators:', error);
      // Non-critical, continue without failing
    }
  }

  /**
   * Get reports for a community with pagination and filtering
   */
  async getCommunityReports(
    communityId: number,
    filters: {
      status?: string;
      contentType?: string;
    } = {},
    page = 1,
    limit = 20
  ) {
    try {
      const offset = (page - 1) * limit;
      
      // Build the where clause
      let whereConditions = [
        eq(contentReports.communityId, communityId)
      ];
      
      if (filters.status) {
        whereConditions.push(eq(contentReports.status, filters.status));
      }
      
      if (filters.contentType) {
        whereConditions.push(eq(contentReports.contentType, filters.contentType));
      }
      
      // Execute the query
      const reports = await db.select()
        .from(contentReports)
        .where(and(...whereConditions))
        .orderBy(desc(contentReports.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const [{ count }] = await db.select({
        count: sql`COUNT(*)`.as('count'),
      })
      .from(contentReports)
      .where(and(...whereConditions));
      
      return {
        reports,
        pagination: {
          page,
          limit,
          totalReports: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      console.error('[Moderation] Error getting community reports:', error);
      throw error;
    }
  }

  /**
   * Review a report and take action
   */
  async reviewReport(
    reportId: number,
    reviewData: {
      reviewerId: number;
      status: string;
      reviewNotes?: string;
      action?: string;
    }
  ) {
    try {
      // Update the report
      const [updatedReport] = await db.update(contentReports)
        .set({
          status: reviewData.status,
          reviewerId: reviewData.reviewerId,
          reviewNotes: reviewData.reviewNotes || null,
          action: reviewData.action || null,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contentReports.id, reportId))
        .returning();

      if (!updatedReport) {
        throw new Error('Report not found');
      }

      // Take action if specified
      if (reviewData.action && reviewData.action !== 'no_action') {
        await this.takeModeratorAction(updatedReport, reviewData.reviewerId);
      }

      // Notify the reporter
      await this.notifyReporter(updatedReport);

      return updatedReport;
    } catch (error) {
      console.error('[Moderation] Error reviewing report:', error);
      throw error;
    }
  }

  /**
   * Take moderation action based on report review
   */
  private async takeModeratorAction(report: any, moderatorId: number): Promise<void> {
    try {
      // First, get the user ID of the content creator
      let targetUserId: number | null = null;

      if (report.contentType === 'post') {
        const [post] = await db.select({
          userId: communityPosts.userId,
        })
        .from(communityPosts)
        .where(eq(communityPosts.id, report.contentId))
        .limit(1);

        if (post) {
          targetUserId = post.userId;
        }
      } else if (report.contentType === 'comment') {
        const [comment] = await db.select({
          userId: postComments.userId,
        })
        .from(postComments)
        .where(eq(postComments.id, report.contentId))
        .limit(1);

        if (comment) {
          targetUserId = comment.userId;
        }
      } else if (report.contentType === 'event') {
        const [event] = await db.select({
          creatorId: communityEvents.creatorId,
        })
        .from(communityEvents)
        .where(eq(communityEvents.id, report.contentId))
        .limit(1);

        if (event) {
          targetUserId = event.creatorId;
        }
      }

      if (!targetUserId) {
        throw new Error('Could not determine content creator');
      }

      // Take specified action
      if (report.action === 'remove_content') {
        await this.removeContent(report.contentType, report.contentId);
      } else if (report.action === 'mute_user' || report.action === 'ban_user') {
        // Create moderation action
        const actionType = report.action === 'mute_user' ? 'mute' : 'ban';
        
        let expiresAt: Date | null = null;
        if (actionType === 'mute') {
          // Mutes last for 7 days
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
        }

        await db.insert(moderationActions)
          .values({
            communityId: report.communityId,
            moderatorId,
            targetUserId,
            actionType,
            reason: `From report #${report.id}: ${report.reason}`,
            expiresAt,
            isActive: true,
          });
        
        // Update user's community membership status
        if (actionType === 'ban') {
          await db.update(communityMembers)
            .set({ 
              status: 'banned',
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(communityMembers.communityId, report.communityId),
                eq(communityMembers.userId, targetUserId)
              )
            );
        }
      }
    } catch (error) {
      console.error('[Moderation] Error taking moderation action:', error);
      throw error;
    }
  }

  /**
   * Remove content based on content type
   */
  private async removeContent(contentType: string, contentId: number): Promise<void> {
    try {
      if (contentType === 'post') {
        await db.update(communityPosts)
          .set({ 
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(eq(communityPosts.id, contentId));
      } else if (contentType === 'comment') {
        await db.update(postComments)
          .set({ 
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(eq(postComments.id, contentId));
      } else if (contentType === 'event') {
        await db.update(communityEvents)
          .set({ 
            status: 'canceled',
            updatedAt: new Date(),
          })
          .where(eq(communityEvents.id, contentId));
      }
    } catch (error) {
      console.error('[Moderation] Error removing content:', error);
      throw error;
    }
  }

  /**
   * Notify reporter about the status of their report
   */
  private async notifyReporter(report: any): Promise<void> {
    try {
      const notificationService = await import('./notification-service');
      
      let message = `Your report has been reviewed.`;
      if (report.status === 'resolved') {
        message = `Your report has been reviewed and action has been taken.`;
      } else if (report.status === 'rejected') {
        message = `Your report has been reviewed and no action was deemed necessary.`;
      }

      await notificationService.default.createNotification({
        userId: report.reporterId,
        type: 'report_status',
        title: 'Report Status Update',
        message,
        referenceType: 'report',
        referenceId: report.id,
        communityId: report.communityId,
      });
    } catch (error) {
      console.error('[Moderation] Error notifying reporter:', error);
      // Non-critical, continue without failing
    }
  }

  // Additional methods to be implemented as needed
}

export const moderationService = new ModerationService();
export default moderationService;
```

#### Step 3: Moderation API Endpoints
**Timestamp: April 24, 2025 - 3:00 PM ET**

```typescript
/**
 * [PKL-278651-COMM-0027-MOD] Community Moderation API Routes
 * Implementation timestamp: 2025-04-24 15:00 ET
 * 
 * API endpoints for community moderation functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Follows API route patterns
 * - Clear error handling
 * - Proper authentication and authorization
 */
// Update server/routes/community-routes.ts

import { moderationService } from '../modules/community/moderation-service';
import { insertContentReportSchema } from '@shared/schema/validators';

// Add these routes to the existing community routes

/**
 * POST /api/communities/:communityId/reports
 * Create a new content report in a community
 */
app.post('/api/communities/:communityId/reports', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;
    
    // Validate request body
    const reportData = insertContentReportSchema.parse({
      ...req.body,
      communityId: parseInt(communityId, 10),
      reporterId: userId,
    });
    
    // Create the report
    const reportId = await moderationService.createReport(reportData);
    
    res.status(201).json({ id: reportId });
  } catch (error) {
    console.error('[API] Error creating content report:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid report data', details: error.errors });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create report' });
  }
});

/**
 * GET /api/communities/:communityId/reports
 * Get moderation reports for a community (moderators only)
 */
app.get('/api/communities/:communityId/reports', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user!.id;
    const { page = '1', limit = '20', status, contentType } = req.query;
    
    // Check if user is a moderator or admin
    const membership = await communityService.getMembership(parseInt(communityId, 10), userId);
    
    if (!membership || (membership.role !== 'admin' && membership.role !== 'moderator')) {
      return res.status(403).json({ error: 'Only community moderators can view reports' });
    }
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (contentType) filters.contentType = contentType as string;
    
    const result = await moderationService.getCommunityReports(
      parseInt(communityId, 10),
      filters,
      pageNum,
      limitNum
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[API] Error getting community reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * POST /api/communities/reports/:reportId/review
 * Review a moderation report (moderators only)
 */
app.post('/api/communities/reports/:reportId/review', isAuthenticated, async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user!.id;
    const { status, reviewNotes, action } = req.body;
    
    // Get the report to check community
    const db = req.app.locals.db;
    const [report] = await db.select({ communityId: contentReports.communityId })
      .from(contentReports)
      .where(eq(contentReports.id, parseInt(reportId, 10)))
      .limit(1);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user is a moderator or admin
    const membership = await communityService.getMembership(report.communityId, userId);
    
    if (!membership || (membership.role !== 'admin' && membership.role !== 'moderator')) {
      return res.status(403).json({ error: 'Only community moderators can review reports' });
    }
    
    // Review the report
    const updatedReport = await moderationService.reviewReport(parseInt(reportId, 10), {
      reviewerId: userId,
      status,
      reviewNotes,
      action,
    });
    
    res.status(200).json(updatedReport);
  } catch (error) {
    console.error('[API] Error reviewing report:', error);
    res.status(500).json({ error: error.message || 'Failed to review report' });
  }
});
```

### Module 2: Community Notifications
**Implementation Timestamp: April 25, 2025 - 9:00 AM ET**

#### Step 1: Schema Updates
**Timestamp: April 25, 2025 - 9:15 AM ET**

```typescript
/**
 * [PKL-278651-COMM-0028-NOTIF] Community Notifications Schema
 * Implementation timestamp: 2025-04-25 09:15 ET
 * 
 * Schema enhancements for community notifications functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing schema
 * - Maintains backward compatibility
 */
// In shared/schema.ts

// User notifications
export const userNotifications = pgTable('user_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'community_post', 'mention', 'report_status', etc.
  title: varchar('title', { length: 100 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // 'post', 'comment', 'event', 'report', etc.
  referenceId: integer('reference_id'),
  communityId: integer('community_id').references(() => communities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  communityId: integer('community_id').references(() => communities.id), // null = global preference
  notificationType: varchar('notification_type', { length: 50 }).notNull(), // 'post', 'comment', 'mention', etc.
  channel: varchar('channel', { length: 20 }).notNull(), // 'app', 'email'
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create type definitions
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
```

#### Step 2: Notification Service
**Timestamp: April 25, 2025 - 11:00 AM ET**

```typescript
/**
 * [PKL-278651-COMM-0028-NOTIF] Community Notification Service
 * Implementation timestamp: 2025-04-25 11:00 ET
 * 
 * Core service for community notifications.
 * 
 * Framework 5.2 compliance verified:
 * - Follows service pattern
 * - Clear interface and responsibilities
 */
// Create server/modules/community/notification-service.ts

import { db } from '../../db';
import { 
  userNotifications, 
  notificationPreferences,
  InsertUserNotification,
  users,
  communities,
} from '@shared/schema';
import { eq, and, desc, sql, isNull, gt } from 'drizzle-orm';

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(notificationData: InsertUserNotification): Promise<number> {
    try {
      // Check if user should receive this notification (based on preferences)
      if (!await this.shouldSendNotification(notificationData)) {
        return -1; // Skip notification
      }

      // Create the notification
      const [result] = await db.insert(userNotifications)
        .values(notificationData)
        .returning({ id: userNotifications.id });
      
      return result.id;
    } catch (error) {
      console.error('[Notification] Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Check if user should receive this notification based on preferences
   */
  private async shouldSendNotification(notificationData: InsertUserNotification): Promise<boolean> {
    try {
      // Get user's notification preferences
      const preferences = await db.select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, notificationData.userId),
            sql`(${notificationPreferences.communityId} IS NULL OR ${notificationPreferences.communityId} = ${notificationData.communityId})`,
            eq(notificationPreferences.notificationType, this.mapNotificationType(notificationData.type)),
            eq(notificationPreferences.channel, 'app')
          )
        );

      // If no specific preference, use default (enabled)
      if (preferences.length === 0) {
        return true;
      }

      // Check community-specific preference first
      const communityPreference = preferences.find(p => p.communityId === notificationData.communityId);
      if (communityPreference) {
        return communityPreference.enabled;
      }

      // Then check global preference
      const globalPreference = preferences.find(p => p.communityId === null);
      if (globalPreference) {
        return globalPreference.enabled;
      }

      // Default to enabled
      return true;
    } catch (error) {
      console.error('[Notification] Error checking notification preferences:', error);
      return true; // Default to sending notification on error
    }
  }

  /**
   * Map notification type to preference type
   */
  private mapNotificationType(notificationType: string): string {
    // Map specific notification types to their preference category
    const typeMap: Record<string, string> = {
      'community_post': 'post',
      'community_comment': 'comment',
      'mention': 'mention',
      'event_reminder': 'event',
      'report_status': 'moderation',
      'moderation_report': 'moderation',
    };

    return typeMap[notificationType] || notificationType;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: number, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get notifications
      const notifications = await db.select()
        .from(userNotifications)
        .where(
          and(
            eq(userNotifications.userId, userId),
            isNull(userNotifications.deletedAt)
          )
        )
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get unread count
      const [{ count: unreadCount }] = await db.select({
        count: sql`COUNT(*)`.as('count'),
      })
      .from(userNotifications)
      .where(
        and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.isRead, false),
          isNull(userNotifications.deletedAt)
        )
      );
      
      // Get total count
      const [{ count: totalCount }] = await db.select({
        count: sql`COUNT(*)`.as('count'),
      })
      .from(userNotifications)
      .where(
        and(
          eq(userNotifications.userId, userId),
          isNull(userNotifications.deletedAt)
        )
      );
      
      return {
        notifications,
        unreadCount: Number(unreadCount),
        pagination: {
          page,
          limit,
          totalNotifications: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
      };
    } catch (error) {
      console.error('[Notification] Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.update(userNotifications)
        .set({ 
          isRead: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userNotifications.id, notificationId),
            eq(userNotifications.userId, userId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('[Notification] Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(userId: number): Promise<boolean> {
    try {
      await db.update(userNotifications)
        .set({ 
          isRead: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userNotifications.userId, userId),
            eq(userNotifications.isRead, false)
          )
        );
      
      return true;
    } catch (error) {
      console.error('[Notification] Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId: number, communityId?: number) {
    try {
      let whereConditions = [eq(notificationPreferences.userId, userId)];
      
      if (communityId) {
        whereConditions.push(
          sql`(${notificationPreferences.communityId} IS NULL OR ${notificationPreferences.communityId} = ${communityId})`
        );
      }
      
      const preferences = await db.select()
        .from(notificationPreferences)
        .where(and(...whereConditions));
      
      return preferences;
    } catch (error) {
      console.error('[Notification] Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preference
   */
  async updateNotificationPreference(
    userId: number,
    preferenceData: {
      notificationType: string;
      channel: string;
      enabled: boolean;
      communityId?: number;
    }
  ): Promise<boolean> {
    try {
      // Check if preference exists
      const existingPreference = await db.select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.notificationType, preferenceData.notificationType),
            eq(notificationPreferences.channel, preferenceData.channel),
            preferenceData.communityId
              ? eq(notificationPreferences.communityId, preferenceData.communityId)
              : isNull(notificationPreferences.communityId)
          )
        )
        .limit(1);
      
      if (existingPreference.length > 0) {
        // Update existing preference
        await db.update(notificationPreferences)
          .set({ 
            enabled: preferenceData.enabled,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.id, existingPreference[0].id));
      } else {
        // Create new preference
        await db.insert(notificationPreferences)
          .values({
            userId,
            notificationType: preferenceData.notificationType,
            channel: preferenceData.channel,
            enabled: preferenceData.enabled,
            communityId: preferenceData.communityId || null,
          });
      }
      
      return true;
    } catch (error) {
      console.error('[Notification] Error updating notification preference:', error);
      throw error;
    }
  }

  /**
   * Process @mentions in content and create notifications
   */
  async processMentions(
    content: string,
    authorId: number,
    contentType: string,
    contentId: number,
    communityId: number
  ): Promise<void> {
    try {
      // Extract usernames from content (format: @username)
      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      const mentions = content.match(mentionRegex) || [];
      
      if (mentions.length === 0) {
        return;
      }
      
      const usernames = mentions.map(mention => mention.substring(1));
      
      // Get mentioned users
      const mentionedUsers = await db.select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(
        sql`${users.username} IN ${usernames}`
      );
      
      // Get community info
      const [community] = await db.select({
        name: communities.name,
      })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
      if (!community) {
        throw new Error('Community not found');
      }
      
      // Create notification for each mentioned user
      for (const user of mentionedUsers) {
        // Skip if author is mentioning themselves
        if (user.id === authorId) {
          continue;
        }
        
        let referenceType: string;
        let message: string;
        
        if (contentType === 'post') {
          referenceType = 'post';
          message = `You were mentioned in a post in ${community.name}`;
        } else if (contentType === 'comment') {
          referenceType = 'comment';
          message = `You were mentioned in a comment in ${community.name}`;
        } else {
          referenceType = contentType;
          message = `You were mentioned in ${community.name}`;
        }
        
        await this.createNotification({
          userId: user.id,
          type: 'mention',
          title: 'You were mentioned',
          message,
          referenceType,
          referenceId: contentId,
          communityId,
        });
      }
    } catch (error) {
      console.error('[Notification] Error processing mentions:', error);
      // Non-critical, continue without failing
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
```

#### Step 3: Notification API Endpoints
**Timestamp: April 25, 2025 - 3:00 PM ET**

```typescript
/**
 * [PKL-278651-COMM-0028-NOTIF] Community Notification API Routes
 * Implementation timestamp: 2025-04-25 15:00 ET
 * 
 * API endpoints for community notifications functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Follows API route patterns
 * - Clear error handling
 * - Proper authentication
 */
// Update server/routes/notification-routes.ts

import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { notificationService } from '../modules/community/notification-service';

const router = Router();

/**
 * GET /api/notifications
 * Get user's notifications
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    const notifications = await notificationService.getUserNotifications(
      userId,
      pageNum,
      limitNum
    );
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('[API] Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', isAuthenticated, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    
    await notificationService.markNotificationRead(notificationId, userId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post('/read-all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    await notificationService.markAllNotificationsRead(userId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences
 */
router.get('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { communityId } = req.query;
    
    const communityIdNum = communityId ? parseInt(communityId as string, 10) : undefined;
    
    const preferences = await notificationService.getNotificationPreferences(
      userId,
      communityIdNum
    );
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('[API] Error getting notification preferences:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

/**
 * POST /api/notifications/preferences
 * Update notification preference
 */
router.post('/preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { notificationType, channel, enabled, communityId } = req.body;
    
    if (!notificationType || !channel || enabled === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await notificationService.updateNotificationPreference(
      userId,
      {
        notificationType,
        channel,
        enabled,
        communityId: communityId ? parseInt(communityId, 10) : undefined,
      }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error updating notification preference:', error);
    res.status(500).json({ error: 'Failed to update notification preference' });
  }
});

export default router;
```

### Integration and Testing
**Timestamp: April 26-28, 2025**

During this phase, API endpoints will be tested, frontend components built, and comprehensive integration testing performed. These components include:

1. **Moderation**
   - Report content form
   - Moderation queue UI
   - Role management interfaces

2. **Notifications**
   - Notification bell with unread count
   - Notification center dropdown
   - Notification settings page

## Sprint 2: Enhanced Community Discovery
**Sprint ID: PKL-278651-COMM-0029-DISC**
**Start Date/Time: May 1, 2025 - 9:00 AM ET**
**End Date/Time: May 3, 2025 - 5:00 PM ET**

### Pre-Implementation Analysis
**Timestamp: April 20, 2025 - 10:00 AM ET**

#### Current State Assessment
The community discovery functionality exists but offers limited search and filtering capabilities. Users have no way to discover communities based on their interests or activity levels. Implementation will focus on:
1. Advanced search and filtering
2. Personalized recommendations
3. Trending communities display
4. Category-based browsing

### Implementation Plan

#### Step 1: Enhanced Search and Filtering
**Timestamp: May 1, 2025 - 9:00 AM ET**

The implementation will include advanced community search with:
- Full-text search across community names, descriptions, and tags
- Multi-faceted filtering (by location, skill level, activity, etc.)
- Sorting options (newest, most active, largest, etc.)
- Saved searches for registered users

#### Step 2: Recommendation Engine
**Timestamp: May 2, 2025 - 9:00 AM ET**

Implementation of a personalized recommendation system that suggests communities based on:
- User profile data (location, skill level, interests)
- Past activity and engagement patterns
- Community similarity algorithms
- Popular communities among the user's connections

#### Step 3: Category and Trending Display
**Timestamp: May 3, 2025 - 9:00 AM ET**

Creation of specialized discovery views:
- Category-based community browsing
- Trending communities section based on recent growth and activity
- Featured communities with editorial highlights
- New community showcase for recent additions

### Testing and Completion
**Timestamp: May 3, 2025 - 2:00 PM ET**

Final phase includes:
- User testing of discovery flows
- Performance optimization for search operations
- Edge-case handling for sparse/missing data
- Documentation for search algorithm and recommendation engine

## MVP Success Criteria
A successful Community MVP will be considered complete when:

1. **Core Features Work Seamlessly**
   - Post creation, viewing, and interaction is fully functional
   - Event creation, RSVPs, and management works smoothly
   - Moderation tools allow community governance
   - Notification system keeps users informed of activity
   - Community discovery helps users find relevant communities

2. **User Experience is Polished**
   - UI is responsive across devices
   - Interactions have appropriate feedback
   - Navigation is intuitive
   - Error states are handled gracefully

3. **Integration is Complete**
   - XP system awards points for community actions
   - User profiles show community involvement
   - Dashboard surfaces community activity

4. **Performance Standards are Met**
   - Page loads under 2 seconds
   - Search results returned in under 1 second
   - Notifications appear within 5 seconds of triggers

## Post-MVP Considerations

After completing the MVP, these enhancements should be considered for future sprints:

1. **Community Analytics Dashboard**
   - Provide insights for community administrators
   - Track growth, engagement, and retention metrics
   - Identify high-value content and members

2. **Advanced Moderation Tools**
   - Automated content filtering
   - Graduated moderation actions
   - Appeal workflows

3. **Community Challenges**
   - Time-limited competitive events within communities
   - Achievement badges for community participation
   - Leaderboards specific to each community

4. **Groups Within Communities**
   - Sub-groups for specific interests or skill levels
   - Group-specific content and events
   - Private communication channels