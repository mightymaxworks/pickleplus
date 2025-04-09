// Simple script to create a test match with a pending validation status via the API
import fetch from 'node-fetch';

async function createPendingMatch() {
  try {
    const response = await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matchDate: new Date().toISOString(),
        playerOneId: 1, // The current user
        playerTwoId: 2, // Opponent
        formatType: 'singles',
        matchType: 'casual',
        scorePlayerOne: '11',
        scorePlayerTwo: '5',
        winnerId: 1,
        validationStatus: 'pending'
      }),
      credentials: 'include'
    });

    const result = await response.json();
    console.log('Created test match:', result);
  } catch (error) {
    console.error('Error creating test match:', error);
  }
}

createPendingMatch();
