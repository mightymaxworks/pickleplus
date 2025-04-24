/**
 * PKL-278651-COACH-0004-TECH-PROC
 * Technical Skills Processor for SAGE
 * 
 * This file provides methods to recognize and respond to technical skills-related
 * terminology and expressions in player conversations, enhancing SAGE's ability
 * to provide targeted coaching on the Technical Skills dimension of CourtIQ.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';

/**
 * Result from analyzing a message for technical skills-related content
 */
export interface TechnicalSkillsAnalysis {
  /** The primary technical skill topic detected */
  primarySkill: TechnicalSkillTopic;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a technical issue */
  hasIssue: boolean;
  /** The specific technical issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking technique advice */
  seekingTechniqueAdvice: boolean;
  /** The relevant experience level for advice (beginner, intermediate, advanced) */
  relevantLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Technical skill topics that can be detected
 */
export enum TechnicalSkillTopic {
  DINK = 'dink',
  SERVE = 'serve',
  RETURN = 'return',
  VOLLEY = 'volley',
  SMASH = 'smash',
  THIRD_SHOT_DROP = 'third_shot_drop',
  GROUNDSTROKE = 'groundstroke',
  LOB = 'lob',
  FOOTWORK = 'footwork',
  GRIP = 'grip',
  POSITIONING = 'positioning',
  DROP_SHOT = 'drop_shot',
  ERNE = 'erne',
  ATP = 'atp',
  DRIVE = 'drive',
  BACKHAND = 'backhand',
  FOREHAND = 'forehand',
  SPIN = 'spin',
  NONE = 'none'
}

/**
 * Keywords associated with each technical skill topic
 */
const technicalSkillKeywords: Record<TechnicalSkillTopic, string[]> = {
  [TechnicalSkillTopic.DINK]: [
    // Core terms
    'dink', 'dinking', 'soft shot', 'touch shot', 'drop shot', 'kitchen shot',
    
    // Technical aspects
    'soft touch', 'wrist control', 'control dink', 'cross-court dink', 'straight dink',
    'aggressive dink', 'defensive dink', 'high dink', 'low dink', 'side dink',
    
    // Issues
    'popping up dinks', 'dinking too high', 'inconsistent dinks', 'hard dink',
    'no control on dinks', 'shanking dinks', 'rushing dinks', 'heavy dinks',
    
    // Contexts
    'dink rally', 'dinking game', 'kitchen play', 'net game', 'soft game',
    'dinking strategy', 'dink placement', 'dink angle'
  ],
  [TechnicalSkillTopic.SERVE]: [
    // Core terms
    'serve', 'serving', 'service', 'first serve', 'second serve', 'server',
    
    // Technical aspects
    'deep serve', 'short serve', 'power serve', 'spin serve', 'lob serve',
    'high serve', 'low serve', 'placement serve', 'topspin serve', 'slice serve',
    
    // Issues
    'double fault', 'service error', 'illegal serve', 'foot fault', 'serving too short',
    'serving out', 'inconsistent serve', 'predictable serve', 'weak serve',
    
    // Contexts
    'service motion', 'service technique', 'serving strategy', 'service game',
    'first server', 'service court', 'service area'
  ],
  [TechnicalSkillTopic.RETURN]: [
    // Core terms
    'return', 'returning', 'return of serve', 'service return', 'receive',
    
    // Technical aspects
    'deep return', 'short return', 'block return', 'slice return', 'chip return',
    'aggressive return', 'defensive return', 'cross-court return', 'down-the-line return',
    
    // Issues
    'weak return', 'returning too high', 'returning into the net', 'popping up returns',
    'inconsistent returns', 'returning long', 'late on the return',
    
    // Contexts
    'return position', 'return strategy', 'return game', 'return placement',
    'returning technique', 'return direction'
  ],
  [TechnicalSkillTopic.VOLLEY]: [
    // Core terms
    'volley', 'volleying', 'punch volley', 'block volley', 'volley technique',
    
    // Technical aspects
    'high volley', 'low volley', 'half volley', 'swinging volley', 'drive volley',
    'touch volley', 'drop volley', 'angle volley', 'cross-court volley', 'straight volley',
    
    // Issues
    'weak volleys', 'inconsistent volleys', 'volley errors', 'volley positioning',
    'late on volleys', 'stiff wrist volley', 'poor volley preparation', 'floating volleys',
    
    // Contexts
    'volley game', 'net play', 'volley technique', 'volley strategy', 'volley drill',
    'volley practice', 'overhead volley', 'defensive volley', 'offensive volley'
  ],
  [TechnicalSkillTopic.SMASH]: [
    // Core terms
    'smash', 'overhead', 'put away', 'slam', 'overhead smash',
    
    // Technical aspects
    'power smash', 'angled smash', 'cross-court smash', 'straight smash',
    'backhand overhead', 'topspin smash', 'defensive overhead',
    
    // Issues
    'missing overheads', 'weak overheads', 'inconsistent overheads', 'late on overheads',
    'smash errors', 'poor overhead technique', 'overhead positioning',
    
    // Contexts
    'overhead technique', 'smash technique', 'overhead practice', 'smash practice',
    'overhead drill', 'smash drill', 'putting away overheads'
  ],
  [TechnicalSkillTopic.THIRD_SHOT_DROP]: [
    // Core terms
    'third shot drop', '3rd shot drop', 'third shot', '3rd shot', 'transition shot',
    
    // Technical aspects
    'soft third', 'deep third', 'short third', 'angled third', 'cross-court third',
    'straight third', 'third shot drive', 'aggressive third', 'defensive third',
    
    // Issues
    'popping up thirds', 'third shot errors', 'inconsistent thirds', 'third shot too high',
    'third shot too low', 'third shot into the net', 'third shot long',
    
    // Contexts
    'third shot strategy', 'third shot technique', 'third shot practice', 'third shot drill',
    'transition game', 'approaching the net', 'third shot drive vs drop'
  ],
  [TechnicalSkillTopic.GROUNDSTROKE]: [
    // Core terms
    'groundstroke', 'ground stroke', 'baseline shot', 'passing shot', 'drive',
    
    // Technical aspects
    'topspin groundstroke', 'slice groundstroke', 'flat groundstroke',
    'cross-court groundstroke', 'down-the-line groundstroke', 'angled groundstroke',
    'deep groundstroke', 'short groundstroke',
    
    // Issues
    'groundstroke errors', 'inconsistent groundstrokes', 'weak groundstrokes',
    'groundstroke technique', 'hitting long', 'hitting into the net',
    
    // Contexts
    'groundstroke practice', 'groundstroke drill', 'baseline game', 'passing shot technique',
    'groundstroke strategy', 'baseline strategy'
  ],
  [TechnicalSkillTopic.LOB]: [
    // Core terms
    'lob', 'lobbing', 'overhead lob', 'defensive lob', 'offensive lob',
    
    // Technical aspects
    'high lob', 'low lob', 'deep lob', 'short lob', 'topspin lob', 'slice lob',
    'angled lob', 'cross-court lob', 'straight lob',
    
    // Issues
    'lob errors', 'inconsistent lobs', 'weak lobs', 'lob technique',
    'lobbing too short', 'lobbing out', 'predictable lobs',
    
    // Contexts
    'lob strategy', 'lob technique', 'lob practice', 'lob drill',
    'defensive strategy', 'offensive strategy', 'reset with lob'
  ],
  [TechnicalSkillTopic.FOOTWORK]: [
    // Core terms
    'footwork', 'foot speed', 'foot movement', 'movement', 'agility', 'quickness',
    
    // Technical aspects
    'split step', 'ready position', 'pivot', 'side shuffle', 'crossover step',
    'small steps', 'quick feet', 'balance', 'weight transfer',
    
    // Issues
    'slow footwork', 'poor balance', 'poor weight transfer', 'crossing feet',
    'late preparation', 'false steps', 'reaching', 'leaning',
    
    // Contexts
    'footwork drill', 'movement practice', 'agility training', 'footwork technique',
    'court coverage', 'lateral movement', 'forward movement', 'backward movement'
  ],
  [TechnicalSkillTopic.GRIP]: [
    // Core terms
    'grip', 'hand position', 'paddle grip', 'handle grip', 'holding the paddle',
    
    // Technical aspects
    'continental grip', 'eastern grip', 'western grip', 'semi-western grip',
    'hammer grip', 'handshake grip', 'firm grip', 'loose grip', 'grip pressure',
    
    // Issues
    'wrong grip', 'grip problems', 'grip too tight', 'grip too loose',
    'inconsistent grip', 'changing grip', 'improper grip', 'uncomfortable grip',
    
    // Contexts
    'grip technique', 'grip change', 'grip for serves', 'grip for volleys',
    'grip for dinks', 'grip for groundstrokes', 'grip transition'
  ],
  [TechnicalSkillTopic.POSITIONING]: [
    // Core terms
    'positioning', 'stance', 'ready position', 'court position', 'body position',
    
    // Technical aspects
    'athletic stance', 'balanced position', 'staggered stance', 'open stance',
    'closed stance', 'neutral stance', 'forward position', 'baseline position',
    
    // Issues
    'poor positioning', 'unbalanced stance', 'reaching', 'leaning', 'standing too straight',
    'knees too stiff', 'weight too far forward', 'weight too far back',
    
    // Contexts
    'positioning drill', 'stance practice', 'ready position', 'court positioning',
    'net positioning', 'baseline positioning', 'transition zone positioning'
  ],
  [TechnicalSkillTopic.DROP_SHOT]: [
    // Core terms
    'drop shot', 'soft shot', 'drop', 'touch shot', 'finesse shot',
    
    // Technical aspects
    'short drop', 'angled drop', 'cross-court drop', 'straight drop',
    'slice drop', 'topspin drop', 'high drop', 'low drop',
    
    // Issues
    'drop shot errors', 'inconsistent drops', 'drop shot too high', 'drop shot too low',
    'drop shot into the net', 'drop shot long', 'telegraphing drop shots',
    
    // Contexts
    'drop shot strategy', 'drop shot technique', 'drop shot practice', 'drop shot drill',
    'when to use drop shots', 'setting up drop shots'
  ],
  [TechnicalSkillTopic.ERNE]: [
    // Core terms
    'erne', 'around the post', 'erne shot', 'jumping erne', 'running erne',
    
    // Technical aspects
    'erne technique', 'erne footwork', 'erne timing', 'erne positioning',
    'erne approach', 'erne follow-through', 'erne execution',
    
    // Issues
    'erne errors', 'inconsistent ernes', 'erne timing issues', 'erne positioning issues',
    'attacking ernes', 'defensive ernes', 'missing ernes',
    
    // Contexts
    'erne strategy', 'when to use ernes', 'setting up ernes', 'erne practice',
    'erne drill', 'around the post technique', 'around the post strategy'
  ],
  [TechnicalSkillTopic.ATP]: [
    // Core terms
    'atp', 'around the post', 'atp shot', 'wide shot', 'sideline shot',
    
    // Technical aspects
    'atp angle', 'atp footwork', 'atp positioning', 'atp execution',
    'atp setup', 'atp timing', 'atp follow-through',
    
    // Issues
    'atp errors', 'inconsistent atps', 'atp timing issues', 'atp positioning issues',
    'hitting net posts', 'missing atp opportunities', 'forcing atps',
    
    // Contexts
    'atp strategy', 'when to attempt atp', 'setting up atps', 'atp practice',
    'atp drill', 'around the post technique', 'around the post strategy'
  ],
  [TechnicalSkillTopic.DRIVE]: [
    // Core terms
    'drive', 'drive shot', 'driving the ball', 'power shot', 'hard shot',
    
    // Technical aspects
    'forehand drive', 'backhand drive', 'cross-court drive', 'down-the-line drive',
    'topspin drive', 'flat drive', 'angled drive', 'deep drive',
    
    // Issues
    'drive errors', 'inconsistent drives', 'drive technique', 'hitting long',
    'hitting into the net', 'weak drives', 'mistimed drives',
    
    // Contexts
    'drive strategy', 'drive technique', 'drive practice', 'drive drill',
    'when to use drives', 'setting up drives', 'third shot drive'
  ],
  [TechnicalSkillTopic.BACKHAND]: [
    // Core terms
    'backhand', 'backhand shot', 'backhand technique', 'backhand side',
    
    // Technical aspects
    'one-handed backhand', 'two-handed backhand', 'backhand grip', 'backhand stance',
    'backhand follow-through', 'backhand preparation', 'backhand swing path',
    
    // Issues
    'weak backhand', 'inconsistent backhand', 'backhand errors', 'backhand technique',
    'late on backhand', 'backhand positioning', 'backhand grip issues',
    
    // Contexts
    'backhand strategy', 'backhand practice', 'backhand drill', 'backhand volley',
    'backhand dink', 'backhand drive', 'backhand groundstroke'
  ],
  [TechnicalSkillTopic.FOREHAND]: [
    // Core terms
    'forehand', 'forehand shot', 'forehand technique', 'forehand side',
    
    // Technical aspects
    'forehand grip', 'forehand stance', 'forehand preparation', 'forehand follow-through',
    'forehand swing path', 'forehand contact point', 'forehand wrist position',
    
    // Issues
    'weak forehand', 'inconsistent forehand', 'forehand errors', 'forehand technique',
    'late on forehand', 'forehand positioning', 'forehand grip issues',
    
    // Contexts
    'forehand strategy', 'forehand practice', 'forehand drill', 'forehand volley',
    'forehand dink', 'forehand drive', 'forehand groundstroke'
  ],
  [TechnicalSkillTopic.SPIN]: [
    // Core terms
    'spin', 'topspin', 'backspin', 'slice', 'underspin', 'sidespin',
    
    // Technical aspects
    'generating spin', 'spin control', 'spin technique', 'spin amount',
    'heavy spin', 'light spin', 'spin direction', 'brush stroke',
    
    // Issues
    'inconsistent spin', 'spin errors', 'spin technique', 'too much spin',
    'not enough spin', 'wrong spin', 'mistimed spin', 'unintentional spin',
    
    // Contexts
    'spin strategy', 'spin practice', 'spin drill', 'spin on serves',
    'spin on volleys', 'spin on dinks', 'spin on groundstrokes'
  ],
  [TechnicalSkillTopic.NONE]: []
};

/**
 * Common technical issues by skill level
 */
const technicalIssuesByLevel: Record<string, string[]> = {
  'beginner': [
    'incorrect grip', 'poor stance', 'inconsistent contact point', 'late preparation',
    'excessive wrist flicking', 'hitting with arm only', 'poor follow-through',
    'watching the paddle instead of the ball', 'standing too upright',
    'incorrect ready position', 'poor court positioning', 'reaching for balls',
    'hitting too hard', 'poor paddle control', 'no weight transfer'
  ],
  'intermediate': [
    'inconsistent shot depth', 'telegraphing shots', 'inadequate spin control',
    'improper footwork during shot execution', 'failing to recover after shots',
    'poor shot selection', 'inconsistent stroke mechanics', 'over-hitting under pressure',
    'rushed technique', 'improper weight transfer', 'unable to generate power efficiently',
    'inability to adjust to different shot heights', 'slow transition between shots'
  ],
  'advanced': [
    'inconsistent paddle angle', 'poor disguise of shots', 'improper timing on advanced shots',
    'failing to adjust to different ball spins', 'inconsistent contact point on specialty shots',
    'insufficient variation in shot pace', 'mechanical breakdown under extreme pressure',
    'incomplete follow-through on power shots', 'over-reliance on dominant shots',
    'insufficient adaptation to court conditions', 'inefficient energy usage in shot production'
  ]
};

/**
 * Terms indicating the player is seeking technical advice
 */
const technicalAdviceTerms: string[] = [
  'technique', 'form', 'mechanics', 'how to hit', 'proper way', 'correct way',
  'right way', 'hitting technique', 'swing path', 'paddle angle', 'paddle face',
  'contact point', 'stroke mechanics', 'motion', 'technical help', 'technical advice',
  'technical issue', 'technical problem', 'technical question', 'execution',
  'form check', 'proper form', 'proper technique', 'fundamentals', 'basics',
  'shot technique', 'shot execution', 'hitting problem', 'stroke problem'
];

/**
 * Terms indicating beginner skill level
 */
const beginnerTerms: string[] = [
  'beginner', 'new player', 'just started', 'novice', 'starting out',
  'learning', 'new to pickleball', 'fundamentals', 'basics', 'newbie',
  '1.0', '1.5', '2.0', '2.5', 'just learning', 'first time', 'inexperienced',
  'getting started', 'starting to play', 'learning the game', 'never played before'
];

/**
 * Terms indicating intermediate skill level
 */
const intermediateTerms: string[] = [
  'intermediate', 'improving', 'getting better', 'developing', 'progressing',
  'somewhat experienced', 'decent player', 'improving player', 'regular player',
  '3.0', '3.5', 'play regularly', 'play weekly', 'know the basics',
  'familiar with the game', 'played for a while', 'few months experience'
];

/**
 * Terms indicating advanced skill level
 */
const advancedTerms: string[] = [
  'advanced', 'experienced', 'competitive', 'tournament', 'high level',
  'expert', 'skilled player', 'serious player', 'ranked player', 'rated player',
  '4.0', '4.5', '5.0', 'professional', 'pro', 'tournament player', 'advanced level',
  'years of experience', 'compete regularly', 'league player', 'club player'
];

/**
 * Analyzes a message for technical skills-related content
 */
export function analyzeTechnicalSkills(message: string): TechnicalSkillsAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Detect the primary technical skill topic
  let primarySkill = TechnicalSkillTopic.NONE;
  let maxKeywords = 0;
  let confidenceScore = 1;
  
  // Check each technical skill topic for matching keywords
  Object.entries(technicalSkillKeywords).forEach(([skill, keywords]) => {
    if (skill === TechnicalSkillTopic.NONE) return;
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });
    
    if (matchCount > maxKeywords) {
      maxKeywords = matchCount;
      primarySkill = skill as TechnicalSkillTopic;
      
      // Calculate confidence score (1-5) based on number of matches
      confidenceScore = Math.min(5, Math.max(1, Math.ceil(matchCount / 2)));
    }
  });
  
  // Detect if the user is seeking technical advice
  const seekingTechniqueAdvice = technicalAdviceTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  ) || lowerMessage.includes('technique') || lowerMessage.includes('form');
  
  // Determine the relevant skill level from the message
  let relevantLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'; // Default
  
  if (beginnerTerms.some(term => lowerMessage.includes(term.toLowerCase()))) {
    relevantLevel = 'beginner';
  } else if (advancedTerms.some(term => lowerMessage.includes(term.toLowerCase()))) {
    relevantLevel = 'advanced';
  }
  
  // Detect specific technical issues
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
    lowerMessage.includes('how to fix') ||
    lowerMessage.includes('not working') ||
    lowerMessage.includes('wrong');
  
  if (hasIssueIndicators && primarySkill !== TechnicalSkillTopic.NONE) {
    hasIssue = true;
    
    // Check for specific issues by skill level
    const levelIssues = technicalIssuesByLevel[relevantLevel];
    
    // See if any specific issues are mentioned in the message
    const matchingIssue = levelIssues.find(issue => 
      lowerMessage.includes(issue.toLowerCase())
    );
    
    // If a specific issue is found, use it; otherwise, select a likely one based on context
    if (matchingIssue) {
      specificIssue = matchingIssue;
    } else {
      // Select a default issue for this skill
      const relevantIssueIndex = Math.floor(Math.random() * levelIssues.length);
      specificIssue = levelIssues[relevantIssueIndex];
    }
  }
  
  return {
    primarySkill,
    confidence: confidenceScore,
    hasIssue,
    specificIssue,
    seekingTechniqueAdvice,
    relevantLevel
  };
}

/**
 * Generate technical improvement tips for a specific skill topic
 * 
 * @param skillTopic The technical skill topic
 * @param level The player's level (beginner, intermediate, advanced)
 * @returns An array of improvement tips
 */
export function generateTechnicalTips(
  skillTopic: TechnicalSkillTopic,
  level: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  if (skillTopic === TechnicalSkillTopic.NONE) {
    return [];
  }
  
  // Tips organized by skill and player level
  const tipsBySkillAndLevel: Partial<Record<TechnicalSkillTopic, Record<string, string[]>>> = {
    [TechnicalSkillTopic.DINK]: {
      'beginner': [
        "Focus on soft contact - think of 'kissing' the ball rather than hitting it",
        "Keep your paddle face slightly open (angled upward) for better control",
        "Use a continental grip for maximum paddle control",
        "Practice dinking from a stable position before adding movement",
        "Keep your wrist firm but not rigid during the dinking motion"
      ],
      'intermediate': [
        "Practice varying dink depths - sometimes shorter, sometimes deeper",
        "Add slight angles to your cross-court dinks to pull opponents wider",
        "Work on your patience - wait for the right opportunity rather than forcing shots",
        "Practice transitioning from dinks to attacking shots when balls pop up",
        "Focus on consistent paddle face control throughout the entire dinking motion"
      ],
      'advanced': [
        "Develop deceptive dinking by maintaining the same preparation for different shots",
        "Practice disguising your dink direction until the last moment",
        "Master subtle variations in pace to throw off opponent's timing",
        "Work on 'ghosting' dinks that appear to go one direction but actually go another",
        "Develop dink patterns that systematically move opponents out of position"
      ]
    },
    [TechnicalSkillTopic.SERVE]: {
      'beginner': [
        "Focus on consistency first - aim for 90% of serves in the court",
        "Use a simple pendulum motion to create reliability",
        "Keep your toss consistent in height and position",
        "Aim for the deep corners of the service box",
        "Maintain balanced body position throughout the serve motion"
      ],
      'intermediate': [
        "Develop different serve locations - wide, body, and down the middle",
        "Practice adding light topspin or slice to your serves",
        "Work on disguising your serve direction with the same motion",
        "Increase the pace of your serve while maintaining accuracy",
        "Develop a consistent pre-serve routine to improve focus"
      ],
      'advanced': [
        "Master the 'serve and follow' strategy for aggressive play",
        "Develop multiple serve variations with the same toss and preparation",
        "Practice serves with targeted spin that creates difficult returns",
        "Adjust your serves based on wind conditions and court surface",
        "Use strategic serving patterns that exploit specific opponent weaknesses"
      ]
    },
    [TechnicalSkillTopic.RETURN]: {
      'beginner': [
        "Focus on making solid contact in the center of your paddle",
        "Keep your return simple - aim for depth rather than angles initially",
        "Get your paddle back early in preparation for the return",
        "Maintain a stable ready position as you wait for the serve",
        "Focus on hitting returns crosscourt for higher percentage success"
      ],
      'intermediate': [
        "Practice block returns against harder serves",
        "Work on directional control - down the line vs. crosscourt",
        "Develop the ability to return deep to push opponents back",
        "Practice identifying and adapting to different serve spins",
        "Work on maintaining balanced footwork during the return"
      ],
      'advanced': [
        "Practice aggressive returns that can immediately put pressure on opponents",
        "Develop multiple return variations based on serve type and location",
        "Master the short angle return that prevents opponents from advancing",
        "Work on disguising your return direction until the last moment",
        "Develop tactical return patterns that target specific opponent weaknesses"
      ]
    },
    [TechnicalSkillTopic.VOLLEY]: {
      'beginner': [
        "Keep your paddle up and out in front of your body",
        "Use a continental grip for better control",
        "Focus on blocking the ball rather than swinging",
        "Keep volleys simple - aim for the middle initially",
        "Practice proper ready position with paddle up between shots"
      ],
      'intermediate': [
        "Develop directional control with your volleys",
        "Practice handling volleys at different heights",
        "Work on reflexive volleys to improve reaction time",
        "Practice transitioning between high and low volleys",
        "Focus on volleys that create offensive opportunities"
      ],
      'advanced': [
        "Master deceptive volleys that disguise direction and pace",
        "Develop touch volleys that die quickly after crossing the net",
        "Practice changing the pace of volleys to disrupt opponent rhythm",
        "Work on volleying while moving laterally for better court coverage",
        "Develop strategic volley patterns that systematically break down opponents"
      ]
    },
    [TechnicalSkillTopic.SMASH]: {
      'beginner': [
        "Focus on proper overhead grip and stance",
        "Keep your eye on the ball throughout the entire motion",
        "Position yourself under the ball before hitting",
        "Start with 70% power for better control",
        "Follow through toward your target"
      ],
      'intermediate': [
        "Work on adjusting to overheads at different heights",
        "Practice directional control - down the line vs. crosscourt",
        "Develop the ability to hit overheads while moving",
        "Focus on quick footwork to get in position",
        "Practice disguising your overhead direction"
      ],
      'advanced': [
        "Master overheads from difficult body positions",
        "Develop multiple overhead variations - pace, spin, and direction",
        "Practice hitting overheads with targeted placement to exploit court openings",
        "Work on overheads that finish points immediately",
        "Develop the ability to hit effective overheads even when slightly out of position"
      ]
    },
    [TechnicalSkillTopic.THIRD_SHOT_DROP]: {
      'beginner': [
        "Start with proper continental grip for better control",
        "Focus on soft contact and follow through toward target",
        "Aim for consistency over perfection initially",
        "Practice at slower speeds before adding pace",
        "Keep your paddle face slightly open during contact"
      ],
      'intermediate': [
        "Work on added directional control to specific court areas",
        "Practice third shot drops from different court positions",
        "Develop the ability to adjust to different ball heights",
        "Focus on disguising whether you'll hit a drop or drive",
        "Practice recovery after executing the third shot drop"
      ],
      'advanced': [
        "Master third shot drops under pressure situations",
        "Develop multiple spin variations to create difficult returns",
        "Practice third shot drops with pinpoint accuracy to target weaker opponents",
        "Work on deceptive third shot drops that look like drives until the last moment",
        "Develop strategic patterns combining third shot drops and drives"
      ]
    },
    [TechnicalSkillTopic.GROUNDSTROKE]: {
      'beginner': [
        "Focus on consistent contact in the sweet spot of your paddle",
        "Keep a stable wrist through contact",
        "Use a simple compact swing for more control",
        "Practice proper weight transfer from back foot to front",
        "Focus on depth rather than power initially"
      ],
      'intermediate': [
        "Develop directional control with both crosscourt and down-the-line shots",
        "Work on adding appropriate spin for different situations",
        "Practice hitting groundstrokes on the rise for more aggressive play",
        "Focus on consistency while gradually adding more pace",
        "Develop the ability to hit effective groundstrokes while on the move"
      ],
      'advanced': [
        "Master changing pace and spin to disrupt opponent rhythm",
        "Develop groundstrokes that can effectively pass opponents at the net",
        "Practice hitting with heavy topspin for better margin over the net",
        "Work on disguising groundstroke direction until the last moment",
        "Develop patterns that use groundstrokes to systematically move opponents"
      ]
    },
    [TechnicalSkillTopic.LOB]: {
      'beginner': [
        "Focus on proper paddle angle - open face for more height",
        "Use a lifting motion rather than a hitting motion",
        "Aim for height first, then depth",
        "Practice consistency before adding difficulty",
        "Keep your wrist firm but not rigid during the lob motion"
      ],
      'intermediate': [
        "Work on varying lob depths and heights",
        "Practice defensive lobs when out of position",
        "Develop offensive lobs that can catch opponents off guard",
        "Focus on disguising your lob until the last moment",
        "Practice lobs from different court positions and situations"
      ],
      'advanced': [
        "Master lobs under pressure when opponents are pressing",
        "Develop multiple lob variations with different spins",
        "Practice precise placement of lobs to specific court areas",
        "Work on deceptive lobs that look like other shots until the last moment",
        "Develop strategic lob patterns that systematically pull opponents out of position"
      ]
    },
    [TechnicalSkillTopic.FOOTWORK]: {
      'beginner': [
        "Practice the ready position with knees slightly bent",
        "Focus on small adjustment steps rather than large movements",
        "Work on the split-step timing as opponents hit",
        "Practice proper recovery to the center after each shot",
        "Develop proper weight distribution for better balance"
      ],
      'intermediate': [
        "Practice lateral movement with crossover steps",
        "Work on quick direction changes without losing balance",
        "Develop efficient footwork patterns for specific court positions",
        "Focus on maintaining proper spacing from the ball",
        "Practice moving forward and backward with equal efficiency"
      ],
      'advanced': [
        "Master explosive first-step movements in all directions",
        "Develop recovery patterns that anticipate the next likely shot",
        "Practice footwork efficiency to minimize unnecessary movement",
        "Work on adjusting footwork based on shot selection",
        "Develop specialized footwork for different play situations"
      ]
    },
    [TechnicalSkillTopic.GRIP]: {
      'beginner': [
        "Learn the continental grip for versatility across different shots",
        "Hold the paddle with a relaxed but firm grip",
        "Practice proper finger placement for better control",
        "Use a grip that allows free wrist movement when needed",
        "Focus on consistent grip pressure - not too tight, not too loose"
      ],
      'intermediate': [
        "Practice quick grip adjustments between different shots",
        "Work on maintaining proper grip during fast exchanges",
        "Develop awareness of how grip affects shot outcome",
        "Focus on grip pressure variations for different shots",
        "Practice recovery to neutral grip position between shots"
      ],
      'advanced': [
        "Master subtle grip adjustments for specialized shots",
        "Develop the ability to hit multiple shots with the same grip",
        "Practice grip adjustments without looking at the paddle",
        "Work on maintaining proper grip even when stretched or off-balance",
        "Analyze and optimize your grip for your personal playing style"
      ]
    },
    [TechnicalSkillTopic.POSITIONING]: {
      'beginner': [
        "Learn the basic ready position with paddle up and knees slightly bent",
        "Practice proper court positioning based on where the ball is",
        "Focus on recovery to center court after each shot",
        "Work on maintaining proper distance from the net",
        "Practice proper spacing from your partner in doubles"
      ],
      'intermediate': [
        "Develop anticipatory positioning based on likely opponent shots",
        "Work on court positioning for different play situations",
        "Practice adjusting position based on partner movement in doubles",
        "Focus on offensive vs. defensive positioning",
        "Learn to recognize and exploit court positioning imbalances"
      ],
      'advanced': [
        "Master dynamic positioning that constantly adjusts to changing situations",
        "Develop specialized positioning strategies for specific opponents",
        "Practice deceptive positioning that disguises your intended coverage",
        "Work on optimizing court coverage with minimal movement",
        "Analyze and refine positioning based on statistical patterns of play"
      ]
    },
    [TechnicalSkillTopic.DROP_SHOT]: {
      'beginner': [
        "Focus on soft contact with the ball",
        "Keep a slightly open paddle face at contact",
        "Use a continental grip for better control",
        "Practice proper weight transfer during the shot",
        "Start with shorter distances before attempting full-court drops"
      ],
      'intermediate': [
        "Work on disguising your drop shot preparation",
        "Practice drop shots from different court positions",
        "Develop drop shots with different spins",
        "Focus on drop shot depth control",
        "Practice recovery after executing drop shots"
      ],
      'advanced': [
        "Master deceptive drop shots that mimic other shots until the last moment",
        "Develop drop shots with precise placement to specific court areas",
        "Practice drop shots under pressure situations",
        "Work on varying the pace and spin of drop shots to confuse opponents",
        "Develop strategic patterns that set up drop shot opportunities"
      ]
    },
    [TechnicalSkillTopic.ERNE]: {
      'beginner': [
        "Start with proper footwork patterns for the erne approach",
        "Practice the timing of when to start the erne movement",
        "Focus on balance throughout the erne execution",
        "Work on paddle control while moving into position",
        "Practice basic erne shots from a stationary position first"
      ],
      'intermediate': [
        "Develop proper timing for ernies based on opponent shots",
        "Practice ernies from both the forehand and backhand sides",
        "Work on disguising your intention to attempt an erne",
        "Focus on recovery after completing an erne shot",
        "Practice ernies in different game situations"
      ],
      'advanced': [
        "Master offensive ernies that put immediate pressure on opponents",
        "Develop multiple erne variations with different approach patterns",
        "Practice ernies with precise shot placement to specific court areas",
        "Work on deceptive ernies that surprise opponents",
        "Develop strategic patterns that create erne opportunities"
      ]
    },
    [TechnicalSkillTopic.ATP]: {
      'beginner': [
        "Understand the proper court positioning for ATP opportunities",
        "Practice recognizing when an ATP shot is possible",
        "Focus on proper paddle angle and contact for around-the-post shots",
        "Work on simple footwork patterns to get in position",
        "Practice ATP shots from both forehand and backhand sides"
      ],
      'intermediate': [
        "Develop the ability to hit ATPs while on the move",
        "Practice varying the pace and angle of ATP shots",
        "Work on creating ATP opportunities with strategic shot placement",
        "Focus on proper recovery after attempting an ATP",
        "Practice ATPs in simulated game situations"
      ],
      'advanced': [
        "Master offensive ATPs that create immediate pressure",
        "Develop precise ATP placement to specific court areas",
        "Practice ATPs with different spins for varied effects",
        "Work on deceptive setups that create ATP opportunities",
        "Develop strategic patterns that force opponents to leave ATP angles open"
      ]
    },
    [TechnicalSkillTopic.DRIVE]: {
      'beginner': [
        "Focus on solid contact in the center of your paddle",
        "Keep a firm wrist during contact",
        "Practice proper weight transfer for added power",
        "Work on directional control before adding more pace",
        "Focus on a smooth follow-through toward your target"
      ],
      'intermediate': [
        "Develop drives with varied pace and spin",
        "Practice hitting drives from different court positions",
        "Work on drive accuracy to specific court targets",
        "Focus on disguising your intention to hit a drive",
        "Practice transitioning between drives and softer shots"
      ],
      'advanced': [
        "Master drives that create immediate pressure or winners",
        "Develop multiple drive variations with different spins and paces",
        "Practice drives that exploit specific court openings",
        "Work on deceptive drives that look like softer shots until the last moment",
        "Develop strategic patterns that set up drive opportunities"
      ]
    },
    [TechnicalSkillTopic.BACKHAND]: {
      'beginner': [
        "Establish proper grip for backhand shots",
        "Focus on turning your shoulders for better positioning",
        "Practice proper weight transfer during the backhand",
        "Keep your wrist firm during contact",
        "Work on a compact swing for better control"
      ],
      'intermediate': [
        "Develop backhand directional control to different court areas",
        "Practice backhand shots with varied pace and spin",
        "Work on handling high and low backhands effectively",
        "Focus on disguising your backhand direction",
        "Practice transitioning between backhand drives and softer shots"
      ],
      'advanced': [
        "Master offensive backhands that create immediate pressure",
        "Develop multiple backhand variations - slice, topspin, flat",
        "Practice deceptive backhands that disguise direction and pace",
        "Work on hitting effective backhands even when slightly out of position",
        "Develop strategic patterns that exploit backhand strengths"
      ]
    },
    [TechnicalSkillTopic.FOREHAND]: {
      'beginner': [
        "Establish proper grip for forehand shots",
        "Focus on turning your shoulders for better positioning",
        "Practice proper weight transfer during the forehand",
        "Keep your wrist firm but not rigid during contact",
        "Work on a compact swing for better control"
      ],
      'intermediate': [
        "Develop forehand directional control to different court areas",
        "Practice forehand shots with varied pace and spin",
        "Work on handling high and low forehands effectively",
        "Focus on disguising your forehand direction",
        "Practice transitioning between forehand drives and softer shots"
      ],
      'advanced': [
        "Master offensive forehands that create immediate pressure",
        "Develop multiple forehand variations - topspin, flat, slice",
        "Practice deceptive forehands that disguise direction and pace",
        "Work on hitting effective forehands even when slightly out of position",
        "Develop strategic patterns that exploit forehand strengths"
      ]
    },
    [TechnicalSkillTopic.SPIN]: {
      'beginner': [
        "Learn the basic paddle angles for topspin and backspin",
        "Practice brush contact rather than flat hitting for spin generation",
        "Focus on consistent contact point for reliable spin",
        "Start with subtle spin before attempting heavy spin",
        "Practice how different swings create different spin effects"
      ],
      'intermediate': [
        "Develop the ability to generate spin while maintaining control",
        "Practice varying the amount of spin on different shots",
        "Work on disguising your spin until contact",
        "Focus on using spin to control ball trajectory and bounce",
        "Practice transitioning between different spin types"
      ],
      'advanced': [
        "Master multiple spin variations for each shot type",
        "Develop precise control of spin direction and intensity",
        "Practice using spin strategically to create difficult returns",
        "Work on deceptive spin that looks different than what's actually applied",
        "Develop specialized spin shots for specific game situations"
      ]
    }
  };
  
  // Return appropriate tips based on skill topic and player level
  return tipsBySkillAndLevel[skillTopic][level] || [];
}

/**
 * Generates a response focused on technical skills
 */
export function generateTechnicalResponse(
  analysis: TechnicalSkillsAnalysis,
  userName: string
): string {
  // If no clear technical topic was detected, return empty string
  if (analysis.primarySkill === TechnicalSkillTopic.NONE || analysis.confidence < 2) {
    return '';
  }
  
  const { primarySkill, hasIssue, specificIssue, seekingTechniqueAdvice, relevantLevel } = analysis;
  
  // Get appropriate technical tips
  const tips = generateTechnicalTips(primarySkill, relevantLevel);
  
  // Format the skill name for display
  const skillName = primarySkill.replace(/_/g, ' ').toLowerCase();
  
  // Generate different response types based on context
  if (seekingTechniqueAdvice && hasIssue) {
    // User is seeking advice for a specific technical issue
    return `I understand you're working on your ${skillName} technique, ${userName}. 
    
The issue with ${specificIssue} is common for ${relevantLevel} players. Here are some specific tips to address this:

- ${tips.slice(0, 3).join('\n- ')}

Would you like me to suggest some specific drills to practice this technique? Or would you prefer video analysis of your ${skillName} technique at your next session?`;
  } 
  else if (seekingTechniqueAdvice) {
    // User is seeking general technique advice
    return `Improving your ${skillName} technique is a great focus area, ${userName}. 
    
Here are some technical tips appropriate for your ${relevantLevel} level:

- ${tips.slice(0, 3).join('\n- ')}

Working on these technical elements will help you develop a more consistent and effective ${skillName}. Would you like more specific advice or some drills to practice this skill?`;
  }
  else if (hasIssue) {
    // User has a specific technical issue but isn't explicitly asking for technique advice
    return `I notice you're mentioning some challenges with your ${skillName}, specifically with ${specificIssue}. 
    
This is a common technical issue that many ${relevantLevel} players face. Here are some tips to help:

- ${tips.slice(0, 3).join('\n- ')}

Is this specific issue something you'd like to focus on in your training?`;
  }
  else {
    // General response about this technical skill
    return `The ${skillName} is an important technical element in pickleball. As a ${relevantLevel} player, here are some key technical points to focus on:

- ${tips.slice(0, 3).join('\n- ')}

Would you like more specific technical guidance on this skill, or perhaps some drills to incorporate into your practice?`;
  }
}