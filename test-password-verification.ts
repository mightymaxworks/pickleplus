/**
 * Test password verification to debug login issue
 */
import { comparePasswords } from './server/auth';

async function testPasswordVerification() {
  try {
    console.log('Testing password verification...');
    
    // The exact hash from the database
    const storedHash = '$2b$10$zFt0s4sAq2nhXPyiYgy4COeqo0WUA6dY2inX4sThdjAdjYP7izZei';
    const testPassword = '67661189Darren';
    
    console.log('Stored hash:', storedHash);
    console.log('Test password:', testPassword);
    
    const isValid = await comparePasswords(testPassword, storedHash);
    
    console.log('Password verification result:', isValid);
    
    if (!isValid) {
      console.log('Password verification failed - the stored hash does not match the provided password');
      
      // Test with a few common variations
      const variations = [
        '67661189Darren',
        '67661189darren',
        'Darren67661189',
        'darren67661189'
      ];
      
      console.log('Testing password variations...');
      for (const variation of variations) {
        const result = await comparePasswords(variation, storedHash);
        console.log(`"${variation}": ${result}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing password verification:', error);
  }
}

testPasswordVerification();