import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Trophy, 
  BarChart3, 
  Settings, 
  Gamepad2,
  Users,
  QrCode,
  Gift,
  Star,
  MapPin,
  Target,
  TrendingUp,
  Medal,
  Camera,
  Edit,
  Check,
  X,
  ChevronRight,
  Dumbbell,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Types from our previous implementations
interface PlayerData {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  picklePoints: number;
  globalRank: number;
  localRank: number;
  avatar?: string;
  passportCode: string;
  recentChange: number;
  winRate: number;
  nextMilestone: {
    tier: string;
    pointsNeeded: number;
  };
}

interface RankedPlayer {
  id: string;
  name: string;
  tier: 'recreational' | 'competitive' | 'elite' | 'professional';
  rankingPoints: number;
  rank: number;
  location: string;
  recentChange: number;
  winRate: number;
  matchesPlayed: number;
  avatar?: string;
}

type TabMode = 'passport' | 'play' | 'rankings' | 'profile';

const tierConfig = {
  recreational: { name: 'Recreational', color: 'from-slate-500 to-slate-600', icon: User },
  competitive: { name: 'Competitive', color: 'from-blue-500 to-blue-600', icon: Target },
  elite: { name: 'Elite', color: 'from-purple-500 to-purple-600', icon: Star },
  professional: { name: 'Professional', color: 'from-orange-500 to-orange-600', icon: Trophy },
};

// Mock data with more complete rankings for 4-8 display
const mockPlayer: PlayerData = {
  id: 'current',
  name: 'Alex Chen',
  tier: 'elite',
  rankingPoints: 1247,
  picklePoints: 89,
  globalRank: 847,
  localRank: 23,
  passportCode: 'ALEX1234',
  recentChange: +34,
  winRate: 0.73,
  nextMilestone: {
    tier: 'Professional',
    pointsNeeded: 553,
  },
};

const mockRankings: RankedPlayer[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    tier: 'professional',
    rankingPoints: 2156,
    rank: 1,
    location: 'Vancouver, BC',
    recentChange: +47,
    winRate: 0.89,
    matchesPlayed: 156,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c179e845?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2', 
    name: 'Mike Johnson',
    tier: 'professional',
    rankingPoints: 2089,
    rank: 2,
    location: 'Toronto, ON',
    recentChange: -12,
    winRate: 0.87,
    matchesPlayed: 203,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Alex Chen',
    tier: 'elite',
    rankingPoints: 1647,
    rank: 3,
    location: 'Vancouver, BC',
    recentChange: +23,
    winRate: 0.82,
    matchesPlayed: 134,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  // Ranks 4-8 for card display
  {
    id: '4',
    name: 'Jessica Liu',
    tier: 'elite',
    rankingPoints: 1523,
    rank: 4,
    location: 'Vancouver, BC',
    recentChange: +15,
    winRate: 0.79,
    matchesPlayed: 98,
  },
  {
    id: '5',
    name: 'David Kim',
    tier: 'elite',
    rankingPoints: 1456,
    rank: 5,
    location: 'Richmond, BC',
    recentChange: -8,
    winRate: 0.74,
    matchesPlayed: 112,
  },
  {
    id: '6',
    name: 'Maria Santos',
    tier: 'elite',
    rankingPoints: 1398,
    rank: 6,
    location: 'Burnaby, BC',
    recentChange: +22,
    winRate: 0.81,
    matchesPlayed: 87,
  },
  {
    id: '7',
    name: 'Robert Wilson',
    tier: 'competitive',
    rankingPoints: 1367,
    rank: 7,
    location: 'Surrey, BC',
    recentChange: +5,
    winRate: 0.77,
    matchesPlayed: 134,
  },
  {
    id: '8',
    name: 'Linda Chang',
    tier: 'competitive',
    rankingPoints: 1298,
    rank: 8,
    location: 'Vancouver, BC',
    recentChange: -3,
    winRate: 0.73,
    matchesPlayed: 156,
  },
  // Additional players for row display
  {
    id: '9',
    name: 'Tom Anderson',
    tier: 'competitive',
    rankingPoints: 1276,
    rank: 9,
    location: 'Coquitlam, BC',
    recentChange: +12,
    winRate: 0.69,
    matchesPlayed: 89,
  },
  {
    id: '10',
    name: 'Lisa Park',
    tier: 'competitive',
    rankingPoints: 1254,
    rank: 10,
    location: 'Vancouver, BC',
    recentChange: +7,
    winRate: 0.71,
    matchesPlayed: 102,
  },
];

// Notifications Header Component
function NotificationsHeader({ player }: { player: PlayerData }) {
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  return (
    <motion.div 
      className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between">
        {/* Player Identity */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center`}>
            <TierIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">{player.name}</div>
            <div className="text-slate-400 text-sm">🎫 {player.passportCode}</div>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
            3 new matches
          </Badge>
          <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
            +{player.recentChange} pts
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// PlayerRankingCard Component (for ranks 4-8)
function PlayerRankingCard({ 
  player, 
  showDetails = false,
  isPodium = false
}: { 
  player: RankedPlayer; 
  showDetails?: boolean;
  isPodium?: boolean;
}) {
  const config = tierConfig[player.tier];
  const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800 border-slate-700 rounded-lg border overflow-hidden hover:bg-slate-700/50 transition-colors cursor-pointer ${
        isPodium ? 'shadow-lg' : ''
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {/* Rank */}
          <div className="flex-shrink-0">
            {player.rank <= 3 ? (
              <div className="text-2xl">
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
              </div>
            ) : (
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">#{player.rank}</span>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-12 h-12">
            {player.avatar ? (
              <img 
                src={player.avatar} 
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{initials}</span>
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold truncate">{player.name}</div>
            <div className="text-slate-400 text-sm flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {player.location}
            </div>
          </div>

          {/* Recent Change */}
          <Badge 
            className={`text-xs ${
              player.recentChange > 0 
                ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                : player.recentChange < 0
                ? 'bg-red-500/20 text-red-300 border-red-400/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-400/30'
            }`}
          >
            {player.recentChange > 0 ? '+' : ''}{player.recentChange}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-white">{player.rankingPoints.toLocaleString()}</div>
            <div className="text-slate-400 text-xs">Points</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{(player.winRate * 100).toFixed(0)}%</div>
            <div className="text-slate-400 text-xs">Win Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{player.matchesPlayed}</div>
            <div className="text-slate-400 text-xs">Matches</div>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="mt-3">
          <Badge className={`text-xs ${config.name === 'Professional' ? 'bg-orange-500/20 text-orange-300' : 
            config.name === 'Elite' ? 'bg-purple-500/20 text-purple-300' : 
            'bg-blue-500/20 text-blue-300'}`}>
            {config.name}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// Navigation Tabs Component
function NavigationTabs({ activeTab, onTabChange }: { activeTab: TabMode; onTabChange: (tab: TabMode) => void }) {
  const tabs = [
    { id: 'passport' as TabMode, label: 'Passport', icon: User },
    { id: 'play' as TabMode, label: 'Play', icon: Gamepad2 },
    { id: 'rankings' as TabMode, label: 'Rankings', icon: Trophy },
    { id: 'profile' as TabMode, label: 'Profile', icon: Settings },
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

// Passport Mode Content - Full passport display
function PassportModeContent({ player }: { player: PlayerData }) {
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Full Passport Card */}
      <Card className={`p-6 bg-gradient-to-br ${config.color} border border-white/20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="relative text-white">
          {/* Player Avatar and Info */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
              <TierIcon className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold mb-1">{player.name}</h2>
            <Badge className="bg-white/30 text-white px-4 py-2 text-base">{config.name} Player</Badge>
            <div className="text-white/90 text-lg mt-2">🎫 {player.passportCode}</div>
          </div>
          
          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{player.rankingPoints.toLocaleString()}</div>
              <div className="text-white/90">Ranking Points</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{player.picklePoints}</div>
              <div className="text-white/90">Pickle Points</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Progress to {player.nextMilestone.tier}</span>
              <span>{player.nextMilestone.pointsNeeded} points needed</span>
            </div>
            <div className="bg-white/30 rounded-full h-3">
              <div className="bg-white rounded-full h-3 w-3/4 transition-all duration-1000" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Users className="h-4 w-4 mr-2" />
              Find Game
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </div>
      </Card>

      {/* Position Summary */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Medal className="h-4 w-4 mr-2 text-orange-400" />
          Your Position
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">#{player.globalRank}</div>
            <div className="text-slate-400 text-sm">Global</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">#{player.localRank}</div>
            <div className="text-slate-400 text-sm">Local</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{(player.winRate * 100).toFixed(0)}%</div>
            <div className="text-slate-400 text-sm">Win Rate</div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
            <div>
              <div className="text-white font-medium">Won against Sarah M.</div>
              <div className="text-slate-400 text-sm">2 hours ago</div>
            </div>
            <Badge className="bg-green-500/20 text-green-300">+4.5 pts</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
            <div>
              <div className="text-white font-medium">Lost to Mike J.</div>
              <div className="text-slate-400 text-sm">Yesterday</div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300">+1.5 pts</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Play Mode Content
function PlayModeContent() {
  return (
    <div className="space-y-6">
      {/* Quick Match */}
      <Card className="p-6 bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white">
        <div className="text-center">
          <Gamepad2 className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Quick Match</h3>
          <p className="text-green-100 mb-4">Find players near you right now</p>
          <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Users className="h-4 w-4 mr-2" />
            Find Game Now
          </Button>
        </div>
      </Card>

      {/* Match Types */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <h4 className="text-white font-medium">Tournament</h4>
            <p className="text-slate-400 text-sm">Competitive play</p>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer">
          <div className="text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-white font-medium">Casual</h4>
            <p className="text-slate-400 text-sm">Fun games</p>
          </div>
        </Card>
      </div>

      {/* Nearby Players */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-orange-400" />
          Nearby Players
        </h3>
        <div className="space-y-3">
          {mockRankings.slice(0, 3).map((player) => {
            const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();
            return (
              <div key={player.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{initials}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-slate-400 text-sm">{player.location}</div>
                  </div>
                </div>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Invite
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* QR Scanner */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Scan to Join</h3>
          <p className="text-slate-400 text-sm mb-4">Scan another player's QR code to connect</p>
          <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
            Open Scanner
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Rankings Mode Content
function RankingsModeContent({ player }: { player: PlayerData }) {
  const [selectedCategory, setSelectedCategory] = useState('singles');
  const [selectedView, setSelectedView] = useState('local');
  
  // Split rankings for hybrid display
  const podiumPlayers = mockRankings.slice(0, 3);
  const cardPlayers = mockRankings.slice(3, 8);
  const rowPlayers = mockRankings.slice(8);

  return (
    <div className="space-y-6">
      {/* Category & View Filters */}
      <div className="space-y-3">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {['singles', 'doubles', 'mixed'].map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className={`flex-1 capitalize text-xs ${
                selectedCategory === category 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'text-white hover:bg-slate-700'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {['Local', 'Regional', 'Global'].map((view) => (
            <Button
              key={view}
              size="sm"
              variant={selectedView.toLowerCase() === view.toLowerCase() ? 'default' : 'outline'}
              className={`flex-1 text-xs ${
                selectedView.toLowerCase() === view.toLowerCase() 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'text-white border-slate-600 hover:bg-slate-700'
              }`}
              onClick={() => setSelectedView(view.toLowerCase())}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      {/* Your Position */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400">
        <div className="text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Position</h3>
            <Badge className="bg-white/20 text-white text-xs">+{player.recentChange} this week</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">#{player.globalRank}</div>
              <div className="text-orange-100 text-xs">Global</div>
            </div>
            <div>
              <div className="text-xl font-bold">#{player.localRank}</div>
              <div className="text-orange-100 text-xs">Local</div>
            </div>
            <div>
              <div className="text-xl font-bold">{player.rankingPoints}</div>
              <div className="text-orange-100 text-xs">Points</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top 3 Podium */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-orange-400" />
          Local Leaders
        </h3>
        <div className="flex justify-center items-end gap-4 mb-4">
          {/* 2nd place */}
          <div className="w-20 text-center">
            <div className="w-12 h-12 mx-auto mb-2">
              {podiumPlayers[1]?.avatar ? (
                <img src={podiumPlayers[1].avatar} alt={podiumPlayers[1].name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {podiumPlayers[1]?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl mb-1">🥈</div>
            <div className="text-white text-sm font-medium">{podiumPlayers[1]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">{podiumPlayers[1]?.rankingPoints}</div>
          </div>
          
          {/* 1st place - elevated */}
          <div className="w-24 text-center -mt-4">
            <div className="w-16 h-16 mx-auto mb-2">
              {podiumPlayers[0]?.avatar ? (
                <img src={podiumPlayers[0].avatar} alt={podiumPlayers[0].name} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" />
              ) : (
                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center border-2 border-yellow-400">
                  <span className="text-white font-medium">
                    {podiumPlayers[0]?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-3xl mb-1">🥇</div>
            <div className="text-white font-bold">{podiumPlayers[0]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-sm">{podiumPlayers[0]?.rankingPoints}</div>
          </div>
          
          {/* 3rd place */}
          <div className="w-20 text-center">
            <div className="w-12 h-12 mx-auto mb-2">
              {podiumPlayers[2]?.avatar ? (
                <img src={podiumPlayers[2].avatar} alt={podiumPlayers[2].name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {podiumPlayers[2]?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl mb-1">🥉</div>
            <div className="text-white text-sm font-medium">{podiumPlayers[2]?.name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">{podiumPlayers[2]?.rankingPoints}</div>
          </div>
        </div>
      </Card>

      {/* Leading Contenders (4-8) */}
      {cardPlayers.length > 0 && (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Medal className="h-4 w-4 mr-2 text-orange-400" />
            Leading Contenders
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {cardPlayers.map((rankedPlayer) => (
                <PlayerRankingCard
                  key={rankedPlayer.id}
                  player={rankedPlayer}
                />
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Players Around You */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-400" />
          Players Near You
        </h3>
        <div className="space-y-2">
          {[
            { name: 'David Kim', rank: 22, points: 1251, change: '+3' },
            { name: 'You', rank: 23, points: 1247, change: '+34', isYou: true },
            { name: 'Lisa Zhang', rank: 24, points: 1243, change: '-2' },
          ].map((contextPlayer, i) => (
            <div key={i} className={`flex items-center justify-between p-2 rounded ${
              contextPlayer.isYou ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-slate-700/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`font-bold ${contextPlayer.isYou ? 'text-orange-300' : 'text-white'}`}>
                  #{contextPlayer.rank}
                </div>
                <div>
                  <div className={`font-medium ${contextPlayer.isYou ? 'text-orange-200' : 'text-white'}`}>
                    {contextPlayer.name}
                  </div>
                  <div className="text-slate-400 text-xs">{contextPlayer.points.toLocaleString()} points</div>
                </div>
              </div>
              <Badge className={contextPlayer.change.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                {contextPlayer.change}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
          <BarChart3 className="h-4 w-4 mr-2" />
          Full Rankings
        </Button>
        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
          <Users className="h-4 w-4 mr-2" />
          Challenge Player
        </Button>
      </div>
    </div>
  );
}

// Profile Mode Content - Comprehensive version with all fields
function ProfileModeContent({ player }: { player: PlayerData }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  const [profile, setProfile] = useState({
    // Basic Info
    displayName: player.name,
    email: 'alex.chen@example.com',
    firstName: 'Alex',
    lastName: 'Chen',
    location: 'Vancouver, BC',
    bio: 'Passionate pickleball player always looking to improve.',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    
    // Playing Profile
    skillLevel: '4.0',
    playingStyle: 'Aggressive baseline',
    dominantHand: 'right',
    preferredPosition: 'Right side',
    preferredFormat: 'Doubles',
    playingSince: '3 years',
    regularSchedule: 'Weekends, Tuesday evenings',
    
    // Equipment
    paddleBrand: 'Selkirk',
    paddleModel: 'Amped Epic',
    backupPaddleBrand: 'JOOLA',
    backupPaddleModel: 'Ben Johns Hyperion',
    apparelBrand: 'HEAD',
    shoesBrand: 'K-Swiss',
    
    // Physical
    height: 175,
    reach: 180,
    fitnessLevel: 'Good',
    
    // Skill Assessment (1-10)
    forehandStrength: 7,
    backhandStrength: 6,
    servePower: 8,
    dinkAccuracy: 7,
    thirdShotConsistency: 6,
    courtCoverage: 8,
    
    // Preferences
    preferredSurface: 'Outdoor courts',
    indoorOutdoorPreference: 'both',
    competitiveIntensity: 7,
    lookingForPartners: true,
    mentorshipInterest: false,
    preferredMatchDuration: '1-2 hours',
    travelRadiusKm: 25,
    
    // External Ratings
    duprRating: '4.2',
    utprRating: '4.1',
    wprRating: '',
    
    // Privacy
    privacyProfile: 'standard',
    languagePreference: 'en',
  });

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Skill Assessment Slider Component
  const SkillSlider = ({ label, value, field }: { label: string; value: number; field: string }) => (
    <div className="p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-medium">{label}</div>
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(newValue) => updateProfile(field, newValue[0])}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Poor (1)</span>
        <span>Excellent (10)</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={`p-6 bg-gradient-to-r ${config.color} border border-white/20 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <div className="relative text-white text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <TierIcon className="h-10 w-10" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
          <Badge className="bg-white/30 text-white px-3 py-1">
            {config.name} Player
          </Badge>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <User className="h-4 w-4 mr-2 text-orange-400" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">First Name</label>
            <Input
              value={profile.firstName}
              onChange={(e) => updateProfile('firstName', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Last Name</label>
            <Input
              value={profile.lastName}
              onChange={(e) => updateProfile('lastName', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Email</label>
            <Input
              value={profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              type="email"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Location</label>
            <Input
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Birth Date</label>
            <Input
              value={profile.dateOfBirth}
              onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
              type="date"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Gender</label>
            <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="male" className="text-white">Male</SelectItem>
                <SelectItem value="female" className="text-white">Female</SelectItem>
                <SelectItem value="other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-400 mb-1 block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => updateProfile('bio', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Playing Profile */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Gamepad2 className="h-4 w-4 mr-2 text-orange-400" />
          Playing Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Skill Level</label>
            <Select value={profile.skillLevel} onValueChange={(value) => updateProfile('skillLevel', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="2.0" className="text-white">2.0 - Beginner</SelectItem>
                <SelectItem value="2.5" className="text-white">2.5 - Novice</SelectItem>
                <SelectItem value="3.0" className="text-white">3.0 - Beginner+</SelectItem>
                <SelectItem value="3.5" className="text-white">3.5 - Intermediate</SelectItem>
                <SelectItem value="4.0" className="text-white">4.0 - Advanced</SelectItem>
                <SelectItem value="4.5" className="text-white">4.5 - Expert</SelectItem>
                <SelectItem value="5.0+" className="text-white">5.0+ - Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Playing Style</label>
            <Select value={profile.playingStyle} onValueChange={(value) => updateProfile('playingStyle', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Aggressive baseline" className="text-white">Aggressive Baseline</SelectItem>
                <SelectItem value="Defensive baseline" className="text-white">Defensive Baseline</SelectItem>
                <SelectItem value="Net rusher" className="text-white">Net Rusher</SelectItem>
                <SelectItem value="All-court" className="text-white">All-Court</SelectItem>
                <SelectItem value="Counter puncher" className="text-white">Counter Puncher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Dominant Hand</label>
            <Select value={profile.dominantHand} onValueChange={(value) => updateProfile('dominantHand', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="right" className="text-white">Right</SelectItem>
                <SelectItem value="left" className="text-white">Left</SelectItem>
                <SelectItem value="ambidextrous" className="text-white">Ambidextrous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Preferred Position</label>
            <Select value={profile.preferredPosition} onValueChange={(value) => updateProfile('preferredPosition', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Left side" className="text-white">Left Side (Forehand)</SelectItem>
                <SelectItem value="Right side" className="text-white">Right Side (Backhand)</SelectItem>
                <SelectItem value="Either" className="text-white">Either Side</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Preferred Format</label>
            <Select value={profile.preferredFormat} onValueChange={(value) => updateProfile('preferredFormat', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Singles" className="text-white">Singles</SelectItem>
                <SelectItem value="Doubles" className="text-white">Doubles</SelectItem>
                <SelectItem value="Mixed doubles" className="text-white">Mixed Doubles</SelectItem>
                <SelectItem value="Any" className="text-white">Any Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Playing Since</label>
            <Input
              value={profile.playingSince}
              onChange={(e) => updateProfile('playingSince', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 2 years, 6 months"
            />
          </div>
        </div>
      </Card>

      {/* Skill Assessment */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-400" />
          Skill Assessment
        </h3>
        <div className="space-y-4">
          <SkillSlider label="Forehand Strength" value={profile.forehandStrength} field="forehandStrength" />
          <SkillSlider label="Backhand Strength" value={profile.backhandStrength} field="backhandStrength" />
          <SkillSlider label="Serve Power" value={profile.servePower} field="servePower" />
          <SkillSlider label="Dink Accuracy" value={profile.dinkAccuracy} field="dinkAccuracy" />
          <SkillSlider label="Third Shot Consistency" value={profile.thirdShotConsistency} field="thirdShotConsistency" />
          <SkillSlider label="Court Coverage" value={profile.courtCoverage} field="courtCoverage" />
        </div>
      </Card>

      {/* Equipment */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2 text-orange-400" />
          Equipment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Paddle Brand</label>
            <Input
              value={profile.paddleBrand}
              onChange={(e) => updateProfile('paddleBrand', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., Selkirk, JOOLA, HEAD"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Paddle Model</label>
            <Input
              value={profile.paddleModel}
              onChange={(e) => updateProfile('paddleModel', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., Amped Epic, Ben Johns Hyperion"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Apparel Brand</label>
            <Input
              value={profile.apparelBrand}
              onChange={(e) => updateProfile('apparelBrand', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Preferred clothing brand"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Shoes Brand</label>
            <Input
              value={profile.shoesBrand}
              onChange={(e) => updateProfile('shoesBrand', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Court shoe brand"
            />
          </div>
        </div>
      </Card>

      {/* Physical Profile */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Dumbbell className="h-4 w-4 mr-2 text-orange-400" />
          Physical Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Height (cm)</label>
            <Input
              value={profile.height}
              onChange={(e) => updateProfile('height', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Reach (cm)</label>
            <Input
              value={profile.reach}
              onChange={(e) => updateProfile('reach', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Fitness Level</label>
            <Select value={profile.fitnessLevel} onValueChange={(value) => updateProfile('fitnessLevel', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="Excellent" className="text-white">Excellent</SelectItem>
                <SelectItem value="Good" className="text-white">Good</SelectItem>
                <SelectItem value="Average" className="text-white">Average</SelectItem>
                <SelectItem value="Fair" className="text-white">Fair</SelectItem>
                <SelectItem value="Poor" className="text-white">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* External Ratings */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-orange-400" />
          External Ratings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">DUPR Rating</label>
            <Input
              value={profile.duprRating}
              onChange={(e) => updateProfile('duprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">UTPR Rating</label>
            <Input
              value={profile.utprRating}
              onChange={(e) => updateProfile('utprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.1"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">WPR Rating</label>
            <Input
              value={profile.wprRating}
              onChange={(e) => updateProfile('wprRating', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="e.g., 4.0"
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Settings className="h-4 w-4 mr-2 text-orange-400" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Preferred Surface</label>
              <Select value={profile.preferredSurface} onValueChange={(value) => updateProfile('preferredSurface', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Outdoor courts" className="text-white">Outdoor Courts</SelectItem>
                  <SelectItem value="Indoor courts" className="text-white">Indoor Courts</SelectItem>
                  <SelectItem value="Both" className="text-white">Both Indoor/Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Match Duration</label>
              <Select value={profile.preferredMatchDuration} onValueChange={(value) => updateProfile('preferredMatchDuration', value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="30 minutes" className="text-white">30 minutes</SelectItem>
                  <SelectItem value="1 hour" className="text-white">1 hour</SelectItem>
                  <SelectItem value="1-2 hours" className="text-white">1-2 hours</SelectItem>
                  <SelectItem value="2+ hours" className="text-white">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Looking for Partners</div>
              <div className="text-sm text-slate-400">Open to playing with new people</div>
            </div>
            <Switch
              checked={profile.lookingForPartners}
              onCheckedChange={(checked) => updateProfile('lookingForPartners', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Mentorship Interest</div>
              <div className="text-sm text-slate-400">Open to coaching opportunities</div>
            </div>
            <Switch
              checked={profile.mentorshipInterest}
              onCheckedChange={(checked) => updateProfile('mentorshipInterest', checked)}
            />
          </div>
          
          <SkillSlider label="Competitive Intensity" value={profile.competitiveIntensity} field="competitiveIntensity" />
          
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Travel Radius (km)</label>
            <Input
              value={profile.travelRadiusKm}
              onChange={(e) => updateProfile('travelRadiusKm', Number(e.target.value))}
              type="number"
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="How far will you travel?"
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40"
          >
            <Button
              onClick={() => setHasUnsavedChanges(false)}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg px-8"
            >
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UnifiedPrototype() {
  const [activeTab, setActiveTab] = useState<TabMode>('passport');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Notifications Header */}
      <NotificationsHeader player={mockPlayer} />
      
      {/* Content Area */}
      <div className="p-4 pb-24"> {/* pb-24 for bottom nav space */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'passport' && <PassportModeContent player={mockPlayer} />}
            {activeTab === 'play' && <PlayModeContent />}
            {activeTab === 'rankings' && <RankingsModeContent player={mockPlayer} />}
            {activeTab === 'profile' && <ProfileModeContent player={mockPlayer} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}