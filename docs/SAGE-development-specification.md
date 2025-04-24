# S.A.G.E. Development Specification
**Skills Assessment & Growth Engine**

**Document Version:** 1.0.0  
**Created:** April 24, 2025  
**Last Updated:** April 24, 2025  
**Framework:** Pickle+ Development Framework 5.3  
**Project ID:** PKL-278651-COACH-0001-AI  

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Models](#data-models)
4. [Implementation Plan](#implementation-plan)
5. [User Interface & Experience](#user-interface--experience)
6. [Integration Points](#integration-points)
7. [AI Strategy](#ai-strategy)
8. [Security & Privacy](#security--privacy)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)
11. [Deployment Strategy](#deployment-strategy)
12. [Future Enhancements](#future-enhancements)
13. [Appendices](#appendices)

## Overview

### Purpose & Vision

S.A.G.E. (Skills Assessment & Growth Engine) is Pickle+'s integrated AI coaching system designed to provide personalized skill assessment and growth recommendations for pickleball players of all levels. It serves as both a standalone coaching tool and a complement to human coaching, analyzing performance across CourtIQ's five dimensions and delivering tailored advice to accelerate player development.

### Core Capabilities

- **Performance Analysis:** Analyze match data and technique to provide insights
- **Personalized Coaching:** Generate custom advice and training plans
- **Progress Tracking:** Monitor skill development over time
- **Mental Game Support:** Provide strategies for mental toughness and focus
- **Technical & Tactical Guidance:** Offer advice on strokes, positioning, and strategy
- **Emotional Intelligence:** Develop emotional awareness and regulation in competition

### Target Users

- Individual pickleball players seeking improvement
- Coaches who want to supplement their coaching
- Clubs and communities building training programs
- Tournament players preparing for competition

## System Architecture

### High-Level Architecture

S.A.G.E. follows our established four-layer architecture pattern:

1. **Database Layer:** Schema extensions for coaching data in PostgreSQL
2. **Server Layer:** API endpoints and AI processing services
3. **SDK Layer:** Type-safe client for coaching features
4. **UI Layer:** React components for coaching interface

### Component Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  User Interface │    │   SDK Layer     │    │  Server Layer   │
│                 │    │                 │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│ React Components│◄───│ Type-safe API   │◄───│ API Endpoints   │
│                 │    │   Clients       │    │                 │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │                 │
                                              │  Database Layer │
                                              │                 │
                                              └─────────────────┘
```

### Technology Stack

- **Frontend:** React, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Drizzle ORM
- **AI Processing:** Anthropic Claude API, local rule-based algorithms
- **State Management:** TanStack Query, React Context
- **Visualization:** Recharts, framer-motion

## Data Models

### Core Entities

#### CoachingSession
```typescript
// Database schema in shared/schema.ts
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionType: text("session_type").notNull(), // "match_analysis", "assessment", "training_plan"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // "active", "archived", "completed"
  metadata: jsonb("metadata").default({}).notNull(),
});

// Select and Insert types
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions);
```

#### CoachingInsight
```typescript
export const coachingInsights = pgTable("coaching_insights", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => coachingSessions.id),
  dimensionCode: text("dimension_code").notNull(), // "TECH", "TACT", "PHYS", "MENT", "CONS"
  insightType: text("insight_type").notNull(), // "strength", "weakness", "opportunity", "trend"
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: integer("priority").default(1).notNull(), // 1-5 with 5 being highest priority
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

// Select and Insert types
export type CoachingInsight = typeof coachingInsights.$inferSelect;
export type InsertCoachingInsight = typeof coachingInsights.$inferInsert;
export const insertCoachingInsightSchema = createInsertSchema(coachingInsights);
```

#### TrainingPlan
```typescript
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // "active", "completed", "paused", "archived"
  focusAreas: text("focus_areas").array().notNull(), // Array of dimension codes
  targetRatingImprovement: numeric("target_rating_improvement").default(0).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

// Select and Insert types
export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertTrainingPlan = typeof trainingPlans.$inferInsert;
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans);
```

#### TrainingActivity
```typescript
export const trainingActivities = pgTable("training_activities", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => trainingPlans.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dayNumber: integer("day_number").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  activityType: text("activity_type").notNull(), // "drill", "exercise", "study", "match", "rest"
  dimensionCode: text("dimension_code").notNull(), // Primary dimension this targets
  difficultyLevel: integer("difficulty_level").default(2).notNull(), // 1-5
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").default({}).notNull(),
});

// Select and Insert types
export type TrainingActivity = typeof trainingActivities.$inferSelect;
export type InsertTrainingActivity = typeof trainingActivities.$inferInsert;
export const insertTrainingActivitySchema = createInsertSchema(trainingActivities);
```

#### CoachingJournal
```typescript
export const coachingJournals = pgTable("coaching_journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  moodRating: integer("mood_rating"), // 1-5
  energyLevel: integer("energy_level"), // 1-5
  associatedMatchId: integer("associated_match_id").references(() => matches.id),
  tags: text("tags").array(),
  isPrivate: boolean("is_private").default(true).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

// Select and Insert types
export type CoachingJournal = typeof coachingJournals.$inferSelect;
export type InsertCoachingJournal = typeof coachingJournals.$inferInsert;
export const insertCoachingJournalSchema = createInsertSchema(coachingJournals);
```

### Entity Relationships

- **User** has many **CoachingSessions**
- **User** has many **TrainingPlans**
- **User** has many **CoachingJournals**
- **CoachingSession** has many **CoachingInsights**
- **TrainingPlan** has many **TrainingActivities**
- **Match** can be associated with **CoachingJournals**
- **CoachingSession** can be associated with **Match**

## Implementation Plan

The development will be executed in three distinct phases over 10 sprints (20 weeks):

### Phase 1: Foundation (Sprints 1-3)

#### Sprint 1: Core Infrastructure (PKL-278651-COACH-0001-CORE)
**Duration:** 2 weeks
**Objective:** Establish the basic infrastructure and data models

**Deliverables:**
- Database schema extensions
- Initial API endpoints
- Basic UI components
- Core service layer implementation
- Local rule-based analysis engine

**Technical Tasks:**
1. Create database schema for coaching entities
2. Implement storage interface extensions
3. Create API endpoints for coaching data
4. Implement SDK layer for client interaction
5. Build basic UI components
6. Create simple rule-based analysis engine

#### Sprint 2: Match Analysis (PKL-278651-COACH-0002-MATCH)
**Duration:** 2 weeks
**Objective:** Implement match analysis functionality

**Deliverables:**
- Match data processing pipeline
- Performance visualization components
- CourtIQ dimension analysis algorithms
- Basic strength/weakness identification

**Technical Tasks:**
1. Implement match data extraction and transformation
2. Create algorithms for dimension-specific analysis
3. Build visualization components for match insights
4. Implement post-match analysis workflow
5. Create rule-based recommendation engine

#### Sprint 3: Personalized Insights (PKL-278651-COACH-0003-INSIGHT)
**Duration:** 2 weeks
**Objective:** Create personalization layer for player-specific insights

**Deliverables:**
- Player profile analysis engine
- Historical data analysis
- Personalized recommendations
- Personal dashboard view

**Technical Tasks:**
1. Create player profile analysis algorithms
2. Implement historical trend analysis
3. Build recommendation prioritization system
4. Develop personal dashboard components
5. Implement player preferences and goals tracking

### Phase 2: Knowledge & Intelligence (Sprints 4-7)

#### Sprint 4: Training Plans (PKL-278651-COACH-0004-TRAIN)
**Duration:** 2 weeks
**Objective:** Build training plan generation and tracking

**Deliverables:**
- Training plan generation engine
- Exercise database
- Training plan UI
- Progress tracking features

#### Sprint 5: Advanced Analytics (PKL-278651-COACH-0005-ANALYTICS)
**Duration:** 2 weeks
**Objective:** Enhance analysis with advanced metrics

**Deliverables:**
- Trend analysis over time
- Comparative analysis with benchmarks
- Predictive performance modeling
- Advanced visualization components

#### Sprint 6: Mental Game (PKL-278651-COACH-0006-MENTAL)
**Duration:** 2 weeks
**Objective:** Implement mental toughness coaching features

**Deliverables:**
- Mental toughness assessment
- Emotional intelligence tracking
- Stress management techniques
- Mental game training exercises

#### Sprint 7: Strategy Library (PKL-278651-COACH-0007-STRATEGY)
**Duration:** 2 weeks
**Objective:** Build strategy recommendation system

**Deliverables:**
- Situational strategy recommendations
- Game plan generation
- Opponent analysis tools
- Strategy library database

### Phase 3: Social & Advanced Features (Sprints 8-10)

#### Sprint 8: Coach Integration (PKL-278651-COACH-0008-HUMAN)
**Duration:** 2 weeks
**Objective:** Enable human coach collaboration

**Deliverables:**
- Coach-player communication tools
- Shared analysis views
- Coach override capabilities
- Annotation and feedback system

#### Sprint 9: Journaling & Progress (PKL-278651-COACH-0009-JOURNAL)
**Duration:** 2 weeks
**Objective:** Implement journaling and reflective learning

**Deliverables:**
- Journaling interface
- Guided reflection prompts
- Progress visualization
- Goal setting and monitoring

#### Sprint 10: Community Learning (PKL-278651-COACH-0010-COMMUNITY)
**Duration:** 2 weeks
**Objective:** Add community and social features

**Deliverables:**
- Anonymous data pooling (opt-in)
- Community insights
- Peer learning recommendations
- Social sharing capabilities

## User Interface & Experience

### Design Principles

1. **Simplicity First**
   - Clean, uncluttered interfaces
   - Focus on the most important information
   - Progressive disclosure of complex details

2. **Conversational Interface**
   - Natural dialogue-like interactions
   - Friendly, approachable tone
   - Context-aware responses

3. **Visual Learning**
   - Emphasis on data visualization
   - Clear performance metrics
   - Visual skill mapping

4. **Emotional Intelligence**
   - Supportive and encouraging
   - Sensitivity to player needs
   - Adaptive to player emotional states

5. **Seamless Integration**
   - Consistent with Pickle+ design language
   - Natural extension of existing features
   - Contextual appearance in user flows

### Key UI Components

#### S.A.G.E. Dashboard
The central hub for coaching interactions featuring:
- Personal greeting with context-aware message
- Recent performance snapshot
- Quick access to insights and recommendations
- Progress tracking toward current goals
- Quick-action buttons for common tasks

#### Conversation Panel
A dialogue interface for interacting with S.A.G.E:
- Chat-like message thread
- Support for text and visual inputs
- Contextual memory of previous conversations
- Suggested questions/prompts
- Quick response options

#### Insight Cards
Visual summaries of key insights:
- Clean, focused presentation
- Actionable recommendations
- "Learn more" expansions
- Easy sharing options
- Visual indicators of importance

#### CourtIQ Visualization
Interactive visualization of the five CourtIQ dimensions:
- Radar chart showing current ratings
- Historical trend lines
- Benchmark comparisons
- Highlighting areas of strength and opportunity
- Drill-down capabilities for detailed analysis

#### Training Plan Interface
Calendar and list views of recommended training:
- Daily/weekly/monthly views
- Interactive exercise demonstrations
- Completion tracking
- Adaptive difficulty settings
- Integration with calendar apps

#### Journaling Component
Reflective journaling interface:
- Guided reflection prompts
- Mood and energy tracking
- Media attachment support
- Privacy controls
- Timeline visualization

### User Flows

#### Match Analysis Flow
1. Player completes a match
2. S.A.G.E. prompts for match details
3. System analyzes performance
4. Player receives insight cards
5. Player can drill down into specific areas
6. System suggests next steps and training focus

#### Training Session Flow
1. Player accesses daily training plan
2. System provides detailed instructions
3. Player completes activities
4. Player logs results and reflections
5. System updates training plan based on results
6. Player sees progress visualization

#### Coaching Integration Flow
1. Player shares S.A.G.E. insights with coach
2. Coach reviews and adds comments
3. Coach adjusts recommendations
4. Player receives integrated advice
5. Player and coach track progress together

### Mobile-First Approach

- All interfaces designed for mobile use first
- Touch-optimized controls
- Offline functionality for training plans
- Quick-capture for post-match reflections
- Responsive layouts for all screen sizes

### Accessibility Features

- High contrast mode
- Screen reader compatibility
- Adjustable text sizing
- Alternative input methods
- Keyboard navigation support

## Integration Points

### Integration with Existing Pickle+ Features

#### User System
- Leverages existing authentication and profile data
- Integrates with user preferences
- Respects privacy settings
- Works with role-based permissions

#### Match System
- Pulls data from recorded matches
- Enhances match history with insights
- Provides post-match analysis
- Integrates with match validation

#### CourtIQ Ratings
- Uses and enhances CourtIQ dimension data
- Provides deeper insights into dimension ratings
- Suggests focused improvements for dimensions
- Tracks dimension progress over time

#### Tournaments
- Provides tournament preparation advice
- Offers post-tournament analysis
- Suggests training plans based on tournament schedule
- Integrates with tournament-specific goals

#### Community Features
- Integrates with community groups for shared insights
- Provides community-level analytics (anonymized)
- Enables coach-student relationships
- Supports community challenges

### External System Integration

#### Calendar Integration
- Export training plans to calendar applications
- Send reminders for scheduled activities
- Track completion through calendar events

#### Video Analysis (Future)
- Integration with video recording tools
- Timestamped analysis of technique
- Comparison with model examples

## AI Strategy

### Approach

S.A.G.E. will leverage anthropic Claude AI and rule-based algorithms for cognitive functions:

1. **Anthropic Claude API:**
   - Natural language processing
   - Pattern recognition in player data
   - Personalized content generation
   - Complex analysis and recommendations

2. **Rule-Based Systems:**
   - Core analysis algorithms
   - Dimension-specific evaluations
   - Training plan templates
   - Initial data processing

### Data Flow & Processing

1. **Data Collection:**
   - Match results and statistics
   - User profiles and preferences
   - Historical performance data
   - Player-provided context

2. **Data Preprocessing:**
   - Normalization of metrics
   - Feature extraction
   - Pattern identification
   - Anomaly detection

3. **Analysis Processing:**
   - Dimension-specific algorithms
   - Comparative benchmarking
   - Trend analysis
   - Performance modeling

4. **Insight Generation:**
   - Strength/weakness identification
   - Opportunity recognition
   - Personalized recommendations
   - Progress tracking

5. **Natural Language Generation:**
   - Context-aware coaching advice
   - Personalized training instructions
   - Motivational messaging
   - Explanatory content

### Claude API Integration

The Anthropic Claude API will be integrated through a secure, managed service:

```typescript
// server/services/aiService.ts
import Anthropic from '@anthropic-ai/sdk';
import { type AIServiceResponse } from '../types';

// Use environment variables for API configuration
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCoachingInsights(
  playerData: PlayerAnalysisData
): Promise<AIServiceResponse> {
  try {
    // Construct the prompt with context from player data
    const prompt = constructPlayerInsightPrompt(playerData);
    
    // Call the Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user", 
          content: prompt
        }
      ],
      system: "You are SAGE (Skills Assessment & Growth Engine), an AI coaching assistant specialized in pickleball. Provide clear, actionable insights based on match data. Focus on constructive feedback and specific improvement suggestions."
    });
    
    // Process and structure the response
    return processAIResponse(response);
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to rule-based insights if AI fails
    return generateFallbackInsights(playerData);
  }
}
```

### Fallback Mechanisms

When AI services are unavailable:
- Local rule-based analysis provides core functionality
- Pre-generated templates offer basic advice
- Cached insights remain available
- System transparently communicates AI limitations

## Security & Privacy

### Data Protection

- All coaching data stored securely following data protection standards
- End-to-end encryption for sensitive player information
- Regular security audits and vulnerability testing
- Compliance with relevant data protection regulations

### Privacy Controls

- Players have full control over what data is used and shared
- Granular privacy settings for different data types
- Opt-in required for community data pooling
- Data anonymization for aggregate analysis

### Access Management

- Role-based access controls for coaching data
- Explicit permission required for coach access
- Audit trails for all data access
- Time-limited access tokens for shared insights

## Testing Strategy

### Unit Testing

- Component-level tests for UI elements
- Function-level tests for analysis algorithms
- Mock testing for AI service integration
- Data transformation testing

### Integration Testing

- End-to-end workflow testing
- API integration tests
- Cross-module functionality testing
- Database interaction testing

### User Testing

- Alpha testing with internal team
- Beta testing with selected players
- A/B testing of UI variations
- Usability testing with varying skill levels

### Performance Testing

- Response time benchmarking
- Load testing for concurrent users
- Mobile performance testing
- Offline capability testing

## Performance Considerations

### Optimization Strategies

- Client-side caching of coaching data
- Progressive loading of heavy content
- Lazy loading of visualization components
- Background processing of intensive calculations

### Mobile Performance

- Optimized asset sizes
- Reduced network requests
- Battery-efficient processing
- Offline-first architecture

### Scalability

- Horizontal scaling of AI processing
- Database query optimization
- Content delivery optimization
- Caching at multiple layers

## Deployment Strategy

S.A.G.E. will follow a phased deployment approach:

### Alpha Release (Week 6)
- Internal team testing
- Core functionality only
- Continuous feedback loop
- Rapid iteration

### Beta Program (Week 14)
- Selected group of players
- Extended feature set
- Structured feedback collection
- Performance monitoring

### General Availability (Week 20)
- Full feature rollout
- Community enablement
- Marketing campaign
- Support infrastructure

### Monitoring & Maintenance

- User engagement tracking
- Error rate monitoring
- Performance metrics
- User feedback collection
- Regular feature enhancements

## Future Enhancements

### Phase 2 Enhancements (Post-Launch)

- **Video Analysis:** Integration with video recording for technique analysis
- **Voice Interface:** Voice command support for hands-free coaching
- **Advanced Visualization:** 3D modeling of technique and movement
- **Predictive Analytics:** Forecasting of rating improvements
- **Team Coaching:** Support for team and doubles-specific coaching

### Phase 3 Enhancements (Long-Term)

- **AR Integration:** Augmented reality training guides
- **Professional Coaching Tools:** Advanced features for certified coaches
- **Tournament Performance Prediction:** AI-driven tournament outcome modeling
- **Cross-Sport Insights:** Transfer learning from related racquet sports
- **Venue-Specific Strategies:** Environmental adaptations for different courts

## Appendices

### Appendix A: CourtIQ Dimension Definitions

| Dimension Code | Name | Description |
|----------------|------|-------------|
| TECH | Technical Skills | Shot execution, form, mechanics |
| TACT | Tactical Awareness | Court positioning, shot selection, strategy |
| PHYS | Physical Fitness | Agility, speed, endurance, power |
| MENT | Mental Toughness | Focus, resilience, competitive mindset |
| CONS | Consistency | Shot reliability, error reduction, repeatability |

### Appendix B: Prompt Templates

This appendix contains templates for Claude AI prompts used in different coaching scenarios.

#### Match Analysis Prompt Template
```
System: You are SAGE (Skills Assessment & Growth Engine), an AI coaching assistant specialized in pickleball. Analyze the provided match data objectively. Focus on identifying 3 strengths and 3 areas for improvement. Provide specific, actionable advice that can be implemented immediately. Use a supportive, encouraging tone.

User: Please analyze this match data:
Player: {{playerName}}
Match date: {{matchDate}}
Format: {{matchFormat}}
Result: {{matchResult}}
Score: {{matchScore}}
Key statistics:
- First serve percentage: {{firstServePercentage}}
- Winners: {{winners}}
- Unforced errors: {{unforcedErrors}}
- Third shot success rate: {{thirdShotSuccessRate}}
- Dink rallies won: {{dinkRalliesWon}}
- Points at net: {{pointsAtNet}}
Player notes: {{playerNotes}}

CourtIQ dimension self-ratings:
- Technical: {{techRating}}
- Tactical: {{tactRating}}
- Physical: {{physRating}}
- Mental: {{mentRating}}
- Consistency: {{consRating}}

Please provide analysis focused on these dimensions, with specific improvement suggestions.
```

#### Training Plan Generation Prompt
```
System: You are SAGE (Skills Assessment & Growth Engine), an AI coaching assistant specialized in pickleball. Create a structured training plan based on the player's profile, goals, and available time. Focus on exercises that target their specific development needs. Ensure the plan is progressive, balanced across dimensions, and includes variety to maintain engagement.

User: Please create a {{duration}}-week training plan for:
Player: {{playerName}}
Skill level: {{skillLevel}}
Available training time: {{availableTime}} hours per week
Primary goals: {{primaryGoals}}
Upcoming tournaments: {{upcomingTournaments}}
Physical limitations: {{physicalLimitations}}
Equipment available: {{availableEquipment}}
Training environment: {{trainingEnvironment}}

CourtIQ dimension current ratings:
- Technical: {{techRating}}
- Tactical: {{tactRating}}
- Physical: {{physRating}}
- Mental: {{mentRating}}
- Consistency: {{consRating}}

Focus areas from recent matches: {{recentFocusAreas}}

Please provide a structured plan with specific exercises for each week, progression metrics, and modification options.
```

### Appendix C: UI Wireframes

[This section would contain wireframe images for key UI components]

### Appendix D: Example Analysis Outputs

[This section would contain example outputs from the system]

### Appendix E: Glossary of Terms

| Term | Definition |
|------|------------|
| CourtIQ | Pickle+'s proprietary 5-dimension rating system |
| Dimension | One of the five skill categories in CourtIQ |
| Insight | A specific observation about performance |
| Training Plan | A structured program of exercises and activities |
| Training Activity | A specific exercise within a training plan |
| Coaching Session | An interaction with S.A.G.E. for advice or analysis |
| Journal Entry | A player's reflection on their performance or progress |