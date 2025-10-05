import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

const missingCodes = [
  'FOGBAM', 'PKL-000238', 'PKL-000239', 'VOR7AU', 'A40DAZ', 
  '5XKD06', 'PZGEOT', '2L8TU0', 'JN110L', 'PKL-000249', 
  'W9YINQ', '4030L6', 'BCIOVC'
];

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function similarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toUpperCase(), str2.toUpperCase());
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - distance / maxLength;
}

console.log('═'.repeat(120));
console.log('🔍 FINDING SIMILAR PASSPORT CODES IN DATABASE');
console.log('═'.repeat(120));
console.log('\n📊 Searching for matches for 13 missing passport codes...\n');

const allUsers = await db.select().from(users);

console.log(`✅ Database contains ${allUsers.length} registered users\n`);
console.log('═'.repeat(120));

for (const missingCode of missingCodes) {
  console.log(`\n🔎 Missing Code: ${missingCode}`);
  console.log('─'.repeat(120));
  
  const matches = allUsers
    .map(user => ({
      user,
      similarity: similarity(missingCode, user.passportCode || ''),
      distance: levenshteinDistance(missingCode, user.passportCode || '')
    }))
    .filter(m => m.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
  
  if (matches.length === 0) {
    console.log('   ❌ No similar codes found (may be a completely new player)');
    continue;
  }
  
  console.log('   Top Matches:');
  matches.forEach((match, index) => {
    const percentage = (match.similarity * 100).toFixed(1);
    const badge = match.similarity > 0.8 ? '🎯' : match.similarity > 0.6 ? '✨' : '💡';
    
    console.log(`   ${badge} #${index + 1} [${percentage}% match] ${match.user.passportCode} - ${match.user.username}`);
    console.log(`      User ID: ${match.user.id} | Gender: ${match.user.gender || 'Not specified'} | Email: ${match.user.email || 'Not set'}`);
    console.log(`      Current RP: ${match.user.rankingPoints || 0} | Current PP: ${match.user.picklePoints || 0}`);
    console.log(`      Edit distance: ${match.distance} characters different`);
  });
}

console.log('\n\n' + '═'.repeat(120));
console.log('📋 PATTERN ANALYSIS');
console.log('═'.repeat(120));

const pklPattern = missingCodes.filter(code => code.startsWith('PKL-'));
const randomPattern = missingCodes.filter(code => !code.startsWith('PKL-'));

console.log(`\n🎫 PKL- Format Codes (${pklPattern.length}):`);
pklPattern.forEach(code => {
  console.log(`   - ${code}`);
});

const existingPKLUsers = allUsers.filter(u => u.passportCode?.startsWith('PKL-'));
console.log(`   📊 Database has ${existingPKLUsers.length} users with PKL- format`);

if (existingPKLUsers.length > 0) {
  console.log(`   📋 Existing PKL codes in database:`);
  existingPKLUsers.slice(0, 10).forEach(u => {
    console.log(`      - ${u.passportCode} (${u.username})`);
  });
  if (existingPKLUsers.length > 10) {
    console.log(`      ... and ${existingPKLUsers.length - 10} more`);
  }
}

console.log(`\n🎲 Random Format Codes (${randomPattern.length}):`);
randomPattern.forEach(code => {
  console.log(`   - ${code}`);
});

console.log('\n\n' + '═'.repeat(120));
console.log('💡 RECOMMENDATIONS');
console.log('═'.repeat(120));

const highConfidenceMatches = missingCodes.filter(code => {
  const bestMatch = allUsers
    .map(user => ({ user, similarity: similarity(code, user.passportCode || '') }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  return bestMatch && bestMatch.similarity > 0.8;
});

const mediumConfidenceMatches = missingCodes.filter(code => {
  const bestMatch = allUsers
    .map(user => ({ user, similarity: similarity(code, user.passportCode || '') }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  return bestMatch && bestMatch.similarity > 0.6 && bestMatch.similarity <= 0.8;
});

const noMatches = missingCodes.filter(code => {
  const bestMatch = allUsers
    .map(user => ({ user, similarity: similarity(code, user.passportCode || '') }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  return !bestMatch || bestMatch.similarity <= 0.6;
});

console.log(`\n🎯 High Confidence (>80% match): ${highConfidenceMatches.length} codes`);
console.log(`   Likely typos or variations - recommend updating Excel file`);
highConfidenceMatches.forEach(code => console.log(`   - ${code}`));

console.log(`\n✨ Medium Confidence (60-80% match): ${mediumConfidenceMatches.length} codes`);
console.log(`   Possible matches - review manually`);
mediumConfidenceMatches.forEach(code => console.log(`   - ${code}`));

console.log(`\n❓ No Close Matches (<60% match): ${noMatches.length} codes`);
console.log(`   Likely new players - need registration`);
noMatches.forEach(code => console.log(`   - ${code}`));

console.log('\n' + '═'.repeat(120));
console.log('✅ Analysis complete!');
console.log('═'.repeat(120));

process.exit(0);
