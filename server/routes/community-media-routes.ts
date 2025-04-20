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

import express, { Request, Response, NextFunction, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from '../auth';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { communities, communityMembers } from '@shared/schema/community';
import { users } from '@shared/schema';

const router = Router();

// Configure storage for community media uploads
const communityMediaStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadPath = 'uploads/communities';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    const fileExt = path.extname(file.originalname);
    const fileType = req.params.uploadType === 'avatar' ? 'avatar' : 'banner';
    const fileName = `${fileType}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to validate uploaded media files
const mediaFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer upload instance
const communityMediaUpload = multer({ 
  storage: communityMediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  }
});

/**
 * Middleware to check if user has permission to modify community
 */
const checkCommunityPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[API][Community] Checking community permission for user:', req.user?.id);
    
    if (!req.user) {
      console.log('[API][Community] Permission check failed: No authenticated user');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      console.log('[API][Community] Permission check failed: Invalid community ID');
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if community exists
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
    if (!community) {
      console.log('[API][Community] Permission check failed: Community not found');
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if the user is an admin or the creator of the community
    const isAdmin = req.user.isAdmin === true;
    const isCreator = community.createdByUserId === req.user.id;
    
    // Check if the user is a community admin
    let isCommunityAdmin = false;
    if (!isAdmin && !isCreator) {
      const [membership] = await db.select().from(communityMembers)
        .where(
          eq(communityMembers.communityId, communityId) && 
          eq(communityMembers.userId, req.user.id)
        );
      
      isCommunityAdmin = membership?.role === 'admin';
    }
    
    if (isAdmin || isCreator || isCommunityAdmin) {
      console.log('[API][Community] Permission check passed:', { isAdmin, isCreator, isCommunityAdmin });
      next();
    } else {
      console.log('[API][Community] Permission check failed: Insufficient permissions');
      res.status(403).json({ message: 'You do not have permission to modify this community' });
    }
  } catch (error) {
    console.error('[API][Community] Error checking community permission:', error);
    res.status(500).json({ message: 'Error checking permissions' });
  }
};

/**
 * Upload community media (avatar or banner)
 * POST /api/communities/:communityId/:uploadType
 */
router.post(
  '/:communityId/:uploadType(avatar|banner)',
  isAuthenticated,
  checkCommunityPermission,
  communityMediaUpload.single('file'),
  async (req: Request, res: Response) => {
    try {
      console.log('[API][Community] Processing media upload request:', req.params);
      
      const communityId = parseInt(req.params.communityId);
      const uploadType = req.params.uploadType;
      
      if (!req.file) {
        console.log('[API][Community] Media upload failed: No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Create URL path relative to server root
      const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
      
      // Update the community record with the new file URL
      let updateData: any = {};
      if (uploadType === 'avatar') {
        updateData = { profilePicture: fileUrl };
      } else if (uploadType === 'banner') {
        updateData = { bannerImage: fileUrl };
      }
      
      // Update the community record
      const [updatedCommunity] = await db.update(communities)
        .set(updateData)
        .where(eq(communities.id, communityId))
        .returning();
      
      console.log(`[API][Community] ${uploadType} updated for community ${communityId}: ${fileUrl}`);
      
      res.status(200).json({
        message: `Community ${uploadType} updated successfully`,
        url: fileUrl,
        community: updatedCommunity
      });
    } catch (error) {
      console.error('[API][Community] Media upload error:', error);
      res.status(500).json({ 
        message: 'Error uploading community media',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Update community styling (theme color, accent color)
 * PATCH /api/communities/:communityId/styling
 */
router.patch(
  '/:communityId/styling',
  isAuthenticated,
  checkCommunityPermission,
  async (req: Request, res: Response) => {
    try {
      console.log('[API][Community] Processing styling update request');
      
      const communityId = parseInt(req.params.communityId);
      const { themeColor } = req.body;
      
      // Validate the hex color format if provided
      if (themeColor) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexColorRegex.test(themeColor)) {
          return res.status(400).json({ 
            message: 'Invalid theme color format. Please use a valid hex color (e.g., #FF5733).' 
          });
        }
      }
      
      // Update the community record with the new styling
      const updateData: any = {};
      if (themeColor) updateData.themeColor = themeColor;
      
      // Only update if we have styling properties to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No styling properties provided for update' });
      }
      
      // Update the community record
      const [updatedCommunity] = await db.update(communities)
        .set(updateData)
        .where(eq(communities.id, communityId))
        .returning();
      
      console.log(`[API][Community] Styling updated for community ${communityId}`);
      
      res.status(200).json({
        message: 'Community styling updated successfully',
        community: updatedCommunity
      });
    } catch (error) {
      console.error('[API][Community] Styling update error:', error);
      res.status(500).json({ 
        message: 'Error updating community styling',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      console.log('[API][Community] Fetching community media settings');
      
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      // Get the community record
      const [community] = await db.select({
        id: communities.id,
        name: communities.name,
        profilePicture: communities.profilePicture,
        bannerImage: communities.bannerImage,
        themeColor: communities.themeColor
      })
      .from(communities)
      .where(eq(communities.id, communityId));
      
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      console.log(`[API][Community] Media settings fetched for community ${communityId}`);
      
      res.status(200).json({
        community
      });
    } catch (error) {
      console.error('[API][Community] Error fetching media settings:', error);
      res.status(500).json({ 
        message: 'Error fetching community media settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;