/**
 * User Module
 * 
 * This module handles user authentication, profile management, and related functionality
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { User } from '@shared/schema';
import { UserModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';
import QRCode from 'qrcode.react';

/**
 * Core implementation of the User Module API
 */
class UserModule implements UserModuleAPI {
  async login(username: string, password: string): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      eventBus.publish(Events.USER_LOGGED_IN, data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: any): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      eventBus.publish(Events.USER_LOGGED_IN, data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/api/auth/logout');
      eventBus.publish(Events.USER_LOGGED_OUT, null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest('GET', '/api/auth/current-user');
      if (response.status === 401) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(userData: any): Promise<User> {
    try {
      const response = await apiRequest('PATCH', '/api/profile/update', userData);
      const data = await response.json();
      eventBus.publish(Events.USER_PROFILE_UPDATED, data);
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  getPassportQR(userId: number): string {
    // URL to the passport page that others can scan
    const passportUrl = `${window.location.origin}/passport/${userId}`;
    
    // Create a QR code for the passport URL
    // This will be rendered in a component
    return passportUrl;
  }

  async getUserXP(userId: number): Promise<number> {
    try {
      const response = await apiRequest('GET', `/api/user/xp-tier?userId=${userId}`);
      const data = await response.json();
      return data.xp;
    } catch (error) {
      console.error('Get user XP error:', error);
      throw error;
    }
  }

  async getUserTier(userId: number): Promise<string> {
    try {
      const response = await apiRequest('GET', `/api/user/xp-tier?userId=${userId}`);
      const data = await response.json();
      return data.tier;
    } catch (error) {
      console.error('Get user tier error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const userModule: Module = {
  name: 'user',
  version: '0.8.0',
  exports: new UserModule(),
};