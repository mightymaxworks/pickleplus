/**
 * Achievement Module
 * 
 * This module handles achievements, XP, and activity tracking
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { Achievement } from '@shared/schema';
import { AchievementModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';

/**
 * Core implementation of the Achievement Module API
 */
class AchievementModule implements AchievementModuleAPI {
  async getAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiRequest('GET', '/api/achievements');
      return await response.json();
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    try {
      const response = await apiRequest('GET', `/api/user/achievements?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get user achievements error:', error);
      throw error;
    }
  }

  async getUserActivities(userId: number): Promise<any[]> {
    try {
      const response = await apiRequest('GET', `/api/user/activities?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get user activities error:', error);
      throw error;
    }
  }

  async redeemCode(code: string, userId: number): Promise<any> {
    try {
      const response = await apiRequest('POST', '/api/redeem-code', {
        code,
        userId
      });
      
      const data = await response.json();
      
      // Publish XP earned event if code gave XP
      if (data.xpEarned) {
        eventBus.publish(Events.XP_EARNED, {
          userId,
          xpEarned: data.xpEarned,
          source: 'redemption_code',
          code
        });
      }
      
      // Publish achievement unlocked event if code gave achievements
      if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach((achievement: Achievement) => {
          eventBus.publish(Events.ACHIEVEMENT_UNLOCKED, {
            userId,
            achievement,
            source: 'redemption_code',
            code
          });
        });
      }
      
      return data;
    } catch (error) {
      console.error('Redeem code error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const achievementModule: Module = {
  name: 'achievement',
  version: '0.8.0',
  exports: new AchievementModule(),
};