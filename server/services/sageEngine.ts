/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Rule-Based Engine
 * 
 * This file implements the rule-based coaching engine for the SAGE system.
 * It analyzes player data and generates coaching insights and training plans
 * without requiring external AI dependencies.
 * 
 * PKL-278651-SAGE-0002-CONV - Added conversation support for SAGE Conversational UI
 * PKL-278651-COACH-0003-TERMS - Added pickleball terminology recognition
 * 
 * @framework Framework5.3
 * @version 1.2.0
 * @lastModified 2025-04-24
 */

import { 
  InsertCoachingSession, 
  InsertCoachingInsight, 
  InsertTrainingPlan,
  InsertTrainingExercise,
  InsertCoachingConversation,
  InsertCoachingMessage,
  DimensionCode, 
  InsightType,
  SessionType,
  DimensionCodes
} from '@shared/schema/sage';
import { storage } from '../storage';
import { User } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { analyzePickleballTerminology, generateTerminologyResponse } from './pickleballTermProcessor';

/**
 * Rule-based coaching engine for generating insights and training plans
 */
export class SageEngine {
  /**
   * Determine the primary dimension to focus on based on message and user history
   * 
   * @param message The user message
   * @param courtiqRatings The user's CourtIQ ratings
   * @param recentJournalEntries Recent journal entries
   * @returns The determined dimension code
   */
  private determineFocusDimension(
    message: string,
    courtiqRatings: any,
    recentJournalEntries: any[]
  ): DimensionCode {
    // First, check for pickleball terminology to determine dimension focus
    const termAnalysis = analyzePickleballTerminology(message);
    
    // If terminology analysis suggests a dimension, use it
    if (termAnalysis.suggestedDimension) {
      return termAnalysis.suggestedDimension;
    }
    
    const lowerMessage = message.toLowerCase();
    
    // Fall back to keyword-based dimension detection
    if (lowerMessage.includes('technique') || lowerMessage.includes('dink') || 
        lowerMessage.includes('shot') || lowerMessage.includes('technical')) {
      return 'TECH';
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('position') || 
               lowerMessage.includes('court') || lowerMessage.includes('tactical')) {
      return 'TACT';
    } else if (lowerMessage.includes('stamina') || lowerMessage.includes('fitness') || 
               lowerMessage.includes('tired') || lowerMessage.includes('physical')) {
      return 'PHYS';
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('nervous') || 
               lowerMessage.includes('focus') || lowerMessage.includes('confidence')) {
      return 'MENT';
    } else if (lowerMessage.includes('consistency') || lowerMessage.includes('practice') || 
               lowerMessage.includes('routine') || lowerMessage.includes('consistent')) {
      return 'CONS';
    }
    
    // If not explicitly mentioned, check recent journal entries for trends
    if (recentJournalEntries && recentJournalEntries.length > 0) {
      const dimensionCounts: Record<string, number> = {
        'TECH': 0,
        'TACT': 0,
        'PHYS': 0,
        'MENT': 0,
        'CONS': 0
      };
      
      // Count dimensions in recent entries
      recentJournalEntries.forEach(entry => {
        if (entry.dimensionCode && dimensionCounts[entry.dimensionCode] !== undefined) {
          dimensionCounts[entry.dimensionCode]++;
        }
      });
      
      // Find the most frequent dimension
      let mostFrequentDimension: DimensionCode = 'TECH';
      let highestCount = 0;
      
      for (const [dimension, count] of Object.entries(dimensionCounts)) {
        if (count > highestCount) {
          highestCount = count;
          mostFrequentDimension = dimension as DimensionCode;
        }
      }
      
      // If we found a dimension with at least one occurrence, use it
      if (highestCount > 0) {
        return mostFrequentDimension;
      }
    }
    
    // If no journal entries with dimensions, use the lowest CourtIQ rating
    return this.determinePrimaryDimensionFocus(courtiqRatings);
  }
  
  /**
   * Generate a context-aware response considering conversation history and user data
   * 
   * @param message The user message
   * @param user The user object
   * @param context Additional context information
   * @returns The SAGE response text
   */
  private generateContextAwareResponse(
    message: string, 
    user: any, 
    context: {
      recentMessages: any[],
      courtiqRatings: any,
      recentMatches: any[],
      recentJournalEntries: any[],
      dimensionFocus: DimensionCode
    }
  ): string {
    const lowerMessage = message.toLowerCase();
    const { 
      recentMessages, 
      courtiqRatings, 
      recentMatches, 
      recentJournalEntries, 
      dimensionFocus 
    } = context;
    
    // Check if we're in a multi-turn conversation by examining recent messages
    const isFollowUp = recentMessages && recentMessages.length > 1;
    const previousSageMessage = isFollowUp ? 
      recentMessages.filter(msg => msg.role === 'sage').pop() : null;
    
    // Provide personalized greeting for new conversation
    if (!isFollowUp && lowerMessage.match(/^(hi|hello|hey|greetings|howdy)/i)) {
      const timeOfDay = this.getTimeOfDay();
      return `Good ${timeOfDay}, ${user.firstName || user.username || 'there'}! I'm S.A.G.E. (Skills Assessment & Growth Engine), your personalized pickleball coach. How can I help improve your game today? You can ask me about specific skills, request a training plan, or get advice on your playing strategy.`;
    }
    
    // Reference recent journal entry if relevant
    if (recentJournalEntries && recentJournalEntries.length > 0) {
      // Check if user is explicitly asking about their journal
      const isExplicitJournalQuestion = lowerMessage.includes('journal') || 
                                        lowerMessage.includes('wrote') || 
                                        lowerMessage.includes('recorded') ||
                                        lowerMessage.includes('entry');
                                        
      // Check for specific journal-related queries
      const askingForJournalSummary = lowerMessage.includes('summary') || 
                                      lowerMessage.includes('recent entries') ||
                                      lowerMessage.includes('my journals');
      
      const askingForJournalInsights = lowerMessage.includes('insights') || 
                                       lowerMessage.includes('patterns') ||
                                       lowerMessage.includes('trends');
                                       
      // If message relates to the most recent journal entry
      if (this.isMessageRelatedToJournalEntry(message, recentJournalEntries[0]) || isExplicitJournalQuestion) {
        const entry = recentJournalEntries[0];
        const entryDate = new Date(entry.createdAt);
        const dateString = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const entryDimension = entry.dimensionCode ? this.getDimensionName(entry.dimensionCode as DimensionCode).toLowerCase() : 'game';
        
        // If asking for a summary of journal entries
        if (askingForJournalSummary && recentJournalEntries.length > 1) {
          const oldestEntry = recentJournalEntries[recentJournalEntries.length - 1];
          const oldestDate = new Date(oldestEntry.createdAt);
          const oldestDateString = oldestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return `You have ${recentJournalEntries.length} journal entries from ${oldestDateString} to ${dateString}. Your most recent entry on ${dateString} focused on your ${entryDimension} skills. Would you like me to analyze patterns across your entries or provide specific feedback on your most recent reflection?`;
        } 
        // If asking for insights across journal entries
        else if (askingForJournalInsights && recentJournalEntries.length > 1) {
          // Count dimension distribution
          const dimensionCounts: Record<string, number> = {};
          recentJournalEntries.forEach(entry => {
            const dim = entry.dimensionCode || 'unknown';
            dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
          });
          
          // Find most common dimension
          let mostCommonDimension = 'TECH';
          let highestCount = 0;
          Object.entries(dimensionCounts).forEach(([dim, count]) => {
            if (count > highestCount && dim !== 'unknown') {
              mostCommonDimension = dim;
              highestCount = count;
            }
          });
          
          const commonFocusName = this.getDimensionName(mostCommonDimension as DimensionCode).toLowerCase();
          
          return `Looking across your journal entries, I notice you've been focusing most on ${commonFocusName} (${highestCount} entries). Your most recent reflection on ${dateString} addressed ${entryDimension} skills. This consistent journaling shows your commitment to improvement. Based on these patterns, would you like me to suggest specific training exercises to complement your reflective practice?`;
        }
        // Standard single journal entry reference
        else {
          return `I see from your journal entry on ${dateString} that you've been reflecting on your ${entryDimension} skills. ${this.generateJournalBasedResponse(entry, dimensionFocus)}`;
        }
      }
      
      // If there are multiple journal entries but the current message doesn't directly relate to them,
      // still mention journaling if the message is about improvement or progress
      else if (recentJournalEntries.length > 2 && 
              (lowerMessage.includes('improve') || lowerMessage.includes('progress') || lowerMessage.includes('better'))) {
        return `I notice you've been consistently journaling about your pickleball journey, which is excellent for tracking progress. ${this.generateSageResponse(message, user, recentJournalEntries)} Your journal entries provide valuable context that can help us tailor more specific advice to your development needs.`;
      }
    }
    
    // Reference recent match if asking about match performance
    if (recentMatches && recentMatches.length > 0 && 
        (lowerMessage.includes('match') || lowerMessage.includes('game') || lowerMessage.includes('played'))) {
      const match = recentMatches[0];
      const matchDate = new Date(match.createdAt);
      const dateString = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Build a response based on match outcome
      const outcome = match.userScore > match.opponentScore ? 'won' : 'lost';
      return `Based on your ${outcome} match on ${dateString} (${match.userScore}-${match.opponentScore}), I notice that ${this.generateMatchBasedInsight(match, dimensionFocus)}. Would you like me to create a targeted training plan to address this area?`;
    }
    
    // Continue previous conversation if this is a follow-up
    if (isFollowUp && previousSageMessage) {
      // Extract the topic from previous message
      const prevResponseLower = previousSageMessage.content.toLowerCase();
      
      // If previous message asked about focus area and user specifies one
      if (prevResponseLower.includes('which aspect') || prevResponseLower.includes('focus on')) {
        if (lowerMessage.includes('technical') || lowerMessage.includes('technique') || lowerMessage.includes('shots')) {
          return `Great! Let's focus on your technical skills. Based on your CourtIQ profile, your current technical rating is ${courtiqRatings.TECH || 3}/5. Here are three specific areas we could work on:\n\n1. Dinking precision and control\n2. Third shot drop consistency\n3. Serve placement and variety\n\nWhich of these would you like to prioritize in your training?`;
        } else if (lowerMessage.includes('tactical') || lowerMessage.includes('strategy') || lowerMessage.includes('position')) {
          return `Excellent choice! Tactical awareness is crucial for advancing your game. Your current tactical rating is ${courtiqRatings.TACT || 3}/5. I recommend focusing on:\n\n1. Court positioning in doubles play\n2. Shot selection based on opponent position\n3. Defensive-to-offensive transition strategies\n\nWhich aspect of tactical play interests you most?`;
        } else if (lowerMessage.includes('physical') || lowerMessage.includes('fitness') || lowerMessage.includes('stamina')) {
          return `Physical conditioning is a great focus area! Your current physical fitness rating is ${courtiqRatings.PHYS || 3}/5. Let's consider these key areas:\n\n1. Lateral movement and quick direction changes\n2. Sustained energy for tournament play\n3. Recovery between points and games\n\nWould you like me to create a pickleball-specific fitness routine for you?`;
        } else if (lowerMessage.includes('mental') || lowerMessage.includes('focus') || lowerMessage.includes('confidence')) {
          return `Mental toughness is often the differentiator at higher levels! Your current mental game rating is ${courtiqRatings.MENT || 3}/5. Here are key areas we could develop:\n\n1. Focus maintenance during critical points\n2. Confidence building after errors\n3. Pre-point routines for consistency\n\nWhich of these mental skills would you like to strengthen first?`;
        } else if (lowerMessage.includes('consistency') || lowerMessage.includes('reliable') || lowerMessage.includes('steady')) {
          return `Consistency is fundamental to pickleball success! Your consistency rating is currently ${courtiqRatings.CONS || 3}/5. To improve this, we should work on:\n\n1. Structured practice routines\n2. Skill measurement and tracking\n3. Progressive difficulty training\n\nWould you like me to create a consistency-focused training plan for you?`;
        }
      }
      
      // If previous message suggested a training plan and user expressed interest
      if ((prevResponseLower.includes('training plan') || prevResponseLower.includes('would you like me to create')) &&
          (lowerMessage.includes('yes') || lowerMessage.includes('sure') || lowerMessage.includes('please') || lowerMessage.includes('create'))) {
        return `I'll design a customized training plan focusing on ${this.getDimensionName(dimensionFocus).toLowerCase()}. The plan will include specific exercises, drills, and progression metrics tailored to your current skill level. It should be available in your training dashboard shortly. Is there anything specific you'd like to emphasize in this plan?`;
      }
    }
    
    // If none of the contextual responses match, fall back to the standard response
    return this.generateSageResponse(message, user, recentJournalEntries);
  }
  
  /**
   * Determine if we should suggest a journal entry based on conversation
   * 
   * @param message The user message
   * @param recentJournalEntries Recent journal entries
   * @returns Journal suggestion if appropriate
   */
  private shouldSuggestJournaling(
    message: string, 
    recentJournalEntries: any[],
    dimensionFocus: DimensionCode = 'TECH'
  ): { prompt: string, type: string, dimensionCode?: DimensionCode } | null {
    const lowerMessage = message.toLowerCase();
    const hasRecentJournal = recentJournalEntries && recentJournalEntries.length > 0;
    const lastJournalDate = hasRecentJournal ? new Date(recentJournalEntries[0].createdAt) : null;
    const daysSinceLastJournal = lastJournalDate ? 
      Math.floor((Date.now() - lastJournalDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    // Don't suggest if user just journaled within last day, unless specifically asked about journaling
    const explicitJournalingRequest = lowerMessage.includes('journal') || 
                                      lowerMessage.includes('write') || 
                                      lowerMessage.includes('record') || 
                                      lowerMessage.includes('log') ||
                                      lowerMessage.includes('reflect');
                                      
    if (daysSinceLastJournal < 1 && !explicitJournalingRequest) {
      return null;
    }
    
    // Specific prompts by dimension for more personalized journaling suggestions
    const dimensionPrompts = {
      'TECH': {
        prompt: "Reflect on your technical skills: Which shots are you most confident with? Which shots need improvement? What technical changes have you been working on recently?",
        type: "guided"
      },
      'TACT': {
        prompt: "Analyze your tactical awareness: How do you approach different opponents? What strategies work best for you? What tactical decisions do you struggle with during matches?",
        type: "guided"
      },
      'PHYS': {
        prompt: "Evaluate your physical fitness: How does your energy level feel during matches? Are there physical limitations affecting your game? What fitness improvements would most impact your play?",
        type: "guided"
      },
      'MENT': {
        prompt: "Explore your mental game: What situations cause the most stress during play? How do you handle pressure points? What mental techniques help you stay focused?",
        type: "guided"
      },
      'CONS': {
        prompt: "Assess your consistency: What factors affect your consistency most? How do you maintain focus throughout a match? What practice routines have improved your consistency?",
        type: "guided"
      }
    };
    
    // If explicitly asking about journaling, provide dimension-focused prompt
    if (explicitJournalingRequest) {
      return {
        ...dimensionPrompts[dimensionFocus],
        dimensionCode: dimensionFocus
      };
    }
    
    // Suggest match reflection if discussing a match
    if (lowerMessage.includes('match') || lowerMessage.includes('played') || 
        lowerMessage.includes('won') || lowerMessage.includes('lost') ||
        lowerMessage.includes('tournament') || lowerMessage.includes('competed')) {
      return {
        prompt: "Reflect on your recent match: What went well? What could be improved? How did you mentally handle challenging moments?",
        type: "reflection",
        dimensionCode: 'MENT' // Mental focus is important for match reflection
      };
    }
    
    // Suggest training log if discussing practice
    if (lowerMessage.includes('practice') || lowerMessage.includes('training') || 
        lowerMessage.includes('drill') || lowerMessage.includes('exercise') ||
        lowerMessage.includes('workout') || lowerMessage.includes('session')) {
      return {
        prompt: "Record your training session: What drills did you complete? How did they feel? What progress did you notice?",
        type: "training_log",
        dimensionCode: lowerMessage.includes('conditioning') ? 'PHYS' : dimensionFocus
      };
    }
    
    // Technical focus suggestions
    if (lowerMessage.includes('dink') || lowerMessage.includes('serve') || 
        lowerMessage.includes('volley') || lowerMessage.includes('shot') ||
        lowerMessage.includes('technique') || lowerMessage.includes('backhand') ||
        lowerMessage.includes('forehand')) {
      return {
        prompt: "Analyze your technical development: Which shots are working well for you? Which shots need more practice? What technical adjustments are you working on?",
        type: "guided",
        dimensionCode: 'TECH'
      };
    }
    
    // Tactical focus suggestions
    if (lowerMessage.includes('strategy') || lowerMessage.includes('position') || 
        lowerMessage.includes('court') || lowerMessage.includes('tactics') ||
        lowerMessage.includes('opponent') || lowerMessage.includes('game plan')) {
      return {
        prompt: "Reflect on your tactical decisions: What strategies have worked against different opponents? How do you adapt your game plan during a match? What tactical aspects would you like to develop?",
        type: "guided",
        dimensionCode: 'TACT'
      };
    }
    
    // Physical focus suggestions
    if (lowerMessage.includes('fitness') || lowerMessage.includes('strength') || 
        lowerMessage.includes('conditioning') || lowerMessage.includes('agility') ||
        lowerMessage.includes('endurance') || lowerMessage.includes('energy')) {
      return {
        prompt: "Log your physical conditioning: How does your body feel during and after matches? What physical limitations are affecting your game? What physical training is making the biggest difference?",
        type: "guided",
        dimensionCode: 'PHYS'
      };
    }
    
    // Mental focus suggestions
    if (lowerMessage.includes('nervous') || lowerMessage.includes('anxiety') || 
        lowerMessage.includes('pressure') || lowerMessage.includes('mental') ||
        lowerMessage.includes('focus') || lowerMessage.includes('confidence') ||
        lowerMessage.includes('frustrated') || lowerMessage.includes('stress')) {
      return {
        prompt: "Explore your mental game: What situations cause the most stress during play? What mental techniques have helped you stay focused? How do you build and maintain confidence?",
        type: "guided",
        dimensionCode: 'MENT'
      };
    }
    
    // Consistency focus suggestions
    if (lowerMessage.includes('consistency') || lowerMessage.includes('routine') || 
        lowerMessage.includes('practice') || lowerMessage.includes('reliable') ||
        lowerMessage.includes('regular') || lowerMessage.includes('habit')) {
      return {
        prompt: "Reflect on your consistency: What factors help you maintain consistent play? What disrupts your routine? How do you reset after mistakes to maintain consistency?",
        type: "guided",
        dimensionCode: 'CONS'
      };
    }
    
    // If no recent journal entries at all, suggest starting a journaling practice
    if (!hasRecentJournal) {
      return {
        prompt: "Start your pickleball journal by reflecting on your current game: What are your strengths and areas for improvement?",
        type: "free_form",
        dimensionCode: dimensionFocus
      };
    }
    
    // If message is long enough, it might indicate a detailed discussion
    // that could benefit from journaling (common for thoughtful players)
    if (message.length > 100 && daysSinceLastJournal > 3) {
      return {
        prompt: "You've shared some great insights. Consider journaling about this to track your progress over time. What specific aspects would you like to document?",
        type: "free_form",
        dimensionCode: dimensionFocus
      };
    }
    
    // Default: no suggestion
    return null;
  }
  
  /**
   * Generate a response that references the user's journal entry
   * 
   * @param entry The journal entry
   * @param dimensionFocus The current dimension focus
   * @returns A personalized response referencing the journal entry
   */
  private generateJournalBasedResponse(entry: any, dimensionFocus: DimensionCode): string {
    const entryType = entry.entryType || 'free_form';
    const mood = entry.mood;
    const entryContent = entry.content || '';
    const entryTitle = entry.title || '';
    const entryDimension = entry.dimensionCode as DimensionCode || dimensionFocus;
    
    // Extract key terms from journal content to personalize response
    const lowerContent = entryContent.toLowerCase();
    const lowerTitle = entryTitle.toLowerCase();
    
    // Check for specific themes in journal content
    const mentionsMatch = lowerContent.includes('match') || lowerContent.includes('game') || lowerContent.includes('played');
    const mentionsImprovement = lowerContent.includes('improve') || lowerContent.includes('better') || lowerContent.includes('progress');
    const mentionsStruggle = lowerContent.includes('struggle') || lowerContent.includes('difficult') || lowerContent.includes('challenge');
    const mentionsSuccess = lowerContent.includes('success') || lowerContent.includes('well') || lowerContent.includes('good');
    const mentionsGoals = lowerContent.includes('goal') || lowerContent.includes('aim') || lowerContent.includes('target');
    
    // Reference mood if specified with more nuanced phrasing
    let moodPhrase = '';
    if (mood) {
      if (mood === 'excellent') {
        moodPhrase = 'I see you were feeling very positive and confident. That enthusiasm is a great foundation for growth! ';
      } else if (mood === 'good') {
        moodPhrase = 'I notice you were in a good mood when writing this entry. That positive mindset helps learning and skill development. ';
      } else if (mood === 'neutral') {
        moodPhrase = 'You seemed to have a balanced perspective in this entry. That objectivity is valuable for accurate self-assessment. ';
      } else if (mood === 'low') {
        moodPhrase = 'I notice you were feeling somewhat challenged when writing this. Remember that working through difficulties often leads to breakthroughs. ';
      } else if (mood === 'poor') {
        moodPhrase = 'I see you were feeling frustrated during this reflection. Processing these emotions through journaling is a healthy part of the improvement journey. ';
      }
    }
    
    // Generate different responses based on entry type and content themes
    if (entryType === 'reflection') {
      if (mentionsMatch && mentionsSuccess) {
        return `${moodPhrase}Your match reflection captured some positive aspects of your performance. To build on these successes, let's focus on integrating your effective ${this.getDimensionName(entryDimension).toLowerCase()} techniques into consistent practice routines. Would you like me to outline a training plan that reinforces these strengths?`;
      } else if (mentionsMatch && mentionsStruggle) {
        return `${moodPhrase}Your match reflection honestly addresses areas where you faced challenges. This self-awareness is crucial for growth. Based on these insights, I'd recommend targeted ${this.getDimensionName(dimensionFocus).toLowerCase()} drills to address these specific situations. Would you like me to suggest some focused exercises?`;
      } else {
        return `${moodPhrase}Your reflective approach shows a commitment to understanding your game at a deeper level. Using these insights, I recommend focusing on specific ${this.getDimensionName(dimensionFocus).toLowerCase()} drills that address the patterns you've identified. Would you like me to create a targeted improvement plan?`;
      }
    } else if (entryType === 'training_log') {
      if (mentionsImprovement) {
        return `${moodPhrase}I'm glad to see you're noticing improvements in your training. To continue this progress, I suggest incorporating progressive ${this.getDimensionName(dimensionFocus).toLowerCase()} challenges that build on your recent gains. Would you like me to design a training progression that takes these improvements to the next level?`;
      } else if (mentionsStruggle) {
        return `${moodPhrase}Your training log honestly documents some challenges you're facing. This awareness is the first step toward improvement. Let's develop some alternative ${this.getDimensionName(entryDimension).toLowerCase()} approaches that might better suit your learning style. Would you like some specific recommendations?`;
      } else {
        return `${moodPhrase}Your consistent training documentation demonstrates commitment to structured practice. To enhance your progress, I suggest incorporating more varied ${this.getDimensionName(dimensionFocus).toLowerCase()} drills into your routine. Would you like me to design a more diverse training plan based on your current practice focus?`;
      }
    } else if (entryType === 'guided') {
      if (mentionsGoals) {
        return `${moodPhrase}I appreciate the clear goals you've outlined in your guided reflection. To help you achieve these objectives, I recommend focusing on ${this.getDimensionName(dimensionFocus).toLowerCase()} development with specific measurable targets. Would you like me to create a goal-oriented training plan that aligns with your aspirations?`;
      } else if (mentionsStruggle) {
        return `${moodPhrase}Your guided reflection thoughtfully addresses some challenges you're experiencing. These insights provide valuable direction for our coaching focus. Based on your reflection, I recommend targeted work on ${this.getDimensionName(entryDimension).toLowerCase()} skills. Would you like specific recommendations to address these challenges?`;
      } else {
        return `${moodPhrase}Your guided reflection shows thoughtful analysis of your game. This level of self-awareness accelerates improvement. Based on your insights, I recommend focusing on ${this.getDimensionName(dimensionFocus).toLowerCase()} development to complement your understanding. Would you like specific recommendations in this area?`;
      }
    } else {
      // Free-form entries
      if (mentionsGoals) {
        return `${moodPhrase}The goals you've outlined in your journal show clear direction for your pickleball journey. To help you achieve these objectives, let's connect them to specific ${this.getDimensionName(dimensionFocus).toLowerCase()} training activities. Would you like me to create a structured plan that bridges your goals with daily practice?`;
      } else if (mentionsImprovement) {
        return `${moodPhrase}It's great to see you tracking your improvement through journaling. To accelerate your progress, consider connecting these observations to specific practice goals in ${this.getDimensionName(dimensionFocus).toLowerCase()}. Would you like me to suggest a framework that links your journal insights directly to training activities?`;
      } else {
        return `${moodPhrase}Your journaling practice shows commitment to improvement through reflection. This metacognitive approach is powerful for skill development. To enhance your ${this.getDimensionName(dimensionFocus).toLowerCase()} skills, try connecting your journal observations to specific practice goals. Would you like me to suggest a structured approach to this process?`;
      }
    }
  }
  
  /**
   * Generate an insight based on match results
   * 
   * @param match Match data
   * @param dimensionFocus Current dimension focus
   * @returns Insight text based on match data
   */
  private generateMatchBasedInsight(match: any, dimensionFocus: DimensionCode): string {
    const outcome = match.userScore > match.opponentScore ? 'won' : 'lost';
    const scoreDifference = Math.abs(match.userScore - match.opponentScore);
    const closeMatch = scoreDifference <= 2;
    
    // Generate different insights based on dimension focus
    switch (dimensionFocus) {
      case 'TECH':
        return outcome === 'won' 
          ? `your technical execution was solid, but consistent third shot drops could further improve your control` 
          : `focusing on shot consistency, especially dinking precision, could improve your technical performance`;
          
      case 'TACT':
        return closeMatch
          ? `small tactical adjustments could make the difference in close games like this one`
          : `strategic court positioning and shot selection are areas that could improve your competitive edge`;
          
      case 'PHYS':
        return outcome === 'won'
          ? `maintaining your energy throughout multiple games will help sustain your winning performance`
          : `improved physical conditioning might help maintain performance level throughout the entire match`;
          
      case 'MENT':
        return closeMatch
          ? `mental focus during critical points often determines the outcome of close matches like this one`
          : `developing pre-point routines and positive self-talk could enhance your mental resilience`;
          
      case 'CONS':
        return outcome === 'won'
          ? `building on consistent performance will help maintain your winning record`
          : `establishing more consistent shot patterns could reduce unforced errors and improve results`;
          
      default:
        return `there are specific skills we could develop to enhance your performance`;
    }
  }
  
  /**
   * Update the user's coaching profile with insights from conversation
   * 
   * @param userId User ID
   * @param message User message
   * @param dimensionFocus Current dimension focus
   */
  private async updateCoachingProfile(
    userId: number, 
    message: string, 
    dimensionFocus: DimensionCode
  ): Promise<void> {
    try {
      // Get current coaching profile if exists
      const profile = await storage.getCoachingProfile(userId);
      
      // Update user's coaching profile with interaction data
      if (profile) {
        await storage.updateCoachingProfile(userId, {
          lastInteractionAt: new Date(),
          conversationCount: (profile.conversationCount || 0) + 1,
          primaryFocus: dimensionFocus,
          interestsData: {
            ...(profile.interestsData || {}),
            [dimensionFocus]: ((profile.interestsData || {})[dimensionFocus] || 0) + 1
          }
        });
      } else {
        // Create new profile if none exists
        await storage.createCoachingProfile({
          userId,
          lastInteractionAt: new Date(),
          conversationCount: 1,
          primaryFocus: dimensionFocus,
          interestsData: {
            [dimensionFocus]: 1
          }
        });
      }
    } catch (error) {
      console.error('[SageEngine] updateCoachingProfile error:', error);
      // Non-critical error, don't rethrow
    }
  }
  
  /**
   * Get time of day for personalized greetings
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
  
  /**
   * Check if a message is related to a journal entry
   */
  private isMessageRelatedToJournalEntry(message: string, entry: any): boolean {
    if (!entry) return false;
    
    const lowerMessage = message.toLowerCase();
    const lowerTitle = entry.title ? entry.title.toLowerCase() : '';
    const lowerContent = entry.content ? entry.content.toLowerCase() : '';
    
    // Check for direct references to journaling
    if (lowerMessage.includes('journal') || lowerMessage.includes('entry') || 
        lowerMessage.includes('wrote') || lowerMessage.includes('recorded') ||
        lowerMessage.includes('reflection') || lowerMessage.includes('noted')) {
      return true;
    }
    
    // Check if the message references the dimension focus of the journal entry
    if (entry.dimensionCode) {
      const dimensionKeywords = {
        'TECH': ['technical', 'technique', 'shot', 'dink', 'volley', 'serve'],
        'TACT': ['tactical', 'strategy', 'position', 'court', 'placement'],
        'PHYS': ['physical', 'fitness', 'stamina', 'movement', 'agility'],
        'MENT': ['mental', 'focus', 'confidence', 'pressure', 'anxiety'],
        'CONS': ['consistent', 'consistency', 'practice', 'routine', 'reliable']
      };
      
      const keywords = dimensionKeywords[entry.dimensionCode];
      if (keywords && keywords.some(keyword => lowerMessage.includes(keyword))) {
        return true;
      }
    }
    
    // Check for content overlap with journal title or content
    const messageWords = lowerMessage.split(/\s+/).filter(word => word.length > 4);
    const titleWords = lowerTitle.split(/\s+/).filter(word => word.length > 4);
    const contentWords = lowerContent.split(/\s+/).filter(word => word.length > 4);
    
    // If any significant words from the message appear in the journal entry (more weighted matching)
    // Also check for multi-word phrases that might appear in both
    if (messageWords.some(word => titleWords.includes(word) || contentWords.includes(word))) {
      return true;
    }
    
    // Check for sentiment or mood matches
    if (entry.mood) {
      const moodKeywords = {
        'excellent': ['great', 'excellent', 'amazing', 'fantastic', 'best'],
        'good': ['good', 'well', 'positive', 'happy', 'pleased'],
        'neutral': ['okay', 'fine', 'neutral', 'normal', 'moderate'],
        'low': ['low', 'bad', 'down', 'unhappy', 'sad'],
        'poor': ['poor', 'terrible', 'worst', 'awful', 'disappointed']
      };
      
      const keywords = moodKeywords[entry.mood];
      if (keywords && keywords.some(keyword => lowerMessage.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  }
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
  
  /**
   * PKL-278651-SAGE-0002-CONV - SAGE Conversational UI Implementation
   * Process a conversation message and generate a response based on user input
   * 
   * @param userId The user ID
   * @param message The user message content
   * @param conversationId Optional existing conversation ID
   * @returns The conversation with new messages
   */
  /**
   * Process a user message in a SAGE conversation with enhanced contextual awareness
   * 
   * @param userId The user ID
   * @param message The user message content
   * @param conversationId Optional conversation ID
   * @returns Updated conversation with new messages
   */
  async processConversationMessage(
    userId: number,
    message: string,
    conversationId?: number
  ): Promise<{
    conversation: any,
    newMessages: any[]
  }> {
    try {
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      let conversation;
      let isNewConversation = false;
      
      // Get or create conversation
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          throw new Error('Conversation not found or unauthorized');
        }
      } else {
        // Try to get the active conversation
        conversation = await storage.getActiveConversation(userId);
        
        // Create new conversation if none is active
        if (!conversation) {
          conversation = await storage.createConversation({
            userId,
            topic: 'New Coaching Conversation',
            isArchived: false,
            lastMessageAt: new Date()
          });
          isNewConversation = true;
        }
      }

      // Create the user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: message,
        sentAt: new Date(),
        role: 'user',
        metadata: { type: 'USER' },
        feedback: null
      });
      
      // Get conversation history for context (up to 5 previous messages)
      const recentMessages = await storage.getRecentMessages(conversation.id, 5);
      
      // Enhanced context-gathering: Get user's CourtIQ ratings, recent matches and journal entries
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      const recentMatches = await storage.getMatchesByUser(userId, 3);
      const recentJournalEntries = await storage.getRecentJournalEntries(userId, 3);
      
      // Determine primary focus based on message content or user history
      const dimensionFocus = this.determineFocusDimension(message, courtiqRatings, recentJournalEntries);
      
      // Generate personalized SAGE response based on all gathered context
      const sageResponseContent = this.generateContextAwareResponse(
        message, 
        user, 
        {
          recentMessages,
          courtiqRatings,
          recentMatches,
          recentJournalEntries,
          dimensionFocus
        }
      );
      
      // Determine if the response contains a recommendation
      const recommendation = this.determineRecommendationType(message, sageResponseContent, dimensionFocus);
      
      // Determine if we should suggest a journal entry based on conversation
      const journalSuggestion = this.shouldSuggestJournaling(message, recentJournalEntries, dimensionFocus);
      
      // Create the SAGE response message with enhanced metadata
      const sageMessage = await storage.createMessage({
        conversationId: conversation.id,
        content: sageResponseContent,
        sentAt: new Date(),
        role: 'assistant',
        feedback: null,
        metadata: {
          type: 'SAGE',
          ...(recommendation ? {
            recommendationType: recommendation.type,
            dimensionFocus: recommendation.dimensionFocus
          } : {}),
          ...(journalSuggestion ? {
            suggestJournal: true,
            journalPrompt: journalSuggestion.prompt,
            journalType: journalSuggestion.type,
            journalDimensionCode: journalSuggestion.dimensionCode || dimensionFocus
          } : {})
        }
      });
      
      // If new conversation, update the topic and dimension focus based on the first message
      if (isNewConversation) {
        const conversationTopic = this.deriveTopic(message);
        await storage.updateConversation(conversation.id, {
          topic: conversationTopic,
          dimensionFocus
        });
        conversation.topic = conversationTopic;
        conversation.dimensionFocus = dimensionFocus;
      }
      
      // Update user's coaching profile with insights from this conversation
      await this.updateCoachingProfile(userId, message, dimensionFocus);
      
      // Return updated conversation with new messages
      return {
        conversation,
        newMessages: [userMessage, sageMessage]
      };
    } catch (error) {
      console.error('[SageEngine] processConversationMessage error:', error);
      throw error;
    }
  }
  
  /**
   * Record user feedback on a SAGE message
   * 
   * @param userId The user ID
   * @param messageId The message ID
   * @param feedbackType 'positive' or 'negative'
   * @param conversationId The conversation ID
   * @returns Updated message with feedback
   */
  async recordMessageFeedback(
    userId: number,
    messageId: number,
    feedbackType: 'positive' | 'negative',
    conversationId: number
  ): Promise<any> {
    try {
      // Verify the conversation belongs to the user
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        throw new Error('Conversation not found or unauthorized');
      }
      
      // Update the message feedback
      const updatedMessage = await storage.updateMessageFeedback(messageId, feedbackType);
      
      // Log the feedback for future improvement (in a real system, this would
      // be used to train the model or adjust rule-based responses)
      console.log(`[SAGE] User ${userId} gave ${feedbackType} feedback on message ${messageId}`);
      
      return updatedMessage;
    } catch (error) {
      console.error('[SageEngine] recordMessageFeedback error:', error);
      throw error;
    }
  }
  
  /**
   * Generate a response from SAGE based on user input using rule-based system
   * 
   * @param message The user message
   * @param user The user object
   * @param recentJournalEntries Optional recent journal entries to inform terminology responses
   * @returns The SAGE response text
   */
  private generateSageResponse(message: string, user: any, recentJournalEntries: any[] = []): string {
    const lowerMessage = message.toLowerCase();
    
    // Welcome and introduction for first message in conversation
    if (lowerMessage.match(/^(hi|hello|hey|greetings|howdy)/i)) {
      return `Hello ${user.firstName || user.username || 'there'}! I'm S.A.G.E. (Skills Assessment & Growth Engine), your personalized pickleball coach. How can I help improve your game today? You can ask me about specific skills, request a training plan, or get advice on your playing strategy.`;
    }
    
    // First, check for pickleball terminology in the message
    const termAnalysis = analyzePickleballTerminology(message);
    
    // If we found pickleball terms, generate a terminology-specific response
    if (termAnalysis.detectedTerms.length > 0) {
      const termResponse = generateTerminologyResponse(
        termAnalysis, 
        user.firstName || user.username || 'there',
        recentJournalEntries
      );
      
      // If we have a valid term response, use it
      if (termResponse) {
        return termResponse;
      }
    }
    
    // Fall back to standard responses if no terminology recognized
    
    // Technical skills
    if (lowerMessage.includes('dink') || lowerMessage.includes('third shot') || lowerMessage.includes('technique')) {
      return `Your dinking technique is crucial for controlling the game. Focus on a stable paddle face and keeping your wrist firm. For effective third shots and dinks, remember to bend your knees slightly and maintain a relaxed grip. Would you like me to create a technical skills training plan that focuses on these shot fundamentals?`;
    }
    
    // Tactical awareness
    if (lowerMessage.includes('strategy') || lowerMessage.includes('position') || lowerMessage.includes('court') || lowerMessage.includes('tactic')) {
      return `Good court positioning is the foundation of tactical success in pickleball. Always try to maintain the center of the court with your partner, and move as a unit when playing doubles. When your opponents are at the kitchen line, aim deep to push them back. Would you like me to generate a tactical training plan focusing on court positioning and game strategy?`;
    }
    
    // Physical fitness
    if (lowerMessage.includes('fitness') || lowerMessage.includes('stamina') || lowerMessage.includes('endurance') || lowerMessage.includes('tired') || lowerMessage.includes('energy')) {
      return `Pickleball-specific fitness is essential for sustained performance. I recommend incorporating lateral movement drills, short sprints, and recovery exercises into your routine. Even 15 minutes of targeted exercises before play can improve your on-court stamina significantly. Should I create a fitness training plan customized for pickleball players?`;
    }
    
    // Mental toughness
    if (lowerMessage.includes('nervous') || lowerMessage.includes('anxiety') || lowerMessage.includes('focus') || lowerMessage.includes('concentrate') || lowerMessage.includes('pressure') || lowerMessage.includes('mental')) {
      return `Mental toughness is often the difference between good and great players. Try implementing a pre-point routine to reset your focus: take a deep breath, tap your paddle twice, and visualize successful execution. Would you like me to design a mental performance plan with specific exercises to build your confidence and focus?`;
    }
    
    // Consistency
    if (lowerMessage.includes('consistency') || lowerMessage.includes('inconsistent') || lowerMessage.includes('variable') || lowerMessage.includes('practice') || lowerMessage.includes('routine')) {
      return `Consistent play comes from disciplined practice and reliable mechanics. I recommend creating a practice routine that includes dedicated drills for each shot type. Start with 10 minutes of dinking, followed by 10 minutes of serve and return practice. Would you like me to create a structured weekly practice schedule to help you develop consistency?`;
    }
    
    // Training plan request
    if (lowerMessage.includes('training plan') || lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('drill')) {
      return `I'd be happy to create a personalized training plan for you. To make it most effective, could you tell me which aspect of your game you'd like to focus on most? Technical skills, tactical awareness, physical fitness, mental toughness, or consistency? This will help me tailor the plan to your specific needs.`;
    }
    
    // Match analysis
    if (lowerMessage.includes('match') || lowerMessage.includes('game') || lowerMessage.includes('tournament') || lowerMessage.includes('played') || lowerMessage.includes('lost') || lowerMessage.includes('won')) {
      return `Post-match analysis is a powerful tool for improvement. Try recording key statistics in your next match: unforced errors, winners, and net play success rate. This data will help identify patterns and areas for focused practice. Would you like guidance on how to effectively analyze your match performance?`;
    }
    
    // Default response for unrecognized topics
    return `I understand you want to improve your pickleball skills. To offer more specific guidance, could you tell me which aspect of your game you want to focus on? Technical skills (shots and mechanics), tactical awareness (strategy and court positioning), physical fitness (movement and stamina), mental toughness (focus and confidence), or consistency (reliable performance)?`;
  }
  
  /**
   * Determine if the SAGE response contains a recommendation
   * 
   * @param userMessage The user message
   * @param sageResponse The SAGE response
   * @param dimensionFocus The current dimension focus
   * @returns Recommendation type and dimension focus if present
   */
  private determineRecommendationType(
    userMessage: string, 
    sageResponse: string,
    dimensionFocus: DimensionCode = 'TECH'
  ): { type: 'training' | 'insight' | 'schedule', dimensionFocus: DimensionCode } | null {
    const lowerUserMessage = userMessage.toLowerCase();
    const lowerSageResponse = sageResponse.toLowerCase();
    
    // Check for terminology focus first
    const termAnalysis = analyzePickleballTerminology(userMessage);
    if (termAnalysis.suggestedDimension) {
      dimensionFocus = termAnalysis.suggestedDimension;
    }
    
    // Determine recommendation type
    if (lowerSageResponse.includes('training plan') || lowerSageResponse.includes('create a plan') || 
        lowerSageResponse.includes('design a') || lowerSageResponse.includes('would you like me to create')) {
      return { type: 'training', dimensionFocus };
    } else if (lowerSageResponse.includes('schedule') || lowerSageResponse.includes('routine') || 
               lowerSageResponse.includes('practice schedule') || lowerSageResponse.includes('weekly')) {
      return { type: 'schedule', dimensionFocus };
    } else if (sageResponse.length > 100 && (
               lowerSageResponse.includes('try') || lowerSageResponse.includes('focus on') || 
               lowerSageResponse.includes('remember to') || lowerSageResponse.includes('important'))) {
      return { type: 'insight', dimensionFocus };
    } else if (termAnalysis.detectedTerms.length > 0 && 
              (lowerSageResponse.includes('drill') || lowerSageResponse.includes('practice') || 
               lowerSageResponse.includes('improve') || lowerSageResponse.includes('technique'))) {
      return { type: 'training', dimensionFocus };
    }
    
    return null;
  }
  
  /**
   * Derive a topic for the conversation based on the first message
   * 
   * @param message The user message
   * @returns A topic for the conversation
   */
  private deriveTopic(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // First, check for specific pickleball terminology in the message
    const termAnalysis = analyzePickleballTerminology(message);
    
    // If we found pickleball terms, use the primary term in the topic
    if (termAnalysis.primaryTerm) {
      const term = termAnalysis.primaryTerm;
      
      // Customize topic based on term category and dimension
      switch(term.primaryDimension) {
        case 'TECH':
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Technique Coaching`;
        case 'TACT':
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Strategic Development`;
        case 'PHYS':
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Physical Training`;
        case 'MENT':
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Mental Approach`;
        case 'CONS':
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Consistency Training`;
        default:
          return `${term.term.charAt(0).toUpperCase() + term.term.slice(1)} Skill Development`;
      }
    }
    
    // Fall back to standard topic derivation if no specific terms found
    if (lowerMessage.includes('dink') || lowerMessage.includes('third shot') || lowerMessage.includes('technique')) {
      return 'Technical Skills Discussion';
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('position') || lowerMessage.includes('tactic')) {
      return 'Tactical Awareness Coaching';
    } else if (lowerMessage.includes('fitness') || lowerMessage.includes('stamina') || lowerMessage.includes('endurance')) {
      return 'Physical Fitness Planning';
    } else if (lowerMessage.includes('nervous') || lowerMessage.includes('focus') || lowerMessage.includes('mental')) {
      return 'Mental Performance Coaching';
    } else if (lowerMessage.includes('consistency') || lowerMessage.includes('practice') || lowerMessage.includes('routine')) {
      return 'Consistency Development';
    } else if (lowerMessage.includes('training') || lowerMessage.includes('plan') || lowerMessage.includes('exercise')) {
      return 'Training Plan Discussion';
    } else if (lowerMessage.includes('match') || lowerMessage.includes('game') || lowerMessage.includes('tournament')) {
      return 'Match Analysis & Feedback';
    } else {
      return 'Pickleball Coaching Conversation';
    }
  }
}

// Export a singleton instance
export const sageEngine = new SageEngine();