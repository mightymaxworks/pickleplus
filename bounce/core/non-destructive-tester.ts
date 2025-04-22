/**
 * PKL-278651-BOUNCE-0002-CORE - Non-destructive Testing Module
 * 
 * This module provides non-destructive testing capabilities for automated
 * testing workflows. It ensures that tests can run without affecting production data.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from '../../server/db';
import { 
  bounceFindings, 
  bounceEvidence,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceEvidenceType
} from '../../shared/schema/bounce';

/**
 * Finding context information
 */
interface FindingContext {
  /**
   * The area/component being tested
   */
  area: string;
  
  /**
   * The browser being used for testing
   */
  browser: string;
  
  /**
   * The URL path where the issue was found
   */
  path: string;
  
  /**
   * Whether the test action would modify data
   */
  isModifying: boolean;
  
  /**
   * Optional device type for responsive testing
   */
  device?: string;
  
  /**
   * Optional screen size for responsive testing
   */
  screenSize?: string;
}

/**
 * Evidence data for a finding
 */
interface EvidenceData {
  /**
   * Type of evidence (screenshot, console log, etc.)
   */
  type: string;
  
  /**
   * The evidence data (binary or text)
   */
  data: Buffer | string;
  
  /**
   * Description of the evidence
   */
  description: string;
}

/**
 * Non-destructive tester service
 * Provides safe testing without affecting production data
 */
class NonDestructiveTester {
  /**
   * The current test run ID
   */
  private testRunId: number = 0;
  
  /**
   * Whether the tester is initialized
   */
  private initialized: boolean = false;
  
  /**
   * The directory where evidence is stored
   */
  private evidenceDir: string = path.join(process.cwd(), 'reports', 'evidence');
  
  /**
   * Initialize the non-destructive tester
   * @param testRunId The test run ID to associate findings with
   */
  initialize(testRunId: number): void {
    this.testRunId = testRunId;
    this.initialized = true;
    
    // Ensure evidence directory exists
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
    
    console.log(`[Bounce] Non-destructive tester initialized for test run ${testRunId}`);
  }
  
  /**
   * Report a finding during testing
   * @param description Description of the finding
   * @param severity Severity of the finding
   * @param context Context information about the finding
   * @param evidence Array of evidence data
   * @returns The ID of the created finding
   */
  async reportFinding(
    description: string,
    severity: BounceFindingSeverity,
    context: FindingContext,
    evidence: EvidenceData[]
  ): Promise<number> {
    if (!this.initialized) {
      throw new Error('Non-destructive tester not initialized. Call initialize() first.');
    }
    
    try {
      // Generate a unique finding ID
      const findingId = crypto.randomBytes(4).toString('hex');
      
      // Insert the finding into the database
      const [finding] = await db.insert(bounceFindings).values({
        testRunId: this.testRunId,
        title: `${context.area}: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        description,
        severity,
        status: BounceFindingStatus.NEW,
        affectedUrl: context.path,
        browserInfo: JSON.stringify({
          browser: context.browser,
          device: context.device,
          screenSize: context.screenSize
        }),
        reproducibleSteps: 'Automated test detected this issue'
      }).returning();
      
      // Process and save evidence
      for (const item of evidence) {
        const evidenceFilename = await this.saveEvidence(item.data, finding.id, item.type);
        
        // Insert evidence record
        await db.insert(bounceEvidence).values({
          findingId: finding.id,
          type: this.mapEvidenceType(item.type),
          content: evidenceFilename,
          metadata: JSON.stringify({
            description: item.description,
            timestamp: new Date().toISOString()
          })
        });
      }
      
      console.log(`[Bounce] Reported finding: ${finding.id} - ${description}`);
      return finding.id;
    } catch (error) {
      console.error(`[Bounce] Error reporting finding: ${(error as Error).message}`);
      return 0;
    }
  }
  
  /**
   * Map evidence type string to enum value
   * @param type Evidence type string
   * @returns Evidence type enum value
   */
  private mapEvidenceType(type: string): BounceEvidenceType {
    switch (type.toUpperCase()) {
      case 'SCREENSHOT':
        return BounceEvidenceType.SCREENSHOT;
      case 'CONSOLE':
        return BounceEvidenceType.CONSOLE_LOG;
      case 'NETWORK':
        return BounceEvidenceType.NETWORK_REQUEST;
      case 'DOM':
        return BounceEvidenceType.DOM_STATE;
      case 'PERFORMANCE':
        return BounceEvidenceType.PERFORMANCE_METRIC;
      default:
        return BounceEvidenceType.SCREENSHOT;
    }
  }
  
  /**
   * Save evidence data to the file system
   * @param data Evidence data (binary or text)
   * @param findingId The finding ID to associate with
   * @param type The type of evidence
   * @returns The path to the saved evidence file
   */
  private async saveEvidence(
    data: Buffer | string,
    findingId: number,
    type: string
  ): Promise<string> {
    // Create a directory for this finding
    const findingDir = path.join(this.evidenceDir, findingId.toString());
    if (!fs.existsSync(findingDir)) {
      fs.mkdirSync(findingDir, { recursive: true });
    }
    
    // Determine file extension based on type
    let extension = '.txt';
    if (type.toUpperCase() === 'SCREENSHOT') {
      extension = '.png';
    }
    
    // Generate unique filename
    const timestamp = new Date().getTime();
    const filename = `evidence_${type.toLowerCase()}_${timestamp}${extension}`;
    const filePath = path.join(findingDir, filename);
    
    // Write data to file
    if (typeof data === 'string') {
      fs.writeFileSync(filePath, data, 'utf8');
    } else {
      fs.writeFileSync(filePath, data);
    }
    
    // Return relative path from the project root
    return path.relative(process.cwd(), filePath);
  }
  
  /**
   * Check if an operation would be destructive
   * @param action The action to check
   * @returns Whether the action is destructive
   */
  isDestructiveAction(action: string): boolean {
    const destructiveActions = ['DELETE', 'UPDATE', 'INSERT', 'TRUNCATE', 'DROP', 'ALTER'];
    return destructiveActions.some(da => action.toUpperCase().includes(da));
  }
  
  /**
   * Reset the non-destructive tester
   */
  reset(): void {
    this.testRunId = 0;
    this.initialized = false;
    console.log('[Bounce] Non-destructive tester reset');
  }
}

// Export a singleton instance
export const nonDestructiveTester = new NonDestructiveTester();