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

import { DimensionCode } from '@shared/schema/sage';

/**
 * Result from analyzing a message for physical fitness-related content
 */
export interface PhysicalFitnessAnalysis {
  /** The primary physical component detected */
  primaryComponent: PhysicalComponent;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a physical fitness issue */
  hasIssue: boolean;
  /** The specific physical issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking physical fitness advice */
  seekingFitnessAdvice: boolean;
  /** The relevant training type for advice */
  trainingType: 'on-court' | 'off-court' | 'both';
  /** Indicates whether injury or recovery is mentioned */
  injuryMentioned: boolean;
}

/**
 * Physical fitness components that can be detected
 */
export enum PhysicalComponent {
  AGILITY = 'agility',
  SPEED = 'speed',
  ENDURANCE = 'endurance',
  STRENGTH = 'strength',
  BALANCE = 'balance',
  FLEXIBILITY = 'flexibility',
  REACTION_TIME = 'reaction_time',
  COORDINATION = 'coordination',
  EXPLOSIVENESS = 'explosiveness',
  COURT_MOVEMENT = 'court_movement',
  RECOVERY = 'recovery',
  INJURY_PREVENTION = 'injury_prevention',
  FATIGUE = 'fatigue',
  HYDRATION = 'hydration',
  NUTRITION = 'nutrition',
  WARMUP = 'warmup',
  NONE = 'none'
}

/**
 * Keywords associated with each physical component
 */
const physicalComponentKeywords: Record<PhysicalComponent, string[]> = {
  [PhysicalComponent.AGILITY]: [
    // Core concepts
    'agility', 'quick movement', 'nimble', 'quickness', 'agile', 'lateral movement',
    'side-to-side', 'change direction', 'direction change', 'quick feet',
    
    // Training references
    'agility training', 'agility drill', 'agility ladder', 'cone drill',
    'shuttle run', 'lateral drill', 'quick feet drill', 'agility exercise',
    
    // Problem indicators
    'not agile enough', 'slow movement', 'slow laterally', 'can\'t move quickly',
    'trouble changing direction', 'slow to react', 'heavy feet', 'sluggish movement',
    
    // Related terms
    'footwork', 'footspeed', 'lateral quickness', 'movement speed', 'agility footwork',
    'side stepping', 'lateral agility', 'directional change', 'quick transitions'
  ],
  [PhysicalComponent.SPEED]: [
    // Core concepts
    'speed', 'fast', 'quick', 'velocity', 'rapid', 'acceleration', 'sprint',
    'speedwork', 'tempo', 'pace', 'swift', 'explosive speed', 'burst of speed',
    
    // Training references
    'speed training', 'speed drill', 'sprint workout', 'acceleration drill',
    'speed development', 'speed exercise', 'tempo training', 'velocity training',
    
    // Problem indicators
    'too slow', 'lacking speed', 'not fast enough', 'slow to the ball', 
    'slow recovery', 'slow movement', 'can\'t get there in time', 'behind the play',
    
    // Related terms
    'quickness', 'first step', 'initial burst', 'top speed', 'speed endurance',
    'rapid movement', 'fast-twitch', 'explosive movement', 'quick start'
  ],
  [PhysicalComponent.ENDURANCE]: [
    // Core concepts
    'endurance', 'stamina', 'cardio', 'cardiovascular', 'aerobic', 'conditioning',
    'fitness level', 'fatigue resistance', 'staying power', 'lasting power',
    
    // Training references
    'endurance training', 'cardio workout', 'conditioning drill', 'aerobic exercise',
    'stamina building', 'endurance exercise', 'cardiovascular training', 'fitness training',
    
    // Problem indicators
    'get tired', 'worn out', 'fatigued', 'exhausted', 'run out of gas', 'winded',
    'out of breath', 'lacking endurance', 'poor stamina', 'tire easily',
    
    // Related terms
    'energy level', 'lasting power', 'sustained effort', 'cardiovascular fitness',
    'aerobic capacity', 'gas tank', 'staying fresh', 'match fitness', 'game endurance'
  ],
  [PhysicalComponent.STRENGTH]: [
    // Core concepts
    'strength', 'power', 'force', 'muscle', 'strong', 'powerful', 'robust',
    'might', 'vigor', 'forceful', 'sturdy', 'potent', 'physical strength',
    
    // Training references
    'strength training', 'resistance training', 'weight training', 'weightlifting',
    'power training', 'resistance exercise', 'strength exercise', 'weight exercise',
    
    // Problem indicators
    'weak', 'lacking strength', 'not strong enough', 'muscle weakness',
    'strength deficit', 'underpowered', 'lacking power', 'physically weak',
    
    // Related terms
    'core strength', 'leg strength', 'arm strength', 'shoulder strength',
    'overall strength', 'functional strength', 'power generation', 'muscular strength',
    'strength development'
  ],
  [PhysicalComponent.BALANCE]: [
    // Core concepts
    'balance', 'equilibrium', 'stability', 'poise', 'steadiness', 'centeredness',
    'balanced', 'stable', 'steady', 'poised', 'centered', 'grounded',
    
    // Training references
    'balance training', 'stability exercise', 'balance drill', 'balance practice',
    'stability training', 'balance workout', 'core stability', 'balance development',
    
    // Problem indicators
    'off balance', 'unbalanced', 'unstable', 'poor balance', 'lack of balance',
    'balance issues', 'stability problems', 'unsteady', 'wobbly', 'tippy',
    
    // Related terms
    'body control', 'weight distribution', 'center of gravity', 'balanced stance',
    'stable position', 'proprioception', 'kinesthetic awareness', 'balanced movement',
    'dynamic balance'
  ],
  [PhysicalComponent.FLEXIBILITY]: [
    // Core concepts
    'flexibility', 'flexible', 'stretch', 'stretching', 'limberness', 'pliability',
    'range of motion', 'ROM', 'supple', 'limber', 'bendable', 'elastic',
    
    // Training references
    'flexibility training', 'stretching routine', 'flexibility exercise', 'stretch workout',
    'mobility training', 'flexibility program', 'dynamic stretching', 'static stretching',
    
    // Problem indicators
    'inflexible', 'stiff', 'tight', 'limited range of motion', 'lacking flexibility',
    'tight muscles', 'muscle tightness', 'joint stiffness', 'restricted movement',
    
    // Related terms
    'joint mobility', 'muscle elasticity', 'movement range', 'dynamic flexibility',
    'static flexibility', 'muscle pliability', 'joint flexibility', 'functional flexibility',
    'mobility'
  ],
  [PhysicalComponent.REACTION_TIME]: [
    // Core concepts
    'reaction time', 'reaction speed', 'quick reaction', 'reflex', 'reflexes',
    'responsiveness', 'response time', 'reactive', 'quick response', 'fast reaction',
    
    // Training references
    'reaction training', 'reflex drill', 'reaction exercise', 'reflex training',
    'response drill', 'reaction practice', 'reflex development', 'reactive training',
    
    // Problem indicators
    'slow reactions', 'slow reflexes', 'delayed response', 'poor reaction time',
    'slow to react', 'sluggish reactions', 'late response', 'reaction lag',
    
    // Related terms
    'visual reaction', 'auditory reaction', 'motor response', 'anticipation',
    'reactive ability', 'neural processing', 'decision speed', 'hand-eye coordination',
    'sensory reaction'
  ],
  [PhysicalComponent.COORDINATION]: [
    // Core concepts
    'coordination', 'coordinated', 'motor control', 'motor skill', 'dexterity',
    'hand-eye coordination', 'body control', 'motor coordination', 'synchronization',
    
    // Training references
    'coordination training', 'coordination drill', 'motor skill exercise',
    'dexterity training', 'hand-eye drill', 'coordination practice', 'skill development',
    
    // Problem indicators
    'uncoordinated', 'poor coordination', 'lack of coordination', 'awkward movement',
    'poor motor control', 'clumsy', 'coordination issues', 'movement dysfunction',
    
    // Related terms
    'movement precision', 'temporal coordination', 'spatial coordination',
    'neuromuscular control', 'visual tracking', 'proprioceptive coordination',
    'fine motor control', 'gross motor control', 'movement efficiency'
  ],
  [PhysicalComponent.EXPLOSIVENESS]: [
    // Core concepts
    'explosiveness', 'explosive', 'power', 'burst', 'quick burst', 'explosive power',
    'explosive strength', 'power output', 'explosive movement', 'explosive force',
    
    // Training references
    'plyometric', 'plyometrics', 'explosive training', 'power training',
    'burst training', 'explosive exercise', 'power development', 'jump training',
    
    // Problem indicators
    'lack of explosiveness', 'not explosive enough', 'lacking power', 'no burst',
    'can\'t generate power quickly', 'slow power development', 'power deficit',
    
    // Related terms
    'rate of force development', 'power-to-weight ratio', 'acceleration',
    'quick-twitch fibers', 'fast-twitch', 'power generation', 'explosive start',
    'reactive power', 'dynamic power'
  ],
  [PhysicalComponent.COURT_MOVEMENT]: [
    // Core concepts
    'court movement', 'movement pattern', 'court coverage', 'footwork pattern',
    'movement efficiency', 'court mobility', 'space coverage', 'movement quality',
    
    // Training references
    'movement drill', 'court movement practice', 'footwork training',
    'movement pattern drill', 'court coverage exercise', 'movement development',
    
    // Problem indicators
    'poor movement', 'inefficient movement', 'wasted movement', 'bad footwork',
    'poor court coverage', 'movement limitations', 'restricted movement', 'ineffective movement',
    
    // Related terms
    'movement economy', 'court positioning', 'positional movement', 'anticipatory movement',
    'recovery movement', 'defensive movement', 'offensive movement', 'lateral movement',
    'forward-backward movement'
  ],
  [PhysicalComponent.RECOVERY]: [
    // Core concepts
    'recovery', 'recuperation', 'rest', 'regeneration', 'restoration', 'rejuvenation',
    'bounce back', 'recuperative', 'healing', 'rehabilitative', 'convalescence',
    
    // Training references
    'recovery protocol', 'active recovery', 'recovery technique', 'recovery method',
    'recovery strategy', 'recovery practice', 'recovery system', 'recovery routine',
    
    // Problem indicators
    'poor recovery', 'slow recovery', 'recovery issues', 'can\'t recover quickly',
    'inadequate recovery', 'recovery problems', 'incomplete recovery', 'recovery deficit',
    
    // Related terms
    'between-point recovery', 'between-game recovery', 'post-match recovery',
    'physical recovery', 'mental recovery', 'recovery nutrition', 'sleep quality',
    'recovery modality', 'tissue recovery'
  ],
  [PhysicalComponent.INJURY_PREVENTION]: [
    // Core concepts
    'injury prevention', 'prehab', 'preventative', 'injury protection', 'preventive care',
    'injury risk reduction', 'protective measures', 'injury proofing', 'body maintenance',
    
    // Training references
    'prehab exercise', 'preventative routine', 'injury prevention program',
    'protective training', 'prevention workout', 'preventative measure', 'maintenance routine',
    
    // Problem indicators
    'injury prone', 'frequently injured', 'recurring injuries', 'injury vulnerability',
    'high injury risk', 'physical vulnerabilities', 'biomechanical issues', 'structural weakness',
    
    // Related terms
    'movement screening', 'functional movement', 'biomechanical assessment',
    'joint stability', 'muscle balance', 'tissue quality', 'structural integrity',
    'movement patterns', 'compensatory movement'
  ],
  [PhysicalComponent.FATIGUE]: [
    // Core concepts
    'fatigue', 'tiredness', 'exhaustion', 'weariness', 'lethargy', 'burnout',
    'overtraining', 'energy depletion', 'overreaching', 'fatigue management',
    
    // Training references
    'energy management', 'fatigue resistance', 'anti-fatigue training',
    'endurance building', 'fatigue threshold work', 'stamina development',
    
    // Problem indicators
    'getting tired', 'always fatigued', 'tiring quickly', 'early exhaustion',
    'chronic fatigue', 'energy issues', 'tired legs', 'fatigue symptoms',
    
    // Related terms
    'central fatigue', 'peripheral fatigue', 'neural fatigue', 'metabolic fatigue',
    'cumulative fatigue', 'fatigue curve', 'energy systems', 'lactate threshold',
    'glycogen depletion'
  ],
  [PhysicalComponent.HYDRATION]: [
    // Core concepts
    'hydration', 'fluid balance', 'water intake', 'fluid intake', 'hydration status',
    'rehydration', 'fluid replacement', 'water balance', 'hydration protocol',
    
    // Training references
    'hydration strategy', 'fluid replacement protocol', 'hydration plan',
    'electrolyte replacement', 'hydration monitoring', 'fluid intake schedule',
    
    // Problem indicators
    'dehydration', 'dehydrated', 'poor hydration', 'inadequate fluid intake',
    'thirst', 'dark urine', 'hydration issues', 'fluid deficit', 'water loss',
    
    // Related terms
    'electrolyte balance', 'sodium replacement', 'potassium balance', 'sweat rate',
    'fluid dynamics', 'cellular hydration', 'hydration testing', 'osmolality',
    'hydration markers'
  ],
  [PhysicalComponent.NUTRITION]: [
    // Core concepts
    'nutrition', 'diet', 'food intake', 'eating habits', 'fueling', 'nourishment',
    'dietary approach', 'nutritional strategy', 'food plan', 'macronutrients',
    
    // Training references
    'sports nutrition', 'performance diet', 'nutritional protocol', 'fueling strategy',
    'pre-game nutrition', 'post-game nutrition', 'tournament nutrition', 'competition fueling',
    
    // Problem indicators
    'poor nutrition', 'inadequate diet', 'unhealthy eating', 'nutritional deficiencies',
    'improper fueling', 'dietary issues', 'macronutrient imbalance', 'caloric deficit',
    
    // Related terms
    'protein intake', 'carbohydrate loading', 'fat utilization', 'micronutrients',
    'meal timing', 'nutrient density', 'anti-inflammatory diet', 'energy availability',
    'metabolic health'
  ],
  [PhysicalComponent.WARMUP]: [
    // Core concepts
    'warmup', 'warm up', 'warming up', 'pre-game routine', 'pre-match preparation',
    'activation', 'priming', 'readiness routine', 'preparation protocol', 'pre-play routine',
    
    // Training references
    'dynamic warmup', 'activation routine', 'mobility warmup', 'movement preparation',
    'neural activation', 'warmup protocol', 'pre-game activation', 'preparation sequence',
    
    // Problem indicators
    'inadequate warmup', 'poor preparation', 'insufficient warmup', 'cold start',
    'no warmup', 'rushed warmup', 'incomplete preparation', 'preparation issues',
    
    // Related terms
    'tissue temperature', 'muscle activation', 'neural priming', 'joint mobilization',
    'dynamic stretching', 'movement rehearsal', 'preparatory activities', 'physiological readiness',
    'performance preparation'
  ],
  [PhysicalComponent.NONE]: []
};

/**
 * Injury-related terms
 */
const injuryTerms: string[] = [
  'injury', 'hurt', 'pain', 'ache', 'sore', 'strain', 'sprain', 'tear', 'rupture',
  'inflammation', 'swelling', 'bruise', 'damaged', 'pulled muscle', 'torn ligament',
  'tendonitis', 'tendinopathy', 'plantar fasciitis', 'tennis elbow', 'golfer\'s elbow',
  'shin splints', 'stress fracture', 'rotator cuff', 'back pain', 'knee pain',
  'ankle pain', 'shoulder pain', 'wrist pain', 'elbow pain', 'hip pain',
  'hamstring', 'quad', 'calf', 'achilles', 'IT band', 'rehabilitation', 'rehab',
  'recovery', 'healing', 'treatment', 'physical therapy', 'PT', 'sports medicine',
  'doctor', 'medical', 'diagnosis', 'MRI', 'X-ray', 'scan', 'surgery', 'operation'
];

/**
 * Terms indicating the player is seeking fitness advice
 */
const fitnessAdviceTerms: string[] = [
  'fitness', 'conditioning', 'training', 'workout', 'exercise', 'drill', 'program',
  'regimen', 'routine', 'physical preparation', 'athletic development', 'physical training',
  'fitness plan', 'training plan', 'exercise program', 'workout routine', 'fitness routine',
  'physical development', 'strength and conditioning', 'performance training',
  'fitness advice', 'training advice', 'exercise recommendation', 'workout suggestion',
  'physical improvement', 'athletic enhancement', 'fitness improvement', 'training improvement'
];

/**
 * Terms indicating on-court training
 */
const onCourtTerms: string[] = [
  'on court', 'on-court', 'court drill', 'court exercise', 'practice session',
  'hitting session', 'court workout', 'practice drill', 'during practice', 'practice routine',
  'court training', 'playing drill', 'game-based', 'match-based', 'simulated play',
  'rally drill', 'movement drill', 'footwork drill', 'shot drill', 'tactical drill',
  'technical drill', 'pickleball drill', 'pickleball exercise', 'pickleball training'
];

/**
 * Terms indicating off-court training
 */
const offCourtTerms: string[] = [
  'off court', 'off-court', 'gym', 'fitness center', 'weight room', 'strength training',
  'weight training', 'cardio training', 'conditioning workout', 'cross training',
  'strength and conditioning', 'fitness workout', 'home workout', 'bodyweight exercise',
  'resistance training', 'plyometric training', 'endurance training', 'flexibility training',
  'mobility work', 'stretching routine', 'yoga', 'pilates', 'cross-fit',
  'gym session', 'training session', 'workout session', 'fitness session'
];

/**
 * Common physical issues by component
 */
const physicalIssuesByComponent: Record<PhysicalComponent, string[]> = {
  [PhysicalComponent.AGILITY]: [
    'slow lateral movement', 'difficulty changing direction quickly', 'poor agility footwork',
    'stiff movement patterns', 'slow transitions between movements', 'limited side-to-side quickness',
    'inefficient directional changes', 'heavy or slow footwork', 'limited acceleration/deceleration'
  ],
  [PhysicalComponent.SPEED]: [
    'slow court coverage', 'delayed first step', 'limited top speed', 'poor acceleration',
    'slow recovery to position', 'inefficient sprinting mechanics', 'limited burst speed',
    'slow movement between shots', 'inadequate speed for fast-paced exchanges'
  ],
  [PhysicalComponent.ENDURANCE]: [
    'early match fatigue', 'declining performance in long points', 'poor recovery between points',
    'inadequate stamina for tournament play', 'rapid breathing/panting during play',
    'performance decline in later games', 'inability to sustain high-intensity effort',
    'excessive sweating early in matches', 'quick energy depletion'
  ],
  [PhysicalComponent.STRENGTH]: [
    'weak shots under pressure', 'limited power generation', 'poor core stability during shots',
    'weak lower body pushing strength', 'inadequate upper body strength for overheads',
    'strength imbalances affecting technique', 'limited strength endurance', 
    'inadequate strength for prolonged kitchen battles', 'weakness in specific muscle groups'
  ],
  [PhysicalComponent.BALANCE]: [
    'off-balance shots', 'unstable during stretching shots', 'poor weight transfer during shots',
    'instability after direction changes', 'difficulty maintaining stable position at kitchen',
    'balance issues during overhead shots', 'uneven weight distribution in ready position',
    'tendency to fall or stumble after shots', 'poor single-leg stability'
  ],
  [PhysicalComponent.FLEXIBILITY]: [
    'limited reach on wide balls', 'stiffness affecting stroke mechanics', 'restricted backswing',
    'tight hip flexors limiting movement', 'hamstring tightness affecting low shots',
    'shoulder inflexibility limiting overhead shots', 'poor trunk rotation for shots',
    'ankle mobility limitations affecting movement', 'general stiffness in movement'
  ],
  [PhysicalComponent.REACTION_TIME]: [
    'slow response to fast shots', 'delayed reaction to kitchen battles', 'inability to handle pace',
    'slow paddle preparation', 'delayed split step timing', 'poor anticipation of shots',
    'slow recognition of ball direction', 'delayed responses at the net', 'late on fast exchanges'
  ],
  [PhysicalComponent.COORDINATION]: [
    'inconsistent contact point', 'poor timing on shots', 'awkward movement patterns',
    'difficulty with complex movement sequences', 'inconsistent paddle-eye coordination',
    'uncoordinated footwork during shots', 'misalignment of body segments during strokes',
    'paddle face control issues', 'timing issues on volleys'
  ],
  [PhysicalComponent.EXPLOSIVENESS]: [
    'weak attacking shots', 'inability to generate shot power quickly', 'slow movement initiation',
    'limited explosive reach for difficult balls', 'weak drive shots', 'insufficient pop on volleys',
    'limited explosive lateral movement', 'inadequate leg drive for power shots',
    'inability to rapidly accelerate to the ball'
  ],
  [PhysicalComponent.COURT_MOVEMENT]: [
    'inefficient movement patterns', 'poor court coverage', 'inappropriate footwork for shots',
    'excessive or wasted movements', 'poor positioning for shots', 'ineffective split step',
    'improper recovery patterns', 'inefficient direction changes', 'limited spatial awareness'
  ],
  [PhysicalComponent.RECOVERY]: [
    'inadequate between-point recovery', 'prolonged fatigue after matches', 'slow heart rate recovery',
    'extended soreness after play', 'limited bounce-back for consecutive matches',
    'inconsistent performance in tournament settings', 'deteriorating performance over time',
    'lingering fatigue from previous sessions', 'inadequate post-match protocols'
  ],
  [PhysicalComponent.INJURY_PREVENTION]: [
    'recurring injuries', 'limited injury prevention routine', 'poor movement mechanics',
    'muscular imbalances', 'inadequate warm-up routine', 'overuse symptoms',
    'limited maintenance exercises', 'poor body awareness during play', 'excessive training load'
  ],
  [PhysicalComponent.FATIGUE]: [
    'early-onset fatigue during play', 'persistent tiredness between sessions',
    'declining performance with fatigue', 'inadequate energy management', 'signs of overtraining',
    'poor recovery between sessions', 'excessive perceived exertion', 'mental fatigue during play',
    'quick transition to anaerobic fatigue'
  ],
  [PhysicalComponent.HYDRATION]: [
    'inadequate fluid intake during play', 'dehydration symptoms', 'performance decline in hot conditions',
    'poor electrolyte replacement', 'cramps during extended play', 'inadequate pre-match hydration',
    'limited hydration strategy', 'thirst during play', 'dark urine color post-play'
  ],
  [PhysicalComponent.NUTRITION]: [
    'inadequate pre-match fueling', 'poor tournament nutrition strategy', 'energy crashes during play',
    'limited recovery nutrition', 'inadequate carbohydrate intake', 'poor meal timing around play',
    'sub-optimal body composition', 'nutritional deficiencies affecting performance',
    'inadequate protein intake for recovery'
  ],
  [PhysicalComponent.WARMUP]: [
    'inadequate pre-match routine', 'cold start to matches', 'limited dynamic preparation',
    'inconsistent warm-up protocol', 'poor activation of key muscle groups', 'rushed warm-up',
    'inappropriate warm-up intensity', 'limited sport-specific preparation', 'static-only stretching'
  ],
  [PhysicalComponent.NONE]: []
};

/**
 * Analyzes a message for physical fitness-related content
 */
export function analyzePhysicalFitness(message: string): PhysicalFitnessAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Detect the primary physical component
  let primaryComponent = PhysicalComponent.NONE;
  let maxKeywords = 0;
  let confidenceScore = 1;
  
  // Check each physical component for matching keywords
  Object.entries(physicalComponentKeywords).forEach(([component, keywords]) => {
    if (component === PhysicalComponent.NONE) return;
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    });
    
    if (matchCount > maxKeywords) {
      maxKeywords = matchCount;
      primaryComponent = component as PhysicalComponent;
      
      // Calculate confidence score (1-5) based on number of matches
      confidenceScore = Math.min(5, Math.max(1, Math.ceil(matchCount / 2)));
    }
  });
  
  // Detect if the user is seeking fitness advice
  const seekingFitnessAdvice = fitnessAdviceTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  ) || primaryComponent !== PhysicalComponent.NONE;
  
  // Determine the training type (on-court, off-court, or both)
  let trainingType: 'on-court' | 'off-court' | 'both' = 'both'; // Default
  
  const hasOnCourtTerms = onCourtTerms.some(term => lowerMessage.includes(term.toLowerCase()));
  const hasOffCourtTerms = offCourtTerms.some(term => lowerMessage.includes(term.toLowerCase()));
  
  if (hasOnCourtTerms && !hasOffCourtTerms) {
    trainingType = 'on-court';
  } else if (hasOffCourtTerms && !hasOnCourtTerms) {
    trainingType = 'off-court';
  }
  
  // Detect if injury or recovery is mentioned
  const injuryMentioned = injuryTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  );
  
  // Detect specific physical issues
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
    lowerMessage.includes('not good enough') ||
    lowerMessage.includes('lacking') ||
    lowerMessage.includes('weak') ||
    lowerMessage.includes('poor');
  
  if (hasIssueIndicators && primaryComponent !== PhysicalComponent.NONE) {
    hasIssue = true;
    
    // Check for specific issues by component
    const componentIssues = physicalIssuesByComponent[primaryComponent];
    
    // See if any specific issues are mentioned in the message
    const matchingIssue = componentIssues.find(issue => 
      lowerMessage.includes(issue.toLowerCase())
    );
    
    // If a specific issue is found, use it; otherwise, select a likely one based on context
    if (matchingIssue) {
      specificIssue = matchingIssue;
    } else if (componentIssues.length > 0) {
      // Select a default issue for this component
      const relevantIssueIndex = Math.floor(Math.random() * componentIssues.length);
      specificIssue = componentIssues[relevantIssueIndex];
    }
  }
  
  return {
    primaryComponent,
    confidence: confidenceScore,
    hasIssue,
    specificIssue,
    seekingFitnessAdvice,
    trainingType,
    injuryMentioned
  };
}

/**
 * Generate physical fitness improvement tips for a specific component
 * 
 * @param component The physical component
 * @param trainingType The training type (on-court, off-court, both)
 * @param injuryMentioned Whether injury was mentioned
 * @returns An array of fitness tips
 */
export function generateFitnessTips(
  component: PhysicalComponent,
  trainingType: 'on-court' | 'off-court' | 'both',
  injuryMentioned: boolean
): string[] {
  if (component === PhysicalComponent.NONE) {
    return [];
  }
  
  // If injury is mentioned, return cautious advice
  if (injuryMentioned) {
    return [
      "Always consult with a healthcare professional before beginning any fitness program when dealing with an injury",
      "Proper rehabilitation under professional guidance should precede any return to training",
      "Focus on gradual progression and listen to your body's signals when recovering",
      "Consider working with a physical therapist to develop a sport-specific rehabilitation program",
      "Avoid painful movements and respect the healing process timeframe"
    ];
  }
  
  // Tips organized by physical component and training type
  const tipsByComponentAndType: Record<PhysicalComponent, Record<string, string[]>> = {
    [PhysicalComponent.AGILITY]: {
      'on-court': [
        "Practice side-to-side shadow drills, moving as if responding to shots",
        "Set up cone patterns on court and practice quick directional changes",
        "Incorporate star drills - sprint to 5 points from center with recovery",
        "Use reaction drills where a partner points to different court areas for you to move to",
        "Practice split-step timing followed by explosive movement in any direction"
      ],
      'off-court': [
        "Incorporate agility ladder drills 2-3 times per week",
        "Practice cone shuttle runs with multiple direction changes",
        "Add lateral plyometric exercises like side jumps and lateral bounds",
        "Include T-drill, 5-10-5 shuttle, and hex drill in your fitness routine",
        "Use dot drills for quick foot placement and precision movement"
      ],
      'both': [
        "Combine on-court movement patterns with off-court agility training",
        "Focus on proper footwork mechanics before adding speed to movements",
        "Build a progressive plan that moves from controlled movements to reactive agility",
        "Include both linear and lateral agility exercises in your program",
        "Practice deceleration and change of direction - the keys to effective court agility"
      ]
    },
    [PhysicalComponent.SPEED]: {
      'on-court': [
        "Practice court sprints - baseline to kitchen line and back with minimal rest",
        "Use chase drills where you sprint to retrieve deliberately wide shots",
        "Work on first-step quickness from ready position to different court areas",
        "Practice sprint-recover-sprint sequences that mimic game situations",
        "Incorporate shadow drills with progressively faster movements"
      ],
      'off-court': [
        "Add linear acceleration training with 10-20 yard sprints",
        "Include hill sprints for both acceleration and overall speed development",
        "Perform plyometric exercises focused on explosive power (box jumps, broad jumps)",
        "Work on sprint mechanics - arm action, knee drive, and posture",
        "Use resisted sprints (bands, sleds) to build specific sprint strength"
      ],
      'both': [
        "Develop a speed program that balances technique work and pure sprint training",
        "Focus on acceleration mechanics first, then top-end speed",
        "Combine plyometric training with on-court movement patterns",
        "Include adequate recovery between speed sessions (48 hours minimum)",
        "Progress gradually from straight-line speed to multi-directional court speed"
      ]
    },
    [PhysicalComponent.ENDURANCE]: {
      'on-court': [
        "Practice extended rally drills with minimal rest between points",
        "Set up court movement patterns that you perform continuously for 30-60 seconds",
        "Use games like 'endless rally' where points continue until a specific score",
        "Incorporate 'suicide' court sprints with progressively shorter rest periods",
        "Create game situation drills that simulate long point patterns"
      ],
      'off-court': [
        "Develop a progressive interval training program (run, bike, row, etc.)",
        "Include tempo training sessions at 70-80% of maximum heart rate",
        "Add circuit training that combines strength and cardio elements",
        "Use the 'Tabata' protocol (20s work/10s rest) with pickleball-specific movements",
        "Incorporate longer steady-state cardio sessions 1-2 times per week"
      ],
      'both': [
        "Balance high-intensity interval training with longer duration moderate work",
        "Create a periodized endurance plan that builds toward tournament season",
        "Combine on-court movement patterns with cardiovascular conditioning",
        "Focus on sport-specific endurance that matches the demands of pickleball",
        "Monitor heart rate recovery as a measure of endurance improvement"
      ]
    },
    [PhysicalComponent.STRENGTH]: {
      'on-court': [
        "Incorporate resistance band work for shot-specific strength",
        "Practice controlled shot sequences with slightly heavier paddles (carefully)",
        "Use medicine ball throws that mimic pickleball movements",
        "Add resistance to specific movements with bands or light ankle/wrist weights",
        "Perform bodyweight exercises between drill sets (squats, lunges, push-ups)"
      ],
      'off-court': [
        "Develop a progressive resistance training program 2-3 times per week",
        "Focus on compound movements (squats, deadlifts, rows, presses)",
        "Include rotational core exercises that mimic pickleball stroke mechanics",
        "Add unilateral (single-arm/leg) exercises to address imbalances",
        "Incorporate medicine ball throws for explosive rotational power"
      ],
      'both': [
        "Create a periodized strength plan that peaks for important competitions",
        "Balance general strength development with pickleball-specific movements",
        "Focus on the posterior chain (hamstrings, glutes, back) often neglected in pickleball",
        "Develop core strength as the foundation for all pickleball movements",
        "Include both maximal strength and power-endurance work appropriate to the sport"
      ]
    },
    [PhysicalComponent.BALANCE]: {
      'on-court': [
        "Practice hitting drills while standing on one leg",
        "Add dynamic balance challenges during warm-up (different foot positions)",
        "Work on controlled shots from challenging positions",
        "Incorporate recovery shots where you must regain balance quickly",
        "Practice transitional balance - moving from stable to unstable positions during play"
      ],
      'off-court': [
        "Use stability tools like BOSU balls, balance boards, or foam pads",
        "Practice single-leg exercises (deadlifts, squats, reaches)",
        "Include yoga poses that challenge static and dynamic balance",
        "Add perturbation training (having a partner lightly push you during balance exercises)",
        "Perform eyes-closed balance exercises to enhance proprioception"
      ],
      'both': [
        "Progress from static balance to dynamic balance to reactive balance challenges",
        "Develop core strength as the foundation for better balance",
        "Work on sport-specific balance that mimics challenging court positions",
        "Focus on ankle and hip stability - the key joints for balance control",
        "Practice balance in both predictable and unpredictable situations"
      ]
    },
    [PhysicalComponent.FLEXIBILITY]: {
      'on-court': [
        "Include dynamic stretching sequences in your warm-up routine",
        "Practice controlled reaching drills that enhance active flexibility",
        "Use progressively wider shots in practice to improve functional reach",
        "Add mobility drills between games that target pickleball-specific movements",
        "Incorporate movement patterns that gradually increase range of motion"
      ],
      'off-court': [
        "Develop a comprehensive stretching routine targeting all major muscle groups",
        "Add yoga or pilates sessions 1-2 times per week",
        "Include dynamic flexibility work before workouts, static stretching after",
        "Use targeted mobility exercises for pickleball-specific limitations",
        "Incorporate foam rolling and other self-myofascial release techniques"
      ],
      'both': [
        "Focus on both dynamic (moving) and static (held) flexibility training",
        "Prioritize hip, shoulder, and thoracic spine mobility for pickleball",
        "Create a progressive flexibility program that builds over time",
        "Combine strength training through full ranges of motion with specific flexibility work",
        "Pay special attention to asymmetries between your dominant and non-dominant sides"
      ]
    },
    [PhysicalComponent.REACTION_TIME]: {
      'on-court': [
        "Practice volley exchanges at progressively closer distances and faster speeds",
        "Use ball drop drills where you react to a partner releasing a ball",
        "Incorporate unpredictable feed drills where you don't know where the shot is going",
        "Add visual cues to practice (partner pointing directions before hitting)",
        "Work on split-step timing synchronized to opponent's contact"
      ],
      'off-court': [
        "Use reaction ball drills (six-sided rubber ball with unpredictable bounces)",
        "Add hand-eye coordination exercises (wall ball catches, partner ball tosses)",
        "Incorporate reaction light systems if available",
        "Practice simple reaction games (coin catches, pencil drops)",
        "Include agility drills with unexpected auditory or visual cues"
      ],
      'both': [
        "Focus first on simple reaction time, then progress to choice reaction time",
        "Include both visual and auditory reaction training",
        "Combine physical movement with cognitive decision-making in drills",
        "Practice fatigued reactions to simulate late-game situations",
        "Work on anticipation skills alongside pure reaction training"
      ]
    },
    [PhysicalComponent.COORDINATION]: {
      'on-court': [
        "Practice multi-task drills (e.g., calling out numbers while hitting)",
        "Use variable feed drills that require adjustments to different balls",
        "Incorporate non-dominant hand activities in your practice routine",
        "Work on precision targeting drills with progressive difficulty",
        "Add rhythm-based movement patterns to your training"
      ],
      'off-court': [
        "Include ladder drills focused on foot placement precision",
        "Use juggling or other object manipulation exercises",
        "Add ball toss and catch routines with varied patterns",
        "Incorporate bilateral integration exercises (different movements on each side)",
        "Practice sport vision training with focus shifting and tracking"
      ],
      'both': [
        "Develop progressions from simple to complex coordination tasks",
        "Work on hand-eye, foot-eye, and full body coordination separately",
        "Focus on the quality and precision of movement rather than just speed",
        "Include coordination training in both fresh and fatigued states",
        "Combine cognitive challenges with physical coordination tasks"
      ]
    },
    [PhysicalComponent.EXPLOSIVENESS]: {
      'on-court': [
        "Practice explosive split-step to first movement sequences",
        "Add rapid directional change drills specific to court coverage",
        "Incorporate explosive reaching drills for wide or low balls",
        "Use resistance bands for explosive stroke simulation",
        "Work on quick-feet patterns followed by explosive shots"
      ],
      'off-court': [
        "Include plyometric exercises 2-3 times per week (jumps, bounds, hops)",
        "Add Olympic lift variations or medicine ball throws for upper body power",
        "Incorporate resisted sprint starts for first-step quickness",
        "Use jump training with focus on minimal ground contact time",
        "Develop a progressive power training program with appropriate recovery"
      ],
      'both': [
        "Combine strength training and plyometric work in a comprehensive program",
        "Focus on both lower and upper body power development",
        "Create sport-specific power exercises that mimic pickleball movements",
        "Include adequate recovery between explosive training sessions",
        "Progress gradually from basic to complex power movements"
      ]
    },
    [PhysicalComponent.COURT_MOVEMENT]: {
      'on-court': [
        "Practice systematic court coverage drills with specific movement patterns",
        "Use shadow drills focusing on efficient movement between positions",
        "Incorporate partner mirror drills to improve movement quickness",
        "Work on transition movements from baseline to kitchen line",
        "Add recovery movement patterns after hitting from challenging positions"
      ],
      'off-court': [
        "Practice sport-specific footwork patterns on a movement grid",
        "Add lateral, diagonal, and multidirectional agility drills",
        "Include cone patterns that simulate common pickleball movements",
        "Work on deceleration and stabilization after quick movements",
        "Use footwork speed ladders with pickleball-specific patterns"
      ],
      'both': [
        "Analyze and refine your movement efficiency through video analysis",
        "Focus on proper movement mechanics before adding speed",
        "Develop systematic progressions from basic to complex movement patterns",
        "Practice movement skills both when fresh and when fatigued",
        "Create game-specific movement challenges that mimic match situations"
      ]
    },
    [PhysicalComponent.RECOVERY]: {
      'on-court': [
        "Practice efficient between-point recovery routines",
        "Work on controlled breathing during short breaks",
        "Incorporate active recovery movements during practice sessions",
        "Simulate tournament schedules in practice to build recovery capacity",
        "Add progressively shorter rest periods to build recovery ability"
      ],
      'off-court': [
        "Develop post-play recovery protocols (cool-down, nutrition, hydration)",
        "Include active recovery sessions between intense training days",
        "Use contrast therapy (hot/cold) for enhanced recovery when appropriate",
        "Add foam rolling and mobility work to your daily routine",
        "Focus on quality sleep hygiene for optimal recovery"
      ],
      'both': [
        "Create a comprehensive recovery plan addressing physical and mental aspects",
        "Balance training stress with adequate recovery time",
        "Use heart rate variability or other metrics to monitor recovery status",
        "Develop nutrition and hydration strategies specific to your recovery needs",
        "Practice stress management techniques to enhance overall recovery"
      ]
    },
    [PhysicalComponent.INJURY_PREVENTION]: {
      'on-court': [
        "Develop a comprehensive dynamic warm-up routine specific to pickleball",
        "Incorporate proper technique focus in all practice sessions",
        "Gradually increase training volume and intensity to prevent overuse",
        "Add movement pattern correction drills for any identified issues",
        "Practice safe deceleration and landing mechanics during play"
      ],
      'off-court': [
        "Include prehabilitation exercises targeting common pickleball injury sites",
        "Develop balanced strength around all major joints (especially shoulders)",
        "Add specific exercises for rotator cuff, knee, and ankle stability",
        "Incorporate core training as foundation for safer movement",
        "Use functional movement screening to identify potential problem areas"
      ],
      'both': [
        "Create a periodized training plan that includes appropriate deload periods",
        "Focus on muscle balance between opposing groups (quads/hamstrings, etc.)",
        "Develop proper biomechanics for all pickleball-specific movements",
        "Include adequate recovery protocols in your overall training plan",
        "Address any movement compensations or imbalances proactively"
      ]
    },
    [PhysicalComponent.FATIGUE]: {
      'on-court': [
        "Practice maintaining technique during progressively fatigued states",
        "Use repeated interval games to build fatigue resistance",
        "Incorporate decision-making challenges during fatigued practice",
        "Gradually extend practice duration to build capacity",
        "Work on mental focus techniques when physically tired"
      ],
      'off-court': [
        "Develop both aerobic and anaerobic energy systems through specific training",
        "Include threshold training to improve lactate processing",
        "Add tempo work to build sustained output capacity",
        "Use circuit training to simulate game-specific fatigue",
        "Focus on proper nutrition and hydration to delay fatigue onset"
      ],
      'both': [
        "Create a progressive plan to improve fatigue resistance over time",
        "Balance high-intensity fatigue-inducing work with adequate recovery",
        "Monitor signs of overtraining and adjust training accordingly",
        "Incorporate both central (cardiovascular) and peripheral (muscular) fatigue training",
        "Develop mental strategies for maintaining performance when fatigued"
      ]
    },
    [PhysicalComponent.HYDRATION]: {
      'on-court': [
        "Establish consistent hydration breaks during practice sessions",
        "Practice pre-determined hydration timing that matches game rules",
        "Monitor sweat rate during various playing conditions",
        "Experiment with different electrolyte options during practice",
        "Create hydration protocols for different playing environments"
      ],
      'off-court': [
        "Develop daily hydration habits that maintain baseline status",
        "Use urine color and thirst as basic hydration monitoring tools",
        "Create sport-specific hydration plans for before, during, and after play",
        "Calculate your sweat rate to determine personal fluid needs",
        "Explore different electrolyte options based on your specific requirements"
      ],
      'both': [
        "Develop comprehensive hydration strategies for both training and competition",
        "Create environmental adjustments for different temperature and humidity conditions",
        "Balance water and electrolyte replacement based on activity duration and intensity",
        "Practice your hydration strategy during training to refine for competition",
        "Monitor performance changes with different hydration approaches"
      ]
    },
    [PhysicalComponent.NUTRITION]: {
      'on-court': [
        "Establish consistent fueling breaks during extended practice sessions",
        "Practice with different pre-play meals to find your optimal approach",
        "Test tournament-day nutrition strategies during practice tournaments",
        "Develop between-match refueling approaches for tournament play",
        "Monitor energy levels with different nutrition timing strategies"
      ],
      'off-court': [
        "Create a daily nutrition approach that supports training demands",
        "Develop meal timing strategies around your training schedule",
        "Establish pre-play, during-play, and post-play nutrition protocols",
        "Focus on both macronutrients (carbs, protein, fat) and micronutrients",
        "Use nutrition periodization to match different training phases"
      ],
      'both': [
        "Develop a comprehensive nutrition plan addressing daily, training, and competition needs",
        "Create specific strategies for tournament and multi-match days",
        "Balance performance nutrition with overall health considerations",
        "Adjust hydration and nutrition strategies together for optimal results",
        "Monitor body composition and energy levels as feedback on your nutrition approach"
      ]
    },
    [PhysicalComponent.WARMUP]: {
      'on-court': [
        "Develop a progressive pickleball-specific warm-up routine",
        "Include movement preparation that targets all planes of motion",
        "Add skill progression from simple to complex in your warm-up",
        "Create different warm-up protocols for different playing conditions",
        "Practice efficient warm-up timing that works within tournament schedules"
      ],
      'off-court': [
        "Establish a dynamic movement preparation sequence for all physical activity",
        "Include activation exercises for commonly underactive muscles",
        "Develop joint mobility routines focusing on shoulders, hips, and spine",
        "Create nervous system activation drills for power and quickness",
        "Incorporate self-myofascial release techniques when needed"
      ],
      'both': [
        "Design comprehensive warm-up protocols for different activities and conditions",
        "Progress from general to specific movements in all warm-ups",
        "Address individual mobility restrictions or weaknesses in your routine",
        "Create efficient warm-up sequences that can be adjusted for time constraints",
        "Monitor the effectiveness of your warm-up through performance feedback"
      ]
    },
    [PhysicalComponent.NONE]: {
      'on-court': [],
      'off-court': [],
      'both': []
    }
  };
  
  // Return appropriate tips based on component and training type
  return tipsByComponentAndType[component][trainingType] || [];
}

/**
 * Generates a response focused on physical fitness
 */
export function generateFitnessResponse(
  analysis: PhysicalFitnessAnalysis,
  userName: string
): string {
  // If injury is mentioned, provide cautious advice regardless of other factors
  if (analysis.injuryMentioned) {
    return `I notice you've mentioned something related to injury or pain, ${userName}. When dealing with any injury or pain, it's important to:

1. Consult with a healthcare professional before beginning any fitness program
2. Follow proper rehabilitation protocols under professional guidance
3. Progress gradually and listen to your body's signals
4. Consider working with a physical therapist for sport-specific rehabilitation
5. Avoid activities that cause pain or discomfort

Would you like me to connect you with resources on injury prevention or safe return-to-play protocols?`;
  }
  
  // If no clear physical component was detected, return empty string
  if (analysis.primaryComponent === PhysicalComponent.NONE || analysis.confidence < 2) {
    return '';
  }
  
  const { primaryComponent, hasIssue, specificIssue, seekingFitnessAdvice, trainingType } = analysis;
  
  // Get appropriate fitness tips
  const tips = generateFitnessTips(primaryComponent, trainingType, false); // false for injury mention
  
  // Format the component name for display
  const componentName = primaryComponent.replace(/_/g, ' ').toLowerCase();
  const trainingTypeText = trainingType === 'both' ? 'both on and off court' : trainingType;
  
  // Generate different response types based on context
  if (seekingFitnessAdvice && hasIssue) {
    // User is seeking advice for a specific fitness issue
    return `I understand you're looking to improve your ${componentName} for pickleball, ${userName}, particularly with the issue of ${specificIssue}. 
    
Here are some targeted approaches for ${trainingTypeText} training:

- ${tips.slice(0, 3).join('\n- ')}

Would you like a more comprehensive training plan focused on this physical component? I can also suggest how to integrate this into your overall pickleball development.`;
  } 
  else if (seekingFitnessAdvice) {
    // User is seeking general fitness advice
    return `Developing your ${componentName} is an excellent focus for enhancing your pickleball performance, ${userName}. 
    
Here are some effective ${trainingTypeText} training approaches:

- ${tips.slice(0, 3).join('\n- ')}

These physical training elements can significantly improve your game. Would you like more specific guidance on implementing these into your training routine?`;
  }
  else if (hasIssue) {
    // User has a specific fitness issue but isn't explicitly asking for advice
    return `I notice you're mentioning some challenges with ${componentName} in your pickleball game, specifically with ${specificIssue}. 
    
This is a common physical limitation that many players work to overcome. Here are some approaches that might help:

- ${tips.slice(0, 3).join('\n- ')}

Is this specific physical component something you'd like to focus on developing further?`;
  }
  else {
    // General response about this physical component
    return `${componentName.charAt(0).toUpperCase() + componentName.slice(1)} is a crucial physical component for pickleball performance. Here are some effective ways to develop this attribute:

- ${tips.slice(0, 3).join('\n- ')}

Would you like more specific training guidance on developing this physical quality, or perhaps some practical ways to integrate this into your regular practice routine?`;
  }
}