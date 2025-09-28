import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VersusScreen } from '@/components/match/VersusScreen';
import { MomentumEngine, MomentumState, StrategyMessage, MatchCloseness } from '@/components/match/MomentumEngine';
import { MomentumWave } from '@/components/match/MomentumWave';
import { MessageToast } from '@/components/match/MessageToast';
import { VideoDock } from '@/components/match/VideoDock';

// Enhanced Micro-Feedback Components for Gaming Feel
function ExplosiveReaction({ show, type, onComplete, playerName, context }: {
  show: boolean;
  type: 'win' | 'ace' | 'streak' | 'milestone';
  onComplete: () => void;
  playerName?: string;
  context?: { score?: string; gameType?: string; margin?: number };
}) {
  const getPersonalizedMessage = () => {
    if (!playerName) return getDefaultMessage();
    
    switch (type) {
      case 'ace':
        return `${playerName.toUpperCase()} DOMINATES!`;
      case 'win':
        if (context?.margin && context.margin >= 5) {
          return `${playerName.toUpperCase()} CRUSHES IT!`;
        }
        return `${playerName.toUpperCase()} TAKES THE GAME!`;
      case 'milestone':
        return `${playerName.toUpperCase()} WINS THE MATCH!`;
      case 'streak':
        return `${playerName.toUpperCase()} ON FIRE!`;
      default:
        return `${playerName.toUpperCase()} VICTORIOUS!`;
    }
  };

  const getDefaultMessage = () => {
    const configs = {
      win: "GAME WON!",
      ace: "PERFECT GAME!",
      streak: "WIN STREAK!",
      milestone: "MATCH WON!"
    };
    return configs[type];
  };

  const configs = {
    win: { icon: Trophy, color: "text-yellow-400", particles: 8 },
    ace: { icon: Zap, color: "text-orange-400", particles: 12 },
    streak: { icon: Target, color: "text-purple-400", particles: 10 },
    milestone: { icon: Crown, color: "text-pink-400", particles: 15 }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1.5, onComplete }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Particle explosion effect */}
          {Array.from({ length: config.particles }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos(i * (360 / config.particles) * Math.PI / 180) * 100,
                y: Math.sin(i * (360 / config.particles) * Math.PI / 180) * 100,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 1.2, delay: i * 0.05 }}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"
            />
          ))}
          
          {/* Main reaction */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.3, 1], rotate: [0, 360, 0] }}
            className={`flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900/90 border-2 border-orange-400 backdrop-blur-sm ${config.color}`}
          >
            <Icon className="h-8 w-8" />
            <span className="text-xl font-bold">{getPersonalizedMessage()}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Match Closeness Indicator for Gaming Experience
function MatchClosenessIndicator({ 
  closeness, 
  team1Name, 
  team2Name, 
  momentumScore 
}: { 
  closeness?: MatchCloseness;
  team1Name?: string;
  team2Name?: string;
  momentumScore?: number;
}) {
  if (!closeness) return null;

  const levelColors = {
    'nail-biter': 'from-red-500 to-orange-500',
    'competitive': 'from-blue-500 to-purple-500', 
    'one-sided': 'from-yellow-500 to-orange-500',
    'blowout': 'from-gray-500 to-slate-600'
  };

  const levelIcons = {
    'nail-biter': '🔥',
    'competitive': '⚡',
    'one-sided': '📈',
    'blowout': '💥'
  };

  const levelBorderColors = {
    'nail-biter': 'border-red-400',
    'competitive': 'border-blue-400',
    'one-sided': 'border-yellow-400', 
    'blowout': 'border-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hovered"
      variants={{
        default: {},
        hovered: {}
      }}
      className={`relative p-3 rounded-xl bg-gradient-to-r ${levelColors[closeness.level]} border-2 ${levelBorderColors[closeness.level]} backdrop-blur-sm shadow-lg cursor-pointer`}
    >
      {/* Pulsing effect for nail-biters */}
      {closeness.level === 'nail-biter' && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl blur-sm"
        />
      )}
      
      <div className="relative flex items-center gap-3">
        <div className="text-2xl">{levelIcons[closeness.level]}</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              {(() => {
                if (!team1Name || !team2Name || momentumScore === undefined) return 'Match Intensity';
                
                if (momentumScore > 65) return `${team1Name} Dominating`;
                if (momentumScore > 55) return `${team1Name} Leading`;
                if (momentumScore < 35) return `${team2Name} Dominating`;
                if (momentumScore < 45) return `${team2Name} Leading`;
                return 'Dead Heat';
              })()}
            </span>
            <div className="text-white font-bold text-lg">
              {closeness.score}/100
            </div>
          </div>
          
          <div className="text-white text-sm font-medium" style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>
            {(() => {
              if (!team1Name || !team2Name || momentumScore === undefined) return closeness.description;
              
              if (closeness.level === 'nail-biter') {
                return `${team1Name} vs ${team2Name} - Anyone's game!`;
              } else if (closeness.level === 'competitive') {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} has the edge in this battle`;
              } else if (closeness.level === 'one-sided') {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} pulling away from the competition`;
              } else {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} completely in control`;
              }
            })()}
          </div>
        </div>
        
        {/* Intensity meter */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-12 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${closeness.score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full bg-white rounded-full"
              style={{
                filter: closeness.level === 'nail-biter' ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : 'none'
              }}
            />
          </div>
          <span className="text-white text-xs font-bold">
            {closeness.level.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Detailed breakdown tooltip on hover */}
      <motion.div
        variants={{
          default: { opacity: 0, scale: 0.9, y: -10, pointerEvents: "none" },
          hovered: { opacity: 1, scale: 1, y: 0, pointerEvents: "auto" }
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-900/95 rounded-lg border border-slate-600 text-xs text-white backdrop-blur-sm z-50 shadow-2xl"
        style={{ 
          minWidth: '250px',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <div>Momentum Balance: {closeness.indicators.momentumBalance}%</div>
          <div>Shift Frequency: {closeness.indicators.shiftFrequency}%</div>
          <div>Streak Volatility: {closeness.indicators.streakVolatility}%</div>
          <div>Score Proximity: {closeness.indicators.scoreProximity}%</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mega Streak Animations for Gaming Experience
function MegaStreakAnimation({ show, megaLevel, teamColor, teamName, onComplete }: {
  show: boolean;
  megaLevel: 1 | 2 | 3;
  teamColor: string;
  teamName: string;
  onComplete: () => void;
}) {
  const getMegaConfig = () => {
    switch (megaLevel) {
      case 1: // 3 points
        return {
          text: '🌋 DOMINATION BEGINS!',
          subtitle: `${teamName} takes control!`,
          particles: 12,
          scale: 1.2,
          duration: 4000,
          color: 'from-orange-500 to-red-500',
          intensity: 'low'
        };
      case 2: // 5 points
        return {
          text: '⚡ TOTAL CONTROL!',
          subtitle: `${teamName} unleashes fury!`,
          particles: 20,
          scale: 1.4,
          duration: 5000,
          color: 'from-purple-500 to-pink-500',
          intensity: 'medium'
        };
      case 3: // 8 points
        return {
          text: '🔥 ABSOLUTE DOMINANCE!',
          subtitle: `${teamName} achieves legendary status!`,
          particles: 30,
          scale: 1.6,
          duration: 6000,
          color: 'from-yellow-400 to-orange-600',
          intensity: 'high'
        };
      default:
        return null;
    }
  };

  const config = getMegaConfig();
  if (!config || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(onComplete, config.duration)}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${teamColor}40 0%, transparent 70%)`
          }}
        >
          {/* Screen flash effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5, times: [0, 0.1, 1] }}
            className="absolute inset-0 bg-white mix-blend-overlay"
          />
          
          {/* Massive particle explosion */}
          <div className="absolute inset-0">
            {[...Array(config.particles)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0,
                  x: '50vw',
                  y: '50vh',
                  opacity: 1
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${50 + (Math.cos(i * (360 / config.particles) * Math.PI / 180) * 40)}vw`,
                  y: `${50 + (Math.sin(i * (360 / config.particles) * Math.PI / 180) * 40)}vh`,
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.02,
                  ease: "easeOut"
                }}
                className={`absolute w-6 h-6 bg-gradient-to-r ${config.color} rounded-full`}
                style={{ filter: 'blur(1px)' }}
              />
            ))}
          </div>
          
          {/* Central mega message */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, config.scale, 1], 
              rotate: [0, 360, 0] 
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              times: [0, 0.6, 1]
            }}
            className="relative z-10"
          >
            <div className={`text-center p-8 rounded-2xl bg-gradient-to-r ${config.color} border-4 border-white backdrop-blur-sm`}>
              <motion.h1
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 40px rgba(255,255,255,1)',
                    '0 0 20px rgba(255,255,255,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl font-bold text-white mb-4"
              >
                {config.text}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl text-white font-semibold"
              >
                {config.subtitle}
              </motion.p>
            </div>
          </motion.div>
          
          {/* Screen shake effect */}
          <motion.div
            animate={config.intensity === 'high' ? {
              x: [0, -5, 5, -5, 5, 0],
              y: [0, -3, 3, -3, 3, 0]
            } : config.intensity === 'medium' ? {
              x: [0, -3, 3, -3, 3, 0]
            } : {}}
            transition={{ duration: 0.5, repeat: 2 }}
            className="absolute inset-0 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PulsingScoreButton({ children, onClick, variant = 'default', disabled = false }: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'winning' | 'danger';
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  const variants = {
    default: 'bg-slate-700 hover:bg-slate-600 border-slate-500',
    winning: 'bg-green-600 hover:bg-green-500 border-green-400 shadow-green-400/50',
    danger: 'bg-red-600 hover:bg-red-500 border-red-400 shadow-red-400/50'
  };

  const textStyles = {
    default: 'text-white',
    winning: 'text-white',
    danger: 'text-white'
  };

  return (
    <motion.button
      disabled={disabled}
      onTapStart={() => setPressed(true)}
      onTap={() => {
        setPressed(false);
        onClick();
      }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={{ 
        scale: pressed ? 0.9 : 1,
        boxShadow: variant !== 'default' ? [
          '0 0 20px rgba(249, 115, 22, 0.3)',
          '0 0 40px rgba(249, 115, 22, 0.5)',
          '0 0 20px rgba(249, 115, 22, 0.3)'
        ] : 'none'
      }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-xl border-2 font-bold text-xl transition-all ${
        variants[variant]
      } ${textStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}`}
      style={{
        textShadow: variant !== 'default' ? '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' : 'none'
      }}
    >
      {children}
      
      {/* Ripple effect */}
      {pressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          className="absolute inset-0 rounded-xl bg-white pointer-events-none"
        />
      )}
    </motion.button>
  );
}

function GameifiedPlayerCard({ player, score, isWinning, onClick }: {
  player: { name: string; id: string; tier: string; avatar?: string };
  score: number;
  isWinning: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      animate={{ 
        scale: isWinning ? 1.02 : 1,
        borderColor: isWinning ? '#f97316' : '#374151',
        boxShadow: isWinning ? '0 0 30px rgba(249, 115, 22, 0.4)' : 'none'
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      <Card className={`p-4 border-2 transition-all ${
        isWinning 
          ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-400' 
          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
      }`}>
        {/* Winner glow effect */}
        {isWinning && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-lg"
          />
        )}
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">{player.name}</div>
              <Badge className="text-xs bg-slate-600 text-slate-200">{player.tier}</Badge>
            </div>
          </div>
          
          <motion.div
            animate={{ scale: isWinning ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: isWinning ? Infinity : 0, duration: 1 }}
            className={`text-4xl font-bold ${isWinning ? 'text-orange-400' : 'text-white'}`}
            style={{
              textShadow: isWinning ? '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' : 'none'
            }}
          >
            {score}
          </motion.div>
        </div>
        
        {/* Winning indicator */}
        {isWinning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

interface MatchConfig {
  scoringType: 'traditional' | 'rally';
  pointTarget: 11 | 15 | 21;
  matchFormat: 'single' | 'best-of-3' | 'best-of-5';
  winByTwo: boolean;
  liveStreamUrl?: string;
  recordingUrl?: string;
  videoProvider?: 'hls' | 'mp4' | 'youtube' | 'vimeo';
  videoSyncOffset?: number;
}

interface MatchState {
  player1: { name: string; id: string; tier: string; score: number };
  player2: { name: string; id: string; tier: string; score: number };
  gameHistory: Array<{ player1Score: number; player2Score: number; winner: string }>;
  currentGame: number;
  matchComplete: boolean;
  achievements: Array<{ type: string; message: string; timestamp: number }>;
  streak: { player: string; count: number; type: 'win' | 'ace' };
  config: MatchConfig;
  momentumState?: MomentumState;
  strategicMessages: StrategyMessage[];
  showVideo: boolean;
}

export default function GamifiedMatchRecording() {
  const [showConfig, setShowConfig] = useState(true);
  
  // Message expiration handler
  const handleMessageExpire = (messageId: string) => {
    setMatchState(prev => ({
      ...prev,
      strategicMessages: prev.strategicMessages.filter(msg => msg.id !== messageId)
    }));
  };

  // Context UI state for momentum accuracy guidance
  const [showMomentumContext, setShowMomentumContext] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(true); // Track if user is doing live point-by-point scoring

  // Mega streak animation state
  const [megaAnimation, setMegaAnimation] = useState<{
    show: boolean;
    megaLevel: 1 | 2 | 3;
    teamColor: string;
    teamName: string;
  }>({
    show: false,
    megaLevel: 1,
    teamColor: '#ff6b35',
    teamName: ''
  });

  // Detect live vs representation mode based on scoring frequency
  const detectScoringMode = () => {
    const recentPointsCount = matchState.player1.score + matchState.player2.score;
    const currentTime = Date.now();
    
    // Simple heuristic: if more than 10 points scored in less than 2 minutes, likely representation mode
    // For live mode, we expect slower, more deliberate scoring
    if (recentPointsCount > 10) {
      setIsLiveMode(false); // Likely entering scores after the fact
    } else {
      setIsLiveMode(true); // Live point-by-point scoring
    }
  };
  
  // Navigation function
  const goBackToPrototype = () => {
    // Clear current match data when leaving
    sessionStorage.removeItem('currentMatch');
    window.location.href = '/unified-prototype';
  };
  
  // Extensive pickleball-themed team combinations for variety and fun
  const pickleballTeamThemes = [
    {
      team1: { name: "Dink Masters", color: "#10b981", icon: "🎯" },
      team2: { name: "Power Smashers", color: "#3b82f6", icon: "💥" }
    },
    {
      team1: { name: "Kitchen Warriors", color: "#f59e0b", icon: "🛡️" },
      team2: { name: "Baseline Bombers", color: "#ef4444", icon: "🚀" }
    },
    {
      team1: { name: "Drop Shot Legends", color: "#8b5cf6", icon: "🎪" },
      team2: { name: "Volley Vikings", color: "#06b6d4", icon: "⚔️" }
    },
    {
      team1: { name: "Spin Doctors", color: "#84cc16", icon: "🌪️" },
      team2: { name: "Net Ninjas", color: "#f97316", icon: "🥷" }
    },
    {
      team1: { name: "Lob Launchers", color: "#ec4899", icon: "🎈" },
      team2: { name: "Rally Rockets", color: "#14b8a6", icon: "🚀" }
    },
    {
      team1: { name: "Serve Samurai", color: "#dc2626", icon: "⚡" },
      team2: { name: "Return Rebels", color: "#7c3aed", icon: "🔥" }
    },
    {
      team1: { name: "Paddle Phantoms", color: "#6366f1", icon: "👻" },
      team2: { name: "Court Crushers", color: "#f43f5e", icon: "⚔️" }
    },
    {
      team1: { name: "Third Shot Titans", color: "#059669", icon: "🏔️" },
      team2: { name: "Backhand Bandits", color: "#dc2626", icon: "🏴‍☠️" }
    },
    {
      team1: { name: "Overhead Overlords", color: "#7c3aed", icon: "👑" },
      team2: { name: "Sideline Snipers", color: "#ea580c", icon: "🎯" }
    },
    {
      team1: { name: "Pickle Pirates", color: "#0891b2", icon: "🏴‍☠️" },
      team2: { name: "Ace Assassins", color: "#be123c", icon: "🗡️" }
    },
    {
      team1: { name: "Crosscourt Commandos", color: "#16a34a", icon: "🪖" },
      team2: { name: "Forehand Fury", color: "#dc2626", icon: "🔥" }
    },
    {
      team1: { name: "Paddle Predators", color: "#9333ea", icon: "🦅" },
      team2: { name: "Baseline Beasts", color: "#c2410c", icon: "🦁" }
    },
    {
      team1: { name: "Rally Renegades", color: "#0d9488", icon: "🤠" },
      team2: { name: "Smash Squad", color: "#e11d48", icon: "💥" }
    },
    {
      team1: { name: "Court Captains", color: "#0369a1", icon: "⚓" },
      team2: { name: "Dink Destroyers", color: "#991b1b", icon: "💀" }
    },
    {
      team1: { name: "Net Navigators", color: "#059669", icon: "🧭" },
      team2: { name: "Volley Vipers", color: "#7c2d12", icon: "🐍" }
    },
    {
      team1: { name: "Pickle Powerhouse", color: "#7c3aed", icon: "⚡" },
      team2: { name: "Kitchen Killers", color: "#b91c1c", icon: "🔪" }
    },
    {
      team1: { name: "Serve Storms", color: "#0284c7", icon: "⛈️" },
      team2: { name: "Return Raiders", color: "#dc2626", icon: "🏴‍☠️" }
    },
    {
      team1: { name: "Paddle Panthers", color: "#374151", icon: "🐾" },
      team2: { name: "Court Cobras", color: "#16a34a", icon: "🐍" }
    },
    {
      team1: { name: "Lob Lions", color: "#d97706", icon: "🦁" },
      team2: { name: "Drop Dragons", color: "#dc2626", icon: "🐉" }
    },
    {
      team1: { name: "Angle Arrows", color: "#0891b2", icon: "🏹" },
      team2: { name: "Pace Pacers", color: "#7c2d12", icon: "🏃" }
    },
    {
      team1: { name: "Pickleball Phoenixes", color: "#e11d48", icon: "🔥" },
      team2: { name: "Court Cardinals", color: "#dc2626", icon: "🔴" }
    },
    {
      team1: { name: "Spin Sharks", color: "#0369a1", icon: "🦈" },
      team2: { name: "Rally Rhinos", color: "#6b7280", icon: "🦏" }
    },
    {
      team1: { name: "Paddle Pumas", color: "#a21caf", icon: "🐱" },
      team2: { name: "Net Narwhals", color: "#0284c7", icon: "🦄" }
    },
    {
      team1: { name: "Kitchen Krakens", color: "#0d9488", icon: "🐙" },
      team2: { name: "Baseline Bulls", color: "#dc2626", icon: "🐂" }
    },
    {
      team1: { name: "Volley Velociraptors", color: "#16a34a", icon: "🦖" },
      team2: { name: "Dink Dolphins", color: "#0ea5e9", icon: "🐬" }
    },
    {
      team1: { name: "Court Cyclones", color: "#6366f1", icon: "🌀" },
      team2: { name: "Paddle Phoenixes", color: "#f59e0b", icon: "🔥" }
    },
    {
      team1: { name: "Smash Spartans", color: "#b91c1c", icon: "🛡️" },
      team2: { name: "Rally Rangers", color: "#059669", icon: "🏹" }
    },
    {
      team1: { name: "Third Shot Thunders", color: "#7c3aed", icon: "⚡" },
      team2: { name: "Baseline Blizzards", color: "#0ea5e9", icon: "❄️" }
    },
    {
      team1: { name: "Pickle Pilots", color: "#0369a1", icon: "✈️" },
      team2: { name: "Court Comets", color: "#f59e0b", icon: "☄️" }
    },
    {
      team1: { name: "Dink Dynamos", color: "#dc2626", icon: "⚡" },
      team2: { name: "Volley Vortex", color: "#8b5cf6", icon: "🌪️" }
    }
  ];

  // Generate random pickleball team theme
  const getRandomTeamTheme = () => {
    return pickleballTeamThemes[Math.floor(Math.random() * pickleballTeamThemes.length)];
  };

  // Get real player names from session storage or use defaults
  const getInitialPlayerNames = () => {
    try {
      // First try to get current match data (from challenge acceptance)
      const currentMatch = sessionStorage.getItem('currentMatch');
      if (currentMatch) {
        const matchData = JSON.parse(currentMatch);
        
        // Handle pairings data from match creation wizard
        if (matchData.pairings) {
          const team1Names = matchData.pairings.team1.map((p: any) => p.displayName || p.username || p.name).join(' & ');
          const team2Names = matchData.pairings.team2.map((p: any) => p.displayName || p.username || p.name).join(' & ');
          return {
            player1: team1Names,
            player2: team2Names
          };
        }
        
        // Fallback to simple player1/player2 format
        return {
          player1: matchData.player1,
          player2: matchData.player2
        };
      }
      
      // Fallback to old format for backwards compatibility
      const storedNames = sessionStorage.getItem('realPlayerNames');
      if (storedNames) {
        const playerNames = JSON.parse(storedNames);
        
        // Check if it's a doubles match (has team players)
        if (playerNames.team1Player1 && playerNames.team2Player1) {
          return {
            player1: `${playerNames.team1Player1} & ${playerNames.team1Player2}`,
            player2: `${playerNames.team2Player1} & ${playerNames.team2Player2}`
          };
        }
        // Singles match
        else if (playerNames.player1 && playerNames.player2) {
          return {
            player1: playerNames.player1,
            player2: playerNames.player2
          };
        }
      }
    } catch (error) {
      console.log('Could not load player names from session storage:', error);
    }
    
    // Fallback to defaults if no session storage data
    return {
      player1: 'Alex Chen',
      player2: 'Sarah Martinez'
    };
  };

  const initialNames = getInitialPlayerNames();
  const [teamTheme] = useState(getRandomTeamTheme()); // Fixed theme for entire match
  
  const [matchState, setMatchState] = useState<MatchState>({
    player1: { name: initialNames.player1, id: '1', tier: 'Elite', score: 0 },
    player2: { name: initialNames.player2, id: '2', tier: 'Professional', score: 0 },
    gameHistory: [],
    currentGame: 1,
    matchComplete: false,
    achievements: [],
    streak: { player: '', count: 0, type: 'win' },
    strategicMessages: [],
    showVideo: false,
    config: {
      scoringType: 'traditional',
      pointTarget: 11,
      matchFormat: 'best-of-3',
      winByTwo: true
    }
  });

  // Initialize momentum engine
  const [momentumEngine] = useState(() => new MomentumEngine({
    pointTarget: 11,
    winByTwo: true,
    scoringType: 'traditional',
    matchFormat: 'best-of-3'
  }));

  const [showReaction, setShowReaction] = useState<{
    show: boolean; 
    type: 'win' | 'ace' | 'streak' | 'milestone';
    playerName?: string;
    context?: { score?: string; gameType?: string; margin?: number };
  }>({
    show: false,
    type: 'win'
  });
  
  const [undoStack, setUndoStack] = useState<MatchState[]>([]);
  const [showStats, setShowStats] = useState(false);

  // Auto-hide momentum context notification when video URL is added
  useEffect(() => {
    if (matchState.showVideo) {
      setShowMomentumContext(false);
    } else {
      // Show notification when no video is available (unless manually dismissed)
      setShowMomentumContext(true);
    }
  }, [matchState.showVideo]);

  // Save state before each action for undo
  const saveState = (currentState: MatchState) => {
    setUndoStack(prev => [...prev.slice(-4), currentState]); // Keep last 5 states
  };

  const addPoint = (playerId: string) => {
    saveState(matchState);
    
    setMatchState(prev => {
      const newState = { ...prev };
      
      if (playerId === '1') {
        newState.player1.score++;
      } else {
        newState.player2.score++;
      }
      
      // Process momentum and generate strategic messages
      const momentumEvent = {
        pointNo: newState.player1.score + newState.player2.score,
        scoringTeam: playerId === '1' ? 'team1' as const : 'team2' as const,
        score: [newState.player1.score, newState.player2.score] as [number, number],
        timestamp: Date.now(),
        tags: []
      };
      
      const newMessages = momentumEngine.processPoint(momentumEvent);
      newState.strategicMessages = [...prev.strategicMessages, ...newMessages];
      newState.momentumState = momentumEngine.getState();
      
      // Check for mega streak messages and trigger animations
      const megaStreakMsg = newMessages.find(msg => msg.type === 'megaStreak');
      if (megaStreakMsg && megaStreakMsg.megaLevel) {
        const teamColor = megaStreakMsg.team === 'team1' ? teamTheme.team1.color : teamTheme.team2.color;
        const teamName = megaStreakMsg.team === 'team1' ? newState.player1.name : newState.player2.name;
        
        setMegaAnimation({
          show: true,
          megaLevel: megaStreakMsg.megaLevel,
          teamColor,
          teamName
        });
      }
      
      // Check for game win based on config
      const p1Score = newState.player1.score;
      const p2Score = newState.player2.score;
      const { pointTarget, winByTwo } = newState.config;
      
      const hasReachedTarget = p1Score >= pointTarget || p2Score >= pointTarget;
      const hasWinMargin = winByTwo ? Math.abs(p1Score - p2Score) >= 2 : p1Score !== p2Score;
      
      if (hasReachedTarget && hasWinMargin) {
        const winner = p1Score > p2Score ? newState.player1.name : newState.player2.name;
        
        // Add to game history
        newState.gameHistory.push({
          player1Score: p1Score,
          player2Score: p2Score,
          winner
        });
        
        // Check for achievements with personalized reactions
        const margin = Math.abs(p1Score - p2Score);
        if (p1Score === pointTarget && p2Score === 0 || p2Score === pointTarget && p1Score === 0) {
          newState.achievements.push({
            type: 'ace',
            message: `${winner} scored a perfect game!`,
            timestamp: Date.now()
          });
          // Add to strategic messages instead of separate reaction
          newState.strategicMessages.push({
            id: `game-${Date.now()}-${Math.random()}`,
            type: 'gamePoint',
            priority: 0,
            text: `🏆 PERFECT GAME! ${winner} wins ${p1Score}-${p2Score}`,
            timestamp: Date.now(),
            pointNo: newState.player1.score + newState.player2.score,
            team: winner === newState.player1.name ? 'team1' : 'team2',
            duration: 5000, // Show longer for game wins
            megaLevel: 3 // Highest importance
          });
        } else {
          // Add to strategic messages instead of separate reaction
          newState.strategicMessages.push({
            id: `game-${Date.now()}-${Math.random()}`,
            type: 'gamePoint',
            priority: 0,
            text: `🎉 GAME WON! ${winner} takes the game ${p1Score}-${p2Score}`,
            timestamp: Date.now(),
            pointNo: newState.player1.score + newState.player2.score,
            team: winner === newState.player1.name ? 'team1' : 'team2',
            duration: 4000, // Show longer for game wins
            megaLevel: 2
          });
        }
        
        // Reset scores for next game
        newState.player1.score = 0;
        newState.player2.score = 0;
        newState.currentGame++;
        
        // Check for match completion based on format
        const p1Wins = newState.gameHistory.filter(g => g.winner === newState.player1.name).length;
        const p2Wins = newState.gameHistory.filter(g => g.winner === newState.player2.name).length;
        
        const requiredWins = newState.config.matchFormat === 'single' ? 1 : 
                           newState.config.matchFormat === 'best-of-3' ? 2 : 3;
        
        if (p1Wins === requiredWins || p2Wins === requiredWins) {
          newState.matchComplete = true;
          const matchWinner = p1Wins === requiredWins ? newState.player1.name : newState.player2.name;
          // Add match completion to strategic messages instead of separate reaction
          newState.strategicMessages.push({
            id: `match-${Date.now()}-${Math.random()}`,
            type: 'matchPoint',
            priority: 0,
            text: `🏆 MATCH COMPLETE! ${matchWinner} wins the ${newState.config.matchFormat === 'single' ? 'match' : newState.config.matchFormat}!`,
            timestamp: Date.now(),
            pointNo: newState.player1.score + newState.player2.score,
            team: matchWinner === newState.player1.name ? 'team1' : 'team2',
            duration: 6000, // Show even longer for match completion
            megaLevel: 3 // Highest importance
          });
        }
      }
      
      return newState;
    });
  };

  const removePoint = (playerId: string) => {
    saveState(matchState);
    
    setMatchState(prev => {
      const newState = { ...prev };
      
      // Can't remove points if score is already 0
      if (playerId === '1' && newState.player1.score > 0) {
        newState.player1.score--;
      } else if (playerId === '2' && newState.player2.score > 0) {
        newState.player2.score--;
      } else {
        return prev; // No change if trying to remove from 0 score
      }
      
      // Properly backtrack momentum by removing the last point
      // This ensures accurate momentum recalculation without distortion
      const backtrackMessages = momentumEngine.removeLastPoint();
      
      // Add any messages from the backtrack operation
      newState.strategicMessages = [...prev.strategicMessages, ...backtrackMessages];
      
      // Update momentum state after proper backtracking
      newState.momentumState = momentumEngine.getState();

      // Detect scoring mode after point removal
      detectScoringMode();
      
      return newState;
    });
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setMatchState(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const resetMatch = () => {
    const resetNames = getInitialPlayerNames();
    setMatchState(prev => ({
      player1: { name: resetNames.player1, id: '1', tier: 'Elite', score: 0 },
      player2: { name: resetNames.player2, id: '2', tier: 'Professional', score: 0 },
      gameHistory: [],
      currentGame: 1,
      matchComplete: false,
      achievements: [],
      streak: { player: '', count: 0, type: 'win' },
      config: prev.config,
      strategicMessages: [],
      momentumState: undefined,
      showVideo: prev.showVideo
    }));
    setUndoStack([]);
  };

  const startNewMatch = () => {
    setShowConfig(true);
    resetMatch();
  };

  const isWinning = (playerId: string) => {
    if (playerId === '1') {
      return matchState.player1.score > matchState.player2.score;
    }
    return matchState.player2.score > matchState.player1.score;
  };

  // Match Configuration Component
  const MatchConfigModal = () => {
    const [tempConfig, setTempConfig] = useState<MatchConfig>(matchState.config);

    const startMatch = () => {
      // Update momentum engine with new config
      momentumEngine.reset();
      
      setMatchState(prev => ({ 
        ...prev, 
        config: tempConfig,
        showVideo: Boolean(tempConfig.liveStreamUrl || tempConfig.recordingUrl)
      }));
      setShowConfig(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-6 bg-slate-800 border-slate-700">
            {/* Back Button */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToPrototype}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lobby
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gamepad2 className="h-8 w-8 text-orange-400" />
                <h1 className="text-2xl font-bold text-white">Match Setup</h1>
              </div>
              <p className="text-slate-400">Configure your match settings</p>
              
              {/* Epic Full-Screen Versus Preview */}
              <div className="mt-6">
                {(() => {
                  const theme = getRandomTeamTheme();
                  return (
                    <VersusScreen
                      mode="mid"
                      teams={[
                        {
                          name: theme.team1.name,
                          color: theme.team1.color,
                          glowColor: theme.team1.color,
                          players: [{ id: 1, name: initialNames.player1, displayName: initialNames.player1 }]
                        },
                        {
                          name: theme.team2.name,
                          color: theme.team2.color,
                          glowColor: theme.team2.color,
                          players: [{ id: 2, name: initialNames.player2, displayName: initialNames.player2 }]
                        }
                      ]}
                      showStats={true}
                      intensity={0.8}
                    />
                  );
                })()}
              </div>
              
              {/* Player Names Display */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-blue-300 font-medium">{initialNames.player1}</span>
                  </div>
                  <span className="text-slate-400 font-bold">vs</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-red-300 font-medium">{initialNames.player2}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Scoring Type */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Scoring System</label>
                <div className="grid grid-cols-2 gap-2">
                  <PulsingScoreButton
                    onClick={() => setTempConfig(prev => ({ ...prev, scoringType: 'traditional' }))}
                    variant={tempConfig.scoringType === 'traditional' ? 'winning' : 'default'}
                  >
                    <div className="text-center">
                      <div className="font-bold">Traditional</div>
                      <div className="text-xs opacity-75">Side-out</div>
                    </div>
                  </PulsingScoreButton>
                  <PulsingScoreButton
                    onClick={() => setTempConfig(prev => ({ ...prev, scoringType: 'rally' }))}
                    variant={tempConfig.scoringType === 'rally' ? 'winning' : 'default'}
                  >
                    <div className="text-center">
                      <div className="font-bold">Rally</div>
                      <div className="text-xs opacity-75">Every point</div>
                    </div>
                  </PulsingScoreButton>
                </div>
              </div>

              {/* Point Target */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Points to Win</label>
                <div className="grid grid-cols-3 gap-2">
                  {([11, 15, 21] as const).map(points => (
                    <PulsingScoreButton
                      key={points}
                      onClick={() => setTempConfig(prev => ({ ...prev, pointTarget: points }))}
                      variant={tempConfig.pointTarget === points ? 'winning' : 'default'}
                    >
                      {points}
                    </PulsingScoreButton>
                  ))}
                </div>
                {tempConfig.scoringType === 'rally' && tempConfig.pointTarget === 11 && (
                  <p className="text-xs text-orange-400 mt-1">Rally scoring typically uses 15 or 21 points</p>
                )}
              </div>

              {/* Match Format */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Match Format</label>
                <div className="space-y-2">
                  {([
                    { value: 'single', label: 'Single Game', desc: 'First to win 1 game' },
                    { value: 'best-of-3', label: 'Best of 3', desc: 'First to win 2 games' },
                    { value: 'best-of-5', label: 'Best of 5', desc: 'First to win 3 games' }
                  ] as const).map(format => (
                    <PulsingScoreButton
                      key={format.value}
                      onClick={() => setTempConfig(prev => ({ ...prev, matchFormat: format.value }))}
                      variant={tempConfig.matchFormat === format.value ? 'winning' : 'default'}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <div className="font-bold">{format.label}</div>
                          <div className="text-xs opacity-75">{format.desc}</div>
                        </div>
                        {tempConfig.matchFormat === format.value && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </PulsingScoreButton>
                  ))}
                </div>
              </div>

              {/* Win by 2 */}
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Must win by 2</div>
                  <div className="text-xs text-slate-400">Require 2-point margin to win</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTempConfig(prev => ({ ...prev, winByTwo: !prev.winByTwo }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    tempConfig.winByTwo ? 'bg-orange-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: tempConfig.winByTwo ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Video Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-400" />
                  <label className="text-sm text-slate-400 font-medium">Video Integration (Optional)</label>
                </div>
                
                {/* Live Stream */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 block">Live Stream URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={tempConfig.liveStreamUrl || ''}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        liveStreamUrl: e.target.value,
                        videoProvider: e.target.value ? 'hls' : undefined
                      }))}
                      placeholder="https://stream.example.com/live.m3u8"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                    {tempConfig.liveStreamUrl && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Recorded Video */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 block">Recorded Video URL</label>
                  <input
                    type="url"
                    value={tempConfig.recordingUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      let provider: 'mp4' | 'youtube' | 'vimeo' | undefined;
                      
                      if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        provider = 'youtube';
                      } else if (url.includes('vimeo.com')) {
                        provider = 'vimeo';
                      } else if (url.includes('.mp4')) {
                        provider = 'mp4';
                      }
                      
                      setTempConfig(prev => ({ 
                        ...prev, 
                        recordingUrl: url,
                        videoProvider: provider
                      }));
                    }}
                    placeholder="YouTube, Vimeo, or MP4 URL"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  {tempConfig.recordingUrl && (
                    <div className="text-xs text-slate-500">
                      Detected: {tempConfig.videoProvider === 'youtube' ? 'YouTube' : 
                                tempConfig.videoProvider === 'vimeo' ? 'Vimeo' : 
                                tempConfig.videoProvider === 'mp4' ? 'MP4 Video' : 'Unknown format'}
                    </div>
                  )}
                </div>

                {/* Video Sync Offset */}
                {(tempConfig.liveStreamUrl || tempConfig.recordingUrl) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-500">Video Sync Offset</label>
                      <span className="text-xs text-slate-400">{tempConfig.videoSyncOffset || 0}s</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="0.5"
                      value={tempConfig.videoSyncOffset || 0}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        videoSyncOffset: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-slate-600">Adjust if video doesn't match live scoring</div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={startMatch}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Match Arena!
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  };

  if (showConfig) {
    return <MatchConfigModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Header with game feel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Back Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBackToPrototype}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
          
          {matchState.matchComplete && (
            <Button
              onClick={goBackToPrototype}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Return to Arena
            </Button>
          )}
        </div>
        
        {/* Match Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gamepad2 className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Match Arena</h1>
            <Gamepad2 className="h-8 w-8 text-orange-400" />
          </div>
          
          {/* Epic Versus Screen */}
          <div className="mb-6">
            <VersusScreen
              mode="mid"
              teams={[
                {
                  name: teamTheme.team1.name,
                  color: teamTheme.team1.color,
                  glowColor: teamTheme.team1.color,
                  players: [{ id: 1, name: matchState.player1.name, displayName: matchState.player1.name }]
                },
                {
                  name: teamTheme.team2.name,
                  color: teamTheme.team2.color,
                  glowColor: teamTheme.team2.color,
                  players: [{ id: 2, name: matchState.player2.name, displayName: matchState.player2.name }]
                }
              ]}
              showStats={true}
              intensity={0.8}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge className="bg-orange-500/20 text-orange-300">
            Game {matchState.currentGame}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300">
            {matchState.config.matchFormat === 'single' ? 'Single Game' :
             matchState.config.matchFormat === 'best-of-3' ? 'Best of 3' : 'Best of 5'}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300">
            {matchState.config.scoringType === 'traditional' ? 'Traditional' : 'Rally'} • {matchState.config.pointTarget} pts
          </Badge>
          {matchState.config.winByTwo && (
            <Badge className="bg-green-500/20 text-green-300">
              Win by 2
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Enhanced Pre-Match Momentum Education */}
      {showMomentumContext && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 relative"
        >
          <Card className="p-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {matchState.showVideo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <Camera className="h-4 w-4 text-blue-400" />
                  </div>
                ) : isLiveMode ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <BarChart3 className="h-4 w-4 text-orange-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="space-y-3">
                  {/* Main status message */}
                  <div className="space-y-1">
                    <p className="text-sm text-slate-300">
                      {matchState.showVideo ? (
                        <>
                          <span className="text-blue-400 font-semibold">📹 Video-Enhanced Tracking</span> - 
                          Maximum accuracy momentum analysis with video reference
                        </>
                      ) : isLiveMode ? (
                        <>
                          <span className="text-green-400 font-semibold">🎯 Live Point-by-Point Mode</span> - 
                          Perfect! You're getting the most accurate momentum analysis
                        </>
                      ) : (
                        <>
                          <span className="text-orange-400 font-semibold">📊 Approximate Mode</span> - 
                          Momentum shows general flow but may be less accurate
                        </>
                      )}
                    </p>
                    
                    {/* Pre-match education for new users */}
                    {(matchState.player1.score + matchState.player2.score) === 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-800/50 rounded-lg p-3 mt-2 border-l-4 border-blue-500"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-300 font-semibold text-sm">Momentum Wave Guide</span>
                          </div>
                          <div className="text-xs text-slate-300 space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <span><strong>Best:</strong> Record each point as it happens for real-time momentum tracking</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span><strong>Good:</strong> Add a video URL to enhance accuracy during post-match analysis</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">•</span>
                              <span><strong>Basic:</strong> Enter final scores only (momentum will show general trends)</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 italic mt-2">
                            💡 The momentum wave becomes more accurate with each point you record
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Match progress info */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Current Score:</span>
                      <span className="text-white font-mono">{matchState.player1.score}-{matchState.player2.score}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Game:</span>
                      <span className="text-white">{matchState.currentGame}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Points Recorded:</span>
                      <span className="text-white">{matchState.player1.score + matchState.player2.score}</span>
                    </div>
                    {isLiveMode && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Activity className="h-3 w-3" />
                        <span className="font-semibold">Live</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action suggestions */}
                  {!matchState.showVideo && !isLiveMode && (matchState.player1.score + matchState.player2.score) > 0 && (
                    <div className="text-xs text-slate-400 bg-slate-800/30 rounded p-2">
                      💡 <span className="text-orange-300">Tip:</span> Add a video URL in settings for more accurate momentum analysis of this match
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMomentumContext(false)}
                className="flex-shrink-0 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Momentum Wave Visualization */}
      {matchState.momentumState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 ${matchState.matchComplete ? 'ring-2 ring-yellow-400/50 rounded-lg p-2' : ''}`}
        >
          {matchState.matchComplete && (
            <div className="mb-2 text-center">
              <Badge className="bg-yellow-500/20 text-yellow-300 font-semibold">
                📊 Match Analysis - Review Your Momentum Journey
              </Badge>
            </div>
          )}
          <MomentumWave
            momentumState={{
              ...matchState.momentumState,
              currentScore: { player1: matchState.player1.score, player2: matchState.player2.score },
              gameNumber: matchState.currentGame,
              isMatchComplete: matchState.matchComplete
            }}
            team1Color={teamTheme.team1.color}
            team2Color={teamTheme.team2.color}
            team1Name={matchState.player1.name}
            team2Name={matchState.player2.name}
            className="w-full"
            isInteractive={true}
            isMatchComplete={matchState.matchComplete}
          />

          {/* Match Closeness Indicator */}
          {matchState.momentumState?.closeness && (
            <div className="mt-4 relative" style={{ zIndex: 30 }}>
              <MatchClosenessIndicator 
                closeness={matchState.momentumState.closeness}
                team1Name={matchState.player1?.name}
                team2Name={matchState.player2?.name}
                momentumScore={matchState.momentumState.momentumScore}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Game History */}
      {matchState.gameHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-orange-400" />
              Match Progress
            </h3>
            <div className="flex gap-2">
              {matchState.gameHistory.map((game, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg"
                >
                  <span className="text-white font-bold">
                    {game.player1Score}-{game.player2Score}
                  </span>
                  <Crown className="h-4 w-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GameifiedPlayerCard
          player={matchState.player1}
          score={matchState.player1.score}
          isWinning={isWinning('1')}
          onClick={() => !matchState.matchComplete && addPoint('1')}
        />
        
        <GameifiedPlayerCard
          player={matchState.player2}
          score={matchState.player2.score}
          isWinning={isWinning('2')}
          onClick={() => !matchState.matchComplete && addPoint('2')}
        />
      </div>

      {/* Gaming-style Score Controls */}
      <Card className="p-6 bg-slate-800/50 border-slate-700 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-400" />
          Score Control
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Player 1 Controls */}
          <div className="space-y-3">
            <div className="text-center text-white font-semibold">{matchState.player1.name}</div>
            <div className="flex gap-2">
              <PulsingScoreButton
                onClick={() => removePoint('1')}
                variant="danger"
                disabled={matchState.matchComplete || matchState.player1.score === 0}
              >
                <Minus className="h-6 w-6" />
              </PulsingScoreButton>
              <PulsingScoreButton
                onClick={() => addPoint('1')}
                variant={isWinning('1') ? 'winning' : 'default'}
                disabled={matchState.matchComplete}
              >
                <Plus className="h-6 w-6" />
              </PulsingScoreButton>
              <div className="flex-1 flex items-center justify-center bg-slate-700 rounded-xl">
                <span className="text-3xl font-bold text-white">{matchState.player1.score}</span>
              </div>
            </div>
          </div>

          {/* Player 2 Controls */}
          <div className="space-y-3">
            <div className="text-center text-white font-semibold">{matchState.player2.name}</div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center bg-slate-700 rounded-xl">
                <span className="text-3xl font-bold text-white">{matchState.player2.score}</span>
              </div>
              <PulsingScoreButton
                onClick={() => addPoint('2')}
                variant={isWinning('2') ? 'winning' : 'default'}
                disabled={matchState.matchComplete}
              >
                <Plus className="h-6 w-6" />
              </PulsingScoreButton>
              <PulsingScoreButton
                onClick={() => removePoint('2')}
                variant="danger"
                disabled={matchState.matchComplete || matchState.player2.score === 0}
              >
                <Minus className="h-6 w-6" />
              </PulsingScoreButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Strategic Message Toasts */}
      <MessageToast
        messages={matchState.strategicMessages}
        onMessageExpire={handleMessageExpire}
        team1Color={teamTheme.team1.color}
        team2Color={teamTheme.team2.color}
      />

      {/* Video Player */}
      {matchState.showVideo && (
        <VideoDock
          config={{
            liveStreamUrl: matchState.config.liveStreamUrl,
            recordingUrl: matchState.config.recordingUrl,
            videoProvider: matchState.config.videoProvider,
            videoSyncOffset: matchState.config.videoSyncOffset
          }}
          isVisible={matchState.showVideo}
          onSyncOffsetChange={(offset) => {
            setMatchState(prev => ({
              ...prev,
              config: { ...prev.config, videoSyncOffset: offset }
            }));
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center mb-6">
        <Button
          onClick={undo}
          disabled={undoStack.length === 0}
          variant="outline"
          className="text-white border-slate-600 hover:bg-slate-700"
        >
          <Undo2 className="h-4 w-4 mr-2" />
          Undo
        </Button>
        
        <Button
          onClick={() => setShowStats(!showStats)}
          variant="outline"
          className="text-white border-slate-600 hover:bg-slate-700"
        >
          <Activity className="h-4 w-4 mr-2" />
          Stats
        </Button>
        
        <Button
          onClick={resetMatch}
          variant="outline"
          className="text-white border-slate-600 hover:bg-slate-700"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={startNewMatch}
          variant="outline"
          className="text-white border-slate-600 hover:bg-slate-700"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          New Match
        </Button>
      </div>

      {/* Match Complete Celebration */}
      {matchState.matchComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <Card className="p-8 bg-gradient-to-br from-orange-500 to-yellow-500 border-none text-center max-w-md">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="h-16 w-16 text-white mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Match Complete!</h2>
            <div className="space-y-2 mb-6">
              {matchState.gameHistory.map((game, index) => (
                <div key={index} className="text-white">
                  Game {index + 1}: {game.player1Score}-{game.player2Score} ({game.winner} won)
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={resetMatch}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-orange-500"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Same Settings
              </Button>
              <Button
                onClick={startNewMatch}
                className="bg-white text-orange-500 hover:bg-slate-100"
              >
                <PartyPopper className="h-4 w-4 mr-2" />
                New Match
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Game win notifications now handled through MessageToast with other strategic messages */}

      {/* Mega Streak Animations */}
      <MegaStreakAnimation
        show={megaAnimation.show}
        megaLevel={megaAnimation.megaLevel}
        teamColor={megaAnimation.teamColor}
        teamName={megaAnimation.teamName}
        onComplete={() => setMegaAnimation({ show: false, megaLevel: 1, teamColor: '#ff6b35', teamName: '' })}
      />
    </div>
  );
}