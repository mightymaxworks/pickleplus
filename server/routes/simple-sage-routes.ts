/**
 * Simple SAGE Pickleball Knowledge Routes
 * Streamlined version for testing
 */

import { Router } from 'express';
import { processPickleballQuery, shouldHandlePickleballQuery } from '../services/simple-sage-integration';

const router = Router();

/**
 * Process a message using SAGE's pickleball knowledge
 * 
 * POST /api/simple-sage/query
 */
router.post('/query', (req, res) => {
  try {
    const { 
      message, 
      includeFollowUps = true, 
      includeCoachingTips = false, 
      casualTone = true,
      playerLevel = 'intermediate'
    } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if this is a pickleball knowledge query
    const shouldHandle = shouldHandlePickleballQuery(message);
    
    if (!shouldHandle) {
      return res.status(200).json({ 
        handled: false,
        message: 'Message not handled by pickleball knowledge system'
      });
    }
    
    // Process the query with options
    const response = processPickleballQuery(message, {
      includeFollowUps,
      casualTone,
      includeCoachingTips,
      playerLevel: playerLevel as 'beginner' | 'intermediate' | 'advanced'
    });
    
    // Return the response
    return res.status(200).json({
      handled: true,
      response,
      metadata: {
        includeFollowUps,
        includeCoachingTips,
        casualTone,
        playerLevel
      }
    });
  } catch (error) {
    console.error('Error processing pickleball knowledge query:', error);
    return res.status(500).json({ error: 'Error processing query' });
  }
});

export default router;