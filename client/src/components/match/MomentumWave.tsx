import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { MomentumState } from './MomentumEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface MomentumWaveProps {
  momentumState: MomentumState & {
    currentScore?: { player1: number; player2: number };
    gameNumber?: number;
    isMatchComplete?: boolean;
  };
  team1Color: string;
  team2Color: string;
  team1Name?: string;
  team2Name?: string;
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
  team1Name = "Team 1",
  team2Name = "Team 2",
  className = '', 
  isInteractive = false,
  isMatchComplete = false 
}: MomentumWaveProps) => {
  const { wave, momentum, momentumScore, streak, gamePhase, currentScore, gameNumber } = momentumState;
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Analyze momentum shifts for tooltips
  const analyzeMomentumShifts = (): TooltipData[] => {
    const shifts: TooltipData[] = [];
    if (!wave || wave.length < 2) return shifts;
    
    for (let i = 1; i < wave.length; i++) {
      const prev = wave[i - 1];
      const curr = wave[i];
      
      // Ensure both prev and curr exist and have required properties
      if (!prev || !curr || typeof prev.y !== 'number' || typeof curr.y !== 'number') {
        continue;
      }
      
      const shift = Math.abs(curr.y - prev.y);
      
      if (shift > 0.3) { // Significant momentum shift
        let reason = '';
        if (curr.y > prev.y) {
          reason = curr.y > 0.7 ? 'Dominant streak! Multiple consecutive points' : 
                   curr.y > 0.4 ? 'Building momentum with consistent play' : 
                   'Turning the tide with key points';
        } else {
          reason = curr.y < -0.7 ? 'Momentum completely reversed!' : 
                   curr.y < -0.4 ? 'Opponent fighting back' : 
                   'Losing momentum after missed opportunities';
        }
        
        shifts.push({
          x: 0, // Will be set later
          y: 0, // Will be set later
          point: i,
          momentum: curr.y,
          reason,
          timestamp: Date.now(),
          score: { player1: 0, player2: 0 } // Will be updated with actual scores
        });
      }
    }
    return shifts;
  };

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

  // Handle hover events for interactive mode
  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!isInteractive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setMousePosition({ x: event.clientX, y: event.clientY });
    
    // Find nearest wave point
    const width = 300;
    const pointIndex = Math.round((x / width) * (wave.length - 1));
    
    if (pointIndex >= 0 && pointIndex < wave.length) {
      const point = wave[pointIndex];
      const shifts = analyzeMomentumShifts();
      const shift = shifts.find(s => s.point === pointIndex);
      
      setHoveredPoint({
        x,
        y,
        point: pointIndex,
        momentum: point.y,
        reason: shift?.reason || (point.y > 0 ? 'Momentum favoring this side' : 'Momentum against this side'),
        timestamp: Date.now(),
        score: currentScore || { player1: Math.floor(pointIndex * 0.6), player2: Math.floor((wave.length - pointIndex) * 0.5) }
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const wavePath = generateWavePath();
  const momentumShifts = analyzeMomentumShifts();
  const intensity = Math.abs(momentum);
  const glowIntensity = Math.min(intensity * 2, 1);
  
  // Determine dominant team and colors
  const dominantTeam = momentum > 0 ? 'team1' : 'team2';
  const dominantColor = momentum > 0 ? team1Color : team2Color;
  const fillOpacity = Math.min(Math.abs(momentum) * 0.6 + 0.2, 0.8);

  return (
    <div className="relative">
      {/* Interactive Tooltip */}
      {isInteractive && hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 80
          }}
        >
          <Card className="p-3 bg-slate-900/95 border-slate-600 backdrop-blur-sm max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {hoveredPoint.momentum > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <Badge className={`text-xs ${hoveredPoint.momentum > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  Point {hoveredPoint.point + 1}
                </Badge>
              </div>
              <p className="text-sm text-white/90 font-medium">
                {hoveredPoint.reason}
              </p>
              <div className="text-xs text-white/60">
                Score: {hoveredPoint.score?.player1 || 0}-{hoveredPoint.score?.player2 || 0}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

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
            <svg 
              width="100%" 
              height="60" 
              viewBox="0 0 300 60" 
              className={`overflow-visible ${isInteractive ? 'cursor-crosshair' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
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
              
              {/* Key momentum shift indicators */}
              {isInteractive && momentumShifts.map((shift) => (
                <motion.circle
                  key={shift.point}
                  cx={(shift.point / Math.max(wave.length - 1, 1)) * 300}
                  cy={30 - (shift.momentum * 30 * 0.8)}
                  r="3"
                  fill={shift.momentum > 0 ? '#10b981' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth="1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ 
                    delay: shift.point * 0.1,
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }}
                  style={{
                    filter: `drop-shadow(0 0 4px ${shift.momentum > 0 ? '#10b981' : '#ef4444'})`
                  }}
                />
              ))}

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
    </div>
  );
});

MomentumWave.displayName = 'MomentumWave';