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
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoConfig {
  liveStreamUrl?: string;
  recordingUrl?: string;
  videoProvider?: 'hls' | 'mp4' | 'youtube' | 'vimeo';
  videoSyncOffset?: number; // seconds
}

interface VideoDockProps {
  config: VideoConfig;
  isVisible: boolean;
  onSyncOffsetChange: (offset: number) => void;
  className?: string;
}

export const VideoDock = ({ config, isVisible, onSyncOffsetChange, className = '' }: VideoDockProps) => {
  const [isDocked, setIsDocked] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [syncOffset, setSyncOffset] = useState(config.videoSyncOffset || 0);
  const [showSettings, setShowSettings] = useState(false);
  const [hlsError, setHlsError] = useState<string | null>(null);
  
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};