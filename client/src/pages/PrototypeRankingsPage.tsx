import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IdCard, 
  Trophy, 
  BarChart3, 
  Target,
  Medal,
  X,
  Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';

// Types
type PlayerTier = 'recreational' | 'competitive' | 'elite' | 'professional';

interface RankedPlayer {
  id: string;
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  rank: number;
  location: string;
  recentChange: number;
  winRate: number;
  matchesPlayed: number;
  avatar?: string;
}

interface PlayerData {
  name: string;
  tier: PlayerTier;
  rankingPoints: number;
  globalRank: number;
  localRank: number;
  recentChange: number;
}

// Tier configuration
const tierConfig = {
  recreational: { icon: Users, name: 'Recreational', color: 'from-orange-500 to-orange-600' },
  competitive: { icon: Target, name: 'Competitive', color: 'from-blue-500 to-blue-600' },
  elite: { icon: Trophy, name: 'Elite', color: 'from-purple-500 to-purple-600' },
  professional: { icon: Medal, name: 'Professional', color: 'from-yellow-500 to-yellow-600' }
};

// Mock data
const mockPlayer: PlayerData = {
  name: 'Alex Chen',
  tier: 'competitive',
  rankingPoints: 1247,
  globalRank: 23,
  localRank: 5,
  recentChange: 34
};

const mockRankings: RankedPlayer[] = [
  { id: '1', name: 'Sarah Kim', tier: 'professional', rankingPoints: 1856, rank: 1, location: 'Vancouver, BC', recentChange: 15, winRate: 0.87, matchesPlayed: 143 },
  { id: '2', name: 'Mike Chen', tier: 'elite', rankingPoints: 1654, rank: 2, location: 'Toronto, ON', recentChange: -8, winRate: 0.82, matchesPlayed: 127 },
  { id: '3', name: 'Emma Rodriguez', tier: 'elite', rankingPoints: 1523, rank: 3, location: 'Calgary, AB', recentChange: 23, winRate: 0.79, matchesPlayed: 156 },
  { id: '4', name: 'David Park', tier: 'elite', rankingPoints: 1445, rank: 4, location: 'Montreal, QC', recentChange: 7, winRate: 0.76, matchesPlayed: 134 },
  { id: '5', name: 'Lisa Zhang', tier: 'competitive', rankingPoints: 1387, rank: 5, location: 'Vancouver, BC', recentChange: -12, winRate: 0.74, matchesPlayed: 98 }
];

// Player Ranking Card Component
function PlayerRankingCard({ player }: { player: RankedPlayer }) {
  const config = tierConfig[player.tier];
  const TierIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <Card className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center`}>
              <TierIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white text-sm">#{player.rank} {player.name}</div>
              <Badge className={player.recentChange >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                {player.recentChange >= 0 ? '+' : ''}{player.recentChange}
              </Badge>
            </div>
            <div className="text-slate-400 text-xs mt-1">{player.location}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-orange-400 font-bold text-sm">{player.rankingPoints.toLocaleString()}</div>
              <div className="text-slate-400 text-xs">{Math.round(player.winRate * 100)}% WR</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Rankings Mode Content - Enhanced with real data integration
function RankingsModeContent({ player }: { player: PlayerData }) {
  const [selectedFormat, setSelectedFormat] = useState('singles'); // singles, doubles, mixed-doubles
  const [selectedGender, setSelectedGender] = useState('men'); // men, women
  const [selectedView, setSelectedView] = useState('global'); // local, regional, global
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch real rankings data from API with format and gender specifications
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, error: leaderboardError } = useQuery({
    queryKey: ['/api/enhanced-leaderboard', selectedFormat, selectedGender, selectedView],
    queryFn: () => {
      // Convert new format structure to API format
      let apiFormat = selectedFormat;
      if (selectedFormat === 'doubles') {
        apiFormat = selectedGender === 'men' ? 'mens-doubles' : 'womens-doubles';
      } else if (selectedFormat === 'mixed-doubles') {
        apiFormat = selectedGender === 'men' ? 'mixed-doubles-men' : 'mixed-doubles-women';
      }
      
      const params = new URLSearchParams({
        format: apiFormat,
        gender: selectedGender,
        division: 'open', // Default to open division
        view: selectedView
      });
      return fetch(`/api/enhanced-leaderboard?${params}`).then(res => res.json());
    },
    enabled: true
  });
  
  // Map ranking points to tier
  const mapScoreToTier = (points: number): PlayerTier => {
    if (points >= 1800) return 'professional';
    if (points >= 1000) return 'elite';
    if (points >= 300) return 'competitive';
    return 'recreational';
  };
  
  // Transform API data to match component interface
  const transformLeaderboardData = (apiData: any[]): RankedPlayer[] => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    return apiData.map((entry, index) => ({
      id: entry.id || entry.user_id || `player-${index}`,
      name: entry.name || entry.username || `Player ${index + 1}`,
      tier: mapScoreToTier(entry.ranking_points || entry.points || 0),
      rankingPoints: entry.ranking_points || entry.points || 0,
      rank: entry.rank || index + 1,
      location: entry.location || 'Unknown',
      recentChange: entry.recent_change || entry.point_change || 0,
      winRate: entry.win_rate || (entry.wins && entry.matches ? entry.wins / entry.matches : 0.5),
      matchesPlayed: entry.matches_played || entry.matches || 0,
      avatar: entry.avatar || undefined
    }));
  };
  
  // Use real data if available, fallback to mock data
  const allRankings = isLoadingLeaderboard 
    ? mockRankings.slice(0, 5) // Show partial mock data while loading
    : transformLeaderboardData(leaderboardData?.leaderboard || leaderboardData?.players || leaderboardData || []);
  
  // If real data is empty and not loading, fallback to mock data for demo
  const rankings = allRankings.length > 0 ? allRankings : mockRankings;
  
  // Filter rankings based on search
  const filteredRankings = rankings.filter(rankedPlayer => 
    rankedPlayer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rankedPlayer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Split rankings for hybrid display
  const podiumPlayers = filteredRankings.slice(0, 3);
  const cardPlayers = filteredRankings.slice(3, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-orange-400" />
            Rankings
          </h1>
          <p className="text-slate-300">Global player leaderboards and competitive rankings</p>
        </div>

        {/* Data Source Indicator & Loading State */}
        {isLoadingLeaderboard && (
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
              <span>Loading live rankings data...</span>
            </div>
          </Card>
        )}
        
        {/* Data Source Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${!isLoadingLeaderboard && allRankings.length > 0 ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'} border-none`}>
            {!isLoadingLeaderboard && allRankings.length > 0 ? '🔄 Live Rankings Data' : '🎮 Demo Rankings Data'}
          </Badge>
          {leaderboardError && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-none">
              ⚠️ Using Demo Data
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IdCard className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players by name or location..."
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category & View Filters */}
        <div className="space-y-3">
          <div className="space-y-2">
            {/* Format Selection */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {[
                { key: 'singles', label: 'Singles' },
                { key: 'doubles', label: 'Doubles' },
                { key: 'mixed-doubles', label: 'Mixed Doubles' }
              ].map((format) => (
                <Button
                  key={format.key}
                  size="sm"
                  variant={selectedFormat === format.key ? 'default' : 'ghost'}
                  className={`flex-1 text-xs ${
                    selectedFormat === format.key 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'text-white hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedFormat(format.key)}
                >
                  {format.label}
                </Button>
              ))}
            </div>
            
            {/* Gender Selection */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {[
                { key: 'men', label: 'Men' },
                { key: 'women', label: 'Women' }
              ].map((gender) => (
                <Button
                  key={gender.key}
                  size="sm"
                  variant={selectedGender === gender.key ? 'default' : 'ghost'}
                    className={`flex-1 text-xs ${
                      selectedGender === gender.key 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedGender(gender.key)}
                  >
                    {gender.label}
                  </Button>
                ))}
              </div>
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

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-slate-400 text-sm">
            Found {filteredRankings.length} player{filteredRankings.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}

        {/* No Results */}
        {searchQuery && filteredRankings.length === 0 && (
          <Card className="p-8 bg-slate-800 border-slate-700 text-center">
            <IdCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No players found</h3>
            <p className="text-slate-400">Try adjusting your search terms</p>
          </Card>
        )}

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
                <div className={`w-12 h-12 bg-gradient-to-r ${tierConfig[podiumPlayers[1]?.tier]?.color} rounded-full flex items-center justify-center`}>
                  {podiumPlayers[1] && React.createElement(tierConfig[podiumPlayers[1].tier].icon, { className: "h-6 w-6 text-white" })}
                </div>
              </div>
              <div className="text-2xl mb-1">🥈</div>
              <div className="text-white text-sm font-medium">{podiumPlayers[1]?.name.split(' ')[0]}</div>
              <div className="text-slate-400 text-xs">{podiumPlayers[1]?.rankingPoints}</div>
            </div>
            
            {/* 1st place - elevated */}
            <div className="w-24 text-center -mt-4">
              <div className="w-16 h-16 mx-auto mb-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${tierConfig[podiumPlayers[0]?.tier]?.color} rounded-full flex items-center justify-center border-2 border-yellow-400`}>
                  {podiumPlayers[0] && React.createElement(tierConfig[podiumPlayers[0].tier].icon, { className: "h-8 w-8 text-white" })}
                </div>
              </div>
              <div className="mb-1">
                <Medal className="h-8 w-8 text-yellow-400 mx-auto" />
              </div>
              <div className="text-white font-bold">{podiumPlayers[0]?.name.split(' ')[0]}</div>
              <div className="text-slate-400 text-sm">{podiumPlayers[0]?.rankingPoints}</div>
            </div>
            
            {/* 3rd place */}
            <div className="w-20 text-center">
              <div className="w-12 h-12 mx-auto mb-2">
                <div className={`w-12 h-12 bg-gradient-to-r ${tierConfig[podiumPlayers[2]?.tier]?.color} rounded-full flex items-center justify-center`}>
                  {podiumPlayers[2] && React.createElement(tierConfig[podiumPlayers[2].tier].icon, { className: "h-6 w-6 text-white" })}
                </div>
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
    </div>
  );
}

export default function PrototypeRankingsPage() {
  return <RankingsModeContent player={mockPlayer} />;
}