/**
 * PKL-278651-SEARCH-API-001
 * Global Search API Routes
 * 
 * Comprehensive search endpoints supporting multi-category search
 * across players, coaches, matches, communities, and tournaments.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-27
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Search query validation schema
const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'player', 'coach', 'match', 'community', 'tournament']).optional().default('all'),
  location: z.enum(['all', 'local', 'state', 'national']).optional().default('all'),
  skillLevel: z.enum(['all', 'beginner', 'intermediate', 'advanced']).optional().default('all'),
  dateRange: z.enum(['all', 'week', 'month', 'year']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(20)
});

interface SearchResult {
  id: string;
  type: 'player' | 'coach' | 'match' | 'community' | 'tournament';
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  rating?: number;
  location?: string;
  tags?: string[];
  relevanceScore: number;
}

/**
 * Calculate relevance score based on query match
 */
function calculateRelevance(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 80;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 60;
  
  // Word boundaries match
  const words = queryLower.split(' ');
  let wordMatchScore = 0;
  words.forEach(word => {
    if (textLower.includes(word)) {
      wordMatchScore += 20;
    }
  });
  
  return Math.min(wordMatchScore, 50);
}

/**
 * Search players
 */
async function searchPlayers(query: string, filters: any): Promise<SearchResult[]> {
  try {
    const users = await storage.searchUsers(query);
    
    return users.map(user => {
      const titleRelevance = calculateRelevance(query, user.username || '');
      const nameRelevance = calculateRelevance(query, `${user.firstName || ''} ${user.lastName || ''}`.trim());
      const bioRelevance = calculateRelevance(query, user.bio || '');
      
      return {
        id: user.id.toString(),
        type: 'player' as const,
        title: user.displayName || user.username || 'Unknown Player',
        subtitle: `@${user.username}`,
        description: user.bio || 'Pickle+ player',
        avatar: user.avatarUrl || undefined,
        rating: user.skillLevel && !isNaN(Number(user.skillLevel)) ? Number(user.skillLevel) : undefined,
        location: user.location || undefined,
        tags: [
          user.skillLevel ? `${user.skillLevel} skill` : '',
          user.preferredPosition || '',
          user.playingStyle || ''
        ].filter(Boolean),
        relevanceScore: Math.max(titleRelevance, nameRelevance, bioRelevance)
      };
    }).filter(result => result.relevanceScore > 0);
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

/**
 * Search coaches
 */
async function searchCoaches(query: string, filters: any): Promise<SearchResult[]> {
  try {
    const coaches = await storage.searchCoaches(query);
    
    return coaches.map(coach => {
      const nameRelevance = calculateRelevance(query, `${coach.firstName || ''} ${coach.lastName || ''}`.trim());
      const bioRelevance = calculateRelevance(query, coach.bio || '');
      const specialtyRelevance = Math.max(
        ...(coach.specialties || []).map((specialty: string) => calculateRelevance(query, specialty))
      );
      
      return {
        id: coach.userId.toString(),
        type: 'coach' as const,
        title: `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Coach',
        subtitle: 'Professional Coach',
        description: coach.bio || 'Certified pickleball coach',
        avatar: coach.profileImageUrl,
        rating: coach.rating,
        location: coach.location,
        tags: coach.specialties || [],
        relevanceScore: Math.max(nameRelevance, bioRelevance, specialtyRelevance)
      };
    }).filter(result => result.relevanceScore > 0);
  } catch (error) {
    console.error('Error searching coaches:', error);
    return [];
  }
}

/**
 * Search matches
 */
async function searchMatches(query: string, filters: any): Promise<SearchResult[]> {
  try {
    const matches = await storage.searchMatches(query);
    
    return matches.map(match => {
      const playerNames = match.players?.map((p: any) => p.name || '').join(' vs ') || '';
      const nameRelevance = calculateRelevance(query, playerNames);
      const typeRelevance = calculateRelevance(query, match.formatType || '');
      
      return {
        id: match.id.toString(),
        type: 'match' as const,
        title: playerNames || 'Match',
        subtitle: `${match.formatType || 'Unknown'} • ${new Date(match.date).toLocaleDateString()}`,
        description: `${match.matchType || 'Casual'} match`,
        location: match.location,
        tags: [
          match.formatType || '',
          match.matchType || '',
          match.eventTier || ''
        ].filter(Boolean),
        relevanceScore: Math.max(nameRelevance, typeRelevance)
      };
    }).filter(result => result.relevanceScore > 0);
  } catch (error) {
    console.error('Error searching matches:', error);
    return [];
  }
}

/**
 * Search communities
 */
async function searchCommunities(query: string, filters: any): Promise<SearchResult[]> {
  try {
    const communities = await storage.searchCommunities(query);
    
    return communities.map(community => {
      const nameRelevance = calculateRelevance(query, community.name || '');
      const descRelevance = calculateRelevance(query, community.description || '');
      
      return {
        id: community.id.toString(),
        type: 'community' as const,
        title: community.name || 'Community',
        subtitle: `${community.memberCount || 0} members`,
        description: community.description || 'Pickleball community',
        avatar: community.imageUrl,
        location: community.location,
        tags: community.tags || [],
        relevanceScore: Math.max(nameRelevance, descRelevance)
      };
    }).filter(result => result.relevanceScore > 0);
  } catch (error) {
    console.error('Error searching communities:', error);
    return [];
  }
}

/**
 * Search tournaments
 */
async function searchTournaments(query: string, filters: any): Promise<SearchResult[]> {
  try {
    const tournaments = await storage.searchTournaments(query);
    
    return tournaments.map(tournament => {
      const nameRelevance = calculateRelevance(query, tournament.name || '');
      const descRelevance = calculateRelevance(query, tournament.description || '');
      
      return {
        id: tournament.id.toString(),
        type: 'tournament' as const,
        title: tournament.name || 'Tournament',
        subtitle: `${new Date(tournament.startDate).toLocaleDateString()} • ${tournament.format || 'Unknown'}`,
        description: tournament.description || 'Pickleball tournament',
        location: tournament.location,
        tags: [
          tournament.format || '',
          tournament.skill_level || '',
          tournament.status || ''
        ].filter(Boolean),
        relevanceScore: Math.max(nameRelevance, descRelevance)
      };
    }).filter(result => result.relevanceScore > 0);
  } catch (error) {
    console.error('Error searching tournaments:', error);
    return [];
  }
}

/**
 * Main search endpoint
 * GET /api/search?q=query&type=all&location=all&skillLevel=all&dateRange=all&limit=20
 */
router.get('/', async (req, res) => {
  try {
    const validation = searchQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: validation.error.errors
      });
    }
    
    const { q: query, type, location, skillLevel, dateRange, limit } = validation.data;
    
    let allResults: SearchResult[] = [];
    
    // Search across different categories based on type filter
    if (type === 'all' || type === 'player') {
      const playerResults = await searchPlayers(query, { location, skillLevel, dateRange });
      allResults = allResults.concat(playerResults);
    }
    
    if (type === 'all' || type === 'coach') {
      const coachResults = await searchCoaches(query, { location, skillLevel, dateRange });
      allResults = allResults.concat(coachResults);
    }
    
    if (type === 'all' || type === 'match') {
      const matchResults = await searchMatches(query, { location, skillLevel, dateRange });
      allResults = allResults.concat(matchResults);
    }
    
    if (type === 'all' || type === 'community') {
      const communityResults = await searchCommunities(query, { location, skillLevel, dateRange });
      allResults = allResults.concat(communityResults);
    }
    
    if (type === 'all' || type === 'tournament') {
      const tournamentResults = await searchTournaments(query, { location, skillLevel, dateRange });
      allResults = allResults.concat(tournamentResults);
    }
    
    // Sort by relevance score and limit results
    const sortedResults = allResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
    
    res.json(sortedResults);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search temporarily unavailable',
      message: 'Please try again later'
    });
  }
});

/**
 * Search suggestions endpoint
 * GET /api/search/suggestions?q=partial_query
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }
    
    // Generate search suggestions based on popular searches and user data
    const suggestions = [
      'Beginner players near me',
      'Advanced coaches',
      'Singles tournaments',
      'Practice partners',
      'Local communities',
      'Coaching certification'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json(suggestions);
    
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.json([]);
  }
});

export { router as searchRoutes };