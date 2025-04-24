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
  },
  
  // EQUIPMENT RULES
  {
    id: 'paddle-specifications',
    ruleNumber: '2.E',
    name: 'Paddle Specifications',
    category: RuleCategory.EQUIPMENT,
    description: 'Pickleball paddles must be made of any material that doesn\'t violate USAP equipment specifications. The paddle face must be a smooth surface without texturing that causes excessive spin. Paddles are subject to specific dimension limits: maximum 24 inches in combined length and width, with no single dimension exceeding 17 inches.',
    clarifications: [
      'The paddle surface must be free of features that allow a player to impart additional spin.',
      'Paddles must pass a USAP roughness test to be approved for tournament play.',
      'Any alterations to a commercial paddle may make it illegal for tournament play.'
    ],
    keywords: ['paddle', 'equipment', 'rough', 'grip', 'surface', 'texture', 'spin', 'dimensions'],
    ruleSections: ['Section 2 - Court and Equipment']
  },
  {
    id: 'ball-specifications',
    ruleNumber: '2.D',
    name: 'Ball Specifications',
    category: RuleCategory.EQUIPMENT,
    description: 'The pickleball must be made of a durable plastic with a smooth surface. The ball must be between 2.874 inches (7.3 cm) and 2.972 inches (7.55 cm) in diameter and weigh between 0.78 ounces (22.1 g) and 0.935 ounces (26.5 g). The ball must have 26-40 circular holes, with spacing and overall design to create true flight characteristics.',
    clarifications: [
      'Indoor and outdoor pickleballs have different hole patterns and slightly different specifications.',
      'Outdoor balls typically have fewer, larger holes and are more durable for outdoor play.',
      'Indoor balls typically have more, smaller holes and are lighter for indoor play.'
    ],
    keywords: ['ball', 'holes', 'indoor', 'outdoor', 'plastic', 'weight', 'diameter'],
    ruleSections: ['Section 2 - Court and Equipment']
  },
  
  // SERVING RULES
  {
    id: 'serve-motion',
    ruleNumber: '4.A',
    name: 'Serve Motion Requirements',
    category: RuleCategory.SERVING,
    description: 'The serve must be made with an underhand stroke, with the paddle head below the wrist when it contacts the ball. The highest point of the paddle head cannot be above the highest part of the wrist when it strikes the ball. The serve is initiated with at least one foot behind the baseline and neither foot may touch the court including the baseline until after the ball is struck.',
    clarifications: [
      'The server must contact the ball below navel level (below the waist).',
      'The serve cannot be made with the paddle above the wrist (no "chainsaw" serves).',
      'The serve cannot be a volley - the ball must be dropped and hit after the bounce.'
    ],
    relatedQuestions: [
      'Can I serve sidearm?',
      'What is an illegal serve motion?',
      'Can I jump during my serve?'
    ],
    keywords: ['serve', 'underhand', 'wrist', 'motion', 'waist', 'drop', 'bounce', 'baseline'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'serve-foot-fault',
    ruleNumber: '4.L',
    name: 'Serve Foot Fault',
    category: RuleCategory.SERVING,
    description: 'During the serve, the server must keep at least one foot behind the baseline, and neither foot may touch the court (including the baseline) until after the ball is struck. After the ball is struck, the server may step into the court.',
    clarifications: [
      'The baseline is considered part of the court, so the server cannot touch the baseline during the serve.',
      'A server may be completely outside the court extension of the baseline.',
      'The server can have one foot off the ground during the serve as long as the other foot is behind the baseline.'
    ],
    keywords: ['serve', 'foot fault', 'baseline', 'step', 'foot', 'line'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'serve-position',
    ruleNumber: '4.B',
    name: 'Serve Position Rules',
    category: RuleCategory.SERVING,
    description: 'The server must serve from the correct service court determined by the score. For the first service of each side-out, the server serves from the right/even service court when their score is even and from the left/odd service court when their score is odd. After each point is scored by the serving side, the server alternates service courts.',
    clarifications: [
      'In doubles, when the score is even (0, 2, 4...), the starting server serves from the right/even court.',
      'When the score is odd (1, 3, 5...), the starting server serves from the left/odd court.',
      'The server\'s partner\'s score and position don\'t affect the serving position.'
    ],
    keywords: ['serve', 'position', 'right', 'left', 'even', 'odd', 'court', 'starting position'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'double-bounce-rule',
    ruleNumber: '4.E',
    name: 'Double Bounce Rule',
    category: RuleCategory.SERVING,
    description: 'After the serve, the ball must bounce once on each side before players can volley (hit the ball in the air). The receiving team must let the served ball bounce once, and then the serving team must let the return bounce once. After these two bounces, either team may volley or let the ball bounce.',
    clarifications: [
      'This rule is also called the "two-bounce rule" or "bounce-bounce-volley".',
      'The rule applies at the beginning of each point - after the first two returns, either team may volley.',
      'The purpose of this rule is to reduce the serving advantage and extend rallies.'
    ],
    relatedQuestions: [
      'What happens if I volley the return of serve?',
      'When can I start volleying during a point?',
      'Is the double bounce rule different for singles and doubles?'
    ],
    keywords: ['double bounce', 'two bounce', 'return', 'serve', 'volley', 'rally', 'third shot'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'serve-faults',
    ruleNumber: '4.M',
    name: 'Service Faults',
    category: RuleCategory.SERVING,
    description: 'A service fault occurs when: 1) The serve touches any permanent object before bouncing on the court; 2) The served ball touches the net and lands in the non-volley zone; 3) The served ball touches the net and lands out of bounds; 4) The ball is served when the server\'s feet are in an incorrect position; 5) The ball is served with an improper motion; 6) The server misses the ball when trying to hit it.',
    clarifications: [
      'A serve that touches the net but lands in the proper service court is a "let" and is replayed.',
      'If the server completely misses the ball when attempting to strike it, it is a fault.',
      'If the server tosses the ball but catches it instead of striking it, it is not a fault.'
    ],
    keywords: ['fault', 'serve', 'error', 'let', 'net', 'miss', 'foot fault', 'serving motion'],
    ruleSections: ['Section 4 - Service Rules']
  },
  
  // SCORING RULES
  {
    id: 'scoring-system',
    ruleNumber: '4.D',
    name: 'Scoring System',
    category: RuleCategory.SCORING,
    description: 'Points can only be scored by the serving team. Games are typically played to 11 points, and must be won by at least a 2-point margin. Tournament games may be played to 15 or 21 points, with a 2-point margin for the win.',
    clarifications: [
      'Only the serving team can score points.',
      'When the serving team makes a fault, the serve passes to the opponent (called a "side out" in doubles).',
      'In doubles, both players on a team have the opportunity to serve before a side out occurs, except at the start of each game.'
    ],
    relatedQuestions: [
      'What is rally scoring?',
      'How do you win a game?',
      'What happens when we reach 10-10?'
    ],
    keywords: ['score', 'point', 'win', 'margin', 'serving', 'side out', 'game point'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'doubles-scoring',
    ruleNumber: '4.B',
    name: 'Doubles Scoring and Service Sequence',
    category: RuleCategory.SCORING,
    description: 'In doubles, the score is called as three numbers: the serving team\'s score, the receiving team\'s score, and the server number (1 or 2). The first server of the game for each team is server #1 and serves from the right/even court. When the first server loses the serve, the serve passes to the opponents. After that, both players on each team serve before the serve passes to the opponents, with the exception of the first service sequence of the game.',
    clarifications: [
      'At the start of the game, only the first server (player on the right/even side) serves before a side out.',
      'After the initial side out, both players on each side get to serve before a side out.',
      'The score is always called with three numbers in doubles: serving team score, receiving team score, server number (1 or 2).'
    ],
    relatedQuestions: [
      'Why does only one person serve at the beginning of the game?',
      'How do you know who is server #1 and server #2?',
      'What happens if we forget the score or server number?'
    ],
    keywords: ['doubles', 'scoring', 'server', 'side out', 'service order', 'rotation', 'sequence'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'singles-scoring',
    ruleNumber: '4.B',
    name: 'Singles Scoring',
    category: RuleCategory.SCORING,
    description: 'In singles, the score consists of only two numbers: the server\'s score followed by the receiver\'s score. The server serves from the right/even court when their score is even and from the left/odd court when their score is odd.',
    clarifications: [
      'The server alternates serving from the right and left service courts after each point is scored.',
      'The score is called as just two numbers: server score followed by receiver score.',
      'In tournaments, the score and the correct service court should be confirmed before serving.'
    ],
    keywords: ['singles', 'scoring', 'server', 'receiver', 'right', 'left', 'even', 'odd'],
    ruleSections: ['Section 4 - Service Rules']
  },
  
  // KITCHEN RULES
  {
    id: 'volley-in-nvz',
    ruleNumber: '9.B',
    name: 'Volleying in Non-Volley Zone',
    category: RuleCategory.KITCHEN,
    description: 'A player may not volley the ball while standing within the non-volley zone (kitchen) or touching any part of the non-volley zone, including the lines. If a player volleys the ball and their momentum carries them into the non-volley zone (or they touch the non-volley zone line), it is a fault, even if the ball has already been declared dead.',
    clarifications: [
      'A player may stand in the non-volley zone at any time except when volleying the ball.',
      'It is a fault if a player\'s momentum causes them to touch anything in the non-volley zone after volleying, even if the ball is already dead.',
      'A player may reach over the non-volley zone to volley a ball as long as they don\'t touch the zone or its lines.'
    ],
    relatedQuestions: [
      'Can my paddle enter the kitchen when I volley?',
      'What if I volley and then a second later step into the kitchen?',
      'Can I jump from behind the kitchen line, volley, and land in the kitchen?'
    ],
    keywords: ['kitchen', 'non-volley zone', 'nvz', 'volley', 'momentum', 'fault', 'line'],
    ruleSections: ['Section 9 - Non-Volley Zone Rules']
  },
  {
    id: 'nvz-fault-continuous-motion',
    ruleNumber: '9.B',
    name: 'Non-Volley Zone Faults: Continuous Motion',
    category: RuleCategory.KITCHEN,
    description: 'During a volley, a player\'s momentum may not cause them to touch anything in the non-volley zone, including the player\'s partner. It is a fault if the player touches the non-volley zone after volleying the ball, even if the ball is dead. The act of volleying includes the swing, the follow-through, and the momentum from the action.',
    clarifications: [
      'If a player volleys the ball and then falls or steps into the kitchen due to momentum, it is a fault.',
      'If the player\'s paddle or clothing touches the kitchen during or after a volley due to the momentum of the shot, it is a fault.',
      'If a player is pushed or falls into the kitchen by their partner after either player volleys, it is a fault.'
    ],
    keywords: ['kitchen', 'non-volley zone', 'nvz', 'momentum', 'touch', 'continuous motion', 'fault'],
    ruleSections: ['Section 9 - Non-Volley Zone Rules']
  },
  {
    id: 'nvz-exemptions',
    ruleNumber: '9.C',
    name: 'Non-Volley Zone Exemptions',
    category: RuleCategory.KITCHEN,
    description: 'A player may enter the non-volley zone at any time except when volleying the ball. A player may stay in the non-volley zone to return balls that bounce, and there is no restriction on how they hit the ball as long as it has bounced first.',
    clarifications: [
      'Players can hit any shot, including smashes, from the non-volley zone if the ball has bounced first.',
      'A player may step into the non-volley zone before or after hitting a volley as long as they are not touching the non-volley zone when making contact with the ball.',
      'A player in the non-volley zone may return a ball that has bounced with any type of stroke, including around-the-post shots.'
    ],
    relatedQuestions: [
      'Can I stay in the kitchen after hitting a ball that has bounced?',
      'Can I hit a groundstroke while standing in the kitchen?',
      'Can I smash a ball that has bounced while standing in the kitchen?'
    ],
    keywords: ['kitchen', 'non-volley zone', 'nvz', 'bounce', 'dink', 'groundstroke'],
    ruleSections: ['Section 9 - Non-Volley Zone Rules']
  },
  
  // FAULT RULES
  {
    id: 'fault-rules',
    ruleNumber: '7.A-N',
    name: 'Fault Rules',
    category: RuleCategory.FAULTS,
    description: 'A fault occurs when a rule is broken, resulting in a dead ball and loss of the rally. Common faults include: hitting the ball into the net or out of bounds; volleying from the non-volley zone; violating service rules; touching the net with any part of the body, clothing, or paddle while the ball is in play; and hitting a player with the ball.',
    clarifications: [
      'When a fault occurs, the ball becomes dead and play stops immediately.',
      'If the serving team commits a fault, they lose the serve (side out in doubles).',
      'If the receiving team commits a fault, the serving team scores a point.'
    ],
    keywords: ['fault', 'violation', 'out', 'net', 'dead ball', 'point', 'side out'],
    ruleSections: ['Section 7 - Fault Rules']
  },
  {
    id: 'net-faults',
    ruleNumber: '7.G-H',
    name: 'Net Faults',
    category: RuleCategory.FAULTS,
    description: 'A fault occurs if a player, their clothing, or their paddle touches the net or net posts while the ball is in play. It is also a fault if a player touches the net or net posts with any body part, paddle, or clothing while the ball is in play, even if the player is not making a play on the ball.',
    clarifications: [
      'The ball is considered "in play" from the moment it is struck by the server until the point is decided.',
      'Touching the net after the ball becomes dead is not a fault.',
      'If the ball hits the net and causes the net to touch a player, it is not a fault.'
    ],
    keywords: ['net', 'fault', 'touch', 'post', 'violation', 'play', 'dead ball'],
    ruleSections: ['Section 7 - Fault Rules']
  },
  
  // LINE CALL RULES
  {
    id: 'line-call-rules',
    ruleNumber: '6.D',
    name: 'Line Call Rules',
    category: RuleCategory.LINE_CALLS,
    description: 'A ball contacting any part of the line is considered "in." In non-officiated matches, players make line calls for balls landing on their side of the court. Players should call "out" promptly. If a player is unsure about a call, the ball is considered "in." In doubles, either partner may make a line call, and if partners disagree, the ball is considered "in."',
    clarifications: [
      'Any ball that cannot be called "out" with certainty is considered "in."',
      'Players should make calls promptly; late calls should be avoided.',
      'Players should not call balls on their opponent\'s side of the court unless asked.'
    ],
    relatedQuestions: [
      'What if I\'m not sure if a ball is in or out?',
      'What if my partner and I disagree about a line call?',
      'Can I challenge my opponent\'s line call?'
    ],
    keywords: ['line', 'call', 'in', 'out', 'boundary', 'fair', 'opponent', 'referee'],
    ruleSections: ['Section 6 - Line Call Rules']
  },
  
  // POSITIONING RULES
  {
    id: 'player-positioning',
    ruleNumber: '4.B.7-8',
    name: 'Player Positioning Rules',
    category: RuleCategory.POSITIONING,
    description: 'In doubles, the correct server must serve from the correct service court, determined by the team\'s score. However, there are no restrictions on the position of the server\'s partner (except for not obstructing the receiver\'s view). Similarly, there are no restrictions on the positions of the receivers except that the correct receiver must receive the serve.',
    clarifications: [
      'The server\'s partner may stand anywhere on or off the court, including in the non-volley zone.',
      'The non-receiving partner may stand anywhere on or off the court.',
      'Players may switch positions after the ball is served.'
    ],
    keywords: ['position', 'server', 'receiver', 'partner', 'court', 'switch', 'stacking'],
    ruleSections: ['Section 4 - Service Rules']
  },
  {
    id: 'switching-positions',
    ruleNumber: '4.B.9',
    name: 'Switching Positions (Stacking)',
    category: RuleCategory.POSITIONING,
    description: 'Teams may switch positions during a rally and after the serve. This strategic positioning technique (often called "stacking") allows teams to keep a desired player on a particular side of the court. When stacking, the correct server must still serve from the correct position based on the score, and the correct receiver must receive the serve.',
    clarifications: [
      'Players must start in the correct position according to the score before each serve.',
      'After the serve, players may move anywhere on their side of the court.',
      'Switching positions during play is a common strategy called "stacking" and is legal.'
    ],
    relatedQuestions: [
      'What is stacking in pickleball?',
      'Can we switch sides after every point?',
      'How do we know who should be serving?'
    ],
    keywords: ['stacking', 'switching', 'position', 'strategy', 'sides', 'rotation', 'partners'],
    ruleSections: ['Section 4 - Service Rules']
  },
  
  // ADDITIONAL IMPORTANT RULES
  {
    id: 'around-the-post',
    ruleNumber: '11.L',
    name: 'Around the Post (ATP) Shots',
    category: RuleCategory.TERMINOLOGY,
    description: 'A ball may be hit around the outside of the net post and still be considered in play if it lands in the correct court. The ball does not need to travel back over the net, and there is no height restriction. This is known as an "around-the-post" or "ATP" shot.',
    clarifications: [
      'The ball can pass outside the net post at any height, even below the net.',
      'The ball does not need to cross over the net or the plane of the net.',
      'The ball must land in the proper service court or playing area to be considered in.'
    ],
    keywords: ['around the post', 'ATP', 'outside', 'net post', 'shot', 'legal'],
    ruleSections: ['Section 11 - Other Rules']
  },
  {
    id: 'let-calls',
    ruleNumber: '7.J',
    name: 'Let Calls',
    category: RuleCategory.TERMINOLOGY,
    description: 'A "let" is called when a serve touches the net, net cord, or net strap and still lands in the correct service court. A let serve is replayed with no change in score or position. There is no limit to the number of let serves that may be made in a row. A let can also be called in certain situations that interrupt play, such as a ball rolling onto the court.',
    clarifications: [
      'If a serve touches the net but lands in the correct service court, the serve is replayed without penalty.',
      'Unlike tennis, in pickleball, a let serve is the only time a rally is replayed for the ball touching the net.',
      'If a ball from another court rolls into the playing area during a point, a player may call a "let" and the point is replayed.'
    ],
    keywords: ['let', 'service', 'net', 'replay', 'interruption', 'cord', 'strap'],
    ruleSections: ['Section 7 - Fault Rules', 'Section 4 - Service Rules']
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