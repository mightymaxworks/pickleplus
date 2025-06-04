/**
 * PKL-278651-TRAINING-CENTER-CALENDAR - Calendar API Routes
 * Full calendar integration for class scheduling and enrollment management
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { Router } from "express";
import { storage } from "../storage";
import { 
  insertClassTemplateSchema, 
  insertClassInstanceSchema, 
  insertClassEnrollmentSchema 
} from "@shared/schema/training-center";

const router = Router();

// Get available classes for a training center (both endpoints for compatibility)
router.get("/centers/:centerId/classes", async (req, res) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const { date, weekView } = req.query;
    
    if (weekView === 'true') {
      // Get weekly class schedule
      const weeklyClasses = await storage.getWeeklyClassSchedule(centerId);
      res.json({ weeklyClasses });
    } else if (date) {
      // Get classes for specific date
      const dayClasses = await storage.getClassesForDate(centerId, new Date(date as string));
      res.json({ dayClasses });
    } else {
      // Get today's classes
      const todayClasses = await storage.getClassesForDate(centerId, new Date());
      res.json({ todayClasses });
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Alternative endpoint format for frontend compatibility
router.get("/classes/:centerId", async (req, res) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const { date, weekView } = req.query;
    
    // Mock calendar data for complete user flow demonstration
    const mockDayClasses = [
      {
        id: 1,
        name: "Beginner Fundamentals",
        description: "Perfect for new players learning basic techniques",
        start_time: "09:00",
        end_time: "10:30",
        duration: 90,
        skill_level: "Beginner",
        max_participants: 8,
        current_enrollment: 5,
        price_per_session: 25.00,
        coach_name: "Sarah Johnson",
        coach_id: 101,
        coach_bio: "Certified pickleball instructor with 5 years experience",
        goals: ["Basic serving", "Court positioning", "Fundamental rules"],
        category: "Group Class"
      },
      {
        id: 2,
        name: "Intermediate Strategy",
        description: "Advanced tactics and game strategy",
        start_time: "11:00",
        end_time: "12:30",
        duration: 90,
        skill_level: "Intermediate",
        max_participants: 6,
        current_enrollment: 4,
        price_per_session: 35.00,
        coach_name: "Mike Chen",
        coach_id: 102,
        coach_bio: "Former tournament player, specializes in strategic gameplay",
        goals: ["Advanced positioning", "Shot selection", "Match strategy"],
        category: "Group Class"
      },
      {
        id: 3,
        name: "Advanced Tournament Prep",
        description: "Intensive training for competitive players",
        start_time: "14:00",
        end_time: "16:00",
        duration: 120,
        skill_level: "Advanced",
        max_participants: 4,
        current_enrollment: 3,
        price_per_session: 50.00,
        coach_name: "Alex Rodriguez",
        coach_id: 103,
        coach_bio: "Professional tournament coach, 10+ years experience",
        goals: ["Competition tactics", "Mental game", "Advanced techniques"],
        category: "Elite Training"
      }
    ];

    const mockWeeklyClasses = {
      Monday: mockDayClasses,
      Tuesday: mockDayClasses.map(c => ({ ...c, id: c.id + 10 })),
      Wednesday: mockDayClasses.map(c => ({ ...c, id: c.id + 20 })),
      Thursday: mockDayClasses.map(c => ({ ...c, id: c.id + 30 })),
      Friday: mockDayClasses.map(c => ({ ...c, id: c.id + 40 })),
      Saturday: mockDayClasses.map(c => ({ ...c, id: c.id + 50 })),
      Sunday: mockDayClasses.slice(0, 2).map(c => ({ ...c, id: c.id + 60 }))
    };
    
    if (weekView === 'true') {
      res.json({ weeklyClasses: mockWeeklyClasses });
    } else {
      res.json({ dayClasses: mockDayClasses });
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Get class details with enrollment info
router.get("/classes/:classId", async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const classDetails = await storage.getClassDetails(classId);
    
    if (!classDetails) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    res.json(classDetails);
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ error: "Failed to fetch class details" });
  }
});

// Enroll in a class
router.post("/classes/:classId/enroll", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const classId = parseInt(req.params.classId);
    const playerId = req.user.id;
    const { enrollmentType = 'advance' } = req.body;

    // Check if class exists and has capacity
    const classDetails = await storage.getClassDetails(classId);
    if (!classDetails) {
      return res.status(404).json({ error: "Class not found" });
    }

    if (classDetails.currentEnrollment >= classDetails.maxParticipants) {
      return res.status(400).json({ error: "Class is full" });
    }

    // Check if already enrolled
    const existingEnrollment = await storage.getClassEnrollment(classId, playerId);
    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this class" });
    }

    const enrollment = await storage.enrollInClass({
      classInstanceId: classId,
      playerId,
      enrollmentType
    });

    res.json({ 
      success: true, 
      enrollment,
      message: "Successfully enrolled in class"
    });
  } catch (error) {
    console.error("Error enrolling in class:", error);
    res.status(500).json({ error: "Failed to enroll in class" });
  }
});

// Cancel class enrollment
router.delete("/classes/:classId/enroll", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const classId = parseInt(req.params.classId);
    const playerId = req.user.id;

    const success = await storage.cancelClassEnrollment(classId, playerId);
    
    if (!success) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.json({ 
      success: true,
      message: "Class enrollment cancelled" 
    });
  } catch (error) {
    console.error("Error cancelling enrollment:", error);
    res.status(500).json({ error: "Failed to cancel enrollment" });
  }
});

// Get user's enrolled classes
router.get("/my-classes", async (req, res) => {
  try {
    // Mock enrolled classes for demonstration
    const mockEnrolledClasses = [
      {
        id: 1,
        name: "Beginner Fundamentals",
        class_date: "2025-06-05",
        start_time: "09:00",
        end_time: "10:30",
        coach_name: "Sarah Johnson",
        center_name: "Elite Pickleball Center",
        enrollment_type: "advance",
        attendance_status: "enrolled"
      }
    ];
    
    res.json({ enrolledClasses: mockEnrolledClasses });
  } catch (error) {
    console.error("Error fetching user classes:", error);
    res.status(500).json({ error: "Failed to fetch enrolled classes" });
  }
});

// Create class template (admin/coach only)
router.post("/centers/:centerId/templates", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const centerId = parseInt(req.params.centerId);
    const templateData = insertClassTemplateSchema.parse({
      ...req.body,
      centerId
    });

    const template = await storage.createClassTemplate(templateData);
    
    res.json({ 
      success: true, 
      template,
      message: "Class template created" 
    });
  } catch (error) {
    console.error("Error creating class template:", error);
    res.status(500).json({ error: "Failed to create class template" });
  }
});

// Generate class instances from template
router.post("/templates/:templateId/generate-instances", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const templateId = parseInt(req.params.templateId);
    const { startDate, endDate, skipDates = [] } = req.body;

    const instances = await storage.generateClassInstances(
      templateId, 
      new Date(startDate), 
      new Date(endDate),
      skipDates.map((date: string) => new Date(date))
    );

    res.json({ 
      success: true, 
      instances,
      message: `Generated ${instances.length} class instances`
    });
  } catch (error) {
    console.error("Error generating class instances:", error);
    res.status(500).json({ error: "Failed to generate class instances" });
  }
});

export default router;