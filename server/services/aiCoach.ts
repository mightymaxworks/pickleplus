/**
 * PKL-278651-COACH-0001-AI
 * AI Coach Service
 * 
 * This service provides AI-powered coaching advice using OpenAI's GPT-4o model.
 * It analyzes player match data and provides personalized coaching tips.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Request, Response } from 'express';
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const AI_MODEL = "gpt-4o";

// OpenAI client setup
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client
 * This is called once when the server starts
 */
export function initializeOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[AICoach] OpenAI API key not found. AI coaching features will be unavailable.');
    return;
  }

  try {
    openaiClient = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    console.log('[AICoach] OpenAI client initialized successfully');
  } catch (error) {
    console.error('[AICoach] Failed to initialize OpenAI client:', error);
  }
}

/**
 * Generate coaching advice based on player's match history and performance
 * @param matchData Player's recent match data
 * @param playerStats Player's statistics
 * @returns Coaching advice
 */
export async function generateCoachingAdvice(
  matchData: any[], 
  playerStats: any
): Promise<string> {
  if (!openaiClient) {
    return "AI Coach is currently unavailable. Please try again later.";
  }

  try {
    // Format match data and player stats for the AI
    const formattedData = JSON.stringify({
      matches: matchData,
      stats: playerStats,
      dimensions: [
        { code: "TECH", name: "Technical Skills", description: "Shot execution, form, and mechanical ability" },
        { code: "TACT", name: "Tactical Awareness", description: "Court positioning, shot selection, and strategy" },
        { code: "PHYS", name: "Physical Fitness", description: "Speed, agility, endurance, and strength" },
        { code: "MENT", name: "Mental Toughness", description: "Focus, composure, and pressure handling" },
        { code: "CONS", name: "Consistency", description: "Reliability and error avoidance" }
      ]
    });

    // Create a prompt for the AI
    const prompt = `
    You are the Pickle+ AI Coach, a professional pickleball coach with expertise in analyzing player performance.
    
    Analyze the following player data and provide personalized coaching advice:
    ${formattedData}
    
    Your response should include:
    1. A brief summary of the player's strengths and weaknesses based on the CourtIQ™ dimensions
    2. Three specific recommendations for improvement
    3. One drill or practice exercise to help with their most critical improvement area
    
    Format your response in a conversational, encouraging tone. Keep your response under 400 words.
    `;

    // Call the OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Unable to generate advice at this time.";
  } catch (error) {
    console.error('[AICoach] Error generating coaching advice:', error);
    return "An error occurred while generating coaching advice. Please try again later.";
  }
}

/**
 * Generate a personalized training plan
 * @param playerData Player's profile and performance data
 * @param goals Player's goals
 * @param timeframe Training timeframe in weeks
 * @returns Training plan
 */
export async function generateTrainingPlan(
  playerData: any,
  goals: string,
  timeframe: number
): Promise<any> {
  if (!openaiClient) {
    return { error: "AI Coach is currently unavailable. Please try again later." };
  }

  try {
    // Format player data for the AI
    const formattedData = JSON.stringify({
      player: playerData,
      goals: goals,
      timeframe: timeframe,
    });

    // Create a prompt for the AI
    const prompt = `
    You are the Pickle+ AI Coach, a professional pickleball coach with expertise in creating training plans.
    
    Create a personalized training plan for the following player:
    ${formattedData}
    
    Your response should be formatted as valid JSON with the following structure:
    {
      "overview": "Brief overview of the plan",
      "weeks": [
        {
          "week": 1,
          "focus": "Main focus area",
          "sessions": [
            {
              "day": "Monday",
              "duration": "45 minutes",
              "activities": ["Activity 1", "Activity 2"],
              "notes": "Optional notes"
            },
            ...
          ]
        },
        ...
      ]
    }
    
    Ensure the plan is realistic, progressive, and aligned with the player's goals.
    `;

    // Call the OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the JSON response
    const trainingPlan = JSON.parse(response.choices[0].message.content || "{}");
    return trainingPlan;
  } catch (error) {
    console.error('[AICoach] Error generating training plan:', error);
    return { error: "An error occurred while generating the training plan. Please try again later." };
  }
}

/**
 * Analyze match performance and provide insights
 * @param matchData Match data to analyze
 * @returns Match analysis
 */
export async function analyzeMatchPerformance(
  matchData: any
): Promise<any> {
  if (!openaiClient) {
    return { error: "AI Coach is currently unavailable. Please try again later." };
  }

  try {
    // Format match data for the AI
    const formattedData = JSON.stringify(matchData);

    // Create a prompt for the AI
    const prompt = `
    You are the Pickle+ AI Coach, a professional pickleball coach with expertise in match analysis.
    
    Analyze the following match data and provide insights:
    ${formattedData}
    
    Your response should be formatted as valid JSON with the following structure:
    {
      "summary": "Brief summary of the match",
      "strengths": ["Strength 1", "Strength 2", ...],
      "weaknesses": ["Weakness 1", "Weakness 2", ...],
      "keyMoments": ["Key moment 1", "Key moment 2", ...],
      "recommendations": ["Recommendation 1", "Recommendation 2", ...]
    }
    
    Base your analysis on the statistics, score progression, and any patterns observed in the data.
    `;

    // Call the OpenAI API
    const response = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the JSON response
    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis;
  } catch (error) {
    console.error('[AICoach] Error analyzing match performance:', error);
    return { error: "An error occurred while analyzing the match. Please try again later." };
  }
}

/**
 * API endpoint handler for getting coaching advice
 */
export async function getCoachingAdviceHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!openaiClient) {
      return res.status(503).json({ 
        error: "AI Coach service is not available",
        message: "OpenAI API key not configured. Please contact support."
      });
    }
    
    // Fetch the user's match history and stats
    // This would normally come from your database
    const matchData = []; // TODO: Fetch from database
    const playerStats = {}; // TODO: Fetch from database
    
    const advice = await generateCoachingAdvice(matchData, playerStats);
    
    return res.json({ advice });
  } catch (error) {
    console.error('[AICoach] Error in coaching advice endpoint:', error);
    return res.status(500).json({ error: "Failed to generate coaching advice" });
  }
}

/**
 * API endpoint handler for generating a training plan
 */
export async function getTrainingPlanHandler(req: Request, res: Response) {
  try {
    const { goals, timeframe } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!goals || !timeframe) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    if (!openaiClient) {
      return res.status(503).json({ 
        error: "AI Coach service is not available",
        message: "OpenAI API key not configured. Please contact support."
      });
    }
    
    // Fetch the user's profile and stats
    // This would normally come from your database
    const playerData = {}; // TODO: Fetch from database
    
    const plan = await generateTrainingPlan(playerData, goals, timeframe);
    
    return res.json(plan);
  } catch (error) {
    console.error('[AICoach] Error in training plan endpoint:', error);
    return res.status(500).json({ error: "Failed to generate training plan" });
  }
}

/**
 * API endpoint handler for analyzing match performance
 */
export async function analyzeMatchHandler(req: Request, res: Response) {
  try {
    const { matchId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!matchId) {
      return res.status(400).json({ error: "Missing match ID" });
    }
    
    if (!openaiClient) {
      return res.status(503).json({ 
        error: "AI Coach service is not available",
        message: "OpenAI API key not configured. Please contact support."
      });
    }
    
    // Fetch the match data
    // This would normally come from your database
    const matchData = {}; // TODO: Fetch from database
    
    const analysis = await analyzeMatchPerformance(matchData);
    
    return res.json(analysis);
  } catch (error) {
    console.error('[AICoach] Error in match analysis endpoint:', error);
    return res.status(500).json({ error: "Failed to analyze match" });
  }
}