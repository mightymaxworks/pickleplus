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
    const basePoints = this.TOURNAMENT_BASE_POINTS[result.placement as keyof typeof this.TOURNAMENT_BASE_POINTS];
    const levelMultiplier = this.TOURNAMENT_LEVEL_MULTIPLIERS[result.tournamentLevel as keyof typeof this.TOURNAMENT_LEVEL_MULTIPLIERS];
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