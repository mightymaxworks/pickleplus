/**
 * MomentumEngine - Strategic match momentum tracking with EWMA calculations
 * Generates strategic messages and tracks momentum swings for epic match experience
 */

export interface MomentumEvent {
  pointNo: number;
  scoringTeam: 'team1' | 'team2';
  score: [number, number]; // [team1Score, team2Score]
  hadServe?: 'team1' | 'team2';
  isSideOut?: boolean; // True if traditional scoring and rally won without serve (no point scored)
  timestamp: number;
  tags: string[];
}

export interface MatchCloseness {
  level: 'nail-biter' | 'competitive' | 'one-sided' | 'blowout';
  score: number; // 0-100, higher = more competitive
  description: string;
  indicators: {
    momentumBalance: number; // How close to 50/50 momentum is
    shiftFrequency: number; // How often momentum shifts
    streakVolatility: number; // How varied the streak patterns are
    scoreProximity: number; // How close the actual scores are
  };
}

export interface MomentumHistoryPoint {
  pointNo: number;
  team: 'team1' | 'team2';
  score: [number, number];
  ewma: number; // Mechanical momentum [-1, 1]
  dEwma: number; // Change in momentum
  hypeIndex: number; // Visual excitement [0, 1]
  isSideOut?: boolean; // True for side-outs in traditional scoring
  timestamp: number;
}

export interface MomentumState {
  momentum: number; // EWMA value [-1, 1] - mechanical
  hypeIndex: number; // Visual excitement [0, 1] - for gaming effects
  momentumScore: number; // UI-friendly [0, 100]
  streak: {
    team: 'team1' | 'team2';
    length: number;
  };
  lastShiftAt?: number;
  wave: Array<{ x: number; y: number; hype: number }>; // Enhanced wave with hype
  history: MomentumHistoryPoint[]; // Complete point history
  turningPoints: number[]; // Point numbers where momentum shifted significantly
  maxDeficitPerTeam: { team1: number; team2: number }; // Max deficit each team has faced
  recentDeficitWindow: Array<{ pointNo: number; deficit: number; leader: 'team1' | 'team2' | 'tied' }>; // Last 8 points deficit tracking
  totalPoints: number;
  gamePhase: 'early' | 'mid' | 'late' | 'critical';
  closeness?: MatchCloseness;
  combos: {
    consecutiveHype: number; // Consecutive high-hype points
    recentComebacks: number; // Comebacks in last 10 points
  };
  traditionalScoring?: {
    consecutiveSideOuts: number; // Count of side-outs in a row
    totalSideOuts: number; // Total side-outs in the game
    lastRallyOutcome: 'point' | 'sideout' | null; // Last rally result
    serveDominance: { // Track how many consecutive points teams held serve
      team1: number;
      team2: number;
    };
  };
}

export interface StrategyMessage {
  id: string;
  type: 'firstBlood' | 'streak' | 'megaStreak' | 'momentumShift' | 'clutchSave' | 'comeback' | 'gamePoint' | 'matchPoint' | 'break' | 'deuce' | 'sideout' | 'servehold' | 'defensiveBattle';
  priority: 0 | 1 | 2 | 3; // 0=highest, 3=lowest
  text: string;
  timestamp: number;
  pointNo: number;
  team?: 'team1' | 'team2';
  duration: number; // ms
  megaLevel?: 1 | 2 | 3; // For mega animations: 1=3pts, 2=5pts, 3=8pts
}

export interface MatchConfig {
  pointTarget: number;
  winByTwo: boolean;
  scoringType: 'traditional' | 'rally';
  matchFormat: 'single' | 'best-of-3' | 'best-of-5';
}

export class MomentumEngine {
  private state: MomentumState;
  private config: MatchConfig;
  private alpha = 0.35; // EWMA smoothing factor for mechanical momentum
  private shiftThreshold = 0.3; // Momentum shift detection threshold
  private hypeWeights = { // Weights for hype index calculation
    dEwma: 0.4,        // Change in momentum
    streakLength: 0.25, // Current streak length
    shiftMagnitude: 0.2, // Recent momentum shifts
    leverage: 0.1,      // Points-to-target pressure
    deficitSeverity: 0.05 // Comeback potential
  };
  private messageQueue: StrategyMessage[] = [];
  private gameHistory: Array<{ game: number; winner: 'team1' | 'team2'; score: [number, number] }> = [];
  private lastMessagePoint = -1;

  constructor(config: MatchConfig) {
    this.config = config;
    this.state = {
      momentum: 0,
      hypeIndex: 0,
      momentumScore: 50,
      streak: { team: 'team1', length: 0 },
      wave: [],
      history: [],
      turningPoints: [],
      maxDeficitPerTeam: { team1: 0, team2: 0 },
      recentDeficitWindow: [],
      totalPoints: 0,
      gamePhase: 'early',
      combos: {
        consecutiveHype: 0,
        recentComebacks: 0
      },
      traditionalScoring: config.scoringType === 'traditional' ? {
        consecutiveSideOuts: 0,
        totalSideOuts: 0,
        lastRallyOutcome: null,
        serveDominance: { team1: 0, team2: 0 }
      } : undefined
    };
  }

  /**
   * Process a point scored and generate strategic messages
   */
  processPoint(event: MomentumEvent): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    const prevMomentum = this.state.momentum;
    
    // Store previous streak state BEFORE updating for break detection
    const prevStreak = { ...this.state.streak };
    
    // Update mechanical momentum using EWMA
    // For traditional scoring side-outs, reduce momentum impact (0.6x multiplier)
    const signal = event.scoringTeam === 'team1' ? 1 : -1;
    const sideOutMultiplier = (this.config.scoringType === 'traditional' && event.isSideOut) ? 0.6 : 1.0;
    const effectiveAlpha = this.alpha * sideOutMultiplier;
    
    this.state.momentum = (1 - effectiveAlpha) * this.state.momentum + effectiveAlpha * signal;
    this.state.momentum = Math.max(-1, Math.min(1, this.state.momentum)); // Clamp [-1, 1]
    this.state.momentumScore = Math.round(((this.state.momentum + 1) / 2) * 100);
    
    // Calculate momentum change
    const dEwma = Math.abs(this.state.momentum - prevMomentum);
    
    // Update deficit tracking
    this.updateDeficitTracking(event.score, event.scoringTeam);
    
    // Calculate hype index (visual excitement)
    this.state.hypeIndex = this.calculateHypeIndex(dEwma, event.score, event.scoringTeam);
    
    // Add to history
    const historyPoint: MomentumHistoryPoint = {
      pointNo: event.pointNo,
      team: event.scoringTeam,
      score: event.score,
      ewma: this.state.momentum,
      dEwma,
      hypeIndex: this.state.hypeIndex,
      isSideOut: event.isSideOut,
      timestamp: event.timestamp
    };
    this.state.history.push(historyPoint);
    
    // Update wave data with hype
    this.state.wave.push({ 
      x: event.pointNo, 
      y: this.state.momentum, 
      hype: this.state.hypeIndex 
    });
    this.state.totalPoints = event.pointNo;
    
    // Detect turning points
    if (dEwma > this.shiftThreshold) {
      this.state.turningPoints.push(event.pointNo);
    }
    
    // Update game phase
    this.updateGamePhase(event.score);
    
    // Update streak
    this.updateStreak(event.scoringTeam);
    
    // Update combos
    this.updateCombos();
    
    // Update traditional scoring tracking
    this.updateTraditionalScoringTracking(event);
    
    // Generate strategic messages (rate limited to 1 per point) - pass prevStreak for break detection
    if (this.lastMessagePoint !== event.pointNo) {
      messages.push(...this.generateMessages(event, prevMomentum, prevStreak));
      this.lastMessagePoint = event.pointNo;
    }
    
    // Compute and update match closeness
    this.state.closeness = this.analyzeMatchCloseness(event.score);
    
    return messages;
  }

  private updateStreak(scoringTeam: 'team1' | 'team2') {
    if (this.state.streak.team === scoringTeam) {
      this.state.streak.length++;
    } else {
      this.state.streak = { team: scoringTeam, length: 1 };
    }
  }

  private updateGamePhase(score: [number, number]) {
    const [s1, s2] = score;
    const maxScore = Math.max(s1, s2);
    const target = this.config.pointTarget;
    
    if (maxScore < target * 0.3) {
      this.state.gamePhase = 'early';
    } else if (maxScore < target * 0.7) {
      this.state.gamePhase = 'mid';
    } else if (maxScore < target - 2) {
      this.state.gamePhase = 'late';
    } else {
      this.state.gamePhase = 'critical';
    }
  }

  private generateMessages(event: MomentumEvent, prevMomentum: number, prevStreak?: { team: 'team1' | 'team2'; length: number }): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    const { scoringTeam, score, pointNo, isSideOut } = event;
    
    // Traditional Scoring: Side-Out messages with contextual patterns
    if (this.config.scoringType === 'traditional' && isSideOut && this.state.traditionalScoring) {
      const { consecutiveSideOuts, totalSideOuts } = this.state.traditionalScoring;
      
      // Consecutive side-outs pattern detected
      if (consecutiveSideOuts >= 4) {
        messages.push(this.createMessage('defensiveBattle', '🛡️ DEFENSIVE GRIND! Neither team can hold serve!', scoringTeam, 1));
      } else if (consecutiveSideOuts === 3) {
        messages.push(this.createMessage('sideout', '⚔️ BACK-AND-FORTH BATTLE! Serve keeps changing!', scoringTeam, 2));
      } else if (consecutiveSideOuts === 2) {
        messages.push(this.createMessage('sideout', '🔄 TRADING SERVES! Tight defensive play!', scoringTeam, 2));
      } else {
        // Single side-out - use varied messages
        const sideOutMessages = [
          '🔄 SIDE OUT!',
          '⚡ SERVE SNATCHED!',
          '🎯 BREAKING SERVE!',
          '💪 SERVE EARNED!'
        ];
        const message = sideOutMessages[Math.floor(Math.random() * sideOutMessages.length)];
        messages.push(this.createMessage('sideout', message, scoringTeam, 2));
      }
      return messages; // Side-out is the primary message, no additional messages
    }
    
    // Traditional Scoring: Service hold messages with dominance context
    if (this.config.scoringType === 'traditional' && !isSideOut && event.hadServe === scoringTeam && this.state.traditionalScoring) {
      const serveDominance = scoringTeam === 'team1' 
        ? this.state.traditionalScoring.serveDominance.team1 
        : this.state.traditionalScoring.serveDominance.team2;
      
      if (serveDominance >= 5) {
        messages.push(this.createMessage('servehold', '⚡ SERVE DOMINATION! Unstoppable on serve!', scoringTeam, 1));
      } else if (serveDominance >= 3) {
        messages.push(this.createMessage('servehold', '🔥 HOLDING SERVE! Strong service game!', scoringTeam, 2));
      } else if (this.state.streak.length >= 3 && this.state.streak.team === scoringTeam) {
        messages.push(this.createMessage('servehold', '💪 SERVE CONTROL! Maintaining momentum!', scoringTeam, 2));
      }
    }
    
    // First Blood - First point of the match
    if (pointNo === 1) {
      messages.push(this.createMessage('firstBlood', '🩸 FIRST BLOOD!', scoringTeam, 3));
    }
    
    // Streak messages
    if (this.state.streak.length >= 2) {
      const streakMessages = this.getStreakMessage(this.state.streak.length, scoringTeam);
      if (streakMessages) {
        messages.push(streakMessages);
      }
    }
    
    // Momentum shift detection
    const momentumChange = Math.abs(this.state.momentum - prevMomentum);
    const signFlipped = Math.sign(this.state.momentum) !== Math.sign(prevMomentum);
    if (signFlipped && momentumChange > this.shiftThreshold) {
      messages.push(this.createMessage('momentumShift', '⚡ MOMENTUM SWING!', scoringTeam, 1));
      this.state.lastShiftAt = pointNo;
    }
    
    // Game/Match point scenarios
    const gamePointMessages = this.checkGamePointScenarios(score, scoringTeam);
    messages.push(...gamePointMessages);
    
    // Comeback scenarios
    const comebackMessage = this.checkComebackScenario(score, scoringTeam);
    if (comebackMessage) {
      messages.push(comebackMessage);
    }
    
    // Service break / Momentum snatch - use prevStreak for accurate detection
    const breakMessage = this.checkBreakScenario(event, prevStreak);
    if (breakMessage) {
      messages.push(breakMessage);
    }
    
    // Deuce pressure
    const deuceMessage = this.checkDeuceScenario(score);
    if (deuceMessage) {
      messages.push(deuceMessage);
    }
    
    return messages.slice(0, 3); // Max 3 messages per point
  }

  private getStreakMessage(length: number, team: 'team1' | 'team2'): StrategyMessage | null {
    // Mega streak messages for special animations
    if (length === 3) {
      return this.createMegaMessage('megaStreak', '🌋 DOMINATION BEGINS!', team, 0, 1, 4000);
    }
    if (length === 5) {
      return this.createMegaMessage('megaStreak', '⚡ TOTAL CONTROL!', team, 0, 2, 5000);
    }
    if (length === 8) {
      return this.createMegaMessage('megaStreak', '🔥 ABSOLUTE DOMINANCE!', team, 0, 3, 6000);
    }
    
    // Regular streak messages
    const messages = {
      2: { text: '🔥 HEATING UP!', priority: 2 as const },
      4: { text: '⚡ BLAZING HOT!', priority: 1 as const },
      6: { text: '🚀 UNSTOPPABLE!', priority: 0 as const },
      7: { text: '👑 LEGENDARY!', priority: 0 as const }
    };
    
    const key = Math.min(length, 7) as keyof typeof messages;
    if (messages[key]) {
      return this.createMessage('streak', messages[key].text, team, messages[key].priority);
    }
    
    return null;
  }

  private checkGamePointScenarios(score: [number, number], scoringTeam: 'team1' | 'team2'): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    const [s1, s2] = score;
    const target = this.config.pointTarget;
    const winByTwo = this.config.winByTwo;
    
    // Game point
    if ((s1 >= target - 1 || s2 >= target - 1) && Math.abs(s1 - s2) >= (winByTwo ? 2 : 1)) {
      const leadingTeam = s1 > s2 ? 'team1' : 'team2';
      if (scoringTeam === leadingTeam) {
        messages.push(this.createMessage('gamePoint', '🎯 GAME POINT!', leadingTeam, 0));
      } else {
        messages.push(this.createMessage('clutchSave', '💪 CLUTCH SAVE!', scoringTeam, 1));
      }
    }
    
    // Match point (for best-of series)
    if (this.config.matchFormat !== 'single') {
      // Add match point logic based on games won
      // This would require tracking game history
    }
    
    return messages;
  }

  private checkComebackScenario(score: [number, number], scoringTeam: 'team1' | 'team2'): StrategyMessage | null {
    const [s1, s2] = score;
    const currentDeficit = scoringTeam === 'team1' ? s2 - s1 : s1 - s2;
    const maxDeficit = scoringTeam === 'team1' ? this.state.maxDeficitPerTeam.team1 : this.state.maxDeficitPerTeam.team2;
    
    // Major comeback: Was down 4+ points, now within 1
    if (maxDeficit >= 4 && currentDeficit <= 1) {
      return this.createMessage('comeback', '🔥 INCREDIBLE COMEBACK!', scoringTeam, 0);
    }
    
    // Building comeback: Was down 3+ points, deficit reduced by 2+ in recent points
    if (maxDeficit >= 3 && this.getRecentDeficitReduction(scoringTeam) >= 2) {
      return this.createMessage('comeback', '⚡ COMEBACK BUILDING!', scoringTeam, 1);
    }
    
    // Comeback completed: Was down 2+ points, now tied or leading
    if (maxDeficit >= 2 && currentDeficit <= 0) {
      return this.createMessage('comeback', '🎯 COMEBACK COMPLETE!', scoringTeam, 0);
    }
    
    return null;
  }

  private checkBreakScenario(event: MomentumEvent, prevStreak?: { team: 'team1' | 'team2'; length: number }): StrategyMessage | null {
    // Traditional scoring: Break of serve
    if (this.config.scoringType === 'traditional' && event.hadServe) {
      const servingTeam = event.hadServe;
      if (event.scoringTeam !== servingTeam) {
        return this.createMessage('break', '💥 BREAK OF SERVE!', event.scoringTeam, 2);
      }
    }
    
    // Rally scoring: Momentum snatch (breaking opponent's 2+ streak)
    if (this.config.scoringType === 'rally' && prevStreak && prevStreak.length >= 2) {
      // Break occurs when scoring team differs from previous streak team
      if (event.scoringTeam !== prevStreak.team) {
        return this.createMessage('break', '⚡ MOMENTUM SNATCH!', event.scoringTeam, 2);
      }
    }
    
    return null;
  }

  private checkDeuceScenario(score: [number, number]): StrategyMessage | null {
    const [s1, s2] = score;
    const target = this.config.pointTarget;
    
    // Deuce-like scenario: both near target and close score
    if (Math.min(s1, s2) >= target - 2 && Math.abs(s1 - s2) <= 1) {
      return this.createMessage('deuce', '🔥 PRESSURE COOKER!', undefined, 1);
    }
    
    return null;
  }

  private createMessage(
    type: StrategyMessage['type'],
    text: string,
    team?: 'team1' | 'team2',
    priority: 0 | 1 | 2 | 3 = 2,
    duration = 2500
  ): StrategyMessage {
    return {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      priority,
      text,
      timestamp: Date.now(),
      pointNo: this.state.totalPoints,
      team,
      duration
    };
  }

  private createMegaMessage(
    type: StrategyMessage['type'],
    text: string,
    team?: 'team1' | 'team2',
    priority: 0 | 1 | 2 | 3 = 0,
    megaLevel: 1 | 2 | 3 = 1,
    duration = 4000
  ): StrategyMessage {
    return {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      priority,
      text,
      timestamp: Date.now(),
      pointNo: this.state.totalPoints,
      team,
      duration,
      megaLevel
    };
  }

  // === Revolutionary Two-Layer System Helper Methods ===

  /**
   * Update deficit tracking for comeback detection
   */
  private updateDeficitTracking(score: [number, number], scoringTeam: 'team1' | 'team2') {
    const [s1, s2] = score;
    const deficit1 = s2 - s1; // Team1's deficit (positive if behind)
    const deficit2 = s1 - s2; // Team2's deficit (positive if behind)
    
    // Update max deficit each team has faced
    if (deficit1 > 0) {
      this.state.maxDeficitPerTeam.team1 = Math.max(this.state.maxDeficitPerTeam.team1, deficit1);
    }
    if (deficit2 > 0) {
      this.state.maxDeficitPerTeam.team2 = Math.max(this.state.maxDeficitPerTeam.team2, deficit2);
    }
    
    // Update recent deficit window (last 8 points)
    const leader: 'team1' | 'team2' | 'tied' = s1 > s2 ? 'team1' : s2 > s1 ? 'team2' : 'tied';
    const deficit = Math.abs(s1 - s2);
    
    this.state.recentDeficitWindow.push({
      pointNo: this.state.totalPoints + 1,
      deficit,
      leader
    });
    
    // Keep only last 8 points
    if (this.state.recentDeficitWindow.length > 8) {
      this.state.recentDeficitWindow.shift();
    }
  }

  /**
   * Calculate hype index - visual excitement factor
   */
  private calculateHypeIndex(dEwma: number, score: [number, number], scoringTeam: 'team1' | 'team2'): number {
    const [s1, s2] = score;
    const totalPoints = s1 + s2;
    
    // Component 1: Momentum change magnitude (40%)
    const momentumComponent = Math.min(1, dEwma * 2.5) * this.hypeWeights.dEwma;
    
    // Component 2: Streak length excitement (25%)
    const streakComponent = Math.min(1, this.state.streak.length / 5) * this.hypeWeights.streakLength;
    
    // Component 3: Recent shift magnitude (20%)
    const recentShifts = this.state.turningPoints.filter(point => point > this.state.totalPoints - 3);
    const shiftComponent = Math.min(1, recentShifts.length / 2) * this.hypeWeights.shiftMagnitude;
    
    // Component 4: Leverage - pressure from being close to target (10%)
    const maxScore = Math.max(s1, s2);
    const pointsToTarget = Math.max(0, this.config.pointTarget - maxScore);
    const leverageComponent = Math.min(1, (this.config.pointTarget - pointsToTarget) / this.config.pointTarget) * this.hypeWeights.leverage;
    
    // Component 5: Deficit severity - comeback potential (5%)
    const deficit = Math.abs(s1 - s2);
    const deficitComponent = Math.min(1, deficit / 4) * this.hypeWeights.deficitSeverity;
    
    // Combine components
    const rawHype = momentumComponent + streakComponent + shiftComponent + leverageComponent + deficitComponent;
    
    // Apply recency decay - more recent points have higher hype
    const recencyMultiplier = Math.min(1.2, 1 + (totalPoints / 20) * 0.2);
    
    return Math.min(1, rawHype * recencyMultiplier);
  }

  /**
   * Get recent deficit reduction for comeback detection
   */
  private getRecentDeficitReduction(team: 'team1' | 'team2'): number {
    if (this.state.recentDeficitWindow.length < 4) return 0;
    
    const recent = this.state.recentDeficitWindow.slice(-4);
    let maxRecentDeficit = 0;
    let currentDeficit = 0;
    
    for (const point of recent) {
      // Only count deficit when other team is leading (ignore tied games)
      if (point.leader !== team && point.leader !== 'tied') {
        maxRecentDeficit = Math.max(maxRecentDeficit, point.deficit);
      }
    }
    
    // Current deficit for this team (ignore tied games)
    const lastPoint = recent[recent.length - 1];
    if (lastPoint.leader !== team && lastPoint.leader !== 'tied') {
      currentDeficit = lastPoint.deficit;
    }
    
    return maxRecentDeficit - currentDeficit;
  }

  /**
   * Update combo tracking for enhanced gaming effects
   */
  private updateCombos() {
    // Track consecutive high-hype points
    if (this.state.hypeIndex > 0.6) {
      this.state.combos.consecutiveHype++;
    } else {
      this.state.combos.consecutiveHype = 0;
    }
    
    // Track recent comebacks (sliding window of 10 points)
    const recentHistory = this.state.history.slice(-10);
    let comebacks = 0;
    
    for (let i = 1; i < recentHistory.length; i++) {
      const prev = recentHistory[i - 1];
      const curr = recentHistory[i];
      
      // Detect momentum flip with high hype
      if (Math.sign(prev.ewma) !== Math.sign(curr.ewma) && curr.hypeIndex > 0.5) {
        comebacks++;
      }
    }
    
    this.state.combos.recentComebacks = comebacks;
  }

  /**
   * Update traditional scoring tracking for side-out pattern detection
   */
  private updateTraditionalScoringTracking(event: MomentumEvent) {
    if (!this.state.traditionalScoring || this.config.scoringType !== 'traditional') return;
    
    const { isSideOut, scoringTeam, hadServe } = event;
    
    if (isSideOut) {
      // Side-out occurred
      this.state.traditionalScoring.consecutiveSideOuts++;
      this.state.traditionalScoring.totalSideOuts++;
      this.state.traditionalScoring.lastRallyOutcome = 'sideout';
      
      // Reset serve dominance for both teams on side-out
      this.state.traditionalScoring.serveDominance.team1 = 0;
      this.state.traditionalScoring.serveDominance.team2 = 0;
    } else {
      // Point scored (team held serve)
      this.state.traditionalScoring.consecutiveSideOuts = 0;
      this.state.traditionalScoring.lastRallyOutcome = 'point';
      
      // Increment serve dominance for the team that held serve
      if (hadServe === scoringTeam) {
        if (scoringTeam === 'team1') {
          this.state.traditionalScoring.serveDominance.team1++;
          this.state.traditionalScoring.serveDominance.team2 = 0; // Reset opponent
        } else {
          this.state.traditionalScoring.serveDominance.team2++;
          this.state.traditionalScoring.serveDominance.team1 = 0; // Reset opponent
        }
      }
    }
  }

  /**
   * Remove the last point and recalculate momentum state
   * This properly backtracks momentum without adding incorrect opposite momentum
   */
  removeLastPoint(): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    
    // Can't remove if no points have been scored
    if (this.state.totalPoints === 0 || this.state.wave.length === 0) {
      return messages;
    }
    
    // Remove the last point from wave and recalculate
    this.state.wave.pop();
    this.state.totalPoints--;
    
    // Recalculate momentum from scratch based on remaining points
    if (this.state.wave.length === 0) {
      // No points left, reset to initial state
      this.state.momentum = 0;
      this.state.momentumScore = 50;
      this.state.streak = { team: 'team1', length: 0 };
      this.state.gamePhase = 'early';
    } else {
      // Recalculate momentum using EWMA from all remaining points
      this.recalculateMomentumFromWave();
    }
    
    // Decrease last message point counter if needed
    if (this.lastMessagePoint >= this.state.totalPoints) {
      this.lastMessagePoint = Math.max(-1, this.state.totalPoints - 1);
    }
    
    // Recompute match closeness after point removal
    const estimatedScore = this.estimateScoreFromMomentum();
    this.state.closeness = this.analyzeMatchCloseness(estimatedScore);
    
    return messages;
  }

  /**
   * Recalculate momentum state from existing wave data
   * Used when backtracking points to ensure accurate momentum
   */
  private recalculateMomentumFromWave() {
    if (this.state.wave.length === 0) return;
    
    // Reset momentum to neutral
    this.state.momentum = 0;
    
    // Replay all momentum calculations from wave data
    for (let i = 0; i < this.state.wave.length; i++) {
      const point = this.state.wave[i];
      // Use the sign of the Y value to determine which team scored
      const signal = point.y > 0 ? 1 : -1;
      this.state.momentum = (1 - this.alpha) * this.state.momentum + this.alpha * signal;
      this.state.momentum = Math.max(-1, Math.min(1, this.state.momentum));
    }
    
    this.state.momentumScore = Math.round(((this.state.momentum + 1) / 2) * 100);
    
    // Recalculate streak based on recent momentum direction
    this.recalculateStreak();
    
    // Update game phase based on current total points (approximation)
    const approximateScore = this.estimateScoreFromMomentum();
    this.updateGamePhase(approximateScore);
  }

  /**
   * Recalculate streak based on recent momentum direction
   */
  private recalculateStreak() {
    if (this.state.wave.length === 0) {
      this.state.streak = { team: 'team1', length: 0 };
      return;
    }
    
    const recentPoints = this.state.wave.slice(-5); // Look at last 5 points
    let streakTeam: 'team1' | 'team2' = this.state.momentum > 0 ? 'team1' : 'team2';
    let streakLength = 1;
    
    // Count consecutive points in the same direction
    for (let i = recentPoints.length - 2; i >= 0; i--) {
      const current = recentPoints[i + 1];
      const previous = recentPoints[i];
      
      const currentTeam = current.y > 0 ? 'team1' : 'team2';
      const previousTeam = previous.y > 0 ? 'team1' : 'team2';
      
      if (currentTeam === previousTeam && currentTeam === streakTeam) {
        streakLength++;
      } else {
        break;
      }
    }
    
    this.state.streak = { team: streakTeam, length: Math.min(streakLength, recentPoints.length) };
  }

  /**
   * Estimate score from momentum data (approximation for game phase calculation)
   */
  private estimateScoreFromMomentum(): [number, number] {
    const totalPoints = this.state.totalPoints;
    const momentum = this.state.momentum;
    
    // Simple approximation: distribute points based on momentum bias
    const team1Bias = (momentum + 1) / 2; // Convert [-1,1] to [0,1]
    const team1Points = Math.round(totalPoints * team1Bias);
    const team2Points = totalPoints - team1Points;
    
    return [team1Points, team2Points];
  }

  /**
   * Analyze match closeness based on momentum patterns and scoring
   */
  private analyzeMatchCloseness(currentScore: [number, number]): MatchCloseness {
    const wave = this.state.wave;
    const totalPoints = this.state.totalPoints;
    
    if (totalPoints < 4) {
      // Not enough data for meaningful analysis
      return {
        level: 'competitive',
        score: 75,
        description: 'Match just getting started...',
        indicators: {
          momentumBalance: 50,
          shiftFrequency: 0,
          streakVolatility: 0,
          scoreProximity: 100
        }
      };
    }

    // 1. Momentum Balance - how close to 50/50 the momentum is
    const momentumBalance = 100 - Math.abs(this.state.momentumScore - 50) * 2;
    
    // 2. Shift Frequency - count momentum shifts in the wave
    let shifts = 0;
    for (let i = 1; i < wave.length; i++) {
      const prev = wave[i - 1].y;
      const curr = wave[i].y;
      if ((prev > 0) !== (curr > 0)) {
        shifts++;
      }
    }
    const shiftFrequency = Math.min(100, (shifts / Math.max(1, totalPoints - 1)) * 100 * 5); // Scale up frequency
    
    // 3. Streak Volatility - analyze streak length variations
    const streakLengths: number[] = [];
    let currentStreakLength = 1;
    let currentStreakTeam = wave[0]?.y > 0 ? 'team1' : 'team2';
    
    for (let i = 1; i < wave.length; i++) {
      const team = wave[i].y > 0 ? 'team1' : 'team2';
      if (team === currentStreakTeam) {
        currentStreakLength++;
      } else {
        streakLengths.push(currentStreakLength);
        currentStreakLength = 1;
        currentStreakTeam = team;
      }
    }
    if (currentStreakLength > 0) {
      streakLengths.push(currentStreakLength);
    }
    
    const avgStreakLength = streakLengths.length > 0 ? 
      streakLengths.reduce((a, b) => a + b, 0) / streakLengths.length : 1;
    const maxStreakLength = Math.max(...streakLengths, 1);
    const minStreakLength = Math.min(...streakLengths, 1);
    
    // Fixed: Higher volatility = more varied streak lengths
    const streakRange = maxStreakLength - minStreakLength;
    const streakVolatility = Math.min(100, (streakRange / Math.max(1, avgStreakLength)) * 30); // Scale to 0-100
    
    // 4. Score Proximity - how close the scores are
    const [team1Score, team2Score] = currentScore;
    const scoreDiff = Math.abs(team1Score - team2Score);
    const maxPossibleDiff = Math.max(team1Score, team2Score, 1);
    const scoreProximity = Math.max(0, 100 - (scoreDiff / maxPossibleDiff) * 100);
    
    // Calculate overall closeness score
    const weights = {
      momentumBalance: 0.3,
      shiftFrequency: 0.25,
      streakVolatility: 0.2,
      scoreProximity: 0.25
    };
    
    const overallScore = 
      momentumBalance * weights.momentumBalance +
      shiftFrequency * weights.shiftFrequency +
      streakVolatility * weights.streakVolatility +
      scoreProximity * weights.scoreProximity;
    
    // Determine level and description
    let level: MatchCloseness['level'];
    let description: string;
    
    if (overallScore >= 80) {
      level = 'nail-biter';
      description = 'Edge-of-your-seat thriller! 🔥';
    } else if (overallScore >= 60) {
      level = 'competitive';
      description = 'Highly competitive match ⚡';
    } else if (overallScore >= 35) {
      level = 'one-sided';
      description = 'One team pulling ahead 📈';
    } else {
      level = 'blowout';
      description = 'Total domination 💥';
    }
    
    return {
      level,
      score: Math.round(overallScore),
      description,
      indicators: {
        momentumBalance: Math.round(momentumBalance),
        shiftFrequency: Math.round(shiftFrequency),
        streakVolatility: Math.round(streakVolatility),
        scoreProximity: Math.round(scoreProximity)
      }
    };
  }

  getState(): MomentumState {
    const currentScore = this.estimateScoreFromMomentum();
    const closeness = this.analyzeMatchCloseness(currentScore);
    
    return { 
      ...this.state,
      closeness 
    };
  }

  reset() {
    this.state = {
      momentum: 0,
      hypeIndex: 0,
      momentumScore: 50,
      streak: { team: 'team1', length: 0 },
      wave: [],
      history: [],
      turningPoints: [],
      maxDeficitPerTeam: { team1: 0, team2: 0 },
      recentDeficitWindow: [],
      totalPoints: 0,
      gamePhase: 'early',
      combos: {
        consecutiveHype: 0,
        recentComebacks: 0
      }
    };
    this.lastMessagePoint = -1;
  }
}