/**
 * ATP-Style Ranking Calculator for Pickle+
 * 
 * Implements a unified ranking system similar to ATP tennis rankings:
 * - Single ranking number per format/division
 * - Rolling 52-week point accumulation
 * - Tournament placement-based points
 * - Automatic point decay
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

export interface TournamentResult {
  placement: 'winner' | 'runner_up' | 'semi_finalist' | 'quarter_finalist' | 'round_16' | 'round_32' | 'first_round';
  tournamentLevel: 'club' | 'regional' | 'state' | 'national' | 'international';
  drawSize: number;
  eventDate: Date;
  eventName: string;
  format: string; // 'mens_singles', 'womens_doubles', etc.
  division: string; // 'open', '35+', '45+', etc.
}

export interface MatchResult {
  isWin: boolean;
  matchDate: Date;
  matchType: 'casual' | 'league';
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

export class ATPRankingCalculator {
  
  /**
   * Base point values for tournament placements
   */
  private static readonly TOURNAMENT_BASE_POINTS = {
    winner: 100,
    runner_up: 60,
    semi_finalist: 35,
    quarter_finalist: 20,
    round_16: 10,
    round_32: 5,
    first_round: 1
  };

  /**
   * Tournament level multipliers
   */
  private static readonly TOURNAMENT_LEVEL_MULTIPLIERS = {
    club: 1.0,
    regional: 2.0,
    state: 3.0,
    national: 5.0,
    international: 8.0
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
   * Match points (casual/league)
   */
  private static readonly MATCH_POINTS = {
    win: 3,
    loss: 1
  };

  /**
   * Calculate points for a tournament result
   */
  static calculateTournamentPoints(result: TournamentResult): number {
    const basePoints = this.TOURNAMENT_BASE_POINTS[result.placement];
    const levelMultiplier = this.TOURNAMENT_LEVEL_MULTIPLIERS[result.tournamentLevel];
    const drawSizeMultiplier = this.getDrawSizeMultiplier(result.drawSize);
    
    return Math.round(basePoints * levelMultiplier * drawSizeMultiplier);
  }

  /**
   * Calculate points for a match result
   */
  static calculateMatchPoints(result: MatchResult): number {
    return result.isWin ? this.MATCH_POINTS.win : this.MATCH_POINTS.loss;
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
   * Example calculations for documentation
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
        scenario: "Regional Tournament Runner-up (32 players)",
        calculation: "60 base × 2.0 level × 1.0 draw = 120 points",
        points: 120
      },
      {
        scenario: "National Tournament Semi-finalist (64 players)",
        calculation: "35 base × 5.0 level × 1.25 draw = 219 points",
        points: 219
      },
      {
        scenario: "International Tournament Winner (128 players)",
        calculation: "100 base × 8.0 level × 1.5 draw = 1200 points",
        points: 1200
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