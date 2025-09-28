/**
 * MatchStateManager - Simplified match state management without complex live detection
 * Focuses on core match functionality without overcomplicated streaming detection
 */

import { MomentumEngine, MomentumState } from './MomentumEngine';

export type MatchMode = 'live' | 'recorded' | 'offline';

export interface MatchStateConfig {
  enableGamingFeatures: boolean;
  initialMode: MatchMode;
}

export interface GamingFeatures {
  crowdEnergyMeter: boolean;
  hypeTrainEffects: boolean;
  liveChat: boolean;
  predictionMarkets: boolean;
  emoteReactions: boolean;
  liveCommentary: boolean;
  instantReplay: boolean;
  socialSharing: boolean;
}

export interface MatchState {
  mode: MatchMode;
  isLive: boolean;
  momentum: MomentumState;
  gamingFeatures: GamingFeatures;
  viewerCount: number;
  crowdEnergy: number; // 0-100
}

export class MatchStateManager {
  private state: MatchState;
  private config: MatchStateConfig;
  private momentumEngine?: MomentumEngine;
  private listeners: ((state: MatchState) => void)[] = [];

  constructor(config: Partial<MatchStateConfig> = {}) {
    this.config = {
      enableGamingFeatures: true,
      initialMode: 'offline',
      ...config
    };

    this.state = {
      mode: this.config.initialMode,
      isLive: this.config.initialMode === 'live',
      momentum: {
        momentum: 0,
        momentumScore: 50,
        streak: { team: 'team1', length: 0 },
        wave: [],
        totalPoints: 0,
        gamePhase: 'early'
      },
      gamingFeatures: this.calculateGamingFeatures(this.config.initialMode),
      viewerCount: 0,
      crowdEnergy: 50
    };
  }

  /**
   * Initialize the match state manager
   */
  initialize(momentumEngine?: MomentumEngine): void {
    this.momentumEngine = momentumEngine;
  }

  /**
   * Calculate which gaming features should be enabled
   */
  private calculateGamingFeatures(mode: MatchMode): GamingFeatures {
    const isLive = mode === 'live';
    const featuresEnabled = this.config.enableGamingFeatures;
    
    return {
      crowdEnergyMeter: isLive && featuresEnabled,
      hypeTrainEffects: isLive && featuresEnabled,
      liveChat: isLive && featuresEnabled,
      predictionMarkets: isLive && featuresEnabled,
      emoteReactions: isLive && featuresEnabled,
      liveCommentary: isLive && featuresEnabled,
      instantReplay: isLive && featuresEnabled,
      socialSharing: true // Always available
    };
  }

  /**
   * Update momentum state from engine
   */
  updateMomentum(momentum: MomentumState): void {
    this.updateState({ momentum });
    
    // Update crowd energy based on momentum in live mode
    if (this.state.isLive) {
      this.updateCrowdEnergy(momentum);
    }
  }

  /**
   * Update crowd energy based on momentum
   */
  private updateCrowdEnergy(momentum: MomentumState): void {
    const crowdEnergy = 50 + (momentum.momentum * 50); // Convert -1,1 to 0,100
    this.updateState({
      crowdEnergy: Math.max(0, Math.min(100, crowdEnergy))
    });
  }

  /**
   * Set match mode manually (simplified - no automatic detection)
   */
  setMode(mode: MatchMode): void {
    const isLive = mode === 'live';
    
    this.updateState({
      mode,
      isLive,
      gamingFeatures: this.calculateGamingFeatures(mode),
      viewerCount: isLive ? Math.floor(Math.random() * 100) + 10 : 0,
      crowdEnergy: isLive ? 50 : 0
    });

    this.emitModeChange(mode);
  }

  /**
   * Enable/disable gaming features
   */
  setGamingFeatures(enabled: boolean): void {
    this.config.enableGamingFeatures = enabled;
    this.updateState({
      gamingFeatures: this.calculateGamingFeatures(this.state.mode)
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: MatchState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get current state
   */
  getState(): MatchState {
    return { ...this.state };
  }

  /**
   * Check if specific gaming feature is enabled
   */
  isFeatureEnabled(feature: keyof GamingFeatures): boolean {
    return this.state.gamingFeatures[feature];
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<MatchState>): void {
    this.state = { ...this.state, ...updates };
    
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Match state listener error:', error);
      }
    });
  }

  /**
   * Emit mode change events
   */
  private emitModeChange(mode: MatchMode): void {
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('matchModeChange', { 
      detail: { mode, state: this.state } 
    }));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.listeners = [];
  }
}

// Export singleton instance
export const matchStateManager = new MatchStateManager();