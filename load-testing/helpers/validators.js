/**
 * PKL-278651-PERF-0001-LOAD
 * Response Validation Utilities
 * 
 * This module provides utilities for validating API responses during load testing.
 */

/**
 * Validate authentication response format
 * @param {Object} response - HTTP response object from k6
 * @returns {boolean} - Whether the response has a valid format
 */
function validateAuthResponse(response) {
  try {
    // Check if response body exists
    if (!response.body) {
      return false;
    }
    
    // Parse response body
    const data = JSON.parse(response.body);
    
    // For registration/login response
    if (response.status === 200 || response.status === 201) {
      // Verify user object structure
      return (
        data &&
        typeof data.id === 'number' &&
        typeof data.username === 'string' &&
        typeof data.email === 'string'
      );
    }
    
    // For error responses
    return (
      data &&
      typeof data.message === 'string'
    );
  } catch (e) {
    console.error('Auth response validation error:', e);
    return false;
  }
}

/**
 * Validate golden ticket response format
 * @param {Object} response - HTTP response object from k6
 * @param {string} operation - The operation type ('list', 'claim', or 'reveal')
 * @returns {boolean} - Whether the response has a valid format
 */
function validateGoldenTicketResponse(response, operation) {
  try {
    // Check if response body exists
    if (!response.body) {
      return false;
    }
    
    // Parse response body
    const data = JSON.parse(response.body);
    
    // Different validation based on operation type
    switch (operation) {
      case 'list':
        // Should be an array of ticket objects
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].id === 'number' &&
            typeof data[0].title === 'string'
          ))
        );
        
      case 'claim':
        // Should be a claim object
        return (
          data &&
          typeof data.id === 'number' &&
          typeof data.ticketId === 'number' &&
          typeof data.userId === 'number' &&
          typeof data.claimedAt === 'string'
        );
        
      case 'reveal':
        // Should be a sponsor object
        return (
          data &&
          typeof data.id === 'number' &&
          typeof data.name === 'string' &&
          (typeof data.logoUrl === 'string' || data.logoUrl === null) &&
          typeof data.promotionDescription === 'string'
        );
        
      default:
        return false;
    }
  } catch (e) {
    console.error(`Golden ticket ${operation} response validation error:`, e);
    return false;
  }
}

/**
 * Validate match response format
 * @param {Object} response - HTTP response object from k6
 * @param {string} operation - The operation type ('create', 'validate', 'history', etc.)
 * @returns {boolean} - Whether the response has a valid format
 */
function validateMatchResponse(response, operation) {
  try {
    // Check if response body exists
    if (!response.body) {
      return false;
    }
    
    // Parse response body
    const data = JSON.parse(response.body);
    
    // Different validation based on operation type
    switch (operation) {
      case 'create':
        // Should be a match object
        return (
          data &&
          typeof data.id === 'number' &&
          typeof data.format === 'string' &&
          typeof data.date === 'string' &&
          Array.isArray(data.scores)
        );
        
      case 'validate':
        // Should contain validation success message
        return (
          data &&
          typeof data.success === 'boolean' &&
          typeof data.message === 'string'
        );
        
      case 'history':
        // Should be an array of match objects
        return (
          data &&
          typeof data.matches === 'object' &&
          Array.isArray(data.matches) &&
          typeof data.pagination === 'object'
        );
        
      case 'stats':
        // Should contain match statistics
        return (
          data &&
          typeof data.totalMatches === 'number' &&
          typeof data.matchesWon === 'number' &&
          typeof data.matchesLost === 'number'
        );
        
      case 'recent':
        // Should be an array of recent matches
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].id === 'number' &&
            typeof data[0].format === 'string'
          ))
        );
        
      default:
        return false;
    }
  } catch (e) {
    console.error(`Match ${operation} response validation error:`, e);
    return false;
  }
}

/**
 * Validate tournament response format
 * @param {Object} response - HTTP response object from k6
 * @param {string} operation - The operation type ('list', 'detail', 'features', etc.)
 * @returns {boolean} - Whether the response has a valid format
 */
function validateTournamentResponse(response, operation) {
  try {
    // Check if response body exists
    if (!response.body) {
      return false;
    }
    
    // Parse response body
    const data = JSON.parse(response.body);
    
    // Different validation based on operation type
    switch (operation) {
      case 'list':
        // Should be an array of tournament objects
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].id === 'number' &&
            typeof data[0].name === 'string' &&
            typeof data[0].location === 'string'
          ))
        );
        
      case 'detail':
        // Should be a tournament object
        return (
          data &&
          typeof data.id === 'number' &&
          typeof data.name === 'string' &&
          typeof data.location === 'string' &&
          typeof data.startDate === 'string'
        );
        
      case 'features':
        // Should be an array of tournament feature objects
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].id === 'number' &&
            typeof data[0].name === 'string' &&
            typeof data[0].description === 'string'
          ))
        );
        
      case 'discovery':
        // Should contain discovery quest information
        return (
          data &&
          typeof data.completedFeatures === 'number' &&
          typeof data.totalFeatures === 'number' &&
          typeof data.currentTier === 'string'
        );
        
      default:
        return false;
    }
  } catch (e) {
    console.error(`Tournament ${operation} response validation error:`, e);
    return false;
  }
}

/**
 * Validate ranking response format
 * @param {Object} response - HTTP response object from k6
 * @param {string} operation - The operation type ('leaderboard', 'position', 'history', etc.)
 * @returns {boolean} - Whether the response has a valid format
 */
function validateRankingResponse(response, operation) {
  try {
    // Check if response body exists
    if (!response.body) {
      return false;
    }
    
    // Parse response body
    const data = JSON.parse(response.body);
    
    // Different validation based on operation type
    switch (operation) {
      case 'leaderboard':
        // Should contain leaderboard data
        return (
          data &&
          typeof data.leaderboard === 'object' &&
          Array.isArray(data.leaderboard)
        );
        
      case 'position':
        // Should contain user ranking position
        return (
          data &&
          typeof data.position === 'number' &&
          typeof data.total === 'number' &&
          typeof data.rating === 'number'
        );
        
      case 'history':
        // Should be an array of ranking history entries
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].timestamp === 'string' &&
            typeof data[0].rating === 'number'
          ))
        );
        
      case 'tiers':
        // Should be an array of rating tier objects
        return (
          Array.isArray(data) &&
          (data.length === 0 || (
            data[0] &&
            typeof data[0].name === 'string' &&
            typeof data[0].minRating === 'number' &&
            typeof data[0].maxRating === 'number'
          ))
        );
        
      default:
        return false;
    }
  } catch (e) {
    console.error(`Ranking ${operation} response validation error:`, e);
    return false;
  }
}

module.exports = {
  validateAuthResponse,
  validateGoldenTicketResponse,
  validateMatchResponse,
  validateTournamentResponse,
  validateRankingResponse
};