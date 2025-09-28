import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Eye, 
  Settings, 
  Monitor, 
  Sparkles,
  Radio,
  Users,
  Flame,
  Volume2,
  Zap
} from 'lucide-react';
import { CrowdEnergyMeter } from './CrowdEnergyMeter';
import { MomentumState } from './MomentumEngine';

interface GamingUIOverlaysProps {
  isEnabled: boolean;
  aestheticMode: 'subtle' | 'esports';
  children: React.ReactNode;
  onAestheticToggle: () => void;
  onTestTrigger?: (trigger: string) => void;
  momentumState?: MomentumState;
}

interface OverlayElements {
  topBar: boolean;
  sideIndicators: boolean;
  bottomHUD: boolean;
  effectsLayer: boolean;
}

export function GamingUIOverlays({ 
  isEnabled, 
  aestheticMode, 
  children, 
  onAestheticToggle,
  onTestTrigger,
  momentumState
}: GamingUIOverlaysProps) {
  const [showControls, setShowControls] = useState(false);
  const [activeElements, setActiveElements] = useState<OverlayElements>({
    topBar: true,
    sideIndicators: true,
    bottomHUD: true,
    effectsLayer: true
  });

  if (!isEnabled) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Gaming UI Testing Controls */}
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: showControls ? 1 : 0, x: showControls ? 0 : -300 }}
        className="fixed left-4 top-20 z-50 max-w-xs"
      >
        <Card className="p-4 bg-slate-900/95 border border-orange-500/30 backdrop-blur-md">
          <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Gaming Controls
          </h3>
          
          {/* Aesthetic Toggle */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Visual Style</label>
              <Button
                size="sm"
                onClick={onAestheticToggle}
                className={`w-full text-xs ${
                  aestheticMode === 'esports' 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {aestheticMode === 'esports' ? '🏆 Full Esports' : '📺 Subtle Stream'}
              </Button>
            </div>

            {/* Test Triggers */}
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Test Features</label>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => onTestTrigger?.('crowd-boost')}
                >
                  🔥 Crowd
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => onTestTrigger?.('hype-train')}
                >
                  🚂 Hype
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => onTestTrigger?.('particles')}
                >
                  ✨ FX
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => onTestTrigger?.('celebration')}
                >
                  🎉 Win
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Toggle Controls Button */}
      <Button
        size="sm"
        onClick={() => setShowControls(!showControls)}
        className="fixed left-4 top-4 z-50 bg-orange-600 hover:bg-orange-700 text-white"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Gaming Aesthetic Wrapper */}
      <div className={`relative ${getAestheticClasses(aestheticMode)}`}>
        
        {/* Top Gaming Bar - Esports Tournament Style */}
        <AnimatePresence>
          {activeElements.topBar && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-40"
            >
              <TopGamingBar aestheticMode={aestheticMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side Gaming Indicators */}
        <AnimatePresence>
          {activeElements.sideIndicators && (
            <>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-40"
              >
                <LeftSideIndicators aestheticMode={aestheticMode} />
              </motion.div>
              
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
              >
                <RightSideIndicators aestheticMode={aestheticMode} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content with Gaming Padding */}
        <div className={`relative ${aestheticMode === 'esports' ? 'pt-20 pb-24' : 'pt-12 pb-16'}`}>
          {children}
        </div>

        {/* Bottom Gaming HUD */}
        <AnimatePresence>
          {activeElements.bottomHUD && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-40"
            >
              <BottomGamingHUD aestheticMode={aestheticMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crowd Energy Meter - Floating Position */}
        <div className="fixed bottom-32 right-4 z-40 max-w-sm">
          <CrowdEnergyMeter
            momentumState={momentumState}
            isLive={isEnabled}
            aestheticMode={aestheticMode}
            onEnergyChange={(energy) => console.log(`🔥 Crowd Energy: ${energy}%`)}
            onReactionTrigger={(reaction) => console.log(`👥 Crowd Reaction: ${reaction.type} (${reaction.intensity}%)`)}
          />
        </div>

        {/* Effects Layer - for future particle effects, hype trains, etc. */}
        <div className="fixed inset-0 pointer-events-none z-30">
          {/* This layer will be populated by Sprint 2 features */}
        </div>
      </div>
    </div>
  );
}

// Aesthetic class configurations
function getAestheticClasses(mode: 'subtle' | 'esports'): string {
  if (mode === 'esports') {
    return `
      bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950
      min-h-screen
    `;
  }
  
  return `
    bg-gradient-to-br from-slate-950 to-slate-900 
    min-h-screen
  `;
}

// Top Gaming Bar Component
function TopGamingBar({ aestheticMode }: { aestheticMode: 'subtle' | 'esports' }) {
  if (aestheticMode === 'esports') {
    return (
      <div className="bg-gradient-to-r from-purple-900/90 via-slate-900/90 to-orange-900/90 backdrop-blur-md border-b border-purple-500/30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Badge className="bg-red-600/80 text-white animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
            <div className="text-purple-300 font-bold text-lg">PICKLE+ TOURNAMENT</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-orange-300">
              <Users className="h-4 w-4" />
              <span className="font-mono">1,247</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Flame className="h-4 w-4" />
              <span className="font-mono">87%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-2">
        <Badge className="bg-blue-600/80 text-white">
          <Eye className="h-3 w-3 mr-1" />
          Live Stream
        </Badge>
        <div className="text-slate-300 text-sm">Match Recording</div>
      </div>
    </div>
  );
}

// Left Side Indicators
function LeftSideIndicators({ aestheticMode }: { aestheticMode: 'subtle' | 'esports' }) {
  if (aestheticMode === 'esports') {
    return (
      <div className="space-y-3 p-2">
        <div className="bg-purple-900/80 backdrop-blur-sm rounded-r-lg px-3 py-2 border-r-2 border-purple-400">
          <div className="text-purple-300 text-xs font-bold">ENERGY</div>
          <div className="text-white font-mono text-lg">100%</div>
        </div>
        <div className="bg-orange-900/80 backdrop-blur-sm rounded-r-lg px-3 py-2 border-r-2 border-orange-400">
          <div className="text-orange-300 text-xs font-bold">HYPE</div>
          <div className="text-white font-mono text-lg">MAX</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      <div className="bg-slate-800/70 backdrop-blur-sm rounded-r-lg px-2 py-1 border-r border-blue-400">
        <div className="text-blue-300 text-xs">Energy</div>
        <div className="text-white text-sm">78%</div>
      </div>
    </div>
  );
}

// Right Side Indicators
function RightSideIndicators({ aestheticMode }: { aestheticMode: 'subtle' | 'esports' }) {
  if (aestheticMode === 'esports') {
    return (
      <div className="space-y-3 p-2">
        <div className="bg-green-900/80 backdrop-blur-sm rounded-l-lg px-3 py-2 border-l-2 border-green-400">
          <div className="text-green-300 text-xs font-bold">STREAK</div>
          <div className="text-white font-mono text-lg">5</div>
        </div>
        <div className="bg-yellow-900/80 backdrop-blur-sm rounded-l-lg px-3 py-2 border-l-2 border-yellow-400">
          <div className="text-yellow-300 text-xs font-bold">COMBO</div>
          <div className="text-white font-mono text-lg">3X</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      <div className="bg-slate-800/70 backdrop-blur-sm rounded-l-lg px-2 py-1 border-l border-green-400">
        <div className="text-green-300 text-xs">Streak</div>
        <div className="text-white text-sm">3</div>
      </div>
    </div>
  );
}

// Bottom Gaming HUD
function BottomGamingHUD({ aestheticMode }: { aestheticMode: 'subtle' | 'esports' }) {
  if (aestheticMode === 'esports') {
    return (
      <div className="bg-gradient-to-r from-slate-900/90 via-purple-900/90 to-slate-900/90 backdrop-blur-md border-t border-purple-500/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-bold">MOMENTUM TRACKING ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300">Live Commentary</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-600/80 text-white">
              <Zap className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
            <Badge className="bg-orange-600/80 text-white">
              Tournament Mode
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border-t border-slate-700/50">
      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Monitor className="h-4 w-4" />
          <span className="text-sm">Stream Overlay Active</span>
        </div>
      </div>
    </div>
  );
}