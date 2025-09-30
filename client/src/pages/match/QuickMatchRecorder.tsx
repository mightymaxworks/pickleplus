import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, Plus, Trash2, Calendar, Check, ArrowLeft, 
  PlayCircle, TrendingUp, Home, Clock, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameScore {
  team1: number;
  team2: number;
}

interface MatchData {
  match: any;
  verifications: any[];
  config: any;
}

export default function QuickMatchRecorder() {
  const { serial } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [games, setGames] = useState<GameScore[]>([{ team1: 0, team2: 0 }]);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Load match data
  useEffect(() => {
    const loadMatch = async () => {
      try {
        // Check if this is a demo/test serial (not logged in)
        const isDemoSerial = serial?.startsWith('MDEMO') || serial?.startsWith('MTEST');
        
        if (isDemoSerial) {
          console.log('[Quick Recorder] Using demo mode - loading from sessionStorage');
          const storedConfig = sessionStorage.getItem('pkl:matchConfig');
          
          if (storedConfig) {
            const config = JSON.parse(storedConfig);
            setMatchData({
              match: { serial, status: 'pending' },
              verifications: [],
              config
            });
            
            // Initialize games based on match format
            const format = config?.matchFormat || 'single';
            const initialGames = format === 'best-of-5' ? 3 : format === 'best-of-3' ? 2 : 1;
            setGames(Array(initialGames).fill(null).map(() => ({ team1: 0, team2: 0 })));
          } else {
            // Fallback config
            setMatchData({
              match: { serial, status: 'pending' },
              verifications: [],
              config: { matchFormat: 'best-of-3', scoringType: 'rally', pointTarget: 11 }
            });
            setGames([{ team1: 0, team2: 0 }, { team1: 0, team2: 0 }]);
          }
          
          setLoading(false);
          return;
        }
        
        // Try to load from backend API
        const response = await fetch(`/api/matches/${serial}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to load match');
        }
        
        const data = await response.json();
        setMatchData(data);
        
        // Initialize games based on match format
        const format = data.config?.matchFormat || 'single';
        const initialGames = format === 'best-of-5' ? 3 : format === 'best-of-3' ? 2 : 1;
        setGames(Array(initialGames).fill(null).map(() => ({ team1: 0, team2: 0 })));
        
      } catch (error) {
        console.error('[Quick Recorder] Load error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load match data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMatch();
  }, [serial]);

  const addGame = () => {
    setGames([...games, { team1: 0, team2: 0 }]);
  };

  const removeGame = (index: number) => {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index));
    }
  };

  const updateScore = (gameIndex: number, team: 'team1' | 'team2', value: string) => {
    const score = parseInt(value) || 0;
    const newGames = [...games];
    newGames[gameIndex] = { ...newGames[gameIndex], [team]: score };
    setGames(newGames);
  };

  const calculateWinningTeam = () => {
    let team1Wins = 0;
    let team2Wins = 0;
    
    games.forEach(game => {
      if (game.team1 > game.team2) team1Wins++;
      else if (game.team2 > game.team1) team2Wins++;
    });
    
    return team1Wins > team2Wins ? 1 : 2;
  };
  
  const getWinnerPlayerId = () => {
    const winningTeam = calculateWinningTeam();
    const match = matchData?.match;
    
    if (!match) return null;
    
    // Return the player ID of the winning team
    // For singles: playerOneId or playerTwoId
    // For doubles: return team captain (player, not partner) for simplicity
    return winningTeam === 1 ? match.playerOneId : match.playerTwoId;
  };

  const handleSubmit = async () => {
    // Validation
    const hasIncompleteScores = games.some(game => game.team1 === 0 && game.team2 === 0);
    if (hasIncompleteScores) {
      toast({
        title: 'Incomplete Scores',
        description: 'Please enter scores for all games',
        variant: 'destructive'
      });
      return;
    }
    
    // Check for ties - each game must have a winner
    const hasTies = games.some(game => game.team1 === game.team2);
    if (hasTies) {
      toast({
        title: 'Invalid Scores',
        description: 'Each game must have a winner (no ties allowed)',
        variant: 'destructive'
      });
      return;
    }
    
    // Check for overall match tie
    let team1Wins = 0;
    let team2Wins = 0;
    games.forEach(game => {
      if (game.team1 > game.team2) team1Wins++;
      else if (game.team2 > game.team1) team2Wins++;
    });
    
    if (team1Wins === team2Wins) {
      toast({
        title: 'Match Tie Detected',
        description: 'The match cannot end in a tie. Please add another game.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const isDemoSerial = serial?.startsWith('MDEMO') || serial?.startsWith('MTEST');
      
      // For demo mode, simulate success
      if (isDemoSerial) {
        const demoWinnerId = calculateWinningTeam(); // Use team index for demo
        console.log('[Quick Recorder] Demo submission:', {
          serial,
          games,
          matchDate,
          notes,
          winnerId: demoWinnerId
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
          title: '✅ Demo Match Submitted!',
          description: 'In production, all players would verify this match',
          duration: 3000
        });
        
        // Navigate to demo verification page after delay
        setTimeout(() => {
          navigate(`/match/${serial}/verify`);
        }, 2000);
        return;
      }
      
      // Production mode: get real player ID
      const winnerId = getWinnerPlayerId();
      if (!winnerId) {
        toast({
          title: 'Error',
          description: 'Could not determine winner - please try again',
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }
      
      // Submit to backend API
      const response = await fetch(`/api/matches/${serial}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          games,
          matchDate,
          notes,
          winnerId
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Match Submitted!',
          description: 'Redirecting to verification page...',
          duration: 2000
        });
        
        // Navigate to verification page after short delay
        setTimeout(() => {
          navigate(`/match/${serial}/verify`);
        }, 2000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('[Quick Recorder] Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit match',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Match Not Found</h2>
          <p className="text-slate-400 mb-6">Could not load match data</p>
          <Button onClick={() => navigate('/match-arena')} className="bg-orange-500 hover:bg-orange-600">
            <Home className="h-4 w-4 mr-2" />
            Back to Lobby
          </Button>
        </Card>
      </div>
    );
  }

  const match = matchData.match;
  const config = matchData.config;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/match-arena')}
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Quick Match Recorder</h1>
          </div>
          <p className="text-slate-400">Enter final scores - done in 30 seconds</p>
          <p className="text-sm text-slate-500 mt-1">Match ID: {serial}</p>
        </motion.div>

        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-4">Match Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Format:</span>
              <span className="text-white font-medium">{config?.matchFormat || 'Single Game'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Scoring:</span>
              <span className="text-white font-medium capitalize">{config?.scoringType || 'Traditional'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Points to Win:</span>
              <span className="text-white font-medium">{config?.pointTarget || 11}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Game Scores</h3>
            <Button
              onClick={addGame}
              size="sm"
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Game
            </Button>
          </div>

          <AnimatePresence>
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-4"
              >
                <div className="flex items-center gap-3 bg-slate-700/50 p-4 rounded-lg">
                  <span className="text-slate-400 font-medium min-w-[80px]">Game {index + 1}</span>
                  
                  <Input
                    type="number"
                    value={game.team1}
                    onChange={(e) => updateScore(index, 'team1', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-center text-xl font-bold"
                    placeholder="0"
                    min="0"
                    data-testid={`input-game-${index}-team1`}
                  />
                  
                  <span className="text-slate-500 font-bold">-</span>
                  
                  <Input
                    type="number"
                    value={game.team2}
                    onChange={(e) => updateScore(index, 'team2', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-center text-xl font-bold"
                    placeholder="0"
                    min="0"
                    data-testid={`input-game-${index}-team2`}
                  />
                  
                  {games.length > 1 && (
                    <Button
                      onClick={() => removeGame(index)}
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      data-testid={`button-remove-game-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-4">Match Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Match Date
              </label>
              <Input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-match-date"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Windy conditions, great rallies..."
                className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                maxLength={500}
                data-testid="textarea-notes"
              />
              <p className="text-xs text-slate-500 mt-1">{notes.length}/500 characters</p>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-lg"
          data-testid="button-submit-match"
        >
          {submitting ? (
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
        
        <p className="text-center text-sm text-slate-500 mt-4">
          All players will receive a notification to verify this match
        </p>
      </div>
    </div>
  );
}
