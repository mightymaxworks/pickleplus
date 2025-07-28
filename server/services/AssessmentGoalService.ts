/**
 * Sprint 3: Assessment-Goal Integration Service
 * Core business logic for connecting assessments with goal generation and tracking
 */

import { storage } from "../storage";
import { 
  WeakArea, 
  GoalRecommendation, 
  MilestoneTemplate,
  AssessmentAnalysis,
  GoalAssessmentProgress
} from "../../shared/schema/assessment-goals";

export class AssessmentGoalService {

  /**
   * Generate intelligent goal recommendations from assessment data
   */
  static async generateGoalsFromAssessment(
    assessmentId: number, 
    coachId: number
  ): Promise<GoalRecommendation[]> {
    console.log(`[AssessmentGoalService] Generating goals from assessment ${assessmentId}`);
    
    try {
      // Get assessment data
      const assessment = await storage.getAssessmentById(assessmentId, coachId);
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Analyze weak areas and generate recommendations
      const weakAreas = await this.analyzeWeakAreas(assessmentId, coachId);
      const recommendations: GoalRecommendation[] = [];

      // Generate goals for each significant weak area
      for (const weakArea of weakAreas.weakAreas) {
        if (weakArea.priority === 'high' || weakArea.priority === 'medium') {
          const goal = await this.createGoalRecommendation(weakArea, assessment);
          recommendations.push(goal);
        }
      }

      console.log(`[AssessmentGoalService] Generated ${recommendations.length} goal recommendations`);
      return recommendations;
    } catch (error) {
      console.error("Error generating goals from assessment:", error);
      throw error;
    }
  }

  /**
   * Analyze weak areas from assessment data
   */
  static async analyzeWeakAreas(
    assessmentId: number, 
    coachId: number
  ): Promise<{ assessmentId: number; weakAreas: WeakArea[]; overallRating: number; improvementPotential: number }> {
    console.log(`[AssessmentGoalService] Analyzing weak areas for assessment ${assessmentId}`);
    
    try {
      const assessment = await storage.getAssessmentById(assessmentId, coachId);
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Convert assessment ratings to 0-80 scale (PCP standard)
      const technical = assessment.technical_rating || assessment.calculated_technical || 40;
      const tactical = assessment.tactical_rating || assessment.calculated_tactical || 40; 
      const physical = assessment.physical_rating || assessment.calculated_physical || 40;
      const mental = assessment.mental_rating || assessment.calculated_mental || 40;

      const overallRating = Math.round((technical + tactical + physical + mental) / 4);
      
      // Calculate weak areas based on PCP methodology
      const weakAreas: WeakArea[] = [];
      
      // Technical dimension analysis (40% weight in PCP)
      if (technical < 50) {
        weakAreas.push({
          dimension: 'technical',
          currentRating: technical,
          targetRating: Math.min(80, technical + 15),
          priority: technical < 35 ? 'high' : 'medium',
          suggestedGoal: `Improve technical fundamentals from ${technical}/80 to ${Math.min(80, technical + 15)}/80`,
          improvementPotential: Math.min(30, 80 - technical)
        });
      }

      // Tactical dimension analysis (25% weight in PCP)
      if (tactical < 50) {
        weakAreas.push({
          dimension: 'tactical',
          currentRating: tactical,
          targetRating: Math.min(80, tactical + 12),
          priority: tactical < 35 ? 'high' : 'medium',
          suggestedGoal: `Enhance tactical awareness from ${tactical}/80 to ${Math.min(80, tactical + 12)}/80`,
          improvementPotential: Math.min(25, 80 - tactical)
        });
      }

      // Physical dimension analysis (20% weight in PCP)
      if (physical < 50) {
        weakAreas.push({
          dimension: 'physical',
          currentRating: physical,
          targetRating: Math.min(80, physical + 10),
          priority: physical < 35 ? 'high' : 'medium',
          suggestedGoal: `Build physical conditioning from ${physical}/80 to ${Math.min(80, physical + 10)}/80`,
          improvementPotential: Math.min(20, 80 - physical)
        });
      }

      // Mental dimension analysis (15% weight in PCP)
      if (mental < 50) {
        weakAreas.push({
          dimension: 'mental',
          currentRating: mental,
          targetRating: Math.min(80, mental + 8),
          priority: mental < 35 ? 'high' : 'medium',
          suggestedGoal: `Strengthen mental game from ${mental}/80 to ${Math.min(80, mental + 8)}/80`,
          improvementPotential: Math.min(15, 80 - mental)
        });
      }

      // Sort by priority and improvement potential
      weakAreas.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.improvementPotential - a.improvementPotential;
      });

      const improvementPotential = weakAreas.reduce((sum, area) => sum + area.improvementPotential, 0);

      console.log(`[AssessmentGoalService] Identified ${weakAreas.length} weak areas with ${improvementPotential} total improvement potential`);
      
      return {
        assessmentId,
        weakAreas,
        overallRating,
        improvementPotential
      };
    } catch (error) {
      console.error("Error analyzing weak areas:", error);
      throw error;
    }
  }

  /**
   * Create goal recommendation from weak area analysis
   */
  private static async createGoalRecommendation(
    weakArea: WeakArea, 
    assessment: any
  ): Promise<GoalRecommendation> {
    
    // Generate milestone templates based on improvement needed
    const improvementNeeded = weakArea.targetRating - weakArea.currentRating;
    const milestones: MilestoneTemplate[] = [];
    
    // Create 3-4 progressive milestones
    const milestoneCount = improvementNeeded > 20 ? 4 : 3;
    const ratingIncrement = improvementNeeded / milestoneCount;
    
    for (let i = 1; i <= milestoneCount; i++) {
      const milestoneRating = Math.round(weakArea.currentRating + (ratingIncrement * i));
      milestones.push({
        title: `${weakArea.dimension.charAt(0).toUpperCase() + weakArea.dimension.slice(1)} Milestone ${i}`,
        description: await this.getMilestoneDescription(weakArea.dimension, milestoneRating, i),
        targetRating: milestoneRating,
        orderIndex: i,
        validationCriteria: await this.getValidationCriteria(weakArea.dimension, milestoneRating)
      });
    }

    // Determine difficulty based on current rating and improvement needed
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (weakArea.currentRating < 30) difficulty = 'beginner';
    else if (weakArea.currentRating > 60) difficulty = 'advanced';

    // Estimate duration based on improvement needed and dimension
    const estimatedWeeks = Math.ceil(improvementNeeded / 2); // ~2 rating points per week
    const estimatedDuration = estimatedWeeks < 4 ? `${estimatedWeeks} weeks` : `${Math.ceil(estimatedWeeks / 4)} months`;

    return {
      title: `Improve ${weakArea.dimension.charAt(0).toUpperCase() + weakArea.dimension.slice(1)} Skills`,
      description: weakArea.suggestedGoal,
      category: weakArea.dimension,
      targetImprovement: improvementNeeded,
      difficulty,
      estimatedDuration,
      milestones
    };
  }

  /**
   * Generate milestone descriptions based on dimension and target rating
   */
  private static async getMilestoneDescription(dimension: string, targetRating: number, milestoneNumber: number): Promise<string> {
    const descriptions: Record<string, string[]> = {
      technical: [
        "Master basic stroke fundamentals and court positioning",
        "Develop consistent shot placement and power control", 
        "Execute advanced shot selection and spin variations",
        "Demonstrate elite-level precision and technique"
      ],
      tactical: [
        "Understand basic game strategy and shot patterns",
        "Apply situational awareness and opponent analysis",
        "Execute complex tactical combinations and court management",
        "Master advanced strategic thinking and game control"
      ],
      physical: [
        "Build foundational fitness and movement efficiency",
        "Develop explosive power and endurance capacity",
        "Achieve advanced athleticism and injury prevention",
        "Maintain peak physical conditioning and recovery"
      ],
      mental: [
        "Develop focus and basic mental routines",
        "Build confidence and emotional control under pressure",
        "Master advanced mental strategies and resilience",
        "Achieve champion-level mental toughness and leadership"
      ]
    };

    const dimensionDescriptions = descriptions[dimension] || descriptions.technical;
    return dimensionDescriptions[Math.min(milestoneNumber - 1, dimensionDescriptions.length - 1)];
  }

  /**
   * Get validation criteria for milestone achievement
   */
  private static async getValidationCriteria(dimension: string, targetRating: number): Promise<string> {
    const criteria: Record<string, string> = {
      technical: `Demonstrate ${targetRating}/80 technical proficiency in coach assessment`,
      tactical: `Show ${targetRating}/80 tactical understanding in match scenarios`,
      physical: `Achieve ${targetRating}/80 physical fitness benchmarks`,
      mental: `Display ${targetRating}/80 mental strength under pressure`
    };

    return criteria[dimension] || criteria.technical;
  }

  /**
   * Create goals from assessment insights
   */
  static async createGoalsFromAssessment(
    assessmentId: number,
    selectedGoals: any[],
    customizations: any,
    coachId: number
  ): Promise<any[]> {
    console.log(`[AssessmentGoalService] Creating ${selectedGoals?.length} goals from assessment ${assessmentId}`);
    
    try {
      const createdGoals = [];
      
      for (const goalData of selectedGoals) {
        // Apply customizations if provided
        const customizedGoal = {
          ...goalData,
          ...customizations,
          assessment_id: assessmentId,
          coach_id: coachId,
          created_from_assessment: true
        };

        const goal = await storage.createGoalFromAssessment(customizedGoal);
        createdGoals.push(goal);

        // Link goal to assessment
        await storage.linkGoalToAssessment(goal.id, assessmentId, goalData.category);
      }

      console.log(`[AssessmentGoalService] Successfully created ${createdGoals.length} goals`);
      return createdGoals;
    } catch (error) {
      console.error("Error creating goals from assessment:", error);
      throw error;
    }
  }

  /**
   * Update goal progress with new assessment data
   */
  static async updateGoalProgress(
    goalId: number,
    assessmentId: number,
    newRating: number,
    milestoneReached: boolean,
    coachId: number
  ): Promise<GoalAssessmentProgress> {
    console.log(`[AssessmentGoalService] Updating goal ${goalId} progress with assessment ${assessmentId}`);
    
    try {
      // Get baseline rating from goal creation
      const goalAssessmentLink = await storage.getGoalAssessmentLink(goalId, coachId);
      const baselineRating = goalAssessmentLink?.baseline_rating || 0;
      
      // Calculate improvement and progress percentage
      const improvementAmount = newRating - baselineRating;
      const targetRating = goalAssessmentLink?.target_rating || baselineRating + 15;
      const progressPercentage = Math.min(100, Math.round((improvementAmount / (targetRating - baselineRating)) * 100));

      // Create progress record
      const progressUpdate = await storage.recordGoalProgress({
        goal_id: goalId,
        assessment_id: assessmentId,
        baseline_rating: baselineRating,
        current_rating: newRating,
        improvement_amount: improvementAmount,
        milestone_reached: milestoneReached,
        progress_percentage: progressPercentage
      });

      console.log(`[AssessmentGoalService] Goal progress updated: ${improvementAmount} point improvement, ${progressPercentage}% complete`);
      return progressUpdate;
    } catch (error) {
      console.error("Error updating goal progress:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive goal analytics for a student
   */
  static async getGoalAnalytics(studentId: number, coachId: number): Promise<any> {
    console.log(`[AssessmentGoalService] Fetching goal analytics for student ${studentId}`);
    
    try {
      const analytics = {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        averageProgress: 0,
        improvementTrends: {},
        recentMilestones: [],
        nextMilestones: []
      };

      // Get all goals for student
      const goals = await storage.getStudentGoals(studentId, coachId);
      analytics.totalGoals = goals.length;
      analytics.activeGoals = goals.filter(g => g.status === 'active').length;
      analytics.completedGoals = goals.filter(g => g.status === 'completed').length;

      // Calculate average progress
      const progressValues = goals.map(g => g.progress_percentage || 0);
      analytics.averageProgress = progressValues.length > 0 
        ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length)
        : 0;

      // Get recent milestones and upcoming ones
      analytics.recentMilestones = await storage.getRecentMilestones(studentId, coachId, 5);
      analytics.nextMilestones = await storage.getUpcomingMilestones(studentId, coachId, 5);

      console.log(`[AssessmentGoalService] Goal analytics: ${analytics.totalGoals} total, ${analytics.averageProgress}% avg progress`);
      return analytics;
    } catch (error) {
      console.error("Error fetching goal analytics:", error);
      throw error;
    }
  }

  /**
   * Get complete workflow data for a student
   */
  static async getCompleteWorkflow(studentId: number, coachId: number): Promise<any> {
    console.log(`[AssessmentGoalService] Fetching complete workflow for student ${studentId}`);
    
    try {
      const workflow = {
        student: await storage.getStudentProfile(studentId),
        latestAssessment: await storage.getLatestAssessmentForStudent(studentId, coachId),
        assessmentTrends: await storage.getAssessmentTrends(studentId, coachId, "3months"),
        activeGoals: await storage.getActiveGoals(studentId, coachId),
        recentProgress: await storage.getRecentDrillCompletions(studentId, coachId, 10),
        upcomingMilestones: await storage.getUpcomingMilestones(studentId, coachId, 3)
      };

      console.log(`[AssessmentGoalService] Complete workflow retrieved for student ${studentId}`);
      return workflow;
    } catch (error) {
      console.error("Error fetching complete workflow:", error);
      throw error;
    }
  }

  /**
   * Get coach dashboard metrics including assessment-goal correlations
   */
  static async getCoachDashboardMetrics(coachId: number): Promise<any> {
    console.log(`[AssessmentGoalService] Fetching dashboard metrics for coach ${coachId}`);
    
    try {
      const metrics = {
        totalStudents: 0,
        totalAssessments: 0,
        totalGoals: 0,
        averageGoalProgress: 0,
        studentsWithActiveGoals: 0,
        recentAssessments: [],
        goalCompletionRate: 0,
        improvementTrends: {}
      };

      // Get basic counts
      metrics.totalStudents = await storage.getCoachStudentCount(coachId);
      metrics.totalAssessments = await storage.getCoachAssessmentCount(coachId);
      metrics.totalGoals = await storage.getCoachGoalCount(coachId);

      // Get recent assessments
      metrics.recentAssessments = await storage.getRecentAssessments(coachId, 5);

      // Calculate goal metrics
      const goalStats = await storage.getCoachGoalStats(coachId);
      metrics.averageGoalProgress = goalStats.averageProgress;
      metrics.goalCompletionRate = goalStats.completionRate;
      metrics.studentsWithActiveGoals = goalStats.studentsWithActiveGoals;

      console.log(`[AssessmentGoalService] Dashboard metrics: ${metrics.totalStudents} students, ${metrics.totalGoals} goals`);
      return metrics;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }

  /**
   * Process complete post-session workflow
   */
  static async processPostSessionWorkflow(
    sessionId: number,
    assessmentData: any,
    generateGoals: boolean,
    goalCustomizations: any,
    coachId: number
  ): Promise<any> {
    console.log(`[AssessmentGoalService] Processing post-session workflow for session ${sessionId}`);
    
    try {
      const result = {
        session: null,
        assessment: null,
        generatedGoals: [],
        workflow: null
      };

      // Get session data
      result.session = await storage.getSession(sessionId, coachId);
      if (!result.session) {
        throw new Error("Session not found");
      }

      // Create assessment if provided
      if (assessmentData) {
        result.assessment = await storage.createAssessment({
          ...assessmentData,
          session_id: sessionId,
          coach_id: coachId,
          student_id: result.session.student_id
        });
      }

      // Generate goals if requested
      if (generateGoals && result.assessment) {
        const recommendations = await this.generateGoalsFromAssessment(result.assessment.id, coachId);
        result.generatedGoals = await this.createGoalsFromAssessment(
          result.assessment.id,
          recommendations,
          goalCustomizations,
          coachId
        );
      }

      // Get updated workflow
      result.workflow = await this.getCompleteWorkflow(result.session.student_id, coachId);

      console.log(`[AssessmentGoalService] Post-session workflow completed: assessment + ${result.generatedGoals.length} goals`);
      return result;
    } catch (error) {
      console.error("Error processing post-session workflow:", error);
      throw error;
    }
  }
}