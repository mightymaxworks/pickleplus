import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'coach-profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `coach-${req.params.slug}-${req.body.type}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  }
});

// Update coach public profile (inline editing)
router.put('/coach-public-profiles/:slug', isAuthenticated, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('[EDIT API] Updating profile for slug:', slug, 'by user:', userId);
    console.log('[EDIT API] Update data:', req.body);

    // Get the existing profile to verify ownership
    const existingProfile = await storage.getCoachPublicProfileBySlug(slug);
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Verify ownership - only the coach can edit their own profile
    if (existingProfile.userId !== userId) {
      return res.status(403).json({ message: 'You can only edit your own profile' });
    }

    // Validate and sanitize update data
    const allowedFields = [
      'displayName', 'tagline', 'bio', 'location', 'timezone', 'languages',
      'yearsExperience', 'specializations', 'certifications', 'playingLevel',
      'coachingPhilosophy', 'hourlyRate', 'contactEmail', 'phoneNumber', 
      'website', 'profileImageUrl', 'coverImageUrl', 'isPublic', 
      'acceptingNewClients', 'showContactInfo', 'showPricing', 'showReviews'
    ];

    const updateData: any = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    // Handle special field types
    if (updateData.yearsExperience !== undefined) {
      updateData.yearsExperience = parseInt(updateData.yearsExperience) || null;
    }
    if (updateData.hourlyRate !== undefined) {
      updateData.hourlyRate = parseFloat(updateData.hourlyRate) || null;
    }

    console.log('[EDIT API] Sanitized update data:', updateData);

    // Update the profile
    const updatedProfile = await storage.updateCoachPublicProfile(existingProfile.id, updateData);
    
    console.log('[EDIT API] Profile updated successfully:', updatedProfile.id);

    // Return the complete updated profile with relations
    const fullProfile = await storage.getCoachPublicProfileBySlug(slug);
    res.json(fullProfile);

  } catch (error) {
    console.error('[EDIT API] Error updating profile:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload profile or cover image
router.post('/coach-public-profiles/:slug/upload-image', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { slug } = req.params;
    const { type } = req.body; // 'profile' or 'cover'
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!['profile', 'cover'].includes(type)) {
      return res.status(400).json({ message: 'Invalid image type. Must be "profile" or "cover"' });
    }

    console.log('[IMAGE UPLOAD] Uploading', type, 'image for slug:', slug, 'by user:', userId);
    console.log('[IMAGE UPLOAD] File:', file.filename, 'Size:', file.size);

    // Get the existing profile to verify ownership
    const existingProfile = await storage.getCoachPublicProfileBySlug(slug);
    if (!existingProfile) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Verify ownership
    if (existingProfile.userId !== userId) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(403).json({ message: 'You can only edit your own profile' });
    }

    // Generate public URL for the uploaded image
    const imageUrl = `/uploads/coach-profiles/${file.filename}`;
    
    console.log('[IMAGE UPLOAD] Generated URL:', imageUrl);

    // Update the profile with the new image URL
    const updateField = type === 'profile' ? 'profileImageUrl' : 'coverImageUrl';
    const updateData = { [updateField]: imageUrl };
    
    await storage.updateCoachPublicProfile(existingProfile.id, updateData);
    
    console.log('[IMAGE UPLOAD] Profile updated with new image URL');

    res.json({
      success: true,
      imageUrl,
      type,
      filename: file.filename
    });

  } catch (error) {
    console.error('[IMAGE UPLOAD] Error uploading image:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('[IMAGE UPLOAD] Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete profile or cover image
router.delete('/coach-public-profiles/:slug/image/:type', isAuthenticated, async (req, res) => {
  try {
    const { slug, type } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!['profile', 'cover'].includes(type)) {
      return res.status(400).json({ message: 'Invalid image type. Must be "profile" or "cover"' });
    }

    console.log('[IMAGE DELETE] Deleting', type, 'image for slug:', slug, 'by user:', userId);

    // Get the existing profile to verify ownership
    const existingProfile = await storage.getCoachPublicProfileBySlug(slug);
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Verify ownership
    if (existingProfile.userId !== userId) {
      return res.status(403).json({ message: 'You can only edit your own profile' });
    }

    // Get the current image URL to delete the file
    const currentImageUrl = type === 'profile' ? existingProfile.profileImageUrl : existingProfile.coverImageUrl;
    
    // Update the profile to remove the image URL
    const updateField = type === 'profile' ? 'profileImageUrl' : 'coverImageUrl';
    const updateData = { [updateField]: null };
    
    await storage.updateCoachPublicProfile(existingProfile.id, updateData);
    
    // Try to delete the physical file
    if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), currentImageUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[IMAGE DELETE] Physical file deleted:', filePath);
        }
      } catch (fileError) {
        console.warn('[IMAGE DELETE] Could not delete physical file:', fileError);
        // Don't fail the request if file deletion fails
      }
    }
    
    console.log('[IMAGE DELETE] Image removed from profile');

    res.json({
      success: true,
      message: `${type} image deleted successfully`
    });

  } catch (error) {
    console.error('[IMAGE DELETE] Error deleting image:', error);
    res.status(500).json({ 
      message: 'Failed to delete image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;