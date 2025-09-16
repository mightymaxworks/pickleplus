#!/usr/bin/env node

import { readFileSync } from 'fs';
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// UDF-Compliant Age Category Bonuses (Source: PICKLE_PLUS_ALGORITHM_DOCUMENT.md)
const AGE_MULTIPLIERS = {
  'Open': 1.0,    // Ages 19-34
  '35+': 1.2,     // Ages 35-49
  '50+': 1.3,     // Ages 50-59
  '60+': 1.5,     // Ages 60-69
  '70+': 1.6      // Ages 70+
};

// System B Base Points (UDF Rule 14)
const SYSTEM_B_BASE_POINTS = {
  WIN: 3,
  LOSS: 1
};

class UDFTournamentCorrector {
  constructor(pool) {
    this.pool = pool;
    this.algorithmVersion = '4.0-UDF-COMPLIANT';
    this.processingId = `CORRECTION-${Date.now()}`;
  }

  async applyTournamentCorrections() {
    console.log('🚀 UDF-COMPLIANT TOURNAMENT CORRECTIONS STARTING...');
    console.log(`Processing ID: ${this.processingId}`);
    
    try {
      // Load corrected tournament data
      const correctedData = JSON.parse(readFileSync('./corrected-tournament-analysis.json', 'utf8'));
      console.log(`📊 Loaded ${correctedData.playerCorrections.length} player corrections`);

      // Start transaction
      await this.pool.query('BEGIN');
      console.log('🔒 Transaction started with rollback protection');

      let updatedPlayers = 0;
      let totalPointsAdded = 0;

      // Apply corrections for each player
      for (const correction of correctedData.playerCorrections) {
        const result = await this.applySinglePlayerCorrection(correction);
        if (result.success) {
          updatedPlayers++;
          totalPointsAdded += result.pointsAdded;
          console.log(`✅ ${correction.passportCode} (${correction.username}): +${result.pointsAdded} points`);
        } else {
          console.log(`⚠️  ${correction.passportCode}: ${result.error}`);
        }
      }

      // Commit transaction
      await this.pool.query('COMMIT');
      
      console.log('🎉 TOURNAMENT CORRECTIONS COMPLETED!');
      console.log(`📈 Updated ${updatedPlayers} players with ${totalPointsAdded.toFixed(2)} total points`);
      console.log(`🔍 Algorithm: ${this.algorithmVersion}`);
      
      return {
        success: true,
        playersUpdated: updatedPlayers,
        totalPointsAdded: totalPointsAdded.toFixed(2)
      };

    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.error('❌ CORRECTION FAILED - Transaction rolled back');
      console.error('Error:', error.message);
      throw error;
    }
  }

  async applySinglePlayerCorrection(correction) {
    try {
      // Get player data
      const playerResult = await this.pool.query(`
        SELECT id, passport_code, username, gender, date_of_birth,
               singles_ranking_points, mens_doubles_ranking_points, 
               womens_doubles_ranking_points, mixed_doubles_men_ranking_points,
               mixed_doubles_women_ranking_points
        FROM users 
        WHERE passport_code = $1
      `, [correction.passportCode]);

      if (playerResult.rows.length === 0) {
        return { success: false, error: 'Player not found in database' };
      }

      const player = playerResult.rows[0];

      // Determine age group for validation
      let ageGroup = 'Open';
      if (player.date_of_birth) {
        const age = this.calculateAge(player.date_of_birth);
        if (age >= 70) ageGroup = '70+';
        else if (age >= 60) ageGroup = '60+';
        else if (age >= 50) ageGroup = '50+';
        else if (age >= 35) ageGroup = '35+';
      }

      // Apply format-specific point corrections with age bonuses
      let totalPointsAdded = 0;
      const updates = [];

      // Process each match format correction
      for (const [format, data] of Object.entries(correction.formatBreakdown)) {
        if (data.totalPoints > 0) {
          const fieldName = this.getFieldName(format, player.gender);
          const currentPoints = parseFloat(player[fieldName] || 0);
          const newPoints = Number(data.totalPoints.toFixed(2));
          
          updates.push({
            field: fieldName,
            currentPoints,
            addPoints: newPoints,
            newTotal: currentPoints + newPoints
          });
          
          totalPointsAdded += newPoints;
        }
      }

      // Execute database updates (UDF Rule 5: Additive Points Only)
      for (const update of updates) {
        await this.pool.query(`
          UPDATE users 
          SET ${update.field} = ${update.field} + $1 
          WHERE id = $2
        `, [update.addPoints, player.id]);
      }

      return { 
        success: true, 
        pointsAdded: Number(totalPointsAdded.toFixed(2)),
        ageGroup,
        updatesApplied: updates.length
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getFieldName(format, gender) {
    switch (format) {
      case 'singles':
        return 'singles_ranking_points';
      case 'mensDoubles':
        return 'mens_doubles_ranking_points';
      case 'womensDoubles':
        return 'womens_doubles_ranking_points';
      case 'mixedDoubles':
        return gender === 'male' 
          ? 'mixed_doubles_men_ranking_points' 
          : 'mixed_doubles_women_ranking_points';
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Execute corrections
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const corrector = new UDFTournamentCorrector(pool);
  
  try {
    const result = await corrector.applyTournamentCorrections();
    console.log('\n📋 CORRECTION SUMMARY:');
    console.log(`Players Updated: ${result.playersUpdated}`);
    console.log(`Total Points Added: ${result.totalPointsAdded}`);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

main();