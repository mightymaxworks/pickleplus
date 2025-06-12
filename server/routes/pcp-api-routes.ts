/**
 * PCP Coaching Ecosystem API Routes - Fixed Version
 * Sprint 1: Core Rating System & Basic Assessment
 */

import { Router } from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = Router();

// PCP Rating Calculation Engine
function calculateDimensionalRating(skills: (number | null)[]): number {
  const validSkills = skills.filter(skill => skill !== null && skill !== undefined) as number[];
  if (validSkills.length === 0) return 0;
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
  const technicalSkills = [
    assessment.serve_execution,
    assessment.return_technique,
    assessment.groundstrokes,
    assessment.net_play,
    assessment.third_shot,
    assessment.overhead_defense,
    assessment.shot_creativity,
    assessment.court_movement
  ];

  // Tactical Awareness (25% weight)
  const tacticalSkills = [
    assessment.shot_selection,
    assessment.court_positioning,
    assessment.pattern_recognition,
    assessment.risk_management,
    assessment.communication
  ];

  // Physical Attributes (20% weight)
  const physicalSkills = [
    assessment.footwork,
    assessment.balance_stability,
    assessment.reaction_time,
    assessment.endurance
  ];

  // Mental Game (15% weight)
  const mentalSkills = [
    assessment.focus_concentration,
    assessment.pressure_performance,
    assessment.adaptability,
    assessment.sportsmanship
  ];

  const technical = calculateDimensionalRating(technicalSkills);
  const tactical = calculateDimensionalRating(tacticalSkills);
  const physical = calculateDimensionalRating(physicalSkills);
  const mental = calculateDimensionalRating(mentalSkills);

  // Calculate weighted overall rating
  const overall = (
    technical * 0.40 +
    tactical * 0.25 +
    physical * 0.20 +
    mental * 0.15
  );

  return {
    technical: Math.round(technical * 100) / 100,
    tactical: Math.round(tactical * 100) / 100,
    physical: Math.round(physical * 100) / 100,
    mental: Math.round(mental * 100) / 100,
    overall: Math.round(overall * 100) / 100
  };
}

// GET /api/pcp/profile/:playerId - Get player's PCP profile
router.get('/profile/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get or create player profile
    const profileQuery = `
      SELECT * FROM player_pcp_profiles 
      WHERE player_id = $1
    `;
    const profileResult = await db.query(profileQuery, [playerId]);

    let profile = profileResult.rows[0];

    if (!profile) {
      // Create new profile if doesn't exist
      const createQuery = `
        INSERT INTO player_pcp_profiles (player_id, facility_id)
        VALUES ($1, 1)
        RETURNING *
      `;
      const newProfileResult = await db.query(createQuery, [playerId]);
      
      return res.json({
        success: true,
        data: {
          profile: newProfileResult.rows[0],
          recentAssessments: [],
          currentGoals: [],
          recentAchievements: []
        }
      });
    }

    // Get recent assessments
    const assessmentsQuery = `
      SELECT * FROM pcp_skill_assessments 
      WHERE profile_id = $1 
      ORDER BY assessment_date DESC 
      LIMIT 5
    `;
    const assessmentsResult = await db.query(assessmentsQuery, [profile.id]);

    // Get current goals
    const goalsQuery = `
      SELECT * FROM pcp_goals 
      WHERE profile_id = $1 AND achieved = FALSE
      ORDER BY created_date DESC
    `;
    const goalsResult = await db.query(goalsQuery, [profile.id]);

    // Get recent achievements
    const achievementsQuery = `
      SELECT * FROM pcp_achievements 
      WHERE profile_id = $1 
      ORDER BY earned_date DESC 
      LIMIT 10
    `;
    const achievementsResult = await db.query(achievementsQuery, [profile.id]);

    res.json({
      success: true,
      data: {
        profile,
        recentAssessments: assessmentsResult.rows,
        currentGoals: goalsResult.rows,
        recentAchievements: achievementsResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching PCP profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PCP profile'
    });
  }
});

// POST /api/pcp/assessment - Submit new skill assessment
router.post('/assessment', async (req, res) => {
  try {
    const assessmentData = req.body;
    const { profile_id, coach_id } = assessmentData;

    // Calculate dimensional ratings
    const ratings = calculateOverallPCPRating(assessmentData);

    // Insert assessment record
    const assessmentQuery = `
      INSERT INTO pcp_skill_assessments (
        profile_id, coach_id, assessment_type,
        serve_execution, return_technique, groundstrokes, net_play,
        third_shot, overhead_defense, shot_creativity, court_movement,
        shot_selection, court_positioning, pattern_recognition, 
        risk_management, communication,
        footwork, balance_stability, reaction_time, endurance,
        focus_concentration, pressure_performance, adaptability, sportsmanship,
        calculated_technical, calculated_tactical, calculated_physical, 
        calculated_mental, calculated_overall,
        session_notes, confidence_level
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      ) RETURNING *
    `;

    const assessmentResult = await db.query(assessmentQuery, [
      profile_id, 
      coach_id, 
      assessmentData.assessment_type || 'comprehensive',
      assessmentData.serve_execution || null,
      assessmentData.return_technique || null,
      assessmentData.groundstrokes || null,
      assessmentData.net_play || null,
      assessmentData.third_shot || null,
      assessmentData.overhead_defense || null,
      assessmentData.shot_creativity || null,
      assessmentData.court_movement || null,
      assessmentData.shot_selection || null,
      assessmentData.court_positioning || null,
      assessmentData.pattern_recognition || null,
      assessmentData.risk_management || null,
      assessmentData.communication || null,
      assessmentData.footwork || null,
      assessmentData.balance_stability || null,
      assessmentData.reaction_time || null,
      assessmentData.endurance || null,
      assessmentData.focus_concentration || null,
      assessmentData.pressure_performance || null,
      assessmentData.adaptability || null,
      assessmentData.sportsmanship || null,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      ratings.overall,
      assessmentData.session_notes || '',
      assessmentData.confidence_level || 0.8
    ]);

    // Update player profile with new ratings
    const updateQuery = `
      UPDATE player_pcp_profiles 
      SET 
        overall_rating = $1,
        technical_rating = $2,
        tactical_rating = $3,
        physical_rating = $4,
        mental_rating = $5,
        total_assessments = total_assessments + 1,
        last_assessment_date = NOW(),
        updated_at = NOW()
      WHERE id = $6
    `;
    
    await db.query(updateQuery, [
      ratings.overall,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      profile_id
    ]);

    // Add to rating history
    const historyQuery = `
      INSERT INTO pcp_rating_history (
        profile_id, overall_rating, technical_rating, tactical_rating,
        physical_rating, mental_rating, trigger_event, coach_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await db.query(historyQuery, [
      profile_id,
      ratings.overall,
      ratings.technical,
      ratings.tactical,
      ratings.physical,
      ratings.mental,
      'assessment',
      assessmentData.session_notes || ''
    ]);

    res.json({
      success: true,
      data: {
        assessment: assessmentResult.rows[0],
        updatedRatings: ratings
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

// GET /api/pcp/coach/:coachId/students - Get coach's assigned students
router.get('/coach/:coachId/students', async (req, res) => {
  try {
    const { coachId } = req.params;

    const query = `
      SELECT 
        pp.*,
        u.username,
        u.email,
        recent_assessment.assessment_date as last_activity,
        recent_assessment.session_notes as last_notes
      FROM player_pcp_profiles pp
      JOIN users u ON pp.player_id = u.id
      LEFT JOIN LATERAL (
        SELECT assessment_date, session_notes
        FROM pcp_skill_assessments 
        WHERE profile_id = pp.id 
        ORDER BY assessment_date DESC 
        LIMIT 1
      ) recent_assessment ON true
      WHERE pp.assigned_coach_id = $1
      ORDER BY recent_assessment.assessment_date DESC NULLS LAST
    `;

    const result = await db.query(query, [coachId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching coach students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach students'
    });
  }
});

// POST /api/pcp/goal - Create new goal for player
router.post('/goal', async (req, res) => {
  try {
    const goalData = req.body;

    const query = `
      INSERT INTO pcp_goals (
        profile_id, coach_id, goal_type, target_skill,
        current_value, target_value, title, description,
        target_date, success_criteria, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(query, [
      goalData.profile_id,
      goalData.coach_id,
      goalData.goal_type,
      goalData.target_skill,
      goalData.current_value,
      goalData.target_value,
      goalData.title,
      goalData.description,
      goalData.target_date,
      goalData.success_criteria,
      goalData.priority_level || 'medium'
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

// GET /api/pcp/drills - Get drill library
router.get('/drills', async (req, res) => {
  try {
    const { category, difficulty, skill_target } = req.query;
    
    let query = 'SELECT * FROM coaching_drills WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (difficulty) {
      params.push(difficulty);
      query += ` AND difficulty_level = $${params.length}`;
    }

    if (skill_target) {
      params.push(skill_target);
      query += ` AND primary_skill_target = $${params.length}`;
    }

    query += ' ORDER BY effectiveness_rating DESC, usage_count DESC LIMIT 50';

    const result = await db.query(query, params);

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

export default router;