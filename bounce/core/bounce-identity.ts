/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Identity Module
 * 
 * This module manages the identity and authentication for the Bounce testing system.
 * It ensures that Bounce's automated testing has appropriate permissions and tracking.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from "@neondatabase/serverless";
import { db } from "../../server/db";
import { 
  bounceTestRuns, 
  bounceInteractions, 
  BounceTestRunStatus
} from "../../shared/schema";
import { nanoid } from "nanoid";
import * as crypto from "crypto";

/**
 * Configuration options for the Bounce identity system
 */
interface BounceIdentityConfig {
  /**
   * The name of the Bounce bot for user-facing interactions
   */
  botName: string;
  
  /**
   * Avatar URL for the Bounce bot
   */
  botAvatar: string;
  
  /**
   * Whether to mark test data as hidden from regular users (recommended for production)
   */
  markTestData: boolean;
  
  /**
   * Hash salt for generating consistent Bounce identifiers
   */
  hashSalt: string;
}

/**
 * Default configuration for Bounce identity
 */
const DEFAULT_CONFIG: BounceIdentityConfig = {
  botName: "Bounce Bot",
  botAvatar: "/assets/bounce-bot-avatar.png", // Path to be created in a future task
  markTestData: true,
  hashSalt: process.env.BOUNCE_HASH_SALT || "bounce-testing-system-salt-" + new Date().toISOString().split('T')[0],
};

/**
 * Manages the identity of the Bounce testing system 
 * to ensure clean identification and data separation
 */
export class BounceIdentity {
  private config: BounceIdentityConfig;
  private currentTestRunId: number | null = null;
  private sessionId: string;
  private deviceIdentifier: string;
  
  /**
   * Create a new Bounce identity
   * @param config Configuration options
   */
  constructor(config: Partial<BounceIdentityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = nanoid(16);
    this.deviceIdentifier = this.generateDeviceId();
  }
  
  /**
   * Generate a consistent device ID for the current test environment
   */
  private generateDeviceId(): string {
    const baseData = `bounce-device-${process.platform}-${process.arch}`;
    return crypto
      .createHash('sha256')
      .update(baseData + this.config.hashSalt)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Start a new test run and record it in the database
   * @param browsers Comma-separated list of browsers being tested
   * @param testTypes Comma-separated list of test types being run
   * @returns The ID of the created test run
   */
  async startTestRun(browsers: string, testTypes: string): Promise<number> {
    try {
      const [testRun] = await db
        .insert(bounceTestRuns)
        .values({
          browsers,
          testTypes,
          status: BounceTestRunStatus.RUNNING,
        })
        .returning();
      
      this.currentTestRunId = testRun.id;
      console.log(`[Bounce] Started test run #${testRun.id} with session ${this.sessionId}`);
      
      return testRun.id;
    } catch (error) {
      console.error("[Bounce] Failed to start test run:", error);
      throw error;
    }
  }
  
  /**
   * End the current test run and update its status in the database
   * @param status The final status of the test run
   * @param totalIssues The total number of issues found
   * @param coverage The test coverage percentage (0-100)
   */
  async endTestRun(
    status: BounceTestRunStatus = BounceTestRunStatus.COMPLETED,
    totalIssues: number = 0,
    coverage: number = 0
  ): Promise<void> {
    if (!this.currentTestRunId) {
      throw new Error("No active test run to end");
    }
    
    try {
      await db
        .update(bounceTestRuns)
        .set({
          status,
          endTime: new Date(),
          totalIssues,
          coverage,
        })
        .where({ id: this.currentTestRunId });
      
      console.log(`[Bounce] Ended test run #${this.currentTestRunId} with status ${status}`);
      this.currentTestRunId = null;
    } catch (error) {
      console.error("[Bounce] Failed to end test run:", error);
      throw error;
    }
  }
  
  /**
   * Record a user interaction with the Bounce system (for gamification)
   * @param userId The ID of the user who interacted with Bounce
   * @param interactionType The type of interaction
   * @param points The number of points awarded for this interaction
   * @param details Additional details about the interaction
   */
  async recordInteraction(
    userId: number,
    interactionType: string,
    points: number,
    details: any = {}
  ): Promise<void> {
    try {
      await db
        .insert(bounceInteractions)
        .values({
          userId,
          interactionType,
          points,
          details,
        });
      
      console.log(`[Bounce] Recorded interaction for user ${userId}: ${interactionType} (+${points} points)`);
    } catch (error) {
      console.error("[Bounce] Failed to record interaction:", error);
      throw error;
    }
  }
  
  /**
   * Get the current test run ID
   */
  getCurrentTestRunId(): number | null {
    return this.currentTestRunId;
  }
  
  /**
   * Get the session ID for the current Bounce instance
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Get the device identifier for the current Bounce instance
   */
  getDeviceIdentifier(): string {
    return this.deviceIdentifier;
  }
  
  /**
   * Get the bot name for user-facing interactions
   */
  getBotName(): string {
    return this.config.botName;
  }
  
  /**
   * Get the bot avatar URL for user-facing interactions
   */
  getBotAvatar(): string {
    return this.config.botAvatar;
  }
  
  /**
   * Check if test data should be marked (hidden from regular users)
   */
  shouldMarkTestData(): boolean {
    return this.config.markTestData;
  }
}

// Export a singleton instance for use throughout the application
export const bounceIdentity = new BounceIdentity();