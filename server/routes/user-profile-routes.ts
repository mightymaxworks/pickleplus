/**
 * PKL-278651-PROF-0005-UPLOAD - Profile Photo Upload Functionality
 * 
 * This file implements the server-side API endpoints for handling user profile
 * updates, especially focusing on profile photo uploads.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAuthenticated } from '../middleware/auth';
import { storage as dbStorage } from '../storage';
import { AuditAction, AuditResource } from '@shared/schema/audit';

// Configure multer for uploading profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/profiles');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID if available
    const userId = req.user && req.user.id ? String(req.user.id) : 'anonymous';
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${timestamp}${fileExt}`);
  }
});

// Define file filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer upload with size limits
const upload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
  fileFilter
});

// Configure multer for uploading banner/background images
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads/banners');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID if available
    const userId = req.user && req.user.id ? String(req.user.id) : 'anonymous';
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `banner-${userId}-${timestamp}${fileExt}`);
  }
});

// Configure multer upload for banners with size limits
const uploadBanner = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size for banner images
  },
  fileFilter
});

/**
 * Register user profile routes with the Express application
 * @param app Express application
 */
export function registerUserProfileRoutes(app: express.Express): void {
  console.log("[API] Registering User Profile API routes (PKL-278651-PROF-0005-UPLOAD)");
  
  // Route for uploading profile avatar
  app.post('/api/user/profile/avatar', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Ensure file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      const filePath = `/uploads/profiles/${path.basename(req.file.path)}`;
      
      console.log(`[API] User ${userId} uploaded new profile photo: ${filePath}`);
      
      // Update user profile with new avatar URL
      const updatedUser = await dbStorage.updateUserProfile(userId, {
        avatarUrl: filePath
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the avatar update in audit logs
      try {
        await dbStorage.createAuditLog({
          userId,
          action: AuditAction.USER_UPDATE,
          resource: AuditResource.USER,
          details: {
            field: 'avatarUrl',
            newValue: filePath
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        });
      } catch (auditError) {
        console.error('[API] Error creating audit log for avatar update:', auditError);
        // Continue even if audit logging fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Avatar updated successfully',
        avatarUrl: filePath
      });
    } catch (error) {
      console.error('[API] Error updating profile avatar:', error);
      res.status(500).json({ 
        error: 'Server error while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Route for removing profile avatar
  app.delete('/api/profile/remove-image', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user.id;
      
      // Get current user data
      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If user has an avatar, attempt to delete the file
      if (user.avatarUrl) {
        try {
          const filePath = path.join(process.cwd(), user.avatarUrl.replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[API] Deleted avatar file: ${filePath}`);
          }
        } catch (fileError) {
          console.error('[API] Error deleting avatar file:', fileError);
          // Continue even if file deletion fails
        }
      }

      // Update user profile to remove avatar URL
      const updatedUser = await dbStorage.updateUserProfile(userId, {
        avatarUrl: null
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the avatar removal in audit logs
      try {
        await dbStorage.createAuditLog({
          userId,
          action: AuditAction.USER_UPDATE,
          resource: AuditResource.USER,
          details: {
            field: 'avatarUrl',
            newValue: null,
            oldValue: user.avatarUrl
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        });
      } catch (auditError) {
        console.error('[API] Error creating audit log for avatar removal:', auditError);
        // Continue even if audit logging fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Avatar removed successfully'
      });
    } catch (error) {
      console.error('[API] Error removing profile avatar:', error);
      res.status(500).json({ 
        error: 'Server error while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Route for uploading profile banner/background
  app.post('/api/profile/upload-banner', isAuthenticated, uploadBanner.single('banner'), async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Ensure file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      const filePath = `/uploads/banners/${path.basename(req.file.path)}`;
      
      console.log(`[API] User ${userId} uploaded new profile banner: ${filePath}`);
      
      // Update user profile with new banner URL
      const updatedUser = await dbStorage.updateUserProfile(userId, {
        bannerUrl: filePath
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the banner update in audit logs
      try {
        await dbStorage.createAuditLog({
          userId,
          action: AuditAction.USER_UPDATE,
          resource: AuditResource.USER,
          details: {
            field: 'bannerUrl',
            newValue: filePath
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        });
      } catch (auditError) {
        console.error('[API] Error creating audit log for banner update:', auditError);
        // Continue even if audit logging fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Banner updated successfully',
        bannerUrl: filePath
      });
    } catch (error) {
      console.error('[API] Error updating profile banner:', error);
      res.status(500).json({ 
        error: 'Server error while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Route for removing profile banner
  app.delete('/api/profile/remove-banner', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user.id;
      
      // Get current user data
      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If user has a banner, attempt to delete the file
      if (user.bannerUrl) {
        try {
          const filePath = path.join(process.cwd(), user.bannerUrl.toString().replace(/^\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[API] Deleted banner file: ${filePath}`);
          }
        } catch (fileError) {
          console.error('[API] Error deleting banner file:', fileError);
          // Continue even if file deletion fails
        }
      }

      // Update user profile to remove banner URL
      const updatedUser = await dbStorage.updateUserProfile(userId, {
        bannerUrl: null
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the banner removal in audit logs
      try {
        await dbStorage.createAuditLog({
          userId,
          action: AuditAction.USER_UPDATE,
          resource: AuditResource.USER,
          details: {
            field: 'bannerUrl',
            newValue: null,
            oldValue: user.bannerUrl
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        });
      } catch (auditError) {
        console.error('[API] Error creating audit log for banner removal:', auditError);
        // Continue even if audit logging fails
      }

      res.status(200).json({ 
        success: true, 
        message: 'Banner removed successfully'
      });
    } catch (error) {
      console.error('[API] Error removing profile banner:', error);
      res.status(500).json({ 
        error: 'Server error while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Route for retrieving profile completion data
  app.get('/api/profile/completion', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = req.user.id;
      
      // Get user data
      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get completed profile fields
      const completedFields = await dbStorage.getCompletedProfileFields(userId);

      // Calculate completion metrics
      const completionPct = user.profileCompletionPct || 0;
      
      res.status(200).json({
        completionPercentage: completionPct,
        completedFields: completedFields.map(field => field.fieldName),
        nextSteps: generateNextSteps(user, completedFields.map(field => field.fieldName))
      });
    } catch (error) {
      console.error('[API] Error retrieving profile completion data:', error);
      res.status(500).json({ 
        error: 'Server error while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

/**
 * Helper function to generate recommendations for profile completion
 */
function generateNextSteps(user: any, completedFields: string[]): { field: string, xpReward: number }[] {
  const allFields = [
    { field: 'avatar', xpReward: 50 },
    { field: 'bio', xpReward: 25 },
    { field: 'location', xpReward: 15 },
    { field: 'playingSince', xpReward: 15 },
    { field: 'skillLevel', xpReward: 15 },
  ];
  
  return allFields
    .filter(item => {
      if (item.field === 'avatar') return !user.avatarUrl;
      if (item.field === 'bio') return !user.bio;
      if (item.field === 'location') return !user.location;
      if (item.field === 'playingSince') return !user.playingSince;
      if (item.field === 'skillLevel') return !user.skillLevel;
      return !completedFields.includes(item.field);
    })
    .slice(0, 3); // Return top 3 recommendations
}