/**
 * PKL-278651-COMM-0032-UI-ALIGN
 * Community Media Routes
 * 
 * This file contains API routes for managing community media files
 * such as profile pictures and banners for enhanced UI alignment.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @date 2025-04-20
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { communities } from '@shared/schema/community';
import { eq } from 'drizzle-orm';

const router = Router();

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination path based on upload type
    const uploadType = req.params.uploadType;
    const destinationPath = uploadType === 'avatar' 
      ? path.join(process.cwd(), 'uploads/communities/avatars')
      : path.join(process.cwd(), 'uploads/communities/banners');
    
    // Ensure directory exists
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with community ID, timestamp and original extension
    const communityId = req.params.communityId;
    const fileExt = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `community-${communityId}-${timestamp}${fileExt}`);
  }
});

// Create the multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpeg, jpg, png, and webp images
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only jpeg, jpg, png, and webp files are allowed'));
  }
});

/**
 * Middleware to check if user has permission to modify community
 */
const checkCommunityPermission = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    // Get community
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    // Check if user is the creator or admin (in production, would check more permissions)
    if (community.createdByUserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to modify this community' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking community permission:', error);
    res.status(500).json({ error: 'Server error processing permission check' });
  }
};

/**
 * Upload community media (avatar or banner)
 * POST /api/communities/:communityId/:uploadType
 */
router.post(
  '/:communityId/:uploadType',
  checkCommunityPermission,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { communityId, uploadType } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      if (uploadType !== 'avatar' && uploadType !== 'banner') {
        return res.status(400).json({ error: 'Invalid upload type' });
      }
      
      // Create relative path for database
      const relativePath = file.path.split('/uploads/')[1];
      const fileUrl = `/uploads/${relativePath}`;
      
      // Update community with new media URL
      const updateField = uploadType === 'avatar' ? 'avatarUrl' : 'bannerUrl';
      
      await db
        .update(communities)
        .set({ 
          [updateField]: fileUrl,
          lastUiUpdate: new Date()
        })
        .where(eq(communities.id, parseInt(communityId)));
      
      // Return success with file URL
      res.status(200).json({
        success: true,
        fileUrl: fileUrl,
        uploadType: uploadType
      });
      
    } catch (error) {
      console.error('Error uploading community media:', error);
      res.status(500).json({ error: 'Server error processing upload' });
    }
  }
);

/**
 * Update community styling (theme color, accent color)
 * PATCH /api/communities/:communityId/styling
 */
router.patch(
  '/:communityId/styling',
  checkCommunityPermission,
  async (req: Request, res: Response) => {
    try {
      const { communityId } = req.params;
      const { themeColor, accentColor } = req.body;
      
      // Validate input
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      
      if (themeColor && !hexColorRegex.test(themeColor)) {
        return res.status(400).json({ error: 'Invalid theme color format' });
      }
      
      if (accentColor && !hexColorRegex.test(accentColor)) {
        return res.status(400).json({ error: 'Invalid accent color format' });
      }
      
      // Build update object with only provided fields
      const updateData: any = { lastUiUpdate: new Date() };
      
      if (themeColor) updateData.themeColor = themeColor;
      if (accentColor) updateData.accentColor = accentColor;
      
      // Update community styling
      await db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, parseInt(communityId)));
      
      res.status(200).json({
        success: true,
        communityId: parseInt(communityId),
        ...updateData
      });
      
    } catch (error) {
      console.error('Error updating community styling:', error);
      res.status(500).json({ error: 'Server error updating styling' });
    }
  }
);

/**
 * Get community media and styling settings
 * GET /api/communities/:communityId/media
 */
router.get(
  '/:communityId/media',
  async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      
      // Get community with media and styling fields
      const [community] = await db
        .select({
          id: communities.id,
          name: communities.name,
          avatarUrl: communities.avatarUrl,
          bannerUrl: communities.bannerUrl,
          themeColor: communities.themeColor,
          accentColor: communities.accentColor,
          lastUiUpdate: communities.lastUiUpdate
        })
        .from(communities)
        .where(eq(communities.id, communityId));
      
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      res.status(200).json(community);
      
    } catch (error) {
      console.error('Error fetching community media:', error);
      res.status(500).json({ error: 'Server error fetching media' });
    }
  }
);

export default router;