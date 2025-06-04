/**
 * Test Age-Division Ranking System (Focused)
 * This script tests the new ranking logic with specific user data
 */

import { storage } from './server/storage';

async function testAgeDivisionRankingFocused() {
  console.log('=== Testing Age-Division Ranking System (Focused) ===\n');
  
  // Test with mightymax (user ID 1)
  const userId = 1;
  const user = await storage.getUser(userId);
  
  if (!user || !user.yearOfBirth) {
    console.log('User not found or missing birth year');
    return;
  }
  
  console.log('User Profile:');
  console.log(`- Username: ${user.username}`);
  console.log(`- Year of Birth: ${user.yearOfBirth}`);
  const age = new Date().getFullYear() - user.yearOfBirth;
  console.log(`- Age: ${age}`);
  
  // Calculate natural age division
  let naturalDivision = '19+';
  if (age >= 70) naturalDivision = '70+';
  else if (age >= 60) naturalDivision = '60+';
  else if (age >= 50) naturalDivision = '50+';
  else if (age >= 35) naturalDivision = '35+';
  
  console.log(`- Natural Division: ${naturalDivision}\n`);
  
  // Get matches
  const matches = await storage.getMatchesByUser(userId, 100, 0, userId);
  console.log(`Total matches: ${matches.length}\n`);
  
  // Test age-specific point allocation rules
  console.log('=== Age-Specific Point Allocation Rules ===\n');
  
  const formats = ['singles', 'doubles'];
  const divisions = ['19+', '35+'];
  
  for (const format of formats) {
    console.log(`${format.toUpperCase()} FORMAT:`);
    
    for (const division of divisions) {
      console.log(`\n${division} Division:`);
      
      let points = 0;
      let matchCount = 0;
      
      for (const match of matches) {
        if (match.formatType !== format) continue;
        if (match.winnerId !== userId) continue;
        
        let contributesToDivision: string;
        
        if (match.matchType === 'casual') {
          // Casual matches: points only go to natural age division
          contributesToDivision = naturalDivision;
        } else {
          // Tournament/League: points go to event's division
          contributesToDivision = match.division || '19+';
        }
        
        if (contributesToDivision === division) {
          const basePoints = 3;
          let weightMultiplier = 1.0;
          
          if (match.matchType === 'league') {
            weightMultiplier = 0.67;
          } else if (match.matchType === 'casual') {
            weightMultiplier = 0.5;
          }
          
          const finalPoints = Math.round(basePoints * weightMultiplier);
          points += finalPoints;
          matchCount++;
          
          console.log(`  Match ${match.id}: ${match.matchType} -> ${finalPoints} points (${basePoints} * ${weightMultiplier})`);
        }
      }
      
      console.log(`  TOTAL: ${points} points from ${matchCount} matches`);
      console.log(`  Eligible for ranking: ${matchCount >= 10 ? 'YES' : 'NO (need ' + (10 - matchCount) + ' more)'}`);
    }
    console.log('');
  }
  
  // Test cross-division scenario
  console.log('=== Cross-Division Tournament Participation Test ===');
  console.log('Scenario: 43-year-old (35+ natural) playing in 19+ tournament\n');
  
  console.log('Rule 1: Casual matches -> Points go to natural division (35+)');
  console.log('Rule 2: Tournament matches -> Points go to event division (19+)');
  console.log('Rule 3: Each division tracks points separately');
  console.log('Rule 4: Player needs 10+ matches per division to be ranked\n');
  
  console.log('Match Analysis:');
  matches.forEach(match => {
    if (match.winnerId === userId) {
      const contributesToDivision = match.matchType === 'casual' ? naturalDivision : (match.division || '19+');
      console.log(`Match ${match.id}: ${match.matchType} ${match.formatType} -> Points to ${contributesToDivision} division`);
    }
  });
}

// Run the focused test
testAgeDivisionRankingFocused().catch(console.error);