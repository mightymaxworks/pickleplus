/**
 * PKL-278651-COMM-0006-HUB-API
 * Community API Routes
 * 
 * This file implements the API routes for communities.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';

// Create a router
const router = Router();

// GET all communities
router.get('/', async (req: Request, res: Response) => {
  try {
    // For now, return a simple mock data array until we create the communities table
    const communities = [
      {
        id: 1,
        name: 'Pickle+ Community',
        description: 'The official Pickle+ community',
        memberCount: 248,
        isPublic: true,
        themeColor: '#4CAF50',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Tournament Players',
        description: 'A group for tournament players to connect and organize matches',
        memberCount: 124,
        isPublic: true,
        themeColor: '#2196F3',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Beginners Welcome',
        description: 'A friendly community for beginners to learn and improve',
        memberCount: 86,
        isPublic: true,
        themeColor: '#FF9800',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json(communities);
  } catch (error) {
    console.error('[API] Error fetching communities:', error);
    res.status(500).json({ message: 'Failed to fetch communities' });
  }
});

// GET joined communities for the current user
router.get('/joined', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // For now, return a simple mock data array until we create the communities table
    const communities = [
      {
        id: 1,
        name: 'Pickle+ Community',
        description: 'The official Pickle+ community',
        memberCount: 248,
        isPublic: true,
        themeColor: '#4CAF50',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Tournament Players',
        description: 'A group for tournament players to connect and organize matches',
        memberCount: 124,
        isPublic: true,
        themeColor: '#2196F3',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json(communities);
  } catch (error) {
    console.error('[API] Error fetching joined communities:', error);
    res.status(500).json({ message: 'Failed to fetch joined communities' });
  }
});

// GET a single community by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // For now, return a simple mock data object until we create the communities table
    const community = {
      id: communityId,
      name: communityId === 1 ? 'Pickle+ Community' : 'Tournament Players',
      description: communityId === 1 
        ? 'The official Pickle+ community' 
        : 'A group for tournament players to connect and organize matches',
      memberCount: communityId === 1 ? 248 : 124,
      isPublic: true,
      themeColor: communityId === 1 ? '#4CAF50' : '#2196F3',
      createdAt: new Date().toISOString()
    };
    
    res.json(community);
  } catch (error) {
    console.error('[API] Error fetching community:', error);
    res.status(500).json({ message: 'Failed to fetch community' });
  }
});

export const communityRoutes = router;