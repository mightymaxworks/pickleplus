/**
 * PKL-278651-MATCH-0007-TICKER - Latest Match Status Service
 * 
 * StatusTickerService - Provides data about current matches, community activity,
 * and system updates for display in the live ticker component.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

// Types for Status Ticker data
export interface RecentMatch {
  id: number;
  date: string;
  formatType: string;
  players: {
    displayName: string;
    score: number;
    isWinner: boolean;
  }[];
  location?: string;
}

export interface SystemUpdate {
  id: string;
  message: string;
  timestamp: Date;
  category: 'feature' | 'improvement' | 'fix' | 'event';
}

export interface CommunityStats {
  matchesPlayed: number;
  activeTournaments: number;
  userMilestone?: string;
  lastUpdated: Date;
}

export interface UpcomingEvents {
  nextEvents: {
    id: string;
    name: string;
    date: string;
    location: string;
  }[];
}

// Service to provide data for the status ticker
class StatusTickerService {
  private recentMatchesCache: RecentMatch[] | null = null;
  private systemUpdatesCache: SystemUpdate[] | null = null;
  private communityStatsCache: CommunityStats | null = null;
  private upcomingEventsCache: UpcomingEvents | null = null;
  
  /**
   * Get list of recent matches
   * @returns Array of recent matches
   */
  async getRecentMatches(): Promise<RecentMatch[]> {
    try {
      // In a production environment, fetch from API
      const response = await fetch('/api/match/recent?limit=5');
      if (response.ok) {
        const matches = await response.json();
        // Transform the data into the format we need
        // Define explicit interface for API response to avoid 'any' type
        interface MatchResponse {
          id: number;
          date: string;
          formatType: string;
          players: {
            userId: number;
            score: number;
            isWinner: boolean;
          }[];
          playerNames: {
            [key: number]: {
              displayName: string;
              username: string;
            }
          };
          location?: string;
        }
        
        this.recentMatchesCache = matches.map((match: MatchResponse) => ({
          id: match.id,
          date: match.date,
          formatType: match.formatType,
          players: match.players.map((player) => ({
            displayName: match.playerNames[player.userId]?.displayName || 'Player',
            score: player.score,
            isWinner: player.isWinner
          })),
          location: match.location
        }));
      }
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      // Fallback to cached data if API fails
      if (!this.recentMatchesCache) {
        // Provide minimal data structure if cache is empty
        this.recentMatchesCache = [];
      }
    }
    
    return this.recentMatchesCache || [];
  }
  
  /**
   * Get current system updates
   * @returns Array of system updates
   */
  async getSystemUpdates(): Promise<SystemUpdate[]> {
    try {
      // In a production environment, fetch from API
      // For now return recent updates
      this.systemUpdatesCache = [
        {
          id: 'sys-update-1',
          message: 'New tournament bracket visualization released',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          category: 'feature'
        },
        {
          id: 'sys-update-2',
          message: 'CourtIQ rating system accuracy improved',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          category: 'improvement'
        },
        {
          id: 'sys-update-3',
          message: 'Registration open for Summer Championship Series',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          category: 'event'
        }
      ];
    } catch (error) {
      console.error('Error fetching system updates:', error);
      if (!this.systemUpdatesCache) {
        this.systemUpdatesCache = [];
      }
    }
    
    return this.systemUpdatesCache || [];
  }
  
  /**
   * Get community statistics
   * @returns Community stats object
   */
  async getCommunityStats(): Promise<CommunityStats> {
    try {
      // In a production environment, fetch from API
      this.communityStatsCache = {
        matchesPlayed: 4752,
        activeTournaments: 12,
        userMilestone: 'Laura S. reached Elite status!',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      if (!this.communityStatsCache) {
        this.communityStatsCache = {
          matchesPlayed: 0,
          activeTournaments: 0,
          lastUpdated: new Date()
        };
      }
    }
    
    return this.communityStatsCache;
  }
  
  /**
   * Get upcoming events
   * @returns Upcoming events object
   */
  async getUpcomingEvents(): Promise<UpcomingEvents> {
    try {
      // In a production environment, fetch from API
      this.upcomingEventsCache = {
        nextEvents: [
          {
            id: 'event-1',
            name: 'Regional Tournament',
            date: '2025-05-15',
            location: 'Central Courts'
          },
          {
            id: 'event-2',
            name: 'Beginner Workshop',
            date: '2025-05-02',
            location: 'Community Center'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      if (!this.upcomingEventsCache) {
        this.upcomingEventsCache = {
          nextEvents: []
        };
      }
    }
    
    return this.upcomingEventsCache;
  }
  
  /**
   * Reset all caches to fetch fresh data
   */
  clearCache(): void {
    this.recentMatchesCache = null;
    this.systemUpdatesCache = null;
    this.communityStatsCache = null;
    this.upcomingEventsCache = null;
  }
}

// Export a singleton instance
export const bounceStatusService = new StatusTickerService();