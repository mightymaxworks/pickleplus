import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StandardLayout } from '@/components/StandardLayout';
import { Calendar, Trophy, User, Users, MapPin, Clock, TrendingUp, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
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
      // For doubles, show the opposing team
      const isPlayerOneTeam = match.playerOneId === user.id || match.playerOnePartnerId === user.id;
      if (isPlayerOneTeam) {
        const partner = match.playerTwoPartner 
          ? `${match.playerTwo.firstName} ${match.playerTwo.lastName} & ${match.playerTwoPartner.firstName} ${match.playerTwoPartner.lastName}`
          : `${match.playerTwo.firstName} ${match.playerTwo.lastName}`;
        return partner;
      } else {
        const partner = match.playerOnePartner 
          ? `${match.playerOne.firstName} ${match.playerOne.lastName} & ${match.playerOnePartner.firstName} ${match.playerOnePartner.lastName}`
          : `${match.playerOne.firstName} ${match.playerOne.lastName}`;
        return partner;
      }
    }
  };

  const getMyPartner = (match: Match) => {
    if (!user || match.formatType === 'singles') return null;
    
    const isPlayerOneTeam = match.playerOneId === user.id || match.playerOnePartnerId === user.id;
    if (isPlayerOneTeam) {
      if (match.playerOneId === user.id && match.playerOnePartner) {
        return `${match.playerOnePartner.firstName} ${match.playerOnePartner.lastName}`;
      } else if (match.playerOnePartnerId === user.id) {
        return `${match.playerOne.firstName} ${match.playerOne.lastName}`;
      }
    } else {
      if (match.playerTwoId === user.id && match.playerTwoPartner) {
        return `${match.playerTwoPartner.firstName} ${match.playerTwoPartner.lastName}`;
      } else if (match.playerTwoPartnerId === user.id) {
        return `${match.playerTwo.firstName} ${match.playerTwo.lastName}`;
      }
    }
    return null;
  };

  const getMatchScore = (match: Match) => {
    const result = getMatchResult(match);
    const isPlayerOneTeam = match.playerOneId === user?.id || match.playerOnePartnerId === user?.id;
    
    if (result === 'win') {
      return isPlayerOneTeam 
        ? `${match.scorePlayerOne} - ${match.scorePlayerTwo}`
        : `${match.scorePlayerTwo} - ${match.scorePlayerOne}`;
    } else {
      return isPlayerOneTeam 
        ? `${match.scorePlayerOne} - ${match.scorePlayerTwo}`
        : `${match.scorePlayerTwo} - ${match.scorePlayerOne}`;
    }
  };

  const formatMatchType = (matchType: string, eventTier?: string) => {
    if (matchType === 'tournament') {
      return `${eventTier?.toUpperCase() || 'LOCAL'} TOURNAMENT`;
    }
    return matchType.toUpperCase();
  };

  if (isLoading) {
    return (
      <StandardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Match History</h1>
              <p className="text-muted-foreground">Complete record of your pickleball matches</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Formats</option>
                <option value="singles">Singles Only</option>
                <option value="doubles">Doubles Only</option>
              </select>
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                  Current {stats.streakType} streak: {stats.currentStreak}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Format Performance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Singles:</span>
                    <span>{stats.formatBreakdown.singles.played > 0 ? 
                      `${((stats.formatBreakdown.singles.won / stats.formatBreakdown.singles.played) * 100).toFixed(0)}%` 
                      : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Doubles:</span>
                    <span>{stats.formatBreakdown.doubles.played > 0 ? 
                      `${((stats.formatBreakdown.doubles.won / stats.formatBreakdown.doubles.played) * 100).toFixed(0)}%` 
                      : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Form</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.recentPerformance.last10Games.wins}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 10 games won
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Match List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>
              {filterType !== 'all' && `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} matches `}
              {filterPeriod !== 'all' && `from the ${filterPeriod.replace('days', ' days').replace('1year', 'last year')}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterType !== 'all' || filterPeriod !== 'all' 
                    ? 'Try adjusting your filters or record your first match.'
                    : 'Start recording your matches to see your history here.'
                  }
                </p>
                <Button>Record a Match</Button>
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
                        "border rounded-lg p-4 transition-all hover:shadow-md",
                        result === 'win' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={result === 'win' ? 'default' : 'destructive'}
                            className="text-xs font-semibold"
                          >
                            {result.toUpperCase()}
                          </Badge>
                          
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {match.formatType === 'singles' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            <span className="capitalize">{match.formatType}</span>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {formatMatchType(match.matchType, match.eventTier)}
                          </Badge>
                          
                          {match.tournament && (
                            <Badge variant="outline" className="text-xs">
                              {match.tournament.name}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">{score}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(match.matchDate), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">vs {opponent}</div>
                          {partner && (
                            <div className="text-sm text-muted-foreground">
                              Partner: {partner}
                            </div>
                          )}
                          {match.location && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{match.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(match.matchDate), 'MMM d, yyyy')}
                          </div>
                          {match.xpAwarded > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +{match.xpAwarded} XP
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {match.notes && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm text-muted-foreground italic">{match.notes}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
}