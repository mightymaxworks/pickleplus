# S.A.G.E. Sprint 1 Implementation Plan
**Skills Assessment & Growth Engine**

**Sprint ID:** PKL-278651-COACH-0001-CORE  
**Duration:** 2 weeks  
**Framework:** Pickle+ Development Framework 5.3  
**Date:** April 24, 2025  

## Overview

This document outlines the implementation plan for Sprint 1 of the S.A.G.E. (Skills Assessment & Growth Engine) AI coaching system. This sprint focuses on establishing the core infrastructure and basic functionality that will serve as the foundation for future development.

## Sprint Objectives

1. Create the database schema for coaching data
2. Implement the server-side API endpoints
3. Build the client-side SDK interfaces
4. Develop basic UI components
5. Implement a local rule-based analysis engine
6. Integrate with existing user and match systems

## Implementation Details

### 1. Database Schema (shared/schema.ts)

#### A. Create Coaching Session Model

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

#### B. Create Coaching Insight Model

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

### 2. Server Storage Interface (server/storage.ts)

```typescript
// Add to IStorage interface
export interface IStorage {
  // Existing methods...
  
  // Coaching Session methods
  createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession>;
  getCoachingSession(id: number): Promise<CoachingSession | undefined>;
  getCoachingSessionsByUserId(userId: number): Promise<CoachingSession[]>;
  updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession>;
  
  // Coaching Insight methods
  createCoachingInsight(data: InsertCoachingInsight): Promise<CoachingInsight>;
  getCoachingInsightsBySessionId(sessionId: number): Promise<CoachingInsight[]>;
  getCoachingInsightsByUserId(userId: number): Promise<CoachingInsight[]>;
  updateCoachingInsight(id: number, data: Partial<InsertCoachingInsight>): Promise<CoachingInsight>;
}

// Implementation in DatabaseStorage class
export class DatabaseStorage implements IStorage {
  // Existing methods...
  
  // Coaching Session methods
  async createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession> {
    const [session] = await db
      .insert(coachingSessions)
      .values(data)
      .returning();
    return session;
  }
  
  async getCoachingSession(id: number): Promise<CoachingSession | undefined> {
    const [session] = await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, id));
    return session;
  }
  
  async getCoachingSessionsByUserId(userId: number): Promise<CoachingSession[]> {
    return db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt));
  }
  
  async updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession> {
    const [session] = await db
      .update(coachingSessions)
      .set({...data, updatedAt: new Date()})
      .where(eq(coachingSessions.id, id))
      .returning();
    return session;
  }
  
  // Coaching Insight methods
  async createCoachingInsight(data: InsertCoachingInsight): Promise<CoachingInsight> {
    const [insight] = await db
      .insert(coachingInsights)
      .values(data)
      .returning();
    return insight;
  }
  
  async getCoachingInsightsBySessionId(sessionId: number): Promise<CoachingInsight[]> {
    return db
      .select()
      .from(coachingInsights)
      .where(eq(coachingInsights.sessionId, sessionId))
      .orderBy(desc(coachingInsights.priority));
  }
  
  async getCoachingInsightsByUserId(userId: number): Promise<CoachingInsight[]> {
    return db
      .select()
      .from(coachingInsights)
      .innerJoin(coachingSessions, eq(coachingInsights.sessionId, coachingSessions.id))
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt));
  }
  
  async updateCoachingInsight(id: number, data: Partial<InsertCoachingInsight>): Promise<CoachingInsight> {
    const [insight] = await db
      .update(coachingInsights)
      .set(data)
      .where(eq(coachingInsights.id, id))
      .returning();
    return insight;
  }
}
```

### 3. API Endpoints (server/routes/coach-routes.ts)

```typescript
/**
 * PKL-278651-COACH-0001-API
 * S.A.G.E. API Routes
 * 
 * This file defines the API routes for the S.A.G.E. (Skills Assessment & Growth Engine) feature.
 * It contains endpoints for creating coaching sessions, getting insights, and managing training plans.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { 
  createCoachingSessionHandler,
  getCoachingSessionHandler,
  getCoachingSessionsHandler,
  getCoachingInsightsHandler,
  getMatchAnalysisHandler,
  generateTrainingPlanHandler
} from '../services/sageCoachService';

const router = Router();

/**
 * @route   POST /api/sage/sessions
 * @desc    Create a new coaching session
 * @access  Private
 */
router.post('/sessions', isAuthenticated, createCoachingSessionHandler);

/**
 * @route   GET /api/sage/sessions/:id
 * @desc    Get a coaching session by ID
 * @access  Private
 */
router.get('/sessions/:id', isAuthenticated, getCoachingSessionHandler);

/**
 * @route   GET /api/sage/sessions
 * @desc    Get coaching sessions for the current user
 * @access  Private
 */
router.get('/sessions', isAuthenticated, getCoachingSessionsHandler);

/**
 * @route   GET /api/sage/insights/session/:sessionId
 * @desc    Get insights for a specific coaching session
 * @access  Private
 */
router.get('/insights/session/:sessionId', isAuthenticated, getCoachingInsightsHandler);

/**
 * @route   GET /api/sage/insights/match/:matchId
 * @desc    Get match analysis insights
 * @access  Private
 */
router.get('/insights/match/:matchId', isAuthenticated, getMatchAnalysisHandler);

/**
 * @route   POST /api/sage/training-plans
 * @desc    Generate a training plan
 * @access  Private
 */
router.post('/training-plans', isAuthenticated, generateTrainingPlanHandler);

export default router;
```

### 4. Server Services (server/services/sageCoachService.ts)

```typescript
/**
 * PKL-278651-COACH-0001-SERVICE
 * S.A.G.E. Coaching Service
 * 
 * This service provides AI-powered coaching functionality using the Anthropic Claude API
 * and rule-based algorithms. It generates insights, provides match analysis, and creates
 * training plans.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { InsertCoachingSession, InsertCoachingInsight } from '@shared/schema';
import { generateCoachingInsights } from './aiService';
import { analyzeMatchPerformance } from './matchAnalysisService';

// Simple logger for coaching service
const logger = {
  info: (message: string) => console.log(`[SAGE] ${message}`),
  warn: (message: string) => console.warn(`[SAGE] ${message}`),
  error: (message: string, err?: any) => console.error(`[SAGE] ${message}`, err || '')
};

/**
 * Create a new coaching session
 */
export async function createCoachingSessionHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const sessionData: InsertCoachingSession = {
      userId,
      sessionType: req.body.sessionType,
      metadata: req.body.metadata || {}
    };
    
    const session = await storage.createCoachingSession(sessionData);
    return res.status(201).json(session);
  } catch (error) {
    logger.error('Failed to create coaching session', error);
    return res.status(500).json({ error: 'Failed to create coaching session' });
  }
}

/**
 * Get a coaching session by ID
 */
export async function getCoachingSessionHandler(req: Request, res: Response) {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    const session = await storage.getCoachingSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Coaching session not found' });
    }
    
    // Verify user has access to this session
    if (session.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to access this session' });
    }
    
    return res.json(session);
  } catch (error) {
    logger.error('Failed to get coaching session', error);
    return res.status(500).json({ error: 'Failed to get coaching session' });
  }
}

/**
 * Get coaching sessions for the current user
 */
export async function getCoachingSessionsHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const sessions = await storage.getCoachingSessionsByUserId(userId);
    return res.json(sessions);
  } catch (error) {
    logger.error('Failed to get coaching sessions', error);
    return res.status(500).json({ error: 'Failed to get coaching sessions' });
  }
}

/**
 * Get insights for a specific coaching session
 */
export async function getCoachingInsightsHandler(req: Request, res: Response) {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Verify session exists and belongs to user
    const session = await storage.getCoachingSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Coaching session not found' });
    }
    
    if (session.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to access this session' });
    }
    
    const insights = await storage.getCoachingInsightsBySessionId(sessionId);
    return res.json(insights);
  } catch (error) {
    logger.error('Failed to get coaching insights', error);
    return res.status(500).json({ error: 'Failed to get coaching insights' });
  }
}

/**
 * Get match analysis insights
 */
export async function getMatchAnalysisHandler(req: Request, res: Response) {
  try {
    const matchId = parseInt(req.params.matchId);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    // Get the match data
    const match = await storage.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify user participated in the match
    const userParticipated = match.players.some(p => p.userId === req.user?.id);
    if (!userParticipated) {
      return res.status(403).json({ error: 'Not authorized to access this match' });
    }
    
    // Create a coaching session for this analysis
    const sessionData: InsertCoachingSession = {
      userId: req.user?.id,
      sessionType: 'match_analysis',
      metadata: { matchId }
    };
    const session = await storage.createCoachingSession(sessionData);
    
    // Analyze the match using rule-based algorithm
    const analysis = await analyzeMatchPerformance(match, req.user);
    
    // Create insights from the analysis
    const insights: InsertCoachingInsight[] = [];
    for (const item of analysis.items) {
      insights.push({
        sessionId: session.id,
        dimensionCode: item.dimensionCode,
        insightType: item.type,
        title: item.title,
        description: item.description,
        priority: item.priority
      });
    }
    
    // Save the insights to the database
    const savedInsights = [];
    for (const insight of insights) {
      savedInsights.push(await storage.createCoachingInsight(insight));
    }
    
    return res.json({
      session,
      insights: savedInsights,
      summary: analysis.summary
    });
  } catch (error) {
    logger.error('Failed to get match analysis', error);
    return res.status(500).json({ error: 'Failed to analyze match' });
  }
}

/**
 * Generate a training plan
 */
export async function generateTrainingPlanHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Create a coaching session for this training plan
    const sessionData: InsertCoachingSession = {
      userId,
      sessionType: 'training_plan',
      metadata: req.body
    };
    const session = await storage.createCoachingSession(sessionData);
    
    // Generate a basic training plan based on request data
    // In Sprint 1, this will be rule-based only
    const insights = generateBasicTrainingPlan(req.body, req.user);
    
    // Save the insights to the database
    const savedInsights = [];
    for (const insight of insights) {
      const insightData: InsertCoachingInsight = {
        sessionId: session.id,
        dimensionCode: insight.dimensionCode,
        insightType: 'recommendation',
        title: insight.title,
        description: insight.description,
        priority: insight.priority
      };
      savedInsights.push(await storage.createCoachingInsight(insightData));
    }
    
    return res.json({
      session,
      insights: savedInsights
    });
  } catch (error) {
    logger.error('Failed to generate training plan', error);
    return res.status(500).json({ error: 'Failed to generate training plan' });
  }
}

/**
 * Generate a basic training plan based on rule-based algorithms
 * This is a simple implementation for Sprint 1
 */
function generateBasicTrainingPlan(requestData: any, user: any) {
  // Simple array of training recommendations
  const insights = [
    {
      dimensionCode: 'TECH',
      title: 'Improve Dinking Technique',
      description: 'Practice controlled dinking drills focusing on paddle angle and soft touch. Aim for 15 minutes daily.',
      priority: 5
    },
    {
      dimensionCode: 'TACT',
      title: 'Kitchen Positioning Strategy',
      description: 'Work on kitchen line positioning, particularly staying close to the kitchen line when your opponent is in the backcourt.',
      priority: 4
    },
    {
      dimensionCode: 'PHYS',
      title: 'Lateral Movement Conditioning',
      description: 'Add lateral movement drills to improve your side-to-side court coverage. 10 minutes of lateral shuffles 3x per week.',
      priority: 3
    },
    {
      dimensionCode: 'MENT',
      title: 'Focused Breathing Technique',
      description: 'Practice 4-7-8 breathing between points to maintain focus and reduce stress during competitive play.',
      priority: 3
    },
    {
      dimensionCode: 'CONS',
      title: 'Third Shot Drop Consistency',
      description: 'Practice third shot drops aiming for 70% landing in the kitchen. Start with 50 attempts daily and track improvement.',
      priority: 4
    }
  ];
  
  return insights;
}
```

### 5. Match Analysis Service (server/services/matchAnalysisService.ts)

```typescript
/**
 * PKL-278651-COACH-0002-ANALYSIS
 * Match Analysis Service
 * 
 * This service provides analysis of match performance data using rule-based algorithms.
 * It generates insights based on match statistics and CourtIQ dimensions.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Match } from '@shared/schema';

interface AnalysisItem {
  dimensionCode: string; // "TECH", "TACT", "PHYS", "MENT", "CONS"
  type: string; // "strength", "weakness", "opportunity", "trend"
  title: string;
  description: string;
  priority: number; // 1-5
}

interface MatchAnalysis {
  summary: string;
  items: AnalysisItem[];
}

/**
 * Analyze match performance using rule-based algorithms
 */
export async function analyzeMatchPerformance(match: Match, user: any): Promise<MatchAnalysis> {
  // For Sprint 1, we'll implement a simple rule-based analysis
  // In future sprints, this will be enhanced with AI analysis
  
  // Determine if user won or lost
  const userPlayer = match.players.find(p => p.userId === user.id);
  const isWinner = userPlayer?.isWinner || false;
  
  // Extract basic stats
  const userScore = parseInt(userPlayer?.score || '0');
  const opponentScore = match.players.find(p => p.userId !== user.id)?.score || '0';
  
  // Simple analysis based on win/loss and score difference
  const analysis: MatchAnalysis = {
    summary: isWinner 
      ? `Congratulations on your ${userScore}-${opponentScore} victory! Here's what you did well and areas to focus on.`
      : `Good effort in your ${opponentScore}-${userScore} match. Let's focus on these areas for improvement.`,
    items: []
  };
  
  // Generate some basic insights based on the match type
  if (match.formatType === 'singles') {
    addSinglesInsights(analysis, isWinner, match);
  } else {
    addDoublesInsights(analysis, isWinner, match);
  }
  
  // Add some standard insights that apply to all matches
  addStandardInsights(analysis, isWinner, match);
  
  return analysis;
}

/**
 * Add singles-specific insights
 */
function addSinglesInsights(analysis: MatchAnalysis, isWinner: boolean, match: Match) {
  if (isWinner) {
    analysis.items.push({
      dimensionCode: 'PHYS',
      type: 'strength',
      title: 'Good Court Coverage',
      description: 'Your movement around the court was effective, allowing you to reach most shots.',
      priority: 4
    });
  } else {
    analysis.items.push({
      dimensionCode: 'PHYS',
      type: 'weakness',
      title: 'Court Coverage Needs Improvement',
      description: 'Work on your court movement to cover more ground, particularly side-to-side.',
      priority: 4
    });
  }
  
  analysis.items.push({
    dimensionCode: 'TACT',
    type: 'opportunity',
    title: 'Singles Strategy Development',
    description: 'Focus on using the center of the court more effectively to limit your opponent\'s angles.',
    priority: 3
  });
}

/**
 * Add doubles-specific insights
 */
function addDoublesInsights(analysis: MatchAnalysis, isWinner: boolean, match: Match) {
  if (isWinner) {
    analysis.items.push({
      dimensionCode: 'TACT',
      type: 'strength',
      title: 'Effective Partnership',
      description: 'Your team coordination was strong, with good communication and court coverage.',
      priority: 4
    });
  } else {
    analysis.items.push({
      dimensionCode: 'TACT',
      type: 'weakness',
      title: 'Partnership Coordination',
      description: 'Work on your team communication and court positioning to cover the court more effectively.',
      priority: 4
    });
  }
  
  analysis.items.push({
    dimensionCode: 'TECH',
    type: 'opportunity',
    title: 'Doubles Net Play',
    description: 'Practice your quick reactions at the net to capitalize on weak returns in doubles play.',
    priority: 3
  });
}

/**
 * Add standard insights that apply to all matches
 */
function addStandardInsights(analysis: MatchAnalysis, isWinner: boolean, match: Match) {
  // Always add a mental game insight
  analysis.items.push({
    dimensionCode: 'MENT',
    type: isWinner ? 'strength' : 'opportunity',
    title: isWinner ? 'Mental Resilience' : 'Mental Focus',
    description: isWinner 
      ? 'You maintained good focus throughout the match, especially in critical moments.'
      : 'Practice maintaining focus during pressure points to improve your mental game.',
    priority: isWinner ? 3 : 4
  });
  
  // Always add a consistency insight
  analysis.items.push({
    dimensionCode: 'CONS',
    type: 'opportunity',
    title: 'Shot Consistency',
    description: 'Continue to work on your shot consistency, especially during longer rallies.',
    priority: 3
  });
  
  // Add a technical insight
  analysis.items.push({
    dimensionCode: 'TECH',
    type: 'opportunity',
    title: 'Third Shot Development',
    description: 'Focus on developing your third shot options, particularly the drop and drive variations.',
    priority: 4
  });
}
```

### 6. Client SDK (client/src/lib/sdk/sageSDK.ts)

```typescript
/**
 * PKL-278651-COACH-0001-SDK
 * S.A.G.E. SDK
 * 
 * This SDK provides client-side access to the S.A.G.E. coaching API.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { apiRequest } from '@/lib/queryClient';

// Types
interface CoachingSession {
  id: number;
  userId: number;
  sessionType: string; // "match_analysis", "assessment", "training_plan"
  createdAt: string;
  updatedAt: string;
  status: string; // "active", "archived", "completed"
  metadata: Record<string, any>;
}

interface CoachingInsight {
  id: number;
  sessionId: number;
  dimensionCode: string; // "TECH", "TACT", "PHYS", "MENT", "CONS"
  insightType: string; // "strength", "weakness", "opportunity", "trend"
  title: string;
  description: string;
  priority: number; // 1-5
  createdAt: string;
  isArchived: boolean;
  metadata: Record<string, any>;
}

interface MatchAnalysisResponse {
  session: CoachingSession;
  insights: CoachingInsight[];
  summary: string;
}

interface TrainingPlanResponse {
  session: CoachingSession;
  insights: CoachingInsight[];
}

interface TrainingPlanRequest {
  durationWeeks: number;
  hoursPerWeek: number;
  focusAreas: string[];
  goals: string;
  equipment: string[];
}

// S.A.G.E. SDK
export const sageSDK = {
  /**
   * Get all coaching sessions for the current user
   */
  async getCoachingSessions(): Promise<CoachingSession[]> {
    const response = await apiRequest('GET', '/api/sage/sessions');
    return response.json();
  },
  
  /**
   * Get a specific coaching session by ID
   */
  async getCoachingSession(id: number): Promise<CoachingSession> {
    const response = await apiRequest('GET', `/api/sage/sessions/${id}`);
    return response.json();
  },
  
  /**
   * Get insights for a specific coaching session
   */
  async getSessionInsights(sessionId: number): Promise<CoachingInsight[]> {
    const response = await apiRequest('GET', `/api/sage/insights/session/${sessionId}`);
    return response.json();
  },
  
  /**
   * Get analysis for a specific match
   */
  async getMatchAnalysis(matchId: number): Promise<MatchAnalysisResponse> {
    const response = await apiRequest('GET', `/api/sage/insights/match/${matchId}`);
    return response.json();
  },
  
  /**
   * Generate a training plan based on user preferences
   */
  async generateTrainingPlan(
    planRequest: TrainingPlanRequest
  ): Promise<TrainingPlanResponse> {
    const response = await apiRequest('POST', '/api/sage/training-plans', planRequest);
    return response.json();
  }
};
```

### 7. UI Components

#### A. S.A.G.E. Dashboard Component (client/src/components/ai-coach/SAGEDashboard.tsx)

```tsx
/**
 * PKL-278651-COACH-0001-UI
 * S.A.G.E. Dashboard Component
 * 
 * This component provides the primary interface for interacting with the S.A.G.E.
 * coaching system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { sageSDK } from '@/lib/sdk/sageSDK';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, BrainCircuit, Activity, Calendar, BarChart } from 'lucide-react';

import { InsightList } from './InsightList';
import { TrainingPlanView } from './TrainingPlanView';
import { MatchAnalysisRequest } from './MatchAnalysisRequest';

/**
 * S.A.G.E. Dashboard component
 */
export function SAGEDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');
  
  // Fetch coaching sessions
  const { 
    data: sessions, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/sage/sessions'],
    queryFn: () => sageSDK.getCoachingSessions()
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your coaching data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Coaching Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load your coaching data. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">S.A.G.E.</h1>
          <Badge variant="outline" className="bg-sage-100 text-sage-900">
            Skills Assessment & Growth Engine
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Your personalized pickleball coaching assistant
        </p>
      </header>
      
      <Separator />
      
      <Tabs defaultValue="insights" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="insights">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="training">
            <Calendar className="h-4 w-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Activity className="h-4 w-4 mr-2" />
            Match Analysis
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChart className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="mt-6">
          <WelcomeMessage user={user} />
          <div className="mt-6">
            <InsightList sessions={sessions || []} />
          </div>
        </TabsContent>
        
        <TabsContent value="training" className="mt-6">
          <TrainingPlanView sessions={sessions || []} />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-6">
          <MatchAnalysisRequest />
        </TabsContent>
        
        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Progress</CardTitle>
              <CardDescription>Track your improvement across CourtIQ dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Progress tracking will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Personalized welcome message
 */
function WelcomeMessage({ user }: { user: any }) {
  // Get time of day greeting
  const hour = new Date().getHours();
  let greeting = 'Hello';
  
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  const displayName = user?.displayName || user?.username || 'Player';
  
  return (
    <Card className="bg-sage-50">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold">
          {greeting}, {displayName}
        </h2>
        <p className="mt-2">
          Welcome to your S.A.G.E. coaching dashboard. Here you'll find personalized insights
          and recommendations to help improve your pickleball game.
        </p>
      </CardContent>
    </Card>
  );
}
```

#### B. Insight List Component (client/src/components/ai-coach/InsightList.tsx)

```tsx
/**
 * PKL-278651-COACH-0001-UI
 * Insight List Component
 * 
 * This component displays a list of coaching insights from S.A.G.E.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sageSDK } from '@/lib/sdk/sageSDK';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChevronDown, ChevronUp, Target, Lightbulb, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

// Dimension colors for visual cues
const dimensionColors: Record<string, string> = {
  TECH: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  TACT: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  PHYS: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  MENT: 'bg-green-100 text-green-800 hover:bg-green-200',
  CONS: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
};

// Dimension full names
const dimensionNames: Record<string, string> = {
  TECH: 'Technical Skills',
  TACT: 'Tactical Awareness',
  PHYS: 'Physical Fitness',
  MENT: 'Mental Toughness',
  CONS: 'Consistency'
};

// Insight type icons
const insightTypeIcons: Record<string, React.ReactNode> = {
  strength: <Trophy className="h-4 w-4" />,
  weakness: <AlertTriangle className="h-4 w-4" />,
  opportunity: <Target className="h-4 w-4" />,
  trend: <TrendingUp className="h-4 w-4" />,
  recommendation: <Lightbulb className="h-4 w-4" />
};

interface InsightListProps {
  sessions: any[]; // Coaching sessions
}

export function InsightList({ sessions }: InsightListProps) {
  // Get most recent session for initial display
  const recentSession = sessions[0];
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    recentSession?.id || null
  );
  
  // Fetch insights for selected session
  const {
    data: insights,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/sage/insights/session', selectedSessionId],
    queryFn: () => selectedSessionId ? sageSDK.getSessionInsights(selectedSessionId) : Promise.resolve([]),
    enabled: !!selectedSessionId
  });
  
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Coaching Data Yet</CardTitle>
          <CardDescription>
            You don't have any coaching insights yet. Start by analyzing a match or generating a training plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            Record a match and get personalized coaching insights
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Record a Match</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading insights...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load coaching insights. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Coaching Insights</h2>
        <SessionSelector 
          sessions={sessions} 
          selectedId={selectedSessionId}
          onSelect={setSelectedSessionId}
        />
      </div>
      
      {insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center py-6 text-muted-foreground">
              No insights available for this session
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SessionSelectorProps {
  sessions: any[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function SessionSelector({ sessions, selectedId, onSelect }: SessionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedSession = sessions.find(s => s.id === selectedId) || sessions[0];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatSessionType = (type: string) => {
    switch (type) {
      case 'match_analysis': return 'Match Analysis';
      case 'training_plan': return 'Training Plan';
      case 'assessment': return 'Skill Assessment';
      default: return type;
    }
  };
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-w-[200px]"
      >
        <span>{formatSessionType(selectedSession.sessionType)} - {formatDate(selectedSession.createdAt)}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-[250px] bg-card border rounded-md shadow-md z-10">
          <ul className="py-1">
            {sessions.map(session => (
              <li key={session.id} className="px-3 py-2 hover:bg-accent cursor-pointer" onClick={() => {
                onSelect(session.id);
                setIsOpen(false);
              }}>
                <div className="font-medium">{formatSessionType(session.sessionType)}</div>
                <div className="text-sm text-muted-foreground">{formatDate(session.createdAt)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface InsightCardProps {
  insight: any;
}

function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const dimensionColor = dimensionColors[insight.dimensionCode] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  const dimensionName = dimensionNames[insight.dimensionCode] || insight.dimensionCode;
  const insightIcon = insightTypeIcons[insight.insightType] || <Lightbulb className="h-4 w-4" />;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{insight.title}</CardTitle>
          <Badge className={dimensionColor}>
            {dimensionName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={expanded ? '' : 'line-clamp-2'}>
          <p>{insight.description}</p>
        </div>
        {insight.description.length > 120 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)} 
            className="mt-2 h-8 text-xs"
          >
            {expanded ? 'Show less' : 'Read more'}
          </Button>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          {insightIcon}
          <span className="ml-1 capitalize">{insight.insightType}</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm">Apply to Training</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

#### C. Match Analysis Request Component (client/src/components/ai-coach/MatchAnalysisRequest.tsx)

```tsx
/**
 * PKL-278651-COACH-0001-UI
 * Match Analysis Request Component
 * 
 * This component provides the interface for requesting match analysis.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Award, AlertCircle } from 'lucide-react';
import { sageSDK } from '@/lib/sdk/sageSDK';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

export function MatchAnalysisRequest() {
  const { toast } = useToast();
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  
  // Fetch recent matches
  const {
    data: recentMatches,
    isLoading: isLoadingMatches
  } = useQuery({
    queryKey: ['/api/match/recent'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/match/recent');
      return res.json();
    }
  });
  
  // Mutation to analyze a match
  const analyzeMutation = useMutation({
    mutationFn: (matchId: number) => sageSDK.getMatchAnalysis(matchId),
    onSuccess: () => {
      toast({
        title: 'Analysis Complete',
        description: 'Your match has been analyzed successfully.',
        variant: 'default'
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/sage/sessions'] });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze your match. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleAnalyzeMatch = (matchId: number) => {
    setSelectedMatchId(matchId);
    analyzeMutation.mutate(matchId);
  };
  
  if (isLoadingMatches) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading your recent matches...</span>
      </div>
    );
  }
  
  if (!recentMatches || recentMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>
            You don't have any recent matches to analyze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Record a match to get personalized analysis and coaching insights.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Record a New Match</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Analysis</CardTitle>
          <CardDescription>
            Select a match to get personalized analysis and coaching insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches.map((match: any) => (
              <MatchItem 
                key={match.id} 
                match={match} 
                onAnalyze={() => handleAnalyzeMatch(match.id)} 
                isAnalyzing={analyzeMutation.isPending && selectedMatchId === match.id}
                isSelected={selectedMatchId === match.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MatchItemProps {
  match: any;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isSelected: boolean;
}

function MatchItem({ match, onAnalyze, isAnalyzing, isSelected }: MatchItemProps) {
  // Format date
  const matchDate = new Date(match.createdAt).toLocaleDateString();
  
  // Determine opponent name
  const opponent = match.players.find((p: any) => p.userId !== 1); // Assuming current user id is 1 for demo
  const opponentName = opponent?.playerName || 'Opponent';
  
  // Determine match result
  const userPlayer = match.players.find((p: any) => p.userId === 1); // Assuming current user id is 1 for demo
  const matchResult = userPlayer?.isWinner ? 'Win' : 'Loss';
  const resultClass = userPlayer?.isWinner ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className={`p-4 border rounded-lg ${isSelected ? 'border-primary' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Match vs. {opponentName}</h3>
          <div className="text-sm text-muted-foreground">{matchDate}</div>
          <div className="text-sm mt-1">
            Format: <span className="capitalize">{match.formatType}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`font-semibold ${resultClass}`}>{matchResult}</span>
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            size="sm"
            className="mt-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Match
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 8. Integration with Existing Code

#### A. Register Route in Server (server/routes.ts)

```typescript
// Import the S.A.G.E. routes
import sageRoutes from './routes/coach-routes';

// Add to the routes registration
app.use('/api/sage', sageRoutes);
```

#### B. Add S.A.G.E. to App Navigation (client/src/components/Nav.tsx)

```typescript
// Add S.A.G.E. to the navigation items
const navItems = [
  // ... existing items
  {
    title: "S.A.G.E. Coach",
    href: "/sage",
    icon: <BrainCircuit className="h-4 w-4" />
  },
];
```

#### C. Add S.A.G.E. Page (client/src/pages/SAGEPage.tsx)

```tsx
/**
 * PKL-278651-COACH-0001-PAGE
 * S.A.G.E. Page
 * 
 * This is the main page for the S.A.G.E. (Skills Assessment & Growth Engine) feature.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Helmet } from 'react-helmet';
import { SAGEDashboard } from '@/components/ai-coach/SAGEDashboard';

export default function SAGEPage() {
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>S.A.G.E. Coach | Pickle+</title>
      </Helmet>
      
      <div className="container py-6 max-w-4xl">
        <SAGEDashboard />
      </div>
    </>
  );
}
```

#### D. Register S.A.G.E. Page in App Routes (client/src/App.tsx)

```tsx
// Import the S.A.G.E. page
import SAGEPage from './pages/SAGEPage';

// Add to the routes
<Route path="/sage" component={SAGEPage} />
```

## Testing Strategy

For Sprint 1, we will focus on the following testing approaches:

1. **Manual Testing:**
   - Test API endpoints with Postman or curl
   - Verify UI components render correctly
   - Test user flows for match analysis and insights

2. **Unit Tests:**
   - Test rule-based analysis algorithms
   - Test data transformation functions
   - Test storage interface methods

3. **Integration Tests:**
   - Test API endpoints with various inputs
   - Test SDK interface with mock responses
   - Test database interactions

## Sprint 1 Deliverables

By the end of Sprint 1, we will have:

1. Database schema for coaching data
2. Server-side API endpoints for S.A.G.E. features
3. Client-side SDK for accessing S.A.G.E. features
4. Basic UI components for coaching interactions
5. Rule-based match analysis engine
6. Integration with existing user and match systems

## Next Steps

After completing Sprint 1, we will proceed to Sprint 2 which focuses on enhancing the match analysis capabilities with more advanced algorithms and visualization components.