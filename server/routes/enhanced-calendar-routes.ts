/**
 * PKL-278651-TRAINING-CENTER-ENHANCED - Enhanced Calendar API Routes
 * Supports weekly schedule view, class limits, minimum enrollment requirements
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import { Router } from 'express';
import { addDays, format, startOfWeek } from 'date-fns';

const router = Router();

// Training centers data
const trainingCenters = [
  {
    id: 1,
    name: "Singapore Elite Pickleball Center",
    address: "123 Marina Bay Street, Singapore 018956",
    qrCode: "TC001-SG",
    facilities: ["8 Indoor Courts", "Pro Shop", "Lounge Area"],
    operatingHours: "6:00 AM - 10:00 PM"
  },
  {
    id: 2,
    name: "Marina Bay Courts",
    address: "456 Sentosa Drive, Singapore 098765",
    qrCode: "TC002-SG",
    facilities: ["6 Outdoor Courts", "Equipment Rental", "Café"],
    operatingHours: "7:00 AM - 9:00 PM"
  },
  {
    id: 3,
    name: "Orchard Training Hub",
    address: "789 Orchard Road, Singapore 238123",
    qrCode: "TC003-SG",
    facilities: ["4 Indoor Courts", "Training Studio", "Parking"],
    operatingHours: "6:30 AM - 9:30 PM"
  }
];

// Enhanced class templates with limits and requirements
const classTemplates = [
  {
    id: 1,
    name: "Beginner Fundamentals",
    description: "Learn the basics of pickleball including rules, scoring, and basic techniques",
    skill_level: "Beginner",
    category: "Fundamentals",
    duration: 90,
    max_participants: 8,
    min_participants: 3,
    price_per_session: 45,
    coach_id: 1,
    coach_name: "Sarah Chen",
    coach_bio: "Professional pickleball instructor with 8 years of experience. Specializes in teaching beginners and developing proper fundamentals.",
    coach_certifications: ["PPR Certified Instructor", "USAPA Ambassador", "First Aid Certified"],
    coach_rating: 4.9,
    coach_reviews_count: 156,
    goals: [
      "Master basic serving techniques",
      "Understand court positioning and movement",
      "Learn proper grip and paddle control",
      "Practice basic volleys and groundstrokes"
    ]
  },
  {
    id: 2,
    name: "Intermediate Strategy",
    description: "Advanced tactics, shot placement, and strategic play for intermediate players",
    skill_level: "Intermediate",
    category: "Strategy",
    duration: 120,
    max_participants: 6,
    min_participants: 4,
    price_per_session: 65,
    coach_id: 2,
    coach_name: "Marcus Rodriguez",
    coach_bio: "Former professional tennis player turned pickleball coach. Expert in strategy and mental game development.",
    coach_certifications: ["PPR Pro Instructor", "Sports Psychology Certified", "Tournament Director"],
    coach_rating: 4.8,
    coach_reviews_count: 89,
    goals: [
      "Develop advanced shot selection",
      "Master third shot strategies",
      "Improve court positioning",
      "Learn doubles communication"
    ]
  },
  {
    id: 3,
    name: "Advanced Competition Prep",
    description: "High-intensity training for tournament preparation and competitive play",
    skill_level: "Advanced",
    category: "Competition",
    duration: 150,
    max_participants: 4,
    min_participants: 2,
    price_per_session: 85,
    coach_id: 3,
    coach_name: "Jennifer Kim",
    coach_bio: "National champion and certified master instructor with expertise in competitive play and tournament preparation.",
    coach_certifications: ["PPR Master Pro", "National Champion 2022", "Mental Performance Coach"],
    coach_rating: 5.0,
    coach_reviews_count: 67,
    goals: [
      "Perfect advanced shot execution",
      "Develop tournament mental toughness",
      "Master pressure situations",
      "Refine competitive strategies"
    ]
  },
  {
    id: 4,
    name: "Youth Development",
    description: "Fun and engaging pickleball training designed specifically for young players",
    skill_level: "Youth",
    category: "Youth Program",
    duration: 75,
    max_participants: 10,
    min_participants: 5,
    price_per_session: 35,
    coach_id: 4,
    coach_name: "Coach Tommy",
    coach_bio: "Youth sports specialist with a passion for developing young athletes through fun and engaging pickleball activities.",
    coach_certifications: ["Youth Sports Certified", "SafeSport Trained", "Child Development Specialist"],
    coach_rating: 4.7,
    coach_reviews_count: 134,
    goals: [
      "Develop hand-eye coordination",
      "Learn sportsmanship and teamwork",
      "Master age-appropriate techniques",
      "Build confidence and love for the game"
    ]
  },
  {
    id: 5,
    name: "Fitness & Conditioning",
    description: "Improve your pickleball performance through targeted fitness and conditioning",
    skill_level: "All Levels",
    category: "Fitness",
    duration: 60,
    max_participants: 12,
    min_participants: 6,
    price_per_session: 40,
    coach_id: 5,
    coach_name: "Alex Fitness",
    coach_bio: "Certified personal trainer and pickleball enthusiast focused on sport-specific conditioning and injury prevention.",
    coach_certifications: ["NASM Certified", "Corrective Exercise Specialist", "Pickleball Conditioning Expert"],
    coach_rating: 4.6,
    coach_reviews_count: 92,
    goals: [
      "Improve agility and footwork",
      "Build core strength and stability",
      "Enhance endurance and stamina",
      "Prevent common pickleball injuries"
    ]
  }
];

// Generate weekly schedule with realistic enrollment data
function generateWeeklySchedule(centerId: number, weekStart: Date) {
  const schedule: { [date: string]: any[] } = {};
  
  // Define time slots for each day
  const timeSlots = {
    weekday: [
      { start: '09:00', end: '10:30' },
      { start: '11:00', end: '12:30' },
      { start: '14:00', end: '15:30' },
      { start: '16:00', end: '17:30' },
      { start: '18:00', end: '19:30' },
      { start: '19:45', end: '21:15' }
    ],
    weekend: [
      { start: '08:00', end: '09:30' },
      { start: '10:00', end: '11:30' },
      { start: '12:00', end: '13:30' },
      { start: '14:00', end: '15:30' },
      { start: '16:00', end: '17:30' },
      { start: '18:00', end: '19:30' }
    ]
  };

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const isWeekend = i === 0 || i === 6; // Sunday or Saturday
    const slots = isWeekend ? timeSlots.weekend : timeSlots.weekday;
    
    schedule[dateKey] = [];

    // Generate 2-4 classes per day
    const numClasses = Math.floor(Math.random() * 3) + 2;
    const selectedSlots = slots.slice(0, numClasses);
    
    selectedSlots.forEach((slot, index) => {
      const template = classTemplates[Math.floor(Math.random() * classTemplates.length)];
      
      // Generate realistic enrollment numbers
      const enrollmentFactor = Math.random();
      let current_enrollment;
      
      if (enrollmentFactor < 0.3) {
        // 30% chance: below minimum
        current_enrollment = Math.floor(Math.random() * Math.max(1, template.min_participants));
      } else if (enrollmentFactor < 0.8) {
        // 50% chance: between minimum and 80% capacity
        const minEnroll = template.min_participants;
        const maxRange = Math.floor(template.max_participants * 0.8);
        current_enrollment = Math.floor(Math.random() * (maxRange - minEnroll + 1)) + minEnroll;
      } else {
        // 20% chance: near or at capacity
        const nearCapacity = Math.floor(template.max_participants * 0.9);
        current_enrollment = Math.floor(Math.random() * (template.max_participants - nearCapacity + 1)) + nearCapacity;
      }

      // Determine status based on enrollment
      let status: 'available' | 'full' | 'cancelled' | 'minimum_not_met' = 'available';
      
      if (current_enrollment >= template.max_participants) {
        status = 'full';
      } else if (current_enrollment < template.min_participants) {
        status = 'minimum_not_met';
      } else if (Math.random() < 0.05) { // 5% chance of cancellation
        status = 'cancelled';
      }

      const classInstance = {
        id: parseInt(`${centerId}${i}${index}${template.id}`),
        ...template,
        date: dateKey,
        start_time: slot.start,
        end_time: slot.end,
        current_enrollment,
        status,
        center_id: centerId
      };

      schedule[dateKey].push(classInstance);
    });

    // Sort by start time
    schedule[dateKey].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  return schedule;
}

// Get all training centers
router.get('/training-centers', (req, res) => {
  res.json(trainingCenters);
});

// Get weekly schedule for a training center
router.get('/weekly-schedule/:centerId', (req, res) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const weekParam = req.query.week as string;
    
    let weekStart: Date;
    if (weekParam) {
      weekStart = startOfWeek(new Date(weekParam));
    } else {
      weekStart = startOfWeek(new Date());
    }

    const center = trainingCenters.find(c => c.id === centerId);
    if (!center) {
      return res.status(404).json({ error: 'Training center not found' });
    }

    const schedule = generateWeeklySchedule(centerId, weekStart);

    res.json({
      success: true,
      center,
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
      schedule
    });
  } catch (error) {
    console.error('[Calendar] Error generating weekly schedule:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate weekly schedule' 
    });
  }
});

// Get classes for a specific date (maintain compatibility)
router.get('/classes/:centerId', (req, res) => {
  try {
    const centerId = parseInt(req.params.centerId);
    const date = req.query.date as string || format(new Date(), 'yyyy-MM-dd');
    
    const center = trainingCenters.find(c => c.id === centerId);
    if (!center) {
      return res.status(404).json({ error: 'Training center not found' });
    }

    // Generate schedule for the week containing the requested date
    const weekStart = startOfWeek(new Date(date));
    const schedule = generateWeeklySchedule(centerId, weekStart);
    
    const dayClasses = schedule[date] || [];

    res.json({
      success: true,
      center,
      date,
      dayClasses
    });
  } catch (error) {
    console.error('[Calendar] Error fetching classes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch classes' 
    });
  }
});

// Enroll in a class
router.post('/classes/:classId/enroll', (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { enrollmentType = 'advance' } = req.body;

    // In a real implementation, you would:
    // 1. Verify class exists and has capacity
    // 2. Check user authentication
    // 3. Process payment
    // 4. Create enrollment record
    // 5. Send confirmation email

    // Simulate enrollment logic
    const enrollmentSuccess = Math.random() > 0.1; // 90% success rate

    if (enrollmentSuccess) {
      res.json({
        success: true,
        message: 'Successfully enrolled in class',
        enrollment: {
          id: Date.now(),
          classId,
          userId: req.user?.id || 1,
          enrollmentType,
          status: 'confirmed',
          enrolledAt: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Enrollment failed',
        message: 'Class may be full or payment processing failed'
      });
    }
  } catch (error) {
    console.error('[Calendar] Error enrolling in class:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to enroll in class' 
    });
  }
});

// Get user's enrolled classes
router.get('/my-classes', async (req, res) => {
  try {
    // Get user ID from session or authentication
    const userId = req.user?.id || 1; // Default to user 1 for testing
    
    // Get real enrolled classes from database
    const { storage } = await import('../storage');
    const enrolledClasses = await storage.getUserEnrolledClasses(userId);
    
    res.json({
      success: true,
      enrolledClasses: enrolledClasses || []
    });
  } catch (error) {
    console.error('[Calendar] Error fetching enrolled classes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch enrolled classes' 
    });
  }
});

export default router;