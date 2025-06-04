/**
 * Reset mightymax password to fix authentication
 */
import { storage } from './server/storage';
import { hashPassword } from './server/auth';

async function resetMightymaxPassword() {
  try {
    console.log('Resetting mightymax password...');
    
    // Find the mightymax user
    const user = await storage.getUserByUsername('mightymax');
    
    if (!user) {
      console.error('mightymax user not found');
      return;
    }
    
    console.log('Found mightymax user:', user.id);
    
    // Hash the correct password
    const newPassword = '67661189Darren';
    const hashedPassword = await hashPassword(newPassword);
    
    console.log('Password hashed successfully');
    
    // Update the user's password
    await storage.updateUserPassword(user.id, hashedPassword);
    
    console.log('Password updated successfully for mightymax');
    console.log('User can now log in with username: mightymax and the provided password');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetMightymaxPassword();