/**
 * Simple SAGE Pickleball Knowledge Integration
 * Streamlined version for testing
 */

import { isRuleQuestion, findRulesForQuestion, generateRuleResponse, pickleballRules, PickleballRule, RuleCategory } from './simple-pickleball-rules';

/**
 * Options to customize the response
 */
export interface ResponseOptions {
  /** Include follow-up questions in the response */
  includeFollowUps?: boolean;
  /** Use casual language in the response */
  casualTone?: boolean;
  /** Include coaching tips related to the rule */
  includeCoachingTips?: boolean;
  /** Adjust response for player skill level (beginner, intermediate, advanced) */
  playerLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Process a pickleball knowledge query
 */
export function processPickleballQuery(
  message: string, 
  options: ResponseOptions = {}
): string {
  // Set defaults
  const resolvedOptions: Required<ResponseOptions> = {
    includeFollowUps: true,
    casualTone: true,
    includeCoachingTips: false,
    playerLevel: 'intermediate',
    ...options
  };
  
  // Special handling for kitchen/non-volley zone questions
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('kitchen') || 
      lowerMessage.includes('non-volley') || 
      lowerMessage.includes('nvz')) {
     
    // Check for specific types of kitchen questions
    let kitchenRule;
    
    // For questions about violations or stepping in the kitchen
    if (lowerMessage.includes('volley') || 
        lowerMessage.includes('step') || 
        lowerMessage.includes('fault') || 
        lowerMessage.includes('violation') || 
        lowerMessage.includes('momentum') ||
        lowerMessage.includes('touch')) {
      // Use the kitchen-volley restriction rule
      kitchenRule = pickleballRules.find(rule => rule.id === 'kitchen-volley');
    }
    // For general "what is" questions about the kitchen
    else if (lowerMessage.includes('what') || 
             lowerMessage.includes('rule') ||
             lowerMessage.includes('explain')) {
      // Use the standard non-volley-zone rule
      kitchenRule = pickleballRules.find(rule => rule.id === 'non-volley-zone');
    }
    
    if (kitchenRule) {
      let response = `${kitchenRule.name}: ${kitchenRule.description}`;
      
      // Add coaching tip if requested
      if (resolvedOptions.includeCoachingTips) {
        const tip = generateCoachingTip(kitchenRule);
        if (tip) {
          response += `\n\nCoaching Tip: ${tip}`;
        }
      }
      
      // Always add kitchen-specific follow-up
      response += "\n\nWould you like to know about common kitchen violations or strategies for effective kitchen play?";
      
      return response;
    }
  }
  
  // Regular rule question processing
  if (isRuleQuestion(message)) {
    // Get the base rule response
    let response = generateRuleResponse(message);
    
    // Add coaching tips if requested
    if (resolvedOptions.includeCoachingTips) {
      const matchingRules = findRulesForQuestion(message);
      if (matchingRules.length > 0) {
        const tip = generateCoachingTip(matchingRules[0]);
        if (tip) {
          response += `\n\nCoaching Tip: ${tip}`;
        }
      }
    }
    
    // Add follow-up questions if requested
    if (resolvedOptions.includeFollowUps) {
      const followUps = generateFollowUpQuestions(message);
      if (followUps) {
        response += `\n\n${followUps}`;
      }
    }
    
    return response;
  }
  
  // If it's not a rule question, provide a helpful generic response
  return "I can help with pickleball rules and strategy. Feel free to ask about specific rules, equipment, serving, scoring, or gameplay. What would you like to know?";
}

/**
 * Check if SAGE should handle this query
 */
export function shouldHandlePickleballQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Direct detection for kitchen/non-volley zone questions
  if (lowerMessage.includes('kitchen') || 
      lowerMessage.includes('non-volley') || 
      lowerMessage.includes('nvz')) {
    return true;
  }
  
  // Detect pickleball-related keywords
  const pickleballIndicators = [
    'pickleball', 'pickle ball', 'paddle', 'dink', 'volley',
    'serve', 'rally', 'court', 'net', 'baseline', 'sideline', 'scoring',
    'fault', 'bounce', 'service', 'receiver', 'player', 'game', 'point', 
    'rule', 'official', 'regulation', 'tournament', 'match', 'competition',
    'dimensions', 'equipment', 'line', 'call', 'referee'
  ];
  
  // Check for exact terms first
  const containsPickleballTerms = pickleballIndicators.some(term => 
    lowerMessage.includes(term)
  );
  
  if (containsPickleballTerms) {
    return true;
  }
  
  // Check for rule questions that might not contain standard keywords
  if (lowerMessage.includes('how do i') || 
      lowerMessage.includes('what is the') || 
      lowerMessage.includes('what are the') ||
      lowerMessage.includes('can i') ||
      lowerMessage.includes('allowed to')) {
    
    // Check if this could be a rules question
    return isRuleQuestion(message);
  }
  
  return false;
}

/**
 * Generate a coaching tip related to a rule
 */
function generateCoachingTip(rule: PickleballRule): string | null {
  const tips: Record<string, string> = {
    'court-dimensions': 'When playing, pay attention to the sidelines especially during fast rallies. Many points are lost because players hit the ball too wide.',
    'net-height': 'The net is lower in the middle, which can be helpful for dinks. Aim your dinks to the middle of the net for a higher success rate.',
    'paddle-specifications': 'Choose a paddle weight that feels comfortable for your playing style. Lighter paddles offer more control, while heavier ones provide more power.',
    'ball-specifications': 'Indoor and outdoor balls behave differently. Indoor balls are lighter with larger holes, while outdoor balls are heavier with smaller holes to resist wind.',
    'serve-underhand': 'Focus on consistency with your serve rather than power. A reliable, legal serve is more important than a hard-to-return but technically risky one.',
    'serve-feet-position': 'Practice your serving stance to avoid foot faults. Position yourself comfortably behind the baseline and keep your feet steady during the serve.',
    'serve-diagonal': 'Aim your serve deep into the opponent\'s service court to push them back, making it harder for them to attack.',
    'scoring-points': 'Mentally track the score during play to avoid confusion. In recreational play, announce the score clearly before each serve.',
    'doubles-scoring': 'When calling the score in doubles, always use the three-number format: serving team\'s score, receiving team\'s score, server number.',
    'non-volley-zone': 'Always be conscious of the kitchen line when moving forward. Many players lose points by forgetting how close they are to the non-volley zone.',
    'kitchen-volley': 'After hitting a volley, be sure your momentum doesn\'t carry you into the kitchen. Step back if needed after hitting the ball.',
    'double-bounce-rule': 'During the return of serve, don\'t rush to the net immediately. Wait until you\'ve made your return, then advance strategically.',
    'line-calls': 'When making line calls, be fair and consistent. If you\'re not sure, give the benefit of the doubt to your opponent.',
    'fault-rules': 'Understanding faults clearly helps prevent unnecessary point loss. Review these rules periodically, especially before tournaments.'
  };
  
  return tips[rule.id] || null;
}

/**
 * Generate follow-up questions based on the query
 */
function generateFollowUpQuestions(query: string): string {
  // Determine the type of rule being asked about
  const ruleMatches = findRulesForQuestion(query);
  
  if (ruleMatches.length === 0) {
    return "Would you like to know about court dimensions, serving rules, or the non-volley zone?";
  }
  
  const primaryRule = ruleMatches[0];
  
  // Generate category-specific follow-up questions
  switch (primaryRule.category) {
    case RuleCategory.COURT:
      return "Would you like to know more about court markings or the non-volley zone?";
      
    case RuleCategory.EQUIPMENT:
      return "Would you like to know about paddle specifications or ball requirements?";
      
    case RuleCategory.SERVING:
      return "Would you like to know more about service sequence or common serving faults?";
      
    case RuleCategory.SCORING:
      return "Would you like to learn about rally scoring or how to properly call the score in doubles?";
      
    case RuleCategory.KITCHEN:
      return "Would you like to know about common kitchen violations or strategies for effective kitchen play?";
      
    case RuleCategory.GAMEPLAY:
      return "Would you like to know more about the double bounce rule or line call etiquette?";
      
    default:
      return "Do you have any other questions about pickleball rules or strategies?";
  }
}