import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  X,
  IdCard,
  UserCog
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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

const SimpleMatchArena: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [arenaMode, setArenaMode] = useState<'lobby' | 'doubles' | 'challenges' | 'search'>('lobby');
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock players data
  const [arenaPlayers] = useState<ArenaPlayer[]>([
    {
      id: '1',
      name: 'Alex Thunder',
      tier: 'competitive',
      rankingPoints: 1250,
      status: 'online',
      location: 'Downtown Courts',
      distance: 0.8,
      matchType: 'singles',
      winRate: 73.5,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'singles'
    },
    {
      id: '2', 
      name: 'Sarah Ace',
      tier: 'elite',
      rankingPoints: 1850,
      status: 'available',
      location: 'Riverside Park',
      distance: 2.1,
      matchType: 'doubles-looking',
      winRate: 81.2,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'doubles'
    },
    {
      id: '3',
      name: 'Mike Smash',
      tier: 'professional',
      rankingPoints: 2150,
      status: 'in-match',
      location: 'Elite Center',
      distance: 1.5,
      matchType: 'singles',
      winRate: 89.4,
      isOnline: true,
      lastSeen: 'now',
      preferredFormat: 'both'
    }
  ]);

  const filteredPlayers = arenaPlayers.filter(player => {
    if (filterType === 'singles' && player.matchType !== 'singles') return false;
    if (filterType === 'doubles' && !player.matchType.includes('doubles')) return false;
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const onlineCount = arenaPlayers.filter(p => p.isOnline).length;
  const availableCount = arenaPlayers.filter(p => p.status === 'available' || p.status === 'online').length;

  const handleChallenge = (player: ArenaPlayer) => {
    toast({
      title: "🎮 Challenge Sent!",
      description: `You've challenged ${player.name} to a match. Waiting for their response...`,
      duration: 3000,
    });
  };

  const handleNavigateToRecording = () => {
    setLocation('/gamified-match-recording');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
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
      </div>

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
              </Button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex justify-center gap-4 mb-6">
        <Button 
          onClick={handleNavigateToRecording}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Play className="h-4 w-4 mr-2" />
          Record Match
        </Button>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Quick Match
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 max-w-md mx-auto">
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="singles">Singles Only</SelectItem>
            <SelectItem value="doubles">Doubles Only</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto">
        {arenaMode === 'lobby' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      <p className="text-slate-400 text-sm">{player.location}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      player.status === 'online' ? 'bg-green-500' :
                      player.status === 'available' ? 'bg-blue-500' :
                      player.status === 'in-match' ? 'bg-orange-500' :
                      'bg-slate-500'
                    }
                  >
                    {player.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Ranking Points</span>
                    <span className="text-orange-400 font-semibold">{player.rankingPoints}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-green-400">{player.winRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Distance</span>
                    <span className="text-slate-300">{player.distance}km</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleChallenge(player)}
                    disabled={player.status === 'in-match'}
                    className="flex-1"
                    size="sm"
                  >
                    <Swords className="h-4 w-4 mr-1" />
                    Challenge
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {arenaMode === 'doubles' && (
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Find Doubles Partners</h3>
            <p className="text-slate-400 mb-6">Connect with players looking for doubles partners</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Users className="h-4 w-4 mr-2" />
              Find Partners
            </Button>
          </div>
        )}

        {arenaMode === 'challenges' && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Active Challenges</h3>
            <p className="text-slate-400">Challenge players from the Arena Lobby to get started</p>
          </div>
        )}

        {arenaMode === 'search' && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Global Player Search</h3>
            <p className="text-slate-400 mb-6">Search for players beyond your local area</p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Globe className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMatchArena;