/**
 * PKL-278651-GAME-0002-TOURN
 * Tournament Discovery API Routes
 * 
 * API routes for the tournament discovery system.
 */

import { Express, Request, Response } from 'express';
import { isAuthenticated } from '../auth';

/**
 * Sample tournament discovery data
 * In a full implementation, this would be stored in the database
 */
const TOURNAMENT_FEATURES = [
  {
    id: 1,
    code: 'TOURN-SINGLE-ELIM',
    type: 'single-elimination',
    name: 'Single Elimination Format',
    description: 'Tournament featuring knockout rounds where losers are eliminated.',
    coordinates: { x: 0.1, y: 0.3 },
    difficulty: 'easy',
    reward: {
      id: 101,
      name: 'Tournament Scout',
      description: 'You discovered your first tournament feature!',
      type: 'xp',
      rarity: 'common',
      value: { xpAmount: 50 }
    }
  },
  {
    id: 2,
    code: 'TOURN-ROUND-ROBIN',
    type: 'round-robin',
    name: 'Round Robin Format',
    description: 'Everyone plays against everyone in the group stages.',
    coordinates: { x: 0.3, y: 0.7 },
    difficulty: 'medium',
    reward: {
      id: 102,
      name: 'Format Expert',
      description: 'You\'re learning about tournament formats!',
      type: 'xp',
      rarity: 'uncommon',
      value: { xpAmount: 75 }
    }
  },
  {
    id: 3,
    code: 'TOURN-CONSOLATION',
    type: 'consolation',
    name: 'Consolation Brackets',
    description: 'Losers continue playing in a separate bracket for rankings.',
    coordinates: { x: 0.5, y: 0.2 },
    difficulty: 'medium',
    reward: {
      id: 103,
      name: 'Bracket Master',
      description: 'You\'ve uncovered how our consolation brackets work!',
      type: 'xp',
      rarity: 'uncommon',
      value: { xpAmount: 75 }
    }
  },
  {
    id: 4,
    code: 'TOURN-SEEDING',
    type: 'seeding',
    name: 'Skill-Based Seeding',
    description: 'Players are placed in brackets based on their skill ratings.',
    coordinates: { x: 0.7, y: 0.6 },
    difficulty: 'hard',
    reward: {
      id: 104,
      name: 'Seeding Specialist',
      description: 'You understand how tournament seeding works!',
      type: 'xp',
      rarity: 'rare',
      value: { xpAmount: 100 }
    }
  },
  {
    id: 5,
    code: 'TOURN-LIVE-SCORING',
    type: 'live-scoring',
    name: 'Live Scoring Updates',
    description: 'Real-time match scores and updates throughout the tournament.',
    coordinates: { x: 0.8, y: 0.4 },
    difficulty: 'hard',
    reward: {
      id: 105,
      name: 'Score Tracker',
      description: 'You\'ve discovered live scoring features!',
      type: 'xp',
      rarity: 'rare',
      value: { xpAmount: 100 }
    }
  },
  {
    id: 6,
    code: 'TOURN-LEADERBOARD',
    type: 'leaderboard',
    name: 'Tournament Leaderboards',
    description: 'Track your progress and rankings throughout the tournament.',
    coordinates: { x: 0.5, y: 0.8 },
    difficulty: 'hard',
    reward: {
      id: 106,
      name: 'Tournament Pioneer',
      description: 'You\'ve discovered all tournament features!',
      type: 'token',
      rarity: 'legendary',
      value: { tokenType: 'early_access' }
    }
  }
];

/**
 * Register tournament discovery routes
 */
export function registerTournamentDiscoveryRoutes(app: Express) {
  /**
   * Get tournament discovery features
   */
  app.get('/api/tournament/discovery/features', async (_req: Request, res: Response) => {
    // In a production implementation, this would fetch from database
    // and filter based on the user's permissions
    return res.json({
      features: TOURNAMENT_FEATURES
    });
  });
  
  /**
   * Record a tournament feature discovery
   */
  app.post('/api/tournament/discovery/record', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { featureCode } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      if (!featureCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Feature code is required' 
        });
      }
      
      // Find the feature being discovered
      const feature = TOURNAMENT_FEATURES.find(f => f.code === featureCode);
      
      if (!feature) {
        return res.status(404).json({ 
          success: false, 
          message: 'Feature not found' 
        });
      }
      
      // In a production implementation, we would:
      // 1. Check if the user has already discovered this feature
      // 2. Record the discovery in the database
      // 3. Award XP or other rewards to the user
      // 4. Check if all features are discovered for milestone rewards
      
      // For now, just return success with the feature details
      return res.json({
        success: true,
        message: 'Feature discovery recorded',
        feature: {
          ...feature,
          isDiscovered: true,
          discoveredAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error recording feature discovery:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * Get user's tournament discovery progress
   */
  app.get('/api/tournament/discovery/progress', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      // In a production implementation, we would:
      // 1. Fetch the user's discovery records from the database
      // 2. Calculate progress statistics
      // 3. Check if the user has qualified for prize drawings
      
      // For now, return mock progress (for demonstration)
      const mockDiscoveredFeatures = TOURNAMENT_FEATURES.slice(0, 3).map(feature => ({
        ...feature,
        isDiscovered: true,
        discoveredAt: new Date(Date.now() - Math.random() * 1000000)
      }));
      
      const remainingFeatures = TOURNAMENT_FEATURES.slice(3).map(feature => ({
        ...feature,
        isDiscovered: false
      }));
      
      const allFeatures = [...mockDiscoveredFeatures, ...remainingFeatures];
      const discoveredCount = mockDiscoveredFeatures.length;
      const totalFeatures = TOURNAMENT_FEATURES.length;
      const completionPercentage = Math.round((discoveredCount / totalFeatures) * 100);
      
      return res.json({
        features: allFeatures,
        progress: {
          discoveredCount,
          totalFeatures,
          completionPercentage,
          isComplete: discoveredCount === totalFeatures,
          campaignId: 1001,
          campaignName: 'Tournament Explorer',
          drawingStatus: {
            isEntered: discoveredCount === totalFeatures,
            poolId: discoveredCount === totalFeatures ? 1 : null,
            entryDate: discoveredCount === totalFeatures ? new Date() : null
          }
        }
      });
    } catch (error) {
      console.error('Error fetching discovery progress:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
}