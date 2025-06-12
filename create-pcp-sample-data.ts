/**
 * PCP Coaching Ecosystem - Sample Data Creation
 * Creates realistic test data for Sprint 1 development and testing
 */

import { Pool } from '@neondatabase/serverless';

async function createPCPSampleData() {
  console.log('🏓 Creating PCP Coaching Ecosystem sample data...');

  try {
    // 1. Create sample drill library
    console.log('📚 Creating drill library...');
    
    const drillsData = [
      {
        name: 'Serve Accuracy Challenge',
        description: 'Practice serving to specific targets to improve placement and consistency',
        category: 'technical',
        subcategory: 'serving',
        difficulty_level: 2,
        estimated_duration: 15,
        equipment_needed: ['Targets or cones', 'Practice balls'],
        objective: 'Improve serve placement and consistency',
        instructions: 'Set up targets in service boxes. Serve 20 balls, aiming for specific targets.',
        coaching_points: ['Focus on consistent toss', 'Follow through toward target', 'Use paddle face angle for placement'],
        primary_skill_target: 'serve_execution',
        secondary_skill_targets: ['focus_concentration'],
        skill_improvement_weight: 1.0,
        success_metric_type: 'accuracy',
        target_success_rate: 70.0
      },
      {
        name: 'Dinking Control Drill',
        description: 'Develop soft touch and control at the net through sustained dinking rallies',
        category: 'technical',
        subcategory: 'net_play',
        difficulty_level: 3,
        estimated_duration: 20,
        equipment_needed: ['Practice balls'],
        objective: 'Master soft shots and control at the net',
        instructions: 'Start at kitchen line. Keep ball low and in play for 20+ consecutive dinks.',
        coaching_points: ['Soft grip', 'Contact ball early', 'Keep paddle face slightly open'],
        primary_skill_target: 'net_play',
        secondary_skill_targets: ['patience', 'balance_stability'],
        skill_improvement_weight: 1.2,
        success_metric_type: 'consistency',
        target_success_rate: 75.0
      },
      {
        name: 'Third Shot Drop Practice',
        description: 'Learn to hit soft, arcing shots from baseline to kitchen line',
        category: 'tactical',
        subcategory: 'shot_selection',
        difficulty_level: 4,
        estimated_duration: 25,
        equipment_needed: ['Practice balls', 'Targets'],
        objective: 'Master the most important shot in pickleball',
        instructions: 'From baseline, hit soft shots that land in kitchen area and bounce low.',
        coaching_points: ['High to low swing path', 'Lift ball with topspin', 'Aim for kitchen line'],
        primary_skill_target: 'third_shot',
        secondary_skill_targets: ['shot_selection', 'risk_management'],
        skill_improvement_weight: 1.5,
        success_metric_type: 'accuracy',
        target_success_rate: 60.0
      },
      {
        name: 'Court Movement Ladder',
        description: 'Improve footwork and court coverage through agility exercises',
        category: 'physical',
        subcategory: 'movement',
        difficulty_level: 2,
        estimated_duration: 10,
        equipment_needed: ['Agility ladder or cones'],
        objective: 'Enhance footwork and court coverage',
        instructions: 'Complete ladder drills focusing on quick feet and balance.',
        coaching_points: ['Stay on balls of feet', 'Keep knees bent', 'Quick, light steps'],
        primary_skill_target: 'footwork',
        secondary_skill_targets: ['balance_stability', 'court_movement'],
        skill_improvement_weight: 1.0,
        success_metric_type: 'form',
        target_success_rate: 80.0
      },
      {
        name: 'Pressure Point Simulation',
        description: 'Practice maintaining focus and technique under competitive pressure',
        category: 'mental',
        subcategory: 'pressure_performance',
        difficulty_level: 5,
        estimated_duration: 30,
        equipment_needed: ['Practice balls', 'Scoreboard'],
        objective: 'Develop mental toughness and pressure performance',
        instructions: 'Play points with consequences for errors. Maintain technique under pressure.',
        coaching_points: ['Deep breathing', 'Focus on process not outcome', 'Stay positive'],
        primary_skill_target: 'pressure_performance',
        secondary_skill_targets: ['focus_concentration', 'adaptability'],
        skill_improvement_weight: 1.3,
        success_metric_type: 'consistency',
        target_success_rate: 65.0
      }
    ];

    for (const drill of drillsData) {
      await db.query(`
        INSERT INTO coaching_drills (
          name, description, category, subcategory, difficulty_level,
          estimated_duration, equipment_needed, objective, instructions,
          coaching_points, primary_skill_target, secondary_skill_targets,
          skill_improvement_weight, success_metric_type, target_success_rate,
          created_by, facility_id, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 1, 1, true)
      `, [
        drill.name, drill.description, drill.category, drill.subcategory,
        drill.difficulty_level, drill.estimated_duration, drill.equipment_needed,
        drill.objective, drill.instructions, drill.coaching_points,
        drill.primary_skill_target, drill.secondary_skill_targets,
        drill.skill_improvement_weight, drill.success_metric_type,
        drill.target_success_rate
      ]);
    }

    // 2. Create sample player PCP profiles
    console.log('👥 Creating player profiles...');
    
    // Get some existing users to create profiles for
    const usersResult = await db.query('SELECT id FROM users LIMIT 3');
    const users = usersResult.rows;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Create PCP profile
      const profileResult = await db.query(`
        INSERT INTO player_pcp_profiles (
          player_id, facility_id, overall_rating, technical_rating,
          tactical_rating, physical_rating, mental_rating,
          total_assessments, assigned_coach_id, competitive_level
        ) VALUES ($1, 1, $2, $3, $4, $5, $6, 1, 1, $7)
        RETURNING id
      `, [
        user.id,
        2.0 + (i * 0.5), // Overall ratings from 2.0 to 3.0
        2.2 + (i * 0.4), // Technical
        1.8 + (i * 0.6), // Tactical  
        2.5 + (i * 0.3), // Physical
        2.0 + (i * 0.5), // Mental
        i === 0 ? 'beginner' : i === 1 ? 'recreational' : 'intermediate'
      ]);

      const profileId = profileResult.rows[0].id;

      // Create initial assessment
      await db.query(`
        INSERT INTO pcp_skill_assessments (
          profile_id, coach_id, assessment_type,
          serve_execution, return_technique, groundstrokes, net_play,
          shot_selection, court_positioning, footwork, focus_concentration,
          calculated_technical, calculated_tactical, calculated_physical,
          calculated_mental, calculated_overall, session_notes
        ) VALUES ($1, 1, 'comprehensive', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        profileId,
        2.0 + (i * 0.5), // serve_execution
        2.2 + (i * 0.4), // return_technique
        2.1 + (i * 0.3), // groundstrokes
        1.8 + (i * 0.7), // net_play
        1.7 + (i * 0.6), // shot_selection
        2.0 + (i * 0.5), // court_positioning
        2.3 + (i * 0.4), // footwork
        2.0 + (i * 0.5), // focus_concentration
        2.2 + (i * 0.4), // calculated_technical
        1.8 + (i * 0.6), // calculated_tactical
        2.5 + (i * 0.3), // calculated_physical
        2.0 + (i * 0.5), // calculated_mental
        2.0 + (i * 0.5), // calculated_overall
        `Initial assessment for player ${i + 1}. Shows good fundamentals with room for improvement in tactical awareness.`
      ]);

      // Create sample goal
      await db.query(`
        INSERT INTO pcp_goals (
          profile_id, coach_id, goal_type, target_skill,
          current_value, target_value, title, description,
          target_date, success_criteria, priority_level
        ) VALUES ($1, 1, 'skill_improvement', $2, $3, $4, $5, $6, $7, $8, 'high')
      `, [
        profileId,
        i === 0 ? 'serve_execution' : i === 1 ? 'net_play' : 'shot_selection',
        2.0 + (i * 0.5),
        3.0 + (i * 0.3),
        i === 0 ? 'Improve Serve Consistency' : i === 1 ? 'Master Net Play' : 'Better Shot Selection',
        i === 0 ? 'Achieve 70% serve accuracy in target zones' : 
        i === 1 ? 'Maintain 20+ dink rallies consistently' : 
        'Make tactical decisions that advance position',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        i === 0 ? 'Land 7 out of 10 serves in designated targets' :
        i === 1 ? 'Complete dinking drill without errors' :
        'Demonstrate improved court positioning in matches'
      ]);

      // Create achievement
      await db.query(`
        INSERT INTO pcp_achievements (
          profile_id, achievement_type, achievement_name,
          category, difficulty_level, points_earned,
          skill_area, rating_at_achievement, description,
          badge_icon, verified_by
        ) VALUES ($1, 'skill_milestone', $2, $3, 1, 10, $4, $5, $6, $7, 1)
      `, [
        profileId,
        i === 0 ? 'First Assessment Complete' : i === 1 ? 'Consistent Practice' : 'Goal Setter',
        i === 0 ? 'technical' : i === 1 ? 'physical' : 'tactical',
        i === 0 ? 'serve_execution' : i === 1 ? 'footwork' : 'shot_selection',
        2.0 + (i * 0.5),
        i === 0 ? 'Completed comprehensive PCP assessment' :
        i === 1 ? 'Attended 5 consecutive training sessions' :
        'Set first development goal with coach',
        i === 0 ? 'assessment-badge' : i === 1 ? 'practice-badge' : 'goal-badge'
      ]);

      // Add to rating history
      await db.query(`
        INSERT INTO pcp_rating_history (
          profile_id, overall_rating, technical_rating, tactical_rating,
          physical_rating, mental_rating, trigger_event, coach_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, 'initial_assessment', $7)
      `, [
        profileId,
        2.0 + (i * 0.5), // overall
        2.2 + (i * 0.4), // technical
        1.8 + (i * 0.6), // tactical
        2.5 + (i * 0.3), // physical
        2.0 + (i * 0.5), // mental
        `Initial PCP assessment completed. Player shows ${i === 0 ? 'strong fundamentals' : i === 1 ? 'good athletic ability' : 'tactical understanding'} as primary strength.`
      ]);
    }

    console.log('✅ PCP Coaching Ecosystem sample data created successfully!');
    console.log('');
    console.log('📊 Sample Data Summary:');
    console.log('   • 5 comprehensive drills across all skill categories');
    console.log('   • 3 player profiles with initial assessments');
    console.log('   • Individual goals and achievements for each player');
    console.log('   • Rating history tracking progression');
    console.log('   • Ready for Sprint 1 testing and development');

  } catch (error) {
    console.error('❌ Error creating PCP sample data:', error);
    throw error;
  }
}

// Execute the sample data creation
createPCPSampleData()
  .then(() => {
    console.log('🎉 PCP sample data setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sample data creation failed:', error);
    process.exit(1);
  });