/**
 * PKL-278651-COACH-0005-VOCAB
 * Pickleball Vocabulary and Terminology Database
 * 
 * This file provides a comprehensive database of pickleball terminology
 * to enhance SAGE's ability to understand and explain pickleball-specific
 * language used by players.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

/**
 * Types of pickleball terminology
 */
export enum TerminologyType {
  RULE = 'rule',
  EQUIPMENT = 'equipment',
  SHOT = 'shot',
  STRATEGY = 'strategy',
  COURT = 'court',
  SCORING = 'scoring',
  POSITION = 'position',
  TECHNIQUE = 'technique',
  SLANG = 'slang',
  TOURNAMENT = 'tournament',
  FAULT = 'fault'
}

/**
 * Level of terminology from basic to advanced
 */
export enum TerminologyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * A pickleball terminology entry
 */
export interface PickleballTerm {
  /** The term or phrase */
  term: string;
  /** Alternative names or spellings */
  variants?: string[];
  /** Term definition */
  definition: string;
  /** The type of terminology */
  type: TerminologyType;
  /** Player experience level for this term */
  level: TerminologyLevel;
  /** Related terms */
  relatedTerms?: string[];
  /** Keywords to help identify this term */
  keywords: string[];
  /** Related USAP rule section, if applicable */
  ruleReference?: string;
}

/**
 * The comprehensive pickleball terminology database
 */
export const pickleballTerminology: PickleballTerm[] = [
  // COURT TERMS
  {
    term: "Kitchen",
    variants: ["Non-Volley Zone", "NVZ"],
    definition: "The 7-foot area extending from the net on both sides of the court where players cannot volley the ball (hit it out of the air before it bounces).",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Non-Volley Zone", "Kitchen Line", "Kitchen Violation"],
    keywords: ["kitchen", "nvz", "non-volley", "zone", "net", "7-foot", "no volley"],
    ruleReference: "2.B.3"
  },
  {
    term: "Kitchen Line",
    definition: "The line that marks the boundary of the non-volley zone (kitchen), located 7 feet from the net on both sides.",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Kitchen", "Non-Volley Zone"],
    keywords: ["kitchen line", "nvz line", "line", "7-foot", "boundary"]
  },
  {
    term: "Baseline",
    definition: "The line at the back of the pickleball court, parallel to the net, marking the outer boundary of the playing area.",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Sideline", "Service Court"],
    keywords: ["baseline", "back", "boundary", "line", "end"]
  },
  {
    term: "Centerline",
    definition: "The line that divides the service courts on each side of the net, extending from the kitchen line to the baseline.",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Service Court", "Right Service Court", "Left Service Court"],
    keywords: ["centerline", "center", "middle", "divide", "service court", "line"]
  },
  {
    term: "Sideline",
    definition: "The lines on each side of the court that mark the lateral boundaries of the playing area.",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Baseline", "Out of Bounds"],
    keywords: ["sideline", "side", "boundary", "line", "lateral", "width"]
  },
  {
    term: "Service Court",
    definition: "The area on either side of the centerline where the serve must land, consisting of the right (even) and left (odd) service courts.",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Right Service Court", "Left Service Court", "Centerline", "Serve"],
    keywords: ["service court", "serve area", "right court", "left court", "even court", "odd court"]
  },
  {
    term: "Right Service Court",
    variants: ["Even Court"],
    definition: "The service court to the right of the centerline (when facing the net) from which serves are made when the server's score is even (0, 2, 4, etc.).",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Service Court", "Left Service Court", "Even Score"],
    keywords: ["right court", "even court", "service court", "0-2-4", "even score", "right side"]
  },
  {
    term: "Left Service Court",
    variants: ["Odd Court"],
    definition: "The service court to the left of the centerline (when facing the net) from which serves are made when the server's score is odd (1, 3, 5, etc.).",
    type: TerminologyType.COURT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Service Court", "Right Service Court", "Odd Score"],
    keywords: ["left court", "odd court", "service court", "1-3-5", "odd score", "left side"]
  },
  
  // EQUIPMENT TERMS
  {
    term: "Paddle",
    variants: ["Racket", "Racquet"],
    definition: "The solid-faced implement used to hit the ball in pickleball, typically made of composite materials, with specific dimension limitations set by USAP.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Grip", "Face", "Edge Guard"],
    keywords: ["paddle", "racket", "racquet", "equipment", "hitting", "implement", "composite"]
  },
  {
    term: "Pickleball",
    definition: "The perforated plastic ball used in the game, typically 2.87-2.97 inches in diameter with 26-40 round holes.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Indoor Ball", "Outdoor Ball"],
    keywords: ["ball", "plastic", "holes", "perforated", "wiffle", "equipment"]
  },
  {
    term: "Grip",
    definition: "The handle of the paddle or the way a player holds the paddle. Also refers to the wrap or material covering the handle for better hold.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Continental Grip", "Eastern Grip", "Western Grip", "Overgrip"],
    keywords: ["grip", "handle", "hold", "wrap", "tape", "overgrip", "cushion"]
  },
  {
    term: "Continental Grip",
    definition: "A grip position where the base knuckle of the index finger is placed on the top right bevel of the paddle handle (for right-handed players), allowing for versatile shot-making.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Grip", "Eastern Grip", "Western Grip"],
    keywords: ["continental grip", "grip", "versatile", "handle", "handshake", "volley", "technique"]
  },
  {
    term: "Face",
    definition: "The flat striking surface of the paddle that makes contact with the ball.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Paddle", "Sweet Spot"],
    keywords: ["face", "surface", "paddle face", "hitting surface", "sweet spot", "paddle"]
  },
  {
    term: "Edge Guard",
    definition: "The protective material around the perimeter of the paddle face that protects it from damage and wear.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Paddle", "Face"],
    keywords: ["edge guard", "guard", "rim", "perimeter", "protection", "paddle"]
  },
  {
    term: "Indoor Ball",
    definition: "A pickleball designed specifically for indoor play, typically with more and smaller holes, a smoother surface, and lighter weight than outdoor balls.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Pickleball", "Outdoor Ball"],
    keywords: ["indoor ball", "indoor", "ball", "lighter", "more holes", "smaller holes"]
  },
  {
    term: "Outdoor Ball",
    definition: "A pickleball designed specifically for outdoor play, typically with fewer and larger holes, a textured surface, and heavier weight than indoor balls for wind resistance.",
    type: TerminologyType.EQUIPMENT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Pickleball", "Indoor Ball"],
    keywords: ["outdoor ball", "outdoor", "ball", "heavier", "fewer holes", "larger holes", "wind"]
  },
  
  // SCORING TERMS
  {
    term: "Side Out",
    definition: "When the serving team commits a fault, resulting in the serve passing to the opposing team.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Fault", "Service", "Second Server"],
    keywords: ["side out", "change serve", "lose serve", "service change", "hand off"]
  },
  {
    term: "Rally",
    definition: "The continuous play from the time the ball is served until a fault is committed by one side.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Point", "Fault", "Dead Ball"],
    keywords: ["rally", "play", "exchange", "hitting", "continuous", "point"]
  },
  {
    term: "Dead Ball",
    definition: "A ball that is no longer in play due to a fault, hinder, or timeout.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Fault", "Hinder", "Live Ball"],
    keywords: ["dead ball", "out of play", "fault", "stoppage", "not in play"]
  },
  {
    term: "Live Ball",
    definition: "A ball that is in play, from the moment of the serve until a fault or dead ball occurs.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Dead Ball", "Rally", "In Play"],
    keywords: ["live ball", "in play", "active", "rally", "point"]
  },
  {
    term: "First Server",
    variants: ["Server One", "Server #1"],
    definition: "In doubles, the player who serves first for a team during a service rotation, designated by wearing a form of identification.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Second Server", "Side Out", "Doubles Scoring"],
    keywords: ["first server", "server one", "server 1", "initial server", "start server", "doubles"]
  },
  {
    term: "Second Server",
    variants: ["Server Two", "Server #2"],
    definition: "In doubles, the player who serves second for a team during a service rotation after the first server loses their serve.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["First Server", "Side Out", "Doubles Scoring"],
    keywords: ["second server", "server two", "server 2", "partner", "doubles"]
  },
  {
    term: "Win by Two",
    definition: "The rule that a team must win by at least a two-point margin. When the score reaches 10-10 (or the designated game point), play continues until one team wins by 2 points.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Game Point", "Match Point", "Deuce"],
    keywords: ["win by two", "two point margin", "deuce", "overtime", "game point"]
  },
  {
    term: "Game Point",
    definition: "When one team is one point away from winning the game.",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Match Point", "Win by Two"],
    keywords: ["game point", "winning point", "final point", "point to win"]
  },
  {
    term: "Match Point",
    definition: "When one team is one point away from winning the match (which may consist of multiple games).",
    type: TerminologyType.SCORING,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Game Point", "Win by Two"],
    keywords: ["match point", "championship point", "final point", "point to win match"]
  },
  
  // SHOT TERMS
  {
    term: "Dink",
    definition: "A soft shot hit from the non-volley zone that arcs over the net and lands in the opponent's non-volley zone, typically with minimal pace and maximum control.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Drop Shot", "Kitchen", "Soft Game"],
    keywords: ["dink", "soft", "touch", "arc", "kitchen", "control", "finesse"]
  },
  {
    term: "Drive",
    definition: "A firm, low shot hit with pace that typically travels flat over the net rather than in a high arc. Often used as an offensive shot.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Third Shot Drive", "Power Game", "Groundstroke"],
    keywords: ["drive", "hard", "flat", "pace", "power", "aggressive", "baseline"]
  },
  {
    term: "Volley",
    definition: "A shot hit before the ball bounces, typically executed near the non-volley zone line with a compact motion and minimal backswing.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Kitchen Violation", "Punch", "Block"],
    keywords: ["volley", "out of air", "no bounce", "hit", "kitchen line", "net"]
  },
  {
    term: "Third Shot Drop",
    definition: "A soft, controlled shot hit by the serving team on their third shot of the rally that lands in the opponent's non-volley zone, allowing the serving team to advance to the net.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Third Shot Drive", "Drop Shot", "Transition"],
    keywords: ["third shot drop", "third shot", "drop", "soft", "setup", "transition", "approach"]
  },
  {
    term: "Third Shot Drive",
    definition: "A firm, low shot hit by the serving team on their third shot of the rally, typically used when a drop shot isn't feasible or as a strategic variation.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Third Shot Drop", "Drive", "Power Game"],
    keywords: ["third shot drive", "third shot", "drive", "power", "aggressive", "flat", "hard"]
  },
  {
    term: "Erne",
    definition: "An advanced shot where a player positions themselves outside the sideline adjacent to the non-volley zone to volley the ball while avoiding kitchen violations. Named after Erne Perry.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.ADVANCED,
    relatedTerms: ["Around the Post", "Volley", "Kitchen Violation"],
    keywords: ["erne", "sideline", "jump", "volley", "advanced", "surprise", "attack"]
  },
  {
    term: "Around the Post (ATP)",
    definition: "A shot hit around the outside of the net post rather than over the net. Legal as long as the ball lands in the proper court area, and can be hit at any height (even below net height).",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.ADVANCED,
    relatedTerms: ["Erne", "Angle", "Sideline"],
    keywords: ["atp", "around the post", "wide", "angle", "outside", "creative", "sideline"]
  },
  {
    term: "Lob",
    definition: "A high-arcing shot hit over the heads of opponents who are positioned at the non-volley zone line, forcing them to move back from the net.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Overhead", "Defensive Shot", "Smash"],
    keywords: ["lob", "high", "over", "defensive", "arc", "overhead", "back"]
  },
  {
    term: "Smash",
    variants: ["Overhead", "Putaway"],
    definition: "A forceful overhead shot hit with downward angle in response to a high ball or lob, typically used to end a point.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Lob", "Offensive Shot", "Putaway"],
    keywords: ["smash", "overhead", "putaway", "kill", "power", "attack", "finish"]
  },
  {
    term: "Reset",
    definition: "A defensive shot that neutralizes an opponent's aggressive shot by softly redirecting the ball into the non-volley zone, turning a defensive situation into a neutral one.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Block", "Dink", "Defensive Shot"],
    keywords: ["reset", "neutralize", "block", "absorb", "soft", "defense", "control"]
  },
  {
    term: "Drop Shot",
    definition: "A finesse shot that softly arcs over the net and lands in the opponent's non-volley zone. Similar to a dink but typically executed from a deeper court position after the ball has bounced.",
    type: TerminologyType.SHOT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Dink", "Third Shot Drop", "Soft Game"],
    keywords: ["drop shot", "finesse", "soft", "short", "touch", "arc", "placement"]
  },
  
  // STRATEGY TERMS
  {
    term: "Stacking",
    definition: "A strategic positioning technique where partners maintain their preferred sides of the court regardless of the score, requiring specific positioning before serves and coordinated movement afterward.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Traditional Alignment", "Side Selection", "Doubles Strategy"],
    keywords: ["stacking", "strategy", "positioning", "sides", "preferred side", "formation"]
  },
  {
    term: "Traditional Alignment",
    definition: "The standard doubles formation where partners switch sides when the score is even/odd, maintaining the initial server on the right side for even scores and the left side for odd scores.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Stacking", "Even/Odd", "Doubles Strategy"],
    keywords: ["traditional", "alignment", "formation", "switching", "side", "standard", "even odd"]
  },
  {
    term: "Soft Game",
    definition: "A strategic approach focusing on control, placement, and patience using dinks and soft shots rather than power, typically played at the non-volley zone line.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Dink", "Kitchen Battle", "Patient Game"],
    keywords: ["soft game", "dinking", "control", "placement", "finesse", "patient", "kitchen"]
  },
  {
    term: "Power Game",
    definition: "A strategic approach emphasizing drives, smashes, and firm shots to overpower opponents with pace and aggressive shots.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Drive", "Smash", "Aggressive Play"],
    keywords: ["power game", "aggressive", "drive", "pace", "hard", "attacking", "bangers"]
  },
  {
    term: "Kitchen Battle",
    variants: ["Dinking Battle", "Kitchen Rally"],
    definition: "Extended exchanges with both teams at the non-volley zone line, typically involving dinks and soft shots, with players waiting for opportunities to attack.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Dink", "Soft Game", "Cat and Mouse"],
    keywords: ["kitchen battle", "dinking battle", "patient", "nvz", "exchange", "control", "soft game"]
  },
  {
    term: "Transition Game",
    definition: "The strategic movement and shot selection used to advance from the baseline to the non-volley zone line, typically after the return of serve.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Third Shot Drop", "Third Shot Drive", "Approach"],
    keywords: ["transition", "approach", "moving up", "baseline to kitchen", "advancing", "forward"]
  },
  {
    term: "Poaching",
    definition: "When one player crosses over to their partner's side of the court to hit a ball, typically done to capitalize on a weak shot or create an offensive advantage.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Doubles Strategy", "Communication", "Coverage"],
    keywords: ["poach", "cross over", "cut off", "partner's side", "take over", "aggressive"]
  },
  {
    term: "Up and Back",
    variants: ["Half and Half"],
    definition: "A doubles formation where one player is at the non-volley zone line while their partner stays back at or near the baseline, often used during transition or when defending against lobs.",
    type: TerminologyType.STRATEGY,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Formation", "Doubles Strategy", "Defensive Position"],
    keywords: ["up and back", "half and half", "one up one back", "split", "transition", "defense"]
  },
  
  // TECHNIQUE TERMS
  {
    term: "Ready Position",
    definition: "The stance and paddle position a player adopts while waiting for the opponent's shot, typically with knees slightly bent, weight on the balls of the feet, and paddle held up in front of the body.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Paddle Position", "Stance", "Athletic Position"],
    keywords: ["ready position", "ready", "stance", "preparation", "paddle up", "waiting"]
  },
  {
    term: "Split Step",
    definition: "A small hop or step taken just as the opponent is about to hit the ball, allowing for quicker reaction and movement in any direction.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Ready Position", "Footwork", "Reaction"],
    keywords: ["split step", "hop", "preparation", "reaction", "timing", "footwork", "movement"]
  },
  {
    term: "Weight Transfer",
    definition: "The shifting of body weight from back foot to front foot during shot execution to generate power and control.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Footwork", "Balance", "Follow Through"],
    keywords: ["weight transfer", "shift weight", "balance", "power", "body weight", "movement"]
  },
  {
    term: "Paddle Angle",
    definition: "The orientation of the paddle face relative to the ground or the intended direction of the shot, which affects trajectory, spin, and control.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Open Face", "Closed Face", "Paddle Control"],
    keywords: ["paddle angle", "face", "angle", "direction", "control", "trajectory", "lift"]
  },
  {
    term: "Open Face",
    definition: "A paddle position where the face is angled upward, typically used for dinks, lobs, and shots requiring height or lift.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Paddle Angle", "Closed Face", "Lift"],
    keywords: ["open face", "face up", "angle", "lift", "height", "dink", "lob"]
  },
  {
    term: "Closed Face",
    definition: "A paddle position where the face is angled downward, typically used for drives, blocks, and shots requiring a lower trajectory.",
    type: TerminologyType.TECHNIQUE,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Paddle Angle", "Open Face", "Drive"],
    keywords: ["closed face", "face down", "angle", "drive", "low", "firm", "downward"]
  },
  
  // FAULT TERMS
  {
    term: "Fault",
    definition: "A violation of the rules that results in the loss of the rally. The serving team loses their serve, and the receiving team earns a point.",
    type: TerminologyType.FAULT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Point", "Side Out", "Violation"],
    keywords: ["fault", "violation", "error", "infraction", "rule", "loss", "point"]
  },
  {
    term: "Kitchen Violation",
    variants: ["Non-Volley Zone Violation", "NVZ Violation"],
    definition: "A fault that occurs when a player volleys the ball while standing in the non-volley zone (kitchen) or touching the non-volley zone line, or when momentum after a volley causes any part of the player to touch the non-volley zone.",
    type: TerminologyType.FAULT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Kitchen", "Volley", "Fault"],
    keywords: ["kitchen violation", "nvz violation", "foot fault", "kitchen fault", "non-volley zone"]
  },
  {
    term: "Foot Fault",
    definition: "A serving fault that occurs when the server's foot touches the baseline, court, or area inside the imaginary extension of the centerline or sideline during the serve motion.",
    type: TerminologyType.FAULT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Service", "Baseline", "Fault"],
    keywords: ["foot fault", "serving fault", "foot", "baseline", "line", "serve", "foot position"]
  },
  {
    term: "Let",
    definition: "When a served ball touches the net, net cord, or net strap and still lands in the proper service court. The serve is replayed without penalty. Also used when play is interrupted for valid reasons such as a ball rolling onto the court.",
    type: TerminologyType.RULE,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Service", "Net Cord", "Replay"],
    keywords: ["let", "net", "replay", "service let", "cord", "strap", "interruption"],
    ruleReference: "7.J"
  },
  {
    term: "Double Hit",
    definition: "A fault that occurs when a player's paddle or player's body intentionally hits the ball more than once before returning it. Unintentional double contacts during a single continuous stroke are allowed.",
    type: TerminologyType.FAULT,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Carry", "Fault"],
    keywords: ["double hit", "twice", "multiple hits", "consecutive", "strike", "fault"]
  },
  {
    term: "Carry",
    variants: ["Throw", "Sling"],
    definition: "A fault that occurs when the ball visibly comes to rest or sits on the paddle face during a stroke, essentially being thrown rather than hit.",
    type: TerminologyType.FAULT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Double Hit", "Fault"],
    keywords: ["carry", "throw", "sling", "hold", "paddle", "rest", "fault"]
  },
  
  // TOURNAMENT TERMS
  {
    term: "Round Robin",
    definition: "A tournament format where each participant plays against every other participant or team in their group, with standings based on win-loss records.",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Pool Play", "Format", "Bracket"],
    keywords: ["round robin", "tournament", "all play all", "group", "format", "schedule"]
  },
  {
    term: "Double Elimination",
    definition: "A tournament format where participants are eliminated after losing two matches, with separate winner's and loser's brackets.",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Single Elimination", "Bracket", "Loser's Bracket"],
    keywords: ["double elimination", "tournament", "two losses", "bracket", "winners losers", "format"]
  },
  {
    term: "Rating",
    variants: ["Skill Rating", "DUPR", "UTPR"],
    definition: "A numerical representation of a player's skill level, used for tournament classifications and matching players of similar abilities. Common rating systems include DUPR (Dynamic Universal Pickleball Rating) and UTPR (USA Pickleball Tournament Player Rating).",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Skill Level", "Tournament Division", "Sandbagging"],
    keywords: ["rating", "skill level", "number", "dupr", "utpr", "classification", "level"]
  },
  {
    term: "Age Division",
    definition: "Tournament categories based on player age (e.g., 19+, 35+, 50+, 65+), allowing players to compete against others in similar age groups.",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Skill Division", "Mixed Doubles", "Bracket"],
    keywords: ["age division", "senior", "junior", "35+", "50+", "65+", "age group"]
  },
  {
    term: "Skill Division",
    variants: ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "Pro"],
    definition: "Tournament categories based on player skill level, typically ranging from 2.5 (beginner) to 5.0+ (advanced/professional).",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Rating", "Age Division", "Classification"],
    keywords: ["skill division", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "level", "rating"]
  },
  {
    term: "Sandbagging",
    definition: "The controversial practice of a player deliberately lowering their rating or playing below their true skill level to gain an advantage in lower-rated tournaments.",
    type: TerminologyType.TOURNAMENT,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Rating", "Skill Division", "Fair Play"],
    keywords: ["sandbagging", "underplaying", "rating", "lower division", "advantage", "unfair"]
  },
  
  // SLANG AND PICKLEBALL CULTURE
  {
    term: "Banger",
    definition: "Slang for a player who primarily relies on hard-hitting, aggressive shots (drives and smashes) rather than the soft game or strategic play.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Power Game", "Drive", "Soft Game"],
    keywords: ["banger", "slammer", "hitter", "power player", "aggressive", "hard hitter"]
  },
  {
    term: "Pickleball Smile",
    definition: "The distinctive mark left on a player's forehead after being hit by a pickleball, due to the ball's patterned holes.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Tattoo", "Hit"],
    keywords: ["pickleball smile", "mark", "forehead", "hit", "pattern", "holes", "tattoo"]
  },
  {
    term: "Dillball",
    variants: ["Dill Pickle Award"],
    definition: "Slang for a lucky shot or winner that results from an unintentional or unconventional play, named after pickleball co-founder Joel Pritchard's dog, Pickle.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Lucky Shot", "Fluke"],
    keywords: ["dillball", "dill pickle", "lucky", "fluke", "fortunate", "unintentional", "net cord"]
  },
  {
    term: "Kitchen Lingerer",
    definition: "Slang for a player who stays primarily at the non-volley zone line, rarely moving back from this position, often focusing on the dinking game.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Kitchen Player", "Soft Game", "Dinking"],
    keywords: ["kitchen lingerer", "nvz player", "stay at kitchen", "dinking specialist", "front player"]
  },
  {
    term: "Pickler",
    definition: "A person who plays pickleball; a pickleball enthusiast or player.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.BEGINNER,
    relatedTerms: ["Pickleball", "Player"],
    keywords: ["pickler", "player", "enthusiast", "participant", "athlete", "competitor"]
  },
  {
    term: "Nasty Nelson",
    definition: "A serve deliberately aimed at the body of the receiver, typically at the hip or midsection, named after a player who popularized the strategy.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.ADVANCED,
    relatedTerms: ["Body Serve", "Serve Strategy"],
    keywords: ["nasty nelson", "body serve", "target", "hip", "serve at player", "controversial"]
  },
  {
    term: "Pickle in the Middle",
    definition: "A situation where one player is caught in the middle zone of the court (not at the kitchen line or baseline), leaving them vulnerable to aggressive shots.",
    type: TerminologyType.SLANG,
    level: TerminologyLevel.INTERMEDIATE,
    relatedTerms: ["Transition", "No Man's Land", "Vulnerable Position"],
    keywords: ["pickle in the middle", "no man's land", "transition zone", "vulnerable", "middle court"]
  }
];

/**
 * Find pickleball terminology based on a search term
 */
export function findTerminology(searchTerm: string): PickleballTerm[] {
  const lowerSearch = searchTerm.toLowerCase();
  
  // Look for exact matches first
  const exactMatches = pickleballTerminology.filter(term => 
    term.term.toLowerCase() === lowerSearch || 
    (term.variants && term.variants.some(v => v.toLowerCase() === lowerSearch))
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // If no exact matches, look for partial matches
  return pickleballTerminology.filter(term => {
    // Check the main term
    if (term.term.toLowerCase().includes(lowerSearch)) {
      return true;
    }
    
    // Check variants
    if (term.variants && term.variants.some(v => v.toLowerCase().includes(lowerSearch))) {
      return true;
    }
    
    // Check keywords
    if (term.keywords.some(k => k.toLowerCase().includes(lowerSearch) || lowerSearch.includes(k.toLowerCase()))) {
      return true;
    }
    
    // Check definition (with lower weight)
    if (term.definition.toLowerCase().includes(lowerSearch)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Get terminology by type
 */
export function getTerminologyByType(type: TerminologyType): PickleballTerm[] {
  return pickleballTerminology.filter(term => term.type === type);
}

/**
 * Get terminology by experience level
 */
export function getTerminologyByLevel(level: TerminologyLevel): PickleballTerm[] {
  return pickleballTerminology.filter(term => term.level === level);
}

/**
 * Get related terminology for a specific term
 */
export function getRelatedTerminology(term: string): PickleballTerm[] {
  // Find the main term first
  const mainTerm = findTerminology(term)[0];
  
  if (!mainTerm || !mainTerm.relatedTerms || mainTerm.relatedTerms.length === 0) {
    return [];
  }
  
  // Find all related terms
  return pickleballTerminology.filter(t => 
    mainTerm.relatedTerms!.includes(t.term) || 
    (t.relatedTerms && t.relatedTerms.includes(mainTerm.term))
  );
}

/**
 * Generate a response explaining pickleball terminology
 */
export function generateTerminologyResponse(term: string): string {
  const matches = findTerminology(term);
  
  if (matches.length === 0) {
    return `I don't have specific information about "${term}" in my pickleball terminology database. Could you provide more context or check the spelling?`;
  }
  
  const mainTerm = matches[0];
  let response = `**${mainTerm.term}**`;
  
  if (mainTerm.variants && mainTerm.variants.length > 0) {
    response += ` (also known as: ${mainTerm.variants.join(', ')})`;
  }
  
  response += `\n\n${mainTerm.definition}`;
  
  if (mainTerm.ruleReference) {
    response += `\n\nThis relates to USAP Rule ${mainTerm.ruleReference}.`;
  }
  
  if (mainTerm.relatedTerms && mainTerm.relatedTerms.length > 0) {
    response += `\n\nRelated terms: ${mainTerm.relatedTerms.join(', ')}`;
  }
  
  // If there are other close matches, mention them
  if (matches.length > 1) {
    response += `\n\nYou might also be interested in: `;
    response += matches.slice(1, Math.min(3, matches.length))
      .map(t => t.term)
      .join(', ');
  }
  
  return response;
}

/**
 * Check if a query is about pickleball terminology
 */
export function isTerminologyQuestion(query: string): boolean {
  const terminologyIndicators = [
    'what is', 'what are', 'what does', 'meaning of', 'define', 'terminology',
    'term', 'called', 'mean', 'explain', 'definition', 'slang', 'pickleball term'
  ];
  
  const lowerQuery = query.toLowerCase();
  return terminologyIndicators.some(indicator => lowerQuery.includes(indicator));
}

/**
 * Detect pickleball terminology in text
 * 
 * Returns an array of recognized terminology with confidence scores
 */
export function detectTerminology(text: string): Array<{term: PickleballTerm, confidence: number}> {
  const results: Array<{term: PickleballTerm, confidence: number}> = [];
  const lowerText = text.toLowerCase();
  
  // First pass: look for explicit terms
  pickleballTerminology.forEach(term => {
    let confidence = 0;
    
    // Check for the main term (exact match)
    if (lowerText.includes(term.term.toLowerCase())) {
      // Full term match is high confidence
      confidence = 5;
    } 
    // Check variants
    else if (term.variants && term.variants.some(v => lowerText.includes(v.toLowerCase()))) {
      // Variant match is also high confidence
      confidence = 5;
    }
    // Check for partial matches in keywords
    else {
      const keywordMatches = term.keywords.filter(k => lowerText.includes(k.toLowerCase()));
      if (keywordMatches.length >= 2) {
        // Multiple keyword matches are medium confidence
        confidence = 3;
      } else if (keywordMatches.length === 1) {
        // Single keyword match is lower confidence
        confidence = 2;
      }
    }
    
    // Only include terms with some level of confidence
    if (confidence > 0) {
      results.push({ term, confidence });
    }
  });
  
  // Sort by confidence
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detect if text contains unfamiliar terminology that might need explanation
 */
export function detectUnfamiliarTerminology(text: string, userLevel: TerminologyLevel = TerminologyLevel.BEGINNER): PickleballTerm[] {
  const detectedTerms = detectTerminology(text);
  const levelOrder = {
    [TerminologyLevel.BEGINNER]: 1,
    [TerminologyLevel.INTERMEDIATE]: 2,
    [TerminologyLevel.ADVANCED]: 3
  };
  
  // Filter terms that are above the user's level and have high confidence
  return detectedTerms
    .filter(item => 
      item.confidence >= 4 && 
      levelOrder[item.term.level] > levelOrder[userLevel]
    )
    .map(item => item.term);
}

/**
 * Get explanations for potentially unfamiliar terminology
 */
export function getExplanationsForTerminology(text: string, userLevel: TerminologyLevel = TerminologyLevel.BEGINNER): string {
  const unfamiliarTerms = detectUnfamiliarTerminology(text, userLevel);
  
  if (unfamiliarTerms.length === 0) {
    return '';
  }
  
  let explanations = "I noticed some pickleball terminology that might be unfamiliar:\n\n";
  
  unfamiliarTerms.forEach(term => {
    explanations += `**${term.term}**: ${term.definition}\n\n`;
  });
  
  return explanations;
}