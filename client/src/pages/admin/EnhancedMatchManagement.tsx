// Enhanced Admin Match Management with Individual Player Point Allocation
// Age-specific leaderboards and mixed-age match support

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Button
} from '@/components/ui/button';
import {
  Badge
} from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, Trophy, Target, TrendingUp, Calendar, Award, Plus, Upload, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { QuickMatchRecorderStreamlined } from '@/components/match/QuickMatchRecorderStreamlined';
import MatchManagement from './MatchManagement';
import BulkMatchUpload from '@/components/match/BulkMatchUpload';

// Clean Apple-like Completed Matches Display
function CompletedMatchesDisplay() {
  const { data: completedMatches, isLoading } = useQuery({
    queryKey: ['/api/admin/enhanced-match-management/matches/completed'],
    queryFn: async () => {
      const res = await fetch('/api/admin/enhanced-match-management/matches/completed?limit=50', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch completed matches');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading completed matches...</p>
        </div>
      </div>
    );
  }

  if (!completedMatches?.success || !completedMatches?.data?.length) {
    return (
      <div className="text-center py-12 space-y-3">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto" />
        <h3 className="text-lg font-medium">No Completed Matches</h3>
        <p className="text-muted-foreground">Start recording matches to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Completed Matches</h2>
        <Badge variant="secondary" className="px-3 py-1">
          {completedMatches.data.length} matches
        </Badge>
      </div>
      
      <div className="space-y-4">
        {completedMatches.data.map((match: any) => (
          <div key={match.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Match Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">#{match.id}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.format === 'doubles' ? 'Doubles Match' : 'Singles Match'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(match.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Validated
                </Badge>
              </div>
            </div>

            {/* Match Details */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Players & Score */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Match Result</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{match.playerOneName || 'Player 1'}</span>
                      <span className="text-lg font-bold">{match.player1Score || match.scorePlayerOne || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{match.playerTwoName || 'Player 2'}</span>
                      <span className="text-lg font-bold">{match.player2Score || match.scorePlayerTwo || '0'}</span>
                    </div>
                    {match.format === 'doubles' && match.playerOnePartnerName && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Partners:</strong> {match.playerOnePartnerName} & {match.playerTwoPartnerName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Points Allocation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Points Allocation</h4>
                  <div className="space-y-2">
                    {match.playerResults?.map((result: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{result.playerName}</span>
                          <span className="font-bold text-orange-600">+{result.pointsAwarded} pts</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Base Points:</span>
                            <span>{result.basePoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Age Group ({result.ageGroup}):</span>
                            <span>{result.ageGroupMultiplier}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Result:</span>
                            <span className={result.isWinner ? 'text-green-600' : 'text-gray-500'}>
                              {result.isWinner ? 'WIN' : 'LOSS'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                        Points calculation not available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlayerResult {
  id: number;
  playerId: number;
  playerName: string;
  playerUsername: string;
  isWinner: boolean;
  pointsAwarded: number;
  ageGroupAtMatch: string;
  ageGroupMultiplier: string;
  basePoints: number;
  createdAt: string;
}

interface LeaderboardEntry {
  playerId: number;
  playerName: string;
  playerUsername: string;
  totalPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  winPercentage: number;
}

interface AgeGroupData {
  ageGroup: string;
  playerCount: number;
  totalMatches: number;
  totalPoints: number;
}

interface MixedAgeMatch {
  matchId: number;
  ageGroups: string[];
  totalPlayers: number;
  averagePoints: number;
  pointsRange: string;
}

export default function EnhancedMatchManagement() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch age groups
  const { data: ageGroups, isLoading: ageGroupsLoading } = useQuery<AgeGroupData[]>({
    queryKey: ['/api/admin/enhanced-match-management/age-groups'],
    staleTime: 30000,
  });

  // Fetch leaderboard for selected age group
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<{
    ageGroup: string;
    leaderboard: LeaderboardEntry[];
    total: number;
  }>({
    queryKey: ['/api/admin/enhanced-match-management/leaderboards', selectedAgeGroup],
    enabled: !!selectedAgeGroup,
    staleTime: 30000,
  });

  // Fetch mixed-age match analytics
  const { data: mixedAgeAnalytics } = useQuery<{
    mixedAgeMatches: MixedAgeMatch[];
    totalMixedAgeMatches: number;
  }>({
    queryKey: ['/api/admin/enhanced-match-management/analytics/mixed-age-matches'],
    staleTime: 60000,
  });

  // Fetch match results for selected match
  const { data: matchResults } = useQuery<PlayerResult[]>({
    queryKey: ['/api/admin/enhanced-match-management/matches', selectedMatch, 'results'],
    enabled: !!selectedMatch,
    staleTime: 30000,
  });

  useEffect(() => {
    if (ageGroups && ageGroups.length > 0 && !selectedAgeGroup) {
      setSelectedAgeGroup(ageGroups[0].ageGroup);
    }
  }, [ageGroups, selectedAgeGroup]);

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const getAgeGroupColor = (ageGroup: string) => {
    const colors: Record<string, string> = {
      '18U': 'bg-blue-100 text-blue-800',
      '19-29': 'bg-green-100 text-green-800',
      '30-39': 'bg-yellow-100 text-yellow-800',
      '40-49': 'bg-orange-100 text-orange-800',
      '50-59': 'bg-red-100 text-red-800',
      '60-69': 'bg-purple-100 text-purple-800',
      '70+': 'bg-gray-100 text-gray-800',
    };
    return colors[ageGroup] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Match Management</h1>
          <p className="text-muted-foreground">
            Clean, streamlined match and competition management
          </p>
        </div>
      </div>

      <Tabs defaultValue="completed-matches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-50 p-1 rounded-lg">
          <TabsTrigger value="completed-matches" className="text-sm font-medium py-3 rounded-md">
            Completed Matches
          </TabsTrigger>
          <TabsTrigger value="record-match" className="text-sm font-medium py-3 rounded-md">
            Record Match
          </TabsTrigger>
          <TabsTrigger value="competitions" className="text-sm font-medium py-3 rounded-md">
            Competitions
          </TabsTrigger>
          <TabsTrigger value="bulk-upload" className="text-sm font-medium py-3 rounded-md">
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="completed-matches" className="space-y-6">
          <CompletedMatchesDisplay />
        </TabsContent>

        <TabsContent value="record-match" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Plus className="h-5 w-5 text-orange-600" />
                Admin Match Recorder
              </CardTitle>
              <CardDescription>
                Create matches, tournaments, competitions, and leagues with comprehensive administrative controls
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <QuickMatchRecorderStreamlined isAdminMode={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Trophy className="h-5 w-5 text-blue-600" />
                Competition Management
              </CardTitle>
              <CardDescription>
                Create tournaments, competitions, and leagues - clean interface
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <CompetitionCreationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-upload" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Upload className="h-5 w-5 text-green-600" />
                Bulk Match Upload
              </CardTitle>
              <CardDescription>
                Upload match data from Excel files with comprehensive validation and error reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <BulkMatchUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Age Group Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Individual player rankings within age groups
                  </CardDescription>
                </div>
                <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups?.map((group) => (
                      <SelectItem key={group.ageGroup} value={group.ageGroup}>
                        {group.ageGroup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : leaderboard?.leaderboard.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Total Points</TableHead>
                      <TableHead className="text-right">Matches</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.leaderboard.map((player, index) => (
                      <TableRow key={player.playerId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            #{index + 1}
                            {index < 3 && (
                              <Award className={`h-4 w-4 ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 'text-amber-600'
                              }`} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{player.playerName || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">@{player.playerUsername}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPoints(player.totalPoints)}
                        </TableCell>
                        <TableCell className="text-right">{player.matchesPlayed}</TableCell>
                        <TableCell className="text-right">{player.matchesWon}</TableCell>
                        <TableCell className="text-right">{player.winPercentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No leaderboard data available for this age group
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ageGroups?.map((group) => (
              <Card key={group.ageGroup} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAgeGroup(group.ageGroup)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <Badge className={getAgeGroupColor(group.ageGroup)}>
                      {group.ageGroup}
                    </Badge>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Players:</span>
                    <span className="font-medium">{group.playerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Matches:</span>
                    <span className="font-medium">{group.totalMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Points:</span>
                    <span className="font-medium">{formatPoints(group.totalPoints)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg per Player:</span>
                    <span className="font-medium">
                      {formatPoints(Math.round(group.totalPoints / group.playerCount))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mixed-age" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mixed-Age Match Analytics
              </CardTitle>
              <CardDescription>
                Matches featuring players from different age groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mixedAgeAnalytics?.mixedAgeMatches.length ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Total Mixed-Age Matches: {mixedAgeAnalytics.totalMixedAgeMatches}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match ID</TableHead>
                        <TableHead>Age Groups</TableHead>
                        <TableHead className="text-right">Players</TableHead>
                        <TableHead className="text-right">Avg Points</TableHead>
                        <TableHead className="text-right">Points Range</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mixedAgeAnalytics.mixedAgeMatches.map((match) => (
                        <TableRow key={match.matchId}>
                          <TableCell className="font-medium">#{match.matchId}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {match.ageGroups.map((ageGroup) => (
                                <Badge key={ageGroup} variant="outline" className={getAgeGroupColor(ageGroup)}>
                                  {ageGroup}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{match.totalPlayers}</TableCell>
                          <TableCell className="text-right">{match.averagePoints}</TableCell>
                          <TableCell className="text-right">{match.pointsRange}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedMatch(match.matchId)}
                            >
                              View Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No mixed-age matches found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="match-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Individual Match Results
              </CardTitle>
              <CardDescription>
                View individual player results and point allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMatch ? (
                matchResults?.length ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Match #{selectedMatch} Results
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Age Group</TableHead>
                          <TableHead className="text-center">Result</TableHead>
                          <TableHead className="text-right">Base Points</TableHead>
                          <TableHead className="text-right">Multiplier</TableHead>
                          <TableHead className="text-right">Final Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{result.playerName || 'Anonymous'}</div>
                                <div className="text-sm text-muted-foreground">@{result.playerUsername}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getAgeGroupColor(result.ageGroupAtMatch)}>
                                {result.ageGroupAtMatch}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={result.isWinner ? 'default' : 'secondary'}>
                                {result.isWinner ? 'WIN' : 'LOSS'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{result.basePoints}</TableCell>
                            <TableCell className="text-right">{result.ageGroupMultiplier}x</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPoints(result.pointsAwarded)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for this match
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a match from the Mixed-Age Analytics tab to view results
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simplified Competition Creation Form - no nested tabs
function CompetitionCreationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: any) => {
      const res = await apiRequest('POST', '/api/admin/match-management/competitions', competitionData);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Competition Created",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Competition",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleCreateCompetition = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    
    const formData = new FormData(event.currentTarget);
    const competitionData = {
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      maxParticipants: formData.get('maxParticipants') ? parseInt(formData.get('maxParticipants') as string) : 16,
      entryFee: formData.get('entryFee') || '0',
      prizePool: formData.get('prizePool') || '0',
      pointsMultiplier: formData.get('pointsMultiplier') || '1.0',
    };

    await createCompetitionMutation.mutateAsync(competitionData);
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Create New Competition</h3>
        <p className="text-gray-600">Set up tournaments, leagues, or casual competitions</p>
      </div>
      
      <form onSubmit={handleCreateCompetition} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Competition Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="FPF Championship 2025"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Competition Type</Label>
            <Select name="type" defaultValue="tournament">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="league">League</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Description of the competition..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Players</Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              placeholder="16"
              min="4"
              max="128"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entryFee">Entry Fee</Label>
            <Input
              id="entryFee"
              name="entryFee"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pointsMultiplier">Points Multiplier</Label>
            <Input
              id="pointsMultiplier"
              name="pointsMultiplier"
              type="number"
              placeholder="1.0"
              step="0.1"
              min="0.5"
              max="3.0"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Competition...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Create Competition
            </>
          )}
        </Button>
      </form>
    </div>
  );
}