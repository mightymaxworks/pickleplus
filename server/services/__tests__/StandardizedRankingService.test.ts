/**
 * Comprehensive Test Suite for Standardized Ranking Service
 * 
 * Tests all calculation scenarios to ensure consistency and correctness
 */

import { StandardizedRankingService } from '../StandardizedRankingService';

describe('StandardizedRankingService', () => {
  
  describe('calculateRankingPoints', () => {
    
    describe('Casual Matches', () => {
      test('should calculate correct points for casual win', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'casual');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(1.5); // 3 * 0.5
        expect(result.displayPoints).toBe(3);
        expect(result.matchType).toBe('casual');
        expect(result.isWinner).toBe(true);
      });

      test('should calculate correct points for casual loss', () => {
        const result = StandardizedRankingService.calculateRankingPoints(false, 'casual');
        
        expect(result.basePoints).toBe(1);
        expect(result.weightedPoints).toBe(0.5); // 1 * 0.5
        expect(result.displayPoints).toBe(1);
        expect(result.matchType).toBe('casual');
        expect(result.isWinner).toBe(false);
      });
    });

    describe('League Matches', () => {
      test('should calculate correct points for league win', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'league');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(2.0); // 3 * 0.67 ≈ 2.0
        expect(result.displayPoints).toBe(3);
        expect(result.matchType).toBe('league');
        expect(result.isWinner).toBe(true);
      });

      test('should calculate correct points for league loss', () => {
        const result = StandardizedRankingService.calculateRankingPoints(false, 'league');
        
        expect(result.basePoints).toBe(1);
        expect(result.weightedPoints).toBe(0.7); // 1 * 0.67 ≈ 0.7
        expect(result.displayPoints).toBe(1);
        expect(result.matchType).toBe('league');
        expect(result.isWinner).toBe(false);
      });
    });

    describe('Tournament Matches', () => {
      test('should calculate correct points for tournament win without tier', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(3.0); // 3 * 1.0
        expect(result.displayPoints).toBe(3);
        expect(result.matchType).toBe('tournament');
        expect(result.isWinner).toBe(true);
        expect(result.tierMultiplier).toBe(1.0);
      });

      test('should calculate correct points for tournament loss without tier', () => {
        const result = StandardizedRankingService.calculateRankingPoints(false, 'tournament');
        
        expect(result.basePoints).toBe(1);
        expect(result.weightedPoints).toBe(1.0); // 1 * 1.0
        expect(result.displayPoints).toBe(1);
        expect(result.matchType).toBe('tournament');
        expect(result.isWinner).toBe(false);
      });
    });

    describe('Tournament Tiers', () => {
      test('should apply club tier multiplier correctly', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'club');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(3.0); // 3 * 1.0 * 1.0
        expect(result.displayPoints).toBe(3.0); // 3 * 1.0
        expect(result.tierMultiplier).toBe(1.0);
      });

      test('should apply district tier multiplier correctly', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'district');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(3.6); // 3 * 1.0 * 1.2
        expect(result.displayPoints).toBe(3.6); // 3 * 1.2
        expect(result.tierMultiplier).toBe(1.2);
      });

      test('should apply regional tier multiplier correctly', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'regional');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(7.5); // 3 * 1.0 * 2.5
        expect(result.displayPoints).toBe(7.5); // 3 * 2.5
        expect(result.tierMultiplier).toBe(2.5);
      });

      test('should apply national tier multiplier correctly', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'national');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(9.0); // 3 * 1.0 * 3.0
        expect(result.displayPoints).toBe(9.0); // 3 * 3.0
        expect(result.tierMultiplier).toBe(3.0);
      });

      test('should apply international tier multiplier correctly', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'international');
        
        expect(result.basePoints).toBe(3);
        expect(result.weightedPoints).toBe(12.0); // 3 * 1.0 * 4.0
        expect(result.displayPoints).toBe(12.0); // 3 * 4.0
        expect(result.tierMultiplier).toBe(4.0);
      });

      test('should apply tier multiplier to losses as well', () => {
        const result = StandardizedRankingService.calculateRankingPoints(false, 'tournament', 'international');
        
        expect(result.basePoints).toBe(1);
        expect(result.weightedPoints).toBe(4.0); // 1 * 1.0 * 4.0
        expect(result.displayPoints).toBe(4.0); // 1 * 4.0
        expect(result.tierMultiplier).toBe(4.0);
      });
    });

    describe('Breakdown Information', () => {
      test('should provide detailed breakdown for casual match', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'casual');
        
        expect(result.breakdown.baseCalculation).toBe('Win: 3 base points');
        expect(result.breakdown.weightApplied).toBe('casual weight (0.5x): 1.5 points');
        expect(result.breakdown.tierMultiplier).toBe('No tier multiplier applied');
        expect(result.breakdown.finalResult).toBe('Display: 3, Competitive: 1.5');
      });

      test('should provide detailed breakdown for tournament with tier', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'national');
        
        expect(result.breakdown.baseCalculation).toBe('Win: 3 base points');
        expect(result.breakdown.weightApplied).toBe('tournament weight (1x): 3 points');
        expect(result.breakdown.tierMultiplier).toBe('national tier (3x): 9 points');
        expect(result.breakdown.finalResult).toBe('Display: 9, Competitive: 9');
      });
    });

    describe('Edge Cases', () => {
      test('should handle undefined tournament tier gracefully', () => {
        const result = StandardizedRankingService.calculateRankingPoints(true, 'tournament', undefined);
        
        expect(result.tierMultiplier).toBe(1.0);
        expect(result.weightedPoints).toBe(3.0);
        expect(result.displayPoints).toBe(3.0);
      });

      test('should handle invalid tournament tier gracefully', () => {
        const result = StandardizedRankingService.calculateRankingPoints(
          true, 
          'tournament', 
          'invalid_tier' as any
        );
        
        expect(result.tierMultiplier).toBe(1.0);
        expect(result.weightedPoints).toBe(3.0);
        expect(result.displayPoints).toBe(3.0);
      });
    });
  });

  describe('validateCalculations', () => {
    test('should pass all validation test cases', () => {
      const validationResults = StandardizedRankingService.validateCalculations();
      
      // All test cases should pass
      validationResults.forEach(result => {
        expect(result.passes).toBe(true);
      });

      // Check specific scenarios
      const casualWin = validationResults.find(r => r.scenario === 'Casual win');
      expect(casualWin?.expected).toBe(1.5);
      expect(casualWin?.actual).toBe(1.5);

      const nationalTournament = validationResults.find(r => r.scenario === 'National tournament win');
      expect(nationalTournament?.expected).toBe(9.0);
      expect(nationalTournament?.actual).toBe(9.0);

      const internationalTournament = validationResults.find(r => r.scenario === 'International tournament win');
      expect(internationalTournament?.expected).toBe(12.0);
      expect(internationalTournament?.actual).toBe(12.0);
    });

    test('should provide comprehensive test coverage', () => {
      const validationResults = StandardizedRankingService.validateCalculations();
      
      // Should test all match types
      expect(validationResults.some(r => r.scenario.includes('Casual'))).toBe(true);
      expect(validationResults.some(r => r.scenario.includes('League'))).toBe(true);
      expect(validationResults.some(r => r.scenario.includes('Tournament'))).toBe(true);
      
      // Should test both wins and losses
      expect(validationResults.some(r => r.scenario.includes('win'))).toBe(true);
      expect(validationResults.some(r => r.scenario.includes('loss'))).toBe(true);
      
      // Should test tournament tiers
      expect(validationResults.some(r => r.scenario.includes('National'))).toBe(true);
      expect(validationResults.some(r => r.scenario.includes('International'))).toBe(true);
    });
  });

  describe('Mathematical Consistency', () => {
    test('should maintain mathematical relationships between match types', () => {
      const casualWin = StandardizedRankingService.calculateRankingPoints(true, 'casual');
      const leagueWin = StandardizedRankingService.calculateRankingPoints(true, 'league');
      const tournamentWin = StandardizedRankingService.calculateRankingPoints(true, 'tournament');
      
      // Tournament should be worth most, casual least
      expect(tournamentWin.weightedPoints).toBeGreaterThan(leagueWin.weightedPoints);
      expect(leagueWin.weightedPoints).toBeGreaterThan(casualWin.weightedPoints);
      
      // Specific ratios should be maintained
      expect(leagueWin.weightedPoints / casualWin.weightedPoints).toBeCloseTo(1.33, 1); // 0.67/0.5
      expect(tournamentWin.weightedPoints / casualWin.weightedPoints).toBe(2); // 1.0/0.5
    });

    test('should maintain consistent tier multiplier progression', () => {
      const club = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'club');
      const district = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'district');
      const regional = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'regional');
      const national = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'national');
      const international = StandardizedRankingService.calculateRankingPoints(true, 'tournament', 'international');
      
      // Each tier should be worth more than the previous
      expect(district.weightedPoints).toBeGreaterThan(club.weightedPoints);
      expect(regional.weightedPoints).toBeGreaterThan(district.weightedPoints);
      expect(national.weightedPoints).toBeGreaterThan(regional.weightedPoints);
      expect(international.weightedPoints).toBeGreaterThan(national.weightedPoints);
    });
  });
});