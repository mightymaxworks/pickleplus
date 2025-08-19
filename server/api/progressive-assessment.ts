// Server-side API for Progressive Assessment Model
import { Request, Response } from 'express';
import { db } from '../db';
import { 
  playerSkillRatings, 
  skillAssessmentHistory, 
  pcpAssessmentResults,
  skillFreshnessMetrics 
} from '../../shared/schema/progressive-assessment';
import { eq, and, desc } from 'drizzle-orm';
import { 
  calculatePCPRatingFromProfile,
  updatePlayerSkillRating,
  type PlayerSkillProfile,
  type IndividualSkillRating
} from '../../shared/utils/pcpCalculation';

/**
 * Get player's current skill profile with individual skill ratings
 */
export async function getPlayerSkillProfile(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const skillRatings = await db
      .select()
      .from(playerSkillRatings)
      .where(eq(playerSkillRatings.playerId, parseInt(playerId)));

    // Convert to PlayerSkillProfile format
    const skillProfile: PlayerSkillProfile = {};
    
    skillRatings.forEach(skill => {
      skillProfile[skill.skillName] = {
        currentRating: parseFloat(skill.currentRating),
        lastAssessed: skill.lastAssessed.toISOString(),
        assessmentCount: skill.assessmentCount,
        lastCoachId: skill.lastCoachId || undefined,
        trendDirection: skill.trendDirection as 'improving' | 'stable' | 'declining' | undefined,
        monthlyChange: skill.monthlyChange ? parseFloat(skill.monthlyChange) : undefined
      };
    });

    res.json({
      success: true,
      data: {
        playerId: parseInt(playerId),
        skillProfile,
        totalSkills: Object.keys(skillProfile).length,
        lastUpdated: skillRatings.length > 0 ? 
          Math.max(...skillRatings.map(s => s.lastAssessed.getTime())) : null
      }
    });

  } catch (error) {
    console.error('Error fetching player skill profile:', error);
    res.status(500).json({ error: 'Failed to fetch player skill profile' });
  }
}

/**
 * Update individual skill ratings from focused assessment session
 */
export async function updateSkillsFromAssessment(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { skills, coachId, sessionNotes, assessmentType = 'focused' } = req.body;

    if (!playerId || !skills || !coachId) {
      return res.status(400).json({ 
        error: 'Player ID, skills array, and coach ID are required' 
      });
    }

    // Get current skill profile
    const currentSkills = await db
      .select()
      .from(playerSkillRatings)
      .where(eq(playerSkillRatings.playerId, parseInt(playerId)));

    const skillProfile: PlayerSkillProfile = {};
    currentSkills.forEach(skill => {
      skillProfile[skill.skillName] = {
        currentRating: parseFloat(skill.currentRating),
        lastAssessed: skill.lastAssessed.toISOString(),
        assessmentCount: skill.assessmentCount,
        lastCoachId: skill.lastCoachId || undefined,
        trendDirection: skill.trendDirection as 'improving' | 'stable' | 'declining' | undefined,
        monthlyChange: skill.monthlyChange ? parseFloat(skill.monthlyChange) : undefined
      };
    });

    // Update skills from assessment
    const updatedSkills: string[] = [];
    
    for (const { skillName, rating } of skills) {
      if (rating < 1 || rating > 10) {
        return res.status(400).json({ 
          error: `Invalid rating ${rating} for skill ${skillName}. Must be between 1-10.` 
        });
      }

      // Update skill profile
      const updatedProfile = updatePlayerSkillRating(
        skillProfile, 
        skillName, 
        rating, 
        parseInt(coachId)
      );
      
      skillProfile[skillName] = updatedProfile[skillName];
      updatedSkills.push(skillName);

      // Upsert to database
      await db
        .insert(playerSkillRatings)
        .values({
          playerId: parseInt(playerId),
          skillName,
          currentRating: rating.toString(),
          assessmentCount: skillProfile[skillName].assessmentCount,
          lastAssessed: new Date(),
          lastCoachId: parseInt(coachId),
          trendDirection: skillProfile[skillName].trendDirection,
          monthlyChange: skillProfile[skillName].monthlyChange?.toString(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [playerSkillRatings.playerId, playerSkillRatings.skillName],
          set: {
            currentRating: rating.toString(),
            assessmentCount: skillProfile[skillName].assessmentCount,
            lastAssessed: new Date(),
            lastCoachId: parseInt(coachId),
            trendDirection: skillProfile[skillName].trendDirection,
            monthlyChange: skillProfile[skillName].monthlyChange?.toString(),
            updatedAt: new Date()
          }
        });

      // Record in assessment history
      await db.insert(skillAssessmentHistory).values({
        playerId: parseInt(playerId),
        skillName,
        rating: rating.toString(),
        coachId: parseInt(coachId),
        sessionNotes,
        assessmentType,
        skillsAssessedCount: skills.length,
        isPartialSession: assessmentType === 'focused'
      });
    }

    // Calculate updated PCP rating
    const pcpResult = calculatePCPRatingFromProfile(skillProfile);

    // Store PCP assessment result
    await db.insert(pcpAssessmentResults).values({
      playerId: parseInt(playerId),
      coachId: parseInt(coachId),
      calculatedPcpRating: pcpResult.pcpRating.toString(),
      rawWeightedScore: pcpResult.rawWeightedScore.toString(),
      touchAverage: pcpResult.categoryAverages.touch.toString(),
      technicalAverage: pcpResult.categoryAverages.technical.toString(),
      mentalAverage: pcpResult.categoryAverages.mental.toString(),
      athleticAverage: pcpResult.categoryAverages.athletic.toString(),
      powerAverage: pcpResult.categoryAverages.power.toString(),
      skillsAssessedCount: skills.length,
      isCompleteAssessment: pcpResult.isComplete,
      confidenceScore: pcpResult.confidenceScore.toString()
    });

    res.json({
      success: true,
      data: {
        updatedSkills,
        skillsAssessed: skills.length,
        newPcpRating: pcpResult.pcpRating,
        confidenceScore: pcpResult.confidenceScore,
        assessmentComplete: pcpResult.isComplete,
        categoryAverages: pcpResult.categoryAverages
      }
    });

  } catch (error) {
    console.error('Error updating skills from assessment:', error);
    res.status(500).json({ error: 'Failed to update skill assessments' });
  }
}

/**
 * Get PCP rating calculated from current skill profile
 */
export async function getCalculatedPCPRating(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    // Get current skill profile
    const skillRatings = await db
      .select()
      .from(playerSkillRatings)
      .where(eq(playerSkillRatings.playerId, parseInt(playerId)));

    if (skillRatings.length === 0) {
      return res.json({
        success: true,
        data: {
          pcpRating: null,
          message: 'No skill assessments found for this player'
        }
      });
    }

    // Convert to skill profile format
    const skillProfile: PlayerSkillProfile = {};
    skillRatings.forEach(skill => {
      skillProfile[skill.skillName] = {
        currentRating: parseFloat(skill.currentRating),
        lastAssessed: skill.lastAssessed.toISOString(),
        assessmentCount: skill.assessmentCount,
        lastCoachId: skill.lastCoachId || undefined,
        trendDirection: skill.trendDirection as 'improving' | 'stable' | 'declining' | undefined,
        monthlyChange: skill.monthlyChange ? parseFloat(skill.monthlyChange) : undefined
      };
    });

    // Calculate PCP rating
    const pcpResult = calculatePCPRatingFromProfile(skillProfile);

    res.json({
      success: true,
      data: {
        pcpRating: pcpResult.pcpRating,
        categoryAverages: pcpResult.categoryAverages,
        confidenceScore: pcpResult.confidenceScore,
        skillFreshness: pcpResult.skillFreshness,
        totalSkillsAssessed: pcpResult.totalSkillsAssessed,
        isComplete: pcpResult.isComplete,
        calculationTimestamp: pcpResult.calculationTimestamp
      }
    });

  } catch (error) {
    console.error('Error calculating PCP rating:', error);
    res.status(500).json({ error: 'Failed to calculate PCP rating' });
  }
}

/**
 * Get skill assessment history for a player
 */
export async function getSkillAssessmentHistory(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { skillName, limit = 10 } = req.query;
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    let query = db
      .select()
      .from(skillAssessmentHistory)
      .where(eq(skillAssessmentHistory.playerId, parseInt(playerId)))
      .orderBy(desc(skillAssessmentHistory.assessmentDate))
      .limit(parseInt(limit as string));

    if (skillName) {
      query = query.where(and(
        eq(skillAssessmentHistory.playerId, parseInt(playerId)),
        eq(skillAssessmentHistory.skillName, skillName as string)
      ));
    }

    const history = await query;

    res.json({
      success: true,
      data: history.map(record => ({
        ...record,
        rating: parseFloat(record.rating)
      }))
    });

  } catch (error) {
    console.error('Error fetching skill assessment history:', error);
    res.status(500).json({ error: 'Failed to fetch assessment history' });
  }
}

/**
 * Get skills that need updating based on freshness criteria
 */
export async function getSkillsNeedingUpdate(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { maxAge = 90 } = req.query; // Days
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }

    const skillRatings = await db
      .select()
      .from(playerSkillRatings)
      .where(eq(playerSkillRatings.playerId, parseInt(playerId)));

    const maxAgeMs = parseInt(maxAge as string) * 24 * 60 * 60 * 1000;
    const now = new Date();
    
    const staleSkills = skillRatings.filter(skill => {
      const assessmentAge = now.getTime() - skill.lastAssessed.getTime();
      return assessmentAge > maxAgeMs;
    });

    res.json({
      success: true,
      data: {
        staleSkills: staleSkills.map(skill => ({
          skillName: skill.skillName,
          currentRating: parseFloat(skill.currentRating),
          lastAssessed: skill.lastAssessed,
          daysSinceAssessment: Math.floor((now.getTime() - skill.lastAssessed.getTime()) / (24 * 60 * 60 * 1000))
        })),
        totalStale: staleSkills.length,
        totalSkills: skillRatings.length,
        freshnessPercentage: Math.round(((skillRatings.length - staleSkills.length) / skillRatings.length) * 100)
      }
    });

  } catch (error) {
    console.error('Error checking skill freshness:', error);
    res.status(500).json({ error: 'Failed to check skill freshness' });
  }
}