import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq, inArray } from 'drizzle-orm';

console.log('═'.repeat(120));
console.log('🔍 SEARCHING FOR PKL PLAYERS BY DATABASE ID');
console.log('═'.repeat(120));

const targetIds = [238, 239, 249];

console.log('\n📊 Looking up database records for IDs: 238, 239, 249\n');

const foundUsers = await db.select().from(users).where(inArray(users.id, targetIds));

console.log('─'.repeat(120));
console.log('RESULTS:');
console.log('─'.repeat(120));

if (foundUsers.length === 0) {
  console.log('❌ No users found with these IDs');
} else {
  foundUsers.forEach(user => {
    console.log(`\n✅ User ID ${user.id}:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Passport Code: ${user.passportCode || 'NOT SET'}`);
    console.log(`   Email: ${user.email || 'NOT SET'}`);
    console.log(`   Gender: ${user.gender || 'NOT SET'}`);
    console.log(`   Ranking Points: ${user.rankingPoints || 0} RP`);
    console.log(`   Pickle Points: ${user.picklePoints || 0} PP`);
    console.log(`   Created: ${user.createdAt}`);
  });
}

console.log('\n\n' + '─'.repeat(120));
console.log('PKL CODE MAPPING:');
console.log('─'.repeat(120));

const mapping: Record<string, string | null> = {};

targetIds.forEach(id => {
  const user = foundUsers.find(u => u.id === id);
  const pklCode = `PKL-${String(id).padStart(6, '0')}`;
  
  if (user) {
    mapping[pklCode] = user.passportCode || null;
    console.log(`\n${pklCode} → ${user.passportCode || 'NO PASSPORT CODE'} (${user.username})`);
  } else {
    mapping[pklCode] = null;
    console.log(`\n${pklCode} → USER NOT FOUND IN DATABASE`);
  }
});

console.log('\n\n' + '═'.repeat(120));
console.log('📋 FINAL CORRECTION MAP:');
console.log('═'.repeat(120));

Object.entries(mapping).forEach(([pkl, passport]) => {
  if (passport) {
    console.log(`   ${pkl.padEnd(15)} → ${passport}`);
  } else {
    console.log(`   ${pkl.padEnd(15)} → ⚠️  NOT FOUND`);
  }
});

console.log('\n' + '═'.repeat(120));
console.log('✅ Lookup complete!');
console.log('═'.repeat(120));

process.exit(0);
