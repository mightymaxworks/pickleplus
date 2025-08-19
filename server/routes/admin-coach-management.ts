import { Router } from "express";
import { z } from "zod";
import { users, coachStudentAssignments, insertCoachStudentAssignmentSchema } from "@shared/schema";
import { storage } from "../storage";
import { eq, and } from "drizzle-orm";
import { db } from "../db";

const router = Router();

// Middleware to ensure admin access
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Get all users for coach management
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        coachLevel: users.coachLevel,
        totalMatches: users.totalMatches,
        rankingPoints: users.singlesRankingPoints,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.coachLevel, users.username);

    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user coach level
router.patch("/users/:userId/coach-level", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { coachLevel } = z.object({
      coachLevel: z.number().int().min(0).max(5)
    }).parse(req.body);

    const updatedUser = await db
      .update(users)
      .set({ coachLevel })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: updatedUser[0] });
  } catch (error) {
    console.error("Error updating coach level:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid coach level. Must be 0-5." });
    }
    res.status(500).json({ error: "Failed to update coach level" });
  }
});

// Get all coach-student assignments
router.get("/coach-assignments", requireAdmin, async (req, res) => {
  try {
    const assignments = await db
      .select({
        id: coachStudentAssignments.id,
        coachId: coachStudentAssignments.coachId,
        studentId: coachStudentAssignments.studentId,
        assignedBy: coachStudentAssignments.assignedBy,
        assignedAt: coachStudentAssignments.assignedAt,
        isActive: coachStudentAssignments.isActive,
        notes: coachStudentAssignments.notes,
      })
      .from(coachStudentAssignments)
      .where(eq(coachStudentAssignments.isActive, true));

    // Fetch related user data
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [coach] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            email: users.email,
            coachLevel: users.coachLevel
          })
          .from(users)
          .where(eq(users.id, assignment.coachId));

        const [student] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            email: users.email
          })
          .from(users)
          .where(eq(users.id, assignment.studentId));

        const [assignedByUser] = await db
          .select({
            id: users.id,
            username: users.username,
            displayName: users.displayName
          })
          .from(users)
          .where(eq(users.id, assignment.assignedBy));

        return {
          ...assignment,
          coach,
          student,
          assignedByUser
        };
      })
    );

    res.json(enrichedAssignments);
  } catch (error) {
    console.error("Error fetching coach assignments:", error);
    res.status(500).json({ error: "Failed to fetch coach assignments" });
  }
});

// Create coach-student assignments
router.post("/coach-assignments", requireAdmin, async (req, res) => {
  try {
    const { coachId, studentIds, notes } = z.object({
      coachId: z.number(),
      studentIds: z.array(z.number()),
      notes: z.string().optional()
    }).parse(req.body);

    const adminId = req.user.id;

    // Verify coach exists and has coach level > 0
    const [coach] = await db
      .select({ coachLevel: users.coachLevel })
      .from(users)
      .where(eq(users.id, coachId));

    if (!coach || coach.coachLevel === 0) {
      return res.status(400).json({ error: "User is not an active coach" });
    }

    // Create assignments for each student
    const assignments = await Promise.all(
      studentIds.map(async (studentId) => {
        // Check if assignment already exists
        const existing = await db
          .select()
          .from(coachStudentAssignments)
          .where(
            and(
              eq(coachStudentAssignments.coachId, coachId),
              eq(coachStudentAssignments.studentId, studentId),
              eq(coachStudentAssignments.isActive, true)
            )
          );

        if (existing.length > 0) {
          return null; // Skip existing assignments
        }

        const [assignment] = await db
          .insert(coachStudentAssignments)
          .values({
            coachId,
            studentId,
            assignedBy: adminId,
            notes: notes || null
          })
          .returning();

        return assignment;
      })
    );

    const successfulAssignments = assignments.filter(Boolean);

    res.json({
      success: true,
      assignmentsCreated: successfulAssignments.length,
      assignments: successfulAssignments
    });
  } catch (error) {
    console.error("Error creating coach assignments:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid assignment data" });
    }
    res.status(500).json({ error: "Failed to create coach assignments" });
  }
});

// Remove coach-student assignment
router.delete("/coach-assignments/:assignmentId", requireAdmin, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);

    const result = await db
      .update(coachStudentAssignments)
      .set({ isActive: false })
      .where(eq(coachStudentAssignments.id, assignmentId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing coach assignment:", error);
    res.status(500).json({ error: "Failed to remove coach assignment" });
  }
});

export default router;