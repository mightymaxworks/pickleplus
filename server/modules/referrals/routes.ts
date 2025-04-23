/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * Referral System API Routes
 * 
 * This file implements the API routes for the referral system.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */
import express, { Request, Response, Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import { storage } from '../../storage';
import { nanoid } from 'nanoid';
import { referralService } from './service';

const router = Router();

/**
 * Get referrals made by the current user
 * GET /api/referrals/my
 */
router.get('/my', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user's ID from the authenticated session
    const userId = req.user!.id;
    
    // Get referrals made by this user
    const referrals = await storage.getReferralsByReferrerId(userId);
    
    // Return the referrals
    res.json({
      success: true,
      referrals,
      totalCount: referrals.length
    });
  } catch (error) {
    console.error('Error getting referrals:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get referrals'
    });
  }
});

/**
 * Get achievements earned by the current user
 * GET /api/referrals/achievements
 */
router.get('/achievements', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user's ID from the authenticated session
    const userId = req.user!.id;
    
    // Get achievements earned by this user
    const achievements = await storage.getReferralAchievementsByUserId(userId);
    
    // Return the achievements
    res.json({
      success: true,
      achievements,
      totalCount: achievements.length
    });
  } catch (error) {
    console.error('Error getting referral achievements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get referral achievements'
    });
  }
});

/**
 * Create a new referral
 * POST /api/referrals
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user's ID from the authenticated session
    const referrerId = req.user!.id;
    
    // Get the referred user from the request body
    const { referredUsername } = req.body;
    
    if (!referredUsername) {
      return res.status(400).json({
        success: false,
        error: 'Referred username is required'
      });
    }
    
    // Get the referred user
    const referredUser = await storage.getUserByUsername(referredUsername);
    
    if (!referredUser) {
      return res.status(404).json({
        success: false,
        error: 'Referred user not found'
      });
    }
    
    // Make sure the user is not referring themselves
    if (referrerId === referredUser.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot refer yourself'
      });
    }
    
    // Check if this referral already exists
    const existingReferral = await storage.getReferralByUsers(referrerId, referredUser.id);
    
    if (existingReferral) {
      return res.status(400).json({
        success: false,
        error: 'You have already referred this user'
      });
    }
    
    // Create the referral
    const newReferral = await storage.createReferral({
      referrerId,
      referredUserId: referredUser.id,
      dateReferred: new Date(),
      registrationDate: new Date(),
      xpAwarded: 20 // Base XP for a referral
    });
    
    // Award XP to the referrer
    await storage.awardXpToUser(referrerId, 20, 'referral_bonus');
    
    // Check and award achievements
    await checkAndAwardReferralAchievement(referrerId);
    
    res.status(201).json({
      success: true,
      referral: newReferral,
      xpAwarded: 20
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create referral'
    });
  }
});

/**
 * Get pickleball tips for the ticker
 * GET /api/referrals/tips
 */
router.get('/tips', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    // Get active tips
    const tips = await storage.getPickleballTips({ limit, isActive: true });
    
    res.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error getting pickleball tips:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get pickleball tips'
    });
  }
});

/**
 * Get community activity for the ticker
 * GET /api/referrals/activity
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    // Get community activity
    const activity = await storage.getCommunityActivity(limit);
    
    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Error getting community activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get community activity'
    });
  }
});

/**
 * Admin: Create a new pickleball tip
 * POST /api/referrals/tips
 */
router.post('/tips', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user from the authenticated session
    const user = req.user!;
    
    // Check if the user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create pickleball tips'
      });
    }
    
    const { tipContent, source, displayPriority = 10 } = req.body;
    
    if (!tipContent) {
      return res.status(400).json({
        success: false,
        error: 'Tip content is required'
      });
    }
    
    // Create the tip
    const newTip = await storage.createPickleballTip({
      tipContent,
      source: source || null,
      isActive: true,
      displayPriority
    });
    
    res.status(201).json({
      success: true,
      tip: newTip
    });
  } catch (error) {
    console.error('Error creating pickleball tip:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create pickleball tip'
    });
  }
});

/**
 * Generate a referral link for the current user
 * GET /api/referrals/link
 */
router.get('/link', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user from the authenticated session
    const user = req.user!;
    
    // Generate a unique referral code if the user doesn't have one
    let referralCode = user.referralCode;
    
    if (!referralCode) {
      // User doesn't have a code yet, generate one
      referralCode = nanoid(8); // 8-character unique ID
      
      // Save it to the user
      await storage.updateUser(user.id, { referralCode });
    }
    
    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Generate the full referral link
    const referralLink = `${baseUrl}/join?ref=${referralCode}`;
    
    res.json({
      success: true,
      referralCode,
      referralLink
    });
  } catch (error) {
    console.error('Error generating referral link:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate referral link'
    });
  }
});

/**
 * Get referral statistics for the current user
 * GET /api/referrals/stats
 */
router.get('/stats', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get the user from the authenticated session
    const userId = req.user!.id;
    
    // Get all referrals made by this user
    const referrals = await storage.getReferralsByReferrerId(userId);
    
    // Get achievements earned by this user
    const achievements = await storage.getReferralAchievementsByUserId(userId);
    
    // Calculate statistics
    const totalReferrals = referrals.length;
    
    // Count referrals by activity level
    const activeReferrals = referrals.filter(r => r.activityLevel === 'active').length;
    const casualReferrals = referrals.filter(r => r.activityLevel === 'casual').length;
    const newReferrals = referrals.filter(r => r.activityLevel === 'new').length;
    
    // Calculate conversion rate: active referrals / total referrals
    const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;
    
    // Calculate total XP earned from referrals
    const totalXpEarned = referrals.reduce((sum, referral) => sum + referral.xpAwarded, 0);
    
    // Calculate total bonus XP from achievements
    const totalBonusXp = achievements.reduce((sum, achievement) => sum + achievement.bonusXpAwarded, 0);
    
    // Calculate the next achievement tier
    const nextAchievement = getNextReferralAchievement(totalReferrals);
    
    res.json({
      success: true,
      stats: {
        totalReferrals,
        activeReferrals,
        casualReferrals,
        newReferrals,
        conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
        totalXpEarned,
        totalBonusXp,
        achievements,
        nextAchievement
      }
    });
  } catch (error) {
    console.error('Error getting referral statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get referral statistics'
    });
  }
});

/**
 * Helper function to check and award referral achievements
 */
async function checkAndAwardReferralAchievement(userId: number) {
  try {
    // Get the user's referral count
    const referrals = await storage.getReferralsByReferrerId(userId);
    const referralCount = referrals.length;
    
    // Get the user's existing achievements
    const existingAchievements = await storage.getReferralAchievementsByUserId(userId);
    
    // Define the achievement tiers
    const achievementTiers = [
      {
        tierLevel: 1,
        requiredReferrals: 1,
        bonusXp: 50,
        name: "First Steps",
        description: "Congratulations on your first referral! You're helping grow the Pickle+ community."
      },
      {
        tierLevel: 2,
        requiredReferrals: 5,
        bonusXp: 100,
        name: "Growing Circle",
        description: "You've referred 5 players to Pickle+. Your network is growing!"
      },
      {
        tierLevel: 3,
        requiredReferrals: 15,
        bonusXp: 200,
        name: "Community Builder",
        description: "With 15 referrals, you're a true community builder. Keep spreading the word!"
      },
      {
        tierLevel: 4,
        requiredReferrals: 30,
        bonusXp: 300,
        name: "Pickle Evangelist",
        description: "30 referrals! You're a true Pickle+ evangelist. Your impact on the community is substantial."
      },
      {
        tierLevel: 5,
        requiredReferrals: 50,
        bonusXp: 500,
        name: "Founders Club",
        description: "50 referrals! You've reached legendary status. Welcome to the exclusive Founders Club."
      }
    ];
    
    // For each tier, check if the user qualifies and hasn't already earned it
    for (const tier of achievementTiers) {
      if (
        referralCount >= tier.requiredReferrals && 
        !existingAchievements.some(a => a.tierLevel === tier.tierLevel)
      ) {
        // User qualifies for this achievement, award it
        await storage.createReferralAchievement({
          userId,
          tierLevel: tier.tierLevel,
          dateAchieved: new Date(),
          bonusXpAwarded: tier.bonusXp,
          achievementName: tier.name,
          achievementDescription: tier.description
        });
        
        // Award the bonus XP
        await storage.awardXpToUser(userId, tier.bonusXp, `referral_achievement_tier_${tier.tierLevel}`);
      }
    }
  } catch (error) {
    console.error('Error checking and awarding referral achievements:', error);
    throw error;
  }
}

/**
 * Helper function to get the next referral achievement
 */
function getNextReferralAchievement(referralCount: number) {
  if (referralCount < 1) {
    return {
      name: "First Steps",
      description: "Refer your first player to Pickle+",
      requiredReferrals: 1,
      progress: referralCount * 100, // 0%
      remaining: 1 - referralCount
    };
  } else if (referralCount < 5) {
    return {
      name: "Growing Circle",
      description: "Refer 5 players to Pickle+",
      requiredReferrals: 5,
      progress: (referralCount / 5) * 100,
      remaining: 5 - referralCount
    };
  } else if (referralCount < 15) {
    return {
      name: "Community Builder",
      description: "Refer 15 players to Pickle+",
      requiredReferrals: 15,
      progress: (referralCount / 15) * 100,
      remaining: 15 - referralCount
    };
  } else if (referralCount < 30) {
    return {
      name: "Pickle Evangelist",
      description: "Refer 30 players to Pickle+",
      requiredReferrals: 30,
      progress: (referralCount / 30) * 100,
      remaining: 30 - referralCount
    };
  } else if (referralCount < 50) {
    return {
      name: "Founders Club",
      description: "Refer 50 players to Pickle+",
      requiredReferrals: 50,
      progress: (referralCount / 50) * 100,
      remaining: 50 - referralCount
    };
  } else {
    // Already achieved all tiers
    return {
      name: "All Achievements Completed!",
      description: "You've unlocked all referral achievements",
      requiredReferrals: 50,
      progress: 100,
      remaining: 0
    };
  }
}

export default router;