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
import { MomentumEngine, MomentumState, StrategyMessage } from '@/components/match/MomentumEngine';
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
  const [showConfig, setShowConfig] = useState(true);
  
  // Message expiration handler
  const handleMessageExpire = (messageId: string) => {
    setMatchState(prev => ({
      ...prev,
      strategicMessages: prev.strategicMessages.filter(msg => msg.id !== messageId)
    }));
  };

  // Context UI state for momentum accuracy guidance
  const [showMomentumContext, setShowMomentumContext] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(true); // Track if user is doing live point-by-point scoring

  // Detect live vs representation mode based on scoring frequency
  const detectScoringMode = () => {
    const recentPointsCount = matchState.player1.score + matchState.player2.score;
    const currentTime = Date.now();
    
    // Simple heuristic: if more than 10 points scored in less than 2 minutes, likely representation mode
    // For live mode, we expect slower, more deliberate scoring
    if (recentPointsCount > 10) {
      setIsLiveMode(false); // Likely entering scores after the fact
    } else {
      setIsLiveMode(true); // Live point-by-point scoring
    }
  };
  
  // Navigation function
  const goBackToPrototype = () => {
    // Clear current match data when leaving
    sessionStorage.removeItem('currentMatch');
    window.location.href = '/unified-prototype';
  };
  
  // Pickleball-themed team combinations (same as MatchCreationWizard)
  const pickleballTeamThemes = [
    {
      team1: { name: "Dink Masters", color: "#10b981", icon: "🎯" },
      team2: { name: "Power Smashers", color: "#3b82f6", icon: "💥" }
    },
    {
      team1: { name: "Kitchen Warriors", color: "#f59e0b", icon: "🛡️" },
      team2: { name: "Baseline Bombers", color: "#ef4444", icon: "🚀" }
    },
    {
      team1: { name: "Drop Shot Legends", color: "#8b5cf6", icon: "🎪" },
      team2: { name: "Volley Vikings", color: "#06b6d4", icon: "⚔️" }
    },
    {
      team1: { name: "Spin Doctors", color: "#84cc16", icon: "🌪️" },
      team2: { name: "Net Ninjas", color: "#f97316", icon: "🥷" }
    },
    {
      team1: { name: "Lob Launchers", color: "#ec4899", icon: "🎈" },
      team2: { name: "Rally Rockets", color: "#14b8a6", icon: "🚀" }
    },
    {
      team1: { name: "Serve Samurai", color: "#dc2626", icon: "⚡" },
      team2: { name: "Return Rebels", color: "#7c3aed", icon: "🔥" }
    }
  ];

  // Generate random pickleball team theme
  const getRandomTeamTheme = () => {
    return pickleballTeamThemes[Math.floor(Math.random() * pickleballTeamThemes.length)];
  };

  // Get real player names from session storage or use defaults
  const getInitialPlayerNames = () => {
    try {
      // First try to get current match data (from challenge acceptance)
      const currentMatch = sessionStorage.getItem('currentMatch');
      if (currentMatch) {
        const matchData = JSON.parse(currentMatch);
        
        // Handle pairings data from match creation wizard
        if (matchData.pairings) {
          const team1Names = matchData.pairings.team1.map((p: any) => p.displayName || p.username || p.name).join(' & ');
          const team2Names = matchData.pairings.team2.map((p: any) => p.displayName || p.username || p.name).join(' & ');
          return {
            player1: team1Names,
            player2: team2Names
          };
        }
        
        // Fallback to simple player1/player2 format
        return {
          player1: matchData.player1,
          player2: matchData.player2
        };
      }
      
      // Fallback to old format for backwards compatibility
      const storedNames = sessionStorage.getItem('realPlayerNames');
      if (storedNames) {
        const playerNames = JSON.parse(storedNames);
        
        // Check if it's a doubles match (has team players)
        if (playerNames.team1Player1 && playerNames.team2Player1) {
          return {
            player1: `${playerNames.team1Player1} & ${playerNames.team1Player2}`,
            player2: `${playerNames.team2Player1} & ${playerNames.team2Player2}`
          };
        }
        // Singles match
        else if (playerNames.player1 && playerNames.player2) {
          return {
            player1: playerNames.player1,
            player2: playerNames.player2
          };
        }
      }
    } catch (error) {
      console.log('Could not load player names from session storage:', error);
    }
    
    // Fallback to defaults if no session storage data
    return {
      player1: 'Alex Chen',
      player2: 'Sarah Martinez'
    };
  };

  const initialNames = getInitialPlayerNames();
  const [teamTheme] = useState(getRandomTeamTheme()); // Fixed theme for entire match
  
  const [matchState, setMatchState] = useState<MatchState>({
    player1: { name: initialNames.player1, id: '1', tier: 'Elite', score: 0 },
    player2: { name: initialNames.player2, id: '2', tier: 'Professional', score: 0 },
    gameHistory: [],
    currentGame: 1,
    matchComplete: false,
    achievements: [],
    streak: { player: '', count: 0, type: 'win' },
    strategicMessages: [],
    showVideo: false,
    config: {
      scoringType: 'traditional',
      pointTarget: 11,
      matchFormat: 'best-of-3',
      winByTwo: true
    }
  });

  // Initialize momentum engine
  const [momentumEngine] = useState(() => new MomentumEngine({
    pointTarget: 11,
    winByTwo: true,
    scoringType: 'traditional',
    matchFormat: 'best-of-3'
  }));

  const [showReaction, setShowReaction] = useState<{
    show: boolean; 
    type: 'win' | 'ace' | 'streak' | 'milestone';
    playerName?: string;
    context?: { score?: string; gameType?: string; margin?: number };
  }>({
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
      
      // Process momentum and generate strategic messages
      const momentumEvent = {
        pointNo: newState.player1.score + newState.player2.score,
        scoringTeam: playerId === '1' ? 'team1' as const : 'team2' as const,
        score: [newState.player1.score, newState.player2.score] as [number, number],
        timestamp: Date.now(),
        tags: []
      };
      
      const newMessages = momentumEngine.processPoint(momentumEvent);
      newState.strategicMessages = [...prev.strategicMessages, ...newMessages];
      newState.momentumState = momentumEngine.getState();
      
      // Check for game win based on config
      const p1Score = newState.player1.score;
      const p2Score = newState.player2.score;
      const { pointTarget, winByTwo } = newState.config;
      
      const hasReachedTarget = p1Score >= pointTarget || p2Score >= pointTarget;
      const hasWinMargin = winByTwo ? Math.abs(p1Score - p2Score) >= 2 : p1Score !== p2Score;
      
      if (hasReachedTarget && hasWinMargin) {
        const winner = p1Score > p2Score ? newState.player1.name : newState.player2.name;
        
        // Add to game history
        newState.gameHistory.push({
          player1Score: p1Score,
          player2Score: p2Score,
          winner
        });
        
        // Check for achievements with personalized reactions
        const margin = Math.abs(p1Score - p2Score);
        if (p1Score === pointTarget && p2Score === 0 || p2Score === pointTarget && p1Score === 0) {
          newState.achievements.push({
            type: 'ace',
            message: `${winner} scored a perfect game!`,
            timestamp: Date.now()
          });
          setShowReaction({ 
            show: true, 
            type: 'ace', 
            playerName: winner,
            context: { score: `${p1Score}-${p2Score}`, margin }
          });
        } else {
          setShowReaction({ 
            show: true, 
            type: 'win', 
            playerName: winner,
            context: { score: `${p1Score}-${p2Score}`, margin }
          });
        }
        
        // Reset scores for next game
        newState.player1.score = 0;
        newState.player2.score = 0;
        newState.currentGame++;
        
        // Check for match completion based on format
        const p1Wins = newState.gameHistory.filter(g => g.winner === newState.player1.name).length;
        const p2Wins = newState.gameHistory.filter(g => g.winner === newState.player2.name).length;
        
        const requiredWins = newState.config.matchFormat === 'single' ? 1 : 
                           newState.config.matchFormat === 'best-of-3' ? 2 : 3;
        
        if (p1Wins === requiredWins || p2Wins === requiredWins) {
          newState.matchComplete = true;
          const matchWinner = p1Wins === requiredWins ? newState.player1.name : newState.player2.name;
          setShowReaction({ 
            show: true, 
            type: 'milestone', 
            playerName: matchWinner,
            context: { gameType: newState.config.matchFormat }
          });
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
    const resetNames = getInitialPlayerNames();
    setMatchState(prev => ({
      player1: { name: resetNames.player1, id: '1', tier: 'Elite', score: 0 },
      player2: { name: resetNames.player2, id: '2', tier: 'Professional', score: 0 },
      gameHistory: [],
      currentGame: 1,
      matchComplete: false,
      achievements: [],
      streak: { player: '', count: 0, type: 'win' },
      config: prev.config,
      strategicMessages: [],
      momentumState: undefined,
      showVideo: prev.showVideo
    }));
    setUndoStack([]);
  };

  const startNewMatch = () => {
    setShowConfig(true);
    resetMatch();
  };

  const isWinning = (playerId: string) => {
    if (playerId === '1') {
      return matchState.player1.score > matchState.player2.score;
    }
    return matchState.player2.score > matchState.player1.score;
  };

  // Match Configuration Component
  const MatchConfigModal = () => {
    const [tempConfig, setTempConfig] = useState<MatchConfig>(matchState.config);

    const startMatch = () => {
      // Update momentum engine with new config
      momentumEngine.reset();
      
      setMatchState(prev => ({ 
        ...prev, 
        config: tempConfig,
        showVideo: Boolean(tempConfig.liveStreamUrl || tempConfig.recordingUrl)
      }));
      setShowConfig(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-6 bg-slate-800 border-slate-700">
            {/* Back Button */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToPrototype}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lobby
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gamepad2 className="h-8 w-8 text-orange-400" />
                <h1 className="text-2xl font-bold text-white">Match Setup</h1>
              </div>
              <p className="text-slate-400">Configure your match settings</p>
              
              {/* Epic Full-Screen Versus Preview */}
              <div className="mt-6">
                {(() => {
                  const theme = getRandomTeamTheme();
                  return (
                    <VersusScreen
                      mode="mid"
                      teams={[
                        {
                          name: theme.team1.name,
                          color: theme.team1.color,
                          glowColor: theme.team1.color,
                          players: [{ id: 1, name: initialNames.player1, displayName: initialNames.player1 }]
                        },
                        {
                          name: theme.team2.name,
                          color: theme.team2.color,
                          glowColor: theme.team2.color,
                          players: [{ id: 2, name: initialNames.player2, displayName: initialNames.player2 }]
                        }
                      ]}
                      showStats={true}
                      intensity={0.8}
                    />
                  );
                })()}
              </div>
              
              {/* Player Names Display */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-blue-300 font-medium">{initialNames.player1}</span>
                  </div>
                  <span className="text-slate-400 font-bold">vs</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-red-300 font-medium">{initialNames.player2}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Scoring Type */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Scoring System</label>
                <div className="grid grid-cols-2 gap-2">
                  <PulsingScoreButton
                    onClick={() => setTempConfig(prev => ({ ...prev, scoringType: 'traditional' }))}
                    variant={tempConfig.scoringType === 'traditional' ? 'winning' : 'default'}
                  >
                    <div className="text-center">
                      <div className="font-bold">Traditional</div>
                      <div className="text-xs opacity-75">Side-out</div>
                    </div>
                  </PulsingScoreButton>
                  <PulsingScoreButton
                    onClick={() => setTempConfig(prev => ({ ...prev, scoringType: 'rally' }))}
                    variant={tempConfig.scoringType === 'rally' ? 'winning' : 'default'}
                  >
                    <div className="text-center">
                      <div className="font-bold">Rally</div>
                      <div className="text-xs opacity-75">Every point</div>
                    </div>
                  </PulsingScoreButton>
                </div>
              </div>

              {/* Point Target */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Points to Win</label>
                <div className="grid grid-cols-3 gap-2">
                  {([11, 15, 21] as const).map(points => (
                    <PulsingScoreButton
                      key={points}
                      onClick={() => setTempConfig(prev => ({ ...prev, pointTarget: points }))}
                      variant={tempConfig.pointTarget === points ? 'winning' : 'default'}
                    >
                      {points}
                    </PulsingScoreButton>
                  ))}
                </div>
                {tempConfig.scoringType === 'rally' && tempConfig.pointTarget === 11 && (
                  <p className="text-xs text-orange-400 mt-1">Rally scoring typically uses 15 or 21 points</p>
                )}
              </div>

              {/* Match Format */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Match Format</label>
                <div className="space-y-2">
                  {([
                    { value: 'single', label: 'Single Game', desc: 'First to win 1 game' },
                    { value: 'best-of-3', label: 'Best of 3', desc: 'First to win 2 games' },
                    { value: 'best-of-5', label: 'Best of 5', desc: 'First to win 3 games' }
                  ] as const).map(format => (
                    <PulsingScoreButton
                      key={format.value}
                      onClick={() => setTempConfig(prev => ({ ...prev, matchFormat: format.value }))}
                      variant={tempConfig.matchFormat === format.value ? 'winning' : 'default'}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <div className="font-bold">{format.label}</div>
                          <div className="text-xs opacity-75">{format.desc}</div>
                        </div>
                        {tempConfig.matchFormat === format.value && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </PulsingScoreButton>
                  ))}
                </div>
              </div>

              {/* Win by 2 */}
              <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Must win by 2</div>
                  <div className="text-xs text-slate-400">Require 2-point margin to win</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTempConfig(prev => ({ ...prev, winByTwo: !prev.winByTwo }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    tempConfig.winByTwo ? 'bg-orange-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: tempConfig.winByTwo ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Video Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-400" />
                  <label className="text-sm text-slate-400 font-medium">Video Integration (Optional)</label>
                </div>
                
                {/* Live Stream */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 block">Live Stream URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={tempConfig.liveStreamUrl || ''}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        liveStreamUrl: e.target.value,
                        videoProvider: e.target.value ? 'hls' : undefined
                      }))}
                      placeholder="https://stream.example.com/live.m3u8"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                    {tempConfig.liveStreamUrl && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Recorded Video */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 block">Recorded Video URL</label>
                  <input
                    type="url"
                    value={tempConfig.recordingUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      let provider: 'mp4' | 'youtube' | 'vimeo' | undefined;
                      
                      if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        provider = 'youtube';
                      } else if (url.includes('vimeo.com')) {
                        provider = 'vimeo';
                      } else if (url.includes('.mp4')) {
                        provider = 'mp4';
                      }
                      
                      setTempConfig(prev => ({ 
                        ...prev, 
                        recordingUrl: url,
                        videoProvider: provider
                      }));
                    }}
                    placeholder="YouTube, Vimeo, or MP4 URL"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  {tempConfig.recordingUrl && (
                    <div className="text-xs text-slate-500">
                      Detected: {tempConfig.videoProvider === 'youtube' ? 'YouTube' : 
                                tempConfig.videoProvider === 'vimeo' ? 'Vimeo' : 
                                tempConfig.videoProvider === 'mp4' ? 'MP4 Video' : 'Unknown format'}
                    </div>
                  )}
                </div>

                {/* Video Sync Offset */}
                {(tempConfig.liveStreamUrl || tempConfig.recordingUrl) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-500">Video Sync Offset</label>
                      <span className="text-xs text-slate-400">{tempConfig.videoSyncOffset || 0}s</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="0.5"
                      value={tempConfig.videoSyncOffset || 0}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        videoSyncOffset: parseFloat(e.target.value)
                      }))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-slate-600">Adjust if video doesn't match live scoring</div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={startMatch}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Match Arena!
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  };

  if (showConfig) {
    return <MatchConfigModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Header with game feel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {/* Back Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBackToPrototype}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
          
          {matchState.matchComplete && (
            <Button
              onClick={goBackToPrototype}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Return to Arena
            </Button>
          )}
        </div>
        
        {/* Match Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gamepad2 className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Match Arena</h1>
            <Gamepad2 className="h-8 w-8 text-orange-400" />
          </div>
          
          {/* Epic Versus Screen */}
          <div className="mb-6">
            <VersusScreen
              mode="mid"
              teams={[
                {
                  name: teamTheme.team1.name,
                  color: teamTheme.team1.color,
                  glowColor: teamTheme.team1.color,
                  players: [{ id: 1, name: matchState.player1.name, displayName: matchState.player1.name }]
                },
                {
                  name: teamTheme.team2.name,
                  color: teamTheme.team2.color,
                  glowColor: teamTheme.team2.color,
                  players: [{ id: 2, name: matchState.player2.name, displayName: matchState.player2.name }]
                }
              ]}
              showStats={true}
              intensity={0.8}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge className="bg-orange-500/20 text-orange-300">
            Game {matchState.currentGame}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300">
            {matchState.config.matchFormat === 'single' ? 'Single Game' :
             matchState.config.matchFormat === 'best-of-3' ? 'Best of 3' : 'Best of 5'}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300">
            {matchState.config.scoringType === 'traditional' ? 'Traditional' : 'Rally'} • {matchState.config.pointTarget} pts
          </Badge>
          {matchState.config.winByTwo && (
            <Badge className="bg-green-500/20 text-green-300">
              Win by 2
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Contextual UI for Momentum Accuracy */}
      {showMomentumContext && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 relative"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {isLiveMode ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <BarChart3 className="h-4 w-4 text-orange-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90">
                  {isLiveMode ? (
                    <>
                      <span className="text-green-400 font-semibold">🎯 Live Mode Detected</span> - 
                      Momentum tracking is most accurate with point-by-point live scoring
                    </>
                  ) : (
                    <>
                      <span className="text-orange-400 font-semibold">📊 Representation Mode</span> - 
                      Momentum wave shows general flow but is most accurate with live point-by-point scoring
                    </>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMomentumContext(false)}
                className="flex-shrink-0 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Momentum Wave Visualization */}
      {matchState.momentumState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 ${matchState.matchComplete ? 'ring-2 ring-yellow-400/50 rounded-lg p-2' : ''}`}
        >
          {matchState.matchComplete && (
            <div className="mb-2 text-center">
              <Badge className="bg-yellow-500/20 text-yellow-300 font-semibold">
                📊 Match Analysis - Review Your Momentum Journey
              </Badge>
            </div>
          )}
          <MomentumWave
            momentumState={matchState.momentumState}
            team1Color={teamTheme.team1.color}
            team2Color={teamTheme.team2.color}
            className="w-full"
            isInteractive={true}
            isMatchComplete={matchState.matchComplete}
          />
        </motion.div>
      )}

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

      {/* Strategic Message Toasts */}
      <MessageToast
        messages={matchState.strategicMessages}
        onMessageExpire={handleMessageExpire}
        team1Color={teamTheme.team1.color}
        team2Color={teamTheme.team2.color}
      />

      {/* Video Player */}
      {matchState.showVideo && (
        <VideoDock
          config={{
            liveStreamUrl: matchState.config.liveStreamUrl,
            recordingUrl: matchState.config.recordingUrl,
            videoProvider: matchState.config.videoProvider,
            videoSyncOffset: matchState.config.videoSyncOffset
          }}
          isVisible={matchState.showVideo}
          onSyncOffsetChange={(offset) => {
            setMatchState(prev => ({
              ...prev,
              config: { ...prev.config, videoSyncOffset: offset }
            }));
          }}
        />
      )}

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
        
        <Button
          onClick={startNewMatch}
          variant="outline"
          className="text-white border-slate-600 hover:bg-slate-700"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          New Match
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
            <div className="flex gap-3">
              <Button
                onClick={resetMatch}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-orange-500"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Same Settings
              </Button>
              <Button
                onClick={startNewMatch}
                className="bg-white text-orange-500 hover:bg-slate-100"
              >
                <PartyPopper className="h-4 w-4 mr-2" />
                New Match
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Explosive Reactions */}
      <ExplosiveReaction
        show={showReaction.show}
        type={showReaction.type}
        playerName={showReaction.playerName}
        context={showReaction.context}
        onComplete={() => setShowReaction({ show: false, type: 'win' })}
      />
    </div>
  );
}