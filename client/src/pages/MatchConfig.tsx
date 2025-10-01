import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Gamepad2,
  CheckCircle,
  Camera,
  Zap,
  ArrowLeft,
  PlayCircle,
  Video,
  Users,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VersusScreen } from '@/components/match/VersusScreen';
import { PulsingScoreButton } from '@/components/match/PulsingScoreButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Match Configuration Interface
interface MatchConfig {
  scoringType: 'traditional' | 'rally';
  pointTarget: 11 | 15 | 21;
  matchFormat: 'single' | 'best-of-3' | 'best-of-5';
  winByTwo: boolean;
  recordingMode?: 'live' | 'quick' | 'coaching';
  liveStreamUrl?: string;
  recordingUrl?: string;
  videoProvider?: 'hls' | 'mp4' | 'youtube' | 'vimeo';
  videoSyncOffset?: number;
}

// Get random team theme
function getRandomTeamTheme() {
  const themes = [
    { team1: { name: 'Thunderbolts', color: '#3b82f6' }, team2: { name: 'Firestorm', color: '#ef4444' } },
    { team1: { name: 'Ice Warriors', color: '#06b6d4' }, team2: { name: 'Blaze', color: '#f97316' } },
    { team1: { name: 'Storm', color: '#8b5cf6' }, team2: { name: 'Lightning', color: '#eab308' } }
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

export default function MatchConfig() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Challenge-specific state
  const [challengeData, setChallengeData] = useState<any>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [isChallenge, setIsChallenge] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [playerReadyStatus, setPlayerReadyStatus] = useState<Record<number, boolean>>({});
  const [confirmedCount, setConfirmedCount] = useState(0);

  // Get player data from session storage
  const getInitialPlayerData = () => {
    try {
      const currentMatch = sessionStorage.getItem('currentMatch');
      if (currentMatch) {
        const matchData = JSON.parse(currentMatch);
        console.log('MatchConfig - Raw match data:', matchData);
        
        // Priority 1: Handle pairings format (doubles matches)
        if (matchData.pairings && matchData.pairings.team1 && matchData.pairings.team2) {
          const player1Data = matchData.pairings.team1[0];
          const player2Data = matchData.pairings.team2[0];
          
          if (player1Data && player2Data) {
            console.log('MatchConfig - Using pairings format (doubles)');
            return {
              player1: {
                id: player1Data.id || 'player1',
                name: player1Data.displayName || player1Data.username || 'Player 1',
                displayName: player1Data.displayName || player1Data.username || 'Player 1',
                passportCode: player1Data.passportCode || 'NO-CODE',
                rankingPoints: player1Data.rankingPoints || 0
              },
              player2: {
                id: player2Data.id || 'player2', 
                name: player2Data.displayName || player2Data.username || 'Player 2',
                displayName: player2Data.displayName || player2Data.username || 'Player 2',
                passportCode: player2Data.passportCode || 'NO-CODE',
                rankingPoints: player2Data.rankingPoints || 0
              }
            };
          }
        }
        
        // Priority 2: Handle selectedPlayers format (singles matches - opponent is in array)
        if (matchData.selectedPlayers && matchData.selectedPlayers.length > 0) {
          const opponentData = matchData.selectedPlayers[0];
          console.log('MatchConfig - Using selectedPlayers format (singles)');
          return {
            player1: {
              id: 'current-user',
              name: 'You',
              displayName: 'You',
              passportCode: 'YOUR-CODE',
              rankingPoints: 1000
            },
            player2: {
              id: opponentData.id || 'player2',
              name: opponentData.displayName || opponentData.username || 'Opponent',
              displayName: opponentData.displayName || opponentData.username || 'Opponent',
              passportCode: opponentData.passportCode || 'NO-CODE',
              rankingPoints: opponentData.rankingPoints || 0
            }
          };
        }
        
        // Priority 3: Handle direct player1/player2 format (challenges)
        if (matchData.player1 && matchData.player2) {
          console.log('MatchConfig - Using direct player format (challenge)');
          return {
            player1: {
              id: matchData.player1.id || 'player1',
              name: matchData.player1.displayName || matchData.player1.username || matchData.player1.name || 'Player 1',
              displayName: matchData.player1.displayName || matchData.player1.username || matchData.player1.name || 'Player 1',
              passportCode: matchData.player1.passportCode || 'NO-CODE',
              rankingPoints: matchData.player1.rankingPoints || 0
            },
            player2: {
              id: matchData.player2.id || 'player2',
              name: matchData.player2.displayName || matchData.player2.username || matchData.player2.name || 'Player 2',
              displayName: matchData.player2.displayName || matchData.player2.username || matchData.player2.name || 'Player 2',
              passportCode: matchData.player2.passportCode || 'NO-CODE',
              rankingPoints: matchData.player2.rankingPoints || 0
            }
          };
        }
      }
    } catch (error) {
      console.error('MatchConfig - Error loading player data:', error);
    }
    
    // Fallback to defaults
    console.warn('MatchConfig - Using fallback demo data');
    return {
      player1: { 
        id: '1', 
        name: 'Player 1', 
        displayName: 'Player 1', 
        passportCode: 'DEMO-001',
        rankingPoints: 1200
      },
      player2: { 
        id: '2', 
        name: 'Player 2', 
        displayName: 'Player 2', 
        passportCode: 'DEMO-002',
        rankingPoints: 950
      }
    };
  };

  const playerData = getInitialPlayerData();
  console.log('MatchConfig - Final player data:', playerData);

  // Get team theme from session storage or generate a fixed one
  const [teamTheme] = useState(() => {
    try {
      const currentMatch = sessionStorage.getItem('currentMatch');
      if (currentMatch) {
        const matchData = JSON.parse(currentMatch);
        if (matchData.teamIdentity) {
          return {
            team1: { name: matchData.teamIdentity.team1.name, color: matchData.teamIdentity.team1.color },
            team2: { name: matchData.teamIdentity.team2.name, color: matchData.teamIdentity.team2.color }
          };
        }
      }
    } catch (error) {
      console.log('Could not load team theme from session storage:', error);
    }
    return getRandomTeamTheme();
  });

  // Get default scoring system
  const getScoringSystem = (): 'traditional' | 'rally' => {
    // Priority 1: Check URL params (explicit user choice)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const scoringParam = urlParams.get('scoring');
      if (scoringParam === 'traditional' || scoringParam === 'rally') {
        console.log('Scoring system from URL:', scoringParam);
        return scoringParam;
      }
    } catch (error) {
      console.log('Could not read scoring system from URL:', error);
    }

    // Priority 2: Check sessionStorage for match data (from MatchArena)
    try {
      const currentMatch = sessionStorage.getItem('currentMatch');
      if (currentMatch) {
        const matchData = JSON.parse(currentMatch);
        if (matchData.scoringSystem === 'traditional' || matchData.scoringSystem === 'rally') {
          console.log('Scoring system from match data:', matchData.scoringSystem);
          return matchData.scoringSystem;
        }
      }
    } catch (error) {
      console.log('Could not read scoring system from match data:', error);
    }

    // Priority 3: Check localStorage (last used preference)
    try {
      const lastScoringMode = localStorage.getItem('pkl:lastScoringMode');
      if (lastScoringMode === 'traditional' || lastScoringMode === 'rally') {
        console.log('Scoring system from localStorage:', lastScoringMode);
        return lastScoringMode;
      }
    } catch (error) {
      console.log('Could not load scoring system from localStorage:', error);
    }

    // Default to traditional scoring (standard pickleball rules)
    console.log('Scoring system defaulting to: traditional');
    return 'traditional';
  };

  // Initialize configuration state
  const [config, setConfig] = useState<MatchConfig>({
    scoringType: getScoringSystem(),
    pointTarget: 11,
    matchFormat: 'best-of-3',
    winByTwo: true
  });

  // Load challenge data if challenge parameter exists
  useEffect(() => {
    const loadChallengeData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const challengeIdParam = urlParams.get('challenge');
        
        if (!challengeIdParam) {
          setIsChallenge(false);
          return;
        }

        const parsedChallengeId = parseInt(challengeIdParam);
        if (isNaN(parsedChallengeId)) {
          console.error('[MatchConfig] Invalid challenge ID');
          setIsChallenge(false);
          return;
        }

        setIsChallenge(true);
        setChallengeId(parsedChallengeId);
        setIsLoadingChallenge(true);

        // Fetch challenge data from API
        const response = await apiRequest(`/api/challenges/${parsedChallengeId}`, 'GET');
        
        if (!response) {
          toast({
            title: "Challenge Not Found",
            description: "This challenge doesn't exist or has expired.",
            variant: "destructive"
          });
          navigate('/unified-prototype');
          return;
        }

        setChallengeData(response);

        // Write challenge data to sessionStorage in expected format
        const matchData = {
          source: 'challenge',
          challengeId: response.id,
          matchType: response.matchType,
          player1: response.challenger,
          player2: response.challenged,
        };

        // Add partners if doubles/mixed
        if (response.matchType === 'doubles' || response.matchType === 'mixed') {
          matchData.pairings = {
            team1: [response.challenger, response.challengerPartner],
            team2: [response.challenged, response.challengedPartner]
          };
        }

        sessionStorage.setItem('currentMatch', JSON.stringify(matchData));
        console.log('[MatchConfig] Challenge data loaded:', matchData);

        // Initialize player ready status
        const initialStatus: Record<number, boolean> = {
          [response.challenger.id]: false,
          [response.challenged.id]: false
        };

        if (response.challengerPartner) {
          initialStatus[response.challengerPartner.id] = false;
        }
        if (response.challengedPartner) {
          initialStatus[response.challengedPartner.id] = false;
        }

        setPlayerReadyStatus(initialStatus);

      } catch (error) {
        console.error('[MatchConfig] Error loading challenge:', error);
        toast({
          title: "Error",
          description: "Failed to load challenge data.",
          variant: "destructive"
        });
        navigate('/unified-prototype');
      } finally {
        setIsLoadingChallenge(false);
      }
    };

    loadChallengeData();
  }, []);

  // Update confirmed count when player status changes
  useEffect(() => {
    const count = Object.values(playerReadyStatus).filter(Boolean).length;
    setConfirmedCount(count);
  }, [playerReadyStatus]);

  const goBackToPrototype = () => {
    navigate('/match-arena');
  };

  // Poll for ready status updates
  useEffect(() => {
    if (!isChallenge || !challengeId || !challengeData) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/challenges/${challengeId}/status`, {
          credentials: 'include'
        });

        if (response.ok) {
          const status = await response.json();
          setPlayerReadyStatus({
            [challengeData.challenger.id]: status.challengerReady,
            [challengeData.challenged.id]: status.challengedReady,
            ...(challengeData.challengerPartner ? { [challengeData.challengerPartner.id]: status.challengerPartnerReady } : {}),
            ...(challengeData.challengedPartner ? { [challengeData.challengedPartner.id]: status.challengedPartnerReady } : {})
          });
        }
      } catch (error) {
        console.error('[MatchConfig] Error polling ready status:', error);
      }
    };

    // Poll immediately and then every 2 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    
    return () => clearInterval(interval);
  }, [isChallenge, challengeId, challengeData]);

  // Handle player ready confirmation
  const handleConfirmReady = async () => {
    if (!challengeData || !user || !challengeId) return;

    try {
      const response = await fetch(`/api/challenges/${challengeId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ready: true })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state immediately for instant feedback
        setPlayerReadyStatus(prev => ({
          ...prev,
          [user.id]: true
        }));

        toast({
          title: "Ready to Play ✓",
          description: result.allReady 
            ? "All players ready! Match starting soon..." 
            : "Waiting for other players to confirm...",
          duration: 3000,
        });
      } else {
        throw new Error('Failed to confirm ready');
      }

    } catch (error) {
      console.error('[MatchConfig] Error confirming ready:', error);
      toast({
        title: "Error",
        description: "Failed to confirm ready status.",
        variant: "destructive"
      });
    }
  };

  // Check if current user is the initiating player (challenger)
  const isInitiatingPlayer = isChallenge && user && challengeData && user.id === challengeData.challenger.id;
  
  // Check if current user has confirmed ready
  const currentUserConfirmed = user ? playerReadyStatus[user.id] || false : false;

  const startMatch = async () => {
    if (!config.recordingMode) {
      console.error('No recording mode selected');
      return;
    }

    // Save configuration to sessionStorage for all modes
    sessionStorage.setItem('pkl:matchConfig', JSON.stringify(config));
    
    // Save scoring preference to localStorage
    localStorage.setItem('pkl:lastScoringMode', config.scoringType);

    try {
      // Try to create match with backend API
      const response = await fetch('/api/matches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mode: config.recordingMode,
          config,
          players: playerData
        })
      });
      
      if (response.ok) {
        const { serial, mode } = await response.json();
        console.log('[Match Created]', { serial, mode });
        
        // Navigate to unique match URL
        navigate(`/match/${serial}/${mode}`);
        return;
      }
      
      // If 401 (not logged in), generate demo serial for testing
      if (response.status === 401) {
        console.log('[Match Creation] Not logged in - using demo serial for testing');
        const demoSerial = `MDEMO${Date.now().toString().slice(-8)}`;
        console.log('[Demo Match]', { serial: demoSerial, mode: config.recordingMode });
        
        // Navigate to unique match URL with demo serial
        navigate(`/match/${demoSerial}/${config.recordingMode}`);
        return;
      }
      
      throw new Error('Failed to create match');
      
    } catch (error) {
      console.error('[Match Creation Error]', error);
      // Final fallback: generate client-side serial
      const fallbackSerial = `MTEST${Date.now().toString().slice(-8)}`;
      console.log('[Fallback Match]', { serial: fallbackSerial, mode: config.recordingMode });
      navigate(`/match/${fallbackSerial}/${config.recordingMode}`);
    }
  };

  // Loading screen while fetching challenge data
  if (isLoadingChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="p-8 bg-slate-800 border-slate-700">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-orange-400 animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">Loading Challenge</h2>
              <p className="text-slate-400 text-sm">Fetching match details...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Waiting screen for non-initiating players
  if (isChallenge && !isInitiatingPlayer && challengeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 bg-slate-800 border-slate-700">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-orange-500/20 rounded-full">
                  <Users className="h-12 w-12 text-orange-400" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Match Setup in Progress</h2>
                <p className="text-slate-300 mb-4">
                  Waiting for <span className="text-orange-400 font-semibold">{challengeData.challenger.displayName || challengeData.challenger.username}</span> to set match parameters...
                </p>
                <p className="text-sm text-slate-400">
                  You'll be notified when it's time to confirm your readiness
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Please wait...</span>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/unified-prototype')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
            
            {/* Compact Versus Preview */}
            <div className="mt-6 -mx-6">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 border-y border-slate-700">
                <div className="flex items-center justify-between gap-4">
                  {/* Team 1 */}
                  <div className="flex-1 text-left">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: `${teamTheme.team1.color}20`,
                        borderLeft: `3px solid ${teamTheme.team1.color}`
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: teamTheme.team1.color }}
                      >
                        {playerData.player1.displayName?.charAt(0) || playerData.player1.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">
                          {playerData.player1.displayName || playerData.player1.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {playerData.player1.passportCode}
                        </div>
                        <div className="text-xs" style={{ color: teamTheme.team1.color }}>
                          {playerData.player1.rankingPoints} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VS Badge */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg px-4 py-2 rounded-lg shadow-lg transform rotate-3">
                      VS
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex-1 text-right">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: `${teamTheme.team2.color}20`,
                        borderRight: `3px solid ${teamTheme.team2.color}`
                      }}
                    >
                      <div>
                        <div className="text-white font-bold text-sm">
                          {playerData.player2.displayName || playerData.player2.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {playerData.player2.passportCode}
                        </div>
                        <div className="text-xs" style={{ color: teamTheme.team2.color }}>
                          {playerData.player2.rankingPoints} pts
                        </div>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: teamTheme.team2.color }}
                      >
                        {playerData.player2.displayName?.charAt(0) || playerData.player2.name?.charAt(0) || 'P'}
                      </div>
                    </div>
                  </div>
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
                  onClick={() => setConfig(prev => ({ ...prev, scoringType: 'traditional' }))}
                  variant={config.scoringType === 'traditional' ? 'winning' : 'default'}
                >
                  <div className="text-center">
                    <div className="font-bold">Traditional</div>
                    <div className="text-xs opacity-75">Side-out</div>
                  </div>
                </PulsingScoreButton>
                <PulsingScoreButton
                  onClick={() => setConfig(prev => ({ ...prev, scoringType: 'rally' }))}
                  variant={config.scoringType === 'rally' ? 'winning' : 'default'}
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
                    onClick={() => setConfig(prev => ({ ...prev, pointTarget: points }))}
                    variant={config.pointTarget === points ? 'winning' : 'default'}
                  >
                    {points}
                  </PulsingScoreButton>
                ))}
              </div>
              {config.scoringType === 'rally' && config.pointTarget === 11 && (
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
                    onClick={() => setConfig(prev => ({ ...prev, matchFormat: format.value }))}
                    variant={config.matchFormat === format.value ? 'winning' : 'default'}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-bold">{format.label}</div>
                        <div className="text-xs opacity-75">{format.desc}</div>
                      </div>
                      {config.matchFormat === format.value && (
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
                onClick={() => setConfig(prev => ({ ...prev, winByTwo: !prev.winByTwo }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.winByTwo ? 'bg-orange-500' : 'bg-slate-600'
                }`}
              >
                <motion.div
                  animate={{ x: config.winByTwo ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Recording Mode Selection - CENTRAL FORK */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="text-sm text-slate-300 font-semibold block">
                How do you want to record this match?
              </label>
              
              {/* Live Score Tracker */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfig(prev => ({ ...prev, recordingMode: 'live' }))}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  config.recordingMode === 'live' 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    config.recordingMode === 'live' ? 'bg-blue-500' : 'bg-slate-600'
                  }`}>
                    <PlayCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">Live Score Tracker</h3>
                      {config.recordingMode === 'live' && (
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-300">
                      Track every point in real-time with momentum visualization
                    </p>
                    <span className="text-xs text-slate-400 mt-1 inline-block">
                      ⏱️ During the match
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Quick Match Recorder */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfig(prev => ({ ...prev, recordingMode: 'quick' }))}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  config.recordingMode === 'quick' 
                    ? 'border-green-500 bg-green-500/20' 
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    config.recordingMode === 'quick' ? 'bg-green-500' : 'bg-slate-600'
                  }`}>
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">Quick Match Recorder</h3>
                      {config.recordingMode === 'quick' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-300">
                      Just enter the final scores - done in 30 seconds
                    </p>
                    <span className="text-xs text-slate-400 mt-1 inline-block">
                      ⚡ After the match
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Coaching Analysis */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfig(prev => ({ ...prev, recordingMode: 'coaching' }))}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  config.recordingMode === 'coaching' 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    config.recordingMode === 'coaching' ? 'bg-purple-500' : 'bg-slate-600'
                  }`}>
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">Coaching Analysis</h3>
                      {config.recordingMode === 'coaching' && (
                        <CheckCircle className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-300">
                      Upload video and analyze shot-by-shot with coaching notes
                    </p>
                    <span className="text-xs text-slate-400 mt-1 inline-block">
                      🎓 Coach/Training mode
                    </span>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Gaming Lobby - Player Ready Check (Challenge Only) */}
            {isChallenge && config.recordingMode && challengeData && (
              <div className="space-y-3 pt-6 border-t border-orange-500/30">
                <label className="text-sm text-orange-400 font-semibold block flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Player Confirmation
                </label>
                
                {/* 4-Player Status Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Challenger */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    playerReadyStatus[challengeData.challenger.id]
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-slate-600 bg-slate-800/50 opacity-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {playerReadyStatus[challengeData.challenger.id] ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-500 animate-pulse" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">
                          {challengeData.challenger.displayName || challengeData.challenger.username}
                        </div>
                        <div className="text-xs text-slate-400">
                          {playerReadyStatus[challengeData.challenger.id] ? 'Ready' : 'Waiting...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenged */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    playerReadyStatus[challengeData.challenged.id]
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-slate-600 bg-slate-800/50 opacity-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {playerReadyStatus[challengeData.challenged.id] ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-500 animate-pulse" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm">
                          {challengeData.challenged.displayName || challengeData.challenged.username}
                        </div>
                        <div className="text-xs text-slate-400">
                          {playerReadyStatus[challengeData.challenged.id] ? 'Ready' : 'Waiting...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenger Partner (if doubles/mixed) */}
                  {challengeData.challengerPartner && (
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      playerReadyStatus[challengeData.challengerPartner.id]
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-slate-600 bg-slate-800/50 opacity-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {playerReadyStatus[challengeData.challengerPartner.id] ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-500 animate-pulse" />
                        )}
                        <div>
                          <div className="text-white font-medium text-sm">
                            {challengeData.challengerPartner.displayName || challengeData.challengerPartner.username}
                          </div>
                          <div className="text-xs text-slate-400">
                            {playerReadyStatus[challengeData.challengerPartner.id] ? 'Ready' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Challenged Partner (if doubles/mixed) */}
                  {challengeData.challengedPartner && (
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      playerReadyStatus[challengeData.challengedPartner.id]
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-slate-600 bg-slate-800/50 opacity-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {playerReadyStatus[challengeData.challengedPartner.id] ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-500 animate-pulse" />
                        )}
                        <div>
                          <div className="text-white font-medium text-sm">
                            {challengeData.challengedPartner.displayName || challengeData.challengedPartner.username}
                          </div>
                          <div className="text-xs text-slate-400">
                            {playerReadyStatus[challengeData.challengedPartner.id] ? 'Ready' : 'Waiting...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Current User Confirm Button */}
                {!currentUserConfirmed && (
                  <Button 
                    onClick={handleConfirmReady}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
                    data-testid="confirm-ready-button"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I'm Ready to Play
                  </Button>
                )}
                
                {/* Status Message */}
                <div className="text-center">
                  <p className="text-sm text-slate-400">
                    {confirmedCount === Object.keys(playerReadyStatus).length ? (
                      <span className="text-green-400 font-semibold">All players ready!</span>
                    ) : (
                      <span>{confirmedCount}/{Object.keys(playerReadyStatus).length} players confirmed</span>
                    )}
                  </p>
                </div>
              </div>
            )}

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
                    value={config.liveStreamUrl || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      liveStreamUrl: e.target.value,
                      videoProvider: e.target.value ? 'hls' : undefined
                    }))}
                    placeholder="https://stream.example.com/live.m3u8"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  {config.liveStreamUrl && (
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
                  value={config.recordingUrl || ''}
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
                    
                    setConfig(prev => ({ 
                      ...prev, 
                      recordingUrl: url,
                      videoProvider: provider
                    }));
                  }}
                  placeholder="YouTube, Vimeo, or MP4 URL"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                {config.recordingUrl && (
                  <div className="text-xs text-slate-500">
                    Detected: {config.videoProvider === 'youtube' ? 'YouTube' : 
                              config.videoProvider === 'vimeo' ? 'Vimeo' : 
                              config.videoProvider === 'mp4' ? 'MP4 Video' : 'Unknown format'}
                  </div>
                )}
              </div>

              {/* Video Sync Offset */}
              {(config.liveStreamUrl || config.recordingUrl) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-500">Video Sync Offset</label>
                    <span className="text-xs text-slate-400">{config.videoSyncOffset || 0}s</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="0.5"
                    value={config.videoSyncOffset || 0}
                    onChange={(e) => setConfig(prev => ({ 
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
            disabled={
              !config.recordingMode || 
              (isChallenge && (isLoadingChallenge || !challengeData || Object.keys(playerReadyStatus).length === 0 || confirmedCount !== Object.keys(playerReadyStatus).length))
            }
            className={`w-full mt-6 font-bold py-3 ${
              config.recordingMode && (!isChallenge || (challengeData && Object.keys(playerReadyStatus).length > 0 && confirmedCount === Object.keys(playerReadyStatus).length))
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
            size="lg"
            data-testid="button-start-match"
          >
            {config.recordingMode === 'live' && (
              <>
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Live Tracking
              </>
            )}
            {config.recordingMode === 'quick' && (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Quick Entry
              </>
            )}
            {config.recordingMode === 'coaching' && (
              <>
                <Video className="h-5 w-5 mr-2" />
                Start Analysis
              </>
            )}
            {!config.recordingMode && (
              <>
                <Gamepad2 className="h-5 w-5 mr-2" />
                Select Recording Mode
              </>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
