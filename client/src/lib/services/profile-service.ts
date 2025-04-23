/**
 * Profile Service
 * 
 * Provides data operations for user profile management
 * following Framework 5.3 principles for frontend-first data handling.
 * 
 * @module ProfileService
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

import { BaseEntity, getStorageService, IStorageService } from './storage-service';
import { queryClient, apiRequest } from '../queryClient';
import { toast } from '@/hooks/use-toast';
import featureFlags from '../featureFlags';
import { syncManager } from './sync-manager';

// Profile types
export interface UserProfile extends BaseEntity {
  userId: number;
  displayName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  playingSince?: string;
  skillLevel?: string;
  preferredPlayingTimes?: string[];
  preferredFormat?: 'singles' | 'doubles' | 'mixed' | 'all';
  equipment?: {
    paddle?: string;
    shoes?: string;
    accessories?: string[];
  };
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
    showPlayingHistory: boolean;
    showRatings: boolean;
  };
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

// Input type for creating/updating profiles
export interface ProfileInput {
  displayName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  playingSince?: string;
  skillLevel?: string;
  preferredPlayingTimes?: string[];
  preferredFormat?: 'singles' | 'doubles' | 'mixed' | 'all';
  equipment?: {
    paddle?: string;
    shoes?: string;
    accessories?: string[];
  };
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
    showPlayingHistory: boolean;
    showRatings: boolean;
  };
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

/**
 * Profile Service class for handling user profile data
 */
export class ProfileService {
  public profileStorage: IStorageService<UserProfile>;
  
  constructor() {
    this.profileStorage = getStorageService<UserProfile>('user-profiles');
  }
  
  /**
   * Get profile by user ID with frontend-first approach
   */
  async getProfileByUserId(userId: number): Promise<UserProfile | null> {
    try {
      console.log('ProfileService: Getting profile for user ID:', userId);
      
      // Try to get from local storage first
      const profiles = await this.profileStorage.query(
        profile => profile.userId === userId
      );
      
      // If found in local storage, return it
      if (profiles.length > 0) {
        return profiles[0];
      }
      
      // Otherwise try to get from server if frontend-first is disabled
      if (!featureFlags.useFrontendFirst('profile')) {
        const response = await apiRequest('GET', `/api/profile/${userId}`);
        
        if (response.ok) {
          const serverProfile = await response.json();
          
          // Save to local storage
          if (serverProfile) {
            await this.profileStorage.create(serverProfile);
          }
          
          return serverProfile;
        }
      }
      
      return null;
    } catch (error) {
      console.error('ProfileService: Error getting profile:', error);
      return null;
    }
  }
  
  /**
   * Create or update profile with frontend-first approach
   */
  async updateProfile(userId: number, profileData: ProfileInput): Promise<UserProfile> {
    try {
      console.log('ProfileService: Updating profile for user ID:', userId, profileData);
      
      // Check if profile exists
      const existingProfiles = await this.profileStorage.query(
        profile => profile.userId === userId
      );
      
      let profile: UserProfile;
      
      if (existingProfiles.length > 0) {
        // Update existing profile
        profile = await this.profileStorage.update(existingProfiles[0].id, {
          ...existingProfiles[0],
          ...profileData,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new profile
        profile = await this.profileStorage.create({
          userId,
          ...profileData,
        });
      }
      
      console.log('ProfileService: Profile saved locally:', profile);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('profile')) {
        this.syncProfileWithServer(profile).catch(error => {
          console.error('ProfileService: Background sync failed:', error);
          syncManager.addToSyncQueue('profiles', profile.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateProfileQueries(userId);
      
      return profile;
    } catch (error) {
      console.error('ProfileService: Error updating profile:', error);
      throw error;
    }
  }
  
  /**
   * Update profile avatar
   */
  async updateProfileAvatar(userId: number, avatarUrl: string): Promise<UserProfile | null> {
    try {
      // Get existing profile
      const profiles = await this.profileStorage.query(
        profile => profile.userId === userId
      );
      
      if (profiles.length === 0) {
        return null;
      }
      
      const profile = profiles[0];
      
      // Update avatar URL
      const updatedProfile = await this.profileStorage.update(profile.id, {
        ...profile,
        avatarUrl,
        updatedAt: new Date().toISOString()
      });
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('profile')) {
        this.syncProfileWithServer(updatedProfile).catch(error => {
          console.error('ProfileService: Background sync failed:', error);
          syncManager.addToSyncQueue('profiles', updatedProfile.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateProfileQueries(userId);
      
      return updatedProfile;
    } catch (error) {
      console.error('ProfileService: Error updating avatar:', error);
      return null;
    }
  }
  
  /**
   * Sync profile with the server
   * Made public so it can be used by SyncManager
   */
  public async syncProfileWithServer(profile: UserProfile): Promise<void> {
    try {
      console.log('ProfileService: Syncing profile with server:', profile);
      
      // Try to send to server
      const response = await apiRequest('POST', `/api/profile/${profile.userId}`, profile);
      
      if (!response.ok) {
        console.error('ProfileService: Server sync failed with status:', response.status);
        syncManager.addToSyncQueue('profiles', profile.id);
        return;
      }
      
      // Get the server's version of the profile
      const serverProfile = await response.json();
      console.log('ProfileService: Server sync successful, received:', serverProfile);
      
      // Update local version with server data
      if (serverProfile && serverProfile.id) {
        await this.profileStorage.update(profile.id, serverProfile);
      }
      
      // Invalidate related queries
      this.invalidateProfileQueries(profile.userId);
      
    } catch (error) {
      console.error('ProfileService: Error syncing with server:', error);
      syncManager.addToSyncQueue('profiles', profile.id);
      throw error;
    }
  }
  
  /**
   * Invalidate related queries when profile data changes
   */
  private invalidateProfileQueries(userId: number): void {
    console.log('ProfileService: Invalidating related queries for user ID:', userId);
    queryClient.invalidateQueries({ queryKey: [`/api/profile/${userId}`] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/current'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
  }
}

// Create a singleton instance
export const profileService = new ProfileService();

// Export a hook to use the profile service
export function useProfileService() {
  return profileService;
}