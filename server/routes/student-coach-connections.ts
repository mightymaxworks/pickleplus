import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, coachStudentAssignments } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

const requestCoachSchema = z.object({
  coachPassportCode: z.string().min(1, 'Coach passport code is required').max(10)
});

// Get student's coach connections
router.get('/student/coach-connections', isAuthenticated, async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const connections = await db
      .select({
        id: coachStudentAssignments.id,
        status: coachStudentAssignments.status,
        studentRequestDate: coachStudentAssignments.studentRequestDate,
        coachApprovedDate: coachStudentAssignments.coachApprovedDate,
        coach: {
          id: users.id,
          displayName: users.displayName,
          username: users.username,
          passportCode: users.passportCode,
          coachLevel: users.coachLevel
        }
      })
      .from(coachStudentAssignments)
      .leftJoin(users, eq(coachStudentAssignments.coachId, users.id))
      .where(
        and(
          eq(coachStudentAssignments.studentId, studentId),
          eq(coachStudentAssignments.initiatedByStudent, true)
        )
      );

    res.json(connections);
  } catch (error) {
    console.error('Error fetching coach connections:', error);
    res.status(500).json({ error: 'Failed to fetch coach connections' });
  }
});

// Request coach connection using passport code
router.post('/student/request-coach', isAuthenticated, async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { coachPassportCode } = requestCoachSchema.parse(req.body);

    // Find coach by passport code
    const [coach] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        username: users.username,
        passportCode: users.passportCode,
        coachLevel: users.coachLevel
      })
      .from(users)
      .where(eq(users.passportCode, coachPassportCode.toUpperCase()));

    if (!coach) {
      return res.status(404).json({ 
        error: 'Coach not found. Please check the passport code or ensure they are a certified coach.' 
      });
    }

    // Check if connection already exists
    const [existingConnection] = await db
      .select()
      .from(coachStudentAssignments)
      .where(
        and(
          eq(coachStudentAssignments.coachId, coach.id),
          eq(coachStudentAssignments.studentId, studentId),
          eq(coachStudentAssignments.isActive, true)
        )
      );

    if (existingConnection) {
      return res.status(400).json({ 
        error: `You already have a ${existingConnection.status} connection with this coach.` 
      });
    }

    // Create new coach-student connection request
    const [newConnection] = await db
      .insert(coachStudentAssignments)
      .values({
        coachId: coach.id,
        studentId: studentId,
        initiatedByStudent: true,
        coachPassportCode: coachPassportCode.toUpperCase(),
        studentRequestDate: new Date(),
        status: 'pending',
        isActive: false, // Will be set to true when coach approves
        notes: `Student-initiated connection request via passport code ${coachPassportCode.toUpperCase()}`
      })
      .returning();

    // TODO: Send notification to coach about the request
    
    res.json({
      success: true,
      connectionId: newConnection.id,
      coachDisplayName: coach.displayName,
      message: 'Coach connection request sent successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    console.error('Error requesting coach connection:', error);
    res.status(500).json({ error: 'Failed to request coach connection' });
  }
});

export { router as studentCoachConnectionRoutes };