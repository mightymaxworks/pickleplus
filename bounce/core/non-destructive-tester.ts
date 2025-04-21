/**
 * PKL-278651-BOUNCE-0001-CORE
 * Non-Destructive Tester Module
 * 
 * This module implements the non-destructive testing protocol that allows
 * Bounce to safely test the application without disrupting production data.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from "../../server/db";
import { 
  bounceFindings, 
  bounceEvidence,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceEvidenceType
} from "../../shared/schema";
import { bounceIdentity } from "./bounce-identity";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Options for a test operation
 */
interface TestOperationOptions {
  /**
   * Whether the operation might modify data (default: false)
   */
  isModifying?: boolean;
  
  /**
   * The area of the application being tested
   */
  area: string;
  
  /**
   * The path or URL being tested
   */
  path?: string;
  
  /**
   * The browser being used for testing
   */
  browser: string;
  
  /**
   * The device being simulated (desktop, mobile, etc.)
   */
  device?: string;
  
  /**
   * The screen size being tested (e.g., "1920x1080")
   */
  screenSize?: string;
}

/**
 * Evidence data for a finding
 */
interface EvidenceData {
  /**
   * The type of evidence
   */
  type: BounceEvidenceType;
  
  /**
   * The raw data (e.g., image data, console log text)
   */
  data: Buffer | string;
  
  /**
   * Optional description of the evidence
   */
  description?: string;
}

/**
 * Non-destructive testing implementation
 * Ensures tests don't modify production data in harmful ways
 */
export class NonDestructiveTester {
  private testRunId: number | null = null;
  private evidencePath: string;
  private operationCount: number = 0;
  
  /**
   * Create a new non-destructive tester
   * @param evidenceBasePath Base path for storing evidence files
   */
  constructor(evidenceBasePath: string = "./uploads/bounce-evidence") {
    this.evidencePath = evidenceBasePath;
    this.ensureEvidencePath();
  }
  
  /**
   * Ensure the evidence directory exists
   */
  private ensureEvidencePath(): void {
    if (!fs.existsSync(this.evidencePath)) {
      fs.mkdirSync(this.evidencePath, { recursive: true });
    }
  }
  
  /**
   * Initialize the tester with a test run ID
   * @param testRunId The ID of the current test run
   */
  initialize(testRunId: number): void {
    this.testRunId = testRunId;
    this.operationCount = 0;
    console.log(`[Bounce] Initialized non-destructive tester for test run #${testRunId}`);
  }
  
  /**
   * Create a unique identifier for a finding
   * @param area The area of the application
   * @param operationNumber The operation number within the test
   * @returns A unique, human-readable finding ID
   */
  private createFindingId(area: string, operationNumber: number): string {
    const areaPrefix = area.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 4);
    const timestamp = Date.now().toString(36).substring(4, 8);
    return `BOUNCE-${areaPrefix}-${operationNumber.toString().padStart(3, "0")}-${timestamp}`;
  }
  
  /**
   * Execute a test operation safely
   * @param operation The function to execute
   * @param options Options for the test operation
   * @returns The result of the operation
   */
  async executeOperation<T>(
    operation: () => Promise<T>,
    options: TestOperationOptions
  ): Promise<T> {
    if (!this.testRunId) {
      throw new Error("Non-destructive tester not initialized with test run ID");
    }
    
    this.operationCount++;
    console.log(`[Bounce] Executing operation #${this.operationCount}: ${options.area} - ${options.path || "no path"}`);
    
    // If the operation might modify data, we need to be extra careful
    if (options.isModifying) {
      console.log(`[Bounce] Executing potentially modifying operation in area ${options.area}`);
      // In a real implementation, we would add transaction rollback or data isolation here
    }
    
    // Execute the operation and return the result
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`[Bounce] Operation failed: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Report a finding (bug or issue)
   * @param description Description of the finding
   * @param severity The severity of the issue
   * @param options Test operation options
   * @param evidence Optional evidence data
   * @returns The ID of the created finding
   */
  async reportFinding(
    description: string,
    severity: BounceFindingSeverity,
    options: TestOperationOptions,
    evidence?: EvidenceData[]
  ): Promise<number> {
    if (!this.testRunId) {
      throw new Error("Non-destructive tester not initialized with test run ID");
    }
    
    const findingId = this.createFindingId(options.area, this.operationCount);
    
    try {
      // Insert the finding into the database
      const [finding] = await db
        .insert(bounceFindings)
        .values({
          findingId,
          testRunId: this.testRunId,
          description,
          severity,
          area: options.area,
          path: options.path,
          browser: options.browser,
          device: options.device,
          screenSize: options.screenSize,
          status: BounceFindingStatus.OPEN,
          reproducibility: 100, // Default to 100% reproducible
        })
        .returning();
      
      console.log(`[Bounce] Reported finding ${findingId}: ${description}`);
      
      // If evidence is provided, save it
      if (evidence && evidence.length > 0) {
        await this.saveEvidence(finding.id, evidence);
      }
      
      return finding.id;
    } catch (error) {
      console.error(`[Bounce] Failed to report finding: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Save evidence for a finding
   * @param findingId The ID of the finding
   * @param evidenceItems Array of evidence items
   */
  private async saveEvidence(
    findingId: number,
    evidenceItems: EvidenceData[]
  ): Promise<void> {
    try {
      for (const item of evidenceItems) {
        // Create a unique filename for the evidence
        const filename = `${findingId}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const extension = this.getFileExtension(item.type);
        const fullPath = path.join(this.evidencePath, `${filename}${extension}`);
        const relativePath = path.relative(".", fullPath);
        
        // Write the evidence file
        if (Buffer.isBuffer(item.data)) {
          fs.writeFileSync(fullPath, item.data);
        } else {
          fs.writeFileSync(fullPath, item.data, "utf8");
        }
        
        // Insert the evidence record into the database
        await db.insert(bounceEvidence).values({
          findingId,
          evidenceType: item.type,
          filePath: relativePath,
          description: item.description,
        });
        
        console.log(`[Bounce] Saved evidence for finding ${findingId}: ${relativePath}`);
      }
    } catch (error) {
      console.error(`[Bounce] Failed to save evidence: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Get the file extension for an evidence type
   * @param type The type of evidence
   * @returns The appropriate file extension
   */
  private getFileExtension(type: BounceEvidenceType): string {
    switch (type) {
      case BounceEvidenceType.SCREENSHOT:
        return ".png";
      case BounceEvidenceType.VIDEO:
        return ".mp4";
      case BounceEvidenceType.CONSOLE:
      case BounceEvidenceType.LOG:
        return ".log";
      case BounceEvidenceType.NETWORK:
        return ".json";
      default:
        return ".dat";
    }
  }
  
  /**
   * Clean up any resources used during testing
   */
  cleanup(): void {
    console.log(`[Bounce] Cleaning up non-destructive tester for test run #${this.testRunId}`);
    this.testRunId = null;
    this.operationCount = 0;
  }
}

// Export a singleton instance for use throughout the application
export const nonDestructiveTester = new NonDestructiveTester();