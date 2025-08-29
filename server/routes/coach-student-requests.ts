import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, coachStudentAssignments } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../auth';

const router = Router();

const approveRequestSchema = z.object({
  connectionId: z.number(),
  approved: z.boolean()
});

// Get pending student requests for coach
router.get('/coach/pending-requests', isAuthenticated, async (req, res) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a coach
    if (!req.user?.coachLevel || req.user.coachLevel < 3) {
      return res.status(403).json({ error: 'Coach access required' });
    }

    const pendingRequests = await db
      .select({
        id: coachStudentAssignments.id,
        studentRequestDate: coachStudentAssignments.studentRequestDate,
        coachPassportCode: coachStudentAssignments.coachPassportCode,
        notes: coachStudentAssignments.notes,
        student: {
          id: users.id,
          displayName: users.displayName,
          username: users.username,
          passportCode: users.passportCode,
          skillLevel: users.skillLevel
        }
      })
      .from(coachStudentAssignments)
      .leftJoin(users, eq(coachStudentAssignments.studentId, users.id))
      .where(
        and(
          eq(coachStudentAssignments.coachId, coachId),
          eq(coachStudentAssignments.status, 'pending'),
          eq(coachStudentAssignments.initiatedByStudent, true)
        )
      );

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Approve or reject student request
router.post('/coach/respond-to-request', isAuthenticated, async (req, res) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a coach
    if (!req.user?.coachLevel || req.user.coachLevel < 3) {
      return res.status(403).json({ error: 'Coach access required' });
    }

    const { connectionId, approved } = approveRequestSchema.parse(req.body);

    // Verify the connection belongs to this coach and is pending
    const [connection] = await db
      .select()
      .from(coachStudentAssignments)
      .where(
        and(
          eq(coachStudentAssignments.id, connectionId),
          eq(coachStudentAssignments.coachId, coachId),
          eq(coachStudentAssignments.status, 'pending')
        )
      );

    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found or already processed' });
    }

    if (approved) {
      // Approve the connection
      await db
        .update(coachStudentAssignments)
        .set({
          status: 'active',
          isActive: true,
          coachApprovedDate: new Date(),
          notes: `${connection.notes} - Approved by coach on ${new Date().toISOString()}`
        })
        .where(eq(coachStudentAssignments.id, connectionId));

      // Get student info for response
      const [student] = await db
        .select({
          displayName: users.displayName,
          username: users.username
        })
        .from(users)
        .where(eq(users.id, connection.studentId));

      res.json({
        success: true,
        message: `Connection approved! ${student?.displayName} is now your student.`
      });
    } else {
      // Reject the connection
      await db
        .update(coachStudentAssignments)
        .set({
          status: 'inactive',
          isActive: false,
          notes: `${connection.notes} - Rejected by coach on ${new Date().toISOString()}`
        })
        .where(eq(coachStudentAssignments.id, connectionId));

      res.json({
        success: true,
        message: 'Connection request rejected.'
      });
    }

    // TODO: Send notification to student about the decision

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    console.error('Error responding to connection request:', error);
    res.status(500).json({ error: 'Failed to process connection request' });
  }
});

export { router as coachStudentRequestRoutes };