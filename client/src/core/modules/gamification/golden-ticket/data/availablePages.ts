/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Available Pages for Golden Tickets
 * 
 * This file defines the available pages where golden tickets can appear.
 * Used for structured dropdown selection in the admin interface.
 */

export interface ApplicationPage {
  id: string;
  path: string;
  name: string;
  description: string;
  group: 'dashboard' | 'profile' | 'matches' | 'tournaments' | 'community' | 'rewards' | 'other';
}

export const AVAILABLE_PAGES: ApplicationPage[] = [
  // Dashboard Pages
  {
    id: 'dashboard',
    path: '/dashboard',
    name: 'Dashboard',
    description: 'Main dashboard showing player stats and activity',
    group: 'dashboard'
  },
  {
    id: 'home',
    path: '/',
    name: 'Home Page',
    description: 'Application landing page for all users',
    group: 'dashboard'
  },
  
  // Profile Pages
  {
    id: 'profile',
    path: '/profile',
    name: 'My Profile',
    description: 'Player profile page with personal stats',
    group: 'profile'
  },
  {
    id: 'profile-settings',
    path: '/profile/settings',
    name: 'Profile Settings',
    description: 'Profile settings and preferences',
    group: 'profile'
  },
  {
    id: 'profile-statistics',
    path: '/profile/statistics',
    name: 'Advanced Statistics',
    description: 'Detailed performance metrics and statistics',
    group: 'profile'
  },
  
  // Match Pages
  {
    id: 'match-center',
    path: '/match-center',
    name: 'Match Center',
    description: 'The main match management hub',
    group: 'matches'
  },
  {
    id: 'match-history',
    path: '/match-history',
    name: 'Match History',
    description: 'History of past matches with filtering',
    group: 'matches'
  },
  {
    id: 'record-match',
    path: '/record-match',
    name: 'Record Match',
    description: 'Match recording form',
    group: 'matches'
  },
  {
    id: 'match-details',
    path: '/match/:id',
    name: 'Match Details',
    description: 'Individual match details page',
    group: 'matches'
  },
  
  // Tournament Pages
  {
    id: 'tournaments',
    path: '/tournaments',
    name: 'Tournaments List',
    description: 'List of all available tournaments',
    group: 'tournaments'
  },
  {
    id: 'tournament-discovery',
    path: '/tournament-discovery',
    name: 'Tournament Discovery',
    description: 'Tournament discovery and exploration module',
    group: 'tournaments'
  },
  {
    id: 'tournament-details',
    path: '/tournament/:id',
    name: 'Tournament Details',
    description: 'Individual tournament details page',
    group: 'tournaments'
  },
  
  // Community Pages
  {
    id: 'players',
    path: '/players',
    name: 'Player Search',
    description: 'Search for other players',
    group: 'community'
  },
  {
    id: 'clubs',
    path: '/clubs',
    name: 'Clubs',
    description: 'Pickleball clubs and venues',
    group: 'community'
  },
  
  // Rewards Pages
  {
    id: 'achievements',
    path: '/achievements',
    name: 'Achievements',
    description: 'Player achievements and badges',
    group: 'rewards'
  },
  {
    id: 'rewards',
    path: '/rewards',
    name: 'Rewards Center',
    description: 'Available rewards and claimed prizes',
    group: 'rewards'
  },
  {
    id: 'prize-drawings',
    path: '/prize-drawings',
    name: 'Prize Drawings',
    description: 'Active prize drawings and contests',
    group: 'rewards'
  }
];

// Group pages by category for easier selection in UI
export const PAGE_GROUPS = {
  dashboard: AVAILABLE_PAGES.filter(page => page.group === 'dashboard'),
  profile: AVAILABLE_PAGES.filter(page => page.group === 'profile'),
  matches: AVAILABLE_PAGES.filter(page => page.group === 'matches'),
  tournaments: AVAILABLE_PAGES.filter(page => page.group === 'tournaments'),
  community: AVAILABLE_PAGES.filter(page => page.group === 'community'),
  rewards: AVAILABLE_PAGES.filter(page => page.group === 'rewards'),
  other: AVAILABLE_PAGES.filter(page => page.group === 'other')
};

// Helper to get page information by path
export function getPageByPath(path: string): ApplicationPage | undefined {
  return AVAILABLE_PAGES.find(page => page.path === path);
}

// Helper to get page information by ID
export function getPageById(id: string): ApplicationPage | undefined {
  return AVAILABLE_PAGES.find(page => page.id === id);
}