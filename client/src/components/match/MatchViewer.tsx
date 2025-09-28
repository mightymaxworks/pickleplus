import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Eye, 
  Radio, 
  Activity, 
  TrendingUp, 
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MomentumWave } from '@/components/match/MomentumWave';
import { CrowdEnergyMeter } from '@/components/match/CrowdEnergyMeter';
import { HypeTrainEffects } from '@/components/match/HypeTrainEffects';
import { MomentumState } from '@/components/match/MomentumEngine';

// Viewer-specific interfaces
interface ViewerMatchData {
  id: string;
  title: string;
  team1: { name: string; score: number; color: string };
  team2: { name: string; score: number; color: string };
  isLive: boolean;
  viewerCount: number;
  streamUrl?: string;
  momentumState?: MomentumState;
}

interface MatchViewerProps {
  matchData: ViewerMatchData;
  className?: string;
}

export function MatchViewer({ matchData, className = '' }: MatchViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [crowdEnergy, setCrowdEnergy] = useState(50);
  const [showUI, setShowUI] = useState(true);
  const [hypeTrainActive, setHypeTrainActive] = useState(false);
  const [hypeTrainLevel, setHypeTrainLevel] = useState(0);

  // Auto-hide UI after inactivity (like YouTube/Twitch)
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      setShowUI(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowUI(false), 3000); // Hide after 3s
    };

    const handleActivity = () => resetTimer();
    
    // Add event listeners for user activity
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('keydown', handleActivity);
    
    resetTimer(); // Start the timer
    
    return () => {
      clearTimeout(hideTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const shareMatch = async () => {
    if (navigator.share) {
      await navigator.share({
        title: matchData.title,
        text: `Watch ${matchData.team1.name} vs ${matchData.team2.name} live!`,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={`relative h-screen w-full bg-black overflow-hidden ${className}`}>
      {/* Main Video Stream - Full Screen Background */}
      <div className="absolute inset-0 z-0">
        {matchData.streamUrl ? (
          <iframe
            src={matchData.streamUrl}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Radio className="h-16 w-16 mx-auto mb-4 animate-pulse" />
              <div className="text-xl font-bold mb-2">Stream Starting Soon...</div>
              <div className="text-sm">Get ready for an epic match!</div>
            </div>
          </div>
        )}
      </div>

      {/* Gaming Effects Layer - On top of video */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Hype Train Effects */}
        <HypeTrainEffects
          isEnabled={matchData.isLive}
          aestheticMode="esports"
          crowdEnergy={crowdEnergy}
          momentumState={matchData.momentumState}
          onHypeTrainStart={(level) => {
            setHypeTrainActive(true);
            setHypeTrainLevel(level);
          }}
          onHypeTrainEnd={() => {
            setHypeTrainActive(false);
            setHypeTrainLevel(0);
          }}
        />

        {/* Enhanced Momentum Wave - Positioned over video */}
        {matchData.momentumState && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4">
            <MomentumWave
              momentumState={matchData.momentumState}
              team1Color={matchData.team1.color}
              team2Color={matchData.team2.color}
              team1Name={matchData.team1.name}
              team2Name={matchData.team2.name}
              className="mb-4"
              isInteractive={false} // Read-only for viewers
              crowdEnergy={crowdEnergy}
              heroMode={crowdEnergy >= 85 || (hypeTrainActive && hypeTrainLevel >= 4)}
              aestheticMode="esports"
            />
          </div>
        )}

        {/* Crowd Energy - Bottom overlay */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <CrowdEnergyMeter
            momentumState={matchData.momentumState}
            isLive={matchData.isLive}
            aestheticMode="esports"
            enableDecay={true}
            decayRate={1.5}
            onEnergyChange={(energy) => setCrowdEnergy(energy)}
            onReactionTrigger={() => {}}
          />
        </div>
      </div>

      {/* UI Overlay Layer - Auto-hiding controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            {/* Top Status Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between pointer-events-auto">
                {/* Live Status & Match Info */}
                <div className="flex items-center gap-3">
                  {matchData.isLive && (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                  <div className="text-white">
                    <div className="font-bold text-lg">{matchData.title}</div>
                    <div className="text-sm text-slate-300">
                      {matchData.team1.name} vs {matchData.team2.name}
                    </div>
                  </div>
                </div>

                {/* Viewer Count & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-white">
                    <Eye className="h-4 w-4" />
                    <span className="font-bold">{matchData.viewerCount.toLocaleString()}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={shareMatch}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Score Display - Top Center */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <Card className="bg-black/60 border-slate-600/50 backdrop-blur-md p-3">
                <div className="flex items-center gap-6 text-white">
                  <div className="text-center">
                    <div className="text-sm text-slate-300">{matchData.team1.name}</div>
                    <div className="text-3xl font-bold" style={{ color: matchData.team1.color }}>
                      {matchData.team1.score}
                    </div>
                  </div>
                  
                  <div className="text-xl font-bold text-slate-400">VS</div>
                  
                  <div className="text-center">
                    <div className="text-sm text-slate-300">{matchData.team2.name}</div>
                    <div className="text-3xl font-bold" style={{ color: matchData.team2.color }}>
                      {matchData.team2.score}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center justify-between pointer-events-auto">
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Center Info */}
                <div className="text-center text-white">
                  <div className="text-sm text-slate-300">
                    {matchData.isLive ? 'Live Match' : 'Match Replay'}
                  </div>
                </div>

                {/* Fullscreen Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Demo component for testing
export function MatchViewerDemo() {
  const demoMatchData: ViewerMatchData = {
    id: 'demo-match-1',
    title: 'Championship Finals - Game 3',
    team1: { name: 'Thunder Bolts', score: 15, color: '#22c55e' },
    team2: { name: 'Fire Hawks', score: 12, color: '#ef4444' },
    isLive: true,
    viewerCount: 1247,
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0',
    momentumState: {
      momentum: 0.3,
      momentumScore: 65,
      streak: { team: 'team1', length: 3 },
      wave: [],
      totalPoints: 27,
      gamePhase: 'late'
    }
  };

  return <MatchViewer matchData={demoMatchData} />;
}