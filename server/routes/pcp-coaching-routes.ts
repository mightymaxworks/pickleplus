/**
 * PCP Coaching Ecosystem API Routes
 * Sprint 1: Core Rating System & Basic Assessment
 * 
 * Provides API endpoints for:
 * - Player PCP profile management
 * - Coach assessment interface
 * - Rating calculations and updates
 * - Basic drill integration
 */

import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// PCP Rating Calculation Engine
function calculateOverallPCPRating(assessment: any): number {
  const technicalWeight = 0.40;
  const tacticalWeight = 0.25;
  const physicalWeight = 0.20;
  const mentalWeight = 0.15;

  // Calculate dimensional averages
  const technicalSkills = [
    assessment.serve_execution,
    assessment.return_technique,
    assessment.groundstrokes,
    assessment.net_play,
    assessment.third_shot,
    assessment.overhead_defense,
    assessment.shot_creativity,
    assessment.court_movement
  ].filter(rating => rating !== null && rating !== undefined);

  const tacticalSkills = [
    assessment.shot_selection,
    assessment.court_positioning,
    assessment.pattern_recognition,
    assessment.risk_management,
    assessment.communication
  ].filter(rating => rating !== null && rating !== undefined);

  const physicalSkills = [
    assessment.footwork,
    assessment.balance_stability,
    assessment.reaction_time,
    assessment.endurance
  ].filter(rating => rating !== null && rating !== undefined);

  const mentalSkills = [
    assessment.focus_concentration,
    assessment.pressure_performance,
    assessment.adaptability,
    assessment.sportsmanship
  ].filter(rating => rating !== null && rating !== undefined);

  // Calculate dimensional ratings
  const technicalRating = technicalSkills.length > 0 ? 
    technicalSkills.reduce((sum, rating) => sum + rating, 0) / technicalSkills.length : 0;
  
  const tacticalRating = tacticalSkills.length > 0 ? 
    tacticalSkills.reduce((sum, rating) => sum + rating, 0) / tacticalSkills.length : 0;
  
  const physicalRating = physicalSkills.length > 0 ? 
    physicalSkills.reduce((sum, rating) => sum + rating, 0) / physicalSkills.length : 0;
  
  const mentalRating = mentalSkills.length > 0 ? 
    mentalSkills.reduce((sum, rating) => sum + rating, 0) / mentalSkills.length : 0;

  // Calculate weighted overall rating
  const overallRating = (
    technicalRating * technicalWeight +
    tacticalRating * tacticalWeight +
    physicalRating * physicalWeight +
    mentalRating * mentalWeight
  );

  return Math.round(overallRating * 100) / 100;
}

// GET /api/pcp/profile/:playerId - Get player's PCP profile
router.get('/profile/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get or create player profile
    const profileResult = await db.execute(`
      SELECT * FROM player_pcp_profiles 
      WHERE player_id = $1
    `, [playerId]);

    let profile = profileResult.rows[0];

    if (!profile) {
      // Create new profile if doesn't exist
      const newProfileResult = await db.execute(`
        INSERT INTO player_pcp_profiles (player_id, facility_id)
        VALUES ($1, 1)
        RETURNING *
      `, [playerId]);

      return res.json({
        success: true,
        data: newProfileResult.rows[0]
      });
    }

    // Get recent assessments for trend analysis
    const recentAssessmentsResult = await db.execute(`
      SELECT * FROM pcp_skill_assessments 
      WHERE profile_id = $1 
      ORDER BY assessment_date DESC 
      LIMIT 5
    `, [profile.id]);

    // Get current goals
    const currentGoalsResult = await db.execute(`
      SELECT * FROM pcp_goals 
      WHERE profile_id = $1 AND achieved = FALSE
      ORDER BY created_date DESC
    `, [profile.id]);

    // Get recent achievements
    const recentAchievementsResult = await db.execute(`
      SELECT * FROM pcp_achievements 
      WHERE profile_id = $1 
      ORDER BY earned_date DESC 
      LIMIT 10
    `, [profile.id]);

    res.json({
      success: true,
      data: {
        profile,
        recentAssessments,
        currentGoals,
        recentAchievements
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
    const calculatedTechnical = calculateOverallPCPRating(assessmentData);
    const calculatedTactical = calculateOverallPCPRating(assessmentData);
    const calculatedPhysical = calculateOverallPCPRating(assessmentData);
    const calculatedMental = calculateOverallPCPRating(assessmentData);
    const calculatedOverall = calculateOverallPCPRating(assessmentData);

    // Insert assessment record
    const [assessment] = await db.execute(`
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
    `, [
      profile_id, coach_id, assessmentData.assessment_type || 'comprehensive',
      assessmentData.serve_execution, assessmentData.return_technique,
      assessmentData.groundstrokes, assessmentData.net_play,
      assessmentData.third_shot, assessmentData.overhead_defense,
      assessmentData.shot_creativity, assessmentData.court_movement,
      assessmentData.shot_selection, assessmentData.court_positioning,
      assessmentData.pattern_recognition, assessmentData.risk_management,
      assessmentData.communication, assessmentData.footwork,
      assessmentData.balance_stability, assessmentData.reaction_time,
      assessmentData.endurance, assessmentData.focus_concentration,
      assessmentData.pressure_performance, assessmentData.adaptability,
      assessmentData.sportsmanship, calculatedTechnical, calculatedTactical,
      calculatedPhysical, calculatedMental, calculatedOverall,
      assessmentData.session_notes, assessmentData.confidence_level || 0.8
    ]);

    // Update player profile with new ratings
    await db.execute(`
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
    `, [
      calculatedOverall, calculatedTechnical, calculatedTactical,
      calculatedPhysical, calculatedMental, profile_id
    ]);

    // Add to rating history
    await db.execute(`
      INSERT INTO pcp_rating_history (
        profile_id, overall_rating, technical_rating, tactical_rating,
        physical_rating, mental_rating, trigger_event, coach_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      profile_id, calculatedOverall, calculatedTechnical, calculatedTactical,
      calculatedPhysical, calculatedMental, 'assessment', assessmentData.session_notes
    ]);

    res.json({
      success: true,
      data: {
        assessment,
        updatedRatings: {
          overall: calculatedOverall,
          technical: calculatedTechnical,
          tactical: calculatedTactical,
          physical: calculatedPhysical,
          mental: calculatedMental
        }
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

    const students = await db.execute(`
      SELECT 
        pp.*,
        u.username,
        u.email,
        COALESCE(recent_assessment.assessment_date, pp.created_at) as last_activity,
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
    `, [coachId]);

    res.json({
      success: true,
      data: students
    });

  } catch (error) {
    console.error('Error fetching coach students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach students'
    });
  }
});

// GET /api/pcp/profile/:profileId/history - Get rating history
router.get('/profile/:profileId/history', async (req, res) => {
  try {
    const { profileId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await db.execute(`
      SELECT * FROM pcp_rating_history 
      WHERE profile_id = $1 
      ORDER BY recorded_date DESC 
      LIMIT $2
    `, [profileId, limit]);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching rating history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rating history'
    });
  }
});

// POST /api/pcp/goal - Create new goal for player
router.post('/goal', async (req, res) => {
  try {
    const goalData = req.body;

    const [goal] = await db.execute(`
      INSERT INTO pcp_goals (
        profile_id, coach_id, goal_type, target_skill,
        current_value, target_value, title, description,
        target_date, success_criteria, priority_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      goalData.profile_id, goalData.coach_id, goalData.goal_type,
      goalData.target_skill, goalData.current_value, goalData.target_value,
      goalData.title, goalData.description, goalData.target_date,
      goalData.success_criteria, goalData.priority_level || 'medium'
    ]);

    res.json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal'
    });
  }
});

// GET /api/pcp/drills - Get drill library (basic implementation)
router.get('/drills', async (req, res) => {
  try {
    const { category, difficulty, skill_target } = req.query;
    
    let query = 'SELECT * FROM coaching_drills WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    if (skill_target) {
      paramCount++;
      query += ` AND primary_skill_target = $${paramCount}`;
      params.push(skill_target);
    }

    query += ' ORDER BY effectiveness_rating DESC, usage_count DESC LIMIT 50';

    const drills = await db.execute(query, params);

    res.json({
      success: true,
      data: drills
    });

  } catch (error) {
    console.error('Error fetching drills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drills'
    });
  }
});

// POST /api/pcp/drill-performance - Log drill performance
router.post('/drill-performance', async (req, res) => {
  try {
    const performanceData = req.body;

    const [performance] = await db.execute(`
      INSERT INTO drill_performance_logs (
        player_id, coach_id, drill_id, attempts_made,
        successful_attempts, success_percentage, technique_rating,
        effort_level, improvement_observed, performance_notes,
        drill_duration, mastery_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      performanceData.player_id, performanceData.coach_id, performanceData.drill_id,
      performanceData.attempts_made, performanceData.successful_attempts,
      performanceData.success_percentage, performanceData.technique_rating,
      performanceData.effort_level, performanceData.improvement_observed,
      performanceData.performance_notes, performanceData.drill_duration,
      performanceData.mastery_level || 'learning'
    ]);

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('Error logging drill performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log drill performance'
    });
  }
});

// GET /api/pcp/assessments - Get recent PCP assessments for current user
router.get('/assessments', async (req, res) => {
  try {
    // Get current user ID from session (simplified for now)
    const userId = 1; // In a real app, this would come from authentication
    
    // Fetch recent assessments for the user
    const assessments = await db.execute(`
      SELECT 
        id,
        calculated_technical,
        calculated_tactical,
        calculated_physical,
        calculated_mental,
        calculated_overall,
        assessment_date,
        improvement_areas,
        strengths_noted,
        session_notes,
        confidence_level
      FROM pcp_skill_assessments 
      WHERE profile_id = (
        SELECT id FROM player_pcp_profiles 
        WHERE player_id = $1 
        LIMIT 1
      )
      ORDER BY assessment_date DESC 
      LIMIT 10
    `, [userId]);

    res.json(assessments.rows || []);

  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments'
    });
  }
});

export default router;