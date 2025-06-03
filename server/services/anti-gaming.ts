/**
 * Anti-Gaming Service for Pickle Points System
 * 
 * Prevents manipulation, fraud, and gaming of the points system through
 * comprehensive validation, rate limiting, and behavioral analysis.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

interface GameAttempt {
  userId: number;
  action: string;
  timestamp: Date;
  metadata?: any;
}

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  suspiciousScore: number; // 0-100, higher = more suspicious
}

export class AntiGamingService {
  private static recentAttempts: Map<string, GameAttempt[]> = new Map();
  private static suspiciousUsers: Set<number> = new Set();
  
  /**
   * Validates a match submission for gaming attempts
   */
  static async validateMatchSubmission(
    userId: number, 
    matchData: any,
    recentMatches: any[],
    storage?: any
  ): Promise<ValidationResult> {
    const suspiciousScore = this.calculateSuspiciousScore(userId, matchData, recentMatches);
    
    // Validate that opponent exists in Pickle+ ecosystem
    if (storage) {
      const opponent = await storage.getUser(matchData.playerTwoId);
      if (!opponent) {
        return {
          isValid: false,
          reason: "Matches must be played with registered Pickle+ users only",
          suspiciousScore: 95
        };
      }
      
      // Check if opponent is active (has logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (opponent.lastVisit && opponent.lastVisit < thirtyDaysAgo) {
        return {
          isValid: false,
          reason: "Opponent must be an active Pickle+ user",
          suspiciousScore: 80
        };
      }
    }
    
    // Rate limiting - max 5 matches per day
    const todayMatches = recentMatches.filter(m => 
      new Date(m.matchDate || m.createdAt).toDateString() === new Date().toDateString()
    );
    
    if (todayMatches.length >= 5) {
      return {
        isValid: false,
        reason: "Daily match limit of 5 exceeded",
        suspiciousScore: 90
      };
    }
    
    // Drastically reduce points after second match of the day
    if (todayMatches.length >= 2) {
      return {
        isValid: true,
        reason: "Reduced points after second daily match",
        suspiciousScore: 30
      };
    }
    
    // Time-based validation - minimum 15 minutes between matches
    const lastMatch = recentMatches[0];
    if (lastMatch) {
      const timeDiff = Date.now() - new Date(lastMatch.matchDate || lastMatch.createdAt).getTime();
      if (timeDiff < 15 * 60 * 1000) { // 15 minutes
        return {
          isValid: false,
          reason: "Matches submitted too quickly",
          suspiciousScore: 85
        };
      }
    }
    
    // Score validation - unrealistic score patterns
    if (this.isUnrealisticScore(matchData)) {
      return {
        isValid: false,
        reason: "Unrealistic score pattern",
        suspiciousScore: 95
      };
    }
    
    // Behavioral analysis
    if (this.detectSuspiciousBehavior(userId, recentMatches)) {
      return {
        isValid: false,
        reason: "Suspicious behavioral pattern detected",
        suspiciousScore: 80
      };
    }
    
    return {
      isValid: suspiciousScore < 70,
      suspiciousScore
    };
  }
  
  /**
   * Validates profile update points to prevent farming
   * Profile updates can only earn points once per week
   */
  static validateProfileUpdate(
    userId: number,
    oldCompletion: number,
    newCompletion: number,
    updateData: any,
    lastProfilePointsDate?: Date
  ): ValidationResult {
    // Check if user already earned profile points this week
    if (lastProfilePointsDate) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (lastProfilePointsDate > weekAgo) {
        return {
          isValid: false,
          reason: "Profile update points only available once per week",
          suspiciousScore: 60
        };
      }
    }
    
    // Prevent rapid profile changes
    const key = `profile_${userId}`;
    const attempts = this.getRecentAttempts(key);
    
    if (attempts.length >= 3) { // Max 3 profile updates per hour
      return {
        isValid: false,
        reason: "Too many profile updates per hour",
        suspiciousScore: 85
      };
    }
    
    // Detect fake progress
    if (newCompletion - oldCompletion > 30) { // More than 30% jump
      return {
        isValid: false,
        reason: "Unrealistic profile completion jump",
        suspiciousScore: 90
      };
    }
    
    // Validate meaningful changes
    if (!this.isMeaningfulProfileUpdate(updateData)) {
      return {
        isValid: false,
        reason: "Non-meaningful profile changes",
        suspiciousScore: 75
      };
    }
    
    this.recordAttempt(key, {
      userId,
      action: 'profile_update',
      timestamp: new Date(),
      metadata: { oldCompletion, newCompletion }
    });
    
    return { isValid: true, suspiciousScore: 0 };
  }
  
  /**
   * Validates tournament participation for point farming
   */
  static validateTournamentParticipation(
    userId: number,
    tournamentId: number,
    userHistory: any[]
  ): ValidationResult {
    // Check for tournament hopping
    const recentTournaments = userHistory.filter(t => 
      Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    if (recentTournaments.length >= 3) {
      return {
        isValid: false,
        reason: "Too many tournament entries in 24 hours",
        suspiciousScore: 80
      };
    }
    
    // Detect fake tournaments or self-created events
    if (this.isSuspiciousTournament(tournamentId, userId)) {
      return {
        isValid: false,
        reason: "Suspicious tournament detected",
        suspiciousScore: 95
      };
    }
    
    return { isValid: true, suspiciousScore: 0 };
  }
  
  /**
   * Main anti-gaming check for any point-earning activity
   */
  static validatePointsActivity(
    userId: number,
    activityType: string,
    pointsRequested: number,
    metadata?: any
  ): ValidationResult {
    // Global user suspension check
    if (this.suspiciousUsers.has(userId)) {
      return {
        isValid: false,
        reason: "User temporarily suspended for suspicious activity",
        suspiciousScore: 100
      };
    }
    
    // Point amount validation
    if (this.isExcessivePointRequest(activityType, pointsRequested)) {
      return {
        isValid: false,
        reason: "Excessive point request",
        suspiciousScore: 90
      };
    }
    
    // Device/IP tracking (would require additional implementation)
    if (this.detectMultipleAccounts(userId)) {
      return {
        isValid: false,
        reason: "Multiple account detection",
        suspiciousScore: 95
      };
    }
    
    return { isValid: true, suspiciousScore: 0 };
  }
  
  /**
   * Calculate overall suspicious score based on multiple factors
   */
  private static calculateSuspiciousScore(
    userId: number,
    matchData: any,
    recentMatches: any[]
  ): number {
    let score = 0;
    
    // Win rate analysis
    const winRate = recentMatches.filter(m => m.winnerId === userId).length / recentMatches.length;
    if (winRate > 0.95) score += 30; // Suspiciously high win rate
    
    // Score consistency
    const scores = recentMatches.map(m => ({
      player: m.playerOneId === userId ? m.playerOneScore : m.playerTwoScore,
      opponent: m.playerOneId === userId ? m.playerTwoScore : m.playerOneScore
    }));
    
    const avgMargin = scores.reduce((sum, s) => sum + Math.abs(s.player - s.opponent), 0) / scores.length;
    if (avgMargin > 8) score += 20; // Unusually large score margins
    
    // Time patterns
    const times = recentMatches.map(m => new Date(m.matchDate || m.createdAt).getHours());
    const uniqueHours = new Set(times);
    if (uniqueHours.size < 3) score += 15; // Playing only at specific times
    
    return Math.min(score, 100);
  }
  
  /**
   * Detect unrealistic score patterns
   */
  private static isUnrealisticScore(matchData: any): boolean {
    const { playerOneScore, playerTwoScore } = matchData;
    
    // Pickleball games typically go to 11, win by 2
    if (playerOneScore > 15 || playerTwoScore > 15) return true;
    if (Math.abs(playerOneScore - playerTwoScore) > 8) return true;
    if (playerOneScore === 0 && playerTwoScore > 0) return true; // Shutouts are rare
    
    return false;
  }
  
  /**
   * Analyze behavioral patterns for suspicious activity
   */
  private static detectSuspiciousBehavior(userId: number, recentMatches: any[]): boolean {
    if (recentMatches.length < 5) return false;
    
    // Check for identical opponents
    const opponents = recentMatches.map(m => 
      m.playerOneId === userId ? m.playerTwoId : m.playerOneId
    );
    const uniqueOpponents = new Set(opponents);
    
    // Playing against same person repeatedly
    if (uniqueOpponents.size / opponents.length < 0.3) return true;
    
    // Check for alternating wins/losses (fake competitive play)
    const results = recentMatches.map(m => m.winnerId === userId);
    let alternations = 0;
    for (let i = 1; i < results.length; i++) {
      if (results[i] !== results[i-1]) alternations++;
    }
    
    if (alternations / results.length > 0.8) return true; // Too much alternation
    
    return false;
  }
  
  /**
   * Validate that profile updates are meaningful
   */
  private static isMeaningfulProfileUpdate(updateData: any): boolean {
    const meaningfulFields = ['firstName', 'lastName', 'bio', 'location', 'paddleBrand', 'playStyle'];
    const changedFields = Object.keys(updateData);
    
    // Must change at least one meaningful field
    return meaningfulFields.some(field => changedFields.includes(field) && 
      updateData[field] && updateData[field].toString().length > 2);
  }
  
  /**
   * Detect suspicious tournaments
   */
  private static isSuspiciousTournament(tournamentId: number, userId: number): boolean {
    // This would check database for tournament details
    // For now, return false - would need tournament validation logic
    return false;
  }
  
  /**
   * Check for excessive point requests
   */
  private static isExcessivePointRequest(activityType: string, points: number): boolean {
    const limits = {
      'match_win': 25,
      'profile_update': 10,
      'tournament_entry': 50,
      'daily_activity': 8
    };
    
    return points > (limits[activityType] || 15);
  }
  
  /**
   * Detect multiple accounts from same user
   */
  private static detectMultipleAccounts(userId: number): boolean {
    // Would implement IP/device fingerprinting
    // For now, return false - requires additional tracking
    return false;
  }
  
  /**
   * Utility methods for attempt tracking
   */
  private static getRecentAttempts(key: string): GameAttempt[] {
    const attempts = this.recentAttempts.get(key) || [];
    const hourAgo = Date.now() - 60 * 60 * 1000;
    
    // Filter to last hour only
    const recentAttempts = attempts.filter(attempt => 
      attempt.timestamp.getTime() > hourAgo
    );
    
    this.recentAttempts.set(key, recentAttempts);
    return recentAttempts;
  }
  
  private static recordAttempt(key: string, attempt: GameAttempt): void {
    const attempts = this.getRecentAttempts(key);
    attempts.push(attempt);
    this.recentAttempts.set(key, attempts);
  }
  
  /**
   * Flag user as suspicious
   */
  static flagSuspiciousUser(userId: number, reason: string): void {
    this.suspiciousUsers.add(userId);
    console.log(`[ANTI-GAMING] User ${userId} flagged: ${reason}`);
    
    // Auto-unflag after 24 hours
    setTimeout(() => {
      this.suspiciousUsers.delete(userId);
      console.log(`[ANTI-GAMING] User ${userId} suspension lifted`);
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * Clear user from suspicious list
   */
  static clearSuspiciousUser(userId: number): void {
    this.suspiciousUsers.delete(userId);
  }
}