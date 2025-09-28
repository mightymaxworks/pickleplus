import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Train, 
  Star,
  Sparkles,
  Crown,
  Volume2,
  TrendingUp,
  Users,
  Trophy,
  Target
} from 'lucide-react';
import { MomentumState } from './MomentumEngine';

interface HypeTrainEffectsProps {
  isEnabled: boolean;
  aestheticMode: 'subtle' | 'esports';
  crowdEnergy: number;
  momentumState?: MomentumState;
  onHypeTrainStart?: (level: number) => void;
  onHypeTrainEnd?: () => void;
}

interface HypeTrainState {
  isActive: boolean;
  level: number; // 1-5
  progress: number; // 0-100
  startTime: number;
  duration: number;
  triggers: HypeTrainTrigger[];
  multiplier: number;
}

interface HypeTrainTrigger {
  type: 'energy_spike' | 'momentum_shift' | 'streak' | 'manual' | 'key_moment';
  intensity: number;
  timestamp: number;
  description: string;
}

interface HypeLevel {
  level: number;
  name: string;
  threshold: number;
  color: string;
  gradient: string;
  emoji: string;
  multiplier: number;
  duration: number;
  effects: string[];
}

const HYPE_LEVELS: HypeLevel[] = [
  { 
    level: 1, 
    name: 'Getting Warmed Up', 
    threshold: 70, 
    color: '#3b82f6', 
    gradient: 'from-blue-500 to-cyan-500',
    emoji: '🔥', 
    multiplier: 1.2, 
    duration: 8000,
    effects: ['Gentle glow', 'Subtle pulse']
  },
  { 
    level: 2, 
    name: 'Crowd is Buzzing', 
    threshold: 80, 
    color: '#10b981', 
    gradient: 'from-green-500 to-emerald-500',
    emoji: '⚡', 
    multiplier: 1.5, 
    duration: 10000,
    effects: ['Energy sparks', 'Screen pulse']
  },
  { 
    level: 3, 
    name: 'HYPE TRAIN INCOMING!', 
    threshold: 90, 
    color: '#f59e0b', 
    gradient: 'from-amber-500 to-orange-500',
    emoji: '🚂', 
    multiplier: 2.0, 
    duration: 12000,
    effects: ['Train animation', 'Screen shake', 'Particle burst']
  },
  { 
    level: 4, 
    name: 'ALL ABOARD THE HYPE TRAIN!', 
    threshold: 95, 
    color: '#ef4444', 
    gradient: 'from-red-500 to-pink-500',
    emoji: '🔥', 
    multiplier: 3.0, 
    duration: 15000,
    effects: ['Full screen effects', 'Intense shake', 'Confetti explosion']
  },
  { 
    level: 5, 
    name: 'MAXIMUM OVERDRIVE!!!', 
    threshold: 98, 
    color: '#8b5cf6', 
    gradient: 'from-purple-500 to-pink-500',
    emoji: '👑', 
    multiplier: 5.0, 
    duration: 20000,
    effects: ['Rainbow effects', 'Extreme animations', 'Screen-wide celebration']
  }
];

export function HypeTrainEffects({ 
  isEnabled, 
  aestheticMode, 
  crowdEnergy, 
  momentumState,
  onHypeTrainStart,
  onHypeTrainEnd 
}: HypeTrainEffectsProps) {
  const [hypeState, setHypeState] = useState<HypeTrainState>({
    isActive: false,
    level: 0,
    progress: 0,
    startTime: 0,
    duration: 0,
    triggers: [],
    multiplier: 1.0
  });

  const [lastEnergy, setLastEnergy] = useState(crowdEnergy);
  const [showManualControls, setShowManualControls] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  // Get current hype level based on energy
  const getCurrentHypeLevel = (energy: number): HypeLevel | null => {
    return [...HYPE_LEVELS].reverse().find(level => energy >= level.threshold) || null;
  };

  const currentLevel = getCurrentHypeLevel(crowdEnergy);

  // Detect energy spikes and momentum shifts
  useEffect(() => {
    if (!isEnabled) return;

    const energyDelta = crowdEnergy - lastEnergy;
    const triggers: HypeTrainTrigger[] = [];

    // Energy spike detection
    if (energyDelta > 15) {
      triggers.push({
        type: 'energy_spike',
        intensity: energyDelta,
        timestamp: Date.now(),
        description: `Energy spiked by ${energyDelta.toFixed(1)}%!`
      });
    }

    // Momentum shift detection
    if (momentumState?.lastShiftAt && Date.now() - momentumState.lastShiftAt < 3000) {
      triggers.push({
        type: 'momentum_shift',
        intensity: Math.abs(momentumState.momentum) * 100,
        timestamp: Date.now(),
        description: 'Major momentum shift detected!'
      });
    }

    // Streak detection
    if (momentumState?.streak && momentumState.streak.length >= 3) {
      triggers.push({
        type: 'streak',
        intensity: momentumState.streak.length * 10,
        timestamp: Date.now(),
        description: `${momentumState.streak.length}-point streak!`
      });
    }

    // Start hype train if conditions met
    if (triggers.length > 0 && currentLevel && crowdEnergy >= 70) {
      startHypeTrain(currentLevel, triggers);
    }

    setLastEnergy(crowdEnergy);
  }, [crowdEnergy, momentumState, isEnabled, currentLevel]);

  // Hype train lifecycle management
  useEffect(() => {
    if (!hypeState.isActive) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - hypeState.startTime;
      const progress = Math.min(100, (elapsed / hypeState.duration) * 100);

      if (progress >= 100) {
        endHypeTrain();
      } else {
        setHypeState(prev => ({ ...prev, progress }));
        
        // Check for milestone crossing
        const currentMilestone = Math.floor(progress / 25) * 25;
        if (currentMilestone > lastMilestone && currentMilestone > 0 && currentMilestone < 100) {
          setLastMilestone(currentMilestone);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hypeState.isActive, hypeState.startTime, hypeState.duration, lastMilestone]);

  const startHypeTrain = (level: HypeLevel, triggers: HypeTrainTrigger[]) => {
    if (hypeState.isActive && hypeState.level >= level.level) return; // Don't downgrade active train

    // Reset milestone tracking
    setLastMilestone(0);

    setHypeState({
      isActive: true,
      level: level.level,
      progress: 0,
      startTime: Date.now(),
      duration: level.duration,
      triggers: [...hypeState.triggers, ...triggers].slice(-5), // Keep last 5 triggers
      multiplier: level.multiplier
    });

    onHypeTrainStart?.(level.level);
    
    // Add screen shake for higher levels
    if (level.level >= 3) {
      document.body.style.animation = `hype-shake 0.5s ease-in-out`;
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }
  };

  const endHypeTrain = () => {
    setHypeState(prev => ({ ...prev, isActive: false, progress: 100 }));
    setLastMilestone(0); // Reset milestone tracking
    
    // Clear any lingering body animations
    if (document.body.style.animation) {
      document.body.style.animation = '';
    }
    
    onHypeTrainEnd?.();
  };

  // Manual test triggers
  const triggerManualHype = (level: number) => {
    const hypeLevel = HYPE_LEVELS.find(l => l.level === level);
    if (!hypeLevel) return;

    const manualTrigger: HypeTrainTrigger = {
      type: 'manual',
      intensity: 100,
      timestamp: Date.now(),
      description: `Manual Level ${level} Hype Train activated!`
    };

    startHypeTrain(hypeLevel, [manualTrigger]);
  };

  if (!isEnabled) return null;

  const activeLevel = HYPE_LEVELS.find(l => l.level === hypeState.level);

  return (
    <>
      {/* CSS for shake animation */}
      <style>{`
        @keyframes hype-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>

      {/* Hype Train Display */}
      <AnimatePresence>
        {hypeState.isActive && activeLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
          >
            <Card className={`p-6 border-2 ${aestheticMode === 'esports' 
              ? 'bg-slate-900/95 border-purple-500/50' 
              : 'bg-slate-800/90 border-blue-500/50'
            } backdrop-blur-md`}>
              
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${activeLevel.gradient} opacity-20 rounded-lg`}>
                <motion.div
                  animate={{ 
                    background: [
                      `linear-gradient(45deg, transparent, ${activeLevel.color}33, transparent)`,
                      `linear-gradient(45deg, transparent, transparent, ${activeLevel.color}33)`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg"
                />
              </div>

              {/* Header */}
              <div className="relative z-10 text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Train className={`h-6 w-6 ${aestheticMode === 'esports' ? 'text-purple-400' : 'text-blue-400'}`} />
                  <span className="text-2xl">{activeLevel.emoji}</span>
                  <Train className={`h-6 w-6 ${aestheticMode === 'esports' ? 'text-purple-400' : 'text-blue-400'}`} />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1">
                  {activeLevel.name}
                </h2>
                
                <Badge className={`bg-gradient-to-r ${activeLevel.gradient} text-white font-bold`}>
                  Level {activeLevel.level} • {activeLevel.multiplier}x Multiplier
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hypeState.progress}%` }}
                    className={`h-full bg-gradient-to-r ${activeLevel.gradient} relative`}
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute inset-0 bg-white/30"
                    />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>🚂 Hype Train Progress</span>
                  <span>{Math.round(hypeState.progress)}%</span>
                </div>
              </div>

              {/* Recent Triggers */}
              <div className="space-y-1">
                {hypeState.triggers.slice(-3).map((trigger, index) => (
                  <motion.div
                    key={`${trigger.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-white/80 flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                    {trigger.description}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Controls */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowManualControls(!showManualControls)}
          className={`${aestheticMode === 'esports' 
            ? 'text-purple-400 hover:text-purple-300' 
            : 'text-blue-400 hover:text-blue-300'
          } text-xs`}
        >
          🚂 Hype Controls
        </Button>

        <AnimatePresence>
          {showManualControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-2"
            >
              <Card className={`p-3 ${aestheticMode === 'esports' 
                ? 'bg-slate-900/80 border-purple-500/30' 
                : 'bg-slate-800/70 border-blue-500/30'
              }`}>
                <div className="text-xs text-slate-400 mb-2">Test Hype Trains:</div>
                <div className="grid grid-cols-3 gap-1">
                  {HYPE_LEVELS.slice(0, 3).map((level) => (
                    <Button
                      key={level.level}
                      size="sm"
                      onClick={() => triggerManualHype(level.level)}
                      className={`text-xs bg-gradient-to-r ${level.gradient} hover:opacity-80 text-white`}
                    >
                      L{level.level} {level.emoji}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {HYPE_LEVELS.slice(3, 5).map((level) => (
                    <Button
                      key={level.level}
                      size="sm"
                      onClick={() => triggerManualHype(level.level)}
                      className={`text-xs bg-gradient-to-r ${level.gradient} hover:opacity-80 text-white`}
                    >
                      L{level.level} {level.emoji}
                    </Button>
                  ))}
                </div>
                {hypeState.isActive && (
                  <Button
                    size="sm"
                    onClick={endHypeTrain}
                    className="w-full mt-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                  >
                    End Hype Train
                  </Button>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Screen Effects for High Levels */}
      <AnimatePresence>
        {hypeState.isActive && hypeState.level >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-20"
          >
            {/* Level 3: Train Animation Background */}
            {hypeState.level === 3 && (
              <>
                {/* Moving train track effect */}
                <motion.div
                  animate={{ 
                    backgroundPosition: ['0px 0px', '100px 0px'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 45px, rgba(251, 191, 36, 0.5) 45px, rgba(251, 191, 36, 0.5) 50px)',
                  }}
                />
                {/* Screen pulse */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500/10"
                />
              </>
            )}

            {/* Level 4: Intense Screen-Wide Effects */}
            {hypeState.level === 4 && (
              <>
                {/* Pulsing rainbow border */}
                <motion.div
                  animate={{ 
                    background: [
                      'linear-gradient(0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
                      'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
                      'linear-gradient(180deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
                      'linear-gradient(270deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 p-2"
                >
                  <div className="w-full h-full bg-transparent border-8 border-transparent bg-clip-border" />
                </motion.div>
                
                {/* Screen glow vignette */}
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(239,68,68,0.2)_70%)]"
                />
                
                {/* Confetti burst */}
                <div className="absolute inset-0">
                  {Array.from({ length: aestheticMode === 'subtle' ? 15 : 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
                        y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        y: -100, 
                        scale: [0, 1, 0.5, 0],
                        rotate: Math.random() * 720,
                        x: `+=${(Math.random() - 0.5) * 200}`
                      }}
                      transition={{ 
                        duration: 4 + Math.random() * 2, 
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: "easeOut"
                      }}
                      className="absolute text-2xl"
                    >
                      {['🎉', '🎊', '⚡', '🔥', '✨', '🚂', '💥', '🌟'][Math.floor(Math.random() * 8)]}
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Level 5: MAXIMUM OVERDRIVE INSANITY */}
            {hypeState.level === 5 && (
              <>
                {/* Extreme rainbow border with rotation */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    background: [
                      'conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #88ff00, #00ff00, #00ff88, #00ffff, #0088ff, #0000ff, #8800ff, #ff00ff, #ff0088, #ff0000)',
                      'conic-gradient(from 180deg, #ff0000, #ff8800, #ffff00, #88ff00, #00ff00, #00ff88, #00ffff, #0088ff, #0000ff, #8800ff, #ff00ff, #ff0088, #ff0000)',
                    ]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    background: { duration: 2, repeat: Infinity }
                  }}
                  className="absolute inset-0 p-1"
                >
                  <div className="w-full h-full bg-black border-8 border-transparent bg-clip-border" />
                </motion.div>

                {/* Extreme vignette pulse */}
                <motion.div
                  animate={{ 
                    opacity: [0.1, 0.8, 0.1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(139,92,246,0.4)_70%)]"
                />

                {/* Maximum confetti explosion */}
                <div className="absolute inset-0">
                  {Array.from({ length: aestheticMode === 'subtle' ? 25 : 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), 
                        y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 150,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        y: -150, 
                        scale: [0, 1.5, 1, 0],
                        rotate: Math.random() * 1080,
                        x: `+=${(Math.random() - 0.5) * 400}`,
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 3, 
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                      }}
                      className="absolute text-3xl"
                    >
                      {['🎉', '🎊', '⚡', '🔥', '✨', '🚂', '💥', '🌟', '👑', '🏆', '💎', '🎆', '🎇'][Math.floor(Math.random() * 13)]}
                    </motion.div>
                  ))}
                </div>

                {/* Screen-wide energy bursts */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30"
                />
              </>
            )}

            {/* Universal screen shake intensifier for all high levels */}
            <motion.div
              animate={{ 
                x: hypeState.level >= 4 ? [-1, 1, -1, 1, 0] : [0],
                y: hypeState.level >= 4 ? [0, -1, 1, -1, 0] : [0]
              }}
              transition={{ 
                duration: 0.1, 
                repeat: hypeState.level >= 4 ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Particle Bursts for Milestones */}
      <AnimatePresence>
        {hypeState.isActive && lastMilestone > 0 && (
          <motion.div
            key={`milestone-burst-${lastMilestone}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-25"
          >
            {Array.from({ length: aestheticMode === 'subtle' ? 8 : 15 }).map((_, i) => (
              <motion.div
                key={`milestone-${lastMilestone}-${i}`}
                initial={{ 
                  x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2, 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2,
                  scale: 0
                }}
                animate={{ 
                  x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 + (Math.random() - 0.5) * 800,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 + (Math.random() - 0.5) * 600,
                  scale: [0, 2, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute text-4xl"
              >
                ⚡
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}