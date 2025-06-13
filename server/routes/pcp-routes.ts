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
  // Calculate groundstrokes average from detailed breakdown
  const groundstrokesAverage = calculateDimensionalRating([
    assessment.forehand_topspin,
    assessment.forehand_slice,
    assessment.backhand_topspin,
    assessment.backhand_slice
  ]);

  // Calculate net play average from detailed breakdown
  const netPlayAverage = calculateDimensionalRating([
    assessment.forehand_dead_dink,
    assessment.forehand_topspin_dink,
    assessment.forehand_slice_dink,
    assessment.backhand_dead_dink,
    assessment.backhand_topspin_dink,
    assessment.backhand_slice_dink,
    assessment.forehand_block_volley,
    assessment.forehand_drive_volley,
    assessment.forehand_dink_volley,
    assessment.backhand_block_volley,
    assessment.backhand_drive_volley,
    assessment.backhand_dink_volley
  ]);

  // Technical Skills (40% weight)
  const technical = calculateDimensionalRating([
    assessment.serve_execution,
    assessment.return_technique,
    groundstrokesAverage,
    netPlayAverage,
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

    // Get player profile with username - check by profile ID first, then by player_id
    let profileResult = await pool.query(`
      SELECT pcp.*, u.username as name 
      FROM player_pcp_profiles pcp
      LEFT JOIN users u ON pcp.player_id = u.id
      WHERE pcp.id = $1 OR pcp.player_id = $1
      ORDER BY CASE WHEN pcp.id = $1 THEN 1 ELSE 2 END
      LIMIT 1
    `, [playerId]);

    if (profileResult.rows.length === 0) {
      // Create new profile and get username
      const newProfileResult = await pool.query(`
        INSERT INTO player_pcp_profiles (
          player_id, facility_id, overall_rating, technical_rating,
          tactical_rating, physical_rating, mental_rating, total_assessments
        ) VALUES ($1, 1, 2.0, 2.0, 2.0, 2.0, 2.0, 0)
        RETURNING *
      `, [playerId]);
      
      // Get username for the new profile
      const userResult = await pool.query(`
        SELECT username FROM users WHERE id = $1
      `, [playerId]);
      
      profileResult.rows[0] = {
        ...newProfileResult.rows[0],
        name: userResult.rows[0]?.username || `Player ${playerId}`
      };
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

    // Insert skill assessment with detailed technical breakdown
    const assessmentResult = await pool.query(`
      INSERT INTO pcp_skill_assessments (
        profile_id, coach_id, assessment_type,
        serve_execution, return_technique, third_shot,
        overhead_defense, shot_creativity, court_movement,
        forehand_topspin, forehand_slice, backhand_topspin, backhand_slice,
        forehand_dead_dink, forehand_topspin_dink, forehand_slice_dink,
        backhand_dead_dink, backhand_topspin_dink, backhand_slice_dink,
        forehand_block_volley, forehand_drive_volley, forehand_dink_volley,
        backhand_block_volley, backhand_drive_volley, backhand_dink_volley,
        shot_selection, court_positioning, pattern_recognition, risk_management, communication,
        footwork, balance_stability, reaction_time, endurance,
        focus_concentration, pressure_performance, adaptability, sportsmanship,
        calculated_technical, calculated_tactical, calculated_physical, calculated_mental,
        calculated_overall, session_notes, confidence_level
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43
      ) RETURNING id
    `, [
      profile.id,
      assessment.coach_id,
      assessment.assessment_type,
      assessment.serve_execution,
      assessment.return_technique,
      assessment.third_shot || 2.0,
      assessment.overhead_defense || 2.0,
      assessment.shot_creativity || 2.0,
      assessment.court_movement || 2.0,
      // Groundstrokes breakdown
      assessment.forehand_topspin || 2.0,
      assessment.forehand_slice || 2.0,
      assessment.backhand_topspin || 2.0,
      assessment.backhand_slice || 2.0,
      // Net play breakdown
      assessment.forehand_dead_dink || 2.0,
      assessment.forehand_topspin_dink || 2.0,
      assessment.forehand_slice_dink || 2.0,
      assessment.backhand_dead_dink || 2.0,
      assessment.backhand_topspin_dink || 2.0,
      assessment.backhand_slice_dink || 2.0,
      assessment.forehand_block_volley || 2.0,
      assessment.forehand_drive_volley || 2.0,
      assessment.forehand_dink_volley || 2.0,
      assessment.backhand_block_volley || 2.0,
      assessment.backhand_drive_volley || 2.0,
      assessment.backhand_dink_volley || 2.0,
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

// GET /api/pcp/profile/:id - Get individual player profile for progress page
router.get('/profile/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    if (isNaN(playerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid player ID'
      });
    }

    // Get player profile data
    const profileResult = await pool.query(`
      SELECT 
        pcp.id,
        pcp.player_id,
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
      WHERE pcp.id = $1
    `, [playerId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const player = profileResult.rows[0];
    console.log('Player data from DB:', player);

    // Get assessment history (last 10 assessments)
    const historyResult = await pool.query(`
      SELECT 
        assessment_date,
        overall_rating,
        technical_rating,
        tactical_rating,
        physical_rating,
        mental_rating,
        trigger_event,
        coach_notes
      FROM pcp_rating_history
      WHERE profile_id = $1
      ORDER BY assessment_date DESC
      LIMIT 10
    `, [playerId]);

    // Return structured response with profile data
    res.json({
      success: true,
      data: {
        profile: {
          ...player,
          overall_rating: parseFloat(player.overall_rating),
          technical_rating: parseFloat(player.technical_rating),
          tactical_rating: parseFloat(player.tactical_rating),
          physical_rating: parseFloat(player.physical_rating),
          mental_rating: parseFloat(player.mental_rating)
        },
        recentAssessments: historyResult.rows,
        currentGoals: [], // Placeholder for future goal tracking
        recentAchievements: [] // Placeholder for future achievement system
      }
    });

  } catch (error) {
    console.error('Error fetching player profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player profile'
    });
  }
});

// GET /api/pcp/skill-breakdown/:playerId - Get detailed skill breakdown for player
router.get('/skill-breakdown/:playerId', async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    
    if (isNaN(playerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid player ID'
      });
    }

    // Get player profile
    const profileResult = await pool.query(`
      SELECT 
        pcp.*,
        u.username as name
      FROM player_pcp_profiles pcp
      JOIN users u ON pcp.player_id = u.id
      WHERE pcp.id = $1
    `, [playerId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const profile = profileResult.rows[0];

    // Get latest detailed skill assessment
    const latestAssessmentResult = await pool.query(`
      SELECT 
        serve_execution, return_technique, groundstrokes, net_play, third_shot,
        overhead_defense, shot_creativity, court_movement,
        shot_selection, court_positioning, pattern_recognition, risk_management, communication,
        footwork, balance_stability, reaction_time, endurance,
        focus_concentration, pressure_performance, adaptability, sportsmanship,
        assessment_date
      FROM pcp_skill_assessments
      WHERE profile_id = $1
      ORDER BY assessment_date DESC
      LIMIT 1
    `, [playerId]);

    // Create skill breakdown structure
    const skillBreakdown = {
      technical: {
        serve_execution: latestAssessmentResult.rows[0]?.serve_execution || profile.technical_rating,
        return_technique: latestAssessmentResult.rows[0]?.return_technique || profile.technical_rating,
        groundstrokes: latestAssessmentResult.rows[0]?.groundstrokes || profile.technical_rating,
        net_play: latestAssessmentResult.rows[0]?.net_play || profile.technical_rating,
        third_shot: latestAssessmentResult.rows[0]?.third_shot || profile.technical_rating,
        overhead_defense: latestAssessmentResult.rows[0]?.overhead_defense || profile.technical_rating,
        shot_creativity: latestAssessmentResult.rows[0]?.shot_creativity || profile.technical_rating,
        court_movement: latestAssessmentResult.rows[0]?.court_movement || profile.technical_rating
      },
      tactical: {
        shot_selection: latestAssessmentResult.rows[0]?.shot_selection || profile.tactical_rating,
        court_positioning: latestAssessmentResult.rows[0]?.court_positioning || profile.tactical_rating,
        pattern_recognition: latestAssessmentResult.rows[0]?.pattern_recognition || profile.tactical_rating,
        risk_management: latestAssessmentResult.rows[0]?.risk_management || profile.tactical_rating,
        communication: latestAssessmentResult.rows[0]?.communication || profile.tactical_rating
      },
      physical: {
        footwork: latestAssessmentResult.rows[0]?.footwork || profile.physical_rating,
        balance_stability: latestAssessmentResult.rows[0]?.balance_stability || profile.physical_rating,
        reaction_time: latestAssessmentResult.rows[0]?.reaction_time || profile.physical_rating,
        endurance: latestAssessmentResult.rows[0]?.endurance || profile.physical_rating
      },
      mental: {
        focus_concentration: latestAssessmentResult.rows[0]?.focus_concentration || profile.mental_rating,
        pressure_performance: latestAssessmentResult.rows[0]?.pressure_performance || profile.mental_rating,
        adaptability: latestAssessmentResult.rows[0]?.adaptability || profile.mental_rating,
        sportsmanship: latestAssessmentResult.rows[0]?.sportsmanship || profile.mental_rating
      }
    };

    res.json({
      success: true,
      data: {
        playerName: profile.name,
        overallRating: parseFloat(profile.overall_rating),
        lastAssessment: latestAssessmentResult.rows[0]?.assessment_date || profile.last_assessment_date,
        skillBreakdown
      }
    });

  } catch (error) {
    console.error('Error fetching skill breakdown:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skill breakdown'
    });
  }
});

export default router;