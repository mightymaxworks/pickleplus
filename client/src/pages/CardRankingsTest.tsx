import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Trophy, 
  Star,
  Target,
  MapPin,
  Search,
  Filter,
  TrendingUp,
  Medal
} from 'lucide-react';

// Card-based Rankings Test Page
// Concept: Rankings as interactive passport cards instead of traditional tables

type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';
type RankingView = 'global' | 'local' | 'tier';
type RankingCategory = 'singles' | 'doubles' | 'mixed';

interface RankedPlayer {
  id: string;
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  rank: number;
  location: string;
  recentChange: number; // +/- points from last week
  winRate: number;
  matchesPlayed: number;
  avatar?: string;
}

const tierConfig = {
  recreational: {
    name: 'Recreational',
    color: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-400',
    icon: Users,
  },
  competitive: {
    name: 'Competitive', 
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400',
    icon: Target,
  },
  elite: {
    name: 'Elite',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-400',
    icon: Star,
  },
  professional: {
    name: 'Professional',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-400',
    icon: Trophy,
  },
};

// Mock ranking data with player avatars
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
  {
    id: '4',
    name: 'Emma Wilson',
    tier: 'elite', 
    rankingPoints: 1523,
    rank: 4,
    location: 'Calgary, AB',
    recentChange: +89,
    winRate: 0.85,
    matchesPlayed: 98,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'David Kim',
    tier: 'elite',
    rankingPoints: 1456,
    rank: 5,
    location: 'Vancouver, BC',
    recentChange: -5,
    winRate: 0.79,
    matchesPlayed: 167,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '6',
    name: 'Lisa Zhang',
    tier: 'competitive',
    rankingPoints: 892,
    rank: 6,
    location: 'Vancouver, BC',
    recentChange: +156,
    winRate: 0.76,
    matchesPlayed: 87,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '7',
    name: 'James Wilson',
    tier: 'competitive',
    rankingPoints: 743,
    rank: 7,
    location: 'Vancouver, BC',
    recentChange: +12,
    winRate: 0.71,
    matchesPlayed: 92,
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '8',
    name: 'Anna Kim',
    tier: 'competitive',
    rankingPoints: 687,
    rank: 8,
    location: 'Vancouver, BC',
    recentChange: -8,
    winRate: 0.68,
    matchesPlayed: 78,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
  },
];

// Your position in rankings
const currentPlayer: RankedPlayer = {
  id: 'current',
  name: 'You',
  tier: 'elite',
  rankingPoints: 1247,
  rank: 847,
  location: 'Vancouver, BC',
  recentChange: +34,
  winRate: 0.73,
  matchesPlayed: 89,
};

function PlayerRankingCard({ 
  player, 
  isCurrentPlayer = false,
  showDetails = false,
  isPodium = false
}: { 
  player: RankedPlayer; 
  isCurrentPlayer?: boolean;
  showDetails?: boolean;
  isPodium?: boolean;
}) {
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  // Generate initials fallback
  const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: isPodium ? 1.05 : 1.02, y: -5 }}
      className={`relative overflow-hidden ${isCurrentPlayer ? 'ring-2 ring-orange-400' : ''} ${
        isPodium ? 'w-full' : ''
      }`}
    >
      <Card className={`p-4 bg-gradient-to-r ${config.color} border-2 ${config.borderColor}/30 hover:${config.borderColor}/60 transition-all cursor-pointer ${
        isPodium && player.rank === 1 ? 'scale-110 border-yellow-400/60' : ''
      }`}>
        {/* Rank Badge */}
        <div className="absolute top-2 left-2">
          {player.rank <= 3 ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-yellow-900 font-bold text-sm">
              {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
            </div>
          ) : (
            <Badge className="bg-white/20 text-white font-bold">
              #{player.rank}
            </Badge>
          )}
        </div>

        {/* Recent Change Indicator */}
        <div className="absolute top-2 right-2">
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

        {/* Main Content */}
        <div className="mt-8">
          {/* Player Info */}
          <div className="text-center mb-4">
            {/* Player Avatar */}
            <div className="w-16 h-16 mx-auto mb-3">
              {player.avatar ? (
                <img 
                  src={player.avatar} 
                  alt={player.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-white font-bold text-lg">{initials}</span>
                </div>
              )}
            </div>
            <h3 className={`font-bold text-white ${isPodium ? 'text-lg' : 'text-base'}`}>
              {isCurrentPlayer ? `${player.name} (You)` : player.name}
            </h3>
            <div className="flex items-center justify-center text-white/80 text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {player.location}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span className="text-sm">Points</span>
              <span className="font-bold">{player.rankingPoints.toLocaleString()}</span>
            </div>
            
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-white/90 text-sm">
                  <span>Win Rate</span>
                  <span>{(player.winRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-white/90 text-sm">
                  <span>Matches</span>
                  <span>{player.matchesPlayed}</span>
                </div>
                <div className="mt-2">
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${player.winRate * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tier Badge */}
          <div className="mt-4 text-center">
            <Badge className="bg-white/20 text-white px-3 py-1">
              {config.name}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function RankingFilters({ 
  view, 
  onViewChange, 
  category, 
  onCategoryChange,
  searchTerm,
  onSearchChange 
}: {
  view: RankingView;
  onViewChange: (view: RankingView) => void;
  category: RankingCategory;
  onCategoryChange: (category: RankingCategory) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white"
        />
      </div>

      {/* View Filters */}
      <div className="flex gap-2">
        {(['global', 'local', 'tier'] as RankingView[]).map((viewOption) => (
          <Button
            key={viewOption}
            size="sm"
            variant={view === viewOption ? 'default' : 'outline'}
            onClick={() => onViewChange(viewOption)}
            className="capitalize flex-1"
          >
            {viewOption === 'local' && <MapPin className="h-3 w-3 mr-1" />}
            {viewOption === 'tier' && <Star className="h-3 w-3 mr-1" />}
            {viewOption === 'global' && <Trophy className="h-3 w-3 mr-1" />}
            {viewOption}
          </Button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
        {(['singles', 'doubles', 'mixed'] as RankingCategory[]).map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={category === cat ? 'default' : 'outline'}
            onClick={() => onCategoryChange(cat)}
            className="capitalize flex-1"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}

function YourPositionCard({ player }: { player: RankedPlayer }) {
  return (
    <Card className="p-4 bg-gradient-to-r from-orange-600 to-orange-700 border-2 border-orange-400/50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Medal className="h-5 w-5 text-white" />
          <span className="text-white font-semibold">Your Position</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">#{player.rank}</div>
            <div className="text-orange-100 text-xs">Global Rank</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{player.rankingPoints}</div>
            <div className="text-orange-100 text-xs">Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{(player.winRate * 100).toFixed(0)}%</div>
            <div className="text-orange-100 text-xs">Win Rate</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-300" />
          <span className="text-green-300 text-sm font-medium">+{player.recentChange} this week</span>
        </div>
      </div>
    </Card>
  );
}

export default function CardRankingsTest() {
  const [view, setView] = useState<RankingView>('local');
  const [category, setCategory] = useState<RankingCategory>('singles');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (playerId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(playerId)) {
      newExpanded.delete(playerId);
    } else {
      newExpanded.add(playerId);
    }
    setExpandedCards(newExpanded);
  };

  // Filter rankings based on current view
  const filteredRankings = mockRankings.filter(player => {
    if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (view === 'local') {
      return player.location.includes('Vancouver');
    }
    
    if (view === 'tier') {
      return player.tier === currentPlayer.tier;
    }
    
    return true; // global view shows all
  });

  // Split into podium (top 3) and rest
  const podiumPlayers = filteredRankings.slice(0, 3);
  const listPlayers = filteredRankings.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Card-Based Rankings Test</h1>
          <p className="text-slate-400">Interactive passport cards instead of traditional ranking tables</p>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-slate-800/50 border-slate-700 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-slate-400" />
                <h3 className="text-white font-semibold">Filters</h3>
              </div>
              
              <RankingFilters
                view={view}
                onViewChange={setView}
                category={category}
                onCategoryChange={setCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              {/* Context Info */}
              <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
                <div className="text-slate-300 text-sm">
                  <div className="font-medium mb-1">Showing:</div>
                  <div className="capitalize">{view} • {category}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {filteredRankings.length} players
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Rankings Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Your Position */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Your Position
              </h3>
              <YourPositionCard player={currentPlayer} />
            </div>

            {/* Podium - Top 3 */}
            {podiumPlayers.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-6 flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Top Performers
                </h3>
                
                <div className="flex justify-center items-end gap-4 mb-8">
                  {/* 2nd place */}
                  {podiumPlayers[1] && (
                    <motion.div
                      className="w-40"
                      onClick={() => toggleCardExpansion(podiumPlayers[1].id)}
                    >
                      <PlayerRankingCard
                        player={podiumPlayers[1]}
                        showDetails={expandedCards.has(podiumPlayers[1].id)}
                        isPodium={true}
                      />
                    </motion.div>
                  )}
                  
                  {/* 1st place - elevated */}
                  {podiumPlayers[0] && (
                    <motion.div
                      className="w-44 -mt-8"
                      onClick={() => toggleCardExpansion(podiumPlayers[0].id)}
                    >
                      <PlayerRankingCard
                        player={podiumPlayers[0]}
                        showDetails={expandedCards.has(podiumPlayers[0].id)}
                        isPodium={true}
                      />
                    </motion.div>
                  )}
                  
                  {/* 3rd place */}
                  {podiumPlayers[2] && (
                    <motion.div
                      className="w-40"
                      onClick={() => toggleCardExpansion(podiumPlayers[2].id)}
                    >
                      <PlayerRankingCard
                        player={podiumPlayers[2]}
                        showDetails={expandedCards.has(podiumPlayers[2].id)}
                        isPodium={true}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Rest of Rankings */}
            {listPlayers.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Medal className="h-4 w-4 mr-2" />
                  {view === 'global' ? 'Global Rankings' : 
                   view === 'local' ? 'Local Rankings (Vancouver)' : 
                   `${tierConfig[currentPlayer.tier].name} Tier Rankings`}
                </h3>
                
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {listPlayers.map((player) => (
                      <motion.div
                        key={player.id}
                        onClick={() => toggleCardExpansion(player.id)}
                      >
                        <PlayerRankingCard
                          player={player}
                          showDetails={expandedCards.has(player.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {filteredRankings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400">No players found matching your criteria</div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 p-4 bg-slate-800/30 rounded-lg">
          <p className="text-slate-400 text-sm">
            💡 Click on ranking cards to expand details • Use filters to explore different views
          </p>
        </div>
      </div>
    </div>
  );
}