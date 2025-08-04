import { Router } from "express";

const router = Router();

interface LeaderboardEntry {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  points: number;
  matchesPlayed: number;
  winRate: number;
  gender: 'male' | 'female' | 'other';
  age: number;
  division: string;
  ranking: number;
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
function generateDemoLeaderboardData(format: string, division: string, gender: string): LeaderboardEntry[] {
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
    { name: "Maria Lopez", gender: "female", age: 59, points: 1230, matches: 35, wins: 19 }
  ];

  return demoPlayers
    .map((player, index) => ({
      id: index + 1,
      displayName: player.name,
      username: player.name.toLowerCase().replace(' ', '_'),
      avatar: undefined,
      points: player.points,
      matchesPlayed: player.matches,
      winRate: Math.round((player.wins / player.matches) * 1000) / 10, // Round to 1 decimal
      gender: player.gender as 'male' | 'female' | 'other',
      age: player.age,
      division: getAgeGroupFromAge(player.age),
      ranking: index + 1
    }))
    .filter(player => {
      // Filter by gender
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
}

// Enhanced leaderboard endpoint with age group and gender separation
router.get('/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { division = 'open', gender = 'all' } = req.query as { 
      division?: string; 
      gender?: string; 
    };

    if (!['singles', 'doubles'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be singles or doubles.' });
    }

    // Generate demo data showing enhanced leaderboard with age group and gender separation
    const leaderboardData = generateDemoLeaderboardData(format, division, gender);

    console.log(`[Enhanced Leaderboard] Serving ${format} leaderboard for ${division} division, ${gender} gender - ${leaderboardData.length} players`);

    res.json(leaderboardData);

  } catch (error) {
    console.error('Error fetching enhanced leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Get leaderboard stats endpoint
router.get('/:format/stats', async (req, res) => {
  try {
    const { format } = req.params;

    if (!['singles', 'doubles'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be singles or doubles.' });
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