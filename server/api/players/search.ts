import { Request, Response } from 'express';
import { storage } from '../../storage';

export async function searchPlayers(req: Request, res: Response) {
  try {
    const { q } = req.query;
    
    console.log('[API SEARCH DEBUG] Raw query param:', q);
    console.log('[API SEARCH DEBUG] Query type:', typeof q);
    console.log('[API SEARCH DEBUG] Query bytes:', q ? Buffer.from(q as string, 'utf8') : 'null');
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({ users: [] });
    }
    
    const searchTerm = q.trim();
    console.log('[API SEARCH DEBUG] Final search term:', searchTerm);
    console.log('[API SEARCH DEBUG] Search term bytes:', Buffer.from(searchTerm, 'utf8'));
    
    // Enhanced search: username, display name, first name, last name, and passport code
    console.log('[API SEARCH DEBUG] About to call storage.searchPlayersByMultipleFields');
    const users = await storage.searchPlayersByMultipleFields(searchTerm);
    console.log('[API SEARCH DEBUG] Storage returned', users.length, 'users');
    
    // Format the response to match the expected format
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarInitials: user.displayName?.substring(0, 2) || 
                     `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 
                     user.username.substring(0, 2),
      passportId: user.passportCode,
      currentRating: user.rankingPoints || 0,
      gender: user.gender
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Player search error:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
}