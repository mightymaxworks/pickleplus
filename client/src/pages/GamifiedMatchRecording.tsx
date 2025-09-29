import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
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
import { MomentumEngine, MomentumState, StrategyMessage, MatchCloseness } from '@/components/match/MomentumEngine';
import { MomentumWave } from '@/components/match/MomentumWave';
import { MessageToast } from '@/components/match/MessageToast';
import { VideoDock } from '@/components/match/VideoDock';
import { MatchCreationWizard } from '@/components/match/MatchCreationWizard';

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

// Types
interface Player {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  passportCode: string;
  gender?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  rankingPoints?: number;
}

interface MatchCreationData {
  format: 'singles' | 'doubles';
  selectedPlayers: Player[];
  pairings?: { team1: Player[]; team2: Player[] };
  matchStatus: {
    competitiveBalance: number;
    genderBonus: number;
    description: string;
  };
  teamIdentity?: {
    team1: {
      name: string;
      color: string;
      members: string[];
    };
    team2: {
      name: string;
      color: string;
      members: string[];
    };
  };
}

interface MatchState {
  isMatchActive: boolean;
  currentGame: number;
  scores: {
    player1: { games: number; currentGame: number };
    player2: { games: number; currentGame: number };
  };
  matchFormat: 'singles' | 'doubles';
  strategicMessages: StrategyMessage[];
  gameHistory: Array<{
    game: number;
    score: { player1: number; player2: number };
    winner: 'player1' | 'player2';
    duration: number;
  }>;
  showVideo: boolean;
}

// Generate shorter match ID
const generateMatchId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function GamifiedMatchRecording() {
  console.log('=== GamifiedMatchRecording component LOADED ===');
  
  const [, setLocation] = useLocation();
  
  // Detect current phase based on URL
  const [isCreate] = useRoute('/match/create');
  const [isRecord, recordParams] = useRoute('/match/record/:matchId');
  const [isResult, resultParams] = useRoute('/match/result/:matchId');
  const [isLegacy] = useRoute('/gamified-match-recording');
  
  // Determine current phase
  const phase = isRecord ? 'record' : isResult ? 'result' : 'create';
  const matchId = recordParams?.matchId || resultParams?.matchId;
  
  console.log('Route detection:', { isCreate, isRecord, isResult, phase, matchId });

  // State management
  const [matchData, setMatchData] = useState<MatchCreationData | null>(null);
  const [matchState, setMatchState] = useState<MatchState>({
    isMatchActive: false,
    currentGame: 1,
    scores: {
      player1: { games: 0, currentGame: 0 },
      player2: { games: 0, currentGame: 0 }
    },
    matchFormat: 'singles',
    strategicMessages: [],
    gameHistory: [],
    showVideo: false
  });

  // Momentum Engine state
  const [momentumEngine] = useState(() => new MomentumEngine());
  const [momentumState, setMomentumState] = useState<MomentumState>({
    momentum: 0,
    wave: [],
    streak: { player: null, count: 0 },
    gamePhase: 'early',
    momentumScore: 50
  });

  // Animation states
  const [showReaction, setShowReaction] = useState(false);
  const [reactionType, setReactionType] = useState<'win' | 'ace' | 'streak' | 'milestone'>('win');

  // Handle match creation
  const handleMatchCreated = (data: MatchCreationData) => {
    console.log('Match created with data:', data);
    setMatchData(data);
    setMatchState(prev => ({
      ...prev,
      matchFormat: data.format,
      isMatchActive: true
    }));
    
    // Generate and navigate to record phase
    const newMatchId = generateMatchId();
    console.log('Navigating to match recording with ID:', newMatchId);
    setLocation(`/match/record/${newMatchId}`);
  };

  // Score management
  const updateScore = (player: 'player1' | 'player2', increment: boolean) => {
    setMatchState(prev => {
      const newState = { ...prev };
      const currentScore = newState.scores[player].currentGame;
      const newScore = increment ? currentScore + 1 : Math.max(0, currentScore - 1);
      
      newState.scores[player].currentGame = newScore;
      
      // Update momentum
      const newMomentumState = momentumEngine.updateScore(
        newState.scores.player1.currentGame,
        newState.scores.player2.currentGame,
        newState.currentGame
      );
      setMomentumState(newMomentumState);
      
      // Check for game win
      if (newScore >= 11 && newScore - newState.scores[player === 'player1' ? 'player2' : 'player1'].currentGame >= 2) {
        // Game won
        newState.scores[player].games += 1;
        newState.gameHistory.push({
          game: newState.currentGame,
          score: {
            player1: newState.scores.player1.currentGame,
            player2: newState.scores.player2.currentGame
          },
          winner: player,
          duration: Date.now() // Simplified duration
        });
        
        // Reset current game scores
        newState.scores.player1.currentGame = 0;
        newState.scores.player2.currentGame = 0;
        newState.currentGame += 1;
        
        // Show reaction
        setReactionType('win');
        setShowReaction(true);
        
        // Check for match win (best of 3)
        if (newState.scores[player].games >= 2) {
          // Match won - navigate to results
          setReactionType('milestone');
          setTimeout(() => {
            setLocation(`/match/result/${matchId}`);
          }, 2000);
        }
      }
      
      return newState;
    });
  };

  // Create phase component
  const CreatePhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <MatchCreationWizard onMatchCreated={handleMatchCreated} />
      </div>
    </div>
  );

  // Record phase component  
  const RecordPhase = () => {
    if (!matchData) {
      // Try to load from sessionStorage or redirect back
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Match Not Found</h2>
            <p className="text-slate-300 mb-4">The match data could not be loaded.</p>
            <Button onClick={() => setLocation('/match/create')}>
              Create New Match
            </Button>
          </Card>
        </div>
      );
    }

    // Create versus teams for display
    const versusTeams: [any, any] = [
      {
        name: matchData.teamIdentity?.team1.name || 'Team 1',
        color: matchData.teamIdentity?.team1.color || '#10b981',
        glowColor: matchData.teamIdentity?.team1.color || '#10b981',
        players: [
          {
            id: 1,
            name: 'You',
            displayName: 'You',
            passportCode: 'USER123',
            rankingPoints: 1200
          }
        ]
      },
      {
        name: matchData.teamIdentity?.team2.name || 'Team 2',
        color: matchData.teamIdentity?.team2.color || '#3b82f6',
        glowColor: matchData.teamIdentity?.team2.color || '#3b82f6',
        players: matchData.selectedPlayers.map(p => ({
          id: p.id,
          name: p.displayName || p.username,
          displayName: p.displayName || p.username,
          passportCode: p.passportCode,
          rankingPoints: p.rankingPoints
        }))
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Explosive reactions */}
        <ExplosiveReaction
          show={showReaction}
          type={reactionType}
          onComplete={() => setShowReaction(false)}
          playerName="Player"
        />

        <div className="container mx-auto p-4 space-y-6 relative z-10">
          {/* Header with versus display */}
          <VersusScreen
            mode="mid"
            teams={versusTeams}
            intensity={0.8}
            showStats={true}
          />

          {/* Game State Display */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className="bg-orange-500/20 text-orange-300 px-3 py-1">
                  Game {matchState.currentGame}
                </Badge>
                <div className="text-2xl font-bold text-white">
                  {matchState.scores.player1.currentGame} - {matchState.scores.player2.currentGame}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Games: {matchState.scores.player1.games} - {matchState.scores.player2.games}
                </Badge>
              </div>
            </div>

            {/* Score Control */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-white font-medium">Team 1</h3>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => updateScore('player1', false)}
                    variant="outline"
                    size="sm"
                    disabled={matchState.scores.player1.currentGame === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-3xl font-bold text-white w-16 text-center">
                    {matchState.scores.player1.currentGame}
                  </div>
                  <Button
                    onClick={() => updateScore('player1', true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium">Team 2</h3>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => updateScore('player2', false)}
                    variant="outline"
                    size="sm"
                    disabled={matchState.scores.player2.currentGame === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="text-3xl font-bold text-white w-16 text-center">
                    {matchState.scores.player2.currentGame}
                  </div>
                  <Button
                    onClick={() => updateScore('player2', true)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Momentum Wave */}
          <MomentumWave
            momentumState={momentumState}
            team1Color={versusTeams[0].color}
            team2Color={versusTeams[1].color}
            team1Name={versusTeams[0].name}
            team2Name={versusTeams[1].name}
            isInteractive={true}
          />

          {/* Strategic Messages */}
          {matchState.strategicMessages.map((message) => (
            <MessageToast
              key={message.id}
              message={message}
              onExpire={(id) => {
                setMatchState(prev => ({
                  ...prev,
                  strategicMessages: prev.strategicMessages.filter(msg => msg.id !== id)
                }));
              }}
            />
          ))}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation('/match/create')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Setup
            </Button>
            <Button
              onClick={() => setLocation(`/match/result/${matchId}`)}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              End Match
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Result phase component
  const ResultPhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <Card className="p-8 text-center max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="h-16 w-16 text-yellow-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white">Match Complete!</h1>
          
          <div className="text-xl text-slate-300">
            Final Score: {matchState.scores.player1.games} - {matchState.scores.player2.games}
          </div>
          
          {/* Game History */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold">Game Results:</h3>
            {matchState.gameHistory.map((game, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-800/50 rounded p-2">
                <span className="text-slate-300">Game {game.game}</span>
                <span className="text-white">{game.score.player1} - {game.score.player2}</span>
                <Badge className={game.winner === 'player1' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}>
                  {game.winner === 'player1' ? 'Team 1' : 'Team 2'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setLocation('/match/create')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              New Match
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render based on phase
  try {
    if (phase === 'create') {
      return <CreatePhase />;
    } else if (phase === 'record') {
      return <RecordPhase />;
    } else if (phase === 'result') {
      return <ResultPhase />;
    }
    
    // Default fallback
    return <CreatePhase />;
    
  } catch (error) {
    console.error('Error in GamifiedMatchRecording:', error);
    return (
      <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-slate-300 mb-4">Error: {String(error)}</p>
          <Button onClick={() => setLocation('/match/create')}>
            Start Over
          </Button>
        </Card>
      </div>
    );
  }
}