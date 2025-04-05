/**
 * Tournament Module
 * 
 * This module handles tournament registration and check-in
 */

import { Module } from '@/core/modules/moduleRegistry';
import { eventBus, Events } from '@/core/events/eventBus';
import { Tournament } from '@shared/schema';
import { TournamentModuleAPI } from '../types';
import { apiRequest } from '@/lib/queryClient';

/**
 * Core implementation of the Tournament Module API
 */
class TournamentModule implements TournamentModuleAPI {
  async getTournaments(): Promise<Tournament[]> {
    try {
      const response = await apiRequest('GET', '/api/tournaments');
      return await response.json();
    } catch (error) {
      console.error('Get tournaments error:', error);
      throw error;
    }
  }

  async registerForTournament(tournamentId: number, userId: number): Promise<void> {
    try {
      await apiRequest('POST', '/api/tournament-registrations', {
        tournamentId,
        userId
      });
      
      // Publish tournament registered event
      eventBus.publish(Events.TOURNAMENT_REGISTERED, { tournamentId, userId });
    } catch (error) {
      console.error('Tournament registration error:', error);
      throw error;
    }
  }

  async checkInToTournament(tournamentId: number, userId: number): Promise<void> {
    try {
      await apiRequest('POST', '/api/tournament-check-in', {
        tournamentId,
        userId
      });
      
      // Publish tournament check-in event
      eventBus.publish(Events.TOURNAMENT_CHECKED_IN, { tournamentId, userId });
    } catch (error) {
      console.error('Tournament check-in error:', error);
      throw error;
    }
  }

  async getUserTournaments(userId: number): Promise<Tournament[]> {
    try {
      const response = await apiRequest('GET', `/api/user/tournaments?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Get user tournaments error:', error);
      throw error;
    }
  }
}

// Export the module for registration
export const tournamentModule: Module = {
  name: 'tournament',
  version: '0.8.0',
  exports: new TournamentModule(),
};