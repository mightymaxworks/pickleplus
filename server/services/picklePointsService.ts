/**
 * PICKLE POINTS INTEGRATION SERVICE
 * 
 * Integrates Pickle Points earning with existing ranking system
 * using official 1.5x multiplier PER MATCH (not blanket conversion)
 * 
 * Version: 1.0.0 - Sprint 1: Pickle Points Integration
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and additive operations
 * SECURITY: All operations are atomic and auditable
 */

import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { digitalCreditsAccounts, digitalCreditsTransactions, users } from '../../shared/schema';
import { 
  PICKLE_POINTS_MULTIPLIER,
  validateAdditivePointsOperation,
  logCalculationBreakdown,
  type MatchResult
} from '../../shared/utils/algorithmValidation';
import { 
  validateCreditTransaction,
  CreditTransactionType,
  type CreditTransactionValidation 
} from '../../shared/utils/digitalCurrencyValidation';

export interface PicklePointsMatchResult {
  playerId: number;
  username: string;
  isWin: boolean;
  rankingPointsEarned: number;
  picklePointsEarned: number;
  currentPicklePointsBalance: number;
  newPicklePointsBalance: number;
  transactionId?: number;
}

export interface MatchPicklePointsResult {
  success: boolean;
  results: PicklePointsMatchResult[];
  totalPicklePointsAwarded: number;
  error?: string;
}

class PicklePointsService {
  
  /**
   * Calculate Pickle Points for a match using official 1.5x multiplier PER MATCH
   * CRITICAL: Uses per-match multiplier, NOT blanket conversion of total points
   */
  calculateMatchPicklePoints(
    rankingPointsEarned: number
  ): number {
    // Apply 1.5x multiplier per match as specified in user requirements
    const picklePoints = Number((rankingPointsEarned * PICKLE_POINTS_MULTIPLIER).toFixed(2));
    
    console.log('[PICKLE POINTS] Match calculation:', {
      rankingPointsEarned,
      multiplier: PICKLE_POINTS_MULTIPLIER,
      picklePointsAwarded: picklePoints
    });
    
    return picklePoints;
  }

  /**
   * Award Pickle Points to players after match completion
   * Uses UDF-compliant additive operations and complete audit trail
   */
  async awardMatchPicklePoints(
    matchResults: Array<{
      playerId: number;
      username: string;
      isWin: boolean;
      rankingPointsEarned: number;
    }>,
    matchId?: number
  ): Promise<MatchPicklePointsResult> {
    
    try {
      return await db.transaction(async (tx: any) => {
        const results: PicklePointsMatchResult[] = [];
        let totalPicklePointsAwarded = 0;

        for (const matchResult of matchResults) {
          const { playerId, username, isWin, rankingPointsEarned } = matchResult;
          
          // POSTGRESQL ADVISORY LOCKING: True concurrency protection
          if (!matchId) {
            throw new Error('matchId is required for secure Pickle Points award operations');
          }
          
          // Acquire exclusive advisory lock using proper two-argument form (no collision risk)
          await tx.execute(sql`SELECT pg_advisory_xact_lock(${playerId}::int, ${matchId}::int)`);
          console.log('[PICKLE POINTS] Advisory lock acquired:', { playerId, matchId });
            
          // Now check for existing award under the lock
          const existingAward = await tx
            .select()
            .from(digitalCreditsTransactions)
            .where(
              and(
                eq(digitalCreditsTransactions.userId, playerId),
                eq(digitalCreditsTransactions.type, CreditTransactionType.PICKLE_POINTS_MATCH_REWARD),
                eq(digitalCreditsTransactions.referenceType, 'match'),
                eq(digitalCreditsTransactions.referenceId, matchId)
              )
            )
            .limit(1);

          if (existingAward.length > 0) {
            console.log('[PICKLE POINTS] Already awarded for match (under lock):', { matchId, playerId, existingTransactionId: existingAward[0].id });
            
            // Return existing award data for consistency
            results.push({
              playerId,
              username,
              isWin,
              rankingPointsEarned,
              picklePointsEarned: existingAward[0].picklePointsAwarded || 0,
              currentPicklePointsBalance: existingAward[0].balanceAfter - (existingAward[0].picklePointsAwarded || 0),
              newPicklePointsBalance: existingAward[0].balanceAfter,
              transactionId: existingAward[0].id
            });
            continue;
          }
          
          // Calculate Pickle Points using official 1.5x per-match multiplier
          const picklePointsEarned = this.calculateMatchPicklePoints(rankingPointsEarned);
          
          if (picklePointsEarned <= 0) {
            console.log('[PICKLE POINTS] No points to award for player:', playerId);
            continue;
          }

          // Get user's current Pickle Points from users table
          let user = await tx
            .select({ picklePoints: users.picklePoints })
            .from(users)
            .where(eq(users.id, playerId))
            .limit(1);

          if (user.length === 0) {
            throw new Error(`User ${playerId} not found`);
          }

          const currentPicklePoints = user[0].picklePoints || 0;

          // UDF VALIDATION: Ensure additive operation
          const validation = validateAdditivePointsOperation(
            currentPicklePoints,
            picklePointsEarned,
            'add'
          );

          if (!validation.isValid) {
            console.error('[PICKLE POINTS] UDF validation failed:', validation.error);
            return {
              success: false,
              results: [],
              totalPicklePointsAwarded: 0,
              error: validation.error
            };
          }

          // REORDERED FLOW: Transaction insert FIRST, then balance update
          // This prevents double balance updates under concurrency
          
          const newPicklePointsBalance = currentPicklePoints + picklePointsEarned;

          // STEP 1: Pre-validate transaction (no mutations yet)
          const transactionValidation: CreditTransactionValidation = {
            userId: playerId,
            amount: picklePointsEarned,
            type: CreditTransactionType.PICKLE_POINTS_MATCH_REWARD,
            currentBalance: currentPicklePoints,
            expectedBalanceAfter: newPicklePointsBalance,
            picklePointsAwarded: picklePointsEarned
          };

          const creditValidation = validateCreditTransaction(transactionValidation);
          if (!creditValidation.isValid) {
            throw new Error(`UDF validation failed: ${creditValidation.errors.join(', ')}`);
          }

          // STEP 2: Insert transaction record FIRST (this is the authoritative lock)
          const transactionResult = await tx
            .insert(digitalCreditsTransactions)
            .values({
              userId: playerId,
              amount: picklePointsEarned,
              type: CreditTransactionType.PICKLE_POINTS_MATCH_REWARD,
              balanceAfter: newPicklePointsBalance,
              picklePointsAwarded: picklePointsEarned,
              referenceType: 'match',
              referenceId: matchId || null,
              description: `Pickle Points earned from ${isWin ? 'WIN' : 'LOSS'}: ${rankingPointsEarned} × ${PICKLE_POINTS_MULTIPLIER} = ${picklePointsEarned}`
            })
            .returning({ id: digitalCreditsTransactions.id });

          // STEP 3: Only update balance if transaction insert succeeded
          if (transactionResult.length > 0) {
            const updateResult = await tx
              .update(users)
              .set({
                picklePoints: sql`${users.picklePoints} + ${picklePointsEarned}`
              })
              .where(eq(users.id, playerId))
              .returning({ 
                newBalance: users.picklePoints 
              });

            if (updateResult.length === 0) {
              throw new Error(`Failed to update Pickle Points balance after successful transaction insert`);
            }

            console.log('[PICKLE POINTS] Secure award completed:', {
              playerId,
              username,
              pointsEarned: picklePointsEarned,
              previousBalance: currentPicklePoints,
              newBalance: updateResult[0].newBalance,
              transactionId: transactionResult[0].id,
              advisoryLock: `${playerId}::${matchId}`
            });
          } else {
            throw new Error('Transaction insert failed - no balance update performed');
          }

          results.push({
            playerId,
            username,
            isWin,
            rankingPointsEarned,
            picklePointsEarned,
            currentPicklePointsBalance: currentPicklePoints,
            newPicklePointsBalance,
            transactionId: transactionResult[0].id
          });

          totalPicklePointsAwarded += picklePointsEarned;
        }

        console.log('[PICKLE POINTS] Match rewards completed:', {
          playersRewarded: results.length,
          totalPicklePointsAwarded,
          individualResults: results.map(r => ({
            username: r.username,
            picklePointsEarned: r.picklePointsEarned,
            newBalance: r.newPicklePointsBalance
          }))
        });

        return {
          success: true,
          results,
          totalPicklePointsAwarded
        };
      });

    } catch (error) {
      console.error('[PICKLE POINTS] Award error:', {
        message: error instanceof Error ? error.message : String(error),
        matchResults: matchResults.map(r => ({ playerId: r.playerId, username: r.username }))
      });

      return {
        success: false,
        results: [],
        totalPicklePointsAwarded: 0,
        error: error instanceof Error ? error.message : 'Failed to award Pickle Points'
      };
    }
  }

  /**
   * Get player's Pickle Points balance and history
   */
  async getPlayerPicklePointsInfo(playerId: number): Promise<{
    success: boolean;
    balance: number;
    balanceFormatted: string;
    totalEarned: number;
    recentTransactions: Array<{
      id: number;
      amount: number;
      type: string;
      createdAt: Date;
      description?: string;
    }>;
    error?: string;
  }> {
    
    try {
      // Get user's Pickle Points from users table
      const user = await db
        .select({ picklePoints: users.picklePoints })
        .from(users)
        .where(eq(users.id, playerId))
        .limit(1);

      if (user.length === 0) {
        return {
          success: true,
          balance: 0,
          balanceFormatted: '0 points',
          totalEarned: 0,
          recentTransactions: []
        };
      }

      const currentBalance = user[0].picklePoints || 0;

      // Get recent Pickle Points transactions
      const transactions = await db
        .select()
        .from(digitalCreditsTransactions)
        .where(
          and(
            eq(digitalCreditsTransactions.userId, playerId),
            eq(digitalCreditsTransactions.type, CreditTransactionType.PICKLE_POINTS_MATCH_REWARD)
          )
        )
        .orderBy(sql`${digitalCreditsTransactions.createdAt} DESC`)
        .limit(10);

      const totalEarned = transactions.reduce((sum, txn) => sum + (txn.picklePointsAwarded || 0), 0);

      return {
        success: true,
        balance: currentBalance,
        balanceFormatted: `${currentBalance.toFixed(1)} points`,
        totalEarned,
        recentTransactions: transactions.map(txn => ({
          id: txn.id,
          amount: txn.picklePointsAwarded || 0,
          type: txn.type,
          createdAt: txn.createdAt,
          description: txn.description || undefined
        }))
      };

    } catch (error) {
      console.error('[PICKLE POINTS] Info fetch error:', {
        playerId,
        message: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        balance: 0,
        balanceFormatted: '0 points',
        totalEarned: 0,
        recentTransactions: [],
        error: error instanceof Error ? error.message : 'Failed to fetch Pickle Points info'
      };
    }
  }

  /**
   * Batch award Pickle Points for tournament/league matches
   * Handles multiple matches with proper UDF compliance
   */
  async awardBatchPicklePoints(
    batchResults: Array<{
      matchId: number;
      players: Array<{
        playerId: number;
        username: string;
        isWin: boolean;
        rankingPointsEarned: number;
      }>;
    }>
  ): Promise<{
    success: boolean;
    totalMatches: number;
    totalPlayersRewarded: number;
    totalPicklePointsAwarded: number;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let totalPlayersRewarded = 0;
    let totalPicklePointsAwarded = 0;

    for (const match of batchResults) {
      const result = await this.awardMatchPicklePoints(match.players, match.matchId);
      
      if (result.success) {
        totalPlayersRewarded += result.results.length;
        totalPicklePointsAwarded += result.totalPicklePointsAwarded;
      } else {
        errors.push(`Match ${match.matchId}: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      totalMatches: batchResults.length,
      totalPlayersRewarded,
      totalPicklePointsAwarded,
      errors
    };
  }
}

export const picklePointsService = new PicklePointsService();