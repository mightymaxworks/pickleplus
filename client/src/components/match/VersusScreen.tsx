import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown, Sword, Shield, Star, Target } from 'lucide-react';

// Types
interface VersusPlayer {
  id: number;
  name: string;
  displayName?: string;
  passportCode?: string;
  gender?: string;
  rankingPoints?: number;
  age?: number;
  avatarUrl?: string;
}

interface VersusTeam {
  name: string;
  color: string;
  glowColor: string;
  players: VersusPlayer[];
}

interface VersusScreenProps {
  mode: 'mini' | 'mid' | 'full';
  teams: [VersusTeam, VersusTeam];
  intensity?: number; // 0-1 for animation intensity
  showStats?: boolean;
  onReady?: () => void;
  className?: string;
  staticMode?: boolean; // Disable animations for setup screens
}

// Background effects component
const BackgroundFX = ({ mode, intensity = 0.8, staticMode = false }: { mode: string; intensity: number; staticMode?: boolean }) => {
  if (mode === 'mini') return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static background gradient for setup, animated for live matches */}
      {staticMode ? (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10" />
      ) : (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(249,115,22,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
              'linear-gradient(45deg, rgba(59,130,246,0.1) 0%, transparent 50%, rgba(249,115,22,0.1) 100%)',
              'linear-gradient(45deg, rgba(249,115,22,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      
      {/* Scanlines for full mode */}
      {mode === 'full' && (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_98%,rgba(255,255,255,0.03)_100%)] bg-[length:4px_4px]" />
      )}
      
      {/* Floating particles - only animate when not in static mode */}
      {intensity > 0.5 && !staticMode && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// VS Glyph component
const VsGlyph = ({ mode, delay = 0 }: { mode: string; delay?: number }) => {
  const size = mode === 'mini' ? 'text-lg' : mode === 'mid' ? 'text-2xl' : 'text-6xl';
  const glowClass = mode === 'full' ? 'drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]' : '';
  
  return (
    <motion.div
      className={`flex items-center justify-center ${size} font-black text-orange-400 ${glowClass} z-20`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        delay: delay + 0.6, 
        duration: 0.5, 
        type: 'spring', 
        stiffness: 200 
      }}
    >
      {mode === 'full' ? (
        <div className="relative">
          <div className="absolute inset-0 text-orange-500/30 blur-sm">VS</div>
          <div className="relative">VS</div>
        </div>
      ) : (
        'VS'
      )}
    </motion.div>
  );
};

// Player chip component
const VersusPlayerChip = ({ 
  player, 
  teamColor, 
  side, 
  mode, 
  index = 0 
}: { 
  player: VersusPlayer; 
  teamColor: string; 
  side: 'left' | 'right'; 
  mode: string; 
  index?: number; 
}) => {
  const slideDirection = side === 'left' ? -40 : 40;
  const isCompact = mode === 'mini';
  
  return (
    <motion.div
      className={`flex items-center gap-2 ${
        isCompact ? 'text-sm' : 'text-base'
      } ${side === 'right' ? 'flex-row-reverse' : ''}`}
      initial={{ x: slideDirection, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
    >
      {/* Avatar */}
      <motion.div
        className={`relative ${isCompact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ 
          background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)` 
        }}
        whileHover={{ scale: 1.05 }}
      >
        {player.displayName?.charAt(0) || player.name.charAt(0)}
        
        {/* Rank badge for non-mini modes */}
        {!isCompact && player.rankingPoints && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-black text-black"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            {player.rankingPoints > 1500 ? <Crown className="w-3 h-3" /> : 
             player.rankingPoints > 1000 ? <Star className="w-3 h-3" /> : 
             <Target className="w-3 h-3" />}
          </motion.div>
        )}
      </motion.div>
      
      {/* Player info */}
      <div className={`${side === 'right' ? 'text-right' : 'text-left'}`}>
        <div className={`font-semibold text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {player.displayName || player.name}
        </div>
        {!isCompact && (
          <div className="text-xs text-slate-400 font-mono">
            {player.passportCode}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Team section component
const VersusTeam = ({ 
  team, 
  side, 
  mode, 
  showStats,
  staticMode = false
}: { 
  team: VersusTeam; 
  side: 'left' | 'right'; 
  mode: string; 
  showStats?: boolean; 
  staticMode?: boolean;
}) => {
  const isLeft = side === 'left';
  const slideDirection = isLeft ? -40 : 40;
  
  return (
    <motion.div
      className={`flex-1 relative ${isLeft ? 'text-left' : 'text-right'}`}
      initial={{ x: slideDirection, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Team glow effect for mid/full modes - only animate when not in static mode */}
      {mode !== 'mini' && (
        staticMode ? (
          <div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{ backgroundColor: team.color }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{ backgroundColor: team.color }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )
      )}
      
      {/* Team header */}
      <motion.div
        className={`relative z-10 p-3 ${mode === 'mini' ? 'p-2' : 'p-4'}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`font-bold text-white mb-2 ${
          mode === 'mini' ? 'text-sm' : mode === 'mid' ? 'text-lg' : 'text-2xl'
        }`}>
          <div className="flex items-center gap-2">
            {isLeft ? (
              <>
                <Shield className={`${mode === 'mini' ? 'w-4 h-4' : 'w-6 h-6'}`} style={{ color: team.color }} />
                <span>{team.name}</span>
              </>
            ) : (
              <>
                <span>{team.name}</span>
                <Sword className={`${mode === 'mini' ? 'w-4 h-4' : 'w-6 h-6'}`} style={{ color: team.color }} />
              </>
            )}
          </div>
        </div>
        
        {/* Players */}
        <div className="space-y-2">
          {team.players.map((player, index) => (
            <VersusPlayerChip
              key={player.id}
              player={player}
              teamColor={team.color}
              side={side}
              mode={mode}
              index={index}
            />
          ))}
        </div>
        
        {/* Team stats for full mode */}
        {mode === 'full' && showStats && (
          <motion.div
            className="mt-4 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Avg. {Math.round(team.players.reduce((sum, p) => sum + (p.rankingPoints || 0), 0) / team.players.length)} pts
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Main VersusScreen component
export function VersusScreen({ 
  mode, 
  teams, 
  intensity = 0.8, 
  showStats = false, 
  onReady, 
  className = '',
  staticMode = false
}: VersusScreenProps) {
  React.useEffect(() => {
    if (onReady) {
      const timer = setTimeout(onReady, mode === 'full' ? 1200 : 800);
      return () => clearTimeout(timer);
    }
  }, [onReady, mode]);

  const containerClass = {
    mini: 'bg-slate-800/30 rounded-lg border border-slate-700/50 p-3',
    mid: 'bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 relative overflow-hidden',
    full: 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border-2 border-orange-500/50 p-8 relative overflow-hidden shadow-2xl shadow-orange-500/20'
  }[mode];

  const contentClass = {
    mini: 'flex items-center gap-4',
    mid: 'flex items-center gap-6 relative z-10',
    full: 'flex items-center gap-12 w-full relative z-10'
  }[mode];

  return (
    <AnimatePresence>
      <motion.div
        className={`${containerClass} ${className}`}
        initial={{ opacity: 0, scale: mode === 'full' ? 0.9 : 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: mode === 'full' ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <BackgroundFX mode={mode} intensity={intensity} staticMode={staticMode} />
        
        <div className={contentClass}>
          <VersusTeam 
            team={teams[0]} 
            side="left" 
            mode={mode} 
            showStats={showStats}
            staticMode={staticMode}
          />
          
          <VsGlyph mode={mode} />
          
          <VersusTeam 
            team={teams[1]} 
            side="right" 
            mode={mode} 
            showStats={showStats}
            staticMode={staticMode}
          />
        </div>
        
        {/* Confetti for full mode */}
        {mode === 'full' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  rotate: [0, 360, 720],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}