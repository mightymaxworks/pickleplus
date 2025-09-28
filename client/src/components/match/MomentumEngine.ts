/**
 * MomentumEngine - Strategic match momentum tracking with EWMA calculations
 * Generates strategic messages and tracks momentum swings for epic match experience
 */

export interface MomentumEvent {
  pointNo: number;
  scoringTeam: 'team1' | 'team2';
  score: [number, number]; // [team1Score, team2Score]
  hadServe?: 'team1' | 'team2';
  timestamp: number;
  tags: string[];
}

export interface MomentumState {
  momentum: number; // EWMA value [-1, 1]
  momentumScore: number; // UI-friendly [0, 100]
  streak: {
    team: 'team1' | 'team2';
    length: number;
  };
  lastShiftAt?: number;
  wave: Array<{ x: number; y: number }>;
  totalPoints: number;
  gamePhase: 'early' | 'mid' | 'late' | 'critical';
}

export interface StrategyMessage {
  id: string;
  type: 'firstBlood' | 'streak' | 'momentumShift' | 'clutchSave' | 'comeback' | 'gamePoint' | 'matchPoint' | 'break' | 'deuce';
  priority: 0 | 1 | 2 | 3; // 0=highest, 3=lowest
  text: string;
  timestamp: number;
  pointNo: number;
  team?: 'team1' | 'team2';
  duration: number; // ms
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
  private alpha = 0.35; // EWMA smoothing factor
  private shiftThreshold = 0.3; // Momentum shift detection threshold
  private messageQueue: StrategyMessage[] = [];
  private gameHistory: Array<{ game: number; winner: 'team1' | 'team2'; score: [number, number] }> = [];
  private lastMessagePoint = -1;

  constructor(config: MatchConfig) {
    this.config = config;
    this.state = {
      momentum: 0,
      momentumScore: 50,
      streak: { team: 'team1', length: 0 },
      wave: [],
      totalPoints: 0,
      gamePhase: 'early'
    };
  }

  /**
   * Process a point scored and generate strategic messages
   */
  processPoint(event: MomentumEvent): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    const prevMomentum = this.state.momentum;
    
    // Update momentum using EWMA
    const signal = event.scoringTeam === 'team1' ? 1 : -1;
    this.state.momentum = (1 - this.alpha) * this.state.momentum + this.alpha * signal;
    this.state.momentum = Math.max(-1, Math.min(1, this.state.momentum)); // Clamp [-1, 1]
    this.state.momentumScore = Math.round(((this.state.momentum + 1) / 2) * 100);
    
    // Update wave data
    this.state.wave.push({ x: event.pointNo, y: this.state.momentum });
    this.state.totalPoints = event.pointNo;
    
    // Update game phase
    this.updateGamePhase(event.score);
    
    // Update streak
    this.updateStreak(event.scoringTeam);
    
    // Generate strategic messages (rate limited to 1 per point)
    if (this.lastMessagePoint !== event.pointNo) {
      messages.push(...this.generateMessages(event, prevMomentum));
      this.lastMessagePoint = event.pointNo;
    }
    
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

  private generateMessages(event: MomentumEvent, prevMomentum: number): StrategyMessage[] {
    const messages: StrategyMessage[] = [];
    const { scoringTeam, score, pointNo } = event;
    
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
    
    // Service break / Momentum snatch
    const breakMessage = this.checkBreakScenario(event);
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
    const messages = {
      2: { text: '🔥 HEATING UP!', priority: 2 as const },
      3: { text: '🌋 ON FIRE!', priority: 1 as const },
      4: { text: '⚡ BLAZING HOT!', priority: 1 as const },
      5: { text: '🚀 UNSTOPPABLE!', priority: 0 as const }
    };
    
    const key = Math.min(length, 5) as keyof typeof messages;
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
    const deficit = scoringTeam === 'team1' ? s2 - s1 : s1 - s2;
    
    // Comeback when trailing by 4+ points and now within 1
    if (deficit >= 3 && deficit <= 1) {
      return this.createMessage('comeback', '🔥 INCREDIBLE COMEBACK!', scoringTeam, 1);
    }
    
    return null;
  }

  private checkBreakScenario(event: MomentumEvent): StrategyMessage | null {
    // Traditional scoring: Break of serve
    if (this.config.scoringType === 'traditional' && event.hadServe) {
      const servingTeam = event.hadServe;
      if (event.scoringTeam !== servingTeam) {
        return this.createMessage('break', '💥 BREAK OF SERVE!', event.scoringTeam, 2);
      }
    }
    
    // Rally scoring: Momentum snatch (breaking 2+ streak)
    if (this.config.scoringType === 'rally' && this.state.streak.length >= 2) {
      const prevStreakTeam = this.state.streak.team === 'team1' ? 'team2' : 'team1';
      if (event.scoringTeam !== prevStreakTeam) {
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

  getState(): MomentumState {
    return { ...this.state };
  }

  reset() {
    this.state = {
      momentum: 0,
      momentumScore: 50,
      streak: { team: 'team1', length: 0 },
      wave: [],
      totalPoints: 0,
      gamePhase: 'early'
    };
    this.lastMessagePoint = -1;
  }
}