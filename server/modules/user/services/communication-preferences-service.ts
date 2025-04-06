import { db } from "../../../db";
import { EventBus } from "../../../core/events/event-bus";
import {
  UserNotificationPreference,
  CommunicationChannel,
  CommunicationLog,
  communicationChannels,
  userNotificationPreferences,
  communicationLogs,
  notificationTemplates,
  NotificationTemplate,
  insertCommunicationChannelSchema,
  insertUserNotificationPreferenceSchema,
  insertNotificationTemplateSchema,
  insertCommunicationLogSchema
} from "../../../../shared/schema";
import { eq, and, desc, gte, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";

/**
 * Service for managing user communication preferences, notification templates,
 * and communication channels
 */
export class CommunicationPreferencesService {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.registerEventHandlers();
  }

  /**
   * Register event handlers for relevant events
   */
  private registerEventHandlers() {
    this.eventBus.subscribe("user.registered", async (data) => {
      await this.initializeUserDefaultPreferences(data.userId);
    });

    this.eventBus.subscribe("notification.send", async (data) => {
      await this.queueNotification(data.userId, data.templateKey, data.templateData);
    });
  }

  /**
   * Initialize default notification preferences for a new user
   */
  async initializeUserDefaultPreferences(userId: number): Promise<void> {
    // Define the default categories for notifications
    const defaultCategories = [
      {
        category: "match",
        subcategory: "invitation",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "match",
        subcategory: "result",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "tournament",
        subcategory: "registration",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "tournament",
        subcategory: "reminder",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: true,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "social",
        subcategory: "connection_request",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: false,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "achievement",
        subcategory: "unlocked",
        enabled: true,
        channelPreferences: {
          email: false,
          sms: false,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "system",
        subcategory: "announcements",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: false,
          push: false,
          inApp: true
        },
        frequency: "immediate"
      },
      {
        category: "coaching",
        subcategory: "session_reminder",
        enabled: true,
        channelPreferences: {
          email: true,
          sms: true,
          push: true,
          inApp: true
        },
        frequency: "immediate"
      }
    ];

    // Insert default preferences for each category
    for (const pref of defaultCategories) {
      await db.insert(userNotificationPreferences).values({
        userId,
        category: pref.category,
        subcategory: pref.subcategory,
        enabled: pref.enabled,
        channelPreferences: pref.channelPreferences,
        frequency: pref.frequency
      });
    }

    // Publish an event that default preferences have been set
    this.eventBus.publish("user.preferences.initialized", { userId });
  }

  /**
   * Get all notification preferences for a user
   */
  async getUserNotificationPreferences(userId: number): Promise<UserNotificationPreference[]> {
    return await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
  }

  /**
   * Get a specific notification preference by category and subcategory
   */
  async getUserNotificationPreferenceByCategory(
    userId: number,
    category: string,
    subcategory?: string
  ): Promise<UserNotificationPreference | undefined> {
    const query = subcategory
      ? and(
          eq(userNotificationPreferences.userId, userId),
          eq(userNotificationPreferences.category, category),
          eq(userNotificationPreferences.subcategory, subcategory)
        )
      : and(
          eq(userNotificationPreferences.userId, userId),
          eq(userNotificationPreferences.category, category)
        );

    const results = await db
      .select()
      .from(userNotificationPreferences)
      .where(query);

    return results[0];
  }

  /**
   * Update a user notification preference
   */
  async updateUserNotificationPreference(
    id: number,
    data: Partial<z.infer<typeof insertUserNotificationPreferenceSchema>>
  ): Promise<UserNotificationPreference | undefined> {
    const [updated] = await db
      .update(userNotificationPreferences)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(userNotificationPreferences.id, id))
      .returning();
    
    if (updated) {
      this.eventBus.publish("user.preferences.updated", {
        userId: updated.userId,
        preferenceId: updated.id,
        category: updated.category
      });
    }
    
    return updated;
  }

  /**
   * Create a new user notification preference
   */
  async createUserNotificationPreference(
    data: z.infer<typeof insertUserNotificationPreferenceSchema>
  ): Promise<UserNotificationPreference> {
    const [newPreference] = await db
      .insert(userNotificationPreferences)
      .values(data)
      .returning();
    
    this.eventBus.publish("user.preferences.created", {
      userId: newPreference.userId,
      preferenceId: newPreference.id,
      category: newPreference.category
    });
    
    return newPreference;
  }

  /**
   * Add a communication channel for a user (email, SMS, etc.)
   */
  async addCommunicationChannel(
    data: z.infer<typeof insertCommunicationChannelSchema>
  ): Promise<CommunicationChannel> {
    // If the new channel is marked as primary, unset the primary flag for any other
    // channel of the same type
    if (data.isPrimary) {
      await db
        .update(communicationChannels)
        .set({ isPrimary: false })
        .where(
          and(
            eq(communicationChannels.userId, data.userId),
            eq(communicationChannels.channelType, data.channelType)
          )
        );
    }

    const [newChannel] = await db.insert(communicationChannels).values(data).returning();
    
    this.eventBus.publish("user.channel.added", {
      userId: newChannel.userId,
      channelId: newChannel.id,
      channelType: newChannel.channelType
    });
    
    return newChannel;
  }

  /**
   * Get all communication channels for a user
   */
  async getUserCommunicationChannels(userId: number): Promise<CommunicationChannel[]> {
    return await db
      .select()
      .from(communicationChannels)
      .where(eq(communicationChannels.userId, userId));
  }

  /**
   * Get all active communication channels of a certain type for a user
   */
  async getUserCommunicationChannelsByType(
    userId: number,
    channelType: string
  ): Promise<CommunicationChannel[]> {
    return await db
      .select()
      .from(communicationChannels)
      .where(
        and(
          eq(communicationChannels.userId, userId),
          eq(communicationChannels.channelType, channelType),
          eq(communicationChannels.isActive, true)
        )
      );
  }

  /**
   * Verify a communication channel (mark as verified)
   */
  async verifyCommunicationChannel(
    channelId: number,
    verificationCode: string
  ): Promise<boolean> {
    const channel = await db
      .select()
      .from(communicationChannels)
      .where(eq(communicationChannels.id, channelId));

    if (!channel.length || channel[0].verificationCode !== verificationCode) {
      return false;
    }

    await db
      .update(communicationChannels)
      .set({
        isVerified: true,
        verificationCode: null,
        updatedAt: new Date()
      })
      .where(eq(communicationChannels.id, channelId));

    this.eventBus.publish("user.channel.verified", {
      userId: channel[0].userId,
      channelId,
      channelType: channel[0].channelType
    });

    return true;
  }

  /**
   * Update a communication channel
   */
  async updateCommunicationChannel(
    channelId: number,
    data: Partial<z.infer<typeof insertCommunicationChannelSchema>>
  ): Promise<CommunicationChannel | undefined> {
    // If setting a channel as primary, unset all other channels of the same type
    if (data.isPrimary) {
      const channel = await db
        .select()
        .from(communicationChannels)
        .where(eq(communicationChannels.id, channelId));

      if (channel.length) {
        await db
          .update(communicationChannels)
          .set({ isPrimary: false })
          .where(
            and(
              eq(communicationChannels.userId, channel[0].userId),
              eq(communicationChannels.channelType, channel[0].channelType),
              eq(communicationChannels.id, channelId).not()
            )
          );
      }
    }

    const [updated] = await db
      .update(communicationChannels)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(communicationChannels.id, channelId))
      .returning();

    if (updated) {
      this.eventBus.publish("user.channel.updated", {
        userId: updated.userId,
        channelId,
        channelType: updated.channelType
      });
    }

    return updated;
  }

  /**
   * Deactivate a communication channel
   */
  async deactivateCommunicationChannel(channelId: number): Promise<boolean> {
    const [updated] = await db
      .update(communicationChannels)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(communicationChannels.id, channelId))
      .returning();

    if (updated) {
      this.eventBus.publish("user.channel.deactivated", {
        userId: updated.userId,
        channelId,
        channelType: updated.channelType
      });
    }

    return !!updated;
  }

  /**
   * Create a new notification template
   */
  async createNotificationTemplate(
    data: z.infer<typeof insertNotificationTemplateSchema>
  ): Promise<NotificationTemplate> {
    const [newTemplate] = await db.insert(notificationTemplates).values(data).returning();
    
    this.eventBus.publish("notification.template.created", {
      templateId: newTemplate.id,
      templateKey: newTemplate.templateKey
    });
    
    return newTemplate;
  }

  /**
   * Get a notification template by its key
   */
  async getNotificationTemplateByKey(templateKey: string): Promise<NotificationTemplate | undefined> {
    const templates = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.templateKey, templateKey));
    
    return templates[0];
  }

  /**
   * Get all notification templates for a specific channel and category
   */
  async getNotificationTemplatesByChannelAndCategory(
    channelType: string,
    category: string
  ): Promise<NotificationTemplate[]> {
    return await db
      .select()
      .from(notificationTemplates)
      .where(
        and(
          eq(notificationTemplates.channelType, channelType),
          eq(notificationTemplates.category, category),
          eq(notificationTemplates.isActive, true)
        )
      );
  }

  /**
   * Update a notification template
   */
  async updateNotificationTemplate(
    templateId: number,
    data: Partial<z.infer<typeof insertNotificationTemplateSchema>>
  ): Promise<NotificationTemplate | undefined> {
    const [updated] = await db
      .update(notificationTemplates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(notificationTemplates.id, templateId))
      .returning();

    if (updated) {
      this.eventBus.publish("notification.template.updated", {
        templateId,
        templateKey: updated.templateKey
      });
    }

    return updated;
  }

  /**
   * Queue a notification for sending based on a template and user preferences
   */
  async queueNotification(
    userId: number,
    templateKey: string,
    templateData: Record<string, any>
  ): Promise<CommunicationLog[]> {
    // Get the notification template
    const template = await this.getNotificationTemplateByKey(templateKey);
    if (!template) {
      throw new Error(`Notification template not found for key: ${templateKey}`);
    }

    // Get user preferences for this category
    const preference = await this.getUserNotificationPreferenceByCategory(
      userId,
      template.category
    );

    // If preference doesn't exist or notifications are disabled, don't send
    if (!preference || !preference.enabled) {
      return [];
    }

    // Check if within quiet hours
    const isQuietHours = this.isWithinQuietHours(
      preference.quietHoursStart,
      preference.quietHoursEnd
    );

    // For immediate notifications, send now unless in quiet hours
    // For digest notifications, we'll just log them and they'll be picked up
    // by the digest process later
    if (preference.frequency === "immediate" && !isQuietHours) {
      // Get active channels for this user based on preferences
      const channelPrefs = preference.channelPreferences as Record<string, boolean>;
      const logs: CommunicationLog[] = [];

      // For each enabled channel type in preferences
      for (const [channelType, enabled] of Object.entries(channelPrefs)) {
        if (!enabled) continue;

        // Get the user's active channels of this type
        const userChannels = await this.getUserCommunicationChannelsByType(
          userId,
          channelType
        );

        // Skip if no active channels of this type
        if (!userChannels.length) continue;

        // Default to the primary channel if available, otherwise use the first one
        const primaryChannel = userChannels.find((c) => c.isPrimary) || userChannels[0];

        // Process and prepare message
        const messageData = this.processTemplateWithData(template, templateData);

        // Create a log entry for this notification
        const [log] = await db
          .insert(communicationLogs)
          .values({
            userId,
            templateId: template.id,
            channelType,
            channelId: primaryChannel.id,
            messageData,
            status: "pending"
          })
          .returning();

        logs.push(log);

        // Publish an event for each channel to be handled by the appropriate sender
        this.eventBus.publish(`notification.send.${channelType}`, {
          logId: log.id,
          userId,
          channelId: primaryChannel.id,
          messageData,
          identifier: primaryChannel.identifier
        });
      }

      return logs;
    }

    // For other frequencies or during quiet hours, just create a log entry
    // to be processed by the digest job
    const [log] = await db
      .insert(communicationLogs)
      .values({
        userId,
        templateId: template.id,
        channelType: "digest",
        status: "pending",
        messageData: templateData
      })
      .returning();

    return [log];
  }

  /**
   * Process a template with provided data to create message
   */
  private processTemplateWithData(
    template: NotificationTemplate,
    data: Record<string, any>
  ): Record<string, any> {
    let title = template.title;
    let body = template.body;

    // Replace variables in the template with data values
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      title = title.replace(regex, String(value));
      body = body.replace(regex, String(value));
    }

    return {
      title,
      body,
      originalData: data
    };
  }

  /**
   * Check if current time is within quiet hours
   */
  private isWithinQuietHours(
    startHour: number | null,
    endHour: number | null
  ): boolean {
    if (startHour === null || endHour === null) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();

    if (startHour <= endHour) {
      // Simple range (e.g., 22:00 - 06:00)
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // Overnight range (e.g., 22:00 - 06:00)
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  /**
   * Update the status of a communication log
   */
  async updateCommunicationLogStatus(
    logId: number,
    status: string,
    metadata?: Record<string, any>
  ): Promise<CommunicationLog | undefined> {
    let updateData: any = { status };

    if (status === "delivered") {
      // Do nothing, delivered is just a status
    } else if (status === "opened") {
      updateData.openedAt = new Date();
    } else if (status === "clicked") {
      updateData.clickedAt = new Date();
    } else if (status === "failed") {
      updateData.failureReason = metadata?.reason || "Unknown error";
    }

    if (metadata?.externalId) {
      updateData.externalId = metadata.externalId;
    }

    const [updated] = await db
      .update(communicationLogs)
      .set(updateData)
      .where(eq(communicationLogs.id, logId))
      .returning();

    return updated;
  }

  /**
   * Get communication logs for a user
   */
  async getUserCommunicationLogs(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<CommunicationLog[]> {
    return await db
      .select()
      .from(communicationLogs)
      .where(eq(communicationLogs.userId, userId))
      .orderBy(desc(communicationLogs.sentAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get communication logs for preparing digest emails
   */
  async getDigestCommunicationLogs(
    frequency: string,
    limit: number = 100
  ): Promise<CommunicationLog[]> {
    // Find users with this digest frequency preference
    const userPreferences = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.frequency, frequency))
      .groupBy(userNotificationPreferences.userId);

    const userIds = userPreferences.map(p => p.userId);
    
    if (userIds.length === 0) {
      return [];
    }

    // Get pending logs for these users
    return await db
      .select()
      .from(communicationLogs)
      .where(
        and(
          eq(communicationLogs.status, "pending"),
          eq(communicationLogs.channelType, "digest"),
          // Include logs for users who have this digest frequency
          userIds.map(id => eq(communicationLogs.userId, id)).reduce((a, b) => or(a, b))
        )
      )
      .limit(limit);
  }
}

// Singleton instance
let communicationPreferencesService: CommunicationPreferencesService;

export function getCommunicationPreferencesService(eventBus: EventBus): CommunicationPreferencesService {
  if (!communicationPreferencesService) {
    communicationPreferencesService = new CommunicationPreferencesService(eventBus);
  }
  return communicationPreferencesService;
}