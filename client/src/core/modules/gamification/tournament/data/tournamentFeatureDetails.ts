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
    launchDate: 'May 31, 2025',
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
    launchDate: 'May 31, 2025',
    demoAvailable: false
  },
  
  'tournament-registration': {
    id: 'tournament-registration',
    title: 'Perfect Tournament Matchmaking',
    shortDescription: 'Find tournaments perfectly matched to your CourtIQ™ rating and skill level.',
    fullDescription: `Never face the frustration of entering tournaments where opponents are too advanced or too novice. 
    Our intelligent matchmaking system uses your CourtIQ™ rating to recommend tournaments that will provide the 
    ideal balance of challenge and success opportunity. Get personalized alerts when tournaments in your skill 
    range are announced in your area, and register with a single tap.`,
    keyPoints: [
      'Receive personalized tournament recommendations based on your CourtIQ™ rating',
      'Get automatic alerts for tournaments that match your skill level',
      'Easily join tournaments with opponents at your competitive level',
      'Priority registration access for active CourtIQ™ participants',
      'Track upcoming tournaments on your personalized tournament calendar'
    ],
    launchDate: 'June 5, 2025',
    demoAvailable: true
  },
  
  'seeding-algorithm': {
    id: 'seeding-algorithm',
    title: 'Fair Match™ Technology',
    shortDescription: 'Experience perfectly balanced tournament matchups based on your CourtIQ™ profile.',
    fullDescription: `Our Fair Match™ technology uses your comprehensive CourtIQ™ profile to ensure you're 
    paired against the right opponents at the right time in tournaments. By analyzing your playing style, 
    strengths, and development areas alongside your rating, the system creates optimal matchups that 
    challenge you appropriately while maximizing your competitive experience and growth potential.`,
    keyPoints: [
      'Get matched based on your complete player profile, not just a single rating number',
      'Avoid early elimination through smarter opponent matching',
      'Receive personalized matchup insights before each tournament game',
      'Experience more balanced and competitive matches throughout the tournament',
      'Track how matchups have contributed to your CourtIQ™ rating development'
    ],
    launchDate: 'May 15, 2025',
    demoAvailable: false
  },
  
  'tournament-rewards': {
    id: 'tournament-rewards',
    title: 'Tournament Accomplishment Showcase',
    shortDescription: 'Build your player profile with prestigious tournament achievements that boost your visibility.',
    fullDescription: `Showcase your tournament success with our comprehensive digital accomplishment system. 
    Each tournament adds meaningful credentials to your CourtIQ™ profile, enhancing your reputation and 
    visibility in the community. Tournament achievements directly impact your player rating and mastery 
    progression, accelerating your development path and unlocking special privileges in future events.`,
    keyPoints: [
      'Earn profile badges that showcase your tournament achievements to the community',
      'Fast-track your CourtIQ™ rating progression through tournament performance',
      'Unlock special tournament placement opportunities based on your achievement history',
      'Gain recognition with tournament-specific digital trophies on your profile',
      'Qualify for invitation-only tournaments through your achievement record'
    ],
    launchDate: 'May 30, 2025',
    demoAvailable: false
  },
  
  'live-streaming': {
    id: 'live-streaming',
    title: 'CourtIQ™ Enhanced Match Analysis',
    shortDescription: 'Gain invaluable insights from your tournament performances with video analysis and CourtIQ™ metrics.',
    fullDescription: `Take your game to the next level with our integrated CourtIQ™ video analysis system.
    When your tournament matches are streamed, our AI automatically generates detailed performance metrics
    that are added to your CourtIQ™ profile. Review your matches with advanced analytics overlays showing
    shot selection, positioning, and success rates to identify exactly how to improve your competitive edge.`,
    keyPoints: [
      'Get personal match recordings with integrated CourtIQ™ performance metrics',
      'Review your tournament play with professional-quality analysis tools',
      'Share highlighted moments and performance insights with coaches',
      'Compare your metrics to those of higher-ranked players for targeted improvement',
      'Receive personalized development recommendations based on match analysis'
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