/**
 * PKL-278651-TEST-XP - Temporary XP Award Test Routes
 * These routes are for testing the XP level calculation fix
 */
import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerTestXpRoutes(app: Express) {
  /**
   * Test endpoint to add XP to a user
   * POST /api/test/add-xp
   * Body: { username: string, xpAmount: number }
   */
  app.post("/api/test/add-xp", async (req: Request, res: Response) => {
    try {
      const { username, xpAmount } = req.body;
      
      if (!username || typeof xpAmount !== 'number') {
        return res.status(400).json({ error: "Invalid request. Provide username and xpAmount." });
      }
      
      // Get user ID from username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: `User ${username} not found` });
      }
      
      console.log(`[TEST-XP] Adding ${xpAmount} XP to user ${username} (ID: ${user.id})`);
      
      // Update XP using our fixed function
      const updatedUser = await storage.updateUserXP(user.id, xpAmount);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user XP" });
      }
      
      return res.json({
        success: true,
        message: `Added ${xpAmount} XP to ${username}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          previousXp: user.xp,
          newXp: updatedUser.xp,
          previousLevel: user.level,
          newLevel: updatedUser.level
        }
      });
    } catch (error) {
      console.error("[TEST-XP] Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}