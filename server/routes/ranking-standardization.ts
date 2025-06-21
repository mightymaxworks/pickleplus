/**
 * Ranking Standardization Migration Routes
 * 
 * Provides endpoints to migrate existing data to the new standardized system
 * and test the new calculations
 */

import { Router } from 'express';
import { StandardizedRankingService } from '../services/StandardizedRankingService';
import { db } from '../db';
import { matches, users, rankingTransactions } from '@shared/schema';
import { eq, sql, desc } from 'drizzle-orm';

const router = Router();

/**
 * Test endpoint to validate standardized calculations
 */
router.get('/api/ranking/test-calculations', async (req, res) => {
  try {
    const validationResults = StandardizedRankingService.validateCalculations();
    const allPassed = validationResults.every(result => result.passes);
    
    res.json({
      success: true,
      allTestsPassed: allPassed,
      results: validationResults,
      summary: {
        total: validationResults.length,
        passed: validationResults.filter(r => r.passes).length,
        failed: validationResults.filter(r => !r.passes).length
      }
    });
  } catch (error) {
    console.error('Error running calculation tests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to run calculation tests',
      details: error.message 
    });
  }
});

/**
 * Calculate points for a specific scenario (for testing)
 */
router.post('/api/ranking/calculate', async (req, res) => {
  try {
    const { isWinner, matchType, tournamentTier } = req.body;
    
    if (typeof isWinner !== 'boolean' || !matchType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: isWinner (boolean), matchType (string)'
      });
    }

    const calculation = StandardizedRankingService.calculateRankingPoints(
      isWinner,
      matchType,
      tournamentTier
    );
    
    res.json({
      success: true,
      calculation
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate points',
      details: error.message 
    });
  }
});

/**
 * Get ranking breakdown for a user using standardized service
 */
router.get('/api/ranking/breakdown/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const breakdown = await StandardizedRankingService.getUserRankingBreakdown(userId);
    
    res.json({
      success: true,
      breakdown
    });
  } catch (error) {
    console.error('Error getting ranking breakdown:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get ranking breakdown',
      details: error.message 
    });
  }
});

/**
 * Migrate existing matches to use standardized ranking calculation
 * WARNING: This will recalculate all ranking points - use with caution
 */
router.post('/api/ranking/migrate-existing-matches', async (req, res) => {
  try {
    const { confirmMigration, dryRun = true } = req.body;
    
    if (!confirmMigration) {
      return res.status(400).json({
        success: false,
        error: 'Migration requires explicit confirmation. Set confirmMigration: true'
      });
    }

    // Get all matches that need migration
    const allMatches = await db.query.matches.findMany({
      orderBy: [desc(matches.createdAt)]
    });

    const migrationResults = [];
    let totalPointsAwarded = 0;

    for (const match of allMatches) {
      if (!match.winnerId) continue; // Skip matches without clear winner
      
      const loserId = match.playerOneId === match.winnerId ? match.playerTwoId : match.playerOneId;
      
      if (!dryRun) {
        // Process using standardized service
        const { winnerCalculation, loserCalculation } = 
          await StandardizedRankingService.processMatchRankingPoints(
            match,
            match.winnerId,
            loserId
          );
        
        migrationResults.push({
          matchId: match.id,
          winnerId: match.winnerId,
          loserId,
          winnerPoints: winnerCalculation.weightedPoints,
          loserPoints: loserCalculation.weightedPoints,
          matchType: match.matchType,
          tournamentTier: match.eventTier
        });
        
        totalPointsAwarded += winnerCalculation.weightedPoints + loserCalculation.weightedPoints;
      } else {
        // Dry run - just calculate what would happen
        const winnerCalculation = StandardizedRankingService.calculateRankingPoints(
          true,
          match.matchType as 'casual' | 'league' | 'tournament',
          match.eventTier as any
        );
        
        const loserCalculation = StandardizedRankingService.calculateRankingPoints(
          false,
          match.matchType as 'casual' | 'league' | 'tournament',
          match.eventTier as any
        );
        
        migrationResults.push({
          matchId: match.id,
          winnerId: match.winnerId,
          loserId,
          winnerPoints: winnerCalculation.weightedPoints,
          loserPoints: loserCalculation.weightedPoints,
          matchType: match.matchType,
          tournamentTier: match.eventTier,
          dryRun: true
        });
        
        totalPointsAwarded += winnerCalculation.weightedPoints + loserCalculation.weightedPoints;
      }
    }

    res.json({
      success: true,
      migrationCompleted: !dryRun,
      totalMatches: allMatches.length,
      processedMatches: migrationResults.length,
      totalPointsAwarded,
      results: migrationResults.slice(0, 10), // Show first 10 results
      message: dryRun ? 
        'Dry run completed. Set dryRun: false to execute migration' :
        'Migration completed successfully'
    });

  } catch (error) {
    console.error('Error migrating matches:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to migrate matches',
      details: error.message 
    });
  }
});

/**
 * Compare old vs new calculation methods for analysis
 */
router.get('/api/ranking/comparison-analysis', async (req, res) => {
  try {
    // Get sample matches for comparison
    const sampleMatches = await db.query.matches.findMany({
      limit: 20,
      orderBy: [desc(matches.createdAt)]
    });

    const comparisons = sampleMatches.map(match => {
      if (!match.winnerId) return null;
      
      const newWinnerCalc = StandardizedRankingService.calculateRankingPoints(
        true,
        match.matchType as 'casual' | 'league' | 'tournament',
        match.eventTier as any
      );
      
      const newLoserCalc = StandardizedRankingService.calculateRankingPoints(
        false,
        match.matchType as 'casual' | 'league' | 'tournament',
        match.eventTier as any
      );

      // Old system calculation (for comparison)
      let oldWinnerPoints = 3;
      let oldLoserPoints = 1;
      
      // Apply old weighting
      if (match.matchType === 'casual') {
        oldWinnerPoints *= 0.5;
        oldLoserPoints *= 0.5;
      } else if (match.matchType === 'league') {
        oldWinnerPoints *= 0.67;
        oldLoserPoints *= 0.67;
      }

      return {
        matchId: match.id,
        matchType: match.matchType,
        tournamentTier: match.eventTier,
        oldSystem: {
          winnerPoints: Math.round(oldWinnerPoints * 10) / 10,
          loserPoints: Math.round(oldLoserPoints * 10) / 10
        },
        newSystem: {
          winnerPoints: newWinnerCalc.weightedPoints,
          loserPoints: newLoserCalc.weightedPoints
        },
        difference: {
          winnerDiff: newWinnerCalc.weightedPoints - Math.round(oldWinnerPoints * 10) / 10,
          loserDiff: newLoserCalc.weightedPoints - Math.round(oldLoserPoints * 10) / 10
        }
      };
    }).filter(Boolean);

    res.json({
      success: true,
      comparisons,
      summary: {
        totalMatches: comparisons.length,
        averageWinnerDifference: comparisons.reduce((sum, c) => sum + c.difference.winnerDiff, 0) / comparisons.length,
        averageLoserDifference: comparisons.reduce((sum, c) => sum + c.difference.loserDiff, 0) / comparisons.length
      }
    });

  } catch (error) {
    console.error('Error running comparison analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to run comparison analysis',
      details: error.message 
    });
  }
});

export default router;