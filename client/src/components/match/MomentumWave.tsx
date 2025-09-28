import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { MomentumState } from './MomentumEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Zap, HelpCircle, X } from 'lucide-react';

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
  const [showTutorial, setShowTutorial] = useState(false);
  
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
    if (!isInteractive) {
      console.log('Not interactive, skipping hover');
      return;
    }
    
    if (!wave || wave.length === 0) {
      console.log('No wave data available:', { wave, waveLength: wave?.length });
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log('Mouse move detected:', { x, y, width: rect.width, height: rect.height });
    
    // Only update if mouse is actually over the wave area
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMousePosition({ x: event.clientX, y: event.clientY });
      
      // Find nearest wave point using actual SVG width
      const actualWidth = rect.width;
      const pointIndex = Math.round((x / actualWidth) * (wave.length - 1));
      
      console.log('Calculated point index:', pointIndex, 'of', wave.length);
      
      if (pointIndex >= 0 && pointIndex < wave.length) {
        const point = wave[pointIndex];
        const shifts = analyzeMomentumShifts();
        const shift = shifts.find(s => s.point === pointIndex);
        
        const newHoveredPoint = {
          x,
          y,
          point: pointIndex,
          momentum: point.y,
          reason: shift?.reason || (point.y > 0 ? 'Momentum favoring this side' : 'Momentum against this side'),
          timestamp: Date.now(),
          score: currentScore || { player1: Math.floor(pointIndex * 0.6), player2: Math.floor((wave.length - pointIndex) * 0.5) }
        };
        
        console.log('Setting hovered point:', newHoveredPoint);
        setHoveredPoint(newHoveredPoint);
      }
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

  // Momentum Tutorial Component
  const MomentumTutorial = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowTutorial(false)}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Momentum Wave Guide</h3>
              <p className="text-slate-400 text-sm">Master the art of reading match flow</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTutorial(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Wave Colors */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              🌊 Wave Colors & Meaning
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-green-300 font-medium">Green Zone</span>
                </div>
                <p className="text-slate-300 text-sm">Team 1 has momentum advantage. Consistent scoring and confidence building.</p>
              </div>
              <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-red-300 font-medium">Red Zone</span>
                </div>
                <p className="text-slate-300 text-sm">Team 2 has momentum advantage. Dominating play and pressure building.</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-yellow-300 font-medium">Neutral Zone</span>
                </div>
                <p className="text-slate-300 text-sm">Balanced match. Neither team has clear momentum advantage.</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-purple-300 font-medium">Shift Zones</span>
                </div>
                <p className="text-slate-300 text-sm">Momentum is changing. Watch for potential momentum swings.</p>
              </div>
            </div>
          </div>

          {/* Team Favor Shifts */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              ⚖️ Reading Team Favor Shifts
            </h4>
            <div className="space-y-3">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 font-medium">Rising Momentum</span>
                </div>
                <p className="text-slate-300 text-sm">Upward wave indicates a team is gaining control. Watch for streak messages and dominance patterns.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 font-medium">Falling Momentum</span>
                </div>
                <p className="text-slate-300 text-sm">Downward wave shows momentum loss. Opportunity for the opponent to capitalize.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">Sharp Turns</span>
                </div>
                <p className="text-slate-300 text-sm">Sudden direction changes indicate momentum breaks, comebacks, or critical turning points.</p>
              </div>
            </div>
          </div>

          {/* Wave Intensity */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              ⚡ Wave Intensity Levels
            </h4>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-green-300 font-medium text-sm">Gentle</div>
                  <div className="text-slate-400 text-xs">Slight advantage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌊</div>
                  <div className="text-blue-300 font-medium text-sm">Strong</div>
                  <div className="text-slate-400 text-xs">Clear momentum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌪️</div>
                  <div className="text-purple-300 font-medium text-sm">Dominant</div>
                  <div className="text-slate-400 text-xs">Overwhelming control</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2">
              💡 Pro Tips
            </h4>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Hover over the wave line to see detailed point-by-point analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Watch for 3+ consecutive points - this creates significant momentum shifts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Late game momentum is more valuable than early game momentum</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Momentum breaks often happen during high-pressure situations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setShowTutorial(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="relative">
      {/* Tutorial Modal */}
      {showTutorial && <MomentumTutorial />}

      {/* Interactive Tooltip */}
      {isInteractive && hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x - 150, // Center tooltip on cursor
            top: mousePosition.y - 120   // Extra space above cursor to avoid overlap
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
            {/* Tutorial Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 h-6 px-2"
            >
              <HelpCircle className="h-3 w-3" />
              <span className="text-xs">Guide</span>
            </Button>
            
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
          <div className="mt-6 relative">
            {/* Dynamic Background Animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(ellipse at center, ${dominantColor}20 0%, transparent 70%)`
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Pulsing Grid Background */}
              <motion.div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(${dominantColor}40 1px, transparent 1px),
                    linear-gradient(90deg, ${dominantColor}40 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
                animate={{
                  backgroundPosition: ['0px 0px', '20px 20px']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            <svg 
              width="100%" 
              height="60" 
              viewBox="0 0 300 60" 
              className={`overflow-visible ${isInteractive ? 'cursor-crosshair' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Transparent hit area for reliable hover detection */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="transparent"
                style={{ pointerEvents: 'all' }}
              />
              
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
            
              {/* Team 1 area (top half) with enhanced animations */}
              {momentum > 0 && (
                <motion.path
                  d={`${wavePath} L 300 30 L 0 30 Z`}
                  fill={team1Color}
                  fillOpacity={fillOpacity}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    fillOpacity: [fillOpacity, fillOpacity * 1.2, fillOpacity]
                  }}
                  transition={{ 
                    duration: 0.5,
                    fillOpacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
              )}
              
              {/* Team 2 area (bottom half) with enhanced animations */}
              {momentum < 0 && (
                <motion.path
                  d={`${wavePath} L 300 30 L 0 30 Z`}
                  fill={team2Color}
                  fillOpacity={fillOpacity}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    fillOpacity: [fillOpacity, fillOpacity * 1.2, fillOpacity]
                  }}
                  transition={{ 
                    duration: 0.5,
                    fillOpacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
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

              {/* Current position indicator with enhanced animation */}
              {wave.length > 0 && (
                <motion.g>
                  {/* Pulsing outer ring */}
                  <motion.circle
                    cx={((wave.length - 1) / Math.max(wave.length - 1, 1)) * 300}
                    cy={30 - (momentum * 30 * 0.8)}
                    r="6"
                    fill="none"
                    stroke={dominantColor}
                    strokeWidth="2"
                    opacity="0.6"
                    animate={{
                      r: [6, 8, 6],
                      opacity: [0.6, 0.2, 0.6]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Main indicator dot */}
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
                </motion.g>
              )}
              
              {/* Streak intensity visual effects */}
              {streak.length >= 3 && (
                <motion.g>
                  {/* Streak lightning effect */}
                  <motion.line
                    x1="0"
                    y1={30 - (momentum * 30 * 0.8)}
                    x2="300"
                    y2={30 - (momentum * 30 * 0.8)}
                    stroke={dominantColor}
                    strokeWidth="1"
                    opacity="0.8"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      filter: `drop-shadow(0 0 4px ${dominantColor})`
                    }}
                  />
                  
                  {/* Streak particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={60 + i * 50}
                      cy={30 - (momentum * 30 * 0.8)}
                      r="1.5"
                      fill={dominantColor}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        y: momentum > 0 ? [-3, -6, -3] : [3, 6, 3]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.g>
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

export default MomentumWave;