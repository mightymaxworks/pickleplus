/**
 * PrivacyService
 * 
 * Provides functionality for checking user privacy preferences and content visibility:
 * - Check if content is visible to a user based on privacy settings
 * - Enforce privacy rules across the platform
 * - Handle blocked users visibility
 */

import { IStorage } from "../../../storage";
import { User } from "@shared/schema";
import { EventBus } from "../../../core/events/event-bus";
import { IUserBlockService } from "./user-block-service";

// Enum for privacy levels
export enum PrivacyLevel {
  PUBLIC = "public",       // Visible to everyone
  CONNECTIONS = "connections", // Visible to connections only
  PRIVATE = "private"      // Visible to self only
}

// Content types that can have privacy settings
export enum ContentType {
  PROFILE = "profile",
  ACTIVITY = "activity",
  STATS = "stats",
  MATCHES = "matches",
  ACHIEVEMENTS = "achievements",
  CONNECTIONS = "connections"
}

export interface IPrivacyService {
  // Check if content is visible to a viewer
  isContentVisibleToUser(
    contentOwnerId: number, 
    viewerId: number | null, 
    contentType: ContentType
  ): Promise<boolean>;
  
  // Get a user's privacy settings
  getUserPrivacySettings(userId: number): Promise<Record<ContentType, PrivacyLevel>>;
  
  // Update a user's privacy settings
  updateUserPrivacySettings(
    userId: number, 
    settings: Partial<Record<ContentType, PrivacyLevel>>
  ): Promise<User>;
  
  // Check if a user is blocked by another
  isUserBlocked(userId: number, potentiallyBlockedUserId: number): Promise<boolean>;
  
  // Get content visibility explanation for debugging/explanation
  getContentVisibilityExplanation(
    contentOwnerId: number, 
    viewerId: number | null, 
    contentType: ContentType
  ): Promise<string>;
}

export class PrivacyService implements IPrivacyService {
  constructor(
    private storage: IStorage,
    private userBlockService: IUserBlockService,
    private eventBus: EventBus
  ) {}

  /**
   * Check if content is visible to a viewer
   * @param contentOwnerId The ID of the user who owns the content
   * @param viewerId The ID of the user viewing the content (null for unauthenticated)
   * @param contentType The type of content being checked
   * @returns Whether the content is visible
   */
  async isContentVisibleToUser(
    contentOwnerId: number, 
    viewerId: number | null, 
    contentType: ContentType
  ): Promise<boolean> {
    // Owner can always view their own content
    if (viewerId !== null && contentOwnerId === viewerId) {
      return true;
    }

    // Check if the viewer is blocked by the content owner
    if (viewerId !== null) {
      const isBlocked = await this.userBlockService.isUserBlocked(contentOwnerId, viewerId);
      if (isBlocked) {
        return false;
      }
    }

    // Get user's privacy settings
    const privacySettings = await this.getUserPrivacySettings(contentOwnerId);
    const privacyLevel = privacySettings[contentType];

    // Apply privacy rules based on level
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return true;

      case PrivacyLevel.PRIVATE:
        return false;

      case PrivacyLevel.CONNECTIONS:
        // Unauthenticated users can't be connections
        if (viewerId === null) {
          return false;
        }

        // Check if the users are connected
        const connection = await this.storage.getUserConnection(contentOwnerId, viewerId);
        return connection !== undefined;

      default:
        // Default to private if unknown privacy level
        return false;
    }
  }

  /**
   * Get a user's privacy settings
   * @param userId The ID of the user
   * @returns Record of privacy settings by content type
   */
  async getUserPrivacySettings(userId: number): Promise<Record<ContentType, PrivacyLevel>> {
    const user = await this.storage.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Get the user's privacy settings from their profile or use defaults
    const defaultPrivacy: Record<ContentType, PrivacyLevel> = {
      [ContentType.PROFILE]: PrivacyLevel.PUBLIC,
      [ContentType.ACTIVITY]: PrivacyLevel.CONNECTIONS,
      [ContentType.STATS]: PrivacyLevel.PUBLIC,
      [ContentType.MATCHES]: PrivacyLevel.PUBLIC,
      [ContentType.ACHIEVEMENTS]: PrivacyLevel.PUBLIC,
      [ContentType.CONNECTIONS]: PrivacyLevel.CONNECTIONS
    };

    // If user has saved privacy settings, use those
    if (user.privacySettings) {
      // Parse if stored as string, or use the object directly
      const userSettings = typeof user.privacySettings === 'string' 
        ? JSON.parse(user.privacySettings) 
        : user.privacySettings;
      
      // Merge with defaults to ensure all content types have a setting
      return { ...defaultPrivacy, ...userSettings };
    }

    return defaultPrivacy;
  }

  /**
   * Update a user's privacy settings
   * @param userId The ID of the user
   * @param settings Partial record of privacy settings to update
   * @returns The updated user
   */
  async updateUserPrivacySettings(
    userId: number, 
    settings: Partial<Record<ContentType, PrivacyLevel>>
  ): Promise<User> {
    // Get current settings
    const currentSettings = await this.getUserPrivacySettings(userId);
    
    // Merge with new settings
    const updatedSettings = { ...currentSettings, ...settings };
    
    // Update user
    const user = await this.storage.updateUser(userId, {
      privacySettings: updatedSettings
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Publish privacy settings update event
    this.eventBus.publish("user.privacy.updated", {
      userId,
      settings: updatedSettings
    });
    
    return user;
  }

  /**
   * Check if a user is blocked by another
   * @param userId The ID of the potential blocker
   * @param potentiallyBlockedUserId The ID of the potentially blocked user
   * @returns Whether the user is blocked
   */
  async isUserBlocked(userId: number, potentiallyBlockedUserId: number): Promise<boolean> {
    return this.userBlockService.isUserBlocked(userId, potentiallyBlockedUserId);
  }

  /**
   * Get a human-readable explanation of content visibility
   * @param contentOwnerId The ID of the user who owns the content
   * @param viewerId The ID of the user viewing the content (null for unauthenticated)
   * @param contentType The type of content being checked
   * @returns Explanation of visibility decision
   */
  async getContentVisibilityExplanation(
    contentOwnerId: number, 
    viewerId: number | null, 
    contentType: ContentType
  ): Promise<string> {
    const isVisible = await this.isContentVisibleToUser(contentOwnerId, viewerId, contentType);
    const privacySettings = await this.getUserPrivacySettings(contentOwnerId);
    const privacyLevel = privacySettings[contentType];
    
    if (viewerId !== null && contentOwnerId === viewerId) {
      return "Content is visible because you are the owner.";
    }
    
    if (viewerId !== null) {
      const isBlocked = await this.userBlockService.isUserBlocked(contentOwnerId, viewerId);
      if (isBlocked) {
        return "Content is not visible because you have been blocked by the content owner.";
      }
    }
    
    switch (privacyLevel) {
      case PrivacyLevel.PUBLIC:
        return "Content is visible because it has public privacy settings.";
        
      case PrivacyLevel.PRIVATE:
        return "Content is not visible because it has private privacy settings.";
        
      case PrivacyLevel.CONNECTIONS:
        if (viewerId === null) {
          return "Content is not visible because it requires authentication and connection with the owner.";
        }
        
        const connection = await this.storage.getUserConnection(contentOwnerId, viewerId);
        if (connection) {
          return "Content is visible because you are connected with the content owner.";
        } else {
          return "Content is not visible because it requires a connection with the owner.";
        }
        
      default:
        return "Content visibility cannot be determined due to unknown privacy settings.";
    }
  }
}