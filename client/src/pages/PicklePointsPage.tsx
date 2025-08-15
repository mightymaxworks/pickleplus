import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Award, 
  Ticket, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Coins,
  Target,
  Clock,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Pickle Points System based on official PicklePlus algorithm
interface PicklePointsEntry {
  id: number;
  displayName: string;
  username: string;
  avatar?: string;
  picklePoints: number;
  lifetimePoints: number;
  matchesPlayed: number;
  winRate: number;
  gender: 'male' | 'female';
  age: number;
  division: string;
  ranking: number;
  tier: string;
  isCurrentUser?: boolean;
  recentActivity: {
    lastMatch: string;
    pointsThisWeek: number;
    streakDays: number;
  };
}

interface PicklePointsResponse {
  players: PicklePointsEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentUserPosition?: {
    ranking: number;
    player: PicklePointsEntry;
  };
  searchTerm?: string;
}

// CORRECTED Pickle Points Algorithm - Simple 1.5x Conversion (OFFICIAL ALGORITHM)
// Per PICKLE_PLUS_ALGORITHM_DOCUMENT.md and UDF requirements

/**
 * Calculate Pickle Points using the OFFICIAL 1.5x conversion rate
 * This is the ONLY correct implementation per algorithm document
 * @param rankingPoints - The ranking points earned from a match
 * @returns Pickle Points (ranking points × 1.5)
 */
const calculatePicklePoints = (rankingPoints: number): number => {
  // MANDATORY 1.5x multiplier - the ONLY conversion rate allowed
  const conversionRate = 1.5;
  return Math.ceil(rankingPoints * conversionRate);
};

// Player tier determination (matching ranking system)
const getPlayerTier = (rankingPoints: number): string => {
  if (rankingPoints >= 1800) return 'Professional';
  if (rankingPoints >= 1000) return 'Elite'; 
  if (rankingPoints >= 300) return 'Competitive';
  return 'Recreational';
};

export default function PicklePointsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Generate demo Pickle Points data based on rankings data
  const generatePicklePointsData = (): PicklePointsResponse => {
    // Demo players with Pickle Points calculated using the algorithm
    const demoPlayers = [
      { name: "Alex Johnson", gender: "male", age: 28, rankingPoints: 1850, matches: 45, wins: 35, tier: "Professional" },
      { name: "Sarah Williams", gender: "female", age: 32, rankingPoints: 1720, matches: 38, wins: 28, tier: "Professional" },
      { name: "Mike Chen", gender: "male", age: 25, rankingPoints: 1650, matches: 42, wins: 31, tier: "Elite" },
      { name: "Jessica Torres", gender: "female", age: 29, rankingPoints: 1580, matches: 40, wins: 29, tier: "Elite" },
      { name: "David Rodriguez", gender: "male", age: 34, rankingPoints: 1520, matches: 35, wins: 24, tier: "Elite" },
      { name: "Emma Thompson", gender: "female", age: 27, rankingPoints: 1480, matches: 33, wins: 22, tier: "Elite" },
      { name: "Ryan Murphy", gender: "male", age: 31, rankingPoints: 1420, matches: 38, wins: 26, tier: "Elite" },
      { name: "Lisa Anderson", gender: "female", age: 26, rankingPoints: 1380, matches: 36, wins: 24, tier: "Elite" },
      { name: "Tom Wilson", gender: "male", age: 35, rankingPoints: 1320, matches: 30, wins: 19, tier: "Elite" },
      { name: "Anna Garcia", gender: "female", age: 30, rankingPoints: 1280, matches: 32, wins: 20, tier: "Elite" },
      { name: "Chris Martin", gender: "male", age: 29, rankingPoints: 1220, matches: 28, wins: 17, tier: "Elite" },
      { name: "Sophia Davis", gender: "female", age: 33, rankingPoints: 1180, matches: 31, wins: 19, tier: "Elite" },
      { name: "James Brown", gender: "male", age: 27, rankingPoints: 1120, matches: 25, wins: 15, tier: "Elite" },
      { name: "Admin User", gender: "male", age: 35, rankingPoints: 1080, matches: 22, wins: 12, tier: "Elite" },
      { name: "Olivia Miller", gender: "female", age: 28, rankingPoints: 950, matches: 24, wins: 14, tier: "Competitive" },
      // Add more players...
      { name: "Kevin Taylor", gender: "male", age: 38, rankingPoints: 850, matches: 28, wins: 16, tier: "Competitive" },
      { name: "Rachel White", gender: "female", age: 31, rankingPoints: 780, matches: 22, wins: 12, tier: "Competitive" },
      { name: "Brian Clark", gender: "male", age: 42, rankingPoints: 720, matches: 26, wins: 14, tier: "Competitive" },
      { name: "Michelle Lee", gender: "female", age: 29, rankingPoints: 680, matches: 20, wins: 10, tier: "Competitive" },
      { name: "Steven Johnson", gender: "male", age: 33, rankingPoints: 620, matches: 18, wins: 9, tier: "Competitive" }
    ];

    const processedPlayers = demoPlayers.map((player, index) => {
      // Calculate Pickle Points using the algorithm
      const avgMatchesPerWeek = 3;
      const winStreak = Math.floor(Math.random() * 8) + 1; // Random streak 1-8
      const tournamentMatches = Math.floor(player.matches * 0.3); // 30% tournament
      const leagueMatches = Math.floor(player.matches * 0.4);     // 40% league  
      const casualMatches = player.matches - tournamentMatches - leagueMatches; // Rest casual
      
      // Calculate points from different match types
      const tournamentPoints = tournamentMatches * calculatePicklePoints('tournament', player.wins > player.matches * 0.6, player.tier, winStreak);
      const leaguePoints = leagueMatches * calculatePicklePoints('league', player.wins > player.matches * 0.5, player.tier);
      const casualPoints = casualMatches * calculatePicklePoints('casual', player.wins > player.matches * 0.4, player.tier);
      
      const totalPicklePoints = tournamentPoints + leaguePoints + casualPoints;
      const lifetimePoints = Math.floor(totalPicklePoints * 1.4); // Lifetime is higher
      const pointsThisWeek = Math.floor(avgMatchesPerWeek * calculatePicklePoints('league', true, player.tier));

      return {
        id: index + 1,
        displayName: player.name,
        username: player.name.toLowerCase().replace(' ', '_'),
        avatar: undefined,
        picklePoints: totalPicklePoints,
        lifetimePoints,
        matchesPlayed: player.matches,
        winRate: Math.round((player.wins / player.matches) * 100 * 10) / 10,
        gender: player.gender as 'male' | 'female',
        age: player.age,
        division: player.age >= 35 ? '35+' : 'Open',
        ranking: index + 1,
        tier: player.tier,
        isCurrentUser: player.name === "Admin User",
        recentActivity: {
          lastMatch: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          pointsThisWeek,
          streakDays: winStreak
        }
      };
    }).sort((a, b) => b.picklePoints - a.picklePoints) // Sort by Pickle Points descending
      .map((player, index) => ({ ...player, ranking: index + 1 }));

    // Apply filters
    let filteredPlayers = processedPlayers;
    
    if (selectedGender !== 'all') {
      filteredPlayers = filteredPlayers.filter(p => p.gender === selectedGender);
    }
    
    if (selectedDivision !== 'all') {
      if (selectedDivision === '35+') {
        filteredPlayers = filteredPlayers.filter(p => p.age >= 35);
      }
    }
    
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filteredPlayers = filteredPlayers.filter(p => 
        p.displayName.toLowerCase().includes(searchLower) ||
        p.username.toLowerCase().includes(searchLower)
      );
    }

    // Find current user position
    const currentUserPosition = filteredPlayers.find(p => p.isCurrentUser) ? {
      ranking: filteredPlayers.findIndex(p => p.isCurrentUser) + 1,
      player: filteredPlayers.find(p => p.isCurrentUser)!
    } : undefined;

    // Pagination
    const totalCount = filteredPlayers.length;
    const totalPages = Math.ceil(totalCount / 10);
    const startIndex = (currentPage - 1) * 10;
    const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + 10);

    return {
      players: paginatedPlayers,
      totalCount,
      currentPage,
      totalPages,
      currentUserPosition,
      searchTerm: debouncedSearch || undefined
    };
  };

  const picklePointsData = generatePicklePointsData();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Professional': return 'text-purple-700 bg-gradient-to-r from-purple-100 to-indigo-100';
      case 'Elite': return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100';
      case 'Competitive': return 'text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100';
      case 'Recreational': return 'text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Professional': return '👑';
      case 'Elite': return '🔥';
      case 'Competitive': return '⭐';
      case 'Recreational': return '🎯';
      default: return '🏓';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Ticket className="h-8 w-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Pickle Points</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Earn Pickle Points through matches, streaks, and consistent play. Points reflect engagement and improvement across all skill levels.
        </p>
      </div>

      {/* Pickle Points Algorithm Info Card */}
      <Card className="mb-6 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            How Pickle Points Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Base Points</h4>
              <div className="space-y-1 text-gray-600">
                <div>🏆 Tournament: 15 pts</div>
                <div>🥉 League: 10 pts</div>
                <div>🎯 Casual: 6 pts</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Bonuses</h4>
              <div className="space-y-1 text-gray-600">
                <div>✅ Win: +50% bonus</div>
                <div>🔥 Streak (3+): +10-30%</div>
                <div>🎖️ Tier: Up to +30%</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">Weekly Goals</h4>
              <div className="space-y-1 text-gray-600">
                <div>📅 Daily Play: +2 pts</div>
                <div>🎯 Weekly Target: +25 pts</div>
                <div>📈 Consistent Growth</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="w-32 border-orange-200">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-32 border-orange-200">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="35+">35+ Division</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current User Position */}
        {picklePointsData.currentUserPosition && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 text-sm">
                  Your Position: #{picklePointsData.currentUserPosition.ranking} with {picklePointsData.currentUserPosition.player.picklePoints} Pickle Points
                </span>
                <span className="text-xs text-green-600">
                  (+{picklePointsData.currentUserPosition.player.recentActivity.pointsThisWeek} this week)
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pickle Points Leaderboard */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Pickle Points Leaderboard
            <Badge variant="outline" className="ml-auto text-orange-600 border-orange-300">
              {picklePointsData.totalCount} Players
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {picklePointsData.players.length > 0 ? (
            <div className="divide-y divide-orange-100">
              {picklePointsData.players.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    player.isCurrentUser 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' 
                      : 'hover:bg-orange-50/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                    #{player.ranking}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={player.avatar} alt={player.displayName} />
                    <AvatarFallback className="bg-orange-100 text-orange-700">
                      {player.displayName?.charAt(0) || player.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm truncate">
                        {player.displayName || player.username}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-2 h-5 border-0 font-semibold ${getTierColor(player.tier)}`}
                      >
                        <span className="mr-1">{getTierIcon(player.tier)}</span>
                        {player.tier}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-3">
                      <span>Age {player.age}</span>
                      <span>{player.winRate}% wins</span>
                      <span>{player.matchesPlayed} matches</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {player.recentActivity.pointsThisWeek} this week
                      </span>
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600 flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {player.picklePoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.lifetimePoints.toLocaleString()} lifetime
                    </div>
                  </div>

                  {/* Activity Indicators */}
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      {player.recentActivity.streakDays}d
                    </div>
                    <div className="text-gray-500">
                      {new Date(player.recentActivity.lastMatch).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Players Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Pagination */}
          {picklePointsData.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-orange-50/50 border-t border-orange-100">
              <div className="text-sm text-orange-600">
                Page {picklePointsData.currentPage} of {picklePointsData.totalPages}
                <span className="ml-2">({picklePointsData.totalCount} total)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  disabled={picklePointsData.currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  disabled={picklePointsData.currentPage >= picklePointsData.totalPages}
                  onClick={() => setCurrentPage(p => Math.min(picklePointsData.totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}