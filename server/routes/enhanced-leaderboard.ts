import { Router } from "express";
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { enhanceChineseName, matchesChineseSearch } from '../utils/chinese-name-utils';

const router = Router();

// Simple test endpoint to verify route registration
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Enhanced leaderboard routes working',
    timestamp: new Date(),
    path: req.path 
  });
});

// Test endpoint to simulate production filtering - SAFE VERSION
router.get('/test-production', async (req, res) => {
  try {
    // Use query flag instead of mutating global environment
    const testProductionMode = true;
    
    const fullLeaderboardData = await getRealLeaderboardData('singles', 'open', 'male', '', req.user?.id, { ...req, testProductionMode });
    
    res.json({
      message: 'Production filtering test',
      environment: 'simulated production',
      playersShown: fullLeaderboardData.length,
      players: fullLeaderboardData.map(p => ({ displayName: p.displayName, username: p.username, points: p.points }))
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Debug endpoint for facility displays - shows ALL data without filtering
router.get('/facility-debug', async (req, res) => {
  try {
    const {
      format = 'singles',
      division = 'open',
      gender = 'male'
    } = req.query;

    console.log(`[FACILITY DEBUG] Fetching ALL data for ${format} - ${division} - ${gender} (No filtering)`);
    
    // Get all users with format-specific ranking points (no filtering)
    // FORMAT-SPECIFIC SYSTEM: Each doubles format has its own ranking pool
    const allUsers = await storage.getUsersWithRankingPoints(format as any);
    
    console.log(`[FACILITY DEBUG] Raw users from storage: ${allUsers.length}`);
    
    let usersWithStats = await Promise.all(allUsers.map(async (user, index) => {
        const age = user.dateOfBirth ? 
          Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
          25;
        
        // FORMAT-SPECIFIC SYSTEM: Each format uses its own ranking field with fallback
        let formatPoints = 0;
        if (format === 'singles') {
          formatPoints = user.singlesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'doubles') {
          // UNIFIED DOUBLES SYSTEM: All doubles (including mixed) use same ranking pool
          if (gender === 'mixed') {
            // Mixed doubles uses unified doubles ranking system per Pickle+ Algorithm
            formatPoints = user.doublesRankingPoints || user.rankingPoints || 0;
          } else {
            // Regular doubles
            formatPoints = user.doublesRankingPoints || user.rankingPoints || 0;
          }
        } else if (format === 'mens-doubles') {
          formatPoints = user.mensDoublesRankingPoints || user.doublesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'womens-doubles') {
          formatPoints = user.womensDoublesRankingPoints || user.doublesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'mixed-doubles-men') {
          formatPoints = user.mixedDoublesMenRankingPoints || 0;
        } else if (format === 'mixed-doubles-women') {
          formatPoints = user.mixedDoublesWomenRankingPoints || 0;
        }
        
        const totalMatches = user.totalMatches || 0;
        const matchesWon = user.matchesWon || 0;
        
        // FIX: Calculate win rate with fallback for players with points but no match stats
        let winRate = 0;
        if (totalMatches > 0) {
          winRate = (matchesWon / totalMatches) * 100;
        } else if (formatPoints > 0) {
          // Estimate win rate for players with ranking points but no recorded match stats
          winRate = formatPoints > 50 ? 60 : formatPoints > 20 ? 45 : 30;
        }
        
        const rawDisplayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        
        return {
          id: user.id,
          displayName: rawDisplayName,
          username: user.username,
          points: Number(formatPoints.toFixed(2)),
          matchesPlayed: totalMatches,
          winRate: Math.round(winRate * 100) / 100,
          gender: (user.gender?.toLowerCase() as 'male' | 'female') || 'male',
          age: age,
          division: division,
          ranking: index + 1,
          isCurrentUser: false
        };
      }));

    // Only filter by points > 0 and basic gender/division matching
    let processedPlayers = usersWithStats
      .filter(player => player.points > 0)
      .filter(player => {
        // Support mixed doubles in facility debug
        if (gender !== 'all' && gender !== 'male' && gender !== 'female' && gender !== 'mixed') return false;
        
        // MIXED DOUBLES FIX: For mixed doubles, only show players with mixed doubles points
        if (gender === 'mixed') {
          // Player must have mixed doubles points in their gender-specific column
          return player.points > 0; // Already filtered above, but ensure mixed doubles points exist
        }
        
        // For male/female specific, filter by player gender
        if (gender !== 'all' && player.gender !== gender) return false;
        return true; // Skip age/division filtering for debug
      })
      .sort((a, b) => b.points - a.points)
      .map((player, index) => ({ ...player, ranking: index + 1 }));

    console.log(`[FACILITY DEBUG] Final processed players: ${processedPlayers.length}`);
    
    res.json({
      message: 'Facility debug - all data without filtering',
      rawUsers: allUsers.length,
      withPoints: usersWithStats.filter(p => p.points > 0).length,
      finalPlayers: processedPlayers.length,
      players: processedPlayers.slice(0, 50), // Limit to 50 for display
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('[FACILITY DEBUG] Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

console.log('[ENHANCED LEADERBOARD] Router initialized and test endpoint added');

// Enhanced leaderboard endpoint supporting new standalone youth ranking system
router.get('/', async (req, res) => {
  try {
    const {
      format = 'singles',
      division = 'open',
      gender = 'male',
      search = '',
      page = '1',
      limit = '20',
      view = 'global' // Geographic filtering: local, regional, global
    } = req.query;

    console.log(`[ENHANCED LEADERBOARD] Main endpoint called with: format=${format}, division=${division}, gender=${gender}, view=${view}`);

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    // For youth categories, use the new age group ranking system
    const youthCategories = ['u12', 'u14', 'u16', 'u18'];
    console.log(`[ENHANCED LEADERBOARD] Checking if ${division} is in youth categories:`, youthCategories.includes(division as string));
    
    if (youthCategories.includes(division as string)) {
      // Use standalone youth ranking system
      console.log(`[ENHANCED LEADERBOARD] Fetching youth rankings for: division=${division}, format=${format}, gender=${gender}`);
      
      // Convert lowercase division to uppercase format expected by schema
      const ageCategory = (division as string).toUpperCase();
      
      const rankings = await storage.getAgeGroupLeaderboard(
        ageCategory as any,
        format as 'singles' | 'doubles',
        gender as 'male' | 'female',
        limitNum,
        offset
      );

      // Transform to leaderboard format with Chinese name enhancement
      let leaderboardEntries = rankings.map((ranking, index) => {
        const rawDisplayName = ranking.user.displayName || `${ranking.user.firstName || ''} ${ranking.user.lastName || ''}`.trim() || ranking.user.username;
        const enhancedDisplayName = enhanceChineseName(rawDisplayName);
        
        return {
          id: ranking.user.id,
          displayName: enhancedDisplayName,
          username: ranking.user.username,
          avatar: ranking.user.avatarUrl || undefined,
          points: Number((format === 'singles' ? (ranking.singlesPoints || 0) : (ranking.doublesPoints || 0)).toFixed(2)), // Ensure 2 decimal precision
          matchesPlayed: ranking.totalMatches || 0,
          winRate: (ranking.totalMatches || 0) > 0 ? Math.round((((ranking.matchesWon || 0) / (ranking.totalMatches || 0)) * 100) * 100) / 100 : 0, // Ensure 2 decimal precision for win rate
          gender: (ranking.user.gender || 'male') as 'male' | 'female',
          age: ranking.user.dateOfBirth ? 
            Math.floor((new Date().getTime() - new Date(ranking.user.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
            25,
          division: ranking.ageCategory,
          ranking: offset + index + 1,
          isCurrentUser: req.user?.id === ranking.user.id
        };
      });

      // Apply production data filtering for youth rankings
      const originalCount = leaderboardEntries.length;
      leaderboardEntries = leaderboardEntries.filter(player => isProductionDataFilter(player, false));
      
      // Re-rank after filtering - maintain correct pagination ranking
      leaderboardEntries = leaderboardEntries.map((player, index) => ({
        ...player,
        ranking: offset + index + 1 // Correct ranking based on pagination offset
      }));

      const isProduction = process.env.NODE_ENV === 'production';
      const excludedCount = originalCount - leaderboardEntries.length;
      if (isProduction && excludedCount > 0) {
        console.log(`[ENHANCED LEADERBOARD] Youth rankings - Production mode: Excluded ${excludedCount} test/development users`);
      }

      const response: LeaderboardResponse = {
        players: leaderboardEntries,
        totalCount: rankings.length,
        currentPage: pageNum,
        totalPages: Math.ceil(rankings.length / limitNum),
        searchTerm: search as string
      };

      return res.json(response);
    }

    // For adult categories, use the real leaderboard data from database with UDF algorithm compliance
    const currentUserId = req.user?.id;
    const fullLeaderboardData = await getRealLeaderboardData(format as string, division as string, gender as string, search as string, currentUserId, req, view as string);
    
    // Find current user position in full dataset (before pagination)
    let currentUserPosition = undefined;
    if (currentUserId) {
      const userIndex = fullLeaderboardData.findIndex(player => player.isCurrentUser);
      if (userIndex !== -1) {
        currentUserPosition = {
          ranking: userIndex + 1,
          player: fullLeaderboardData[userIndex]
        };
      }
    }

    // Calculate pagination
    const totalCount = fullLeaderboardData.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    // Get paginated results and ensure ranking numbers continue correctly
    const paginatedPlayers = fullLeaderboardData.slice(startIndex, endIndex).map((player, index) => ({
      ...player,
      ranking: startIndex + index + 1 // Correct ranking based on pagination offset
    }));

    const response: LeaderboardResponse = {
      players: paginatedPlayers,
      totalCount,
      currentPage: pageNum,
      totalPages,
      currentUserPosition,
      searchTerm: search as string
    };

    console.log(`[LEADERBOARD] API Response - Format: ${format}, Players: ${paginatedPlayers.length}/${totalCount}, Page: ${pageNum}/${totalPages}`);
    
    // Send response with properly formatted decimal points
    res.json(response);
  } catch (error) {
    console.error('[ENHANCED LEADERBOARD] Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

console.log('[ENHANCED LEADERBOARD] Main leaderboard endpoint added');

interface LeaderboardEntry {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  points: number; // UDF: 2 decimal precision, stored values only
  matchesPlayed: number; // Frontend expects 'matchesPlayed'
  winRate: number; // UDF: 2 decimal precision
  gender: 'male' | 'female';
  age: number;
  division: string; // Frontend expects 'division'
  ranking: number;
  isCurrentUser?: boolean;
  location?: { // UDF: Location data for geographic filtering
    city: string;
    state: string;
    country: string;
  };
}

interface LeaderboardResponse {
  players: LeaderboardEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentUserPosition?: {
    ranking: number;
    player: LeaderboardEntry;
  };
  searchTerm?: string;
}

// Helper function to determine eligible divisions from age (standalone youth system)
function getEligibleDivisionsFromAge(age: number): string[] {
  const divisions: string[] = [];
  
  // Adult age-specific categories (players must meet minimum age)
  if (age >= 70) divisions.push("70+");
  if (age >= 60) divisions.push("60+");
  if (age >= 50) divisions.push("50+");
  if (age >= 35) divisions.push("35+");
  
  // Standalone youth and adult categories
  if (age >= 19) {
    divisions.push("open"); // 19+ for Open category
  } else {
    // Youth players can compete in multiple youth categories but must choose
    if (age <= 11) divisions.push("u12");
    if (age <= 13) divisions.push("u14");
    if (age <= 15) divisions.push("u16");
    if (age <= 17) divisions.push("u18");
    // Youth can also participate in Open (league matches -> Open points only)
    divisions.push("open");
  }
  
  return divisions;
}

// Helper function to get primary division from age (for display purposes)
function getPrimaryDivisionFromAge(age: number): string {
  if (age >= 70) return "70+";
  if (age >= 60) return "60+";
  if (age >= 50) return "50+";
  if (age >= 35) return "35+";
  if (age >= 19) return "open";
  if (age <= 11) return "u12";
  if (age <= 13) return "u14";
  if (age <= 15) return "u16";
  if (age <= 17) return "u18";
  return "open";
}

// Production data filtering utility
function isProductionDataFilter(player: any, isProduction: boolean = false): boolean {
  if (!isProduction) {
    // In development, allow all data
    return true;
  }
  
  // Production filtering - exclude test data and specific development users
  const excludedUsernames = [
    'mightymax', 'test', 'demo', 'admin', 'sample',
    // Test coaches (dev only)
    'coach_sarah', 'coach_emma', 'coach_mike', 'testcoach'
  ];
  const excludedDisplayNamePatterns = ['test', 'demo', 'sample', 'admin', 'mighty'];
  
  // Check username exclusions
  if (excludedUsernames.some(excluded => 
    player.username.toLowerCase().includes(excluded.toLowerCase())
  )) {
    return false;
  }
  
  // Check display name exclusions
  if (excludedDisplayNamePatterns.some(pattern => 
    player.displayName.toLowerCase().includes(pattern.toLowerCase())
  )) {
    return false;
  }
  
  // Exclude users with obviously test-like data
  if (player.username.startsWith('user_') || 
      player.displayName.startsWith('User ') ||
      player.username.match(/^(user|test|demo)\d+$/i)) {
    return false;
  }
  
  return true;
}

// Get real leaderboard data from database
async function getRealLeaderboardData(
  format: string, 
  division: string, 
  gender: string, 
  searchTerm?: string,
  currentUserId?: number,
  req?: any,
  view: string = 'global'
): Promise<LeaderboardEntry[]> {
  try {
    // Support safe production testing mode
    const isProduction = req?.testProductionMode || process.env.NODE_ENV === 'production';
    console.log(`[LEADERBOARD] Fetching real data for ${format} - ${division} - ${gender} (Production: ${isProduction})`);
    
    // FORMAT MAPPING: Handle both old generic formats and new specific formats
    let formatParam: string;
    if (format === 'doubles') {
      formatParam = 'doubles'; // Legacy mapping for getUsersWithRankingPoints
    } else if (format === 'mixed') {
      // Mixed doubles needs to query the specific mixed format based on gender
      formatParam = gender === 'female' ? 'mixed-doubles-women' : 'mixed-doubles-men';
    } else {
      formatParam = format; // singles, mens-doubles, womens-doubles, etc.
    }
    
    // PICKLE POINTS FIX: Use different query based on mode
    // For Pickle Points, get ALL players who have participated in matches (not just those with ranking points > 0)
    const isPicklePointsMode = req?.query?.picklePointsMode === 'true';
    const allUsers = isPicklePointsMode 
      ? await storage.getAllPlayersWithMatches(formatParam as any)
      : await storage.getUsersWithRankingPoints(formatParam as any);
    
    let usersWithStats = await Promise.all(allUsers.map(async (user, index) => {
        const age = user.dateOfBirth ? 
          Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
          25; // Default age if not provided
        
        // UDF COMPLIANT: Use format-specific ranking points WITHOUT display-time multipliers
        // NOTE: Gender multipliers should be applied during match recording, NOT during display
        // FORMAT-SPECIFIC SYSTEM: Each format uses its own ranking field
        let formatPoints = 0;
        
        if (format === 'singles') {
          formatPoints = user.singlesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'doubles') {
          // MIXED DOUBLES: Show actual mixed doubles performance (stored values)
          if (gender === 'mixed') {
            // Show performance from actual mixed doubles matches
            if (user.gender === 'male') {
              formatPoints = user.mixedDoublesMenRankingPoints || 0;
            } else if (user.gender === 'female') {
              formatPoints = user.mixedDoublesWomenRankingPoints || 0;
            }
          } else {
            // Regular doubles
            formatPoints = user.doublesRankingPoints || user.rankingPoints || 0;
          }
        } else if (format === 'mens-doubles') {
          formatPoints = user.mensDoublesRankingPoints || user.doublesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'womens-doubles') {
          formatPoints = user.womensDoublesRankingPoints || user.doublesRankingPoints || user.rankingPoints || 0;
        } else if (format === 'mixed-doubles-men') {
          // Mixed doubles performance tracking - display stored values
          formatPoints = user.mixedDoublesMenRankingPoints || 0;
        } else if (format === 'mixed-doubles-women') {
          // Mixed doubles performance tracking - display stored values
          formatPoints = user.mixedDoublesWomenRankingPoints || 0;
        } else if (format === 'mixed') {
          // Legacy mixed format - use gender-specific mixed doubles performance
          if (user.gender === 'male') {
            formatPoints = user.mixedDoublesMenRankingPoints || 0;
          } else if (user.gender === 'female') {
            formatPoints = user.mixedDoublesWomenRankingPoints || 0;
          }
        }
        
        // Use direct user stats (includes tournament data) instead of calculating from individual matches
        const totalMatches = user.totalMatches || 0;
        const matchesWon = user.matchesWon || 0;
        
        // FIX: Calculate win rate based on actual match history, with fallback for players with points but no match stats
        let winRate = 0;
        if (totalMatches > 0) {
          winRate = (matchesWon / totalMatches) * 100;
        } else if (formatPoints > 0) {
          // For players with ranking points but no recorded match stats, estimate based on points
          // Assuming they have some wins to earn points - conservative estimate
          winRate = formatPoints > 50 ? 60 : formatPoints > 20 ? 45 : 30; // Reasonable estimate based on point level
        }
        
        const rawDisplayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        const enhancedDisplayName = enhanceChineseName(rawDisplayName);
        
        return {
          id: user.id,
          displayName: enhancedDisplayName,
          username: user.username,
          avatar: user.avatarUrl || undefined,
          points: Number(formatPoints.toFixed(2)), // UDF: 2 decimal precision, no display-time multipliers
          matchesPlayed: totalMatches, // Frontend expects 'matchesPlayed'
          winRate: Math.round(winRate * 100) / 100, // UDF: 2 decimal precision for win rate
          gender: (user.gender?.toLowerCase() as 'male' | 'female') || 'male',
          age: age,
          division: getPrimaryDivisionFromAge(age), // Frontend expects 'division'
          ranking: index + 1,
          isCurrentUser: currentUserId === user.id,
          // UDF: Add location data for geographic filtering
          location: {
            city: user.city || '',
            state: user.state || user.province || '',
            country: user.country || 'Unknown'
          }
        };
      }));

    let processedPlayers = usersWithStats
      .filter(player => player.points > 0) // Only show players with points in this format
      .filter(player => isProductionDataFilter(player, isProduction)) // Apply production data filtering
      .filter(player => applyGeographicFilter(player, view, req.user)) // UDF: Apply geographic filtering
      .filter(player => {
        // Filter by gender - support mixed doubles
        if (gender !== 'all' && gender !== 'male' && gender !== 'female' && gender !== 'mixed') return false;
        
        // MIXED DOUBLES FIX: For mixed doubles, only show players with mixed doubles points
        if (gender === 'mixed') {
          // Player must have mixed doubles points in their gender-specific column
          return player.points > 0; // Already filtered above, but ensure mixed doubles points exist
        }
        
        // For male/female specific, filter by player gender
        if (gender !== 'all' && player.gender !== gender) return false;
        
        // Filter by division with cross-category participation support
        const eligibleDivisions = getEligibleDivisionsFromAge(player.age);
        
        // FIX: Handle division parameter formatting inconsistencies
        // Convert "35plus" to "35+" for proper matching
        let normalizedDivision = division;
        if (division === '35plus') normalizedDivision = '35+';
        if (division === '50plus') normalizedDivision = '50+';
        if (division === '60plus') normalizedDivision = '60+';
        if (division === '70plus') normalizedDivision = '70+';
        
        // DEBUG: Log age group filtering for troubleshooting
        if (player.displayName.toLowerCase().includes('darren') || player.age >= 35) {
          console.log(`[AGE GROUP DEBUG] Player: ${player.displayName}, Age: ${player.age}, Division: ${division} -> ${normalizedDivision}, Eligible: [${eligibleDivisions.join(', ')}], Included: ${eligibleDivisions.includes(normalizedDivision)}`);
        }
        
        return eligibleDivisions.includes(normalizedDivision);
      })
      .sort((a, b) => {
        // Sort by points descending (primary), then by win rate, then by matches played
        if (b.points !== a.points) return b.points - a.points;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.matchesPlayed - a.matchesPlayed;
      })
      .map((player, index) => ({ ...player, ranking: index + 1 })); // Assign ranking based on sorted position

    // Apply search filter if provided with Chinese name support
    if (searchTerm && searchTerm.trim()) {
      processedPlayers = processedPlayers.filter(player => 
        matchesChineseSearch(player.displayName, player.username, searchTerm)
      );
    }

    const excludedCount = usersWithStats.length - processedPlayers.length;
    if (isProduction && excludedCount > 0) {
      console.log(`[LEADERBOARD] Production mode: Excluded ${excludedCount} test/development users`);
    }
    
    console.log(`[LEADERBOARD] UDF-Compliant: Found ${processedPlayers.length} players with ranking points for view: ${view}`);
    return processedPlayers;
    
  } catch (error) {
    console.error('[LEADERBOARD] Error fetching real data:', error);
    return [];
  }
}

// UDF Geographic filtering function
function applyGeographicFilter(player: any, view: string, currentUser?: any): boolean {
  if (view === 'global') {
    return true; // Global view shows all players
  }
  
  if (!currentUser || !player.location) {
    return true; // In development, show all players if no location data
  }
  
  const userLocation = {
    city: currentUser.city || '',
    state: currentUser.state || currentUser.province || '',
    country: currentUser.country || 'Unknown'
  };
  
  if (view === 'local') {
    // Local: Same city and state/province
    return player.location.city === userLocation.city && 
           player.location.state === userLocation.state;
  }
  
  if (view === 'regional') {
    // Regional: Same state/province or country
    return player.location.state === userLocation.state || 
           player.location.country === userLocation.country;
  }
  
  return true; // Default to showing all players
}

// Enhanced leaderboard endpoint with age group, gender separation, search, and pagination (legacy format param route)
router.get('/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { 
      division = 'open', 
      gender = 'all',
      page = '1',
      limit = '20',
      search = ''
    } = req.query as { 
      division?: string; 
      gender?: string;
      page?: string;
      limit?: string;
      search?: string;
    };

    if (!['singles', 'doubles', 'mixed'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be singles, doubles, or mixed.' });
    }

    const currentUserId = req.user?.id;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Get real leaderboard data from database
    const fullLeaderboardData = await getRealLeaderboardData(format, division, gender, search, currentUserId, req);
    
    // Find current user position in full dataset (before pagination)
    let currentUserPosition = undefined;
    if (currentUserId) {
      const userIndex = fullLeaderboardData.findIndex(player => player.isCurrentUser);
      if (userIndex !== -1) {
        currentUserPosition = {
          ranking: userIndex + 1,
          player: fullLeaderboardData[userIndex]
        };
      }
    }

    // Calculate pagination
    const totalCount = fullLeaderboardData.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    // Get paginated results and ensure ranking numbers continue correctly
    const paginatedPlayers = fullLeaderboardData.slice(startIndex, endIndex).map((player, index) => ({
      ...player,
      ranking: startIndex + index + 1 // Correct ranking based on pagination offset
    }));

    const response: LeaderboardResponse = {
      players: paginatedPlayers,
      totalCount,
      currentPage: pageNum,
      totalPages,
      currentUserPosition,
      searchTerm: search
    };

    console.log(`[LEADERBOARD] API Response - Format: ${format}, Players: ${paginatedPlayers.length}/${totalCount}, Page: ${pageNum}/${totalPages}`);
    res.json(response);

  } catch (error) {
    console.error('[LEADERBOARD] API Error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

export default router;