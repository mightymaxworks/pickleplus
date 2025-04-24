/**
 * PKL-278651-COACH-0004-PHYS-PROC
 * Physical Fitness Processor for SAGE
 * 
 * This file provides methods to recognize and respond to physical fitness-related
 * terminology and expressions in player conversations, enhancing SAGE's ability
 * to provide targeted coaching on the Physical Fitness dimension of CourtIQ.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { type DimensionCode } from '../types/courtiq';
import { getDimensionResponse, getImprovementResponse } from './courtIQResponses';

/**
 * Result from analyzing a message for physical fitness-related content
 */
export interface PhysicalFitnessAnalysis {
  /** The primary physical fitness topic detected */
  primaryArea: PhysicalFitnessArea;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a physical issue */
  hasIssue: boolean;
  /** The specific physical issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking fitness advice */
  seekingFitnessAdvice: boolean;
  /** The relevant age group for advice (youth, adult, senior) */
  relevantAgeGroup: 'youth' | 'adult' | 'senior';
  /** The current fitness level indicated */
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Physical fitness areas that can be detected
 */
export enum PhysicalFitnessArea {
  AGILITY = 'agility',
  BALANCE = 'balance',
  COORDINATION = 'coordination',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  FOOTWORK = 'footwork',
  INJURY_PREVENTION = 'injury_prevention',
  LATERAL_MOVEMENT = 'lateral_movement',
  POWER = 'power',
  QUICKNESS = 'quickness',
  REACTION_TIME = 'reaction_time',
  RECOVERY = 'recovery',
  SPEED = 'speed',
  STAMINA = 'stamina',
  STRENGTH = 'strength',
  WARMING_UP = 'warming_up',
  NONE = 'none'
}

/**
 * Keywords associated with each physical fitness area
 */
const physicalAreaKeywords: Record<PhysicalFitnessArea, string[]> = {
  [PhysicalFitnessArea.AGILITY]: [
    'agility', 'agile', 'nimble', 'change direction', 'quick movement', 'ladder drills',
    'cone drills', 'shuttle', 'quick feet', 'footwork drills', 'explosive movement'
  ],
  [PhysicalFitnessArea.BALANCE]: [
    'balance', 'stability', 'core strength', 'equilibrium', 'centered', 'posture',
    'weight transfer', 'stance', 'center of gravity', 'proprioception', 'wobble'
  ],
  [PhysicalFitnessArea.COORDINATION]: [
    'coordination', 'hand-eye', 'rhythm', 'timing', 'fluidity', 'smoothness',
    'synchronization', 'control', 'precision', 'motor skills', 'movement patterns'
  ],
  [PhysicalFitnessArea.ENDURANCE]: [
    'endurance', 'stamina', 'cardio', 'long games', 'fatigue', 'tired', 'winded',
    'conditioning', 'aerobic', 'cardiovascular', 'last longer', 'gas', 'tank empty'
  ],
  [PhysicalFitnessArea.FLEXIBILITY]: [
    'flexibility', 'stretching', 'mobility', 'range of motion', 'tight muscles',
    'limberness', 'supple', 'elastic', 'reach shots', 'stiff', 'loosen up'
  ],
  [PhysicalFitnessArea.FOOTWORK]: [
    'footwork', 'foot speed', 'foot positioning', 'split step', 'ready position',
    'recover position', 'shuffle', 'pivot', 'stepping pattern', 'court coverage'
  ],
  [PhysicalFitnessArea.INJURY_PREVENTION]: [
    'injury', 'prevent injury', 'protection', 'safety', 'pain', 'hurt', 'ache',
    'strain', 'soreness', 'warm-up', 'cool-down', 'recovery', 'overuse'
  ],
  [PhysicalFitnessArea.LATERAL_MOVEMENT]: [
    'lateral', 'side to side', 'sideways', 'shuffle', 'sliding', 'lateral quickness',
    'slide step', 'lateral agility', 'moving laterally', 'court width'
  ],
  [PhysicalFitnessArea.POWER]: [
    'power', 'powerful', 'strength', 'force', 'explosive', 'drive', 'smash',
    'overhead', 'third shot drive', 'put away', 'hitting harder'
  ],
  [PhysicalFitnessArea.QUICKNESS]: [
    'quickness', 'quick', 'fast', 'rapid', 'swift', 'reaction', 'instant',
    'reflexes', 'reactive', 'speed', 'prompt', 'sudden'
  ],
  [PhysicalFitnessArea.REACTION_TIME]: [
    'reaction time', 'reflexes', 'quick response', 'instinct', 'anticipation',
    'read', 'recognition', 'visual cues', 'fast hands', 'reactive', 'response time'
  ],
  [PhysicalFitnessArea.RECOVERY]: [
    'recovery', 'rest', 'recuperate', 'regenerate', 'restore', 'rejuvenate',
    'healing', 'soreness', 'rebuild', 'repair', 'bounce back', 'overtraining'
  ],
  [PhysicalFitnessArea.SPEED]: [
    'speed', 'fast', 'sprinting', 'acceleration', 'velocity', 'burst', 'dash',
    'quick', 'rapid', 'swift', 'tempo', 'pace'
  ],
  [PhysicalFitnessArea.STAMINA]: [
    'stamina', 'endurance', 'staying power', 'lasting', 'tiredness', 'fatigue',
    'energy', 'vitality', 'vigor', 'persistence', 'durability', 'resilience'
  ],
  [PhysicalFitnessArea.STRENGTH]: [
    'strength', 'power', 'force', 'muscle', 'robust', 'sturdy', 'powerful',
    'might', 'intensity', 'vigor', 'resistance training', 'weights'
  ],
  [PhysicalFitnessArea.WARMING_UP]: [
    'warm up', 'warming up', 'warm-up', 'preparation', 'pre-game', 'stretches',
    'dynamic', 'readiness', 'activate', 'prime', 'prep', 'before play'
  ],
  [PhysicalFitnessArea.NONE]: []
};

/**
 * Common physical fitness issues by age group
 */
const commonPhysicalIssues: Record<string, string[]> = {
  'youth': [
    'coordination development', 'proper technique foundation', 'balanced physical development',
    'avoiding early specialization', 'growth-related discomfort', 'consistency in training'
  ],
  'adult': [
    'recovery between sessions', 'balancing training and work', 'addressing muscle imbalances',
    'maintaining flexibility', 'joint stability', 'core strength', 'stamina during long tournaments'
  ],
  'senior': [
    'joint protection', 'maintaining mobility', 'injury prevention', 'adequate warm-up time',
    'recovery strategies', 'pacing during matches', 'adapting to physical limitations'
  ]
};

/**
 * Terms indicating the player is seeking physical fitness advice
 */
const seekingFitnessTerms: string[] = [
  'how should i train', 'what exercises', 'fitness routine', 'workout plan', 'training program',
  'improve my fitness', 'get in shape', 'conditioning help', 'physical preparation',
  'off-court training', 'drills for', 'exercises to', 'strength program', 'cardio for pickleball',
  'how to increase', 'build endurance', 'improve agility', 'fitness tips', 'training advice',
  'help with recovery'
];

/**
 * Terms indicating youth player
 */
const youthTerms: string[] = [
  'child', 'children', 'kid', 'kids', 'young', 'youth', 'junior', 'teen', 'teenager',
  'adolescent', 'school', 'growing', 'growth spurt', 'developmental', 'PE class'
];

/**
 * Terms indicating senior player
 */
const seniorTerms: string[] = [
  'senior', 'older', 'retirement', 'retired', 'age', 'aging', 'elder', 'mature',
  'over 60', 'over 65', 'over 70', 'senior games', 'age group', 'masters'
];

/**
 * Terms indicating beginner fitness level
 */
const beginnerFitnessTerms: string[] = [
  'beginner', 'new to fitness', 'starting out', 'unfit', 'sedentary', 'out of shape',
  'haven\'t exercised', 'novice', 'basic', 'entry level', 'fundamental', 'just starting'
];

/**
 * Terms indicating advanced fitness level
 */
const advancedFitnessTerms: string[] = [
  'advanced', 'athletic', 'fit', 'experienced', 'high level', 'competitive', 'elite',
  'serious training', 'intense workouts', 'athlete', 'high performance', 'very active'
];

/**
 * Analyzes a message for physical fitness-related content
 */
export function analyzePhysicalFitness(message: string): PhysicalFitnessAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Initialize analysis object
  const analysis: PhysicalFitnessAnalysis = {
    primaryArea: PhysicalFitnessArea.NONE,
    confidence: 1,
    hasIssue: false,
    seekingFitnessAdvice: false,
    relevantAgeGroup: 'adult',
    fitnessLevel: 'intermediate'
  };
  
  // Detect seeking fitness advice
  analysis.seekingFitnessAdvice = seekingFitnessTerms.some(term => lowerMessage.includes(term));
  
  // Determine age group
  if (youthTerms.some(term => lowerMessage.includes(term))) {
    analysis.relevantAgeGroup = 'youth';
  } else if (seniorTerms.some(term => lowerMessage.includes(term))) {
    analysis.relevantAgeGroup = 'senior';
  }
  
  // Determine fitness level
  if (beginnerFitnessTerms.some(term => lowerMessage.includes(term))) {
    analysis.fitnessLevel = 'beginner';
  } else if (advancedFitnessTerms.some(term => lowerMessage.includes(term))) {
    analysis.fitnessLevel = 'advanced';
  }
  
  // Detect primary physical fitness area
  let maxMatches = 0;
  let primaryArea = PhysicalFitnessArea.NONE;
  
  for (const area in PhysicalFitnessArea) {
    if (area === PhysicalFitnessArea.NONE) continue;
    
    const keywords = physicalAreaKeywords[area as PhysicalFitnessArea];
    let matches = 0;
    
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matches++;
      }
    });
    
    if (matches > maxMatches) {
      maxMatches = matches;
      primaryArea = area as PhysicalFitnessArea;
    }
  }
  
  analysis.primaryArea = primaryArea;
  
  // Set confidence level based on number of keyword matches and message length
  if (maxMatches > 0) {
    // Start with a base confidence of 3
    analysis.confidence = 3;
    
    // Adjust confidence based on number of matches
    if (maxMatches >= 3) analysis.confidence = 5;
    else if (maxMatches === 2) analysis.confidence = 4;
    
    // Reduce confidence for very short messages
    if (message.length < 15 && analysis.confidence > 2) {
      analysis.confidence--;
    }
    
    // Increase confidence if seeking fitness advice
    if (analysis.seekingFitnessAdvice && analysis.confidence < 5) {
      analysis.confidence++;
    }
  } else {
    // No keywords matched
    analysis.confidence = 1;
  }
  
  // Detect if there's an issue
  const issueIndicators = [
    'problem', 'issue', 'trouble', 'struggling', 'difficult', 'can\'t', 'cannot',
    'not able', 'need help', 'improve', 'better', 'hurt', 'pain', 'ache', 'injury',
    'fatigue', 'tired', 'sore', 'strain', 'weak', 'slow', 'stiff'
  ];
  
  analysis.hasIssue = issueIndicators.some(term => lowerMessage.includes(term));
  
  // If there's an issue, try to determine what it is
  if (analysis.hasIssue) {
    const relevantIssues = commonPhysicalIssues[analysis.relevantAgeGroup] || [];
    let specificIssue = '';
    
    // Try to match with a known common issue for the age group
    const foundIssue = relevantIssues.find(issue => {
      return lowerMessage.includes(issue.toLowerCase());
    });
    
    if (foundIssue) {
      specificIssue = foundIssue;
    } else {
      // Otherwise, use a general description based on the primary area
      if (analysis.primaryArea !== PhysicalFitnessArea.NONE) {
        // Convert enum to readable format (replace underscores with spaces and capitalize)
        const readableArea = analysis.primaryArea
          .replace('_', ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        if (relevantIssues.length > 0) {
          // Pick a random issue if we can't determine a specific one
          const randomIndex = Math.floor(Math.random() * relevantIssues.length);
          specificIssue = `${readableArea} concerns related to ${relevantIssues[randomIndex]}`;
        } else {
          specificIssue = `${readableArea} improvement needed`;
        }
      }
    }
    
    analysis.specificIssue = specificIssue;
  }
  
  return analysis;
}

/**
 * Generate physical fitness improvement tips for a specific area
 * 
 * @param fitnessArea The physical fitness area
 * @param ageGroup The age group (youth, adult, senior)
 * @param fitnessLevel The fitness level (beginner, intermediate, advanced)
 * @returns An array of improvement tips
 */
export function generatePhysicalFitnessTips(
  fitnessArea: PhysicalFitnessArea,
  ageGroup: 'youth' | 'adult' | 'senior',
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  // Base tips that apply to all age groups and fitness levels
  const baseTips: Record<PhysicalFitnessArea, string[]> = {
    [PhysicalFitnessArea.AGILITY]: [
      "Practice ladder drills focusing on quick, precise foot movements",
      "Use cone patterns that simulate pickleball movement patterns",
      "Incorporate shuttles and direction-change exercises in your training"
    ],
    [PhysicalFitnessArea.BALANCE]: [
      "Strengthen your core with planks and stability exercises",
      "Practice single-leg balance drills, gradually increasing difficulty",
      "Work on weight transfer drills that mimic pickleball shots"
    ],
    [PhysicalFitnessArea.COORDINATION]: [
      "Use ball-bouncing exercises with your paddle to improve hand-eye coordination",
      "Practice multi-tasking drills that combine movement and object control",
      "Incorporate rhythm-based exercises to improve timing and synchronization"
    ],
    [PhysicalFitnessArea.ENDURANCE]: [
      "Build a base of aerobic fitness with steady-state cardio sessions",
      "Gradually increase duration of practice sessions to build sport-specific endurance",
      "Use interval training to mimic the start-stop nature of pickleball points"
    ],
    [PhysicalFitnessArea.FLEXIBILITY]: [
      "Develop a daily stretching routine targeting major muscle groups used in pickleball",
      "Incorporate dynamic stretching before play and static stretching after",
      "Try yoga or mobility exercises designed for racquet sports players"
    ],
    [PhysicalFitnessArea.FOOTWORK]: [
      "Practice split-step timing to improve first-move quickness",
      "Work on recovery steps to quickly return to ready position",
      "Develop efficient sideways movement patterns using proper footwork techniques"
    ],
    [PhysicalFitnessArea.INJURY_PREVENTION]: [
      "Strengthen supportive muscles around vulnerable joints like shoulders and knees",
      "Always perform proper warm-up and cool-down routines",
      "Listen to your body and adjust training intensity when needed"
    ],
    [PhysicalFitnessArea.LATERAL_MOVEMENT]: [
      "Practice side-to-side shuffle drills, maintaining proper athletic posture",
      "Use resistance bands to strengthen lateral movement muscles",
      "Work on quick direction changes while maintaining balance"
    ],
    [PhysicalFitnessArea.POWER]: [
      "Incorporate plyometric exercises to develop explosive movement",
      "Use medicine ball exercises that mimic pickleball striking motions",
      "Work on transferring force from legs through core to upper body"
    ],
    [PhysicalFitnessArea.QUICKNESS]: [
      "Practice reaction drills responding to visual cues",
      "Use small, fast movements to improve neural firing rate",
      "Work on accelerating and decelerating quickly in controlled patterns"
    ],
    [PhysicalFitnessArea.REACTION_TIME]: [
      "Try ball-drop drills where you must react to unpredictable stimuli",
      "Practice partner drills where you respond to their movements",
      "Work with reaction training apps or tools designed for athletes"
    ],
    [PhysicalFitnessArea.RECOVERY]: [
      "Ensure adequate sleep and nutrition between training sessions",
      "Use active recovery methods like light movement on rest days",
      "Consider contrast therapy (alternating hot and cold) for muscle recovery"
    ],
    [PhysicalFitnessArea.SPEED]: [
      "Incorporate sprint training with proper technique",
      "Focus on acceleration mechanics from a standstill",
      "Practice moving quickly in game-specific patterns"
    ],
    [PhysicalFitnessArea.STAMINA]: [
      "Build muscular endurance with high-rep, low-weight exercises",
      "Train with circuits that challenge both cardiovascular and muscular systems",
      "Gradually increase training volume to improve overall work capacity"
    ],
    [PhysicalFitnessArea.STRENGTH]: [
      "Develop functional strength using compound movements",
      "Focus on core and lower body strength for a solid foundation",
      "Include resistance training 2-3 times per week with adequate recovery"
    ],
    [PhysicalFitnessArea.WARMING_UP]: [
      "Create a progressive warm-up routine that gradually increases intensity",
      "Include dynamic movements that prepare the body for pickleball-specific actions",
      "Tailor your warm-up duration based on conditions and your body's needs"
    ],
    [PhysicalFitnessArea.NONE]: [
      "Focus on overall fitness with a balanced approach to strength, flexibility, and endurance",
      "Identify specific physical aspects of your game that need improvement",
      "Work with a fitness professional to develop a pickleball-specific training plan"
    ]
  };

  // Get base tips for the specified area
  let tips = [...baseTips[fitnessArea]];
  
  // Add age-specific modifications
  if (ageGroup === 'youth') {
    if (fitnessArea === PhysicalFitnessArea.STRENGTH) {
      tips.push("Focus on bodyweight exercises and proper technique before adding external resistance");
      tips.push("Emphasize overall athletic development rather than specialization");
    } else if (fitnessArea === PhysicalFitnessArea.INJURY_PREVENTION) {
      tips.push("Ensure adequate rest and recovery to support growth and development");
      tips.push("Learn proper mechanics early to prevent compensatory movement patterns");
    }
  } else if (ageGroup === 'senior') {
    if (fitnessArea === PhysicalFitnessArea.AGILITY) {
      tips.push("Focus on controlled movements with emphasis on stability and safety");
      tips.push("Use supportive footwear and appropriate surfaces to reduce joint stress");
    } else if (fitnessArea === PhysicalFitnessArea.RECOVERY) {
      tips.push("Allow for longer recovery periods between intense training sessions");
      tips.push("Consider low-impact cross-training activities to maintain fitness while recovering");
    }
  }
  
  // Add fitness level-specific modifications
  if (fitnessLevel === 'beginner') {
    if (fitnessArea === PhysicalFitnessArea.ENDURANCE) {
      tips.push("Start with shorter sessions and gradually increase duration as fitness improves");
      tips.push("Focus on consistency rather than intensity in the early stages");
    }
  } else if (fitnessLevel === 'advanced') {
    if (fitnessArea === PhysicalFitnessArea.POWER) {
      tips.push("Incorporate periodized training to peak for important tournaments");
      tips.push("Add sport-specific power training that mimics game situations under fatigue");
    }
  }
  
  return tips;
}

/**
 * Generates a response focused on physical fitness
 */
export function generatePhysicalFitnessResponse(
  analysis: PhysicalFitnessAnalysis,
  includeSpecificAdvice: boolean = true
): string {
  // Start with a general response for the Physical Fitness dimension
  let response = getDimensionResponse('PHYS');
  
  // If no specific area was detected or confidence is low
  if (analysis.primaryArea === PhysicalFitnessArea.NONE || analysis.confidence < 2) {
    response += "\n\nTo provide more specific physical training advice, could you tell me which aspect of physical fitness you'd like to focus on? For example: agility, balance, endurance, flexibility, footwork, or strength.";
    return response;
  }
  
  // Add area-specific advice
  if (includeSpecificAdvice) {
    // For footwork, balance, etc. we can use the improvementResponse system
    if (analysis.primaryArea === PhysicalFitnessArea.FOOTWORK ||
        analysis.primaryArea === PhysicalFitnessArea.BALANCE ||
        analysis.primaryArea === PhysicalFitnessArea.ENDURANCE ||
        analysis.primaryArea === PhysicalFitnessArea.AGILITY) {
      
      const specificResponse = getImprovementResponse('PHYS', analysis.primaryArea);
      if (specificResponse) {
        response += "\n\n" + specificResponse;
      }
    }
    
    // Add custom advice based on the analysis
    const tips = generatePhysicalFitnessTips(
      analysis.primaryArea,
      analysis.relevantAgeGroup,
      analysis.fitnessLevel
    );
    
    if (tips.length > 0) {
      // Add 2-3 tips max to avoid overwhelming
      const numTipsToAdd = Math.min(2, tips.length);
      response += "\n\nHere are some specific training suggestions:";
      
      for (let i = 0; i < numTipsToAdd; i++) {
        response += "\n• " + tips[i];
      }
    }
    
    // If there's a specific issue identified, address it
    if (analysis.hasIssue && analysis.specificIssue) {
      response += `\n\nRegarding ${analysis.specificIssue}, this is a common challenge. `;
      
      // Add age-specific advice for the issue
      if (analysis.relevantAgeGroup === 'youth') {
        response += "For younger players, focus on building proper fundamentals and making training fun and varied. ";
      } else if (analysis.relevantAgeGroup === 'senior') {
        response += "As we age, it becomes more important to listen to your body and modify activities as needed while still maintaining consistency. ";
      }
      
      response += "Would you like me to provide a more detailed plan to address this specific challenge?";
    }
  }
  
  // Add a follow-up question to encourage further dialogue
  if (analysis.seekingFitnessAdvice) {
    response += "\n\nWould you like me to create a specific training routine focused on " + 
      analysis.primaryArea.replace('_', ' ') + " for your " + analysis.fitnessLevel + " level?";
  } else {
    response += "\n\nHow would you describe your current physical training routine for pickleball?";
  }
  
  return response;
}