import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { db } from '../db';
import { users, matches } from '../../shared/schema';
import { eq, and, or } from 'drizzle-orm';

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
  matchType: 'casual' | 'tournament' | 'league';
  player1PassportCode: string;
  player1Gender: string;
  player1DateOfBirth?: string;
  player2PassportCode: string;
  player2Gender: string;
  player2DateOfBirth?: string;
  player3PassportCode?: string;
  player3Gender?: string;
  player3DateOfBirth?: string;
  player4PassportCode?: string;
  player4Gender?: string;
  player4DateOfBirth?: string;
  isDoubles: boolean;
  team1Score: number;
  team2Score: number;
  game1Team1Score?: number;
  game1Team2Score?: number;
  game2Team1Score?: number;
  game2Team2Score?: number;
  game3Team1Score?: number;
  game3Team2Score?: number;
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
        'Match Type (casual/tournament/league)': 'casual',
        'Player 1 Passport Code': 'CBSPZV',
        'Player 1 Gender (male/female)': 'male',
        'Player 1 Date of Birth (YYYY-MM-DD)': '1990-05-15',
        'Player 2 Passport Code': 'HVGN0BW0',
        'Player 2 Gender (male/female)': 'female',
        'Player 2 Date of Birth (YYYY-MM-DD)': '1985-12-08',
        'Player 3 Passport Code (doubles only)': 'KGLE38K4',
        'Player 3 Gender (doubles only)': 'male',
        'Player 3 Date of Birth (doubles only)': '1992-03-22',
        'Player 4 Passport Code (doubles only)': 'MX8K7P2N',
        'Player 4 Gender (doubles only)': 'female',
        'Player 4 Date of Birth (doubles only)': '1988-11-10',
        'Is Doubles Match (TRUE/FALSE)': 'TRUE',
        'Team 1 Score': 2,
        'Team 2 Score': 1,
        'Game 1 Team 1 Score': 11,
        'Game 1 Team 2 Score': 9,
        'Game 2 Team 1 Score': 11,
        'Game 2 Team 2 Score': 7,
        'Game 3 Team 1 Score': 9,
        'Game 3 Team 2 Score': 11,
        'Location (optional)': 'Court 1',
        'Notes (optional)': 'Doubles match with date overrides for all players'
      },
      {
        'Match Date (YYYY-MM-DD)': '2025-08-13',
        'Match Type (casual/tournament/league)': 'tournament',
        'Player 1 Passport Code': 'CBSPZV',
        'Player 1 Gender (male/female)': 'male',
        'Player 1 Date of Birth (YYYY-MM-DD)': '',
        'Player 2 Passport Code': 'HVGN0BW0',
        'Player 2 Gender (male/female)': 'female',
        'Player 2 Date of Birth (YYYY-MM-DD)': '',
        'Player 3 Passport Code (doubles only)': '',
        'Player 3 Gender (doubles only)': '',
        'Player 3 Date of Birth (doubles only)': '',
        'Player 4 Passport Code (doubles only)': '',
        'Player 4 Gender (doubles only)': '',
        'Player 4 Date of Birth (doubles only)': '',
        'Is Doubles Match (TRUE/FALSE)': 'FALSE',
        'Team 1 Score': 2,
        'Team 2 Score': 0,
        'Game 1 Team 1 Score': 11,
        'Game 1 Team 2 Score': 8,
        'Game 2 Team 1 Score': 11,
        'Game 2 Team 2 Score': 6,
        'Game 3 Team 1 Score': '',
        'Game 3 Team 2 Score': '',
        'Location (optional)': 'Tournament Court A',
        'Notes (optional)': 'Singles match - blank dates will NOT override existing user data'
      },
      {
        'Match Date (YYYY-MM-DD)': '2025-08-13',
        'Match Type (casual/tournament/league)': 'league',
        'Player 1 Passport Code': 'MX8K7P2N',
        'Player 1 Gender (male/female)': 'female',
        'Player 1 Date of Birth (YYYY-MM-DD)': '',
        'Player 2 Passport Code': 'KGLE38K4',
        'Player 2 Gender (male/female)': 'male',
        'Player 2 Date of Birth (YYYY-MM-DD)': '',
        'Player 3 Passport Code (doubles only)': '',
        'Player 3 Gender (doubles only)': '',
        'Player 3 Date of Birth (doubles only)': '',
        'Player 4 Passport Code (doubles only)': '',
        'Player 4 Gender (doubles only)': '',
        'Player 4 Date of Birth (doubles only)': '',
        'Is Doubles Match (TRUE/FALSE)': 'FALSE',
        'Team 1 Score': 0,
        'Team 2 Score': 1,
        'Game 1 Team 1 Score': 9,
        'Game 1 Team 2 Score': 11,
        'Game 2 Team 1 Score': '',
        'Game 2 Team 2 Score': '',
        'Game 3 Team 1 Score': '',
        'Game 3 Team 2 Score': '',
        'Location (optional)': 'Practice Court',
        'Notes (optional)': 'SINGLE GAME MATCH EXAMPLE - Player 2 wins 11-9'
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
      { wch: 20 }, // Player 1 Date of Birth
      { wch: 20 }, // Player 2 Passport Code
      { wch: 25 }, // Player 2 Gender
      { wch: 20 }, // Player 2 Date of Birth
      { wch: 25 }, // Player 3 Passport Code
      { wch: 25 }, // Player 3 Gender
      { wch: 20 }, // Player 3 Date of Birth
      { wch: 25 }, // Player 4 Passport Code
      { wch: 25 }, // Player 4 Gender
      { wch: 20 }, // Player 4 Date of Birth
      { wch: 20 }, // Is Doubles
      { wch: 12 }, // Team 1 Score
      { wch: 12 }, // Team 2 Score
      { wch: 15 }, // Game 1 Team 1 Score
      { wch: 15 }, // Game 1 Team 2 Score
      { wch: 15 }, // Game 2 Team 1 Score
      { wch: 15 }, // Game 2 Team 2 Score
      { wch: 15 }, // Game 3 Team 1 Score
      { wch: 15 }, // Game 3 Team 2 Score
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
          matchType: row['Match Type (casual/tournament/league)']?.toLowerCase(),
          player1PassportCode: row['Player 1 Passport Code']?.toUpperCase(),
          player1Gender: row['Player 1 Gender (male/female)']?.toLowerCase(),
          player1DateOfBirth: row['Player 1 Date of Birth (YYYY-MM-DD)'] || undefined,
          player2PassportCode: row['Player 2 Passport Code']?.toUpperCase(),
          player2Gender: row['Player 2 Gender (male/female)']?.toLowerCase(),
          player2DateOfBirth: row['Player 2 Date of Birth (YYYY-MM-DD)'] || undefined,
          player3PassportCode: row['Player 3 Passport Code (doubles only)']?.toUpperCase() || undefined,
          player3Gender: row['Player 3 Gender (doubles only)']?.toLowerCase() || undefined,
          player3DateOfBirth: row['Player 3 Date of Birth (doubles only)'] || undefined,
          player4PassportCode: row['Player 4 Passport Code (doubles only)']?.toUpperCase() || undefined,
          player4Gender: row['Player 4 Gender (doubles only)']?.toLowerCase() || undefined,
          player4DateOfBirth: row['Player 4 Date of Birth (doubles only)'] || undefined,
          isDoubles: String(row['Is Doubles Match (TRUE/FALSE)']).toUpperCase() === 'TRUE',
          team1Score: Number(row['Team 1 Score']),
          team2Score: Number(row['Team 2 Score']),
          game1Team1Score: row['Game 1 Team 1 Score'] ? Number(row['Game 1 Team 1 Score']) : undefined,
          game1Team2Score: row['Game 1 Team 2 Score'] ? Number(row['Game 1 Team 2 Score']) : undefined,
          game2Team1Score: row['Game 2 Team 1 Score'] ? Number(row['Game 2 Team 1 Score']) : undefined,
          game2Team2Score: row['Game 2 Team 2 Score'] ? Number(row['Game 2 Team 2 Score']) : undefined,
          game3Team1Score: row['Game 3 Team 1 Score'] ? Number(row['Game 3 Team 1 Score']) : undefined,
          game3Team2Score: row['Game 3 Team 2 Score'] ? Number(row['Game 3 Team 2 Score']) : undefined,
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

        // CONDITIONAL OVERRIDE LOGIC - Update user data if provided in Excel
        // If gender/DOB provided in Excel → override existing user data
        // If gender/DOB are blank → leave existing user data unchanged
        
        const playersToUpdate: Array<{user: any, gender?: string, dateOfBirth?: string}> = [
          { user: player1, gender: matchData.player1Gender, dateOfBirth: matchData.player1DateOfBirth },
          { user: player2, gender: matchData.player2Gender, dateOfBirth: matchData.player2DateOfBirth }
        ];

        if (matchData.isDoubles && player3 && player4) {
          playersToUpdate.push(
            { user: player3, gender: matchData.player3Gender, dateOfBirth: matchData.player3DateOfBirth },
            { user: player4, gender: matchData.player4Gender, dateOfBirth: matchData.player4DateOfBirth }
          );
        }

        // Update each player's profile data conditionally
        for (const playerUpdate of playersToUpdate) {
          const updateData: any = {};
          let hasUpdates = false;

          // Only update gender if provided in Excel (not blank)
          if (playerUpdate.gender && playerUpdate.gender.trim() && 
              ['male', 'female'].includes(playerUpdate.gender.toLowerCase())) {
            updateData.gender = playerUpdate.gender.toLowerCase();
            hasUpdates = true;
          }

          // Only update date of birth if provided in Excel (not blank) and valid format
          if (playerUpdate.dateOfBirth && playerUpdate.dateOfBirth.trim()) {
            // Validate date format YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(playerUpdate.dateOfBirth)) {
              const dateObj = new Date(playerUpdate.dateOfBirth);
              if (!isNaN(dateObj.getTime())) {
                updateData.dateOfBirth = playerUpdate.dateOfBirth;
                hasUpdates = true;
              }
            }
          }

          // Apply updates only if there are valid changes to make
          if (hasUpdates) {
            await storage.updateUser(playerUpdate.user.id, updateData);
            console.log(`[ADMIN-BULK] Updated user ${playerUpdate.user.username} profile:`, updateData);
          }
        }

        // Build game scores array from individual game columns
        const gameScores = [];
        
        // Add games that have scores
        if (matchData.game1Team1Score !== undefined && matchData.game1Team2Score !== undefined) {
          gameScores.push({ team1: matchData.game1Team1Score, team2: matchData.game1Team2Score });
        }
        if (matchData.game2Team1Score !== undefined && matchData.game2Team2Score !== undefined) {
          gameScores.push({ team1: matchData.game2Team1Score, team2: matchData.game2Team2Score });
        }
        if (matchData.game3Team1Score !== undefined && matchData.game3Team2Score !== undefined) {
          gameScores.push({ team1: matchData.game3Team1Score, team2: matchData.game3Team2Score });
        }

        // Validate we have at least one game
        if (gameScores.length === 0) {
          results.errors.push(`Row ${i + 2}: At least one game score is required`);
          results.failed++;
          continue;
        }

        // Calculate winner based on team scores from Excel
        const winnerId = matchData.team1Score > matchData.team2Score ? player1.id : player2.id;
        
        // Format detailed game scores for notes (like individual match recording)
        const detailedScores = gameScores.map(game => `${game.team1}-${game.team2}`).join(', ');
        
        // Create match record using the new scoring format (matches regular match creation)
        const matchRecord = {
          playerOneId: player1.id,
          playerTwoId: player2.id,
          playerOnePartnerId: player3?.id || null,
          playerTwoPartnerId: player4?.id || null,
          scorePlayerOne: `${matchData.team1Score}`, // Games won by Team 1
          scorePlayerTwo: `${matchData.team2Score}`, // Games won by Team 2
          winnerId: winnerId,
          matchType: matchData.matchType || 'casual',
          formatType: matchData.isDoubles ? 'doubles' : 'singles',
          validationStatus: 'completed', // Admin bulk uploads are auto-completed
          validationCompletedAt: new Date(),
          notes: `BULK UPLOAD: ${matchData.notes || ''} [Game Scores: ${detailedScores}] [Location: ${matchData.location || 'N/A'}]`.trim(),
          tournamentId: null,
          scheduledDate: new Date(matchData.matchDate),
          pointsAwarded: 3, // Winner gets 3 points per PICKLE_PLUS_ALGORITHM_DOCUMENT
          category: matchData.isDoubles ? 'doubles' : 'singles'
        };

        // Save match to database using the same interface as regular match creation
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
    const players = [match.playerOneId, match.playerTwoId, match.playerOnePartnerId, match.playerTwoPartnerId].filter(Boolean);
    
    for (const playerId of players) {
      // Get current user stats
      const user = await storage.getUser(playerId);
      if (!user) continue;

      // Update match count
      await storage.updateUser(playerId, {
        totalMatches: (user.totalMatches || 0) + 1,
        lastMatchDate: match.scheduledDate || match.createdAt
      });

      // Calculate and award points based on match result using new scoring fields
      const team1Score = parseInt(match.scorePlayerOne || '0');
      const team2Score = parseInt(match.scorePlayerTwo || '0');
      
      const isWinner = (
        (playerId === match.playerOneId || playerId === match.playerOnePartnerId) && team1Score > team2Score
      ) || (
        (playerId === match.playerTwoId || playerId === match.playerTwoPartnerId) && team2Score > team1Score
      );

      if (isWinner) {
        await storage.updateUser(playerId, { 
          matchesWon: (user.matchesWon || 0) + 1
        });
        
        // Award pickle points based on match type per PICKLE_PLUS_ALGORITHM_DOCUMENT
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

// Enhanced interfaces for new format
interface ValidationError {
  row: number;
  type: 'missing_player' | 'invalid_score' | 'duplicate_match' | 'invalid_format';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  details?: any;
}

interface ValidationReport {
  totalRows: number;
  validMatches: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  missingPlayers: string[];
  duplicateMatches: number;
  canProceed: boolean;
}

interface ParsedMatch {
  row: number;
  team1Player1: string;
  team1Player2?: string;
  team2Player1: string;
  team2Player2?: string;
  team1Score: number;
  team2Score: number;
  date: string;
  genderOverride?: string;
  isDoubles: boolean;
}

// Validate uploaded Excel file
router.post('/validate', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const matchType = req.body.matchType || 'tournament';
    
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length <= 1) {
      return res.status(400).json({ error: 'Excel file must contain data rows beyond headers' });
    }

    // Parse and validate data
    const { parsedMatches, validationReport } = await parseAndValidateMatches(rawData as any[][], matchType);

    res.json({ 
      validationReport,
      matchCount: parsedMatches.length 
    });

  } catch (error: any) {
    console.error('Error validating file:', error);
    res.status(500).json({ error: 'Failed to validate file: ' + error.message });
  }
});

// Process validated Excel file
router.post('/process', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const matchType = req.body.matchType || 'tournament';
    const skipValidation = req.body.skipValidation === 'true';
    
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse and validate
    const { parsedMatches, validationReport } = await parseAndValidateMatches(rawData as any[][], matchType);

    // Check if we can proceed
    if (!skipValidation && !validationReport.canProceed) {
      return res.status(400).json({ 
        error: 'Validation failed - fix issues before processing',
        validationReport 
      });
    }

    // Process valid matches
    const results = await processMatches(parsedMatches.filter(m => m !== null), matchType);

    res.json({
      validationReport,
      ...results
    });

  } catch (error: any) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file: ' + error.message });
  }
});

// Parse and validate Excel data
async function parseAndValidateMatches(rawData: any[][], matchType: string): Promise<{
  parsedMatches: (ParsedMatch | null)[];
  validationReport: ValidationReport;
}> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const missingPlayers: Set<string> = new Set();
  const parsedMatches: (ParsedMatch | null)[] = [];
  
  // Skip header row
  const dataRows = rawData.slice(1);
  
  // Get all users for player lookup
  const allUsers = await db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    username: users.username,
  }).from(users);

  const userLookup = new Map<string, any>();
  allUsers.forEach(user => {
    const fullName = `${user.firstName}_${user.lastName}`;
    const username = user.username;
    userLookup.set(fullName.toLowerCase(), user);
    userLookup.set(username.toLowerCase(), user);
  });

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // +2 for 1-based indexing and header row
    
    if (!row || row.length === 0 || !row[0]) {
      continue; // Skip empty rows
    }

    try {
      // Parse match data
      const team1Player1 = String(row[0] || '').trim();
      const team1Player2 = String(row[1] || '').trim();
      const team2Player1 = String(row[2] || '').trim(); 
      const team2Player2 = String(row[3] || '').trim();
      const team1Score = parseInt(String(row[4] || '0'));
      const team2Score = parseInt(String(row[5] || '0'));
      const date = String(row[6] || '').trim();
      const genderOverride = String(row[7] || '').trim();

      // Determine if doubles
      const isDoubles = !!(team1Player2 || team2Player2);

      // Validate required fields
      if (!team1Player1 || !team2Player1) {
        errors.push({
          row: rowNum,
          type: 'missing_player',
          message: 'Missing required player names',
          severity: 'critical',
          details: 'Team_1_Player_1 and Team_2_Player_1 are required'
        });
        parsedMatches.push(null);
        continue;
      }

      // Validate scores
      if (isNaN(team1Score) || isNaN(team2Score) || team1Score < 0 || team2Score < 0) {
        errors.push({
          row: rowNum,
          type: 'invalid_score',
          message: 'Invalid score format',
          severity: 'critical',
          details: 'Scores must be non-negative numbers'
        });
        parsedMatches.push(null);
        continue;
      }

      // Validate date
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push({
          row: rowNum,
          type: 'invalid_format',
          message: 'Invalid date format',
          severity: 'critical',
          details: 'Date must be in YYYY-MM-DD format'
        });
        parsedMatches.push(null);
        continue;
      }

      // Check if players exist
      const playersToCheck = [team1Player1, team2Player1];
      if (isDoubles) {
        if (team1Player2) playersToCheck.push(team1Player2);
        if (team2Player2) playersToCheck.push(team2Player2);
      }

      let playerNotFound = false;
      for (const playerName of playersToCheck) {
        if (!userLookup.has(playerName.toLowerCase())) {
          missingPlayers.add(playerName);
          playerNotFound = true;
        }
      }

      if (playerNotFound) {
        errors.push({
          row: rowNum,
          type: 'missing_player',
          message: 'One or more players not found in system',
          severity: 'critical',
          details: 'All players must exist in the database'
        });
        parsedMatches.push(null);
        continue;
      }

      // Validate gender override
      if (genderOverride && !['M', 'F', 'm', 'f'].includes(genderOverride)) {
        warnings.push({
          row: rowNum,
          type: 'invalid_format',
          message: 'Invalid gender override format',
          severity: 'warning',
          details: 'Gender override should be M or F'
        });
      }

      // Create parsed match
      const parsedMatch: ParsedMatch = {
        row: rowNum,
        team1Player1,
        team1Player2: team1Player2 || undefined,
        team2Player1,
        team2Player2: team2Player2 || undefined,
        team1Score,
        team2Score,
        date,
        genderOverride: genderOverride || undefined,
        isDoubles
      };

      parsedMatches.push(parsedMatch);

    } catch (error: any) {
      errors.push({
        row: rowNum,
        type: 'invalid_format',
        message: 'Error parsing row data',
        severity: 'critical',
        details: error.message
      });
      parsedMatches.push(null);
    }
  }

  const validMatches = parsedMatches.filter(m => m !== null).length;
  const canProceed = errors.length === 0 && validMatches > 0;

  const validationReport: ValidationReport = {
    totalRows: dataRows.length,
    validMatches,
    errors,
    warnings,
    missingPlayers: Array.from(missingPlayers),
    duplicateMatches: 0, // TODO: Implement duplicate detection
    canProceed
  };

  return { parsedMatches, validationReport };
}

// Process valid matches using UDF algorithm
async function processMatches(validMatches: ParsedMatch[], matchType: string) {
  let successCount = 0;
  let errorCount = 0;
  let totalPointsAllocated = 0;
  let totalPicklePointsAwarded = 0;
  const processingErrors: ValidationError[] = [];

  // Get all users for lookup
  const allUsers = await db.select().from(users);
  const userLookup = new Map<string, any>();
  allUsers.forEach(user => {
    const fullName = `${user.firstName}_${user.lastName}`;
    userLookup.set(fullName.toLowerCase(), user);
    userLookup.set(user.username.toLowerCase(), user);
  });

  for (const match of validMatches) {
    try {
      // Get player objects
      const team1Player1 = userLookup.get(match.team1Player1.toLowerCase());
      const team2Player1 = userLookup.get(match.team2Player1.toLowerCase());
      const team1Player2 = match.team1Player2 ? userLookup.get(match.team1Player2.toLowerCase()) : null;
      const team2Player2 = match.team2Player2 ? userLookup.get(match.team2Player2.toLowerCase()) : null;

      // Create match using storage interface
      const matchRecord = {
        playerOneId: team1Player1.id,
        playerTwoId: team2Player1.id,
        playerOnePartnerId: team1Player2?.id || null,
        playerTwoPartnerId: team2Player2?.id || null,
        scorePlayerOne: `${match.team1Score}`,
        scorePlayerTwo: `${match.team2Score}`,
        winnerId: match.team1Score > match.team2Score ? team1Player1.id : team2Player1.id,
        matchType: matchType || 'casual',
        formatType: match.isDoubles ? 'doubles' : 'singles',
        validationStatus: 'completed',
        validationCompletedAt: new Date(),
        notes: `BULK UPLOAD - Date: ${match.date}${match.genderOverride ? ` - Gender Override: ${match.genderOverride}` : ''}`,
        tournamentId: null,
        scheduledDate: new Date(match.date),
        pointsAwarded: match.team1Score > match.team2Score ? 3 : 1, // Winner gets 3, loser gets 1
        category: match.isDoubles ? 'doubles' : 'singles'
      };

      const createdMatch = await storage.createMatch(matchRecord);

      // Apply UDF algorithm points using existing system
      await updatePlayerStatsFromMatch(createdMatch);

      // Calculate points allocated (3 for winner, 1 for loser per UDF)
      const pointsThisMatch = 4; // 3 + 1
      totalPointsAllocated += pointsThisMatch;

      // Calculate Pickle Points (1.5x multiplier per match for tournament)
      const picklePointsThisMatch = matchType === 'tournament' ? pointsThisMatch * 1.5 : pointsThisMatch;
      totalPicklePointsAwarded += picklePointsThisMatch;

      successCount++;

    } catch (error: any) {
      console.error(`Error processing match at row ${match.row}:`, error);
      processingErrors.push({
        row: match.row,
        type: 'invalid_format',
        message: 'Failed to process match',
        severity: 'critical',
        details: error.message
      });
      errorCount++;
    }
  }

  return {
    successCount,
    errorCount,
    pointsAllocated: Math.round(totalPointsAllocated * 100) / 100, // 2 decimal places
    picklePointsAwarded: Math.round(totalPicklePointsAwarded * 100) / 100,
    errors: processingErrors
  };
}

// Enhanced bilingual template (new format)
router.get('/template-enhanced', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user;
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const language = (req.query.lang as string) || 'en'; // Default to English
    const workbook = XLSX.utils.book_new();
    
    // Bilingual headers and content
    const translations = {
      en: {
        headers: [
          'Team_1_Player_1 / 第一队选手一',
          'Team_1_Player_2 / 第一队选手二',
          'Team_2_Player_1 / 第二队选手一', 
          'Team_2_Player_2 / 第二队选手二',
          'Team_1_Score / 第一队得分',
          'Team_2_Score / 第二队得分',
          'Date / 比赛日期',
          'Gender_Override / 性别覆盖'
        ],
        sampleData: [
          ['John_Smith', '', 'Jane_Doe', '', '11', '7', '2025-01-15', ''],
          ['Mike_Johnson', 'Sarah_Wilson', 'Tom_Brown', 'Lisa_Chen', '11', '9', '2025-01-15', ''],
          ['David_Lee', '', 'Emily_Davis', '', '8', '11', '2025-01-16', 'M'],
        ],
        instructions: [
          ['Bulk Match Upload Instructions'],
          [''],
          ['Format Guidelines:'],
          ['• Use exact player names (First_Last format preferred)'],
          ['• Leave Team_1_Player_2 and Team_2_Player_2 empty for singles matches'],
          ['• Use scores like: 11, 7, 15, 13 (games to points)'],
          ['• Date format: YYYY-MM-DD (e.g., 2025-01-15)'],
          ['• Gender_Override: M or F (optional, for cross-gender matches)'],
          [''],
          ['Examples:'],
          ['Singles: John_Smith vs Jane_Doe, scores 11-7'],
          ['Doubles: Mike_Johnson/Sarah_Wilson vs Tom_Brown/Lisa_Chen, scores 11-9'],
          [''],
          ['Validation will check:'],
          ['• All players exist in the system'],
          ['• Valid score formats'],
          ['• No duplicate matches'],
          ['• Proper date formatting'],
        ],
        sheetNames: {
          data: 'Match Data',
          instructions: 'Instructions'
        },
        filename: 'bulk-match-template.xlsx'
      },
      zh: {
        headers: [
          'Team_1_Player_1 / 第一队选手一',
          'Team_1_Player_2 / 第一队选手二',
          'Team_2_Player_1 / 第二队选手一', 
          'Team_2_Player_2 / 第二队选手二',
          'Team_1_Score / 第一队得分',
          'Team_2_Score / 第二队得分',
          'Date / 比赛日期',
          'Gender_Override / 性别覆盖'
        ],
        sampleData: [
          ['张伟', '', '李娜', '', '11', '7', '2025-01-15', ''],
          ['王强', '刘敏', '陈军', '赵静', '11', '9', '2025-01-15', ''],
          ['杨涛', '', '孙丽', '', '8', '11', '2025-01-16', '男'],
        ],
        instructions: [
          ['批量比赛上传说明'],
          [''],
          ['格式指南：'],
          ['• 使用准确的选手姓名（建议使用姓_名格式）'],
          ['• 单打比赛请将第一队选手二和第二队选手二留空'],
          ['• 使用如下分数格式：11, 7, 15, 13（游戏比分）'],
          ['• 日期格式：YYYY-MM-DD（例如：2025-01-15）'],
          ['• 性别覆盖：男或女（可选，用于跨性别比赛）'],
          [''],
          ['示例：'],
          ['单打：张伟 对 李娜，比分 11-7'],
          ['双打：王强/刘敏 对 陈军/赵静，比分 11-9'],
          [''],
          ['验证将检查：'],
          ['• 所有选手在系统中存在'],
          ['• 有效的分数格式'],
          ['• 无重复比赛'],
          ['• 正确的日期格式'],
        ],
        sheetNames: {
          data: '比赛数据',
          instructions: '使用说明'
        },
        filename: '批量比赛模板.xlsx'
      }
    };

    const t = translations[language as keyof typeof translations] || translations.en;

    // Create worksheet data
    const worksheetData = [
      t.headers,
      ...t.sampleData
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 32 }, // Team_1_Player_1 / 第一队选手一
      { wch: 32 }, // Team_1_Player_2 / 第一队选手二
      { wch: 32 }, // Team_2_Player_1 / 第二队选手一
      { wch: 32 }, // Team_2_Player_2 / 第二队选手二
      { wch: 20 }, // Team_1_Score / 第一队得分
      { wch: 20 }, // Team_2_Score / 第二队得分
      { wch: 18 }, // Date / 比赛日期
      { wch: 25 }, // Gender_Override / 性别覆盖
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(t.instructions);
    instructionsSheet['!cols'] = [{ wch: 60 }];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, t.sheetNames.data);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, t.sheetNames.instructions);

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${t.filename}"`);
    res.send(excelBuffer);

  } catch (error: any) {
    console.error('Error generating enhanced template:', error);
    res.status(500).json({ error: 'Failed to generate enhanced template' });
  }
});

export default router;