import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Play, Users, UserPlus, Trophy, Search, Globe, MapPin,
  Star, Crown, Shield, Zap, Target, Award, ChevronRight, X, Activity,
  IdCard, UserCog, Heart, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';
// Navigation will be defined inline to match UnifiedPrototype style
import DoublesPartnerSystem from '@/components/doubles/DoublesPartnerSystem';
import { MatchCreationWizard } from '@/components/match/MatchCreationWizard';
import { useLocation } from 'wouter';

// Types
type PlayerStatus = 'online' | 'away' | 'busy' | 'available';
type MatchType = 'singles' | 'doubles-looking' | 'doubles-team';
type ArenaMode = 'lobby' | 'doubles' | 'challenges' | 'search' | 'create-match';
type TabMode = 'passport' | 'arena' | 'rankings' | 'profile';
type PlayerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface ArenaPlayer {
  id: string;
  name: string;
  tier: PlayerTier;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
  status: PlayerStatus;
  lastSeen: string;
  distance: number;
  isOnline: boolean;
  matchType: MatchType;
  partner?: ArenaPlayer;
}

interface Challenge {
  id: string;
  challenger: ArenaPlayer;
  challenged: ArenaPlayer;
  matchType: MatchType;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'ready-check' | 'confirmed';
  createdVia: 'swipe' | 'create-match' | 'manual';
  readyStatus?: {
    challenger: boolean;
    challenged: boolean;
  };
}

interface PartnerRequest {
  id: string;
  requester: ArenaPlayer;
  target: ArenaPlayer;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'ready-check' | 'confirmed';
  createdVia: 'swipe' | 'create-match' | 'manual';
  readyStatus?: {
    requester: boolean;
    target: boolean;
  };
}


// Navigation Tabs Component (matches UnifiedPrototype exactly)
function NavigationTabs({ activeTab, onTabChange }: { activeTab: TabMode; onTabChange: (tab: TabMode) => void }) {
  const tabs = [
    { id: 'passport' as TabMode, label: 'Passport', icon: IdCard },
    { id: 'arena' as TabMode, label: 'Arena', icon: Activity },
    { id: 'rankings' as TabMode, label: 'Rankings', icon: Trophy },
    { id: 'profile' as TabMode, label: 'Profile', icon: UserCog },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-40">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 p-4 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id 
                  ? 'text-orange-400 bg-orange-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Arena Player Card Component
interface ArenaPlayerCardProps {
  player: ArenaPlayer;
  onChallenge: (player: ArenaPlayer, matchType: MatchType) => void;
  onViewProfile: (player: ArenaPlayer) => void;
  onPartnerUp: (player: ArenaPlayer) => void;
  myPlayerId: string;
  calculateCompatibility: (player: ArenaPlayer) => number;
}

function ArenaPlayerCard({ player, onChallenge, onViewProfile, onPartnerUp, myPlayerId, calculateCompatibility }: ArenaPlayerCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  const tierConfig = {
    bronze: { color: 'from-amber-600 to-amber-800', name: 'Bronze', icon: Shield },
    silver: { color: 'from-slate-400 to-slate-600', name: 'Silver', icon: Star },
    gold: { color: 'from-yellow-400 to-yellow-600', name: 'Gold', icon: Crown },
    platinum: { color: 'from-cyan-400 to-cyan-600', name: 'Platinum', icon: Zap },
    diamond: { color: 'from-purple-400 to-purple-600', name: 'Diamond', icon: Award }
  };

  const statusConfig = {
    online: { color: 'bg-green-500', pulse: true },
    available: { color: 'bg-green-400', pulse: false },
    away: { color: 'bg-yellow-500', pulse: false },
    busy: { color: 'bg-red-500', pulse: false }
  };

  const config = tierConfig[player.tier];
  const status = statusConfig[player.status];
  const TierIcon = config.icon;
  
  const compatibility = calculateCompatibility(player);
  const compatibilityColor = compatibility >= 80 ? 'text-green-400' : 
                           compatibility >= 60 ? 'text-yellow-400' : 'text-red-400';

  if (player.id === myPlayerId) return null;

  // Handle swipe gestures
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        // Swipe right - Challenge
        setSwipeDirection('right');
        setTimeout(() => {
          // Fixed: Use the passed props instead of undefined functions
          onChallenge(player, 'singles');
          setSwipeDirection(null);
        }, 150);
      } else {
        // Swipe left - Partner request (only if available for doubles)
        if (player.matchType === 'doubles-looking') {
          setSwipeDirection('left');
          setTimeout(() => {
            // Fixed: Use the passed props instead of undefined functions
            onPartnerUp(player);
            setSwipeDirection(null);
          }, 150);
        }
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: 0,
        scale: 1
      }}
      exit={{ opacity: 0, y: -20 }}
      drag="x"
      dragConstraints={{ left: -20, right: 20 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      transition={{ duration: 0.2 }}
      whileDrag={{ scale: 0.98 }}
      className="relative cursor-grab active:cursor-grabbing"
      onClick={() => onViewProfile(player)}
    >
      {/* Swipe Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
        {/* Left swipe indicator - Partner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: swipeDirection === 'left' ? 1 : 0,
            scale: swipeDirection === 'left' ? 1 : 0.8
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full ml-4"
        >
          <Users className="h-4 w-4" />
          <span className="font-medium text-sm">Partner Up!</span>
        </motion.div>
        
        {/* Right swipe indicator - Challenge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: swipeDirection === 'right' ? 1 : 0,
            scale: swipeDirection === 'right' ? 1 : 0.8
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mr-4"
        >
          <Target className="h-4 w-4" />
          <span className="font-medium text-sm">Challenge!</span>
        </motion.div>
      </div>

      <Card className={`p-4 border border-slate-600 bg-gradient-to-br ${config.color} hover:border-orange-400 transition-all ${swipeDirection ? 'border-orange-500' : ''} relative`}>
        {/* Compatibility Badge (Partners Tab Style) */}
        <div className="absolute -top-2 -right-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border-2 border-slate-600`}>
            <Heart className={`h-3 w-3 ${compatibilityColor}`} />
            <span className={`text-xs font-bold ${compatibilityColor}`}>{compatibility}%</span>
          </div>
        </div>

        {/* Online Status */}
        {player.status === 'online' && (
          <div className="absolute -top-1 -left-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}

        <div className="text-white">
          {/* Partner Header - Matching DoublesPartnerSystem */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <TierIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{player.name}</div>
                <div className="text-xs opacity-75">{config.name}</div>
                <div className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {player.distance < 1 ? `${Math.round(player.distance * 1000)}m` : `${player.distance}km`}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">{player.points.toLocaleString()}</div>
              <div className="text-xs opacity-75">Ranking Points</div>
            </div>
          </div>

          {/* Compatibility Bar - Matching DoublesPartnerSystem */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Match Compatibility</span>
              <span className={compatibilityColor}>{compatibility}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  compatibility >= 80 ? 'bg-green-400' : 
                  compatibility >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${compatibility}%` }}
              />
            </div>
          </div>

          {/* Match Type & Stats - Matching DoublesPartnerSystem */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1 p-2 bg-black/20 rounded">
              {player.matchType === 'singles' ? (
                <>
                  <Target className="h-3 w-3 text-blue-400" />
                  <span>Singles</span>
                </>
              ) : player.matchType === 'doubles-looking' ? (
                <>
                  <UserPlus className="h-3 w-3 text-green-400" />
                  <span>Seeking Partner</span>
                </>
              ) : (
                <>
                  <Users className="h-3 w-3 text-purple-400" />
                  <span>Team Ready</span>
                </>
              )}
            </div>
            <div className="text-center p-2 bg-black/20 rounded">
              <div className="font-bold">{Math.round(player.winRate * 100)}%</div>
              <div className="opacity-75">Win Rate</div>
            </div>
          </div>

          {/* Swipe hint */}
          <div className="text-center mb-2">
            <div className="text-xs text-white/60 flex items-center justify-center gap-4">
              {player.matchType === 'doubles-looking' && (
                <span className="flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Partner
                </span>
              )}
              <span className="flex items-center gap-1">
                Challenge
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => onChallenge(player, 'singles')}
            >
              <Gamepad2 className="h-4 w-4 mr-1" />
              Challenge
            </Button>
            {player.matchType === 'doubles-looking' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white text-white hover:bg-white/10"
                onClick={() => onPartnerUp(player)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Partner
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="px-3 text-white hover:bg-white/10"
              onClick={() => onViewProfile(player)}
            >
              <IdCard className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Challenge Modal Component
interface ChallengeModalProps {
  player: ArenaPlayer | null;
  isOpen: boolean;
  onClose: () => void;
  onSendChallenge: (player: ArenaPlayer, matchType: MatchType, message: string, createdVia?: 'swipe' | 'create-match' | 'manual') => void;
  myPartner: ArenaPlayer | null;
}

function ChallengeModal({ player, isOpen, onClose, onSendChallenge, myPartner }: ChallengeModalProps) {
  const [selectedType, setSelectedType] = useState<MatchType>('singles');
  const [message, setMessage] = useState('');
  
  // Determine the source based on which mode we're currently in
  const getCurrentMode = (): 'swipe' | 'create-match' | 'manual' => {
    const currentUrl = window.location.href;
    if (currentUrl.includes('match-arena')) {
      // Check if we're in create-match mode based on active tab
      const createMatchTab = document.querySelector('[data-arena-mode="create-match"]');
      if (createMatchTab?.classList.contains('bg-orange-500')) {
        return 'create-match';
      }
    }
    return 'manual'; // Default for modal-based challenges
  };

  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-600">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Challenge {player.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 block mb-2">Match Type</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedType === 'singles' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('singles')}
                  className={`w-full ${selectedType === 'singles' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                >
                  Singles
                </Button>
                <Button
                  variant={selectedType === 'doubles-team' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('doubles-team')}
                  disabled={!myPartner}
                  className={`w-full ${selectedType === 'doubles-team' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                >
                  Doubles
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-2">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a challenge message..."
                className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const mode = getCurrentMode();
                  onSendChallenge(player, selectedType, message, mode);
                  onClose();
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Send Challenge
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MatchArena() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [arenaMode, setArenaMode] = useState<ArenaMode>('lobby');
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayer[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myPartner, setMyPartner] = useState<ArenaPlayer | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<ArenaPlayer | null>(null);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [proximityFilter, setProximityFilter] = useState<number>(2); // km radius for proximity-based discovery
  const [universalSearchTerm, setUniversalSearchTerm] = useState('');
  const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState<'challenges' | 'player-info' | null>(null);
  const [selectedPlayerForSheet, setSelectedPlayerForSheet] = useState<ArenaPlayer | null>(null);

  const myPlayerId = 'current-player';
  
  // Current player stats for compatibility calculation
  const currentPlayer = {
    points: 1200, // Mock current player ranking
    winRate: 0.68 // Mock current player win rate
  };

  // Calculate competitive balance compatibility
  const calculateCompatibility = (player: ArenaPlayer): number => {
    // Points difference factor (closer points = higher compatibility)
    const pointsDiff = Math.abs(player.points - currentPlayer.points);
    const maxPointsDiff = 1000; // Consider 1000+ point difference as very low compatibility
    const pointsCompatibility = Math.max(0, (maxPointsDiff - pointsDiff) / maxPointsDiff);
    
    // Win rate similarity factor
    const winRateDiff = Math.abs(player.winRate - currentPlayer.winRate);
    const maxWinRateDiff = 0.3; // 30% win rate difference
    const winRateCompatibility = Math.max(0, (maxWinRateDiff - winRateDiff) / maxWinRateDiff);
    
    // Experience level factor (total games played)
    const playerGames = player.wins + player.losses;
    const currentPlayerGames = 100; // Mock current player total games
    const gamesDiff = Math.abs(playerGames - currentPlayerGames);
    const maxGamesDiff = 50;
    const experienceCompatibility = Math.max(0, (maxGamesDiff - gamesDiff) / maxGamesDiff);
    
    // Weighted average: points (50%), win rate (30%), experience (20%)
    const compatibility = (
      pointsCompatibility * 0.5 + 
      winRateCompatibility * 0.3 + 
      experienceCompatibility * 0.2
    ) * 100;
    
    // Ensure minimum 20% compatibility (always some chance for upset matches)
    return Math.max(20, Math.round(compatibility));
  };

  // Mock data
  useEffect(() => {
    const mockPlayers: ArenaPlayer[] = [
      {
        id: '1',
        name: 'Alex Chen',
        tier: 'diamond',
        points: 1850,
        wins: 89,
        losses: 23,
        winRate: 0.79,
        status: 'online',
        lastSeen: 'now',
        distance: 0.3,
        isOnline: true,
        matchType: 'singles'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        tier: 'platinum',
        points: 1420,
        wins: 76,
        losses: 31,
        winRate: 0.71,
        status: 'available',
        lastSeen: '2 min ago',
        distance: 0.8,
        isOnline: true,
        matchType: 'doubles-looking'
      },
      {
        id: '3',
        name: 'Mike Torres',
        tier: 'gold',
        points: 1180,
        wins: 54,
        losses: 28,
        winRate: 0.66,
        status: 'online',
        lastSeen: 'now',
        distance: 1.2,
        isOnline: true,
        matchType: 'singles'
      },
      // Add more players with varying distances for testing proximity filter
      {
        id: '4',
        name: 'Emma Rodriguez',
        tier: 'silver',
        points: 890,
        wins: 42,
        losses: 18,
        winRate: 0.70,
        status: 'online',
        lastSeen: 'now',
        distance: 3.5, // Beyond 2km proximity filter
        isOnline: true,
        matchType: 'doubles-looking'
      },
      {
        id: '5',
        name: 'David Kim',
        tier: 'gold',
        points: 1350,
        wins: 67,
        losses: 25,
        winRate: 0.73,
        status: 'available',
        lastSeen: '5 min ago',
        distance: 5.2, // Far distance - only in Create Match
        isOnline: true,
        matchType: 'singles'
      },
      {
        id: '6',
        name: 'Lisa Park',
        tier: 'bronze',
        points: 650,
        wins: 28,
        losses: 22,
        winRate: 0.56,
        status: 'online',
        lastSeen: 'now',
        distance: 0.5, // Very close
        isOnline: true,
        matchType: 'doubles-looking'
      }
    ];
    
    // Calculate compatibility for each player
    const playersWithCompatibility = mockPlayers.map(player => ({
      ...player,
      compatibility: calculateCompatibility(player)
    }));
    
    setArenaPlayers(playersWithCompatibility);
  }, []);

  // Ready-check system functions
  const handleReadyCheck = (challengeId: string, playerRole: 'challenger' | 'challenged') => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const newReadyStatus = { ...challenge.readyStatus! };
        newReadyStatus[playerRole] = !newReadyStatus[playerRole];
        
        // Check if both players are ready
        const bothReady = newReadyStatus.challenger && newReadyStatus.challenged;
        
        return {
          ...challenge,
          readyStatus: newReadyStatus,
          status: bothReady ? 'confirmed' as const : 'ready-check' as const
        };
      }
      return challenge;
    }));
    
    toast({
      title: playerRole === 'challenger' ? '✅ You are Ready!' : '✅ Opponent Ready!',
      description: 'Waiting for all players to confirm...',
      duration: 2000,
    });
  };

  const handleSendChallenge = (player: ArenaPlayer, matchType: MatchType, message: string, createdVia: 'swipe' | 'create-match' | 'manual' = 'manual') => {
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      challenger: { id: myPlayerId, name: 'You' } as ArenaPlayer,
      challenged: player,
      matchType,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending',
      createdVia,
      readyStatus: {
        challenger: false,
        challenged: false
      }
    };

    setChallenges(prev => [...prev, newChallenge]);
    
    const sourceText = createdVia === 'swipe' ? 'via swipe' : createdVia === 'create-match' ? 'via Create Match' : '';
    toast({
      title: '🎯 Challenge Sent!',
      description: `Challenge sent to ${player.name} for ${matchType} match ${sourceText}`,
      duration: 3000,
    });
  };

  // Mobile-specific handlers
  const openPlayerBottomSheet = (player: ArenaPlayer) => {
    setSelectedPlayerForSheet(player);
    setBottomSheetContent('player-info');
    setShowMobileBottomSheet(true);
  };

  const openChallengesBottomSheet = () => {
    setBottomSheetContent('challenges');
    setShowMobileBottomSheet(true);
  };

  const closeMobileBottomSheet = () => {
    setShowMobileBottomSheet(false);
    setBottomSheetContent(null);
    setSelectedPlayerForSheet(null);
  };

  const handlePartnerUp = (player: ArenaPlayer, createdVia: 'swipe' | 'create-match' | 'manual' = 'manual') => {
    // Send partner request
    const partnerRequest: PartnerRequest = {
      id: Date.now().toString(),
      requester: { id: myPlayerId, name: 'You' } as ArenaPlayer,
      target: player,
      message: createdVia === 'swipe' ? `Quick partner request via swipe!` : `Would like to team up for doubles matches!`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      createdVia,
      readyStatus: {
        requester: false,
        target: false
      }
    };

    setPartnerRequests(prev => [...prev, partnerRequest]);
    
    const sourceText = createdVia === 'swipe' ? 'via swipe' : createdVia === 'create-match' ? 'via Create Match' : '';
    toast({
      title: '🎾 Partner Request Sent!',
      description: `Request sent to ${player.name} ${sourceText}. They'll be auto-accepted for demo!`,
      duration: 3000,
    });

    // Auto-accept for demo purposes after 1.5 seconds
    setTimeout(() => {
      handleAcceptPartnerRequest(partnerRequest.id, player);
    }, 1500);
  };

  const handleAcceptPartnerRequest = (requestId: string, player: ArenaPlayer) => {
    // Update request status
    setPartnerRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'accepted' as const }
          : req
      )
    );

    // Form partnership
    const partnerData: ArenaPlayer = {
      ...player,
      matchType: 'doubles-team' as MatchType,
      partner: undefined
    };

    setMyPartner(partnerData);
    setArenaPlayers(prev => prev.filter(p => p.id !== player.id));

    toast({
      title: '🎉 Partnership Formed!',
      description: `You and ${player.name} are now a doubles team!`,
      duration: 4000,
    });

    // Remove accepted request after a short delay
    setTimeout(() => {
      setPartnerRequests(prev => prev.filter(req => req.id !== requestId));
    }, 2000);
  };

  const filteredPlayers = arenaPlayers.filter(player => {
    // Flow 1: Proximity-based discovery (lobby mode)
    if (arenaMode === 'lobby') {
      // Only show players within proximity radius
      if (player.distance > proximityFilter) return false;
    }
    
    // Flow 2: Universal search (create-match and search modes)
    if (arenaMode === 'create-match' || arenaMode === 'search') {
      // Universal search - no distance restrictions
      if (universalSearchTerm && !player.name.toLowerCase().includes(universalSearchTerm.toLowerCase())) return false;
    } else {
      // Regular search for other modes
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    
    // Match type filtering (applies to all modes)
    if (filterType === 'singles' && player.matchType !== 'singles') return false;
    if (filterType === 'doubles' && !player.matchType.includes('doubles')) return false;
    
    return true;
  });

  const onlineCount = arenaPlayers.filter(p => p.isOnline).length;
  const availableCount = arenaPlayers.filter(p => p.status === 'available' || p.status === 'online').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 pb-24">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-8 w-8 text-orange-400" />
          <h1 className="text-3xl font-bold text-white">Arena</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {onlineCount} players online
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            {availableCount} available for matches
          </div>
        </div>
        
        {myPartner !== null && (
          <div className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg px-4 py-2">
            <Users className="h-5 w-5 text-green-400" />
            <div className="text-left">
              <div className="text-white font-medium">Doubles Team Active</div>
              <div className="text-green-400 text-sm">Partnered with {myPartner.name}</div>
            </div>
            <Button
              onClick={() => {
                const partnerName = myPartner.name;
                const restoredPlayer: ArenaPlayer = {
                  ...myPartner,
                  matchType: 'doubles-looking' as MatchType,
                  partner: undefined
                };
                
                setArenaPlayers(prev => [...prev, restoredPlayer]);
                setMyPartner(null);
                
                toast({
                  title: '🔄 Partnership Dissolved',
                  description: `You're no longer partnered with ${partnerName}. They're back in the player pool.`,
                  duration: 3000,
                });
              }}
              size="sm"
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-1" />
              Dissolve
            </Button>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Top Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50 shadow-2xl max-w-full overflow-x-auto">
          {([
            { key: 'lobby', label: 'Lobby', mobileLabel: 'Lobby', icon: Users },
            { key: 'create-match', label: 'Create Match', mobileLabel: 'Create', icon: Plus },
            { key: 'doubles', label: 'Partners', mobileLabel: 'Teams', icon: UserPlus },
            { key: 'challenges', label: 'Challenges', mobileLabel: 'Matches', icon: Trophy },
            { key: 'search', label: 'Find Players', mobileLabel: 'Search', icon: Search }
          ] as const).map(tab => {
            const Icon = tab.icon;
            const isActive = arenaMode === tab.key;
            return (
              <Button
                key={tab.key}
                onClick={() => setArenaMode(tab.key)}
                variant="ghost"
                className={`
                  relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 
                  min-w-[4rem] sm:min-w-fit transition-all duration-200 
                  ${
                    isActive 
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/20' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent'
                  }
                  rounded-lg backdrop-blur-sm
                `}
              >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-orange-400' : ''}`} />
                <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">{tab.label}</span>
                <span className="sm:hidden text-xs font-medium">{tab.mobileLabel}</span>
                {tab.key === 'challenges' && challenges.length > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 sm:ml-1">
                    {challenges.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {arenaMode === 'lobby' && (
          <div key="lobby" className="space-y-4">
            {/* Proximity Filter Controls */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">🎯 Quick Discovery</h3>
                <div className="text-xs text-slate-400">Within {proximityFilter}km</div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-orange-400" />
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={proximityFilter}
                  onChange={(e) => setProximityFilter(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-sm text-white min-w-[3rem]">{proximityFilter}km</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map(player => (
                <ArenaPlayerCard
                  key={player.id}
                  player={player}
                  onChallenge={(player, matchType) => {
                    setSelectedPlayer(player);
                    setShowChallengeModal(true);
                  }}
                  onViewProfile={() => openPlayerBottomSheet(player)}
                  onPartnerUp={(player) => handlePartnerUp(player, 'manual')}
                  calculateCompatibility={calculateCompatibility}
                  myPlayerId={myPlayerId}
                />
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No players nearby</h3>
                <p className="text-slate-300">Try increasing the radius or use "Create Match" for universal search</p>
              </div>
            )}
          </div>
        )}

        {arenaMode === 'create-match' && (
          <MatchCreationWizard 
            onMatchCreated={(matchData) => {
              // Navigate to match recorder with pre-populated data
              toast({
                title: '🎾 Match Created!',
                description: `${matchData.format} match ready for ${matchData.selectedPlayers.length + 1} players`,
                duration: 1800
              });
              
              // Store match data for the recorder with proper pairings
              const recorderData = {
                format: matchData.format,
                pairings: matchData.pairings,
                selectedPlayers: matchData.selectedPlayers,
                scoringSystem: matchData.scoringSystem, // Pass scoring system for MatchConfig
                teamIdentity: matchData.teamIdentity, // Include team theme
                matchStatus: matchData.matchStatus // Include match status for bonus info
              };
              sessionStorage.setItem('currentMatch', JSON.stringify(recorderData));
              
              // Store scoring preference
              localStorage.setItem('pkl:lastScoringMode', matchData.scoringSystem);
              
              console.log('Match Data:', matchData);
              
              // Navigate to match configuration first
              setTimeout(() => {
                setLocation(`/match-config?scoring=${matchData.scoringSystem}`);
              }, 1500);
            }}
          />
        )}

        {arenaMode === 'search' && (
          <div key="search" className="space-y-4">
            {/* Find Players Search Interface */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="text-white font-medium text-lg">🔍 Find Players</h3>
                  <p className="text-slate-400 text-sm">Search all players globally • No distance limits</p>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players by name..."
                  value={universalSearchTerm}
                  onChange={(e) => setUniversalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  Searching <span className="text-green-400">{arenaPlayers.length} players</span> globally
                </span>
                <span className="text-slate-400">
                  {filteredPlayers.length} found
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map(player => (
                <ArenaPlayerCard
                  key={player.id}
                  player={player}
                  onChallenge={(player, matchType) => {
                    setSelectedPlayer(player);
                    setShowChallengeModal(true);
                  }}
                  onViewProfile={() => openPlayerBottomSheet(player)}
                  onPartnerUp={(player) => handlePartnerUp(player, 'create-match')}
                  myPlayerId={myPlayerId}
                  calculateCompatibility={calculateCompatibility}
                />
              ))}
            </div>

            {filteredPlayers.length === 0 && universalSearchTerm && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No players found</h3>
                <p className="text-slate-300">Try a different search term or browse all players</p>
              </div>
            )}

            {filteredPlayers.length === 0 && !universalSearchTerm && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Find Players</h3>
                <p className="text-slate-300">Start typing to search or browse all available players</p>
              </div>
            )}
          </div>
        )}

        {arenaMode === 'doubles' && (
          <div key="doubles">
            <DoublesPartnerSystem
              currentPartner={myPartner !== null ? { name: myPartner.name, id: myPartner.id } : null}
              onNavigateToLobby={() => setArenaMode('lobby')}
              onPartnerFound={(partner) => {
                // Map tier types to match ArenaPlayer interface
                const mapTier = (tier: string): PlayerTier => {
                  switch(tier) {
                    case 'recreational': return 'bronze';
                    case 'competitive': return 'silver';
                    case 'elite': return 'gold';
                    case 'professional': return 'platinum';
                    default: return 'bronze';
                  }
                };
                
                const arenaPartner: ArenaPlayer = {
                  ...partner,
                  tier: mapTier(partner.tier),
                  status: 'online' as PlayerStatus,
                  matchType: 'doubles-team' as MatchType,
                  lastSeen: 'now',
                  points: partner.rankingPoints || 0,
                  wins: Math.floor((partner.winRate || 0) * 10),
                  losses: Math.floor((1 - (partner.winRate || 0)) * 10),
                  distance: partner.distance || 0,
                  isOnline: true
                };
                setMyPartner(arenaPartner);
                toast({
                  title: '🎾 Team Ready!',
                  description: `You and ${partner.name} are now a doubles team. Ready to challenge other teams?`,
                  duration: 4000,
                });
                setTimeout(() => setArenaMode('lobby'), 2000);
              }}
            />
          </div>
        )}

        {arenaMode === 'challenges' && (
          <div key="challenges">
            {challenges.length > 0 ? (
              challenges.map(challenge => (
                <Card key={challenge.id} className="p-4 mb-4 bg-slate-800 border-slate-600">
                  <div className="text-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">Challenge from {challenge.challenger.name}</div>
                        <div className="text-sm text-slate-300">
                          {challenge.matchType} match • via {challenge.createdVia === 'swipe' ? 'swipe' : challenge.createdVia === 'create-match' ? 'Create Match' : 'manual'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={
                          challenge.status === 'pending' ? 'bg-orange-500' : 
                          challenge.status === 'ready-check' ? 'bg-blue-500' :
                          challenge.status === 'confirmed' ? 'bg-green-500' : 'bg-gray-500'
                        }>
                          {challenge.status === 'ready-check' ? 'Ready Check' : challenge.status}
                        </Badge>
                        {challenge.status === 'ready-check' && challenge.readyStatus && (
                          <div className="text-xs text-slate-400">
                            You: {challenge.readyStatus.challenged ? '✅' : '⏳'} | 
                            Them: {challenge.readyStatus.challenger ? '✅' : '⏳'}
                          </div>
                        )}
                      </div>
                    </div>
                    {challenge.message && (
                      <p className="text-slate-200 text-sm mb-3">{challenge.message}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className={`${
                          challenge.status === 'pending' ? 'bg-green-600 hover:bg-green-700' :
                          challenge.status === 'ready-check' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-orange-600 hover:bg-orange-700'
                        } text-white`}
                        onClick={() => {
                          if (challenge.status === 'pending') {
                            // Accept challenge and move to ready-check phase
                            setChallenges(prev => prev.map(c => 
                              c.id === challenge.id 
                                ? { ...c, status: 'ready-check' as const }
                                : c
                            ));
                            
                            toast({
                              title: '🎾 Challenge Accepted!',
                              description: `Moving to ready-check phase. Confirm when you're ready to play!`,
                              duration: 3000,
                            });
                          } else if (challenge.status === 'ready-check') {
                            // Handle ready check
                            handleReadyCheck(challenge.id, 'challenged');
                          } else if (challenge.status === 'confirmed') {
                            // Start the match
                            toast({
                              title: '🚀 Starting Match!',
                              description: `Match vs ${challenge.challenger.name} starting now...`,
                              duration: 2000,
                            });
                            
                            // Store challenge participants for the match recorder
                            const challengeData = {
                              player1: 'You', // Current user
                              player2: challenge.challenger.name,
                              matchType: challenge.matchType,
                              challengeId: challenge.id,
                              createdVia: challenge.createdVia
                            };
                            sessionStorage.setItem('currentMatch', JSON.stringify(challengeData));
                            
                            // Remove challenge from list
                            setChallenges(prev => prev.filter(c => c.id !== challenge.id));
                            
                            // Navigate to match configuration first
                            setLocation('/match-config');
                          }
                        }}
                      >
                        {challenge.status === 'pending' && 'Accept'}
                        {challenge.status === 'ready-check' && (challenge.readyStatus?.challenged ? '✅ Ready' : '⏱️ Ready?')}
                        {challenge.status === 'confirmed' && '🚀 Start Match'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
                        onClick={() => {
                          // Decline the challenge
                          toast({
                            title: '❌ Challenge Declined',
                            description: `You declined ${challenge.challenger.name}'s challenge.`,
                            duration: 2000,
                          });
                          
                          // Remove challenge from list
                          setChallenges(prev => prev.filter(c => c.id !== challenge.id));
                        }}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Active Challenges</h3>
                <p className="text-slate-300">Challenge players from the Arena Lobby to get started</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <ChallengeModal
        player={selectedPlayer}
        isOpen={showChallengeModal}
        onClose={() => {
          setShowChallengeModal(false);
          setSelectedPlayer(null);
        }}
        onSendChallenge={handleSendChallenge}
        myPartner={myPartner}
      />

      {/* Mobile Bottom Sheet */}
      {showMobileBottomSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileBottomSheet}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl border-t border-slate-700 max-h-[85vh] overflow-hidden z-50"
          >
            {/* Handle Bar */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Sheet Content */}
            <div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-2rem)]">
              {bottomSheetContent === 'player-info' && selectedPlayerForSheet && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedPlayerForSheet.name}
                    </h3>
                    <Badge className={`${
                      selectedPlayerForSheet.tier === 'bronze' ? 'bg-orange-600' :
                      selectedPlayerForSheet.tier === 'silver' ? 'bg-slate-400' :
                      selectedPlayerForSheet.tier === 'gold' ? 'bg-yellow-500' :
                      selectedPlayerForSheet.tier === 'platinum' ? 'bg-cyan-400' :
                      'bg-purple-500'
                    } mb-4`}>
                      {selectedPlayerForSheet.tier} • {selectedPlayerForSheet.points} pts
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {selectedPlayerForSheet.wins}
                      </div>
                      <div className="text-sm text-slate-400">Wins</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {selectedPlayerForSheet.losses}
                      </div>
                      <div className="text-sm text-slate-400">Losses</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setSelectedPlayer(selectedPlayerForSheet);
                        setShowChallengeModal(true);
                        closeMobileBottomSheet();
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                    >
                      🎯 Challenge to Match
                    </Button>
                    
                    {selectedPlayerForSheet.matchType === 'doubles-looking' && (
                      <Button
                        onClick={() => {
                          handlePartnerUp(selectedPlayerForSheet, arenaMode === 'create-match' ? 'create-match' : 'manual');
                          closeMobileBottomSheet();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      >
                        🤝 Request as Partner
                      </Button>
                    )}

                    <div className="text-center text-slate-400 text-sm">
                      {selectedPlayerForSheet.distance < 1 
                        ? `${Math.round(selectedPlayerForSheet.distance * 1000)}m away`
                        : `${selectedPlayerForSheet.distance}km away`
                      }
                    </div>
                  </div>
                </div>
              )}

              {bottomSheetContent === 'challenges' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Your Challenges</h3>
                  {challenges.length > 0 ? (
                    challenges.map(challenge => (
                      <Card key={challenge.id} className="p-4 bg-slate-800 border-slate-600">
                        <div className="text-white space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{challenge.challenger.name}</div>
                              <div className="text-sm text-slate-300">
                                {challenge.matchType} • via {challenge.createdVia}
                              </div>
                            </div>
                            <Badge className={
                              challenge.status === 'pending' ? 'bg-orange-500' : 
                              challenge.status === 'ready-check' ? 'bg-blue-500' :
                              'bg-green-500'
                            }>
                              {challenge.status}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                handleReadyCheck(challenge.id, 'challenged');
                                toast({
                                  title: '🎾 Challenge Progress!',
                                  description: 'Updated via mobile sheet',
                                  duration: 2000,
                                });
                              }}
                            >
                              {challenge.status === 'pending' && 'Accept'}
                              {challenge.status === 'ready-check' && (challenge.readyStatus?.challenged ? '✅ Ready' : '⏱️ Ready?')}
                              {challenge.status === 'confirmed' && '🚀 Start'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-slate-500 text-slate-300"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">No pending challenges</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Navigation - Fixed z-index to not block modal actions */}
      <NavigationTabs 
        activeTab={'arena'} 
        onTabChange={(tab) => {
          if (tab === 'passport') {
            setLocation('/unified-prototype');
          } else if (tab === 'rankings') {
            setLocation('/rankings');
          } else if (tab === 'profile') {
            setLocation('/profile');
          }
          // 'arena' tab stays on current page
        }} 
      />
      
    </div>
  );
}