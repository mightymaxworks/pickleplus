/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management API Routes
 * 
 * This file defines the API routes for the community media management feature:
 * - Upload media files to a community
 * - Create and manage galleries
 * - Associate media with galleries
 * - Retrieve media and galleries
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { 
  communityMedia, 
  communityGalleries, 
  galleryItems,
  MediaType,
  GalleryPrivacyLevel,
  insertMediaSchema,
  insertGallerySchema,
  insertGalleryItemSchema 
} from '../../../shared/schema/media';
import { z } from 'zod';
import { isAuthenticated, isCommunityAdmin, isCommunityMember } from '../../middleware/community-auth';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'community-media');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

/**
 * PKL-278651-COMM-0036-MEDIA-COST
 * Enhanced file filter with cost control
 * 
 * Restricts uploads to specific file types and enforces size limits by type
 * to control costs while maintaining good user experience.
 * 
 * @lastModified 2025-04-21
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types with size limits in bytes
  const allowedTypes: Record<string, number> = {
    // Images - 2MB limit
    'image/jpeg': 2 * 1024 * 1024,
    'image/png': 2 * 1024 * 1024,
    'image/webp': 2 * 1024 * 1024,
    'image/gif': 2 * 1024 * 1024,
    // Videos - 10MB limit
    'video/mp4': 10 * 1024 * 1024,
    'video/webm': 10 * 1024 * 1024,
    // Documents - 5MB limit
    'application/pdf': 5 * 1024 * 1024
  };
  
  if (file.mimetype in allowedTypes) {
    // Check file size against type-specific limit
    const sizeLimit = allowedTypes[file.mimetype];
    if (file.size && file.size > sizeLimit) {
      cb(new Error(`File size exceeds the limit for ${file.mimetype.split('/')[0]} files`));
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error('Unsupported file type. Please upload JPG, PNG, GIF, WEBP, MP4, WEBM, or PDF files.'));
  }
};

// Configure multer with stricter limits for cost control
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum for any file type
    files: 5 // Reduced from 10 to 5 files per upload
  }
});

// Import the quota service
import { 
  getCommunityStorageUsage, 
  checkQuotaForUpload, 
  updateStorageUsage,
  recalculateStorageUsage
} from './storage-quota-service';

const mediaRouter = Router();

/**
 * Get storage quota usage for a community
 * GET /api/community/:communityId/media/quota
 */
mediaRouter.get(
  '/:communityId/media/quota',
  isAuthenticated,
  isCommunityMember,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      // Get storage usage and quota information
      const quota = await getCommunityStorageUsage(communityId);
      
      res.status(200).json(quota);
    } catch (error) {
      console.error('Error getting storage quota:', error);
      res.status(500).json({ message: 'Failed to get storage quota information' });
    }
  }
);

/**
 * Recalculate storage usage for a community
 * POST /api/community/:communityId/media/recalculate-quota
 */
mediaRouter.post(
  '/:communityId/media/recalculate-quota',
  isAuthenticated,
  isCommunityAdmin, // Only admins can force recalculation
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      // Recalculate storage usage from scratch
      await recalculateStorageUsage(communityId);
      
      // Get updated quota information
      const quota = await getCommunityStorageUsage(communityId);
      
      res.status(200).json({
        message: 'Storage usage recalculated successfully',
        quota
      });
    } catch (error) {
      console.error('Error recalculating storage usage:', error);
      res.status(500).json({ message: 'Failed to recalculate storage usage' });
    }
  }
);

/**
 * Upload media to a community
 * POST /api/community/:communityId/media
 */
mediaRouter.post(
  '/:communityId/media',
  isAuthenticated,
  isCommunityMember,
  // Quota pre-check middleware
  async (req, res, next) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      // Get estimated total file size from content-length header
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      
      // Skip quota check if we can't determine size (fallback to post-upload check)
      if (!contentLength) {
        return next();
      }
      
      // Estimate actual file payload size (accounting for form metadata)
      const estimatedFileSize = contentLength * 0.8; // 80% of content-length is a reasonable estimate
      
      // Check if upload would exceed quota
      const quotaCheck = await checkQuotaForUpload(communityId, estimatedFileSize);
      
      if (!quotaCheck.canUpload) {
        return res.status(413).json({
          message: 'Storage quota exceeded',
          quota: quotaCheck
        });
      }
      
      next();
    } catch (error) {
      console.error('Error in quota pre-check:', error);
      // Continue even if quota check fails
      next();
    }
  },
  upload.array('files', 5), // Reduced to 5 files per upload
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      // Calculate total size of uploaded files
      const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);
      
      // Check quota after files are received (more accurate than pre-check)
      const quotaCheck = await checkQuotaForUpload(communityId, totalUploadSize);
      
      if (!quotaCheck.canUpload) {
        // Clean up uploaded files
        files.forEach(file => {
          const filePath = path.join(process.cwd(), 'uploads', 'community-media', path.basename(file.path));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        
        return res.status(413).json({
          message: 'Storage quota exceeded',
          quota: quotaCheck
        });
      }
      
      // Get metadata from request body
      const { title, description, tags } = req.body;
      
      // Process each uploaded file
      const mediaItems = [];
      
      for (const file of files) {
        // Determine media type based on mimetype
        let mediaType = MediaType.OTHER;
        if (file.mimetype.startsWith('image/')) {
          mediaType = MediaType.IMAGE;
        } else if (file.mimetype.startsWith('video/')) {
          mediaType = MediaType.VIDEO;
        } else if (
          file.mimetype === 'application/pdf' || 
          file.mimetype.includes('word') || 
          file.mimetype.includes('excel')
        ) {
          mediaType = MediaType.DOCUMENT;
        }
        
        // Create relative path to file
        const filePath = `/uploads/community-media/${path.basename(file.path)}`;
        
        // Generate thumbnail for images (in real implementation, would resize the image)
        let thumbnailPath = null;
        if (mediaType === MediaType.IMAGE) {
          thumbnailPath = filePath; // For now, use the same image as thumbnail
        }
        
        // Validate media data
        const mediaData = insertMediaSchema.parse({
          communityId,
          createdByUserId: userId,
          title: title || path.parse(file.originalname).name, // Use original filename if no title
          description,
          mediaType,
          filePath,
          thumbnailPath,
          fileSizeBytes: file.size,
          tags: tags ? tags.split(',') : [],
          metadata: {
            originalFilename: file.originalname,
            mimetype: file.mimetype
          }
        });
        
        // Insert into database
        const [media] = await db.insert(communityMedia).values(mediaData).returning();
        mediaItems.push(media);
      }
      
      res.status(201).json(mediaItems);
    } catch (error) {
      console.error('Error uploading media:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid media data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to upload media' });
    }
  }
);

/**
 * Get all media for a community
 * GET /api/community/:communityId/media
 */
mediaRouter.get(
  '/:communityId/media',
  isAuthenticated,
  isCommunityMember,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const { mediaType, limit = '20', offset = '0', sort = 'newest' } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      
      // Base condition - always filter by community ID
      let whereCondition;
      if (mediaType) {
        // Include media type in filter if provided
        whereCondition = and(
          eq(communityMedia.communityId, communityId),
          eq(communityMedia.mediaType, mediaType as string)
        );
      } else {
        // Just filter by community ID
        whereCondition = eq(communityMedia.communityId, communityId);
      }
      
      // Execute query with appropriate sort order
      let media;
      
      if (sort === 'oldest') {
        media = await db
          .select()
          .from(communityMedia)
          .where(whereCondition)
          .orderBy(asc(communityMedia.createdAt))
          .limit(limitNum)
          .offset(offsetNum);
      } else if (sort === 'featured') {
        media = await db
          .select()
          .from(communityMedia)
          .where(whereCondition)
          .orderBy(desc(communityMedia.isFeatured))
          .limit(limitNum)
          .offset(offsetNum);
      } else {
        // Default - sort by newest
        media = await db
          .select()
          .from(communityMedia)
          .where(whereCondition)
          .orderBy(desc(communityMedia.createdAt))
          .limit(limitNum)
          .offset(offsetNum);
      }
      
      res.status(200).json(media);
    } catch (error) {
      console.error('Error getting community media:', error);
      res.status(500).json({ message: 'Failed to retrieve media' });
    }
  }
);

/**
 * Get specific media item
 * GET /api/community/:communityId/media/:mediaId
 */
mediaRouter.get(
  '/:communityId/media/:mediaId',
  isAuthenticated,
  isCommunityMember,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const mediaId = parseInt(req.params.mediaId);
      
      const [media] = await db
        .select()
        .from(communityMedia)
        .where(
          and(
            eq(communityMedia.id, mediaId),
            eq(communityMedia.communityId, communityId)
          )
        );
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      res.status(200).json(media);
    } catch (error) {
      console.error('Error getting media item:', error);
      res.status(500).json({ message: 'Failed to retrieve media item' });
    }
  }
);

/**
 * Delete media item
 * DELETE /api/community/:communityId/media/:mediaId
 */
mediaRouter.delete(
  '/:communityId/media/:mediaId',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const mediaId = parseInt(req.params.mediaId);
      
      // Get the media item first to obtain the file path
      const [media] = await db
        .select()
        .from(communityMedia)
        .where(
          and(
            eq(communityMedia.id, mediaId),
            eq(communityMedia.communityId, communityId)
          )
        );
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      // Delete the media item from database
      await db
        .delete(communityMedia)
        .where(eq(communityMedia.id, mediaId));
      
      // Delete the actual file
      if (media.filePath) {
        const filePath = path.join(process.cwd(), media.filePath.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete the thumbnail if different from main file
      if (media.thumbnailPath && media.thumbnailPath !== media.filePath) {
        const thumbnailPath = path.join(process.cwd(), media.thumbnailPath.replace(/^\//, ''));
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      
      // Update storage usage after deletion
      await updateStorageUsage(communityId, -media.fileSizeBytes, -1);
      
      res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Error deleting media:', error);
      res.status(500).json({ message: 'Failed to delete media' });
    }
  }
);

/**
 * Create a gallery
 * POST /api/community/:communityId/galleries
 */
mediaRouter.post(
  '/:communityId/galleries',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const userId = req.user!.id;
      
      // Validate gallery data
      const galleryData = insertGallerySchema.parse({
        ...req.body,
        communityId,
        createdByUserId: userId
      });
      
      // Insert into database
      const [gallery] = await db.insert(communityGalleries).values(galleryData).returning();
      
      res.status(201).json(gallery);
    } catch (error) {
      console.error('Error creating gallery:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid gallery data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create gallery' });
    }
  }
);

/**
 * Get all galleries for a community
 * GET /api/community/:communityId/galleries
 */
mediaRouter.get(
  '/:communityId/galleries',
  isAuthenticated,
  isCommunityMember,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      const galleries = await db
        .select()
        .from(communityGalleries)
        .where(eq(communityGalleries.communityId, communityId))
        .orderBy(asc(communityGalleries.sortOrder), desc(communityGalleries.createdAt));
      
      res.status(200).json(galleries);
    } catch (error) {
      console.error('Error getting galleries:', error);
      res.status(500).json({ message: 'Failed to retrieve galleries' });
    }
  }
);

/**
 * Get specific gallery with its media items
 * GET /api/community/:communityId/galleries/:galleryId
 */
mediaRouter.get(
  '/:communityId/galleries/:galleryId',
  isAuthenticated,
  isCommunityMember,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const galleryId = parseInt(req.params.galleryId);
      
      // Get the gallery
      const [gallery] = await db
        .select()
        .from(communityGalleries)
        .where(
          and(
            eq(communityGalleries.id, galleryId),
            eq(communityGalleries.communityId, communityId)
          )
        );
      
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }
      
      // Get gallery items with media data
      const galleryMedia = await db
        .select({
          galleryItem: galleryItems,
          media: communityMedia
        })
        .from(galleryItems)
        .innerJoin(
          communityMedia,
          eq(galleryItems.mediaId, communityMedia.id)
        )
        .where(eq(galleryItems.galleryId, galleryId))
        .orderBy(asc(galleryItems.displayOrder));
      
      // Format response
      const response = {
        ...gallery,
        media: galleryMedia.map(item => ({
          ...item.media,
          displayOrder: item.galleryItem.displayOrder,
          caption: item.galleryItem.caption
        }))
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting gallery:', error);
      res.status(500).json({ message: 'Failed to retrieve gallery' });
    }
  }
);

/**
 * Update a gallery
 * PATCH /api/community/:communityId/galleries/:galleryId
 */
mediaRouter.patch(
  '/:communityId/galleries/:galleryId',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const galleryId = parseInt(req.params.galleryId);
      
      // Check if gallery exists and belongs to the community
      const [existingGallery] = await db
        .select()
        .from(communityGalleries)
        .where(
          and(
            eq(communityGalleries.id, galleryId),
            eq(communityGalleries.communityId, communityId)
          )
        );
      
      if (!existingGallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }
      
      // Update gallery
      const [gallery] = await db
        .update(communityGalleries)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(communityGalleries.id, galleryId))
        .returning();
      
      res.status(200).json(gallery);
    } catch (error) {
      console.error('Error updating gallery:', error);
      res.status(500).json({ message: 'Failed to update gallery' });
    }
  }
);

/**
 * Delete a gallery
 * DELETE /api/community/:communityId/galleries/:galleryId
 */
mediaRouter.delete(
  '/:communityId/galleries/:galleryId',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const galleryId = parseInt(req.params.galleryId);
      
      // Check if gallery exists and belongs to the community
      const [existingGallery] = await db
        .select()
        .from(communityGalleries)
        .where(
          and(
            eq(communityGalleries.id, galleryId),
            eq(communityGalleries.communityId, communityId)
          )
        );
      
      if (!existingGallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }
      
      // Delete gallery items first
      await db
        .delete(galleryItems)
        .where(eq(galleryItems.galleryId, galleryId));
      
      // Then delete the gallery
      await db
        .delete(communityGalleries)
        .where(eq(communityGalleries.id, galleryId));
      
      res.status(200).json({ message: 'Gallery deleted successfully' });
    } catch (error) {
      console.error('Error deleting gallery:', error);
      res.status(500).json({ message: 'Failed to delete gallery' });
    }
  }
);

/**
 * Add media to a gallery
 * POST /api/community/:communityId/galleries/:galleryId/items
 */
mediaRouter.post(
  '/:communityId/galleries/:galleryId/items',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const galleryId = parseInt(req.params.galleryId);
      const { mediaId, displayOrder = 0, caption } = req.body;
      
      // Check if gallery exists and belongs to the community
      const [existingGallery] = await db
        .select()
        .from(communityGalleries)
        .where(
          and(
            eq(communityGalleries.id, galleryId),
            eq(communityGalleries.communityId, communityId)
          )
        );
      
      if (!existingGallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }
      
      // Check if media exists and belongs to the community
      const [existingMedia] = await db
        .select()
        .from(communityMedia)
        .where(
          and(
            eq(communityMedia.id, mediaId),
            eq(communityMedia.communityId, communityId)
          )
        );
      
      if (!existingMedia) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      // Check if item already exists in gallery
      const [existingItem] = await db
        .select()
        .from(galleryItems)
        .where(
          and(
            eq(galleryItems.galleryId, galleryId),
            eq(galleryItems.mediaId, mediaId)
          )
        );
      
      if (existingItem) {
        return res.status(400).json({ message: 'Media already added to this gallery' });
      }
      
      // Validate gallery item data
      const galleryItemData = insertGalleryItemSchema.parse({
        galleryId,
        mediaId,
        displayOrder,
        caption
      });
      
      // Insert into database
      const [galleryItem] = await db.insert(galleryItems).values(galleryItemData).returning();
      
      res.status(201).json(galleryItem);
    } catch (error) {
      console.error('Error adding media to gallery:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid gallery item data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to add media to gallery' });
    }
  }
);

/**
 * Remove media from a gallery
 * DELETE /api/community/:communityId/galleries/:galleryId/items/:mediaId
 */
mediaRouter.delete(
  '/:communityId/galleries/:galleryId/items/:mediaId',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const galleryId = parseInt(req.params.galleryId);
      const mediaId = parseInt(req.params.mediaId);
      
      // Delete gallery item
      await db
        .delete(galleryItems)
        .where(
          and(
            eq(galleryItems.galleryId, galleryId),
            eq(galleryItems.mediaId, mediaId)
          )
        );
      
      res.status(200).json({ message: 'Media removed from gallery successfully' });
    } catch (error) {
      console.error('Error removing media from gallery:', error);
      res.status(500).json({ message: 'Failed to remove media from gallery' });
    }
  }
);

/**
 * Update gallery item (display order and caption)
 * PATCH /api/community/:communityId/galleries/:galleryId/items/:mediaId
 */
mediaRouter.patch(
  '/:communityId/galleries/:galleryId/items/:mediaId',
  isAuthenticated,
  isCommunityAdmin,
  async (req, res) => {
    try {
      const galleryId = parseInt(req.params.galleryId);
      const mediaId = parseInt(req.params.mediaId);
      const { displayOrder, caption } = req.body;
      
      // Update gallery item
      const [updatedItem] = await db
        .update(galleryItems)
        .set({
          displayOrder,
          caption
        })
        .where(
          and(
            eq(galleryItems.galleryId, galleryId),
            eq(galleryItems.mediaId, mediaId)
          )
        )
        .returning();
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating gallery item:', error);
      res.status(500).json({ message: 'Failed to update gallery item' });
    }
  }
);

export default mediaRouter;