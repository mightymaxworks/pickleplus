import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MomentumState } from './MomentumEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Zap, HelpCircle, X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

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

interface HeroTooltipData {
  x: number;
  y: number;
  pointNo: number;
  momentum: number;
  hype: number;
  reason: string;
  timestamp: number;
  score: { player1: number; player2: number };
  team: 'team1' | 'team2';
}

interface InterpolatedPoint {
  x: number;
  y: number;
  hype: number;
  team: 'team1' | 'team2';
  pointNo: number;
  isKeyMoment: boolean;
}

// Revolutionary "Twitch for Pickleball" Momentum Wave Component
export const MomentumWave = memo(({ 
  momentumState, 
  team1Color, 
  team2Color, 
  team1Name = "Team 1",
  team2Name = "Team 2",
  className = '', 
  isInteractive = true,
  isMatchComplete = false,
  width,
  height,
  heroMode = true,
  onSpecialMoment
}: MomentumWaveProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 200 });
  const [timelinePosition, setTimelinePosition] = useState(1); // 0-1, current viewing position
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<HeroTooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCombatView, setShowCombatView] = useState(false);

  // Extract state with new hype system
  const { 
    wave, 
    history, 
    momentum, 
    hypeIndex, 
    streak, 
    gamePhase, 
    currentScore, 
    turningPoints,
    combos,
    maxDeficitPerTeam
  } = momentumState;

  // Hero Mode: Use full viewport width and 25% height for epic presentation
  const heroHeight = typeof window !== 'undefined' ? window.innerHeight * 0.25 : 300;
  const effectiveWidth = containerDimensions.width;
  const effectiveHeight = heroMode ? heroHeight : height || 200;

  // Measure container dimensions for responsive design
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ 
          width: rect.width || 800, 
          height: rect.height || (heroMode ? heroHeight : 200) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [heroMode, heroHeight]);

  // Generate smooth interpolated wave path using monotone cubic interpolation
  const interpolatedWave = useMemo(() => {
    if (!history || history.length < 2) {
      const centerY = effectiveHeight / 2;
      return [{
        x: 0,
        y: centerY,
        hype: hypeIndex,
        team: momentum > 0 ? 'team1' : 'team2',
        pointNo: 0,
        isKeyMoment: false
      }];
    }

    const points: InterpolatedPoint[] = [];
    const centerY = effectiveHeight / 2;
    const maxAmplitude = centerY * 0.85; // Slightly larger amplitude for hero mode

    history.forEach((point, index) => {
      const x = (index / Math.max(history.length - 1, 1)) * effectiveWidth;
      const y = centerY - (point.ewma * maxAmplitude);
      const isKeyMoment = turningPoints.includes(point.pointNo) || point.hypeIndex > 0.7;
      
      points.push({
        x,
        y,
        hype: point.hypeIndex,
        team: point.ewma > 0 ? 'team1' : 'team2',
        pointNo: point.pointNo,
        isKeyMoment
      });
    });

    return points;
  }, [history, effectiveWidth, effectiveHeight, turningPoints, hypeIndex, momentum]);

  // Generate SVG path using smooth curves for cinematic effect
  const wavePath = useMemo(() => {
    if (interpolatedWave.length < 2) {
      const centerY = effectiveHeight / 2;
      return `M 0 ${centerY} L ${effectiveWidth} ${centerY}`;
    }

    let path = '';
    interpolatedWave.forEach((point, index) => {
      if (index === 0) {
        path = `M ${point.x} ${point.y}`;
      } else {
        // Create smooth curves for professional broadcast look
        const prev = interpolatedWave[index - 1];
        const controlPointX = (prev.x + point.x) / 2;
        const controlPointY1 = prev.y;
        const controlPointY2 = point.y;
        
        // Use cubic Bézier curves for ultimate smoothness
        path += ` C ${controlPointX} ${controlPointY1}, ${controlPointX} ${controlPointY2}, ${point.x} ${point.y}`;
      }
    });

    return path;
  }, [interpolatedWave, effectiveWidth, effectiveHeight]);

  // Generate team gradient areas for visual dominance indication
  const teamAreas = useMemo(() => {
    if (interpolatedWave.length < 2) return { team1Path: '', team2Path: '' };

    const centerY = effectiveHeight / 2;
    
    // Create filled areas above/below center line for team dominance
    let team1Path = `M 0 ${centerY}`;
    let team2Path = `M 0 ${centerY}`;
    
    interpolatedWave.forEach((point, index) => {
      if (index === 0) {
        team1Path += ` L ${point.x} ${Math.min(point.y, centerY)}`;
        team2Path += ` L ${point.x} ${Math.max(point.y, centerY)}`;
      } else {
        const prev = interpolatedWave[index - 1];
        const controlPointX = (prev.x + point.x) / 2;
        
        team1Path += ` C ${controlPointX} ${Math.min(prev.y, centerY)}, ${controlPointX} ${Math.min(point.y, centerY)}, ${point.x} ${Math.min(point.y, centerY)}`;
        team2Path += ` C ${controlPointX} ${Math.max(prev.y, centerY)}, ${controlPointX} ${Math.max(point.y, centerY)}, ${point.x} ${Math.max(point.y, centerY)}`;
      }
    });

    team1Path += ` L ${effectiveWidth} ${centerY} Z`;
    team2Path += ` L ${effectiveWidth} ${centerY} Z`;

    return { team1Path, team2Path };
  }, [interpolatedWave, effectiveWidth, effectiveHeight]);

  // Enhanced comeback detection with new deficit tracking
  const comebackAnalysis = useMemo(() => {
    if (!currentScore || !history.length) return null;

    const { player1, player2 } = currentScore;
    const scoreDiff = Math.abs(player1 - player2);
    const leader = player1 > player2 ? 1 : player2 > player1 ? 2 : 0;
    const trailer = leader === 1 ? 2 : leader === 2 ? 1 : 0;

    // Use new deficit tracking from engine
    const maxDeficit1 = maxDeficitPerTeam.team1;
    const maxDeficit2 = maxDeficitPerTeam.team2;
    
    const isActiveComebackTeam1 = maxDeficit1 >= 3 && (player2 - player1) <= 1;
    const isActiveComebackTeam2 = maxDeficit2 >= 3 && (player1 - player2) <= 1;

    let status = 'normal';
    let message = '';
    let intensity = Math.abs(momentum);

    if (isActiveComebackTeam1 || isActiveComebackTeam2) {
      status = 'active_comeback';
      message = `🔥 EPIC COMEBACK! Down ${isActiveComebackTeam1 ? maxDeficit1 : maxDeficit2} → ${scoreDiff}`;
      intensity = 1.0;
    } else if (hypeIndex > 0.8) {
      status = 'hype_surge';
      message = `⚡ MOMENTUM EXPLOSION! Hype index: ${Math.round(hypeIndex * 100)}%`;
      intensity = hypeIndex;
    } else if (combos.consecutiveHype >= 3) {
      status = 'combo_active';
      message = `🔥 ${combos.consecutiveHype}x HYPE COMBO!`;
      intensity = Math.min(1, combos.consecutiveHype / 5);
    }

    return { status, message, intensity, isComeback: status === 'active_comeback' };
  }, [currentScore, history, momentum, hypeIndex, combos, maxDeficitPerTeam]);

  // Handle timeline scrubbing
  const handleTimelineScrub = useCallback((position: number) => {
    setTimelinePosition(Math.max(0, Math.min(1, position)));
  }, []);

  // Handle point hover for detailed tooltips
  const handlePointHover = useCallback((event: React.MouseEvent<SVGElement>) => {
    if (!isInteractive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePosition({ x: event.clientX, y: event.clientY });

    // Find closest point for tooltip
    const pointIndex = Math.round((x / effectiveWidth) * Math.max(interpolatedWave.length - 1, 0));
    const point = interpolatedWave[pointIndex];
    const historyPoint = history[pointIndex];

    if (point && historyPoint) {
      setHoveredPoint({
        x,
        y,
        pointNo: historyPoint.pointNo,
        momentum: historyPoint.ewma,
        hype: historyPoint.hypeIndex,
        reason: generatePointReason(historyPoint),
        timestamp: historyPoint.timestamp,
        score: { 
          player1: historyPoint.score[0], 
          player2: historyPoint.score[1] 
        },
        team: historyPoint.team
      });
    }
  }, [isInteractive, effectiveWidth, interpolatedWave, history]);

  // Generate contextual reason for each point
  const generatePointReason = (point: any) => {
    if (point.hypeIndex > 0.8) return "🔥 Explosive momentum shift!";
    if (point.hypeIndex > 0.6) return "⚡ High-intensity moment";
    if (Math.abs(point.ewma) > 0.7) return point.ewma > 0 ? "💪 Dominant control" : "🛡️ Defensive pressure";
    if (Math.abs(point.ewma) > 0.4) return point.ewma > 0 ? "📈 Building momentum" : "📉 Losing ground";
    return "🎯 Strategic positioning";
  };

  // Hero mode layout with full-width, cinematic presentation
  if (heroMode) {
    return (
      <div 
        ref={containerRef}
        className={`relative w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden ${className}`}
        style={{ height: heroHeight }}
      >
        {/* Background particle effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse" />
        </div>

        {/* Team gradient backgrounds */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="team1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={team1Color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={team1Color} stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="team2Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={team2Color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={team2Color} stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Team dominance areas */}
          <path 
            d={teamAreas.team1Path} 
            fill="url(#team1Gradient)" 
            className="transition-all duration-300"
          />
          <path 
            d={teamAreas.team2Path} 
            fill="url(#team2Gradient)" 
            className="transition-all duration-300"
          />

          {/* Center line */}
          <line 
            x1="0" 
            y1={effectiveHeight / 2} 
            x2={effectiveWidth} 
            y2={effectiveHeight / 2}
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Main momentum wave */}
          <motion.path
            d={wavePath}
            stroke="white"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
            className="drop-shadow-lg"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Hype overlay wave */}
          <motion.path
            d={wavePath}
            stroke={`rgba(${hypeIndex > 0.5 ? '255,69,0' : '0,191,255'}, ${hypeIndex})`}
            strokeWidth={2 + hypeIndex * 4}
            fill="none"
            className="animate-pulse"
            style={{ 
              filter: `drop-shadow(0 0 ${5 + hypeIndex * 10}px rgba(255,69,0,${hypeIndex}))` 
            }}
          />

          {/* Key moment markers */}
          {interpolatedWave.map((point, index) => (
            point.isKeyMoment && (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={4 + point.hype * 6}
                fill={point.team === 'team1' ? team1Color : team2Color}
                className="cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                whileHover={{ scale: 1.5, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={(e) => handlePointHover(e as any)}
              />
            )
          ))}
        </svg>

        {/* Team labels and stats */}
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: team1Color }}
            />
            <span className="text-white font-bold">{team1Name}</span>
            <Badge variant="secondary">
              {currentScore?.player1 || 0}
            </Badge>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {currentScore?.player2 || 0}
            </Badge>
            <span className="text-white font-bold">{team2Name}</span>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: team2Color }}
            />
          </div>
        </div>

        {/* Hype meter */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm mb-2">HYPE METER</div>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-red-500"
                style={{ width: `${hypeIndex * 100}%` }}
                animate={{ width: `${hypeIndex * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {Math.round(hypeIndex * 100)}% intensity
            </div>
          </div>
        </div>

        {/* Comeback status */}
        <AnimatePresence>
          {comebackAnalysis?.isComeback && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="bg-red-600/90 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <div className="text-2xl font-bold">{comebackAnalysis.message}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              className="fixed bg-black/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg z-50 pointer-events-none"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y - 10,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-sm">
                <div className="font-bold">Point #{hoveredPoint.pointNo}</div>
                <div>Score: {hoveredPoint.score.player1} - {hoveredPoint.score.player2}</div>
                <div>Momentum: {(hoveredPoint.momentum * 100).toFixed(0)}%</div>
                <div>Hype: {(hoveredPoint.hype * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-300 mt-1">{hoveredPoint.reason}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event overlay for special moments */}
        <div 
          className="absolute inset-0 pointer-events-none"
          onMouseMove={handlePointHover}
          onMouseLeave={() => setHoveredPoint(null)}
        />
      </div>
    );
  }

  // Fallback to compact mode (not used in revolutionary design)
  return (
    <Card className={`p-4 ${className}`}>
      <div className="text-center text-gray-500">
        Hero mode disabled - enable for revolutionary experience
      </div>
    </Card>
  );
});

MomentumWave.displayName = 'MomentumWave';