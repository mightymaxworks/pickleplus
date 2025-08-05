// Unified Match Management - Combines creation, management, and analytics
// Mobile-optimized with concise tabs and smart age group point allocation

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
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Badge
} from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Users, Trophy, Target, Plus, Calendar, Award } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Competition {
  id: number;
  name: string;
  description: string;
  type: 'league' | 'tournament' | 'casual';
  startDate: string;
  endDate?: string;
  status: string;
  maxParticipants?: number;
  entryFee: string;
  prizePool: string;
  pointsMultiplier: string;
  createdAt: string;
}

interface Match {
  id: number;
  competitionId: number;
  matchNumber?: string;
  format: 'singles' | 'doubles' | 'mixed_doubles';
  player1Id: number;
  player2Id?: number;
  player1PartnerId?: number;
  player2PartnerId?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime?: string;
  player1Score?: number;
  player2Score?: number;
  team1Score?: number;
  team2Score?: number;
  winnerId?: number;
  venue?: string;
  court?: string;
  createdAt: string;
}

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  gender?: string;
  yearOfBirth?: number;
  ageGroup?: string;
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

export default function UnifiedMatchManagement() {
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    type: 'casual' as const,
    startDate: '',
    endDate: '',
    maxParticipants: '',
    entryFee: '0',
    prizePool: '0',
    pointsMultiplier: '1.0'
  });
  const [newMatch, setNewMatch] = useState({
    competitionId: 0,
    format: 'singles' as const,
    player1Id: 0,
    player2Id: 0,
    player1PartnerId: 0,
    player2PartnerId: 0,
    scheduledTime: '',
    venue: '',
    court: ''
  });

  const queryClient = useQueryClient();

  // Fetch competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery<Competition[]>({
    queryKey: ['/api/admin/match-management/competitions'],
    staleTime: 30000,
  });

  // Fetch matches for selected competition
  const { data: matches } = useQuery<Match[]>({
    queryKey: ['/api/admin/match-management/matches', selectedCompetition],
    enabled: !!selectedCompetition,
    staleTime: 30000,
  });

  // Fetch available players
  const { data: players } = useQuery<Player[]>({
    queryKey: ['/api/admin/match-management/players/available'],
    staleTime: 60000,
  });

  // Fetch age groups for leaderboards
  const { data: ageGroups } = useQuery<any[]>({
    queryKey: ['/api/admin/enhanced-match-management/age-groups'],
    staleTime: 30000,
  });

  // Fetch leaderboard for selected age group
  const { data: leaderboard } = useQuery<{
    ageGroup: string;
    leaderboard: LeaderboardEntry[];
    total: number;
  }>({
    queryKey: ['/api/admin/enhanced-match-management/leaderboards', selectedAgeGroup],
    enabled: !!selectedAgeGroup,
    staleTime: 30000,
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (data: typeof newCompetition) => {
      const response = await apiRequest('POST', '/api/admin/match-management/competitions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      toast({ title: 'Competition created successfully' });
      setNewCompetition({
        name: '',
        description: '',
        type: 'casual',
        startDate: '',
        endDate: '',
        maxParticipants: '',
        entryFee: '0',
        prizePool: '0',
        pointsMultiplier: '1.0'
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create competition', description: error.message, variant: 'destructive' });
    },
  });

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (data: typeof newMatch) => {
      const response = await apiRequest('POST', '/api/admin/enhanced-match-management/matches', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/matches'] });
      toast({ title: 'Match created successfully' });
      setNewMatch({
        competitionId: 0,
        format: 'singles',
        player1Id: 0,
        player2Id: 0,
        player1PartnerId: 0,
        player2PartnerId: 0,
        scheduledTime: '',
        venue: '',
        court: ''
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create match', description: error.message, variant: 'destructive' });
    },
  });

  // Complete match mutation
  const completeMatchMutation = useMutation({
    mutationFn: async ({ matchId, winnerId, player1Score, player2Score, team1Score, team2Score }: {
      matchId: number;
      winnerId: number;
      player1Score?: number;
      player2Score?: number;
      team1Score?: number;
      team2Score?: number;
    }) => {
      const response = await apiRequest('POST', `/api/admin/enhanced-match-management/matches/${matchId}/complete`, {
        winnerId,
        player1Score,
        player2Score,
        team1Score,
        team2Score
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-match-management/age-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enhanced-match-management/leaderboards'] });
      toast({ title: 'Match completed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to complete match', description: error.message, variant: 'destructive' });
    },
  });

  useEffect(() => {
    if (ageGroups && ageGroups.length > 0 && !selectedAgeGroup) {
      setSelectedAgeGroup(ageGroups[0].ageGroup);
    }
  }, [ageGroups, selectedAgeGroup]);

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

  const formatPoints = (points: number) => points.toLocaleString();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Match Management</h1>
          <p className="text-sm text-muted-foreground">
            Create competitions, manage matches, track rankings
          </p>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="competitions" className="text-xs p-2">
            <Trophy className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Competitions</span>
            <span className="sm:hidden">Comps</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-xs p-2">
            <Target className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Matches</span>
            <span className="sm:hidden">Games</span>
          </TabsTrigger>
          <TabsTrigger value="rankings" className="text-xs p-2">
            <Award className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Rankings</span>
            <span className="sm:hidden">Ranks</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs p-2">
            <Users className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comp-name">Name</Label>
                  <Input
                    id="comp-name"
                    value={newCompetition.name}
                    onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                    placeholder="Tournament name"
                  />
                </div>
                <div>
                  <Label htmlFor="comp-type">Type</Label>
                  <Select
                    value={newCompetition.type}
                    onValueChange={(value: 'league' | 'tournament' | 'casual') =>
                      setNewCompetition({ ...newCompetition, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="comp-desc">Description</Label>
                <Textarea
                  id="comp-desc"
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  placeholder="Competition details"
                  className="h-20"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newCompetition.startDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max-players">Max Players</Label>
                  <Input
                    id="max-players"
                    type="number"
                    value={newCompetition.maxParticipants}
                    onChange={(e) => setNewCompetition({ ...newCompetition, maxParticipants: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="entry-fee">Entry Fee</Label>
                  <Input
                    id="entry-fee"
                    type="number"
                    step="0.01"
                    value={newCompetition.entryFee}
                    onChange={(e) => setNewCompetition({ ...newCompetition, entryFee: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="prize-pool">Prize Pool</Label>
                  <Input
                    id="prize-pool"
                    type="number"
                    step="0.01"
                    value={newCompetition.prizePool}
                    onChange={(e) => setNewCompetition({ ...newCompetition, prizePool: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button
                onClick={() => createCompetitionMutation.mutate(newCompetition)}
                disabled={createCompetitionMutation.isPending || !newCompetition.name}
                className="w-full"
              >
                {createCompetitionMutation.isPending ? 'Creating...' : 'Create Competition'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              {competitionsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : competitions?.length ? (
                <div className="space-y-2">
                  {competitions.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedCompetition(comp.id)}
                    >
                      <div>
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline">{comp.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>Pool: ${comp.prizePool}</div>
                        <div className="text-muted-foreground">{comp.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No competitions created yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Match
              </CardTitle>
              <CardDescription>
                Age groups are automatically calculated per player
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="match-comp">Competition</Label>
                  <Select
                    value={newMatch.competitionId.toString()}
                    onValueChange={(value) => setNewMatch({ ...newMatch, competitionId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions?.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id.toString()}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="match-format">Format</Label>
                  <Select
                    value={newMatch.format}
                    onValueChange={(value: 'singles' | 'doubles' | 'mixed_doubles') =>
                      setNewMatch({ ...newMatch, format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                      <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="player1">Player 1</Label>
                    <Select
                      value={newMatch.player1Id.toString()}
                      onValueChange={(value) => setNewMatch({ ...newMatch, player1Id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName} (@{player.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="player2">Player 2</Label>
                    <Select
                      value={newMatch.player2Id.toString()}
                      onValueChange={(value) => setNewMatch({ ...newMatch, player2Id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName} (@{player.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newMatch.format !== 'singles' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partner1">Player 1 Partner</Label>
                      <Select
                        value={newMatch.player1PartnerId.toString()}
                        onValueChange={(value) => setNewMatch({ ...newMatch, player1PartnerId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {players?.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.firstName} {player.lastName} (@{player.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="partner2">Player 2 Partner</Label>
                      <Select
                        value={newMatch.player2PartnerId.toString()}
                        onValueChange={(value) => setNewMatch({ ...newMatch, player2PartnerId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {players?.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.firstName} {player.lastName} (@{player.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduled-time">Scheduled Time</Label>
                  <Input
                    id="scheduled-time"
                    type="datetime-local"
                    value={newMatch.scheduledTime}
                    onChange={(e) => setNewMatch({ ...newMatch, scheduledTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={newMatch.venue}
                    onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                    placeholder="Court location"
                  />
                </div>
                <div>
                  <Label htmlFor="court">Court</Label>
                  <Input
                    id="court"
                    value={newMatch.court}
                    onChange={(e) => setNewMatch({ ...newMatch, court: e.target.value })}
                    placeholder="Court number"
                  />
                </div>
              </div>

              <Button
                onClick={() => createMatchMutation.mutate(newMatch)}
                disabled={createMatchMutation.isPending || !newMatch.competitionId || !newMatch.player1Id || !newMatch.player2Id}
                className="w-full"
              >
                {createMatchMutation.isPending ? 'Creating...' : 'Create Match'}
              </Button>
            </CardContent>
          </Card>

          {matches && matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">Match #{match.id}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline">{match.format}</Badge>
                          <Badge variant="outline" className="ml-1">{match.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {match.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Simple completion for demo - in real app would have proper form
                              completeMatchMutation.mutate({
                                matchId: match.id,
                                winnerId: match.player1Id,
                                player1Score: 11,
                                player2Score: 9
                              });
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Rankings
                  </CardTitle>
                  <CardDescription>
                    Individual player rankings by age group
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
              {leaderboard?.leaderboard.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Matches</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Win %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.leaderboard.map((player, index) => (
                      <TableRow key={player.playerId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            #{index + 1}
                            {index < 3 && (
                              <Award className={`h-3 w-3 ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 'text-amber-600'
                              }`} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{player.playerName || 'Anonymous'}</div>
                            <div className="text-xs text-muted-foreground">@{player.playerUsername}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPoints(player.totalPoints)}
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{player.matchesPlayed}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{player.winPercentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ranking data available for this age group
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ageGroups?.map((group) => (
              <Card key={group.ageGroup} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedAgeGroup(group.ageGroup)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <Badge className={getAgeGroupColor(group.ageGroup)}>
                      {group.ageGroup}
                    </Badge>
                    <Users className="h-4 w-4 text-muted-foreground" />
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
                    <span className="text-sm text-muted-foreground">Points:</span>
                    <span className="font-medium">{formatPoints(group.totalPoints)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}