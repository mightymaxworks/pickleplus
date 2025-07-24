import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { isAuthenticated } from '../auth';

const router = express.Router();

interface SessionPlan {
  id?: number;
  coach_id: number;
  title: string;
  description: string;
  duration: number;
  skill_level: string;
  objectives: string[];
  drills: SessionDrill[];
  created_at?: string;
  updated_at?: string;
}

interface SessionDrill {
  drill_id: number;
  allocated_minutes: number;
  order_sequence: number;
  objectives?: string;
  notes?: string;
}

interface ScheduledSession {
  id?: number;
  coach_id: number;
  student_id: number;
  session_plan_id: number;
  scheduled_date: string;
  scheduled_time: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completion_notes?: string;
  student_feedback?: string;
  created_at?: string;
}

// Get coach's session plans
router.get('/session-plans', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Fetching session plans for coach');
    
    // Get session plans with drill details
    const sessionPlans = await db.execute(sql`
      SELECT 
        sp.id,
        sp.title,
        sp.description,
        sp.duration,
        sp.skill_level,
        sp.objectives,
        sp.created_at,
        sp.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'drill_id', sda.drill_id,
              'allocated_minutes', sda.allocated_minutes,
              'order_sequence', sda.order_sequence,
              'objectives', sda.objectives,
              'notes', sda.notes,
              'drill', json_build_object(
                'id', dl.id,
                'title', dl.name,
                'category', dl.category,
                'difficulty', dl."skillLevel",
                'description', dl.objective,
                'duration', dl."estimatedDuration"
              )
            ) ORDER BY sda.order_sequence
          ) FILTER (WHERE sda.drill_id IS NOT NULL),
          '[]'::json
        ) as drills
      FROM session_plans sp
      LEFT JOIN session_drill_assignments sda ON sp.id = sda.session_plan_id
      LEFT JOIN drill_library dl ON sda.drill_id = dl.id
      WHERE sp.coach_id = ${req.user?.id}
      GROUP BY sp.id, sp.title, sp.description, sp.duration, sp.skill_level, sp.objectives, sp.created_at, sp.updated_at
      ORDER BY sp.created_at DESC
    `);

    res.json({
      success: true,
      data: sessionPlans.rows || []
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error fetching session plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session plans'
    });
  }
});

// Create new session plan
router.post('/session-plans/create', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Creating new session plan');
    
    const { title, description, duration, skill_level, objectives, drills } = req.body;
    
    if (!title || !drills || drills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Title and at least one drill are required'
      });
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Create session plan
      const sessionPlanResult = await tx.execute(sql`
        INSERT INTO session_plans (coach_id, title, description, duration, skill_level, objectives)
        VALUES (${req.user?.id}, ${title}, ${description}, ${duration}, ${skill_level}, ${JSON.stringify(objectives)})
        RETURNING id
      `);

      const sessionPlanId = sessionPlanResult.rows[0]?.id;

      if (!sessionPlanId) {
        throw new Error('Failed to create session plan');
      }

      // Add drill assignments
      for (const drill of drills) {
        await tx.execute(sql`
          INSERT INTO session_drill_assignments (
            session_plan_id, 
            drill_id, 
            allocated_minutes, 
            order_sequence, 
            objectives, 
            notes
          )
          VALUES (
            ${sessionPlanId}, 
            ${drill.drill.id}, 
            ${drill.allocated_minutes}, 
            ${drill.order_sequence}, 
            ${drill.objectives || ''}, 
            ${drill.notes || ''}
          )
        `);
      }

      res.json({
        success: true,
        message: 'Session plan created successfully',
        data: { id: sessionPlanId }
      });
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error creating session plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session plan'
    });
  }
});

// Get drills for session planning (leverages existing curriculum)
router.get('/drills', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Fetching drills for session planning');
    
    const drills = await db.execute(sql`
      SELECT 
        id,
        name as title,
        category,
        "skillLevel" as difficulty,
        objective as description,
        "estimatedDuration" as duration,
        setup,
        instructions,
        "keyFocus",
        "equipmentNeeded" as equipment,
        "youtubeUrl" as video_url,
        "minPcpRating"::float as pcp_technical_rating,
        2.5 as pcp_tactical_rating,
        2.5 as pcp_physical_rating,
        2.5 as pcp_mental_rating
      FROM drill_library 
      WHERE "isActive" = true
      ORDER BY category, "skillLevel", name
    `);

    // Transform data to match frontend expectations
    const transformedDrills = drills.rows.map(drill => ({
      ...drill,
      objectives: drill.description ? [drill.description] : [],
      equipment: drill.equipment ? drill.equipment.split(',').map((item: string) => item.trim()) : []
    }));

    res.json({
      success: true,
      data: transformedDrills
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error fetching drills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drills'
    });
  }
});

// Get coach's students
router.get('/students', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Fetching students for coach');
    
    // Get students assigned to this coach through coaching relationships
    const students = await db.execute(sql`
      SELECT DISTINCT
        u.id,
        u.username as name,
        u.email,
        COALESCE(u."displayName", u.username) as display_name,
        'Intermediate' as skill_level,
        3.5 as current_rating
      FROM users u
      INNER JOIN coaching_relationships cr ON u.id = cr.student_id
      WHERE cr.coach_id = ${req.user?.id}
        AND cr.status = 'active'
      
      UNION ALL
      
      SELECT DISTINCT
        u.id,
        u.username as name,
        u.email,
        COALESCE(u."displayName", u.username) as display_name,
        'Intermediate' as skill_level,
        3.5 as current_rating
      FROM users u
      INNER JOIN session_requests sr ON u.id = sr.requester_id
      WHERE sr.coach_id = ${req.user?.id}
        AND sr.status = 'accepted'
      
      ORDER BY name
    `);

    res.json({
      success: true,
      data: students.rows || []
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

// Schedule a session using a session plan
router.post('/schedule-session', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Scheduling new session');
    
    const { session_plan_id, student_id, scheduled_date, scheduled_time, location } = req.body;
    
    if (!session_plan_id || !student_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({
        success: false,
        error: 'Session plan, student, date and time are required'
      });
    }

    const result = await db.execute(sql`
      INSERT INTO scheduled_sessions (
        coach_id, 
        student_id, 
        session_plan_id, 
        scheduled_date, 
        scheduled_time, 
        location, 
        status
      )
      VALUES (
        ${req.user?.id}, 
        ${student_id}, 
        ${session_plan_id}, 
        ${scheduled_date}, 
        ${scheduled_time}, 
        ${location || ''}, 
        'scheduled'
      )
      RETURNING id
    `);

    res.json({
      success: true,
      message: 'Session scheduled successfully',
      data: { id: result.rows[0]?.id }
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error scheduling session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule session'
    });
  }
});

// Get scheduled sessions
router.get('/scheduled-sessions', isAuthenticated, async (req, res) => {
  try {
    console.log('[SESSION-PLANNING] Fetching scheduled sessions');
    
    const sessions = await db.execute(sql`
      SELECT 
        ss.id,
        ss.scheduled_date,
        ss.scheduled_time,
        ss.location,
        ss.status,
        ss.completion_notes,
        ss.student_feedback,
        sp.title as session_plan_title,
        sp.description as session_plan_description,
        sp.duration,
        u.username as student_name,
        u.email as student_email
      FROM scheduled_sessions ss
      INNER JOIN session_plans sp ON ss.session_plan_id = sp.id
      INNER JOIN users u ON ss.student_id = u.id
      WHERE ss.coach_id = ${req.user?.id}
      ORDER BY ss.scheduled_date DESC, ss.scheduled_time DESC
    `);

    res.json({
      success: true,
      data: sessions.rows || []
    });

  } catch (error) {
    console.error('[SESSION-PLANNING] Error fetching scheduled sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled sessions'
    });
  }
});

export default router;