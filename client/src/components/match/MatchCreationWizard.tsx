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

  // Calculate match status based on gender combinations and algorithm
  const calculateMatchStatus = (): MatchCreationData['matchStatus'] => {
    if (selectedPlayers.length === 0) {
      return { competitiveBalance: 0, genderBonus: 0, description: 'Select players to see match analysis' };
    }

    // Count genders (assuming current user data)
    const currentUserGender = 'male'; // TODO: Get from actual user data
    const allPlayers = [{ gender: currentUserGender }, ...selectedPlayers];
    const maleCount = allPlayers.filter(p => p.gender === 'male').length;
    const femaleCount = allPlayers.filter(p => p.gender === 'female').length;

    // Calculate gender bonus based on established algorithm
    let genderBonus = 1.0;
    let description = '';

    if (matchFormat === 'doubles') {
      // Mixed gender matches get bonus
      if (maleCount > 0 && femaleCount > 0) {
        genderBonus = 1.075; // 7.5% bonus for mixed teams under 1000 points
        description = `🎉 Mixed Gender Match • ${genderBonus}x point multiplier`;
      } else {
        description = `⚪ Same Gender Match • Standard points`;
      }
    } else {
      // Singles cross-gender match
      if (selectedPlayers.length === 1 && selectedPlayers[0].gender !== currentUserGender) {
        if (selectedPlayers[0].gender === 'female') {
          genderBonus = 1.15; // 15% bonus for women in cross-gender matches under 1000 points
          description = `💪 Cross-Gender Match • ${genderBonus}x point multiplier for female player`;
        } else {
          description = `⚔️ Cross-Gender Match • Standard points`;
        }
      } else {
        description = `⚪ Same Gender Match • Standard points`;
      }
    }

    // Calculate competitive balance (simplified)
    const playersWithPoints = allPlayers.filter((p): p is Player => 'rankingPoints' in p && p.rankingPoints !== undefined);
    const avgPoints = playersWithPoints.length > 0 
      ? playersWithPoints.reduce((sum, p) => sum + (p.rankingPoints || 0), 0) / playersWithPoints.length
      : 0;
    const competitiveBalance = Math.min(100, Math.max(20, 100 - (avgPoints / 20))); // Simplified balance calculation

    return { competitiveBalance, genderBonus, description };
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

            {/* Match Status Preview */}
            {selectedPlayers.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">Match Analysis</span>
                </div>
                <p className="text-slate-300 text-sm">{calculateMatchStatus().description}</p>
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
                          <div className="font-medium">{player.displayName || player.username}</div>
                          <div className="text-sm opacity-75">Partner with You</div>
                        </div>
                        {pairings?.team1.some(p => p.id === player.id) && (
                          <CheckCircle2 className="h-5 w-5 ml-auto" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Pairing Preview */}
                {pairings && (
                  <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <h4 className="text-white font-medium mb-3">Team Preview:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="text-green-400 font-medium">🎾 Team 1</div>
                        {pairings.team1.map(player => (
                          <div key={player.id} className="text-slate-300">• {player.displayName || player.username}</div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="text-blue-400 font-medium">🎾 Team 2</div>
                        {pairings.team2.map(player => (
                          <div key={player.id} className="text-slate-300">• {player.displayName || player.username}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Review & Create */}
        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Review Match Details
              </h3>
              
              <div className="space-y-4">
                {/* Match Format */}
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Format:</span>
                  <Badge className="bg-orange-500/20 text-orange-300">
                    {matchFormat === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)'}
                  </Badge>
                </div>

                {/* Players */}
                <div className="space-y-2">
                  <span className="text-slate-300 font-medium">Players:</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-white">You (Match Creator)</span>
                    </div>
                    {selectedPlayers.map(player => (
                      <div key={player.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{player.displayName || player.username}</span>
                        <Badge variant="secondary" className="text-xs">{player.passportCode}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pairing Details for Doubles */}
                {matchFormat === 'doubles' && pairings && (
                  <div className="space-y-2">
                    <span className="text-slate-300 font-medium">Team Setup:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="text-green-400 font-medium mb-1">Team 1</div>
                        {pairings.team1.map(player => (
                          <div key={player.id} className="text-white text-sm">
                            • {player.displayName || player.username}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="text-blue-400 font-medium mb-1">Team 2</div>
                        {pairings.team2.map(player => (
                          <div key={player.id} className="text-white text-sm">
                            • {player.displayName || player.username}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Status */}
                <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Match Analysis</span>
                  </div>
                  <p className="text-slate-200">{calculateMatchStatus().description}</p>
                  <div className="mt-2 text-sm text-slate-400">
                    Competitive Balance: {calculateMatchStatus().competitiveBalance}%
                  </div>
                </div>
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