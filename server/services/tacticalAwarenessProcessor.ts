/**
 * PKL-278651-COACH-0004-TACT-PROC
 * Tactical Awareness Processor for SAGE
 * 
 * This file provides methods to recognize and respond to tactical awareness-related
 * terminology and expressions in player conversations, enhancing SAGE's ability
 * to provide targeted coaching on the Tactical Awareness dimension of CourtIQ.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';

/**
 * Result from analyzing a message for tactical awareness-related content
 */
export interface TacticalAwarenessAnalysis {
  /** The primary tactical topic detected */
  primaryTactic: TacticalTopic;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a tactical issue */
  hasIssue: boolean;
  /** The specific tactical issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking tactical advice */
  seekingTacticalAdvice: boolean;
  /** The relevant game format (singles, doubles) */
  gameFormat: 'singles' | 'doubles' | 'both';
  /** The relevant gameplay phase */
  gamePhase: 'serve' | 'return' | 'transition' | 'kitchen' | 'all';
}

/**
 * Tactical topics that can be detected
 */
export enum TacticalTopic {
  COURT_POSITIONING = 'court_positioning',
  SHOT_SELECTION = 'shot_selection',
  GAME_STRATEGY = 'game_strategy',
  PARTNER_COORDINATION = 'partner_coordination',
  OPPONENT_ANALYSIS = 'opponent_analysis',
  PATTERN_RECOGNITION = 'pattern_recognition',
  SITUATIONAL_AWARENESS = 'situational_awareness',
  STACKING = 'stacking',
  SERVE_STRATEGY = 'serve_strategy',
  RETURN_STRATEGY = 'return_strategy',
  TRANSITION_STRATEGY = 'transition_strategy',
  KITCHEN_STRATEGY = 'kitchen_strategy',
  POACHING = 'poaching',
  DEFENSIVE_TACTICS = 'defensive_tactics',
  OFFENSIVE_TACTICS = 'offensive_tactics',
  PACE_CONTROL = 'pace_control',
  NONE = 'none'
}

/**
 * Keywords associated with each tactical topic
 */
const tacticalTopicKeywords: Record<TacticalTopic, string[]> = {
  [TacticalTopic.COURT_POSITIONING]: [
    // Core concepts
    'court positioning', 'position', 'positioning', 'court position', 'position on court',
    'where to stand', 'standing position', 'court coverage', 'court movement',
    
    // Specific positioning concepts
    'baseline positioning', 'kitchen positioning', 'transition zone', 'non-volley zone positioning',
    'sideline positioning', 'centerline positioning', 'up and back formation', 'side by side',
    
    // Positioning issues
    'out of position', 'poor positioning', 'wrong position', 'positioning error',
    'not covering court', 'too far back', 'too close to net', 'too wide',
    
    // Positioning questions/comments
    'where should I stand', 'where to position', 'better court coverage', 'position against',
    'defensive position', 'offensive position', 'ready position', 'recover position'
  ],
  [TacticalTopic.SHOT_SELECTION]: [
    // Core concepts
    'shot selection', 'shot choice', 'which shot', 'shot decision', 'choose shot',
    'right shot', 'wrong shot', 'shot options', 'shot alternatives',
    
    // Decision contexts
    'when to dink', 'when to drive', 'when to lob', 'when to drop', 'when to smash',
    'third shot choice', 'third shot drop or drive', 'aggressive vs patient',
    
    // Shot selection issues
    'poor shot selection', 'bad shot choice', 'wrong shot', 'high-risk shot',
    'low-percentage shot', 'forcing shots', 'predictable shots', 'repetitive shots',
    
    // Shot selection questions/comments
    'should I dink or drive', 'better to lob or drop', 'aggressive or patient',
    'how to decide which shot', 'shot decision making', 'high-percentage shots'
  ],
  [TacticalTopic.GAME_STRATEGY]: [
    // Core concepts
    'game strategy', 'match strategy', 'game plan', 'strategic approach', 'tactical plan',
    'strategy against', 'match tactics', 'game tactics', 'playing style',
    
    // Strategic approaches
    'aggressive strategy', 'defensive strategy', 'patient strategy', 'attacking strategy',
    'counter-punching strategy', 'power game', 'finesse game', 'balanced approach',
    
    // Strategy issues
    'no strategy', 'poor strategy', 'one-dimensional play', 'predictable strategy',
    'inflexible strategy', 'wrong strategy', 'strategic confusion', 'tactical errors',
    
    // Strategy questions/comments
    'how to play against', 'best strategy for', 'strategic options', 'tactical approach',
    'what strategy should I use', 'adapting strategy', 'change of strategy', 'game plan for'
  ],
  [TacticalTopic.PARTNER_COORDINATION]: [
    // Core concepts
    'partner coordination', 'team coordination', 'partner communication', 'doubles strategy',
    'playing with partner', 'team strategy', 'doubles tactics', 'partner tactics',
    
    // Coordination aspects
    'signaling', 'hand signals', 'verbal cues', 'communication system', 'coordination system',
    'switching sides', 'partner movement', 'covering for partner', 'complementary strengths',
    
    // Coordination issues
    'communication problems', 'coordination issues', 'miscommunication', 'confusion with partner',
    'partner conflict', 'overlap with partner', 'getting in partner\'s way', 'lack of communication',
    
    // Coordination questions/comments
    'how to communicate with partner', 'better team coordination', 'improve doubles play',
    'partner signals', 'team tactics', 'partner roles', 'doubles positioning'
  ],
  [TacticalTopic.OPPONENT_ANALYSIS]: [
    // Core concepts
    'opponent analysis', 'analyzing opponents', 'scouting opponents', 'opponent tendencies',
    'opponent patterns', 'opponent weaknesses', 'opponent strengths', 'opponent strategy',
    
    // Analysis aspects
    'backhand weakness', 'forehand strength', 'movement patterns', 'shot preferences',
    'strategic tendencies', 'pressure points', 'psychological tendencies', 'predictable patterns',
    
    // Analysis issues
    'not reading opponents', 'misreading opponents', 'ignoring opponent patterns',
    'failing to exploit weaknesses', 'not adapting to opponents', 'playing one way',
    
    // Analysis questions/comments
    'how to analyze opponents', 'exploiting weaknesses', 'recognizing patterns',
    'adapt to different opponents', 'counter opponent strategy', 'read opponents better'
  ],
  [TacticalTopic.PATTERN_RECOGNITION]: [
    // Core concepts
    'pattern recognition', 'game patterns', 'play patterns', 'strategic patterns',
    'tactical patterns', 'recognizing patterns', 'identifying patterns', 'pattern analysis',
    
    // Pattern types
    'serving patterns', 'returning patterns', 'shot selection patterns', 'movement patterns',
    'attack patterns', 'defensive patterns', 'pressure patterns', 'strategic sequences',
    
    // Pattern issues
    'missing patterns', 'not seeing patterns', 'failing to recognize patterns', 
    'pattern blindness', 'overlooking tendencies', 'missing opponent habits',
    
    // Pattern questions/comments
    'how to spot patterns', 'recognizing opponent tendencies', 'identify game patterns',
    'seeing strategic patterns', 'pattern-based strategy', 'using pattern recognition'
  ],
  [TacticalTopic.SITUATIONAL_AWARENESS]: [
    // Core concepts
    'situational awareness', 'game awareness', 'court awareness', 'tactical awareness',
    'reading the game', 'game situations', 'tactical situations', 'strategic awareness',
    
    // Awareness aspects
    'score awareness', 'momentum awareness', 'pressure situations', 'game flow',
    'critical points', 'opportunity recognition', 'threat assessment', 'environmental factors',
    
    // Awareness issues
    'lack of awareness', 'poor game sense', 'situational mistakes', 'tactical blindness',
    'missing opportunities', 'unaware of score', 'ignoring context', 'tunnel vision',
    
    // Awareness questions/comments
    'improve game awareness', 'better court sense', 'reading the game better',
    'situational decision making', 'understanding game flow', 'tactical IQ'
  ],
  [TacticalTopic.STACKING]: [
    // Core concepts
    'stacking', 'stack', 'stacked formation', 'stacking strategy', 'stacking technique',
    'side stacking', 'center stacking', 'stacked positioning', 'stack and unstack',
    
    // Stacking aspects
    'same side stacking', 'switching sides', 'stacking signals', 'stacking communication',
    'stacking footwork', 'stacking transitions', 'maintaining stack', 'stack recovery',
    
    // Stacking issues
    'stacking confusion', 'stacking errors', 'poor stack execution', 'stacking miscommunication',
    'wrong stacking position', 'stack breakdown', 'ineffective stacking', 'stacking limitations',
    
    // Stacking questions/comments
    'how to stack effectively', 'when to stack', 'stacking benefits', 'stacking with partner',
    'stacking against', 'advanced stacking techniques', 'stacking strategy', 'learning to stack'
  ],
  [TacticalTopic.SERVE_STRATEGY]: [
    // Core concepts
    'serve strategy', 'serving strategy', 'service strategy', 'serve tactics',
    'strategic serving', 'tactical serving', 'serve placement', 'service game',
    
    // Serving approaches
    'serve patterns', 'serving patterns', 'serve variations', 'deep serves',
    'wide serves', 'body serves', 'first serve strategy', 'second serve strategy',
    
    // Serving strategy issues
    'predictable serves', 'one-dimensional serving', 'weak serve strategy',
    'poor serve selection', 'serving without purpose', 'telegraphing serves',
    
    // Serving strategy questions/comments
    'where to serve', 'serving against', 'best serve strategy', 'serving tactics',
    'improving serve strategy', 'strategic serving', 'serve and follow strategy'
  ],
  [TacticalTopic.RETURN_STRATEGY]: [
    // Core concepts
    'return strategy', 'returning strategy', 'return tactics', 'strategic returning',
    'tactical returning', 'return placement', 'return game', 'service return strategy',
    
    // Return approaches
    'aggressive returns', 'defensive returns', 'deep returns', 'angled returns',
    'down the middle returns', 'chip returns', 'block returns', 'counter-attacking returns',
    
    // Return strategy issues
    'poor return strategy', 'predictable returns', 'passive returning',
    'return errors', 'return selection issues', 'returning without purpose',
    
    // Return strategy questions/comments
    'how to return serves', 'returning against', 'best return strategy',
    'improving returns', 'return positioning', 'return and approach'
  ],
  [TacticalTopic.TRANSITION_STRATEGY]: [
    // Core concepts
    'transition strategy', 'transitioning', 'approach strategy', 'transition game',
    'moving forward', 'approaching the net', 'transition zone strategy', 'transitional play',
    
    // Transition approaches
    'third shot strategy', 'fifth shot strategy', 'transition drop', 'transition drive',
    'moving up together', 'staged approach', 'aggressive transition', 'patient transition',
    
    // Transition issues
    'poor transitions', 'transition errors', 'slow transitions', 'mistimed approaches',
    'transition vulnerability', 'hesitant transitions', 'uncoordinated transitions',
    
    // Transition questions/comments
    'when to move up', 'how to approach the net', 'transitioning effectively',
    'third shot options', 'transition zone play', 'moving from back to front'
  ],
  [TacticalTopic.KITCHEN_STRATEGY]: [
    // Core concepts
    'kitchen strategy', 'net strategy', 'non-volley zone strategy', 'NVZ strategy',
    'kitchen tactics', 'net play strategy', 'front court strategy', 'kitchen line play',
    
    // Kitchen approaches
    'dinking strategy', 'kitchen battles', 'patient kitchen play', 'aggressive kitchen play',
    'kitchen movement', 'kitchen positioning', 'reset strategy', 'attack transition',
    
    // Kitchen issues
    'poor kitchen strategy', 'kitchen errors', 'kitchen positioning issues',
    'impatient kitchen play', 'kitchen vulnerabilities', 'giving up kitchen control',
    
    // Kitchen questions/comments
    'how to play at the kitchen', 'kitchen line strategy', 'winning kitchen battles',
    'controlling the kitchen', 'non-volley zone tactics', 'dinking strategy'
  ],
  [TacticalTopic.POACHING]: [
    // Core concepts
    'poaching', 'poach', 'poaching strategy', 'poaching tactics', 'intercept',
    'cut off shots', 'offensive poaching', 'defensive poaching', 'poaching technique',
    
    // Poaching aspects
    'when to poach', 'how to poach', 'poaching signals', 'poaching footwork',
    'poaching timing', 'poaching angles', 'poaching opportunities', 'poaching recovery',
    
    // Poaching issues
    'missed poaches', 'poor poaching decisions', 'poaching errors', 'overpoaching',
    'bad poaching timing', 'ineffective poaches', 'partner conflicts from poaching',
    
    // Poaching questions/comments
    'effective poaching', 'poaching strategy', 'poaching with partner',
    'improving poaching', 'aggressive poaching', 'selective poaching'
  ],
  [TacticalTopic.DEFENSIVE_TACTICS]: [
    // Core concepts
    'defensive tactics', 'defense', 'defensive strategy', 'defensive play',
    'defensive positioning', 'defensive mindset', 'defensive shots', 'defensive patterns',
    
    // Defensive approaches
    'reset shots', 'blocking', 'absorbing pace', 'defensive lobs', 'defensive dinks',
    'defensive footwork', 'defensive court coverage', 'counterattacking',
    
    // Defensive issues
    'weak defense', 'defensive errors', 'poor defensive positioning',
    'defensive passivity', 'defensive breakdowns', 'defensive gaps',
    
    // Defensive questions/comments
    'how to defend against', 'better defensive play', 'defending attacks',
    'defensive strategy against', 'defensive skills', 'defensive recovery'
  ],
  [TacticalTopic.OFFENSIVE_TACTICS]: [
    // Core concepts
    'offensive tactics', 'offense', 'offensive strategy', 'offensive play',
    'offensive positioning', 'offensive mindset', 'offensive shots', 'offensive patterns',
    
    // Offensive approaches
    'attack strategy', 'aggressive play', 'power game', 'offensive pressure',
    'creating openings', 'forcing errors', 'offensive angles', 'finishing shots',
    
    // Offensive issues
    'ineffective offense', 'offensive errors', 'forced offensive play',
    'predictable attacks', 'offensive impatience', 'high-risk offense',
    
    // Offensive questions/comments
    'how to be more offensive', 'aggressive strategy', 'attacking effectively',
    'putting pressure on opponents', 'creating offensive opportunities', 'finishing points'
  ],
  [TacticalTopic.PACE_CONTROL]: [
    // Core concepts
    'pace control', 'controlling tempo', 'game speed', 'rhythm control',
    'varying pace', 'changing speed', 'dictating pace', 'pace manipulation',
    
    // Pace approaches
    'speeding up play', 'slowing down play', 'mixing speeds', 'sudden pace changes',
    'methodical play', 'fast-paced play', 'patient play', 'disruptive pace',
    
    // Pace control issues
    'inconsistent pace', 'playing too fast', 'playing too slow', 'losing pace control',
    'reactive to opponent\'s pace', 'inability to change speeds', 'rhythmic predictability',
    
    // Pace control questions/comments
    'how to control pace', 'varying game speed', 'dictating tempo',
    'when to speed up or slow down', 'breaking opponent\'s rhythm', 'pace strategy'
  ],
  [TacticalTopic.NONE]: []
};

/**
 * Terms indicating the player is seeking tactical advice
 */
const tacticalAdviceTerms: string[] = [
  'strategy', 'tactic', 'tactical', 'strategize', 'game plan', 'approach',
  'plan against', 'best way to play', 'strategic advice', 'tactical help',
  'strategic guidance', 'tactical approach', 'how to play against',
  'what strategy', 'which tactic', 'game style', 'playing style', 'match plan',
  'tactical thinking', 'strategic thinking', 'strategic positioning',
  'tactical decision', 'strategic choice', 'tactical option', 'game sense'
];

/**
 * Terms indicating singles play
 */
const singlesTerms: string[] = [
  'singles', 'one-on-one', '1v1', '1 on 1', 'solo play', 'singles match',
  'singles game', 'singles strategy', 'singles tactics', 'singles court',
  'playing alone', 'individual game', 'by myself', 'on my own'
];

/**
 * Terms indicating doubles play
 */
const doublesTerms: string[] = [
  'doubles', 'team', 'partner', 'two-on-two', '2v2', '2 on 2', 'doubles match',
  'doubles game', 'doubles strategy', 'doubles tactics', 'doubles court',
  'with partner', 'as a team', 'team play', 'team strategy', 'team tactics',
  'mixed doubles', 'men\'s doubles', 'women\'s doubles', 'gender doubles'
];

/**
 * Terms indicating specific game phases
 */
const gamePhaseTerms: Record<string, string[]> = {
  'serve': [
    'serve', 'serving', 'service', 'server', 'first shot', 'start of point',
    'service game', 'serving strategy', 'when I serve', 'when we serve'
  ],
  'return': [
    'return', 'returning', 'receiving', 'receiver', 'service return',
    'return of serve', 'second shot', 'returning serve', 'when receiving',
    'when I return', 'when we return', 'return games', 'return strategy'
  ],
  'transition': [
    'transition', 'third shot', '3rd shot', 'fifth shot', '5th shot',
    'approach', 'moving up', 'moving forward', 'transition zone',
    'middle of court', 'approaching the net', 'transitioning forward'
  ],
  'kitchen': [
    'kitchen', 'kitchen line', 'non-volley zone', 'NVZ', 'net play',
    'at the net', 'kitchen battle', 'dinking', 'front court',
    'net game', 'kitchen strategy', 'kitchen positioning', 'at the line'
  ]
};

/**
 * Common tactical issues by game format
 */
const tacticalIssuesByFormat: Record<string, string[]> = {
  'singles': [
    'court coverage gaps', 'poor shot selection under pressure', 'predictable pattern of play',
    'inefficient movement around court', 'overreliance on dominant shots', 'reactive play style',
    'inadequate game tempo control', 'limited strategic adjustments', 'poor serving patterns',
    'failure to exploit opponent weaknesses', 'rushing points', 'lack of point construction'
  ],
  'doubles': [
    'poor communication with partner', 'inconsistent court positioning', 'uncoordinated movement',
    'conflicting strategies with partner', 'gaps in court coverage', 'ineffective stacking',
    'failure to support partner', 'inconsistent poaching decisions', 'crossing into partner\'s space',
    'misaligned aggression levels', 'unbalanced team dynamics', 'unclear role definition'
  ],
  'both': [
    'poor shot selection', 'tactical predictability', 'inadequate opponent analysis',
    'failure to adjust strategies', 'poor situational awareness', 'weak transition game',
    'ineffective kitchen play', 'poor defensive positioning', 'lack of strategic patience',
    'inappropriate aggression level', 'failure to control pace', 'strategic inflexibility'
  ]
};

/**
 * Analyzes a message for tactical awareness-related content
 */
export function analyzeTacticalAwareness(message: string): TacticalAwarenessAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Detect the primary tactical topic
  let primaryTactic = TacticalTopic.NONE;
  let maxKeywords = 0;
  let confidenceScore = 1;
  
  // Check each tactical topic for matching keywords
  Object.entries(tacticalTopicKeywords).forEach(([tactic, keywords]) => {
    if (tactic === TacticalTopic.NONE) return;
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });
    
    if (matchCount > maxKeywords) {
      maxKeywords = matchCount;
      primaryTactic = tactic as TacticalTopic;
      
      // Calculate confidence score (1-5) based on number of matches
      confidenceScore = Math.min(5, Math.max(1, Math.ceil(matchCount / 2)));
    }
  });
  
  // Detect if the user is seeking tactical advice
  const seekingTacticalAdvice = tacticalAdviceTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  ) || primaryTactic !== TacticalTopic.NONE;
  
  // Determine the game format (singles, doubles, or both)
  let gameFormat: 'singles' | 'doubles' | 'both' = 'both'; // Default
  
  const hasSinglesTerms = singlesTerms.some(term => lowerMessage.includes(term.toLowerCase()));
  const hasDoublesTerms = doublesTerms.some(term => lowerMessage.includes(term.toLowerCase()));
  
  if (hasSinglesTerms && !hasDoublesTerms) {
    gameFormat = 'singles';
  } else if (hasDoublesTerms && !hasSinglesTerms) {
    gameFormat = 'doubles';
  }
  
  // Determine the game phase (serve, return, transition, kitchen, or all)
  let gamePhase: 'serve' | 'return' | 'transition' | 'kitchen' | 'all' = 'all'; // Default
  
  for (const [phase, terms] of Object.entries(gamePhaseTerms)) {
    if (terms.some(term => lowerMessage.includes(term.toLowerCase()))) {
      gamePhase = phase as any;
      break;
    }
  }
  
  // Detect specific tactical issues
  let hasIssue = false;
  let specificIssue: string | undefined;
  
  // Check if the message contains problem indicators
  const hasIssueIndicators = 
    lowerMessage.includes('problem') || 
    lowerMessage.includes('trouble') || 
    lowerMessage.includes('struggle') || 
    lowerMessage.includes('difficult') ||
    lowerMessage.includes('can\'t') ||
    lowerMessage.includes('cannot') ||
    lowerMessage.includes('hard time') ||
    lowerMessage.includes('how do i') ||
    lowerMessage.includes('how to improve') ||
    lowerMessage.includes('not working') ||
    lowerMessage.includes('mistake') ||
    lowerMessage.includes('error') ||
    lowerMessage.includes('wrong');
  
  if (hasIssueIndicators && primaryTactic !== TacticalTopic.NONE) {
    hasIssue = true;
    
    // Check for specific issues by game format
    const formatIssues = tacticalIssuesByFormat[gameFormat];
    
    // See if any specific issues are mentioned in the message
    const matchingIssue = formatIssues.find(issue => 
      lowerMessage.includes(issue.toLowerCase())
    );
    
    // If a specific issue is found, use it; otherwise, select a likely one based on context
    if (matchingIssue) {
      specificIssue = matchingIssue;
    } else {
      // Select a default issue for this tactic and format
      const relevantIssueIndex = Math.floor(Math.random() * formatIssues.length);
      specificIssue = formatIssues[relevantIssueIndex];
    }
  }
  
  return {
    primaryTactic,
    confidence: confidenceScore,
    hasIssue,
    specificIssue,
    seekingTacticalAdvice,
    gameFormat,
    gamePhase
  };
}

/**
 * Generate tactical improvement tips for a specific topic
 * 
 * @param tacticTopic The tactical topic
 * @param gameFormat The game format (singles, doubles, both)
 * @param gamePhase The game phase
 * @returns An array of tactical tips
 */
export function generateTacticalTips(
  tacticTopic: TacticalTopic,
  gameFormat: 'singles' | 'doubles' | 'both',
  gamePhase: 'serve' | 'return' | 'transition' | 'kitchen' | 'all'
): string[] {
  if (tacticTopic === TacticalTopic.NONE) {
    return [];
  }
  
  // Tips organized by tactical topic, game format, and game phase
  const tipsByTopicFormatPhase: Record<TacticalTopic, Record<string, Record<string, string[]>>> = {
    [TacticalTopic.COURT_POSITIONING]: {
      'singles': {
        'serve': [
          "Position yourself centrally but slightly favoring your weaker side when serving",
          "After serving, immediately move to the center of the baseline to prepare for the return",
          "For power servers, start slightly further back to give more time to recover",
          "For tactical servers, position to follow up your serve with your strongest shot"
        ],
        'return': [
          "Position yourself centrally but slightly favoring your stronger side when receiving",
          "Against deep servers, start 1-2 feet behind the baseline",
          "Against short servers, position closer to the baseline to attack early",
          "Adjust your return position based on previous points to keep the server guessing"
        ],
        'transition': [
          "Move forward diagonally when approaching the net, not straight forward",
          "In transition, stay in the center third of the court width for maximum coverage",
          "Adjust your transition position based on your opponent's court position",
          "When caught in no-man's land, favor moving backward unless you have a clear opportunity"
        ],
        'kitchen': [
          "At the kitchen line, maintain a centered position with knees slightly bent",
          "When dinking in singles, position slightly to your weaker side to protect it",
          "Against aggressive opponents, position slightly further back from the kitchen line",
          "Move laterally along the kitchen line in small adjustment steps, not large movements"
        ],
        'all': [
          "Always recover to center court after each shot in singles play",
          "Adjust your court position based on opponent tendencies and shot patterns",
          "Position yourself to force opponents to hit to your strengths",
          "In singles, controlling the center of the court is usually more important than the net"
        ]
      },
      'doubles': {
        'serve': [
          "When your team is serving, server starts at midpoint between centerline and sideline",
          "Server's partner should start at the kitchen line on their side",
          "Maintain proper spacing from your partner - typically 10-12 feet apart",
          "Consider stacking if it allows both players to hit their stronger shots"
        ],
        'return': [
          "When receiving, position at the midpoint between centerline and sideline",
          "Returner's partner should be at the kitchen line on their side",
          "Against strong servers, the returner may position slightly deeper",
          "The non-returning partner should be ready to move laterally for poaching opportunities"
        ],
        'transition': [
          "Move forward as a team during transition, maintaining lateral alignment",
          "Keep 8-10 feet of space between partners during transition movements",
          "The player without the ball should move parallel to their partner's advance",
          "In transition, communicate clearly about who takes middle balls"
        ],
        'kitchen': [
          "At the kitchen, partners should be approximately 8-10 feet apart",
          "Both players should be 1-3 inches back from the kitchen line",
          "Adjust your kitchen position slightly based on the strongest side of your opponents",
          "In kitchen battles, maintain slight body angles toward the center of the court"
        ],
        'all': [
          "In doubles, move together as a team - like you're connected by a rope",
          "When partner moves left, you should generally move left (maintaining spacing)",
          "Both players should nearly always be at the same depth on the court",
          "Proper doubles positioning forms a diagonal line from sideline to sideline"
        ]
      },
      'both': {
        'serve': [
          "Position yourself to maximize court coverage after the serve",
          "Your serving position should set up your next shot advantage",
          "Vary your post-serve positioning to avoid being predictable",
          "Position to protect your weaker side while serving"
        ],
        'return': [
          "Position yourself based on the server's tendencies and strengths",
          "Adjust your return position throughout the match to keep the server guessing",
          "Position to direct your return toward your opponent's weaker side",
          "Take an athletic stance when receiving to enable quick movements in any direction"
        ],
        'transition': [
          "During transition, stay balanced and ready to move in any direction",
          "Move forward with purpose during transition, not passively",
          "Position yourself to take the ball at the highest possible point during transition",
          "In transition, be aware of open court spaces and position to cover them"
        ],
        'kitchen': [
          "At the kitchen, position with knees bent and weight slightly forward",
          "Keep your paddle up and in front when positioned at the kitchen line",
          "Adjust your kitchen position based on the ball and opponent positions",
          "Position to protect the middle of the court when at the kitchen line"
        ],
        'all': [
          "Constantly adjust your position based on where the ball is and where it's likely to go next",
          "Position yourself to maximize your offensive options while minimizing defensive vulnerabilities",
          "Recovery positioning is just as important as initial positioning",
          "Position yourself to force opponents to hit their least comfortable shots"
        ]
      }
    },
    [TacticalTopic.SHOT_SELECTION]: {
      'singles': {
        'serve': [
          "Vary serve depth and placement to prevent opponent anticipation",
          "Against opponents who rush the net, use deeper serves to push them back",
          "Against baseline players, use shorter angled serves to pull them out of position",
          "Select serves that set up your strongest follow-up shots"
        ],
        'return': [
          "Deep returns down the middle limit opponent's angles in singles",
          "Against aggressive servers, use block returns to neutralize pace",
          "Against tactical servers, use aggressive returns to take time away",
          "Select returns that keep you balanced and ready for the next shot"
        ],
        'transition': [
          "In singles transition, patient drop shots often work better than aggressive drives",
          "Use down-the-line shots during transition to wrong-foot opponents",
          "When caught in transition, defensive lobs can buy time to recover position",
          "Select transition shots that give you time to move forward into better position"
        ],
        'kitchen': [
          "In singles kitchen play, cross-court dinks create more time and court to cover",
          "Mix up dink pace and depth to disrupt opponent timing",
          "When opportunities arise, accelerate dinks to create put-away chances",
          "Use dinks to one side followed by attacks to the opposite side"
        ],
        'all': [
          "In singles, shot selection should typically prioritize consistency over power",
          "Select shots that maximize opponent movement while minimizing your own",
          "Use shots that play to your strengths and exploit opponent weaknesses",
          "Balance high-percentage shots with occasional calculated risks"
        ]
      },
      'doubles': {
        'serve': [
          "Serve to the opponent's backhand side in doubles whenever possible",
          "Target the middle between opponents to create confusion",
          "Against stackers, serve to the open court area to force movement",
          "Select serves that complement your partner's strengths"
        ],
        'return': [
          "Return to the middle between opponents to create communication challenges",
          "Against poachers, use low, angled returns to the sideline",
          "Against baseline players, return deep to prevent them from advancing",
          "Select returns that allow your team to move forward as a unit"
        ],
        'transition': [
          "In doubles transition, third shot drops are generally higher percentage than drives",
          "When both opponents are back, consider more aggressive transition shots",
          "When opponents are split (one up, one back), target the deeper player",
          "Select transition shots that give both you and your partner time to advance"
        ],
        'kitchen': [
          "In doubles kitchen play, target the middle between opponents",
          "Use cross-court dinks to create openings for your partner to attack",
          "When opportunities arise, speed up straight ahead rather than at angles",
          "Select shots that maintain pressure while minimizing risk"
        ],
        'all': [
          "In doubles, shot selection should account for both your position and your partner's",
          "Select shots that complement your team strategy and formation",
          "Use shots that target the weaker player or create team confusion",
          "Balance aggressive shots with high-percentage setups"
        ]
      },
      'both': {
        'serve': [
          "Vary serve depth, placement, and pace to be unpredictable",
          "Select serves based on opponent position and tendencies",
          "Match your serve selection to your overall strategy for the point",
          "Choose serves that maximize your comfort while challenging opponents"
        ],
        'return': [
          "Select returns that neutralize serve advantages",
          "Against aggressive net players, use low, skidding returns",
          "Against baseline players, consider higher-arcing returns to push them back",
          "Match return aggression to the quality of the serve"
        ],
        'transition': [
          "In transition, shot selection should balance offense with control",
          "When ahead in score, favor higher-percentage transition shots",
          "When behind, consider more aggressive transition options",
          "Select transition shots that progress your court position forward"
        ],
        'kitchen': [
          "At the kitchen, use shot selection to probe for weaknesses before attacking",
          "Vary dink height, pace, spin, and placement to create openings",
          "Only attack balls that are definitively above the net",
          "Select kitchen shots that force opponents into defensive positions"
        ],
        'all': [
          "Shot selection should adapt to the specific situation, score, and opponents",
          "Balance consistency, placement, and power based on the point context",
          "Select shots that create advantageous court positioning for the next shot",
          "Use shot selection to control the pace and rhythm of the game"
        ]
      }
    },
    [TacticalTopic.GAME_STRATEGY]: {
      'singles': {
        'serve': [
          "In singles, develop 2-3 different serve patterns and rotate between them",
          "Use serves strategically to set up your next shot advantage",
          "Consider serving and approaching against players with weak passing shots",
          "Against athletic opponents, use serves that force them to hit on the move"
        ],
        'return': [
          "In singles returns, prioritize consistency and depth over power",
          "Use return direction to pull opponents out of optimal court position",
          "Against strong servers, focus on neutralizing their advantage first",
          "Develop multiple return strategies for different types of servers"
        ],
        'transition': [
          "In singles transition, patience often outperforms aggression",
          "Use transition time to assess opponent position and vulnerabilities",
          "Move forward incrementally rather than rushing to the kitchen line",
          "Develop transition strategies that maximize your specific strengths"
        ],
        'kitchen': [
          "In singles kitchen play, control the center while attacking the corners",
          "Use kitchen time to probe for movement and shot pattern weaknesses",
          "Against aggressive opponents, use their pace against them",
          "When at the kitchen, vary your patterns to avoid predictability"
        ],
        'all': [
          "In singles, construct points by building pressure progressively",
          "Develop strategies that emphasize your strengths while protecting weaknesses",
          "Adjust your strategy based on opponent patterns and tendencies",
          "Balance consistency with calculated aggression based on score and momentum"
        ]
      },
      'doubles': {
        'serve': [
          "In doubles, develop complementary serving strategies with your partner",
          "Consider predetermined patterns - serve location paired with partner movement",
          "Use serving strategies that leverage your team's strongest formation",
          "Against strong returners, use varied serve patterns to prevent anticipation"
        ],
        'return': [
          "In doubles returns, target the middle to create confusion between opponents",
          "Develop return signals with your partner to coordinate movements",
          "Against strong net players, use returns that neutralize their advantage",
          "Create return strategies that allow your team to advance as a unit"
        ],
        'transition': [
          "In doubles transition, move forward together as a coordinated team",
          "Use transition time to establish your strongest team formation",
          "Develop clear communication for who takes middle balls during transition",
          "Create transition strategies that complement both players' strengths"
        ],
        'kitchen': [
          "At the kitchen in doubles, target the middle and feet of opponents",
          "Develop cross-court dinking patterns that create openings for your partner",
          "Use kitchen strategies that maintain pressure while minimizing errors",
          "Create predetermined attack signals for kitchen play"
        ],
        'all': [
          "In doubles, develop clear team strategies for different scenarios",
          "Balance individual strengths to create an effective team dynamic",
          "Adjust your team strategy based on opponent formations and tendencies",
          "Create strategic plans for key situations: serving for the game, returning under pressure, etc."
        ]
      },
      'both': {
        'serve': [
          "Develop multiple serving strategies to adapt to different opponents",
          "Use early points to test different serve patterns and assess responses",
          "Create serve strategies that initiate your preferred style of point",
          "Adapt serving strategy based on score, momentum, and opponent adjustments"
        ],
        'return': [
          "Develop return strategies that neutralize different serving styles",
          "Use early returns to assess and exploit opponent patterns",
          "Create return strategies that immediately pressure opponents",
          "Adapt return approaches based on score and opponent adjustments"
        ],
        'transition': [
          "Develop transition strategies for different court positions and situations",
          "Use transition time to establish your preferred court position",
          "Create transition patterns that maximize your offensive options",
          "Adapt transition approach based on opponent defensive tendencies"
        ],
        'kitchen': [
          "Develop patient kitchen strategies that build pressure methodically",
          "Use kitchen exchanges to probe for and exploit weaknesses",
          "Create attack patterns based on recognized opponent vulnerabilities",
          "Adapt kitchen strategy based on opponent tendencies and adjustments"
        ],
        'all': [
          "Develop comprehensive game strategies that address all phases of play",
          "Create strategic adaptations for different opponents and styles",
          "Use early points to gather information and refine your strategy",
          "Develop distinct strategies for critical score situations"
        ]
      }
    },
    [TacticalTopic.PARTNER_COORDINATION]: {
      'singles': {
        'all': [
          "Even in singles, coordinate with your coach on strategic adjustments",
          "Develop a system for analyzing opponent patterns between games",
          "Create clear signals with your coach for timeout discussions",
          "Practice self-coordination through consistent routines between points"
        ]
      },
      'doubles': {
        'serve': [
          "Develop clear signals with your partner for serve locations and strategies",
          "Coordinate server and partner positioning based on serve type",
          "Practice server and partner movement patterns after the serve",
          "Create pre-planned serving sequences to use throughout a match"
        ],
        'return': [
          "Develop clear signals with your partner for return directions",
          "Coordinate returner and partner positioning based on return type",
          "Practice returner and partner movement patterns after the return",
          "Create pre-planned poaching sequences on the return"
        ],
        'transition': [
          "Move forward together during transition with coordinated timing",
          "Develop clear communication for who takes middle balls during transition",
          "Practice movement patterns for different transition scenarios",
          "Create verbal or hand signals for transition intentions"
        ],
        'kitchen': [
          "Develop clear signals for intended kitchen attacks or strategies",
          "Coordinate dinking patterns to create openings for your partner",
          "Practice kitchen movement as a coordinated unit",
          "Create predetermined attack sequences when specific openings occur"
        ],
        'all': [
          "Develop a comprehensive communication system covering all aspects of play",
          "Practice coordinated movements through regular drilling together",
          "Create clear role definitions for different scenarios",
          "Establish a system for making strategic adjustments during play"
        ]
      },
      'both': {
        'all': [
          "Develop coordination systems appropriate to your play level and context",
          "Create clear communication that enhances rather than complicates play",
          "Practice coordinated movements until they become instinctive",
          "Establish methods for quick strategic adjustments during matches"
        ]
      }
    },
    [TacticalTopic.OPPONENT_ANALYSIS]: {
      'singles': {
        'serve': [
          "Analyze opponent return patterns to identify tendencies and weaknesses",
          "Track which serve locations cause the most difficulty for opponents",
          "Note opponent court positioning when returning different serve types",
          "Identify how opponent return quality varies with score pressure"
        ],
        'return': [
          "Analyze opponent serving patterns to anticipate locations and types",
          "Track which serve directions are most common at critical points",
          "Note how opponent positioning shifts after delivering different serves",
          "Identify opponent serving tells or preparation indicators"
        ],
        'transition': [
          "Analyze opponent transition patterns to anticipate movements",
          "Track whether opponents prefer aggressive or patient transition play",
          "Note how opponent transitions vary when ahead vs. behind in score",
          "Identify opponent vulnerabilities during the transition phase"
        ],
        'kitchen': [
          "Analyze opponent dinking patterns to identify preferences and weaknesses",
          "Track which dink locations cause the most difficulty for opponents",
          "Note opponent attack triggers - what shots they typically attack",
          "Identify opponent tendencies when under pressure at the kitchen"
        ],
        'all': [
          "Develop systematic opponent analysis covering all phases of play",
          "Track patterns across multiple points rather than isolated instances",
          "Note how opponent strategies shift in different score situations",
          "Identify both technical and psychological patterns"
        ]
      },
      'doubles': {
        'serve': [
          "Analyze both opponents' return tendencies separately",
          "Track which serves create confusion or communication issues",
          "Note how opponent positioning and formation affects returns",
          "Identify which opponent has the stronger return and on which side"
        ],
        'return': [
          "Analyze serving patterns of both opponents separately",
          "Track how the serving team positions and moves after different serves",
          "Note serving team signals or communication patterns",
          "Identify which server and which serve type creates the most advantage"
        ],
        'transition': [
          "Analyze how opponents coordinate during transition movement",
          "Track whether opponents move forward together or independently",
          "Note how opponents handle communication during transition",
          "Identify transition vulnerabilities in the opponent team"
        ],
        'kitchen': [
          "Analyze opponents' kitchen coordination and communication",
          "Track dinking patterns and preferences of both opponents",
          "Note how opponents coordinate attacks and who typically initiates",
          "Identify weak spots in opponents' kitchen defense"
        ],
        'all': [
          "Analyze opponents as individuals and as a team unit",
          "Track patterns of team coordination and communication",
          "Note how opponents handle pressure situations as a team",
          "Identify relationship dynamics that might influence play"
        ]
      },
      'both': {
        'all': [
          "Develop structured opponent analysis that can be applied quickly",
          "Track patterns throughout the match to identify adjustments",
          "Note both technical tendencies and psychological patterns",
          "Identify how opponents respond to different strategic approaches"
        ]
      }
    },
    [TacticalTopic.PATTERN_RECOGNITION]: {
      'singles': {
        'serve': [
          "Identify repeating sequences in opponent serve locations",
          "Recognize patterns in how opponents follow their serves",
          "Track serve selection patterns based on score situation",
          "Note patterns in your own serving effectiveness"
        ],
        'return': [
          "Identify repeating sequences in opponent serve selections",
          "Recognize patterns in how serves vary in different score situations",
          "Track which return directions give you the most success",
          "Note patterns in opponent court coverage after serving"
        ],
        'transition': [
          "Identify repeating sequences in opponent transition movements",
          "Recognize patterns in opponent shot selection during transition",
          "Track which transition approaches are most successful against this opponent",
          "Note patterns in how transition effectiveness changes with score"
        ],
        'kitchen': [
          "Identify repeating sequences in opponent dinking patterns",
          "Recognize triggers that precede opponent attacks",
          "Track which dinking patterns create the most opponent discomfort",
          "Note patterns in how kitchen exchanges evolve"
        ],
        'all': [
          "Develop systematic pattern recognition across all phases of play",
          "Recognize both technical and psychological patterns",
          "Track how patterns change in different score situations",
          "Note your own tendencies that might be predictable to opponents"
        ]
      },
      'doubles': {
        'serve': [
          "Identify team serving patterns and formations",
          "Recognize signals or tells before different serve types",
          "Track patterns in how the serving team moves after the serve",
          "Note patterns in which serves create return difficulties"
        ],
        'return': [
          "Identify team return patterns and formations",
          "Recognize how each team responds to different serve types",
          "Track patterns in team positioning during the return phase",
          "Note patterns in which returns create the most successful points"
        ],
        'transition': [
          "Identify team coordination patterns during transition",
          "Recognize how teams handle the critical third and fifth shots",
          "Track patterns in team communication during transition",
          "Note which transition patterns lead to the most advantageous positions"
        ],
        'kitchen': [
          "Identify team dinking patterns and tendencies",
          "Recognize triggers that precede team attacks",
          "Track patterns in how teams coordinate kitchen movement",
          "Note patterns in which kitchen strategies create the most success"
        ],
        'all': [
          "Develop systematic team pattern recognition",
          "Recognize patterns in team communication and coordination",
          "Track how team dynamics change in pressure situations",
          "Note patterns in team strategic adjustments throughout matches"
        ]
      },
      'both': {
        'all': [
          "Develop structured approaches to recognize patterns quickly",
          "Recognize patterns across technical, tactical, and psychological dimensions",
          "Track how patterns evolve throughout a match",
          "Note which pattern recognition leads to the most strategic advantage"
        ]
      }
    },
    [TacticalTopic.SITUATIONAL_AWARENESS]: {
      'singles': {
        'serve': [
          "Adjust serving strategy based on score (aggressive when ahead, consistent when behind)",
          "Be aware of serving patterns you've established and when to break them",
          "Recognize when to use low-risk vs. high-reward serves based on game situation",
          "Assess opponent's energy and confidence when selecting serves"
        ],
        'return': [
          "Adjust return aggression based on score situation",
          "Be aware of opponent serving patterns and anticipate accordingly",
          "Recognize when to prioritize neutralizing vs. attacking returns",
          "Assess the risk/reward of different return options based on game context"
        ],
        'transition': [
          "Adjust transition aggression based on score and momentum",
          "Be aware of court positioning of both yourself and your opponent",
          "Recognize when to accelerate or patient during transition",
          "Assess opponent comfort level during transition phases"
        ],
        'kitchen': [
          "Adjust kitchen strategy based on score and momentum",
          "Be aware of emerging patterns in the dinking exchange",
          "Recognize optimal attack opportunities vs. forced attacks",
          "Assess opponent patience level and exploit accordingly"
        ],
        'all': [
          "Maintain constant awareness of score and its strategic implications",
          "Be aware of patterns that have emerged throughout the match",
          "Recognize critical momentum points and adjust risk tolerance",
          "Assess opponent physical and mental state throughout the match"
        ]
      },
      'doubles': {
        'serve': [
          "Adjust team serving strategy based on score situation",
          "Be aware of opponent return tendencies against different serve types",
          "Recognize when to target specific opponents based on their current performance",
          "Assess opposing team dynamics and target accordingly"
        ],
        'return': [
          "Adjust team return strategy based on score situation",
          "Be aware of opponents' serving patterns and positioning",
          "Recognize when to increase poaching based on return quality",
          "Assess serving team's formation vulnerabilities"
        ],
        'transition': [
          "Adjust team transition strategy based on score and momentum",
          "Be aware of opponent tendencies during transition defense",
          "Recognize when to accelerate or patient during team transition",
          "Assess opposing team coordination during transition phases"
        ],
        'kitchen': [
          "Adjust team kitchen strategy based on score and momentum",
          "Be aware of opponent tendencies and triggers during kitchen play",
          "Recognize optimal vs. forced attack opportunities",
          "Assess opponent team communication patterns at the kitchen"
        ],
        'all': [
          "Maintain awareness of score implications for team strategy",
          "Be aware of opponent team dynamics and communication patterns",
          "Recognize critical momentum shifts that require strategic adjustment",
          "Assess physical and mental state of all players throughout the match"
        ]
      },
      'both': {
        'all': [
          "Develop a structured approach to situational assessment",
          "Be aware of score, momentum, patterns, and player states simultaneously",
          "Recognize when strategic adjustments are necessary",
          "Assess risk/reward appropriately based on complete game context"
        ]
      }
    },
    [TacticalTopic.STACKING]: {
      'doubles': {
        'serve': [
          "Use stacking on serve to keep both players on their preferred sides",
          "Develop clear signals and movement patterns for stacked serves",
          "Practice smooth transitions from stacked serving positions",
          "Create multiple stacked serving formations to use strategically"
        ],
        'return': [
          "Use stacking on return to maximize each player's strongest shots",
          "Develop clear movement patterns for stacked return positions",
          "Practice quick transitions to appropriate court coverage",
          "Create stacked return strategies against different serve types"
        ],
        'transition': [
          "Maintain clarity about court responsibilities during stacked transitions",
          "Develop extra communication cues when playing in stacked formations",
          "Practice movement patterns specific to stacked transition phases",
          "Use transition as a time to reset preferred stacked positions"
        ],
        'kitchen': [
          "Maintain appropriate spacing when stacked at the kitchen line",
          "Develop clear communications about middle ball responsibilities",
          "Practice lateral movement patterns when stacked at the kitchen",
          "Create attack strategies optimized for stacked kitchen formations"
        ],
        'all': [
          "Develop a comprehensive stacking strategy appropriate to your team",
          "Practice all phases of play from stacked formations regularly",
          "Create clear communication systems specific to stacked play",
          "Use stacking strategically rather than as a default formation"
        ]
      },
      'both': {
        'all': [
          "Understand stacking fundamentals before implementing in matches",
          "Develop stacking strategies appropriate to your skill level",
          "Create clear communication systems to prevent confusion",
          "Practice stacked formations regularly until they feel natural"
        ]
      }
    },
    [TacticalTopic.SERVE_STRATEGY]: {
      'singles': {
        'serve': [
          "Develop 3-4 distinct serve types that you can execute consistently",
          "Vary serve placement between wide, middle, and body serves",
          "Create serving patterns that set up your strongest follow-up shots",
          "Use serve speed and spin strategically based on opponent tendencies"
        ],
        'all': [
          "Develop a strategic serving approach for the entire match",
          "Create serving plans for critical score situations",
          "Establish serving patterns early, then strategically break them",
          "Use serving as a tool to control match pace and momentum"
        ]
      },
      'doubles': {
        'serve': [
          "Develop team-oriented serving strategies with your partner",
          "Create serves that complement your team's strongest formation",
          "Use serve placement to target opponent weaknesses or team gaps",
          "Develop signals for different serve strategies"
        ],
        'all': [
          "Create a comprehensive team serving strategy",
          "Develop distinct serving plans for different opponent formations",
          "Establish team movement patterns that follow different serves",
          "Use serving strategy to control match rhythm and momentum"
        ]
      },
      'both': {
        'serve': [
          "Develop a varied serving arsenal with consistent execution",
          "Create strategic serve sequences rather than random variation",
          "Use serve location, depth, speed, and spin as tactical tools",
          "Develop serving strategies specific to different opponents"
        ],
        'all': [
          "View serving as a strategic advantage rather than just starting the point",
          "Create serving strategies for different score situations",
          "Develop the ability to execute high-percentage serves under pressure",
          "Use serving strategy to establish psychological advantage"
        ]
      }
    },
    [TacticalTopic.RETURN_STRATEGY]: {
      'singles': {
        'return': [
          "Develop 3-4 return types based on serve location and speed",
          "Create return strategies that neutralize server advantages",
          "Vary return depth and direction to prevent anticipation",
          "Use return placement to set up advantageous court position"
        ],
        'all': [
          "Develop a strategic return approach for different servers",
          "Create return plans for critical score situations",
          "Establish patterns of consistent returns before adding variation",
          "Use returning strategy to disrupt server confidence and rhythm"
        ]
      },
      'doubles': {
        'return': [
          "Develop team-oriented return strategies",
          "Create returns that target the middle or exploit team weaknesses",
          "Use return placement to hinder opposing team's forward movement",
          "Develop signals for different return intentions"
        ],
        'all': [
          "Create a comprehensive team return strategy",
          "Develop distinct return plans for different serving teams",
          "Establish team movement patterns that follow different returns",
          "Use return strategy to disrupt opponent teams and create advantages"
        ]
      },
      'both': {
        'return': [
          "Develop a varied return arsenal with consistent execution",
          "Create strategic return approaches for different serve types",
          "Use return depth, direction, and pace as tactical tools",
          "Develop returning strategies specific to different servers"
        ],
        'all': [
          "View returning as a strategic opportunity rather than just neutralizing",
          "Create return strategies for different score situations",
          "Develop the ability to execute high-percentage returns under pressure",
          "Use return strategy to establish point control early"
        ]
      }
    },
    [TacticalTopic.TRANSITION_STRATEGY]: {
      'singles': {
        'transition': [
          "Develop patient transition strategies that prioritize control",
          "Create transition approaches based on opponent court position",
          "Vary between aggressive drives and controlled drops",
          "Use transition shots to improve your court positioning"
        ],
        'all': [
          "Develop a strategic transition approach for different opponents",
          "Create transition plans for critical score situations",
          "Establish transition patterns that maximize your strengths",
          "Use transition strategy to gradually gain court advantage"
        ]
      },
      'doubles': {
        'transition': [
          "Develop team-oriented transition strategies",
          "Create transition approaches that allow coordinated forward movement",
          "Use third shot selection based on opposing team formation",
          "Develop clear communication for transition execution"
        ],
        'all': [
          "Create a comprehensive team transition strategy",
          "Develop distinct transition plans for different opposing teams",
          "Establish clear team movement patterns during transition",
          "Use transition strategy to establish advantageous court positions"
        ]
      },
      'both': {
        'transition': [
          "Develop a varied transition arsenal for different situations",
          "Create strategic transition approaches based on point context",
          "Use third and fifth shots as tactical tools rather than just connections",
          "Develop transition strategies that build advantage incrementally"
        ],
        'all': [
          "View transition as a strategic phase rather than just moving forward",
          "Create transition strategies for different score situations",
          "Develop the ability to execute high-percentage transition shots under pressure",
          "Use transition strategy to establish kitchen control"
        ]
      }
    },
    [TacticalTopic.KITCHEN_STRATEGY]: {
      'singles': {
        'kitchen': [
          "Develop patient kitchen strategies that force opponent movement",
          "Create dinking patterns that progressively build advantage",
          "Vary dink pace, height, and spin to disrupt opponent timing",
          "Use kitchen exchanges to identify and exploit weaknesses"
        ],
        'all': [
          "Develop a strategic kitchen approach for different opponents",
          "Create kitchen plans for critical score situations",
          "Establish dinking patterns that maximize your strengths",
          "Use kitchen strategy to control point pace and outcome"
        ]
      },
      'doubles': {
        'kitchen': [
          "Develop team-oriented kitchen strategies",
          "Create dinking patterns that target the middle or weaker opponent",
          "Use coordinated attacks when advantageous balls present",
          "Develop clear communication for kitchen exchange intentions"
        ],
        'all': [
          "Create a comprehensive team kitchen strategy",
          "Develop distinct kitchen plans for different opposing teams",
          "Establish clear offensive triggers and execution plans",
          "Use kitchen strategy to methodically break down opponent defenses"
        ]
      },
      'both': {
        'kitchen': [
          "Develop patient yet purposeful kitchen approaches",
          "Create strategic dinking patterns rather than random exchanges",
          "Use dink location, pace, height, and spin as tactical tools",
          "Develop kitchen strategies specific to different opponents"
        ],
        'all': [
          "View kitchen play as strategic rather than just keeping the ball in play",
          "Create kitchen strategies for different score situations",
          "Develop the ability to execute high-percentage kitchen shots under pressure",
          "Use kitchen strategy to methodically create and capitalize on openings"
        ]
      }
    },
    [TacticalTopic.POACHING]: {
      'doubles': {
        'return': [
          "Develop strategic poaching on opponent serves",
          "Create signals or triggers for planned poaches",
          "Vary poaching frequency to prevent predictability",
          "Use poaching to disrupt opponent's expected patterns"
        ],
        'kitchen': [
          "Develop controlled poaching at the kitchen line",
          "Create signals or triggers for kitchen poach intentions",
          "Use poaching to apply pressure during extended dinking",
          "Practice recovery positioning after poaching attempts"
        ],
        'all': [
          "Develop a comprehensive poaching strategy appropriate to your team",
          "Create clear communication systems for poaching intentions",
          "Balance poaching aggression with defensive responsibility",
          "Use selective poaching as a tactical surprise element"
        ]
      },
      'both': {
        'all': [
          "Understand poaching fundamentals before implementing in matches",
          "Develop poaching strategies appropriate to your skill level",
          "Create clear communication systems to prevent confusion",
          "Practice poaching recovery to minimize vulnerability when unsuccessful"
        ]
      }
    },
    [TacticalTopic.DEFENSIVE_TACTICS]: {
      'singles': {
        'all': [
          "Develop reset skills that neutralize opponent attacks",
          "Create defensive court positioning appropriate to different threats",
          "Prioritize depth and height on defensive shots",
          "Use defensive shots that buy time for recovery"
        ]
      },
      'doubles': {
        'all': [
          "Develop team-based defensive strategies and formations",
          "Create clear communication for defensive situations",
          "Establish defensive priorities: reset first, then counter when possible",
          "Use defensive shots that protect your team's court position"
        ]
      },
      'both': {
        'all': [
          "Develop various defensive skills for different attack types",
          "Create strategic defensive approaches rather than just reacting",
          "View defense as an opportunity to shift momentum, not just survive",
          "Use defensive success to frustrate opponents psychologically"
        ]
      }
    },
    [TacticalTopic.OFFENSIVE_TACTICS]: {
      'singles': {
        'all': [
          "Develop progressive offensive strategies that build advantage",
          "Create attacking patterns that exploit specific weaknesses",
          "Balance aggression with high-percentage shot selection",
          "Use offensive variety to prevent defensive anticipation"
        ]
      },
      'doubles': {
        'all': [
          "Develop team-based offensive strategies and signals",
          "Create coordinated attacks with clear role definition",
          "Establish offensive triggers that both partners recognize",
          "Use varied offensive patterns to prevent defensive anticipation"
        ]
      },
      'both': {
        'all': [
          "Develop offensive skills for different court positions",
          "Create strategic offensive approaches rather than just hitting harder",
          "Balance offensive aggression with situational awareness",
          "Use offensive success to build psychological momentum"
        ]
      }
    },
    [TacticalTopic.PACE_CONTROL]: {
      'singles': {
        'all': [
          "Develop the ability to control point pace through shot selection",
          "Create strategic pace variations based on opponent comfort level",
          "Use pace changes to disrupt opponent timing and rhythm",
          "Establish your preferred pace based on your strengths"
        ]
      },
      'doubles': {
        'all': [
          "Develop team-based pace control strategies",
          "Create clear communication about intended pace changes",
          "Establish pace control that maximizes your team's strengths",
          "Use pace variations to disrupt opponent team coordination"
        ]
      },
      'both': {
        'all': [
          "Develop various skills for controlling point pace",
          "Create strategic pace management tailored to different opponents",
          "Balance pace control with shot percentage and court position",
          "Use pace as a tactical tool for controlling match rhythm"
        ]
      }
    },
    [TacticalTopic.NONE]: {
      'singles': {
        'all': []
      },
      'doubles': {
        'all': []
      },
      'both': {
        'all': []
      }
    }
  };
  
  // Get the most specific tips available for this combination
  let tips: string[] = [];
  
  // Try to get highly specific tips (tactic + format + phase)
  if (tipsByTopicFormatPhase[tacticTopic]?.[gameFormat]?.[gamePhase]) {
    tips = tipsByTopicFormatPhase[tacticTopic][gameFormat][gamePhase];
  } 
  // Fall back to tactic + format + 'all'
  else if (tipsByTopicFormatPhase[tacticTopic]?.[gameFormat]?.['all']) {
    tips = tipsByTopicFormatPhase[tacticTopic][gameFormat]['all'];
  }
  // Fall back to tactic + 'both' + phase
  else if (tipsByTopicFormatPhase[tacticTopic]?.['both']?.[gamePhase]) {
    tips = tipsByTopicFormatPhase[tacticTopic]['both'][gamePhase];
  }
  // Fall back to tactic + 'both' + 'all' as the most general option
  else if (tipsByTopicFormatPhase[tacticTopic]?.['both']?.['all']) {
    tips = tipsByTopicFormatPhase[tacticTopic]['both']['all'];
  }
  
  return tips;
}

/**
 * Generates a response focused on tactical awareness
 */
export function generateTacticalResponse(
  analysis: TacticalAwarenessAnalysis,
  userName: string
): string {
  // If no clear tactical topic was detected, return empty string
  if (analysis.primaryTactic === TacticalTopic.NONE || analysis.confidence < 2) {
    return '';
  }
  
  const { primaryTactic, hasIssue, specificIssue, seekingTacticalAdvice, gameFormat, gamePhase } = analysis;
  
  // Get appropriate tactical tips
  const tips = generateTacticalTips(primaryTactic, gameFormat, gamePhase);
  
  // Format the tactic name for display
  const tacticName = primaryTactic.replace(/_/g, ' ').toLowerCase();
  const formatText = gameFormat === 'both' ? 'pickleball' : `${gameFormat} pickleball`;
  
  // Generate different response types based on context
  if (seekingTacticalAdvice && hasIssue) {
    // User is seeking advice for a specific tactical issue
    return `I understand you're looking to improve your ${tacticName} in ${formatText}, ${userName}. 
    
The issue with ${specificIssue} is quite common. Here are some specific tactical tips to address this:

- ${tips.slice(0, 3).join('\n- ')}

Would you like to discuss more specific strategies for your next match? Or perhaps you'd like a detailed analysis of how to implement these tactical adjustments?`;
  } 
  else if (seekingTacticalAdvice) {
    // User is seeking general tactical advice
    return `Improving your ${tacticName} is an excellent focus area for ${formatText}, ${userName}. 
    
Here are some tactical approaches that could enhance your game:

- ${tips.slice(0, 3).join('\n- ')}

These tactical elements can significantly elevate your overall game strategy. Would you like more specific guidance on implementing these concepts in your matches?`;
  }
  else if (hasIssue) {
    // User has a specific tactical issue but isn't explicitly asking for advice
    return `I notice you're mentioning some challenges with ${tacticName} in your ${formatText} game, specifically with ${specificIssue}. 
    
This is a common tactical challenge that many players face. Here are some approaches that might help:

- ${tips.slice(0, 3).join('\n- ')}

Is this specific tactical element something you'd like to focus on developing further?`;
  }
  else {
    // General response about this tactical topic
    return `${tacticName.charAt(0).toUpperCase() + tacticName.slice(1)} is a crucial tactical element in ${formatText}. Here are some key tactical concepts to consider:

- ${tips.slice(0, 3).join('\n- ')}

Would you like more specific tactical guidance on this aspect of your game, or perhaps some practical ways to implement these concepts in your matches?`;
  }
}