/**
 * Debug login issue by testing password verification
 */
import bcryptjs from "bcryptjs";
import { storage } from './server/storage';

async function debugLoginIssue() {
  try {
    console.log('=== Login Debug Analysis ===');
    
    // Get the user from database
    const user = await storage.getUserByUsername('mightymax');
    if (!user) {
      console.log('ERROR: User not found in database');
      return;
    }
    
    console.log('User found:', user.username);
    console.log('Stored password hash:', user.password);
    
    // Test the password that should work
    const testPassword = '67661189Darren';
    console.log('Testing password:', testPassword);
    
    // Test bcrypt comparison directly
    const isValidBcrypt = await bcryptjs.compare(testPassword, user.password);
    console.log('Direct bcrypt comparison result:', isValidBcrypt);
    
    // Test if the hash was created with the wrong password
    console.log('\n=== Testing common password variations ===');
    const variations = [
      '67661189Darren',
      'darren67661189',
      'Darren67661189',
      'password',
      'admin',
      'mightymax',
      'test123',
      '12345678'
    ];
    
    for (const variation of variations) {
      const result = await bcryptjs.compare(variation, user.password);
      console.log(`Password "${variation}": ${result ? 'MATCH' : 'no match'}`);
      if (result) {
        console.log(`*** FOUND WORKING PASSWORD: "${variation}" ***`);
        break;
      }
    }
    
    // Create a fresh hash with the correct password
    console.log('\n=== Creating fresh hash ===');
    const freshHash = await bcryptjs.hash('67661189Darren', 12);
    console.log('Fresh hash for "67661189Darren":', freshHash);
    
    const freshTest = await bcryptjs.compare('67661189Darren', freshHash);
    console.log('Fresh hash test result:', freshTest);
    
  } catch (error) {
    console.error('Error in debug:', error);
  }
}

debugLoginIssue();