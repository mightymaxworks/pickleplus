/**
 * Social Module
 * 
 * This module handles player connections and social features
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { User, Connection } from '@shared/schema';
import { SocialModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';

/**
 * Core implementation of the Social Module API
 */
class SocialModule implements SocialModuleAPI {
  async getConnections(userId: number): Promise<Connection[]> {
    try {
      // Get both sent and received connections
      const [sentResponse, receivedResponse] = await Promise.all([
        apiRequest('GET', `/api/connections/sent?userId=${userId}`),
        apiRequest('GET', `/api/connections/received?userId=${userId}`)
      ]);
      
      const sent = await sentResponse.json();
      const received = await receivedResponse.json();
      
      // Combine and return all connections
      return [...sent, ...received];
    } catch (error) {
      console.error('Get connections error:', error);
      throw error;
    }
  }

  async requestConnection(requesterId: number, recipientId: number): Promise<Connection> {
    try {
      const response = await apiRequest('POST', '/api/connections', {
        requesterId,
        recipientId
      });
      
      const data = await response.json();
      
      // Publish connection created event
      eventBus.publish(Events.CONNECTION_CREATED, data);
      
      return data;
    } catch (error) {
      console.error('Request connection error:', error);
      throw error;
    }
  }

  async respondToConnection(connectionId: number, status: string): Promise<Connection> {
    try {
      const response = await apiRequest('PATCH', `/api/connections/${connectionId}/status`, {
        status
      });
      
      const data = await response.json();
      
      // Publish connection updated event
      eventBus.publish(Events.CONNECTION_UPDATED, data);
      
      return data;
    } catch (error) {
      console.error('Respond to connection error:', error);
      throw error;
    }
  }

  async searchPlayers(query: string): Promise<User[]> {
    try {
      const response = await apiRequest('GET', `/api/users/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Search players error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const socialModule: Module = {
  name: 'social',
  version: '0.8.0',
  exports: new SocialModule(),
};