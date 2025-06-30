import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trophy, User, Users, MapPin, Clock, TrendingUp, Filter } from 'lucide-react';
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
  const [filterType, setFilterType] = useState<'all' | 'singles' | 'doubles'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all');

  // Fetch match history
  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/history', user?.id, filterType, filterPeriod],
    enabled: !!user?.id,
  });

  // Fetch match statistics
  const { data: stats, isLoading: statsLoading } = useQuery<MatchHistoryStats>({
    queryKey: ['/api/matches/stats', user?.id, filterPeriod],
    enabled: !!user?.id,
  });

  const isLoading = matchesLoading || statsLoading;

  const getMatchResult = (match: Match) => {
    if (!user) return 'unknown';
    return match.winnerId === user.id ? 'win' : 'loss';
  };

  const getMatchOpponent = (match: Match) => {
    if (!user) return 'Unknown';
    
    if (match.formatType === 'singles') {
      const opponent = match.playerOneId === user.id ? match.playerTwo : match.playerOne;
      return `${opponent.firstName} ${opponent.lastName}`;
    } else {
      // For doubles, show the team opponents
      if (match.playerOneId === user.id || match.playerOnePartnerId === user.id) {
        return `${match.playerTwo.firstName} ${match.playerTwo.lastName} & ${match.playerTwoPartner?.firstName || ''} ${match.playerTwoPartner?.lastName || ''}`;
      } else {
        return `${match.playerOne.firstName} ${match.playerOne.lastName} & ${match.playerOnePartner?.firstName || ''} ${match.playerOnePartner?.lastName || ''}`;
      }
    }
  };

  const getMyPartner = (match: Match) => {
    if (!user || match.formatType === 'singles') return null;
    
    if (match.playerOneId === user.id && match.playerOnePartner) {
      return `${match.playerOnePartner.firstName} ${match.playerOnePartner.lastName}`;
    } else if (match.playerTwoId === user.id && match.playerTwoPartner) {
      return `${match.playerTwoPartner.firstName} ${match.playerTwoPartner.lastName}`;
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
          <h1 className="text-3xl font-bold">Match History</h1>
          <p className="text-muted-foreground">
            Track your performance and analyze your game
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Match Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="singles">Singles</SelectItem>
              <SelectItem value="doubles">Doubles</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
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
              <div className="text-2xl font-bold">{(stats.winRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.currentStreak} game {stats.streakType} streak
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
                {stats.formatBreakdown.singles.won} wins
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
                {stats.formatBreakdown.doubles.won} wins
              </p>
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
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches found for the selected filters.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or record your first match!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
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
                          <span className="font-medium">vs {opponent}</span>
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
                          +{match.xpAwarded} XP
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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