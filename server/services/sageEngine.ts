/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Rule-Based Engine
 * 
 * This file implements the rule-based coaching engine for the SAGE system.
 * It analyzes player data and generates coaching insights and training plans
 * without requiring external AI dependencies.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { 
  InsertCoachingSession, 
  InsertCoachingInsight, 
  InsertTrainingPlan,
  InsertTrainingExercise,
  DimensionCode, 
  InsightType,
  SessionType,
  DimensionCodes
} from '@shared/schema/sage';
import { storage } from '../storage';
import { User } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Rule-based coaching engine for generating insights and training plans
 */
export class SageEngine {
  /**
   * Generate a coaching session with insights based on player data
   * 
   * @param userId The user ID to generate coaching for
   * @param sessionType The type of coaching session
   * @param dimensionFocus The primary CourtIQ dimension to focus on
   * @returns The created coaching session with insights
   */
  async generateCoachingSession(
    userId: number, 
    sessionType: SessionType = 'ASSESSMENT',
    dimensionFocus?: DimensionCode
  ): Promise<{ session: any, insights: any[] }> {
    try {
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's match history
      const matches = await storage.getMatchesByUserId(userId, 10);
      
      // Get user's CourtIQ ratings if available
      const courtiqRatings = await this.getUserCourtIQRatings(userId);
      
      // Determine the primary dimension focus if not provided
      const primaryDimension = dimensionFocus || this.determinePrimaryDimensionFocus(courtiqRatings);
      
      // Create the coaching session
      const session = await storage.createCoachingSession({
        userId,
        title: this.generateSessionTitle(sessionType, primaryDimension),
        description: this.generateSessionDescription(sessionType, primaryDimension),
        type: sessionType,
        dimensionFocus: primaryDimension,
        status: 'ACTIVE',
        matchId: matches.length > 0 ? matches[0].id : null
      });

      // Generate insights based on the session type and user data
      const insights = await this.generateInsights(session.id, user, courtiqRatings, matches, primaryDimension);
      
      // Return the session and insights
      return {
        session,
        insights
      };
    } catch (error) {
      console.error('[SageEngine] generateCoachingSession error:', error);
      throw error;
    }
  }

  /**
   * Generate a training plan based on coaching insights
   * 
   * @param sessionId The coaching session ID
   * @param durationDays The number of days for the training plan
   * @returns The created training plan with exercises
   */
  async generateTrainingPlan(
    sessionId: number,
    durationDays: number = 7
  ): Promise<{ plan: any, exercises: any[] }> {
    try {
      // Get the coaching session
      const session = await storage.getCoachingSession(sessionId);
      if (!session) {
        throw new Error('Coaching session not found');
      }

      // Get the insights from the session
      const insights = await storage.getCoachingInsightsBySessionId(sessionId);
      if (insights.length === 0) {
        throw new Error('No insights available to generate a training plan');
      }

      // Get the user
      const user = await storage.getUser(session.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get the primary dimension focus from the session
      const primaryDimension = session.dimensionFocus as DimensionCode;
      
      // Create the training plan
      const plan = await storage.createTrainingPlan({
        sessionId,
        title: `${durationDays}-Day ${this.getDimensionName(primaryDimension)} Training Plan`,
        description: `A structured training plan focused on improving your ${this.getDimensionName(primaryDimension).toLowerCase()} skills over ${durationDays} days.`,
        durationDays,
        status: 'ACTIVE',
        difficultyLevel: this.determineDifficultyLevel(user, primaryDimension),
        primaryDimensionFocus: primaryDimension
      });

      // Generate exercises for the training plan
      const exercises = await this.generateExercises(plan.id, durationDays, insights, primaryDimension);
      
      // Return the plan and exercises
      return {
        plan,
        exercises
      };
    } catch (error) {
      console.error('[SageEngine] generateTrainingPlan error:', error);
      throw error;
    }
  }

  /**
   * Generate insights based on user data and match history
   */
  private async generateInsights(
    sessionId: number,
    user: User,
    courtiqRatings: any,
    matches: any[],
    primaryDimension: DimensionCode
  ): Promise<any[]> {
    const insights: InsertCoachingInsight[] = [];
    const createdInsights: any[] = [];

    // Generate strength insight
    const strengthDimension = this.findStrengthDimension(courtiqRatings);
    const strengthInsight: InsertCoachingInsight = {
      sessionId,
      title: `Your Strength: ${this.getDimensionName(strengthDimension)}`,
      content: this.generateStrengthContent(strengthDimension),
      insightType: 'STRENGTH',
      dimensionCode: strengthDimension,
      priority: 1
    };
    insights.push(strengthInsight);

    // Generate weakness insight
    const weaknessDimension = this.findWeaknessDimension(courtiqRatings);
    const weaknessInsight: InsertCoachingInsight = {
      sessionId,
      title: `Area for Improvement: ${this.getDimensionName(weaknessDimension)}`,
      content: this.generateWeaknessContent(weaknessDimension),
      insightType: 'WEAKNESS',
      dimensionCode: weaknessDimension,
      priority: 2
    };
    insights.push(weaknessInsight);

    // Generate specific insight for the primary dimension
    const focusInsight: InsertCoachingInsight = {
      sessionId,
      title: `Developing Your ${this.getDimensionName(primaryDimension)}`,
      content: this.generateFocusContent(primaryDimension),
      insightType: 'FOCUS',
      dimensionCode: primaryDimension,
      priority: 3
    };
    insights.push(focusInsight);

    // If matches are available, generate match-based insight
    if (matches.length > 0) {
      const matchInsight: InsertCoachingInsight = {
        sessionId,
        title: 'Recent Match Analysis',
        content: this.generateMatchAnalysisContent(matches[0], primaryDimension),
        insightType: 'MATCH_ANALYSIS',
        dimensionCode: primaryDimension,
        priority: 4,
        matchId: matches[0].id
      };
      insights.push(matchInsight);
    }

    // Add actionable tip
    const tipInsight: InsertCoachingInsight = {
      sessionId,
      title: 'Quick Actionable Tip',
      content: this.generateQuickTip(primaryDimension),
      insightType: 'TIP',
      dimensionCode: primaryDimension,
      priority: 5
    };
    insights.push(tipInsight);

    // Create all insights in the database
    for (const insight of insights) {
      const createdInsight = await storage.createCoachingInsight(insight);
      createdInsights.push(createdInsight);
    }

    return createdInsights;
  }

  /**
   * Generate exercises for a training plan
   */
  private async generateExercises(
    planId: number,
    durationDays: number,
    insights: any[],
    primaryDimension: DimensionCode
  ): Promise<any[]> {
    const exercises: InsertTrainingExercise[] = [];
    const createdExercises: any[] = [];

    // Get relevant content from the coaching content library
    const content = await storage.getCoachingContent({
      contentType: 'EXERCISE',
      dimensionCode: primaryDimension,
      limit: 20
    });

    // Find the weakness dimension from insights
    const weaknessInsight = insights.find(i => i.insightType === 'WEAKNESS');
    const weaknessDimension = weaknessInsight ? weaknessInsight.dimensionCode : null;

    // Generate a basic structure of exercises for each day
    for (let day = 1; day <= durationDays; day++) {
      // Warm-up exercise - always include regardless of focus
      exercises.push({
        planId,
        title: "Dynamic Warm-Up",
        description: "Complete a 10-minute dynamic warm-up to prepare your body for the training session.",
        instructions: "Include lateral movements, light jogging, arm circles, and specific pickleball footwork patterns.",
        durationMinutes: 10,
        dimensionCode: "PHYS" as DimensionCode, // Physical is always good for warm-up
        dayNumber: day,
        orderInDay: 1,
        isCompleted: false,
        difficultyLevel: "BEGINNER"
      });

      // Primary focus exercise - from the content library if available
      const primaryContent = content.filter(c => c.dimensionCode === primaryDimension);
      if (primaryContent.length > 0) {
        const contentItem = primaryContent[Math.floor(Math.random() * primaryContent.length)];
        exercises.push({
          planId,
          title: contentItem.title || `${this.getDimensionName(primaryDimension)} Exercise`,
          description: contentItem.description || `Focused training on ${this.getDimensionName(primaryDimension).toLowerCase()}.`,
          instructions: contentItem.content || this.generateExerciseInstructions(primaryDimension),
          durationMinutes: 20,
          dimensionCode: primaryDimension,
          dayNumber: day,
          orderInDay: 2,
          isCompleted: false,
          difficultyLevel: contentItem.skillLevel || "INTERMEDIATE"
        });
      } else {
        // Fallback if no content is available
        exercises.push({
          planId,
          title: `${this.getDimensionName(primaryDimension)} Focus Exercise`,
          description: `Build your ${this.getDimensionName(primaryDimension).toLowerCase()} skills with this targeted exercise.`,
          instructions: this.generateExerciseInstructions(primaryDimension),
          durationMinutes: 20,
          dimensionCode: primaryDimension,
          dayNumber: day,
          orderInDay: 2,
          isCompleted: false,
          difficultyLevel: "INTERMEDIATE"
        });
      }

      // Add an additional exercise focusing on the weakness area every other day
      if (weaknessDimension && day % 2 === 0) {
        exercises.push({
          planId,
          title: `${this.getDimensionName(weaknessDimension)} Development`,
          description: `Address your improvement area in ${this.getDimensionName(weaknessDimension).toLowerCase()}.`,
          instructions: this.generateExerciseInstructions(weaknessDimension as DimensionCode),
          durationMinutes: 15,
          dimensionCode: weaknessDimension as DimensionCode,
          dayNumber: day,
          orderInDay: 3,
          isCompleted: false,
          difficultyLevel: "BEGINNER"
        });
      }

      // Cool-down and reflection - always include
      exercises.push({
        planId,
        title: "Cool Down & Reflection",
        description: "Gentle stretching and reflection on today's training.",
        instructions: "Stretch for 5 minutes focusing on shoulders, back, and legs. Then take 5 minutes to write down what you learned today and how it felt.",
        durationMinutes: 10,
        dimensionCode: "MENT" as DimensionCode, // Mental is good for reflection
        dayNumber: day,
        orderInDay: day % 2 === 0 && weaknessDimension ? 4 : 3,
        isCompleted: false,
        difficultyLevel: "BEGINNER"
      });
    }

    // Create all exercises in the database
    for (const exercise of exercises) {
      const createdExercise = await storage.createTrainingExercise(exercise);
      createdExercises.push(createdExercise);
    }

    return createdExercises;
  }

  /**
   * Get the user's CourtIQ ratings
   */
  private async getUserCourtIQRatings(userId: number): Promise<any> {
    try {
      // Check if the user has CourtIQ ratings
      const ratings = await storage.getCourtIQRatings(userId);
      
      // If no ratings are found, return default ratings
      if (!ratings) {
        return {
          TECH: 3, // Technical Skills
          TACT: 3, // Tactical Awareness
          PHYS: 3, // Physical Fitness
          MENT: 3, // Mental Toughness
          CONS: 3  // Consistency
        };
      }
      
      return ratings;
    } catch (error) {
      console.error('[SageEngine] getUserCourtIQRatings error:', error);
      // Return default ratings on error
      return {
        TECH: 3,
        TACT: 3,
        PHYS: 3,
        MENT: 3,
        CONS: 3
      };
    }
  }

  /**
   * Determine the primary dimension to focus on based on CourtIQ ratings
   */
  private determinePrimaryDimensionFocus(courtiqRatings: any): DimensionCode {
    // If ratings are not available, default to Technical
    if (!courtiqRatings) {
      return 'TECH';
    }

    // Find the dimension with the lowest rating
    let lowestDimension: DimensionCode = 'TECH';
    let lowestRating = Number.MAX_VALUE;

    for (const dimension of Object.keys(DimensionCodes)) {
      const dimCode = dimension as DimensionCode;
      const rating = courtiqRatings[dimCode] || 3;
      
      if (rating < lowestRating) {
        lowestRating = rating;
        lowestDimension = dimCode;
      }
    }

    return lowestDimension;
  }

  /**
   * Find the user's strongest dimension based on CourtIQ ratings
   */
  private findStrengthDimension(courtiqRatings: any): DimensionCode {
    // If ratings are not available, default to Consistency
    if (!courtiqRatings) {
      return 'CONS';
    }

    // Find the dimension with the highest rating
    let highestDimension: DimensionCode = 'CONS';
    let highestRating = 0;

    for (const dimension of Object.keys(DimensionCodes)) {
      const dimCode = dimension as DimensionCode;
      const rating = courtiqRatings[dimCode] || 3;
      
      if (rating > highestRating) {
        highestRating = rating;
        highestDimension = dimCode;
      }
    }

    return highestDimension;
  }

  /**
   * Find the user's weakest dimension based on CourtIQ ratings
   */
  private findWeaknessDimension(courtiqRatings: any): DimensionCode {
    // If ratings are not available, default to Mental
    if (!courtiqRatings) {
      return 'MENT';
    }

    // Find the dimension with the lowest rating
    let lowestDimension: DimensionCode = 'MENT';
    let lowestRating = Number.MAX_VALUE;

    for (const dimension of Object.keys(DimensionCodes)) {
      const dimCode = dimension as DimensionCode;
      const rating = courtiqRatings[dimCode] || 3;
      
      if (rating < lowestRating) {
        lowestRating = rating;
        lowestDimension = dimCode;
      }
    }

    return lowestDimension;
  }

  /**
   * Generate a title for the coaching session
   */
  private generateSessionTitle(sessionType: SessionType, dimensionFocus: DimensionCode): string {
    const dimensionName = this.getDimensionName(dimensionFocus);
    
    switch (sessionType) {
      case 'ASSESSMENT':
        return `${dimensionName} Skills Assessment`;
      case 'MATCH_REVIEW':
        return `Match Analysis: ${dimensionName} Focus`;
      case 'TRAINING':
        return `${dimensionName} Training Session`;
      case 'MENTAL_COACHING':
        return `Mental Performance: ${dimensionName} Mindset`;
      default:
        return `Pickleball Coaching: ${dimensionName}`;
    }
  }

  /**
   * Generate a description for the coaching session
   */
  private generateSessionDescription(sessionType: SessionType, dimensionFocus: DimensionCode): string {
    const dimensionName = this.getDimensionName(dimensionFocus);
    
    switch (sessionType) {
      case 'ASSESSMENT':
        return `Comprehensive assessment of your ${dimensionName.toLowerCase()} skills with actionable insights for improvement.`;
      case 'MATCH_REVIEW':
        return `Analysis of your recent match performance with focus on ${dimensionName.toLowerCase()} aspects of your game.`;
      case 'TRAINING':
        return `Targeted training session to develop your ${dimensionName.toLowerCase()} skills and performance.`;
      case 'MENTAL_COACHING':
        return `Mental coaching focused on enhancing your ${dimensionName.toLowerCase()} mindset and approach to the game.`;
      default:
        return `Personalized coaching to help you improve your ${dimensionName.toLowerCase()} in pickleball.`;
    }
  }

  /**
   * Generate content for the strength insight
   */
  private generateStrengthContent(dimension: DimensionCode): string {
    const dimensionName = this.getDimensionName(dimension);
    
    switch (dimension) {
      case 'TECH':
        return `Your technical skills are a significant strength in your game. You demonstrate good form and execution in your shots. Continue to refine your technique through deliberate practice and consider how you can leverage this strength when under pressure. Challenge yourself to maintain technical excellence even in high-stress match situations.`;
      case 'TACT':
        return `Your tactical awareness stands out as a key strength. You demonstrate good court positioning and strategic decision-making. Continue developing this by studying professional matches and analyzing different game situations. Consider keeping a tactical journal to reflect on successful strategies and areas for further development.`;
      case 'PHYS':
        return `Physical fitness is your strongest asset on the court. Your endurance, agility, and speed give you an advantage in extended rallies and fast-paced games. Continue building on this foundation with varied training that includes both pickleball-specific movements and complementary conditioning. Remember that recovery is equally important as training.`;
      case 'MENT':
        return `Mental toughness is your standout quality. You maintain composure under pressure and demonstrate resilience during challenging match situations. Continue developing this mental strength through visualization practices and pre-match routines. Consider incorporating mindfulness or meditation to further enhance your focus during critical points.`;
      case 'CONS':
        return `Consistency is your greatest strength on the court. You reliably execute shots and maintain steady performance throughout matches. This reliability makes you a formidable opponent and dependable partner. Build on this by gradually increasing the difficulty and variety of your practice drills while maintaining that consistent execution.`;
      default:
        return `Your ${dimensionName.toLowerCase()} is a significant strength in your game. Continue to build on this foundation while working to bring other aspects of your play to the same level.`;
    }
  }

  /**
   * Generate content for the weakness insight
   */
  private generateWeaknessContent(dimension: DimensionCode): string {
    const dimensionName = this.getDimensionName(dimension);
    
    switch (dimension) {
      case 'TECH':
        return `Your technical skills would benefit from focused attention. Work on the fundamentals of your paddle grip, stance, and stroke mechanics. Consider recording your practice sessions to identify specific areas for improvement. Breaking down complex movements into smaller components can help refine your technique. Dedicate 15-20 minutes daily to technical drills for rapid improvement.`;
      case 'TACT':
        return `Developing your tactical awareness will elevate your game significantly. Practice recognizing patterns in your opponents' play and positioning yourself strategically on the court. Watch professional matches with a focus on player positioning and decision-making. Consider working with a coach to analyze match recordings and identify tactical opportunities you might be missing.`;
      case 'PHYS':
        return `Your physical conditioning presents an opportunity for improvement. Incorporate pickleball-specific fitness training that focuses on quick lateral movements, endurance, and explosive power. Even adding 15 minutes of targeted conditioning 3-4 times weekly can yield noticeable improvements. Remember that physical development also supports injury prevention and longevity in the sport.`;
      case 'MENT':
        return `Strengthening your mental game would enhance your overall performance. Develop routines for maintaining focus during matches and strategies for bouncing back from errors. Incorporate visualization practices before play and consider keeping a performance journal to track mental aspects of your game. Even just 5 minutes of mental preparation before each session can make a significant difference.`;
      case 'CONS':
        return `Improving your consistency will have a substantial impact on your performance. Focus on developing reliable, repeatable strokes under varying conditions. Practice maintaining controlled shots even when fatigued or under pressure. Work with targets during practice to enhance accuracy, and track your consistency rates to monitor improvement over time.`;
      default:
        return `Your ${dimensionName.toLowerCase()} presents an opportunity for improvement. With focused attention in this area, you can see significant gains in your overall performance.`;
    }
  }

  /**
   * Generate content for the focus insight
   */
  private generateFocusContent(dimension: DimensionCode): string {
    const dimensionName = this.getDimensionName(dimension);
    
    switch (dimension) {
      case 'TECH':
        return `To develop your technical skills, focus on mastering these fundamental aspects:\n\n1. **Paddle Face Control**: Practice maintaining awareness of your paddle face angle through all strokes.\n\n2. **Contact Point Consistency**: Work on hitting the ball at the optimal contact point for each shot type.\n\n3. **Footwork Precision**: Ensure your feet are positioned correctly for balanced, powerful strokes.\n\n4. **Follow-Through Discipline**: Complete each stroke with a proper follow-through to enhance accuracy and power.\n\nPractice these elements individually before integrating them into game situations. Record yourself periodically to track improvements in your technique.`;
      case 'TACT':
        return `To enhance your tactical awareness, focus on these key strategic elements:\n\n1. **Court Coverage**: Practice efficient movement patterns that maximize your coverage while conserving energy.\n\n2. **Shot Selection**: Develop the ability to choose the right shot for each situation based on court position and opponent location.\n\n3. **Pattern Recognition**: Train yourself to identify and exploit patterns in your opponents' play.\n\n4. **Strategic Patience**: Know when to attack aggressively versus when to play defensively for better point construction.\n\nStudy professional matches with a specific focus on these tactical elements, taking notes on effective strategies you observe.`;
      case 'PHYS':
        return `To improve your physical fitness for pickleball, focus on these key areas:\n\n1. **Lateral Quickness**: Practice side-to-side movement drills to enhance your ability to cover the court efficiently.\n\n2. **Endurance**: Build stamina through interval training that mimics the stop-start nature of pickleball rallies.\n\n3. **Recovery Speed**: Work on quick recovery between points and games to maintain peak performance.\n\n4. **Core Strength**: Develop core stability to improve power transfer in your shots and prevent injury.\n\nIncorporate these elements into your training routine 3-4 times weekly, gradually increasing intensity as your fitness improves.`;
      case 'MENT':
        return `To strengthen your mental game, develop these key psychological skills:\n\n1. **Focus Control**: Practice maintaining concentration during distractions or pressure situations.\n\n2. **Emotional Regulation**: Develop techniques to manage frustration and maintain composure after errors.\n\n3. **Confidence Building**: Create a positive self-talk routine and celebration of successful execution (not just winning points).\n\n4. **Pressure Management**: Practice performing under simulated pressure in training to build resilience for matches.\n\nSpend 5-10 minutes before each practice session on mental preparation, and keep a journal to track your mental game progress.`;
      case 'CONS':
        return `To enhance your consistency, focus on these fundamental aspects:\n\n1. **Shot Repeatability**: Practice hitting the same shot multiple times with minimal variation in outcome.\n\n2. **Percentage Play**: Develop awareness of high-percentage versus low-percentage shot options in different situations.\n\n3. **Performance Under Fatigue**: Practice maintaining form and accuracy even when tired or under pressure.\n\n4. **Adaptability**: Work on consistent execution across varying court conditions and against different playing styles.\n\nTrack your consistency metrics during practice (e.g., successful shots out of 10 attempts) and set progressive improvement goals.`;
      default:
        return `To develop your ${dimensionName.toLowerCase()}, focus on deliberate practice that challenges you appropriately. Break down complex skills into manageable components, and seek feedback from coaches or video analysis. Consistent, focused practice will yield steady improvement over time.`;
    }
  }

  /**
   * Generate match analysis content
   */
  private generateMatchAnalysisContent(match: any, dimension: DimensionCode): string {
    // This would be more sophisticated in a real implementation, analyzing match statistics
    const dimensionName = this.getDimensionName(dimension);
    
    return `Based on your recent match, we've identified some key insights related to your ${dimensionName.toLowerCase()}:\n\n1. **Strengths Observed**: You demonstrated effective execution during neutral rallies and showed good decision-making in several key points.\n\n2. **Areas for Improvement**: Under pressure, there were instances where your ${dimensionName.toLowerCase()} showed inconsistency, particularly in the later stages of the match.\n\n3. **Situational Awareness**: Consider how you can maintain your ${dimensionName.toLowerCase()} performance during critical points and end-game situations.\n\nWork on simulating match pressure during practice to build confidence in these situations.`;
  }

  /**
   * Generate a quick actionable tip
   */
  private generateQuickTip(dimension: DimensionCode): string {
    const tips = {
      'TECH': [
        "Focus on 'quiet' paddle face control during kitchen volleys - minimal movement leads to greater control.",
        "When executing your dink, ensure your paddle face is slightly open and contact is made slightly in front of your body.",
        "For more consistent serves, simplify your motion and focus on a smooth pendulum swing.",
        "Practice the 'shadow drill' - perform your strokes without a ball to develop muscle memory for proper technique."
      ],
      'TACT': [
        "After hitting your return of serve, move forward to the non-volley zone line as quickly as possible.",
        "When your opponent is pulled wide, aim your next shot at their partner to create pressure.",
        "Use the 'middle' strategy - hitting between opponents creates confusion and weaker returns.",
        "Observe and exploit your opponent's patterns - most players have predictable tendencies under pressure."
      ],
      'PHYS': [
        "Incorporate 'pickleball intervals' - 30 seconds of intense footwork followed by 15 seconds rest for 10 rounds.",
        "Practice 'split step' timing to improve your first-step quickness to the ball.",
        "Add lateral resistance band movements to your warm-up routine to strengthen court movement muscles.",
        "Focus on recovery breathing between points - deep inhale through the nose, complete exhale through the mouth."
      ],
      'MENT': [
        "Establish a between-point routine to reset mentally and maintain focus throughout the match.",
        "Practice 'process over outcome' thinking - focus on executing your strategy rather than the score.",
        "Use positive self-talk triggers when facing challenging situations - have a specific phrase ready.",
        "Implement visualization before matches - spend 5 minutes mentally rehearsing successful play and problem-solving."
      ],
      'CONS': [
        "Practice the '50 dinks' drill - rally with a partner aiming to hit 50 consecutive dinks without an error.",
        "When practicing serves, aim for 8/10 success rate before increasing difficulty or changing targets.",
        "Focus on maintaining consistent contact point regardless of shot type - this develops reliable timing.",
        "Track your unforced errors in practice and matches - set goals to reduce them by focusing on higher percentage plays."
      ]
    };

    const dimensionTips = tips[dimension] || tips['TECH'];
    return dimensionTips[Math.floor(Math.random() * dimensionTips.length)];
  }

  /**
   * Generate exercise instructions based on dimension
   */
  private generateExerciseInstructions(dimension: DimensionCode): string {
    const exercises = {
      'TECH': [
        "Setup a target (towel or tape) in different locations in the non-volley zone. Practice dinking to each target 10 times, focusing on paddle angle and contact point. Start with straight-ahead dinks, then progress to cross-court.",
        "With a partner or wall, practice the transition from dink to drive volley. Start with 10 controlled dinks, then on command, execute a more aggressive drive volley while maintaining proper technique.",
        "Set up a cone or target 3 feet from the baseline. Hit 20 serves focusing on consistent contact point and follow-through, aiming to land the ball just beyond the target."
      ],
      'TACT': [
        "Play 'King of the Court' style games where you must hit to a specific part of the court (e.g., always aim at the middle) to develop pattern awareness and shot precision.",
        "Practice 'third shot options' drill: Partner drops ball, you hit either a drop, drive, or lob depending on partner's position. Do 20 repetitions focusing on making the tactically best choice.",
        "Play points where one player can only hit cross-court while the other can hit anywhere - this develops awareness of court angles and positioning."
      ],
      'PHYS': [
        "Perform the 'Four corners' drill: Place four balls at corners of the non-volley zone. Starting at center court, sprint to each ball, tap it with your paddle, and return to center before going to the next. Complete 5 sets with 60-second rest intervals.",
        "Practice 'shadow defense' by having a partner randomly point to different court positions. You must quickly move to each position with proper court coverage footwork. Do this for 3 minutes, rest 1 minute, repeat 3 times.",
        "Integrate 'kitchen line touches' between regular drilling: Every 2 minutes during practice, perform 10 quick touches at the non-volley zone line to build endurance and simulate match movement patterns."
      ],
      'MENT': [
        "Practice the 'distraction drill': Have partners or observers create minor distractions while you maintain focus on consistent shot execution. Start with 20 shots, tracking how many you can execute successfully despite the distractions.",
        "Implement 'pressure serving': Set a goal of making 7/10 serves to a specific target with a consequence for missing (e.g., 5 court sprints). This simulates match pressure in practice.",
        "Try 'comeback practice': Start games down 0-6 and work on maintaining positive mindset and strategic play while behind. This builds mental resilience and problem-solving under pressure."
      ],
      'CONS': [
        "Use the 'consecutive shot challenge': Rally with a focus on hitting 20 consecutive shots without error. If an error occurs, start the count over. Track your record and try to beat it each session.",
        "Practice 'precision progression': Start with dinking to a large target area. Once you achieve 8/10 success rate, reduce the target size. Continue reducing as your consistency improves.",
        "Implement 'fatigue consistency': After a brief cardio burst (30 seconds of line touches), immediately hit 10 third shot drops, focusing on maintaining technique despite elevated heart rate."
      ]
    };

    const dimensionExercises = exercises[dimension] || exercises['TECH'];
    return dimensionExercises[Math.floor(Math.random() * dimensionExercises.length)];
  }

  /**
   * Determine difficulty level based on user data
   */
  private determineDifficultyLevel(user: User, dimension: DimensionCode): string {
    // In a real implementation, this would analyze user skill level more thoroughly
    // For now, we'll use a simplified approach
    return "INTERMEDIATE";
  }

  /**
   * Get the readable name for a dimension code
   */
  private getDimensionName(dimensionCode: DimensionCode): string {
    const dimensionNames = {
      'TECH': 'Technical Skills',
      'TACT': 'Tactical Awareness',
      'PHYS': 'Physical Fitness',
      'MENT': 'Mental Toughness',
      'CONS': 'Consistency'
    };
    
    return dimensionNames[dimensionCode] || 'Skills';
  }
}

// Export a singleton instance
export const sageEngine = new SageEngine();