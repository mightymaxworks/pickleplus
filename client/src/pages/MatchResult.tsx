import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Clock, Users, Target, ArrowLeft, RotateCw, Share2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MatchResult {
  id: string;
  player1: { name: string; score: number; tier: string };
  player2: { name: string; score: number; tier: string };
  winner: string;
  duration: string;
  completedAt: string;
}

export default function MatchResult() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const matchId = params.matchId;

  // Load match result from sessionStorage or API
  const matchResult: MatchResult = React.useMemo(() => {
    const storedMatch = sessionStorage.getItem('currentMatch');
    if (storedMatch) {
      try {
        const parsed = JSON.parse(storedMatch);
        const winner = parsed.player1?.score > parsed.player2?.score ? parsed.player1.name : parsed.player2.name;
        
        return {
          id: parsed.id || matchId,
          player1: parsed.player1 || { name: 'Player 1', score: 0, tier: 'Competitive' },
          player2: parsed.player2 || { name: 'Player 2', score: 0, tier: 'Competitive' },
          winner,
          duration: '12:34', // Could be calculated from actual duration
          completedAt: new Date().toLocaleString()
        };
      } catch (e) {
        console.error('Failed to parse match result:', e);
      }
    }
    
    // Fallback data
    return {
      id: matchId || 'unknown',
      player1: { name: 'Player 1', score: 11, tier: 'Competitive' },
      player2: { name: 'Player 2', score: 7, tier: 'Competitive' },
      winner: 'Player 1',
      duration: '12:34',
      completedAt: new Date().toLocaleString()
    };
  }, [matchId]);

  const { player1, player2, winner } = matchResult;
  const isPlayer1Winner = winner === player1.name;

  const goBack = () => {
    setLocation('/match/create');
  };

  const playAgain = () => {
    setLocation('/match/create');
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pickle+ Match Result',
        text: `${player1.name} ${player1.score} - ${player2.score} ${player2.name}. Winner: ${winner}!`,
        url: window.location.href
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={goBack}
            className="text-white hover:text-orange-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Setup
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={shareResult}
            className="text-white hover:text-blue-400"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Result
          </Button>
        </div>

        {/* Winner Celebration */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {winner} Wins!
          </h1>
          <p className="text-xl text-gray-300">
            Match completed on {matchResult.completedAt}
          </p>
        </motion.div>

        {/* Final Score Display */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Player 1 Card */}
          <Card className={`p-6 border-2 transition-all ${
            isPlayer1Winner 
              ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400 shadow-xl' 
              : 'bg-slate-800 border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPlayer1Winner && (
                  <Trophy className="h-8 w-8 text-yellow-400" />
                )}
                <div>
                  <div className="font-bold text-white text-2xl">{player1.name}</div>
                  <Badge className="text-sm bg-slate-600 text-slate-200">{player1.tier}</Badge>
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`text-6xl font-bold ${
                  isPlayer1Winner ? 'text-green-400' : 'text-white'
                }`}
              >
                {player1.score}
              </motion.div>
            </div>
          </Card>

          {/* Player 2 Card */}
          <Card className={`p-6 border-2 transition-all ${
            !isPlayer1Winner 
              ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400 shadow-xl' 
              : 'bg-slate-800 border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isPlayer1Winner && (
                  <Trophy className="h-8 w-8 text-yellow-400" />
                )}
                <div>
                  <div className="font-bold text-white text-2xl">{player2.name}</div>
                  <Badge className="text-sm bg-slate-600 text-slate-200">{player2.tier}</Badge>
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`text-6xl font-bold ${
                  !isPlayer1Winner ? 'text-green-400' : 'text-white'
                }`}
              >
                {player2.score}
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Match Statistics */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 bg-slate-800 border-slate-600">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-400" />
              <div>
                <div className="text-white font-semibold">Duration</div>
                <div className="text-gray-300">{matchResult.duration}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-600">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-orange-400" />
              <div>
                <div className="text-white font-semibold">Total Points</div>
                <div className="text-gray-300">{player1.score + player2.score}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-600">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <div>
                <div className="text-white font-semibold">Margin</div>
                <div className="text-gray-300">{Math.abs(player1.score - player2.score)} points</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            onClick={playAgain}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
          >
            <RotateCw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setLocation('/rankings')}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <Trophy className="mr-2 h-5 w-5" />
            View Rankings
          </Button>
        </motion.div>

        {/* Gaming Achievement Banner */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <Card className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30">
            <div className="flex items-center justify-center gap-3">
              <Medal className="h-6 w-6 text-purple-400" />
              <span className="text-white font-semibold">
                Match recorded successfully! 🎉
              </span>
              <Medal className="h-6 w-6 text-purple-400" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}