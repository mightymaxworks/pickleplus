/**
 * PKL-278651-COACH-0004-MENT-STATE
 * Mental State Processor for SAGE
 * 
 * This file provides methods to recognize and respond to mental and emotional states
 * expressed by players, particularly in the context of winning and losing matches.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { DimensionCode } from '@shared/schema/sage';

/**
 * Types of mental states that can be detected
 */
export enum MentalStateType {
  VICTORY_ELATION = 'victory_elation',
  VICTORY_RELIEF = 'victory_relief',
  DEFEAT_FRUSTRATION = 'defeat_frustration',
  DEFEAT_DISAPPOINTMENT = 'defeat_disappointment',
  PRESSURE_ANXIETY = 'pressure_anxiety',
  FOCUS_ISSUE = 'focus_issue',
  CONFIDENCE_LOSS = 'confidence_loss',
  CONFIDENCE_GAIN = 'confidence_gain',
  MOTIVATION_HIGH = 'motivation_high',
  MOTIVATION_LOW = 'motivation_low',
  NEUTRAL = 'neutral'
}

/**
 * Result of mental state analysis
 */
export interface MentalStateAnalysis {
  /** The primary mental state detected */
  primaryState: MentalStateType;
  /** The intensity of the mental state (1-5 scale) */
  intensity: number;
  /** Whether this is related to a match outcome */
  isMatchRelated: boolean;
  /** Whether the mental state is positive, negative or neutral */
  sentiment: 'positive' | 'negative' | 'neutral';
  /** Relevant CourtIQ dimension */
  relevantDimension: DimensionCode;
  /** Whether the message asks for help or advice */
  seeksAdvice: boolean;
}

/**
 * Mental state keywords to detect in messages
 */
const mentalStateKeywords: Record<MentalStateType, string[]> = {
  [MentalStateType.VICTORY_ELATION]: [
    'won', 'winning', 'victory', 'champion', 'crushed', 'dominated', 'beat',
    'excited', 'thrilled', 'elated', 'on top of the world', 'proud', 'accomplished'
  ],
  [MentalStateType.VICTORY_RELIEF]: [
    'finally won', 'pulled through', 'survived', 'made it', 'close win', 
    'relieved', 'weight off my shoulders', 'breakthrough', 'got through'
  ],
  [MentalStateType.DEFEAT_FRUSTRATION]: [
    'lost', 'losing', 'defeated', 'failure', 'frustrating', 'annoyed', 'angry',
    'irritated', 'upset', 'mad', 'furious', 'fuming', 'ticked off'
  ],
  [MentalStateType.DEFEAT_DISAPPOINTMENT]: [
    'lost', 'losing', 'fell short', 'let down', 'disappointed', 'sad', 'upset',
    'devastated', 'heartbroken', 'bummed', 'down', 'depressed', 'blue', 'crushed'
  ],
  [MentalStateType.PRESSURE_ANXIETY]: [
    'nervous', 'anxious', 'pressure', 'stress', 'tense', 'tight', 'worried',
    'fear', 'afraid', 'scared', 'panicked', 'overwhelmed', 'freaking out',
    'tournament', 'competition', 'championship', 'playoff', 'final'
  ],
  [MentalStateType.FOCUS_ISSUE]: [
    'distracted', 'unfocused', 'concentration', 'losing focus', 'mind wandering',
    'can\'t focus', 'focus issues', 'attention', 'zoning out', 'spacing out'
  ],
  [MentalStateType.CONFIDENCE_LOSS]: [
    'doubt', 'unsure', 'hesitant', 'second-guessing', 'lost confidence',
    'questioning', 'uncertain', 'insecure', 'not confident', 'afraid to'
  ],
  [MentalStateType.CONFIDENCE_GAIN]: [
    'confident', 'sure', 'believe in myself', 'self-assured', 'trust my',
    'self-confidence', 'feel good about', 'positive mindset', 'mental strength'
  ],
  [MentalStateType.MOTIVATION_HIGH]: [
    'motivated', 'inspired', 'determined', 'driven', 'fired up', 'eager',
    'excited', 'passionate', 'pumped', 'enthusiastic', 'can\'t wait to'
  ],
  [MentalStateType.MOTIVATION_LOW]: [
    'unmotivated', 'uninspired', 'apathetic', 'bored', 'don\'t care',
    'lost interest', 'no motivation', 'stuck', 'lack of motivation', 'tired of',
    'giving up', 'quit', 'burnout', 'burned out'
  ],
  [MentalStateType.NEUTRAL]: [
    'normal', 'fine', 'okay', 'alright', 'so-so', 'neutral', 'balanced',
    'steady', 'stable', 'even-keeled'
  ]
};

/**
 * Intensity modifiers that can increase the detected intensity
 */
const intensityModifiers: string[] = [
  'very', 'extremely', 'incredibly', 'really', 'so', 'totally',
  'completely', 'absolutely', 'utterly', 'thoroughly', 'deeply',
  'intensely', 'seriously', 'badly', 'severely', 'terribly'
];

/**
 * Words that indicate seeking advice
 */
const adviceRequestTerms: string[] = [
  'help', 'advice', 'suggestion', 'tip', 'guidance', 'what should i do',
  'how can i', 'how do i', 'what can i do', 'need help', 'handle this',
  'deal with this', 'overcome this', 'fix this', 'improve this'
];

/**
 * Match-related terms to detect if the mental state is related to a match
 */
const matchRelatedTerms: string[] = [
  'match', 'game', 'tournament', 'championship', 'competition', 'played',
  'opponent', 'score', 'point', 'court', 'beat', 'won', 'lost', 'defeated',
  'winning', 'losing', 'victory', 'defeat', 'performance', 'played against',
  'during the game', 'in my match', 'at the tournament'
];

/**
 * Analyze the mental state expressed in a message
 */
export function analyzeMentalState(message: string): MentalStateAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Default to neutral if no mental state is detected
  let primaryState = MentalStateType.NEUTRAL;
  let maxMatches = 0;
  
  // Check each mental state for matches
  Object.entries(mentalStateKeywords).forEach(([state, keywords]) => {
    let matches = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matches++;
      }
    });
    
    if (matches > maxMatches) {
      maxMatches = matches;
      primaryState = state as MentalStateType;
    }
  });
  
  // Calculate intensity (scale 1-5)
  // Base intensity from 1-3 based on number of matches
  let intensity = Math.min(3, Math.max(1, Math.ceil(maxMatches / 2)));
  
  // Increase intensity if intensity modifiers are present
  intensityModifiers.forEach(modifier => {
    if (lowerMessage.includes(modifier)) {
      intensity = Math.min(5, intensity + 1); // Cap at 5
    }
  });
  
  // For repeated words or exclamation marks, increase intensity
  if (lowerMessage.includes('!')) {
    const exclamationCount = (lowerMessage.match(/!/g) || []).length;
    intensity = Math.min(5, intensity + Math.min(2, Math.floor(exclamationCount / 2)));
  }
  
  // Check if the mental state is related to a match
  const isMatchRelated = matchRelatedTerms.some(term => lowerMessage.includes(term));
  
  // Determine sentiment based on the mental state type
  let sentiment: 'positive' | 'negative' | 'neutral';
  
  // Group mental states by sentiment
  const positiveStates = [
    MentalStateType.VICTORY_ELATION,
    MentalStateType.VICTORY_RELIEF,
    MentalStateType.CONFIDENCE_GAIN,
    MentalStateType.MOTIVATION_HIGH
  ];
  
  const negativeStates = [
    MentalStateType.DEFEAT_FRUSTRATION,
    MentalStateType.DEFEAT_DISAPPOINTMENT,
    MentalStateType.PRESSURE_ANXIETY,
    MentalStateType.FOCUS_ISSUE,
    MentalStateType.CONFIDENCE_LOSS,
    MentalStateType.MOTIVATION_LOW
  ];
  
  // Determine sentiment
  if (positiveStates.includes(primaryState)) {
    sentiment = 'positive';
  } else if (negativeStates.includes(primaryState)) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  // Determine relevant CourtIQ dimension
  let relevantDimension: DimensionCode = 'MENT'; // Default to Mental dimension
  
  // Group mental states by relevant dimension
  const mentalFocusStates = [
    MentalStateType.FOCUS_ISSUE,
    MentalStateType.PRESSURE_ANXIETY,
    MentalStateType.CONFIDENCE_LOSS,
    MentalStateType.CONFIDENCE_GAIN
  ];
  
  const consistencyFocusStates = [
    MentalStateType.MOTIVATION_LOW,
    MentalStateType.MOTIVATION_HIGH
  ];
  
  // Adjust dimension based on mental state
  if (mentalFocusStates.includes(primaryState)) {
    relevantDimension = 'MENT'; // Mental focus issues
  } else if (consistencyFocusStates.includes(primaryState)) {
    relevantDimension = 'CONS'; // Motivation often affects consistency
  } else if (lowerMessage.includes('technique') || lowerMessage.includes('technical') || lowerMessage.includes('shot')) {
    relevantDimension = 'TECH'; // Technical concerns mentioned
  } else if (lowerMessage.includes('strategy') || lowerMessage.includes('tactical') || lowerMessage.includes('position')) {
    relevantDimension = 'TACT'; // Tactical concerns mentioned
  }
  
  // Check if the message is seeking advice
  const seeksAdvice = adviceRequestTerms.some(term => lowerMessage.includes(term)) ||
                      lowerMessage.includes('?');
  
  return {
    primaryState,
    intensity,
    isMatchRelated,
    sentiment,
    relevantDimension,
    seeksAdvice
  };
}

/**
 * Generate a response based on the mental state analysis
 */
export function generateMentalStateResponse(
  analysis: MentalStateAnalysis,
  userName: string
): string {
  const { primaryState, intensity, isMatchRelated, sentiment, relevantDimension, seeksAdvice } = analysis;
  
  // Base responses for each mental state
  const baseResponses: Record<MentalStateType, string[]> = {
    [MentalStateType.VICTORY_ELATION]: [
      `Congratulations on your win, ${userName}! It's great to celebrate victories. This positive energy can be channeled into your next practice session.`,
      `That's fantastic! Winning feels great, and acknowledging your success is important. Consider journaling about what went well so you can replicate it in future matches.`,
      `Well done on your victory! Take a moment to appreciate your achievement while also reflecting on what specific skills or tactics contributed to your success.`
    ],
    [MentalStateType.VICTORY_RELIEF]: [
      `I can sense your relief after that win, ${userName}. Close matches can be mentally draining, but they're also great opportunities for growth.`,
      `Getting through a challenging match successfully builds both confidence and resilience. What aspect of your game helped you pull through when it mattered most?`,
      `That breakthrough win is significant. The mental fortitude you developed through this challenge will serve you well in future tight matches.`
    ],
    [MentalStateType.DEFEAT_FRUSTRATION]: [
      `I understand your frustration with the loss, ${userName}. It's natural to feel this way, but remember that setbacks are part of any player's journey.`,
      `Channeling that frustration into focused practice can be transformative. Would it help to identify specific aspects of your game to work on?`,
      `Losses, especially frustrating ones, often reveal the most important areas for improvement. When you're ready, we can analyze what specific skills to develop.`
    ],
    [MentalStateType.DEFEAT_DISAPPOINTMENT]: [
      `I'm sorry about your disappointing match, ${userName}. It's okay to feel down after a loss—acknowledging these emotions is part of the mental game.`,
      `Disappointment after a loss shows how much you care about your performance, which is a strength. Given some time, this experience can motivate meaningful improvement.`,
      `Falling short of expectations is difficult, but every champion has faced similar moments. Would tracking specific aspects of your game help provide a sense of progress?`
    ],
    [MentalStateType.PRESSURE_ANXIETY]: [
      `Pre-match nerves and anxiety are something even professionals experience, ${userName}. Let's work on some techniques to manage that pressure.`,
      `Feeling pressured before or during important points is common. Have you tried implementing a consistent pre-point routine to reset your mind?`,
      `Tournament pressure affects your mental and physical game. Breathing exercises and visualization techniques can help channel that nervous energy productively.`
    ],
    [MentalStateType.FOCUS_ISSUE]: [
      `Maintaining focus throughout a match is challenging for many players, ${userName}. Small rituals between points can help reset your concentration.`,
      `Focus fluctuates naturally during play. Developing a specific routine between points—like adjusting your strings or taking a deep breath—can bring you back to the present.`,
      `Distractions happen to everyone. The key is developing the skill to recognize when your mind wanders and having tools to quickly refocus on the task at hand.`
    ],
    [MentalStateType.CONFIDENCE_LOSS]: [
      `Confidence ebbs and flows for all players, ${userName}. When it dips, focusing on process goals rather than outcomes can help rebuild it gradually.`,
      `A confidence dip is challenging but temporary. Returning to fundamentals and celebrating small improvements can help restore your self-belief.`,
      `Self-doubt is part of the athletic journey. Consider keeping a "wins journal" where you record even small successes in practice and matches.`
    ],
    [MentalStateType.CONFIDENCE_GAIN]: [
      `That growing confidence is a powerful asset, ${userName}! It creates a positive cycle where belief leads to better performance, which builds more confidence.`,
      `I'm glad to hear you're feeling more confident. This is the perfect time to challenge yourself with new skills or tactics while your self-belief is strong.`,
      `Confidence transforms your game. As you maintain this positive mindset, consider how you can preserve this feeling through documentation or mental anchors.`
    ],
    [MentalStateType.MOTIVATION_HIGH]: [
      `Your enthusiasm is fantastic, ${userName}! This is the perfect time to set specific, challenging goals that harness this motivation.`,
      `High motivation is an excellent state for skill development. What specific aspect of your game would you like to channel this energy toward?`,
      `I love your passion for improvement! Let's structure this motivation into a progressive training plan that builds on your current skills.`
    ],
    [MentalStateType.MOTIVATION_LOW]: [
      `Motivation naturally fluctuates, ${userName}. Sometimes taking a short break or changing up your routine can reignite your passion for the game.`,
      `When motivation dips, setting smaller, achievable goals can help rebuild momentum. What's one simple aspect of your game you could focus on?`,
      `Low motivation periods are normal. Sometimes playing for pure enjoyment rather than improvement can reconnect you with your love for pickleball.`
    ],
    [MentalStateType.NEUTRAL]: [
      `Maintaining a balanced perspective is valuable in pickleball, ${userName}. This even-keeled approach serves players well through the ups and downs of the sport.`,
      `Your steady attitude creates a solid foundation for consistent improvement. What aspect of your game would you like to focus on developing next?`,
      `A calm, measured approach to your development allows for thoughtful progress. Is there a particular area of your game you're currently curious about?`
    ]
  };
  
  // Choose a response based on intensity
  const responseIndex = Math.min(2, intensity - 1);
  let response = baseResponses[primaryState][responseIndex];
  
  // Add dimension-specific advice if seeking advice
  if (seeksAdvice) {
    switch (relevantDimension) {
      case 'TECH':
        response += ` For technical development, I recommend focusing on repeatable mechanics through deliberate practice. Would you like me to suggest specific drills for your shots?`;
        break;
      case 'TACT':
        response += ` From a tactical perspective, analyzing patterns in your matches can reveal strategic adjustments. Would you like to explore specific tactical approaches?`;
        break;
      case 'PHYS':
        response += ` Physical conditioning specifically for pickleball can help with performance consistency. Would you like some pickleball-specific fitness suggestions?`;
        break;
      case 'MENT':
        response += ` Mental skills require practice just like physical ones. Techniques like visualization, positive self-talk, and routine development can strengthen your mental game. Would you like to explore specific mental training exercises?`;
        break;
      case 'CONS':
        response += ` Consistency comes from structured practice and mental discipline. Creating a regular training schedule with measurable goals can help track your progress. Would you like help developing a consistency-focused training plan?`;
        break;
    }
  }
  
  // Add a journaling suggestion if appropriate
  if ((sentiment === 'negative' || intensity > 3) && !response.includes('journal')) {
    response += ` Consider journaling about this experience—recording your thoughts and emotions can provide valuable insights for your mental game development.`;
  }
  
  // Add match-specific context if relevant
  const nonNeutralStates = [
    MentalStateType.VICTORY_ELATION, 
    MentalStateType.VICTORY_RELIEF,
    MentalStateType.DEFEAT_FRUSTRATION,
    MentalStateType.DEFEAT_DISAPPOINTMENT,
    MentalStateType.PRESSURE_ANXIETY,
    MentalStateType.FOCUS_ISSUE,
    MentalStateType.CONFIDENCE_LOSS,
    MentalStateType.CONFIDENCE_GAIN,
    MentalStateType.MOTIVATION_HIGH,
    MentalStateType.MOTIVATION_LOW
  ];
  
  if (isMatchRelated && nonNeutralStates.includes(primaryState) && !response.includes('match analysis')) {
    response += ` A structured match analysis looking at technical, tactical, physical, and mental aspects can transform this experience into actionable insights.`;
  }
  
  return response;
}