import { Router } from "express";
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

interface LeaderboardEntry {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  points: number;
  matchesPlayed: number;
  winRate: number;
  gender: 'male' | 'female';
  age: number;
  division: string;
  ranking: number;
  isCurrentUser?: boolean;
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

// Helper function to determine division from age
function getAgeGroupFromAge(age: number): string {
  if (age >= 70) return "70+";
  if (age >= 60) return "60+";
  if (age >= 50) return "50+";
  if (age >= 35) return "35+";
  return "open";
}

// Generate demo data for enhanced leaderboard showing age group and gender separation
function generateDemoLeaderboardData(
  format: string, 
  division: string, 
  gender: string, 
  searchTerm?: string,
  currentUserId?: number
): LeaderboardEntry[] {
  const demoPlayers = [
    { name: "Alex Johnson", gender: "male", age: 28, points: 1850, matches: 45, wins: 32 },
    { name: "Sarah Williams", gender: "female", age: 34, points: 1720, matches: 38, wins: 25 },
    { name: "Mike Rodriguez", gender: "male", age: 42, points: 1650, matches: 52, wins: 31 },
    { name: "Emily Chen", gender: "female", age: 29, points: 1580, matches: 35, wins: 22 },
    { name: "David Brown", gender: "male", age: 55, points: 1520, matches: 48, wins: 28 },
    { name: "Lisa Thompson", gender: "female", age: 38, points: 1480, matches: 41, wins: 24 },
    { name: "Robert Davis", gender: "male", age: 62, points: 1450, matches: 39, wins: 23 },
    { name: "Jennifer Wilson", gender: "female", age: 46, points: 1420, matches: 33, wins: 19 },
    { name: "Mark Anderson", gender: "male", age: 51, points: 1380, matches: 44, wins: 25 },
    { name: "Amy Garcia", gender: "female", age: 31, points: 1350, matches: 29, wins: 17 },
    { name: "Steve Martinez", gender: "male", age: 67, points: 1320, matches: 36, wins: 20 },
    { name: "Rachel Taylor", gender: "female", age: 53, points: 1290, matches: 32, wins: 18 },
    { name: "Tom Wilson", gender: "male", age: 71, points: 1260, matches: 28, wins: 16 },
    { name: "Maria Lopez", gender: "female", age: 59, points: 1230, matches: 35, wins: 19 },
    { name: "James Kim", gender: "male", age: 33, points: 1200, matches: 30, wins: 16 },
    { name: "Anna Petrov", gender: "female", age: 27, points: 1180, matches: 26, wins: 14 },
    { name: "Carlos Mendez", gender: "male", age: 58, points: 1150, matches: 34, wins: 18 },
    { name: "Linda Park", gender: "female", age: 41, points: 1120, matches: 28, wins: 15 },
    { name: "Daniel Singh", gender: "male", age: 45, points: 1090, matches: 32, wins: 17 },
    { name: "Emma Watson", gender: "female", age: 36, points: 1060, matches: 25, wins: 13 },
    { name: "Ryan O'Connor", gender: "male", age: 49, points: 1030, matches: 29, wins: 15 },
    { name: "Sophie Miller", gender: "female", age: 52, points: 1000, matches: 31, wins: 16 },
    { name: "Nathan Hayes", gender: "male", age: 39, points: 980, matches: 27, wins: 14 },
    { name: "Grace Liu", gender: "female", age: 44, points: 950, matches: 24, wins: 12 },
    { name: "Tyler Ross", gender: "male", age: 61, points: 920, matches: 33, wins: 17 },
    { name: "Victoria Bell", gender: "female", age: 48, points: 890, matches: 26, wins: 13 },
    { name: "Admin User", gender: "male", age: 35, points: 860, matches: 22, wins: 11 }, // Current user for testing
    { name: "Oliver Stone", gender: "male", age: 32, points: 830, matches: 28, wins: 14 },
    { name: "Zoe Clark", gender: "female", age: 56, points: 800, matches: 25, wins: 12 },
    { name: "Ethan White", gender: "male", age: 43, points: 770, matches: 30, wins: 15 }
  ];

  let processedPlayers = demoPlayers
    .map((player, index) => ({
      id: index + 1,
      displayName: player.name,
      username: player.name.toLowerCase().replace(' ', '_'),
      avatar: undefined,
      points: player.points,
      matchesPlayed: player.matches,
      winRate: Math.round((player.wins / player.matches) * 100 * 10) / 10, // Convert to percentage with 1 decimal
      gender: player.gender as 'male' | 'female',
      age: player.age,
      division: getAgeGroupFromAge(player.age),
      ranking: index + 1,
      isCurrentUser: currentUserId === 218 && player.name === "Admin User" // Mark current user
    }))
    .filter(player => {
      // Filter by gender - only male and female supported
      if (gender !== 'all' && gender !== 'male' && gender !== 'female') return false;
      if (gender !== 'all' && player.gender !== gender) return false;
      
      // Filter by division
      if (division === 'open') return true;
      
      const divisionMinAge = {
        '35+': 35,
        '50+': 50,
        '60+': 60,
        '70+': 70
      }[division] || 0;
      
      return player.age >= divisionMinAge;
    })
    .sort((a, b) => {
      // Sort by points descending, then by win rate, then by matches played
      if (b.points !== a.points) return b.points - a.points;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.matchesPlayed - a.matchesPlayed;
    })
    .map((player, index) => ({ ...player, ranking: index + 1 }));

  // Apply search filter if provided
  if (searchTerm && searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase().trim();
    processedPlayers = processedPlayers.filter(player => 
      player.displayName.toLowerCase().includes(searchLower) ||
      player.username.toLowerCase().includes(searchLower)
    );
  }

  return processedPlayers;
}

// Get real leaderboard data from database
async function getRealLeaderboardData(
  format: string, 
  division: string, 
  gender: string, 
  searchTerm?: string,
  currentUserId?: number
): Promise<LeaderboardEntry[]> {
  try {
    console.log(`[LEADERBOARD] Fetching real data for ${format} - ${division} - ${gender}`);
    
    // Get all users with their ranking points and basic info
    const allUsers = await storage.getAllUsers();
    
    let processedPlayers = allUsers
      .filter(user => user.rankingPoints > 0) // Only show users with ranking points
      .map((user, index) => {
        const age = user.dateOfBirth ? 
          Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 
          25; // Default age if not provided
        
        return {
          id: user.id,
          displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          username: user.username,
          avatar: user.profileImageUrl,
          points: user.rankingPoints || 0,
          matchesPlayed: user.matchesPlayed || 0,
          winRate: user.matchesPlayed > 0 ? Math.round(((user.wins || 0) / user.matchesPlayed) * 100 * 10) / 10 : 0,
          gender: (user.gender?.toLowerCase() as 'male' | 'female') || 'male',
          age: age,
          division: getAgeGroupFromAge(age),
          ranking: index + 1,
          isCurrentUser: currentUserId === user.id
        };
      })
      .filter(player => {
        // Filter by gender
        if (gender !== 'all' && gender !== 'male' && gender !== 'female') return false;
        if (gender !== 'all' && player.gender !== gender) return false;
        
        // Filter by division
        if (division === 'open') return true;
        
        const divisionMinAge = {
          '35+': 35,
          '50+': 50,
          '60+': 60,
          '70+': 70
        }[division] || 0;
        
        return player.age >= divisionMinAge;
      })
      .sort((a, b) => {
        // Sort by points descending (primary), then by win rate, then by matches played
        if (b.points !== a.points) return b.points - a.points;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.matchesPlayed - a.matchesPlayed;
      })
      .map((player, index) => ({ ...player, ranking: index + 1 }));

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      processedPlayers = processedPlayers.filter(player => 
        player.displayName.toLowerCase().includes(searchLower) ||
        player.username.toLowerCase().includes(searchLower)
      );
    }

    console.log(`[LEADERBOARD] Found ${processedPlayers.length} players with ranking points`);
    return processedPlayers;
    
  } catch (error) {
    console.error('[LEADERBOARD] Error fetching real data:', error);
    // Fallback to demo data in case of database issues
    return generateDemoLeaderboardData(format, division, gender, searchTerm, currentUserId);
  }
}

// Enhanced leaderboard endpoint with age group, gender separation, search, and pagination
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
    const fullLeaderboardData = await getRealLeaderboardData(format, division, gender, search, currentUserId);
    
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
    
    // Get paginated results
    const paginatedPlayers = fullLeaderboardData.slice(startIndex, endIndex);

    const response: LeaderboardResponse = {
      players: paginatedPlayers,
      totalCount,
      currentPage: pageNum,
      totalPages,
      currentUserPosition,
      searchTerm: search || undefined
    };

    console.log(`[Enhanced Leaderboard] Serving ${format} leaderboard for ${division} division, ${gender} gender - ${totalCount} total players, page ${pageNum}/${totalPages}, search: "${search}"`);
    if (currentUserPosition) {
      console.log(`[Enhanced Leaderboard] Current user positioned at rank #${currentUserPosition.ranking}`);
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching enhanced leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Get leaderboard stats endpoint
router.get('/:format/stats', async (req, res) => {
  try {
    const { format } = req.params;

    if (!['singles', 'doubles', 'mixed'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be singles, doubles, or mixed.' });
    }

    // Generate demo stats
    const stats = {
      overall: {
        totalPlayers: 14,
        totalMatches: 542,
        avgPoints: 1465,
        activePlayersLastMonth: 12
      },
      divisionBreakdown: [
        { gender: 'male', ageGroup: 'open', playerCount: 7 },
        { gender: 'female', ageGroup: 'open', playerCount: 7 },
        { gender: 'male', ageGroup: '35+', playerCount: 5 },
        { gender: 'female', ageGroup: '35+', playerCount: 4 },
        { gender: 'male', ageGroup: '50+', playerCount: 3 },
        { gender: 'female', ageGroup: '50+', playerCount: 2 },
        { gender: 'male', ageGroup: '60+', playerCount: 2 },
        { gender: 'female', ageGroup: '60+', playerCount: 1 },
        { gender: 'male', ageGroup: '70+', playerCount: 1 },
        { gender: 'female', ageGroup: '70+', playerCount: 0 }
      ]
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard statistics' });
  }
});

export default router;