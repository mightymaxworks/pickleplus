/**
 * PCP Coaching Ecosystem - Database Schema Creation
 * Sprint 1: Foundation Infrastructure Implementation
 * 
 * This script creates the complete database schema for the PCP Rating System
 * and Drill Library integration.
 * 
 * Run with: npx tsx create-pcp-coaching-ecosystem-schema.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-12
 */

import { db } from './server/db.js';

async function createPCPCoachingEcosystemSchema() {
  console.log('🚀 Creating PCP Coaching Ecosystem Database Schema...');

  try {
    // 1. Player PCP Profiles - Central rating storage
    await db.execute(`
      CREATE TABLE IF NOT EXISTS player_pcp_profiles (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES users(id),
        facility_id INTEGER REFERENCES training_center_facilities(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Overall PCP Rating (calculated from dimensions)
        overall_rating DECIMAL(3,2) DEFAULT 0.00,
        rating_confidence DECIMAL(3,2) DEFAULT 0.00,
        total_assessments INTEGER DEFAULT 0,
        
        -- Four-Dimensional Ratings
        technical_rating DECIMAL(3,2) DEFAULT 0.00,
        tactical_rating DECIMAL(3,2) DEFAULT 0.00,
        physical_rating DECIMAL(3,2) DEFAULT 0.00,
        mental_rating DECIMAL(3,2) DEFAULT 0.00,
        
        -- Assessment tracking
        last_assessment_date TIMESTAMP,
        next_review_due TIMESTAMP,
        assigned_coach_id INTEGER REFERENCES coaches(id),
        
        -- Development status
        current_focus_areas TEXT[],
        tournament_ready BOOLEAN DEFAULT FALSE,
        competitive_level VARCHAR(50) DEFAULT 'beginner'
      );
    `);

    // 2. Detailed Skill Assessments - Granular skill tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pcp_skill_assessments (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES player_pcp_profiles(id),
        coach_id INTEGER REFERENCES training_center_coaches(id),
        assessment_date TIMESTAMP DEFAULT NOW(),
        session_id INTEGER, -- Link to training session if applicable
        
        -- Technical Skills Assessment (40% weight)
        serve_execution DECIMAL(3,2),
        return_technique DECIMAL(3,2),
        groundstrokes DECIMAL(3,2),
        net_play DECIMAL(3,2),
        third_shot DECIMAL(3,2),
        overhead_defense DECIMAL(3,2),
        shot_creativity DECIMAL(3,2),
        court_movement DECIMAL(3,2),
        
        -- Tactical Awareness Assessment (25% weight)
        shot_selection DECIMAL(3,2),
        court_positioning DECIMAL(3,2),
        pattern_recognition DECIMAL(3,2),
        risk_management DECIMAL(3,2),
        communication DECIMAL(3,2),
        
        -- Physical Attributes Assessment (20% weight)
        footwork DECIMAL(3,2),
        balance_stability DECIMAL(3,2),
        reaction_time DECIMAL(3,2),
        endurance DECIMAL(3,2),
        
        -- Mental Game Assessment (15% weight)
        focus_concentration DECIMAL(3,2),
        pressure_performance DECIMAL(3,2),
        adaptability DECIMAL(3,2),
        sportsmanship DECIMAL(3,2),
        
        -- Assessment metadata
        assessment_type VARCHAR(50) DEFAULT 'comprehensive', -- 'comprehensive', 'quick', 'drill_specific'
        confidence_level DECIMAL(3,2),
        session_notes TEXT,
        improvement_areas TEXT[],
        strengths_noted TEXT[],
        next_session_focus TEXT,
        video_analysis_url VARCHAR(255),
        
        -- Calculated ratings after this assessment
        calculated_technical DECIMAL(3,2),
        calculated_tactical DECIMAL(3,2),
        calculated_physical DECIMAL(3,2),
        calculated_mental DECIMAL(3,2),
        calculated_overall DECIMAL(3,2)
      );
    `);

    // 3. Coaching Drill Library - Comprehensive drill management
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coaching_drills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100), -- 'technical', 'tactical', 'physical', 'mental'
        subcategory VARCHAR(100), -- 'serving', 'net_play', 'movement', etc.
        difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
        estimated_duration INTEGER, -- minutes
        min_participants INTEGER DEFAULT 1,
        max_participants INTEGER DEFAULT 1,
        
        -- Equipment and setup
        equipment_needed TEXT[],
        court_setup_instructions TEXT,
        space_requirements VARCHAR(100), -- 'full_court', 'half_court', 'service_area'
        
        -- Instructional content
        objective TEXT,
        instructions TEXT,
        coaching_points TEXT[],
        common_mistakes TEXT[],
        success_criteria TEXT,
        video_demonstration_url VARCHAR(255),
        diagram_url VARCHAR(255),
        
        -- PCP Rating Integration
        primary_skill_target VARCHAR(100), -- maps to specific skill in assessments
        secondary_skill_targets TEXT[],
        skill_improvement_weight DECIMAL(3,2) DEFAULT 1.00, -- how much this drill impacts rating
        
        -- Performance tracking
        success_metric_type VARCHAR(50), -- 'accuracy', 'consistency', 'speed', 'form'
        target_success_rate DECIMAL(5,2), -- expected success rate for mastery
        
        -- Progression system
        prerequisite_skills TEXT[],
        next_level_drills INTEGER[], -- array of drill IDs for progression
        mastery_criteria TEXT,
        
        -- Metadata
        created_by INTEGER REFERENCES training_center_coaches(id),
        facility_id INTEGER REFERENCES training_centers(id),
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        usage_count INTEGER DEFAULT 0,
        effectiveness_rating DECIMAL(3,2) DEFAULT 0.00
      );
    `);

    // 4. Drill Performance Logs - Individual performance tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drill_performance_logs (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES users(id),
        coach_id INTEGER REFERENCES training_center_coaches(id),
        drill_id INTEGER REFERENCES coaching_drills(id),
        session_date TIMESTAMP DEFAULT NOW(),
        session_id INTEGER, -- link to training session
        
        -- Performance metrics
        attempts_made INTEGER,
        successful_attempts INTEGER,
        success_percentage DECIMAL(5,2),
        technique_rating DECIMAL(3,2), -- coach assessment 1-5
        effort_level DECIMAL(3,2),
        consistency_score DECIMAL(3,2),
        improvement_observed BOOLEAN DEFAULT FALSE,
        
        -- Skill development impact
        skill_area_improved VARCHAR(100),
        before_rating DECIMAL(3,2),
        after_rating DECIMAL(3,2),
        rating_adjustment DECIMAL(3,2),
        confidence_gain DECIMAL(3,2),
        
        -- Coaching observations
        performance_notes TEXT,
        areas_for_improvement TEXT[],
        breakthrough_moments TEXT,
        recommended_next_drill INTEGER REFERENCES coaching_drills(id),
        
        -- Session context
        drill_duration INTEGER, -- minutes spent on this drill
        drill_modifications TEXT, -- any changes made to standard drill
        environmental_factors TEXT, -- weather, court conditions, etc.
        
        -- Follow-up tracking
        homework_assigned BOOLEAN DEFAULT FALSE,
        practice_recommended TEXT,
        mastery_level VARCHAR(50) DEFAULT 'learning' -- 'learning', 'developing', 'proficient', 'mastered'
      );
    `);

    // 5. PCP Goals and Objectives - Goal setting and tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pcp_goals (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES player_pcp_profiles(id),
        coach_id INTEGER REFERENCES training_center_coaches(id),
        created_date TIMESTAMP DEFAULT NOW(),
        target_date TIMESTAMP,
        completed_date TIMESTAMP,
        
        -- Goal definition
        goal_type VARCHAR(50), -- 'skill_improvement', 'rating_target', 'tournament_ready', 'drill_mastery'
        target_skill VARCHAR(100),
        current_value DECIMAL(3,2),
        target_value DECIMAL(3,2),
        achieved BOOLEAN DEFAULT FALSE,
        
        -- Goal details
        title VARCHAR(200),
        description TEXT,
        success_criteria TEXT,
        measurement_method VARCHAR(100),
        
        -- Progress tracking
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        milestones_achieved INTEGER DEFAULT 0,
        total_milestones INTEGER DEFAULT 1,
        
        -- Motivation and rewards
        reward_badge VARCHAR(100),
        celebration_message TEXT,
        parent_notification BOOLEAN DEFAULT FALSE,
        
        -- Goal management
        priority_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
        difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
        estimated_sessions INTEGER,
        actual_sessions INTEGER DEFAULT 0
      );
    `);

    // 6. Achievement and Badge System - Motivation and recognition
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pcp_achievements (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES player_pcp_profiles(id),
        achievement_type VARCHAR(100), -- 'skill_milestone', 'drill_mastery', 'rating_improvement', 'consistency'
        achievement_name VARCHAR(200),
        earned_date TIMESTAMP DEFAULT NOW(),
        
        -- Achievement details
        category VARCHAR(50), -- 'technical', 'tactical', 'physical', 'mental'
        difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
        points_earned INTEGER DEFAULT 0,
        
        -- Context information
        skill_area VARCHAR(100),
        rating_at_achievement DECIMAL(3,2),
        improvement_amount DECIMAL(3,2),
        sessions_to_achieve INTEGER,
        
        -- Display information
        badge_icon VARCHAR(100),
        badge_color VARCHAR(50),
        description TEXT,
        celebration_message TEXT,
        
        -- Social features
        shareable BOOLEAN DEFAULT TRUE,
        shared_count INTEGER DEFAULT 0,
        
        -- Achievement verification
        verified_by INTEGER REFERENCES training_center_coaches(id),
        verification_notes TEXT
      );
    `);

    // 7. Rating History - Historical trend analysis
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pcp_rating_history (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES player_pcp_profiles(id),
        recorded_date TIMESTAMP DEFAULT NOW(),
        
        -- Rating snapshot
        overall_rating DECIMAL(3,2),
        technical_rating DECIMAL(3,2),
        tactical_rating DECIMAL(3,2),
        physical_rating DECIMAL(3,2),
        mental_rating DECIMAL(3,2),
        
        -- Change tracking
        overall_change DECIMAL(3,2) DEFAULT 0.00,
        technical_change DECIMAL(3,2) DEFAULT 0.00,
        tactical_change DECIMAL(3,2) DEFAULT 0.00,
        physical_change DECIMAL(3,2) DEFAULT 0.00,
        mental_change DECIMAL(3,2) DEFAULT 0.00,
        
        -- Trigger information
        trigger_event VARCHAR(100), -- 'assessment', 'goal_achieved', 'tournament_result', 'drill_mastery'
        trigger_details TEXT,
        coach_notes TEXT,
        
        -- Trend analysis
        improvement_velocity DECIMAL(5,2), -- rating change per week
        consistency_score DECIMAL(3,2),
        projected_next_rating DECIMAL(3,2)
      );
    `);

    // 8. Drill Progressions - Learning pathway management
    await db.execute(`
      CREATE TABLE IF NOT EXISTS drill_progressions (
        id SERIAL PRIMARY KEY,
        from_drill_id INTEGER REFERENCES coaching_drills(id),
        to_drill_id INTEGER REFERENCES coaching_drills(id),
        
        -- Progression criteria
        mastery_criteria TEXT,
        success_rate_required DECIMAL(5,2) DEFAULT 75.00,
        minimum_sessions INTEGER DEFAULT 3,
        coach_approval_required BOOLEAN DEFAULT FALSE,
        
        -- Progression analytics
        average_progression_time INTEGER, -- days
        success_rate DECIMAL(5,2), -- percentage of players who successfully progress
        difficulty_jump DECIMAL(3,2), -- how much harder the next drill is
        
        -- Pathway information
        pathway_name VARCHAR(200), -- e.g., "Serve Mastery Pathway"
        sequence_order INTEGER,
        alternative_progressions INTEGER[], -- array of alternative drill IDs
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 9. Coach Calibration and Quality Assurance
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coach_calibration_sessions (
        id SERIAL PRIMARY KEY,
        facility_id INTEGER REFERENCES training_centers(id),
        session_date TIMESTAMP DEFAULT NOW(),
        facilitator_id INTEGER REFERENCES training_center_coaches(id),
        
        -- Calibration details
        calibration_type VARCHAR(50), -- 'assessment_consistency', 'drill_evaluation', 'rating_standards'
        participants INTEGER[], -- array of coach IDs
        test_scenarios TEXT[],
        
        -- Results tracking
        consistency_score DECIMAL(5,2), -- how consistent ratings were across coaches
        areas_for_improvement TEXT[],
        action_items TEXT[],
        follow_up_required BOOLEAN DEFAULT FALSE,
        next_session_date TIMESTAMP,
        
        -- Session materials
        training_materials_url VARCHAR(255),
        assessment_videos TEXT[], -- URLs to assessment training videos
        notes TEXT
      );
    `);

    // 10. Facility Analytics and Performance Metrics
    await db.execute(`
      CREATE TABLE IF NOT EXISTS facility_performance_metrics (
        id SERIAL PRIMARY KEY,
        facility_id INTEGER REFERENCES training_centers(id),
        metric_date DATE DEFAULT CURRENT_DATE,
        
        -- Student development metrics
        total_active_students INTEGER DEFAULT 0,
        average_rating_improvement DECIMAL(5,2) DEFAULT 0.00,
        students_achieving_goals INTEGER DEFAULT 0,
        tournament_ready_students INTEGER DEFAULT 0,
        
        -- Coach effectiveness metrics
        total_active_coaches INTEGER DEFAULT 0,
        average_coach_effectiveness DECIMAL(3,2) DEFAULT 0.00,
        assessment_consistency_score DECIMAL(5,2) DEFAULT 0.00,
        coach_training_hours DECIMAL(5,2) DEFAULT 0.00,
        
        -- Drill library metrics
        total_drills_available INTEGER DEFAULT 0,
        most_effective_drills INTEGER[], -- array of drill IDs
        average_drill_success_rate DECIMAL(5,2) DEFAULT 0.00,
        custom_drills_created INTEGER DEFAULT 0,
        
        -- Business impact metrics
        student_retention_rate DECIMAL(5,2) DEFAULT 0.00,
        revenue_per_student DECIMAL(10,2) DEFAULT 0.00,
        lesson_completion_rate DECIMAL(5,2) DEFAULT 0.00,
        parent_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
        
        -- Calculated at end of day/week/month
        calculated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for performance optimization
    console.log('📊 Creating performance indexes...');
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_player_pcp_profiles_player_id ON player_pcp_profiles(player_id);
      CREATE INDEX IF NOT EXISTS idx_player_pcp_profiles_facility_id ON player_pcp_profiles(facility_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_skill_assessments_profile_id ON pcp_skill_assessments(profile_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_skill_assessments_coach_id ON pcp_skill_assessments(coach_id);
      CREATE INDEX IF NOT EXISTS idx_coaching_drills_category ON coaching_drills(category);
      CREATE INDEX IF NOT EXISTS idx_coaching_drills_difficulty ON coaching_drills(difficulty_level);
      CREATE INDEX IF NOT EXISTS idx_drill_performance_logs_player_id ON drill_performance_logs(player_id);
      CREATE INDEX IF NOT EXISTS idx_drill_performance_logs_drill_id ON drill_performance_logs(drill_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_rating_history_profile_id ON pcp_rating_history(profile_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_rating_history_date ON pcp_rating_history(recorded_date);
      CREATE INDEX IF NOT EXISTS idx_pcp_goals_profile_id ON pcp_goals(profile_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_achievements_profile_id ON pcp_achievements(profile_id);
    `);

    console.log('✅ PCP Coaching Ecosystem database schema created successfully!');
    console.log('');
    console.log('📋 Schema Summary:');
    console.log('   • Player PCP Profiles: Central rating storage with 4-dimensional assessment');
    console.log('   • Skill Assessments: Detailed granular skill evaluation tracking');
    console.log('   • Coaching Drills: Comprehensive drill library with PCP integration');
    console.log('   • Performance Logs: Individual drill performance and improvement tracking');
    console.log('   • Goals & Achievements: Motivation and milestone recognition system');
    console.log('   • Rating History: Historical trend analysis and progression tracking');
    console.log('   • Quality Assurance: Coach calibration and consistency monitoring');
    console.log('   • Analytics: Facility performance metrics and business intelligence');
    console.log('');
    console.log('🚀 Ready for Sprint 1 development: Core Rating System & Basic Assessment');

  } catch (error) {
    console.error('❌ Error creating PCP Coaching Ecosystem schema:', error);
    throw error;
  }
}

// Execute the schema creation
createPCPCoachingEcosystemSchema()
  .then(() => {
    console.log('🎉 PCP Coaching Ecosystem database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });