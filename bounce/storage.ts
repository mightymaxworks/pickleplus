/**
 * PKL-278651-BOUNCE-0024-STORE - Bounce Storage Module
 * 
 * This module provides storage functions for the Bounce testing system,
 * including test runs and findings.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import fs from 'fs/promises';
import path from 'path';
import { BounceTestRun, BounceFinding } from './types';

// Storage paths
const DATA_DIR = path.join(process.cwd(), 'bounce/data');
const TEST_RUNS_FILE = path.join(DATA_DIR, 'test-runs.json');
const FINDINGS_FILE = path.join(DATA_DIR, 'findings.json');

// Initialize storage
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize test runs file if it doesn't exist
    try {
      await fs.access(TEST_RUNS_FILE);
    } catch {
      await fs.writeFile(TEST_RUNS_FILE, JSON.stringify([]));
    }
    
    // Initialize findings file if it doesn't exist
    try {
      await fs.access(FINDINGS_FILE);
    } catch {
      await fs.writeFile(FINDINGS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error(`Error initializing storage: ${error.message}`);
  }
}

// Initialize storage on module load
initStorage();

/**
 * Get all test runs
 * @returns Array of test runs
 */
export async function getTestRuns(): Promise<BounceTestRun[]> {
  try {
    const data = await fs.readFile(TEST_RUNS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting test runs: ${error.message}`);
    return [];
  }
}

/**
 * Get a test run by ID
 * @param id The test run ID
 * @returns The test run or undefined if not found
 */
export async function getTestRun(id: number): Promise<BounceTestRun | undefined> {
  const testRuns = await getTestRuns();
  return testRuns.find(run => run.id === id);
}

/**
 * Create a new test run
 * @param testRun The test run to create
 * @returns The created test run
 */
export async function createTestRun(testRun: Omit<BounceTestRun, 'id'>): Promise<BounceTestRun> {
  const testRuns = await getTestRuns();
  
  // Generate ID
  const newId = testRuns.length > 0 
    ? Math.max(...testRuns.map(run => run.id)) + 1 
    : 1;
  
  const newTestRun: BounceTestRun = {
    ...testRun,
    id: newId,
  };
  
  testRuns.push(newTestRun);
  
  await fs.writeFile(TEST_RUNS_FILE, JSON.stringify(testRuns, null, 2));
  
  return newTestRun;
}

/**
 * Update a test run
 * @param id The test run ID
 * @param updates The updates to apply
 * @returns The updated test run or undefined if not found
 */
export async function updateTestRun(
  id: number, 
  updates: Partial<BounceTestRun>
): Promise<BounceTestRun | undefined> {
  const testRuns = await getTestRuns();
  const index = testRuns.findIndex(run => run.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  testRuns[index] = {
    ...testRuns[index],
    ...updates,
  };
  
  await fs.writeFile(TEST_RUNS_FILE, JSON.stringify(testRuns, null, 2));
  
  return testRuns[index];
}

/**
 * Get all findings
 * @returns Array of findings
 */
export async function getAllFindings(): Promise<BounceFinding[]> {
  try {
    const data = await fs.readFile(FINDINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting findings: ${error.message}`);
    return [];
  }
}

/**
 * Get findings for a specific test run
 * @param testRunId The test run ID
 * @returns Array of findings for the test run
 */
export async function getFindings(testRunId: number): Promise<BounceFinding[]> {
  const findings = await getAllFindings();
  return findings.filter(finding => finding.test_run_id === testRunId);
}

/**
 * Create a new finding
 * @param finding The finding to create
 * @returns The created finding
 */
export async function createFinding(
  finding: Omit<BounceFinding, 'id'>
): Promise<BounceFinding> {
  const findings = await getAllFindings();
  
  // Generate ID
  const newId = findings.length > 0 
    ? Math.max(...findings.map(f => f.id)) + 1 
    : 1;
  
  const newFinding: BounceFinding = {
    ...finding,
    id: newId,
  };
  
  findings.push(newFinding);
  
  await fs.writeFile(FINDINGS_FILE, JSON.stringify(findings, null, 2));
  
  return newFinding;
}

/**
 * Create multiple findings at once
 * @param testRunId The test run ID
 * @param findings The findings to create
 * @returns The created findings
 */
export async function createFindings(
  testRunId: number,
  findings: Omit<BounceFinding, 'id' | 'test_run_id'>[]
): Promise<BounceFinding[]> {
  const allFindings = await getAllFindings();
  
  // Generate IDs
  const lastId = allFindings.length > 0 
    ? Math.max(...allFindings.map(f => f.id)) 
    : 0;
  
  const newFindings: BounceFinding[] = findings.map((finding, index) => ({
    ...finding,
    id: lastId + index + 1,
    test_run_id: testRunId,
  }));
  
  allFindings.push(...newFindings);
  
  await fs.writeFile(FINDINGS_FILE, JSON.stringify(allFindings, null, 2));
  
  return newFindings;
}