/**
 * PCP Global Ranking Calculator for Pickle+
 * 
 * Implements the PCP Global Ranking System with:
 * - Separate rankings by age group, division, and category
 * - Rolling 52-week point accumulation
 * - Tournament placement-based points
 * - Format-specific divisions (singles, doubles, mixed)
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-06-03
 */

export interface TournamentResult {
  placement: 'winner' | 'runner_up' | 'semi_finalist' | 'quarter_finalist' | 'round_16' | 'round_32' | 'first_round' | 'round_robin';
  tournamentLevel: 'club' | 'district' | 'city' | 'provincial' | 'national' | 'regional' | 'international';
  drawSize: number;
  eventDate: Date;
  eventName: string;
  format: string; // 'mens_singles', 'womens_doubles', etc.
  division: string; // 'open', '35+', '45+', etc.
}

export interface MatchResult {
  isWin: boolean;
  matchDate: Date;
  matchType: 'casual' | 'league' | 'tournament';
  format: string;
  division: string;
}

export interface RankingPoint {
  points: number;
  eventName: string;
  eventType: 'tournament' | 'match';
  dateEarned: Date;
  expiresDate: Date;
  format: string;
  division: string;
}

export class PCPGlobalRankingCalculator {
  
  /**
   * Base point values for tournament placements
   * Note: Round robin matches count as first round matches (1 point base)
   */
  private static readonly TOURNAMENT_BASE_POINTS = {
    winner: 100,
    runner_up: 60,
    semi_finalist: 35,
    quarter_finalist: 20,
    round_16: 10,
    round_32: 5,
    first_round: 1,
    round_robin: 1  // Round robin matches = first round points
  };

  /**
   * Tournament level multipliers (Official Pickle+ Structure)
   */
  private static readonly TOURNAMENT_LEVEL_MULTIPLIERS = {
    club: 1.0,
    district: 1.05,
    city: 1.2,
    provincial: 2.0,
    national: 2.2,
    regional: 2.7,
    international: 3.5
  };

  /**
   * Draw size multipliers
   */
  private static readonly DRAW_SIZE_MULTIPLIERS = {
    small: 0.5,    // 4-8 players
    medium: 0.75,  // 9-16 players
    standard: 1.0, // 17-32 players
    large: 1.25,   // 33-64 players
    major: 1.5     // 65+ players
  };

  /**
   * Match points with reduced values for casual matches
   * Tournament-primary system: casual matches contribute reduced points
   */
  private static readonly MATCH_POINTS = {
    casual: {
      win: 1.5,   // 50% of original 3 points
      loss: 0.5   // 50% of original 1 point
    },
    league: {
      win: 2,     // 67% value (organized but not tournament)
      loss: 0.7   // 67% value
    },
    tournament: {
      win: 3,     // Full value for tournament matches
      loss: 1     // Full value
    }
  };

  /**
   * Calculate points for a tournament result
   */
  static calculateTournamentPoints(result: TournamentResult): number {
    const basePoints = this.TOURNAMENT_BASE_POINTS[result.placement as keyof typeof this.TOURNAMENT_BASE_POINTS];
    const levelMultiplier = this.TOURNAMENT_LEVEL_MULTIPLIERS[result.tournamentLevel as keyof typeof this.TOURNAMENT_LEVEL_MULTIPLIERS];
    const drawSizeMultiplier = this.getDrawSizeMultiplier(result.drawSize);
    
    return Math.round(basePoints * levelMultiplier * drawSizeMultiplier);
  }

  /**
   * Calculate points for a match result with type-specific values and anti-gaming limits
   */
  static calculateMatchPoints(result: MatchResult, opponentMatchCount: number = 0): number {
    const matchTypePoints = this.MATCH_POINTS[result.matchType as keyof typeof this.MATCH_POINTS];
    if (!matchTypePoints) {
      // Default to casual match points if type not recognized
      return result.isWin ? this.MATCH_POINTS.casual.win : this.MATCH_POINTS.casual.loss;
    }
    
    let basePoints = result.isWin ? matchTypePoints.win : matchTypePoints.loss;
    
    // Apply anti-gaming diminishing returns for frequent matches against same opponent
    if (result.matchType === 'casual' && opponentMatchCount > 0) {
      const reductionFactor = this.getOpponentFrequencyReduction(opponentMatchCount);
      basePoints *= reductionFactor;
    }
    
    return Math.round(basePoints * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Anti-gaming: Diminishing returns for frequent matches against same opponent
   */
  static getOpponentFrequencyReduction(matchCount: number): number {
    if (matchCount <= 2) return 1.0;        // Full points for first 3 matches
    if (matchCount <= 5) return 0.75;       // 75% for matches 4-6
    if (matchCount <= 10) return 0.5;       // 50% for matches 7-11
    return 0.25;                            // 25% for matches 12+
  }

  /**
   * Get draw size multiplier based on number of participants
   */
  private static getDrawSizeMultiplier(drawSize: number): number {
    if (drawSize <= 8) return this.DRAW_SIZE_MULTIPLIERS.small;
    if (drawSize <= 16) return this.DRAW_SIZE_MULTIPLIERS.medium;
    if (drawSize <= 32) return this.DRAW_SIZE_MULTIPLIERS.standard;
    if (drawSize <= 64) return this.DRAW_SIZE_MULTIPLIERS.large;
    return this.DRAW_SIZE_MULTIPLIERS.major;
  }

  /**
   * Calculate current ranking points from point history
   * Only counts points from last 52 weeks
   */
  static calculateCurrentRanking(pointHistory: RankingPoint[]): {
    currentPoints: number;
    activePoints: RankingPoint[];
    expiredPoints: RankingPoint[];
  } {
    const now = new Date();
    const fiftyTwoWeeksAgo = new Date(now.getTime() - (52 * 7 * 24 * 60 * 60 * 1000));

    const activePoints = pointHistory.filter(point => 
      point.dateEarned >= fiftyTwoWeeksAgo
    );

    const expiredPoints = pointHistory.filter(point => 
      point.dateEarned < fiftyTwoWeeksAgo
    );

    const currentPoints = activePoints.reduce((total, point) => total + point.points, 0);

    return {
      currentPoints,
      activePoints,
      expiredPoints
    };
  }

  /**
   * Calculate rankings for multiple categories with detailed breakdown
   * Separates points by format and division for proper category ranking
   */
  static calculateCategoryRankings(pointHistory: RankingPoint[]): {
    [key: string]: {
      currentPoints: number;
      activePoints: RankingPoint[];
      format: string;
      division: string;
      breakdown: {
        tournamentPoints: number;
        casualMatchPoints: number;
        leagueMatchPoints: number;
        totalMatchPoints: number;
      };
    }
  } {
    const now = new Date();
    const fiftyTwoWeeksAgo = new Date(now.getTime() - (52 * 7 * 24 * 60 * 60 * 1000));

    // Filter for active points only
    const activePoints = pointHistory.filter(point => 
      point.dateEarned >= fiftyTwoWeeksAgo
    );

    // Group by format and division
    const categoryRankings: { [key: string]: any } = {};

    activePoints.forEach(point => {
      const categoryKey = `${point.format}_${point.division}`;
      
      if (!categoryRankings[categoryKey]) {
        categoryRankings[categoryKey] = {
          currentPoints: 0,
          activePoints: [],
          format: point.format,
          division: point.division,
          breakdown: {
            tournamentPoints: 0,
            casualMatchPoints: 0,
            leagueMatchPoints: 0,
            totalMatchPoints: 0
          }
        };
      }

      categoryRankings[categoryKey].currentPoints += point.points;
      categoryRankings[categoryKey].activePoints.push(point);
      
      // Categorize points for transparent breakdown
      if (point.eventType === 'tournament') {
        categoryRankings[categoryKey].breakdown.tournamentPoints += point.points;
      } else if (point.eventName.includes('casual')) {
        categoryRankings[categoryKey].breakdown.casualMatchPoints += point.points;
        categoryRankings[categoryKey].breakdown.totalMatchPoints += point.points;
      } else if (point.eventName.includes('league')) {
        categoryRankings[categoryKey].breakdown.leagueMatchPoints += point.points;
        categoryRankings[categoryKey].breakdown.totalMatchPoints += point.points;
      } else {
        // Default to casual match points for unspecified matches
        categoryRankings[categoryKey].breakdown.casualMatchPoints += point.points;
        categoryRankings[categoryKey].breakdown.totalMatchPoints += point.points;
      }
    });

    return categoryRankings;
  }

  /**
   * Generate point expiration date (52 weeks from earn date)
   */
  static calculateExpirationDate(earnDate: Date): Date {
    const expirationDate = new Date(earnDate);
    expirationDate.setDate(expirationDate.getDate() + (52 * 7));
    return expirationDate;
  }

  /**
   * Create ranking point record from tournament result
   */
  static createTournamentRankingPoint(result: TournamentResult): RankingPoint {
    const points = this.calculateTournamentPoints(result);
    
    return {
      points,
      eventName: result.eventName,
      eventType: 'tournament',
      dateEarned: result.eventDate,
      expiresDate: this.calculateExpirationDate(result.eventDate),
      format: result.format,
      division: result.division
    };
  }

  /**
   * Create ranking point record from match result
   */
  static createMatchRankingPoint(result: MatchResult, eventName: string): RankingPoint {
    const points = this.calculateMatchPoints(result);
    
    return {
      points,
      eventName,
      eventType: 'match',
      dateEarned: result.matchDate,
      expiresDate: this.calculateExpirationDate(result.matchDate),
      format: result.format,
      division: result.division
    };
  }

  /**
   * Example calculations for documentation (Official Pickle+ Tournament Structure)
   */
  static getExampleCalculations(): Array<{
    scenario: string;
    calculation: string;
    points: number;
  }> {
    return [
      {
        scenario: "Club Tournament Winner (16 players)",
        calculation: "100 base × 1.0 level × 0.75 draw = 75 points",
        points: 75
      },
      {
        scenario: "District Tournament Runner-up (32 players)",
        calculation: "60 base × 1.05 level × 1.0 draw = 63 points",
        points: 63
      },
      {
        scenario: "City Tournament Semi-finalist (24 players)",
        calculation: "35 base × 1.2 level × 0.75 draw = 32 points",
        points: 32
      },
      {
        scenario: "Provincial Tournament Winner (64 players)",
        calculation: "100 base × 2.0 level × 1.25 draw = 250 points",
        points: 250
      },
      {
        scenario: "National Tournament Runner-up (128 players)",
        calculation: "60 base × 2.2 level × 1.5 draw = 198 points",
        points: 198
      },
      {
        scenario: "Regional Tournament Winner (96 players)",
        calculation: "100 base × 2.7 level × 1.5 draw = 405 points",
        points: 405
      },
      {
        scenario: "International Tournament Winner (256 players)",
        calculation: "100 base × 3.5 level × 1.5 draw = 525 points",
        points: 525
      },
      {
        scenario: "Round Robin Match (Club level)",
        calculation: "1 base × 1.0 level × 1.0 draw = 1 point",
        points: 1
      },
      {
        scenario: "Casual Match Win",
        calculation: "3 points (no multipliers)",
        points: 3
      },
      {
        scenario: "League Match Loss",
        calculation: "1 point (participation)",
        points: 1
      }
    ];
  }

  /**
   * Calculate ranking position based on points (would require database query)
   */
  static calculateRankingPosition(
    userPoints: number, 
    allPlayerPoints: number[], 
    format: string, 
    division: string
  ): {
    position: number;
    totalPlayers: number;
    percentile: number;
  } {
    // Sort points in descending order
    const sortedPoints = allPlayerPoints.sort((a, b) => b - a);
    
    // Find user's position (1-based ranking)
    const position = sortedPoints.findIndex(points => points <= userPoints) + 1;
    const totalPlayers = sortedPoints.length;
    const percentile = Math.round(((totalPlayers - position + 1) / totalPlayers) * 100);

    return {
      position,
      totalPlayers,
      percentile
    };
  }

  /**
   * Get points needed for next tier/milestone
   */
  static getPointsToNextMilestone(currentPoints: number): {
    nextMilestone: number;
    pointsNeeded: number;
    description: string;
  } {
    const milestones = [
      { points: 100, description: "Regional Player" },
      { points: 250, description: "Competitive Player" },
      { points: 500, description: "Advanced Player" },
      { points: 1000, description: "Elite Player" },
      { points: 2000, description: "Professional Level" },
      { points: 5000, description: "World Class" }
    ];

    for (const milestone of milestones) {
      if (currentPoints < milestone.points) {
        return {
          nextMilestone: milestone.points,
          pointsNeeded: milestone.points - currentPoints,
          description: milestone.description
        };
      }
    }

    return {
      nextMilestone: 10000,
      pointsNeeded: 10000 - currentPoints,
      description: "Legend Status"
    };
  }
}