/**
 * PKL-278651-COACH-0004-CONS-PROC
 * Consistency Processor for SAGE
 * 
 * This file provides methods to recognize and respond to consistency-related
 * terminology and expressions in player conversations, enhancing SAGE's ability
 * to provide targeted coaching on the Consistency dimension of CourtIQ.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';

/**
 * Result from analyzing a message for consistency-related content
 */
export interface ConsistencyAnalysis {
  /** The primary consistency aspect detected */
  primaryAspect: ConsistencyAspect;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a consistency issue */
  hasIssue: boolean;
  /** The specific consistency issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking consistency advice */
  seekingConsistencyAdvice: boolean;
  /** The relevant shot or skill area */
  relevantSkillArea: 'dinking' | 'drives' | 'serves' | 'returns' | 'volleys' | 'overheads' | 'general';
}

/**
 * Consistency aspects that can be detected
 */
export enum ConsistencyAspect {
  SHOT_RELIABILITY = 'shot_reliability',
  ERROR_REDUCTION = 'error_reduction',
  UNFORCED_ERRORS = 'unforced_errors',
  REPETITION_QUALITY = 'repetition_quality',
  PATTERN_CONSISTENCY = 'pattern_consistency',
  PERFORMANCE_STABILITY = 'performance_stability',
  PRACTICE_CONSISTENCY = 'practice_consistency',
  PRESSURE_PERFORMANCE = 'pressure_performance',
  TECHNICAL_CONSISTENCY = 'technical_consistency',
  STRATEGIC_CONSISTENCY = 'strategic_consistency',
  SHOT_DEPTH_CONTROL = 'shot_depth_control',
  SHOT_DIRECTION_CONTROL = 'shot_direction_control',
  SHOT_PACE_CONTROL = 'shot_pace_control',
  CONTACT_POINT = 'contact_point',
  PREPARATION = 'preparation',
  FOLLOW_THROUGH = 'follow_through',
  NONE = 'none'
}

/**
 * Keywords associated with each consistency aspect
 */
const consistencyAspectKeywords: Record<ConsistencyAspect, string[]> = {
  [ConsistencyAspect.SHOT_RELIABILITY]: [
    // Core concepts
    'reliability', 'reliable', 'consistent shots', 'shot consistency', 'dependable shots',
    'consistent stroke', 'reliable technique', 'shot reliability', 'repeatable shots',
    
    // Performance indicators
    'making shots', 'high percentage', 'low error rate', 'consistently make', 
    'reliable results', 'dependable results', 'consistency rate', 'success percentage',
    
    // Problem indicators
    'unreliable shots', 'inconsistent shots', 'unreliable stroke', 'hit and miss',
    'sometimes goes in', 'sometimes misses', 'unpredictable results', 'variable success',
    
    // Related terms
    'shot confidence', 'shot trust', 'reliable execution', 'execution consistency',
    'technique reliability', 'mechanical consistency', 'stroke dependability'
  ],
  [ConsistencyAspect.ERROR_REDUCTION]: [
    // Core concepts
    'error reduction', 'minimize errors', 'reduce mistakes', 'fewer errors',
    'lower error count', 'error prevention', 'mistake reduction', 'eliminating errors',
    
    // Performance indicators
    'clean play', 'error-free', 'mistake-free', 'minimal errors', 'few mistakes',
    'reduced error rate', 'clean execution', 'precision play', 'accurate play',
    
    // Problem indicators
    'too many errors', 'high error rate', 'frequent mistakes', 'making mistakes',
    'error prone', 'mistake prone', 'excessive errors', 'avoidable errors',
    
    // Related terms
    'clean technique', 'precision focus', 'accuracy training', 'error tracking',
    'mistake analysis', 'error pattern', 'mistake pattern', 'error diagnosis'
  ],
  [ConsistencyAspect.UNFORCED_ERRORS]: [
    // Core concepts
    'unforced errors', 'unforced mistakes', 'free points', 'giving away points',
    'unnecessary errors', 'avoidable mistakes', 'self-inflicted errors', 'easy mistakes',
    
    // Performance indicators
    'clean play', 'safe play', 'high-percentage shots', 'playing within ability',
    'smart shot selection', 'strategic consistency', 'tactical discipline',
    
    // Problem indicators
    'beating myself', 'giving away games', 'donating points', 'shooting myself in the foot',
    'forcing shots', 'going for too much', 'low-percentage shots', 'risky shots',
    
    // Related terms
    'decision making', 'shot selection', 'risk management', 'strategic discipline',
    'playing smart', 'percentage pickleball', 'high-percentage play', 'controlled aggression'
  ],
  [ConsistencyAspect.REPETITION_QUALITY]: [
    // Core concepts
    'repetition quality', 'practice quality', 'consistent practice', 'quality repetitions',
    'deliberate practice', 'practice effectiveness', 'meaningful practice', 'focused practice',
    
    // Performance indicators
    'quality over quantity', 'effective practice', 'deliberate training', 'purposeful practice',
    'mindful practice', 'focused repetitions', 'intentional practice', 'conscious practice',
    
    // Problem indicators
    'mindless repetition', 'going through motions', 'unfocused practice', 'inconsistent practice',
    'variable practice quality', 'practice without purpose', 'practice without focus',
    
    // Related terms
    'practice mindset', 'training quality', 'deliberate repetition', 'conscious training',
    'focused development', 'skill acquisition', 'motor learning', 'skill development'
  ],
  [ConsistencyAspect.PATTERN_CONSISTENCY]: [
    // Core concepts
    'pattern consistency', 'movement patterns', 'consistent patterns', 'reliable patterns',
    'technique patterns', 'mechanical patterns', 'stroke patterns', 'repeatable patterns',
    
    // Performance indicators
    'consistent technique', 'reliable mechanics', 'dependable form', 'stable patterns',
    'repeatable form', 'mechanical consistency', 'technical reliability',
    
    // Problem indicators
    'variable technique', 'changing patterns', 'inconsistent mechanics', 'form breakdown',
    'technical variance', 'mechanical inconsistency', 'irregular patterns',
    
    // Related terms
    'technical foundation', 'fundamental patterns', 'movement consistency', 'technical stability',
    'form consistency', 'mechanical foundation', 'repeatable technique', 'pattern recognition'
  ],
  [ConsistencyAspect.PERFORMANCE_STABILITY]: [
    // Core concepts
    'performance stability', 'stable performance', 'consistent performance', 'reliable performance',
    'performance consistency', 'steady performance', 'dependable play', 'consistent play',
    
    // Performance indicators
    'play at my level', 'consistent standard', 'reliable level', 'stable level',
    'predictable performance', 'expected level', 'normal standard', 'usual performance',
    
    // Problem indicators
    'playing up and down', 'rollercoaster performance', 'inconsistent play', 'variable performance',
    'unpredictable play', 'performance swings', 'play below level', 'performance drops',
    
    // Related terms
    'performance variance', 'play stability', 'level consistency', 'standard maintenance',
    'performance floor', 'performance ceiling', 'baseline performance', 'performance range'
  ],
  [ConsistencyAspect.PRACTICE_CONSISTENCY]: [
    // Core concepts
    'practice consistency', 'consistent practice', 'regular practice', 'practice routine',
    'training consistency', 'training routine', 'practice habits', 'training habits',
    
    // Performance indicators
    'practice schedule', 'regular sessions', 'consistent training', 'reliable routine',
    'practice discipline', 'training discipline', 'regular schedule', 'training structure',
    
    // Problem indicators
    'irregular practice', 'sporadic practice', 'inconsistent training', 'variable practice',
    'practice gaps', 'training gaps', 'missing sessions', 'skipping practice',
    
    // Related terms
    'training frequency', 'practice periodization', 'session planning', 'practice planning',
    'training structure', 'practice framework', 'systematic training', 'methodical practice'
  ],
  [ConsistencyAspect.PRESSURE_PERFORMANCE]: [
    // Core concepts
    'pressure performance', 'clutch performance', 'playing under pressure', 'pressure situations',
    'high-stakes performance', 'performance when it counts', 'critical point performance',
    
    // Performance indicators
    'handle pressure', 'clutch player', 'rise to occasion', 'thrive under pressure',
    'mental toughness', 'pressure resistance', 'composure under pressure', 'grace under fire',
    
    // Problem indicators
    'crumble under pressure', 'choke under pressure', 'pressure mistakes', 'tight when it matters',
    'nervous on big points', 'fold under pressure', 'can\'t handle pressure', 'mental collapse',
    
    // Related terms
    'competitive stress', 'performance anxiety', 'pressure situations', 'critical moments',
    'clutch situations', 'pressure points', 'important points', 'decisive moments'
  ],
  [ConsistencyAspect.TECHNICAL_CONSISTENCY]: [
    // Core concepts
    'technical consistency', 'technique consistency', 'consistent technique', 'reliable technique',
    'mechanical consistency', 'consistent mechanics', 'reliable mechanics', 'consistent form',
    
    // Performance indicators
    'solid technique', 'reliable form', 'consistent stroke', 'dependable mechanics',
    'stable technique', 'repeatable technique', 'technical stability', 'mechanical stability',
    
    // Problem indicators
    'technical breakdowns', 'form breakdowns', 'mechanical flaws', 'technique issues',
    'inconsistent stroke', 'form issues', 'mechanical issues', 'technique problems',
    
    // Related terms
    'stroke mechanics', 'stroke production', 'technical foundation', 'fundamental technique',
    'mechanical efficiency', 'technical efficiency', 'biomechanical consistency', 'kinetic chain'
  ],
  [ConsistencyAspect.STRATEGIC_CONSISTENCY]: [
    // Core concepts
    'strategic consistency', 'tactical consistency', 'consistent strategy', 'reliable tactics',
    'game plan consistency', 'strategic discipline', 'tactical discipline', 'plan execution',
    
    // Performance indicators
    'stick to plan', 'tactical patience', 'strategic patience', 'game plan discipline',
    'strategic composure', 'tactical composure', 'strategic focus', 'tactical focus',
    
    // Problem indicators
    'strategic inconsistency', 'tactical wandering', 'losing strategic focus', 'plan deviation',
    'tactical breakdown', 'strategic breakdown', 'abandoning plan', 'tactical impatience',
    
    // Related terms
    'game management', 'match management', 'tactical framework', 'strategic framework',
    'game plan adherence', 'strategic adaptability', 'tactical flexibility', 'situational awareness'
  ],
  [ConsistencyAspect.SHOT_DEPTH_CONTROL]: [
    // Core concepts
    'depth control', 'shot depth', 'consistent depth', 'reliable depth',
    'depth consistency', 'depth precision', 'controlled depth', 'depth accuracy',
    
    // Performance indicators
    'good depth', 'appropriate depth', 'controlled length', 'hitting deep',
    'keeping shots deep', 'consistent length', 'reliable shot length', 'depth target',
    
    // Problem indicators
    'inconsistent depth', 'depth problems', 'length issues', 'too short',
    'not deep enough', 'variable depth', 'depth control issues', 'inconsistent length',
    
    // Related terms
    'court geometry', 'length positioning', 'tactical depth', 'strategic depth',
    'depth percentage', 'length percentage', 'court depth', 'depth zones'
  ],
  [ConsistencyAspect.SHOT_DIRECTION_CONTROL]: [
    // Core concepts
    'direction control', 'shot direction', 'directional accuracy', 'directional consistency',
    'shot placement', 'placement consistency', 'aiming consistency', 'targeting consistency',
    
    // Performance indicators
    'accurate direction', 'precise placement', 'consistent placement', 'reliable direction',
    'hitting targets', 'directional precision', 'placement precision', 'directional control',
    
    // Problem indicators
    'directional inconsistency', 'placement issues', 'direction problems', 'inconsistent placement',
    'missing targets', 'placement errors', 'directional errors', 'aiming problems',
    
    // Related terms
    'court vision', 'spatial awareness', 'target practice', 'placement drills',
    'aiming exercises', 'directional practice', 'placement targets', 'directional targets'
  ],
  [ConsistencyAspect.SHOT_PACE_CONTROL]: [
    // Core concepts
    'pace control', 'speed control', 'power control', 'velocity control',
    'shot pace', 'ball speed', 'consistent pace', 'reliable power',
    
    // Performance indicators
    'appropriate power', 'controlled pace', 'consistent power', 'reliable pace',
    'manageable speed', 'measured power', 'calibrated pace', 'purposeful pace',
    
    // Problem indicators
    'inconsistent pace', 'power control issues', 'pace variability', 'unreliable power',
    'pace problems', 'speed control issues', 'power fluctuations', 'erratic pace',
    
    // Related terms
    'power calibration', 'pace modulation', 'velocity management', 'speed modulation',
    'force control', 'energy transfer', 'power application', 'impact force'
  ],
  [ConsistencyAspect.CONTACT_POINT]: [
    // Core concepts
    'contact point', 'ball contact', 'point of impact', 'strike point',
    'hitting point', 'contact zone', 'impact location', 'ball strike',
    
    // Performance indicators
    'consistent contact', 'clean contact', 'pure contact', 'solid contact',
    'center contact', 'sweet spot', 'reliable contact', 'consistent impact',
    
    // Problem indicators
    'inconsistent contact', 'off-center hits', 'mishits', 'contact issues',
    'variable contact point', 'contact problems', 'impact inconsistency', 'shanking',
    
    // Related terms
    'paddle control', 'strike consistency', 'impact consistency', 'contact timing',
    'impact quality', 'contact quality', 'paddle face control', 'contact precision'
  ],
  [ConsistencyAspect.PREPARATION]: [
    // Core concepts
    'preparation', 'ready position', 'pre-shot routine', 'setup', 'paddle preparation',
    'backswing', 'take back', 'preparation phase', 'setup position',
    
    // Performance indicators
    'early preparation', 'consistent setup', 'reliable preparation', 'good ready position',
    'proper paddle position', 'consistent backswing', 'appropriate take back',
    
    // Problem indicators
    'late preparation', 'inconsistent setup', 'preparation issues', 'variable backswing',
    'rushed preparation', 'setup problems', 'backswing inconsistency', 'take back issues',
    
    // Related terms
    'preparation timing', 'setup routine', 'pre-shot positioning', 'paddle readiness',
    'loading phase', 'coiling phase', 'preparation sequence', 'setup mechanics'
  ],
  [ConsistencyAspect.FOLLOW_THROUGH]: [
    // Core concepts
    'follow through', 'follow-through', 'finish', 'completion', 'swing finish',
    'stroke finish', 'paddle finish', 'release phase', 'extension',
    
    // Performance indicators
    'complete follow through', 'proper finish', 'full extension', 'consistent finish',
    'proper follow through', 'adequate follow through', 'appropriate finish',
    
    // Problem indicators
    'incomplete follow through', 'abbreviated finish', 'short follow through', 'inconsistent finish',
    'follow through issues', 'finish problems', 'cutting off follow through', 'stopped follow through',
    
    // Related terms
    'finish position', 'swing completion', 'follow through direction', 'extension quality',
    'finish quality', 'follow through consistency', 'release quality', 'extension consistency'
  ],
  [ConsistencyAspect.NONE]: []
};

/**
 * Terms associated with specific shot or skill areas
 */
const skillAreaKeywords: Record<string, string[]> = {
  'dinking': [
    'dink', 'dinking', 'soft game', 'touch game', 'kitchen game', 'net game',
    'drop shot', 'soft shot', 'touch shot', 'drop', 'cross-court dink', 'straight dink',
    'third shot drop', '3rd shot drop', 'reset', 'soft reset', 'control game'
  ],
  'drives': [
    'drive', 'driving', 'power game', 'hard shot', 'passing shot', 'groundstroke',
    'forehand drive', 'backhand drive', 'baseline game', 'power shot', 'hard hit',
    'bangers', 'third shot drive', '3rd shot drive', 'deep game', 'topspin drive'
  ],
  'serves': [
    'serve', 'serving', 'service', 'service game', 'first serve', 'second serve',
    'deep serve', 'short serve', 'spin serve', 'power serve', 'lob serve',
    'serve placement', 'service consistency', 'serving accuracy', 'serving strategy'
  ],
  'returns': [
    'return', 'returning', 'return of serve', 'service return', 'return game',
    'deep return', 'short return', 'block return', 'chip return', 'slice return',
    'aggressive return', 'defensive return', 'return consistency', 'return accuracy'
  ],
  'volleys': [
    'volley', 'volleying', 'net play', 'volley game', 'punch volley', 'block volley',
    'forehand volley', 'backhand volley', 'high volley', 'low volley', 'half-volley',
    'swinging volley', 'volley consistency', 'volley accuracy', 'net touch'
  ],
  'overheads': [
    'overhead', 'smash', 'put-away', 'overhead smash', 'slam', 'overhead shot',
    'power overhead', 'defensive overhead', 'backhand overhead', 'overhead consistency',
    'smash accuracy', 'overhead placement', 'overhead finishing', 'slam consistency'
  ]
};

/**
 * Terms indicating the player is seeking consistency advice
 */
const consistencyAdviceTerms: string[] = [
  'consistency', 'reliable', 'dependable', 'steady', 'stable', 'repeatable',
  'more consistent', 'improve consistency', 'enhance reliability', 'reduce errors',
  'fewer mistakes', 'error reduction', 'more dependable', 'more reliable',
  'consistent technique', 'reliable performance', 'repeatable results',
  'consistency advice', 'consistency tips', 'reliability suggestions',
  'consistency drills', 'consistency exercises', 'reliability practice',
  'develop consistency', 'build reliability', 'error prevention'
];

/**
 * Common consistency issues by aspect
 */
const consistencyIssuesByAspect: Record<ConsistencyAspect, string[]> = {
  [ConsistencyAspect.SHOT_RELIABILITY]: [
    'variable success rate with the same shot', 'unpredictable shot outcomes',
    'inability to replicate successful shots', 'inconsistent shot patterns',
    'shots working one day but not the next', 'unreliable shot performance under pressure',
    'inability to count on specific shots', 'excessive shot-to-shot variability'
  ],
  [ConsistencyAspect.ERROR_REDUCTION]: [
    'high error count in matches', 'frequent unforced errors', 'excessive mistakes',
    'shots going out or into the net', 'error-prone performance', 'critical mistakes at key moments',
    'difficulty maintaining clean play', 'errors overshadowing good shots'
  ],
  [ConsistencyAspect.UNFORCED_ERRORS]: [
    'giving away points unnecessarily', 'forcing shots when patience is needed',
    'attempting low-percentage shots', 'errors from impatience', 'poor shot selection',
    'tactical errors in decision making', 'errors from overconfidence', 'avoidable mistakes'
  ],
  [ConsistencyAspect.REPETITION_QUALITY]: [
    'mindless practice repetitions', 'inconsistent focus during practice',
    'practicing without clear intent', 'variable quality of practice repetitions',
    'ineffective practice sessions', 'diminishing quality over practice duration',
    'unfocused training', 'practice without purpose or analysis'
  ],
  [ConsistencyAspect.PATTERN_CONSISTENCY]: [
    'inconsistent movement patterns', 'variable stroke mechanics', 'unpredictable footwork',
    'technique breakdowns under pressure', 'inconsistent preparation routines',
    'variable follow-through patterns', 'technique changes between sessions',
    'mechanical inconsistencies in stroke production'
  ],
  [ConsistencyAspect.PERFORMANCE_STABILITY]: [
    'playing well below capability frequently', 'significant performance fluctuations',
    '"on days" and "off days"', 'unpredictable performance level', 'inability to maintain solid play',
    'dramatic skill level shifts', 'inconsistent match performance', 'wide performance variability'
  ],
  [ConsistencyAspect.PRACTICE_CONSISTENCY]: [
    'irregular practice schedule', 'variable practice commitment', 'inconsistent training focus',
    'sporadic practice attendance', 'unpredictable practice intensity', 'fluctuating training volume',
    'practice routine disruptions', 'inability to maintain consistent practice habits'
  ],
  [ConsistencyAspect.PRESSURE_PERFORMANCE]: [
    'performance declines under pressure', 'technique breakdowns in important points',
    'inability to execute in critical moments', 'tournament performance drops',
    'anxiety affecting consistency', 'choking on important points',
    'technical regression when scores are close', 'pressure-induced errors'
  ],
  [ConsistencyAspect.TECHNICAL_CONSISTENCY]: [
    'variable stroke mechanics', 'inconsistent swing paths', 'paddle face control issues',
    'unpredictable contact points', 'technical breakdowns', 'mechanics changing mid-match',
    'inability to repeat proper technique', 'inconsistent body positioning'
  ],
  [ConsistencyAspect.STRATEGIC_CONSISTENCY]: [
    'abandoning game plans prematurely', 'tactical wavering', 'strategic impatience',
    'inconsistent strategic execution', 'failure to stick to strengths', 'tactical drift during matches',
    'strategic impulsiveness', 'deviation from successful patterns'
  ],
  [ConsistencyAspect.SHOT_DEPTH_CONTROL]: [
    'inconsistent shot depth', 'shots too short', 'inability to maintain appropriate depth',
    'variable ball landing locations', 'depth control issues under pressure',
    'inconsistent court penetration', 'difficulty controlling shot length',
    'shots landing in dangerous mid-court area'
  ],
  [ConsistencyAspect.SHOT_DIRECTION_CONTROL]: [
    'inconsistent shot placement', 'directional control problems', 'inability to hit targets consistently',
    'erratic directional patterns', 'shot spray patterns', 'unpredictable shot directions',
    'directional control breakdown under pressure', 'inability to place shots strategically'
  ],
  [ConsistencyAspect.SHOT_PACE_CONTROL]: [
    'inconsistent shot pace', 'power control issues', 'speed variability', 'erratic shot velocity',
    'inability to modulate power appropriately', 'hitting too hard or too soft',
    'unpredictable shot speeds', 'pace control breakdown under pressure'
  ],
  [ConsistencyAspect.CONTACT_POINT]: [
    'inconsistent ball contact', 'variable impact points', 'off-center hits', 'mishits',
    'shanking the ball', 'contact point fluctuations', 'inability to find the sweet spot consistently',
    'hitting different parts of the paddle face'
  ],
  [ConsistencyAspect.PREPARATION]: [
    'inconsistent preparation routine', 'variable backswing', 'late paddle preparation',
    'rushed setup', 'unpredictable ready position', 'inconsistent pre-shot routine',
    'variable take-back', 'preparation timing issues'
  ],
  [ConsistencyAspect.FOLLOW_THROUGH]: [
    'inconsistent follow-through', 'abbreviated finishing motion', 'variable swing completion',
    'cutting off the follow-through', 'incomplete extension', 'inconsistent finishing position',
    'follow-through breakdowns under pressure', 'directional inconsistency in follow-through'
  ],
  [ConsistencyAspect.NONE]: []
};

/**
 * Analyzes a message for consistency-related content
 */
export function analyzeConsistency(message: string): ConsistencyAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Detect the primary consistency aspect
  let primaryAspect = ConsistencyAspect.NONE;
  let maxKeywords = 0;
  let confidenceScore = 1;
  
  // Check each consistency aspect for matching keywords
  Object.entries(consistencyAspectKeywords).forEach(([aspect, keywords]) => {
    if (aspect === ConsistencyAspect.NONE) return;
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });
    
    if (matchCount > maxKeywords) {
      maxKeywords = matchCount;
      primaryAspect = aspect as ConsistencyAspect;
      
      // Calculate confidence score (1-5) based on number of matches
      confidenceScore = Math.min(5, Math.max(1, Math.ceil(matchCount / 2)));
    }
  });
  
  // Detect if the user is seeking consistency advice
  const seekingConsistencyAdvice = consistencyAdviceTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  ) || primaryAspect !== ConsistencyAspect.NONE;
  
  // Determine the relevant skill area
  let relevantSkillArea: 'dinking' | 'drives' | 'serves' | 'returns' | 'volleys' | 'overheads' | 'general' = 'general';
  
  for (const [area, keywords] of Object.entries(skillAreaKeywords)) {
    const hasAreaKeywords = keywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    if (hasAreaKeywords) {
      relevantSkillArea = area as any;
      break;
    }
  }
  
  // Detect specific consistency issues
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
    lowerMessage.includes('inconsistent') ||
    lowerMessage.includes('unreliable') ||
    lowerMessage.includes('not consistent') ||
    lowerMessage.includes('errors') ||
    lowerMessage.includes('mistakes');
  
  if (hasIssueIndicators && primaryAspect !== ConsistencyAspect.NONE) {
    hasIssue = true;
    
    // Check for specific issues by aspect
    const aspectIssues = consistencyIssuesByAspect[primaryAspect];
    
    // See if any specific issues are mentioned in the message
    const matchingIssue = aspectIssues.find(issue => 
      lowerMessage.includes(issue.toLowerCase())
    );
    
    // If a specific issue is found, use it; otherwise, select a likely one based on context
    if (matchingIssue) {
      specificIssue = matchingIssue;
    } else if (aspectIssues.length > 0) {
      // Select a default issue for this aspect
      const relevantIssueIndex = Math.floor(Math.random() * aspectIssues.length);
      specificIssue = aspectIssues[relevantIssueIndex];
    }
  }
  
  return {
    primaryAspect,
    confidence: confidenceScore,
    hasIssue,
    specificIssue,
    seekingConsistencyAdvice,
    relevantSkillArea
  };
}

/**
 * Generate consistency improvement tips for a specific aspect
 * 
 * @param aspect The consistency aspect
 * @param skillArea The relevant shot or skill area
 * @returns An array of consistency tips
 */
export function generateConsistencyTips(
  aspect: ConsistencyAspect,
  skillArea: 'dinking' | 'drives' | 'serves' | 'returns' | 'volleys' | 'overheads' | 'general'
): string[] {
  if (aspect === ConsistencyAspect.NONE) {
    return [];
  }
  
  // Tips organized by consistency aspect and skill area
  const tipsByAspectAndSkill: Record<ConsistencyAspect, Record<string, string[]>> = {
    [ConsistencyAspect.SHOT_RELIABILITY]: {
      'dinking': [
        "Practice controlled dinking with targets on the court",
        "Focus on consistent paddle angle and soft contact",
        "Develop dinking patterns you can reliably repeat",
        "Practice maintaining a stable paddle face throughout the dinking motion",
        "Work on rhythm and timing to develop reliable dinking sequences"
      ],
      'drives': [
        "Develop a simplified driving technique that prioritizes consistency over power",
        "Practice hitting to large target areas before narrowing your focus",
        "Work on maintaining consistent contact point for reliable drives",
        "Focus on directional control before adding power to your drives",
        "Develop a pre-shot routine that ensures mechanical consistency"
      ],
      'serves': [
        "Create a simplified, repeatable serving motion",
        "Practice serving to large target areas to build confidence",
        "Focus on consistent ball toss height and position",
        "Develop a pre-serve routine that you follow every time",
        "Use video analysis to identify and eliminate serve variables"
      ],
      'returns': [
        "Simplify your return technique to increase reliability",
        "Practice block returns with emphasis on consistency over placement",
        "Work on consistent split-step timing for better return preparation",
        "Develop a reliable contact point for different serve types",
        "Use progressive difficulty drills to build return consistency"
      ],
      'volleys': [
        "Practice blocking volleys with minimal paddle movement",
        "Focus on consistent paddle position and firm wrist",
        "Develop reliable footwork patterns for different volley heights",
        "Use wall drills to build volley consistency through repetition",
        "Practice volley-to-volley consistency with partners"
      ],
      'overheads': [
        "Develop a simplified overhead motion that prioritizes reliability",
        "Practice consistent positioning under the ball before striking",
        "Focus on solid contact rather than maximum power",
        "Create a reliable preparation sequence for overhead shots",
        "Use progressive drills that build overhead confidence"
      ],
      'general': [
        "Focus on developing repeatable mechanics for each shot type",
        "Practice with purpose, emphasizing quality over quantity",
        "Use targets and measurable feedback to track consistency",
        "Build progressive practice sessions that start with high-percentage shots",
        "Develop pre-shot routines that promote mechanical consistency"
      ]
    },
    [ConsistencyAspect.ERROR_REDUCTION]: {
      'dinking': [
        "Focus on clearing the net by a safe margin with each dink",
        "Practice controlled dinking with emphasis on consistent height",
        "Develop patient dinking exchanges that prioritize safety over winners",
        "Work on proper distance from the kitchen line for optimal control",
        "Practice recovery after each dink to maintain consistent positioning"
      ],
      'drives': [
        "Aim for targets well inside the court boundaries",
        "Start with 70-80% power to emphasize control over force",
        "Develop consistent follow-through direction for improved accuracy",
        "Practice drives with safety margins that reduce out-of-bounds errors",
        "Focus on clean ball striking before adding pace or spin"
      ],
      'serves': [
        "Identify your most reliable serve and use it for important points",
        "Practice serves with large margin for error in all directions",
        "Focus on consistent contact point for improved reliability",
        "Use a simplified serving motion that minimizes variables",
        "Develop serves with proper height clearance over the net"
      ],
      'returns': [
        "Prioritize getting returns in play over placement or power",
        "Practice deep returns with high net clearance for safety",
        "Develop a simplified block return for challenging serves",
        "Focus on proper preparation timing to reduce rushed returns",
        "Use a continental grip for versatility across different returns"
      ],
      'volleys': [
        "Practice soft, controlled volleys that minimize risk",
        "Focus on angle control to keep volleys safely in bounds",
        "Develop proper distance from the net for optimal control",
        "Work on maintaining a firm wrist to improve volley stability",
        "Practice volley depth control to reduce short volley errors"
      ],
      'overheads': [
        "Focus on directional control before maximum power",
        "Practice overheads aimed at the middle of the court for safety",
        "Develop proper positioning before hitting to improve reliability",
        "Work on controlled swing path for consistent contact",
        "Use a three-quarter power overhead that emphasizes placement"
      ],
      'general': [
        "Identify your error patterns and focus practice on those specific areas",
        "Develop a strategy of playing with appropriate margin for error",
        "Practice progressive intensity - start with high-percentage shots before adding difficulty",
        "Use game-based drills that reward consistency over winner production",
        "Log errors during practice to track improvement and identify patterns"
      ]
    },
    [ConsistencyAspect.UNFORCED_ERRORS]: {
      'dinking': [
        "Develop patience in dinking exchanges - wait for the right opportunity",
        "Practice recognizing which dinks are attackable vs. which to keep neutral",
        "Focus on shot selection that maintains dinking rallies until clear openings",
        "Work on identifying opponent vulnerabilities before attempting aggressive dinks",
        "Develop strategic dinking patterns that create openings without forcing"
      ],
      'drives': [
        "Practice identifying which shots should be driven vs. played with control",
        "Develop shot selection criteria based on court position and ball quality",
        "Focus on appropriate targets for drives with adequate safety margins",
        "Work on recognizing when to use power vs. when to neutralize",
        "Practice transitioning between aggressive and controlled drives"
      ],
      'serves': [
        "Develop a hierarchy of serve choices from safest to most aggressive",
        "Practice recognizing when to use high-percentage vs. challenging serves",
        "Focus on strategic serve placement rather than maximum power or spin",
        "Work on serve selection based on score situations and patterns",
        "Use game-based serve practice that rewards consistency with point scoring"
      ],
      'returns': [
        "Practice return selection based on serve quality and position",
        "Develop criteria for when to attack vs. when to neutralize on returns",
        "Focus on appropriate targets with adequate safety margins",
        "Work on recognizing patterns in your return errors",
        "Use game-based return practice that rewards consistency"
      ],
      'volleys': [
        "Practice identifying which volleys to punch vs. block or drop",
        "Develop decision criteria for aggressive vs. controlled volleys",
        "Focus on appropriate targets based on volley height and position",
        "Work on recognizing when to maintain neutral exchanges vs. attack",
        "Use game-based volley drills that reward consistency over winners"
      ],
      'overheads': [
        "Practice overhead selection based on ball quality and court position",
        "Develop criteria for power vs. placement in different situations",
        "Focus on appropriate targets with adequate safety margins",
        "Work on recognizing when a defensive overhead is the right choice",
        "Use game-based overhead practice that balances aggression with consistency"
      ],
      'general': [
        "Develop a decision-making framework for shot selection in different situations",
        "Practice game scenarios where consistency is rewarded over winner production",
        "Focus on understanding your error patterns in match situations",
        "Work on progressive risk management based on score and momentum",
        "Use match analysis to identify unforced error triggers and patterns"
      ]
    },
    [ConsistencyAspect.REPETITION_QUALITY]: {
      'dinking': [
        "Practice dinking with specific focus areas for each session",
        "Use targeted repetition drills with clear technique objectives",
        "Implement feedback mechanisms to ensure quality dinking practice",
        "Focus on one dinking aspect at a time (height, direction, pace)",
        "Develop progressive dinking drills that build quality upon mastery"
      ],
      'drives': [
        "Practice drives with specific technical focus for each session",
        "Use video feedback to ensure quality mechanical repetitions",
        "Implement target-based practice with clear success criteria",
        "Focus on one aspect of the drive at a time (preparation, contact, follow-through)",
        "Develop deliberate practice routines with built-in feedback loops"
      ],
      'serves': [
        "Practice serves with specific focus points for each session",
        "Use target areas with scoring to ensure engaged practice",
        "Implement video feedback to maintain quality serving mechanics",
        "Focus on one aspect of the serve at a time (toss, contact, follow-through)",
        "Develop a serve practice routine with progressive difficulty"
      ],
      'returns': [
        "Practice returns with specific focus areas for each session",
        "Use varied serve types to ensure quality return adaptations",
        "Implement feedback mechanisms to maintain return technique quality",
        "Focus on one return aspect at a time (preparation, contact, direction)",
        "Develop return practice routines that progress from simple to complex"
      ],
      'volleys': [
        "Practice volleys with specific technique objectives each session",
        "Use partner feedback or video to ensure quality repetitions",
        "Implement progressive difficulty to maintain engaged practice",
        "Focus on one volley aspect at a time (paddle position, contact, direction)",
        "Develop volley practice routines that build upon fundamental skills"
      ],
      'overheads': [
        "Practice overheads with specific technique focus points each session",
        "Use target areas with scoring to ensure quality practice",
        "Implement video feedback to maintain proper overhead mechanics",
        "Focus on one overhead aspect at a time (positioning, contact, follow-through)",
        "Develop a progressive overhead practice routine with built-in feedback"
      ],
      'general': [
        "Develop practice plans with specific objectives for each session",
        "Use deliberate practice principles that focus on quality over quantity",
        "Implement feedback mechanisms to ensure meaningful repetitions",
        "Focus on targeted skill development rather than random practice",
        "Create progressive practice systems that build upon mastered elements"
      ]
    },
    [ConsistencyAspect.PATTERN_CONSISTENCY]: {
      'dinking': [
        "Practice consistent body positioning during the dinking motion",
        "Develop repeatable paddle path patterns for different dink types",
        "Focus on consistent grip pressure throughout dinking exchanges",
        "Work on stable lower body positioning during dinking sequences",
        "Use video analysis to identify and standardize your dinking patterns"
      ],
      'drives': [
        "Develop a repeatable preparation sequence for drives",
        "Practice consistent swing path patterns for forehand and backhand drives",
        "Focus on reliable weight transfer timing for power generation",
        "Work on consistent grip pressure throughout the driving motion",
        "Use video analysis to standardize your drive mechanics"
      ],
      'serves': [
        "Create a standardized pre-serve routine you follow every time",
        "Practice consistent ball toss patterns for reliability",
        "Focus on repeatable body positioning throughout the serve motion",
        "Work on consistent paddle path patterns for different serve types",
        "Use video feedback to identify and eliminate mechanical variables"
      ],
      'returns': [
        "Develop a consistent split-step timing pattern for returns",
        "Practice standardized preparation positions for different serve types",
        "Focus on repeatable paddle path patterns for forehand and backhand returns",
        "Work on consistent recovery movement after executing returns",
        "Use video analysis to identify and standardize your return patterns"
      ],
      'volleys': [
        "Practice consistent ready position for volleys at different heights",
        "Develop standardized paddle preparation for forehand and backhand volleys",
        "Focus on repeatable paddle face control throughout volley execution",
        "Work on consistent footwork patterns for different volley situations",
        "Use mirror or video feedback to standardize your volley mechanics"
      ],
      'overheads': [
        "Create a repeatable preparation sequence for overhead shots",
        "Practice consistent positioning patterns under the ball",
        "Focus on standardized swing path for overhead execution",
        "Work on reliable follow-through patterns to complete the motion",
        "Use video analysis to identify and eliminate mechanical variables"
      ],
      'general': [
        "Analyze and standardize the fundamental patterns in your game",
        "Develop repeatable pre-shot routines for each shot type",
        "Focus on consistent body positioning throughout shot execution",
        "Work on reliable follow-through patterns to complete motions",
        "Use video analysis to identify and eliminate unwanted variables"
      ]
    },
    [ConsistencyAspect.PERFORMANCE_STABILITY]: {
      'dinking': [
        "Practice dinking under progressively increased pressure situations",
        "Develop performance metrics to track dinking consistency across sessions",
        "Focus on maintaining dinking technique during fatigue or pressure",
        "Work on mindfulness techniques to stay present during dinking exchanges",
        "Create practice scenarios that simulate challenging match situations"
      ],
      'drives': [
        "Practice drives under various physical and mental conditions",
        "Develop performance tracking to monitor drive consistency across sessions",
        "Focus on maintaining drive technique during pressure situations",
        "Work on adapting drive mechanics to different match scenarios",
        "Create pressure-testing drive drills that simulate match conditions"
      ],
      'serves': [
        "Practice serves under progressively increased pressure conditions",
        "Develop performance metrics to track serve consistency across sessions",
        "Focus on maintaining serve technique during critical point simulations",
        "Work on pre-serve routines that stabilize performance under pressure",
        "Create serve practice games that include score pressure elements"
      ],
      'returns': [
        "Practice returns against various serve types and speeds",
        "Develop performance tracking to monitor return consistency over time",
        "Focus on maintaining return technique during pressure situations",
        "Work on adaptability while maintaining core return mechanics",
        "Create pressure-testing return drills that simulate match conditions"
      ],
      'volleys': [
        "Practice volleys under increasing speed and pressure conditions",
        "Develop performance metrics to track volley consistency across sessions",
        "Focus on maintaining volley technique during rapid exchanges",
        "Work on adaptability while preserving fundamental volley mechanics",
        "Create volley practice scenarios that simulate match pressure"
      ],
      'overheads': [
        "Practice overheads under various difficulty conditions",
        "Develop performance tracking to monitor overhead consistency over time",
        "Focus on maintaining overhead technique in pressure situations",
        "Work on consistent overhead execution regardless of point importance",
        "Create overhead drills that include score pressure elements"
      ],
      'general': [
        "Develop processes to track performance stability across different sessions",
        "Practice maintaining technique under various physical and mental conditions",
        "Focus on identifying and addressing performance fluctuation triggers",
        "Work on pre-performance routines that stabilize your play level",
        "Create training scenarios that specifically target performance stability"
      ]
    },
    [ConsistencyAspect.PRACTICE_CONSISTENCY]: {
      'dinking': [
        "Establish a regular dinking practice routine to build consistency",
        "Schedule specific dinking practice sessions throughout your week",
        "Create a progressive dinking practice plan that builds over time",
        "Track your dinking practice to ensure consistent development",
        "Develop different dinking drills to maintain engagement and consistency"
      ],
      'drives': [
        "Establish a regular drive practice schedule with clear objectives",
        "Create a progressive drive development plan that builds over time",
        "Schedule specific drive practice sessions throughout your training week",
        "Track your drive practice to ensure consistent development",
        "Develop varied drive drills to maintain engagement and consistency"
      ],
      'serves': [
        "Establish a consistent serve practice routine you follow regularly",
        "Schedule dedicated serve practice sessions throughout your week",
        "Create a progressive serve development plan with clear milestones",
        "Track your serve practice volume and quality for consistency",
        "Develop different serve practice formats to maintain engagement"
      ],
      'returns': [
        "Establish a regular return practice routine with clear objectives",
        "Schedule specific return practice sessions throughout your week",
        "Create a progressive return development plan that builds over time",
        "Track your return practice to ensure consistent development",
        "Develop various return drills to maintain engagement and consistency"
      ],
      'volleys': [
        "Establish a regular volley practice schedule with specific goals",
        "Create a progressive volley development plan with clear milestones",
        "Schedule dedicated volley sessions throughout your training week",
        "Track your volley practice volume and quality for consistency",
        "Develop different volley drills to maintain engagement and focus"
      ],
      'overheads': [
        "Establish a consistent overhead practice routine you follow regularly",
        "Schedule specific overhead training as part of your weekly plan",
        "Create a progressive overhead development path with clear steps",
        "Track your overhead practice to ensure consistent improvement",
        "Develop varied overhead drills to maintain engagement"
      ],
      'general': [
        "Develop a comprehensive practice schedule that ensures consistent training",
        "Create a periodized practice plan that addresses all aspects of your game",
        "Establish systems to track and monitor your practice consistency",
        "Focus on building sustainable practice habits that support long-term development",
        "Use accountability tools or partners to maintain practice consistency"
      ]
    },
    [ConsistencyAspect.PRESSURE_PERFORMANCE]: {
      'dinking': [
        "Practice dinking with point-pressure scenarios",
        "Create competitive dinking games with small consequences",
        "Develop progressive pressure tolerance through scenario-based dinking",
        "Work on mindfulness techniques specific to maintaining dinking focus",
        "Practice dinking consistency while introducing distractions"
      ],
      'drives': [
        "Practice drives in game-pressure scenarios with consequences",
        "Create competitive drive drills that simulate critical points",
        "Develop a pre-shot routine for drives that works under pressure",
        "Work on maintaining technical consistency when score pressure increases",
        "Practice drive performance while simulating match situations"
      ],
      'serves': [
        "Practice serves with simulated pressure situations",
        "Create competitive serving games with consequences",
        "Develop a reliable pre-serve routine that works under pressure",
        "Work on maintaining serve consistency when introducing pressure",
        "Practice serving in specific score scenarios (game/match point)"
      ],
      'returns': [
        "Practice returns with simulated pressure scenarios",
        "Create competitive return games with consequences",
        "Develop a pre-return routine that stabilizes performance under pressure",
        "Work on maintaining technical consistency when pressure increases",
        "Practice returns in specific score scenarios (break point, etc.)"
      ],
      'volleys': [
        "Practice volleys with simulated pressure scenarios",
        "Create competitive volley games with small consequences",
        "Develop a focused state for volleys that works under pressure",
        "Work on maintaining technique when exchange speed increases",
        "Practice volleys in specific match-pressure situations"
      ],
      'overheads': [
        "Practice overheads in pressure-simulating scenarios",
        "Create competitive overhead games with consequences",
        "Develop a pre-overhead routine that works under pressure",
        "Work on maintaining overhead technique in critical point simulations",
        "Practice overheads in specific score scenarios (game point, etc.)"
      ],
      'general': [
        "Develop a comprehensive approach to pressure management in your game",
        "Create progressive pressure exposure in all practice sessions",
        "Focus on identifying physical and mental responses to pressure",
        "Work on pre-point routines that maintain consistency under stress",
        "Practice mindfulness techniques that improve pressure tolerance"
      ]
    },
    [ConsistencyAspect.TECHNICAL_CONSISTENCY]: {
      'dinking': [
        "Use video analysis to standardize your dinking technique",
        "Practice maintaining consistent paddle angle throughout dinking",
        "Focus on stable wrist and arm position during exchanges",
        "Work on repeatable body positioning for different dink types",
        "Develop consistency in contact point and follow-through direction"
      ],
      'drives': [
        "Use video feedback to standardize your drive mechanics",
        "Practice maintaining consistent swing path and contact point",
        "Focus on stable preparation position before each drive",
        "Work on repeatable weight transfer timing for power generation",
        "Develop consistency in follow-through direction and height"
      ],
      'serves': [
        "Use video analysis to identify and eliminate technical inconsistencies",
        "Practice consistent ball toss height and location",
        "Focus on repeatable paddle path and contact point",
        "Work on standardizing your preparation stance and motion",
        "Develop consistency in follow-through direction and completion"
      ],
      'returns': [
        "Use video feedback to standardize your return technique",
        "Practice consistent split-step timing and ready position",
        "Focus on stable paddle preparation against different serves",
        "Work on maintaining consistent contact point and swing path",
        "Develop technical adaptability while preserving core mechanics"
      ],
      'volleys': [
        "Use mirror or video feedback to standardize volley technique",
        "Practice consistent paddle face control through contact",
        "Focus on stable ready position and early paddle preparation",
        "Work on maintaining hand position and wrist firmness",
        "Develop technical consistency across different volley heights"
      ],
      'overheads': [
        "Use video analysis to standardize your overhead mechanics",
        "Practice consistent positioning under the ball before striking",
        "Focus on repeatable swing path and contact point",
        "Work on coordinated use of non-dominant arm for balance",
        "Develop consistency in follow-through direction and completion"
      ],
      'general': [
        "Conduct a technical audit to identify inconsistencies in your mechanics",
        "Practice fundamental mechanics until they become automatic",
        "Focus on developing technical consistency before adding variation",
        "Work with a coach to eliminate technical variables in your strokes",
        "Develop awareness of your technical tendencies under different conditions"
      ]
    },
    [ConsistencyAspect.STRATEGIC_CONSISTENCY]: {
      'dinking': [
        "Develop a clear strategic framework for dinking exchanges",
        "Practice strategic dinking patterns you can execute consistently",
        "Focus on maintaining strategic discipline during extended rallies",
        "Work on recognizing and exploiting patterns in dinking exchanges",
        "Create a progressive strategy for breaking down opponents through dinking"
      ],
      'drives': [
        "Develop clear criteria for when to use different types of drives",
        "Practice strategic drive patterns based on court position",
        "Focus on maintaining strategic discipline in drive selection",
        "Work on court positioning to optimize your drive effectiveness",
        "Create strategic sequences that combine drives with other shots"
      ],
      'serves': [
        "Develop a clear serving strategy with defined patterns",
        "Practice strategic serve placement based on opponent tendencies",
        "Focus on maintaining strategic discipline in serve selection",
        "Work on serve sequencing that creates predictable patterns",
        "Create serve strategies specific to different opponents and situations"
      ],
      'returns': [
        "Develop a clear return strategy for different serve types",
        "Practice strategic return placement based on court position",
        "Focus on maintaining strategic discipline in return selection",
        "Work on return positioning to optimize effectiveness",
        "Create return strategies that set up your preferred patterns"
      ],
      'volleys': [
        "Develop a clear volley strategy based on court position",
        "Practice strategic volley placement to create advantages",
        "Focus on maintaining strategic discipline in volley exchanges",
        "Work on volley positioning to maximize effectiveness",
        "Create volley patterns that progressively pressure opponents"
      ],
      'overheads': [
        "Develop clear criteria for overhead placement in different situations",
        "Practice strategic overhead targets based on court position",
        "Focus on maintaining strategic discipline in overhead selection",
        "Work on positioning to maximize overhead effectiveness",
        "Create overhead strategies that exploit common opponent vulnerabilities"
      ],
      'general': [
        "Develop a comprehensive strategic framework for your game",
        "Practice maintaining strategic discipline across different scenarios",
        "Focus on identifying and exploiting strategic patterns",
        "Work on strategic adaptability while maintaining core principles",
        "Create a match strategy checklist to ensure consistent execution"
      ]
    },
    [ConsistencyAspect.SHOT_DEPTH_CONTROL]: {
      'dinking': [
        "Practice controlling dink depth using targets in the kitchen",
        "Focus on consistent paddle angle for reliable depth control",
        "Work on maintaining appropriate distance from the kitchen line",
        "Develop feel for different dink depths through deliberate practice",
        "Use progressive drills that require precise depth management"
      ],
      'drives': [
        "Practice drive depth control with target zones on the court",
        "Focus on consistent contact point for reliable depth",
        "Work on follow-through direction to influence ball trajectory",
        "Develop feel for drive depth through progressive difficulty drills",
        "Use visual feedback systems to track depth consistency"
      ],
      'serves': [
        "Practice serve depth control with target zones on the court",
        "Focus on consistent toss and contact point for reliable depth",
        "Work on follow-through direction to influence trajectory",
        "Develop feel for different serve depths through deliberate practice",
        "Use visual markers to provide immediate depth feedback"
      ],
      'returns': [
        "Practice return depth control with court target zones",
        "Focus on consistent contact point for reliable depth",
        "Work on adjusting depth based on serve quality",
        "Develop progressive drills that require precise depth management",
        "Use visual feedback systems to track depth consistency"
      ],
      'volleys': [
        "Practice volley depth control with target areas",
        "Focus on paddle angle control for consistent depth",
        "Work on contact point adjustments for different depths",
        "Develop feel for volley trajectory through deliberate practice",
        "Use partner feedback to refine depth perception"
      ],
      'overheads': [
        "Practice overhead depth control with court target zones",
        "Focus on contact point and swing path for reliable depth",
        "Work on visualization and court awareness for depth perception",
        "Develop feel for different overhead depths through deliberate practice",
        "Use visual markers to provide immediate depth feedback"
      ],
      'general': [
        "Develop depth awareness for all shot types in your game",
        "Practice precise depth control through progressive target drills",
        "Focus on technical elements that influence shot depth",
        "Work on visual acuity and depth perception through specialized training",
        "Create feedback systems to track depth consistency across sessions"
      ]
    },
    [ConsistencyAspect.SHOT_DIRECTION_CONTROL]: {
      'dinking': [
        "Practice directional dinking with specific targets",
        "Focus on paddle face angle control for reliable direction",
        "Work on body alignment to influence directional accuracy",
        "Develop drills that require precise directional changes",
        "Use tape or targets to provide immediate directional feedback"
      ],
      'drives': [
        "Practice drive direction control with specific court targets",
        "Focus on alignment and paddle face for directional control",
        "Work on consistent contact point for reliable direction",
        "Develop progressive drills that challenge directional precision",
        "Use visual markers to provide immediate directional feedback"
      ],
      'serves': [
        "Practice serve direction control with specific court targets",
        "Focus on alignment and paddle face for directional accuracy",
        "Work on consistent toss position for reliable direction",
        "Develop serve placement drills with increasing difficulty",
        "Use visual markers to provide immediate directional feedback"
      ],
      'returns': [
        "Practice return direction control with specific court targets",
        "Focus on stable base and alignment for directional accuracy",
        "Work on paddle face control for reliable return direction",
        "Develop progressive drills that challenge directional precision",
        "Use visual markers to provide immediate directional feedback"
      ],
      'volleys': [
        "Practice volley direction control with specific targets",
        "Focus on paddle face angle for reliable directional control",
        "Work on body positioning to influence volley direction",
        "Develop drills that require precise directional changes",
        "Use court targets to provide immediate directional feedback"
      ],
      'overheads': [
        "Practice overhead direction control with specific court targets",
        "Focus on body positioning and alignment for directional accuracy",
        "Work on consistent contact point for reliable direction",
        "Develop progressive drills that challenge directional precision",
        "Use visual markers to provide immediate directional feedback"
      ],
      'general': [
        "Develop directional awareness and control for all shot types",
        "Practice precision targeting through progressive difficulty drills",
        "Focus on technical elements that influence shot direction",
        "Work on alignment and positioning for optimal directional control",
        "Create feedback systems to track directional consistency"
      ]
    },
    [ConsistencyAspect.SHOT_PACE_CONTROL]: {
      'dinking': [
        "Practice varying dink pace while maintaining control",
        "Focus on contact quality for consistent pace management",
        "Work on recognizing when to adjust dink speed",
        "Develop feel for different dink paces through deliberate practice",
        "Use partner feedback to refine pace control sensitivity"
      ],
      'drives': [
        "Practice drive pace control at varying percentages of maximum power",
        "Focus on body use and swing speed for consistent power generation",
        "Work on maintaining technical consistency at different speeds",
        "Develop a power scale (1-10) that you can reliably execute",
        "Use radar feedback or video to track pace consistency"
      ],
      'serves': [
        "Practice serve pace control at varying percentages of power",
        "Focus on consistent technique across different serve speeds",
        "Work on strategic serve pace variation with control",
        "Develop reliable serve speeds (soft, medium, hard) you can execute",
        "Use feedback systems to monitor pace consistency"
      ],
      'returns': [
        "Practice return pace control as a strategic element",
        "Focus on controlling return pace against varying serve speeds",
        "Work on maintaining technical consistency across different paces",
        "Develop a reliable pace control scale for different returns",
        "Use partner feedback to refine your pace control precision"
      ],
      'volleys': [
        "Practice volley pace control from blocking to punching",
        "Focus on wrist firmness for consistent pace management",
        "Work on recognizing when to adjust volley pace",
        "Develop reliable volley paces (soft, medium, firm) you can execute",
        "Use partner feedback to refine your pace control sensitivity"
      ],
      'overheads': [
        "Practice overhead pace control at different power percentages",
        "Focus on consistent technique across varying speeds",
        "Work on appropriate power selection based on court position",
        "Develop reliable overhead speeds you can execute consistently",
        "Use feedback systems to monitor pace consistency"
      ],
      'general': [
        "Develop pace awareness and control for all shot types",
        "Practice reliable execution at different power levels",
        "Focus on maintaining technical consistency across all speeds",
        "Work on strategic pace variation as a tactical element",
        "Create feedback systems to track pace consistency and appropriateness"
      ]
    },
    [ConsistencyAspect.CONTACT_POINT]: {
      'dinking': [
        "Practice finding a consistent contact point for dinks",
        "Focus on paddle path to maintain reliable contact",
        "Work on early recognition to prepare for optimal contact",
        "Develop drills that emphasize clean contact perception",
        "Use video feedback to analyze and standardize contact point"
      ],
      'drives': [
        "Practice consistent contact point for various drive types",
        "Focus on early preparation to enable optimal contact",
        "Work on contact point awareness through feedback drills",
        "Develop the ability to adjust to different ball heights",
        "Use video analysis to identify and standardize contact patterns"
      ],
      'serves': [
        "Practice finding a consistent contact point for serves",
        "Focus on toss placement to enable reliable contact",
        "Work on feeling clean contact through deliberate practice",
        "Develop serve routines that emphasize contact quality",
        "Use video feedback to analyze and standardize contact point"
      ],
      'returns': [
        "Practice finding consistent contact for different serve types",
        "Focus on early split-step to prepare for optimal contact",
        "Work on adjusting contact point based on serve height",
        "Develop drills that emphasize clean return contact",
        "Use video analysis to identify and standardize contact patterns"
      ],
      'volleys': [
        "Practice consistent contact point for volleys at different heights",
        "Focus on early paddle preparation for reliable contact",
        "Work on contact point awareness through feedback drills",
        "Develop the ability to adjust contact for varying ball speeds",
        "Use video feedback to analyze and standardize contact patterns"
      ],
      'overheads': [
        "Practice finding a consistent contact point for overheads",
        "Focus on positioning under the ball for optimal contact",
        "Work on tracking the ball to the contact point",
        "Develop overhead routines that emphasize contact quality",
        "Use video feedback to analyze and standardize contact point"
      ],
      'general': [
        "Develop contact point awareness for all shots in your game",
        "Practice focused attention on the moment of contact",
        "Focus on early preparation to enable optimal contact positions",
        "Work on the ability to adjust to different ball trajectories",
        "Use video analysis to identify and address contact point inconsistencies"
      ]
    },
    [ConsistencyAspect.PREPARATION]: {
      'dinking': [
        "Practice early paddle preparation for dinking exchanges",
        "Focus on consistent ready position between dinks",
        "Work on recognition and reaction to initiate preparation",
        "Develop a reliable pre-dink routine for stability",
        "Use video analysis to standardize your preparation phase"
      ],
      'drives': [
        "Practice early backswing preparation for drives",
        "Focus on consistent unit turn and shoulder rotation",
        "Work on recognizing drive opportunities early",
        "Develop a reliable pre-drive routine for all situations",
        "Use video feedback to analyze and standardize preparation"
      ],
      'serves': [
        "Practice a consistent pre-serve preparation routine",
        "Focus on reliable stance and paddle positioning",
        "Work on consistent ball bounce and toss preparation",
        "Develop mental and physical readiness triggers",
        "Use video analysis to standardize your preparation phase"
      ],
      'returns': [
        "Practice consistent split-step timing and ready position",
        "Focus on early paddle preparation for different serves",
        "Work on reading serve cues to initiate preparation",
        "Develop a reliable pre-return stance and mental routine",
        "Use video feedback to analyze and standardize preparation"
      ],
      'volleys': [
        "Practice consistent ready position for volley preparation",
        "Focus on early paddle positioning for different heights",
        "Work on anticipation to enable early preparation",
        "Develop a reliable transition from ready to volley position",
        "Use video analysis to standardize your preparation phase"
      ],
      'overheads': [
        "Practice early recognition and preparation for overheads",
        "Focus on consistent footwork to position for the ball",
        "Work on coordinated use of non-dominant arm during preparation",
        "Develop a reliable pre-overhead routine for positioning",
        "Use video feedback to analyze and standardize preparation"
      ],
      'general': [
        "Develop early preparation habits for all shots in your game",
        "Practice consistent ready position and early recognition",
        "Focus on reliable pre-shot routines for each shot type",
        "Work on mental and physical preparation triggers",
        "Use video analysis to identify and address preparation inconsistencies"
      ]
    },
    [ConsistencyAspect.FOLLOW_THROUGH]: {
      'dinking': [
        "Practice complete follow-through on every dink",
        "Focus on directional consistency in your finish position",
        "Work on maintaining balance throughout the motion",
        "Develop awareness of follow-through impact on outcomes",
        "Use video analysis to standardize your follow-through pattern"
      ],
      'drives': [
        "Practice complete follow-through for every drive",
        "Focus on consistent finish height and direction",
        "Work on maintaining balance through completion",
        "Develop awareness of how follow-through affects results",
        "Use video feedback to analyze and standardize finish position"
      ],
      'serves': [
        "Practice complete follow-through on every serve",
        "Focus on consistent finish direction and height",
        "Work on balanced completion of the serving motion",
        "Develop awareness of follow-through impact on serve quality",
        "Use video analysis to standardize your follow-through pattern"
      ],
      'returns': [
        "Practice complete follow-through on all returns",
        "Focus on finish position consistency based on return type",
        "Work on balanced completion even when stretched",
        "Develop awareness of how follow-through affects results",
        "Use video feedback to analyze and standardize finish positions"
      ],
      'volleys': [
        "Practice appropriate follow-through for different volleys",
        "Focus on compact but complete finishing positions",
        "Work on maintaining balance throughout volley completion",
        "Develop awareness of how follow-through affects volley control",
        "Use video analysis to standardize your volley finish positions"
      ],
      'overheads': [
        "Practice complete follow-through on every overhead",
        "Focus on consistent finish direction and balance",
        "Work on controlled completion of the overhead motion",
        "Develop awareness of follow-through impact on results",
        "Use video feedback to analyze and standardize finish position"
      ],
      'general': [
        "Develop complete follow-through habits for all shots",
        "Practice balanced completion of every stroke",
        "Focus on the relationship between follow-through and results",
        "Work on appropriate finish positions for each shot type",
        "Use video analysis to identify and address follow-through inconsistencies"
      ]
    },
    [ConsistencyAspect.NONE]: {
      'dinking': [],
      'drives': [],
      'serves': [],
      'returns': [],
      'volleys': [],
      'overheads': [],
      'general': []
    }
  };
  
  // Return appropriate tips based on aspect and skill area
  return tipsByAspectAndSkill[aspect][skillArea] || [];
}

/**
 * Generates a response focused on consistency
 */
export function generateConsistencyResponse(
  analysis: ConsistencyAnalysis,
  userName: string
): string {
  // If no clear consistency aspect was detected, return empty string
  if (analysis.primaryAspect === ConsistencyAspect.NONE || analysis.confidence < 2) {
    return '';
  }
  
  const { primaryAspect, hasIssue, specificIssue, seekingConsistencyAdvice, relevantSkillArea } = analysis;
  
  // Get appropriate consistency tips
  const tips = generateConsistencyTips(primaryAspect, relevantSkillArea);
  
  // Format the aspect name and skill area for display
  const aspectName = primaryAspect.replace(/_/g, ' ').toLowerCase();
  const skillAreaText = relevantSkillArea === 'general' ? 'your overall game' : `your ${relevantSkillArea} game`;
  
  // Generate different response types based on context
  if (seekingConsistencyAdvice && hasIssue) {
    // User is seeking advice for a specific consistency issue
    return `I understand you're looking to improve ${aspectName} in ${skillAreaText}, ${userName}, particularly with the issue of ${specificIssue}. 
    
Here are some targeted approaches to address this consistency challenge:

- ${tips.slice(0, 3).join('\n- ')}

Would you like a more detailed practice plan focused on developing this aspect of consistency? I can also suggest specific drills that target this element of your game.`;
  } 
  else if (seekingConsistencyAdvice) {
    // User is seeking general consistency advice
    return `Developing ${aspectName} is an excellent focus for enhancing ${skillAreaText}, ${userName}. 
    
Here are some effective approaches to build this aspect of consistency:

- ${tips.slice(0, 3).join('\n- ')}

These consistency elements can significantly improve your performance. Would you like more specific guidance on implementing these into your practice routine?`;
  }
  else if (hasIssue) {
    // User has a specific consistency issue but isn't explicitly asking for advice
    return `I notice you're mentioning some challenges with ${aspectName} in ${skillAreaText}, specifically with ${specificIssue}. 
    
This is a common consistency challenge that many players work to overcome. Here are some approaches that might help:

- ${tips.slice(0, 3).join('\n- ')}

Is this specific consistency element something you'd like to focus on developing further?`;
  }
  else {
    // General response about this consistency aspect
    return `${aspectName.charAt(0).toUpperCase() + aspectName.slice(1)} is a crucial element of consistency in pickleball. For ${skillAreaText}, here are some key development approaches:

- ${tips.slice(0, 3).join('\n- ')}

Would you like more specific guidance on improving this aspect of consistency, or perhaps some practical drills to incorporate into your practice routine?`;
  }
}