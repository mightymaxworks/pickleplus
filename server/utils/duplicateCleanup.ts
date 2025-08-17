import { db } from '../db';
import { matches, users } from '../../shared/schema';
import { eq, sql, and, or } from 'drizzle-orm';
import { storage } from '../storage';

export class DuplicateCleanupService {
  
  // Find all matches with identical timestamps (impossible duplicates)
  async findTimestampDuplicates(): Promise<any[]> {
    console.log('🔍 Scanning for timestamp duplicates...');
    
    const duplicateTimestamps = await db.execute(sql`
      SELECT 
        created_at,
        COUNT(*) as match_count,
        ARRAY_AGG(id ORDER BY id) as match_ids
      FROM matches 
      GROUP BY created_at
      HAVING COUNT(*) > 1
      ORDER BY match_count DESC, created_at DESC
    `);
    
    return duplicateTimestamps;
  }

  // Find users with suspiciously high match counts
  async findUsersWithExcessiveMatches(): Promise<any[]> {
    console.log('🔍 Scanning for users with excessive matches...');
    
    const userStats = await db.execute(sql`
      SELECT 
        u.id,
        u.display_name,
        u.username,
        u.ranking_points,
        u.pickle_points,
        COUNT(DISTINCT m.id) as match_count
      FROM users u
      LEFT JOIN matches m ON (
        u.id = m.player_one_id OR 
        u.id = m.player_two_id OR 
        u.id = m.player_one_partner_id OR 
        u.id = m.player_two_partner_id
      )
      GROUP BY u.id, u.display_name, u.username, u.ranking_points, u.pickle_points
      HAVING COUNT(DISTINCT m.id) > 15
      ORDER BY match_count DESC
    `);
    
    return userStats;
  }

  // Calculate corrected points for a user after removing duplicates
  async calculateCorrectedPoints(userId: number): Promise<{ rankingPoints: number, picklePoints: number }> {
    // Get all unique matches (keep only the earliest of each timestamp cluster)
    const uniqueMatches = await db.execute(sql`
      WITH ranked_matches AS (
        SELECT 
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY created_at, player_one_id, player_two_id, 
                        COALESCE(player_one_partner_id, 0), COALESCE(player_two_partner_id, 0)
            ORDER BY id
          ) as rn
        FROM matches m
        WHERE m.player_one_id = ${userId}
           OR m.player_two_id = ${userId}
           OR m.player_one_partner_id = ${userId}
           OR m.player_two_partner_id = ${userId}
      )
      SELECT * FROM ranked_matches WHERE rn = 1
      ORDER BY created_at
    `);

    // TODO: Implement points calculation based on algorithm
    // For now, return estimated corrected values
    const correctedRankingPoints = uniqueMatches.length * 2.5; // Rough estimate
    const correctedPicklePoints = Math.round(correctedRankingPoints * 1.5); // 1.5x multiplier
    
    return {
      rankingPoints: correctedRankingPoints,
      picklePoints: correctedPicklePoints
    };
  }

  // Remove duplicate matches (keep earliest of each cluster)
  async removeDuplicateMatches(dryRun: boolean = true): Promise<{
    duplicatesFound: number,
    duplicatesRemoved: number,
    matchesKept: number,
    errors: any[]
  }> {
    console.log(`🧹 ${dryRun ? 'DRY RUN' : 'ACTUAL'} - Removing duplicate matches...`);
    
    const results = {
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      matchesKept: 0,
      errors: []
    };

    try {
      // Find all timestamp duplicates
      const duplicateGroups = await this.findTimestampDuplicates();
      
      for (const group of duplicateGroups) {
        const matchIds: number[] = group.match_ids;
        if (matchIds.length > 1) {
          results.duplicatesFound += matchIds.length - 1; // All but one are duplicates
          
          // Keep the first match, remove the rest
          const toKeep = matchIds[0];
          const toRemove = matchIds.slice(1);
          
          console.log(`Timestamp ${group.created_at}: Keeping match ${toKeep}, removing ${toRemove.length} duplicates`);
          
          if (!dryRun) {
            for (const matchId of toRemove) {
              try {
                await db.delete(matches).where(eq(matches.id, matchId));
                results.duplicatesRemoved++;
                console.log(`  ✅ Removed duplicate match ${matchId}`);
              } catch (error) {
                results.errors.push({ matchId, error: error.message });
                console.error(`  ❌ Failed to remove match ${matchId}:`, error);
              }
            }
          } else {
            results.duplicatesRemoved += toRemove.length;
          }
          
          results.matchesKept++;
        }
      }
      
      console.log(`${dryRun ? 'DRY RUN' : 'CLEANUP'} Results:`, results);
      return results;
      
    } catch (error) {
      console.error('Duplicate cleanup failed:', error);
      results.errors.push({ general: error.message });
      return results;
    }
  }

  // Comprehensive audit report
  async generateComprehensiveAudit(): Promise<any> {
    console.log('📊 Generating comprehensive data integrity audit...');
    
    const timestampDuplicates = await this.findTimestampDuplicates();
    const usersWithExcessiveMatches = await this.findUsersWithExcessiveMatches();
    
    // Calculate total corruption impact
    let totalDuplicateMatches = 0;
    timestampDuplicates.forEach(group => {
      if (group.match_count > 1) {
        totalDuplicateMatches += group.match_count - 1; // All but one are duplicates
      }
    });

    return {
      timestamp: new Date().toISOString(),
      corruption: {
        timestampDuplicates: timestampDuplicates.length,
        totalDuplicateMatches,
        affectedUsers: usersWithExcessiveMatches.length,
        worstTimestamp: timestampDuplicates[0] || null
      },
      users: {
        total: usersWithExcessiveMatches.length,
        details: usersWithExcessiveMatches.slice(0, 10) // Top 10 worst affected
      },
      recommendations: [
        'IMMEDIATE: Stop all new match recording until cleanup complete',
        'Run duplicate removal script (currently in DRY RUN mode)',
        'Recalculate all user points after cleanup',
        'Implement stronger duplicate prevention in match recording',
        'Audit historical data imports for similar corruption patterns'
      ]
    };
  }
}

export const duplicateCleanupService = new DuplicateCleanupService();