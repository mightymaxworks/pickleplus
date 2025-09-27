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
  PartyPopper
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Enhanced Micro-Feedback Components for Gaming Feel
function ExplosiveReaction({ show, type, onComplete }: {
  show: boolean;
  type: 'win' | 'ace' | 'streak' | 'milestone';
  onComplete: () => void;
}) {
  const configs = {
    win: { icon: Trophy, text: "VICTORY!", color: "text-yellow-400", particles: 8 },
    ace: { icon: Zap, text: "ACE!", color: "text-orange-400", particles: 6 },
    streak: { icon: Target, text: "WIN STREAK!", color: "text-purple-400", particles: 10 },
    milestone: { icon: Crown, text: "MILESTONE!", color: "text-pink-400", particles: 12 }
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
            <span className="text-xl font-bold">{config.text}</span>
          </motion.div>
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
      className={`relative p-4 rounded-xl border-2 text-white font-bold text-xl transition-all ${
        variants[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}`}
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

interface MatchState {
  player1: { name: string; id: string; tier: string; score: number };
  player2: { name: string; id: string; tier: string; score: number };
  gameHistory: Array<{ player1Score: number; player2Score: number; winner: string }>;
  currentGame: number;
  matchComplete: boolean;
  achievements: Array<{ type: string; message: string; timestamp: number }>;
  streak: { player: string; count: number; type: 'win' | 'ace' };
}

export default function GamifiedMatchRecording() {
  const [matchState, setMatchState] = useState<MatchState>({
    player1: { name: 'Alex Chen', id: '1', tier: 'Elite', score: 0 },
    player2: { name: 'Sarah Martinez', id: '2', tier: 'Professional', score: 0 },
    gameHistory: [],
    currentGame: 1,
    matchComplete: false,
    achievements: [],
    streak: { player: '', count: 0, type: 'win' }
  });

  const [showReaction, setShowReaction] = useState<{show: boolean; type: 'win' | 'ace' | 'streak' | 'milestone'}>({
    show: false,
    type: 'win'
  });
  
  const [undoStack, setUndoStack] = useState<MatchState[]>([]);
  const [showStats, setShowStats] = useState(false);

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
      
      // Check for game win (11 points, win by 2)
      const p1Score = newState.player1.score;
      const p2Score = newState.player2.score;
      
      if ((p1Score >= 11 || p2Score >= 11) && Math.abs(p1Score - p2Score) >= 2) {
        const winner = p1Score > p2Score ? newState.player1.name : newState.player2.name;
        
        // Add to game history
        newState.gameHistory.push({
          player1Score: p1Score,
          player2Score: p2Score,
          winner
        });
        
        // Check for achievements
        if (p1Score === 11 && p2Score === 0 || p2Score === 11 && p1Score === 0) {
          newState.achievements.push({
            type: 'ace',
            message: `${winner} scored a perfect game!`,
            timestamp: Date.now()
          });
          setShowReaction({ show: true, type: 'ace' });
        } else {
          setShowReaction({ show: true, type: 'win' });
        }
        
        // Reset scores for next game
        newState.player1.score = 0;
        newState.player2.score = 0;
        newState.currentGame++;
        
        // Check for match completion (best of 3)
        const p1Wins = newState.gameHistory.filter(g => g.winner === newState.player1.name).length;
        const p2Wins = newState.gameHistory.filter(g => g.winner === newState.player2.name).length;
        
        if (p1Wins === 2 || p2Wins === 2) {
          newState.matchComplete = true;
          setShowReaction({ show: true, type: 'milestone' });
        }
      }
      
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
    setMatchState({
      player1: { name: 'Alex Chen', id: '1', tier: 'Elite', score: 0 },
      player2: { name: 'Sarah Martinez', id: '2', tier: 'Professional', score: 0 },
      gameHistory: [],
      currentGame: 1,
      matchComplete: false,
      achievements: [],
      streak: { player: '', count: 0, type: 'win' }
    });
    setUndoStack([]);
  };

  const isWinning = (playerId: string) => {
    if (playerId === '1') {
      return matchState.player1.score > matchState.player2.score;
    }
    return matchState.player2.score > matchState.player1.score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Header with game feel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-8 w-8 text-orange-400" />
          <h1 className="text-3xl font-bold text-white">Match Arena</h1>
          <Gamepad2 className="h-8 w-8 text-orange-400" />
        </div>
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-orange-500/20 text-orange-300">
            Game {matchState.currentGame}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300">
            Best of 3
          </Badge>
        </div>
      </motion.div>

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
            </div>
          </div>
        </div>
      </Card>

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
            <Button
              onClick={resetMatch}
              className="bg-white text-orange-500 hover:bg-slate-100"
            >
              <PartyPopper className="h-4 w-4 mr-2" />
              New Match
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Explosive Reactions */}
      <ExplosiveReaction
        show={showReaction.show}
        type={showReaction.type}
        onComplete={() => setShowReaction({ show: false, type: 'win' })}
      />
    </div>
  );
}