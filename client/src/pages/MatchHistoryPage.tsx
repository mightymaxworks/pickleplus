import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trophy, User, Users, MapPin, Clock, TrendingUp, Filter, Search, X, ChevronDown, ChevronUp, SortAsc, SortDesc, BarChart3, PieChart, Activity, Target, Zap, Award, Smartphone } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Match {
  id: number;
  matchDate: string;
  playerOneId: number;
  playerTwoId: number;
  playerOnePartnerId?: number;
  playerTwoPartnerId?: number;
  winnerId: number;
  scorePlayerOne: string;
  scorePlayerTwo: string;
  gameScores?: any[];
  formatType: 'singles' | 'doubles';
  scoringSystem: 'traditional' | 'rally';
  pointsToWin: number;
  division: string;
  matchType: 'casual' | 'league' | 'tournament';
  eventTier: 'local' | 'regional' | 'national' | 'international';
  location?: string;
  tournamentId?: number;
  isRated: boolean;
  isVerified: boolean;
  validationStatus: 'pending' | 'validated' | 'disputed' | 'rejected';
  notes?: string;
  xpAwarded: number;
  pointsAwarded: number;
  createdAt: string;
  // Relations
  playerOne: { id: number; firstName: string; lastName: string; };
  playerTwo: { id: number; firstName: string; lastName: string; };
  playerOnePartner?: { id: number; firstName: string; lastName: string; };
  playerTwoPartner?: { id: number; firstName: string; lastName: string; };
  winner: { id: number; firstName: string; lastName: string; };
  tournament?: { id: number; name: string; };
}

interface MatchHistoryStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  streakType: 'win' | 'loss';
  totalXpEarned: number;
  totalPointsEarned: number;
  averageMatchDuration: number;
  formatBreakdown: {
    singles: { played: number; won: number; };
    doubles: { played: number; won: number; };
  };
  divisionBreakdown: Record<string, { played: number; won: number; }>;
  recentPerformance: {
    last10Games: { wins: number; losses: number; };
    last30Days: { matches: number; winRate: number; };
  };
}

export default function MatchHistoryPage() {
  // Mock user for development - in production this would come from auth context
  const user = { id: 1, firstName: 'Test', lastName: 'User' };
  
  // Sprint 2: Enhanced Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all');
  const [filterResult, setFilterResult] = useState<'all' | 'wins' | 'losses'>('all');
  const [filterMatchType, setFilterMatchType] = useState<'all' | 'casual' | 'league' | 'tournament'>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'opponent' | 'score' | 'points'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<'performance' | 'patterns' | 'recommendations'>('performance');

  // Fetch match history
  const { data: rawMatches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/history', user?.id, filterType, filterPeriod],
    enabled: !!user?.id,
  });

  // Fetch match statistics
  const { data: stats, isLoading: statsLoading } = useQuery<MatchHistoryStats>({
    queryKey: ['/api/matches/stats', user?.id, filterPeriod],
    enabled: !!user?.id,
  });

  // Helper functions for match data processing
  const getMatchResult = (match: Match) => {
    if (!user) return 'unknown';
    return match.winnerId === user.id ? 'win' : 'loss';
  };

  const getMatchOpponent = (match: Match) => {
    if (!user) return 'Unknown';
    
    const formatPlayerName = (player: any) => {
      if (!player) return 'Unknown Player';
      const firstName = player.firstName || 'Player';
      const lastName = player.lastName || `#${player.id}`;
      return `${firstName} ${lastName}`;
    };
    
    if (match.formatType === 'singles') {
      // Singles format: A vs B
      const opponent = match.playerOneId === user.id ? match.playerTwo : match.playerOne;
      return formatPlayerName(opponent);
    } else {
      // Doubles format: A/B vs C/D
      if (match.playerOneId === user.id || match.playerOnePartnerId === user.id) {
        // User is on team 1, show team 2
        const playerTwo = formatPlayerName(match.playerTwo);
        const playerTwoPartner = formatPlayerName(match.playerTwoPartner);
        return `${playerTwo}/${playerTwoPartner}`;
      } else {
        // User is on team 2, show team 1  
        const playerOne = formatPlayerName(match.playerOne);
        const playerOnePartner = formatPlayerName(match.playerOnePartner);
        return `${playerOne}/${playerOnePartner}`;
      }
    }
  };

  const getMyPartner = (match: Match) => {
    if (!user || match.formatType === 'singles') return null;
    
    const formatPlayerName = (player: any) => {
      if (!player) return null;
      const firstName = player.firstName || 'Player';
      const lastName = player.lastName || `#${player.id}`;
      return `${firstName} ${lastName}`;
    };
    
    if (match.playerOneId === user.id && match.playerOnePartner) {
      return formatPlayerName(match.playerOnePartner);
    } else if (match.playerTwoId === user.id && match.playerTwoPartner) {
      return formatPlayerName(match.playerTwoPartner);
    }
    return null;
  };

  const getMatchScore = (match: Match) => {
    const isPlayerOne = match.playerOneId === user?.id || match.playerOnePartnerId === user?.id;
    if (isPlayerOne) {
      return `${match.scorePlayerOne} - ${match.scorePlayerTwo}`;
    } else {
      return `${match.scorePlayerTwo} - ${match.scorePlayerOne}`;
    }
  };

  // Sprint 2: Advanced filtering and searching logic
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...rawMatches];

    // Text search across opponents, locations, tournaments
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(match => {
        const opponent = getMatchOpponent(match).toLowerCase();
        const location = (match.location || '').toLowerCase();
        const tournament = (match.tournament?.name || '').toLowerCase();
        const division = match.division.toLowerCase();
        
        return opponent.includes(query) || 
               location.includes(query) || 
               tournament.includes(query) ||
               division.includes(query);
      });
    }

    // Filter by result (wins/losses)
    if (filterResult !== 'all' && user) {
      filtered = filtered.filter(match => {
        const isWin = match.winnerId === user.id;
        return filterResult === 'wins' ? isWin : !isWin;
      });
    }

    // Filter by match type
    if (filterMatchType !== 'all') {
      filtered = filtered.filter(match => match.matchType === filterMatchType);
    }

    // Filter by division
    if (filterDivision !== 'all') {
      filtered = filtered.filter(match => match.division === filterDivision);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.matchDate);
          bValue = new Date(b.matchDate);
          break;
        case 'opponent':
          aValue = getMatchOpponent(a);
          bValue = getMatchOpponent(b);
          break;
        case 'score':
          aValue = parseInt(a.scorePlayerOne) + parseInt(a.scorePlayerTwo);
          bValue = parseInt(b.scorePlayerOne) + parseInt(b.scorePlayerTwo);
          break;
        case 'points':
          aValue = a.pointsAwarded;
          bValue = b.pointsAwarded;
          break;
        default:
          aValue = new Date(a.matchDate);
          bValue = new Date(b.matchDate);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [rawMatches, searchQuery, filterResult, filterMatchType, filterDivision, sortBy, sortOrder, user]);

  // Get unique divisions for filter dropdown
  const availableDivisions = useMemo(() => {
    const divisions = Array.from(new Set(rawMatches.map(match => match.division)));
    return divisions.filter(Boolean).sort();
  }, [rawMatches]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterPeriod('all');
    setFilterResult('all');
    setFilterMatchType('all');
    setFilterDivision('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  // Sprint 4: AI-Powered Insights and Pattern Analysis
  const generateAIInsights = () => {
    if (!filteredAndSortedMatches.length || !stats) return null;

    const insights = {
      performance: [
        {
          icon: TrendingUp,
          title: "Performance Trend",
          value: stats.currentStreak > 3 ? "Strong Momentum" : "Building Form",
          description: `${stats.currentStreak} ${stats.streakType} streak`,
          color: stats.streakType === 'win' ? 'text-green-600' : 'text-orange-600'
        },
        {
          icon: Target,
          title: "Win Rate Analysis",
          value: `${Math.round((stats.wins / stats.totalMatches) * 100)}%`,
          description: stats.wins > stats.losses ? "Above average performance" : "Room for improvement",
          color: stats.wins > stats.losses ? 'text-green-600' : 'text-blue-600'
        },
        {
          icon: Award,
          title: "Points Efficiency",
          value: `${Math.round(stats.totalPointsEarned / stats.totalMatches)} pts/match`,
          description: "Average ranking points per match",
          color: 'text-purple-600'
        }
      ],
      patterns: [
        {
          title: "Format Preference",
          insight: stats.formatBreakdown.singles.played > stats.formatBreakdown.doubles.played 
            ? "Singles specialist - stronger individual performance"
            : "Doubles advantage - excels in team coordination",
          recommendation: "Focus on your stronger format for tournaments"
        },
        {
          title: "Match Timing",
          insight: "Recent performance shows consistency",
          recommendation: "Current form suggests tournament readiness"
        },
        {
          title: "Competition Level",
          insight: filteredAndSortedMatches.filter(m => m.matchType === 'tournament').length > 0
            ? "Tournament experience building steadily"
            : "Ready to step up to competitive play",
          recommendation: "Consider entering local tournaments to test skills"
        }
      ],
      recommendations: [
        {
          icon: Zap,
          title: "Next Challenge",
          action: "Enter a local tournament",
          benefit: "Test skills against competitive field",
          priority: "high"
        },
        {
          icon: Users,
          title: "Training Focus",
          action: stats.formatBreakdown.doubles.played < stats.formatBreakdown.singles.played 
            ? "Practice doubles strategy and communication" 
            : "Improve singles court coverage and shot selection",
          benefit: "Become a more complete player",
          priority: "medium"
        },
        {
          icon: Trophy,
          title: "Skill Development",
          action: "Work on pressure situation management",
          benefit: "Maintain performance in critical moments",
          priority: "high"
        }
      ]
    };

    return insights;
  };

  const aiInsights = generateAIInsights();
  const isLoading = matchesLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Please log in to view your match history.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Match History</h1>
          <p className="text-muted-foreground">
            Track your performance and analyze your game
          </p>
        </div>
        
        {/* Sprint 4: AI Insights Toggle - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={showInsights ? "default" : "outline"}
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
            <span className="sm:hidden">Insights</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </div>
      </div>

      {/* Sprint 4: AI Insights Panel - Mobile Optimized */}
      {showInsights && aiInsights && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                AI Performance Insights
              </CardTitle>
              <div className="flex gap-1">
                {(['performance', 'patterns', 'recommendations'] as const).map((category) => (
                  <Button
                    key={category}
                    variant={selectedInsightCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedInsightCategory(category)}
                    className="capitalize text-xs px-2 py-1"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedInsightCategory === 'performance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.performance.map((insight, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                    <insight.icon className={cn("h-8 w-8", insight.color)} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                      <p className="text-lg font-bold">{insight.value}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedInsightCategory === 'patterns' && (
              <div className="space-y-4">
                {aiInsights.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white border">
                    <h4 className="font-medium text-sm mb-2">{pattern.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{pattern.insight}</p>
                    <p className="text-sm font-medium text-blue-600">{pattern.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
            
            {selectedInsightCategory === 'recommendations' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiInsights.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white border">
                    <div className="flex items-start gap-3 mb-3">
                      <rec.icon className="h-6 w-6 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-2">{rec.action}</p>
                    <p className="text-xs text-muted-foreground">{rec.benefit}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sprint 2: Enhanced Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar - Mobile Optimized */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opponents, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 md:h-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Basic Filters Row - Mobile Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap gap-3">
            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="doubles">Doubles</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResult} onValueChange={(value) => setFilterResult(value as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="wins">Wins Only</SelectItem>
                <SelectItem value="losses">Losses Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Controls */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="opponent">Opponent</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-1"
            >
              <Filter className="h-3 w-3" />
              Advanced
              {showAdvancedFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {/* Clear Filters */}
            {(searchQuery || filterType !== 'all' || filterPeriod !== 'all' || filterResult !== 'all' || filterMatchType !== 'all' || filterDivision !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="match-type">Match Type</Label>
                  <Select value={filterMatchType} onValueChange={(value) => setFilterMatchType(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Select value={filterDivision} onValueChange={setFilterDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {availableDivisions.map(division => (
                        <SelectItem key={division} value={division}>{division}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Results Found</Label>
                  <div className="text-sm text-muted-foreground pt-2">
                    {filteredAndSortedMatches.length} of {rawMatches.length} matches
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sprint 3: Performance Analytics Dashboard */}
      {stats && (
        <div className="space-y-6">
          {/* Core Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMatches}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.wins}W - {stats.losses}L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.winRate * 100)}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak} {stats.streakType} streak
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Singles</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.formatBreakdown.singles.played}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.formatBreakdown.singles.won} wins ({Math.round((stats.formatBreakdown.singles.won / (stats.formatBreakdown.singles.played || 1)) * 100)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doubles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.formatBreakdown.doubles.played}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.formatBreakdown.doubles.won} wins ({Math.round((stats.formatBreakdown.doubles.won / (stats.formatBreakdown.doubles.played || 1)) * 100)}%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Performance</CardTitle>
                <CardDescription>Your performance over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Last 10 Games</p>
                    <p className="text-xs text-muted-foreground">Win/Loss Record</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {stats.recentPerformance.last10Games.wins}-{stats.recentPerformance.last10Games.losses}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((stats.recentPerformance.last10Games.wins / (stats.recentPerformance.last10Games.wins + stats.recentPerformance.last10Games.losses || 1)) * 100)}% win rate
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Last 30 Days</p>
                    <p className="text-xs text-muted-foreground">Match Activity</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{stats.recentPerformance.last30Days.matches}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(stats.recentPerformance.last30Days.winRate * 100)}% win rate
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Current Streak</p>
                    <p className="text-xs text-muted-foreground">Active streak type</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", stats.streakType === 'win' ? 'text-green-600' : 'text-red-600')}>
                      {stats.currentStreak} {stats.streakType}{stats.currentStreak !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {stats.streakType} streak
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Division Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Division Performance</CardTitle>
                <CardDescription>Win rates across different divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.divisionBreakdown).map(([division, data]) => {
                    const winRate = Math.round((data.won / (data.played || 1)) * 100);
                    return (
                      <div key={division} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{division}</p>
                          <p className="text-xs text-muted-foreground">{data.played} matches played</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{winRate}%</p>
                          <p className="text-xs text-muted-foreground">{data.won}W - {data.played - data.won}L</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* XP and Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalXpEarned.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(stats.totalXpEarned / (stats.totalMatches || 1))} avg per match
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ranking Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPointsEarned.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(stats.totalPointsEarned / (stats.totalMatches || 1))} avg per match
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Match Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.averageMatchDuration)}min</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(stats.averageMatchDuration * stats.totalMatches)} total minutes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win Rate Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Trend
                </CardTitle>
                <CardDescription>Win rate analysis over recent matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Monthly Performance Indicators */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{Math.round(stats.recentPerformance.last30Days.winRate * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Last 30 Days</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{Math.round(stats.winRate * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round((stats.recentPerformance.last10Games.wins / (stats.recentPerformance.last10Games.wins + stats.recentPerformance.last10Games.losses || 1)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Last 10 Games</div>
                    </div>
                  </div>

                  {/* Visual Performance Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recent Form</span>
                      <span className={cn("font-medium", 
                        stats.recentPerformance.last30Days.winRate > stats.winRate ? "text-green-600" : "text-red-600"
                      )}>
                        {stats.recentPerformance.last30Days.winRate > stats.winRate ? "Improving" : "Declining"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.round(stats.recentPerformance.last30Days.winRate * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Match Distribution
                </CardTitle>
                <CardDescription>Breakdown of match types and formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Format Distribution */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Singles vs Doubles</span>
                      <span className="text-muted-foreground">Format Preference</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <div className="text-lg font-bold text-blue-600">{stats.formatBreakdown.singles.played}</div>
                        <div className="text-xs text-muted-foreground">Singles</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded text-center">
                        <div className="text-lg font-bold text-green-600">{stats.formatBreakdown.doubles.played}</div>
                        <div className="text-xs text-muted-foreground">Doubles</div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Level Indicator */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Activity Level</span>
                      <span className="text-muted-foreground">Recent Engagement</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {stats.recentPerformance.last30Days.matches > 10 ? "High Activity" : 
                           stats.recentPerformance.last30Days.matches > 5 ? "Moderate Activity" : "Low Activity"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stats.recentPerformance.last30Days.matches} matches this month
                        </div>
                      </div>
                      <div className={cn("px-2 py-1 rounded text-xs", 
                        stats.recentPerformance.last30Days.matches > 10 ? "bg-green-100 text-green-700" :
                        stats.recentPerformance.last30Days.matches > 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      )}>
                        {stats.recentPerformance.last30Days.matches > 10 ? "Active" : 
                         stats.recentPerformance.last30Days.matches > 5 ? "Regular" : "Casual"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Insights</CardTitle>
              <CardDescription>AI-powered analysis of your game patterns and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Analysis */}
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">Strengths</h4>
                  <div className="space-y-2">
                    {stats.formatBreakdown.singles.won / (stats.formatBreakdown.singles.played || 1) > stats.formatBreakdown.doubles.won / (stats.formatBreakdown.doubles.played || 1) ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Stronger in singles play</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Better teamwork in doubles</span>
                      </div>
                    )}
                    
                    {stats.currentStreak > 3 && stats.streakType === 'win' && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Excellent momentum ({stats.currentStreak} win streak)</span>
                      </div>
                    )}
                    
                    {stats.recentPerformance.last30Days.winRate > 0.6 && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <Trophy className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Strong recent performance</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-600">Growth Opportunities</h4>
                  <div className="space-y-2">
                    {stats.formatBreakdown.singles.won / (stats.formatBreakdown.singles.played || 1) < 0.5 && stats.formatBreakdown.singles.played > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <User className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Focus on singles strategy</span>
                      </div>
                    )}
                    
                    {stats.formatBreakdown.doubles.won / (stats.formatBreakdown.doubles.played || 1) < 0.5 && stats.formatBreakdown.doubles.played > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <Users className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Improve doubles coordination</span>
                      </div>
                    )}
                    
                    {stats.recentPerformance.last30Days.matches < 5 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <Activity className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Increase match frequency</span>
                      </div>
                    )}
                    
                    {stats.recentPerformance.last30Days.winRate < stats.winRate - 0.1 && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Recent form needs attention</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Match History List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
          <CardDescription>
            Your match history with detailed results and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAndSortedMatches.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {rawMatches.length === 0 ? 'No matches found.' : 'No matches match your current filters.'}
              </p>
              {rawMatches.length > 0 && (
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedMatches.map((match) => {
                const result = getMatchResult(match);
                const opponent = getMatchOpponent(match);
                const partner = getMyPartner(match);
                const score = getMatchScore(match);
                
                return (
                  <div
                    key={match.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border",
                      result === 'win' 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                        result === 'win' ? "bg-green-500" : "bg-red-500"
                      )}>
                        {result === 'win' ? 'W' : 'L'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {match.formatType === 'singles' ? `vs ${opponent}` : `vs ${opponent}`}
                          </span>
                          {partner && (
                            <span className="text-sm text-muted-foreground">
                              (with {partner})
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {match.formatType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(match.matchDate), 'MMM d, yyyy')}
                          </span>
                          
                          {match.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.location}
                            </span>
                          )}
                          
                          <Badge variant="secondary" className="text-xs">
                            {match.matchType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <div className="text-right">
                        <div className="font-bold text-lg">{score}</div>
                        <div className="text-sm text-muted-foreground">
                          +{match.pointsAwarded} pts
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}