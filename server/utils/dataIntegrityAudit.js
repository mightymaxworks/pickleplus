const { db } = require('../db.js');
const { matches, users } = require('../../shared/schema');
const { eq, and, or, sql } = require('drizzle-orm');

class DataIntegrityAuditor {
  constructor() {
    this.duplicateThresholdMinutes = 5;
  }

  async findUserByName(searchTerm) {
    const allUsers = await db.select().from(users);
    return allUsers.find(user => {
      const displayName = user.displayName?.toLowerCase() || '';
      const username = user.username?.toLowerCase() || '';
      return displayName.includes(searchTerm.toLowerCase()) || 
             username.includes(searchTerm.toLowerCase());
    });
  }

  async analyzeUserMatches(userId) {
    const userMatches = await db.select()
      .from(matches)
      .where(or(
        eq(matches.playerOneId, userId),
        eq(matches.playerTwoId, userId),
        eq(matches.playerOnePartnerId, userId),
        eq(matches.playerTwoPartnerId, userId)
      ))
      .orderBy(matches.createdAt);

    const analysis = {
      totalMatches: userMatches.length,
      duplicates: [],
      timeCluster: [],
      suspicious: []
    };

    // Check for potential duplicates
    for (let i = 0; i < userMatches.length - 1; i++) {
      for (let j = i + 1; j < userMatches.length; j++) {
        const match1 = userMatches[i];
        const match2 = userMatches[j];
        
        const timeDiff = Math.abs(new Date(match2.createdAt) - new Date(match1.createdAt)) / (1000 * 60);
        
        if (timeDiff < this.duplicateThresholdMinutes) {
          const players1 = this.getMatchPlayers(match1);
          const players2 = this.getMatchPlayers(match2);
          
          if (this.arePlayersEqual(players1, players2)) {
            analysis.duplicates.push({
              match1: { id: match1.id, date: match1.createdAt },
              match2: { id: match2.id, date: match2.createdAt },
              timeDifferenceMinutes: timeDiff.toFixed(2)
            });
          }
        }
      }
    }

    return analysis;
  }

  getMatchPlayers(match) {
    return [
      match.playerOneId,
      match.playerTwoId,
      match.playerOnePartnerId,
      match.playerTwoPartnerId
    ].filter(id => id !== null);
  }

  arePlayersEqual(players1, players2) {
    if (players1.length !== players2.length) return false;
    const sorted1 = [...players1].sort();
    const sorted2 = [...players2].sort();
    return sorted1.every((id, index) => id === sorted2[index]);
  }

  async generateDuplicateReport() {
    console.log('🔍 Starting comprehensive duplicate detection audit...\n');
    
    // Get all users with significant match counts
    const userStats = await db.execute(sql`
      SELECT 
        u.id,
        u.display_name,
        u.username,
        COUNT(DISTINCT m.id) as match_count
      FROM users u
      LEFT JOIN matches m ON (
        u.id = m.player_one_id OR 
        u.id = m.player_two_id OR 
        u.id = m.player_one_partner_id OR 
        u.id = m.player_two_partner_id
      )
      GROUP BY u.id, u.display_name, u.username
      HAVING COUNT(DISTINCT m.id) > 10
      ORDER BY match_count DESC
    `);

    const report = {
      timestamp: new Date().toISOString(),
      users: [],
      totalDuplicatesFound: 0
    };

    for (const userStat of userStats) {
      const analysis = await this.analyzeUserMatches(userStat.id);
      
      if (analysis.duplicates.length > 0) {
        report.users.push({
          userId: userStat.id,
          displayName: userStat.display_name,
          username: userStat.username,
          totalMatches: userStat.match_count,
          duplicatesFound: analysis.duplicates.length,
          duplicateDetails: analysis.duplicates
        });
        
        report.totalDuplicatesFound += analysis.duplicates.length;
      }
    }

    return report;
  }

  async removeDuplicateMatches(duplicatePairs, dryRun = true) {
    const results = {
      toRemove: [],
      pointsToAdjust: [],
      errors: []
    };

    for (const pair of duplicatePairs) {
      try {
        // Always keep the earlier match, remove the later one
        const match1Date = new Date(pair.match1.date);
        const match2Date = new Date(pair.match2.date);
        
        const matchToRemove = match1Date < match2Date ? pair.match2 : pair.match1;
        const matchToKeep = match1Date < match2Date ? pair.match1 : pair.match2;

        results.toRemove.push({
          removeMatchId: matchToRemove.id,
          keepMatchId: matchToKeep.id,
          reason: 'Duplicate within 5-minute window'
        });

        if (!dryRun) {
          // Would implement actual deletion here
          console.log(`Would remove match ${matchToRemove.id}, keeping ${matchToKeep.id}`);
        }
      } catch (error) {
        results.errors.push({
          pair,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = { DataIntegrityAuditor };