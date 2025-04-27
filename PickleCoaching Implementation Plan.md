# PickleCoaching Ecosystem Implementation Plan: Framework 5.3 Frontend-First Approach

## Overview

The Pickle+ Coaching Ecosystem creates a comprehensive platform for connecting players with coaches through an emotionally intelligent matchmaking system. It provides interactive coaching tools and resources while integrating with the PickleJourney™ system to deliver a holistic development experience. This implementation follows a frontend-first approach to minimize database polling and optimize performance.

## Core Principles

- **Frontend-First Logic**: Primary matching and coaching tool functionality happens client-side
- **Minimal Database Polling**: Cache coach profiles and resources aggressively
- **Emotional Intelligence Integration**: Match coaches and students based on emotional compatibility
- **Framework 5.3 Compliance**: Maintain reasonable complexity with clear module boundaries
- **Progressive Enhancement**: Core functionality works offline, enhanced when online

## Sprint Plan

### PKL-278651-COACH-001: Coaching Ecosystem Foundation (4 weeks)
**Goal:** Create frontend coaching profile system with local caching

#### PKL-278651-COACH-001.1: Frontend Coaching Profile System
- Build profile editor with rich preview functionality
- Implement client-side coach-student matching algorithm
- Create availability calendar with offline support
- Develop emotional teaching approach specification interface

#### PKL-278651-COACH-001.2: Frontend Emotional Intelligence Assessment
- Create interactive assessment with client-side scoring
- Implement real-time visualization of assessment results
- Build recommendation engine based on assessment results
- Develop coach-student compatibility visualization

### PKL-278651-COACH-002: Enhanced Coaching Tools (3 weeks)
**Goal:** Implement browser-based coaching tools with optimized data transfer

#### PKL-278651-COACH-002.1: Browser-Based Coaching Tools
- Create interactive court diagram editor using WebGL
- Implement client-side video annotation without full uploads
- Build emotion tagging system for video moments
- Develop shared whiteboard with minimal data transfer

#### PKL-278651-COACH-002.2: Offline-Capable Resource Library
- Implement progressive web app caching for resources
- Create indexed search of local coaching materials
- Build version management for synchronized resources
- Develop prioritized downloading based on relevance

### PKL-278651-INTEG-001: Integration & Optimization (2 weeks)
**Goal:** Optimize performance and ensure seamless frontend-backend synchronization

#### PKL-278651-INTEG-001.1: Coaching-Journey Integration
- Implement automatic journal entry creation from coaching sessions
- Create coach feedback integration with journal entries
- Build progress visualization linking coaching to player development
- Develop emotional intelligence tracking across coaching sessions

#### PKL-278651-INTEG-001.2: Performance Optimization
- Implement code-splitting for coaching tools
- Create intelligent preloading of likely-needed resources
- Optimize rendering of complex court diagrams
- Develop efficient synchronization of coaching resources

## Technical Implementation Details

### Coach-Student Matching Algorithm

The frontend matching algorithm will consider:

1. **Teaching-Learning Style Compatibility**
   - Visual, auditory, kinesthetic, and reading/writing preferences
   - Structured vs. exploratory learning approaches
   - Detail-oriented vs. big-picture focus
   - Feedback style preferences (direct vs. sandwich approach)

2. **Emotional Intelligence Compatibility**
   - Coach's approach to handling player frustration
   - Student's emotional resilience profile
   - Communication style matching
   - Growth mindset alignment

3. **Technical Focus Areas**
   - CourtIQ dimension alignment (coach strength matched to student needs)
   - Specialized skills (third shot drop, dinking, serve strategies)
   - Player goals and coach expertise overlap
   - Improvement priority alignment

The matching will use a weighted scoring system calculated entirely on the frontend, with results cached for quick access.

### Interactive Coaching Tools

Frontend-first coaching tools will include:

1. **Virtual Court Designer**
   ```typescript
   // Core WebGL-based court visualization engine
   interface CourtDesignerState {
     players: {
       position: { x: number, y: number },
       trajectory: { x: number, y: number }[],
       label: string,
       team: 'A' | 'B'
     }[];
     ball: {
       position: { x: number, y: number, z: number },
       trajectory: { x: number, y: number, z: number }[]
     };
     annotations: {
       type: 'arrow' | 'circle' | 'text',
       position: { x: number, y: number },
       properties: Record<string, any>
     }[];
     sequences: {
       id: string,
       name: string,
       frames: CourtDesignerState[]
     }[];
   }
   ```

   This WebGL-based tool will render entirely in the browser, with court diagrams saved to IndexedDB first, then synchronized to the server. It will support:
   
   - Player and ball positioning with drag-and-drop
   - Movement path creation
   - Multi-step sequence design
   - Shareable diagram links
   - Embedded commentary

2. **Video Analysis Tool**
   
   Using browser-based video processing, this tool will allow:
   
   - Frame-by-frame analysis without full video upload
   - Overlay annotations on specific frames
   - Side-by-side comparison with technique models
   - Emotional state tagging at key moments
   - Progress tracking across multiple videos
   - Selective frame sharing while maintaining privacy

3. **Coaching Session Planner**
   
   A frontend tool for designing coaching sessions with:
   
   - Drag-and-drop exercise sequencing
   - Time allocation visualization
   - Skill focus tracking across sessions
   - Pre-loaded drill templates
   - Customization based on student profile
   - Emotional state consideration in planning

### Emotional Intelligence Assessment

The assessment system will use a frontend-first approach:

1. **Assessment Interface**
   - Interactive scenarios with response selection
   - Real-time scoring and visualization
   - Adaptive questioning based on previous answers
   - Progress indication

2. **Results Processing**
   - Client-side calculation of emotional intelligence dimensions
   - Immediate visualization of results
   - Comparison with coaching style requirements
   - Personalized development recommendations

3. **Coaching Compatibility**
   - Local matching with cached coach profiles
   - Real-time compatibility score updates
   - Interactive exploration of compatibility factors
   - Recommended coaches based on emotional intelligence fit

### Client-Side Data Architecture

The frontend-first approach will utilize:

1. **IndexedDB Storage**
   - Coach profiles and availability
   - Court diagrams and session plans
   - Teaching resources and drills
   - Assessment results and recommendations

2. **React Context for Coaching State**
   - Current coach-student relationship
   - Session history and upcoming sessions
   - Shared resources and notes
   - Development feedback

3. **Optimistic UI Updates**
   - Session booking appears instantly
   - Resource sharing shows immediately
   - Background synchronization with server
   - Conflict resolution for availability changes

### Integration with PickleJourney™

The coaching ecosystem will integrate tightly with PickleJourney™:

1. **Automatic Journal Creation**
   - Post-session journal templates populated with session details
   - Emotion-aware prompts based on session outcomes
   - Coach feedback integration
   - Progress tracking across multiple sessions

2. **Shared Emotional Context**
   - Coaches gain insight into player's emotional state
   - Journal entries provide context for coaching approach
   - Emotional growth tracked across coaching relationship
   - Targeted emotional development exercises

3. **Holistic Visualization**
   - Combined view of technical and emotional growth
   - Connection between coaching interventions and outcomes
   - Long-term progress across both dimensions
   - Goal achievement tracking

## Database Schema (Minimalist Approach)

The backend will support the frontend-first approach with a minimal schema:

```typescript
// Coaching Profiles
const coachingProfiles = pgTable('coaching_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  bio: text('bio'),
  certifications: text('certifications').array(),
  specialties: text('specialties').array(),
  teachingStyle: jsonb('teaching_style'),
  emotionalApproach: jsonb('emotional_approach'),
  yearsExperience: integer('years_experience'),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  availability: jsonb('availability'),
  isVerified: boolean('is_verified').default(false),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
});

// Student Profiles
const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  learningStyle: jsonb('learning_style'),
  developmentGoals: text('development_goals').array(),
  emotionalProfile: jsonb('emotional_profile'),
  skillFocusAreas: jsonb('skill_focus_areas'),
  feedbackPreferences: jsonb('feedback_preferences'),
  preferredIntensity: integer('preferred_intensity'),
});

// Coaching Sessions
const coachingSessions = pgTable('coaching_sessions', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull().references(() => users.id),
  studentId: integer('student_id').notNull().references(() => users.id),
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'),
  focusAreas: text('focus_areas').array(),
  notes: text('notes'),
  studentFeedback: jsonb('student_feedback'),
  coachFeedback: jsonb('coach_feedback'),
  emotionalStateStart: varchar('emotional_state_start', { length: 50 }),
  emotionalStateEnd: varchar('emotional_state_end', { length: 50 }),
  relatedJournalEntryIds: integer('related_journal_entry_ids').array(),
});

// Coaching Resources
const coachingResources = pgTable('coaching_resources', {
  id: serial('id').primaryKey(),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  contentUrl: varchar('content_url', { length: 512 }),
  contentData: jsonb('content_data'),
  isPublic: boolean('is_public').default(false),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});
```

## First Deliverable: Coach-Student Matching System

The first implementation will be the Coach-Student Matching System component, following frontend-first principles:

```tsx
// src/modules/coaching/hooks/useCoachMatching.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQuery } from '@tanstack/react-query';

// Types
export interface CoachProfile {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  certifications: string[];
  specialties: string[];
  teachingStyle: {
    structure: number; // 1-5 (structured to exploratory)
    communication: number; // 1-5 (direct to conversational)
    feedback: number; // 1-5 (immediate to reflective)
    pacing: number; // 1-5 (methodical to rapid)
  };
  emotionalApproach: {
    supportiveness: number; // 1-5
    patience: number; // 1-5
    intensity: number; // 1-5
    growthFocus: number; // 1-5
  };
  courtIQStrengths: {
    technical: number; // 1-5
    tactical: number; // 1-5
    physical: number; // 1-5
    mental: number; // 1-5
    consistency: number; // 1-5
  };
  yearsExperience: number;
  hourlyRate: number;
  availability: {
    weekdays: boolean[];
    timeRanges: { start: string; end: string }[];
  };
  averageRating: number;
  totalSessions: number;
}

export interface StudentProfile {
  userId: number;
  learningStyle: {
    visual: number; // 1-5
    auditory: number; // 1-5
    kinesthetic: number; // 1-5
    reading: number; // 1-5
  };
  structurePreference: number; // 1-5 (structured to exploratory)
  feedbackPreference: number; // 1-5 (direct to gentle)
  pacingPreference: number; // 1-5 (methodical to rapid)
  emotionalProfile: {
    frustrationTolerance: number; // 1-5
    confidenceLevel: number; // 1-5
    socialComfort: number; // 1-5
    growthMindset: number; // 1-5
  };
  developmentGoals: string[];
  skillFocusAreas: {
    technical: string[];
    tactical: string[];
    physical: string[];
    mental: string[];
    consistency: string[];
  };
  courtIQNeeds: {
    technical: number; // 1-5
    tactical: number; // 1-5
    physical: number; // 1-5
    mental: number; // 1-5
    consistency: number; // 1-5
  };
}

export interface MatchResult {
  coachId: number;
  overallCompatibility: number;
  dimensionScores: {
    teachingLearningStyle: number;
    emotionalIntelligence: number;
    technicalFocus: number;
    availability: number;
    experienceLevel: number;
  };
  strengthsAndChallenges: {
    strengths: string[];
    challenges: string[];
  };
}

export function useCoachMatching() {
  // Get cached coaches or fetch from server
  const { data: coaches = [] } = useQuery({
    queryKey: ['/api/coaching/coaches'],
    queryFn: async () => {
      // Check cache first
      const cachedCoaches = localStorage.getItem('cachedCoaches');
      if (cachedCoaches) {
        return JSON.parse(cachedCoaches) as CoachProfile[];
      }
      
      // Fetch from server if not cached
      const response = await fetch('/api/coaching/coaches');
      const data = await response.json();
      
      // Cache the results
      localStorage.setItem('cachedCoaches', JSON.stringify(data));
      return data as CoachProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get student profile from cache or create default
  const [studentProfile, setStudentProfile] = useLocalStorage<StudentProfile>(
    'student-profile',
    {
      userId: 0,
      learningStyle: { visual: 3, auditory: 3, kinesthetic: 3, reading: 3 },
      structurePreference: 3,
      feedbackPreference: 3,
      pacingPreference: 3,
      emotionalProfile: {
        frustrationTolerance: 3,
        confidenceLevel: 3,
        socialComfort: 3,
        growthMindset: 3
      },
      developmentGoals: [],
      skillFocusAreas: {
        technical: [],
        tactical: [],
        physical: [],
        mental: [],
        consistency: []
      },
      courtIQNeeds: {
        technical: 3,
        tactical: 3,
        physical: 3,
        mental: 3,
        consistency: 3
      }
    }
  );
  
  // Current match results
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  
  // Calculate match results purely on the frontend
  const calculateMatches = () => {
    const results: MatchResult[] = coaches.map(coach => {
      // Teaching-Learning Style Compatibility (30%)
      const teachingLearningScore = calculateTeachingLearningScore(coach, studentProfile);
      
      // Emotional Intelligence Compatibility (30%)
      const emotionalScore = calculateEmotionalScore(coach, studentProfile);
      
      // Technical Focus Areas (25%)
      const technicalScore = calculateTechnicalScore(coach, studentProfile);
      
      // Availability and Logistics (10%)
      const availabilityScore = calculateAvailabilityScore(coach, studentProfile);
      
      // Experience Level Appropriateness (5%)
      const experienceScore = calculateExperienceScore(coach, studentProfile);
      
      // Overall weighted score
      const overallCompatibility = 
        (teachingLearningScore * 0.3) +
        (emotionalScore * 0.3) +
        (technicalScore * 0.25) +
        (availabilityScore * 0.1) +
        (experienceScore * 0.05);
      
      // Identify specific strengths and challenges
      const strengthsAndChallenges = identifyStrengthsAndChallenges(
        coach, 
        studentProfile,
        {
          teachingLearningStyle: teachingLearningScore,
          emotionalIntelligence: emotionalScore,
          technicalFocus: technicalScore,
          availability: availabilityScore,
          experienceLevel: experienceScore
        }
      );
      
      return {
        coachId: coach.id,
        overallCompatibility,
        dimensionScores: {
          teachingLearningStyle: teachingLearningScore,
          emotionalIntelligence: emotionalScore,
          technicalFocus: technicalScore,
          availability: availabilityScore,
          experienceLevel: experienceScore
        },
        strengthsAndChallenges
      };
    });
    
    // Sort by compatibility score descending
    results.sort((a, b) => b.overallCompatibility - a.overallCompatibility);
    
    setMatchResults(results);
    return results;
  };
  
  // Calculate teaching-learning style compatibility
  const calculateTeachingLearningScore = (
    coach: CoachProfile, 
    student: StudentProfile
  ): number => {
    // Structure compatibility
    const structureCompatibility = 1 - (Math.abs(coach.teachingStyle.structure - student.structurePreference) / 4);
    
    // Feedback compatibility
    const feedbackCompatibility = 1 - (Math.abs(coach.teachingStyle.feedback - student.feedbackPreference) / 4);
    
    // Pacing compatibility
    const pacingCompatibility = 1 - (Math.abs(coach.teachingStyle.pacing - student.pacingPreference) / 4);
    
    // Weighted average of all factors
    return (structureCompatibility * 0.4) + 
           (feedbackCompatibility * 0.4) + 
           (pacingCompatibility * 0.2);
  };
  
  // Calculate emotional intelligence compatibility
  const calculateEmotionalScore = (
    coach: CoachProfile, 
    student: StudentProfile
  ): number => {
    // Support need match
    const supportMatch = 1 - (
      Math.abs(coach.emotionalApproach.supportiveness - (6 - student.emotionalProfile.frustrationTolerance)) / 4
    );
    
    // Patience match with confidence
    const patienceMatch = 1 - (
      Math.abs(coach.emotionalApproach.patience - (6 - student.emotionalProfile.confidenceLevel)) / 4
    );
    
    // Growth mindset alignment
    const growthMindsetMatch = 1 - (
      Math.abs(coach.emotionalApproach.growthFocus - student.emotionalProfile.growthMindset) / 4
    );
    
    // Weighted average of all factors
    return (supportMatch * 0.4) + 
           (patienceMatch * 0.3) + 
           (growthMindsetMatch * 0.3);
  };
  
  // Calculate technical focus area compatibility
  const calculateTechnicalScore = (
    coach: CoachProfile, 
    student: StudentProfile
  ): number => {
    // Match coach strengths to student needs
    const technicalMatch = 1 - (
      Math.abs(coach.courtIQStrengths.technical - student.courtIQNeeds.technical) / 4
    );
    
    const tacticalMatch = 1 - (
      Math.abs(coach.courtIQStrengths.tactical - student.courtIQNeeds.tactical) / 4
    );
    
    const physicalMatch = 1 - (
      Math.abs(coach.courtIQStrengths.physical - student.courtIQNeeds.physical) / 4
    );
    
    const mentalMatch = 1 - (
      Math.abs(coach.courtIQStrengths.mental - student.courtIQNeeds.mental) / 4
    );
    
    const consistencyMatch = 1 - (
      Math.abs(coach.courtIQStrengths.consistency - student.courtIQNeeds.consistency) / 4
    );
    
    // Specialties match
    let specialtiesScore = 0;
    const allStudentFocusAreas = [
      ...student.skillFocusAreas.technical,
      ...student.skillFocusAreas.tactical,
      ...student.skillFocusAreas.physical,
      ...student.skillFocusAreas.mental,
      ...student.skillFocusAreas.consistency,
    ];
    
    if (allStudentFocusAreas.length > 0) {
      const matchingSpecialties = coach.specialties.filter(
        specialty => allStudentFocusAreas.includes(specialty)
      );
      specialtiesScore = matchingSpecialties.length / Math.min(coach.specialties.length, allStudentFocusAreas.length);
    } else {
      specialtiesScore = 0.5; // Neutral if student hasn't specified focus areas
    }
    
    // Weighted average of all factors
    return (technicalMatch * 0.2) + 
           (tacticalMatch * 0.2) + 
           (physicalMatch * 0.15) + 
           (mentalMatch * 0.15) + 
           (consistencyMatch * 0.1) +
           (specialtiesScore * 0.2);
  };
  
  // Calculate availability compatibility
  const calculateAvailabilityScore = (
    coach: CoachProfile, 
    student: StudentProfile
  ): number => {
    // This would be more sophisticated in production
    // For now, return a placeholder score
    return 0.8;
  };
  
  // Calculate experience level appropriateness
  const calculateExperienceScore = (
    coach: CoachProfile, 
    student: StudentProfile
  ): number => {
    // Higher scores for more experienced coaches
    // This is a simplified implementation
    return Math.min(coach.yearsExperience / 10, 1);
  };
  
  // Identify specific strengths and challenges in the match
  const identifyStrengthsAndChallenges = (
    coach: CoachProfile,
    student: StudentProfile,
    scores: {
      teachingLearningStyle: number;
      emotionalIntelligence: number;
      technicalFocus: number;
      availability: number;
      experienceLevel: number;
    }
  ) => {
    const strengths: string[] = [];
    const challenges: string[] = [];
    
    // Identify teaching style strengths/challenges
    if (scores.teachingLearningStyle > 0.8) {
      strengths.push('Teaching style excellently matched to your learning preferences');
    } else if (scores.teachingLearningStyle < 0.5) {
      challenges.push('Teaching style may require adjustment to match your learning preferences');
    }
    
    // Identify emotional approach strengths/challenges
    if (scores.emotionalIntelligence > 0.8) {
      strengths.push('Excellent emotional intelligence compatibility');
    } else if (scores.emotionalIntelligence < 0.5) {
      challenges.push('May need to discuss emotional support expectations');
    }
    
    // Identify technical strengths/challenges
    if (scores.technicalFocus > 0.8) {
      strengths.push('Coach expertise aligns perfectly with your development needs');
    } else if (scores.technicalFocus < 0.5) {
      challenges.push('Some technical focus areas may not be coach\'s primary expertise');
    }
    
    // Add more specific items based on individual dimensions
    
    // Structure preference
    if (Math.abs(coach.teachingStyle.structure - student.structurePreference) <= 1) {
      strengths.push('Well-matched lesson structure preferences');
    } else if (Math.abs(coach.teachingStyle.structure - student.structurePreference) >= 3) {
      challenges.push('Different preferences for lesson structure');
    }
    
    // Court IQ dimensions
    const courtIQDimensions = [
      { name: 'Technical', coach: coach.courtIQStrengths.technical, student: student.courtIQNeeds.technical },
      { name: 'Tactical', coach: coach.courtIQStrengths.tactical, student: student.courtIQNeeds.tactical },
      { name: 'Physical', coach: coach.courtIQStrengths.physical, student: student.courtIQNeeds.physical },
      { name: 'Mental', coach: coach.courtIQStrengths.mental, student: student.courtIQNeeds.mental },
      { name: 'Consistency', coach: coach.courtIQStrengths.consistency, student: student.courtIQNeeds.consistency }
    ];
    
    courtIQDimensions.forEach(dim => {
      if (dim.coach >= 4 && dim.student >= 4) {
        strengths.push(`Strong ${dim.name} skill focus alignment`);
      } else if (dim.coach <= 2 && dim.student >= 4) {
        challenges.push(`Your ${dim.name} needs may exceed coach's focus area`);
      }
    });
    
    return { strengths, challenges };
  };
  
  // Update student profile
  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    setStudentProfile(current => ({
      ...current,
      ...updates
    }));
  };
  
  // Effect to recalculate matches when student profile or coaches change
  useEffect(() => {
    if (coaches.length > 0) {
      calculateMatches();
    }
  }, [coaches, studentProfile]);
  
  return {
    studentProfile,
    updateStudentProfile,
    matchResults,
    calculateMatches,
    coaches
  };
}
```

This hook implements a sophisticated frontend-first coach matching system that:

1. Uses cached coach data when available to prevent unnecessary API calls
2. Performs all matching calculations on the client side
3. Considers multiple dimensions of compatibility
4. Provides specific insights about match strengths and challenges
5. Maintains user preferences in local storage
6. Follows Framework 5.3 principles of reasonable complexity

## Next Steps After Approval

Upon approval of this implementation plan, we will:

1. Begin development of the Coach-Student Matching System (PKL-278651-COACH-001.1)
2. Create the emotional intelligence assessment interface
3. Design the coaching profile editor components
4. Implement the local-first storage system with IndexedDB
5. Begin frontend implementation of the virtual court designer

All work will follow Framework 5.3 guidelines, maintaining frontend-first logic and reasonable complexity while delivering a powerful, emotionally intelligent coaching ecosystem.