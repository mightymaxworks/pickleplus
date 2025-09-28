import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, UserCheck, UserMinus, Trophy, Gamepad2, 
  ArrowRight, ArrowLeft, Shuffle, CheckCircle2, Target,
  Hash, User, Crown, Star, Zap
} from 'lucide-react';
import { SmartPlayerSearch } from './SmartPlayerSearch';
import { VersusScreen } from './VersusScreen';

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
}

interface MatchCreationWizardProps {
  onMatchCreated: (matchData: MatchCreationData) => void;
}

type WizardStep = 'format' | 'players' | 'pairings' | 'review';

// Pickleball-themed team combinations
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

// Mock recent players (in a real app, this would come from API)
const mockRecentPlayers: Player[] = [
  {
    id: 101,
    username: 'alex_chen',
    displayName: 'Alex Chen',
    passportCode: 'HVGN0BW0',
    gender: 'male',
    rankingPoints: 1200,
  },
  {
    id: 102,
    username: 'sarah_j',
    displayName: 'Sarah Johnson',
    passportCode: 'KGLE38K4',
    gender: 'female',
    rankingPoints: 980,
  },
  {
    id: 103,
    username: 'mike_torres',
    displayName: 'Mike Torres',
    passportCode: 'PLMN5R7X',
    gender: 'male',
    rankingPoints: 1450,
  },
  {
    id: 104,
    username: 'emma_wilson',
    displayName: 'Emma Wilson',
    passportCode: 'QWER8T9Y',
    gender: 'female',
    rankingPoints: 1100,
  },
  {
    id: 105,
    username: 'david_kim',
    displayName: 'David Kim',
    passportCode: 'ZXCV3B4N',
    gender: 'male',
    rankingPoints: 1320,
  },
  {
    id: 106,
    username: 'lisa_park',
    displayName: 'Lisa Park',
    passportCode: 'ASDF6G7H',
    gender: 'female',
    rankingPoints: 1050,
  },
];

export function MatchCreationWizard({ onMatchCreated }: MatchCreationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>('format');
  const [matchFormat, setMatchFormat] = useState<'singles' | 'doubles'>('singles');
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [pairings, setPairings] = useState<{ team1: Player[]; team2: Player[] } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate random pickleball team theme
  const getRandomTeamTheme = () => {
    return pickleballTeamThemes[Math.floor(Math.random() * pickleballTeamThemes.length)];
  };

  // Generate fun, gamified match analysis 
  const generateMatchAnalysis = () => {
    if (selectedPlayers.length === 0) {
      return { 
        headline: 'Ready for Action! 🎾',
        badges: [],
        insights: ['Select players to unlock match insights'],
        watchFor: []
      };
    }

    const currentUserGender = 'male'; // TODO: Get from actual user data
    const allPlayers = [{ gender: currentUserGender, rankingPoints: 1200 }, ...selectedPlayers];
    const maleCount = allPlayers.filter(p => p.gender === 'male').length;
    const femaleCount = allPlayers.filter(p => p.gender === 'female').length;
    const avgPoints = allPlayers.reduce((sum, p) => sum + (p.rankingPoints || 1000), 0) / allPlayers.length;
    
    // Generate exciting headlines and badges
    const headlines = [];
    const badges = [];
    const insights = [];
    const watchFor = [];

    // Gender mix analysis with pickleball insights
    if (matchFormat === 'doubles' && maleCount > 0 && femaleCount > 0) {
      headlines.push('🎾 Mixed Doubles Magic!');
      badges.push({ icon: '⚡', label: 'Power Balance', tier: 'A' });
      insights.push('Mixed doubles brings strategic variety - expect exciting shot selection!');
      watchFor.push('Cross-court dinks', 'Stacking strategies');
    } else if (matchFormat === 'singles' && selectedPlayers[0]?.gender !== currentUserGender) {
      headlines.push('🎯 Cross-Gender Singles Showdown!');
      badges.push({ icon: '🎪', label: 'Style Clash', tier: 'B' });
      insights.push('Different playing styles about to collide on the court!');
      watchFor.push('Power vs finesse', 'Court positioning');
    } else {
      headlines.push('🔥 Classic Pickleball Battle!');
      badges.push({ icon: '🏆', label: 'Pure Competition', tier: 'S' });
    }

    // Skill level analysis with pickleball-specific insights
    if (avgPoints > 1400) {
      headlines.unshift('👑 Elite Championship Level!');
      badges.push({ icon: '💎', label: 'Pro Tier', tier: 'S' });
      insights.push('Elite players - expect lightning-fast exchanges and perfect shot placement!');
      watchFor.push('Third shot drops', 'Kitchen line battles', 'Advanced footwork');
    } else if (avgPoints > 1000) {
      badges.push({ icon: '🏆', label: 'Competitive', tier: 'A' });
      insights.push('Solid fundamentals will decide this competitive match!');
      watchFor.push('Consistent serves', 'Dink patience', 'Unforced errors');
    } else {
      badges.push({ icon: '🌱', label: 'Developing', tier: 'B' });
      insights.push('Great opportunity to see rapid improvement and learning!');
      watchFor.push('Serve development', 'Shot selection', 'Court positioning');
    }

    // AI-powered pickleball insights based on player data
    const pickleballInsights = [
      'AI predicts: Expect 3+ deuces based on similar skill matchups! 🤖',
      'Scout Note: Both players favor baseline play - kitchen battles likely! 📊',
      'Pattern Analysis: Cross-court dinks could be the deciding factor! 🎯',
      'Momentum Factor: First to adapt their serve will control the match! 🎾',
      'Strategy Alert: Look for early third shot drop attempts! 🎪',
      'Key Insight: Player positioning suggests aggressive net play ahead! ⚡'
    ];
    
    if (Math.random() > 0.3) { // 70% chance to show AI insight
      insights.push(pickleballInsights[Math.floor(Math.random() * pickleballInsights.length)]);
    }

    return {
      headline: headlines[0] || '🎾 Game On!',
      badges: badges.slice(0, 3), // Max 3 badges
      insights: insights.slice(0, 2), // Max 2 insights
      watchFor: watchFor.slice(0, 2) // Max 2 watch-for items
    };
  };

  // Legacy function for compatibility
  const calculateMatchStatus = (): MatchCreationData['matchStatus'] => {
    const analysis = generateMatchAnalysis();
    return { 
      competitiveBalance: 85, 
      genderBonus: 1.0, 
      description: analysis.headline 
    };
  };

  const handlePlayerSelect = (player: Player | null) => {
    if (!player) return;
    
    if (selectedPlayers.find(p => p.id === player.id)) {
      // Remove player if already selected
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
      toast({
        title: 'Player Removed',
        description: `${player.displayName || player.username} removed from match`,
        duration: 2000
      });
    } else if (selectedPlayers.length < (matchFormat === 'singles' ? 1 : 3)) {
      // Add player if under limit
      setSelectedPlayers(prev => [...prev, player]);
      toast({
        title: 'Player Added! 🎾',
        description: `${player.displayName || player.username} added to match`,
        duration: 2000
      });
    } else {
      toast({
        title: 'Team Full',
        description: `Maximum ${matchFormat === 'singles' ? 1 : 3} additional players allowed`,
        duration: 2000
      });
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const player = selectedPlayers.find(p => p.id === playerId);
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
    if (player) {
      toast({
        title: 'Player Removed',
        description: `${player.displayName || player.username} removed from match`,
        duration: 2000
      });
    }
  };

  const handleNextStep = () => {
    setIsAnimating(true);
    
    switch (currentStep) {
      case 'format':
        setCurrentStep('players');
        break;
      case 'players':
        if (matchFormat === 'doubles' && selectedPlayers.length === 3) {
          setCurrentStep('pairings');
        } else {
          setCurrentStep('review');
        }
        break;
      case 'pairings':
        setCurrentStep('review');
        break;
      case 'review':
        const matchData: MatchCreationData = {
          format: matchFormat,
          selectedPlayers,
          pairings: pairings || undefined,
          matchStatus: calculateMatchStatus()
        };
        onMatchCreated(matchData);
        break;
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePreviousStep = () => {
    setIsAnimating(true);
    
    switch (currentStep) {
      case 'players':
        setCurrentStep('format');
        break;
      case 'pairings':
        setCurrentStep('players');
        break;
      case 'review':
        if (matchFormat === 'doubles' && selectedPlayers.length === 3) {
          setCurrentStep('pairings');
        } else {
          setCurrentStep('players');
        }
        break;
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'format':
        return true;
      case 'players':
        return matchFormat === 'singles' ? selectedPlayers.length === 1 : selectedPlayers.length === 3;
      case 'pairings':
        return pairings !== null;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const getStepProgress = () => {
    const steps = ['format', 'players', matchFormat === 'doubles' && selectedPlayers.length === 3 ? 'pairings' : null, 'review'].filter(Boolean);
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div key="match-creation-wizard" className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">🎾 Create New Match</h2>
          <Badge className="bg-orange-500/20 text-orange-300">
            Step {currentStep === 'format' ? 1 : currentStep === 'players' ? 2 : currentStep === 'pairings' ? 3 : 4}
          </Badge>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getStepProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Format Selection */}
        {currentStep === 'format' && (
          <motion.div
            key="format"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-orange-400" />
                Choose Match Format
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={matchFormat === 'singles' ? 'default' : 'outline'}
                  onClick={() => setMatchFormat('singles')}
                  className={`h-20 flex-col gap-2 ${
                    matchFormat === 'singles' 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Target className="h-6 w-6" />
                  <span className="font-medium">Singles</span>
                  <span className="text-xs opacity-75">1 vs 1</span>
                </Button>
                <Button
                  variant={matchFormat === 'doubles' ? 'default' : 'outline'}
                  onClick={() => setMatchFormat('doubles')}
                  className={`h-20 flex-col gap-2 ${
                    matchFormat === 'doubles' 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Users className="h-6 w-6" />
                  <span className="font-medium">Doubles</span>
                  <span className="text-xs opacity-75">2 vs 2</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Player Selection */}
        {currentStep === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-400" />
                Find Players {matchFormat === 'singles' ? '(1 needed)' : '(3 needed)'}
              </h3>
              
              <div className="space-y-4">
                {/* Recent Players Quick Selection */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-400" />
                    Recent Opponents (Quick Select)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mockRecentPlayers.slice(0, 6).map((player) => (
                      <Button
                        key={player.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayerSelect(player)}
                        disabled={selectedPlayers.some(p => p.id === player.id)}
                        className={`h-auto p-3 flex flex-col gap-1 ${
                          selectedPlayers.some(p => p.id === player.id)
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {(player.displayName || player.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium truncate">
                          {player.displayName || player.username}
                        </span>
                        <span className="text-xs opacity-75 font-mono">
                          {player.passportCode}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-600"></div>
                  <span className="text-slate-400 text-sm">or search</span>
                  <div className="flex-1 h-px bg-slate-600"></div>
                </div>

                <SmartPlayerSearch
                  label="Search by name or passport code"
                  placeholder="Enter name or passport code (e.g., HVGN0BW0)..."
                  selectedPlayer={null}
                  onPlayerSelect={handlePlayerSelect}
                  excludePlayerIds={selectedPlayers.map(p => p.id)}
                />

                {/* Selected Players Display */}
                {selectedPlayers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-400" />
                      Selected Players ({selectedPlayers.length}/{matchFormat === 'singles' ? 1 : 3})
                    </h4>
                    <div className="grid gap-3">
                      {selectedPlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {(player.displayName || player.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {player.displayName || player.username}
                              </div>
                              <div className="text-slate-400 text-sm flex items-center gap-2">
                                <Hash className="h-3 w-3" />
                                {player.passportCode}
                                {player.gender && (
                                  <Badge variant="secondary" className="text-xs">
                                    {player.gender}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePlayer(player.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Gamified Match Analysis */}
            {selectedPlayers.length > 0 && (
              <Card className="bg-gradient-to-r from-emerald-900/80 via-blue-900/80 to-purple-900/80 border-2 border-cyan-400/50 p-4 relative overflow-hidden shadow-lg shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.1),transparent_50%)]"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-bold">🎾 Pickleball Match Analysis</span>
                  </div>
                  
                  {(() => {
                    const analysis = generateMatchAnalysis();
                    return (
                      <div className="space-y-3">
                        <h4 className="text-orange-400 font-bold text-lg">{analysis.headline}</h4>
                        
                        {analysis.badges.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {analysis.badges.map((badge, i) => (
                              <Badge 
                                key={i} 
                                className={`${
                                  badge.tier === 'S' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                                  badge.tier === 'A' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                                  'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                }`}
                              >
                                {badge.icon} {badge.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {analysis.insights.length > 0 && (
                          <div className="space-y-1">
                            {analysis.insights.map((insight, i) => (
                              <p key={i} className="text-slate-300 text-sm italic">
                                💡 {insight}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Step 3: Doubles Pairings (only for doubles with 3 players) */}
        {currentStep === 'pairings' && matchFormat === 'doubles' && (
          <motion.div
            key="pairings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-purple-400" />
                Assign Doubles Pairings
              </h3>
              
              <div className="space-y-4">
                <p className="text-slate-300 text-sm mb-4">
                  Choose your doubles partner (you + 1 other player vs remaining 2 players)
                </p>
                
                <div className="grid gap-3">
                  {selectedPlayers.map((player) => (
                    <Button
                      key={player.id}
                      variant={pairings?.team1.some(p => p.id === player.id) ? 'default' : 'outline'}
                      onClick={() => {
                        const currentUser = { id: 0, username: 'You', displayName: 'You' } as Player;
                        const otherPlayers = selectedPlayers.filter(p => p.id !== player.id);
                        setPairings({
                          team1: [currentUser, player],
                          team2: otherPlayers
                        });
                      }}
                      className={`w-full justify-start h-auto p-4 ${
                        pairings?.team1.some(p => p.id === player.id)
                          ? 'bg-orange-500 hover:bg-orange-600 border-orange-400'
                          : 'border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(player.displayName || player.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className={`font-medium ${
                            pairings?.team1.some(p => p.id === player.id)
                              ? 'text-white' 
                              : 'text-slate-300'
                          }`}>
                            {player.displayName || player.username}
                          </div>
                          <div className={`text-sm ${
                            pairings?.team1.some(p => p.id === player.id)
                              ? 'text-orange-100 opacity-90' 
                              : 'text-slate-400 opacity-75'
                          }`}>
                            Partner with You
                          </div>
                        </div>
                        {pairings?.team1.some(p => p.id === player.id) && (
                          <CheckCircle2 className="h-5 w-5 ml-auto" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Epic Team Preview */}
                {pairings && (
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
                              players: pairings.team1.map(p => ({ ...p, name: p.displayName || p.username }))
                            },
                            {
                              name: theme.team2.name, 
                              color: theme.team2.color, 
                              glowColor: theme.team2.color, 
                              players: pairings.team2.map(p => ({ ...p, name: p.displayName || p.username }))
                            }
                          ]}
                          showStats={true}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Epic Review Experience */}
        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Epic FULL-SCREEN Versus Experience */}
            <div className="relative mb-6">
              {matchFormat === 'doubles' && pairings ? (
                <div className="relative">
                  {(() => {
                    const theme = getRandomTeamTheme();
                    return (
                      <VersusScreen
                        mode="full"
                        teams={[
                          {
                            name: theme.team1.name, 
                            color: theme.team1.color, 
                            glowColor: theme.team1.color,
                            players: pairings.team1.map(p => ({ ...p, name: p.displayName || p.username }))
                          },
                          {
                            name: theme.team2.name, 
                            color: theme.team2.color, 
                            glowColor: theme.team2.color, 
                            players: pairings.team2.map(p => ({ ...p, name: p.displayName || p.username }))
                          }
                        ]}
                        showStats={true}
                        intensity={1.0}
                      />
                    );
                  })()}
                </div>
              ) : (
                <div className="relative">
                  {(() => {
                    const theme = getRandomTeamTheme();
                    return (
                      <VersusScreen
                        mode="full"
                        teams={[
                          {
                            name: "You", 
                            color: theme.team1.color, 
                            glowColor: theme.team1.color,
                            players: [{ id: 0, name: "You", displayName: "You" }]
                          },
                          {
                            name: selectedPlayers[0]?.displayName || selectedPlayers[0]?.username || "Opponent", 
                            color: theme.team2.color, 
                            glowColor: theme.team2.color, 
                            players: selectedPlayers.slice(0, 1).map(p => ({ ...p, name: p.displayName || p.username }))
                          }
                        ]}
                        showStats={true}
                        intensity={1.0}
                      />
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Epic Match Analysis */}
            <Card className="bg-gradient-to-br from-purple-900/90 via-orange-900/90 to-red-900/90 border-2 border-yellow-500/60 relative overflow-hidden shadow-2xl shadow-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]"></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="p-2 bg-yellow-500/20 rounded-full"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">🎾 Epic Pickleball Battle Preview</h3>
                </div>
                
                {(() => {
                  const analysis = generateMatchAnalysis();
                  return (
                    <div className="space-y-4">
                      <motion.h2 
                        className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {analysis.headline}
                      </motion.h2>
                      
                      {analysis.badges.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {analysis.badges.map((badge, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: i * 0.1, type: 'spring' }}
                            >
                              <Badge 
                                className={`text-base py-2 px-4 ${
                                  badge.tier === 'S' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                                  badge.tier === 'A' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                                  'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                }`}
                              >
                                {badge.icon} {badge.label}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      {analysis.insights.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.insights.map((insight, i) => (
                            <motion.div
                              key={i}
                              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                              initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                            >
                              <p className="text-slate-200 font-medium">
                                🔥 {insight}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      {analysis.watchFor.length > 0 && (
                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                          <h4 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            What to Watch For:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.watchFor.map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                👀 {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 'format' || isAnimating}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNextStep}
          disabled={!canProceed() || isAnimating}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {currentStep === 'review' ? (
            <>
              <Gamepad2 className="h-4 w-4 mr-2" />
              Create Match
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}