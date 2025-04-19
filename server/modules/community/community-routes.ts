/**
 * PKL-278651-COMM-0006-HUB-API
 * Community API Routes Proxy
 * 
 * This file redirects requests to the original community routes implementation.
 * It is a temporary solution to keep the original functionality while adding
 * activity feed features.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create a router
const router = Router();

// Create a basic handler for the root endpoint
router.get('/', (req: Request, res: Response) => {
  try {
    // Mock data for communities with avatars and background images
    const communities = [
      {
        id: 1,
        name: 'Pickle+ Community',
        description: 'The official Pickle+ community',
        memberCount: 248,
        isPublic: true,
        themeColor: '#4CAF50',
        createdAt: new Date().toISOString(),
        avatarUrl: '/uploads/community-1-avatar.jpg',
        backgroundUrl: '/uploads/community-1-bg.jpg'
      },
      {
        id: 2,
        name: 'Tournament Players',
        description: 'A group for tournament players to connect and organize matches',
        memberCount: 124,
        isPublic: true,
        themeColor: '#2196F3',
        createdAt: new Date().toISOString(),
        avatarUrl: '/uploads/community-2-avatar.jpg',
        backgroundUrl: '/uploads/community-2-bg.jpg'
      },
      {
        id: 3,
        name: 'Beginners Welcome',
        description: 'A friendly community for beginners to learn and improve',
        memberCount: 86,
        isPublic: true,
        themeColor: '#FF9800',
        createdAt: new Date().toISOString(),
        avatarUrl: '/uploads/community-3-avatar.jpg',
        backgroundUrl: '/uploads/community-3-bg.jpg'
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
    
    // Mock data for joined communities with avatars and background images
    const communities = [
      {
        id: 1,
        name: 'Pickle+ Community',
        description: 'The official Pickle+ community',
        memberCount: 248,
        isPublic: true,
        themeColor: '#4CAF50',
        createdAt: new Date().toISOString(),
        avatarUrl: '/uploads/community-1-avatar.jpg',
        backgroundUrl: '/uploads/community-1-bg.jpg'
      },
      {
        id: 2,
        name: 'Tournament Players',
        description: 'A group for tournament players to connect and organize matches',
        memberCount: 124,
        isPublic: true,
        themeColor: '#2196F3',
        createdAt: new Date().toISOString(),
        avatarUrl: '/uploads/community-2-avatar.jpg',
        backgroundUrl: '/uploads/community-2-bg.jpg'
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
    
    // Mock data for a specific community with avatar and background image
    const community = {
      id: communityId,
      name: communityId === 1 ? 'Pickle+ Community' : 'Tournament Players',
      description: communityId === 1 
        ? 'The official Pickle+ community. Join us for exclusive events, tournaments, and connect with fellow pickleball enthusiasts in your area.' 
        : 'A group for tournament players to connect and organize matches. Get updates on upcoming tournaments, find practice partners, and improve your competitive game.',
      memberCount: communityId === 1 ? 248 : 124,
      isPublic: true,
      themeColor: communityId === 1 ? '#4CAF50' : '#2196F3',
      createdAt: new Date().toISOString(),
      avatarUrl: `/uploads/community-${communityId}-avatar.jpg`,
      backgroundUrl: `/uploads/community-${communityId}-bg.jpg`,
      creator: {
        id: 1,
        username: 'admin',
        displayName: 'Admin User'
      },
      rules: [
        'Be respectful to all members',
        'Share only pickleball-related content',
        'No self-promotion without prior approval'
      ],
      tags: ['pickleball', 'tournaments', 'community'],
      featuredEvent: communityId === 1 ? {
        id: 1,
        title: 'Weekend Tournament',
        date: new Date(Date.now() + 86400000 * 3).toISOString()
      } : null
    };
    
    res.json(community);
  } catch (error) {
    console.error('[API] Error fetching community:', error);
    res.status(500).json({ message: 'Failed to fetch community' });
  }
});

// Add routes handler for any URL patterns that aren't handled by the original implementation
router.get('/:id/events', (req: Request, res: Response) => {
  // Mock events data for community
  const communityId = parseInt(req.params.id);
  const events = [
    {
      id: 1,
      communityId: communityId || 1,
      title: "Weekend Tournament",
      description: "Join us for our weekend tournament. All skill levels welcome!",
      startDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      location: "Main Courts",
      capacity: 24,
      registered: 16,
      skillLevel: "All Levels",
      eventType: "Tournament",
      status: "Upcoming"
    },
    {
      id: 2,
      communityId: communityId || 1,
      title: "Beginner Clinic",
      description: "Learn the basics of pickleball with our certified coaches.",
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      location: "Training Courts",
      capacity: 12,
      registered: 8,
      skillLevel: "Beginner",
      eventType: "Clinic",
      status: "Upcoming"
    }
  ];
  
  res.json(events);
});

router.get('/:id/members', (req: Request, res: Response) => {
  // Mock members data for community
  const members = [
    {
      id: 1,
      username: "sarahsmith",
      displayName: "Sarah S.",
      role: "admin",
      avatarUrl: null,
      joinedAt: new Date(Date.now() - 86400000 * 30).toISOString() // 30 days ago
    },
    {
      id: 2,
      username: "mikejohnson",
      displayName: "Mike J.",
      role: "moderator",
      avatarUrl: null,
      joinedAt: new Date(Date.now() - 86400000 * 25).toISOString() // 25 days ago
    },
    {
      id: 3,
      username: "emilydavis",
      displayName: "Emily D.",
      role: "member",
      avatarUrl: null,
      joinedAt: new Date(Date.now() - 86400000 * 20).toISOString() // 20 days ago
    },
    {
      id: 4,
      username: "chriswilson",
      displayName: "Chris W.",
      role: "member",
      avatarUrl: null,
      joinedAt: new Date(Date.now() - 86400000 * 15).toISOString() // 15 days ago
    },
    {
      id: 5,
      username: "jenniferlee",
      displayName: "Jennifer L.",
      role: "member",
      avatarUrl: null,
      joinedAt: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago
    }
  ];
  
  // Apply limit if provided
  const limit = req.query.limit ? parseInt(req.query.limit as string) : members.length;
  res.json(members.slice(0, limit));
});

// Add upload functionality for avatars and background images

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `community-${uniqueSuffix}${ext}`);
  }
});

// Create multer upload middleware
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  }
});

// POST endpoint to upload community avatar
router.post('/:id/upload-avatar', upload.single('avatar'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const communityId = parseInt(req.params.id);
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get the relative path to the uploaded file
    const relativePath = req.file.path.replace(/^uploads\//, '/uploads/');
    
    // In a real implementation, you would update the community record in the database
    // For now, we just return the URL to the uploaded file
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: relativePath
    });
  } catch (error) {
    console.error('[API] Error uploading community avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// POST endpoint to upload community background
router.post('/:id/upload-background', upload.single('background'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const communityId = parseInt(req.params.id);
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get the relative path to the uploaded file
    const relativePath = req.file.path.replace(/^uploads\//, '/uploads/');
    
    // In a real implementation, you would update the community record in the database
    // For now, we just return the URL to the uploaded file
    res.json({
      success: true,
      message: 'Background uploaded successfully',
      backgroundUrl: relativePath
    });
  } catch (error) {
    console.error('[API] Error uploading community background:', error);
    res.status(500).json({ message: 'Failed to upload background' });
  }
});

export const communityRoutes = router;