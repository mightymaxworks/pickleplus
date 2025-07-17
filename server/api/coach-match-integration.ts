/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 1: Coach-Match Integration API
 * 
 * API endpoints for seamless integration between coaching sessions and match recording
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import { Express } from 'express';
import { storage } from '../storage';
import { 
  insertCoachingSessionMatchSchema, 
  insertCoachMatchInputSchema, 
  insertMatchPcpAssessmentSchema, 
  insertPointsAllocationExplanationSchema,
  insertCoachStudentProgressSchema,
  MatchContext,
  CoachInputType,
  SkillCategory
} from '@shared/schema';

export function setupCoachMatchIntegrationRoutes(app: Express) {
  
  // Create coaching session match connection
  app.post('/api/coach-match/create-session-match', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = insertCoachingSessionMatchSchema.parse(req.body);
      
      // Verify user has permission to create this connection
      const session = await storage.getCoachingSession(validatedData.sessionId);
      if (!session || (session.coachId !== user.id && session.playerId !== user.id)) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      const sessionMatch = await storage.createCoachingSessionMatch(validatedData);
      
      res.json({
        success: true,
        sessionMatch,
        message: 'Coaching session linked to match successfully'
      });
    } catch (error) {
      console.error('Error creating coaching session match:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get coaching sessions for a match
  app.get('/api/coach-match/sessions/:matchId', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = parseInt(req.params.matchId);
      const sessions = await storage.getCoachingSessionsByMatch(matchId);
      
      res.json({
        success: true,
        sessions,
        count: sessions.length
      });
    } catch (error) {
      console.error('Error fetching coaching sessions for match:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create real-time coach input during match
  app.post('/api/coach-match/input', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = insertCoachMatchInputSchema.parse({
        ...req.body,
        coachId: user.id,
        timestamp: new Date()
      });

      const input = await storage.createCoachMatchInput(validatedData);
      
      res.json({
        success: true,
        input,
        message: 'Coach input recorded successfully'
      });
    } catch (error) {
      console.error('Error creating coach match input:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get coach inputs for a match
  app.get('/api/coach-match/inputs/:matchId', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = parseInt(req.params.matchId);
      const inputs = await storage.getCoachMatchInputs(matchId);
      
      res.json({
        success: true,
        inputs,
        count: inputs.length
      });
    } catch (error) {
      console.error('Error fetching coach match inputs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create PCP assessment based on match performance
  app.post('/api/coach-match/pcp-assessment', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = insertMatchPcpAssessmentSchema.parse({
        ...req.body,
        coachId: user.id
      });

      const assessment = await storage.createMatchPcpAssessment(validatedData);
      
      // Update coach-student progress
      await storage.upsertCoachStudentProgress({
        coachId: user.id,
        studentId: validatedData.playerId,
        lastSession: new Date(),
        technicalProgression: validatedData.technicalRating,
        tacticalProgression: validatedData.tacticalRating,
        physicalProgression: validatedData.physicalRating,
        mentalProgression: validatedData.mentalRating,
        coachingEffectivenessScore: validatedData.coachingEffectiveness || 0,
        matchesPlayed: 1 // This would need to be calculated properly
      });
      
      res.json({
        success: true,
        assessment,
        message: 'PCP assessment completed successfully'
      });
    } catch (error) {
      console.error('Error creating PCP assessment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get PCP assessment for a match
  app.get('/api/coach-match/pcp-assessment/:matchId/:playerId', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = parseInt(req.params.matchId);
      const playerId = parseInt(req.params.playerId);
      
      const assessment = await storage.getMatchPcpAssessment(matchId, playerId);
      
      res.json({
        success: true,
        assessment
      });
    } catch (error) {
      console.error('Error fetching PCP assessment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create transparent points allocation explanation
  app.post('/api/coach-match/points-explanation', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = insertPointsAllocationExplanationSchema.parse({
        ...req.body,
        coachId: user.id
      });

      const explanation = await storage.createPointsAllocationExplanation(validatedData);
      
      res.json({
        success: true,
        explanation,
        message: 'Points allocation explanation created successfully'
      });
    } catch (error) {
      console.error('Error creating points explanation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get points allocation explanation
  app.get('/api/coach-match/points-explanation/:matchId/:playerId', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = parseInt(req.params.matchId);
      const playerId = parseInt(req.params.playerId);
      
      const explanation = await storage.getPointsAllocationExplanation(matchId, playerId);
      
      res.json({
        success: true,
        explanation
      });
    } catch (error) {
      console.error('Error fetching points explanation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get coach dashboard data with student progress
  app.get('/api/coach-match/dashboard', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const dashboardData = await storage.getCoachDashboardData(user.id);
      
      res.json({
        success: true,
        ...dashboardData
      });
    } catch (error) {
      console.error('Error fetching coach dashboard data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get student progress for a coach
  app.get('/api/coach-match/student-progress/:studentId?', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const studentId = req.params.studentId ? parseInt(req.params.studentId) : undefined;
      const progress = await storage.getCoachStudentProgress(user.id, studentId);
      
      res.json({
        success: true,
        progress
      });
    } catch (error) {
      console.error('Error fetching student progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update coach-student progress
  app.put('/api/coach-match/student-progress', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = insertCoachStudentProgressSchema.parse({
        ...req.body,
        coachId: user.id
      });

      const progress = await storage.upsertCoachStudentProgress(validatedData);
      
      res.json({
        success: true,
        progress,
        message: 'Student progress updated successfully'
      });
    } catch (error) {
      console.error('Error updating student progress:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get live coaching data for a match in progress
  app.get('/api/coach-match/live-data/:matchId', async (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = parseInt(req.params.matchId);
      
      // Get real-time coaching inputs
      const inputs = await storage.getCoachMatchInputs(matchId);
      
      // Get associated coaching sessions
      const sessions = await storage.getCoachingSessionsByMatch(matchId);
      
      res.json({
        success: true,
        liveData: {
          inputs,
          sessions,
          lastUpdate: new Date()
        }
      });
    } catch (error) {
      console.error('Error fetching live coaching data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get match context enums and types
  app.get('/api/coach-match/config', async (req, res) => {
    try {
      res.json({
        success: true,
        config: {
          matchContexts: Object.values(MatchContext),
          coachInputTypes: Object.values(CoachInputType),
          skillCategories: Object.values(SkillCategory)
        }
      });
    } catch (error) {
      console.error('Error fetching coach-match config:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}