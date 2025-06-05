/**
 * PKL-278651-PHASE2-001 - Phase 2 Enhanced Class & Coach Management Schema
 * 
 * This script creates the enhanced database schema for Phase 2 features:
 * - Enhanced class details with capacity management
 * - Coach profiles and credentials
 * - Waitlist management system
 * - Review and rating system
 * 
 * Run with: npx tsx create-phase2-schema.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-05
 */

import { db } from "./server/db";
import { 
  classTemplates, 
  classInstances, 
  classEnrollments, 
  classWaitlist,
  coachProfiles,
  coachReviews,
  trainingCenters
} from "./shared/schema/training-center";
import { users } from "./shared/schema";

async function createPhase2Schema() {
  console.log("🚀 Creating Phase 2 Enhanced Training Center Schema...");

  try {
    // Check if we need to create the enhanced schema
    console.log("📋 Checking existing schema...");
    
    // Insert sample training centers if none exist
    const existingCenters = await db.select().from(trainingCenters).limit(1);
    if (existingCenters.length === 0) {
      console.log("📍 Creating sample training centers...");
      await db.insert(trainingCenters).values([
        {
          name: "Singapore Elite Pickleball Center",
          address: "123 Sports Hub Drive",
          city: "Singapore",
          country: "Singapore",
          postalCode: "138456",
          phoneNumber: "+65 6123 4567",
          email: "info@elitepickleball.sg",
          operatingHours: {
            monday: { open: "08:00", close: "22:00" },
            tuesday: { open: "08:00", close: "22:00" },
            wednesday: { open: "08:00", close: "22:00" },
            thursday: { open: "08:00", close: "22:00" },
            friday: { open: "08:00", close: "22:00" },
            saturday: { open: "07:00", close: "23:00" },
            sunday: { open: "07:00", close: "21:00" }
          },
          courtCount: 8,
          courtSurface: "outdoor",
          amenities: ["changing_rooms", "equipment_rental", "pro_shop", "parking"],
          managerUserId: 1
        },
        {
          name: "Marina Bay Pickleball Academy",
          address: "456 Marina Boulevard",
          city: "Singapore", 
          country: "Singapore",
          postalCode: "018981",
          phoneNumber: "+65 6234 5678",
          email: "academy@marinabay.sg",
          operatingHours: {
            monday: { open: "06:00", close: "22:00" },
            tuesday: { open: "06:00", close: "22:00" },
            wednesday: { open: "06:00", close: "22:00" },
            thursday: { open: "06:00", close: "22:00" },
            friday: { open: "06:00", close: "22:00" },
            saturday: { open: "06:00", close: "23:00" },
            sunday: { open: "06:00", close: "21:00" }
          },
          courtCount: 12,
          courtSurface: "indoor",
          amenities: ["changing_rooms", "equipment_rental", "cafe", "parking", "air_conditioning"],
          managerUserId: 1
        }
      ]);
    }

    // Create sample coach profiles
    console.log("👨‍🏫 Creating sample coach profiles...");
    await db.insert(coachProfiles).values([
      {
        userId: 1, // mightymax
        professionalBio: "Certified PTR Professional with 8 years of coaching experience. Specializing in beginner development and doubles strategy.",
        yearsExperience: 8,
        certifications: ["PTR Professional", "USAPA Level 2", "First Aid/CPR"],
        specializations: ["beginners", "doubles", "strategy", "fitness"],
        teachingStyle: "patient",
        languages: ["English", "Mandarin"],
        hourlyRate: "85.00",
        personalMotto: "Every point is a new opportunity to improve",
        achievements: ["Regional Doubles Champion 2023", "Coach of the Year 2022"],
        playingBackground: "Former competitive tennis player transitioning to pickleball in 2016. Competed in regional tournaments.",
        coachingPhilosophy: "Focus on fundamentals while making learning fun and engaging for students of all levels.",
        isVerified: true,
        verificationLevel: "certified",
        isActive: true
      }
    ]).onConflictDoNothing();

    // Create enhanced class templates with Phase 2 features
    console.log("📚 Creating enhanced class templates...");
    await db.insert(classTemplates).values([
      {
        centerId: 1,
        coachId: 1,
        name: "Beginner Fundamentals",
        description: "Learn the basics of pickleball in a supportive environment",
        detailedDescription: "This comprehensive beginner class covers all fundamental aspects of pickleball including proper grip, basic strokes, court positioning, and game rules. Perfect for complete newcomers to the sport who want to build a solid foundation.",
        category: "fundamentals",
        skillLevel: "beginner",
        intensityLevel: "light",
        classFormat: "group",
        maxParticipants: 8,
        minEnrollment: 4,
        optimalCapacity: 6,
        duration: 90,
        pricePerSession: 45.00,
        goals: ["Master basic strokes", "Understand court positioning", "Learn game rules", "Build confidence"],
        prerequisites: [],
        equipmentRequired: ["comfortable athletic shoes", "water bottle"],
        equipmentProvided: ["paddles", "balls", "court access"],
        skillsFocused: ["serving", "groundstrokes", "basic_volleys", "positioning"],
        teachingMethods: ["demonstration", "drilling", "mini_games", "individualized_feedback"],
        cancellationPolicy: "Classes can be cancelled up to 2 hours before start time for full refund",
        makeupPolicy: "One makeup class per session allowed within 30 days",
        dayOfWeek: 2, // Tuesday
        startTime: "18:00",
        endTime: "19:30",
        autoCancelHours: 2
      },
      {
        centerId: 1,
        coachId: 1,
        name: "Intermediate Strategy & Doubles",
        description: "Advanced techniques and doubles strategy for intermediate players",
        detailedDescription: "Take your game to the next level with advanced shot selection, court strategy, and communication skills essential for competitive doubles play. Includes live game scenarios and strategic positioning.",
        category: "strategy",
        skillLevel: "intermediate",
        intensityLevel: "moderate",
        classFormat: "group",
        maxParticipants: 8,
        minEnrollment: 4,
        optimalCapacity: 6,
        duration: 90,
        pricePerSession: 55.00,
        goals: ["Master doubles positioning", "Improve shot selection", "Develop communication", "Increase consistency"],
        prerequisites: ["basic stroke proficiency", "understanding of game rules"],
        equipmentRequired: ["own paddle preferred", "court shoes", "water bottle"],
        equipmentProvided: ["balls", "court access", "backup paddles"],
        skillsFocused: ["doubles_strategy", "net_play", "shot_placement", "communication"],
        teachingMethods: ["live_play", "situational_drills", "video_analysis", "strategic_discussion"],
        cancellationPolicy: "Classes can be cancelled up to 4 hours before start time for full refund",
        makeupPolicy: "Makeup classes available for weather cancellations only",
        dayOfWeek: 4, // Thursday  
        startTime: "19:00",
        endTime: "20:30",
        autoCancelHours: 4
      },
      {
        centerId: 2,
        coachId: 1,
        name: "Power & Fitness Training",
        description: "High-intensity training focused on power development and fitness",
        detailedDescription: "Combine pickleball skills with fitness training to develop power, agility, and endurance. Features specialized drills for shot power, footwork improvement, and cardiovascular conditioning specific to pickleball demands.",
        category: "fitness",
        skillLevel: "intermediate",
        intensityLevel: "high",
        classFormat: "group",
        maxParticipants: 6,
        minEnrollment: 3,
        optimalCapacity: 5,
        duration: 60,
        pricePerSession: 65.00,
        goals: ["Increase shot power", "Improve footwork", "Build endurance", "Prevent injuries"],
        prerequisites: ["intermediate skill level", "basic fitness level"],
        equipmentRequired: ["athletic wear", "court shoes", "towel", "water bottle"],
        equipmentProvided: ["paddles", "balls", "resistance bands", "agility equipment"],
        skillsFocused: ["power_shots", "footwork", "conditioning", "injury_prevention"],
        teachingMethods: ["high_intensity_drills", "fitness_circuits", "plyometrics", "recovery_techniques"],
        cancellationPolicy: "24-hour cancellation policy for full refund",
        makeupPolicy: "No makeup classes - focus on consistency and progression",
        dayOfWeek: 6, // Saturday
        startTime: "09:00", 
        endTime: "10:00",
        autoCancelHours: 24
      }
    ]).onConflictDoNothing();

    // Create class instances for the next 4 weeks
    console.log("📅 Creating class instances for upcoming weeks...");
    const today = new Date();
    const instances = [];
    
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week * 7));
      
      // Tuesday Beginner class
      const tuesdayDate = new Date(weekStart);
      tuesdayDate.setDate(weekStart.getDate() + (2 - weekStart.getDay() + 7) % 7);
      tuesdayDate.setHours(18, 0, 0, 0);
      
      instances.push({
        templateId: 1,
        centerId: 1,
        coachId: 1,
        classDate: tuesdayDate,
        startTime: new Date(tuesdayDate.getTime()),
        endTime: new Date(tuesdayDate.getTime() + (90 * 60000)),
        maxParticipants: 8,
        currentEnrollment: Math.floor(Math.random() * 6) + 2, // 2-7 enrolled
        courtNumber: 1,
        status: "scheduled"
      });

      // Thursday Intermediate class
      const thursdayDate = new Date(weekStart);
      thursdayDate.setDate(weekStart.getDate() + (4 - weekStart.getDay() + 7) % 7);
      thursdayDate.setHours(19, 0, 0, 0);
      
      instances.push({
        templateId: 2,
        centerId: 1,
        coachId: 1,
        classDate: thursdayDate,
        startTime: new Date(thursdayDate.getTime()),
        endTime: new Date(thursdayDate.getTime() + (90 * 60000)),
        maxParticipants: 8,
        currentEnrollment: Math.floor(Math.random() * 6) + 3, // 3-8 enrolled
        courtNumber: 2,
        status: "scheduled"
      });

      // Saturday Fitness class
      const saturdayDate = new Date(weekStart);
      saturdayDate.setDate(weekStart.getDate() + (6 - weekStart.getDay() + 7) % 7);
      saturdayDate.setHours(9, 0, 0, 0);
      
      instances.push({
        templateId: 3,
        centerId: 2,
        coachId: 1,
        classDate: saturdayDate,
        startTime: new Date(saturdayDate.getTime()),
        endTime: new Date(saturdayDate.getTime() + (60 * 60000)),
        maxParticipants: 6,
        currentEnrollment: Math.floor(Math.random() * 4) + 2, // 2-5 enrolled
        courtNumber: 1,
        status: "scheduled"
      });
    }

    await db.insert(classInstances).values(instances).onConflictDoNothing();

    // Create sample enrollments
    console.log("📝 Creating sample enrollments...");
    const createdInstances = await db.select().from(classInstances).limit(6);
    const enrollments = [];
    
    for (const instance of createdInstances.slice(0, 3)) {
      // Enroll the test user in some classes
      enrollments.push({
        classInstanceId: instance.id,
        playerId: 1, // mightymax
        enrollmentType: "advance",
        attendanceStatus: "enrolled",
        paymentStatus: "pending"
      });
    }

    await db.insert(classEnrollments).values(enrollments).onConflictDoNothing();

    // Create sample waitlist entries
    console.log("⏳ Creating sample waitlist entries...");
    const fullClass = createdInstances.find(c => c.currentEnrollment >= c.maxParticipants);
    if (fullClass) {
      await db.insert(classWaitlist).values([
        {
          classInstanceId: fullClass.id,
          playerId: 1,
          position: 1,
          status: "waiting"
        }
      ]).onConflictDoNothing();
    }

    // Create sample coach reviews
    console.log("⭐ Creating sample coach reviews...");
    await db.insert(coachReviews).values([
      {
        coachId: 1,
        reviewerId: 1,
        sessionId: null,
        classInstanceId: createdInstances[0]?.id || null,
        overallRating: 4.8,
        technicalSkillRating: 4.7,
        communicationRating: 5.0,
        enthusiasmRating: 4.9,
        organizationRating: 4.6,
        reviewTitle: "Excellent beginner instruction",
        reviewText: "Coach Max is patient and knowledgeable. Really helped me understand the fundamentals and built my confidence on the court.",
        improvementAreas: [],
        wouldRecommend: true,
        isVerified: true,
        isPublic: true
      },
      {
        coachId: 1,
        reviewerId: 1,
        sessionId: null,
        classInstanceId: createdInstances[1]?.id || null,
        overallRating: 4.6,
        technicalSkillRating: 4.8,
        communicationRating: 4.5,
        enthusiasmRating: 4.7,
        organizationRating: 4.4,
        reviewTitle: "Great strategy insights",
        reviewText: "The doubles strategy session was very informative. Learned positioning techniques that immediately improved my game.",
        improvementAreas: ["time_management"],
        wouldRecommend: true,
        isVerified: true,
        isPublic: true
      }
    ]).onConflictDoNothing();

    console.log("✅ Phase 2 Enhanced Training Center Schema created successfully!");
    console.log("📊 Summary:");
    console.log("   - Enhanced class templates with detailed information");
    console.log("   - Capacity management and prerequisites");
    console.log("   - Coach profiles with certifications");
    console.log("   - Waitlist management system");
    console.log("   - Review and rating system");
    console.log("   - Sample data for testing");

  } catch (error) {
    console.error("❌ Error creating Phase 2 schema:", error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPhase2Schema()
    .then(() => {
      console.log("🎉 Phase 2 schema setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Phase 2 schema setup failed:", error);
      process.exit(1);
    });
}

export { createPhase2Schema };