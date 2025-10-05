import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { like } from 'drizzle-orm';

const searchPatterns = [
  { pattern: 'A4%DAZ', description: 'Looking for A4?DAZ (could be A40DAZ, A4QDAZ, etc.)' },
  { pattern: '5XKD0%', description: 'Looking for 5XKD0? (could be 5XKD06, 5XKD0G, etc.)' },
  { pattern: '2L8TU%', description: 'Looking for 2L8TU? (could be 2L8TU0, 2L8TUQ, etc.)' },
  { pattern: 'JN11%L', description: 'Looking for JN11?L (could be JN110L, JN11QL, etc.)' },
  { pattern: 'W9YIN%', description: 'Looking for W9YIN? (could be W9YINQ, W9YIN0, etc.)' },
  { pattern: '403%L6', description: 'Looking for 403?L6 (could be 4030L6, 403QL6, etc.)' }
];

console.log('═'.repeat(120));
console.log('🔍 SEARCHING DATABASE FOR ACTUAL PASSPORT CODES');
console.log('═'.repeat(120));
console.log('\n📊 Checking what the actual codes are in the database...\n');

for (const { pattern, description } of searchPatterns) {
  console.log(`\n${description}`);
  console.log('─'.repeat(80));
  
  const results = await db.select().from(users).where(like(users.passportCode, pattern)).limit(10);
  
  if (results.length > 0) {
    results.forEach(u => {
      console.log(`   ✅ Found: ${u.passportCode} - ${u.username} (${u.gender || 'unknown'})`);
      console.log(`      RP: ${u.rankingPoints || 0} | PP: ${u.picklePoints || 0} | ID: ${u.id}`);
    });
  } else {
    console.log('   ❌ No matches found in database');
  }
}

console.log('\n\n' + '═'.repeat(120));
console.log('✅ Search complete!');
console.log('═'.repeat(120));

process.exit(0);
