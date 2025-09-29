import { motion } from 'framer-motion';
import { memo, useState, useMemo } from 'react';
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
  width?: number;
  height?: number;
  heroMode?: boolean;
  onSpecialMoment?: (type: 'ace' | 'winner' | 'megaStreak' | 'comeback') => void;
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

interface PointDot {
  index: number;
  x: number;
  y: number;
  type: 'regular' | 'momentumShift' | 'streak' | 'gamePoint' | 'ace' | 'critical';
  team: 'team1' | 'team2';
  intensity: number; // 0-1 for animation/glow intensity
  tooltip: string;
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
  isMatchComplete = false,
  width = 600,
  height = 200, // Much larger for key feature prominence
  heroMode = false,
  onSpecialMoment
}: MomentumWaveProps) => {
  const { wave, momentum, momentumScore, streak, gamePhase, currentScore, gameNumber } = momentumState;
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTutorial, setShowTutorial] = useState(false);
  const [specialMomentTrigger, setSpecialMomentTrigger] = useState<{
    type: 'ace' | 'winner' | 'megaStreak' | 'comeback';
    timestamp: number;
  } | null>(null);
  
  // Contextual comeback detection and analysis
  const contextualAnalysis = useMemo(() => {
    if (!currentScore) {
      console.log('❌ No currentScore for contextual analysis:', currentScore);
      return null;
    }
    console.log('🔍 Analyzing context:', { currentScore, momentum });
    
    const { player1, player2 } = currentScore;
    const scoreDiff = Math.abs(player1 - player2);
    const totalPoints = player1 + player2;
    const leader = player1 > player2 ? 1 : player2 > player1 ? 2 : 0;
    const trailer = leader === 1 ? 2 : leader === 2 ? 1 : 0;
    
    // Detect significant comeback scenarios
    const isLargeDeficit = scoreDiff >= 3;
    const isMidGameComeback = totalPoints >= 8 && scoreDiff >= 2;
    const isCloseGame = scoreDiff <= 1 && totalPoints >= 6;
    
    // Analyze momentum in context of score
    const momentumFavorsTrailer = (trailer === 1 && momentum > 0.4) || (trailer === 2 && momentum < -0.4);
    const momentumFavorsLeader = (leader === 1 && momentum > 0.4) || (leader === 2 && momentum < -0.4);
    
    let contextType = 'normal';
    let contextMessage = '';
    let contextIntensity = Math.abs(momentum);
    
    if (isLargeDeficit && momentumFavorsTrailer) {
      contextType = 'major_comeback';
      contextMessage = `🔥 EPIC COMEBACK! Down ${scoreDiff}, but fighting back with incredible momentum!`;
      contextIntensity = 1.0;
      console.log('🔥 MAJOR COMEBACK DETECTED!', { scoreDiff, momentum, leader, trailer });
      
      // Trigger special moment if not already triggered recently
      if (!specialMomentTrigger || Date.now() - specialMomentTrigger.timestamp > 5000) {
        setTimeout(() => setSpecialMomentTrigger({
          type: 'comeback',
          timestamp: Date.now()
        }), 100);
      }
    } else if (isMidGameComeback && momentumFavorsTrailer) {
      contextType = 'comeback';
      contextMessage = `⚡ Comeback building! Down ${scoreDiff} but momentum is shifting dramatically!`;
      contextIntensity = Math.min(contextIntensity * 1.3, 1.0);
      console.log('⚡ COMEBACK BUILDING!', { scoreDiff, momentum, leader, trailer });
    } else if (isCloseGame && Math.abs(momentum) > 0.6) {
      contextType = 'clutch';
      contextMessage = `🎯 CLUTCH TIME! Tied game with massive momentum swing!`;
      contextIntensity = Math.min(contextIntensity * 1.2, 1.0);
    } else if (momentumFavorsLeader && scoreDiff >= 2) {
      contextType = 'domination';
      contextMessage = `💪 Dominant performance! Leading ${scoreDiff} with sustained momentum!`;
    } else if (Math.abs(momentum) > 0.8) {
      contextType = 'momentum_surge';
      contextMessage = `🌊 Incredible momentum surge! The tide is turning fast!`;
    } else {
      console.log('📊 Context analysis:', { 
        contextType, 
        scoreDiff, 
        isLargeDeficit, 
        isMidGameComeback, 
        momentumFavorsTrailer,
        momentum: momentum.toFixed(3),
        leader,
        trailer
      });
    }
    
    return {
      type: contextType,
      message: contextMessage,
      intensity: contextIntensity,
      scoreDiff,
      isComeback: contextType.includes('comeback'),
      isClutch: contextType === 'clutch'
    };
  }, [currentScore, momentum, specialMomentTrigger]);
  
  // Analyze different types of point dots for enhanced visualization (memoized)
  const analyzePointDots = useMemo(() => {
    const dots: PointDot[] = [];
    if (!wave || wave.length < 1) return dots;
    
    const centerY = height / 2;
    const maxWaveHeight = centerY * 0.8;
    
    for (let i = 0; i < wave.length; i++) {
      const point = wave[i];
      if (!point || typeof point.y !== 'number') continue;
      
      const x = (i / Math.max(wave.length - 1, 1)) * width;
      const y = centerY - (point.y * maxWaveHeight);
      
      // Determine point type based on context
      let type: PointDot['type'] = 'regular';
      let intensity = 0.3;
      let tooltip = 'Point scored';
      
      // Check for momentum shift
      if (i > 0) {
        const prev = wave[i - 1];
        const shift = Math.abs(point.y - prev.y);
        if (shift > 0.3) {
          type = 'momentumShift';
          intensity = Math.min(shift, 0.8);
          tooltip = shift > 0.5 ? 'Major momentum shift!' : 'Momentum shift';
        }
      }
      
      // Check for streaks (3+ consecutive momentum in same direction)
      if (i >= 2) {
        const prev1 = wave[i - 1];
        const prev2 = wave[i - 2];
        if ((point.y > 0 && prev1.y > 0 && prev2.y > 0) || 
            (point.y < 0 && prev1.y < 0 && prev2.y < 0)) {
          if (Math.abs(point.y) > 0.5) {
            type = 'streak';
            intensity = 0.7;
            tooltip = 'Hot streak building!';
          }
        }
      }
      
      // Check for critical moments (high intensity)
      if (Math.abs(point.y) > 0.7) {
        type = 'critical';
        intensity = 0.9;
        tooltip = Math.abs(point.y) > 0.8 ? 'Dominant control!' : 'Critical momentum';
      }
      
      // Check for game phase context
      if (gamePhase === 'critical' && Math.abs(point.y) > 0.4) {
        type = 'gamePoint';
        intensity = 1.0;
        tooltip = 'Game point momentum!';
      }
      
      const team: 'team1' | 'team2' = point.y > 0 ? 'team1' : 'team2';
      const estimatedScore = {
        player1: Math.floor((i + 1) * 0.6 + (point.y > 0 ? 2 : 0)),
        player2: Math.floor((i + 1) * 0.5 + (point.y < 0 ? 2 : 0))
      };
      
      dots.push({
        index: i,
        x,
        y,
        type,
        team,
        intensity,
        tooltip,
        score: currentScore || estimatedScore
      });
    }
    
    return dots;
  }, [wave, height, width, gamePhase, currentScore]);

  // Legacy function for backward compatibility
  const analyzeMomentumShifts = (): TooltipData[] => {
    const shifts: TooltipData[] = [];
    if (!wave || wave.length < 2) return shifts;
    
    for (let i = 1; i < wave.length; i++) {
      const prev = wave[i - 1];
      const curr = wave[i];
      
      if (!prev || !curr || typeof prev.y !== 'number' || typeof curr.y !== 'number') {
        continue;
      }
      
      const shift = Math.abs(curr.y - prev.y);
      
      if (shift > 0.3) {
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
          x: 0,
          y: 0,
          point: i,
          momentum: curr.y,
          reason,
          timestamp: Date.now(),
          score: { player1: 0, player2: 0 }
        });
      }
    }
    return shifts;
  };

  // Generate SVG path for momentum wave (responsive and robust)
  const generateWavePath = () => {
    // Create wave data from momentum history if wave array is empty/insufficient
    const waveData = wave.length > 0 ? wave : [{ y: momentum, timestamp: Date.now() }];
    console.log('🌊 Wave generation:', { waveLength: wave.length, momentum, waveData: waveData.slice(0, 3) });
    
    if (waveData.length < 1) {
      // Fallback: create a simple horizontal line at momentum level
      const centerY = height / 2;
      const y = centerY - (momentum * centerY * 0.9);
      return `M 0 ${y} L ${width} ${y}`;
    }
    
    const centerY = height / 2;
    const maxWaveHeight = centerY * 0.9; // Increased wave height for prominence
    
    let path = `M 0 ${centerY}`;
    
    // If only one point, create a simple line to current momentum
    if (waveData.length === 1) {
      const pointValue = typeof waveData[0] === 'object' && waveData[0].y !== undefined ? waveData[0].y : (typeof waveData[0] === 'number' ? waveData[0] : 0);
      const y = centerY - (Number(pointValue) * maxWaveHeight);
      return `M 0 ${centerY} L ${width} ${y}`;
    }
    
    waveData.forEach((point, index) => {
      const x = (index / Math.max(waveData.length - 1, 1)) * width;
      const pointValue = typeof point === 'object' && point.y !== undefined ? point.y : (typeof point === 'number' ? point : 0); // Handle different data structures
      const y = centerY - (Number(pointValue) * maxWaveHeight);
      
      if (index === 0) {
        path += ` L ${x} ${y}`;
      } else {
        // Smooth curve using quadratic bezier for better visual flow
        const prevPoint = waveData[index - 1];
        const prevPointValue = typeof prevPoint === 'object' && prevPoint.y !== undefined ? prevPoint.y : (typeof prevPoint === 'number' ? prevPoint : 0);
        const prevX = ((index - 1) / Math.max(waveData.length - 1, 1)) * width;
        const prevY = centerY - (Number(prevPointValue) * maxWaveHeight);
        
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        path += ` Q ${cpX} ${cpY} ${x} ${y}`;
      }
    });
    
    console.log('🌊 Generated path:', path.substring(0, 100) + '...');
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

  const wavePath = useMemo(() => generateWavePath(), [wave, width, height]);
  const momentumShifts = analyzeMomentumShifts();
  const pointDots = analyzePointDots;
  const intensity = Math.abs(momentum);
  const contextIntensity = contextualAnalysis?.intensity || intensity;
  const glowIntensity = Math.min(contextIntensity * 2, 1);
  
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

      <div className={`relative ${className}`} style={{ zIndex: 10 }}>
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
          
          {/* Contextual Comeback & Situation Analysis */}
          {contextualAnalysis?.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-center ${
                contextualAnalysis.isComeback 
                  ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-200 border border-orange-500/50' 
                  : contextualAnalysis.isClutch
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/50'
                  : 'bg-gradient-to-r from-blue-500/30 to-green-500/30 text-blue-200 border border-blue-500/50'
              }`}
              style={{
                animation: contextualAnalysis.isComeback || contextualAnalysis.isClutch 
                  ? 'pulse 2s infinite' 
                  : 'none'
              }}
            >
              {contextualAnalysis.message}
            </motion.div>
          )}
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
              height={`${height}px`}
              viewBox={`0 0 ${width} ${height}`} 
              className={`overflow-visible ${isInteractive ? 'cursor-crosshair' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ pointerEvents: 'all', position: 'relative', zIndex: 20 }}
            >
              {/* Transparent hit area for reliable hover detection */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="transparent"
                style={{ pointerEvents: 'all' }}
                onMouseMove={handleMouseMove}
              />
              
              {/* Center baseline */}
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />
            
              {/* Team 1 area (top half) with enhanced animations */}
              {momentum > 0 && (
                <motion.path
                  d={`${wavePath} L ${width} ${height / 2} L 0 ${height / 2} Z`}
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
                  d={`${wavePath} L ${width} ${height / 2} L 0 ${height / 2} Z`}
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
              
              {/* Enhanced Wave Line with 3D Effects during Special Moments */}
              <motion.g>
                {/* Main wave line with enhanced animations */}
                <motion.path
                  d={wavePath}
                  stroke={dominantColor}
                  strokeWidth="8"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    strokeWidth: gamePhase === 'critical' ? [3, 5, 3] : 3
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    strokeWidth: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{
                    filter: `drop-shadow(0 0 ${6 + glowIntensity * 12}px ${dominantColor})`
                  }}
                />
                
                {/* 3D Effect Layer - Animated during special moments */}
                {(gamePhase === 'critical' || Math.abs(momentum) > 0.6) && (
                  <>
                    {/* Shadow/depth layer */}
                    <motion.path
                      d={wavePath}
                      stroke={dominantColor}
                      strokeWidth="8"
                      fill="none"
                      opacity="0.3"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.02, 1],
                        y: [0, 2, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{
                        filter: `blur(2px) drop-shadow(0 4px ${8 + glowIntensity * 8}px ${dominantColor}40)`
                      }}
                    />
                    
                    {/* Highlight layer for 3D effect */}
                    <motion.path
                      d={wavePath}
                      stroke="white"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.8"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0.8, 1, 0.8],
                        y: [-1, -2, -1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{
                        filter: `drop-shadow(0 0 4px white)`
                      }}
                    />
                  </>
                )}
                
                {/* Particle effects during mega streaks */}
                {streak && streak.length >= 3 && (
                  <motion.g>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.circle
                        key={`particle-${i}`}
                        cx={150 + i * 40}
                        cy={height / 2}
                        r="2"
                        fill={dominantColor}
                        initial={{ opacity: 0, scale: 0, y: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          y: [0, -20, -40],
                          x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.g>
                )}
              </motion.g>
              
              {/* Special Moment 3D Explosion Animation */}
              {specialMomentTrigger && Date.now() - specialMomentTrigger.timestamp < 3000 && (
                <motion.g>
                  {/* Central explosion burst */}
                  <motion.circle
                    cx={width / 2}
                    cy={height / 2}
                    r="5"
                    fill={dominantColor}
                    initial={{ r: 5, opacity: 1, scale: 1 }}
                    animate={{ 
                      r: [5, 50, 80],
                      opacity: [1, 0.8, 0],
                      scale: [1, 2, 3]
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  
                  {/* Radiating energy waves */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.line
                      key={`energy-${i}`}
                      x1={width / 2}
                      y1={height / 2}
                      x2={width / 2 + Math.cos(i * Math.PI / 4) * 30}
                      y2={height / 2 + Math.sin(i * Math.PI / 4) * 30}
                      stroke={dominantColor}
                      strokeWidth="3"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 1.5],
                        x2: width / 2 + Math.cos(i * Math.PI / 4) * 80,
                        y2: height / 2 + Math.sin(i * Math.PI / 4) * 80
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      style={{
                        filter: `drop-shadow(0 0 4px ${dominantColor})`
                      }}
                    />
                  ))}
                  
                  {/* Spiral particle effect */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    return (
                      <motion.circle
                        key={`spiral-${i}`}
                        cx={width / 2}
                        cy={height / 2}
                        r="2"
                        fill="white"
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{
                          opacity: [1, 0.8, 0],
                          scale: [0.5, 1, 0],
                          x: Math.cos(angle + Date.now() * 0.01) * (40 + i * 5),
                          y: Math.sin(angle + Date.now() * 0.01) * (20 + i * 3)
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.05,
                          ease: "easeOut"
                        }}
                      />
                    );
                  })}
                  
                  {/* Text overlay for special moment */}
                  <motion.text
                    x={width / 2}
                    y={height / 2 - 20}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill="white"
                    initial={{ opacity: 0, y: height / 2 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      y: [height / 2, height / 2 - 20, height / 2 - 25, height / 2 - 30],
                      scale: [0.5, 1.2, 1, 0.8]
                    }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    style={{
                      filter: `drop-shadow(0 0 4px black)`,
                      textShadow: '0 0 8px rgba(255,255,255,0.8)'
                    }}
                  >
                    {specialMomentTrigger.type === 'megaStreak' ? '🔥 MEGA STREAK!' :
                     specialMomentTrigger.type === 'comeback' ? '⚡ COMEBACK!' :
                     specialMomentTrigger.type === 'ace' ? '🎯 ACE!' :
                     '🏆 WINNER!'}
                  </motion.text>
                </motion.g>
              )}

              {/* Enhanced Point Dots - Different representations for different moment types */}
              {pointDots.map((dot: PointDot) => {
                const dotColor = dot.team === 'team1' ? team1Color : team2Color;
                const isHovered = hoveredPoint?.point === dot.index;
                
                // Determine dot size and style based on type
                const getDotProps = (type: PointDot['type'], intensity: number) => {
                  switch (type) {
                    case 'critical':
                      return {
                        r: 8 + intensity * 3,
                        strokeWidth: 3,
                        className: 'animate-pulse',
                        filter: `drop-shadow(0 0 ${12 + intensity * 6}px ${dotColor})`
                      };
                    case 'gamePoint':
                      return {
                        r: 10,
                        strokeWidth: 3,
                        className: 'animate-ping',
                        filter: `drop-shadow(0 0 16px ${dotColor})`
                      };
                    case 'streak':
                      return {
                        r: 6,
                        strokeWidth: 2,
                        className: '',
                        filter: `drop-shadow(0 0 10px ${dotColor})`
                      };
                    case 'momentumShift':
                      return {
                        r: 4,
                        strokeWidth: 2,
                        className: '',
                        filter: `drop-shadow(0 0 4px ${dotColor})`
                      };
                    case 'ace':
                      return {
                        r: 4,
                        strokeWidth: 2,
                        className: 'animate-pulse',
                        filter: `drop-shadow(0 0 8px ${dotColor})`
                      };
                    default: // regular
                      return {
                        r: 5,
                        strokeWidth: 2,
                        className: '',
                        filter: `drop-shadow(0 0 8px ${dotColor}80)`
                      };
                  }
                };
                
                const props = getDotProps(dot.type, dot.intensity);
                
                // Special rendering for different dot types
                if (dot.type === 'ace' || dot.type === 'gamePoint') {
                  // Star shape for ace/special moments
                  const starSize = 3;
                  const starPath = `M${dot.x},${dot.y - starSize} L${dot.x + starSize * 0.3},${dot.y - starSize * 0.3} L${dot.x + starSize},${dot.y - starSize * 0.3} L${dot.x + starSize * 0.4},${dot.y + starSize * 0.2} L${dot.x + starSize * 0.6},${dot.y + starSize} L${dot.x},${dot.y + starSize * 0.5} L${dot.x - starSize * 0.6},${dot.y + starSize} L${dot.x - starSize * 0.4},${dot.y + starSize * 0.2} L${dot.x - starSize},${dot.y - starSize * 0.3} L${dot.x - starSize * 0.3},${dot.y - starSize * 0.3} Z`;
                  
                  return (
                    <motion.path
                      key={`star-${dot.index}`}
                      d={starPath}
                      fill={dotColor}
                      stroke="white"
                      strokeWidth={props.strokeWidth}
                      opacity={isHovered ? 1 : 0.9}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: isHovered ? 1.3 : 1, 
                        opacity: isHovered ? 1 : 0.9,
                        rotate: dot.type === 'ace' ? [0, 360] : 0
                      }}
                      whileHover={{ scale: 1.4, opacity: 1 }}
                      transition={{ 
                        delay: dot.index * 0.02,
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                      }}
                      className={props.className}
                      style={{
                        cursor: 'pointer',
                        filter: props.filter
                      }}
                    />
                  );
                }
                
                // Regular circular dots with enhanced styling
                return (
                  <motion.circle
                    key={`dot-${dot.index}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={props.r}
                    fill={dotColor}
                    stroke="white"
                    strokeWidth={props.strokeWidth}
                    opacity={isHovered ? 1 : 0.8 + dot.intensity * 0.2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isHovered ? 1.4 : 1, 
                      opacity: isHovered ? 1 : 0.8 + dot.intensity * 0.2
                    }}
                    whileHover={{ scale: 1.5, opacity: 1 }}
                    transition={{ delay: dot.index * 0.02 }}
                    className={props.className}
                    style={{
                      cursor: 'pointer',
                      filter: props.filter
                    }}
                  />
                );
              })}

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