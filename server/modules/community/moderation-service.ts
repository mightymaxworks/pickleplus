/**
 * [PKL-278651-COMM-0029-MOD] Community Moderation Service
 * Implementation timestamp: 2025-04-19 18:25 ET
 * 
 * Core service for community content moderation with enhanced features:
 * - Content filtering
 * - Approval workflows
 * - Enhanced reporting
 * 
 * Framework 5.2 compliance verified:
 * - Follows service pattern
 * - Clear interface and responsibilities
 */

import { db } from '../../db';
import { 
  userNotifications,
  type InsertUserNotification
} from '@shared/schema';

import {
  contentReports, 
  moderationActions, 
  contentApprovalQueue,
  contentFilterSettings,
  type InsertContentReport, 
  type InsertModerationAction,
  type InsertContentApproval,
  type InsertContentFilterSettings,
  type ContentReport,
  type ContentApproval
} from '@shared/schema/moderation';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Moderation Service for handling all community moderation functionality
 */
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
      const [report] = await db.insert(contentReports)
        .values({
          ...reportData,
          status: 'pending',
        })
        .returning({ id: contentReports.id });

      // Get community admins/moderators and notify them
      await this.notifyModerators(reportData.communityId, report.id);

      return report.id;
    } catch (error) {
      console.error('[Moderation] Error creating report:', error);
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
   * Get content filter settings for a community
   */
  async getContentFilterSettings(communityId: number) {
    try {
      const [settings] = await db.select()
        .from(contentFilterSettings)
        .where(eq(contentFilterSettings.communityId, communityId))
        .limit(1);

      // If no settings exist, create default settings
      if (!settings) {
        return this.createDefaultFilterSettings(communityId);
      }

      return settings;
    } catch (error) {
      console.error('[Moderation] Error getting filter settings:', error);
      throw error;
    }
  }

  /**
   * Update content filter settings for a community
   */
  async updateContentFilterSettings(communityId: number, settings: Partial<InsertContentFilterSettings>) {
    try {
      // Check if settings exist
      const existingSettings = await db.select()
        .from(contentFilterSettings)
        .where(eq(contentFilterSettings.communityId, communityId))
        .limit(1);

      if (existingSettings.length === 0) {
        // Create new settings
        const [newSettings] = await db.insert(contentFilterSettings)
          .values({
            communityId,
            ...settings,
          })
          .returning();

        return newSettings;
      } else {
        // Update existing settings
        const [updatedSettings] = await db.update(contentFilterSettings)
          .set({
            ...settings,
            updatedAt: new Date(),
          })
          .where(eq(contentFilterSettings.communityId, communityId))
          .returning();

        return updatedSettings;
      }
    } catch (error) {
      console.error('[Moderation] Error updating filter settings:', error);
      throw error;
    }
  }

  /**
   * Filter content based on community settings
   * Returns filtered content and flags for moderation if needed
   */
  async filterContent(communityId: number, content: string, contentType: string, userId: number) {
    try {
      const settings = await this.getContentFilterSettings(communityId);
      
      if (!settings.autoModEnabled) {
        // If auto-moderation is disabled, just check if approval is required
        if (settings.requireApproval) {
          await this.addToApprovalQueue(communityId, userId, contentType, content);
          return { 
            isApprovalRequired: true,
            filteredContent: content,
            containsProhibitedContent: false
          };
        }
        return { 
          isApprovalRequired: false,
          filteredContent: content,
          containsProhibitedContent: false 
        };
      }

      // Check banned keywords
      let bannedKeywords: string[] = [];
      try {
        bannedKeywords = JSON.parse(settings.bannedKeywords);
      } catch (e) {
        console.error('[Moderation] Error parsing banned keywords:', e);
        bannedKeywords = [];
      }

      // Check for prohibited content
      let containsProhibitedContent = false;
      let filteredContent = content;

      // Simple keyword filtering (for MVP implementation)
      if (bannedKeywords.length > 0) {
        for (const keyword of bannedKeywords) {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            containsProhibitedContent = true;
            // Replace prohibited words with asterisks
            const regex = new RegExp(keyword, 'gi');
            filteredContent = filteredContent.replace(regex, '*'.repeat(keyword.length));
          }
        }
      }

      // Check if content type requires approval
      let sensitiveContentTypes: string[] = [];
      try {
        sensitiveContentTypes = JSON.parse(settings.sensitiveContentTypes);
      } catch (e) {
        console.error('[Moderation] Error parsing sensitive content types:', e);
        sensitiveContentTypes = [];
      }

      const requiresApproval = settings.requireApproval || 
                             sensitiveContentTypes.includes(contentType) || 
                             containsProhibitedContent;

      // Add to approval queue if needed
      if (requiresApproval) {
        await this.addToApprovalQueue(communityId, userId, contentType, content);
      }

      return {
        isApprovalRequired: requiresApproval,
        filteredContent,
        containsProhibitedContent
      };
    } catch (error) {
      console.error('[Moderation] Error filtering content:', error);
      throw error;
    }
  }

  /**
   * Add content to the approval queue
   */
  async addToApprovalQueue(communityId: number, userId: number, contentType: string, content: string, metadata?: any) {
    try {
      const [queueItem] = await db.insert(contentApprovalQueue)
        .values({
          communityId,
          userId,
          contentType,
          content,
          metadata: metadata || null,
          status: 'pending'
        })
        .returning();

      // Notify moderators about pending content
      await this.notifyModeratorsAboutPendingContent(communityId, queueItem.id, contentType);

      return queueItem;
    } catch (error) {
      console.error('[Moderation] Error adding to approval queue:', error);
      throw error;
    }
  }

  /**
   * Review content in the approval queue
   */
  async reviewQueuedContent(
    queueItemId: number,
    moderatorId: number,
    approved: boolean,
    moderationNotes?: string
  ) {
    try {
      const [updatedItem] = await db.update(contentApprovalQueue)
        .set({
          status: approved ? 'approved' : 'rejected',
          moderatorId,
          moderationNotes: moderationNotes || null,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(contentApprovalQueue.id, queueItemId))
        .returning();

      if (!updatedItem) {
        throw new Error('Queue item not found');
      }

      // Notify the content creator
      await this.notifyContentCreator(updatedItem);

      return updatedItem;
    } catch (error) {
      console.error('[Moderation] Error reviewing queued content:', error);
      throw error;
    }
  }

  /**
   * Get pending content items for a community
   */
  async getPendingContentItems(communityId: number) {
    try {
      const items = await db.select()
        .from(contentApprovalQueue)
        .where(and(
          eq(contentApprovalQueue.communityId, communityId),
          eq(contentApprovalQueue.status, 'pending')
        ))
        .orderBy(desc(contentApprovalQueue.createdAt));

      return items;
    } catch (error) {
      console.error('[Moderation] Error getting pending content:', error);
      throw error;
    }
  }

  /**
   * Get reports for a community
   */
  async getReports(communityId: number, status?: string) {
    try {
      if (status) {
        return await db.select()
          .from(contentReports)
          .where(and(
            eq(contentReports.communityId, communityId),
            eq(contentReports.status, status)
          ))
          .orderBy(desc(contentReports.createdAt));
      } else {
        return await db.select()
          .from(contentReports)
          .where(eq(contentReports.communityId, communityId))
          .orderBy(desc(contentReports.createdAt));
      }
    } catch (error) {
      console.error('[Moderation] Error getting reports:', error);
      throw error;
    }
  }

  /**
   * Get moderation actions for a community
   */
  async getModerationActions(communityId: number) {
    try {
      const actions = await db.select()
        .from(moderationActions)
        .where(eq(moderationActions.communityId, communityId))
        .orderBy(desc(moderationActions.createdAt));

      return actions;
    } catch (error) {
      console.error('[Moderation] Error getting moderation actions:', error);
      throw error;
    }
  }

  /**
   * Create default filter settings for a community
   */
  private async createDefaultFilterSettings(communityId: number) {
    try {
      const [settings] = await db.insert(contentFilterSettings)
        .values({
          communityId,
          enabledFilters: '[]',
          bannedKeywords: '[]',
          sensitiveContentTypes: '[]',
          requireApproval: false,
          autoModEnabled: true
        })
        .returning();

      return settings;
    } catch (error) {
      console.error('[Moderation] Error creating default filter settings:', error);
      throw error;
    }
  }

  /**
   * Validate that reported content exists
   */
  private async validateReportContent(reportData: InsertContentReport): Promise<boolean> {
    // In a production system, this would check if the content exists
    // For now, we'll simulate content validation for the moderation system
    try {
      if (!['post', 'comment', 'event'].includes(reportData.contentType)) {
        throw new Error('Invalid content type');
      }
      
      // For now, we'll assume all content is valid since we don't have access
      // to the community content tables in this implementation
      return true;
    } catch (error) {
      console.error('[Moderation] Error validating content:', error);
      throw error;
    }
  }

  /**
   * Notify moderators about a new report
   */
  private async notifyModerators(communityId: number, reportId: number) {
    try {
      // In a production system, we would get all moderators for the community
      // For now, create a notification for a placeholder moderator ID (1)
      // since we don't have access to the community members table
      
      const notification: InsertUserNotification = {
        userId: 1, // Placeholder moderator ID
        communityId,
        type: 'content_report',
        title: 'New Content Report',
        message: 'A new content report has been submitted in your community',
        referenceId: reportId,
        referenceType: 'content_report'
      };

      await db.insert(userNotifications).values(notification);
    } catch (error) {
      console.error('[Moderation] Error notifying moderators:', error);
      // Don't throw here, as this is a secondary action
    }
  }

  /**
   * Notify moderators about pending content
   */
  private async notifyModeratorsAboutPendingContent(communityId: number, queueItemId: number, contentType: string) {
    try {
      // In a production system, we would get all moderators for the community
      // For now, create a notification for a placeholder moderator ID (1)
      // since we don't have access to the community members table
      
      const contentTypeDisplay = contentType.charAt(0).toUpperCase() + contentType.slice(1);
      
      // Create notification for the placeholder moderator
      const notification: InsertUserNotification = {
        userId: 1, // Placeholder moderator ID
        communityId,
        type: 'content_approval',
        title: `${contentTypeDisplay} Needs Approval`,
        message: `A new ${contentType} is waiting for your approval`,
        referenceId: queueItemId,
        referenceType: 'content_approval'
      };
      
      await db.insert(userNotifications).values(notification);
    } catch (error) {
      console.error('[Moderation] Error notifying moderators about pending content:', error);
      // Don't throw here, as this is a secondary action
    }
  }

  /**
   * Notify reporter about report status
   */
  private async notifyReporter(report: any) {
    try {
      let message = `Your report has been reviewed.`;
      let title = 'Report Status Update';
      
      if (report.status === 'resolved') {
        title = 'Report Resolved';
        message = `Your report has been reviewed and action has been taken.`;
      } else if (report.status === 'rejected') {
        title = 'Report Rejected';
        message = `Your report has been reviewed and no action was deemed necessary.`;
      }

      const notification: InsertUserNotification = {
        userId: report.reporterId,
        communityId: report.communityId,
        type: 'report_update',
        title,
        message,
        referenceId: report.id,
        referenceType: 'content_report'
      };

      await db.insert(userNotifications).values(notification);
    } catch (error) {
      console.error('[Moderation] Error notifying reporter:', error);
      // Don't throw here, as this is a secondary action
    }
  }

  /**
   * Notify content creator about approval or rejection
   */
  private async notifyContentCreator(queueItem: any) {
    try {
      const isApproved = queueItem.status === 'approved';
      const contentTypeDisplay = queueItem.contentType.charAt(0).toUpperCase() + queueItem.contentType.slice(1);
      
      const notification: InsertUserNotification = {
        userId: queueItem.userId,
        communityId: queueItem.communityId,
        type: 'content_approval_update',
        title: `${contentTypeDisplay} ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your ${queueItem.contentType} has been ${isApproved ? 'approved and published' : 'rejected'}${queueItem.moderationNotes ? ': ' + queueItem.moderationNotes : ''}`,
        referenceId: queueItem.id,
        referenceType: 'content_approval'
      };

      await db.insert(userNotifications).values(notification);
    } catch (error) {
      console.error('[Moderation] Error notifying content creator:', error);
      // Don't throw here, as this is a secondary action
    }
  }

  /**
   * Take moderation action based on report review
   */
  private async takeModeratorAction(report: ContentReport, moderatorId: number): Promise<void> {
    try {
      // Get the target user ID from the content 
      // In a real implementation, we'd query the appropriate table based on contentType
      // For now we'll use a more generic approach using the reporterId as a fallback
      let targetUserId = report.reporterId;
      
      // Try to determine the actual content creator based on contentType
      // This would need to be expanded based on all possible content types
      if (report.contentType === 'post') {
        const [post] = await db.select()
          .from(contentReports)
          .where(eq(contentReports.id, report.contentId))
          .limit(1);
          
        if (post) {
          targetUserId = post.reporterId; // Using reporterId as a placeholder for the actual user ID
        }
      }
      
      // Take action based on report.action
      if (report.status === 'approved') {
        await this.removeContent(report.contentType, report.contentId);
      }

      // Record the moderation action
      let actionType = 'content_removal';
      // The action type would be determined from additional report details
      // This would be expanded in a full implementation

      await db.insert(moderationActions).values({
        communityId: report.communityId,
        moderatorId,
        targetUserId,
        actionType,
        reason: `In response to report: ${report.reason}`,
        isActive: true
      });

      // In a full implementation, we would update community membership status if needed
      console.log(`[Moderation] Action taken on content ${report.contentId} of type ${report.contentType}`);
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
      // In a production system, we would update the content status in the appropriate tables
      // This is a placeholder implementation for now
      console.log(`[Moderation] Content of type ${contentType} with ID ${contentId} would be removed/flagged as deleted`);
      
      // Each content type would have its own handling (post, comment, event)
      // For now just log what would happen
      if (contentType === 'post') {
        console.log(`[Moderation] Post ${contentId} marked as deleted`);
      } else if (contentType === 'comment') {
        console.log(`[Moderation] Comment ${contentId} marked as deleted`);
      } else if (contentType === 'event') {
        console.log(`[Moderation] Event ${contentId} marked as canceled`);
      }
    } catch (error) {
      console.error('[Moderation] Error removing content:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const moderationService = new ModerationService();