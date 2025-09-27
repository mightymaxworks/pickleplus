import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Zap, 
  Target, 
  Award, 
  Crown, 
  Star,
  TrendingUp,
  Users,
  User,
  Timer,
  Sparkles,
  Medal,
  CheckCircle,
  Gamepad2,
  Activity,
  MapPin,
  Search,
  Plus,
  Send,
  Clock,
  Wifi,
  WifiOff,
  UserPlus,
  Swords,
  Play,
  Eye,
  Globe,
  Filter,
  Settings,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DoublesPartnerSystem from '@/components/doubles/DoublesPartnerSystem';

// Enhanced Player Status Indicators
type PlayerStatus = 'online' | 'in-match' | 'available' | 'away' | 'offline';
type MatchType = 'singles' | 'doubles-looking' | 'doubles-team';

interface ArenaPlayer {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  status: PlayerStatus;
  location: string;
  distance: number; // km away
  avatar?: string;
  matchType: MatchType;
  partner?: { name: string; id: string }; // For doubles teams
  winRate: number;
  isOnline: boolean;
  lastSeen: string;
  preferredFormat?: 'singles' | 'doubles' | 'both';
}

interface ChallengeRequest {
  id: string;
  fromPlayer: ArenaPlayer;
  toPlayer: ArenaPlayer;
  matchType: MatchType;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Gaming-Style Player Card
function ArenaPlayerCard({ player, onChallenge, onViewProfile, onPartnerUp, myPlayerId }: {
  player: ArenaPlayer;
  onChallenge: (player: ArenaPlayer, matchType: MatchType) => void;
  onViewProfile: (player: ArenaPlayer) => void;
  onPartnerUp: (player: ArenaPlayer) => void;
  myPlayerId: string;
}) {
  const tierConfig = {
    recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: Target },
    competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Zap },
    elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Award },
    professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Crown },
  };

  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online', pulse: true },
    available: { color: 'bg-green-400', text: 'Available', pulse: true },
    'in-match': { color: 'bg-red-500', text: 'In Match', pulse: false },
    away: { color: 'bg-yellow-500', text: 'Away', pulse: false },
    offline: { color: 'bg-gray-500', text: 'Offline', pulse: false },
  };

  const config = tierConfig[player.tier];
  const status = statusConfig[player.status];
  const TierIcon = config.icon;
  const isChallengeable = player.status === 'online' || player.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`p-4 border border-slate-600 bg-gradient-to-br ${config.color} hover:border-orange-400 transition-all`}>
        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-4 h-4 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
        </div>

        <div className="text-white">
          {/* Player Header */}
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
              <div className="text-lg font-bold">{player.rankingPoints.toLocaleString()}</div>
              <div className="text-xs opacity-75">Ranking Points</div>
            </div>
          </div>

          {/* Match Type & Partner Info */}
          <div className="mb-3">
            {player.matchType === 'doubles-team' && player.partner ? (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="text-sm">Team with {player.partner.name}</span>
              </div>
            ) : player.matchType === 'doubles-looking' ? (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">Looking for doubles partner</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <User className="h-4 w-4" />
                <span className="text-sm">Singles player</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="text-center p-2 bg-black/20 rounded">
              <div className="font-bold">{Math.round(player.winRate * 100)}%</div>
              <div className="opacity-75">Win Rate</div>
            </div>
            <div className="text-center p-2 bg-black/20 rounded">
              <div className="font-bold">{status.text}</div>
              <div className="opacity-75">Status</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onViewProfile(player)}
              variant="outline"
              size="sm"
              className="flex-1 text-white border-white/30 hover:bg-white/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {isChallengeable && player.id !== myPlayerId ? (
              player.matchType === 'doubles-looking' ? (
                <Button
                  onClick={() => onPartnerUp(player)}
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Partner Up
                </Button>
              ) : (
                <Button
                  onClick={() => onChallenge(player, player.matchType)}
                  size="sm"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Swords className="h-4 w-4 mr-1" />
                  Challenge
                </Button>
              )
            ) : (
              <Button
                disabled
                size="sm"
                className="flex-1 opacity-50"
              >
                <Timer className="h-4 w-4 mr-1" />
                {player.status === 'in-match' ? 'In Match' : 'Unavailable'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Enhanced Challenge Modal with smart doubles detection
function ChallengeModal({ player, isOpen, onClose, onSendChallenge, myPartner }: {
  player: ArenaPlayer | null;
  isOpen: boolean;
  onClose: () => void;
  onSendChallenge: (matchType: MatchType, message: string) => void;
  myPartner: ArenaPlayer | null;
}) {
  const [selectedType, setSelectedType] = useState<MatchType>('singles');
  const [message, setMessage] = useState('');

  // Smart type detection based on target player and user's partner status
  const getAvailableMatchTypes = () => {
    const types = [{ type: 'singles' as MatchType, label: 'Singles Match', icon: User }];
    
    if (player?.matchType === 'doubles-team' && myPartner) {
      // User has partner, challenging doubles team = Team vs Team
      types.push({ type: 'doubles-team' as MatchType, label: `Team Match (You + ${myPartner.name} vs ${player.name} + ${player.partner?.name})`, icon: Users });
    } else if (player?.matchType === 'doubles-team' && !myPartner) {
      // User has no partner, need to find one first
      types.push({ type: 'doubles-looking' as MatchType, label: 'Find Partner First, Then Challenge Team', icon: UserPlus });
    } else if (player?.matchType === 'doubles-looking') {
      // Target is looking for partner
      types.push({ type: 'doubles-looking' as MatchType, label: 'Partner Up & Play Together', icon: UserPlus });
    }
    
    return types;
  };

  if (!player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full"
          >
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Swords className="h-6 w-6 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Challenge {player.name}</h2>
                </div>
                <p className="text-slate-400">Send a match challenge</p>
              </div>

              <div className="space-y-4">
                {/* Smart Match Type Selection */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Match Type</label>
                  <div className="space-y-2">
                    {getAvailableMatchTypes().map(({ type, label, icon: Icon }) => (
                      <Button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        variant={selectedType === type ? 'default' : 'outline'}
                        className="w-full justify-start text-left"
                      >
                        <Icon className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{label}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Context-aware helper text */}
                  {player?.matchType === 'doubles-team' && !myPartner && (
                    <p className="text-xs text-orange-400 mt-2">
                      💡 You need a doubles partner to challenge this team
                    </p>
                  )}
                  {player?.matchType === 'doubles-team' && myPartner && (
                    <p className="text-xs text-green-400 mt-2">
                      🎾 Perfect! Team vs Team match ready
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Challenge Message</label>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ready for a match?"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-white border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onSendChallenge(selectedType, message)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Challenge
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Arena Component
export default function MatchArena() {
  const { toast } = useToast();
  const [arenaMode, setArenaMode] = useState<'lobby' | 'search' | 'challenges' | 'doubles'>('lobby');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<ArenaPlayer | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeRequest[]>([]);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [partnerRequests, setPartnerRequests] = useState<ArenaPlayer[]>([]);
  const [myPartner, setMyPartner] = useState<ArenaPlayer | null>(null); // Track if user already has a partner

  // Mock current player
  const myPlayerId = 'current-player';

  // Mock arena players (nearby/online)
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayer[]>([
    {
      id: '1',
      name: 'Sarah Martinez',
      tier: 'professional',
      rankingPoints: 2156,
      status: 'available',
      location: 'Vancouver Community Center',
      distance: 0.3,
      matchType: 'singles',
      winRate: 0.89,
      isOnline: true,
      lastSeen: '2 min ago',
      preferredFormat: 'singles'
    },
    {
      id: '2',
      name: 'Mike & Jessica',
      tier: 'elite',
      rankingPoints: 1847,
      status: 'online',
      location: 'Richmond Sports Complex',
      distance: 1.2,
      matchType: 'doubles-team',
      partner: { name: 'Jessica Liu', id: '3' },
      winRate: 0.82,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'doubles'
    },
    {
      id: '4',
      name: 'David Kim',
      tier: 'competitive',
      rankingPoints: 1456,
      status: 'available',
      location: 'UBC Recreation Center',
      distance: 2.1,
      matchType: 'doubles-looking',
      winRate: 0.74,
      isOnline: true,
      lastSeen: '5 min ago',
      preferredFormat: 'both'
    },
    {
      id: '5',
      name: 'Lisa Zhang',
      tier: 'elite',
      rankingPoints: 1623,
      status: 'in-match',
      location: 'Burnaby Heights',
      distance: 0.8,
      matchType: 'singles',
      winRate: 0.91,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'singles'
    },
    {
      id: '6',
      name: 'Alex Chen',
      tier: 'professional',
      rankingPoints: 1987,
      status: 'online',
      location: 'Queen Elizabeth Theatre Courts',
      distance: 1.5,
      matchType: 'singles',
      winRate: 0.86,
      isOnline: true,
      lastSeen: '1 min ago',
      preferredFormat: 'both'
    }
  ]);

  const handleChallenge = (player: ArenaPlayer, matchType: MatchType) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

  const handleSendChallenge = (matchType: MatchType, message: string) => {
    if (!selectedPlayer) return;

    // Handle different challenge scenarios
    if (matchType === 'doubles-team' && myPartner) {
      // Team vs Team - go directly to match recording with context
      const matchData = {
        team1: {
          player1: { name: 'You', id: myPlayerId },
          player2: { name: myPartner.name, id: myPartner.id }
        },
        team2: {
          player1: { name: selectedPlayer.name, id: selectedPlayer.id },
          player2: { name: selectedPlayer.partner?.name || 'Partner', id: selectedPlayer.partner?.id || 'partner' }
        },
        matchType: 'doubles',
        challengeMessage: message
      };
      
      // Store match context for the recording page
      sessionStorage.setItem('pendingMatch', JSON.stringify(matchData));
      sessionStorage.setItem('realPlayerNames', JSON.stringify({
        team1Player1: 'You',
        team1Player2: myPartner.name,
        team2Player1: selectedPlayer.name,
        team2Player2: selectedPlayer.partner?.name || 'Partner'
      }));
      
      toast({
        title: "🎮 Team Challenge Ready!",
        description: `Starting team match: You & ${myPartner.name} vs ${selectedPlayer.name} & ${selectedPlayer.partner?.name}`,
        duration: 3000,
      });
      
      setTimeout(() => {
        window.location.href = '/gamified-match-recording';
      }, 1500);
      
    } else if (matchType === 'doubles-looking' && selectedPlayer.matchType === 'doubles-team') {
      // Need to find partner first before challenging team
      toast({
        title: "🤝 Find Partner First!",
        description: "You need a doubles partner to challenge this team. Let's find you one!",
        duration: 3000,
      });
      
      setTimeout(() => setArenaMode('doubles'), 1000);
      
    } else {
      // Regular singles or partner-finding challenge
      const newChallenge: ChallengeRequest = {
        id: Date.now().toString(),
        fromPlayer: {
          id: myPlayerId,
          name: 'You',
          tier: 'elite',
          rankingPoints: 1247,
          status: 'online',
          location: 'Current',
          distance: 0,
          matchType: matchType,
          winRate: 0.73,
          isOnline: true,
          lastSeen: 'now'
        },
        toPlayer: selectedPlayer,
        matchType,
        message: message || 'Ready for a match?',
        timestamp: new Date(),
        status: 'pending'
      };

      setChallenges(prev => [...prev, newChallenge]);
      
      // Smart feedback based on match type
      const feedback = {
        'singles': `Singles challenge sent to ${selectedPlayer.name}`,
        'doubles-looking': `Partnership request sent to ${selectedPlayer.name}`,
        'doubles-team': `Team challenge sent to ${selectedPlayer.name}'s team`
      };
      
      toast({
        title: "🎯 Challenge Sent!",
        description: feedback[matchType] || `Challenge sent to ${selectedPlayer.name}`,
        duration: 3000,
      });

      // Auto-switch to challenges tab to show pending challenge
      setTimeout(() => setArenaMode('challenges'), 500);
    }
    
    setShowChallengeModal(false);
    setSelectedPlayer(null);
  };

  const handleFindPartner = () => {
    setIsSearchingPartner(true);
    
    // Show searching feedback
    toast({
      title: "🔍 Finding Partners...",
      description: "Looking for available doubles partners in your area",
      duration: 2000,
    });

    // Simulate finding partners (in real app, this would be an API call)
    setTimeout(() => {
      const availablePartners = arenaPlayers.filter(p => 
        p.matchType === 'doubles-looking' && p.id !== myPlayerId
      );
      setPartnerRequests(availablePartners);
      setIsSearchingPartner(false);
      
      if (availablePartners.length > 0) {
        toast({
          title: "✨ Partners Found!",
          description: `Found ${availablePartners.length} available partner${availablePartners.length > 1 ? 's' : ''}`,
          duration: 3000,
        });
      } else {
        toast({
          title: "😔 No Partners Available",
          description: "No doubles partners found nearby. Try expanding your search or check back later.",
          duration: 4000,
        });
      }
    }, 1500);
  };

  const filteredPlayers = arenaPlayers.filter(player => {
    if (filterType === 'singles' && player.matchType !== 'singles') return false;
    if (filterType === 'doubles' && !player.matchType.includes('doubles')) return false;
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const onlineCount = arenaPlayers.filter(p => p.isOnline).length;
  const availableCount = arenaPlayers.filter(p => p.status === 'available' || p.status === 'online').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-8 w-8 text-orange-400" />
          <h1 className="text-3xl font-bold text-white">Match Arena</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {onlineCount} players online
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            {availableCount} available for matches
          </div>
        </div>
        
        {/* Partnership Status Display */}
        {myPartner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg px-4 py-2"
          >
            <Users className="h-5 w-5 text-green-400" />
            <div className="text-left">
              <div className="text-white font-medium">Doubles Team Active</div>
              <div className="text-green-400 text-sm">Partnered with {myPartner.name}</div>
            </div>
            <Button
              onClick={() => {
                const partnerName = myPartner.name;
                const partnerId = myPartner.id;
                
                // Restore partner to available players when partnership is dissolved
                const restoredPlayer: ArenaPlayer = {
                  ...myPartner,
                  matchType: 'doubles-looking' as MatchType,
                  partner: undefined
                };
                
                setArenaPlayers(prev => [...prev, restoredPlayer]);
                setMyPartner(null);
                
                toast({
                  title: "🔄 Partnership Dissolved",
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
          </motion.div>
        )}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-800 rounded-lg p-1">
          {([
            { key: 'lobby', label: 'Arena Lobby', icon: Users },
            { key: 'doubles', label: 'Doubles Partners', icon: UserPlus },
            { key: 'challenges', label: 'Challenges', icon: Trophy },
            { key: 'search', label: 'Find Players', icon: Search }
          ] as const).map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                onClick={() => setArenaMode(tab.key)}
                variant={arenaMode === tab.key ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.key === 'challenges' && challenges.length > 0 && (
                  <Badge className="bg-orange-500 text-white ml-1">
                    {challenges.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          onClick={handleFindPartner}
          disabled={isSearchingPartner}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isSearchingPartner ? (
            <>
              <Timer className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Find Doubles Partner
            </>
          )}
        </Button>
        
        <Button
          onClick={() => window.location.href = '/gamified-match-recording'}
          className="bg-green-500 hover:bg-green-600"
        >
          <Play className="h-4 w-4 mr-2" />
          Record Match
        </Button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {arenaMode === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Partner Requests Section */}
            {partnerRequests.length > 0 && (
              <Card className="p-4 bg-blue-800/30 border-blue-500 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Available Doubles Partners</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerRequests.map(partner => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{partner.name}</div>
                        <div className="text-sm text-slate-400">{partner.rankingPoints} points • {partner.distance}km away</div>
                      </div>
                      <Button
                        onClick={() => {
                          toast({
                            title: "🤝 Partner Request Sent!",
                            description: `Sent doubles partnership request to ${partner.name}`,
                            duration: 3000,
                          });
                        }}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Filters */}
            <Card className="p-4 bg-slate-800/50 border-slate-700 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-orange-400" />
                  <span className="text-white font-medium">Filters:</span>
                </div>
                
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Players</SelectItem>
                    <SelectItem value="singles" className="text-white">Singles Only</SelectItem>
                    <SelectItem value="doubles" className="text-white">Doubles Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </Card>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map(player => (
                <ArenaPlayerCard
                  key={player.id}
                  player={player}
                  onChallenge={handleChallenge}
                  onViewProfile={() => {}}
                  onPartnerUp={(player) => {
                    // Directly partner with the selected player
                    toast({
                      title: "🤝 Partnership Request Sent!",
                      description: `Sending partnership request to ${player.name}...`,
                      duration: 2000,
                    });
                    
                    // Simulate partnership acceptance after 2 seconds
                    setTimeout(() => {
                      const partnerData: ArenaPlayer = {
                        ...player,
                        matchType: 'doubles-team' as MatchType,
                        partner: { name: 'You', id: myPlayerId }
                      };
                      
                      setMyPartner(partnerData);
                      
                      // Remove partnered player from available players
                      setArenaPlayers(prev => prev.filter(p => p.id !== player.id));
                      
                      toast({
                        title: "🎉 Partnership Formed!",
                        description: `You and ${player.name} are now a doubles team! Ready to challenge other teams?`,
                        duration: 4000,
                      });
                    }, 2000);
                  }}
                  myPlayerId={myPlayerId}
                />
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No players found</h3>
                <p className="text-slate-400">Try adjusting your filters or check the Find Players tab</p>
              </div>
            )}
          </motion.div>
        )}

        {arenaMode === 'doubles' && (
          <motion.div
            key="doubles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <DoublesPartnerSystem
              onPartnerFound={(partner) => {
                // Convert PartnerProfile to ArenaPlayer format
                const arenaPartner: ArenaPlayer = {
                  ...partner,
                  status: 'online' as PlayerStatus,
                  matchType: 'doubles-team' as MatchType,
                  lastSeen: 'now'
                };
                setMyPartner(arenaPartner); // Update partner state
                toast({
                  title: "🎾 Team Ready!",
                  description: `You and ${partner.name} are now a doubles team. Ready to challenge other teams?`,
                  duration: 4000,
                });
                setTimeout(() => setArenaMode('lobby'), 2000);
              }}
            />
          </motion.div>
        )}

        {arenaMode === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Global Player Search</h3>
            <p className="text-slate-400 mb-6">Search for players beyond your local area</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Globe className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </motion.div>
        )}

        {arenaMode === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {challenges.length > 0 ? (
              challenges.map(challenge => (
                <Card key={challenge.id} className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Swords className="h-5 w-5 text-orange-400" />
                      <div>
                        <div className="text-white font-medium">
                          Challenge sent to {challenge.toPlayer.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {challenge.matchType === 'singles' ? 'Singles' : 'Doubles'} • {challenge.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Sent {challenge.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300">
                        Pending
                      </Badge>
                      <Button
                        onClick={() => {
                          // Store challenge context for match recording
                          const challengeContext = {
                            challenger: 'You',
                            challenged: challenge.toPlayer.name,
                            matchType: challenge.matchType,
                            message: challenge.message
                          };
                          sessionStorage.setItem('activeChallenge', JSON.stringify(challengeContext));
                          sessionStorage.setItem('realPlayerNames', JSON.stringify({
                            player1: 'You',
                            player2: challenge.toPlayer.name
                          }));
                          
                          // Simulate starting match
                          toast({
                            title: "🎮 Challenge Accepted!",
                            description: `${challenge.toPlayer.name} accepted your challenge. Starting match...`,
                            duration: 2000,
                          });
                          setTimeout(() => {
                            window.location.href = '/gamified-match-recording';
                          }, 2000);
                        }}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Active Challenges</h3>
                <p className="text-slate-400">Challenge players from the Arena Lobby to get started</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
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
    </div>
  );
}