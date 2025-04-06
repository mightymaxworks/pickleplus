import { User } from "@shared/schema";
import { db } from "../../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../../../storage";

/**
 * Interface for the Privacy Service
 */
export interface IPrivacyService {
  /**
   * Check if specific content is visible to a viewer based on privacy settings
   */
  isContentVisibleToUser(contentOwner: User, viewer: User | null, contentType: string): Promise<boolean>;
  
  /**
   * Update user's privacy settings
   */
  updatePrivacySettings(userId: number, settings: any): Promise<User | undefined>;
  
  /**
   * Update user's communication preferences
   */
  updateCommunicationPreferences(userId: number, preferences: any): Promise<User | undefined>;
  
  /**
   * Get user's privacy settings
   */
  getPrivacySettings(userId: number): Promise<any>;
  
  /**
   * Get user's communication preferences
   */
  getCommunicationPreferences(userId: number): Promise<any>;
}

/**
 * Service for managing user privacy and communication settings
 */
export class PrivacyService implements IPrivacyService {
  /**
   * Check if specific content is visible to a viewer based on privacy settings
   */
  async isContentVisibleToUser(contentOwner: User, viewer: User | null, contentType: string): Promise<boolean> {
    // Default to profile visibility if specific content type not found
    const defaultVisibility = 'public';
    const privacySettings = contentOwner.privacySettings || {};
    
    const settingKey = `${contentType}Visibility`;
    // Safely access properties that might not exist
    const profileVisibilitySetting = privacySettings && 'profileVisibility' in privacySettings 
      ? (privacySettings as any).profileVisibility 
      : defaultVisibility;
    
    const contentVisibilitySetting = privacySettings && settingKey in privacySettings
      ? (privacySettings as any)[settingKey]
      : null;
      
    const visibilitySetting = contentVisibilitySetting || profileVisibilitySetting || defaultVisibility;
    
    if (visibilitySetting === 'public') return true;
    if (!viewer) return false; // Not logged in
    if (contentOwner.id === viewer.id) return true; // Owner can always see own content
    if (visibilitySetting === 'private') return false;
    
    // For 'connections' visibility, check if users are connected
    return await this.areUsersConnected(contentOwner.id, viewer.id);
  }
  
  /**
   * Check if two users are connected (friends, coach/student, etc.)
   * @private
   */
  private async areUsersConnected(userId1: number, userId2: number): Promise<boolean> {
    // Call storage service to check for active connections
    const connection = await storage.getUserConnection(userId1, userId2);
    return !!connection && connection.status === 'accepted';
  }
  
  /**
   * Update user's privacy settings
   */
  async updatePrivacySettings(userId: number, settings: any): Promise<User | undefined> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return undefined;
      
      // Update only the privacy settings, preserving other JSON fields
      const [updatedUser] = await db.update(users)
        .set({ 
          privacySettings: settings
        })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return undefined;
    }
  }
  
  /**
   * Update user's communication preferences
   */
  async updateCommunicationPreferences(userId: number, preferences: any): Promise<User | undefined> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return undefined;
      
      // Update communication preferences and notification delivery
      const [updatedUser] = await db.update(users)
        .set({ 
          communicationPreferences: preferences.communicationPreferences,
          notificationDelivery: preferences.notificationDelivery
        })
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating communication preferences:', error);
      return undefined;
    }
  }
  
  /**
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: number): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;
      
      return user.privacySettings || {
        profileVisibility: "public",
        locationVisibility: "public",
        skillLevelVisibility: "public",
        matchHistoryVisibility: "connections",
        achievementsVisibility: "public",
        socialHandlesVisibility: "connections"
      };
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return null;
    }
  }
  
  /**
   * Get user's communication preferences
   */
  async getCommunicationPreferences(userId: number): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;
      
      return {
        communicationPreferences: user.communicationPreferences || {
          matchInvitations: true,
          tournamentNotifications: true,
          achievementAlerts: true,
          connectionRequests: true,
          marketingEmails: false,
          newsAndUpdates: true
        },
        notificationDelivery: user.notificationDelivery || {
          email: true,
          inApp: true,
          pushNotifications: false
        }
      };
    } catch (error) {
      console.error('Error getting communication preferences:', error);
      return null;
    }
  }
}

// Create and export a singleton instance of the privacy service
export const privacyService = new PrivacyService();