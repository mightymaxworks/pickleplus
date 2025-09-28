import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  Target, 
  Award, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  Timer,
  Sparkles,
  Medal,
  CheckCircle,
  RotateCw,
  Save,
  Camera,
  Gamepad2,
  Activity,
  ArrowRight,
  Plus,
  Minus,
  Undo2,
  PartyPopper,
  ArrowLeft,
  BarChart3,
  X,
  Video,
  BarChart,
  Share2,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VersusScreen } from '@/components/match/VersusScreen';
import { MomentumEngine, MomentumState, StrategyMessage, MatchCloseness } from '@/components/match/MomentumEngine';
import { MomentumWave } from '@/components/match/MomentumWave';
import { MessageToast } from '@/components/match/MessageToast';
import { VideoDock } from '@/components/match/VideoDock';
import { matchStateManager, MatchState as LiveMatchState } from '@/components/match/MatchStateManager';
import { StreamStatusIndicator } from '@/components/match/StreamStatusIndicator';
import { GamingUIOverlays } from '@/components/match/GamingUIOverlays';

// Enhanced interfaces for the super recorder
interface VideoConfig {
  hasVideo: boolean;
  liveStreamUrl?: string;
  recordingUrl?: string;
  videoProvider?: 'hls' | 'mp4' | 'youtube' | 'vimeo';
  videoSyncOffset?: number;
}

interface MatchMode {
  type: 'video' | 'statistics';
  showGamingEffects: boolean;
  enableSharing: boolean;
}

interface SuperMatchRecorderProps {
  initialVideoConfig?: VideoConfig;
  onModeChange?: (mode: MatchMode) => void;
  onShareLinkGenerated?: (link: string) => void;
  className?: string;
}

export function SuperMatchRecorder({ 
  initialVideoConfig, 
  onModeChange, 
  onShareLinkGenerated,
  className = '' 
}: SuperMatchRecorderProps) {
  // Determine match mode based on video presence
  const matchMode = useMemo<MatchMode>(() => {
    const hasVideo = initialVideoConfig?.hasVideo || 
                    initialVideoConfig?.liveStreamUrl || 
                    initialVideoConfig?.recordingUrl;
    
    return {
      type: hasVideo ? 'video' : 'statistics',
      showGamingEffects: true, // Always show momentum wave and crowd energy
      enableSharing: Boolean(hasVideo) // Enable sharing for video mode
    };
  }, [initialVideoConfig]);

  // Notify parent of mode changes
  useEffect(() => {
    onModeChange?.(matchMode);
  }, [matchMode, onModeChange]);

  // State management (similar to GamifiedMatchRecording but simplified)
  const [isRecording, setIsRecording] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Generate shareable link for live viewing
  const generateShareLink = () => {
    const matchId = `match-${Date.now()}`;
    const viewerLink = `${window.location.origin}/match/watch/${matchId}`;
    setShareLink(viewerLink);
    onShareLinkGenerated?.(viewerLink);
  };

  // Copy share link to clipboard
  const copyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      // Could add toast notification here
    }
  };

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Mode Indicator */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <Badge 
          className={`${
            matchMode.type === 'video' 
              ? 'bg-purple-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}
        >
          {matchMode.type === 'video' ? (
            <>
              <Video className="h-3 w-3 mr-1" />
              Video Mode
            </>
          ) : (
            <>
              <BarChart className="h-3 w-3 mr-1" />
              Statistics Mode
            </>
          )}
        </Badge>
        
        {matchMode.enableSharing && (
          <Button
            size="sm"
            variant="outline"
            onClick={generateShareLink}
            className="bg-slate-800/70 border-slate-600 text-white hover:bg-slate-700"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share Live
          </Button>
        )}
      </div>

      {/* Share Link Display */}
      <AnimatePresence>
        {shareLink && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Card className="p-3 bg-slate-800/90 border-slate-600 backdrop-blur-md">
              <div className="text-sm text-white mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-400" />
                Live Viewer Link Generated
              </div>
              <div className="flex gap-2">
                <input
                  value={shareLink}
                  readOnly
                  className="flex-1 text-xs bg-slate-700 border-slate-600 rounded px-2 py-1 text-white"
                />
                <Button size="sm" onClick={copyShareLink} className="h-6 w-6 p-0">
                  📋
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render appropriate mode */}
      {matchMode.type === 'video' ? (
        <VideoProductionMode 
          videoConfig={initialVideoConfig}
          showGamingEffects={matchMode.showGamingEffects}
        />
      ) : (
        <StatisticsMode 
          showGamingEffects={matchMode.showGamingEffects}
        />
      )}
    </div>
  );
}

// Video Production Mode Component
function VideoProductionMode({ 
  videoConfig, 
  showGamingEffects 
}: { 
  videoConfig?: VideoConfig; 
  showGamingEffects: boolean; 
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Video-First Layout */}
      <div className="relative">
        {/* Main Video Container - Takes most of screen */}
        <div className="h-screen w-full relative">
          {/* Video Player */}
          <div className="absolute inset-0 bg-slate-900">
            {videoConfig?.liveStreamUrl || videoConfig?.recordingUrl ? (
              <VideoDock
                config={{
                  liveStreamUrl: videoConfig.liveStreamUrl,
                  recordingUrl: videoConfig.recordingUrl,
                  videoProvider: videoConfig.videoProvider,
                  videoSyncOffset: videoConfig.videoSyncOffset,
                  testingMode: true
                }}
                isVisible={true}
                onSyncOffsetChange={() => {}}
                onMomentumTest={() => {}}
                className="!fixed !inset-0 !w-full !h-full !z-10"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <div className="text-xl font-bold mb-2">Video Stream Ready</div>
                  <div className="text-sm">Upload or connect a video source to begin</div>
                </div>
              </div>
            )}
          </div>

          {/* Gaming Overlays - On top of video */}
          {showGamingEffects && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <GamingUIOverlays
                isEnabled={true}
                aestheticMode="esports"
                onAestheticToggle={() => {}}
                onTestTrigger={() => {}}
                momentumState={undefined} // Will be populated with real momentum state
              >
                <div className="pointer-events-auto">
                  {/* Video Production Controls */}
                  <VideoProductionControls />
                </div>
              </GamingUIOverlays>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Statistics Mode Component  
function StatisticsMode({ 
  showGamingEffects 
}: { 
  showGamingEffects: boolean; 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Statistics-Focused Layout */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Enhanced Scoreboard */}
        <Card className="p-6 bg-slate-800/70 border-slate-600">
          <EnhancedScoreboard />
        </Card>

        {/* Momentum Wave - Central to all experiences */}
        {showGamingEffects && (
          <Card className="p-4 bg-slate-800/70 border-slate-600">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Match Momentum
              </h3>
            </div>
            <MomentumWave
              momentumState={{
                momentum: 0,
                momentumScore: 50,
                streak: { team: 'team1', length: 0 },
                wave: [],
                totalPoints: 0,
                gamePhase: 'early'
              }}
              team1Color="#22c55e"
              team2Color="#ef4444"
              team1Name="Team 1"
              team2Name="Team 2"
              className="mb-4"
              isInteractive={true}
              crowdEnergy={50}
              heroMode={false}
              aestheticMode="subtle"
            />
          </Card>
        )}

        {/* Statistics Controls */}
        <StatisticsControls />

        {/* Match Analytics */}
        <Card className="p-6 bg-slate-800/70 border-slate-600">
          <MatchAnalytics />
        </Card>
      </div>
    </div>
  );
}

// Video Production Controls
function VideoProductionControls() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
      <Button variant="outline" className="bg-slate-800/70 border-slate-600 text-white">
        <Play className="h-4 w-4 mr-2" />
        Start Stream
      </Button>
      <Button variant="outline" className="bg-slate-800/70 border-slate-600 text-white">
        <Pause className="h-4 w-4 mr-2" />
        Pause
      </Button>
      <Button variant="outline" className="bg-slate-800/70 border-slate-600 text-white">
        <Save className="h-4 w-4 mr-2" />
        Save Match
      </Button>
    </div>
  );
}

// Enhanced Scoreboard for Statistics Mode
function EnhancedScoreboard() {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white mb-6">Match Score</div>
      
      {/* Large, Touch-Friendly Score Display */}
      <div className="grid grid-cols-3 gap-6 items-center mb-6">
        {/* Team 1 */}
        <div className="text-center">
          <div className="text-lg text-slate-300 mb-2">Team 1</div>
          <div className="text-6xl font-bold text-green-400 mb-4">15</div>
          <div className="flex justify-center gap-2">
            <Button size="lg" className="w-12 h-12 bg-green-600 hover:bg-green-500">
              <Plus className="h-6 w-6" />
            </Button>
            <Button size="lg" variant="outline" className="w-12 h-12 border-slate-600">
              <Minus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-400">VS</div>
          <div className="text-sm text-slate-500 mt-2">Game 1</div>
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <div className="text-lg text-slate-300 mb-2">Team 2</div>
          <div className="text-6xl font-bold text-red-400 mb-4">12</div>
          <div className="flex justify-center gap-2">
            <Button size="lg" className="w-12 h-12 bg-red-600 hover:bg-red-500">
              <Plus className="h-6 w-6" />
            </Button>
            <Button size="lg" variant="outline" className="w-12 h-12 border-slate-600">
              <Minus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Statistics Controls
function StatisticsControls() {
  return (
    <div className="flex gap-3 justify-center">
      <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
        <Undo2 className="h-4 w-4 mr-2" />
        Undo
      </Button>
      <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
        <Activity className="h-4 w-4 mr-2" />
        Stats
      </Button>
      <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
        <Save className="h-4 w-4 mr-2" />
        Save Match
      </Button>
    </div>
  );
}

// Match Analytics
function MatchAnalytics() {
  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        Match Analytics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">87%</div>
          <div className="text-sm text-slate-300">Win Rate</div>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">23</div>
          <div className="text-sm text-slate-300">Total Points</div>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">7</div>
          <div className="text-sm text-slate-300">Streaks</div>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-2xl font-bold text-orange-400">12m</div>
          <div className="text-sm text-slate-300">Duration</div>
        </div>
      </div>
    </div>
  );
}