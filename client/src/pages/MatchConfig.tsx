import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Gamepad2,
  CheckCircle,
  Camera,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VersusScreen } from '@/components/match/VersusScreen';
import { PulsingScoreButton } from '@/components/match/PulsingScoreButton';

// Match Configuration Interface
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

  const goBackToPrototype = () => {
    navigate('/match-arena');
  };

  const startMatch = () => {
    // Save configuration to sessionStorage for GamifiedMatchRecording to read
    sessionStorage.setItem('pkl:matchConfig', JSON.stringify(config));
    
    // Save scoring preference to localStorage
    localStorage.setItem('pkl:lastScoringMode', config.scoringType);
    
    // Navigate to point-by-point recording
    navigate('/gamified-match-recording');
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
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
            size="lg"
            data-testid="button-start-match"
          >
            <Zap className="h-5 w-5 mr-2" />
            Start Match
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
