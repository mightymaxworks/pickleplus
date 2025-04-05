/**
 * Coaching Module
 * 
 * This module handles coach profiles and coaching sessions
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { CoachProfile } from '@shared/schema';
import { CoachModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';
import { featureFlags } from '@/core/features/featureFlags';

/**
 * Core implementation of the Coaching Module API
 */
class CoachingModule implements CoachModuleAPI {
  async getCoachProfile(userId: number): Promise<CoachProfile | null> {
    // Check if coaching features are enabled
    if (!featureFlags.isEnabled('coaching-features')) {
      console.warn('Coaching features are coming soon! Check back on May 15.');
      return null;
    }
    
    try {
      const response = await apiRequest('GET', `/api/coach/profile?userId=${userId}`);
      
      if (response.status === 404) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get coach profile error:', error);
      return null;
    }
  }

  async createCoachProfile(profileData: any): Promise<CoachProfile> {
    // Check if coaching features are enabled
    if (!featureFlags.isEnabled('coaching-features')) {
      throw new Error('Coaching features are coming soon! Check back on May 15.');
    }
    
    try {
      const response = await apiRequest('POST', '/api/coach/profile', profileData);
      return await response.json();
    } catch (error) {
      console.error('Create coach profile error:', error);
      throw error;
    }
  }

  async updateCoachProfile(profileData: any): Promise<CoachProfile> {
    // Check if coaching features are enabled
    if (!featureFlags.isEnabled('coaching-features')) {
      throw new Error('Coaching features are coming soon! Check back on May 15.');
    }
    
    try {
      const response = await apiRequest('PATCH', '/api/coach/profile', profileData);
      return await response.json();
    } catch (error) {
      console.error('Update coach profile error:', error);
      throw error;
    }
  }

  async requestCoachAccess(userId: number): Promise<void> {
    try {
      await apiRequest('POST', '/api/waitlist/coaching', { userId });
    } catch (error) {
      console.error('Request coach access error:', error);
      throw error;
    }
  }

  async bookCoachingSession(coachId: number, studentId: number, sessionData: any): Promise<any> {
    // Check if coaching features are enabled
    if (!featureFlags.isEnabled('coaching-features')) {
      throw new Error('Coaching features are coming soon! Check back on May 15.');
    }
    
    try {
      const response = await apiRequest('POST', '/api/coaching/sessions', {
        coachId,
        studentId,
        ...sessionData
      });
      
      const data = await response.json();
      
      // Publish coaching session booked event
      eventBus.publish(Events.COACHING_SESSION_BOOKED, data);
      
      return data;
    } catch (error) {
      console.error('Book coaching session error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const coachingModule: Module = {
  name: 'coaching',
  version: '0.8.0',
  exports: new CoachingModule(),
};