/**
 * PKL-278651-PLAYER-ADMIN-001 - Player Management Admin Routes
 * Backend API routes for comprehensive player management
 */
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all players with admin details
router.get('/players', async (req, res) => {
  try {
    const players = await storage.getAllPlayersForAdmin();
    res.json(players);
  } catch (error) {
    console.error('Error fetching players for admin:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get specific player details
router.get('/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const player = await storage.getPlayerDetailsForAdmin(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player);
  } catch (error) {
    console.error('Error fetching player details:', error);
    res.status(500).json({ error: 'Failed to fetch player details' });
  }
});

// Update player information
router.patch('/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedPlayer = await storage.updatePlayerForAdmin(playerId, updateData);
    
    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Suspend player account
router.post('/players/:id/suspend', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const result = await storage.suspendPlayer(playerId, reason);
    
    if (!result) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, message: 'Player suspended successfully' });
  } catch (error) {
    console.error('Error suspending player:', error);
    res.status(500).json({ error: 'Failed to suspend player' });
  }
});

// Activate player account
router.post('/players/:id/activate', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    const result = await storage.activatePlayer(playerId);
    
    if (!result) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, message: 'Player activated successfully' });
  } catch (error) {
    console.error('Error activating player:', error);
    res.status(500).json({ error: 'Failed to activate player' });
  }
});

// Ban player account
router.post('/players/:id/ban', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const result = await storage.banPlayer(playerId, reason);
    
    if (!result) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, message: 'Player banned successfully' });
  } catch (error) {
    console.error('Error banning player:', error);
    res.status(500).json({ error: 'Failed to ban player' });
  }
});

// Update player notes
router.patch('/players/:id/notes', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { notes } = req.body;
    
    const result = await storage.updatePlayerNotes(playerId, notes);
    
    if (!result) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json({ success: true, message: 'Player notes updated successfully' });
  } catch (error) {
    console.error('Error updating player notes:', error);
    res.status(500).json({ error: 'Failed to update player notes' });
  }
});

// Get player activity history
router.get('/players/:id/activity', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { limit = 50 } = req.query;
    
    const activity = await storage.getPlayerActivity(playerId, parseInt(limit as string));
    
    res.json(activity);
  } catch (error) {
    console.error('Error fetching player activity:', error);
    res.status(500).json({ error: 'Failed to fetch player activity' });
  }
});

// Export players data
router.get('/players/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const players = await storage.getAllPlayersForAdmin();
    
    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'ID,Username,Email,Name,Status,Membership,Skill Level,DUPR Rating,PCP Rating,Matches,Win Rate,Joined Date\n';
      const csvData = players.map((player: any) => 
        `${player.id},"${player.username}","${player.email}","${player.displayName || ''}","${player.status}","${player.membershipType}","${player.skillLevel}","${player.duprRating || ''}","${player.pcpRating || ''}","${player.totalMatches}","${player.winRate}","${new Date(player.joinedDate).toLocaleDateString()}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="players_export.csv"');
      res.send(csvHeader + csvData);
    } else {
      res.json(players);
    }
  } catch (error) {
    console.error('Error exporting players:', error);
    res.status(500).json({ error: 'Failed to export players' });
  }
});

// Get player statistics summary
router.get('/players/stats', async (req, res) => {
  try {
    const stats = await storage.getPlayerStatsSummary();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
});

export default router;