/**
 * Sprint 3 Phase 1: Assessment-Goal Integration API Routes
 * Enhanced API endpoints for connecting PCP assessments with goal generation
 */

import express from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { AssessmentGoalService } from "../services/AssessmentGoalService";

const router = express.Router();

// Sprint 3 Phase 1: Assessment Data Integration Endpoints

/**
 * GET /api/coach/assessments/:studentId/latest
 * Get most recent assessment for a student
 */
router.get("/coach/assessments/:studentId/latest", isAuthenticated, async (req, res) => {
  try {
    const { studentId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching latest assessment for student: ${studentId}, coach: ${coachId}`);
    
    const assessment = await storage.getLatestAssessmentForStudent(parseInt(studentId), coachId);
    
    if (!assessment) {
      return res.status(404).json({ error: "No assessments found for this student" });
    }

    console.log(`[ASSESSMENT-GOALS] Latest assessment retrieved successfully`);
    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error("Error fetching latest assessment:", error);
    res.status(500).json({ error: "Failed to fetch latest assessment" });
  }
});

/**
 * GET /api/coach/assessments/:studentId/trends
 * Get assessment trends over time for a student
 */
router.get("/coach/assessments/:studentId/trends", isAuthenticated, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { timeframe = "6months" } = req.query;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching assessment trends for student: ${studentId}, timeframe: ${timeframe}`);
    
    const trends = await storage.getAssessmentTrends(parseInt(studentId), coachId, timeframe as string);
    
    console.log(`[ASSESSMENT-GOALS] Assessment trends retrieved: ${trends.length} data points`);
    res.json({ success: true, data: trends });
  } catch (error) {
    console.error("Error fetching assessment trends:", error);
    res.status(500).json({ error: "Failed to fetch assessment trends" });
  }
});

/**
 * POST /api/coach/assessments/:id/generate-goals
 * Generate goals from assessment data
 */
router.post("/coach/assessments/:id/generate-goals", isAuthenticated, async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Generating goals from assessment: ${assessmentId}`);
    
    const goalRecommendations = await AssessmentGoalService.generateGoalsFromAssessment(
      parseInt(assessmentId), 
      coachId
    );
    
    console.log(`[ASSESSMENT-GOALS] Generated ${goalRecommendations.length} goal recommendations`);
    res.json({ success: true, data: goalRecommendations });
  } catch (error) {
    console.error("Error generating goals from assessment:", error);
    res.status(500).json({ error: "Failed to generate goals from assessment" });
  }
});

/**
 * GET /api/coach/assessments/:id/weak-areas
 * Get detailed weakness analysis from assessment
 */
router.get("/coach/assessments/:id/weak-areas", isAuthenticated, async (req, res) => {
  try {
    const { id: assessmentId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Analyzing weak areas for assessment: ${assessmentId}`);
    
    const analysis = await AssessmentGoalService.analyzeWeakAreas(parseInt(assessmentId), coachId);
    
    console.log(`[ASSESSMENT-GOALS] Weak area analysis completed`);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Error analyzing weak areas:", error);
    res.status(500).json({ error: "Failed to analyze weak areas" });
  }
});

// Sprint 3 Phase 2: Goal Management Enhancement Endpoints

/**
 * POST /api/coach/goals/from-assessment
 * Create goals from assessment insights
 */
router.post("/coach/goals/from-assessment", isAuthenticated, async (req, res) => {
  try {
    const { assessmentId, selectedGoals, customizations } = req.body;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Creating goals from assessment: ${assessmentId}, goals: ${selectedGoals?.length}`);
    
    const createdGoals = await AssessmentGoalService.createGoalsFromAssessment(
      assessmentId,
      selectedGoals,
      customizations,
      coachId
    );
    
    console.log(`[ASSESSMENT-GOALS] Created ${createdGoals.length} goals successfully`);
    res.json({ success: true, data: createdGoals });
  } catch (error) {
    console.error("Error creating goals from assessment:", error);
    res.status(500).json({ error: "Failed to create goals from assessment" });
  }
});

/**
 * GET /api/coach/goals/:id/assessment-link
 * Get originating assessment data for a goal
 */
router.get("/coach/goals/:id/assessment-link", isAuthenticated, async (req, res) => {
  try {
    const { id: goalId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching assessment link for goal: ${goalId}`);
    
    const assessmentLink = await storage.getGoalAssessmentLink(parseInt(goalId), coachId);
    
    if (!assessmentLink) {
      return res.status(404).json({ error: "No assessment link found for this goal" });
    }

    console.log(`[ASSESSMENT-GOALS] Assessment link retrieved successfully`);
    res.json({ success: true, data: assessmentLink });
  } catch (error) {
    console.error("Error fetching goal assessment link:", error);
    res.status(500).json({ error: "Failed to fetch goal assessment link" });
  }
});

/**
 * PUT /api/coach/goals/:id/progress-update
 * Update goal progress with assessment data
 */
router.put("/coach/goals/:id/progress-update", isAuthenticated, async (req, res) => {
  try {
    const { id: goalId } = req.params;
    const { assessmentId, newRating, milestoneReached } = req.body;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Updating goal progress: ${goalId}, assessment: ${assessmentId}`);
    
    const progressUpdate = await AssessmentGoalService.updateGoalProgress(
      parseInt(goalId),
      assessmentId,
      newRating,
      milestoneReached,
      coachId
    );
    
    console.log(`[ASSESSMENT-GOALS] Goal progress updated successfully`);
    res.json({ success: true, data: progressUpdate });
  } catch (error) {
    console.error("Error updating goal progress:", error);
    res.status(500).json({ error: "Failed to update goal progress" });
  }
});

/**
 * GET /api/coach/goals/analytics/:studentId
 * Get goal achievement analytics for a student
 */
router.get("/coach/goals/analytics/:studentId", isAuthenticated, async (req, res) => {
  try {
    const { studentId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching goal analytics for student: ${studentId}`);
    
    const analytics = await AssessmentGoalService.getGoalAnalytics(parseInt(studentId), coachId);
    
    console.log(`[ASSESSMENT-GOALS] Goal analytics retrieved successfully`);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Error fetching goal analytics:", error);
    res.status(500).json({ error: "Failed to fetch goal analytics" });
  }
});

// Sprint 3 Phase 3: Unified Workflow Endpoints

/**
 * GET /api/coach/workflow/:studentId
 * Get complete student development workflow data
 */
router.get("/coach/workflow/:studentId", isAuthenticated, async (req, res) => {
  try {
    const { studentId } = req.params;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching complete workflow for student: ${studentId}`);
    
    const workflow = await AssessmentGoalService.getCompleteWorkflow(parseInt(studentId), coachId);
    
    console.log(`[ASSESSMENT-GOALS] Complete workflow retrieved successfully`);
    res.json({ success: true, data: workflow });
  } catch (error) {
    console.error("Error fetching complete workflow:", error);
    res.status(500).json({ error: "Failed to fetch complete workflow" });
  }
});

/**
 * GET /api/coach/dashboard/assessment-goal-metrics
 * Enhanced coach dashboard with assessment-goal metrics
 */
router.get("/coach/dashboard/assessment-goal-metrics", isAuthenticated, async (req, res) => {
  try {
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Fetching dashboard metrics for coach: ${coachId}`);
    
    const metrics = await AssessmentGoalService.getCoachDashboardMetrics(coachId);
    
    console.log(`[ASSESSMENT-GOALS] Dashboard metrics retrieved successfully`);
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
});

/**
 * POST /api/coach/sessions/:id/assessment-and-goals
 * Complete post-session workflow: assessment → goals
 */
router.post("/coach/sessions/:id/assessment-and-goals", isAuthenticated, async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { assessmentData, generateGoals, goalCustomizations } = req.body;
    const coachId = req.user?.id;

    if (!coachId) {
      return res.status(401).json({ error: "Coach authentication required" });
    }

    console.log(`[ASSESSMENT-GOALS] Processing post-session workflow for session: ${sessionId}`);
    
    const result = await AssessmentGoalService.processPostSessionWorkflow(
      parseInt(sessionId),
      assessmentData,
      generateGoals,
      goalCustomizations,
      coachId
    );
    
    console.log(`[ASSESSMENT-GOALS] Post-session workflow completed successfully`);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error processing post-session workflow:", error);
    res.status(500).json({ error: "Failed to process post-session workflow" });
  }
});

export default router;