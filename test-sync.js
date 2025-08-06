// Test script to manually trigger profile sync
import { ProfileService } from './server/services/profile-service.js';

async function testSync() {
  console.log('Testing profile sync for admin user (ID: 218)...');
  
  try {
    const profileService = new ProfileService();
    const result = await profileService.syncProfileCompletionAndMilestones(218);
    
    console.log('Sync completed successfully:', result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

testSync();