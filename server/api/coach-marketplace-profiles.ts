import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get coach marketplace profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get the coach marketplace profile
    const profile = await storage.getCoachMarketplaceProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching coach marketplace profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update coach marketplace profile
router.put('/:userId', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUser = req.user;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check ownership
    if (currentUser?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedProfile = await storage.updateCoachMarketplaceProfile(userId, req.body);
    
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating coach marketplace profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;