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
import { useLocation, useParams } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VersusScreen } from '@/components/match/VersusScreen';
import { MomentumEngine, MomentumState, StrategyMessage, MatchCloseness } from '@/components/match/MomentumEngine';
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

// Match Closeness Indicator for Gaming Experience
function MatchClosenessIndicator({ 
  closeness, 
  team1Name, 
  team2Name, 
  momentumScore 
}: { 
  closeness?: MatchCloseness;
  team1Name?: string;
  team2Name?: string;
  momentumScore?: number;
}) {
  if (!closeness) return null;

  const levelColors = {
    'nail-biter': 'from-red-500 to-orange-500',
    'competitive': 'from-blue-500 to-purple-500', 
    'one-sided': 'from-yellow-500 to-orange-500',
    'blowout': 'from-gray-500 to-slate-600'
  };

  const levelIcons = {
    'nail-biter': '🔥',
    'competitive': '⚡',
    'one-sided': '📈',
    'blowout': '💥'
  };

  const levelBorderColors = {
    'nail-biter': 'border-red-400',
    'competitive': 'border-blue-400',
    'one-sided': 'border-yellow-400', 
    'blowout': 'border-gray-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hovered"
      variants={{
        default: {},
        hovered: {}
      }}
      className={`relative p-3 rounded-xl bg-gradient-to-r ${levelColors[closeness.level]} border-2 ${levelBorderColors[closeness.level]} backdrop-blur-sm shadow-lg cursor-pointer`}
    >
      {/* Pulsing effect for nail-biters */}
      {closeness.level === 'nail-biter' && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl blur-sm"
        />
      )}
      
      <div className="relative flex items-center gap-3">
        <div className="text-2xl">{levelIcons[closeness.level]}</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              {(() => {
                if (!team1Name || !team2Name || momentumScore === undefined) return 'Match Intensity';
                
                if (momentumScore > 65) return `${team1Name} Dominating`;
                if (momentumScore > 55) return `${team1Name} Leading`;
                if (momentumScore < 35) return `${team2Name} Dominating`;
                if (momentumScore < 45) return `${team2Name} Leading`;
                return 'Dead Heat';
              })()}
            </span>
            <div className="text-white font-bold text-lg">
              {closeness.score}/100
            </div>
          </div>
          
          <div className="text-white text-sm font-medium" style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>
            {(() => {
              if (!team1Name || !team2Name || momentumScore === undefined) return closeness.description;
              
              if (closeness.level === 'nail-biter') {
                return `${team1Name} vs ${team2Name} - Anyone's game!`;
              } else if (closeness.level === 'competitive') {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} has the edge in this battle`;
              } else if (closeness.level === 'one-sided') {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} pulling away from the competition`;
              } else {
                const leader = momentumScore > 50 ? team1Name : team2Name;
                return `${leader} completely in control`;
              }
            })()}
          </div>
        </div>
        
        {/* Intensity meter */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-12 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${closeness.score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full bg-white rounded-full"
              style={{
                filter: closeness.level === 'nail-biter' ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : 'none'
              }}
            />
          </div>
          <span className="text-white text-xs font-bold">
            {closeness.level.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>
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

export default function MatchRecord() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const matchId = params.matchId;

  // Initialize from session storage
  const [matchState, setMatchState] = useState<MatchState>(() => {
    const storedMatch = sessionStorage.getItem('currentMatch');
    if (storedMatch) {
      try {
        const parsed = JSON.parse(storedMatch);
        return {
          player1: { ...parsed.player1, score: 0 },
          player2: { ...parsed.player2, score: 0 },
          gameHistory: [],
          currentGame: 1,
          matchComplete: false,
          achievements: [],
          streak: { player: '', count: 0, type: 'win' },
          config: parsed.config || {
            scoringType: 'traditional',
            pointTarget: 11,
            matchFormat: 'single',
            winByTwo: true
          },
          strategicMessages: [],
          showVideo: false
        };
      } catch (e) {
        console.error('Failed to parse stored match data:', e);
      }
    }
    
    // Fallback if no stored data
    setLocation('/match/create');
    return null as any;
  });

  // Initialize momentum engine
  const [momentumEngine] = useState(() => new MomentumEngine({
    pointTarget: matchState?.config.pointTarget || 11,
    winByTwo: matchState?.config.winByTwo || true,
    scoringType: matchState?.config.scoringType || 'traditional',
    matchFormat: matchState?.config.matchFormat || 'single'
  }));

  // Reaction state
  const [reaction, setReaction] = useState<{
    show: boolean;
    type: 'win' | 'ace' | 'streak' | 'milestone';
    playerName?: string;
    context?: any;
  }>({
    show: false,
    type: 'win'
  });

  // Message expiration handler
  const handleMessageExpire = (messageId: string) => {
    setMatchState(prev => ({
      ...prev,
      strategicMessages: prev.strategicMessages.filter(msg => msg.id !== messageId)
    }));
  };

  // Score point function
  const scorePoint = (player: 'player1' | 'player2') => {
    setMatchState(prev => {
      const newState = { ...prev };
      newState[player].score += 1;
      
      // Update momentum engine
      const pointEvent = {
        pointNo: newState.player1.score + newState.player2.score,
        scoringTeam: player === 'player1' ? 'team1' as const : 'team2' as const,
        score: [newState.player1.score, newState.player2.score] as [number, number],
        timestamp: Date.now(),
        tags: []
      };
      
      const messages = momentumEngine.processPoint(pointEvent);
      const momentumState = momentumEngine.getState();
      
      // Check for reactions
      const playerName = newState[player].name;
      const isGameWon = newState[player].score >= newState.config.pointTarget && 
                        newState[player].score - newState[player === 'player1' ? 'player2' : 'player1'].score >= (newState.config.winByTwo ? 2 : 1);
      
      if (isGameWon) {
        setReaction({
          show: true,
          type: 'win',
          playerName,
          context: { score: `${newState.player1.score}-${newState.player2.score}` }
        });
      }
      
      return {
        ...newState,
        momentumState,
        strategicMessages: messages
      };
    });
  };

  // Undo last point
  const undoLastPoint = () => {
    setMatchState(prev => {
      if (prev.player1.score === 0 && prev.player2.score === 0) return prev;
      
      const newState = { ...prev };
      if (prev.player1.score > 0 && (prev.player1.score >= prev.player2.score || prev.player2.score === 0)) {
        newState.player1.score -= 1;
      } else if (prev.player2.score > 0) {
        newState.player2.score -= 1;
      }
      
      return newState;
    });
  };

  // Navigation functions
  const goBack = () => {
    setLocation('/match/create');
  };

  const goToResults = () => {
    setLocation(`/match/${matchId}`);
  };

  if (!matchState) {
    return <div>Loading...</div>;
  }

  const { player1, player2, momentumState, strategicMessages } = matchState;
  const isPlayer1Winning = player1.score > player2.score;
  const isPlayer2Winning = player2.score > player1.score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Gaming Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Explosive Reactions */}
      <ExplosiveReaction 
        show={reaction.show}
        type={reaction.type}
        playerName={reaction.playerName}
        context={reaction.context}
        onComplete={() => setReaction(prev => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={goBack}
            className="text-white hover:text-orange-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Setup
          </Button>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={undoLastPoint}
              className="text-white hover:text-orange-400"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
            
            <Button 
              onClick={goToResults}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Finish Match
            </Button>
          </div>
        </div>

        {/* Match Closeness Indicator */}
        {momentumState?.closeness && (
          <div className="mb-6">
            <MatchClosenessIndicator 
              closeness={momentumState.closeness}
              team1Name={player1.name}
              team2Name={player2.name}
              momentumScore={momentumState.momentumScore}
            />
          </div>
        )}

        {/* Player Cards and Scoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Player 1 Card */}
          <motion.div
            animate={{ 
              scale: isPlayer1Winning ? 1.02 : 1,
              borderColor: isPlayer1Winning ? '#f97316' : '#374151',
              boxShadow: isPlayer1Winning ? '0 0 30px rgba(249, 115, 22, 0.4)' : 'none'
            }}
            transition={{ duration: 0.3 }}
            className="relative cursor-pointer group"
          >
            <Card className={`p-6 border-2 transition-all ${
              isPlayer1Winning 
                ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-400' 
                : 'bg-slate-800 border-slate-600 hover:border-slate-500'
            }`}>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">{player1.name}</div>
                      <Badge className="text-xs bg-slate-600 text-slate-200">{player1.tier}</Badge>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ scale: isPlayer1Winning ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: isPlayer1Winning ? Infinity : 0, duration: 1 }}
                    className={`text-5xl font-bold ${isPlayer1Winning ? 'text-orange-400' : 'text-white'}`}
                  >
                    {player1.score}
                  </motion.div>
                </div>
                
                <Button 
                  onClick={() => scorePoint('player1')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Score Point
                </Button>
              </div>
              
              {/* Winning indicator */}
              {isPlayer1Winning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Player 2 Card */}
          <motion.div
            animate={{ 
              scale: isPlayer2Winning ? 1.02 : 1,
              borderColor: isPlayer2Winning ? '#f97316' : '#374151',
              boxShadow: isPlayer2Winning ? '0 0 30px rgba(249, 115, 22, 0.4)' : 'none'
            }}
            transition={{ duration: 0.3 }}
            className="relative cursor-pointer group"
          >
            <Card className={`p-6 border-2 transition-all ${
              isPlayer2Winning 
                ? 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-400' 
                : 'bg-slate-800 border-slate-600 hover:border-slate-500'
            }`}>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">{player2.name}</div>
                      <Badge className="text-xs bg-slate-600 text-slate-200">{player2.tier}</Badge>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ scale: isPlayer2Winning ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: isPlayer2Winning ? Infinity : 0, duration: 1 }}
                    className={`text-5xl font-bold ${isPlayer2Winning ? 'text-orange-400' : 'text-white'}`}
                  >
                    {player2.score}
                  </motion.div>
                </div>
                
                <Button 
                  onClick={() => scorePoint('player2')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-3"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Score Point
                </Button>
              </div>
              
              {/* Winning indicator */}
              {isPlayer2Winning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Momentum Wave */}
        {momentumState && (
          <div className="mb-6">
            <MomentumWave 
              momentumState={{
                ...momentumState,
                currentScore: { player1: player1.score, player2: player2.score },
                gameNumber: matchState.currentGame,
                isMatchComplete: matchState.matchComplete
              }}
              team1Color="#3b82f6"
              team2Color="#ef4444"
              team1Name={player1.name}
              team2Name={player2.name}
              isInteractive={true}
              className="mt-6"
            />
          </div>
        )}

        {/* Strategic Messages */}
        <div className="fixed top-20 right-4 z-40">
          <MessageToast
            messages={strategicMessages}
            onMessageExpire={handleMessageExpire}
            team1Color="#3b82f6"
            team2Color="#ef4444"
          />
        </div>

        {/* Video Dock */}
        {matchState.showVideo && (
          <div className="mt-6">
            <VideoDock 
              config={{
                liveStreamUrl: matchState.config.liveStreamUrl,
                recordingUrl: matchState.config.recordingUrl,
                videoProvider: matchState.config.videoProvider,
                videoSyncOffset: matchState.config.videoSyncOffset
              }}
              isVisible={true}
              onSyncOffsetChange={(offset) => {
                setMatchState(prev => ({
                  ...prev,
                  config: { ...prev.config, videoSyncOffset: offset }
                }));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}