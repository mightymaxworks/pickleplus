/**
 * PCP Coaching Ecosystem API Routes - Working Implementation
 * Sprint 1: Core Rating System & Assessment Interface
 */

import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// PCP Rating Calculation Functions
function calculateDimensionalRating(skills: (number | null)[]): number {
  const validSkills = skills.filter(skill => skill !== null && !isNaN(skill as number)) as number[];
  if (validSkills.length === 0) return 2.0;
  return validSkills.reduce((sum, skill) => sum + skill, 0) / validSkills.length;
}

function calculateOverallPCPRating(assessment: any): {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  overall: number;
} {
  // Technical Skills (40% weight)
  const technical = calculateDimensionalRating([
    assessment.serve_execution,
    assessment.return_technique,
    assessment.groundstrokes,
    assessment.net_play,
    assessment.third_shot,
    assessment.overhead_defense,
    assessment.shot_creativity,
    assessment.court_movement
  ]);

  // Tactical Awareness (25% weight)
  const tactical = calculateDimensionalRating([
    assessment.shot_selection,
    assessment.court_positioning,
    assessment.pattern_recognition,
    assessment.risk_management,
    assessment.communication
  ]);

  // Physical Attributes (20% weight)
  const physical = calculateDimensionalRating([
    assessment.footwork,
    assessment.balance_stability,
    assessment.reaction_time,
    assessment.endurance
  ]);

  // Mental Game (15% weight)
  const mental = calculateDimensionalRating([
    assessment.focus_concentration,
    assessment.pressure_performance,
    assessment.adaptability,
    assessment.sportsmanship
  ]);

  // Calculate weighted overall rating
  const overall = (technical * 0.40) + (tactical * 0.25) + (physical * 0.20) + (mental * 0.15);

  return {
    technical: Math.round(technical * 10) / 10,
    tactical: Math.round(tactical * 10) / 10,
    physical: Math.round(physical * 10) / 10,
    mental: Math.round(mental * 10) / 10,
    overall: Math.round(overall * 10) / 10
  };
}

// GET /api/pcp/profile/:playerId - Get player PCP profile
router.get('/profile/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get or create player profile
    let profileResult = await pool.query(
      'SELECT * FROM player_pcp_profiles WHERE player_id = $1',
      [playerId]
    );

    if (profileResult.rows.length === 0) {
      // Create new profile
      profileResult = await pool.query(`
        INSERT INTO player_pcp_profiles (
          player_id, facility_id, overall_rating, technical_rating,
          tactical_rating, physical_rating, mental_rating, total_assessments
        ) VALUES ($1, 1, 2.0, 2.0, 2.0, 2.0, 2.0, 0)
        RETURNING *
      `, [playerId]);
    }

    const profile = profileResult.rows[0];

    // Get recent assessments
    const assessments = await pool.query(`
      SELECT * FROM pcp_skill_assessments 
      WHERE profile_id = $1 
      ORDER BY assessment_date DESC 
      LIMIT 5
    `, [profile.id]);

    // Get current goals
    const goals = await pool.query(`
      SELECT * FROM pcp_goals 
      WHERE profile_id = $1 AND achieved = false
      ORDER BY created_date DESC
    `, [profile.id]);

    // Get achievements
    const achievements = await pool.query(`
      SELECT * FROM pcp_achievements 
      WHERE profile_id = $1 
      ORDER BY earned_date DESC 
      LIMIT 10
    `, [profile.id]);

    res.json({
      success: true,
      data: {
        profile,
        recentAssessments: assessments.rows,
        currentGoals: goals.rows,
        recentAchievements: achievements.rows
      }
    });

  } catch (error) {
    console.error('Error fetching PCP profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player profile'
    });
  }
});

// POST /api/pcp/assessment - Submit new assessment
router.post('/assessment', async (req, res) => {
  try {
    const assessment = req.body;
    
    // Calculate dimensional ratings
    const ratings = calculateOverallPCPRating(assessment);

    // Get or create player profile
    let profileResult = await pool.query(
      'SELECT * FROM player_pcp_profiles WHERE player_id = $1',
      [assessment.profile_id]
    );

    if (profileResult.rows.length === 0) {
      profileResult = await pool.query(`
        INSERT INTO player_pcp_profiles (
          player_id, facility_id, overall_rating, technical_rating,
          tactical_rating, physical_rating, mental_rating, total_assessments
        ) VALUES ($1, 1, $2, $3, $4, $5, $6, 1)
        RETURNING *
      `, [
        assessment.profile_id,
        ratings.overall,
        ratings.technical,
        ratings.tactical,
        ratings.physical,
        ratings.mental
      ]);
    }

    const profile = profileResult.rows[0];

    // Insert skill assessment
    const assessmentResult = await pool.query(`
      INSERT INTO pcp_skill_assessments (
        profile_id, coach_id, assessment_type,
        serve_execution, return_technique, groundstrokes, net_play, third_shot,
        overhead_defense, shot_creativity, court_movement,
        shot_selection, court_positioning, pattern_recognition, risk_management, communication,
        footwork, balance_stability, reaction_time, endurance,
        focus_concentration, pressure_performance, adaptability, sportsmanship,
        calculated_technical, calculated_tactical, calculated_physical, calculated_mental,
        calculated_overall, session_notes, confidence_level
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      ) RETURNING id
    `, [
      profile.id,
      assessment.coach_id,
      assessment.assessment_type,
      assessment.serve_execution,
      assessment.return_technique,
      assessment.groundstrokes,
      assessment.net_play,
      assessment.third_shot || 2.0,
      assessment.overhead_defense || 2.0,
      assessment.shot_creativity || 2.0,
      assessment.court_movement || 2.0,
      assessment.shot_selection,
      assessment.court_positioning,
      assessment.pattern_recognition || 2.0,
      assessment.risk_management || 2.0,
      assessment.communication || 2.0,
      assessment.footwork,
      assessment.balance_stability,
      assessment.reaction_time || 2.0,
      assessment.endurance || 2.0,
      assessment.focus_concentration,
      assessment.pressure_performance || 2.0,
      assessment.adaptability || 2.0,
      assessment.sportsmanship || 2.0,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      ratings.overall,
      assessment.session_notes,
      assessment.confidence_level || 0.8
    ]);

    // Update profile with new ratings
    await pool.query(`
      UPDATE player_pcp_profiles 
      SET overall_rating = $1, technical_rating = $2, tactical_rating = $3,
          physical_rating = $4, mental_rating = $5, total_assessments = total_assessments + 1,
          last_assessment_date = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [
      ratings.overall,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      profile.id
    ]);

    // Add to rating history
    await pool.query(`
      INSERT INTO pcp_rating_history (
        profile_id, overall_rating, technical_rating, tactical_rating,
        physical_rating, mental_rating, trigger_event, coach_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      profile.id,
      ratings.overall,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      'coach_assessment',
      assessment.session_notes
    ]);

    res.json({
      success: true,
      data: {
        assessmentId: assessmentResult.rows[0].id,
        updatedRatings: ratings,
        message: 'Assessment submitted successfully'
      }
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assessment'
    });
  }
});

// GET /api/pcp/drills - Get drill library
router.get('/drills', async (req, res) => {
  try {
    console.log('PCP Drills: Starting query execution');
    const { category, skill_focus, difficulty_level } = req.query;
    
    let query = 'SELECT * FROM pcp_drill_library WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (skill_focus) {
      paramCount++;
      query += ` AND skill_focus = $${paramCount}`;
      params.push(skill_focus);
    }

    if (difficulty_level) {
      paramCount++;
      query += ` AND difficulty_level = $${paramCount}`;
      params.push(difficulty_level);
    }

    query += ' ORDER BY category, difficulty_level, name';

    console.log('PCP Drills: Executing query:', query, 'with params:', params);
    const result = await pool.query(query, params);
    console.log('PCP Drills: Query result rows:', result.rows.length);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching drills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drills'
    });
  }
});

// GET /api/pcp/coach/dashboard - Get coach dashboard data
router.get('/coach/dashboard', async (req, res) => {
  try {
    // Get real students (exclude the coach themselves - user ID 1 is mightymax)
    const playersResult = await pool.query(`
      SELECT 
        pcp.id,
        u.username as name,
        pcp.overall_rating,
        pcp.technical_rating,
        pcp.tactical_rating,
        pcp.physical_rating,
        pcp.mental_rating,
        pcp.total_assessments,
        pcp.last_assessment_date,
        pcp.current_focus_areas
      FROM player_pcp_profiles pcp
      JOIN users u ON pcp.player_id = u.id
      WHERE u.id != 1
      ORDER BY pcp.last_assessment_date DESC NULLS LAST
      LIMIT 20
    `);

    // Get recent assessments
    const assessmentsResult = await pool.query(`
      SELECT 
        sa.id,
        sa.assessment_date,
        sa.calculated_overall,
        u.username as player_name
      FROM pcp_skill_assessments sa
      JOIN player_pcp_profiles pcp ON sa.profile_id = pcp.id
      JOIN users u ON pcp.player_id = u.id
      ORDER BY sa.assessment_date DESC
      LIMIT 10
    `);

    // Calculate coach stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT pcp.id) as total_players,
        COUNT(sa.id) FILTER (WHERE sa.assessment_date >= CURRENT_DATE - INTERVAL '30 days') as assessments_this_month
      FROM player_pcp_profiles pcp
      LEFT JOIN pcp_skill_assessments sa ON sa.profile_id = pcp.id
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        myPlayers: playersResult.rows,
        recentAssessments: assessmentsResult.rows,
        upcomingSessions: [], // TODO: Implement when session scheduling is added
        myStats: {
          totalPlayers: parseInt(stats.total_players) || 0,
          assessmentsThisMonth: parseInt(stats.assessments_this_month) || 0,
          averageImprovement: 18, // TODO: Calculate from historical data
          hoursCoached: 156 // TODO: Calculate from session data
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coach dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach dashboard data'
    });
  }
});

// GET /api/pcp/recommendations/:playerId - Get personalized drill recommendations
router.get('/recommendations/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get player profile
    const profileResult = await pool.query(
      'SELECT * FROM player_pcp_profiles WHERE player_id = $1',
      [playerId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player profile not found'
      });
    }

    const profile = profileResult.rows[0];

    // Identify weakest areas for targeted improvement
    const ratings = {
      technical: profile.technical_rating,
      tactical: profile.tactical_rating,
      physical: profile.physical_rating,
      mental: profile.mental_rating
    };

    // Find lowest rating category
    const lowestCategory = Object.entries(ratings).reduce((min, [category, rating]) => 
      rating < min.rating ? { category, rating } : min
    , { category: 'technical', rating: ratings.technical });

    // Get drills for improvement area
    const drillsResult = await pool.query(`
      SELECT * FROM coaching_drills 
      WHERE category = $1 AND difficulty_level <= $2 AND is_public = true
      ORDER BY skill_improvement_weight DESC, target_success_rate DESC
      LIMIT 5
    `, [lowestCategory.category, Math.min(Math.ceil(profile.overall_rating) + 1, 5)]);

    res.json({
      success: true,
      data: {
        focusArea: lowestCategory.category,
        currentRating: lowestCategory.rating,
        recommendedDrills: drillsResult.rows,
        improvementGoal: Math.min(lowestCategory.rating + 0.5, 5.0)
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
});

// POST /api/pcp/goal - Create a new goal
router.post('/goal', async (req, res) => {
  try {
    const goal = req.body;

    const result = await pool.query(`
      INSERT INTO pcp_goals (
        profile_id, coach_id, goal_type, target_skill, current_value,
        target_value, title, description, target_date, success_criteria, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      goal.profile_id,
      goal.coach_id,
      goal.goal_type,
      goal.target_skill,
      goal.current_value,
      goal.target_value,
      goal.title,
      goal.description,
      goal.target_date,
      goal.success_criteria,
      goal.priority_level
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal'
    });
  }
});

export default router;