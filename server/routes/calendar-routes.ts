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

// Get available classes for a training center
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
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const playerId = req.user.id;
    const { upcoming = 'true' } = req.query;
    
    const enrolledClasses = await storage.getUserEnrolledClasses(
      playerId, 
      upcoming === 'true'
    );
    
    res.json({ enrolledClasses });
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