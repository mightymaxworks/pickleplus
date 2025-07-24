// Sprint 1: Curriculum Management & Lesson Planning API Routes
import type { Express } from "express";
import { storage } from "../storage";
import { insertDrillLibrarySchema, insertCurriculumTemplateSchema, insertLessonPlanSchema, insertSessionGoalSchema } from "@shared/schema";

export function registerCurriculumManagementRoutes(app: Express) {
  console.log('[API] Registering Sprint 1 Curriculum Management routes');

  // ========================================
  // Drill Library Routes
  // ========================================

  // Get all drills (general endpoint)
  app.get('/api/curriculum/drills', async (req, res) => {
    try {
      const drills = await storage.getAllDrills();
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Curriculum][API] Error getting all drills:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drills' });
    }
  });

  // Get drills by category
  app.get('/api/curriculum/drills/category/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const drills = await storage.getDrillsByCategory(category);
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Curriculum][API] Error getting drills by category:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drills by category' });
    }
  });

  // Get drills by skill level
  app.get('/api/curriculum/drills/skill-level/:skillLevel', async (req, res) => {
    try {
      const { skillLevel } = req.params;
      const drills = await storage.getDrillsBySkillLevel(skillLevel);
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Curriculum][API] Error getting drills by skill level:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drills by skill level' });
    }
  });

  // Get drills by PCP rating range
  app.get('/api/curriculum/drills/pcp-rating', async (req, res) => {
    try {
      const { minRating, maxRating } = req.query;
      
      if (!minRating || !maxRating) {
        return res.status(400).json({ 
          success: false, 
          error: 'minRating and maxRating query parameters are required' 
        });
      }

      const drills = await storage.getDrillsByPcpRating(
        parseFloat(minRating as string), 
        parseFloat(maxRating as string)
      );
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Curriculum][API] Error getting drills by PCP rating:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drills by PCP rating' });
    }
  });

  // Search drills
  app.get('/api/curriculum/drills/search', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query (q) parameter is required' 
        });
      }

      const drills = await storage.searchDrills(q as string);
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Curriculum][API] Error searching drills:', error);
      res.status(500).json({ success: false, error: 'Failed to search drills' });
    }
  });

  // Get single drill
  app.get('/api/curriculum/drills/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const drill = await storage.getDrill(parseInt(id));
      
      if (!drill) {
        return res.status(404).json({ success: false, error: 'Drill not found' });
      }

      res.json({ success: true, data: drill });
    } catch (error) {
      console.error('[Curriculum][API] Error getting drill:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drill' });
    }
  });

  // Create new drill (coach only)
  app.post('/api/curriculum/drills', async (req, res) => {
    try {
      const validatedData = insertDrillLibrarySchema.parse(req.body);
      const drill = await storage.createDrill(validatedData);
      res.status(201).json({ success: true, data: drill });
    } catch (error) {
      console.error('[Curriculum][API] Error creating drill:', error);
      res.status(400).json({ success: false, error: 'Failed to create drill' });
    }
  });

  // Update drill
  app.patch('/api/curriculum/drills/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedDrill = await storage.updateDrill(parseInt(id), updateData);
      res.json({ success: true, data: updatedDrill });
    } catch (error) {
      console.error('[Curriculum][API] Error updating drill:', error);
      res.status(500).json({ success: false, error: 'Failed to update drill' });
    }
  });

  // Delete drill (soft delete)
  app.delete('/api/curriculum/drills/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDrill(parseInt(id));
      
      if (success) {
        res.json({ success: true, message: 'Drill deleted successfully' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete drill' });
      }
    } catch (error) {
      console.error('[Curriculum][API] Error deleting drill:', error);
      res.status(500).json({ success: false, error: 'Failed to delete drill' });
    }
  });

  // ========================================
  // Drill Categories Routes
  // ========================================

  // Get all drill categories
  app.get('/api/curriculum/categories', async (req, res) => {
    try {
      const categories = await storage.getAllDrillCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('[Curriculum][API] Error getting drill categories:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch drill categories' });
    }
  });

  // ========================================
  // Curriculum Template Routes
  // ========================================

  // Get all public curriculum templates
  app.get('/api/curriculum/templates', async (req, res) => {
    try {
      const templates = await storage.getPublicCurriculumTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('[Curriculum][API] Error getting curriculum templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch curriculum templates' });
    }
  });

  // Get curriculum templates by skill level
  app.get('/api/curriculum/templates/skill-level/:skillLevel', async (req, res) => {
    try {
      const { skillLevel } = req.params;
      const templates = await storage.getCurriculumTemplatesBySkillLevel(skillLevel);
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('[Curriculum][API] Error getting templates by skill level:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch templates by skill level' });
    }
  });

  // Get coach's templates
  app.get('/api/curriculum/templates/my-templates', async (req, res) => {
    try {
      // TODO: Add authentication middleware to get coach ID
      const coachId = 1; // Placeholder - should come from authenticated user
      const templates = await storage.getCurriculumTemplatesByCreator(coachId);
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('[Curriculum][API] Error getting coach templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch coach templates' });
    }
  });

  // Get single curriculum template
  app.get('/api/curriculum/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getCurriculumTemplate(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      console.error('[Curriculum][API] Error getting curriculum template:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch curriculum template' });
    }
  });

  // Create curriculum template
  app.post('/api/curriculum/templates', async (req, res) => {
    try {
      const validatedData = insertCurriculumTemplateSchema.parse(req.body);
      const template = await storage.createCurriculumTemplate(validatedData);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      console.error('[Curriculum][API] Error creating curriculum template:', error);
      res.status(400).json({ success: false, error: 'Failed to create curriculum template' });
    }
  });

  // Update curriculum template
  app.patch('/api/curriculum/templates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedTemplate = await storage.updateCurriculumTemplate(parseInt(id), updateData);
      res.json({ success: true, data: updatedTemplate });
    } catch (error) {
      console.error('[Curriculum][API] Error updating curriculum template:', error);
      res.status(500).json({ success: false, error: 'Failed to update curriculum template' });
    }
  });

  // Increment template usage
  app.post('/api/curriculum/templates/:id/use', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementTemplateUsage(parseInt(id));
      res.json({ success: true, message: 'Template usage incremented' });
    } catch (error) {
      console.error('[Curriculum][API] Error incrementing template usage:', error);
      res.status(500).json({ success: false, error: 'Failed to increment template usage' });
    }
  });

  // ========================================
  // Lesson Plan Routes
  // ========================================

  // Get coach's lesson plans
  app.get('/api/curriculum/lesson-plans/my-plans', async (req, res) => {
    try {
      // TODO: Add authentication middleware to get coach ID
      const coachId = 1; // Placeholder - should come from authenticated user
      const lessonPlans = await storage.getCoachLessonPlans(coachId);
      res.json({ success: true, data: lessonPlans });
    } catch (error) {
      console.error('[Curriculum][API] Error getting coach lesson plans:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch lesson plans' });
    }
  });

  // Get single lesson plan
  app.get('/api/curriculum/lesson-plans/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const lessonPlan = await storage.getLessonPlan(parseInt(id));
      
      if (!lessonPlan) {
        return res.status(404).json({ success: false, error: 'Lesson plan not found' });
      }

      res.json({ success: true, data: lessonPlan });
    } catch (error) {
      console.error('[Curriculum][API] Error getting lesson plan:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch lesson plan' });
    }
  });

  // Create lesson plan
  app.post('/api/curriculum/lesson-plans', async (req, res) => {
    try {
      const validatedData = insertLessonPlanSchema.parse(req.body);
      const lessonPlan = await storage.createLessonPlan(validatedData);
      res.status(201).json({ success: true, data: lessonPlan });
    } catch (error) {
      console.error('[Curriculum][API] Error creating lesson plan:', error);
      res.status(400).json({ success: false, error: 'Failed to create lesson plan' });
    }
  });

  // Update lesson plan
  app.patch('/api/curriculum/lesson-plans/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedPlan = await storage.updateLessonPlan(parseInt(id), updateData);
      res.json({ success: true, data: updatedPlan });
    } catch (error) {
      console.error('[Curriculum][API] Error updating lesson plan:', error);
      res.status(500).json({ success: false, error: 'Failed to update lesson plan' });
    }
  });

  // Increment lesson plan usage
  app.post('/api/curriculum/lesson-plans/:id/use', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementLessonPlanUsage(parseInt(id));
      res.json({ success: true, message: 'Lesson plan usage incremented' });
    } catch (error) {
      console.error('[Curriculum][API] Error incrementing lesson plan usage:', error);
      res.status(500).json({ success: false, error: 'Failed to increment lesson plan usage' });
    }
  });

  // ========================================
  // Session Goals Routes
  // ========================================

  // Get coach's session goals
  app.get('/api/curriculum/session-goals/coach', async (req, res) => {
    try {
      // TODO: Add authentication middleware to get coach ID
      const coachId = 1; // Placeholder - should come from authenticated user
      const goals = await storage.getCoachSessionGoals(coachId);
      res.json({ success: true, data: goals });
    } catch (error) {
      console.error('[Curriculum][API] Error getting coach session goals:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch coach session goals' });
    }
  });

  // Get student's session goals
  app.get('/api/curriculum/session-goals/student/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const goals = await storage.getStudentSessionGoals(parseInt(studentId));
      res.json({ success: true, data: goals });
    } catch (error) {
      console.error('[Curriculum][API] Error getting student session goals:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch student session goals' });
    }
  });

  // Get session goals by lesson plan
  app.get('/api/curriculum/session-goals/lesson/:lessonPlanId', async (req, res) => {
    try {
      const { lessonPlanId } = req.params;
      const goals = await storage.getSessionGoalsByLesson(parseInt(lessonPlanId));
      res.json({ success: true, data: goals });
    } catch (error) {
      console.error('[Curriculum][API] Error getting session goals by lesson:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch session goals by lesson' });
    }
  });

  // Create session goal
  app.post('/api/curriculum/session-goals', async (req, res) => {
    try {
      const validatedData = insertSessionGoalSchema.parse(req.body);
      const goal = await storage.createSessionGoal(validatedData);
      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      console.error('[Curriculum][API] Error creating session goal:', error);
      res.status(400).json({ success: false, error: 'Failed to create session goal' });
    }
  });

  // Update session goal
  app.patch('/api/curriculum/session-goals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedGoal = await storage.updateSessionGoal(parseInt(id), updateData);
      res.json({ success: true, data: updatedGoal });
    } catch (error) {
      console.error('[Curriculum][API] Error updating session goal:', error);
      res.status(500).json({ success: false, error: 'Failed to update session goal' });
    }
  });

  // Mark session goal as achieved
  app.post('/api/curriculum/session-goals/:id/achieve', async (req, res) => {
    try {
      const { id } = req.params;
      const achievedGoal = await storage.markSessionGoalAchieved(parseInt(id));
      res.json({ success: true, data: achievedGoal });
    } catch (error) {
      console.error('[Curriculum][API] Error marking session goal as achieved:', error);
      res.status(500).json({ success: false, error: 'Failed to mark session goal as achieved' });
    }
  });

  console.log('[API] Sprint 1 Curriculum Management routes registered successfully');
}