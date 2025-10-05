import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

const allUsers = await db.select({
  passportCode: users.passportCode,
  username: users.username,
  gender: users.gender,
  rankingPoints: users.rankingPoints
}).from(users);

console.log('═'.repeat(120));
console.log('🔍 SEARCHING FOR REMAINING 3 MISSING CODES');
console.log('═'.repeat(120));

const patterns = [
  { search: ['5XKD', 'XKD', 'Monica'], desc: 'Pattern for 5XKD06/5XKD0G' },
  { search: ['W9YI', 'YIN', '9YIN'], desc: 'Pattern for W9YINQ/W9YIN0' },
  { search: ['403', '03L', '3QL'], desc: 'Pattern for 4030L6/403QL6' }
];

patterns.forEach(({search, desc}) => {
  console.log(`\n📋 ${desc}`);
  console.log('─'.repeat(80));
  
  const matches = allUsers.filter(u => 
    search.some(s => u.passportCode?.includes(s) || u.username?.toLowerCase().includes(s.toLowerCase()))
  );
  
  if (matches.length > 0) {
    console.log(`   Found ${matches.length} potential matches:`);
    matches.slice(0, 10).forEach(m => {
      console.log(`   ✅ ${m.passportCode} - ${m.username} (${m.gender || 'unknown'}) - ${m.rankingPoints || 0} RP`);
    });
  } else {
    console.log('   ❌ No matches found');
  }
});

console.log('\n\n' + '═'.repeat(120));
console.log('✅ Search complete!');
console.log('═'.repeat(120));

process.exit(0);
