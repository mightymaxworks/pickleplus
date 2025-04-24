/**
 * PKL-278651-COACH-0005-ROUTES
 * SAGE Pickleball Knowledge Routes
 * 
 * This file provides API routes for the SAGE pickleball knowledge system
 * to be used by the frontend SAGE chatbot interface.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { Router } from 'express';
import { processSageMessageWithPickleballKnowledge } from '../services/sagePickleballIntegration';
import { storage } from '../storage';

const router = Router();

/**
 * Process a message using SAGE's pickleball knowledge
 * 
 * POST /api/sage/pickleball-knowledge
 */
router.post('/pickleball-knowledge', async (req, res) => {
  try {
    const { message, playerSkillLevel, playerInterests, preferredShots, previousMessages, courtIQAnalysis } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Process the message through the pickleball knowledge system
    const response = processSageMessageWithPickleballKnowledge(
      message,
      playerSkillLevel,
      playerInterests,
      preferredShots,
      previousMessages,
      courtIQAnalysis
    );
    
    // If the pickleball knowledge system didn't handle the query
    if (!response.usedPickleballKnowledge) {
      return res.status(200).json({ 
        handled: false,
        message: 'Message not handled by pickleball knowledge system'
      });
    }
    
    // Log the interaction if user is authenticated
    if (req.isAuthenticated() && req.user) {
      try {
        await logPickleballKnowledgeInteraction(
          req.user.id,
          message,
          response.message,
          response.relevantDimension
        );
      } catch (error) {
        console.error('Error logging pickleball knowledge interaction:', error);
        // Continue with the response even if logging fails
      }
    }
    
    // Return the response
    return res.status(200).json({
      handled: true,
      response
    });
  } catch (error) {
    console.error('Error processing pickleball knowledge query:', error);
    return res.status(500).json({ error: 'Error processing query' });
  }
});

/**
 * Log a pickleball knowledge interaction
 */
async function logPickleballKnowledgeInteraction(
  userId: number,
  query: string,
  response: string,
  dimensionCode?: string
) {
  try {
    // Check if we have a storage method for logging interactions
    if (storage.logSageInteraction) {
      await storage.logSageInteraction({
        userId,
        queryText: query,
        responseText: response,
        interactionType: 'pickleball_knowledge',
        dimensionCode: dimensionCode || 'TECH', // Default to Technical dimension if none provided
        metadata: {
          source: 'pickleball_knowledge_system',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error logging pickleball knowledge interaction:', error);
    // Fail silently - don't disrupt the user experience if logging fails
  }
}

export default router;