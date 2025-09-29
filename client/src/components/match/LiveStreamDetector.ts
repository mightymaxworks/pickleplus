/**
 * LiveStreamDetector - Detects and manages live stream status for gaming features
 * Determines if a match is happening live vs replaying recorded content
 */

export type StreamStatus = 'live' | 'recorded' | 'offline' | 'detecting';

export interface LiveStreamState {
  status: StreamStatus;
  isLive: boolean;
  streamId?: string;
  viewerCount?: number;
  startTime?: Date;
  gamingFeaturesEnabled: boolean;
  latency?: number; // ms delay for live stream
}

export interface StreamDetectionConfig {
  autoDetect: boolean;
  streamingPlatforms: string[];
  pollInterval: number; // ms
  enableGamingFeatures: boolean;
}

export class LiveStreamDetector {
  private state: LiveStreamState;
  private config: StreamDetectionConfig;
  private pollTimer?: NodeJS.Timeout;
  private listeners: ((state: LiveStreamState) => void)[] = [];

  constructor(config: Partial<StreamDetectionConfig> = {}) {
    this.config = {
      autoDetect: true,
      streamingPlatforms: ['youtube', 'twitch', 'custom'],
      pollInterval: 5000, // Check every 5 seconds
      enableGamingFeatures: true,
      ...config
    };

    this.state = {
      status: 'detecting',
      isLive: false,
      gamingFeaturesEnabled: false
    };
  }

  /**
   * Start monitoring for live stream status
   */
  startDetection(): void {
    console.log('🔴 Starting live stream detection...');
    
    if (this.config.autoDetect) {
      this.pollTimer = setInterval(() => {
        this.detectStreamStatus();
      }, this.config.pollInterval);
    }

    // Initial detection
    this.detectStreamStatus();
  }

  /**
   * Stop monitoring and cleanup
   */
  stopDetection(): void {
    console.log('⏹️ Stopping live stream detection...');
    
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }

    this.updateState({
      status: 'offline',
      isLive: false,
      gamingFeaturesEnabled: false
    });
  }

  /**
   * Core detection logic - determines if content is live
   */
  private async detectStreamStatus(): Promise<void> {
    try {
      // Check for various indicators of live streaming
      const indicators = await this.gatherLiveIndicators();
      
      const isLive = this.analyzeLiveIndicators(indicators);
      const newStatus: StreamStatus = isLive ? 'live' : 'recorded';
      
      // Only update if status changed
      if (newStatus !== this.state.status) {
        console.log(`📡 Stream status changed: ${this.state.status} → ${newStatus}`);
        
        this.updateState({
          status: newStatus,
          isLive,
          gamingFeaturesEnabled: isLive && this.config.enableGamingFeatures,
          startTime: isLive ? new Date() : undefined
        });
      }
    } catch (error) {
      console.error('❌ Stream detection error:', error);
      this.updateState({
        status: 'offline',
        isLive: false,
        gamingFeaturesEnabled: false
      });
    }
  }

  /**
   * Gather indicators that suggest live streaming
   */
  private async gatherLiveIndicators(): Promise<{
    hasWebRTC: boolean;
    hasLiveVideoElement: boolean;
    hasStreamingSDK: boolean;
    userActivityPattern: 'live' | 'replay';
    networkPattern: 'live' | 'cached';
  }> {
    return {
      // Check for WebRTC connections (live streaming)
      hasWebRTC: this.checkWebRTCConnections(),
      
      // Check for live video elements
      hasLiveVideoElement: this.checkLiveVideoElements(),
      
      // Check for streaming SDKs
      hasStreamingSDK: this.checkStreamingSDKs(),
      
      // Analyze user activity patterns
      userActivityPattern: this.analyzeUserActivity(),
      
      // Check network request patterns
      networkPattern: this.analyzeNetworkPattern()
    };
  }

  /**
   * Analyze indicators to determine if stream is live
   */
  private analyzeLiveIndicators(indicators: any): boolean {
    const liveScore = 
      (indicators.hasWebRTC ? 30 : 0) +
      (indicators.hasLiveVideoElement ? 25 : 0) +
      (indicators.hasStreamingSDK ? 20 : 0) +
      (indicators.userActivityPattern === 'live' ? 15 : 0) +
      (indicators.networkPattern === 'live' ? 10 : 0);

    console.log('🎯 Live detection score:', liveScore, indicators);
    
    // Consider live if score > 50
    return liveScore > 50;
  }

  private checkWebRTCConnections(): boolean {
    // Check for active WebRTC peer connections
    try {
      return (window as any).RTCPeerConnection && 
             Object.keys((window as any)).some(key => 
               key.toLowerCase().includes('webrtc') || 
               key.toLowerCase().includes('stream')
             );
    } catch {
      return false;
    }
  }

  private checkLiveVideoElements(): boolean {
    // Check for video elements with live indicators
    const videos = document.querySelectorAll('video');
    return Array.from(videos).some(video => 
      !video.paused && 
      video.currentTime > 0 && 
      video.duration === Infinity // Live streams often have infinite duration
    );
  }

  private checkStreamingSDKs(): boolean {
    // Check for common streaming SDK presence
    const streamingSDKs = [
      'OBS', 'Streamlabs', 'Twitch', 'YouTube', 'FacebookLive',
      'hls', 'dash', 'webrtc', 'socket.io'
    ];
    
    return streamingSDKs.some(sdk => 
      (window as any)[sdk] || 
      document.querySelector(`script[src*="${sdk.toLowerCase()}"]`)
    );
  }

  private analyzeUserActivity(): 'live' | 'replay' {
    // In live streams, users typically don't skip around
    // This would be enhanced with actual user interaction tracking
    return 'live'; // Placeholder for now
  }

  private analyzeNetworkPattern(): 'live' | 'cached' {
    // Live streams have continuous network requests
    // Recorded content might be cached
    return 'live'; // Placeholder for now
  }

  /**
   * Manually set stream status (for testing or user override)
   */
  setStreamStatus(status: StreamStatus, force = false): void {
    if (force || status === 'offline') {
      this.updateState({
        status,
        isLive: status === 'live',
        gamingFeaturesEnabled: status === 'live' && this.config.enableGamingFeatures
      });
    }
  }

  /**
   * Subscribe to stream status changes
   */
  subscribe(callback: (state: LiveStreamState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get current stream state
   */
  getState(): LiveStreamState {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<LiveStreamState>): void {
    this.state = { ...this.state, ...updates };
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('❌ Stream state listener error:', error);
      }
    });
  }

  /**
   * Enable gaming features manually
   */
  enableGamingFeatures(enable = true): void {
    this.updateState({
      gamingFeaturesEnabled: enable && this.state.isLive
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopDetection();
    this.listeners = [];
  }
}

// Global singleton instance
export const liveStreamDetector = new LiveStreamDetector();