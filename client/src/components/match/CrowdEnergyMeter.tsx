import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Flame, 
  Volume2, 
  Zap, 
  TrendingUp,
  Activity,
  Radio,
  Sparkles,
  Heart,
  Star
} from 'lucide-react';
import { MomentumState } from './MomentumEngine';

interface CrowdEnergyProps {
  momentumState?: MomentumState;
  isLive: boolean;
  aestheticMode: 'subtle' | 'esports';
  onEnergyChange?: (energy: number) => void;
  onReactionTrigger?: (reaction: CrowdReaction) => void;
  enableDecay?: boolean; // Optional energy decay system
  decayRate?: number; // Energy decay per second (default: 2)
}

interface CrowdReaction {
  type: 'cheer' | 'boo' | 'gasp' | 'applause' | 'excitement';
  intensity: number;
  timestamp: number;
  duration: number;
}

interface EnergyLevel {
  value: number;
  label: string;
  color: string;
  gradient: string;
  emoji: string;
  threshold: number;
}

interface SimulatedAudience {
  baseEnergy: number;
  volatility: number;
  momentum: number;
  recentReactions: CrowdReaction[];
}

const ENERGY_LEVELS: EnergyLevel[] = [
  { value: 0, label: 'Silent', color: '#64748b', gradient: 'from-slate-600 to-slate-700', emoji: '😐', threshold: 0 },
  { value: 20, label: 'Quiet', color: '#3b82f6', gradient: 'from-blue-600 to-blue-700', emoji: '🤔', threshold: 15 },
  { value: 40, label: 'Interested', color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600', emoji: '👀', threshold: 35 },
  { value: 60, label: 'Engaged', color: '#10b981', gradient: 'from-green-500 to-green-600', emoji: '😊', threshold: 55 },
  { value: 80, label: 'Excited', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500', emoji: '🤩', threshold: 75 },
  { value: 95, label: 'HYPED', color: '#ef4444', gradient: 'from-red-500 to-pink-500', emoji: '🔥', threshold: 90 },
  { value: 100, label: 'ELECTRIC!', color: '#8b5cf6', gradient: 'from-purple-500 to-pink-500', emoji: '⚡', threshold: 98 }
];

export function CrowdEnergyMeter({ 
  momentumState, 
  isLive, 
  aestheticMode,
  onEnergyChange,
  onReactionTrigger,
  enableDecay = false,
  decayRate = 2
}: CrowdEnergyProps) {
  const [energy, setEnergy] = useState(45);
  const [audience, setAudience] = useState<SimulatedAudience>({
    baseEnergy: 45,
    volatility: 0.15,
    momentum: 0,
    recentReactions: []
  });
  const [activeReactions, setActiveReactions] = useState<CrowdReaction[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Get current energy level
  const getCurrentLevel = (currentEnergy: number): EnergyLevel => {
    return [...ENERGY_LEVELS].reverse().find(level => currentEnergy >= level.threshold) || ENERGY_LEVELS[0];
  };

  const currentLevel = getCurrentLevel(energy);

  // Simulate crowd reactions based on momentum changes
  useEffect(() => {
    if (!momentumState || !isLive) return;

    const { momentum, momentumScore, streak } = momentumState;
    
    // Calculate momentum impact on crowd energy
    const momentumImpact = calculateMomentumImpact(momentum, momentumScore, streak);
    
    setAudience(prev => {
      const newMomentum = momentumImpact;
      const momentumDelta = Math.abs(newMomentum - prev.momentum);
      
      // Generate reactions for significant momentum shifts
      const newReactions: CrowdReaction[] = [];
      if (momentumDelta > 0.3) {
        const reactionType = newMomentum > prev.momentum ? 'cheer' : 'gasp';
        newReactions.push({
          type: reactionType,
          intensity: Math.min(momentumDelta * 100, 100),
          timestamp: Date.now(),
          duration: 2000 + momentumDelta * 1000
        });
      }

      // Update base energy based on momentum
      const targetEnergy = Math.max(10, Math.min(100, 
        prev.baseEnergy + (newMomentum - prev.momentum) * 30 + (Math.random() - 0.5) * prev.volatility * 20
      ));

      return {
        ...prev,
        momentum: newMomentum,
        baseEnergy: targetEnergy,
        recentReactions: [...prev.recentReactions, ...newReactions].slice(-5)
      };
    });
  }, [momentumState?.momentum, momentumState?.momentumScore, momentumState?.streak, isLive]);

  // Animate energy changes
  useEffect(() => {
    const targetEnergy = audience.baseEnergy + 
      (audience.recentReactions.reduce((sum, r) => sum + r.intensity * 0.2, 0));
    
    const clampedEnergy = Math.max(0, Math.min(100, targetEnergy));
    setEnergy(clampedEnergy);
    onEnergyChange?.(clampedEnergy);
  }, [audience.baseEnergy, audience.recentReactions, onEnergyChange]);

  // Trigger active reactions
  useEffect(() => {
    const newActiveReactions = audience.recentReactions.filter(
      reaction => Date.now() - reaction.timestamp < reaction.duration
    );
    setActiveReactions(newActiveReactions);
    
    // Notify parent of reactions
    newActiveReactions.forEach(reaction => onReactionTrigger?.(reaction));
  }, [audience.recentReactions, onReactionTrigger]);

  // Energy decay system - gradually reduces energy when nothing exciting happens
  useEffect(() => {
    if (!enableDecay || !isLive) return;

    const decayInterval = setInterval(() => {
      setAudience(prev => {
        // Only decay if no recent reactions and energy is above minimum
        const hasRecentActivity = prev.recentReactions.some(
          reaction => Date.now() - reaction.timestamp < 5000 // 5 seconds
        );
        
        if (hasRecentActivity || prev.baseEnergy <= 20) {
          return prev; // No decay if recent activity or already at minimum
        }

        // Gradual decay - higher energy decays faster
        const currentDecayRate = decayRate * (prev.baseEnergy > 80 ? 1.5 : 1.0);
        const newBaseEnergy = Math.max(20, prev.baseEnergy - currentDecayRate);

        return {
          ...prev,
          baseEnergy: newBaseEnergy
        };
      });
    }, 1000); // Check every second

    return () => clearInterval(decayInterval);
  }, [enableDecay, isLive, decayRate]);

  // Manual test reactions
  const triggerTestReaction = (type: CrowdReaction['type']) => {
    const newReaction: CrowdReaction = {
      type,
      intensity: 70 + Math.random() * 30,
      timestamp: Date.now(),
      duration: 3000
    };

    setAudience(prev => ({
      ...prev,
      recentReactions: [...prev.recentReactions, newReaction],
      baseEnergy: Math.min(100, prev.baseEnergy + 15)
    }));
  };

  if (!isLive) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Main Energy Meter */}
      <Card className={`p-4 ${aestheticMode === 'esports' 
        ? 'bg-slate-900/80 border-purple-500/30 backdrop-blur-md' 
        : 'bg-slate-800/70 border-slate-600/50 backdrop-blur-sm'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className={`h-5 w-5 ${aestheticMode === 'esports' ? 'text-purple-400' : 'text-blue-400'}`} />
            <span className={`font-bold ${aestheticMode === 'esports' ? 'text-purple-300' : 'text-blue-300'}`}>
              Crowd Energy
            </span>
            <Badge className={`${aestheticMode === 'esports' 
              ? 'bg-purple-600/80 text-white' 
              : 'bg-blue-600/80 text-white'
            }`}>
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/60 hover:text-white"
          >
            {Math.round(energy)}%
          </Button>
        </div>

        {/* Energy Bar */}
        <div className="space-y-2">
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energy}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${currentLevel.gradient} relative`}
            >
              {/* Pulse effect for high energy */}
              {energy > 80 && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20"
                />
              )}
            </motion.div>
            
            {/* Level markers */}
            {ENERGY_LEVELS.map((level, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-px bg-white/20"
                style={{ left: `${level.threshold}%` }}
              />
            ))}
          </div>
          
          {/* Current level display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevel.emoji}</span>
              <span className="text-white font-bold">{currentLevel.label}</span>
            </div>
            
            {/* Active reactions */}
            <div className="flex gap-1">
              <AnimatePresence>
                {activeReactions.map((reaction, index) => (
                  <motion.div
                    key={`${reaction.timestamp}-${index}`}
                    initial={{ scale: 0, y: -20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, y: -20, opacity: 0 }}
                    className="text-lg"
                  >
                    {getReactionEmoji(reaction.type)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Analytics (when expanded) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {/* Audience Metrics */}
            <Card className={`p-3 ${aestheticMode === 'esports' 
              ? 'bg-slate-900/60 border-purple-500/20' 
              : 'bg-slate-800/50 border-slate-600/30'
            }`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{(1247 + energy * 23).toFixed(0)}</div>
                  <div className="text-xs text-slate-400">Viewers</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{audience.momentum.toFixed(1)}</div>
                  <div className="text-xs text-slate-400">Momentum</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{audience.recentReactions.length}</div>
                  <div className="text-xs text-slate-400">Reactions</div>
                </div>
              </div>
            </Card>

            {/* Test Controls */}
            <Card className={`p-3 ${aestheticMode === 'esports' 
              ? 'bg-slate-900/60 border-orange-500/20' 
              : 'bg-slate-800/50 border-slate-600/30'
            }`}>
              <div className="text-xs text-slate-400 mb-2">Test Crowd Reactions:</div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => triggerTestReaction('cheer')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  🎉 Cheer
                </Button>
                <Button
                  size="sm"
                  onClick={() => triggerTestReaction('gasp')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  😱 Gasp
                </Button>
                <Button
                  size="sm"
                  onClick={() => triggerTestReaction('applause')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  👏 Applause
                </Button>
                <Button
                  size="sm"
                  onClick={() => triggerTestReaction('excitement')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  ⚡ Hype
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions
function calculateMomentumImpact(momentum: number, momentumScore: number, streak: any): number {
  // Convert momentum data to crowd energy impact
  const momentumIntensity = Math.abs(momentum - 50) / 50; // 0-1 scale
  const streakBonus = streak?.count > 3 ? 0.2 : 0;
  const balanceImpact = Math.abs(momentumScore - 50) / 50;
  
  return Math.min(1, momentumIntensity + streakBonus + balanceImpact * 0.5);
}

function getReactionEmoji(type: CrowdReaction['type']): string {
  switch (type) {
    case 'cheer': return '🎉';
    case 'boo': return '👎';
    case 'gasp': return '😱';
    case 'applause': return '👏';
    case 'excitement': return '⚡';
    default: return '👍';
  }
}