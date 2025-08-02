/**
 * Course Module API Routes
 * DAF Level 2: Backend Implementation for Course Module System
 */

import { Express } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { 
  courseModules, 
  moduleProgress, 
  moduleAssessments,
  certificationApplications 
} from '../../shared/schema/course-modules';
import { users } from '../../shared/schema';

export function registerCourseModuleRoutes(app: Express) {
  
  // Get all course modules for a specific PCP level
  app.get('/api/course-modules', async (req, res) => {
    try {
      const { pcpLevel } = req.query;
      
      let query = db.select().from(courseModules).where(eq(courseModules.isActive, true));
      
      if (pcpLevel) {
        query = query.where(eq(courseModules.pcpLevel, parseInt(pcpLevel as string)));
      }
      
      const modules = await query.orderBy(courseModules.pcpLevel, courseModules.moduleNumber);
      
      // Parse JSON fields
      const modulesWithParsedData = modules.map(module => ({
        ...module,
        learningObjectives: module.learningObjectives ? JSON.parse(module.learningObjectives) : [],
        associatedDrills: module.associatedDrills ? JSON.parse(module.associatedDrills) : [],
        practicalExercises: module.practicalExercises ? JSON.parse(module.practicalExercises) : []
      }));
      
      res.json(modulesWithParsedData);
    } catch (error) {
      console.error('Error fetching course modules:', error);
      res.status(500).json({ message: 'Failed to fetch course modules' });
    }
  });

  // Get user's progress for all modules
  app.get('/api/course-modules/progress', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const userId = req.user!.id;
      
      const progress = await db
        .select()
        .from(moduleProgress)
        .where(eq(moduleProgress.userId, userId))
        .orderBy(desc(moduleProgress.lastAccessedAt));
      
      // Parse JSON fields
      const progressWithParsedData = progress.map(p => ({
        ...p,
        videosWatched: p.videosWatched ? JSON.parse(p.videosWatched) : [],
        drillsCompleted: p.drillsCompleted ? JSON.parse(p.drillsCompleted) : [],
        notesAndBookmarks: p.notesAndBookmarks ? JSON.parse(p.notesAndBookmarks) : {}
      }));
      
      res.json(progressWithParsedData);
    } catch (error) {
      console.error('Error fetching module progress:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  });

  // Start a module (create progress record)
  app.post('/api/course-modules/:moduleId/start', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const { moduleId } = req.params;
      const userId = req.user!.id;
      
      // Check if progress already exists
      const existingProgress = await db
        .select()
        .from(moduleProgress)
        .where(and(
          eq(moduleProgress.userId, userId),
          eq(moduleProgress.moduleId, parseInt(moduleId))
        ))
        .limit(1);
      
      if (existingProgress.length > 0) {
        // Update existing progress to mark as started
        const [updatedProgress] = await db
          .update(moduleProgress)
          .set({
            status: 'in_progress',
            startedAt: new Date(),
            lastAccessedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(moduleProgress.userId, userId),
            eq(moduleProgress.moduleId, parseInt(moduleId))
          ))
          .returning();
        
        return res.json(updatedProgress);
      }
      
      // Create new progress record
      const [newProgress] = await db
        .insert(moduleProgress)
        .values({
          userId,
          moduleId: parseInt(moduleId),
          status: 'in_progress',
          startedAt: new Date(),
          lastAccessedAt: new Date(),
          timeSpent: 0,
          attempts: 1,
          videosWatched: JSON.stringify([]),
          drillsCompleted: JSON.stringify([]),
          notesAndBookmarks: JSON.stringify({})
        })
        .returning();
      
      res.json(newProgress);
    } catch (error) {
      console.error('Error starting module:', error);
      res.status(500).json({ message: 'Failed to start module' });
    }
  });

  // Complete a module
  app.post('/api/course-modules/:moduleId/complete', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const { moduleId } = req.params;
      const { score } = req.body;
      const userId = req.user!.id;
      
      // Get the module to check passing score
      const [module] = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, parseInt(moduleId)))
        .limit(1);
      
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      // Determine completion status
      const passed = !module.hasAssessment || (score && score >= module.passingScore);
      const status = passed ? 'completed' : 'failed';
      
      // Update progress
      const [updatedProgress] = await db
        .update(moduleProgress)
        .set({
          status,
          completedAt: passed ? new Date() : undefined,
          currentScore: score ? parseFloat(score.toString()) : undefined,
          bestScore: score ? parseFloat(score.toString()) : undefined,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(moduleProgress.userId, userId),
          eq(moduleProgress.moduleId, parseInt(moduleId))
        ))
        .returning();
      
      // If assessment failed, increment attempts
      if (!passed) {
        await db
          .update(moduleProgress)
          .set({
            attempts: (updatedProgress.attempts || 0) + 1
          })
          .where(and(
            eq(moduleProgress.userId, userId),
            eq(moduleProgress.moduleId, parseInt(moduleId))
          ));
      }
      
      res.json({ 
        ...updatedProgress, 
        status,
        passed,
        message: passed ? 'Module completed successfully!' : 'Module failed. You can retry.' 
      });
    } catch (error) {
      console.error('Error completing module:', error);
      res.status(500).json({ message: 'Failed to complete module' });
    }
  });

  // Get detailed module content
  app.get('/api/course-modules/:moduleId', async (req, res) => {
    try {
      const { moduleId } = req.params;
      
      const [module] = await db
        .select()
        .from(courseModules)
        .where(and(
          eq(courseModules.id, parseInt(moduleId)),
          eq(courseModules.isActive, true)
        ))
        .limit(1);
      
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      // Parse JSON fields
      const moduleWithParsedData = {
        ...module,
        learningObjectives: module.learningObjectives ? JSON.parse(module.learningObjectives) : [],
        associatedDrills: module.associatedDrills ? JSON.parse(module.associatedDrills) : [],
        practicalExercises: module.practicalExercises ? JSON.parse(module.practicalExercises) : []
      };
      
      res.json(moduleWithParsedData);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ message: 'Failed to fetch module' });
    }
  });

  // Update module progress (for tracking time spent, videos watched, etc.)
  app.patch('/api/course-modules/:moduleId/progress', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const { moduleId } = req.params;
      const { timeSpent, videosWatched, drillsCompleted, notesAndBookmarks } = req.body;
      const userId = req.user!.id;
      
      const updateData: any = {
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      };
      
      if (timeSpent !== undefined) {
        updateData.timeSpent = timeSpent;
      }
      
      if (videosWatched !== undefined) {
        updateData.videosWatched = JSON.stringify(videosWatched);
      }
      
      if (drillsCompleted !== undefined) {
        updateData.drillsCompleted = JSON.stringify(drillsCompleted);
      }
      
      if (notesAndBookmarks !== undefined) {
        updateData.notesAndBookmarks = JSON.stringify(notesAndBookmarks);
      }
      
      const [updatedProgress] = await db
        .update(moduleProgress)
        .set(updateData)
        .where(and(
          eq(moduleProgress.userId, userId),
          eq(moduleProgress.moduleId, parseInt(moduleId))
        ))
        .returning();
      
      res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating module progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });

  // Get completion statistics for a PCP level
  app.get('/api/course-modules/stats/:pcpLevel', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const { pcpLevel } = req.params;
      const userId = req.user!.id;
      
      // Get all modules for this level
      const modules = await db
        .select()
        .from(courseModules)
        .where(and(
          eq(courseModules.pcpLevel, parseInt(pcpLevel)),
          eq(courseModules.isActive, true)
        ));
      
      // Get user's progress for these modules
      const progress = await db
        .select()
        .from(moduleProgress)
        .where(eq(moduleProgress.userId, userId));
      
      const moduleProgress = modules.map(module => {
        const userProgress = progress.find(p => p.moduleId === module.id);
        return {
          moduleId: module.id,
          title: module.title,
          status: userProgress?.status || 'not_started',
          score: userProgress?.bestScore || null,
          attempts: userProgress?.attempts || 0,
          timeSpent: userProgress?.timeSpent || 0
        };
      });
      
      const stats = {
        totalModules: modules.length,
        completedModules: moduleProgress.filter(p => p.status === 'completed').length,
        inProgressModules: moduleProgress.filter(p => p.status === 'in_progress').length,
        failedModules: moduleProgress.filter(p => p.status === 'failed').length,
        notStartedModules: moduleProgress.filter(p => p.status === 'not_started').length,
        completionPercentage: modules.length > 0 
          ? Math.round((moduleProgress.filter(p => p.status === 'completed').length / modules.length) * 100)
          : 0,
        totalTimeSpent: moduleProgress.reduce((total, p) => total + p.timeSpent, 0),
        averageScore: moduleProgress
          .filter(p => p.score !== null)
          .reduce((sum, p, _, arr) => sum + (p.score || 0) / arr.length, 0) || null
      };
      
      res.json({ stats, moduleProgress });
    } catch (error) {
      console.error('Error fetching module stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  console.log('[API] Course Module routes registered successfully');
}