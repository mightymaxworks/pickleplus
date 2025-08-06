/**
 * Master Admin Setup Script
 * Creates or updates mightymax as the master administrator
 */

import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function setupMasterAdmin() {
  console.log('🔧 Setting up master admin: mightymax...');
  
  const username = 'mightymax';
  const email = 'mightymax@pickleplus.com';
  const password = '67661189abc';
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      console.log('📝 Updating existing mightymax user...');
      
      await db
        .update(users)
        .set({
          password: hashedPassword,
          isAdmin: true,
          email: email,
          updatedAt: new Date()
        })
        .where(eq(users.username, username));
      
      console.log('✅ Master admin mightymax updated successfully');
      console.log(`   - Username: ${username}`);
      console.log(`   - Email: ${email}`);
      console.log('   - Admin privileges: ENABLED');
      
    } else {
      // Create new user
      console.log('➕ Creating new mightymax master admin...');
      
      const [newUser] = await db
        .insert(users)
        .values({
          username: username,
          email: email,
          password: hashedPassword,
          firstName: 'Mighty',
          lastName: 'Max',
          isAdmin: true,
          picklePoints: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log('✅ Master admin mightymax created successfully');
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Username: ${username}`);
      console.log(`   - Email: ${email}`);
      console.log('   - Admin privileges: ENABLED');
    }
    
    // Verify the admin user
    const verifyUser = await db
      .select({ id: users.id, username: users.username, email: users.email, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.username, username));
    
    if (verifyUser.length > 0 && verifyUser[0].isAdmin) {
      console.log('🔒 Master admin verification: SUCCESS');
      console.log('🎉 mightymax is ready for production deployment');
    } else {
      throw new Error('Master admin verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error setting up master admin:', error);
    throw error;
  }
}

// Run the setup
setupMasterAdmin()
  .then(() => {
    console.log('\n🚀 Master admin setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Master admin setup failed:', error);
    process.exit(1);
  });

export { setupMasterAdmin };