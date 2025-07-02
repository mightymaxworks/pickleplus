/**
 * PKL-278651-SPRINT3-ASSESSMENT-ANALYSIS - Assessment Analysis Service
 * 
 * Analyzes PCP assessment data to identify weak areas and suggest improvement goals.
 * Core engine for Sprint 3 assessment-goal integration.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

export interface WeakArea {
  skill: string;
  skillLabel: string;
  currentRating: number;
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  priority: 'high' | 'medium' | 'low';
  targetImprovement: number;
  suggestedGoal: string;
  suggestedDescription: string;
  milestoneTemplate: MilestoneTemplate[];
}

export interface MilestoneTemplate {
  title: string;
  description: string;
  targetRating: number;
  orderIndex: number;
}

export interface AssessmentAnalysis {
  playerId: number;
  assessmentId: number;
  overallRating: number;
  dimensionalRatings: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  weakAreas: WeakArea[];
  improvementPotential: number;
  recommendedFocus: string;
}

export class AssessmentAnalysisService {
  
  /**
   * Analyzes assessment data to identify weak areas and improvement opportunities
   */
  static analyzeAssessment(assessmentData: any): AssessmentAnalysis {
    const dimensionalRatings = this.calculateDimensionalRatings(assessmentData);
    const weakAreas = this.identifyWeakAreas(assessmentData, dimensionalRatings);
    const overallRating = this.calculateOverallRating(dimensionalRatings);
    
    return {
      playerId: assessmentData.profile_id,
      assessmentId: assessmentData.id,
      overallRating,
      dimensionalRatings,
      weakAreas: weakAreas.slice(0, 5), // Top 5 weak areas
      improvementPotential: this.calculateImprovementPotential(weakAreas),
      recommendedFocus: this.getRecommendedFocus(weakAreas)
    };
  }

  /**
   * Calculate 4-dimensional ratings from detailed assessment data
   */
  private static calculateDimensionalRatings(assessment: any) {
    // Technical Skills (40% weight) - Average of detailed technical assessments
    const technicalSkills = [
      assessment.serve_execution || 0,
      assessment.return_technique || 0,
      assessment.third_shot || 0,
      assessment.overhead_defense || 0,
      assessment.shot_creativity || 0,
      assessment.court_movement || 0,
      // Groundstrokes breakdown
      (assessment.forehand_topspin + assessment.forehand_slice + 
       assessment.backhand_topspin + assessment.backhand_slice) / 4 || 0,
      // Net play breakdown
      this.calculateNetPlayAverage(assessment)
    ].filter(rating => rating > 0);

    // Tactical Awareness (25% weight)
    const tacticalSkills = [
      assessment.shot_selection || 0,
      assessment.court_positioning || 0,
      assessment.pattern_recognition || 0,
      assessment.risk_management || 0,
      assessment.communication || 0
    ].filter(rating => rating > 0);

    // Physical Attributes (20% weight)
    const physicalSkills = [
      assessment.footwork || 0,
      assessment.balance_stability || 0,
      assessment.reaction_time || 0,
      assessment.endurance || 0
    ].filter(rating => rating > 0);

    // Mental Game (15% weight)
    const mentalSkills = [
      assessment.focus_concentration || 0,
      assessment.pressure_performance || 0,
      assessment.adaptability || 0,
      assessment.sportsmanship || 0
    ].filter(rating => rating > 0);

    return {
      technical: this.average(technicalSkills),
      tactical: this.average(tacticalSkills),
      physical: this.average(physicalSkills),
      mental: this.average(mentalSkills)
    };
  }

  /**
   * Calculate net play average from detailed breakdown
   */
  private static calculateNetPlayAverage(assessment: any): number {
    const netPlaySkills = [
      assessment.forehand_dead_dink,
      assessment.forehand_topspin_dink,
      assessment.forehand_slice_dink,
      assessment.backhand_dead_dink,
      assessment.backhand_topspin_dink,
      assessment.backhand_slice_dink,
      assessment.forehand_block_volley,
      assessment.forehand_drive_volley,
      assessment.forehand_dink_volley,
      assessment.backhand_block_volley,
      assessment.backhand_drive_volley,
      assessment.backhand_dink_volley
    ].filter(rating => rating !== null && rating !== undefined && rating > 0);

    return netPlaySkills.length > 0 ? this.average(netPlaySkills) : 0;
  }

  /**
   * Identify weak areas that need improvement (ratings < 6.0)
   */
  private static identifyWeakAreas(assessment: any, dimensionalRatings: any): WeakArea[] {
    const weakAreas: WeakArea[] = [];
    const WEAK_THRESHOLD = 6.0;

    // Define skill mappings with categories and templates
    const skillMappings = {
      // Technical Skills
      serve_execution: {
        label: 'Serve Execution',
        category: 'technical' as const,
        goalTemplate: 'Improve serve consistency and placement',
        descriptionTemplate: 'Focus on developing reliable serve technique with improved accuracy and power'
      },
      return_technique: {
        label: 'Return Technique',
        category: 'technical' as const,
        goalTemplate: 'Enhance return of serve technique',
        descriptionTemplate: 'Develop consistent and aggressive return techniques for different serve types'
      },
      third_shot: {
        label: 'Third Shot Drop',
        category: 'technical' as const,
        goalTemplate: 'Master third shot drop technique',
        descriptionTemplate: 'Improve third shot drop consistency and placement to gain net position'
      },
      forehand_topspin: {
        label: 'Forehand Topspin',
        category: 'technical' as const,
        goalTemplate: 'Develop forehand topspin power and consistency',
        descriptionTemplate: 'Build reliable forehand topspin technique for aggressive groundstroke play'
      },
      backhand_slice: {
        label: 'Backhand Slice',
        category: 'technical' as const,
        goalTemplate: 'Improve backhand slice technique and placement',
        descriptionTemplate: 'Master backhand slice for defensive play and court positioning'
      },
      forehand_dead_dink: {
        label: 'Forehand Dead Dink',
        category: 'technical' as const,
        goalTemplate: 'Perfect soft forehand dinking technique',
        descriptionTemplate: 'Develop precise control for forehand dead dinks at the net'
      },
      backhand_dink_volley: {
        label: 'Backhand Dink Volley',
        category: 'technical' as const,
        goalTemplate: 'Master backhand dink volley technique',
        descriptionTemplate: 'Improve backhand dink volley control and placement at the net'
      },
      
      // Tactical Skills
      shot_selection: {
        label: 'Shot Selection',
        category: 'tactical' as const,
        goalTemplate: 'Improve tactical shot selection',
        descriptionTemplate: 'Develop better decision-making for shot selection in different game situations'
      },
      court_positioning: {
        label: 'Court Positioning',
        category: 'tactical' as const,
        goalTemplate: 'Enhance court positioning awareness',
        descriptionTemplate: 'Improve strategic positioning for better court coverage and shot opportunities'
      },
      pattern_recognition: {
        label: 'Pattern Recognition',
        category: 'tactical' as const,
        goalTemplate: 'Develop pattern recognition skills',
        descriptionTemplate: 'Learn to identify and exploit opponent patterns and tendencies'
      },

      // Physical Skills
      footwork: {
        label: 'Footwork',
        category: 'physical' as const,
        goalTemplate: 'Improve court movement and footwork',
        descriptionTemplate: 'Enhance agility and footwork for better court coverage and shot preparation'
      },
      balance_stability: {
        label: 'Balance & Stability',
        category: 'physical' as const,
        goalTemplate: 'Enhance balance and stability',
        descriptionTemplate: 'Improve core strength and balance for more consistent shot execution'
      },
      reaction_time: {
        label: 'Reaction Time',
        category: 'physical' as const,
        goalTemplate: 'Quicken reaction time and reflexes',
        descriptionTemplate: 'Develop faster reaction time for improved defensive play and net exchanges'
      },

      // Mental Skills
      focus_concentration: {
        label: 'Focus & Concentration',
        category: 'mental' as const,
        goalTemplate: 'Strengthen mental focus and concentration',
        descriptionTemplate: 'Develop better concentration skills for consistent performance throughout matches'
      },
      pressure_performance: {
        label: 'Pressure Performance',
        category: 'mental' as const,
        goalTemplate: 'Improve performance under pressure',
        descriptionTemplate: 'Build mental resilience for better performance in high-pressure situations'
      },
      adaptability: {
        label: 'Adaptability',
        category: 'mental' as const,
        goalTemplate: 'Enhance tactical adaptability',
        descriptionTemplate: 'Develop ability to adapt strategy and tactics during matches'
      }
    };

    // Analyze individual skills
    Object.entries(skillMappings).forEach(([skillKey, skillInfo]) => {
      const rating = assessment[skillKey];
      if (rating && rating < WEAK_THRESHOLD) {
        const targetImprovement = Math.min(2.0, 8.0 - rating); // Aim for 8.0 or +2.0 improvement
        const priority = rating < 4.0 ? 'high' : rating < 5.0 ? 'medium' : 'low';

        weakAreas.push({
          skill: skillKey,
          skillLabel: skillInfo.label,
          currentRating: rating,
          category: skillInfo.category,
          priority,
          targetImprovement,
          suggestedGoal: skillInfo.goalTemplate,
          suggestedDescription: skillInfo.descriptionTemplate,
          milestoneTemplate: this.generateMilestoneTemplate(rating, rating + targetImprovement, skillInfo.label)
        });
      }
    });

    // Sort by priority and improvement potential
    return weakAreas.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.targetImprovement - a.targetImprovement;
    });
  }

  /**
   * Generate milestone templates for skill improvement
   */
  private static generateMilestoneTemplate(currentRating: number, targetRating: number, skillLabel: string): MilestoneTemplate[] {
    const improvement = targetRating - currentRating;
    const milestones: MilestoneTemplate[] = [];

    if (improvement >= 1.5) {
      // 3 milestones for significant improvement
      milestones.push({
        title: `Master Basic ${skillLabel} Form`,
        description: `Focus on proper technique and form fundamentals`,
        targetRating: Math.round((currentRating + improvement * 0.33) * 10) / 10,
        orderIndex: 0
      });
      milestones.push({
        title: `Achieve Consistency in ${skillLabel}`,
        description: `Develop reliable execution in practice drills`,
        targetRating: Math.round((currentRating + improvement * 0.67) * 10) / 10,
        orderIndex: 1
      });
      milestones.push({
        title: `Apply ${skillLabel} in Match Play`,
        description: `Successfully use skill in competitive situations`,
        targetRating: targetRating,
        orderIndex: 2
      });
    } else {
      // 2 milestones for moderate improvement
      milestones.push({
        title: `Improve ${skillLabel} Technique`,
        description: `Focus on technical refinement and consistency`,
        targetRating: Math.round((currentRating + improvement * 0.5) * 10) / 10,
        orderIndex: 0
      });
      milestones.push({
        title: `Master ${skillLabel} Application`,
        description: `Apply improved technique in game situations`,
        targetRating: targetRating,
        orderIndex: 1
      });
    }

    return milestones;
  }

  /**
   * Calculate overall PCP rating using weighted dimensional scores
   */
  private static calculateOverallRating(dimensionalRatings: any): number {
    return (
      dimensionalRatings.technical * 0.40 +
      dimensionalRatings.tactical * 0.25 +
      dimensionalRatings.physical * 0.20 +
      dimensionalRatings.mental * 0.15
    );
  }

  /**
   * Calculate improvement potential based on weak areas
   */
  private static calculateImprovementPotential(weakAreas: WeakArea[]): number {
    if (weakAreas.length === 0) return 0;
    return weakAreas.reduce((sum, area) => sum + area.targetImprovement, 0) / weakAreas.length;
  }

  /**
   * Get recommended focus area based on weak areas
   */
  private static getRecommendedFocus(weakAreas: WeakArea[]): string {
    if (weakAreas.length === 0) return 'Continue maintaining current skill levels';
    
    const categoryCounts = weakAreas.reduce((counts, area) => {
      counts[area.category] = (counts[area.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCounts).reduce((a, b) => 
      categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b
    )[0];

    const categoryFocus = {
      technical: 'Focus on technical skill development and shot execution',
      tactical: 'Emphasize tactical awareness and game strategy',
      physical: 'Prioritize physical conditioning and movement',
      mental: 'Strengthen mental game and competitive mindset'
    };

    return categoryFocus[topCategory as keyof typeof categoryFocus] || 'Focus on overall skill development';
  }

  /**
   * Helper function to calculate average of array
   */
  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}