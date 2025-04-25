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
        content: `# Understanding CourtIQ™ Ratings

CourtIQ™ is Pickle+'s innovative multi-dimensional rating system that provides a complete picture of your pickleball abilities beyond just a single number.

## What Makes CourtIQ™ Different?

Unlike traditional rating systems that only use one number, CourtIQ™ analyzes five different dimensions of your game:

1. Technical Skills: Your stroke execution and mechanics
2. Tactical Awareness: Your strategic thinking and court awareness
3. Physical Fitness: Your movement, agility, and conditioning
4. Mental Toughness: Your focus and performance under pressure
5. Consistency: Your reliability and error minimization

## How to Use Your CourtIQ™ Profile

You can access your CourtIQ™ profile in several ways:
- On your player dashboard
- Through your Pickle Passport™
- In the "Skills" section of your profile

Your CourtIQ™ profile helps you:
- Identify your strengths and areas for improvement
- Track your progress over time
- Get personalized training recommendations from SAGE™
- Find suitable practice partners and opponents
- Qualify for appropriate tournament divisions

The more you play and practice on Pickle+, the more accurate your CourtIQ™ profile becomes!`,
        keywords: ['courtiq', 'rating', 'multi-dimensional', 'skills', 'assessment', 'score', 'metrics', 'dimensions']
      },
      {
        id: 'ranking_points',
        title: 'Ranking Points System',
        content: `# Understanding Pickle+ Ranking Points

Pickle+ uses a dynamic ranking points system that reflects your skill level and competitive performance. Your ranking points determine your position on leaderboards and help match you with players of similar skill.

## What Affects Your Ranking Points?

Your points change based on several key factors:
- Match outcomes (wins increase points, losses may decrease points)
- Opponent's skill level (challenging stronger opponents offers greater rewards)
- Tournament participation (tournaments offer multipliers to accelerate progress)
- Consistent play (regular participation earns bonus points)

## How to View and Improve Your Ranking

You can find your current ranking points in these places:
- Your player profile under the "Rankings" tab
- Community leaderboards (overall and by category)
- After each match in your match history

To improve your ranking:
1. Play regularly to accumulate points
2. Challenge yourself against higher-ranked players
3. Participate in tournaments for multiplier bonuses
4. Complete your player profile for one-time bonuses
5. Focus on your win percentage over time

Rankings are updated automatically after each recorded match or tournament.`,
        keywords: ['ranking', 'points', 'leaderboard', 'standing', 'position', 'rating points', 'tournaments', 'multiplier']
      },
      {
        id: 'sage_features',
        title: 'SAGE™ Features & Capabilities',
        content: `# Meet SAGE™: Your Personal Pickleball Assistant

SAGE™ (Skills Assessment & Growth Engine) is your AI-powered pickleball coach and platform guide that helps you get the most out of Pickle+.

## What Can SAGE™ Do For You?

SAGE™ serves as your all-in-one assistant with four main capabilities:

1. **Coaching & Training**
   SAGE™ helps improve your pickleball skills by offering personalized training suggestions based on your style of play and CourtIQ™ profile.

2. **Journaling & Progress Tracking**
   Record your match experiences, track your emotional state during games, and identify patterns to improve your mental game.

3. **Platform Navigation (Concierge)**
   SAGE™ helps you discover and use all the features of Pickle+, answering questions about how things work and where to find them.

4. **Knowledge Database**
   Access comprehensive information about pickleball rules, techniques, equipment, and Pickle+ platform features.

## How to Use SAGE™

You can access SAGE™ in several ways:
- From the SAGE™ button on your dashboard
- Through the SAGE™ floating button available on most pages
- By visiting the dedicated SAGE™ page under the "Coaching" section

Simply type your question or request, and SAGE™ will respond with helpful information, guidance, or recommendations tailored to your needs.

Free users can get up to 3 drill recommendations per query, while premium subscribers enjoy unlimited SAGE™ coaching and recommendations.`,
        keywords: ['sage', 'ai coach', 'training', 'concierge', 'journaling', 'recommendations', 'assistance', 'guidance']
      },
      {
        id: 'tournaments',
        title: 'Tournament System',
        content: `# Tournament System on Pickle+

Pickle+ makes participating in pickleball tournaments easy and fun for players of all skill levels.

## Finding the Right Tournament

Tournaments on Pickle+ are organized by:
- Skill level divisions (based on your CourtIQ™ ratings)
- Age groups (19+, 35+, 50+, 65+)
- Format (Singles, Doubles, Mixed Doubles)
- Special events (Challenge tournaments, Pro-Am events)

## How to Join a Tournament

1. Go to the "Tournaments" section from your dashboard
2. Browse upcoming events in your area or skill level
3. Select a tournament that interests you
4. Choose your division and register online
5. Complete payment and electronic waivers
6. Receive confirmation and tournament details

## During the Tournament

Once registered, you'll have access to:
- Your match schedule and court assignments
- Real-time bracket updates
- Notifications before your matches
- Score tracking and results

## Tournament Benefits

Playing in tournaments helps you:
- Earn ranking points (with tournament multipliers)
- Gain achievements and digital trophies 
- Improve your CourtIQ™ ratings
- Qualify for higher-level competitions
- Test your skills against new opponents

The more tournaments you participate in, the more visibility you gain in the Pickle+ community!`,
        keywords: ['tournament', 'bracket', 'division', 'elimination', 'round robin', 'competition', 'event', 'match play']
      },
      {
        id: 'subscription_tiers',
        title: 'Subscription Plans & Premium Features',
        content: `# Pickle+ Subscription Plans

Pickle+ offers flexible subscription options to match your needs and goals, from casual players to serious competitors.

## Available Plans

### Free Tier
Try Pickle+ with these basic features:
- Record and track your matches
- Get up to 3 drill recommendations per SAGE™ request
- Join the Pickle+ community forums
- Create your player profile
- Receive a basic CourtIQ™ assessment

### Basic Plan ($5.99/month)
Everything in Free, plus:
- Unlimited SAGE™ coaching conversations
- Full training plans (not just individual drills)
- Detailed performance analytics and tracking
- Access to our complete standard drill library
- Weekly personalized recommendations
- Ad-free experience

### Power Plan ($11.99/month)
The ultimate pickleball experience with:
- Advanced multi-dimensional training programs
- Video analysis capabilities
- Priority SAGE™ coaching responses
- In-depth performance analytics
- Access to exclusive premium drills
- Personalized improvement roadmaps
- Early access to new features

## How to Subscribe

1. Visit the "Account" section in your profile
2. Select "Subscription Options"
3. Choose the plan that's right for you
4. Enter payment information
5. Start enjoying your premium benefits immediately

You can upgrade, downgrade, or cancel your subscription at any time through your account settings.`,
        keywords: ['subscription', 'premium', 'plan', 'pricing', 'features', 'paid', 'tier', 'upgrade']
      },
      {
        id: 'mastery_paths',
        title: 'Mastery Paths System',
        content: `# Mastery Paths: Your Pickleball Skill Journey

Mastery Paths is Pickle+'s visual skill development system that guides your improvement journey and celebrates your progress along the way.

## What Are Mastery Paths?

Think of Mastery Paths as skill trees that map out different aspects of pickleball excellence:

- **Technical Mastery**: Developing proper stroke mechanics and shot execution
- **Tactical Mastery**: Learning game strategy and court awareness
- **Physical Mastery**: Building the movement skills and conditioning needed for pickleball
- **Mental Mastery**: Developing focus, resilience, and competitive mindset
- **Match Mastery**: Applying all skills effectively in competitive situations

## How to Use Mastery Paths

1. Access your Mastery Paths through your dashboard or profile
2. Review your current skill level in each path
3. Identify the next skills to work on in your development
4. Complete suggested drills and challenges to make progress
5. Earn achievements and badges as you advance

## Benefits of Following Mastery Paths

- See a clear roadmap for your pickleball development
- Identify your strengths and areas for improvement at a glance
- Receive personalized drill recommendations based on your current level
- Track your progress with visual indicators and achievements
- Share your accomplishments with the Pickle+ community

As you improve, your Mastery Paths visualization evolves, creating a rewarding journey of continuous growth and achievement.`,
        keywords: ['mastery', 'path', 'skill tree', 'progression', 'development', 'achievement', 'learning path']
      },
      {
        id: 'pickle_passport',
        title: 'Pickle Passport™ & Digital ID',
        content: `# Your Pickle Passport™

The Pickle Passport™ is your official digital identity in the world of Pickle+, serving as your verified player credential for tournaments, events, and community participation.

## What's Inside Your Passport

Your Pickle Passport™ contains all your important player information in one place:
- Your verified player profile and photo
- CourtIQ™ ratings with dimensional breakdown
- Tournament history and achievements
- Current ranking and points
- Mastery paths progress
- Equipment preferences
- Playing style and preferences
- Digital verification QR code

## Getting Verified

There are three levels of verification available:
1. **Basic**: Verify your email and complete account setup
2. **Standard**: Submit photo ID for additional verification
3. **Premium**: Complete an in-person skills assessment with a certified coach

## Using Your Passport

Your Pickle Passport™ makes pickleball more convenient and connected:
- Register for tournaments without additional verification steps
- Access verified-only events and competitions
- Build credibility in the Pickle+ community
- Qualify for official rankings and leaderboards
- Receive recognition at partner facilities

You can access your Pickle Passport™ anytime from your profile and share it via QR code or digital link when needed for verification.`,
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
        content: `# Beginner Pickleball Drills

Getting started with pickleball is exciting, and these fundamental drills will help you build a solid foundation for your game.

## Why Beginner Drills Matter

Beginner drills are essential because they:
- Build proper technique from the start
- Develop consistent shot-making abilities
- Create muscle memory for fundamental movements
- Increase confidence on the court
- Make the game more enjoyable as you improve

## Core Beginner Skills to Practice

### Dinking
The soft game at the kitchen line is the heart of pickleball. Practicing controlled dinks helps you develop touch and consistency.

### Serving & Return
Every point starts with a serve and return. These are your first opportunity to set up a successful point or neutralize your opponent's advantage.

### Basic Strokes
Developing proper forehand and backhand technique early prevents bad habits that can be difficult to correct later.

### Court Movement
Learning to move efficiently around the court helps with shot preparation and reduces fatigue during longer play sessions.

## Getting Started with Beginner Drills

1. Practice regularly, even if only for short sessions
2. Focus on proper technique rather than power
3. Use a wall for solo practice when a partner isn't available
4. Keep it fun and celebrate small improvements
5. Ask SAGE™ for personalized drill recommendations based on your current skill level

Remember that everyone starts as a beginner. With consistent practice of these fundamental drills, you'll be surprised at how quickly your skills develop!`,
        keywords: ['beginner', 'drill', 'practice', 'fundamental', 'basic', 'starter', 'new player']
      },
      {
        id: 'intermediate_drills',
        title: 'Intermediate Pickleball Drills',
        content: `# Intermediate Pickleball Drills

Once you've mastered the basics, these intermediate drills will help you develop the more nuanced skills needed to compete at a higher level.

## Why Intermediate Drills Matter

Intermediate drills help you:
- Develop more refined shot selection and control
- Improve your tactical decision-making
- Enhance your court positioning and movement
- Build a more complete skill set for competitive play
- Make the transition from recreational to competitive player

## Key Focus Areas for Intermediate Players

### Third Shot Development
The third shot (especially the drop) is often considered the most important shot in pickleball. Drills focusing on this shot help you start points with control rather than power.

### Kitchen Line Play
Most points in pickleball are won and lost at the kitchen line. These drills improve your ability to handle different ball heights, speeds, and placements while maintaining proper position.

### Transitional Movement
Moving efficiently from the baseline to the kitchen line is crucial. These drills help you develop smooth transitions between court positions.

### Shot Selection
Learning when to dink, when to drive, and when to reset is essential at the intermediate level. These drills help you make better decisions under pressure.

## Getting Started with Intermediate Drills

1. Find a practice partner at or slightly above your skill level
2. Focus on one aspect of your game in each practice session
3. Begin with slower-paced drills and gradually increase the speed
4. Practice both individual shots and game-like sequences
5. Use the SAGE™ coaching feature to get personalized drill recommendations

As you master these intermediate skills, you'll notice significant improvement in your match performance and consistency.`,
        keywords: ['intermediate', 'drill', 'practice', 'shot selection', 'control', 'consistency']
      },
      {
        id: 'advanced_drills',
        title: 'Advanced Pickleball Drills',
        content: `# Advanced Pickleball Drills

These sophisticated drills are designed for experienced players looking to elevate their game to the highest levels of competitive play.

## Why Advanced Drills Matter

As your skills improve, you need more challenging and complex drills that:
- Develop advanced shot-making abilities
- Enhance situational awareness and decision-making
- Build greater pressure tolerance
- Improve recovery skills and court coverage
- Integrate multiple skills simultaneously

## Types of Advanced Drills

Advanced drills focus on several key areas:

### Offensive Weapons
Develop specialized shots like the Erne, ATP (Around the Post), and speed-up attacks that can break through even strong defenses.

### Defensive Counters
Practice resetting hard shots, defensive lobs, counter-drives, and other techniques to neutralize aggressive opponents.

### Tactical Variations
Learn to seamlessly transition between different strategies and shot selections based on opponents and situations.

### Pressure Simulation
Train under conditions that replicate or exceed match pressure to build competitive resilience.

## Getting the Most from Advanced Drills

1. Work with a skilled partner or coach who can provide quality feeds
2. Focus on quality over quantity in your repetitions
3. Gradually increase speed and difficulty as skills improve
4. Alternate between isolated skill work and game-like situations
5. Record and analyze your performance to identify subtle improvements

Premium Pickle+ subscribers receive access to the complete library of advanced drills with video demonstrations from professional players.`,
        isPremium: true,
        keywords: ['advanced', 'drill', 'complex', 'strategy', 'high-level', 'expert', 'competitive']
      },
      {
        id: 'physical_training',
        title: 'Physical Conditioning for Pickleball',
        content: `# Physical Training for Pickleball Success

Good physical conditioning is essential for pickleball performance and injury prevention. A well-designed training program can significantly improve your game.

## Why Physical Training Matters

Pickleball requires specific physical attributes:
- Quick lateral movements and direction changes
- Explosive power for specific shots
- Core stability for balance and rotation
- Endurance for long matches and tournaments
- Flexibility for reaching difficult shots

## Four Key Areas of Physical Training

### 1. Agility & Footwork
Improve your ability to move quickly and efficiently around the court. Good footwork positions you properly for each shot and helps prevent injuries.

### 2. Endurance & Stamina
Build the energy systems needed to maintain a high level of play throughout an entire match or tournament day without fatigue affecting your performance.

### 3. Strength & Power
Develop the muscular strength and power needed for explosive movements, shot generation, and injury prevention, with special focus on core and rotational strength.

### 4. Flexibility & Recovery
Maintain and improve your range of motion to reach difficult shots and recover more quickly between matches with proper cool-down routines.

## Getting Started with Physical Training

1. Begin with a basic assessment of your current fitness level
2. Start with low-intensity, proper-form exercises before progressing
3. Incorporate pickleball-specific movements into your training
4. Train consistently but allow adequate recovery time
5. Include warm-up and cool-down routines with every session

Remember to consult with a healthcare provider before beginning any new exercise program, especially if you have existing health conditions.`,
        keywords: ['fitness', 'conditioning', 'exercise', 'agility', 'strength', 'endurance', 'physical training']
      },
      {
        id: 'mental_game',
        title: 'Mental Game & Performance Psychology',
        content: `# The Mental Side of Pickleball

The mental game is often what separates good players from great ones. Developing mental toughness and psychological skills can dramatically improve your pickleball performance.

## Why Mental Skills Matter

In pickleball, mental skills are crucial because:
- Matches can shift momentum quickly
- Quick decisions must be made under pressure
- Errors can lead to frustration if not managed
- Confidence affects how aggressively you play
- Focus determines how well you execute shots

## Key Mental Skills to Develop

### Focus & Concentration
Learn to direct your attention where it matters most and block out distractions during play.

### Emotional Management
Develop techniques to stay calm under pressure and recover quickly from mistakes or setbacks.

### Confidence Building
Build genuine belief in your abilities through tracking progress and celebrating improvements.

### Strategic Thinking
Improve your ability to analyze situations, recognize patterns, and make smart decisions during matches.

### Pressure Management
Learn to perform your best when it matters most by practicing under simulated pressure situations.

## How to Train Your Mental Game

Mental skills can be developed just like physical ones:
1. Set aside dedicated time for mental training
2. Practice techniques like visualization and breathing exercises
3. Create pre-point routines that reset your focus
4. Keep a performance journal to track patterns
5. Use specific cue words to trigger ideal mental states

The most successful players integrate mental training into their regular practice sessions rather than only thinking about it during matches.`,
        isPremium: true,
        keywords: ['mental', 'psychology', 'focus', 'concentration', 'confidence', 'pressure', 'mindset']
      },
      {
        id: 'personalized_training',
        title: 'Personalized Training Based on CourtIQ',
        content: `# Personalized Training Plans

SAGE™ creates training recommendations customized specifically for you based on your unique CourtIQ™ profile.

## How Personalized Training Works

Unlike generic drills and exercises, SAGE™ analyzes your dimensional CourtIQ™ profile to identify:
- Your strengths that can be leveraged
- Your growth areas that need development
- Your playing style and preferences
- Your specific goals and objectives

Based on this analysis, SAGE™ creates training recommendations that target exactly what you need to improve most.

## What Your Training Plan Includes

Your personalized plan addresses all five dimensions of your game:
- **Technical Skills**: Improve your stroke mechanics and shot execution
- **Tactical Awareness**: Enhance your strategic thinking and decision-making
- **Physical Fitness**: Develop the specific physical attributes you need
- **Mental Toughness**: Strengthen your focus and emotional control
- **Consistency**: Build reliability in your game under all conditions

## How to Access Your Personalized Plan

1. Complete your CourtIQ™ assessment (if you haven't already)
2. Go to the SAGE™ coaching page
3. Ask for "my personalized training plan" or "what should I work on"
4. Review your recommendations and save them to your training journal

Free users receive up to 3 drill recommendations per request, while premium subscribers get complete training plans that adapt automatically as your CourtIQ™ profile evolves.`,
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