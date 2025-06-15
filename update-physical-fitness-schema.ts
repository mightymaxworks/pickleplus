/**
 * PKL-278651-PCP-PHYS-001 - Enhanced Physical Fitness Assessment Schema
 * 
 * Updates the PCP assessment database to include 24 micro-components
 * across 4 main physical fitness categories for comprehensive evaluation.
 * 
 * Run with: npx tsx update-physical-fitness-schema.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-15
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

interface PhysicalFitnessSchema {
  // Footwork & Agility (6 components)
  lateralMovement: number;
  forwardBackwardTransitions: number;
  splitStepTiming: number;
  multidirectionalChanges: number;
  crossoverSteps: number;
  recoverySteps: number;

  // Balance & Stability (6 components) 
  dynamicBalance: number;
  staticBalance: number;
  coreStability: number;
  singleLegBalance: number;
  balanceRecovery: number;
  weightTransfer: number;

  // Reaction & Response (6 components)
  visualReaction: number;
  auditoryReaction: number;
  decisionSpeed: number;
  handEyeCoordination: number;
  anticipationSkills: number;
  recoveryReaction: number;

  // Endurance & Conditioning (6 components)
  aerobicCapacity: number;
  anaerobicPower: number;
  muscularEndurance: number;
  mentalStamina: number;
  heatTolerance: number;
  recoveryBetweenPoints: number;
}

/**
 * Updates the pcp_skill_assessments table with enhanced physical fitness columns
 */
async function updatePhysicalFitnessSchema(): Promise<void> {
  console.log('🏃‍♂️ Enhanced Physical Fitness Assessment Schema Creation');
  console.log('=====================================');

  try {
    // Check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pcp_skill_assessments'
      );
    `);

    if (!tableExists.rows[0]?.exists) {
      console.log('❌ PCP skill assessments table not found');
      return;
    }

    console.log('✅ Found existing PCP skill assessments table');

    // Add Footwork & Agility columns
    console.log('\n📊 Adding Footwork & Agility micro-components...');
    
    const footworkColumns = [
      'lateral_movement',
      'forward_backward_transitions', 
      'split_step_timing',
      'multidirectional_changes',
      'crossover_steps',
      'recovery_steps'
    ];

    for (const column of footworkColumns) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE pcp_skill_assessments 
          ADD COLUMN IF NOT EXISTS ${column} INTEGER DEFAULT 5 CHECK (${column} >= 1 AND ${column} <= 10)
        `));
        console.log(`   ✅ Added ${column}`);
      } catch (error) {
        console.log(`   ⚠️  Column ${column} already exists`);
      }
    }

    // Add Balance & Stability columns
    console.log('\n⚖️  Adding Balance & Stability micro-components...');
    
    const balanceColumns = [
      'dynamic_balance',
      'static_balance',
      'core_stability', 
      'single_leg_balance',
      'balance_recovery',
      'weight_transfer'
    ];

    for (const column of balanceColumns) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE pcp_skill_assessments 
          ADD COLUMN IF NOT EXISTS ${column} INTEGER DEFAULT 5 CHECK (${column} >= 1 AND ${column} <= 10)
        `));
        console.log(`   ✅ Added ${column}`);
      } catch (error) {
        console.log(`   ⚠️  Column ${column} already exists`);
      }
    }

    // Add Reaction & Response columns
    console.log('\n⚡ Adding Reaction & Response micro-components...');
    
    const reactionColumns = [
      'visual_reaction',
      'auditory_reaction',
      'decision_speed',
      'hand_eye_coordination',
      'anticipation_skills', 
      'recovery_reaction'
    ];

    for (const column of reactionColumns) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE pcp_skill_assessments 
          ADD COLUMN IF NOT EXISTS ${column} INTEGER DEFAULT 5 CHECK (${column} >= 1 AND ${column} <= 10)
        `));
        console.log(`   ✅ Added ${column}`);
      } catch (error) {
        console.log(`   ⚠️  Column ${column} already exists`);
      }
    }

    // Add Endurance & Conditioning columns
    console.log('\n💪 Adding Endurance & Conditioning micro-components...');
    
    const enduranceColumns = [
      'aerobic_capacity',
      'anaerobic_power',
      'muscular_endurance',
      'mental_stamina',
      'heat_tolerance',
      'recovery_between_points'
    ];

    for (const column of enduranceColumns) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE pcp_skill_assessments 
          ADD COLUMN IF NOT EXISTS ${column} INTEGER DEFAULT 5 CHECK (${column} >= 1 AND ${column} <= 10)
        `));
        console.log(`   ✅ Added ${column}`);
      } catch (error) {
        console.log(`   ⚠️  Column ${column} already exists`);
      }
    }

    // Create fitness test results table
    console.log('\n🧪 Creating fitness test results table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pcp_fitness_test_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES pcp_skill_assessments(id),
        test_type VARCHAR(50) NOT NULL,
        test_name VARCHAR(100) NOT NULL,
        result_value DECIMAL(10,3),
        result_unit VARCHAR(20),
        test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        coach_notes TEXT,
        benchmark_comparison VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Created fitness test results table');

    // Verify schema update
    console.log('\n🔍 Verifying enhanced schema...');
    
    const columnCount = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'pcp_skill_assessments'
      AND table_schema = 'public'
    `);

    const totalColumns = columnCount.rows[0]?.count || 0;
    console.log(`   📊 Total columns in assessment table: ${totalColumns}`);

    // Test with sample data
    console.log('\n✅ Testing enhanced physical fitness assessment...');
    
    const testAssessment = await db.execute(sql`
      INSERT INTO pcp_skill_assessments (
        profile_id, coach_id, assessment_type,
        serve_execution, third_shot, shot_creativity, court_movement,
        lateral_movement, forward_backward_transitions, split_step_timing,
        dynamic_balance, static_balance, core_stability,
        visual_reaction, auditory_reaction, decision_speed,
        aerobic_capacity, anaerobic_power, muscular_endurance,
        shot_selection, court_positioning, pattern_recognition,
        focus_concentration, pressure_performance, adaptability,
        confidence_level, session_notes
      ) VALUES (
        1, 1, 'initial',
        8.0, 7.0, 6.0, 8.0,
        7, 8, 6,
        8, 7, 9,
        8, 7, 8, 
        7, 8, 6,
        8.0, 7.0, 9.0,
        8.0, 7.0, 8.0,
        85.0, 'Enhanced physical fitness assessment test successful'
      ) RETURNING id
    `);

    const assessmentId = testAssessment.rows[0]?.id;
    console.log(`   ✅ Created test assessment with ID: ${assessmentId}`);

    // Add sample fitness test result
    await db.execute(sql`
      INSERT INTO pcp_fitness_test_results (
        assessment_id, test_type, test_name, result_value, result_unit, coach_notes
      ) VALUES (
        ${assessmentId}, 'agility', '4-Corner Touch Test', 12.5, 'seconds', 'Good lateral movement, needs work on recovery steps'
      )
    `);
    console.log('   ✅ Created sample fitness test result');

    console.log('\n🎯 ENHANCED PHYSICAL FITNESS SCHEMA SUMMARY');
    console.log('============================================');
    console.log('✅ 24 physical fitness micro-components added');
    console.log('✅ Footwork & Agility: 6 components');
    console.log('✅ Balance & Stability: 6 components'); 
    console.log('✅ Reaction & Response: 6 components');
    console.log('✅ Endurance & Conditioning: 6 components');
    console.log('✅ Fitness test results tracking table created');
    console.log('✅ Sample data validation successful');
    console.log(`✅ Total assessment columns: ${totalColumns}`);

  } catch (error) {
    console.error('❌ Error updating physical fitness schema:', error);
    throw error;
  }
}

/**
 * Validates the enhanced physical fitness assessment structure
 */
async function validateEnhancedSchema(): Promise<void> {
  console.log('\n🔬 VALIDATION: Enhanced Physical Fitness Assessment');
  console.log('=================================================');

  try {
    // Check all required columns exist
    const requiredColumns = [
      // Footwork & Agility
      'lateral_movement', 'forward_backward_transitions', 'split_step_timing',
      'multidirectional_changes', 'crossover_steps', 'recovery_steps',
      // Balance & Stability
      'dynamic_balance', 'static_balance', 'core_stability',
      'single_leg_balance', 'balance_recovery', 'weight_transfer', 
      // Reaction & Response
      'visual_reaction', 'auditory_reaction', 'decision_speed',
      'hand_eye_coordination', 'anticipation_skills', 'recovery_reaction',
      // Endurance & Conditioning
      'aerobic_capacity', 'anaerobic_power', 'muscular_endurance',
      'mental_stamina', 'heat_tolerance', 'recovery_between_points'
    ];

    let validationScore = 0;
    let totalChecks = 0;

    for (const column of requiredColumns) {
      totalChecks++;
      const exists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'pcp_skill_assessments' 
          AND column_name = ${column}
        )
      `);
      
      if (exists.rows[0]?.exists) {
        validationScore++;
        console.log(`   ✅ ${column}`);
      } else {
        console.log(`   ❌ Missing: ${column}`);
      }
    }

    // Check fitness test results table
    totalChecks++;
    const testTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pcp_fitness_test_results'
      )
    `);
    
    if (testTableExists.rows[0]?.exists) {
      validationScore++;
      console.log('   ✅ Fitness test results table exists');
    } else {
      console.log('   ❌ Missing fitness test results table');
    }

    const readinessPercentage = Math.round((validationScore / totalChecks) * 100);

    console.log('\n🎯 ENHANCED PHYSICAL FITNESS READINESS SUMMARY');
    console.log('===============================================');
    console.log(`📊 Validation Score: ${validationScore}/${totalChecks} (${readinessPercentage}%)`);
    
    if (readinessPercentage >= 98) {
      console.log('✅ PHYSICAL FITNESS ENHANCEMENT CERTIFIED - 98%+ READY');
      console.log('   ✓ All 24 micro-components implemented');
      console.log('   ✓ 4 main categories structured correctly');
      console.log('   ✓ Fitness test integration ready');
      console.log('   ✓ Database schema validated');
    } else {
      console.log('⚠️  PHYSICAL FITNESS ENHANCEMENT NEEDS ATTENTION');
      console.log(`   Missing ${totalChecks - validationScore} required components`);
    }

    return;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    await updatePhysicalFitnessSchema();
    await validateEnhancedSchema();
    
    console.log('\n🚀 ENHANCED PHYSICAL FITNESS ASSESSMENT READY');
    console.log('Next steps: Update frontend interface with new components');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();