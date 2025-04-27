# PickleJourney™ Implementation Plan: Framework 5.3 Frontend-First Approach

## Overview

PickleJourney™ is an emotionally intelligent journaling system integrated into the Pickle+ platform that adapts based on a player's emotional state, match results, and development journey. It provides contextual support and growth insights through a frontend-first approach that minimizes database polling and optimizes performance.

## Core Principles

- **Frontend-First Logic**: Primary emotional detection and response happens client-side
- **Minimal Database Polling**: Cache aggressively and sync intelligently
- **Emotional Intelligence**: System adapts to detected emotional states
- **Framework 5.3 Compliance**: Maintain reasonable complexity with clear module boundaries
- **Progressive Enhancement**: Core functionality works offline, enhanced when online

## Sprint Plan

### PKL-278651-JOUR-001: PickleJourney™ Foundation (4 weeks)
**Goal:** Establish frontend emotion detection and client-side journaling with local storage first

#### PKL-278651-JOUR-001.1: Frontend Emotion Detection Module
- Develop interaction pattern analysis (click speed, session dynamics)
- Implement text sentiment analysis in the browser
- Create self-reporting emotional UI components
- Establish emotional state categorization system (5 primary states)

#### PKL-278651-JOUR-001.2: Local-First Journaling System
- Build IndexedDB storage for offline-first journal entries
- Develop emotion-specific journal templates (rendered client-side)
- Create background synchronization service for eventual consistency
- Implement frontend validation and rich text editing

#### PKL-278651-JOUR-001.3: Frontend Emotional Growth Framework
- Build client-side visualization of emotional patterns
- Create local goal-setting and tracking interface
- Develop emotional growth metrics calculated in browser
- Implement periodic server synchronization with delta updates

### PKL-278651-JOUR-002: Dashboard Evolution (3 weeks)
**Goal:** Implement adaptive UI based on frontend-detected emotional states

#### PKL-278651-JOUR-002.1: Frontend-Rendered Adaptive Dashboard
- Create emotion-aware dashboard component system
- Implement context-dependent journal prompts based on client state
- Develop timeline visualization with cached data and progressive enhancement
- Build relevance algorithms for surfacing past journal entries

#### PKL-278651-JOUR-002.2: Client-Side UI Adaptation
- Create CSS theme system that responds to emotional state
- Build component library with emotional variants
- Implement layout reorganization based on emotional context
- Develop pre-loading strategy for emotional support content

### PKL-278651-JOUR-003: Emotional Intelligence & Advanced Features (4 weeks)
**Goal:** Develop client-side emotional analysis with periodic syncing to database

#### PKL-278651-JOUR-003.1: Client-Side SAGE Analysis
- Implement browser-based natural language processing for journal entries
- Develop thought pattern recognition algorithms
- Create real-time emotional insight generation as user types
- Build response generation for detected negative patterns

#### PKL-278651-JOUR-003.2: Frontend Emotion Visualization
- Create interactive emotion journey visualizations
- Develop correlation analysis between performance and emotions
- Implement trigger identification from journal language
- Build optimal performance zone visualization

### PKL-278651-COACH-001: Coaching Ecosystem Foundation (4 weeks)
**Goal:** Create frontend coaching profile system with local caching

#### PKL-278651-COACH-001.1: Frontend Coaching Profile System
- Build rich profile editor with local preview
- Implement client-side matching algorithm between coaches and students
- Create availability calendar with offline support
- Develop emotional approach specification interface

#### PKL-278651-COACH-001.2: Frontend Emotional Intelligence Assessment
- Create interactive assessment with client-side scoring
- Implement real-time visualization of results
- Build recommendation engine based on assessment results
- Develop coach-student compatibility metrics

### PKL-278651-COACH-002: Enhanced Coaching Tools (3 weeks)
**Goal:** Implement browser-based coaching tools with optimized data transfer

#### PKL-278651-COACH-002.1: Browser-Based Coaching Tools
- Create interactive court diagram editor with WebGL
- Implement client-side video annotation without full uploads
- Build emotion tagging system for video moments
- Develop shared whiteboard functionality with minimal data transfer

#### PKL-278651-COACH-002.2: Offline-Capable Resource Library
- Implement progressive web app caching for resources
- Create indexed search of local coaching materials
- Build version management for synchronized resources
- Develop prioritized downloading based on relevance

### PKL-278651-INTEG-001: Integration & Optimization (2 weeks)
**Goal:** Optimize performance and ensure seamless frontend-backend synchronization

#### PKL-278651-INTEG-001.1: Frontend-Backend Synchronization
- Implement intelligent delta updates to minimize transfer
- Create conflict resolution system for offline changes
- Build background synchronization service
- Develop prioritization algorithm for sync queue

#### PKL-278651-INTEG-001.2: Performance Optimization
- Implement code-splitting for emotion analysis modules
- Create intelligent preloading based on emotional state
- Optimize rendering of complex visualizations
- Develop lazy-loading strategy for emotional support content

## Technical Implementation Details

### Emotion Detection & Classification

The system will detect emotional states through:

1. **Interaction Patterns**
   - Speed of clicks and scrolls
   - Hesitation on certain elements
   - Session length and navigation patterns
   - Input force (on supported devices)

2. **Text Analysis**
   - Sentiment analysis of journal text
   - Emotion-indicating keywords and phrases
   - Writing pace and correction patterns
   - Use of capitalization, punctuation, deletion

3. **Self-Reporting**
   - Simple mood selection UI
   - Emoji-based quick reporting
   - Contextual prompts after key events

Emotional states will be classified into a 5-category system:
- **Frustrated/Disappointed** (After losses, during plateaus)
- **Anxious/Uncertain** (Before important matches, when trying new techniques)
- **Neutral/Focused** (Default state, analytical mode)
- **Excited/Proud** (After wins, when achieving goals)
- **Determined/Growth-Oriented** (When setting goals, reviewing progress)

### Client-Side Data Architecture

The frontend-first approach will utilize:

1. **IndexedDB Storage**
   - Journal entries with full text and metadata
   - Emotional state history
   - Match-emotion correlations
   - Templates and prompts library

2. **React Context for Emotional State**
   - Current detected emotional state
   - Historical emotional transitions
   - UI adaptation preferences
   - Temporary emotional override

3. **Optimistic UI Updates**
   - All journal entries appear instantly in UI
   - Background synchronization with server
   - Conflict resolution favoring client changes
   - Sync status indicators

### Adaptations Based on Emotional State

For each emotional state, the system will adapt:

**Frustrated/Disappointed:**
- Soothing color scheme (blues, soft greens)
- Emphasis on journey visualization over current stats
- Supportive, perspective-building journal prompts
- Surfacing of past challenge-overcoming entries

**Anxious/Uncertain:**
- Calming, simple UI with reduced options
- Grounding journal prompts focusing on strengths
- Quick-access to proven techniques and past successes
- Simplified, confidence-building visualizations

**Neutral/Focused:**
- Standard UI with full feature access
- Balanced analytical and emotional prompts
- Comprehensive data visualizations
- Equal emphasis on strengths and growth areas

**Excited/Proud:**
- Celebratory but balanced UI elements
- Journal prompts that capture positive feelings while maintaining humility
- Visualizations connecting current success to journey
- Social sharing options (where appropriate)

**Determined/Growth-Oriented:**
- Progress-focused UI elements
- Structured goal-setting journal templates
- Detailed skill breakdown visualizations
- Clear next-steps and development path

## Post-Match Emotional Processing

A special focus will be placed on post-match emotional processing:

1. **Loss Detection**
   - Client detects match loss through app activity
   - Analyzes match data for context (close match, blowout, important event)
   - Identifies current and historical emotional patterns after losses

2. **Immediate Support**
   - UI shifts to supportive mode before full database sync
   - Pre-loaded supportive prompts appear based on loss context
   - Journey visualization emphasizes growth over time
   - Relevant past entries about overcoming challenges surfaced

3. **Reflective Growth**
   - Structured journal prompts that acknowledge emotion first
   - Technical analysis only after emotional processing
   - Connection to previous similar situations and outcomes
   - Forward-looking closing prompts

## Database Schema (Minimalist Approach)

The backend will support the frontend-first approach with a minimal schema:

```typescript
// Emotional Journal Entries
const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  emotionalState: varchar('emotional_state', { length: 50 }),
  matchId: integer('match_id').references(() => matches.id),
  templateId: integer('template_id').references(() => journalTemplates.id),
  tags: text('tags').array(),
  isPrivate: boolean('is_private').default(true),
  lastEditedAt: timestamp('last_edited_at'),
  metrics: jsonb('metrics'),
});

// Journal Templates
const journalTemplates = pgTable('journal_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  emotionalState: varchar('emotional_state', { length: 50 }),
  scenario: varchar('scenario', { length: 100 }),
  template: text('template').notNull(),
  promptQuestions: text('prompt_questions').array(),
  isSystem: boolean('is_system').default(false),
  creatorId: integer('creator_id').references(() => users.id),
});

// Emotional Growth Metrics
const emotionalGrowthMetrics = pgTable('emotional_growth_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  score: integer('score').notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  notes: text('notes'),
});
```

## Integration with Existing Systems

The PickleJourney™ system will integrate with:

1. **Match History System**
   - Match results trigger contextual journal prompts
   - Emotional responses linked to match statistics
   - Performance analysis includes emotional context

2. **CourtIQ Rating System**
   - Mental toughness dimension directly informed by emotional intelligence
   - Visualization shows connection between emotional growth and rating
   - Emotional patterns correlated with performance metrics

3. **SAGE AI Assistant**
   - SAGE analyzes journal content for insights
   - Provides emotionally intelligent responses
   - Surfaces relevant past experiences
   - Connects emotional patterns to technical advice

4. **Coaching Ecosystem**
   - Coaches gain insight into student emotional patterns
   - Shared journal entries facilitate focused development
   - Emotional intelligence becomes explicit teaching dimension

## First Deliverable: Frontend Emotional Detection Module

The first technical implementation will be the Frontend Emotional Detection Module (PKL-278651-JOUR-001.1), consisting of:

```tsx
// src/modules/picklejourney/hooks/useEmotionDetection.ts
import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type EmotionalState = 
  | 'frustrated-disappointed' 
  | 'anxious-uncertain' 
  | 'neutral-focused'
  | 'excited-proud' 
  | 'determined-growth';

interface InteractionMetrics {
  clickInterval: number[];
  hesitations: number;
  deletionRate: number;
  sessionDuration: number;
  pageTransitions: number;
}

interface TextMetrics {
  sentiment: number;
  emotionKeywords: Record<string, number>;
  capitalization: number;
  punctuationIntensity: number;
}

export function useEmotionDetection() {
  const [currentEmotionalState, setCurrentEmotionalState] = 
    useState<EmotionalState>('neutral-focused');
  const [reportedState, setReportedState] = 
    useLocalStorage<EmotionalState | null>('user-reported-emotion', null);
  const [interactionMetrics, setInteractionMetrics] = 
    useState<InteractionMetrics>({
      clickInterval: [],
      hesitations: 0,
      deletionRate: 0,
      sessionDuration: 0,
      pageTransitions: 0,
    });
  
  const lastClickTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());
  
  // Track user interactions
  useEffect(() => {
    const trackClicks = () => {
      const now = Date.now();
      const interval = now - lastClickTime.current;
      lastClickTime.current = now;
      
      setInteractionMetrics(prev => ({
        ...prev,
        clickInterval: [...prev.clickInterval.slice(-10), interval],
      }));
    };
    
    const trackKeyDeletes = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        setInteractionMetrics(prev => ({
          ...prev,
          deletionRate: prev.deletionRate + 1,
        }));
      }
    };
    
    const updateSessionMetrics = () => {
      setInteractionMetrics(prev => ({
        ...prev,
        sessionDuration: (Date.now() - sessionStartTime.current) / 1000,
      }));
    };
    
    window.addEventListener('click', trackClicks);
    window.addEventListener('keydown', trackKeyDeletes);
    const intervalId = setInterval(updateSessionMetrics, 5000);
    
    return () => {
      window.removeEventListener('click', trackClicks);
      window.removeEventListener('keydown', trackKeyDeletes);
      clearInterval(intervalId);
    };
  }, []);
  
  // Analyze text for emotional content
  const analyzeText = (text: string): TextMetrics => {
    // Simple sentiment analysis (would be more sophisticated in production)
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'proud', 'excited'];
    const negativeWords = ['bad', 'poor', 'frustrated', 'disappointed', 'angry', 'upset'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    const emotionKeywords: Record<string, number> = {};
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
      
      // Count emotion keywords
      if ([...positiveWords, ...negativeWords].includes(word)) {
        emotionKeywords[word] = (emotionKeywords[word] || 0) + 1;
      }
    });
    
    const sentiment = words.length > 0 
      ? (positiveCount - negativeCount) / words.length
      : 0;
    
    // Analyze capitalization and punctuation
    const capitalization = 
      (text.match(/[A-Z]/g)?.length || 0) / (text.match(/[a-zA-Z]/g)?.length || 1);
    
    const punctuationIntensity = 
      (text.match(/[!?.]/g)?.length || 0) / (text.split(/[.!?]/g).length || 1);
    
    return {
      sentiment,
      emotionKeywords,
      capitalization,
      punctuationIntensity,
    };
  };
  
  // Determine emotional state from metrics and user reporting
  const determineEmotionalState = (
    interaction: InteractionMetrics,
    text: TextMetrics | null,
    userReported: EmotionalState | null,
    matchResult: 'win' | 'loss' | null
  ): EmotionalState => {
    // Prioritize user-reported state if available
    if (userReported) return userReported;
    
    // Factor in recent match result if available
    if (matchResult === 'loss') {
      return 'frustrated-disappointed';
    } else if (matchResult === 'win') {
      return 'excited-proud';
    }
    
    // Analyze interaction patterns
    const avgClickInterval = interaction.clickInterval.length > 0
      ? interaction.clickInterval.reduce((sum, val) => sum + val, 0) / interaction.clickInterval.length
      : 1000;
    
    // Fast clicking often indicates frustration
    if (avgClickInterval < 400 && interaction.clickInterval.length > 5) {
      return 'frustrated-disappointed';
    }
    
    // High deletion rate may indicate uncertainty
    if (interaction.deletionRate > 10) {
      return 'anxious-uncertain';
    }
    
    // Use text sentiment if available
    if (text) {
      if (text.sentiment > 0.2) return 'excited-proud';
      if (text.sentiment < -0.2) return 'frustrated-disappointed';
      
      // High punctuation intensity with neutral/positive sentiment often
      // indicates determination
      if (text.punctuationIntensity > 1.5 && text.sentiment >= 0) {
        return 'determined-growth';
      }
    }
    
    // Default state
    return 'neutral-focused';
  };
  
  // Process journal text
  const processJournalText = (text: string) => {
    const textMetrics = analyzeText(text);
    // This would sync with server in complete implementation
    return textMetrics;
  };
  
  // Update emotional state based on match result
  const processMatchResult = (result: 'win' | 'loss') => {
    const newState = result === 'win' ? 'excited-proud' : 'frustrated-disappointed';
    setCurrentEmotionalState(newState);
    // This would sync with server in complete implementation
  };
  
  // Allow user to manually report emotional state
  const reportEmotionalState = (state: EmotionalState) => {
    setReportedState(state);
    setCurrentEmotionalState(state);
    // This would sync with server in complete implementation
  };
  
  return {
    currentEmotionalState,
    reportEmotionalState,
    processJournalText,
    processMatchResult,
    // Expose detection internals for debugging in development
    DEBUG: {
      interactionMetrics,
      analyzeText,
    },
  };
}
```

This core module establishes the foundation for the entire emotionally intelligent journaling system, following Framework 5.3 principles of frontend-first logic and reasonable complexity.

## Next Steps After Approval

Upon approval of this implementation plan, we will:

1. Begin development of the Frontend Emotion Detection Module (PKL-278651-JOUR-001.1)
2. Create UI components for emotion self-reporting
3. Design the journal entry templates for different emotional states
4. Implement the local-first storage system with IndexedDB
5. Begin frontend visualization of emotional journey timelines

All work will follow Framework 5.3 guidelines, maintaining frontend-first logic and reasonable complexity while delivering a powerful, emotionally intelligent journaling experience.