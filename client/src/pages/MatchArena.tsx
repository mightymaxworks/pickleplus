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
import { useLocation } from 'wouter';

// Types
type PlayerStatus = 'online' | 'away' | 'busy' | 'available';
type MatchType = 'singles' | 'doubles-looking' | 'doubles-team';
type ArenaMode = 'lobby' | 'doubles' | 'challenges' | 'search' | 'create-match';
type GlobalTabMode = 'passport' | 'play' | 'rankings' | 'profile';
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
  status: 'pending' | 'accepted' | 'declined';
}

interface PartnerRequest {
  id: string;
  requester: ArenaPlayer;
  target: ArenaPlayer;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}


// Global Navigation Tabs Component (matches UnifiedPrototype)
function GlobalNavigationTabs({ activeTab, onTabChange }: { activeTab: GlobalTabMode; onTabChange: (tab: GlobalTabMode) => void }) {
  const tabs = [
    { id: 'passport' as GlobalTabMode, label: 'Passport', icon: IdCard },
    { id: 'play' as GlobalTabMode, label: 'Play', icon: Activity },
    { id: 'rankings' as GlobalTabMode, label: 'Rankings', icon: Trophy },
    { id: 'profile' as GlobalTabMode, label: 'Profile', icon: UserCog },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-50">
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
}

function ArenaPlayerCard({ player, onChallenge, onViewProfile, onPartnerUp, myPlayerId }: ArenaPlayerCardProps) {
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

  if (player.id === myPlayerId) return null;

  // Handle swipe gestures
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        // Swipe right - Challenge
        setSwipeDirection('right');
        setTimeout(() => {
          onChallenge(player, 'singles');
          setSwipeDirection(null);
        }, 150);
      } else {
        // Swipe left - Partner request (only if available for doubles)
        if (player.matchType === 'doubles-looking') {
          setSwipeDirection('left');
          setTimeout(() => {
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
        x: swipeDirection === 'right' ? 50 : swipeDirection === 'left' ? -50 : 0,
        scale: swipeDirection ? 0.95 : 1
      }}
      exit={{ opacity: 0, y: -20 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      transition={{ duration: 0.2 }}
      whileDrag={{ scale: 0.98 }}
      className="relative cursor-grab active:cursor-grabbing"
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

      <Card className={`p-4 border border-slate-600 bg-gradient-to-br ${config.color} hover:border-orange-400 transition-all ${swipeDirection ? 'border-orange-500' : ''}`}>
        <div className="relative">
          <div className="absolute -top-2 -right-2">
            <div className={`w-4 h-4 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
          </div>

          <div className="text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                  <TierIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">{player.name}</div>
                  <div className="text-xs text-white/80 font-medium">{config.name}</div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <MapPin className="h-3 w-3" />
                    {player.distance < 1 ? `${Math.round(player.distance * 1000)}m` : `${player.distance}km`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{player.points}</div>
                <div className="text-xs text-white/80 font-medium">points</div>
              </div>
            </div>

            <div className="flex justify-between text-xs mb-3">
              <span>{player.wins}W</span>
              <span>{player.losses}L</span>
              <span>{Math.round(player.winRate * 100)}%</span>
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

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => onChallenge(player, 'singles')}
              >
                <Target className="h-3 w-3 mr-1" />
                Challenge
              </Button>
              {player.matchType === 'doubles-looking' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                  onClick={() => onPartnerUp(player)}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Partner
                </Button>
              )}
            </div>
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
  onSendChallenge: (player: ArenaPlayer, matchType: MatchType, message: string) => void;
  myPartner: ArenaPlayer | null;
}

function ChallengeModal({ player, isOpen, onClose, onSendChallenge, myPartner }: ChallengeModalProps) {
  const [selectedType, setSelectedType] = useState<MatchType>('singles');
  const [message, setMessage] = useState('');

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
                  onSendChallenge(player, selectedType, message);
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

  const myPlayerId = 'current-player';

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
    setArenaPlayers(mockPlayers);
  }, []);

  const handleSendChallenge = (player: ArenaPlayer, matchType: MatchType, message: string) => {
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      challenger: { id: myPlayerId, name: 'You' } as ArenaPlayer,
      challenged: player,
      matchType,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setChallenges(prev => [...prev, newChallenge]);
    toast({
      title: '🎯 Challenge Sent!',
      description: `Challenge sent to ${player.name} for ${matchType} match`,
      duration: 3000,
    });
  };

  const handlePartnerUp = (player: ArenaPlayer) => {
    // Send partner request
    const partnerRequest: PartnerRequest = {
      id: Date.now().toString(),
      requester: { id: myPlayerId, name: 'You' } as ArenaPlayer,
      target: player,
      message: `Would like to team up for doubles matches!`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setPartnerRequests(prev => [...prev, partnerRequest]);
    
    toast({
      title: '🎾 Partner Request Sent!',
      description: `Request sent to ${player.name}. They'll be auto-accepted for demo!`,
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
    
    // Flow 2: Universal search (create-match mode)
    if (arenaMode === 'create-match') {
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
          <h1 className="text-3xl font-bold text-white">Match Arena</h1>
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
                <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
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
                  onViewProfile={() => {}}
                  onPartnerUp={handlePartnerUp}
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
          <div key="create-match" className="space-y-4">
            {/* Universal Search Interface */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="text-white font-medium text-lg">🌍 Universal Match Creation</h3>
                  <p className="text-slate-400 text-sm">Search all players regardless of location • Perfect for planned matches</p>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players by name..."
                  value={universalSearchTerm}
                  onChange={(e) => setUniversalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  Searching <span className="text-orange-400">{arenaPlayers.length} players</span> globally
                </span>
                <span className="text-slate-400">
                  {filteredPlayers.length} found
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map(player => (
                <div key={player.id} className="relative">
                  {/* Distance indicator for Create Match mode */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2 py-1">
                      {player.distance < 1 ? `${Math.round(player.distance * 1000)}m` : `${player.distance}km`}
                    </Badge>
                  </div>
                  <ArenaPlayerCard
                    player={player}
                    onChallenge={(player, matchType) => {
                      setSelectedPlayer(player);
                      setShowChallengeModal(true);
                    }}
                    onViewProfile={() => {}}
                    onPartnerUp={handlePartnerUp}
                    myPlayerId={myPlayerId}
                  />
                </div>
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
                <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Players</h3>
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
                        <div className="text-sm text-slate-300">{challenge.matchType} match</div>
                      </div>
                      <Badge className={challenge.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'}>
                        {challenge.status}
                      </Badge>
                    </div>
                    {challenge.message && (
                      <p className="text-slate-200 text-sm mb-3">{challenge.message}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          // Accept the challenge and navigate to gamified match recorder
                          toast({
                            title: '🎾 Challenge Accepted!',
                            description: `Match vs ${challenge.challenger.name} confirmed. Starting match recorder...`,
                            duration: 2000,
                          });
                          
                          // Store challenge participants for the match recorder
                          const challengeData = {
                            player1: 'You', // Current user
                            player2: challenge.challenger.name,
                            matchType: challenge.matchType,
                            challengeId: challenge.id
                          };
                          sessionStorage.setItem('currentMatch', JSON.stringify(challengeData));
                          
                          // Remove challenge from list
                          setChallenges(prev => prev.filter(c => c.id !== challenge.id));
                          
                          // Navigate to gamified match recorder
                          setLocation('/gamified-match-recording');
                        }}
                      >
                        Accept
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

      {/* Global Bottom Navigation */}
      <GlobalNavigationTabs 
        activeTab={'play'} 
        onTabChange={(tab) => {
          if (tab === 'passport') {
            setLocation('/unified-prototype');
          } else if (tab === 'rankings') {
            setLocation('/rankings');
          } else if (tab === 'profile') {
            setLocation('/profile');
          }
          // 'play' tab stays on current page
        }} 
      />
      
    </div>
  );
}