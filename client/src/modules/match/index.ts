/**
 * Match Module
 * 
 * This module handles match recording and analytics
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { Match } from '@shared/schema';
import { MatchModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';
import { featureFlags } from '@/core/features/featureFlags';

/**
 * Core implementation of the Match Module API
 */
class MatchModule implements MatchModuleAPI {
  async recordMatch(matchData: any): Promise<Match> {
    // Check if match recording feature is enabled
    if (!featureFlags.isEnabled('match-recording')) {
      throw new Error('Match recording is coming soon! Check back on April 13.');
    }
    
    try {
      const response = await apiRequest('POST', '/api/matches', matchData);
      const data = await response.json();
      
      // Publish match recorded event
      eventBus.publish(Events.MATCH_RECORDED, data);
      
      return data;
    } catch (error) {
      console.error('Record match error:', error);
      throw error;
    }
  }

  async getMatches(userId: number): Promise<Match[]> {
    try {
      const response = await apiRequest('GET', `/api/matches?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get matches error:', error);
      throw error;
    }
  }

  async getMatchStats(userId: number): Promise<any> {
    try {
      const response = await apiRequest('GET', `/api/matches/stats?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get match stats error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const matchModule: Module = {
  name: 'match',
  version: '0.8.0',
  exports: new MatchModule(),
};