/**
 * Communication Preferences Service
 * Handles user notification preferences and communication channels
 */

import { db } from "../../../db";
import { storage } from "../../../storage";
import { EventBus } from "../../../core/events/event-bus";
import {
  userNotificationPreferences,
  communicationChannels,
  type UserNotificationPreference,
  type InsertUserNotificationPreference,
  type CommunicationChannel,
  type InsertCommunicationChannel
} from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export class CommunicationPreferencesService {
  constructor(private eventBus: EventBus) {}

  /**
   * Get all notification preferences for a user
   */
  async getUserNotificationPreferences(userId: number): Promise<UserNotificationPreference[]> {
    return await db.select().from(userNotificationPreferences).where(eq(userNotificationPreferences.userId, userId));
  }

  /**
   * Get a specific notification preference
   */
  async getNotificationPreference(id: number): Promise<UserNotificationPreference | undefined> {
    const [preference] = await db.select().from(userNotificationPreferences).where(eq(userNotificationPreferences.id, id));
    return preference;
  }

  /**
   * Create a new notification preference
   */
  async createUserNotificationPreference(data: InsertUserNotificationPreference): Promise<UserNotificationPreference> {
    const [preference] = await db.insert(userNotificationPreferences).values(data).returning();
    
    this.eventBus.emit('notification.preference.created', preference);
    
    return preference;
  }

  /**
   * Update an existing notification preference
   */
  async updateUserNotificationPreference(id: number, data: Partial<InsertUserNotificationPreference>): Promise<UserNotificationPreference> {
    const [updatedPreference] = await db.update(userNotificationPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userNotificationPreferences.id, id))
      .returning();
    
    this.eventBus.emit('notification.preference.updated', updatedPreference);
    
    return updatedPreference;
  }

  /**
   * Delete a notification preference
   */
  async deleteUserNotificationPreference(id: number): Promise<boolean> {
    const result = await db.delete(userNotificationPreferences).where(eq(userNotificationPreferences.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Get all communication channels for a user
   */
  async getUserCommunicationChannels(userId: number): Promise<CommunicationChannel[]> {
    return await db.select().from(communicationChannels).where(eq(communicationChannels.userId, userId));
  }

  /**
   * Get a specific communication channel
   */
  async getCommunicationChannel(id: number): Promise<CommunicationChannel | undefined> {
    const [channel] = await db.select().from(communicationChannels).where(eq(communicationChannels.id, id));
    return channel;
  }

  /**
   * Add a new communication channel
   */
  async addCommunicationChannel(data: InsertCommunicationChannel): Promise<CommunicationChannel> {
    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    const [channel] = await db.insert(communicationChannels).values({
      ...data,
      isVerified: false,
      isActive: true,
      verificationCode,
      verificationSentAt: new Date()
    }).returning();
    
    this.eventBus.emit('communication.channel.added', channel);
    
    // Check if this is the first channel of this type, if so make it primary
    const userChannels = await this.getUserCommunicationChannels(data.userId);
    const channelsOfType = userChannels.filter(c => c.channelType === data.channelType);
    
    if (channelsOfType.length === 1) {
      await this.updateCommunicationChannel(channel.id, { isPrimary: true });
    }
    
    // TODO: implement actual sending of verification code
    // For now the event emitted above would be consumed by a notification service
    
    return channel;
  }

  /**
   * Update an existing communication channel
   */
  async updateCommunicationChannel(id: number, data: Partial<InsertCommunicationChannel>): Promise<CommunicationChannel> {
    const existingChannel = await this.getCommunicationChannel(id);
    
    if (!existingChannel) {
      throw new Error("Channel not found");
    }
    
    // If identifier is changing, require re-verification
    const needsVerification = data.identifier && data.identifier !== existingChannel.identifier;
    
    // Generate new verification code if needed
    const verificationCode = needsVerification ? crypto.randomBytes(3).toString('hex').toUpperCase() : undefined;
    
    const [updatedChannel] = await db.update(communicationChannels)
      .set({
        ...data,
        updatedAt: new Date(),
        ...(needsVerification && {
          isVerified: false,
          verificationCode,
          verificationSentAt: new Date()
        })
      })
      .where(eq(communicationChannels.id, id))
      .returning();
    
    this.eventBus.emit('communication.channel.updated', updatedChannel);
    
    // If making this channel primary, update other channels of same type to non-primary
    if (data.isPrimary) {
      await db.update(communicationChannels)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(communicationChannels.userId, existingChannel.userId))
        .where(eq(communicationChannels.channelType, existingChannel.channelType))
        .where(eq(communicationChannels.id, id).invert());
    }
    
    return updatedChannel;
  }

  /**
   * Deactivate a communication channel (soft delete)
   */
  async deactivateCommunicationChannel(id: number): Promise<boolean> {
    const [channel] = await db.update(communicationChannels)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(communicationChannels.id, id))
      .returning();
    
    if (channel) {
      this.eventBus.emit('communication.channel.deactivated', channel);
      
      // If this was primary, make another active channel primary
      if (channel.isPrimary) {
        const activeChannels = await db.select().from(communicationChannels)
          .where(eq(communicationChannels.userId, channel.userId))
          .where(eq(communicationChannels.channelType, channel.channelType))
          .where(eq(communicationChannels.isActive, true));
        
        if (activeChannels.length > 0) {
          await this.updateCommunicationChannel(activeChannels[0].id, { isPrimary: true });
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Verify a communication channel
   */
  async verifyCommunicationChannel(id: number, code: string): Promise<boolean> {
    const channel = await this.getCommunicationChannel(id);
    
    if (!channel || channel.isVerified) {
      return false;
    }
    
    if (channel.verificationCode !== code) {
      return false;
    }
    
    const [updatedChannel] = await db.update(communicationChannels)
      .set({ isVerified: true, verificationCode: null, updatedAt: new Date() })
      .where(eq(communicationChannels.id, id))
      .returning();
    
    this.eventBus.emit('communication.channel.verified', updatedChannel);
    
    return true;
  }
}

// Factory function to create the service
let service: CommunicationPreferencesService | null = null;

export function getCommunicationPreferencesService(eventBus: EventBus): CommunicationPreferencesService {
  if (!service) {
    service = new CommunicationPreferencesService(eventBus);
  }
  return service;
}