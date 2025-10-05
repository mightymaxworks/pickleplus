import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

console.log('Checking for User ID 239 and nearby IDs...\n');

const nearby = await db.select().from(users).where(
  sql`${users.id} >= 235 AND ${users.id} <= 245`
).orderBy(users.id);

console.log('Users with IDs 235-245:');
console.log('─'.repeat(80));
nearby.forEach(u => {
  const highlight = u.id === 239 ? '🎯' : '  ';
  console.log(`${highlight} ID ${u.id}: ${u.passportCode?.padEnd(10)} - ${u.username}`);
});

const has239 = nearby.find(u => u.id === 239);

if (!has239) {
  console.log('\n❌ User ID 239 is missing (gap in sequence - likely deleted or never created)');
  console.log('\n💡 This means PKL-000239 has no corresponding user account.');
} else {
  console.log('\n✅ User ID 239 found!');
}

process.exit(0);
