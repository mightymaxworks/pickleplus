import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, Shuffle, Trophy, Target, AlertCircle, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type RankingType = 'singles' | 'doubles' | 'mixed';

interface PlayerRankings {
  singlesRank: number;
  singlesPoints: number;
  doublesRank: number;
  doublesPoints: number;
  mixedRank: number;
  mixedPoints: number;
}

interface ChallengePlayer {
  id: string;
  name: string;
  gender: 'male' | 'female';
  rankings: PlayerRankings;
}

interface PartnerOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  doublesRank: number;
  mixedRank: number;
}

interface SmartChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponent: ChallengePlayer;
  currentPlayer: ChallengePlayer;
  suggestedMatchType: RankingType;
  availablePartners?: PartnerOption[];
  onChallengeSubmit: (matchType: RankingType, partnerId?: string) => void;
  onFindPartner?: () => void;
}

const matchTypeConfig = {
  singles: {
    label: 'Singles',
    description: '1v1 Head-to-Head',
    icon: User,
    color: '#f97316'
  },
  doubles: {
    label: 'Doubles',
    description: 'Same-Gender Teams',
    icon: Users,
    color: '#ec4899'
  },
  mixed: {
    label: 'Mixed Doubles',
    description: 'Mixed-Gender Teams',
    icon: Shuffle,
    color: '#a855f7'
  }
};

export default function SmartChallengeModal({
  isOpen,
  onClose,
  opponent,
  currentPlayer,
  suggestedMatchType,
  availablePartners = [],
  onChallengeSubmit,
  onFindPartner
}: SmartChallengeModalProps) {
  const [selectedMatchType, setSelectedMatchType] = useState<RankingType>(suggestedMatchType);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset modal state when it opens or suggested match type changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMatchType(suggestedMatchType);
      setSelectedPartnerId('');
    }
  }, [isOpen, suggestedMatchType]);

  const requiresPartner = selectedMatchType === 'doubles' || selectedMatchType === 'mixed';
  const isGenderCompatible = selectedMatchType === 'mixed' 
    ? true 
    : currentPlayer.gender === opponent.gender;

  const getMatchupStats = () => {
    switch (selectedMatchType) {
      case 'singles':
        return {
          yourRank: currentPlayer.rankings.singlesRank,
          yourPoints: currentPlayer.rankings.singlesPoints,
          theirRank: opponent.rankings.singlesRank,
          theirPoints: opponent.rankings.singlesPoints
        };
      case 'doubles':
        return {
          yourRank: currentPlayer.rankings.doublesRank,
          yourPoints: currentPlayer.rankings.doublesPoints,
          theirRank: opponent.rankings.doublesRank,
          theirPoints: opponent.rankings.doublesPoints
        };
      case 'mixed':
        return {
          yourRank: currentPlayer.rankings.mixedRank,
          yourPoints: currentPlayer.rankings.mixedPoints,
          theirRank: opponent.rankings.mixedRank,
          theirPoints: opponent.rankings.mixedPoints
        };
    }
  };

  const matchup = getMatchupStats();
  const pointDiff = Math.abs(matchup.yourPoints - matchup.theirPoints);
  const isHigherRanked = matchup.yourRank < matchup.theirRank;

  const handleSubmit = async () => {
    if (requiresPartner && !selectedPartnerId) {
      return; // Validation: partner required
    }

    setIsSubmitting(true);
    
    try {
      // Call the challenge API
      const response = await apiRequest('/api/challenges/create', 'POST', {
        challengedId: opponent.id,
        matchType: selectedMatchType,
        challengerPartnerId: selectedPartnerId ? parseInt(selectedPartnerId) : null,
        createdVia: 'leaderboard',
        sourceContext: {
          leaderboardTab: selectedMatchType,
          challengerRank: currentPlayer.rankings?.[`${selectedMatchType}Rank`] || 0,
          challengedRank: opponent.rankings?.[`${selectedMatchType}Rank`] || 0
        }
      });

      if (response && response.success) {
        const partnerName = selectedPartnerId 
          ? availablePartners.find(p => p.id === selectedPartnerId)?.name 
          : null;
        
        toast({
          title: "Challenge Sent!",
          description: partnerName 
            ? `${selectedMatchType.charAt(0).toUpperCase() + selectedMatchType.slice(1)} challenge sent to ${opponent.name} with partner ${partnerName}. They have 24h to respond.`
            : `${selectedMatchType.charAt(0).toUpperCase() + selectedMatchType.slice(1)} challenge sent to ${opponent.name}. They have 24h to respond.`,
          duration: 4000
        });

        // Call the original callback for any additional handling
        onChallengeSubmit(selectedMatchType, selectedPartnerId || undefined);
        onClose();
      }
    } catch (error) {
      console.error('Failed to send challenge:', error);
      toast({
        title: "Challenge Failed",
        description: "Unable to send challenge. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryGradient = 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md" data-testid="smart-challenge-modal">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#f97316]" />
            Challenge {opponent.name}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose match type and set up your challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Match Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Match Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(matchTypeConfig) as RankingType[]).map((type) => {
                const config = matchTypeConfig[type];
                const Icon = config.icon;
                const isSelected = selectedMatchType === type;
                const isDisabled = type === 'doubles' && !isGenderCompatible;

                return (
                  <button
                    key={type}
                    onClick={() => !isDisabled && setSelectedMatchType(type)}
                    disabled={isDisabled}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-[#f97316] bg-[#f97316]/10' 
                        : isDisabled
                        ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                    data-testid={`match-type-${type}`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-[#f97316]' : 'text-white/60'}`} />
                    <div className="text-xs font-medium text-center">{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matchup Context Card */}
          <motion.div
            key={selectedMatchType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-lg p-4 bg-black/40 border border-slate-700"
            data-testid="matchup-context"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
                {matchTypeConfig[selectedMatchType].description}
              </div>
              <div 
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                style={{
                  background: `${matchTypeConfig[selectedMatchType].color}22`,
                  color: matchTypeConfig[selectedMatchType].color
                }}
              >
                {matchTypeConfig[selectedMatchType].label}
              </div>
            </div>

            <div className="space-y-2">
              {/* Your Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#f97316]">You</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">#{matchup.yourRank}</div>
                    <div className="text-xs text-white/40">{matchup.yourPoints.toLocaleString()} pts</div>
                  </div>
                </div>
                <Trophy className="w-4 h-4 text-white/40" />
              </div>

              {/* VS Divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-xs text-white/40 font-medium">VS</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Opponent Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-white/60">{opponent.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">#{matchup.theirRank}</div>
                    <div className="text-xs text-white/40">{matchup.theirPoints.toLocaleString()} pts</div>
                  </div>
                </div>
                <Target className="w-4 h-4 text-white/40" />
              </div>
            </div>

            {/* Point Difference Indicator */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className={`w-3 h-3 ${isHigherRanked ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className="text-white/60">
                  {isHigherRanked ? 'You rank higher' : 'They rank higher'} by {pointDiff} points
                </span>
              </div>
            </div>
          </motion.div>

          {/* Partner Selection (for Doubles/Mixed) */}
          {requiresPartner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-white/80">
                Your Partner
                {selectedMatchType === 'mixed' && (
                  <span className="ml-2 text-xs text-white/40">(opposite gender required)</span>
                )}
              </label>
              
              {availablePartners.length > 0 ? (
                <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                  <SelectTrigger className="bg-slate-800 border-slate-700" data-testid="partner-select">
                    <SelectValue placeholder="Select your partner" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availablePartners
                      .filter(p => selectedMatchType === 'mixed' ? p.gender !== currentPlayer.gender : true)
                      .map(partner => (
                        <SelectItem key={partner.id} value={partner.id}>
                          <div className="flex items-center gap-2">
                            <span>{partner.name}</span>
                            <span className="text-xs text-white/40">
                              {selectedMatchType === 'doubles' ? `#${partner.doublesRank}` : `#${partner.mixedRank}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-white/40">No partners available</div>
              )}

              {onFindPartner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFindPartner}
                  className="w-full border-slate-600 text-white/80 hover:bg-slate-800"
                  data-testid="find-partner-button"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Find New Partner
                </Button>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-white/80 hover:bg-slate-800"
              data-testid="cancel-challenge-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (requiresPartner && !selectedPartnerId)}
              className="flex-1 bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#a855f7] hover:opacity-90 text-white border-0"
              data-testid="send-challenge-button"
            >
              <Swords className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Challenge'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
