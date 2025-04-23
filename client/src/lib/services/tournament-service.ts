/**
 * Tournament Service
 * 
 * Provides data operations for tournament management
 * following Framework 5.3 principles for frontend-first data handling.
 * 
 * @module TournamentService
 * @version 1.0.0
 * @framework Framework5.3
 * @lastModified 2025-04-23
 */

import { BaseEntity, getStorageService, IStorageService } from './storage-service';
import { queryClient, apiRequest } from '../queryClient';
import { toast } from '@/hooks/use-toast';
import featureFlags from '../featureFlags';
import { syncManager } from './sync-manager';

// Tournament types
export interface Tournament extends BaseEntity {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  format: 'singles' | 'doubles' | 'mixed' | 'all';
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  organizerId: number;
  entryFee?: number;
  prizes?: string[];
  imageUrl?: string;
  divisions?: TournamentDivision[];
  rules?: string;
}

export interface TournamentDivision {
  id: string | number;
  name: string;
  skillLevel: string;
  format: 'singles' | 'doubles' | 'mixed';
  maxParticipants: number;
  currentParticipants: number;
}

export interface TournamentRegistration extends BaseEntity {
  tournamentId: string | number;
  userId: number;
  divisionId?: string | number;
  partnerUserId?: number; // For doubles/mixed
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled';
  paymentStatus?: 'unpaid' | 'processing' | 'paid' | 'refunded';
  seedNumber?: number;
}

export interface TournamentInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  format: 'singles' | 'doubles' | 'mixed' | 'all';
  registrationDeadline: string;
  maxParticipants: number;
  organizerId: number;
  entryFee?: number;
  prizes?: string[];
  imageUrl?: string;
  divisions?: Omit<TournamentDivision, 'id'>[];
  rules?: string;
}

export interface TournamentRegistrationInput {
  tournamentId: string | number;
  userId: number;
  divisionId?: string | number;
  partnerUserId?: number;
}

/**
 * Tournament Service class for handling tournament data
 */
export class TournamentService {
  public tournamentStorage: IStorageService<Tournament>;
  public registrationStorage: IStorageService<TournamentRegistration>;
  
  constructor() {
    this.tournamentStorage = getStorageService<Tournament>('tournaments');
    this.registrationStorage = getStorageService<TournamentRegistration>('tournament-registrations');
  }
  
  /**
   * Get all tournaments with frontend-first approach
   */
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      console.log('TournamentService: Getting all tournaments');
      
      // Try to get from local storage first
      let tournaments = await this.tournamentStorage.getAll();
      
      // If using frontend-first, return local data
      if (featureFlags.useFrontendFirst('tournament')) {
        return tournaments;
      }
      
      // Otherwise try to get from server
      try {
        const response = await apiRequest('GET', `/api/tournaments`);
        
        if (response.ok) {
          const serverTournaments = await response.json();
          
          // Replace local storage with server data
          if (Array.isArray(serverTournaments)) {
            // Delete all local tournaments first
            for (const tournament of tournaments) {
              await this.tournamentStorage.delete(tournament.id);
            }
            
            // Add server tournaments to local storage
            tournaments = [];
            for (const tournamentData of serverTournaments) {
              const tournament = await this.tournamentStorage.create(tournamentData);
              tournaments.push(tournament);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tournaments from server:', error);
        // In case of server error, we fall back to local data
      }
      
      return tournaments;
    } catch (error) {
      console.error('TournamentService: Error getting tournaments:', error);
      return [];
    }
  }
  
  /**
   * Get tournament by ID with frontend-first approach
   */
  async getTournamentById(id: string | number): Promise<Tournament | null> {
    try {
      console.log('TournamentService: Getting tournament by ID:', id);
      
      // Try to get from local storage first
      const tournament = await this.tournamentStorage.getById(id);
      
      // If found in local storage, return it
      if (tournament) {
        return tournament;
      }
      
      // Otherwise try to get from server if frontend-first is disabled
      if (!featureFlags.useFrontendFirst('tournament')) {
        const response = await apiRequest('GET', `/api/tournaments/${id}`);
        
        if (response.ok) {
          const serverTournament = await response.json();
          
          // Save to local storage
          if (serverTournament) {
            return await this.tournamentStorage.create(serverTournament);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('TournamentService: Error getting tournament:', error);
      return null;
    }
  }
  
  /**
   * Create a tournament with frontend-first approach
   */
  async createTournament(tournamentData: TournamentInput): Promise<Tournament> {
    try {
      console.log('TournamentService: Creating tournament:', tournamentData);
      
      // Create in local storage first
      const tournament = await this.tournamentStorage.create({
        ...tournamentData,
        currentParticipants: 0,
        status: 'upcoming',
      });
      
      console.log('TournamentService: Tournament created locally:', tournament);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('tournament')) {
        this.syncTournamentWithServer(tournament).catch(error => {
          console.error('TournamentService: Background sync failed:', error);
          syncManager.addToSyncQueue('tournaments', tournament.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateTournamentQueries();
      
      return tournament;
    } catch (error) {
      console.error('TournamentService: Error creating tournament:', error);
      throw error;
    }
  }
  
  /**
   * Update a tournament with frontend-first approach
   */
  async updateTournament(id: string | number, tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      console.log('TournamentService: Updating tournament:', id, tournamentData);
      
      // Update in local storage first
      const tournament = await this.tournamentStorage.update(id, tournamentData);
      
      console.log('TournamentService: Tournament updated locally:', tournament);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('tournament')) {
        this.syncTournamentWithServer(tournament).catch(error => {
          console.error('TournamentService: Background sync failed:', error);
          syncManager.addToSyncQueue('tournaments', tournament.id);
        });
      }
      
      // Invalidate related queries
      this.invalidateTournamentQueries();
      this.invalidateTournamentQuery(id);
      
      return tournament;
    } catch (error) {
      console.error('TournamentService: Error updating tournament:', error);
      throw error;
    }
  }
  
  /**
   * Register for a tournament with frontend-first approach
   */
  async registerForTournament(
    registrationData: TournamentRegistrationInput
  ): Promise<TournamentRegistration> {
    try {
      console.log('TournamentService: Registering for tournament:', registrationData);
      
      // Create registration in local storage first
      const registration = await this.registrationStorage.create({
        ...registrationData,
        registrationDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'unpaid',
      });
      
      console.log('TournamentService: Registration created locally:', registration);
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('tournament')) {
        this.syncRegistrationWithServer(registration).catch(error => {
          console.error('TournamentService: Background reg sync failed:', error);
          syncManager.addToSyncQueue('tournament-registrations', registration.id);
        });
      }
      
      // Update tournament participant count
      const tournament = await this.getTournamentById(registrationData.tournamentId);
      if (tournament) {
        await this.tournamentStorage.update(tournament.id, {
          ...tournament,
          currentParticipants: tournament.currentParticipants + 1,
        });
        
        // Invalidate related queries
        this.invalidateTournamentQuery(tournament.id);
      }
      
      // Invalidate registration queries
      this.invalidateRegistrationQueries(registrationData.userId);
      
      return registration;
    } catch (error) {
      console.error('TournamentService: Error registering for tournament:', error);
      throw error;
    }
  }
  
  /**
   * Get user's tournament registrations
   */
  async getUserRegistrations(userId: number): Promise<TournamentRegistration[]> {
    try {
      console.log('TournamentService: Getting registrations for user:', userId);
      
      // Try to get from local storage first
      const registrations = await this.registrationStorage.query(
        registration => registration.userId === userId
      );
      
      // If using frontend-first, return local data
      if (featureFlags.useFrontendFirst('tournament')) {
        return registrations;
      }
      
      // Otherwise try to get from server
      const response = await apiRequest('GET', `/api/tournaments/registrations/user/${userId}`);
      
      if (response.ok) {
        const serverRegistrations = await response.json();
        
        // Replace local storage with server data
        if (Array.isArray(serverRegistrations)) {
          // Delete existing registrations
          for (const registration of registrations) {
            await this.registrationStorage.delete(registration.id);
          }
          
          // Add server registrations to local storage
          const updatedRegistrations = [];
          for (const regData of serverRegistrations) {
            const reg = await this.registrationStorage.create(regData);
            updatedRegistrations.push(reg);
          }
          
          return updatedRegistrations;
        }
      }
      
      // If server failed, return local data
      return registrations;
    } catch (error) {
      console.error('TournamentService: Error getting user registrations:', error);
      return [];
    }
  }
  
  /**
   * Cancel tournament registration
   */
  async cancelRegistration(registrationId: string | number): Promise<boolean> {
    try {
      console.log('TournamentService: Cancelling registration:', registrationId);
      
      // Get registration
      const registration = await this.registrationStorage.getById(registrationId);
      
      if (!registration) {
        throw new Error(`Registration ${registrationId} not found`);
      }
      
      // Update registration status locally
      const updatedRegistration = await this.registrationStorage.update(registrationId, {
        ...registration,
        status: 'cancelled',
      });
      
      // Try to sync with server in background
      if (featureFlags.useFrontendFirst('tournament')) {
        this.syncRegistrationWithServer(updatedRegistration).catch(error => {
          console.error('TournamentService: Background cancel sync failed:', error);
          syncManager.addToSyncQueue('tournament-registrations', registrationId);
        });
      }
      
      // Update tournament participant count
      const tournament = await this.getTournamentById(registration.tournamentId);
      if (tournament) {
        await this.tournamentStorage.update(tournament.id, {
          ...tournament,
          currentParticipants: Math.max(0, tournament.currentParticipants - 1),
        });
        
        // Invalidate related queries
        this.invalidateTournamentQuery(tournament.id);
      }
      
      // Invalidate registration queries
      this.invalidateRegistrationQueries(registration.userId);
      
      return true;
    } catch (error) {
      console.error('TournamentService: Error cancelling registration:', error);
      return false;
    }
  }
  
  /**
   * Sync tournament with the server
   * Made public so it can be used by SyncManager
   */
  public async syncTournamentWithServer(tournament: Tournament): Promise<void> {
    try {
      console.log('TournamentService: Syncing tournament with server:', tournament);
      
      // Determine if this is a create or update
      const method = tournament.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/tournaments` 
        : `/api/tournaments/${tournament.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, tournament);
      
      if (!response.ok) {
        console.error('TournamentService: Server sync failed with status:', response.status);
        syncManager.addToSyncQueue('tournaments', tournament.id);
        return;
      }
      
      // Get the server's version of the tournament
      const serverTournament = await response.json();
      console.log('TournamentService: Server sync successful, received:', serverTournament);
      
      // Update local version with server data
      if (serverTournament && serverTournament.id) {
        if (method === 'POST' && tournament.id !== serverTournament.id) {
          // If this was a creation and we got a new ID, we need to delete the local entry
          // and create a new one with the server ID
          await this.tournamentStorage.delete(tournament.id);
          await this.tournamentStorage.create(serverTournament);
        } else {
          // Otherwise just update the existing entry
          await this.tournamentStorage.update(tournament.id, serverTournament);
        }
      }
      
      // Invalidate related queries
      this.invalidateTournamentQueries();
      this.invalidateTournamentQuery(serverTournament.id || tournament.id);
      
    } catch (error) {
      console.error('TournamentService: Error syncing with server:', error);
      syncManager.addToSyncQueue('tournaments', tournament.id);
      throw error;
    }
  }
  
  /**
   * Sync registration with the server
   * Made public so it can be used by SyncManager
   */
  public async syncRegistrationWithServer(registration: TournamentRegistration): Promise<void> {
    try {
      console.log('TournamentService: Syncing registration with server:', registration);
      
      // Determine if this is a create or update
      const method = registration.id.toString().startsWith('local_') ? 'POST' : 'PUT';
      const endpoint = method === 'POST' 
        ? `/api/tournaments/registrations` 
        : `/api/tournaments/registrations/${registration.id}`;
      
      // Try to send to server
      const response = await apiRequest(method, endpoint, registration);
      
      if (!response.ok) {
        console.error('TournamentService: Registration sync failed:', response.status);
        syncManager.addToSyncQueue('tournament-registrations', registration.id);
        return;
      }
      
      // Get the server's version of the registration
      const serverRegistration = await response.json();
      console.log('TournamentService: Registration sync successful:', serverRegistration);
      
      // Update local version with server data
      if (serverRegistration && serverRegistration.id) {
        if (method === 'POST' && registration.id !== serverRegistration.id) {
          // If this was a creation and we got a new ID, we need to delete the local entry
          // and create a new one with the server ID
          await this.registrationStorage.delete(registration.id);
          await this.registrationStorage.create(serverRegistration);
        } else {
          // Otherwise just update the existing entry
          await this.registrationStorage.update(registration.id, serverRegistration);
        }
      }
      
      // Invalidate related queries
      this.invalidateRegistrationQueries(registration.userId);
      
    } catch (error) {
      console.error('TournamentService: Error syncing registration:', error);
      syncManager.addToSyncQueue('tournament-registrations', registration.id);
      throw error;
    }
  }
  
  /**
   * Invalidate tournament queries when data changes
   */
  private invalidateTournamentQueries(): void {
    console.log('TournamentService: Invalidating tournament queries');
    queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
  }
  
  /**
   * Invalidate specific tournament query when data changes
   */
  private invalidateTournamentQuery(id: string | number): void {
    console.log('TournamentService: Invalidating tournament query:', id);
    queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${id}`] });
  }
  
  /**
   * Invalidate registration queries when data changes
   */
  private invalidateRegistrationQueries(userId: number): void {
    console.log('TournamentService: Invalidating registration queries for user:', userId);
    queryClient.invalidateQueries({ 
      queryKey: [`/api/tournaments/registrations/user/${userId}`] 
    });
  }
}

// Create a singleton instance
export const tournamentService = new TournamentService();

// Export a hook to use the tournament service
export function useTournamentService() {
  return tournamentService;
}