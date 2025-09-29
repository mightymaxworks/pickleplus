/**
 * ⚠️  CRITICAL COMPONENT - DO NOT EDIT WITHOUT APPROVAL ⚠️
 * 
 * GamifiedMatchRecording.tsx - Gaming-style Match Recording Interface
 * 
 * This is a core component for the "Twitch for Pickleball" experience with:
 * - Gaming animations and momentum tracking
 * - Interactive analytics and achievement systems  
 * - Real-time match recording with visual feedback
 * 
 * 🚨 PROTECTION NOTICE:
 * - Any modifications require explicit approval
 * - This component is part of the protected gaming experience
 * - For extensions, create wrapper components instead of editing directly
 * - Route: /gamified-match-recording (protected)
 * 
 * Contact: Lead developer before making changes
 * Last Protected: 2025-09-29
 */

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
  // MINIMAL TEST VERSION - Remove all complex imports that might be causing crashes
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">🏓 MINIMAL TEST VERSION</h1>
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-4">If you see this, routing works!</h2>
        <p className="text-green-400">✅ Component mounted successfully</p>
        <p className="text-blue-400">✅ No import crashes</p>
        <p className="text-yellow-400">⚠️ Complex features temporarily disabled</p>
      </div>
    </div>
  );
}
