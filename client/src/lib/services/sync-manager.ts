/**
 * SyncManager - Handles background synchronization of locally stored data
 * 
 * This service is responsible for:
 * 1. Tracking failed API requests that need to be retried
 * 2. Periodically attempting to sync local data with the server
 * 3. Managing sync conflicts
 * 4. Providing status updates about sync progress
 * 
 * @module SyncManager
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

import { toast } from '@/hooks/use-toast';
import featureFlags from '../featureFlags';
import { matchService } from './match-service';
import { assessmentService } from './assessment-service';
import { profileService } from './profile-service';
import { tournamentService } from './tournament-service';
import { communityService } from './community-service';

// Storage key for failed sync attempts
const FAILED_SYNCS_STORAGE_KEY = 'pickle_plus_failed_syncs';

// Sync item interface
export interface SyncItem {
  id: string | number;  // ID of the entity to sync
  entityType: string;   // Type of entity (e.g., 'match', 'assessment')
  timestamp: string;    // When the sync was first attempted
  retryCount: number;   // Number of retry attempts
  lastRetry?: string;   // When the last retry was attempted
}

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'completed' | 'failed';

// Sync manager events
export interface SyncEvents {
  onSyncStart?: () => void;
  onSyncComplete?: (syncedCount: number) => void;
  onSyncFail?: (error: Error) => void;
  onSyncProgress?: (current: number, total: number) => void;
}

/**
 * SyncManager class
 */
export class SyncManager {
  private syncQueue: SyncItem[] = [];
  private status: SyncStatus = 'idle';
  private isOnline: boolean = navigator.onLine;
  private syncInterval: number | null = null;
  private events: SyncEvents = {};
  
  constructor() {
    // Load existing sync queue
    this.loadSyncQueue();
    
    // Set up network status listeners
    this.setupNetworkListeners();
  }
  
  /**
   * Set up network status event listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (this.status === 'syncing') {
        this.status = 'failed';
        if (this.events.onSyncFail) {
          this.events.onSyncFail(new Error('Network connection lost'));
        }
      }
    });
  }
  
  /**
   * Load the sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const queueData = localStorage.getItem(FAILED_SYNCS_STORAGE_KEY);
      if (queueData) {
        const parsedQueue = JSON.parse(queueData);
        
        // Convert from old format if necessary
        if (!Array.isArray(parsedQueue)) {
          // Old format was an object with entity types as keys
          this.syncQueue = Object.entries(parsedQueue)
            .flatMap(([entityType, ids]: [string, any]) => 
              (ids as (string | number)[]).map(id => ({
                id,
                entityType,
                timestamp: new Date().toISOString(),
                retryCount: 0
              }))
            );
        } else {
          this.syncQueue = parsedQueue;
        }
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }
  
  /**
   * Save the sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem(FAILED_SYNCS_STORAGE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }
  
  /**
   * Add an item to the sync queue
   */
  public addToSyncQueue(entityType: string, id: string | number): void {
    // Check if item already exists in queue
    const existingIndex = this.syncQueue.findIndex(
      item => item.entityType === entityType && item.id === id
    );
    
    if (existingIndex >= 0) {
      // Update existing item
      this.syncQueue[existingIndex].retryCount = 0;
      this.syncQueue[existingIndex].timestamp = new Date().toISOString();
    } else {
      // Add new item
      this.syncQueue.push({
        id,
        entityType,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });
    }
    
    // Save queue
    this.saveSyncQueue();
    
    // Trigger sync if online
    if (this.isOnline && featureFlags.getFeatureFlag('enableBackgroundSync')) {
      this.triggerSync();
    }
  }
  
  /**
   * Remove an item from the sync queue
   */
  public removeFromSyncQueue(entityType: string, id: string | number): void {
    this.syncQueue = this.syncQueue.filter(
      item => !(item.entityType === entityType && item.id === id)
    );
    
    this.saveSyncQueue();
  }
  
  /**
   * Start periodic background sync
   * @param intervalMs Milliseconds between sync attempts
   */
  public startPeriodicSync(intervalMs: number = 60000): void {
    // Stop any existing interval
    this.stopPeriodicSync();
    
    // Start new interval
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && 
          this.status !== 'syncing' && 
          featureFlags.getFeatureFlag('enableBackgroundSync')) {
        this.triggerSync();
      }
    }, intervalMs);
    
    console.log(`SyncManager: Started periodic sync every ${intervalMs}ms`);
  }
  
  /**
   * Stop periodic background sync
   */
  public stopPeriodicSync(): void {
    if (this.syncInterval !== null) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('SyncManager: Stopped periodic sync');
    }
  }
  
  /**
   * Trigger a sync operation
   */
  public async triggerSync(): Promise<void> {
    // Check if already syncing
    if (this.status === 'syncing' || this.syncQueue.length === 0 || !this.isOnline) {
      return;
    }
    
    this.status = 'syncing';
    
    if (this.events.onSyncStart) {
      this.events.onSyncStart();
    }
    
    console.log(`SyncManager: Starting sync of ${this.syncQueue.length} items`);
    
    const totalItems = this.syncQueue.length;
    let syncedCount = 0;
    let failedItems: SyncItem[] = [];
    
    try {
      // Process each item in the queue
      for (let i = 0; i < this.syncQueue.length; i++) {
        const item = this.syncQueue[i];
        
        // Update progress
        if (this.events.onSyncProgress) {
          this.events.onSyncProgress(i + 1, totalItems);
        }
        
        // Skip items that have been retried too many times
        const maxRetries = featureFlags.getFeatureFlag('enableSyncRetries') ? 5 : 1;
        if (item.retryCount >= maxRetries) {
          failedItems.push(item);
          continue;
        }
        
        try {
          await this.syncItem(item);
          syncedCount++;
        } catch (error) {
          console.error(`SyncManager: Failed to sync ${item.entityType} ${item.id}:`, error);
          
          // Update retry count and last retry timestamp
          item.retryCount++;
          item.lastRetry = new Date().toISOString();
          
          failedItems.push(item);
        }
      }
      
      // Update sync queue with only failed items
      this.syncQueue = failedItems;
      this.saveSyncQueue();
      
      // Update status
      this.status = failedItems.length > 0 ? 'failed' : 'completed';
      
      // Trigger completion event
      if (this.events.onSyncComplete) {
        this.events.onSyncComplete(syncedCount);
      }
      
      // Show toast if items were synced
      if (syncedCount > 0 && featureFlags.getFeatureFlag('showSyncStatus')) {
        toast({
          title: 'Data synchronized',
          description: `Successfully synced ${syncedCount} items with the server.`,
        });
      }
      
      console.log(`SyncManager: Sync completed. ${syncedCount} items synced, ${failedItems.length} items failed.`);
    } catch (error) {
      console.error('SyncManager: Unexpected error during sync:', error);
      
      this.status = 'failed';
      
      if (this.events.onSyncFail) {
        this.events.onSyncFail(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }
  
  /**
   * Sync an individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    console.log(`SyncManager: Syncing ${item.entityType} ${item.id}`);
    
    switch (item.entityType) {
      case 'matches':
        await this.syncMatch(item.id);
        break;
      case 'match-assessments':
        await this.syncAssessment(item.id);
        break;
      case 'profiles':
        await this.syncProfile(item.id);
        break;
      case 'tournaments':
        await this.syncTournament(item.id);
        break;
      case 'tournament-registrations':
        await this.syncTournamentRegistration(item.id);
        break;
      case 'communities':
        await this.syncCommunity(item.id);
        break;
      case 'community-posts':
        await this.syncCommunityPost(item.id);
        break;
      case 'community-comments':
        await this.syncCommunityComment(item.id);
        break;
      case 'community-members':
        await this.syncCommunityMember(item.id);
        break;
      case 'community-join-requests':
        await this.syncCommunityJoinRequest(item.id);
        break;
      default:
        throw new Error(`Unknown entity type: ${item.entityType}`);
    }
  }
  
  /**
   * Sync a match with the server
   */
  private async syncMatch(id: string | number): Promise<void> {
    const match = await matchService.getMatchById(id);
    
    if (!match) {
      throw new Error(`Match ${id} not found in local storage`);
    }
    
    // Use match service to sync with server
    return matchService.syncMatchWithServer(match);
  }
  
  /**
   * Sync an assessment with the server
   */
  private async syncAssessment(id: string | number): Promise<void> {
    const assessment = await assessmentService.getAssessmentById(id);
    
    if (!assessment) {
      throw new Error(`Assessment ${id} not found in local storage`);
    }
    
    // Use assessment service to sync with server
    return assessmentService.syncAssessmentWithServer(assessment);
  }
  
  /**
   * Sync a profile with the server
   */
  private async syncProfile(id: string | number): Promise<void> {
    // Get the profile from storage service
    const profiles = await profileService.profileStorage.query(
      profile => profile.id === id
    );
    
    if (!profiles || profiles.length === 0) {
      throw new Error(`Profile ${id} not found in local storage`);
    }
    
    const profile = profiles[0];
    
    // Use profile service to sync with server
    return profileService.syncProfileWithServer(profile);
  }
  
  /**
   * Sync a tournament with the server
   */
  private async syncTournament(id: string | number): Promise<void> {
    // Get the tournament from storage service
    const tournament = await tournamentService.tournamentStorage.getById(id);
    
    if (!tournament) {
      throw new Error(`Tournament ${id} not found in local storage`);
    }
    
    // Use tournament service to sync with server
    return tournamentService.syncTournamentWithServer(tournament);
  }
  
  /**
   * Sync a tournament registration with the server
   */
  private async syncTournamentRegistration(id: string | number): Promise<void> {
    // Get the registration from storage service
    const registration = await tournamentService.registrationStorage.getById(id);
    
    if (!registration) {
      throw new Error(`Tournament registration ${id} not found in local storage`);
    }
    
    // Use tournament service to sync with server
    return tournamentService.syncRegistrationWithServer(registration);
  }
  
  /**
   * Sync a community with the server
   */
  private async syncCommunity(id: string | number): Promise<void> {
    // Get the community from storage service
    const community = await communityService.communityStorage.getById(id);
    
    if (!community) {
      throw new Error(`Community ${id} not found in local storage`);
    }
    
    // Use community service to sync with server
    return communityService.syncCommunityWithServer(community);
  }
  
  /**
   * Sync a community post with the server
   */
  private async syncCommunityPost(id: string | number): Promise<void> {
    // Get the post from storage service
    const post = await communityService.postStorage.getById(id);
    
    if (!post) {
      throw new Error(`Community post ${id} not found in local storage`);
    }
    
    // Use community service to sync with server
    return communityService.syncPostWithServer(post);
  }
  
  /**
   * Sync a community comment with the server
   */
  private async syncCommunityComment(id: string | number): Promise<void> {
    // Get the comment from storage service
    const comment = await communityService.commentStorage.getById(id);
    
    if (!comment) {
      throw new Error(`Community comment ${id} not found in local storage`);
    }
    
    // Use community service to sync with server
    return communityService.syncCommentWithServer(comment);
  }
  
  /**
   * Sync a community member with the server
   */
  private async syncCommunityMember(id: string | number): Promise<void> {
    // Get the member from storage service
    const member = await communityService.memberStorage.getById(id);
    
    if (!member) {
      throw new Error(`Community member ${id} not found in local storage`);
    }
    
    // Use community service to sync with server
    return communityService.syncMemberWithServer(member);
  }
  
  /**
   * Sync a community join request with the server
   */
  private async syncCommunityJoinRequest(id: string | number): Promise<void> {
    // Get the join request from storage service
    const joinRequest = await communityService.joinRequestStorage.getById(id);
    
    if (!joinRequest) {
      throw new Error(`Community join request ${id} not found in local storage`);
    }
    
    // Use community service to sync with server
    return communityService.syncJoinRequestWithServer(joinRequest);
  }
  
  /**
   * Register event handlers
   */
  public registerEvents(events: SyncEvents): void {
    this.events = { ...this.events, ...events };
  }
  
  /**
   * Get current status
   */
  public getStatus(): SyncStatus {
    return this.status;
  }
  
  /**
   * Get queued items count
   */
  public getQueueCount(): number {
    return this.syncQueue.length;
  }
  
  /**
   * Check if device is online
   */
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }
  
  /**
   * Clear sync queue
   */
  public clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
  }
}

// Create singleton instance
export const syncManager = new SyncManager();

// Start periodic sync if enabled
if (featureFlags.getFeatureFlag('enableBackgroundSync')) {
  syncManager.startPeriodicSync();
}

export default syncManager;