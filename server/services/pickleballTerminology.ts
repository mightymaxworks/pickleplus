/**
 * PKL-278651-COACH-0003-TERMS
 * Pickleball Terminology Dictionary for SAGE Integration
 * 
 * This file provides structured pickleball terminology organized by categories
 * and mapped to the CourtIQ dimensions to enhance SAGE's ability to recognize
 * and provide advice on specific pickleball concepts.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';

/**
 * Defines a pickleball term with associated metadata
 */
export interface PickleballTerm {
  /** The term itself */
  term: string;
  /** Alternative ways to refer to the term */
  aliases: string[];
  /** Primary dimension this term relates to */
  primaryDimension: DimensionCode;
  /** Secondary dimensions this term relates to */
  secondaryDimensions: DimensionCode[];
  /** A description of the term */
  description: string;
  /** Common issues players face with this concept */
  commonIssues: string[];
  /** Tips for improvement */
  improvementTips: string[];
  /** Relevant drills or practice exercises */
  drills: string[];
}

/**
 * Categories of pickleball terms
 */
export enum TermCategory {
  SHOTS = 'shots',
  COURT_POSITIONS = 'court_positions',
  GAMEPLAY = 'gameplay',
  EQUIPMENT = 'equipment',
  STRATEGY = 'strategy',
  RULES = 'rules'
}

/**
 * Complete pickleball terminology dictionary organized by category
 */
export const pickleballTerminology: Record<TermCategory, PickleballTerm[]> = {
  [TermCategory.SHOTS]: [
    {
      term: 'dink',
      aliases: ['soft shot', 'kitchen shot', 'drop shot'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT', 'CONS'],
      description: 'A soft shot hit from the non-volley zone that typically arcs over the net and lands in the opponent\'s non-volley zone.',
      commonIssues: [
        'Hitting too high or too hard',
        'Inconsistent paddle angle',
        'Poor footwork positioning',
        'Lack of touch/feel'
      ],
      improvementTips: [
        'Focus on a continental grip for better control',
        'Aim for a rainbow arc trajectory',
        'Practice maintaining consistent contact point',
        'Develop touch by practicing varied distances'
      ],
      drills: [
        'Dink rally: Sustain cross-court dinks with a partner',
        'Figure-8 dinking: Practice forehand and backhand dinks in sequence',
        'Target dinking: Place targets in opponent\'s kitchen'
      ]
    },
    {
      term: 'drive',
      aliases: ['power shot', 'groundstroke', 'passing shot'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT', 'PHYS'],
      description: 'A hard, low shot typically hit from the baseline or mid-court that travels quickly with little arc.',
      commonIssues: [
        'Hitting into the net',
        'Shot goes too high or out of bounds',
        'Inconsistent pace and direction',
        'Poor shot selection (using drives when dinks are better)'
      ],
      improvementTips: [
        'Keep the paddle face closed slightly to control trajectory',
        'Use your legs to generate power, not just arm swing',
        'Target the center of the court first before going for angles',
        'Practice transitioning between drives and softer shots'
      ],
      drills: [
        'Drive practice: Rally from baseline with progressive speed',
        'Drive-and-approach: Hit drive then move forward to volley',
        'Target drives: Set up targets at baseline corners'
      ]
    },
    {
      term: 'third shot drop',
      aliases: ['3rd shot', 'transition shot', 'approach shot'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT', 'MENT'],
      description: 'A soft shot hit by the serving team on the third shot that lands in the opponent\'s kitchen, allowing the serving team to approach the net.',
      commonIssues: [
        'Shot lands too short or in the net',
        'Shot pops up too high, easy to attack',
        'Inconsistent execution under pressure',
        'Poor decision-making on when to drop vs. drive'
      ],
      improvementTips: [
        'Use a continental grip for better control',
        'Think of "lifting" the ball rather than hitting it',
        'Take pace off the return with a soft paddle face',
        'Practice from various court positions and angles'
      ],
      drills: [
        '3-shot sequence: serve, return, third shot drop drill',
        'Drop-and-approach: Practice moving forward after the drop',
        'Reset drill: Return hard shots with controlled drops'
      ]
    },
    {
      term: 'volley',
      aliases: ['punch volley', 'block volley', 'put away'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT', 'MENT'],
      description: 'A shot hit before the ball bounces, typically executed at the non-volley zone line.',
      commonIssues: [
        'Swinging too much (overswinging)',
        'Poor paddle preparation (not ready)',
        'Hitting down into the net',
        'Stepping into the kitchen when volleying'
      ],
      improvementTips: [
        'Keep the paddle up and in front as you approach the net',
        'Use a block/punch motion rather than a swing',
        'Watch the ball hit your paddle for better control',
        'Practice quick hands and reactions'
      ],
      drills: [
        'Rapid-fire volley practice with a partner',
        'Volley-to-target: Set up specific targets to aim for',
        'Defensive volley practice: Partner hits hard, you block/reset'
      ]
    },
    {
      term: 'lob',
      aliases: ['overhead setup', 'defensive shot', 'high ball'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT'],
      description: 'A high-arcing shot hit over opponents at the net, typically used as a defensive or tactical play.',
      commonIssues: [
        'Not enough height or depth',
        'Too predictable or telegraphed',
        'Poor timing when opponents are out of position',
        'Inconsistent execution under pressure'
      ],
      improvementTips: [
        'Use an open paddle face and lift through the ball',
        'Aim deep - 1-2 feet from the baseline',
        'Mix in lobs strategically, not as your primary shot',
        'Practice both forehand and backhand lobs'
      ],
      drills: [
        'Lob-and-defend: Practice lobbing then defending the ensuing overhead',
        'Target lob practice: Set up targets deep in the court',
        'Tactical lob drill: Lob only when partner is at specific position'
      ]
    },
    {
      term: 'erne',
      aliases: ['around the post', 'jump shot', 'specialty shot'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['TACT', 'PHYS'],
      description: 'An advanced shot where the player steps around or jumps over the non-volley zone to volley the ball from a position that would normally be inside the kitchen.',
      commonIssues: [
        'Poor timing of when to attempt the shot',
        'Lack of agility/footwork to get in position',
        'Kitchen violations when attempting',
        'Inconsistent execution'
      ],
      improvementTips: [
        'Only attempt when the ball is heading wide of the sideline',
        'Ensure your momentum is carrying you away from the kitchen',
        'Practice the footwork pattern separately before adding the shot',
        'Start with slow-paced practice before game situations'
      ],
      drills: [
        'Side-feed erne practice: Partner feeds balls to sideline',
        'Erne positioning drill: Practice footwork without hitting',
        'Erne game situation: Set up specific scenarios to practice'
      ]
    }
  ],
  [TermCategory.COURT_POSITIONS]: [
    {
      term: 'kitchen',
      aliases: ['non-volley zone', 'NVZ', '7-foot zone'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH'],
      description: 'The 7-foot zone extending from the net on each side where players cannot volley the ball (must let it bounce first).',
      commonIssues: [
        'Foot faults when volleying near the line',
        'Poor positioning relative to the kitchen line',
        'Momentum carrying players into the kitchen after volleys',
        'Not utilizing the kitchen effectively for dinking'
      ],
      improvementTips: [
        'Practice "kitchen awareness" - always know where the line is',
        'Work on balanced shots that don\'t carry you forward',
        'Position yourself 6-12 inches behind the kitchen line when volleying',
        'Use the kitchen strategically for placement of dinks and drops'
      ],
      drills: [
        'Kitchen line footwork drill: Shuffle laterally while maintaining distance',
        'Dink-and-retreat: Practice hitting dinks then backing up slightly',
        'Kitchen boundary drill: Practice hitting while close to line without faulting'
      ]
    },
    {
      term: 'baseline',
      aliases: ['back line', 'service line', 'back court'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'PHYS'],
      description: 'The line at the back of the court marking the boundary for serves and rallies.',
      commonIssues: [
        'Poor positioning for serve and return',
        'Difficulty transitioning from baseline to net',
        'Staying too far back during play',
        'Out balls on deep shots'
      ],
      improvementTips: [
        'Position yourself 1-2 feet inside the baseline for better coverage',
        'Practice acceleration from baseline to transition zone',
        'Develop a two-step split-step to improve reactions',
        'Work on deep targeted shots that land within 2 feet of the baseline'
      ],
      drills: [
        'Baseline-to-net transition drill',
        'Baseline precision targeting practice',
        'Serve and return positioning drill'
      ]
    },
    {
      term: 'transition zone',
      aliases: ['mid-court', 'no-man\'s land', 'middle zone'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'PHYS'],
      description: 'The area between the baseline and the non-volley zone where players are vulnerable and should transition through quickly.',
      commonIssues: [
        'Getting stuck in the zone for too long',
        'Indecision about moving forward or back',
        'Poor shot selection from this position',
        'Defensive rather than offensive positioning'
      ],
      improvementTips: [
        'Avoid stopping in this zone - keep moving forward or back',
        'Use the third shot drop to facilitate transitioning forward',
        'When caught here, focus on shots that give you time to reposition',
        'Practice decision-making: when to retreat vs. advance'
      ],
      drills: [
        'Transition drill: Start at baseline, progress to net after each shot',
        'Reset drill: Practice defensive shots from mid-court',
        'Decision training: Partner randomly calls "forward" or "back" during rally'
      ]
    }
  ],
  [TermCategory.GAMEPLAY]: [
    {
      term: 'stacking',
      aliases: ['stacked formation', 'specialized positioning', 'position switching'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['MENT'],
      description: 'A strategic formation where partners position themselves based on preferred sides rather than traditional even/odd court positioning.',
      commonIssues: [
        'Confusion about starting positions',
        'Poor communication with partner',
        'Getting crossed up during transitions',
        'Forgetting to return to proper positions'
      ],
      improvementTips: [
        'Practice with the same partner consistently',
        'Develop clear verbal and hand signals',
        'Start with basic stacking before complex variations',
        'Drill transitions repeatedly until they become automatic'
      ],
      drills: [
        'Static stacking drill: Practice correct positioning without hitting',
        'Dynamic stacking: Full game practice with emphasis on transitions',
        'Side-switch drill: Practice moving from one side to the other'
      ]
    },
    {
      term: 'rally',
      aliases: ['exchange', 'point play', 'ball in play'],
      primaryDimension: 'CONS',
      secondaryDimensions: ['MENT', 'PHYS'],
      description: 'The back-and-forth exchange of shots during a point.',
      commonIssues: [
        'Inconsistent shot selection during rallies',
        'Fatigue during extended exchanges',
        'Mental lapses or loss of focus',
        'Rushing shots under pressure'
      ],
      improvementTips: [
        'Practice sustained dinking to build rally tolerance',
        'Develop a "reset" mentality when under pressure',
        'Build physical conditioning for longer points',
        'Learn to recognize patterns and anticipate'
      ],
      drills: [
        'Endurance rally: See how many consecutive shots teams can hit',
        'Pressure rally: Add consequences for errors during practice rallies',
        'Pattern recognition: Practice identifying and responding to common sequences'
      ]
    },
    {
      term: 'poaching',
      aliases: ['crossing over', 'taking partner\'s ball', 'offensive move'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'MENT'],
      description: 'When one player moves across to hit a ball in their partner\'s area, typically to be more aggressive or offensive.',
      commonIssues: [
        'Poor timing of poaches',
        'Not communicating with partner',
        'Leaving your own side exposed',
        'Hesitation leading to neither partner taking the ball'
      ],
      improvementTips: [
        'Establish verbal or visual signals with your partner',
        'Look for specific triggers - weak returns, high balls',
        'Commit fully once you decide to poach',
        'Practice recovery to your position after poaching'
      ],
      drills: [
        'Called poach drill: Partner calls when you should poach',
        'Opportunity poaching: React to specific shot types',
        'Recovery drill: Practice getting back to position after poaching'
      ]
    }
  ],
  [TermCategory.EQUIPMENT]: [
    {
      term: 'paddle grip',
      aliases: ['grip style', 'handle technique', 'holding method'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['PHYS'],
      description: 'How a player holds the paddle, including continental, eastern, or western grip styles.',
      commonIssues: [
        'Using an improper grip for different shots',
        'Grip too tight causing arm fatigue',
        'Inconsistent grip pressure throughout play',
        'Grip shifting during swing'
      ],
      improvementTips: [
        'Master the continental grip for versatility',
        'Practice relaxing your grip between shots',
        'Use a grip check as part of your pre-shot routine',
        'Ensure proper grip size for your hand'
      ],
      drills: [
        'Grip transition drill: Practice changing grips between shots',
        'Pressure sensitive drill: Practice maintaining consistent grip pressure',
        'Multi-shot drill: Hit different shots while maintaining proper grip'
      ]
    },
    {
      term: 'paddle weight',
      aliases: ['paddle balance', 'paddle specs', 'equipment tuning'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['PHYS'],
      description: 'The overall weight and balance of a pickleball paddle, which affects power, control, and maneuverability.',
      commonIssues: [
        'Using too heavy or light a paddle',
        'Poor paddle balance for your playing style',
        'Arm fatigue from inappropriate weight',
        'Inconsistent feel across different paddles'
      ],
      improvementTips: [
        'Try different paddle weights to find your ideal range',
        'Consider head-heavy for power, handle-heavy for control',
        'Match paddle specifications to your physical capabilities',
        'Gradually adjust to new paddles rather than switching abruptly'
      ],
      drills: [
        'Paddle comparison drill: Hit identical shots with different paddles',
        'Fatigue assessment: Practice extended sessions to gauge comfort',
        'Shot precision test: Evaluate control with different paddles'
      ]
    }
  ],
  [TermCategory.STRATEGY]: [
    {
      term: 'reset battle',
      aliases: ['soft game', 'dinking game', 'kitchen rally'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'MENT'],
      description: 'The strategic exchange of soft shots (usually dinks) where players are trying to force the opponent to make an error or lift a ball that can be attacked.',
      commonIssues: [
        'Impatience leading to premature attacks',
        'Lifting balls too high',
        'Poor shot selection during reset exchanges',
        'Mental fatigue during extended dinking'
      ],
      improvementTips: [
        'Develop a patient mindset - winning reset battles is often about patience',
        'Practice creating and recognizing attacking opportunities',
        'Work on varied dink paces and spins',
        'Build mental stamina for extended exchanges'
      ],
      drills: [
        'Patience drill: Sustained dinking with no attacks allowed',
        'Progressive pressure: Gradually increase dinking pace',
        'Attack trigger drill: Define specific situations when attacks are permitted'
      ]
    },
    {
      term: 'stack and attack',
      aliases: ['offensive formation', 'specialized positions', 'aggressive positioning'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'MENT'],
      description: 'A strategy combining stacked positioning with an aggressive approach, usually keeping the stronger player in the forehand position.',
      commonIssues: [
        'Poor execution of stack transitions',
        'Predictable attack patterns',
        'Partner coordination issues',
        'Leaving gaps in court coverage'
      ],
      improvementTips: [
        'Practice stack formations until they become second nature',
        'Develop clear communication signals with your partner',
        'Mix up attack patterns to be less predictable',
        'Identify and target opponent weaknesses'
      ],
      drills: [
        'Formation-to-attack drill: Practice transitioning from stacks to offensive shots',
        'Coverage test: Check for and eliminate court coverage gaps',
        'Target practice: Work on attacking specific opponent weaknesses'
      ]
    },
    {
      term: 'third shot options',
      aliases: ['third shot strategy', 'third shot selection', 'serve progression'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH', 'MENT'],
      description: 'The strategic decision-making process for the crucial third shot in a point (after serve and return), choosing between drops, drives, or lobs.',
      commonIssues: [
        'Predictable shot selection',
        'Poor decision-making based on court position',
        'Failing to adjust to opponent positioning',
        'Technical limitations affecting choices'
      ],
      improvementTips: [
        'Develop all three main options: drop, drive, and lob',
        'Analyze opponent positioning before choosing your shot',
        'Practice recognizing ideal scenarios for each option',
        'Mix up your choices to remain unpredictable'
      ],
      drills: [
        'Third shot options drill: Partner calls out which shot to use',
        'Scenario-based practice: Create specific game situations',
        'Decision training: Make shot selection based on opponent positioning'
      ]
    }
  ],
  [TermCategory.RULES]: [
    {
      term: 'kitchen violation',
      aliases: ['foot fault', 'non-volley zone fault', 'NVZ infraction'],
      primaryDimension: 'TECH',
      secondaryDimensions: ['MENT'],
      description: 'Touching the non-volley zone (kitchen) or the line while volleying a ball, or being carried into the kitchen by momentum after volleying.',
      commonIssues: [
        'Momentum carrying players into the kitchen after volleys',
        'Stepping on the line during volleys',
        'Partner obstruction leading to kitchen entry',
        'Lack of awareness of body position relative to the line'
      ],
      improvementTips: [
        'Practice balanced shots that don\'t carry you forward',
        'Position yourself 6-12 inches behind the kitchen line when volleying',
        'Develop kitchen awareness through focused practice',
        'Work on ready position and footwork near the line'
      ],
      drills: [
        'Line awareness drill: Practice volleys progressively closer to the line',
        'Balance control: Hit volleys while maintaining position',
        'Recovery step: Practice taking a small step back after each volley'
      ]
    },
    {
      term: 'double bounce rule',
      aliases: ['two bounce rule', 'serve and return bounce', 'initial sequence'],
      primaryDimension: 'TACT',
      secondaryDimensions: ['TECH'],
      description: 'The rule requiring both the serve and the return of serve to bounce before being played as volleys.',
      commonIssues: [
        'Forgetting the rule during fast gameplay',
        'Instinctively volleying the return of serve',
        'Confusion about when volley play can begin',
        'Positioning too close to net on third shot'
      ],
      improvementTips: [
        'Incorporate verbal reminders during practice',
        'Position yourself appropriately for the first few shots',
        'Practice the serve-return-third shot sequence until automatic',
        'Develop patience during the opening sequence'
      ],
      drills: [
        'Structured serve sequence drill: Focus on correct bounce patterns',
        'Position check: Verify players are in legal positions for first shots',
        'Third shot transition: Practice moving forward after the double bounce'
      ]
    }
  ]
};

/**
 * Flattened lookup dictionary for quick term searching
 */
export const termLookup: Record<string, PickleballTerm> = {};

// Initialize the lookup table
Object.values(pickleballTerminology).forEach(categoryTerms => {
  categoryTerms.forEach(term => {
    // Add the main term
    termLookup[term.term.toLowerCase()] = term;
    
    // Add all aliases
    term.aliases.forEach(alias => {
      termLookup[alias.toLowerCase()] = term;
    });
  });
});

/**
 * Utility function to get a pickleball term by name or alias
 */
export function getPickleballTerm(term: string): PickleballTerm | undefined {
  return termLookup[term.toLowerCase()];
}

/**
 * Detect pickleball terms in a message
 */
export function detectPickleballTerms(message: string): PickleballTerm[] {
  const lowerMessage = message.toLowerCase();
  const foundTerms: PickleballTerm[] = [];
  const foundTermKeys = new Set<string>(); // To avoid duplicates
  
  // Check for exact matches first
  Object.keys(termLookup).forEach(term => {
    if (lowerMessage.includes(term) && !foundTermKeys.has(termLookup[term].term)) {
      foundTerms.push(termLookup[term]);
      foundTermKeys.add(termLookup[term].term);
    }
  });
  
  return foundTerms;
}

/**
 * Get a list of pickleball terms related to a specific dimension
 */
export function getTermsByDimension(dimension: DimensionCode): PickleballTerm[] {
  const dimensionTerms: PickleballTerm[] = [];
  
  Object.values(pickleballTerminology).forEach(categoryTerms => {
    categoryTerms.forEach(term => {
      if (term.primaryDimension === dimension || term.secondaryDimensions.includes(dimension)) {
        dimensionTerms.push(term);
      }
    });
  });
  
  return dimensionTerms;
}

/**
 * Generate coaching advice for a specific pickleball term
 */
export function generateTermAdvice(term: PickleballTerm): string {
  const tips = term.improvementTips.length > 0 
    ? `\n\nTo improve your ${term.term}:\n- ${term.improvementTips.join('\n- ')}`
    : '';
    
  const drills = term.drills.length > 0
    ? `\n\nRecommended drills:\n- ${term.drills.join('\n- ')}`
    : '';
    
  return `${term.description}${tips}${drills}`;
}