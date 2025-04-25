/**
 * PKL-278651-COACH-0022-API
 * SAGE Dashboard API Routes
 * 
 * This file contains the API routes for SAGE dashboard integration.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

/**
 * GET /api/coach/sage/concierge/recommendations
 * Retrieve personalized recommendations for a user
 * 
 * Query parameters:
 * - type: 'dashboard' (for dashboard widget) | 'all' (for SAGE page)
 */
router.get('/recommendations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type = 'all' } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // In production, we would fetch recommendations from the database
    // or use a recommendation engine based on the user's CourtIQ profile
    
    // For now, return static recommendations
    const recommendations = [
      {
        id: 'rec-1',
        type: 'drill',
        title: 'Improve Your Dink Accuracy',
        summary: 'Based on your recent matches, focusing on controlled dinking will improve your consistency in kitchen exchanges. Try the "Four Corners" drill to build precision.',
        dimensionCode: 'TECH'
      },
      {
        id: 'rec-2',
        type: 'strategy', 
        title: 'Court Positioning Evaluation',
        summary: 'Analysis shows opportunity for better court coverage with your partner. Review our "Two-Step Reset" strategy to improve your positioning after defensive shots.',
        dimensionCode: 'TACT'
      },
      {
        id: 'rec-3',
        type: 'insight',
        title: 'Mental Focus Enhancement',
        summary: 'Your performance tends to dip in extended rallies. Try our 3-second reset technique between points to maintain concentration in long exchanges.',
        dimensionCode: 'MENT'
      }
    ];

    // For dashboard widget, just return one recommendation
    const filteredRecommendations = type === 'dashboard' 
      ? [recommendations[0]]
      : recommendations;

    return res.status(200).json({
      success: true,
      data: filteredRecommendations
    });
  } catch (error) {
    console.error('Error fetching SAGE recommendations:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching recommendations'
    });
  }
});

/**
 * GET /api/coach/sage/concierge/features
 * Get information about SAGE features and capabilities
 */
router.get('/features', async (req: Request, res: Response) => {
  try {
    const features = [
      {
        id: 'feature-1',
        name: 'Personalized Training Plans',
        description: 'Custom training plans based on your CourtIQ profile and play history',
        isPremium: true
      },
      {
        id: 'feature-2',
        name: 'Match Analysis',
        description: 'Post-match analysis and improvement recommendations',
        isPremium: false
      },
      {
        id: 'feature-3',
        name: 'Skill Progression Tracking',
        description: 'Track your improvement across all five CourtIQ dimensions',
        isPremium: false
      },
      {
        id: 'feature-4',
        name: 'Video Analysis',
        description: 'Upload match footage for detailed technical analysis',
        isPremium: true
      }
    ];

    return res.status(200).json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error fetching SAGE features:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching features'
    });
  }
});

/**
 * GET /api/coach/sage/concierge/navigate
 * Get navigation information for SAGE and related features
 */
router.get('/navigate', async (req: Request, res: Response) => {
  try {
    const navigation = {
      mainPath: '/coach/sage',
      sections: [
        {
          id: 'section-1',
          name: 'SAGE Coach',
          path: '/coach/sage',
          description: 'AI-driven coaching and personalized recommendations'
        },
        {
          id: 'section-2',
          name: 'Training Plans',
          path: '/coach/training',
          description: 'View and manage your training plans',
          isPremium: true
        },
        {
          id: 'section-3',
          name: 'Skill Tracking',
          path: '/coach/skills',
          description: 'Track your progress across all skills'
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: navigation
    });
  } catch (error) {
    console.error('Error fetching SAGE navigation:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching navigation'
    });
  }
});

export default router;