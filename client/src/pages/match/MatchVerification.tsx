import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, XCircle, AlertCircle, Trophy, Clock, Calendar, Users 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationData {
  match: any;
  verifications: any[];
  config: any;
  scores: {
    games: Array<{ gameNumber: number; team1: number; team2: number }>;
    notes?: string;
  };
}

export default function MatchVerification() {
  const { serial } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<VerificationData | null>(null);
  const [currentVerification, setCurrentVerification] = useState<any>(null);

  useEffect(() => {
    loadVerificationData();
  }, [serial]);

  const loadVerificationData = async () => {
    try {
      const response = await fetch(`/api/matches/${serial}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to load match');
      
      const matchData = await response.json();
      
      // Parse scores from notes
      let scores: { games: any[]; notes?: string } = { games: [] };
      try {
        const notes = JSON.parse(matchData.match.notes || '{}');
        scores = { games: notes.games || [], notes: notes.submittedNotes };
      } catch {}
      
      setData({ ...matchData, scores });
      
      // Find current user's verification
      const userResponse = await fetch('/api/auth/current-user', {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const user = await userResponse.json();
        const userVerification = matchData.verifications.find((v: any) => v.userId === user.id);
        setCurrentVerification(userVerification);
      }
      
    } catch (error) {
      console.error('[Verification] Load error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approve: boolean) => {
    if (!data) return;
    
    setProcessing(true);
    
    try {
      const response = await fetch(`/api/matches/${serial}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ approve })
      });
      
      if (response.ok) {
        toast({
          title: approve ? '✅ Match Approved!' : '❌ Match Rejected',
          description: approve 
            ? 'Thank you for verifying the match scores' 
            : 'Match scores have been rejected',
          duration: 3000
        });
        
        // Refresh data
        await loadVerificationData();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('[Verification] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process verification',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading match verification...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Match Not Found</h2>
          <p className="text-slate-400 mb-6">Could not load verification data</p>
          <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isAlreadyVerified = currentVerification?.status === 'verified';
  const isRejected = currentVerification?.status === 'rejected';
  const allVerified = data.verifications.every(v => v.status === 'verified');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Match Verification</h1>
          <p className="text-slate-400">Review and approve the match scores</p>
          <p className="text-sm text-slate-500 mt-1">Match ID: {serial}</p>
        </motion.div>

        {allVerified && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-6 bg-green-500/10 border-green-500 flex items-center gap-4">
              <Trophy className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-green-400">Match Verified!</h3>
                <p className="text-sm text-green-300">All players have approved the scores</p>
              </div>
            </Card>
          </motion.div>
        )}

        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Match Scores
          </h3>
          
          <div className="space-y-3">
            {data.scores.games.map((game) => (
              <div 
                key={game.gameNumber}
                className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg"
              >
                <span className="text-slate-400 font-medium">Game {game.gameNumber}</span>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-white">{game.team1}</span>
                  <span className="text-slate-500">-</span>
                  <span className="text-2xl font-bold text-white">{game.team2}</span>
                </div>
              </div>
            ))}
          </div>

          {data.scores.notes && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-sm text-slate-400 mb-1">Match Notes:</p>
              <p className="text-white">{data.scores.notes}</p>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Verification Status
          </h3>
          
          <div className="space-y-3">
            {data.verifications.map((verification) => (
              <div 
                key={verification.id}
                className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg"
              >
                <span className="text-white">Player {verification.userId}</span>
                <div className="flex items-center gap-2">
                  {verification.status === 'verified' && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-green-400">Verified</span>
                    </>
                  )}
                  {verification.status === 'rejected' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-red-400">Rejected</span>
                    </>
                  )}
                  {verification.status === 'pending' && (
                    <>
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400">Pending</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {!isAlreadyVerified && !isRejected && (
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="text-white font-semibold mb-4">Your Action Required</h3>
            <p className="text-slate-400 mb-6">
              Please review the match scores above and confirm they are accurate.
            </p>
            
            <div className="flex gap-4">
              <Button
                onClick={() => handleVerify(true)}
                disabled={processing}
                className="flex-1 bg-green-500 hover:bg-green-600"
                data-testid="button-approve-match"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Approve Scores
              </Button>
              
              <Button
                onClick={() => handleVerify(false)}
                disabled={processing}
                variant="outline"
                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                data-testid="button-reject-match"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Scores
              </Button>
            </div>
          </Card>
        )}

        {(isAlreadyVerified || isRejected) && (
          <Card className="p-6 bg-slate-800 border-slate-700 text-center">
            <p className="text-slate-400">
              {isAlreadyVerified && 'You have already verified this match'}
              {isRejected && 'You have rejected this match'}
            </p>
            <Button onClick={() => navigate('/')} className="mt-4 bg-orange-500 hover:bg-orange-600">
              Back to Home
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
