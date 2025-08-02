/**
 * PCP Certification Validation API Routes
 * PKL-278651-PCP-BASIC-TIER - Sequential Level Progression Enforcement
 * 
 * Validates PCP certification levels and enforces sequential progression
 */

import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { 
  PCP_LEVEL_CONFIG, 
  validatePCPLevelProgression,
  type CompletedPCPLevel
} from '../../shared/schema/coach-management';

const router = Router();

// GET /api/pcp-cert/status/:userId - Get current PCP certification status
router.get('/status/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const coachProfile = await storage.getCoachProfile?.(userId);
    
    if (!coachProfile) {
      return res.json({
        currentLevel: 0,
        completedLevels: [],
        availableNextLevel: 1,
        canProgress: true,
        nextLevelInfo: PCP_LEVEL_CONFIG[1]
      });
    }

    const completedLevels = coachProfile.completedLevels as CompletedPCPLevel[] || [];
    const currentLevel = coachProfile.pcpLevel || 0;
    const nextLevel = currentLevel + 1;
    const canProgress = nextLevel <= 5;

    return res.json({
      currentLevel,
      completedLevels,
      availableNextLevel: canProgress ? nextLevel : null,
      canProgress,
      nextLevelInfo: canProgress ? PCP_LEVEL_CONFIG[nextLevel as keyof typeof PCP_LEVEL_CONFIG] : null,
      allLevels: PCP_LEVEL_CONFIG
    });

  } catch (error) {
    console.error('PCP status check error:', error);
    return res.status(500).json({ message: 'Failed to check PCP status' });
  }
});

// POST /api/pcp-cert/validate-progression - Validate if user can progress to target level
router.post('/validate-progression', async (req, res) => {
  try {
    const { userId, targetLevel } = req.body;
    
    if (!userId || !targetLevel) {
      return res.status(400).json({ message: 'User ID and target level required' });
    }

    const coachProfile = await storage.getCoachProfile?.(userId);
    const currentLevel = coachProfile?.pcpLevel || 0;
    
    const validation = validatePCPLevelProgression(currentLevel, targetLevel);
    
    if (!validation.isValid) {
      return res.status(422).json({
        canProgress: false,
        error: validation.error,
        requiredPath: validation.requiredPath,
        currentLevel,
        targetLevel,
        nextAvailableLevel: currentLevel + 1
      });
    }

    return res.json({
      canProgress: true,
      currentLevel,
      targetLevel,
      levelInfo: PCP_LEVEL_CONFIG[targetLevel as keyof typeof PCP_LEVEL_CONFIG]
    });

  } catch (error) {
    console.error('PCP progression validation error:', error);
    return res.status(500).json({ message: 'Failed to validate progression' });
  }
});

// POST /api/pcp-cert/complete-level - Mark a PCP level as completed
router.post('/complete-level', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user?.id;
    const completionSchema = z.object({
      level: z.number().min(1).max(5),
      certificationNumber: z.string().min(1),
      completedAt: z.string().transform(str => new Date(str)),
      expiresAt: z.string().transform(str => new Date(str)).optional()
    });

    const validatedData = completionSchema.parse(req.body);
    
    const coachProfile = await storage.getCoachProfile?.(userId!);
    const currentLevel = coachProfile?.pcpLevel || 0;
    
    // Validate progression
    const validation = validatePCPLevelProgression(currentLevel, validatedData.level);
    if (!validation.isValid) {
      return res.status(422).json({
        message: validation.error,
        requiredPath: validation.requiredPath
      });
    }

    // Get existing completed levels
    const existingLevels = (coachProfile?.completedLevels as CompletedPCPLevel[]) || [];
    
    // Add new completed level
    const newCompletedLevel: CompletedPCPLevel = {
      level: validatedData.level,
      certificationNumber: validatedData.certificationNumber,
      completedAt: validatedData.completedAt,
      expiresAt: validatedData.expiresAt
    };
    
    const updatedCompletedLevels = [...existingLevels, newCompletedLevel];
    
    // Update coach profile
    const updateData = {
      pcpLevel: validatedData.level,
      completedLevels: updatedCompletedLevels,
      pcpCertificationNumber: validatedData.certificationNumber,
      pcpCertifiedAt: validatedData.completedAt,
      pcpExpiresAt: validatedData.expiresAt,
      updatedAt: new Date()
    };

    let updatedProfile;
    if (coachProfile) {
      updatedProfile = await storage.updateCoachProfile?.(userId!, updateData);
    } else {
      // Create new coach profile if it doesn't exist
      const profileData: any = {
        userId: userId!,
        ...updateData,
        bio: 'Professional PCP-certified coach',
        coachingPhilosophy: 'Committed to excellence in pickleball instruction',
        teachingStyle: 'Adaptive and student-focused approach',
        hourlyRate: 9500, // Default $95
        specializations: ['General Instruction'],
        sessionTypes: ['individual'],
        languagesSpoken: ['English']
      };
      
      updatedProfile = await storage.createCoachProfile?.(profileData);
    }

    return res.json({
      message: `PCP Level ${validatedData.level} completed successfully`,
      profile: updatedProfile,
      nextAvailableLevel: validatedData.level < 5 ? validatedData.level + 1 : null
    });

  } catch (error) {
    console.error('PCP level completion error:', error);
    return res.status(500).json({ message: 'Failed to complete PCP level' });
  }
});

// GET /api/pcp-cert/level-requirements/:level - Get requirements for specific level
router.get('/level-requirements/:level', async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    
    if (level < 1 || level > 5) {
      return res.status(400).json({ message: 'Invalid level. Must be 1-5.' });
    }

    const levelConfig = PCP_LEVEL_CONFIG[level as keyof typeof PCP_LEVEL_CONFIG];
    
    return res.json({
      level,
      config: levelConfig,
      requirements: {
        prerequisite: levelConfig.prerequisite,
        prerequisiteName: levelConfig.prerequisite ? 
          PCP_LEVEL_CONFIG[levelConfig.prerequisite as keyof typeof PCP_LEVEL_CONFIG].name : 
          'None',
        estimatedDuration: getEstimatedDuration(level),
        keySkills: getKeySkills(level)
      }
    });

  } catch (error) {
    console.error('Level requirements error:', error);
    return res.status(500).json({ message: 'Failed to get level requirements' });
  }
});

// Helper functions
function getEstimatedDuration(level: number): string {
  const durations = {
    1: '4-6 weeks',
    2: '6-8 weeks', 
    3: '8-12 weeks',
    4: '12-16 weeks',
    5: '16-24 weeks'
  };
  return durations[level as keyof typeof durations] || 'Variable';
}

function getKeySkills(level: number): string[] {
  const skills = {
    1: ['Basic Rules & Scoring', 'Fundamental Strokes', 'Court Positioning', 'Safety Guidelines'],
    2: ['Advanced Techniques', 'Strategy Development', 'Student Assessment', 'Lesson Planning'],
    3: ['Game Psychology', 'Advanced Tactics', 'Performance Analysis', 'Injury Prevention'],
    4: ['Tournament Preparation', 'Advanced Strategy', 'Player Development', 'Business Skills'],
    5: ['Coaching Mastery', 'Program Development', 'Leadership Skills', 'Innovation Methods']
  };
  return skills[level as keyof typeof skills] || [];
}

module.exports = router;
module.exports.default = router;