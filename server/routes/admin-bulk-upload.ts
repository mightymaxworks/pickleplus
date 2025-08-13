import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xlsx',
      '.xls'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Interface for the Excel row structure
interface BulkMatchRow {
  matchDate: string;
  matchType: 'casual' | 'tournament';
  player1PassportCode: string;
  player1Gender: string;
  player2PassportCode: string;
  player2Gender: string;
  player3PassportCode?: string;
  player3Gender?: string;
  player4PassportCode?: string;
  player4Gender?: string;
  isDoubles: boolean;
  team1Score: number;
  team2Score: number;
  gameScores: string; // JSON format: [{"team1": 11, "team2": 9}, {"team1": 11, "team2": 7}]
  location?: string;
  notes?: string;
}

// Generate Excel template
router.get('/template', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Create sample data for the template
    const templateData = [
      {
        'Match Date (YYYY-MM-DD)': '2025-08-13',
        'Match Type (casual/tournament)': 'casual',
        'Player 1 Passport Code': 'CBSPZV',
        'Player 1 Gender (male/female)': 'male',
        'Player 2 Passport Code': 'HVGN0BW0',
        'Player 2 Gender (male/female)': 'female',
        'Player 3 Passport Code (doubles only)': 'KGLE38K4',
        'Player 3 Gender (doubles only)': 'male',
        'Player 4 Passport Code (doubles only)': 'MX8K7P2N',
        'Player 4 Gender (doubles only)': 'female',
        'Is Doubles Match (TRUE/FALSE)': 'TRUE',
        'Team 1 Score': 2,
        'Team 2 Score': 1,
        'Game Scores (JSON format)': '[{"team1": 11, "team2": 9}, {"team1": 11, "team2": 7}, {"team1": 9, "team2": 11}]',
        'Location (optional)': 'Court 1',
        'Notes (optional)': 'Great match with close games'
      },
      {
        'Match Date (YYYY-MM-DD)': '2025-08-13',
        'Match Type (casual/tournament)': 'tournament',
        'Player 1 Passport Code': 'CBSPZV',
        'Player 1 Gender (male/female)': 'male',
        'Player 2 Passport Code': 'HVGN0BW0',
        'Player 2 Gender (male/female)': 'female',
        'Player 3 Passport Code (doubles only)': '',
        'Player 3 Gender (doubles only)': '',
        'Player 4 Passport Code (doubles only)': '',
        'Player 4 Gender (doubles only)': '',
        'Is Doubles Match (TRUE/FALSE)': 'FALSE',
        'Team 1 Score': 2,
        'Team 2 Score': 0,
        'Game Scores (JSON format)': '[{"team1": 11, "team2": 8}, {"team1": 11, "team2": 6}]',
        'Location (optional)': 'Tournament Court A',
        'Notes (optional)': 'Singles match - tournament round 1'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 18 }, // Match Date
      { wch: 25 }, // Match Type
      { wch: 20 }, // Player 1 Passport Code
      { wch: 25 }, // Player 1 Gender
      { wch: 20 }, // Player 2 Passport Code
      { wch: 25 }, // Player 2 Gender
      { wch: 25 }, // Player 3 Passport Code
      { wch: 25 }, // Player 3 Gender
      { wch: 25 }, // Player 4 Passport Code
      { wch: 25 }, // Player 4 Gender
      { wch: 20 }, // Is Doubles
      { wch: 12 }, // Team 1 Score
      { wch: 12 }, // Team 2 Score
      { wch: 40 }, // Game Scores
      { wch: 20 }, // Location
      { wch: 30 }  // Notes
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Match Records Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="pickle-plus-bulk-match-template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);

  } catch (error) {
    console.error('Error generating Excel template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

// Process bulk match upload
router.post('/matches', isAuthenticated, upload.single('excelFile'), async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required' });
    }

    console.log(`[ADMIN-BULK] Processing Excel file: ${req.file.originalname}`);

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`[ADMIN-BULK] Found ${jsonData.length} rows in Excel file`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      
      try {
        // Map Excel columns to our interface
        const matchData: BulkMatchRow = {
          matchDate: row['Match Date (YYYY-MM-DD)'],
          matchType: row['Match Type (casual/tournament)']?.toLowerCase(),
          player1PassportCode: row['Player 1 Passport Code']?.toUpperCase(),
          player1Gender: row['Player 1 Gender (male/female)']?.toLowerCase(),
          player2PassportCode: row['Player 2 Passport Code']?.toUpperCase(),
          player2Gender: row['Player 2 Gender (male/female)']?.toLowerCase(),
          player3PassportCode: row['Player 3 Passport Code (doubles only)']?.toUpperCase() || undefined,
          player3Gender: row['Player 3 Gender (doubles only)']?.toLowerCase() || undefined,
          player4PassportCode: row['Player 4 Passport Code (doubles only)']?.toUpperCase() || undefined,
          player4Gender: row['Player 4 Gender (doubles only)']?.toLowerCase() || undefined,
          isDoubles: String(row['Is Doubles Match (TRUE/FALSE)']).toUpperCase() === 'TRUE',
          team1Score: Number(row['Team 1 Score']),
          team2Score: Number(row['Team 2 Score']),
          gameScores: row['Game Scores (JSON format)'],
          location: row['Location (optional)'] || undefined,
          notes: row['Notes (optional)'] || undefined
        };

        // Validate required fields
        if (!matchData.matchDate || !matchData.matchType || !matchData.player1PassportCode || !matchData.player2PassportCode) {
          results.errors.push(`Row ${i + 2}: Missing required fields`);
          results.failed++;
          continue;
        }

        // Validate match type
        if (!['casual', 'tournament'].includes(matchData.matchType)) {
          results.errors.push(`Row ${i + 2}: Match type must be 'casual' or 'tournament'`);
          results.failed++;
          continue;
        }

        // Validate doubles configuration
        if (matchData.isDoubles && (!matchData.player3PassportCode || !matchData.player4PassportCode)) {
          results.errors.push(`Row ${i + 2}: Doubles match requires all 4 players`);
          results.failed++;
          continue;
        }

        // Find players by passport codes
        const player1 = await storage.getUserByPassportCode(matchData.player1PassportCode);
        const player2 = await storage.getUserByPassportCode(matchData.player2PassportCode);
        
        if (!player1) {
          results.errors.push(`Row ${i + 2}: Player 1 with passport code ${matchData.player1PassportCode} not found`);
          results.failed++;
          continue;
        }

        if (!player2) {
          results.errors.push(`Row ${i + 2}: Player 2 with passport code ${matchData.player2PassportCode} not found`);
          results.failed++;
          continue;
        }

        let player3, player4;
        if (matchData.isDoubles) {
          player3 = await storage.getUserByPassportCode(matchData.player3PassportCode!);
          player4 = await storage.getUserByPassportCode(matchData.player4PassportCode!);

          if (!player3) {
            results.errors.push(`Row ${i + 2}: Player 3 with passport code ${matchData.player3PassportCode} not found`);
            results.failed++;
            continue;
          }

          if (!player4) {
            results.errors.push(`Row ${i + 2}: Player 4 with passport code ${matchData.player4PassportCode} not found`);
            results.failed++;
            continue;
          }
        }

        // Parse game scores
        let gameScores;
        try {
          gameScores = JSON.parse(matchData.gameScores);
        } catch (error) {
          results.errors.push(`Row ${i + 2}: Invalid game scores JSON format`);
          results.failed++;
          continue;
        }

        // Create match record
        const matchRecord = {
          competitionId: 1, // Default competition ID for bulk uploads
          matchNumber: Date.now(), // Use timestamp as match number for uniqueness
          format: matchData.isDoubles ? 'doubles' as const : 'singles' as const,
          player1Id: player1.id,
          player2Id: player2.id,
          player3Id: player3?.id || null,
          player4Id: player4?.id || null,
          isDoubles: matchData.isDoubles,
          team1Score: matchData.team1Score,
          team2Score: matchData.team2Score,
          gameScores: gameScores,
          matchDate: new Date(matchData.matchDate),
          matchType: matchData.matchType,
          location: matchData.location,
          notes: matchData.notes,
          recordedBy: user.id
        };

        // Save match to database
        const match = await storage.createMatch(matchRecord);

        // Update player statistics and points
        await updatePlayerStatsFromMatch(match);

        results.successful++;
        console.log(`[ADMIN-BULK] Successfully created match ${match.id} for row ${i + 2}`);

      } catch (error) {
        console.error(`[ADMIN-BULK] Error processing row ${i + 2}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Row ${i + 2}: ${errorMessage}`);
        results.failed++;
      }
    }

    console.log(`[ADMIN-BULK] Bulk upload completed: ${results.successful} successful, ${results.failed} failed`);

    res.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error processing bulk upload:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// Helper function to update player statistics and points
async function updatePlayerStatsFromMatch(match: any) {
  try {
    const players = [match.player1Id, match.player2Id, match.player3Id, match.player4Id].filter(Boolean);
    
    for (const playerId of players) {
      // Get current user stats
      const user = await storage.getUser(playerId);
      if (!user) continue;

      // Update match count
      await storage.updateUser(playerId, {
        totalMatches: (user.totalMatches || 0) + 1,
        lastMatchDate: match.matchDate
      });

      // Calculate and award points based on match result
      const isWinner = (
        (playerId === match.player1Id || playerId === match.player3Id) && match.team1Score > match.team2Score
      ) || (
        (playerId === match.player2Id || playerId === match.player4Id) && match.team2Score > match.team1Score
      );

      if (isWinner) {
        await storage.updateUser(playerId, { 
          matchesWon: (user.matchesWon || 0) + 1
        });
        
        // Award pickle points based on match type
        const points = match.matchType === 'tournament' ? 5 : 3;
        await storage.updateUserPicklePoints(playerId, points);
      } else {
        // Award consolation point for loss
        await storage.updateUserPicklePoints(playerId, 1);
      }
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}

export default router;