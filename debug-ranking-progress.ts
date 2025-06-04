/**
 * Debug Ranking Progress Display Issue
 * Check the actual data values for match count and required matches
 */
import { storage } from './server/storage';

async function debugRankingProgress() {
  try {
    console.log('=== Ranking Progress Debug ===');
    
    // Get user 1 (mightymax) ranking data
    const response = await fetch('http://localhost:5000/api/multi-rankings/all-positions', {
      headers: {
        'Cookie': 'connect.sid=your-session-id-here' // This would normally be handled by the browser
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('All positions response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data) {
        data.data.forEach((position, index) => {
          console.log(`\n--- Position ${index + 1} ---`);
          console.log(`Format: ${position.format}`);
          console.log(`Division: ${position.division}`);
          console.log(`Match Count: ${position.matchCount}`);
          console.log(`Required Matches: ${position.requiredMatches}`);
          console.log(`Needs Matches: ${position.needsMatches}`);
          console.log(`Is Ranked: ${position.isRanked}`);
          
          if (position.matchCount && position.requiredMatches) {
            const expectedProgress = (position.matchCount / position.requiredMatches) * 100;
            console.log(`Expected Progress: ${expectedProgress.toFixed(1)}%`);
            console.log(`Display Text: ${position.matchCount}/${position.requiredMatches} matches`);
          }
        });
      }
    } else {
      console.log('Failed to fetch ranking data:', response.status, response.statusText);
    }
    
    // Also check if it's a specific position causing the issue
    console.log('\n=== Checking specific Open Singles position ===');
    const singlesResponse = await fetch('http://localhost:5000/api/multi-rankings/position?userId=1&format=singles&ageDivision=35plus');
    
    if (singlesResponse.ok) {
      const singlesData = await singlesResponse.json();
      console.log('Singles position data:', JSON.stringify(singlesData, null, 2));
      
      if (singlesData.matchCount && singlesData.requiredMatches) {
        const progress = (singlesData.matchCount / singlesData.requiredMatches) * 100;
        console.log(`Singles progress calculation: ${singlesData.matchCount}/${singlesData.requiredMatches} = ${progress.toFixed(1)}%`);
      }
    }
    
  } catch (error) {
    console.error('Error in debug:', error);
  }
}

debugRankingProgress();