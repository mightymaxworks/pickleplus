/**
 * Jest Global Setup
 * Runs once before all test suites
 */
import { setupTestData } from './setup';

export default async function globalSetup() {
  console.log('Setting up E2E test environment...');
  
  // Wait for server to be ready
  const maxRetries = 20;
  let retries = 0;
  
  const baseUrl = process.env.TEST_URL || 'http://localhost:5000';
  
  while (retries < maxRetries) {
    try {
      // Check root URL (same as GitHub Actions workflow)
      const response = await fetch(baseUrl);
      if (response.status < 500) {
        console.log('Server is ready!');
        break;
      }
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('Server check failed after', maxRetries, 'attempts');
        throw new Error('Server failed to start within timeout');
      }
      console.log(`Waiting for server... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
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
