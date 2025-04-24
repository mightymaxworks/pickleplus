/**
 * Simple Pickleball Rules Module
 * A streamlined version for testing
 */

/**
 * Rule category types
 */
export enum RuleCategory {
  COURT = 'court',
  EQUIPMENT = 'equipment',
  SERVING = 'serving',
  SCORING = 'scoring',
  KITCHEN = 'kitchen',
  GAMEPLAY = 'gameplay'
}

/**
 * A pickleball rule
 */
export interface PickleballRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  keywords: string[];
}

/**
 * Core rules for testing
 */
export const pickleballRules: PickleballRule[] = [
  // Court Rules
  {
    id: 'court-dimensions',
    name: 'Court Dimensions',
    category: RuleCategory.COURT,
    description: 'The standard pickleball court is 20 feet wide and 44 feet long, identical to a doubles badminton court. It includes right and left service courts and a 7-foot non-volley zone (known as "the kitchen") extending from the net.',
    keywords: ['court', 'dimensions', 'size', 'length', 'width', 'measurements']
  },
  {
    id: 'court-lines',
    name: 'Court Lines',
    category: RuleCategory.COURT,
    description: 'Court lines are 2 inches wide. The baseline and sidelines mark the court perimeter. The non-volley zone line is 7 feet from the net on both sides. The centerline divides the service courts.',
    keywords: ['court', 'lines', 'boundary', 'perimeter', 'centerline']
  },
  // Equipment Rules
  {
    id: 'net-height',
    name: 'Net Height',
    category: RuleCategory.EQUIPMENT,
    description: 'The net is 36 inches high at the sidelines and 34 inches high at the center. The net posts should be 22 feet apart, positioned at the outer edge of the sidelines.',
    keywords: ['net', 'height', 'posts', 'center']
  },
  {
    id: 'paddle-specifications',
    name: 'Paddle Specifications',
    category: RuleCategory.EQUIPMENT,
    description: 'Paddles must be made of rigid, non-compressible material. The combined length and width cannot exceed 24 inches, with no dimension exceeding 17 inches. The paddle must not have features that provide unfair advantage.',
    keywords: ['paddle', 'equipment', 'specifications', 'size', 'material']
  },
  {
    id: 'ball-specifications',
    name: 'Ball Specifications',
    category: RuleCategory.EQUIPMENT,
    description: 'Pickleballs must be 2.874 to 2.972 inches in diameter and weigh between 0.78 and 0.935 ounces. They have 26-40 circular holes, with indoor and outdoor versions available depending on playing surface.',
    keywords: ['ball', 'equipment', 'specifications', 'size', 'weight', 'holes']
  },
  // Serving Rules
  {
    id: 'serve-underhand',
    name: 'Underhand Serve',
    category: RuleCategory.SERVING,
    description: 'The serve must be made underhand. The paddle must contact the ball below waist level, with the paddle head below the wrist when it strikes the ball.',
    keywords: ['serve', 'underhand', 'motion', 'waist', 'wrist']
  },
  {
    id: 'serve-feet-position',
    name: 'Serve Feet Position',
    category: RuleCategory.SERVING,
    description: 'At least one foot must be on the ground behind the baseline during the serve. Neither foot may touch the court or baseline before the ball is struck.',
    keywords: ['serve', 'feet', 'position', 'baseline', 'foot fault']
  },
  {
    id: 'serve-diagonal',
    name: 'Diagonal Service',
    category: RuleCategory.SERVING,
    description: 'The serve must be made diagonally crosscourt to the opponent\'s service court. The ball must clear the non-volley zone and its line.',
    keywords: ['serve', 'diagonal', 'crosscourt', 'service court']
  },
  // Scoring Rules
  {
    id: 'scoring-points',
    name: 'Scoring Points',
    category: RuleCategory.SCORING,
    description: 'Only the serving side can score points. A point is scored when the opposing side commits a fault. Games are typically played to 11 points and must be won by at least 2 points.',
    keywords: ['scoring', 'points', 'serve', 'winning', 'game']
  },
  {
    id: 'doubles-scoring',
    name: 'Doubles Scoring Call',
    category: RuleCategory.SCORING,
    description: 'In doubles, the score calling consists of three numbers: serving team\'s score, receiving team\'s score, and the server number (1 or 2). The server number indicates which player is serving.',
    keywords: ['doubles', 'scoring', 'call', 'numbers', 'server', 'serving']
  },
  // Kitchen (Non-Volley Zone) Rules
  {
    id: 'non-volley-zone',
    name: 'Non-Volley Zone (Kitchen)',
    category: RuleCategory.KITCHEN,
    description: 'The non-volley zone is a 7-foot area on both sides of the net where players cannot volley the ball (hit it in the air before it bounces). This zone includes all lines surrounding it.',
    keywords: ['kitchen', 'non-volley zone', 'nvz', 'seven feet', 'lines']
  },
  {
    id: 'kitchen-volley',
    name: 'Kitchen Volley Restriction',
    category: RuleCategory.KITCHEN,
    description: 'A player cannot volley a ball while standing in the non-volley zone or touching any part of the non-volley zone, including the lines. It\'s a fault if a player\'s momentum carries them into the kitchen after performing a volley.',
    keywords: ['kitchen', 'volley', 'restriction', 'fault', 'momentum', 'touch']
  },
  // Gameplay Rules
  {
    id: 'double-bounce-rule',
    name: 'Double Bounce Rule',
    category: RuleCategory.GAMEPLAY,
    description: 'After the serve, each side must let the ball bounce once before hitting it. After these two bounces, the ball can be volleyed or played off the bounce.',
    keywords: ['double bounce', 'two bounce', 'return', 'serve', 'volley']
  },
  {
    id: 'line-calls',
    name: 'Line Calls',
    category: RuleCategory.GAMEPLAY,
    description: 'A ball contacting any part of the line is considered "in." Players make line calls for balls landing on their side of the court. If uncertain, the ball is considered "in" (benefit of doubt goes to the opponent).',
    keywords: ['line', 'call', 'in', 'out', 'boundary', 'fair']
  },
  {
    id: 'fault-rules',
    name: 'Fault Rules',
    category: RuleCategory.GAMEPLAY,
    description: 'A fault occurs when: the ball lands out of bounds, does not clear the net, is volleyed from the non-volley zone, is volleyed before the double bounce rule is satisfied, or a player touches the net during play.',
    keywords: ['fault', 'violation', 'out', 'net', 'bounce', 'kitchen']
  }
];

/**
 * Simple rule search
 */
export function findRulesByKeywords(query: string): PickleballRule[] {
  // Handle direct non-volley zone / kitchen questions
  if (query.toLowerCase().includes('non-volley') || 
      query.toLowerCase().includes('kitchen') || 
      query.toLowerCase().includes('nvz')) {
        
    // Direct question about what the non-volley zone is
    if (query.toLowerCase().includes('what is') || 
        query.toLowerCase().includes('what are') ||
        query.toLowerCase().includes('rules for')) {
      
      // Look for the non-volley zone rule first
      const kitchenRule = pickleballRules.find(rule => rule.id === 'non-volley-zone');
      if (kitchenRule) {
        // Return it as the first match, followed by other kitchen rules
        const otherKitchenRules = pickleballRules.filter(
          rule => rule.category === RuleCategory.KITCHEN && rule.id !== 'non-volley-zone'
        );
        return [kitchenRule, ...otherKitchenRules];
      }
    }
  }
        
  // Normal keyword matching for other queries
  const keywords = query.toLowerCase().split(' ');
  return pickleballRules.filter(rule => {
    return keywords.some(keyword => 
      rule.keywords.some(k => k.includes(keyword)) ||
      rule.name.toLowerCase().includes(keyword)
    );
  });
}

/**
 * Check if a question is about rules
 */
export function isRuleQuestion(question: string): boolean {
  const indicators = [
    'rule', 'official', 'court', 'net', 'kitchen', 'non-volley', 'nvz',
    'serve', 'service', 'ball', 'paddle', 'equipment', 'scoring', 'point',
    'fault', 'foot fault', 'baseline', 'sideline', 'bounce', 'volley',
    'referee', 'line call', 'tournament', 'game', 'match', 'rally',
    'dimension', 'measurement', 'out of bounds', 'feet', 'position'
  ];
  return indicators.some(i => question.toLowerCase().includes(i));
}

/**
 * Generate rule response
 */
export function generateRuleResponse(question: string): string {
  const matchingRules = findRulesForQuestion(question);
  
  if (matchingRules.length === 0) {
    return "I don't have information about that specific rule. Could you rephrase your question or ask about a different aspect of pickleball rules?";
  }
  
  // Get the primary rule
  const primaryRule = matchingRules[0];
  let response = `${primaryRule.name}: ${primaryRule.description}`;
  
  // If there are additional matching rules, include a brief mention
  if (matchingRules.length > 1) {
    const relatedRule = matchingRules[1];
    response += `\n\nYou might also be interested in: ${relatedRule.name} - ${relatedRule.description.substring(0, 100)}...`;
  }
  
  return response;
}

/**
 * Find rules for a question using enhanced matching
 */
export function findRulesForQuestion(question: string): PickleballRule[] {
  // Clean the question text
  const cleanQuestion = question.toLowerCase().replace(/[?!.,;:]/g, '');
  
  // Special case for kitchen and non-volley zone questions
  if (cleanQuestion.includes('kitchen') || 
      cleanQuestion.includes('non-volley') || 
      cleanQuestion.includes('nvz')) {
    
    // Find the exact kitchen rule if we're directly asking about it
    if (cleanQuestion.includes('what is') || 
        cleanQuestion.includes('what are') || 
        cleanQuestion.includes('rule')) {
      
      // Look specifically for the non-volley zone definition rule first
      const nonVolleyRule = pickleballRules.find(rule => rule.id === 'non-volley-zone');
      
      if (nonVolleyRule) {
        // Return this rule as the highest priority match
        return [nonVolleyRule, ...pickleballRules.filter(rule => 
          rule.category === RuleCategory.KITCHEN && rule.id !== 'non-volley-zone'
        )];
      }
    }
    
    // Find rules specifically about the kitchen/non-volley zone
    const kitchenRules = pickleballRules.filter(rule => 
      rule.category === RuleCategory.KITCHEN ||
      rule.id.includes('non-volley') ||
      rule.id.includes('kitchen')
    );
    
    if (kitchenRules.length > 0) {
      return kitchenRules;
    }
  }
  
  // First try direct keyword matching
  const keywordMatches = findRulesByKeywords(cleanQuestion);
  
  if (keywordMatches.length > 0) {
    return keywordMatches;
  }
  
  // If no keyword matches, use category-based matching
  const categoryIndicators: Record<RuleCategory, string[]> = {
    [RuleCategory.COURT]: ['court', 'dimension', 'size', 'line', 'bound', 'baseline', 'sideline', 'measurement'],
    [RuleCategory.EQUIPMENT]: ['paddle', 'ball', 'net', 'equipment', 'gear', 'material', 'specification'],
    [RuleCategory.SERVING]: ['serve', 'service', 'foot', 'diagonal', 'underhand', 'waist', 'server'],
    [RuleCategory.SCORING]: ['score', 'point', 'win', 'game', 'match', 'call', 'number', 'announce'],
    [RuleCategory.KITCHEN]: ['kitchen', 'non-volley', 'nvz', 'seven', '7', 'feet', 'volley', 'momentum'],
    [RuleCategory.GAMEPLAY]: ['bounce', 'fault', 'line', 'call', 'in', 'out', 'play', 'rally', 'double']
  };
  
  // Determine likely categories
  const likelyCategories: RuleCategory[] = [];
  Object.entries(categoryIndicators).forEach(([category, indicators]) => {
    if (indicators.some(indicator => cleanQuestion.includes(indicator))) {
      likelyCategories.push(category as RuleCategory);
    }
  });
  
  // If we found likely categories, filter rules by those categories
  if (likelyCategories.length > 0) {
    const categoryMatches = pickleballRules.filter(rule => 
      likelyCategories.includes(rule.category)
    );
    
    // Sort category matches by relevance
    const scoredMatches = categoryMatches.map(rule => {
      // Start with base score
      let score = 1;
      
      // Add points for category relevance
      if (likelyCategories[0] === rule.category) {
        score += 2;
      }
      
      // Add points for rule name matching key terms in question
      const words = cleanQuestion.split(' ');
      words.forEach(word => {
        if (word.length > 3 && rule.name.toLowerCase().includes(word)) {
          score += 3;
        }
        if (word.length > 3 && rule.description.toLowerCase().includes(word)) {
          score += 1;
        }
      });
      
      return { rule, score };
    });
    
    // Sort and return top matches
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .map(item => item.rule);
  }
  
  // Try to match based on common question patterns
  if (cleanQuestion.includes('what is') || cleanQuestion.includes('what are')) {
    // Return general gameplay rules as a fallback
    return pickleballRules.filter(rule => rule.category === RuleCategory.GAMEPLAY);
  }
  
  // If no specific category matches, return an empty array
  return [];
}