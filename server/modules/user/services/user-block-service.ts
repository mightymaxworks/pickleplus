/**
 * UserBlockService
 * 
 * Provides functionality for handling user blocking and unblocking:
 * - Block other users
 * - Unblock users
 * - Check if a user is blocked
 * - Get list of blocked users
 */

import { IStorage } from "../../../storage";
import { UserBlockList } from "@shared/schema";
import { EventBus } from "../../../core/events/event-bus";

export interface IUserBlockService {
  blockUser(userId: number, blockedUserId: number, reason?: string): Promise<UserBlockList>;
  unblockUser(userId: number, blockedUserId: number): Promise<void>;
  isUserBlocked(userId: number, potentiallyBlockedUserId: number): Promise<boolean>;
  getBlockedUsers(userId: number): Promise<UserBlockList[]>;
  getBlockedByUsers(userId: number): Promise<UserBlockList[]>;
}

export class UserBlockService implements IUserBlockService {
  constructor(
    private storage: IStorage,
    private eventBus: EventBus
  ) {}

  /**
   * Block a user
   * @param userId The ID of the user doing the blocking
   * @param blockedUserId The ID of the user being blocked
   * @param reason Optional reason for the block
   * @returns The created block record
   */
  async blockUser(userId: number, blockedUserId: number, reason?: string): Promise<UserBlockList> {
    // Check if user is already blocked
    const existingBlock = await this.storage.getUserBlock(userId, blockedUserId);
    if (existingBlock) {
      return existingBlock;
    }

    // Create a new block entry
    const blockEntry = {
      userId,
      blockedUserId,
      reason: reason || null,
      isActive: true,
      createdAt: new Date(),
    };

    const block = await this.storage.createUserBlock(blockEntry);

    // Publish block event
    this.eventBus.publish("user.blocked", {
      userId,
      blockedUserId,
      reason
    });

    return block;
  }

  /**
   * Unblock a user
   * @param userId The ID of the user removing the block
   * @param blockedUserId The ID of the user being unblocked
   */
  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    await this.storage.deleteUserBlock(userId, blockedUserId);

    // Publish unblock event
    this.eventBus.publish("user.unblocked", {
      userId,
      blockedUserId
    });
  }

  /**
   * Check if a user is blocked by another user
   * @param userId The ID of the potential blocker
   * @param potentiallyBlockedUserId The ID of the potentially blocked user
   * @returns True if potentiallyBlockedUserId is blocked by userId
   */
  async isUserBlocked(userId: number, potentiallyBlockedUserId: number): Promise<boolean> {
    const block = await this.storage.getUserBlock(userId, potentiallyBlockedUserId);
    return !!block && block.isActive;
  }

  /**
   * Get all users blocked by a specific user
   * @param userId The ID of the user who has blocked others
   * @returns Array of block records
   */
  async getBlockedUsers(userId: number): Promise<UserBlockList[]> {
    return this.storage.getBlockedUsers(userId);
  }

  /**
   * Get all users who have blocked a specific user
   * @param userId The ID of the user who may be blocked by others
   * @returns Array of block records
   */
  async getBlockedByUsers(userId: number): Promise<UserBlockList[]> {
    return this.storage.getBlockedByUsers(userId);
  }
}