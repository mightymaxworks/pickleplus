import { Router } from 'express';
import { db } from '../db';
import { 
  assessmentTemplates, 
  assessmentQuestions, 
  assessmentAttempts, 
  assessmentAnswers,
  practicalAssessments,
  insertAssessmentAttemptSchema,
  assessmentSubmissionSchema,
  type AssessmentTemplate,
  type AssessmentQuestion,
  type AssessmentAttempt
} from '../../shared/schema/assessment';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Get assessment templates by PCP level
router.get('/templates/:pcpLevel', async (req, res) => {
  try {
    const pcpLevel = parseInt(req.params.pcpLevel);
    
    const templates = await db
      .select()
      .from(assessmentTemplates)
      .where(and(
        eq(assessmentTemplates.pcpLevel, pcpLevel),
        eq(assessmentTemplates.isActive, true)
      ))
      .orderBy(assessmentTemplates.title);

    res.json(templates);
  } catch (error) {
    console.error('Failed to fetch assessment templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get assessment template with questions
router.get('/templates/:id/details', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    const [template] = await db
      .select()
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.id, templateId));

    if (!template) {
      return res.status(404).json({ message: 'Assessment template not found' });
    }

    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(and(
        eq(assessmentQuestions.templateId, templateId),
        eq(assessmentQuestions.isActive, true)
      ))
      .orderBy(assessmentQuestions.orderIndex);

    res.json({ template, questions });
  } catch (error) {
    console.error('Failed to fetch assessment details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start assessment attempt
router.post('/attempts', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    const { templateId } = req.body;

    // Check if template exists
    const [template] = await db
      .select()
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.id, templateId));

    if (!template) {
      return res.status(404).json({ message: 'Assessment template not found' });
    }

    // Check existing attempts
    const existingAttempts = await db
      .select()
      .from(assessmentAttempts)
      .where(and(
        eq(assessmentAttempts.userId, userId),
        eq(assessmentAttempts.templateId, templateId)
      ));

    const attemptNumber = existingAttempts.length + 1;

    // Check if max attempts exceeded
    if (attemptNumber > template.maxAttempts) {
      return res.status(400).json({ 
        message: `Maximum attempts (${template.maxAttempts}) exceeded for this assessment` 
      });
    }

    // Create new attempt
    const [attempt] = await db
      .insert(assessmentAttempts)
      .values({
        userId,
        templateId,
        attemptNumber,
        status: 'in_progress',
        startedAt: new Date()
      })
      .returning();

    res.status(201).json(attempt);
  } catch (error) {
    console.error('Failed to start assessment attempt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit assessment
router.post('/attempts/:id/submit', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const attemptId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    const submission = assessmentSubmissionSchema.parse(req.body);

    // Verify attempt belongs to user
    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(and(
        eq(assessmentAttempts.id, attemptId),
        eq(assessmentAttempts.userId, userId)
      ));

    if (!attempt) {
      return res.status(404).json({ message: 'Assessment attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Assessment already completed' });
    }

    // Get template and questions
    const [template] = await db
      .select()
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.id, submission.templateId));

    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.templateId, submission.templateId));

    // Calculate scores
    let totalScore = 0;
    let maxPossibleScore = 0;
    const skillScores: Record<string, { earned: number; possible: number }> = {};

    // Process each answer
    for (const answer of submission.answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      maxPossibleScore += question.points || 0;
      
      // Initialize skill category tracking
      if (question.skillCategory) {
        if (!skillScores[question.skillCategory]) {
          skillScores[question.skillCategory] = { earned: 0, possible: 0 };
        }
        skillScores[question.skillCategory].possible += question.points || 0;
      }

      // Check if answer is correct
      const isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
      const pointsEarned = isCorrect ? (question.points || 0) : 0;
      
      totalScore += pointsEarned;
      
      if (question.skillCategory && isCorrect) {
        skillScores[question.skillCategory].earned += question.points || 0;
      }

      // Save individual answer
      await db.insert(assessmentAnswers).values({
        attemptId,
        questionId: answer.questionId,
        userAnswer: answer.answer,
        isCorrect,
        pointsEarned,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Calculate percentage scores
    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const passed = percentageScore >= template.passingScore;

    // Calculate skill category percentages
    const finalSkillScores: Record<string, number> = {};
    for (const [category, scores] of Object.entries(skillScores)) {
      finalSkillScores[category] = scores.possible > 0 ? 
        Math.round((scores.earned / scores.possible) * 100) : 0;
    }

    // Update attempt
    const [updatedAttempt] = await db
      .update(assessmentAttempts)
      .set({
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        maxPossibleScore,
        percentageScore,
        passed,
        skillScores: finalSkillScores
      })
      .where(eq(assessmentAttempts.id, attemptId))
      .returning();

    res.json({
      attempt: updatedAttempt,
      results: {
        totalScore,
        maxPossibleScore,
        percentageScore: Math.round(percentageScore),
        passed,
        skillScores: finalSkillScores
      }
    });

  } catch (error) {
    console.error('Failed to submit assessment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's assessment history
router.get('/attempts/history', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;

    const attempts = await db
      .select({
        id: assessmentAttempts.id,
        templateId: assessmentAttempts.templateId,
        templateTitle: assessmentTemplates.title,
        pcpLevel: assessmentTemplates.pcpLevel,
        attemptNumber: assessmentAttempts.attemptNumber,
        status: assessmentAttempts.status,
        startedAt: assessmentAttempts.startedAt,
        completedAt: assessmentAttempts.completedAt,
        percentageScore: assessmentAttempts.percentageScore,
        passed: assessmentAttempts.passed,
        skillScores: assessmentAttempts.skillScores
      })
      .from(assessmentAttempts)
      .leftJoin(assessmentTemplates, eq(assessmentAttempts.templateId, assessmentTemplates.id))
      .where(eq(assessmentAttempts.userId, userId))
      .orderBy(desc(assessmentAttempts.startedAt));

    res.json(attempts);
  } catch (error) {
    console.error('Failed to fetch assessment history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific attempt results
router.get('/attempts/:id/results', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const attemptId = parseInt(req.params.id);
    const userId = req.user!.id;

    const [attempt] = await db
      .select()
      .from(assessmentAttempts)
      .where(and(
        eq(assessmentAttempts.id, attemptId),
        eq(assessmentAttempts.userId, userId)
      ));

    if (!attempt) {
      return res.status(404).json({ message: 'Assessment attempt not found' });
    }

    // Get detailed answers
    const answers = await db
      .select({
        questionId: assessmentAnswers.questionId,
        questionText: assessmentQuestions.questionText,
        userAnswer: assessmentAnswers.userAnswer,
        correctAnswer: assessmentQuestions.correctAnswer,
        isCorrect: assessmentAnswers.isCorrect,
        pointsEarned: assessmentAnswers.pointsEarned,
        points: assessmentQuestions.points,
        skillCategory: assessmentQuestions.skillCategory,
        explanation: assessmentQuestions.explanation
      })
      .from(assessmentAnswers)
      .leftJoin(assessmentQuestions, eq(assessmentAnswers.questionId, assessmentQuestions.id))
      .where(eq(assessmentAnswers.attemptId, attemptId));

    res.json({ attempt, answers });
  } catch (error) {
    console.error('Failed to fetch assessment results:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;