/**
 * Comprehensive Coaching Assessment Guides
 * Provides detailed descriptors and rating criteria for each of the 55 skills
 */

// Rating Scale Definitions
export const RATING_SCALE = {
  1: { label: "Beginner", description: "Just starting, needs significant development" },
  2: { label: "Novice", description: "Basic understanding, frequent errors" },
  3: { label: "Developing", description: "Shows improvement, inconsistent execution" },
  4: { label: "Competent", description: "Adequate skill level, occasional mistakes" },
  5: { label: "Proficient", description: "Solid execution, reliable performance" },
  6: { label: "Advanced", description: "Strong skills, confident execution" },
  7: { label: "Expert", description: "Excellent technique, consistent results" },
  8: { label: "Elite", description: "Outstanding performance, tournament level" },
  9: { label: "Professional", description: "Exceptional skill, teaches others" },
  10: { label: "Master", description: "Perfect execution, world-class ability" }
};

// Detailed skill assessment guides
export const SKILL_ASSESSMENT_GUIDES = {
  // GROUNDSTROKES AND SERVES (Technical - 25%)
  'Serve Power': {
    description: "Ability to generate speed and force on serves",
    indicators: {
      1: "Slow, weak serves with minimal speed (under 25 mph)",
      2: "Limited power, inconsistent speed generation",
      3: "Moderate pace, developing power (25-35 mph)",
      4: "Adequate power, some speed but lacks consistency",
      5: "Good power with proper technique, reliable speed (35-45 mph)",
      6: "Strong serves with good pace and control",
      7: "Powerful, fast serves that challenge opponents (45-55 mph)",
      8: "Excellent power with precision and placement",
      9: "Explosive power, serves as offensive weapons (55+ mph)",
      10: "Professional-level power with complete control"
    },
    coachingTips: "Rating 4: Basic power but inconsistent follow-through. Rating 7: Strong leg drive, full shoulder rotation, consistent power generation"
  },
  
  'Serve Placement': {
    description: "Accuracy and strategic positioning of serves",
    indicators: {
      1: "Random placement, no control over direction",
      3: "Basic directional control, occasional accuracy",
      5: "Good placement to corners and body, strategic thinking",
      7: "Precise targeting, can exploit opponent weaknesses",
      9: "Surgical precision, places serves exactly where intended"
    },
    coachingTips: "Assess: Target consistency, strategic variety, ability to hit different service boxes"
  },

  'Forehand Flat Drive': {
    description: "Powerful, low-trajectory forehand shots with minimal spin",
    indicators: {
      1: "Inconsistent contact, ball often goes high or wide",
      2: "Poor contact point, limited pace",
      3: "Basic flat shot with some power, needs better control",
      4: "Adequate power but inconsistent placement, 6/10 shots land",
      5: "Solid flat drive with good pace and direction, 7/10 accuracy",
      6: "Strong drives with consistent depth and pace",
      7: "Powerful, penetrating shots that pressure opponents, 8/10 accuracy",
      8: "Excellent pace with pinpoint placement",
      9: "Exceptional pace and precision, dominates rallies consistently",
      10: "Perfect technique, can place drives anywhere at will"
    },
    coachingTips: "Rating 4: Hits with decent pace but struggles with consistency - work on contact point. Rating 7: Consistently hits with authority and places shots to pressure opponent"
  },

  'Forehand Topspin Drive': {
    description: "Forehand with heavy topspin for control and consistency",
    indicators: {
      1: "Little to no spin, ball trajectory inconsistent",
      3: "Some topspin evident, improving control",
      5: "Good topspin generation, consistent depth and bounce",
      7: "Heavy topspin that kicks up and challenges opponents",
      9: "Exceptional spin control, can vary spin levels tactically"
    },
    coachingTips: "Check: Low-to-high swing path, wrist snap, ball rotation, net clearance"
  },

  'Forehand Slice': {
    description: "Underspin forehand for variation and control",
    indicators: {
      1: "Inconsistent slice, often mishits or floats",
      3: "Basic slice technique, some underspin visible",
      5: "Clean slice with good underspin and placement",
      7: "Effective slice that skids low and disrupts rhythm",
      9: "Master of slice variation, uses it strategically"
    },
    coachingTips: "Observe: High-to-low swing, racquet face angle, follow-through direction"
  },

  // Continue for all backhand variations...
  'Backhand Flat Drive': {
    description: "Powerful, low-trajectory backhand shots",
    indicators: {
      1: "Poor contact, lacks control and direction",
      3: "Developing power, needs better consistency",
      5: "Solid backhand drive with good pace",
      7: "Strong, penetrating backhand that creates opportunities",
      9: "Devastating backhand weapon, exceptional timing"
    },
    coachingTips: "Focus on: Two-handed vs one-handed technique, shoulder turn, contact point"
  },

  'Backhand Topspin Drive': {
    description: "Topspin backhand for control and aggression",
    indicators: {
      1: "Minimal spin, inconsistent results",
      3: "Some topspin, improving consistency",
      5: "Good topspin backhand with reliable depth",
      7: "Heavy topspin that creates difficult bounces",
      9: "Exceptional topspin control and placement"
    },
    coachingTips: "Evaluate: Swing path, grip adjustment, wrist action, follow-through"
  },

  'Backhand Slice': {
    description: "Underspin backhand for defensive and offensive play",
    indicators: {
      1: "Inconsistent slice, often weak or floating",
      3: "Basic slice fundamentals developing",
      5: "Effective slice with good underspin and control",
      7: "Strategic slice that stays low and forces errors",
      9: "Master craftsman of backhand slice variations"
    },
    coachingTips: "Check: Preparation height, contact point, slice angle, follow-through"
  },

  'Third Shot Drive': {
    description: "Aggressive third shot to pressure opponents at net",
    indicators: {
      1: "Poor timing, often hits into net or long",
      3: "Basic drive attempt, inconsistent results",
      5: "Good third shot drive with proper pace and placement",
      7: "Powerful drive that forces defensive responses",
      9: "Perfect third shot drives that win points outright"
    },
    coachingTips: "Assess: Shot selection timing, target selection, power vs placement balance"
  },

  'Forehand Return of Serve': {
    description: "Effective returns of serve using forehand",
    indicators: {
      1: "Struggles to return serves consistently",
      3: "Basic returns, getting ball back in play",
      5: "Solid returns with good direction and depth",
      7: "Aggressive returns that put pressure on server",
      9: "Exceptional returns that immediately take control"
    },
    coachingTips: "Evaluate: Ready position, quick preparation, target selection, return depth"
  },

  'Backhand Return of Serve': {
    description: "Effective returns of serve using backhand",
    indicators: {
      1: "Difficulty handling serves to backhand side",
      3: "Improving backhand returns, basic consistency",
      5: "Reliable backhand returns with good placement",
      7: "Strong backhand returns that neutralize server advantage",
      9: "Outstanding backhand returns, can attack immediately"
    },
    coachingTips: "Focus on: Preparation speed, footwork, contact point, return angle"
  },

  // DINKS AND RESETS (Touch - 30%)
  'Forehand Topspin Dink': {
    description: "Soft shot with slight topspin over the net",
    indicators: {
      1: "Hard to control, often too high or in net",
      2: "Inconsistent pace and direction, frequent errors",
      3: "Basic dink with some consistency developing (5/10 successful)",
      4: "Adequate soft touch but placement inconsistent (6/10 land in kitchen)",
      5: "Good touch and placement, reliable execution (7/10 accuracy)",
      6: "Consistent dinks with good arc and control",
      7: "Excellent dink with perfect pace and spin (8/10 accuracy, can vary placement)",
      8: "Superior control with variety of spins and speeds",
      9: "Master of dink variations, exceptional feel",
      10: "Perfect touch, can hit any dink shot imaginable"
    },
    coachingTips: "Rating 4: Basic soft touch but struggles with precise placement - work on paddle face control. Rating 7: Consistently places dinks with purpose and can vary pace effectively"
  },

  'Forehand Dead Dink': {
    description: "Soft shot with no spin, maximum control",
    indicators: {
      1: "Inconsistent pace, often too hard or soft",
      2: "Poor pace control, struggles with net clearance",
      3: "Developing touch, improving consistency (5/10 successful)",
      4: "Adequate pace control but inconsistent placement (6/10 land properly)",
      5: "Good dead dink with proper pace and placement (7/10 accuracy)",
      6: "Consistent dead dinks with minimal net clearance",
      7: "Exceptional touch, ball barely clears net (8/10 accuracy, perfect pace)",
      8: "Masterful control with pinpoint placement",
      9: "Perfect dead dinks that drop immediately",
      10: "Flawless execution, ball drops like a feather"
    },
    coachingTips: "Rating 4: Has basic soft touch but lacks precision - ball often lands too deep. Rating 7: Consistently drops ball just over net with perfect pace control"
  },

  'Forehand Slice Dink': {
    description: "Dink with underspin for control and deception",
    indicators: {
      1: "Struggles with spin control, inconsistent results",
      3: "Basic slice dink, some underspin evident",
      5: "Good slice dink with effective underspin",
      7: "Masterful slice that skids and stays low",
      9: "Exceptional slice dink artistry, perfect control"
    },
    coachingTips: "Check: High-to-low paddle path, gentle contact, spin creation"
  },

  // Continue for all backhand dink variations...
  'Backhand Topspin Dink': {
    description: "Backhand soft shot with slight topspin",
    indicators: {
      1: "Poor backhand touch, inconsistent placement",
      3: "Developing backhand dink technique",
      5: "Solid backhand dink with good control",
      7: "Excellent backhand touch and placement",
      9: "Master of backhand dink variations"
    },
    coachingTips: "Evaluate: Wrist stability, paddle angle, gentle acceleration"
  },

  'Backhand Dead Dink': {
    description: "Backhand dink with no spin for maximum control",
    indicators: {
      1: "Struggles with backhand touch and pace",
      3: "Basic backhand dead dink developing",
      5: "Good backhand dead dink consistency",
      7: "Exceptional backhand touch and placement",
      9: "Perfect backhand dead dink execution"
    },
    coachingTips: "Focus on: Paddle face stability, minimal swing, precise contact"
  },

  'Backhand Slice Dink': {
    description: "Backhand dink with underspin",
    indicators: {
      1: "Inconsistent backhand slice technique",
      3: "Developing slice on backhand side",
      5: "Effective backhand slice dink",
      7: "Masterful backhand slice control",
      9: "Exceptional backhand slice artistry"
    },
    coachingTips: "Check: Slice angle, contact point, follow-through direction"
  },

  // Third Shot Drops
  'Forehand Third Shot Drop': {
    description: "Soft third shot that lands in kitchen",
    indicators: {
      1: "Struggles with third shot placement and pace",
      3: "Basic third shot drop, improving consistency",
      5: "Good third shot drop execution and placement",
      7: "Excellent third shot drops that neutralize opponents",
      9: "Perfect third shot drops, exceptional strategy"
    },
    coachingTips: "Assess: Arc trajectory, landing spot, pace control, tactical timing"
  },

  'Forehand Top Spin Third Shot Drop': {
    description: "Third shot drop with topspin for better control",
    indicators: {
      1: "Poor spin control on third shot attempts",
      3: "Developing topspin third shot technique",
      5: "Good topspin third shot with consistent results",
      7: "Excellent topspin third shot execution",
      9: "Master of topspin third shot variations"
    },
    coachingTips: "Look for: Low-to-high swing, spin generation, landing precision"
  },

  'Forehand Slice Third Shot Drop': {
    description: "Third shot drop with underspin",
    indicators: {
      1: "Inconsistent slice on third shot attempts",
      3: "Basic slice third shot developing",
      5: "Effective slice third shot drop",
      7: "Masterful slice third shot execution",
      9: "Exceptional slice third shot artistry"
    },
    coachingTips: "Evaluate: Slice angle, arc height, landing precision"
  },

  // Continue for backhand third shot drops...
  'Backhand Third Shot Drop': {
    description: "Backhand version of the crucial third shot",
    indicators: {
      1: "Struggles with backhand third shot execution",
      3: "Developing backhand third shot technique",
      5: "Solid backhand third shot drop",
      7: "Excellent backhand third shot placement",
      9: "Master of backhand third shot strategy"
    },
    coachingTips: "Focus on: Preparation time, arc trajectory, landing spot accuracy"
  },

  'Backhand Top Spin Third Shot Drop': {
    description: "Backhand third shot with topspin",
    indicators: {
      1: "Poor backhand topspin third shot control",
      3: "Basic topspin technique on backhand third shot",
      5: "Good backhand topspin third shot",
      7: "Excellent backhand topspin execution",
      9: "Exceptional backhand topspin third shot mastery"
    },
    coachingTips: "Check: Swing path, spin creation, consistent landing zone"
  },

  'Backhand Slice Third Shot Drop': {
    description: "Backhand third shot with underspin",
    indicators: {
      1: "Inconsistent backhand slice third shot",
      3: "Developing backhand slice technique",
      5: "Effective backhand slice third shot",
      7: "Masterful backhand slice execution",
      9: "Perfect backhand slice third shot artistry"
    },
    coachingTips: "Assess: Slice generation, arc control, tactical application"
  },

  // Resets and Lobs
  'Forehand Resets': {
    description: "Defensive shots that neutralize aggressive attacks",
    indicators: {
      1: "Struggles to handle hard shots defensively",
      3: "Basic reset technique developing",
      5: "Good reset ability under pressure",
      7: "Excellent defensive resets that regain control",
      9: "Master of reset variations and placement"
    },
    coachingTips: "Evaluate: Reaction time, soft hands, placement accuracy under pressure"
  },

  'Backhand Resets': {
    description: "Backhand defensive shots to neutralize attacks",
    indicators: {
      1: "Poor backhand reset technique",
      3: "Developing backhand reset ability",
      5: "Solid backhand resets under pressure",
      7: "Excellent backhand defensive skills",
      9: "Exceptional backhand reset mastery"
    },
    coachingTips: "Focus on: Quick preparation, soft contact, accurate placement"
  },

  'Forehand Lob': {
    description: "High, deep shot to get opponents off the net",
    indicators: {
      1: "Inconsistent lob height and depth",
      3: "Basic lob technique, improving placement",
      5: "Good lob execution with proper trajectory",
      7: "Excellent lobs that effectively move opponents",
      9: "Perfect lob placement and tactical timing"
    },
    coachingTips: "Check: Arc height, depth accuracy, tactical timing, follow-through"
  },

  'Backhand Lob': {
    description: "Backhand version of the defensive/offensive lob",
    indicators: {
      1: "Struggles with backhand lob execution",
      3: "Developing backhand lob technique",
      5: "Solid backhand lob with good trajectory",
      7: "Excellent backhand lob placement",
      9: "Master of backhand lob variations"
    },
    coachingTips: "Assess: Preparation, arc creation, depth control, strategic use"
  },

  // New skills for 55-skill framework
  'Cross-Court Dinks': {
    description: "Diagonal dinking across the court for angles",
    indicators: {
      1: "Struggles with cross-court angle and placement",
      3: "Basic cross-court dink developing",
      5: "Good cross-court dink execution and angles",
      7: "Excellent cross-court placement and strategy",
      9: "Master of cross-court dink variations and tactics"
    },
    coachingTips: "Look for: Angle creation, court positioning, tactical awareness"
  },

  'Kitchen Line Positioning': {
    description: "Optimal positioning at the non-volley zone line",
    indicators: {
      1: "Poor understanding of kitchen line positioning",
      3: "Basic positioning concepts developing",
      5: "Good kitchen line position and movement",
      7: "Excellent positioning and court coverage",
      9: "Perfect positioning instincts and anticipation"
    },
    coachingTips: "Evaluate: Distance from line, ready position, movement efficiency"
  },

  // VOLLEYS AND SMASHES (Power - 10%)
  'Forehand Punch Volley': {
    description: "Quick, firm volley with minimal backswing",
    indicators: {
      1: "Poor volley technique, inconsistent contact",
      3: "Basic punch volley, improving consistency",
      5: "Good punch volley with proper technique",
      7: "Excellent punch volley placement and power",
      9: "Perfect punch volley execution and timing"
    },
    coachingTips: "Focus on: Minimal backswing, firm wrist, forward contact point"
  },

  'Forehand Roll Volley': {
    description: "Volley with topspin for aggressive net play",
    indicators: {
      1: "Struggles with roll volley technique",
      3: "Developing roll volley skills",
      5: "Good roll volley execution",
      7: "Excellent roll volley with spin and placement",
      9: "Master of roll volley variations"
    },
    coachingTips: "Check: Wrist roll, contact point, spin generation"
  },

  'Backhand Punch Volley': {
    description: "Backhand version of the quick, firm volley",
    indicators: {
      1: "Poor backhand volley technique",
      3: "Basic backhand punch volley developing",
      5: "Solid backhand punch volley",
      7: "Excellent backhand volley placement",
      9: "Perfect backhand punch volley mastery"
    },
    coachingTips: "Evaluate: Preparation speed, contact point, follow-through"
  },

  'Backhand Roll Volley': {
    description: "Backhand volley with topspin",
    indicators: {
      1: "Struggles with backhand roll technique",
      3: "Developing backhand roll volley",
      5: "Good backhand roll volley execution",
      7: "Excellent backhand roll placement",
      9: "Exceptional backhand roll volley artistry"
    },
    coachingTips: "Focus on: Wrist action, spin creation, aggressive placement"
  },

  'Forehand Overhead Smash': {
    description: "Powerful overhead shot to finish points",
    indicators: {
      1: "Poor overhead technique, often mishits",
      2: "Inconsistent contact, limited power generation",
      3: "Basic overhead, improving power and placement (5/10 successful)",
      4: "Adequate power but inconsistent direction (6/10 put away successfully)",
      5: "Good overhead smash with solid technique (7/10 accuracy)",
      6: "Strong smashes with consistent placement",
      7: "Powerful, well-placed overhead shots (8/10 winners, can angle shots)",
      8: "Excellent smashes with pinpoint placement",
      9: "Devastating overhead weapon, perfect execution",
      10: "Unreturnable overhead smashes at will"
    },
    coachingTips: "Rating 4: Hits with decent power but struggles with placement - often hits straight down. Rating 7: Consistently finishes points with angled smashes and varying pace"
  },

  'Backhand Overhead Smash': {
    description: "Backhand version of the overhead smash",
    indicators: {
      1: "Struggles with backhand overhead technique",
      3: "Developing backhand overhead skills",
      5: "Solid backhand overhead execution",
      7: "Excellent backhand overhead power",
      9: "Master of backhand overhead variations"
    },
    coachingTips: "Assess: Body positioning, preparation time, power transfer"
  },

  // FOOTWORK & FITNESS (Athletic - 15%)
  'Split Step Readiness': {
    description: "Preparatory hop to ready position for quick movement",
    indicators: {
      1: "No split step or poor timing",
      3: "Basic split step, improving timing",
      5: "Good split step technique and timing",
      7: "Excellent split step preparation and reaction",
      9: "Perfect split step timing and explosive readiness"
    },
    coachingTips: "Look for: Timing with opponent contact, balanced landing, quick recovery"
  },

  'Lateral Shuffles': {
    description: "Side-to-side movement while maintaining balance",
    indicators: {
      1: "Poor lateral movement, crosses feet often",
      3: "Basic shuffling technique developing",
      5: "Good lateral movement with proper form",
      7: "Excellent lateral mobility and balance",
      9: "Perfect lateral movement efficiency and speed"
    },
    coachingTips: "Evaluate: Foot positioning, balance maintenance, movement speed"
  },

  'Crossover Steps': {
    description: "Efficient movement for covering longer distances",
    indicators: {
      1: "Poor crossover technique, loses balance",
      3: "Basic crossover steps, improving efficiency",
      5: "Good crossover movement for court coverage",
      7: "Excellent crossover technique and speed",
      9: "Perfect crossover efficiency and recovery"
    },
    coachingTips: "Check: Step sequence, balance, recovery to ready position"
  },

  'Court Recovery': {
    description: "Ability to return to optimal position after shots",
    indicators: {
      1: "Poor recovery, often out of position",
      3: "Basic recovery concepts, improving positioning",
      5: "Good court recovery and repositioning",
      7: "Excellent recovery speed and positioning",
      9: "Perfect court recovery and anticipation"
    },
    coachingTips: "Assess: Recovery speed, optimal positioning, anticipatory movement"
  },

  'First Step Speed': {
    description: "Quickness of initial movement reaction",
    indicators: {
      1: "Slow reaction, poor first step",
      3: "Developing first step quickness",
      5: "Good initial movement speed",
      7: "Excellent first step explosiveness",
      9: "Lightning-fast first step reaction"
    },
    coachingTips: "Focus on: Reaction time, explosive movement, direction changes"
  },

  'Balance & Core Stability': {
    description: "Maintaining stability during and after shots",
    indicators: {
      1: "Poor balance, often off-balance during shots",
      3: "Basic balance, improving stability",
      5: "Good balance and core control",
      7: "Excellent stability in all positions",
      9: "Perfect balance and core strength"
    },
    coachingTips: "Evaluate: Stability during shots, recovery balance, core engagement"
  },

  'Agility': {
    description: "Overall quickness and change of direction ability",
    indicators: {
      1: "Poor agility, struggles with direction changes",
      3: "Basic agility, improving movement quality",
      5: "Good agility and movement patterns",
      7: "Excellent agility and court coverage",
      9: "Exceptional agility and movement efficiency"
    },
    coachingTips: "Check: Direction change speed, movement fluidity, acceleration/deceleration"
  },

  'Endurance Conditioning': {
    description: "Cardiovascular fitness for sustained play",
    indicators: {
      1: "Poor endurance, tires quickly",
      3: "Basic fitness, can play short matches",
      5: "Good endurance for recreational play",
      7: "Excellent fitness for competitive play",
      9: "Outstanding endurance, never fatigues"
    },
    coachingTips: "Assess: Performance maintenance over time, recovery between points"
  },

  'Leg Strength & Power': {
    description: "Lower body strength for explosive movements",
    indicators: {
      1: "Weak legs, poor explosive movements",
      3: "Basic leg strength, improving power",
      5: "Good leg strength for court movement",
      7: "Excellent leg power and explosiveness",
      9: "Outstanding leg strength and athletic power"
    },
    coachingTips: "Evaluate: Jump ability, explosive movements, sustained power output"
  },

  'Transition Speed (Baseline to Kitchen)': {
    description: "Speed of movement from back court to net",
    indicators: {
      1: "Slow transition, poor positioning awareness",
      3: "Basic transition timing, improving speed",
      5: "Good transition speed and awareness",
      7: "Excellent transition timing and execution",
      9: "Perfect transition speed and court awareness"
    },
    coachingTips: "Focus on: Transition timing, movement efficiency, positioning awareness"
  },

  // MENTAL GAME (Mental - 20%)
  'Staying Present': {
    description: "Ability to focus on current point, not past or future",
    indicators: {
      1: "Often distracted, dwells on previous points",
      3: "Basic present-moment awareness developing",
      5: "Good ability to stay focused on current point",
      7: "Excellent present-moment focus and awareness",
      9: "Perfect mindfulness and present-moment mastery"
    },
    coachingTips: "Observe: Between-point behavior, reaction to errors, focus consistency"
  },

  'Resetting After Errors': {
    description: "Mental recovery and refocus after mistakes",
    indicators: {
      1: "Carries errors forward, compounds mistakes",
      3: "Basic error recovery, improving resilience",
      5: "Good ability to reset after mistakes",
      7: "Excellent mental reset and error management",
      9: "Perfect error recovery and mental toughness"
    },
    coachingTips: "Check: Body language after errors, next point performance, emotional control"
  },

  'Patience & Shot Selection': {
    description: "Tactical discipline and smart shot choices",
    indicators: {
      1: "Impatient, poor shot selection",
      3: "Basic patience, improving shot choices",
      5: "Good patience and tactical awareness",
      7: "Excellent shot selection and tactical discipline",
      9: "Perfect patience and strategic shot selection"
    },
    coachingTips: "Assess: Shot choice appropriateness, tactical awareness, risk management"
  },

  'Positive Self-Talk': {
    description: "Internal dialogue and self-encouragement",
    indicators: {
      1: "Negative self-talk, self-defeating thoughts",
      3: "Neutral self-talk, working on positivity",
      5: "Generally positive internal dialogue",
      7: "Consistently positive and encouraging self-talk",
      9: "Masterful positive mental programming"
    },
    coachingTips: "Listen for: Verbal expressions, body language, recovery from setbacks"
  },

  'Visualization': {
    description: "Mental imagery and shot preparation",
    indicators: {
      1: "No visualization, reactive play only",
      3: "Basic shot visualization developing",
      5: "Good use of mental imagery",
      7: "Excellent visualization and mental preparation",
      9: "Master of visualization and mental rehearsal"
    },
    coachingTips: "Evaluate: Pre-shot routine, mental preparation, tactical planning"
  },

  'Pressure Handling': {
    description: "Performance under competitive stress",
    indicators: {
      1: "Crumbles under pressure, tightens up",
      3: "Basic pressure tolerance, some nerves",
      5: "Good pressure management and composure",
      7: "Excellent performance under pressure",
      9: "Thrives under pressure, clutch performer"
    },
    coachingTips: "Observe: Performance in crucial points, body language, consistency"
  },

  'Focus Shifts': {
    description: "Ability to adjust attention and concentration",
    indicators: {
      1: "Poor focus control, easily distracted",
      3: "Basic focus management developing",
      5: "Good ability to maintain and shift focus",
      7: "Excellent focus control and attention management",
      9: "Perfect focus mastery and attention control"
    },
    coachingTips: "Check: Concentration consistency, distraction management, focus recovery"
  },

  'Opponent Reading': {
    description: "Ability to analyze and adapt to opponent patterns",
    indicators: {
      1: "No pattern recognition, plays same regardless",
      3: "Basic opponent awareness developing",
      5: "Good pattern recognition and adaptation",
      7: "Excellent opponent analysis and strategy",
      9: "Master of opponent reading and exploitation"
    },
    coachingTips: "Assess: Pattern recognition, strategic adjustments, tactical awareness"
  },

  'Emotional Regulation': {
    description: "Managing emotions during competitive play",
    indicators: {
      1: "Poor emotional control, frequent outbursts",
      3: "Basic emotional awareness, improving control",
      5: "Good emotional regulation and composure",
      7: "Excellent emotional control under stress",
      9: "Perfect emotional mastery and composure"
    },
    coachingTips: "Evaluate: Emotional responses, recovery time, consistent demeanor"
  },

  'Competitive Confidence': {
    description: "Self-belief and confidence in competitive situations",
    indicators: {
      1: "Low confidence, doubts abilities",
      3: "Building confidence, some self-belief",
      5: "Good confidence in most situations",
      7: "Strong confidence and self-belief",
      9: "Unshakeable confidence and competitive spirit"
    },
    coachingTips: "Observe: Body language, shot selection boldness, pressure responses"
  }
};

// Get assessment guide for a specific skill
export function getSkillGuide(skillName: string) {
  return SKILL_ASSESSMENT_GUIDES[skillName] || {
    description: "Skill assessment guide not available",
    indicators: {},
    coachingTips: "Evaluate based on technique, consistency, and effectiveness"
  };
}

// Get rating description
export function getRatingDescription(rating: number) {
  return RATING_SCALE[rating] || { label: "Unknown", description: "Invalid rating" };
}