import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MatchCreationWizard } from '@/components/match/MatchCreationWizard';
import { useLocation } from 'wouter';

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

// Import the exact types from the wizard
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

interface TeamIdentity {
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
  teamIdentity?: TeamIdentity;
}

export default function MatchCreate() {
  const [, setLocation] = useLocation();
  const [showWizard, setShowWizard] = useState(false);

  const handleMatchCreated = (matchData: MatchCreationData) => {
    // Generate a unique match ID and store match data
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Transform wizard data to match format and store for recording page
    const player1 = matchData.selectedPlayers[0];
    const player2 = matchData.selectedPlayers[1];
    
    const matchInfo = {
      id: matchId,
      player1: {
        name: player1.firstName || player1.username,
        id: player1.id.toString(),
        tier: 'Competitive' // Default tier, could be enhanced based on ranking points
      },
      player2: {
        name: player2.firstName || player2.username,
        id: player2.id.toString(),
        tier: 'Competitive'
      },
      config: {
        scoringType: 'traditional' as const,
        pointTarget: 11 as const,
        matchFormat: 'single' as const,
        winByTwo: true
      },
      createdAt: new Date().toISOString(),
      rawWizardData: matchData
    };
    
    sessionStorage.setItem('currentMatch', JSON.stringify(matchInfo));
    
    // Navigate to the recording page
    setLocation(`/match/record/${matchId}`);
  };

  const goBackToPrototype = () => {
    setLocation('/unified-prototype');
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowWizard(false)}
              className="text-white hover:text-orange-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Setup
            </Button>
          </div>
          
          <MatchCreationWizard 
            onMatchCreated={handleMatchCreated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={goBackToPrototype}
            className="text-white hover:text-orange-400 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prototype
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Create New Match
            </h1>
            <p className="text-slate-300 text-lg">
              Set up your epic pickleball battle
            </p>
          </motion.div>
        </div>

        {/* Main Setup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 bg-slate-800/80 border-slate-600 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Gamepad2 className="h-10 w-10 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ready to Record?
                </h2>
                <p className="text-slate-300">
                  Configure your match settings, select players, and jump into the arena for live scoring with momentum tracking and gaming animations.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => setShowWizard(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg py-3"
                >
                  Start Match Setup
                </Button>
                
                <div className="text-sm text-slate-400">
                  <p>✨ Features included:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Real-time momentum tracking</li>
                    <li>Gaming-style reactions and achievements</li>
                    <li>Strategic message system</li>
                    <li>Video recording integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}