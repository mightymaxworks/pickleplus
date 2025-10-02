/**
 * Jest Global Setup
 * Runs once before all test suites
 */
import { setupTestData } from './setup';

export default async function globalSetup() {
  console.log('Setting up E2E test environment...');
  
  // Wait for server to be ready
  const maxRetries = 30;
  let retries = 0;
  
  const baseUrl = process.env.TEST_URL || 'http://localhost:5000';
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        console.log('Server is ready!');
        break;
      }
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error('Server failed to start within timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Create test users
  try {
    await setupTestData();
    console.log('Test data setup complete');
  } catch (error) {
    console.warn('Test data setup warning:', error);
    // Continue even if test users already exist
  }
}
