import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { MomentumState } from './MomentumEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface MomentumWaveProps {
  momentumState: MomentumState;
  team1Color: string;
  team2Color: string;
  className?: string;
  isInteractive?: boolean;
  isMatchComplete?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  point: number;
  momentum: number;
  reason: string;
  timestamp: number;
  score: { player1: number; player2: number };
}

export const MomentumWave = memo(({ 
  momentumState, 
  team1Color, 
  team2Color, 
  className = '', 
  isInteractive = false,
  isMatchComplete = false 
}: MomentumWaveProps) => {
  const { wave, momentum, momentumScore, streak, gamePhase } = momentumState;
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Generate SVG path for momentum wave
  const generateWavePath = () => {
    if (wave.length < 2) return '';
    
    const width = 300;
    const height = 60;
    const centerY = height / 2;
    
    let path = `M 0 ${centerY}`;
    
    wave.forEach((point, index) => {
      const x = (index / (wave.length - 1)) * width;
      const y = centerY - (point.y * centerY * 0.8); // Scale momentum to chart height
      
      if (index === 0) {
        path += ` L ${x} ${y}`;
      } else {
        // Smooth curve using quadratic bezier
        const prevPoint = wave[index - 1];
        const prevX = ((index - 1) / (wave.length - 1)) * width;
        const prevY = centerY - (prevPoint.y * centerY * 0.8);
        
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        path += ` Q ${cpX} ${cpY} ${x} ${y}`;
      }
    });
    
    return path;
  };

  const wavePath = generateWavePath();
  const intensity = Math.abs(momentum);
  const glowIntensity = Math.min(intensity * 2, 1);
  
  // Determine dominant team and colors
  const dominantTeam = momentum > 0 ? 'team1' : 'team2';
  const dominantColor = momentum > 0 ? team1Color : team2Color;
  const fillOpacity = Math.min(Math.abs(momentum) * 0.6 + 0.2, 0.8);

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
          <span className="text-sm font-bold text-white">Momentum</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Game Phase Indicator */}
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            gamePhase === 'critical' ? 'bg-red-500/20 text-red-400' :
            gamePhase === 'late' ? 'bg-orange-500/20 text-orange-400' :
            gamePhase === 'mid' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {gamePhase.toUpperCase()}
          </div>
          
          {/* Momentum Score */}
          <div className="text-lg font-bold text-white">
            {momentumScore}
            <span className="text-xs text-slate-400 ml-1">%</span>
          </div>
        </div>
      </div>

      {/* Wave Visualization */}
      <div className="relative bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        {/* Team indicators */}
        <div className="absolute top-2 left-4 right-4 flex justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team1Color }} />
            <span style={{ color: team1Color }}>Team 1</span>
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: team2Color }}>Team 2</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team2Color }} />
          </div>
        </div>

        {/* SVG Wave Chart */}
        <div className="mt-6">
          <svg width="100%" height="60" viewBox="0 0 300 60" className="overflow-visible">
            {/* Center baseline */}
            <line
              x1="0"
              y1="30"
              x2="300"
              y2="30"
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
            
            {/* Team 1 area (top half) */}
            {momentum > 0 && (
              <motion.path
                d={`${wavePath} L 300 30 L 0 30 Z`}
                fill={team1Color}
                fillOpacity={fillOpacity}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            {/* Team 2 area (bottom half) */}
            {momentum < 0 && (
              <motion.path
                d={`${wavePath} L 300 30 L 0 30 Z`}
                fill={team2Color}
                fillOpacity={fillOpacity}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            {/* Wave line */}
            <motion.path
              d={wavePath}
              stroke={dominantColor}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 ${4 + glowIntensity * 8}px ${dominantColor})`
              }}
            />
            
            {/* Current position indicator */}
            {wave.length > 0 && (
              <motion.circle
                cx={((wave.length - 1) / Math.max(wave.length - 1, 1)) * 300}
                cy={30 - (momentum * 30 * 0.8)}
                r="4"
                fill={dominantColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  filter: `drop-shadow(0 0 ${4 + glowIntensity * 6}px ${dominantColor})`
                }}
              />
            )}
          </svg>
        </div>

        {/* Streak Indicator */}
        {streak.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 right-4 flex items-center gap-2 bg-slate-900/80 rounded-full px-3 py-1"
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: streak.team === 'team1' ? team1Color : team2Color }}
            />
            <span className="text-xs font-bold text-white">
              {streak.length} streak
            </span>
            {streak.length >= 3 && (
              <div className="text-xs">🔥</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
});

MomentumWave.displayName = 'MomentumWave';