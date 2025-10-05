import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

const allUsers = await db.select().from(users);

console.log('═'.repeat(80));
console.log('Searching for W9YIN and 403L patterns...\n');

console.log('W9Y prefix:');
const w9yMatches = allUsers.filter(u => u.passportCode?.startsWith('W9Y'));
w9yMatches.forEach(u => console.log(`  ✅ ${u.passportCode} - ${u.username}`));
if (w9yMatches.length === 0) console.log('  ❌ None found');

console.log('\n403 prefix:');
const p403Matches = allUsers.filter(u => u.passportCode?.startsWith('403'));
p403Matches.forEach(u => console.log(`  ✅ ${u.passportCode} - ${u.username}`));
if (p403Matches.length === 0) console.log('  ❌ None found');

console.log('\n4O3 prefix (letter O):');
const p4o3Matches = allUsers.filter(u => u.passportCode?.startsWith('4O3'));
p4o3Matches.forEach(u => console.log(`  ✅ ${u.passportCode} - ${u.username}`));
if (p4o3Matches.length === 0) console.log('  ❌ None found');

console.log('\nW9 prefix (broader):');
const w9Matches = allUsers.filter(u => u.passportCode?.startsWith('W9'));
w9Matches.forEach(u => console.log(`  ✅ ${u.passportCode} - ${u.username}`));

console.log('═'.repeat(80));

process.exit(0);
