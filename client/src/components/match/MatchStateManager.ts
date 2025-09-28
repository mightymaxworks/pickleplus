/**
 * MatchStateManager - Manages live vs recorded match states and feature toggles
 * Coordinates between live stream detection and gaming features
 */

import { liveStreamDetector, LiveStreamState } from './LiveStreamDetector';
import { MomentumEngine, MomentumState } from './MomentumEngine';

export type MatchMode = 'live' | 'recorded' | 'offline';

export interface MatchStateConfig {
  enableGamingFeatures: boolean;
  enableCrowdEngine: boolean;
  enableLiveChat: boolean;
  enablePredictions: boolean;
  enableEmotes: boolean;
  enableHypeTrain: boolean;
  enableLiveCommentary: boolean;
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
  streamState: LiveStreamState;
  momentum: MomentumState;
  gamingFeatures: GamingFeatures;
  viewerCount: number;
  chatMessages: ChatMessage[];
  predictions: PredictionState[];
  crowdEnergy: number; // 0-100
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'emote' | 'prediction';
}

export interface PredictionState {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  isActive: boolean;
  closeTime?: Date;
}

export class MatchStateManager {
  private state: MatchState;
  private config: MatchStateConfig;
  private momentumEngine?: MomentumEngine;
  private listeners: ((state: MatchState) => void)[] = [];
  private unsubscribeFromStream?: () => void;
  private manualOverride: boolean = false;

  constructor(config: Partial<MatchStateConfig> = {}) {
    this.config = {
      enableGamingFeatures: true,
      enableCrowdEngine: true,
      enableLiveChat: true,
      enablePredictions: true,
      enableEmotes: true,
      enableHypeTrain: true,
      enableLiveCommentary: true,
      ...config
    };

    this.state = {
      mode: 'offline',
      isLive: false,
      streamState: liveStreamDetector.getState(),
      momentum: {
        momentum: 0,
        momentumScore: 50,
        streak: { team: 'team1', length: 0 },
        wave: [],
        totalPoints: 0,
        gamePhase: 'early'
      },
      gamingFeatures: this.calculateGamingFeatures('offline'),
      viewerCount: 0,
      chatMessages: [],
      predictions: [],
      crowdEnergy: 50
    };
  }

  /**
   * Initialize the match state manager
   */
  initialize(momentumEngine?: MomentumEngine): void {
    console.log('🚀 Initializing MatchStateManager...');
    
    this.momentumEngine = momentumEngine;
    
    // Subscribe to live stream detector
    this.unsubscribeFromStream = liveStreamDetector.subscribe((streamState) => {
      this.handleStreamStateChange(streamState);
    });

    // Start live stream detection
    liveStreamDetector.startDetection();
  }

  /**
   * Handle stream state changes from detector
   */
  private handleStreamStateChange(streamState: LiveStreamState): void {
    // Skip automatic detection if manual override is active
    if (this.manualOverride) {
      console.log('🔒 Manual override active - skipping automatic detection');
      return;
    }

    const newMode: MatchMode = streamState.isLive ? 'live' : 
                               streamState.status === 'offline' ? 'offline' : 'recorded';
    
    console.log(`🔄 Match mode changed: ${this.state.mode} → ${newMode}`);
    
    this.updateState({
      mode: newMode,
      isLive: streamState.isLive,
      streamState,
      gamingFeatures: this.calculateGamingFeatures(newMode)
    });

    // Trigger mode-specific initialization
    if (newMode === 'live') {
      this.initializeLiveMode();
    } else {
      this.initializeRecordedMode();
    }
  }

  /**
   * Calculate which gaming features should be enabled
   */
  private calculateGamingFeatures(mode: MatchMode): GamingFeatures {
    const isLive = mode === 'live';
    
    return {
      crowdEnergyMeter: isLive && this.config.enableCrowdEngine,
      hypeTrainEffects: isLive && this.config.enableHypeTrain,
      liveChat: isLive && this.config.enableLiveChat,
      predictionMarkets: isLive && this.config.enablePredictions,
      emoteReactions: isLive && this.config.enableEmotes,
      liveCommentary: isLive && this.config.enableLiveCommentary,
      instantReplay: isLive, // Available for live only
      socialSharing: true // Available for both modes
    };
  }

  /**
   * Initialize live match mode with all gaming features
   */
  private initializeLiveMode(): void {
    console.log('🔴 LIVE MODE ACTIVATED - Gaming features enabled!');
    
    // Reset crowd energy for new live session
    this.updateState({
      crowdEnergy: 50,
      viewerCount: Math.floor(Math.random() * 100) + 10, // Placeholder
      chatMessages: [],
      predictions: []
    });

    // Initialize live-specific systems
    this.startCrowdEnergyTracking();
    this.initializePredictionSystem();
    
    // Emit live mode activation event
    this.emitModeChange('live');
  }

  /**
   * Initialize recorded mode with analysis features
   */
  private initializeRecordedMode(): void {
    console.log('📹 RECORDED MODE - Analysis features enabled');
    
    // Disable real-time features
    this.updateState({
      viewerCount: 0,
      chatMessages: [],
      predictions: [],
      crowdEnergy: 0
    });

    this.emitModeChange('recorded');
  }

  /**
   * Start tracking crowd energy based on momentum
   */
  private startCrowdEnergyTracking(): void {
    // Crowd energy follows momentum changes
    if (this.momentumEngine) {
      // This would be enhanced with actual viewer reactions
      const momentum = this.momentumEngine.getState();
      const crowdEnergy = 50 + (momentum.momentum * 50); // Convert -1,1 to 0,100
      
      this.updateState({
        crowdEnergy: Math.max(0, Math.min(100, crowdEnergy))
      });
    }
  }

  /**
   * Initialize prediction system for live matches
   */
  private initializePredictionSystem(): void {
    // Example prediction
    const samplePrediction: PredictionState = {
      id: 'next-point',
      question: 'Who will win the next point?',
      options: ['Player 1', 'Player 2'],
      votes: { 'Player 1': 0, 'Player 2': 0 },
      isActive: true
    };

    this.updateState({
      predictions: [samplePrediction]
    });
  }

  /**
   * Update momentum state from engine
   */
  updateMomentum(momentum: MomentumState): void {
    this.updateState({ momentum });
    
    // Update crowd energy based on momentum in live mode
    if (this.state.isLive) {
      this.startCrowdEnergyTracking();
    }
  }

  /**
   * Add chat message (live mode only)
   */
  addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    if (!this.state.isLive) return;
    
    const chatMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    this.updateState({
      chatMessages: [...this.state.chatMessages.slice(-50), chatMessage] // Keep last 50
    });
  }

  /**
   * Submit prediction vote (live mode only)
   */
  submitPredictionVote(predictionId: string, option: string): void {
    if (!this.state.isLive) return;
    
    this.updateState({
      predictions: this.state.predictions.map(pred => 
        pred.id === predictionId 
          ? { ...pred, votes: { ...pred.votes, [option]: (pred.votes[option] || 0) + 1 } }
          : pred
      )
    });
  }

  /**
   * Force set match mode (for testing) with manual override
   */
  setMode(mode: MatchMode): void {
    console.log(`🎮 Manual mode toggle: ${mode}`);
    
    // Enable manual override to prevent automatic detection from overriding this
    this.manualOverride = true;
    
    // Directly update the match state
    const newMode = mode;
    const isLive = mode === 'live';
    
    this.updateState({
      mode: newMode,
      isLive: isLive,
      gamingFeatures: this.calculateGamingFeatures(newMode)
    });

    // Trigger mode-specific initialization
    if (newMode === 'live') {
      this.initializeLiveMode();
    } else {
      this.initializeRecordedMode();
    }
    
    // Clear manual override after 30 seconds to allow normal detection
    setTimeout(() => {
      console.log('🔓 Manual override timeout - resuming automatic detection');
      this.manualOverride = false;
    }, 30000);
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
        console.error('❌ Match state listener error:', error);
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
   * Start live stream detection
   */
  startLiveDetection(): void {
    console.log('▶️ Starting live stream detection...');
    liveStreamDetector.startDetection();
  }

  /**
   * Stop live stream detection
   */
  stopLiveDetection(): void {
    console.log('⏸️ Stopping live stream detection...');
    liveStreamDetector.stopDetection();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('🗑️ Destroying MatchStateManager...');
    
    if (this.unsubscribeFromStream) {
      this.unsubscribeFromStream();
    }
    
    liveStreamDetector.stopDetection();
    this.listeners = [];
  }
}

// Export singleton instance
export const matchStateManager = new MatchStateManager();