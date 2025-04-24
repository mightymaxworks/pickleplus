/**
 * PKL-278651-COACH-0005-SHOTS
 * Pickleball Shot Recognition System
 * 
 * This file provides a comprehensive database and recognition system
 * for pickleball shots and techniques, enhancing SAGE's ability to
 * identify and discuss specific shot types mentioned by players.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

/**
 * Shot types a player can execute in pickleball
 */
export enum ShotType {
  DINK = 'dink',
  DRIVE = 'drive',
  VOLLEY = 'volley',
  DROP_SHOT = 'drop_shot',
  LOB = 'lob',
  SERVE = 'serve',
  RETURN = 'return',
  THIRD_SHOT_DROP = 'third_shot_drop',
  THIRD_SHOT_DRIVE = 'third_shot_drive',
  SMASH = 'smash',
  RESET = 'reset',
  PUNCH = 'punch',
  BLOCK = 'block',
  TOPSPIN = 'topspin',
  SLICE = 'slice',
  ATP = 'around_the_post',
  ERNE = 'erne',
  OUT_OF_AIR = 'out_of_air',
  BACKHAND = 'backhand',
  FOREHAND = 'forehand',
  GROUNDSTROKE = 'groundstroke'
}

/**
 * Court positions where shots can be executed
 */
export enum CourtPosition {
  KITCHEN_LINE = 'kitchen_line',
  NON_VOLLEY_ZONE = 'non_volley_zone',
  MID_COURT = 'mid_court',
  BASELINE = 'baseline',
  SIDELINE = 'sideline',
  CENTER = 'center',
  TRANSITION_AREA = 'transition_area',
  SERVE_AREA = 'serve_area'
}

/**
 * Game context situations where specific shots are used
 */
export enum GameContext {
  SERVE = 'serve',
  RETURN_OF_SERVE = 'return_of_serve',
  THIRD_SHOT = 'third_shot',
  FOURTH_SHOT = 'fourth_shot',
  KITCHEN_RALLY = 'kitchen_rally',
  TRANSITION = 'transition',
  DEFENSIVE = 'defensive',
  OFFENSIVE = 'offensive',
  RESET = 'reset',
  COUNTER_ATTACK = 'counter_attack'
}

/**
 * Shot characteristics describing how the shot is executed
 */
export enum ShotCharacteristic {
  TOPSPIN = 'topspin',
  BACKSPIN = 'backspin',
  SIDESPIN = 'sidespin',
  FLAT = 'flat',
  HIGH = 'high',
  LOW = 'low',
  FAST = 'fast',
  SLOW = 'slow',
  SOFT = 'soft',
  HARD = 'hard',
  DEEP = 'deep',
  SHORT = 'short',
  CROSS_COURT = 'cross_court',
  DOWN_THE_LINE = 'down_the_line',
  MIDDLE = 'middle',
  ANGLED = 'angled',
  UNDERSPIN = 'underspin',
  NO_SPIN = 'no_spin'
}

/**
 * Common errors for each shot type
 */
export enum ShotError {
  TOO_HIGH = 'too_high',
  TOO_DEEP = 'too_deep',
  TOO_SHORT = 'too_short',
  INTO_NET = 'into_net',
  OUT_OF_BOUNDS = 'out_of_bounds',
  WRONG_TIMING = 'wrong_timing',
  POOR_FOOTWORK = 'poor_footwork',
  IMPROPER_GRIP = 'improper_grip',
  POOR_PADDLE_ANGLE = 'poor_paddle_angle',
  POOR_CONTACT_POINT = 'poor_contact_point',
  INCONSISTENT_DEPTH = 'inconsistent_depth',
  TOO_MUCH_POWER = 'too_much_power',
  TOO_LITTLE_POWER = 'too_little_power',
  TELEGRAPHING = 'telegraphing',
  IMPROPER_WEIGHT_TRANSFER = 'improper_weight_transfer',
  NO_FOLLOW_THROUGH = 'no_follow_through',
  POOR_PREPARATION = 'poor_preparation',
  KITCHEN_VIOLATION = 'kitchen_violation'
}

/**
 * Detailed information about a specific pickleball shot
 */
export interface ShotInfo {
  /** The type of shot */
  type: ShotType;
  /** Human-readable name for the shot */
  name: string;
  /** Detailed description of the shot */
  description: string;
  /** When this shot is typically used */
  usedWhen: string;
  /** Common court positions for this shot */
  positions: CourtPosition[];
  /** Game contexts where this shot is commonly used */
  gameContexts: GameContext[];
  /** Typical characteristics of this shot */
  characteristics: ShotCharacteristic[];
  /** Difficulty level (1-5) */
  difficultyLevel: number;
  /** Common errors when executing this shot */
  commonErrors: ShotError[];
  /** Keywords to help identify this shot */
  keywords: string[];
  /** Tips for improving this shot */
  improvementTips: string[];
}

/**
 * The comprehensive pickleball shot database
 */
export const pickleballShots: Record<ShotType, ShotInfo> = {
  [ShotType.DINK]: {
    type: ShotType.DINK,
    name: "Dink",
    description: "A soft, controlled shot hit from the non-volley zone (kitchen) that arcs over the net and lands in the opponent's non-volley zone. The goal is to keep the ball low with minimal pace, making it difficult for opponents to attack.",
    usedWhen: "Used during kitchen rallies to maintain a defensive or neutral position, forcing opponents to hit up on the ball or make an error.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.NON_VOLLEY_ZONE],
    gameContexts: [GameContext.KITCHEN_RALLY, GameContext.RESET, GameContext.DEFENSIVE],
    characteristics: [ShotCharacteristic.SOFT, ShotCharacteristic.LOW, ShotCharacteristic.SLOW, ShotCharacteristic.UNDERSPIN],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.TOO_HIGH, 
      ShotError.TOO_DEEP, 
      ShotError.INTO_NET, 
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.INCONSISTENT_DEPTH
    ],
    keywords: ["dink", "soft", "kitchen", "drop", "touch", "finesse", "short", "nvz", "non-volley zone"],
    improvementTips: [
      "Focus on a continental grip for better control",
      "Keep the paddle face open and slightly upward",
      "Use your legs to absorb power, not just your arms",
      "Practice with targets in the opponent's kitchen to develop consistency",
      "Work on dinking to various locations (cross-court, down the line, middle)"
    ]
  },
  [ShotType.DRIVE]: {
    type: ShotType.DRIVE,
    name: "Drive",
    description: "A firm, flat shot hit with pace and typically aimed low over the net. The drive is an offensive shot designed to pressure opponents or win the point outright.",
    usedWhen: "Used when the ball is at a comfortable height for aggressive play, often from mid-court positions or when opponents give you a high ball.",
    positions: [CourtPosition.MID_COURT, CourtPosition.BASELINE, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.THIRD_SHOT, GameContext.OFFENSIVE, GameContext.COUNTER_ATTACK],
    characteristics: [ShotCharacteristic.HARD, ShotCharacteristic.FAST, ShotCharacteristic.FLAT, ShotCharacteristic.LOW],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.OUT_OF_BOUNDS, 
      ShotError.INTO_NET, 
      ShotError.TOO_MUCH_POWER, 
      ShotError.WRONG_TIMING,
      ShotError.POOR_PREPARATION
    ],
    keywords: ["drive", "power", "pace", "fast", "flat", "hard", "aggressive", "attack", "speed"],
    improvementTips: [
      "Focus on keeping the ball low over the net",
      "Aim for the opponent's feet or body to create difficult returns",
      "Practice controlled power - accuracy is more important than sheer speed",
      "Work on disguising your drives to look like drops until the last moment",
      "Develop both forehand and backhand drives for tactical versatility"
    ]
  },
  [ShotType.VOLLEY]: {
    type: ShotType.VOLLEY,
    name: "Volley",
    description: "A shot played before the ball bounces, typically executed near the non-volley zone line. Volleys are hit with a compact motion and minimal backswing for quick reactions.",
    usedWhen: "Used when positioned at the kitchen line to maintain offensive positioning or to counterattack an opponent's shot.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.KITCHEN_RALLY, GameContext.OFFENSIVE, GameContext.DEFENSIVE, GameContext.COUNTER_ATTACK],
    characteristics: [ShotCharacteristic.FAST, ShotCharacteristic.COMPACT, ShotCharacteristic.ANGLED, ShotCharacteristic.BLOCK],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.WRONG_TIMING, 
      ShotError.TOO_MUCH_BACKSWING, 
      ShotError.KITCHEN_VIOLATION,
      ShotError.IMPROPER_GRIP
    ],
    keywords: ["volley", "out of the air", "punch", "block", "kitchen line", "react", "quick"],
    improvementTips: [
      "Keep the paddle in front of your body and ready in the 'ready position'",
      "Use a compact motion with minimal backswing",
      "Focus on redirecting the opponent's pace rather than adding your own",
      "Practice quick reactions with volley drills",
      "Work on softening your hands for touch volleys and firming them for aggressive volleys"
    ]
  },
  [ShotType.DROP_SHOT]: {
    type: ShotType.DROP_SHOT,
    name: "Drop Shot",
    description: "A finesse shot that softly arcs over the net and lands in the opponent's non-volley zone. Similar to a dink but typically executed from a deeper court position after the ball has bounced.",
    usedWhen: "Used when you want to neutralize a point, transition from the baseline to the kitchen line, or when opponents are positioned far back in the court.",
    positions: [CourtPosition.MID_COURT, CourtPosition.BASELINE, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.THIRD_SHOT, GameContext.RESET, GameContext.TRANSITION],
    characteristics: [ShotCharacteristic.SOFT, ShotCharacteristic.SLOW, ShotCharacteristic.UNDERSPIN, ShotCharacteristic.SHORT],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.TOO_HIGH, 
      ShotError.TOO_DEEP, 
      ShotError.INTO_NET, 
      ShotError.POOR_PADDLE_ANGLE,
      ShotError.INCONSISTENT_DEPTH
    ],
    keywords: ["drop", "drop shot", "soft", "finesse", "touch", "feel", "placement", "short", "arc"],
    improvementTips: [
      "Practice lifting the ball just enough to clear the net",
      "Focus on a relaxed grip and soft hands",
      "Use underspin to help control the depth",
      "Aim for the front half of the non-volley zone",
      "Develop the ability to hit drops from various court positions"
    ]
  },
  [ShotType.LOB]: {
    type: ShotType.LOB,
    name: "Lob",
    description: "A defensive shot that sends the ball high over the opponents' heads, typically when they are at the kitchen line. A well-executed lob forces opponents to retreat from the kitchen line and resets the point.",
    usedWhen: "Used when under pressure at the kitchen line, when opponents are crowding the net, or as a surprise tactical change of pace.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.NON_VOLLEY_ZONE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.DEFENSIVE, GameContext.RESET, GameContext.KITCHEN_RALLY],
    characteristics: [ShotCharacteristic.HIGH, ShotCharacteristic.DEEP, ShotCharacteristic.BACKSPIN, ShotCharacteristic.SOFT],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.TOO_SHORT, 
      ShotError.OUT_OF_BOUNDS, 
      ShotError.TELEGRAPHING, 
      ShotError.POOR_DISGUISE
    ],
    keywords: ["lob", "over the head", "high", "defensive", "deep", "back", "reset", "clear"],
    improvementTips: [
      "Disguise your lob to look like a dink until the last moment",
      "Add slight backspin to control depth and slow the ball down",
      "Aim for 1-2 feet inside the baseline",
      "Practice lobs from both forehand and backhand sides",
      "Use your legs to generate lift rather than just your arms"
    ]
  },
  [ShotType.SERVE]: {
    type: ShotType.SERVE,
    name: "Serve",
    description: "The shot that starts each point, hit diagonally across court from behind the baseline. In pickleball, the serve must be hit underhand with the paddle below the waist and the wrist.",
    usedWhen: "Used to start each point, following the proper service sequence based on the score.",
    positions: [CourtPosition.BASELINE, CourtPosition.SERVE_AREA],
    gameContexts: [GameContext.SERVE],
    characteristics: [ShotCharacteristic.DEEP, ShotCharacteristic.CONSISTENT, ShotCharacteristic.VARIED],
    difficultyLevel: 2,
    commonErrors: [
      ShotError.TOO_SHORT, 
      ShotError.OUT_OF_BOUNDS, 
      ShotError.ILLEGAL_MOTION, 
      ShotError.FOOT_FAULT,
      ShotError.IMPROPER_GRIP
    ],
    keywords: ["serve", "service", "underhand", "start", "point", "drop", "diagonal", "deep"],
    improvementTips: [
      "Focus on consistency before power or spin",
      "Develop different serve types (deep, short, with spin)",
      "Practice serving to different targets (wide, body, T)",
      "Maintain legal form (underhand, below waist)",
      "Use the full service box to vary your positioning"
    ]
  },
  [ShotType.RETURN]: {
    type: ShotType.RETURN,
    name: "Return of Serve",
    description: "The first shot by the receiving team after the serve. Returns must be allowed to bounce before being hit, and they set the tone for the point.",
    usedWhen: "Used when receiving serve, with the goal of neutralizing the server's advantage and establishing good court position.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.RETURN_OF_SERVE],
    characteristics: [ShotCharacteristic.DEEP, ShotCharacteristic.LOW, ShotCharacteristic.CONTROLLED],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.TOO_SHORT, 
      ShotError.TOO_HIGH, 
      ShotError.POOR_FOOTWORK, 
      ShotError.WRONG_TIMING,
      ShotError.INTO_NET
    ],
    keywords: ["return", "second shot", "receive", "receive serve", "return of serve", "bounce"],
    improvementTips: [
      "Take a split step as the server makes contact",
      "Step into the return to generate controlled power",
      "Aim deep to push the serving team back",
      "Return to the middle to limit angles for the third shot",
      "Practice returns against various serve speeds and spins"
    ]
  },
  [ShotType.THIRD_SHOT_DROP]: {
    type: ShotType.THIRD_SHOT_DROP,
    name: "Third Shot Drop",
    description: "A soft, finesse shot hit by the serving team on their third shot of the rally. The goal is to drop the ball softly into the opponent's non-volley zone, allowing the serving team to move forward to the kitchen line.",
    usedWhen: "Used as a strategic shot by the serving team to neutralize the receiving team's advantage and transition from the baseline to the non-volley zone.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.THIRD_SHOT, GameContext.TRANSITION],
    characteristics: [ShotCharacteristic.SOFT, ShotCharacteristic.UNDERSPIN, ShotCharacteristic.SHORT, ShotCharacteristic.LOW],
    difficultyLevel: 5,
    commonErrors: [
      ShotError.TOO_HIGH, 
      ShotError.TOO_DEEP, 
      ShotError.INTO_NET, 
      ShotError.POOR_PADDLE_ANGLE,
      ShotError.IMPROPER_WEIGHT_TRANSFER
    ],
    keywords: ["third shot", "drop", "transition", "soft", "touch", "finesse", "approach", "kitchen", "set up"],
    improvementTips: [
      "Practice from various court positions to prepare for different return types",
      "Focus on clearing the net with a slight margin",
      "Target the middle or directly in front of opponents to reduce their angles",
      "Work on reading the receiver's position before deciding on drop placement",
      "Develop patience and control over power"
    ]
  },
  [ShotType.THIRD_SHOT_DRIVE]: {
    type: ShotType.THIRD_SHOT_DRIVE,
    name: "Third Shot Drive",
    description: "An aggressive, penetrating shot hit by the serving team on their third shot when a drop shot isn't feasible. The goal is to hit with pace and keep the ball low, forcing a defensive return.",
    usedWhen: "Used when the return is high enough to attack, when weather conditions make drops difficult, or as a tactical change-up from the standard third shot drop.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.THIRD_SHOT, GameContext.OFFENSIVE],
    characteristics: [ShotCharacteristic.HARD, ShotCharacteristic.FAST, ShotCharacteristic.LOW, ShotCharacteristic.FLAT],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.OUT_OF_BOUNDS, 
      ShotError.INTO_NET, 
      ShotError.TOO_HIGH, 
      ShotError.POOR_TARGET_SELECTION
    ],
    keywords: ["third shot", "drive", "power", "pace", "attack", "aggressive", "hit", "speed"],
    improvementTips: [
      "Keep the ball low over the net - drives with height are easy to attack",
      "Target the opponent's weaker side or the middle between opponents",
      "Follow the shot to the kitchen line rather than staying back",
      "Practice different speeds to avoid being predictable",
      "Develop the ability to quickly decide between a drop or drive based on the return"
    ]
  },
  [ShotType.SMASH]: {
    type: ShotType.SMASH,
    name: "Smash (Overhead)",
    description: "A powerful overhead shot hit with downward trajectory in response to a high ball or lob. The smash is designed to end the point with power and placement.",
    usedWhen: "Used when opponents hit a high ball or lob that can be attacked from above shoulder height.",
    positions: [CourtPosition.MID_COURT, CourtPosition.KITCHEN_LINE, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.OFFENSIVE, GameContext.COUNTER_ATTACK],
    characteristics: [ShotCharacteristic.HARD, ShotCharacteristic.FAST, ShotCharacteristic.DOWNWARD, ShotCharacteristic.TOPSPIN],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.OUT_OF_BOUNDS, 
      ShotError.INTO_NET, 
      ShotError.KITCHEN_VIOLATION, 
      ShotError.POOR_FOOTWORK,
      ShotError.POOR_TIMING
    ],
    keywords: ["smash", "overhead", "put away", "slam", "attack", "power", "kill", "finish"],
    improvementTips: [
      "Point with your non-paddle hand at the ball as you prepare",
      "Use a continental grip for better control",
      "Focus on placement over pure power - aim for open court or at opponents' feet",
      "Be aware of the kitchen line to avoid violations when following through",
      "Maintain proper spacing from the ball - not too close or too far"
    ]
  },
  [ShotType.RESET]: {
    type: ShotType.RESET,
    name: "Reset Shot",
    description: "A defensive shot that neutralizes an opponent's aggressive shot by softly returning the ball into the non-volley zone. The reset turns a defensive situation into a neutral kitchen battle.",
    usedWhen: "Used when opponents hit a hard ball at you and you're unable to counterattack, especially when positioned at the kitchen line.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.NON_VOLLEY_ZONE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.DEFENSIVE, GameContext.RESET, GameContext.KITCHEN_RALLY],
    characteristics: [ShotCharacteristic.SOFT, ShotCharacteristic.BLOCK, ShotCharacteristic.CONTROLLED, ShotCharacteristic.SHORT],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.TOO_HIGH, 
      ShotError.TOO_DEEP, 
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.STIFF_WRISTS
    ],
    keywords: ["reset", "block", "absorb", "soft", "defense", "neutralize", "control", "defuse"],
    improvementTips: [
      "Soften your grip when making contact",
      "Use the angle of your paddle face to control the height and depth",
      "Keep the shot simple - focus on placement over spin or complexity",
      "Practice against increasingly hard shots to develop feel",
      "Work on anticipation to prepare earlier for resets"
    ]
  },
  [ShotType.PUNCH]: {
    type: ShotType.PUNCH,
    name: "Punch Volley",
    description: "A firmly hit volley with a short, compact motion that directs the ball downward with control and purpose. The punch volley is more aggressive than a block but more controlled than a smash.",
    usedWhen: "Used at the kitchen line when you receive a ball at a comfortable height that allows an offensive response without setting up your opponents.",
    positions: [CourtPosition.KITCHEN_LINE],
    gameContexts: [GameContext.OFFENSIVE, GameContext.KITCHEN_RALLY, GameContext.COUNTER_ATTACK],
    characteristics: [ShotCharacteristic.FIRM, ShotCharacteristic.CONTROLLED, ShotCharacteristic.DOWNWARD, ShotCharacteristic.COMPACT],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.INTO_NET, 
      ShotError.TOO_DEEP, 
      ShotError.KITCHEN_VIOLATION, 
      ShotError.TOO_MUCH_BACKSWING
    ],
    keywords: ["punch", "firm volley", "put away", "aggressive volley", "downward", "attack", "short swing"],
    improvementTips: [
      "Maintain a compact swing with minimal backswing",
      "Use a firm wrist and forearm to control the shot",
      "Direct the ball downward at the opponent's feet",
      "Target the middle between opponents to create confusion",
      "Practice various angles of punch volleys to expand your offensive options"
    ]
  },
  [ShotType.BLOCK]: {
    type: ShotType.BLOCK,
    name: "Block Volley",
    description: "A defensive volley that uses the pace of the incoming ball, with the player essentially positioning the paddle to redirect the ball without adding much force. The block neutralizes aggressive shots.",
    usedWhen: "Used when defending against hard-hit balls, especially when there's limited time to react, or when positioned in a defensive posture at the kitchen line.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.MID_COURT],
    gameContexts: [GameContext.DEFENSIVE, GameContext.RESET, GameContext.KITCHEN_RALLY],
    characteristics: [ShotCharacteristic.SOFT, ShotCharacteristic.CONTROLLED, ShotCharacteristic.REDIRECTING, ShotCharacteristic.ABSORBING],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.TOO_ACTIVE, 
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.STIFF_WRISTS, 
      ShotError.LATE_PREPARATION
    ],
    keywords: ["block", "defensive volley", "redirect", "absorb", "cushion", "soft hands", "control"],
    improvementTips: [
      "Keep your paddle in front of you in ready position",
      "Soften your grip to absorb pace",
      "Focus on paddle angle rather than swinging",
      "Direct blocks to areas that limit opponents' options",
      "Practice against various speeds to develop touch"
    ]
  },
  [ShotType.TOPSPIN]: {
    type: ShotType.TOPSPIN,
    name: "Topspin Shot",
    description: "A shot hit with forward spin by brushing the paddle up the back of the ball. Topspin causes the ball to dip downward more quickly and bounce higher, making it effective for control and aggressive play.",
    usedWhen: "Used when you want to keep aggressive shots in the court, hit with higher margin over the net, or create a difficult-to-return high bounce.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.OFFENSIVE, GameContext.THIRD_SHOT, GameContext.RETURN_OF_SERVE],
    characteristics: [ShotCharacteristic.TOPSPIN, ShotCharacteristic.CONTROLLED, ShotCharacteristic.DIPPING, ShotCharacteristic.BOUNCING],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.IMPROPER_CONTACT_POINT, 
      ShotError.POOR_PADDLE_PATH, 
      ShotError.INCORRECT_GRIP, 
      ShotError.POOR_TIMING
    ],
    keywords: ["topspin", "spin", "roll", "brush", "lift", "rotate", "dip", "control"],
    improvementTips: [
      "Brush up the back of the ball with an accelerating paddle",
      "Use a relaxed grip that allows the paddle to rotate slightly",
      "Start with the paddle below the contact point and finish high",
      "Practice the proper low-to-high swing path",
      "Develop feel for different amounts of spin based on the situation"
    ]
  },
  [ShotType.SLICE]: {
    type: ShotType.SLICE,
    name: "Slice Shot",
    description: "A shot hit with backspin by brushing the paddle down and across the back of the ball. Slice causes the ball to stay low after the bounce and can slow down the pace of play.",
    usedWhen: "Used for drop shots, approach shots, defensive returns, or when wanting to change the pace and height of rallies.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.DEFENSIVE, GameContext.THIRD_SHOT, GameContext.RESET, GameContext.RETURN_OF_SERVE],
    characteristics: [ShotCharacteristic.BACKSPIN, ShotCharacteristic.LOW, ShotCharacteristic.CONTROLLED, ShotCharacteristic.FLOATING],
    difficultyLevel: 4,
    commonErrors: [
      ShotError.IMPROPER_CONTACT_POINT, 
      ShotError.POOR_PADDLE_PATH, 
      ShotError.TOO_MUCH_SLICE, 
      ShotError.POOR_DEPTH_CONTROL
    ],
    keywords: ["slice", "backspin", "underspin", "cut", "chop", "low bounce", "float", "skid"],
    improvementTips: [
      "Contact the ball with a high-to-low paddle motion",
      "Open the paddle face slightly at contact",
      "Focus on brushing across the back of the ball, not just down",
      "Use slice to control depth on drop shots",
      "Practice varying the amount of slice based on the situation"
    ]
  },
  [ShotType.ATP]: {
    type: ShotType.ATP,
    name: "Around-the-Post Shot (ATP)",
    description: "A shot hit around the outside of the net post instead of over the net. This creative shot is legal as long as the ball lands in the proper court area, and it can be hit at any height, even below the net.",
    usedWhen: "Used when the ball is wide of the sideline and low, creating an angle that makes going over the net difficult or impossible.",
    positions: [CourtPosition.SIDELINE, CourtPosition.MID_COURT, CourtPosition.KITCHEN_LINE],
    gameContexts: [GameContext.OFFENSIVE, GameContext.COUNTER_ATTACK, GameContext.DEFENSIVE],
    characteristics: [ShotCharacteristic.CREATIVE, ShotCharacteristic.ANGLED, ShotCharacteristic.SURPRISE, ShotCharacteristic.LATERAL],
    difficultyLevel: 5,
    commonErrors: [
      ShotError.OUT_OF_BOUNDS, 
      ShotError.INTO_NET_POST, 
      ShotError.POOR_COURT_POSITIONING, 
      ShotError.POOR_SHOT_SELECTION
    ],
    keywords: ["atp", "around the post", "outside", "post", "creative", "angle", "sideline", "trick shot"],
    improvementTips: [
      "Practice identifying ATP opportunities when the ball is wide",
      "Work on your lateral movement to get into position quickly",
      "Focus on directional control rather than power",
      "Use slice or sidespin to help control the wide angle",
      "Don't force ATP shots - they should be a natural response to extreme angles"
    ]
  },
  [ShotType.ERNE]: {
    type: ShotType.ERNE,
    name: "Erne Shot",
    description: "An advanced shot where the player jumps or steps around the non-volley zone (outside the sideline) and volleys the ball while airborne or leaning into the court. The erne allows players to attack at the net while legally avoiding the non-volley zone restrictions.",
    usedWhen: "Used as a surprise offensive tactic when opponents are hitting predictable cross-court dinks or when you want to pressure opponents from an unexpected position.",
    positions: [CourtPosition.SIDELINE, CourtPosition.KITCHEN_LINE],
    gameContexts: [GameContext.OFFENSIVE, GameContext.SURPRISE, GameContext.KITCHEN_RALLY],
    characteristics: [ShotCharacteristic.ATHLETIC, ShotCharacteristic.SURPRISE, ShotCharacteristic.VOLLEY, ShotCharacteristic.AGGRESSIVE],
    difficultyLevel: 5,
    commonErrors: [
      ShotError.KITCHEN_VIOLATION, 
      ShotError.POOR_TIMING, 
      ShotError.POOR_POSITIONING, 
      ShotError.TELEGRAPHING
    ],
    keywords: ["erne", "jump", "sideline", "volley", "surprise", "aggressive", "around kitchen", "attack"],
    improvementTips: [
      "Practice proper footwork to avoid touching the non-volley zone",
      "Develop the ability to execute ernes from both forehand and backhand sides",
      "Work on disguising your intentions until the last moment",
      "Ensure you can reach the ball comfortably - don't force ernes on out-of-reach shots",
      "Practice timing your movement with your partner's shots in doubles"
    ]
  },
  [ShotType.OUT_OF_AIR]: {
    type: ShotType.OUT_OF_AIR,
    name: "Out of the Air Shot",
    description: "Any shot hit before the ball bounces, including volleys, smashes, and other aerial shots. The term generally refers to volleys hit from various court positions.",
    usedWhen: "Used to maintain offensive pressure, take time away from opponents, or when properly positioned at the non-volley zone line.",
    positions: [CourtPosition.KITCHEN_LINE, CourtPosition.MID_COURT, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.OFFENSIVE, GameContext.KITCHEN_RALLY, GameContext.COUNTER_ATTACK],
    characteristics: [ShotCharacteristic.QUICK, ShotCharacteristic.COMPACT, ShotCharacteristic.REFLEX, ShotCharacteristic.VARIED],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.POOR_PADDLE_PREPARATION, 
      ShotError.WRONG_TIMING, 
      ShotError.POOR_POSITIONING, 
      ShotError.KITCHEN_VIOLATION
    ],
    keywords: ["out of air", "volley", "aerial", "no bounce", "reflex", "quick", "reaction"],
    improvementTips: [
      "Keep your paddle up and ready in front of you",
      "Use a continental grip for maximum versatility",
      "Focus on reaction time drills to improve quickness",
      "Practice volleys from different heights and speeds",
      "Work on paddle control to direct the ball to specific targets"
    ]
  },
  [ShotType.BACKHAND]: {
    type: ShotType.BACKHAND,
    name: "Backhand Shot",
    description: "Any shot hit from the non-dominant side of the body, with the back of the hand facing the direction of the shot. Backhands can be groundstrokes, volleys, dinks, or any other shot type.",
    usedWhen: "Used when the ball approaches the non-dominant side of the body or when tactically choosing to hit from the backhand side.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.KITCHEN_LINE, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.VARIED, GameContext.DEFENSIVE, GameContext.OFFENSIVE],
    characteristics: [ShotCharacteristic.VARIED, ShotCharacteristic.CONTROLLED, ShotCharacteristic.VERSATILE],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.IMPROPER_GRIP, 
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.INSUFFICIENT_ROTATION, 
      ShotError.POOR_WEIGHT_TRANSFER
    ],
    keywords: ["backhand", "non-dominant", "two-handed", "one-handed", "cross-court", "down the line"],
    improvementTips: [
      "Develop proper rotation through the core and shoulders",
      "Find a comfortable grip that works for multiple backhand shots",
      "Practice the transition from ready position to backhand preparation",
      "Work on both offensive and defensive backhand shots",
      "For two-handed backhands, ensure proper grip and hand coordination"
    ]
  },
  [ShotType.FOREHAND]: {
    type: ShotType.FOREHAND,
    name: "Forehand Shot",
    description: "Any shot hit from the dominant side of the body, with the palm of the hand facing the direction of the shot. Forehands can be groundstrokes, volleys, dinks, or any other shot type.",
    usedWhen: "Used when the ball approaches the dominant side of the body or when tactically choosing to hit from the forehand side.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.KITCHEN_LINE, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.VARIED, GameContext.DEFENSIVE, GameContext.OFFENSIVE],
    characteristics: [ShotCharacteristic.VARIED, ShotCharacteristic.CONTROLLED, ShotCharacteristic.VERSATILE, ShotCharacteristic.POWERFUL],
    difficultyLevel: 2,
    commonErrors: [
      ShotError.IMPROPER_GRIP, 
      ShotError.POOR_PADDLE_ANGLE, 
      ShotError.INSUFFICIENT_ROTATION, 
      ShotError.POOR_WEIGHT_TRANSFER
    ],
    keywords: ["forehand", "dominant", "palm", "drive", "cross-court", "down the line", "inside out"],
    improvementTips: [
      "Develop proper weight transfer from back foot to front foot",
      "Work on consistent contact point in front of the body",
      "Practice varying pace and spin on forehand shots",
      "Ensure proper rotation through the hips and shoulders",
      "Develop both offensive and defensive forehand techniques"
    ]
  },
  [ShotType.GROUNDSTROKE]: {
    type: ShotType.GROUNDSTROKE,
    name: "Groundstroke",
    description: "A shot hit after the ball bounces, typically with a fuller swing than volleys or dinks. Groundstrokes can be hit with topspin, backspin, or flat, and from various court positions.",
    usedWhen: "Used when hitting the ball after it bounces, particularly from the baseline or mid-court areas.",
    positions: [CourtPosition.BASELINE, CourtPosition.MID_COURT, CourtPosition.TRANSITION_AREA],
    gameContexts: [GameContext.RETURN_OF_SERVE, GameContext.THIRD_SHOT, GameContext.TRANSITION],
    characteristics: [ShotCharacteristic.VARIED, ShotCharacteristic.FULL_SWING, ShotCharacteristic.DEPTH, ShotCharacteristic.POWER],
    difficultyLevel: 3,
    commonErrors: [
      ShotError.IMPROPER_GRIP, 
      ShotError.POOR_FOOTWORK, 
      ShotError.LATE_PREPARATION, 
      ShotError.INCONSISTENT_CONTACT_POINT
    ],
    keywords: ["groundstroke", "after bounce", "baseline", "drive", "topspin", "backspin", "slice", "flat"],
    improvementTips: [
      "Establish a consistent contact point relative to your body",
      "Practice proper follow-through to maintain control and direction",
      "Develop the ability to hit with various spins based on the situation",
      "Work on movement and recovery after hitting groundstrokes",
      "Practice transitioning from groundstrokes to net play"
    ]
  }
};

/**
 * Result from analyzing a message for shot-related content
 */
export interface ShotAnalysis {
  /** The primary shot type detected */
  primaryShot: ShotType;
  /** Secondary shot type if multiple are mentioned */
  secondaryShot?: ShotType;
  /** The confidence level (1-5) of the detection */
  confidence: number;
  /** Whether the message indicates a shot-related issue */
  hasIssue: boolean;
  /** The specific shot issue identified, if any */
  specificIssue?: string;
  /** Whether the user is seeking advice about this shot */
  seekingAdvice: boolean;
  /** Detected error types, if any */
  detectedErrors: ShotError[];
}

/**
 * Recognize shots mentioned in player messages
 */
export function analyzeShotReference(message: string): ShotAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Initialize analysis object
  const analysis: ShotAnalysis = {
    primaryShot: ShotType.DINK, // Default value, will be updated
    confidence: 1,
    hasIssue: false,
    seekingAdvice: false,
    detectedErrors: []
  };
  
  // Determine if the user is seeking advice
  const adviceIndicators = [
    'how do i', 'how to', 'help with', 'improve', 'better', 'advice', 
    'tip', 'suggestion', 'problem with', 'struggling with', 'trouble with'
  ];
  
  analysis.seekingAdvice = adviceIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Score each shot type based on keyword matches
  const shotScores: Record<ShotType, number> = Object.keys(pickleballShots).reduce((acc, key) => {
    acc[key as ShotType] = 0;
    return acc;
  }, {} as Record<ShotType, number>);
  
  // Calculate scores
  Object.entries(pickleballShots).forEach(([shotType, info]) => {
    const type = shotType as ShotType;
    
    // Check each keyword
    info.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        shotScores[type] += 2;
      }
    });
    
    // Check shot name
    if (lowerMessage.includes(info.name.toLowerCase())) {
      shotScores[type] += 3;
    }
  });
  
  // Find primary and secondary shots
  let maxScore = 0;
  let secondMaxScore = 0;
  let primaryShot = ShotType.DINK;
  let secondaryShot = undefined;
  
  Object.entries(shotScores).forEach(([shotType, score]) => {
    if (score > maxScore) {
      secondMaxScore = maxScore;
      secondaryShot = primaryShot;
      maxScore = score;
      primaryShot = shotType as ShotType;
    } else if (score > secondMaxScore && score > 0) {
      secondMaxScore = score;
      secondaryShot = shotType as ShotType;
    }
  });
  
  // Set confidence level based on max score
  if (maxScore >= 5) {
    analysis.confidence = 5;
  } else if (maxScore >= 3) {
    analysis.confidence = 4;
  } else if (maxScore >= 2) {
    analysis.confidence = 3;
  } else if (maxScore >= 1) {
    analysis.confidence = 2;
  }
  
  // Update analysis with shots
  analysis.primaryShot = primaryShot;
  if (secondaryShot && secondMaxScore > 0) {
    analysis.secondaryShot = secondaryShot;
  }
  
  // Check for common shot errors
  const errorIndicators = [
    'problem', 'issue', 'trouble', 'struggling', 'difficult', 'can\'t', 
    'cannot', 'not able', 'need help', 'goes into', 'missing', 'too much', 
    'too little', 'inconsistent', 'error'
  ];
  
  analysis.hasIssue = errorIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // If there's an issue, try to determine what error type(s) it is
  if (analysis.hasIssue) {
    // Map of error types to their indicator phrases
    const errorTypeIndicators: Record<ShotError, string[]> = {
      [ShotError.TOO_HIGH]: ['too high', 'going high', 'popping up', 'height issue'],
      [ShotError.TOO_DEEP]: ['too deep', 'going long', 'past baseline', 'depth issue'],
      [ShotError.TOO_SHORT]: ['too short', 'not deep enough', 'short', 'landing short'],
      [ShotError.INTO_NET]: ['into net', 'hitting net', 'in the net', 'not clearing net'],
      [ShotError.OUT_OF_BOUNDS]: ['out', 'out of bounds', 'going wide', 'landing out'],
      [ShotError.WRONG_TIMING]: ['timing', 'too early', 'too late', 'rushed'],
      [ShotError.POOR_FOOTWORK]: ['footwork', 'feet', 'positioning', 'not in position'],
      [ShotError.IMPROPER_GRIP]: ['grip', 'holding paddle', 'handle', 'hand position'],
      [ShotError.POOR_PADDLE_ANGLE]: ['paddle angle', 'face', 'paddle face', 'angled wrong'],
      [ShotError.POOR_CONTACT_POINT]: ['contact point', 'hitting point', 'contact', 'striking ball'],
      [ShotError.INCONSISTENT_DEPTH]: ['inconsistent depth', 'depth varies', 'sometimes deep'],
      [ShotError.TOO_MUCH_POWER]: ['too hard', 'too much power', 'hitting too hard', 'powerful'],
      [ShotError.TOO_LITTLE_POWER]: ['too soft', 'not enough power', 'weak', 'no pace'],
      [ShotError.TELEGRAPHING]: ['telegraphing', 'predictable', 'giving away', 'opponents know'],
      [ShotError.IMPROPER_WEIGHT_TRANSFER]: ['weight transfer', 'body weight', 'shift weight'],
      [ShotError.NO_FOLLOW_THROUGH]: ['follow through', 'swing stops', 'not completing'],
      [ShotError.POOR_PREPARATION]: ['preparation', 'not ready', 'backswing', 'setup'],
      [ShotError.KITCHEN_VIOLATION]: ['kitchen violation', 'foot fault', 'non-volley zone']
    };
    
    // Check for each error type
    Object.entries(errorTypeIndicators).forEach(([errorType, indicators]) => {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        analysis.detectedErrors.push(errorType as ShotError);
      }
    });
    
    // Generate a specific issue description
    if (analysis.detectedErrors.length > 0 && analysis.confidence >= 3) {
      const shotInfo = pickleballShots[analysis.primaryShot];
      
      // Find the first detected error that matches a common error for this shot
      const relevantError = analysis.detectedErrors.find(error => 
        shotInfo.commonErrors.includes(error)
      );
      
      if (relevantError) {
        // Format the error in a readable way
        const errorText = relevantError.toString().toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        analysis.specificIssue = `${errorText} issue with your ${shotInfo.name.toLowerCase()}`;
      } else if (analysis.detectedErrors.length > 0) {
        // Use the first detected error if none match common errors
        const errorText = analysis.detectedErrors[0].toString().toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        analysis.specificIssue = `${errorText} issue with your ${shotInfo.name.toLowerCase()}`;
      }
    }
  }
  
  return analysis;
}

/**
 * Generate improvement tips for a specific shot
 */
export function getShotImprovementTips(shotType: ShotType, errorTypes?: ShotError[]): string[] {
  const shotInfo = pickleballShots[shotType];
  
  // Start with all improvement tips for this shot
  let tips = [...shotInfo.improvementTips];
  
  // If error types are specified, prioritize tips relevant to those errors
  if (errorTypes && errorTypes.length > 0) {
    // Map of error types to relevant improvement focus areas
    const errorFocusAreas: Record<ShotError, string[]> = {
      [ShotError.TOO_HIGH]: ['height', 'angle', 'contact', 'paddle face'],
      [ShotError.TOO_DEEP]: ['depth', 'power', 'control', 'follow through'],
      [ShotError.TOO_SHORT]: ['depth', 'power', 'follow through', 'contact'],
      [ShotError.INTO_NET]: ['height', 'paddle angle', 'contact point', 'lift'],
      [ShotError.OUT_OF_BOUNDS]: ['control', 'direction', 'paddle angle', 'power'],
      [ShotError.WRONG_TIMING]: ['timing', 'preparation', 'ready position', 'anticipation'],
      [ShotError.POOR_FOOTWORK]: ['footwork', 'movement', 'position', 'balance'],
      [ShotError.IMPROPER_GRIP]: ['grip', 'hand position', 'handle', 'paddle control'],
      [ShotError.POOR_PADDLE_ANGLE]: ['paddle face', 'angle', 'wrist', 'contact'],
      [ShotError.POOR_CONTACT_POINT]: ['contact', 'hitting point', 'timing', 'position'],
      [ShotError.INCONSISTENT_DEPTH]: ['consistency', 'control', 'repetition', 'practice'],
      [ShotError.TOO_MUCH_POWER]: ['control', 'soft', 'touch', 'finesse'],
      [ShotError.TOO_LITTLE_POWER]: ['power', 'acceleration', 'weight transfer', 'swing'],
      [ShotError.TELEGRAPHING]: ['disguise', 'deception', 'variety', 'preparation'],
      [ShotError.IMPROPER_WEIGHT_TRANSFER]: ['weight shift', 'body movement', 'legs', 'core'],
      [ShotError.NO_FOLLOW_THROUGH]: ['follow through', 'complete motion', 'swing path'],
      [ShotError.POOR_PREPARATION]: ['preparation', 'ready position', 'backswing', 'anticipation'],
      [ShotError.KITCHEN_VIOLATION]: ['awareness', 'positioning', 'momentum', 'court awareness']
    };
    
    // For each error type, prioritize tips that contain relevant focus areas
    errorTypes.forEach(errorType => {
      const focusAreas = errorFocusAreas[errorType] || [];
      tips.sort((a, b) => {
        const aScore = focusAreas.filter(area => a.toLowerCase().includes(area)).length;
        const bScore = focusAreas.filter(area => b.toLowerCase().includes(area)).length;
        return bScore - aScore; // Higher score first
      });
    });
  }
  
  return tips;
}

/**
 * Generate a response about a specific shot
 */
export function generateShotResponse(analysis: ShotAnalysis): string {
  const shotInfo = pickleballShots[analysis.primaryShot];
  let response = '';
  
  // Different response types based on whether user is seeking advice and has issues
  if (analysis.seekingAdvice && analysis.hasIssue) {
    // Advice for a specific issue
    response = `It sounds like you're having some challenges with your ${shotInfo.name.toLowerCase()}`;
    
    if (analysis.specificIssue) {
      response += `, specifically with ${analysis.specificIssue.replace(`issue with your ${shotInfo.name.toLowerCase()}`, '')}`;
    }
    
    response += `. Here are some tips that might help:\n\n`;
    
    // Add 2-3 relevant tips
    const tips = getShotImprovementTips(analysis.primaryShot, analysis.detectedErrors);
    const tipCount = Math.min(3, tips.length);
    
    for (let i = 0; i < tipCount; i++) {
      response += `• ${tips[i]}\n`;
    }
    
    // Add contextual information about when this shot is used
    response += `\nRemember, the ${shotInfo.name.toLowerCase()} is best used ${shotInfo.usedWhen.toLowerCase()}`;
    
  } else if (analysis.seekingAdvice) {
    // General advice for improving a shot
    response = `To improve your ${shotInfo.name.toLowerCase()}, consider these key techniques:\n\n`;
    
    // Add 3-4 tips
    const tips = getShotImprovementTips(analysis.primaryShot);
    const tipCount = Math.min(4, tips.length);
    
    for (let i = 0; i < tipCount; i++) {
      response += `• ${tips[i]}\n`;
    }
    
    // Add some context about difficulty
    const difficultyWords = ['very basic', 'fundamental', 'intermediate', 'advanced', 'expert-level'];
    response += `\nThe ${shotInfo.name.toLowerCase()} is a ${difficultyWords[shotInfo.difficultyLevel - 1]} shot that ${shotInfo.usedWhen.toLowerCase()}`;
    
  } else {
    // Informational response about the shot
    response = `The ${shotInfo.name} is ${shotInfo.description}\n\n`;
    response += `This shot is typically used ${shotInfo.usedWhen.toLowerCase()}\n\n`;
    
    // Add characteristics
    response += `Key characteristics of a good ${shotInfo.name.toLowerCase()}:\n`;
    const characteristics = shotInfo.characteristics.map(c => 
      c.toString().toLowerCase().replace(/_/g, ' ')
    );
    response += `• ${characteristics.join('\n• ')}\n\n`;
    
    // Mention common errors if they seem interested in technique
    response += `Common challenges with this shot include: `;
    const errorTexts = shotInfo.commonErrors.map(e => 
      e.toString().toLowerCase().replace(/_/g, ' ')
    );
    response += errorTexts.join(', ');
  }
  
  // If secondary shot was detected, add a brief note
  if (analysis.secondaryShot && analysis.confidence >= 3) {
    const secondaryShotInfo = pickleballShots[analysis.secondaryShot];
    response += `\n\nYou also mentioned the ${secondaryShotInfo.name.toLowerCase()}. Would you like information about that shot as well?`;
  }
  
  return response;
}

/**
 * Check if a question is about pickleball shots
 */
export function isShotQuestion(question: string): boolean {
  const shotQuestionIndicators = [
    'shot', 'shots', 'dink', 'drive', 'volley', 'third shot', 'serve', 'return',
    'hit', 'hitting', 'swing', 'technique', 'paddle', 'strike', 'ball',
    'backhand', 'forehand', 'drop', 'smash', 'overhead', 'atp', 'erne'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return shotQuestionIndicators.some(indicator => lowerQuestion.includes(indicator));
}