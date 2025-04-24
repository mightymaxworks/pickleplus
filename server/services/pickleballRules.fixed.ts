/**
 * PKL-278651-COACH-0005-RULES
 * Pickleball Rules Database
 * 
 * This file provides a comprehensive database of USA Pickleball (USAP) rules
 * to enhance SAGE's ability to understand and explain official pickleball rules.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

/**
 * Rule category types for organization
 */
export enum RuleCategory {
  COURT = 'court',
  EQUIPMENT = 'equipment',
  SERVING = 'serving',
  SCORING = 'scoring',
  FAULTS = 'faults',
  KITCHEN = 'kitchen', 
  LINE_CALLS = 'line_calls',
  POSITIONING = 'positioning',
  TOURNAMENT = 'tournament',
  ETIQUETTE = 'etiquette',
  TERMINOLOGY = 'terminology'
}

/**
 * A rule entry with detailed information
 */
export interface PickleballRule {
  /** Unique rule identifier */
  id: string;
  /** The rule number according to USAP (e.g. "3.A.2") */
  ruleNumber: string;
  /** Short rule name */
  name: string;
  /** The rule category */
  category: RuleCategory;
  /** Full rule description */
  description: string;
  /** Clarifications or examples */
  clarifications?: string[];
  /** Common questions related to this rule */
  relatedQuestions?: string[];
  /** Keywords to help identify this rule */
  keywords: string[];
  /** Relevant USAP rule sections */
  ruleSections?: string[];
}

/**
 * The comprehensive pickleball rules database
 */
export const pickleballRules: PickleballRule[] = [
  // COURT RULES
  {
    id: 'court-dimensions',
    ruleNumber: '2.A',
    name: 'Court Dimensions',
    category: RuleCategory.COURT,
    description: 'The standard pickleball court is a rectangle 20 feet (6.10 m) wide and 44 feet (13.41 m) long, the same size as a doubles badminton court. The court is striped like a tennis court, with right and left service courts, a 7-foot (2.13 m) non-volley zone ("kitchen") extending from the net, and baselines at the back.',
    clarifications: [
      'Court measurements are made to the outside of the lines.',
      'The lines are 2 inches (5.08 cm) wide.'
    ],
    keywords: ['court', 'dimensions', 'size', 'measurement', 'feet', 'meters', 'rectangle'],
    ruleSections: ['Section 2 - Court and Equipment']
  },
  {
    id: 'non-volley-zone',
    ruleNumber: '2.B.3',
    name: 'Non-Volley Zone (Kitchen)',
    category: RuleCategory.KITCHEN,
    description: 'The non-volley zone (NVZ) is the area of the court within 7 feet (2.13 m) of the net on both sides, including all lines surrounding it. The NVZ is also commonly referred to as "the kitchen." Players may not volley the ball (hit it out of the air before it bounces) while standing in the non-volley zone or touching its lines.',
    clarifications: [
      'The non-volley zone includes all lines around it.',
      'A player may step into the non-volley zone at any time, except when volleying the ball.',
      'A player may enter the non-volley zone before or after hitting a volley if they are not touching the non-volley zone when making contact with the ball.'
    ],
    relatedQuestions: [
      'Can I stand in the kitchen and hit a ball that has bounced?',
      'What happens if my momentum carries me into the kitchen after a volley?',
      'Can my paddle cross the kitchen line if I\'m standing behind it?'
    ],
    keywords: ['kitchen', 'non-volley zone', 'nvz', '7 feet', 'volley', 'line'],
    ruleSections: ['Section 2 - Court and Equipment', 'Section 9 - Non-Volley Zone Rules']
  },
  {
    id: 'net-specifications',
    ruleNumber: '2.C',
    name: 'Net Specifications',
    category: RuleCategory.EQUIPMENT,
    description: 'The net is placed at the center of the court, dividing it into two equal sides. The net should be 36 inches (91.44 cm) high at the sidelines and 34 inches (86.36 cm) high at the center of the court. The net posts should be 22 feet (6.71 m) apart.',
    keywords: ['net', 'height', 'center', 'posts', 'inches', 'sagging'],
    ruleSections: ['Section 2 - Court and Equipment']
  }
];

/**
 * Get a rule by its ID
 */
export function getRuleById(id: string): PickleballRule | undefined {
  return pickleballRules.find(rule => rule.id === id);
}

/**
 * Search for rules by keywords
 */
export function searchRulesByKeywords(query: string): PickleballRule[] {
  const keywords = query.toLowerCase().split(' ');
  return pickleballRules.filter(rule => {
    return keywords.some(keyword => 
      rule.keywords.some(ruleKeyword => ruleKeyword.includes(keyword)) ||
      rule.name.toLowerCase().includes(keyword) ||
      rule.description.toLowerCase().includes(keyword)
    );
  });
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category: RuleCategory): PickleballRule[] {
  return pickleballRules.filter(rule => rule.category === category);
}

/**
 * Get a rule explanation in conversational format
 */
export function getRuleExplanation(ruleId: string, verbose: boolean = false): string {
  const rule = getRuleById(ruleId);
  
  if (!rule) {
    return `I'm sorry, I don't have information about that specific rule.`;
  }
  
  let explanation = `${rule.name} (Rule ${rule.ruleNumber}): ${rule.description}`;
  
  if (verbose && rule.clarifications && rule.clarifications.length > 0) {
    explanation += `\n\nAdditional clarifications:\n`;
    rule.clarifications.forEach(clarification => {
      explanation += `• ${clarification}\n`;
    });
  }
  
  if (verbose && rule.relatedQuestions && rule.relatedQuestions.length > 0) {
    explanation += `\n\nCommon questions about this rule:\n`;
    rule.relatedQuestions.forEach(question => {
      explanation += `• ${question}\n`;
    });
  }
  
  return explanation;
}

/**
 * Find rules that answer a specific question
 */
export function findRulesForQuestion(question: string): PickleballRule[] {
  // Clean and tokenize the question
  const cleanQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
  const tokens = cleanQuestion.split(' ').filter(token => token.length > 2);
  
  // Map of categories to keywords that indicate that category
  const categoryIndicators: Record<RuleCategory, string[]> = {
    [RuleCategory.COURT]: ['court', 'dimension', 'size', 'measure', 'line', 'baseline', 'sideline'],
    [RuleCategory.EQUIPMENT]: ['paddle', 'ball', 'net', 'equipment', 'gear', 'rough', 'texture'],
    [RuleCategory.SERVING]: ['serve', 'service', 'underhand', 'drop', 'motion', 'foot', 'fault'],
    [RuleCategory.SCORING]: ['score', 'point', 'win', 'game', 'match', 'side out', 'rotation'],
    [RuleCategory.FAULTS]: ['fault', 'violation', 'error', 'penalty', 'illegal', 'dead ball'],
    [RuleCategory.KITCHEN]: ['kitchen', 'non-volley', 'nvz', 'line', 'volley', 'touch'],
    [RuleCategory.LINE_CALLS]: ['line', 'call', 'in', 'out', 'boundary', 'fair', 'referee'],
    [RuleCategory.POSITIONING]: ['position', 'switch', 'stack', 'formation', 'side', 'partner'],
    [RuleCategory.TOURNAMENT]: ['tournament', 'bracket', 'match', 'referee', 'official', 'format'],
    [RuleCategory.ETIQUETTE]: ['etiquette', 'behavior', 'sportsmanship', 'fair', 'courtesy'],
    [RuleCategory.TERMINOLOGY]: ['term', 'jargon', 'lingo', 'call', 'meaning', 'definition']
  };
  
  // Identify likely categories based on the question
  const likelyCategories: RuleCategory[] = [];
  
  for (const [category, indicators] of Object.entries(categoryIndicators)) {
    if (indicators.some(indicator => cleanQuestion.includes(indicator))) {
      likelyCategories.push(category as RuleCategory);
    }
  }
  
  // Score each rule based on keyword matches and category matches
  const scoredRules = pickleballRules.map(rule => {
    let score = 0;
    
    // Add points for category matches
    if (likelyCategories.includes(rule.category)) {
      score += 3;
    }
    
    // Add points for keyword matches
    rule.keywords.forEach(keyword => {
      if (tokens.some(token => keyword.includes(token))) {
        score += 2;
      }
    });
    
    // Add points for name and description matches
    tokens.forEach(token => {
      if (rule.name.toLowerCase().includes(token)) {
        score += 2;
      }
      if (rule.description.toLowerCase().includes(token)) {
        score += 1;
      }
    });
    
    // Add points for related questions
    if (rule.relatedQuestions) {
      rule.relatedQuestions.forEach(relatedQuestion => {
        if (tokens.some(token => relatedQuestion.toLowerCase().includes(token))) {
          score += 3;
        }
      });
    }
    
    return { rule, score };
  });
  
  // Sort by score and return top matches
  const sortedRules = scoredRules
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.rule);
  
  return sortedRules.slice(0, 3); // Return top 3 matches
}

/**
 * Generate a response to a rule-related question
 */
export function generateRuleResponse(question: string): string {
  const matchingRules = findRulesForQuestion(question);
  
  if (matchingRules.length === 0) {
    return `I don't have a specific rule that addresses your question directly. Could you rephrase or provide more details about what aspect of pickleball rules you'd like to know about?`;
  }
  
  const primaryRule = matchingRules[0];
  let response = `According to official USAP rules (Rule ${primaryRule.ruleNumber}): ${primaryRule.description}`;
  
  if (primaryRule.clarifications && primaryRule.clarifications.length > 0) {
    response += `\n\nTo clarify:\n• ${primaryRule.clarifications[0]}`;
    if (primaryRule.clarifications.length > 1) {
      response += `\n• ${primaryRule.clarifications[1]}`;
    }
  }
  
  if (matchingRules.length > 1) {
    const secondaryRule = matchingRules[1];
    response += `\n\nYou might also be interested in ${secondaryRule.name} (Rule ${secondaryRule.ruleNumber}): ${secondaryRule.description.substring(0, 100)}...`;
  }
  
  return response;
}

/**
 * Check if a question is about pickleball rules
 */
export function isRuleQuestion(question: string): boolean {
  const ruleQuestionIndicators = [
    'rule', 'rules', 'official', 'usap', 'legal', 'illegal', 'allowed', 
    'permitted', 'can i', 'can you', 'is it', 'are you supposed to',
    'what happens if', 'line call', 'fault', 'let', 'kitchen', 'non-volley',
    'serve', 'serving', 'score', 'scoring', 'referee', 'tournament'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return ruleQuestionIndicators.some(indicator => lowerQuestion.includes(indicator));
}