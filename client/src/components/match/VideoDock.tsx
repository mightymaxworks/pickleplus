import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Settings,
  ExternalLink,
  Wifi,
  WifiOff,
  Youtube,
  TestTube,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoConfig {
  liveStreamUrl?: string;
  recordingUrl?: string;
  videoProvider?: 'hls' | 'mp4' | 'youtube' | 'vimeo';
  videoSyncOffset?: number; // seconds
  youtubeUrl?: string; // For testing with YouTube videos
  testingMode?: boolean; // Enable testing controls
}

interface MomentumTestEvent {
  type: 'point_won' | 'point_lost' | 'rally_long' | 'ace' | 'error' | 'comeback';
  intensity: number; // 0-1
  description: string;
}

interface VideoDockProps {
  config: VideoConfig;
  isVisible: boolean;
  onSyncOffsetChange: (offset: number) => void;
  onMomentumTest?: (event: MomentumTestEvent) => void; // For testing momentum events
  className?: string;
}

export const VideoDock = ({ config, isVisible, onSyncOffsetChange, onMomentumTest, className = '' }: VideoDockProps) => {
  const [isDocked, setIsDocked] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [syncOffset, setSyncOffset] = useState(config.videoSyncOffset || 0);
  const [showSettings, setShowSettings] = useState(false);
  const [hlsError, setHlsError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState(config.youtubeUrl || '');
  const [showTestingControls, setShowTestingControls] = useState(config.testingMode || false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<any>(null);

  // Detect if this is a live stream
  useEffect(() => {
    setIsLive(!!config.liveStreamUrl);
  }, [config.liveStreamUrl]);

  // Load HLS for live streams
  useEffect(() => {
    if (config.liveStreamUrl && config.videoProvider === 'hls' && videoRef.current) {
      loadHLSStream();
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [config.liveStreamUrl]);

  const loadHLSStream = async () => {
    if (!config.liveStreamUrl || !videoRef.current) return;

    try {
      // Check if browser supports HLS natively (Safari)
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = config.liveStreamUrl;
        setHlsError(null);
      } else {
        // Use hls.js for other browsers
        const { default: Hls } = await import('hls.js');
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 5
          });
          
          hlsRef.current = hls;
          hls.loadSource(config.liveStreamUrl);
          hls.attachMedia(videoRef.current);
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setHlsError('Failed to load live stream');
            }
          });
          
          setHlsError(null);
        } else {
          setHlsError('Live streaming not supported in this browser');
        }
      }
    } catch (error) {
      setHlsError('Failed to load video player');
      console.error('HLS loading error:', error);
    }
  };

  const renderVideoPlayer = () => {
    if (config.liveStreamUrl && config.videoProvider === 'hls') {
      return (
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={false}
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.volume = volume;
              }
            }}
          />
          
          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          
          {/* HLS Error */}
          {hlsError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <WifiOff className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <div className="text-sm">{hlsError}</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (config.recordingUrl) {
      if (config.videoProvider === 'youtube') {
        const videoId = extractYouTubeId(config.recordingUrl);
        return (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      if (config.videoProvider === 'vimeo') {
        const videoId = extractVimeoId(config.recordingUrl);
        return (
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${videoId}?autoplay=0&controls=1`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }

      if (config.videoProvider === 'mp4') {
        return (
          <video
            ref={videoRef}
            src={config.recordingUrl}
            className="w-full h-full object-cover"
            controls={false}
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );
      }
    }

    return (
      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Play className="h-8 w-8 mx-auto mb-2" />
          <div className="text-sm">No video available</div>
        </div>
      </div>
    );
  };

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const extractVimeoId = (url: string): string => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleSyncOffsetChange = (newOffset: number[]) => {
    const offset = newOffset[0];
    setSyncOffset(offset);
    onSyncOffsetChange(offset);
  };

  // YouTube URL processing
  const processYouTubeUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&enablejsapi=1` : '';
  };

  // Testing momentum events
  const triggerTestMomentumEvent = (event: MomentumTestEvent) => {
    onMomentumTest?.(event);
  };

  // Predefined test events for realistic testing
  const testEvents: MomentumTestEvent[] = [
    { type: 'point_won', intensity: 0.7, description: 'Winning Point' },
    { type: 'point_lost', intensity: 0.6, description: 'Point Lost' },
    { type: 'rally_long', intensity: 0.8, description: 'Epic Rally' },
    { type: 'ace', intensity: 0.9, description: 'Ace Serve' },
    { type: 'error', intensity: 0.5, description: 'Unforced Error' },
    { type: 'comeback', intensity: 1.0, description: 'Amazing Comeback' }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed z-40 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl ${
          isDocked 
            ? 'bottom-4 right-4 w-80 h-48' 
            : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64'
        } ${className}`}
      >
        {/* Video content */}
        <div className="relative w-full h-full">
          {renderVideoPlayer()}
          
          {/* Controls overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                {/* Top controls */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setIsDocked(!isDocked)}
                  >
                    {isDocked ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                  {/* Play/Pause for video elements */}
                  {(config.videoProvider === 'hls' || config.videoProvider === 'mp4') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}

                  {/* Volume controls */}
                  {(config.videoProvider === 'hls' || config.videoProvider === 'mp4') && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      <div className="w-16">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          onValueChange={handleVolumeChange}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {/* Live status */}
                  {isLive && (
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Wifi className="h-3 w-3 text-green-400" />
                      <span>LIVE</span>
                    </div>
                  )}

                  {/* External link for YouTube/Vimeo */}
                  {(config.videoProvider === 'youtube' || config.videoProvider === 'vimeo') && config.recordingUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={() => window.open(config.recordingUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-12 right-2 bg-slate-800 border border-slate-600 rounded-lg p-3 min-w-48 z-10"
              >
                <div className="space-y-3">
                  <div className="text-sm font-bold text-white">Video Sync</div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Offset: {syncOffset}s</span>
                      <span>Match timing</span>
                    </div>
                    <Slider
                      value={[syncOffset]}
                      onValueChange={handleSyncOffsetChange}
                      min={-30}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => handleSyncOffsetChange([0])}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset Sync
                  </Button>

                  {/* YouTube Testing Section */}
                  {config.testingMode && (
                    <>
                      <div className="border-t border-slate-600 pt-3 mt-3">
                        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-500" />
                          YouTube Testing
                        </div>
                        
                        <div className="space-y-2">
                          <Input
                            placeholder="Paste YouTube URL..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="h-7 text-xs bg-slate-700 border-slate-600"
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs"
                            onClick={() => setShowTestingControls(!showTestingControls)}
                          >
                            <TestTube className="h-3 w-3 mr-1" />
                            {showTestingControls ? 'Hide' : 'Show'} Testing Controls
                          </Button>
                        </div>
                      </div>
                      
                      {/* Momentum Testing Controls */}
                      {showTestingControls && (
                        <div className="border-t border-slate-600 pt-3 mt-3">
                          <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            Momentum Testing
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1">
                            {testEvents.map((event, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs p-1 bg-slate-700/50 hover:bg-slate-600/70 text-white"
                                onClick={() => triggerTestMomentumEvent(event)}
                              >
                                {event.type === 'point_won' && <TrendingUp className="h-3 w-3 mr-1 text-green-400" />}
                                {event.type === 'point_lost' && <TrendingDown className="h-3 w-3 mr-1 text-red-400" />}
                                {event.type === 'rally_long' && <Activity className="h-3 w-3 mr-1 text-yellow-400" />}
                                {event.type === 'ace' && <Zap className="h-3 w-3 mr-1 text-purple-400" />}
                                {event.type === 'error' && <TrendingDown className="h-3 w-3 mr-1 text-orange-400" />}
                                {event.type === 'comeback' && <BarChart3 className="h-3 w-3 mr-1 text-blue-400" />}
                                {event.description}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};