/**
 * PKL-278651-SAGE-0016-EXTENDED-KB
 * SAGE Extended Knowledge Base
 * 
 * This service provides comprehensive knowledge about pickleball rules,
 * Pickle+ platform features, ranking systems, and training concepts.
 * This knowledge is used by SAGE to answer user questions in a single
 * conversational interface.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { DimensionCode } from '../../shared/schema/sage';

/**
 * Knowledge Base content types
 */
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  isPremium?: boolean;
  relatedItems?: string[];
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  items: KnowledgeItem[];
}

/**
 * All SAGE knowledge organized by category
 */
export const sageKnowledge: KnowledgeCategory[] = [
  {
    id: 'rules',
    name: 'Pickleball Rules',
    description: 'Official rules, regulations, and guidelines for playing pickleball',
    items: [
      {
        id: 'basic_rules',
        title: 'Basic Pickleball Rules',
        content: `Pickleball is played on a 20' x 44' court with a net height of 36" at the sidelines and 34" in the middle. The game can be played as singles or doubles.

Key rules include:
- Serves must be made diagonally, starting from the right-hand service square
- The ball must bounce once on each side after the serve ("double bounce rule")
- Players cannot volley the ball in the non-volley zone or "kitchen" (the 7-foot zone on each side of the net)
- Only the serving team can score points
- Games are typically played to 11 points and must be won by 2 points`,
        keywords: ['rules', 'basics', 'court', 'dimensions', 'scoring', 'serve', 'kitchen', 'non-volley zone']
      },
      {
        id: 'serving_rules',
        title: 'Serving Rules',
        content: `Pickleball serving rules:
- Serves must be made underhand with the paddle below the waist
- The server must keep both feet behind the back line during the serve
- The serve must be made diagonally, landing in the opposite service court
- At the start of each game, only one player on the first serving team gets to serve
- When the first server loses the point, the serve passes to the opponent
- In doubles, both players on a team serve before the serve passes to the opponent (except for the first service sequence)
- The player on the right side (even court) serves first, then rotates with their partner
- Side-out occurs when the serving team fails to score a point`,
        keywords: ['serve', 'serving', 'rotation', 'side out', 'underhand', 'diagonal']
      },
      {
        id: 'scoring',
        title: 'Scoring System',
        content: `Pickleball scoring basics:
- Only the serving team can score points
- Games are typically played to 11 points and must be won by 2 points
- Tournament games may be played to 15 or 21 points

In doubles, the score is called as three numbers:
1. The serving team's score
2. The receiving team's score
3. The server number (1 or 2) referring to whether the server is the first or second server from their team

For example, a score of "5-3-2" means the serving team has 5 points, the receiving team has 3 points, and the server is the second server from their team.

In singles, only two numbers are called (serving team score - receiving team score).`,
        keywords: ['score', 'scoring', 'points', 'numbers', 'calling score', 'server number']
      },
      {
        id: 'faults',
        title: 'Faults & Violations',
        content: `A fault results in a dead ball and loss of serve or point. Common faults include:

- Hitting the ball out of bounds
- Not clearing the net
- Touching the non-volley zone (kitchen) or its lines while volleying or due to momentum after a volley
- Volleying the ball before it has bounced once on each side after the serve
- Carrying or catching the ball with the paddle
- Touching the net with any part of your body, clothing, or paddle
- Hitting the ball twice before it crosses the net
- The ball touches a player or anything they are wearing or carrying (except the paddle)
- Not allowing the ball to bounce on the first serve and return

When a fault occurs, the server loses the serve or the receiving team loses the point if they committed the fault.`,
        keywords: ['fault', 'violation', 'penalty', 'illegal', 'out', 'kitchen violation', 'double bounce', 'carry']
      },
      {
        id: 'kitchen_rules',
        title: 'Non-Volley Zone (Kitchen) Rules',
        content: `The non-volley zone, commonly called "the kitchen," is the area within 7 feet on both sides of the net. Key rules:

- Players may not volley the ball (hit it in the air before it bounces) while standing in the kitchen or touching the kitchen line
- Players may not step into the kitchen or touch the kitchen line after volleying, even if the momentum from the volley carries them there
- Players may enter the kitchen at any time to hit a ball that has bounced
- The paddle may cross over the kitchen in the air during a volley, as long as the player doesn't touch the kitchen
- If a player hits a volley and their momentum carries them into the kitchen, it's a fault
- A ball that bounces in the kitchen can be hit from inside the kitchen (as long as it bounced first)

This rule is designed to reduce the advantage of aggressive net play and encourage longer rallies.`,
        keywords: ['kitchen', 'non-volley zone', 'NVZ', 'volley', 'kitchen violation', 'momentum', 'net play']
      },
      {
        id: 'line_calls',
        title: 'Line Calls & Ball In/Out Rules',
        content: `For official line calls in pickleball:

- A ball touching any part of the line is considered "in"
- The ball is called "out" when it lands completely outside the boundary line
- Players make line calls for balls landing on their side of the court
- If a team cannot make a definitive call, the ball is considered "in" (benefit of the doubt goes to the opponent)
- In recreational play without officials, players use the honor system
- In tournament play, line judges or referees make the calls
- Players can appeal line calls to the referee if one is present
- Once a player makes a call, that decision is final unless overruled by a referee

For balls that cannot be clearly determined as in or out, the generally accepted principle is "if you're not sure, it's in."`,
        keywords: ['line', 'call', 'in', 'out', 'boundary', 'judge', 'referee', 'appeal']
      },
      {
        id: 'tournament_rules',
        title: 'Tournament Rules & Regulations',
        content: `Tournament play has additional rules beyond recreational pickleball:

- Matches may be played to 15 or 21 points instead of 11
- Referees officiate matches and make final rulings on disputed calls
- Time-outs are limited to 60 seconds, with one or two allowed per game depending on the format
- Equipment must meet official specifications (paddle size, net height, etc.)
- Players must follow a dress code depending on the tournament level
- Seeding is determined by player ratings or previous tournament results
- Age divisions and skill levels categorize players appropriately
- Code of conduct rules apply regarding sportsmanship and behavior
- Medical time-outs have specific protocols and limitations
- Line judges may be used for higher-level matches

Players should review the specific tournament rules before competing, as requirements can vary between organizations.`,
        keywords: ['tournament', 'referee', 'official', 'time-out', 'match', 'bracket', 'seeding', 'division']
      }
    ]
  },
  {
    id: 'techniques',
    name: 'Pickleball Techniques',
    description: 'Fundamental and advanced techniques for improving your pickleball skills',
    items: [
      {
        id: 'dinking',
        title: 'Dinking Technique',
        content: `Dinking is a soft shot hit from near the kitchen line that lands in the opponent's kitchen. Key technique elements:

- Grip the paddle with a continental grip (like shaking hands)
- Use a compact stroke with minimal backswing
- Contact the ball out in front of your body
- Push the ball rather than striking it
- Focus on trajectory rather than power
- Keep your wrist firm throughout the stroke
- Use mostly arm and shoulder movement, not wrist flicking
- Aim for the middle of the opponent's kitchen
- Keep your paddle face open and slightly upward

Dinking is essential for high-level play and control during kitchen rallies. Practice dinking with a partner to develop touch and consistency.`,
        keywords: ['dink', 'soft shot', 'kitchen game', 'touch', 'finesse', 'control', 'rally']
      },
      {
        id: 'third_shot_drop',
        title: 'Third Shot Drop',
        content: `The third shot drop is one of the most important shots in pickleball, allowing the serving team to approach the net. Technique fundamentals:

- Hit after the return of serve (the third shot in the point)
- The goal is to hit a soft shot that lands in the opponent's kitchen
- Use a slight open stance with knees bent
- Take the paddle back early with a moderate backswing
- Contact the ball with a slight lifting motion
- Use a continental grip for better control
- Follow through toward your target
- Aim to land the ball just over the net and into the kitchen
- Practice consistency before adding spin or placement variations

This shot neutralizes the advantage of the receiving team and allows the serving team to move forward to the kitchen line.`,
        keywords: ['third shot', 'drop', 'approach', 'transition', 'soft game', 'net play']
      },
      {
        id: 'serve_techniques',
        title: 'Serve Techniques & Strategies',
        content: `Effective serving in pickleball combines proper technique with strategic placement:

Basic Technique:
- Use an underhand motion with the paddle below the waist
- Start with a slight knee bend and weight on your back foot
- Strike the ball with an upward motion
- Follow through in the direction you want the ball to go
- Maintain a consistent toss at a comfortable height

Advanced Serves:
- Power serve: Use more leg drive and a faster swing
- Spin serve: Brush the ball to create side spin or backspin
- Lob serve: Hit with more height to deep court areas
- Drive serve: Lower trajectory with more pace

Strategic Considerations:
- Serve to the opponent's backhand when possible
- Vary your serves to prevent opponents from anticipating
- Target the middle seam in doubles to create confusion
- Serve deep to keep opponents off the kitchen line
- Serve wide to pull opponents off the court

Remember that a good serve sets up the rest of the point.`,
        keywords: ['serve', 'underhand', 'placement', 'spin', 'power', 'deep', 'wide', 'strategy']
      },
      {
        id: 'volley',
        title: 'Volley Techniques',
        content: `Volleying is hitting the ball out of the air before it bounces, typically done near the kitchen line:

Fundamental Technique:
- Use a continental grip (shake hands with the paddle)
- Keep your paddle up and in front of you (ready position)
- Use a short backswing or no backswing at all
- Step forward with the opposite foot when volleying
- Keep the motion compact and punch-like
- Focus on direction and placement rather than power
- Maintain a firm wrist throughout the stroke

Advanced Volleying:
- Block volley: Using the opponent's pace against them
- Angle volley: Redirecting the ball at sharp cross-court angles
- Dink volley: A soft touch volley that drops into the kitchen
- Punch volley: A firmer volley aimed at the opponent's feet

Volleying is essential for effective net play and allows for aggressive positioning. Practice volley drills regularly to improve reflexes and hand-eye coordination.`,
        keywords: ['volley', 'net play', 'punch', 'block', 'mid-air', 'kitchen line', 'no bounce']
      },
      {
        id: 'groundstrokes',
        title: 'Groundstroke Fundamentals',
        content: `Groundstrokes in pickleball are shots hit after the ball bounces, similar to tennis but adapted for the smaller court:

Forehand Groundstroke:
- Use an eastern or continental grip
- Turn sideways with a shoulder turn
- Keep the paddle head above your wrist
- Step into the shot with your opposite foot
- Contact the ball in front of your body
- Follow through toward your target
- Finish with your paddle above your opposite shoulder

Backhand Groundstroke:
- Use a continental or eastern backhand grip
- Turn your shoulders perpendicular to the net
- Keep your elbow slightly bent
- Step with your lead foot toward the ball
- Contact the ball in front of your hip
- Follow through across your body
- Two-handed backhands can provide more stability

Focus on depth and placement rather than excessive power, as control is more important on the smaller pickleball court.`,
        keywords: ['groundstroke', 'forehand', 'backhand', 'baseline', 'drive', 'stroke', 'bounce']
      },
      {
        id: 'advanced_strategy',
        title: 'Advanced Strategy & Court Positioning',
        content: `Strategic positioning and tactical awareness are crucial for high-level pickleball:

Doubles Strategy:
- Both players should move forward to the kitchen line when possible
- Move as a unit, maintaining alignment with your partner
- Cover the middle when your partner is pulled wide
- Use the "stack" formation when one player has a stronger side
- Communication is essential - call shots and strategies

Shot Selection Strategy:
- Use third shot drops to neutralize the receiving team's advantage
- Employ dinks to set up attackable shots
- Hit to the opponent's weaker side or middle seam
- Reset with a soft shot when under pressure
- Attack balls that bounce high or are in your strike zone

Advanced Concepts:
- Recognize and attack the opponent's weaknesses
- Create and exploit open court space
- Use speed-ups strategically when opponents are vulnerable
- Anticipate instead of reacting to improve court coverage
- Develop patterns of play that force predictable returns`,
        isPremium: true,
        keywords: ['strategy', 'positioning', 'tactics', 'court awareness', 'patterns', 'shot selection']
      }
    ]
  },
  {
    id: 'pickle_plus',
    name: 'Pickle+ Platform',
    description: 'Complete information about Pickle+ features and functionality',
    items: [
      {
        id: 'courtiq_explained',
        title: 'CourtIQ™ Rating System Explained',
        content: `CourtIQ™ is Pickle+'s proprietary multi-dimensional rating system that analyzes five key aspects of your pickleball game:

1. Technical Skills (TECH): Measures your stroke execution, mechanics, and shot-making ability
2. Tactical Awareness (TACT): Assesses your strategic thinking, shot selection, and court awareness
3. Physical Fitness (PHYS): Evaluates your movement, agility, and physical conditioning
4. Mental Toughness (MENT): Gauges your focus, resilience, and performance under pressure
5. Consistency (CONS): Measures your reliability and error minimization

Each dimension is rated on a scale from 1.0 to 5.0, with half-point increments. These individual ratings combine to create your overall CourtIQ™ score, ranging from 200 to 2000 points.

CourtIQ™ ratings are updated automatically based on:
- Match results and performance metrics
- Skills assessments and drills
- Coach observations and feedback
- Tournament performance

Your CourtIQ™ profile provides a comprehensive view of your strengths and improvement areas, allowing for targeted training and development.`,
        keywords: ['courtiq', 'rating', 'multi-dimensional', 'skills', 'assessment', 'score', 'metrics', 'dimensions']
      },
      {
        id: 'ranking_points',
        title: 'Ranking Points System',
        content: `Pickle+ uses a comprehensive ranking system based on match performance and CourtIQ™ ratings:

Point Allocation per Match:
- Win against higher-ranked players: 8-15 points
- Win against similar-ranked players: 5-8 points
- Win against lower-ranked players: 2-5 points
- Loss against higher-ranked players: 0-2 points
- Loss against similar-ranked players: -2 to -5 points
- Loss against lower-ranked players: -5 to -10 points

Tournament Multipliers:
- Local tournaments: 1.2x multiplier
- Regional tournaments: 1.5x multiplier
- National tournaments: 2.0x multiplier

Consistency Bonuses:
- Play at least 3 matches per week: +2 points/week
- Maintain win ratio above 60% for 4+ weeks: +5 points/month
- Complete your player profile: +10 one-time bonus
- Verified skill assessment: +5 points

Ranking Categories:
- Overall ranking (combines all formats)
- Format-specific rankings (singles, doubles, mixed doubles)
- Age division rankings
- Regional/local leaderboards

Your ranking is determined by your accumulated points and is updated after each recorded match or tournament.`,
        keywords: ['ranking', 'points', 'leaderboard', 'standing', 'position', 'rating points', 'tournaments', 'multiplier']
      },
      {
        id: 'sage_features',
        title: 'SAGE™ Features & Capabilities',
        content: `SAGE™ (Skills Assessment & Growth Engine) is your AI-powered pickleball coach and platform concierge with multiple capabilities:

Coaching & Training:
- Personalized training plans based on your CourtIQ™ profile
- Technique analysis and improvement suggestions
- Strategy recommendations for different opponents and situations
- Video demonstration links for proper technique (Premium)
- Progressive difficulty adjustments as you improve (Premium)

Journaling & Progress Tracking:
- Record match results and personal reflections
- Track emotional and physical state during matches
- Identify patterns in performance over time
- Set and monitor improvement goals
- Review progress through interactive charts and metrics

Platform Navigation (Concierge):
- Help finding specific features within Pickle+
- Explanations of platform functionality and tools
- Personalized feature recommendations based on your needs
- Step-by-step guidance for complex processes

Knowledge Database:
- Complete pickleball rules and regulations
- Terminology explanations and glossary
- Equipment recommendations and reviews
- Training drills and exercise descriptions
- Tournament preparation guidance

SAGE™ learns from your interactions and adapts its recommendations to your specific needs and goals over time.`,
        keywords: ['sage', 'ai coach', 'training', 'concierge', 'journaling', 'recommendations', 'assistance', 'guidance']
      },
      {
        id: 'tournaments',
        title: 'Tournament System',
        content: `Pickle+ offers a comprehensive tournament system for players of all levels:

Tournament Types:
- Round Robin: Everyone plays against everyone in their group
- Single Elimination: Lose once and you're out
- Double Elimination: Two losses required for elimination
- Modified Round Robin: Round robin followed by elimination bracket
- Swiss Format: Multiple rounds without elimination

Division Categories:
- Skill Level: Based on CourtIQ™ ratings (Novice, Intermediate, Advanced, Elite)
- Age Groups: 19+, 35+, 50+, 65+
- Format: Singles, Doubles, Mixed Doubles
- Special Events: Challenge tournaments, Pro-Am events, club championships

Tournament Features:
- Real-time bracket updates and score tracking
- Online registration and payment processing
- Court assignments and scheduling
- Automated notifications for upcoming matches
- Results recording and statistics tracking

Tournament Rewards:
- Ranking points with tournament multipliers
- Digital trophies and achievements
- CourtIQ™ rating adjustments based on performance
- Qualification for higher-level tournaments

To join a tournament, navigate to the Tournaments section, browse available events, and register online. Payment and waivers can be completed directly through the platform.`,
        keywords: ['tournament', 'bracket', 'division', 'elimination', 'round robin', 'competition', 'event', 'match play']
      },
      {
        id: 'subscription_tiers',
        title: 'Subscription Plans & Premium Features',
        content: `Pickle+ offers different subscription tiers to match your needs and goals:

Free Tier:
- Basic match recording and history
- Limited access to SAGE™ features (3 drills per request)
- Public community access
- Standard player profile
- Basic CourtIQ™ assessment

Basic Plan ($5.99/month):
- Unlimited SAGE™ conversations
- Complete training plans (not just 3 drills)
- Detailed performance tracking
- Access to standard drill library
- Weekly training recommendations
- Tournament registration access
- Enhanced player profile
- Removal of advertisements

Power Plan ($11.99/month):
- Everything in Basic Plan
- Advanced multi-dimensional training programs
- Video analysis capabilities
- Priority SAGE™ responses
- Advanced performance analytics
- Access to exclusive premium drills
- Personalized improvement roadmaps
- Early access to new features
- Premium profile badge

Team/Facility Plans:
- Contact our sales team for group and facility pricing options
- Includes admin controls and group management tools
- Customized team training programs
- Facility-level analytics and reporting

Upgrade anytime through your account settings or when prompted during relevant features usage.`,
        keywords: ['subscription', 'premium', 'plan', 'pricing', 'features', 'paid', 'tier', 'upgrade']
      },
      {
        id: 'mastery_paths',
        title: 'Mastery Paths System',
        content: `Mastery Paths are Pickle+'s skill development tracking system, allowing you to progress through defined skill trees:

Path Categories:
- Technical Mastery: Focused on stroke development and shot execution
- Tactical Mastery: Strategic understanding and court awareness
- Physical Mastery: Movement, agility, and conditioning
- Mental Mastery: Focus, resilience, and competitive mindset
- Match Mastery: Performing under pressure in competitive situations

Each path contains multiple levels (Novice, Developing, Intermediate, Advanced, Expert, Master) with specific skills to acquire. Progress is tracked through:

- Skill assessments verified by the system
- Coach validations and observations
- Performance in drills and challenges
- Match performance metrics
- Video submission reviews (Premium feature)

Benefits of Mastery Paths:
- Clear progression roadmap for skill development
- Visual representation of strengths and weaknesses
- Achievement badges and recognition
- Personalized drill recommendations based on current level
- Community recognition for mastery accomplishments

Access Mastery Paths through your dashboard or profile section to view current progress and next steps for improvement.`,
        keywords: ['mastery', 'path', 'skill tree', 'progression', 'development', 'achievement', 'learning path']
      },
      {
        id: 'pickle_passport',
        title: 'Pickle Passport™ & Digital ID',
        content: `The Pickle Passport™ is your digital pickleball identity and credential within the Pickle+ ecosystem:

Passport Features:
- Digital ID with verified player information
- CourtIQ™ rating display with dimensional breakdown
- Tournament history and achievements
- Ranking position and points
- Mastery paths progress visualization
- Equipment preferences and playing style
- Digital verification QR code for tournaments and events
- Profile image and personalization options

Verification Process:
- Basic verification: Email and account confirmation
- Standard verification: Photo ID submission
- Premium verification: In-person skills assessment with certified coach

Benefits of Verified Passport:
- Tournament registration without additional verification
- Access to verified-only events and competitions
- Credibility within the Pickle+ community
- Eligibility for official rankings and leaderboards
- Recognition at partner facilities and events

Your Pickle Passport™ can be accessed digitally through the mobile app or web interface, and can be shared via QR code or direct link when needed for verification purposes.`,
        keywords: ['passport', 'id', 'identity', 'verification', 'credential', 'digital id', 'player card']
      }
    ]
  },
  {
    id: 'training',
    name: 'Training & Development',
    description: 'Training plans, drills, and development resources for pickleball improvement',
    items: [
      {
        id: 'beginner_drills',
        title: 'Beginner Pickleball Drills',
        content: `Essential drills for beginning pickleball players:

1. Dink Practice: With a partner, practice soft dinks back and forth from the kitchen line. Focus on consistency and control rather than power.

2. Serve Accuracy: Place targets or cones in the service court and practice hitting them with your serves. Start close and gradually move back to the baseline.

3. Return of Serve: Have a partner serve to you, focusing on making consistent returns that land deep in the court.

4. Forehand/Backhand Wall Rally: Hit against a wall, alternating between forehand and backhand strokes to develop consistency and technique.

5. Kitchen Line Mobility: Practice moving side to side along the kitchen line while maintaining proper ready position.

6. Drop Shot Practice: From the baseline, practice hitting soft drop shots that land in the kitchen. Focus on getting the right height and depth.

7. Volley Practice: With a partner, stand at the kitchen line and hit volleys back and forth, focusing on control and proper technique.

These drills focus on developing the fundamental skills needed for pickleball success: consistency, control, and proper technique.`,
        keywords: ['beginner', 'drill', 'practice', 'fundamental', 'basic', 'starter', 'new player']
      },
      {
        id: 'intermediate_drills',
        title: 'Intermediate Pickleball Drills',
        content: `Drills to develop skills for intermediate players:

1. Third Shot Drop Progression: Practice third shot drops from different positions, gradually moving from mid-court to the baseline. Focus on clearing the net with minimal height.

2. Dink Patterns: Practice specific dinking patterns with a partner - cross-court, down the line, and diagonal dinks in sequence.

3. Reset Drill: Have a partner hit firm shots at you at the kitchen line, and practice "resetting" them softly into the kitchen.

4. Transition Drill: Start at the baseline, hit a drop shot, move to the kitchen line, and then continue the point with dinks and volleys.

5. Attack the Middle: In doubles practice, focus on hitting shots down the middle between two opponents to create confusion.

6. Around the World Volleys: One player feeds balls from mid-court while the other moves laterally along the kitchen line, practicing volleys from different positions.

7. Drop-Drive-Dink: Practice the three main shots in sequence - third shot drop, drive volley when given the opportunity, and dink when needed to reset the point.

These drills focus on developing more advanced shot selection, court awareness, and movement patterns that are crucial for competitive play.`,
        keywords: ['intermediate', 'drill', 'practice', 'shot selection', 'control', 'consistency']
      },
      {
        id: 'advanced_drills',
        title: 'Advanced Pickleball Drills',
        content: `Sophisticated drills for advanced skill development:

1. Speed-Up Drill: Practice recognizing and attacking high dinks with aggressive put-away shots. One player intentionally hits slightly high dinks while the other practices driving them.

2. Erne Transition: Practice moving from the kitchen line to the outside of the court to execute an erne shot (jumping around the kitchen to volley the ball).

3. ATP (Around The Post) Practice: Position near the sideline and practice hitting shots around the net post rather than over the net.

4. Reset and Counter Reset: After resetting a hard shot into the kitchen, immediately prepare for your opponent's speed-up attempt with a counter reset.

5. Third Shot Options: Practice all three third shot options (drop, drive, lob) and make decisions based on positioning and scenario.

6. Defensive Lob Recovery: When pulled off the court, practice hitting defensive lobs and then recovering proper court position.

7. Two-on-One Kitchen Game: Two players dink against one player to develop exceptional movement and shot selection under pressure.

These advanced drills develop situational awareness, shot versatility, and the ability to execute complex strategies under pressure.`,
        isPremium: true,
        keywords: ['advanced', 'drill', 'complex', 'strategy', 'high-level', 'expert', 'competitive']
      },
      {
        id: 'physical_training',
        title: 'Physical Conditioning for Pickleball',
        content: `Physical training specifically designed for pickleball players:

Agility & Footwork:
- Ladder drills: Forward/backward runs, lateral shuffles, in-out steps
- Cone patterns: Set up cones in court positions and practice movement patterns
- Split-step practice: Develop the proper timing for the split-step between shots
- Direction change drills: Practice quickly changing direction on signal

Endurance & Stamina:
- Interval training: Short bursts of high intensity followed by brief recovery periods
- Shadow pickleball: Move through shot sequences without a ball to build stamina
- Court movement circuits: Continuous movement across all court zones
- Extended rally practice: Sustained dinking or rally sessions

Strength & Power:
- Lower body: Squats, lunges, and step-ups for leg strength
- Core training: Planks, rotational exercises, and stability work
- Upper body: Resistance band exercises for shoulder health and rotational power
- Plyometrics: Controlled jumps and explosive movements (for advanced players)

Flexibility & Recovery:
- Dynamic warm-up routine: Active stretching before play
- Post-play static stretching: Focus on shoulders, hips, and lower back
- Foam rolling for muscle recovery
- Mobility exercises for wrists, shoulders, and hips

A balanced physical conditioning program should include elements from each category, with emphasis based on your specific needs and limitations. Always consult a healthcare provider before beginning a new exercise program.`,
        keywords: ['fitness', 'conditioning', 'exercise', 'agility', 'strength', 'endurance', 'physical training']
      },
      {
        id: 'mental_game',
        title: 'Mental Game & Performance Psychology',
        content: `Developing mental toughness and psychological skills for pickleball:

Focus & Concentration:
- Pre-point routines to reset focus before each serve or return
- Attention control exercises to stay present and engaged
- Cue words to trigger proper concentration during critical moments
- Visual anchors to maintain focus between points

Emotional Management:
- Breathing techniques to regulate arousal and anxiety
- Acceptance strategies for managing frustration and setbacks
- Positive self-talk and cognitive reframing
- Energy management between points and games

Confidence Building:
- Performance journaling to track improvement and successes
- Visualization of successful execution and positive outcomes
- Affirmations and confidence statements
- Evidence-based confidence through deliberate practice

Strategic Thinking:
- Match planning and opponent analysis
- Tactical adjustments during play
- Pattern recognition in gameplay
- Decision-making frameworks for shot selection

Pressure Management:
- Simulation training to practice under pressure
- Routine development for consistency in high-pressure situations
- Reframing pressure as opportunity
- Physical relaxation techniques during tense moments

Mental training should be incorporated into regular practice sessions, not just applied during matches. Like physical skills, mental skills require consistent practice to develop and maintain.`,
        isPremium: true,
        keywords: ['mental', 'psychology', 'focus', 'concentration', 'confidence', 'pressure', 'mindset']
      },
      {
        id: 'personalized_training',
        title: 'Personalized Training Based on CourtIQ',
        content: `SAGE creates personalized training recommendations based on your CourtIQ™ dimensional profile:

Technical Focus Areas (TECH):
- Specific stroke mechanics improvement
- Shot execution and precision development
- Technical drills targeted to weakness areas
- Video analysis of form and mechanics (Premium)

Tactical Development (TACT):
- Strategic pattern recognition
- Decision-making exercises
- Shot selection scenarios
- Pattern-based drills and simulations
- Court positioning improvement

Physical Conditioning (PHYS):
- Customized agility training
- Endurance development specific to your needs
- Strength training for pickleball performance
- Recovery protocols and injury prevention

Mental Toughness (MENT):
- Focus and concentration exercises
- Pressure management techniques
- Confidence building protocols
- Emotional regulation strategies
- Performance routines development

Consistency Training (CONS):
- Error reduction drills
- Percentage play development
- Reliability under pressure training
- Shot tolerance exercises

Your personalized training plan adjusts automatically as your CourtIQ™ profile evolves, ensuring you're always working on the most relevant aspects of your game for maximum improvement.`,
        isPremium: true,
        keywords: ['personalized', 'custom', 'training plan', 'individual', 'tailored', 'specific']
      }
    ]
  }
];

/**
 * Utility class for working with the extended knowledge base
 */
export class SageExtendedKnowledgeBase {
  /**
   * Find knowledge items by matching keywords
   * 
   * @param query The search query to match against knowledge items
   * @param includesPremium Whether to include premium content in the results
   * @returns Matching knowledge items sorted by relevance
   */
  public findKnowledgeByKeywords(query: string, includesPremium: boolean = false): KnowledgeItem[] {
    const matches: Array<{ item: KnowledgeItem, relevance: number }> = [];
    const normalizedQuery = query.toLowerCase();
    const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 2);
    
    for (const category of sageKnowledge) {
      for (const item of category.items) {
        // Skip premium content if not included
        if (item.isPremium && !includesPremium) continue;
        
        let relevance = 0;
        
        // Check for keyword matches
        for (const keyword of item.keywords) {
          if (normalizedQuery.includes(keyword)) {
            relevance += 3;
          }
          
          for (const term of queryTerms) {
            if (keyword.includes(term)) {
              relevance += 1;
            }
          }
        }
        
        // Check title and content for matches
        if (item.title.toLowerCase().includes(normalizedQuery)) {
          relevance += 5;
        }
        
        for (const term of queryTerms) {
          if (item.title.toLowerCase().includes(term)) {
            relevance += 2;
          }
          if (item.content.toLowerCase().includes(term)) {
            relevance += 1;
          }
        }
        
        if (relevance > 0) {
          matches.push({ item, relevance });
        }
      }
    }
    
    // Sort by relevance score (highest first)
    return matches
      .sort((a, b) => b.relevance - a.relevance)
      .map(match => match.item);
  }
  
  /**
   * Get a specific knowledge item by ID
   * 
   * @param id The ID of the knowledge item to retrieve
   * @returns The matching knowledge item or undefined
   */
  public getKnowledgeItemById(id: string): KnowledgeItem | undefined {
    for (const category of sageKnowledge) {
      const item = category.items.find(item => item.id === id);
      if (item) return item;
    }
    return undefined;
  }
  
  /**
   * Get all knowledge items in a specific category
   * 
   * @param categoryId The category ID to retrieve items for
   * @param includesPremium Whether to include premium content 
   * @returns Array of knowledge items in the category
   */
  public getKnowledgeByCategory(categoryId: string, includesPremium: boolean = false): KnowledgeItem[] {
    const category = sageKnowledge.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    if (includesPremium) {
      return category.items;
    } else {
      return category.items.filter(item => !item.isPremium);
    }
  }
  
  /**
   * Get free preview content for premium knowledge items
   * 
   * @param itemId The ID of the premium item to preview
   * @returns A truncated version of the content with a premium message
   */
  public getPremiumContentPreview(itemId: string): string | undefined {
    const item = this.getKnowledgeItemById(itemId);
    if (!item || !item.isPremium) return undefined;
    
    // Create a preview with approximately the first third of the content
    const contentWords = item.content.split(' ');
    const previewLength = Math.floor(contentWords.length / 3);
    const preview = contentWords.slice(0, previewLength).join(' ');
    
    return `${preview}...\n\n[Premium Content] Upgrade to SAGE Premium to access the complete content and receive full training plans.`;
  }
  
  /**
   * Get all knowledge categories
   * 
   * @returns Array of all knowledge categories
   */
  public getAllCategories(): { id: string, name: string, description: string }[] {
    return sageKnowledge.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description
    }));
  }

  /**
   * Get related knowledge items
   * 
   * @param itemId The ID of the item to find related content for
   * @param includesPremium Whether to include premium content
   * @returns Array of related knowledge items
   */
  public getRelatedKnowledge(itemId: string, includesPremium: boolean = false): KnowledgeItem[] {
    const item = this.getKnowledgeItemById(itemId);
    if (!item || !item.relatedItems) return [];
    
    return item.relatedItems
      .map(id => this.getKnowledgeItemById(id))
      .filter((relatedItem): relatedItem is KnowledgeItem => 
        relatedItem !== undefined && (includesPremium || !relatedItem.isPremium)
      );
  }
}

// Export singleton instance for use across the application
export const extendedKnowledgeBase = new SageExtendedKnowledgeBase();

// Export utility functions for direct import in routes
export const searchKnowledge = (query: string, includesPremium: boolean = false) => 
  extendedKnowledgeBase.findKnowledgeByKeywords(query, includesPremium);

export const getKnowledgeItem = (id: string) => 
  extendedKnowledgeBase.getKnowledgeItemById(id);

export const getPremiumPreview = (id: string) =>
  extendedKnowledgeBase.getPremiumContentPreview(id);