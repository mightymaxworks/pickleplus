import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

// Test function to check if rating fields exist
async function testRatingFields() {
  try {
    // Get a user from the database
    const [user] = await db.select().from(users).where(eq(users.id, 1));
    
    if (!user) {
      console.log('No user found with ID 1');
      return;
    }
    
    console.log('Retrieved user:', user.username);
    
    // Check if fields exist on the User type
    console.log('IFP Rating Field:', user.ifpRating !== undefined ? 'exists' : 'missing');
    console.log('IFP Profile URL Field:', user.ifpProfileUrl !== undefined ? 'exists' : 'missing');
    console.log('IPTPA Rating Field:', user.iptpaRating !== undefined ? 'exists' : 'missing');
    console.log('IPTPA Profile URL Field:', user.iptpaProfileUrl !== undefined ? 'exists' : 'missing');
    
    // Update the user with test data
    const result = await db.update(users)
      .set({
        ifpRating: '3.5',
        ifpProfileUrl: 'https://ifpickleball.org/profile/test',
        iptpaRating: '4.0',
        iptpaProfileUrl: 'https://iptpa.com/profile/test'
      })
      .where(eq(users.id, 1))
      .returning();
      
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error testing rating fields:', error);
  }
}

// Run the test
testRatingFields();