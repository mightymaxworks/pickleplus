/**
 * Gender Balance Service - Cross-Gender Match Fairness System
 * 
 * Implements sophisticated gender balance algorithm for fair cross-gender competition
 * while maintaining competitive integrity within same-gender matches.
 * 
 * @version 1.0.0 - COMPREHENSIVE GENDER BALANCE
 * @lastModified 2025-08-06
 * @framework PicklePlus Algorithm v4.0
 */

export interface Player {
  id: number;
  gender: 'male' | 'female';
  name: string;
  rankingPoints: number; // Required for skill-based logic
}

export interface Team {
  players: Player[];
  teamType: 'mens' | 'womens' | 'mixed';
}

export interface GenderBalanceResult {
  isCrossGenderMatch: boolean;
  genderMultipliers: {
    team1: number;
    team2: number;
  };
  competitionType: 'same-gender' | 'cross-gender' | 'mixed-competition';
  explanation: string;
}

export class GenderBalanceService {
  
  /**
   * Elite threshold for gender bonus eligibility
   */
  private static readonly ELITE_THRESHOLD = 1000;
  
  /**
   * Base gender multipliers - only applied in cross-gender competition for players <1000 points
   */
  private static readonly GENDER_MULTIPLIERS = {
    male: 1.0,
    female: 1.15
  } as const;

  /**
   * Determine if this is a cross-gender match requiring balance adjustments
   */
  static isCrossGenderMatch(team1: Team, team2: Team): boolean {
    const team1Type = this.determineTeamGenderType(team1);
    const team2Type = this.determineTeamGenderType(team2);
    
    // Cross-gender occurs when different team types face each other
    return team1Type !== team2Type;
  }

  /**
   * Determine team gender composition type
   */
  private static determineTeamGenderType(team: Team): 'mens' | 'womens' | 'mixed' {
    const maleCount = team.players.filter(p => p.gender === 'male').length;
    const femaleCount = team.players.filter(p => p.gender === 'female').length;

    if (maleCount > 0 && femaleCount > 0) {
      return 'mixed';
    } else if (maleCount > 0) {
      return 'mens';
    } else {
      return 'womens';
    }
  }

  /**
   * Check if any player in team meets elite threshold
   */
  static hasElitePlayer(team: Team): boolean {
    return team.players.some(player => player.rankingPoints >= this.ELITE_THRESHOLD);
  }

  /**
   * Check if match has any elite players (which disables all gender bonuses)
   */
  static matchHasElitePlayer(team1: Team, team2: Team): boolean {
    return this.hasElitePlayer(team1) || this.hasElitePlayer(team2);
  }

  /**
   * Calculate team gender multiplier based on player composition and skill level
   */
  static calculateTeamGenderMultiplier(team: Team, isCrossGender: boolean, hasElitePlayer: boolean): number {
    // Same-gender matches always use 1.0x multiplier
    if (!isCrossGender) {
      return 1.0;
    }

    // Elite players present - no gender bonuses for anyone
    if (hasElitePlayer) {
      return 1.0;
    }

    // Cross-gender matches at development level use gender-specific multipliers
    const totalMultiplier = team.players.reduce((sum, player) => {
      return sum + this.GENDER_MULTIPLIERS[player.gender];
    }, 0);

    return totalMultiplier / team.players.length;
  }

  /**
   * Comprehensive gender balance calculation for match with skill-based logic
   */
  static calculateGenderBalance(
    team1: Team,
    team2: Team,
    tournamentDivision?: 'open' | 'mens' | 'womens' | 'mixed'
  ): GenderBalanceResult {
    
    // Check tournament division override
    if (tournamentDivision && tournamentDivision !== 'open') {
      return {
        isCrossGenderMatch: false,
        genderMultipliers: { team1: 1.0, team2: 1.0 },
        competitionType: 'same-gender',
        explanation: `Gender-specific division (${tournamentDivision}) - no gender adjustments applied`
      };
    }

    const isCrossGender = this.isCrossGenderMatch(team1, team2);
    const hasElitePlayer = this.matchHasElitePlayer(team1, team2);
    
    const team1Multiplier = this.calculateTeamGenderMultiplier(team1, isCrossGender, hasElitePlayer);
    const team2Multiplier = this.calculateTeamGenderMultiplier(team2, isCrossGender, hasElitePlayer);

    let competitionType: 'same-gender' | 'cross-gender' | 'mixed-competition';
    let explanation: string;

    if (!isCrossGender) {
      competitionType = 'same-gender';
      explanation = 'Same-gender match - standard 1.0x multipliers applied';
    } else if (hasElitePlayer) {
      competitionType = 'cross-gender';
      const team1Type = this.determineTeamGenderType(team1);
      const team2Type = this.determineTeamGenderType(team2);
      explanation = `Cross-gender match (${team1Type} vs ${team2Type}) with elite player(s) ≥${this.ELITE_THRESHOLD} points - no gender bonuses applied`;
    } else {
      competitionType = 'cross-gender';
      const team1Type = this.determineTeamGenderType(team1);
      const team2Type = this.determineTeamGenderType(team2);
      explanation = `Cross-gender match (${team1Type} vs ${team2Type}) at development level - gender balance multipliers applied`;
    }

    return {
      isCrossGenderMatch: isCrossGender,
      genderMultipliers: {
        team1: team1Multiplier,
        team2: team2Multiplier
      },
      competitionType,
      explanation
    };
  }

  /**
   * Validate gender balance settings for match recording
   */
  static validateGenderBalance(
    team1Players: Player[],
    team2Players: Player[],
    expectedGenderMultipliers?: { team1: number; team2: number }
  ): { isValid: boolean; message: string } {
    
    const team1: Team = { players: team1Players, teamType: 'mixed' };
    const team2: Team = { players: team2Players, teamType: 'mixed' };
    
    const result = this.calculateGenderBalance(team1, team2);
    
    if (expectedGenderMultipliers) {
      const team1Match = Math.abs(result.genderMultipliers.team1 - expectedGenderMultipliers.team1) < 0.01;
      const team2Match = Math.abs(result.genderMultipliers.team2 - expectedGenderMultipliers.team2) < 0.01;
      
      if (!team1Match || !team2Match) {
        return {
          isValid: false,
          message: `Gender multiplier mismatch. Expected: Team1=${expectedGenderMultipliers.team1}, Team2=${expectedGenderMultipliers.team2}. Calculated: Team1=${result.genderMultipliers.team1}, Team2=${result.genderMultipliers.team2}`
        };
      }
    }

    return {
      isValid: true,
      message: result.explanation
    };
  }

  /**
   * Get detailed gender balance explanation for UI display with skill analysis
   */
  static getGenderBalanceExplanation(team1: Team, team2: Team): {
    summary: string;
    details: string[];
    recommendations: string[];
  } {
    const result = this.calculateGenderBalance(team1, team2);
    const team1Type = this.determineTeamGenderType(team1);
    const team2Type = this.determineTeamGenderType(team2);
    const hasElitePlayer = this.matchHasElitePlayer(team1, team2);

    const details: string[] = [];
    const recommendations: string[] = [];

    // Add player skill level information
    const team1Points = team1.players.map(p => p.rankingPoints);
    const team2Points = team2.players.map(p => p.rankingPoints);
    details.push(`Team 1 points: [${team1Points.join(', ')}]`);
    details.push(`Team 2 points: [${team2Points.join(', ')}]`);

    if (result.isCrossGenderMatch) {
      details.push(`Cross-gender competition detected: ${team1Type} vs ${team2Type}`);
      
      if (hasElitePlayer) {
        details.push(`Elite player(s) ≥${this.ELITE_THRESHOLD} points present - gender bonuses disabled`);
        details.push(`Both teams: 1.0x multiplier (elite override)`);
        recommendations.push('Elite-level competition uses skill-based scoring without gender adjustments');
      } else {
        details.push(`All players <${this.ELITE_THRESHOLD} points - gender bonuses active`);
        details.push(`Team 1 gender multiplier: ${result.genderMultipliers.team1.toFixed(3)}x`);
        details.push(`Team 2 gender multiplier: ${result.genderMultipliers.team2.toFixed(3)}x`);
        
        if (team1Type === 'womens' && result.genderMultipliers.team1 > 1.0) {
          recommendations.push('Women\'s team receives 15% bonus points for development-level cross-gender competition');
        } else if (team2Type === 'womens' && result.genderMultipliers.team2 > 1.0) {
          recommendations.push('Women\'s team receives 15% bonus points for development-level cross-gender competition');
        }
        
        if ((team1Type === 'mixed' || team2Type === 'mixed') && (result.genderMultipliers.team1 > 1.0 || result.genderMultipliers.team2 > 1.0)) {
          recommendations.push('Mixed team receives balanced multiplier based on gender composition');
        }
      }
    } else {
      details.push(`Same-gender competition: ${team1Type} vs ${team2Type}`);
      details.push('Standard 1.0x multipliers applied to both teams');
      recommendations.push('Equal competitive treatment for same-gender matches');
    }

    return {
      summary: result.explanation,
      details,
      recommendations
    };
  }

  /**
   * Calculate points with gender balance applied
   */
  static calculatePointsWithGenderBalance(
    basePoints: number,
    ageMultiplier: number,
    matchTypeWeight: number,
    tournamentTier: number,
    genderMultiplier: number
  ): number {
    return Math.round(
      (basePoints * ageMultiplier * genderMultiplier * matchTypeWeight * tournamentTier) * 100
    ) / 100;
  }

  /**
   * Get gender balance statistics for reporting
   */
  static getGenderBalanceStats(matches: any[]): {
    totalMatches: number;
    crossGenderMatches: number;
    sameGenderMatches: number;
    genderBonusApplied: number;
    averageGenderMultiplier: number;
  } {
    let crossGenderMatches = 0;
    let genderBonusApplied = 0;
    let totalMultiplier = 0;

    matches.forEach(match => {
      if (match.genderMultiplier && match.genderMultiplier > 1.0) {
        genderBonusApplied++;
        crossGenderMatches++;
      }
      totalMultiplier += match.genderMultiplier || 1.0;
    });

    return {
      totalMatches: matches.length,
      crossGenderMatches,
      sameGenderMatches: matches.length - crossGenderMatches,
      genderBonusApplied,
      averageGenderMultiplier: matches.length > 0 ? totalMultiplier / matches.length : 1.0
    };
  }
}

export default GenderBalanceService;