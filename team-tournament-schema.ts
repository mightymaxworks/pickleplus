/**
 * PKL-278651-TEAM-0001 - Team Tournament Schema Design
 * 
 * Comprehensive team tournament system with flexible match formats,
 * rating/ranking point controls, and sophisticated team management.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

export interface TeamTournamentConfiguration {
  // Basic Tournament Info
  name: string;
  description: string;
  level: 'club' | 'district' | 'city' | 'provincial' | 'national' | 'regional' | 'international';
  
  // Team Structure
  teamSize: {
    minPlayers: number;
    maxPlayers: number;
    requiredMales?: number;
    requiredFemales?: number;
    allowSubstitutes: boolean;
    maxSubstitutes?: number;
  };
  
  // Match Format Configuration
  matchStructure: {
    totalMatches: number;
    matchTypes: Array<{
      type: 'singles' | 'doubles' | 'mixed_doubles';
      count: number;
      order: number;
      pointValue: number;
      description: string;
    }>;
    scoringSystem: 'match_wins' | 'total_points' | 'weighted_points';
    tiebreakRules: string[];
  };
  
  // Team Eligibility Controls
  eligibilityCriteria: {
    // Rating-based restrictions
    teamRatingLimits: {
      maxTotalDUPR?: number;          // Sum of all team member DUPR ratings
      maxAverageDUPR?: number;        // Average team DUPR rating
      minAverageDUPR?: number;        // Minimum average team skill level
      allowUnratedPlayers: boolean;
      unratedPlayerDUPRAssumption?: number;
    };
    
    // Ranking point restrictions  
    teamRankingLimits: {
      maxTotalRankingPoints?: number;  // Sum of all team member ranking points
      maxAverageRankingPoints?: number; // Average team ranking points
      minTotalRankingPoints?: number;   // Minimum team experience level
      allowNewPlayers: boolean;         // Players with 0 ranking points
    };
    
    // Individual player requirements
    individualPlayerCriteria: {
      minDUPR?: number;
      maxDUPR?: number;
      minRankingPoints?: number;
      maxRankingPoints?: number;
      requireVerifiedRating: boolean;
      allowSelfRating: boolean;
      minTournamentsPlayed?: number;
      maxHandicapRating?: number;
    };
    
    // Advanced restrictions
    advancedRestrictions: {
      residencyRequirement?: string;
      membershipRequirement?: string;
      ageRestrictions?: {
        minAge?: number;
        maxAge?: number;
        averageAgeLimit?: number;
      };
      professionalStatus: 'amateur_only' | 'semi_pro_allowed' | 'professional_allowed' | 'mixed';
      genderRequirements?: 'men_only' | 'women_only' | 'mixed_required' | 'open';
    };
  };
  
  // Lineup and Strategy Rules
  lineupRules: {
    lineupSubmissionDeadline: 'tournament_start' | 'day_before' | 'round_start' | 'match_start';
    allowLineupChanges: boolean;
    lineupChangeDeadline?: string;
    playingTimeRequirements?: {
      minMatchesPerPlayer?: number;
      maxMatchesPerPlayer?: number;
      mustRotatePlayers: boolean;
    };
    strengthOrderRequirements?: {
      enforceStrengthOrder: boolean; // Strongest players in key positions
      keyPositions?: number[];       // Which match positions are "key"
    };
  };
  
  // Tournament Format
  tournamentStructure: {
    format: 'round_robin' | 'single_elimination' | 'double_elimination' | 'swiss' | 'pool_play_playoff';
    poolSettings?: {
      teamsPerPool: number;
      poolAdvancement: number; // How many teams advance from each pool
    };
    playoffSettings?: {
      playoffFormat: 'single_elimination' | 'double_elimination';
      numberOfRounds: number;
    };
  };
}

export interface TeamRegistrationData {
  teamInfo: {
    teamName: string;
    teamCaptain: {
      userId: number;
      name: string;
      email: string;
      phone?: string;
    };
    teamDescription?: string;
    teamLogo?: string;
    homeClub?: string;
    sponsorship?: string;
  };
  
  players: Array<{
    userId: number;
    name: string;
    email: string;
    duprRating?: number;
    rankingPoints: number;
    verifiedRating: boolean;
    role: 'captain' | 'player' | 'substitute';
    playerNumber?: number;
    position?: string;
  }>;
  
  proposedLineup?: {
    [matchPosition: number]: {
      matchType: 'singles' | 'doubles' | 'mixed_doubles';
      players: number[]; // User IDs of players for this match
    };
  };
}

export interface MatchResult {
  teamMatchId: number;
  individualMatches: Array<{
    matchType: 'singles' | 'doubles' | 'mixed_doubles';
    position: number;
    team1Players: number[];
    team2Players: number[];
    winner: 'team1' | 'team2';
    score: string;
    pointsAwarded: number;
  }>;
  teamWinner: 'team1' | 'team2';
  totalPointsTeam1: number;
  totalPointsTeam2: number;
}

/**
 * Example Team Tournament Configurations
 */

export const EXAMPLE_TEAM_TOURNAMENTS: TeamTournamentConfiguration[] = [
  {
    name: "Elite Club Championship",
    description: "High-level team competition with strict rating controls",
    level: 'club',
    teamSize: {
      minPlayers: 4,
      maxPlayers: 6,
      requiredMales: 2,
      requiredFemales: 2,
      allowSubstitutes: true,
      maxSubstitutes: 2
    },
    matchStructure: {
      totalMatches: 5,
      matchTypes: [
        { type: 'doubles', count: 2, order: 1, pointValue: 1, description: 'Men\'s and Women\'s Doubles' },
        { type: 'mixed_doubles', count: 2, order: 2, pointValue: 1, description: 'Two Mixed Doubles Matches' },
        { type: 'singles', count: 1, order: 3, pointValue: 2, description: 'Decisive Singles Match' }
      ],
      scoringSystem: 'weighted_points',
      tiebreakRules: ['Total games won', 'Head-to-head record', 'Ranking points differential']
    },
    eligibilityCriteria: {
      teamRatingLimits: {
        maxTotalDUPR: 20.0,
        maxAverageDUPR: 5.0,
        minAverageDUPR: 4.0,
        allowUnratedPlayers: false
      },
      teamRankingLimits: {
        maxTotalRankingPoints: 10000,
        minTotalRankingPoints: 2000,
        allowNewPlayers: false
      },
      individualPlayerCriteria: {
        minDUPR: 3.5,
        maxDUPR: 5.5,
        minRankingPoints: 300,
        requireVerifiedRating: true,
        allowSelfRating: false,
        minTournamentsPlayed: 3
      },
      advancedRestrictions: {
        membershipRequirement: 'Local Club Membership',
        professionalStatus: 'amateur_only',
        genderRequirements: 'mixed_required'
      }
    },
    lineupRules: {
      lineupSubmissionDeadline: 'day_before',
      allowLineupChanges: false,
      playingTimeRequirements: {
        minMatchesPerPlayer: 1,
        maxMatchesPerPlayer: 3,
        mustRotatePlayers: true
      },
      strengthOrderRequirements: {
        enforceStrengthOrder: true,
        keyPositions: [5] // Singles match is key position
      }
    },
    tournamentStructure: {
      format: 'pool_play_playoff',
      poolSettings: {
        teamsPerPool: 4,
        poolAdvancement: 2
      },
      playoffSettings: {
        playoffFormat: 'single_elimination',
        numberOfRounds: 3
      }
    }
  },
  
  {
    name: "Open Community League",
    description: "Inclusive team tournament welcoming all skill levels",
    level: 'club',
    teamSize: {
      minPlayers: 3,
      maxPlayers: 8,
      allowSubstitutes: true,
      maxSubstitutes: 3
    },
    matchStructure: {
      totalMatches: 3,
      matchTypes: [
        { type: 'doubles', count: 2, order: 1, pointValue: 1, description: 'Two Doubles Matches' },
        { type: 'mixed_doubles', count: 1, order: 2, pointValue: 1, description: 'Mixed Doubles Match' }
      ],
      scoringSystem: 'match_wins',
      tiebreakRules: ['Total games won', 'Coin flip']
    },
    eligibilityCriteria: {
      teamRatingLimits: {
        allowUnratedPlayers: true,
        unratedPlayerDUPRAssumption: 3.0
      },
      teamRankingLimits: {
        allowNewPlayers: true
      },
      individualPlayerCriteria: {
        requireVerifiedRating: false,
        allowSelfRating: true,
        minTournamentsPlayed: 0
      },
      advancedRestrictions: {
        professionalStatus: 'mixed',
        genderRequirements: 'open'
      }
    },
    lineupRules: {
      lineupSubmissionDeadline: 'match_start',
      allowLineupChanges: true,
      playingTimeRequirements: {
        mustRotatePlayers: false
      },
      strengthOrderRequirements: {
        enforceStrengthOrder: false
      }
    },
    tournamentStructure: {
      format: 'round_robin'
    }
  }
];

export default TeamTournamentConfiguration;