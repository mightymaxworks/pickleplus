/**
 * PKL-278651-PERF-0001-LOAD
 * Test Data Generation Utilities
 * 
 * This module provides utilities for generating test data used in load testing scenarios.
 */

/**
 * Generate a random string of specified length
 * @param {number} length - The length of the string to generate
 * @param {string} charset - Character set to use for generation (default: alphanumeric)
 * @returns {string} - Random string
 */
function randomString(length = 10, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let result = '';
  const charsetLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charsetLength));
  }
  
  return result;
}

/**
 * Generate a valid 7-character alphanumeric passport code
 * following the Pickle+ format requirements
 * @returns {string} - 7-character passport code
 */
function generatePassportCode() {
  // Format: 3 uppercase letters followed by 4 numbers
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
  const numbers = '0123456789';
  
  let code = '';
  
  // Generate 3 random uppercase letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

/**
 * Generate random match data for match recording tests
 * @returns {Object} - Match data object
 */
function generateMatchData() {
  const formats = ['singles', 'doubles', 'mixed_doubles'];
  const locations = ['Local Community Center', 'Downtown Courts', 'Riverside Park', 'Pickleball Club'];
  const scores = [
    [11, 5], [11, 7], [11, 9], [15, 13], [11, 0],  // First set scores
    [11, 4], [11, 8], [11, 6], [13, 11], [11, 2]   // Second set scores
  ];
  
  // Randomly select scores
  const firstSetIndex = Math.floor(Math.random() * scores.length);
  const secondSetIndex = Math.floor(Math.random() * scores.length);
  
  return {
    format: formats[Math.floor(Math.random() * formats.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
    scores: [
      {
        teamA: scores[firstSetIndex][0],
        teamB: scores[firstSetIndex][1]
      },
      {
        teamA: scores[secondSetIndex][0],
        teamB: scores[secondSetIndex][1]
      }
    ],
    notes: `Automated test match created at ${new Date().toISOString()}`
  };
}

/**
 * Generate random player IDs for match participants
 * @param {number} count - Number of player IDs to generate
 * @returns {Array<number>} - Array of player IDs
 */
function generatePlayerIds(count = 4) {
  // Use a fixed set of test user IDs (assuming these exist in the test database)
  const testUserIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Shuffle and take the requested number
  const shuffled = [...testUserIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate filter parameters for tournament discovery tests
 * @returns {Object} - Filter parameters
 */
function generateTournamentFilters() {
  const skillLevels = ['2.5', '3.0', '3.5', '4.0', '4.5', '5.0+'];
  const ageGroups = ['Open', '19+', '35+', '50+', '65+'];
  const formats = ['Singles', 'Doubles', 'Mixed Doubles'];
  
  // Randomly decide how many filters to apply
  const filterCount = Math.floor(Math.random() * 3) + 1; // 1-3 filters
  
  const filters = {};
  const filterTypes = ['skillLevel', 'ageGroup', 'format'];
  
  // Randomly select filter types to apply
  const selectedFilterTypes = filterTypes
    .sort(() => 0.5 - Math.random())
    .slice(0, filterCount);
  
  // Apply selected filters
  selectedFilterTypes.forEach(filterType => {
    switch (filterType) {
      case 'skillLevel':
        filters.skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
        break;
      case 'ageGroup':
        filters.ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
        break;
      case 'format':
        filters.format = formats[Math.floor(Math.random() * formats.length)];
        break;
    }
  });
  
  return filters;
}

module.exports = {
  randomString,
  generatePassportCode,
  generateMatchData,
  generatePlayerIds,
  generateTournamentFilters
};