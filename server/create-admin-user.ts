// Create admin user for testing authentication
import { db } from './db';
import { users } from '../shared/schema';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('[AUTH FIX] Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@pickle.com',
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin User',
      avatarInitials: 'AU',
      passportCode: 'PKL-ADMIN',
      role: 'super_admin',
      duprRating: '5.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: users.username,
      set: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    }).returning();
    
    console.log('✅ Admin user created/updated successfully');
    console.log('📧 Email: admin@pickle.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('🛡️ Role: super_admin');
    
    return adminUser[0];
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

export { createAdminUser };

// If run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser()
    .then(() => {
      console.log('\n🎉 Admin user setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Admin user setup failed:', error);
      process.exit(1);
    });
}