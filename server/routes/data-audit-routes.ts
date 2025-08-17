import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Data integrity audit endpoint
router.get('/api/admin/data-audit/:userId', requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user info
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all matches for this user
    const matches = await storage.getMatchesByUser(userId);
    
    // Analyze for duplicates
    const duplicates = [];
    const matchAnalysis = {
      totalMatches: matches.length,
      suspiciousPatterns: [],
      timeCluster: []
    };

    // Check for duplicate matches (same players within 5 minutes)
    for (let i = 0; i < matches.length - 1; i++) {
      for (let j = i + 1; j < matches.length; j++) {
        const match1 = matches[i];
        const match2 = matches[j];
        
        const timeDiff = Math.abs(new Date(match2.createdAt).getTime() - new Date(match1.createdAt).getTime()) / (1000 * 60);
        
        if (timeDiff < 5) {
          // Check if same players
          const players1 = [match1.playerOneId, match1.playerTwoId, match1.playerOnePartnerId, match1.playerTwoPartnerId].filter(p => p);
          const players2 = [match2.playerOneId, match2.playerTwoId, match2.playerOnePartnerId, match2.playerTwoPartnerId].filter(p => p);
          
          const samePlayers = players1.length === players2.length && 
                             players1.every(p => players2.includes(p));
          
          if (samePlayers) {
            duplicates.push({
              match1: {
                id: match1.id,
                date: match1.createdAt,
                format: match1.formatType
              },
              match2: {
                id: match2.id,
                date: match2.createdAt,
                format: match2.formatType
              },
              timeDifferenceMinutes: timeDiff.toFixed(2)
            });
          }
        }
      }
    }

    // Group matches by date to find unusual clustering
    const matchesByDate = matches.reduce((acc, match) => {
      const date = new Date(match.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(match);
      return acc;
    }, {});

    // Find dates with unusually high match counts
    const suspiciousDates = Object.entries(matchesByDate)
      .filter(([date, matches]) => matches.length > 5)
      .map(([date, matches]) => ({
        date,
        matchCount: matches.length,
        matches: matches.map(m => ({ id: m.id, time: m.createdAt }))
      }));

    res.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        rankingPoints: user.rankingPoints,
        picklePoints: user.picklePoints
      },
      analysis: {
        totalMatches: matches.length,
        duplicatesFound: duplicates.length,
        duplicates,
        suspiciousDates,
        recentMatches: matches.slice(0, 10).map(m => ({
          id: m.id,
          date: m.createdAt,
          format: m.formatType,
          opponent: m.playerOneId === userId ? m.playerTwoId : m.playerOneId
        }))
      }
    });

  } catch (error) {
    console.error('Data audit error:', error);
    res.status(500).json({ error: 'Audit failed', details: error.message });
  }
});

// System-wide duplicate detection
router.get('/api/admin/system-audit', requireAuth, async (req, res) => {
  try {
    console.log('🔍 Starting system-wide duplicate detection...');
    
    // Get all users with more than 10 matches
    const allUsers = await storage.getAllUsers();
    const usersWithDuplicates = [];
    let totalDuplicatesFound = 0;

    for (const user of allUsers) {
      const matches = await storage.getMatchesByUser(user.id);
      
      if (matches.length > 10) {
        const duplicates = [];
        
        // Check for duplicates for this user
        for (let i = 0; i < matches.length - 1; i++) {
          for (let j = i + 1; j < matches.length; j++) {
            const match1 = matches[i];
            const match2 = matches[j];
            
            const timeDiff = Math.abs(new Date(match2.createdAt).getTime() - new Date(match1.createdAt).getTime()) / (1000 * 60);
            
            if (timeDiff < 5) {
              const players1 = [match1.playerOneId, match1.playerTwoId, match1.playerOnePartnerId, match1.playerTwoPartnerId].filter(p => p);
              const players2 = [match2.playerOneId, match2.playerTwoId, match2.playerOnePartnerId, match2.playerTwoPartnerId].filter(p => p);
              
              const samePlayers = players1.length === players2.length && 
                                 players1.every(p => players2.includes(p));
              
              if (samePlayers) {
                duplicates.push({
                  match1Id: match1.id,
                  match2Id: match2.id,
                  timeDifferenceMinutes: timeDiff.toFixed(2)
                });
              }
            }
          }
        }
        
        if (duplicates.length > 0) {
          usersWithDuplicates.push({
            userId: user.id,
            displayName: user.displayName,
            username: user.username,
            totalMatches: matches.length,
            duplicatesFound: duplicates.length,
            duplicates
          });
          totalDuplicatesFound += duplicates.length;
        }
      }
    }

    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        usersAudited: allUsers.length,
        usersWithDuplicates: usersWithDuplicates.length,
        totalDuplicatesFound
      },
      affectedUsers: usersWithDuplicates
    });

  } catch (error) {
    console.error('System audit error:', error);
    res.status(500).json({ error: 'System audit failed', details: error.message });
  }
});

// Find user by name
router.get('/api/admin/find-user/:searchTerm', requireAuth, async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm.toLowerCase();
    const allUsers = await storage.getAllUsers();
    
    const matchingUsers = allUsers.filter(user => {
      const displayName = user.displayName?.toLowerCase() || '';
      const username = user.username?.toLowerCase() || '';
      return displayName.includes(searchTerm) || username.includes(searchTerm);
    });

    res.json({
      searchTerm: req.params.searchTerm,
      matches: matchingUsers.map(user => ({
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        rankingPoints: user.rankingPoints,
        picklePoints: user.picklePoints
      }))
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'User search failed', details: error.message });
  }
});

export default router;