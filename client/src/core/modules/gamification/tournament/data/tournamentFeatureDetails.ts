/**
 * PKL-278651-GAME-0004-PART
 * Tournament Feature Details (Participant-Focused with CourtIQ Integration)
 * 
 * This file contains detailed descriptions and information about tournament features
 * that players can discover through the Tournament Discovery experience.
 * 
 * Updated to focus on participant benefits rather than organizational aspects
 * with integrated CourtIQ rating system connections.
 * 
 * Following Framework 4.0 guidelines, this module maintains separation of concerns by
 * keeping content separate from presentation logic.
 */

export interface TournamentFeatureDetail {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  keyPoints: string[];
  launchDate: string;
  featureImage?: string;
  demoAvailable: boolean;
}

/**
 * Detailed information about tournament features
 */
export const tournamentFeatureDetails: Record<string, TournamentFeatureDetail> = {
  'tournament-bracket': {
    id: 'tournament-bracket',
    title: 'Your Path to Victory',
    shortDescription: 'Track your journey through tournaments with real-time updates and match alerts.',
    fullDescription: `Follow your path to victory with our immersive tournament experience. See exactly 
    where you stand in the competition, who you'll face next, and your potential path to the finals. 
    Your CourtIQ™ rating is prominently displayed alongside your opponents, giving you insights 
    into each matchup before you step on the court.`,
    keyPoints: [
      'Visualize your exact path through the tournament',
      'Receive instant notifications about your upcoming matches',
      'Compare CourtIQ™ ratings with potential opponents',
      'Share your tournament progress with friends and followers',
      'Review past match data to prepare for upcoming opponents'
    ],
    launchDate: 'April 30, 2025',
    demoAvailable: true
  },
  
  'tournament-scoring': {
    id: 'tournament-scoring',
    title: 'Performance Insights & Rating Boosts',
    shortDescription: 'Grow your CourtIQ™ rating through tournament play with detailed performance analytics.',
    fullDescription: `Maximize your skill development with our comprehensive tournament performance tracking.
    Every shot, serve, and rally is analyzed to provide you with actionable insights that improve your game.
    Your CourtIQ™ rating receives priority updates after tournament play, giving your competitive profile 
    an immediate boost based on your performance against varied opponents.`,
    keyPoints: [
      'Receive detailed breakdown of your tournament performance strengths',
      'Get CourtIQ™ rating updates in real-time as tournaments progress',
      'Identify specific areas to improve based on tournament competition',
      'Compare your performance metrics against higher-rated players',
      'Track your rating evolution through tournament participation'
    ],
    launchDate: 'April 30, 2025',
    demoAvailable: false
  },
  
  'tournament-registration': {
    id: 'tournament-registration',
    title: 'Streamlined Registration',
    shortDescription: 'Quick and easy tournament registration with flexible payment options.',
    fullDescription: `Register for tournaments with just a few clicks through our streamlined 
    registration process. The system supports individual and team registrations, with flexible 
    payment options and automated waitlist management. Players can register based on skill level, 
    age group, or custom tournament categories.`,
    keyPoints: [
      'One-click registration for verified profiles',
      'Secure payment processing with multiple payment options',
      'Automated skill-based matchmaking',
      'Waitlist management with priority queueing',
      'Tournament notifications and calendar integration'
    ],
    launchDate: 'April 30, 2025',
    demoAvailable: true
  },
  
  'seeding-algorithm': {
    id: 'seeding-algorithm',
    title: 'Fair Play Seeding Algorithm',
    shortDescription: 'Balanced tournament seeding based on CourtIQ™ ratings and recent performance.',
    fullDescription: `Our proprietary Fair Play Seeding Algorithm ensures balanced and competitive 
    tournament brackets by incorporating CourtIQ™ ratings, recent match history, and head-to-head records. 
    The algorithm prevents early matchups between similarly skilled players and creates more exciting 
    tournament progressions.`,
    keyPoints: [
      'CourtIQ™ rating-based seeding with recency weighting',
      'Head-to-head record consideration',
      'Balance protection to prevent early eliminations of top players',
      'Regional diversity factoring for national tournaments',
      'Transparent seeding explanations for players'
    ],
    launchDate: 'May 15, 2025',
    demoAvailable: false
  },
  
  'tournament-rewards': {
    id: 'tournament-rewards',
    title: 'Achievement & Rewards System',
    shortDescription: 'Comprehensive tournament rewards with achievements, badges, and prizes.',
    fullDescription: `Our tournament rewards system goes beyond traditional prizes with digital 
    achievements, progressive XP earnings, customizable badges, and tournament passport stamps. 
    Physical prizes can be managed and fulfilled directly through the platform, while digital rewards 
    are instantly credited to player profiles.`,
    keyPoints: [
      'Digital achievements that showcase tournament performance',
      'XP-based rewards that accumulate across tournaments',
      'Customizable badges for tournament milestones',
      'Tournament passport stamps for your digital collection',
      'Integrated prize fulfillment system'
    ],
    launchDate: 'May 30, 2025',
    demoAvailable: false
  },
  
  'live-streaming': {
    id: 'live-streaming',
    title: 'Tournament Live Streaming',
    shortDescription: 'Watch tournament matches live with integrated scoring and stats.',
    fullDescription: `Experience tournament matches like never before with our integrated live streaming 
    platform. Watch featured matches with real-time scoring overlays, player statistics, and interactive 
    features. Commentators can access match analytics during broadcasts, and viewers can participate in 
    prediction contests during streams.`,
    keyPoints: [
      'HD streaming for featured tournament matches',
      'Real-time scoring and statistics overlays',
      'Interactive viewer predictions and polls',
      'Multi-court viewing for simultaneous matches',
      'Cloud recording for on-demand replay'
    ],
    launchDate: 'June 15, 2025',
    demoAvailable: false
  }
};

/**
 * Get detailed information about a tournament feature
 */
export function getTournamentFeatureDetail(featureId: string): TournamentFeatureDetail | null {
  return tournamentFeatureDetails[featureId] || null;
}

/**
 * Get all tournament feature details
 */
export function getAllTournamentFeatures(): TournamentFeatureDetail[] {
  return Object.values(tournamentFeatureDetails);
}