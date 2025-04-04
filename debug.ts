import { client, db } from './server/db';
import { storage } from './server/storage';

async function debug() {
  try {
    // Test redemption code retrieval
    const code = await storage.getRedemptionCodeByCode('DINK2025');
    console.log('Redemption code found:', code);
    
    if (code) {
      // Test incrementing counter
      const updated = await storage.incrementRedemptionCodeCounter(code.id);
      console.log('Updated code:', updated);
      
      // Test user redemption
      try {
        // Assuming userId 1 exists
        const redeemed = await storage.redeemCode({
          userId: 1,
          codeId: code.id
        });
        console.log('Redemption record:', redeemed);
      } catch (err) {
        console.error('Error redeeming code:', err);
      }
      
      // Test updating user XP
      try {
        const user = await storage.getUser(1);
        console.log('Current user state:', user);
        
        if (user) {
          const updatedUser = await storage.updateUserXP(1, code.xpReward);
          console.log('Updated user XP:', updatedUser);
        }
      } catch (err) {
        console.error('Error updating user XP:', err);
      }
    }
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    await client.end();
  }
}

debug();
