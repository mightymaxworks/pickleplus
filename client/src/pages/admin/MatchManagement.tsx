import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Users, Trophy, Calendar, Target, Edit, Trash2, Eye, RefreshCw, AlertCircle } from 'lucide-react';
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
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
}

interface Match {
  id: number;
  competitionId: number;
  matchNumber?: string;
  format: 'singles_male' | 'singles_female' | 'mens_doubles' | 'womens_doubles' | 'mixed_doubles';
  ageGroup: '18_29' | '30_39' | '40_49' | '50_59' | '60_69' | '70_plus';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime?: string;
  player1Score: number;
  player2Score: number;
  team1Score: number;
  team2Score: number;
  winnerPoints: number;
  loserPoints: number;
  venue?: string;
  court?: string;
  createdAt: string;
  competition?: {
    id: number;
    name: string;
    type: string;
  };
}

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  gender?: string;
  birthDate?: string;
  currentRating?: string;
  ageGroup?: string;
}

const MatchManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);
  const [showCreateCompetition, setShowCreateCompetition] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedMatchForEdit, setSelectedMatchForEdit] = useState<any>(null);
  const [editMatchData, setEditMatchData] = useState({
    player1Score: '',
    player2Score: '',
    team1Score: '',
    team2Score: '',
    winnerId: '',
    notes: ''
  });

  // Fetch competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/competitions');
      const data = await response.json();
      console.log('[Admin] Competitions API response:', data);
      console.log('[Admin] Competitions data structure:', data?.data);
      return data;
    }
  });

  // Fetch matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/admin/match-management/matches'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/matches');
      return response.json();
    }
  });

  // Fetch available players
  const { data: players } = useQuery({
    queryKey: ['/api/admin/match-management/players/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/players/available');
      return response.json();
    }
  });

  // Fetch completed matches for CRUD operations
  const { data: completedMatches, isLoading: completedMatchesLoading, refetch: refetchCompletedMatches } = useQuery({
    queryKey: ['/api/admin/enhanced-match-management/matches/completed'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/enhanced-match-management/matches/completed?limit=20');
      return response.json();
    }
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: any) => {
      const response = await apiRequest('POST', '/api/admin/match-management/competitions', competitionData);
      const data = await response.json();
      console.log('[Admin] Competition creation response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('[Admin] Competition created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      setShowCreateCompetition(false);
      toast({
        title: "Competition Created",
        description: `Competition "${data.data?.name || 'New Competition'}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('[Admin] Competition creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create competition. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const response = await apiRequest('POST', '/api/admin/match-management/matches', matchData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/matches'] });
      setShowCreateMatch(false);
      toast({
        title: "Match Created",
        description: "New match has been scheduled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create match. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update match mutation (CRUD)
  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, updateData }: { matchId: number, updateData: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/enhanced-match-management/matches/${matchId}/update`, updateData);
      return response.json();
    },
    onSuccess: (data) => {
      refetchCompletedMatches();
      setSelectedMatchForEdit(null);
      toast({
        title: "Match Updated Successfully",
        description: `${data.message} - Points automatically recalculated`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete match mutation (CRUD)
  const deleteMatchMutation = useMutation({
    mutationFn: async ({ matchId, reason }: { matchId: number, reason?: string }) => {
      const response = await apiRequest('DELETE', `/api/admin/enhanced-match-management/matches/${matchId}`, { reason });
      return response.json();
    },
    onSuccess: (data) => {
      refetchCompletedMatches();
      toast({
        title: "Match Deleted Successfully",
        description: `${data.message} - ${data.pointsReversed} player results removed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateCompetition = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const competitionData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
      maxParticipants: parseInt(formData.get('maxParticipants') as string) || null,
      entryFee: formData.get('entryFee') as string || '0.00',
      prizePool: formData.get('prizePool') as string || '0.00',
      pointsMultiplier: formData.get('pointsMultiplier') as string || '1.00',
    };

    createCompetitionMutation.mutate(competitionData);
  };

  const handleCreateMatch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const matchData = {
      competitionId: parseInt(formData.get('competitionId') as string),
      matchNumber: formData.get('matchNumber') as string,
      format: formData.get('format') as string,
      ageGroup: formData.get('ageGroup') as string,
      scheduledTime: formData.get('scheduledTime') as string || null,
      venue: formData.get('venue') as string,
      court: formData.get('court') as string,
      player1Id: parseInt(formData.get('player1Id') as string) || null,
      player2Id: parseInt(formData.get('player2Id') as string) || null,
    };

    createMatchMutation.mutate(matchData);
  };

  // Handle match update (CRUD)
  const handleUpdateMatch = () => {
    if (!selectedMatchForEdit) return;
    
    const payload = Object.fromEntries(
      Object.entries(editMatchData).filter(([_, v]) => v !== '')
    );
    
    // Convert string numbers to integers
    if (payload.player1Score) payload.player1Score = parseInt(payload.player1Score as string);
    if (payload.player2Score) payload.player2Score = parseInt(payload.player2Score as string);
    if (payload.team1Score) payload.team1Score = parseInt(payload.team1Score as string);
    if (payload.team2Score) payload.team2Score = parseInt(payload.team2Score as string);
    if (payload.winnerId) payload.winnerId = parseInt(payload.winnerId as string);
    
    updateMatchMutation.mutate({ matchId: selectedMatchForEdit.id, updateData: payload });
  };

  // Handle match deletion (CRUD)
  const handleDeleteMatch = (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match? This will reverse all ranking points.')) {
      return;
    }
    
    deleteMatchMutation.mutate({ 
      matchId, 
      reason: 'Deleted via admin match management interface' 
    });
  };

  // Load match details for editing
  const loadMatchForEdit = async (match: any) => {
    try {
      const response = await apiRequest('GET', `/api/admin/enhanced-match-management/matches/${match.id}/details`);
      const data = await response.json();
      
      setSelectedMatchForEdit(data);
      setEditMatchData({
        player1Score: data.match?.player1Score?.toString() || '',
        player2Score: data.match?.player2Score?.toString() || '',
        team1Score: data.match?.team1Score?.toString() || '',
        team2Score: data.match?.team2Score?.toString() || '',
        winnerId: '',
        notes: data.match?.notes || ''
      });
    } catch (error) {
      toast({
        title: "Error Loading Match",
        description: "Failed to load match details for editing.",
        variant: "destructive",
      });
    }
  };

  const formatCompetitionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatMatchFormat = (format: string) => {
    return format.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatAgeGroup = (ageGroup: string) => {
    return ageGroup.replace('_', '-');
  };

  if (competitionsLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
          <p className="text-muted-foreground">
            Manage competitions, leagues, tournaments, and ranking point allocation
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCreateCompetition} onOpenChange={setShowCreateCompetition}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Competition</DialogTitle>
                <DialogDescription>
                  Set up a new league, tournament, or casual match series
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCompetition} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Competition Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league">League</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input id="maxParticipants" name="maxParticipants" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee</Label>
                    <Input id="entryFee" name="entryFee" type="number" step="0.01" defaultValue="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsMultiplier">Points Multiplier</Label>
                    <Input id="pointsMultiplier" name="pointsMultiplier" type="number" step="0.01" defaultValue="1.00" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateCompetition(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCompetitionMutation.isPending}>
                    {createCompetitionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Competition
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateMatch} onOpenChange={setShowCreateMatch}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                New Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Match</DialogTitle>
                <DialogDescription>
                  Create a match between players or teams
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="competitionId">Competition</Label>
                    <Select name="competitionId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select competition" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitions?.data?.map((comp: Competition) => (
                          <SelectItem key={comp.id} value={comp.id.toString()}>
                            {comp.name} ({formatCompetitionType(comp.type)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matchNumber">Match Number</Label>
                    <Input id="matchNumber" name="matchNumber" placeholder="e.g., QF-1, Semi-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select name="format" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="singles_male">Singles Male</SelectItem>
                        <SelectItem value="singles_female">Singles Female</SelectItem>
                        <SelectItem value="mens_doubles">Men's Doubles</SelectItem>
                        <SelectItem value="womens_doubles">Women's Doubles</SelectItem>
                        <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group</Label>
                    <Select name="ageGroup" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18_29">18-29</SelectItem>
                        <SelectItem value="30_39">30-39</SelectItem>
                        <SelectItem value="40_49">40-49</SelectItem>
                        <SelectItem value="50_59">50-59</SelectItem>
                        <SelectItem value="60_69">60-69</SelectItem>
                        <SelectItem value="70_plus">70+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="player1Id">Player 1</Label>
                    <Select name="player1Id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select player 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.data?.map((player: Player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName} ({player.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player2Id">Player 2</Label>
                    <Select name="player2Id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select player 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.data?.map((player: Player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.firstName} {player.lastName} ({player.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input id="scheduledTime" name="scheduledTime" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input id="venue" name="venue" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="court">Court</Label>
                    <Input id="court" name="court" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateMatch(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMatchMutation.isPending}>
                    {createMatchMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Schedule Match
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="competitions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          {competitionsLoading ? (
            <div className="text-center py-8">Loading competitions...</div>
          ) : competitions?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No competitions found. Create your first competition to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {competitions?.data?.map((competition: Competition) => (
                <Card key={competition.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competition.name}</CardTitle>
                    <Badge variant={competition.type === 'tournament' ? 'default' : 
                                  competition.type === 'league' ? 'secondary' : 'outline'}>
                      {formatCompetitionType(competition.type)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {competition.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(competition.startDate).toLocaleDateString()}
                      {competition.endDate && ` - ${new Date(competition.endDate).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4 mr-2" />
                      Prize Pool: ${competition.prizePool}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Max: {competition.maxParticipants || 'Unlimited'} participants
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-4 w-4 mr-2" />
                      Points Multiplier: {competition.pointsMultiplier}x
                    </div>
                  </div>
                </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="space-y-4">
            {matches?.data?.map((match: Match) => (
              <Card key={match.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {match.competition?.name} - {match.matchNumber || `Match #${match.id}`}
                        </h3>
                        <Badge variant={match.status === 'completed' ? 'default' : 
                                      match.status === 'in_progress' ? 'secondary' : 'outline'}>
                          {match.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatMatchFormat(match.format)}</span>
                        <span>Age: {formatAgeGroup(match.ageGroup)}</span>
                        {match.venue && <span>Venue: {match.venue}</span>}
                        {match.court && <span>Court: {match.court}</span>}
                      </div>
                      {match.scheduledTime && (
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {new Date(match.scheduledTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {match.status === 'completed' && (
                        <div className="space-y-1">
                          <div className="text-lg font-bold">
                            {match.format.includes('doubles') 
                              ? `${match.team1Score} - ${match.team2Score}`
                              : `${match.player1Score} - ${match.player2Score}`
                            }
                          </div>
                          {match.winnerPoints > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Points: {match.winnerPoints}W / {match.loserPoints}L
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Completed Matches Management</h3>
              <p className="text-sm text-muted-foreground">
                Edit scores, update winners, and manage completed match data with automatic point recalculation
              </p>
            </div>
            <Button onClick={() => refetchCompletedMatches()} disabled={completedMatchesLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {completedMatchesLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!completedMatchesLoading && (!completedMatches?.matches || completedMatches.matches.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Matches</h3>
                <p className="text-gray-500 text-center max-w-md">
                  No completed matches found. Matches will appear here after they are recorded and finished.
                </p>
              </CardContent>
            </Card>
          )}

          {!completedMatchesLoading && completedMatches?.matches && completedMatches.matches.length > 0 && (
            <div className="grid gap-4">
              {completedMatches.matches.map((match: any) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Match #{match.id}</CardTitle>
                        <CardDescription>
                          {match.competitionName} • {formatMatchFormat(match.format || 'singles')} • {formatAgeGroup(match.ageGroup || '30_39')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{match.status}</Badge>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {match.player1Score}-{match.player2Score}
                          </div>
                          {match.team1Score !== null && (
                            <div className="text-sm text-gray-500">
                              Teams: {match.team1Score}-{match.team2Score}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <div>Updated: {new Date(match.updatedAt).toLocaleDateString()}</div>
                        <div>Competition ID: {match.competitionId}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadMatchForEdit(match)}
                          disabled={updateMatchMutation.isPending}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteMatch(match.id)}
                          disabled={deleteMatchMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Match Dialog */}
          <Dialog open={!!selectedMatchForEdit} onOpenChange={() => setSelectedMatchForEdit(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Match #{selectedMatchForEdit?.match?.id}</DialogTitle>
                <DialogDescription>
                  Update match scores and details. Points will be automatically recalculated.
                </DialogDescription>
              </DialogHeader>
              
              {selectedMatchForEdit && (
                <div className="space-y-6">
                  {/* Match Info Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Match Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Competition: {selectedMatchForEdit.match?.competitionName}</div>
                      <div>Status: <Badge>{selectedMatchForEdit.match?.status}</Badge></div>
                      <div>Format: {formatMatchFormat(selectedMatchForEdit.match?.format || 'singles')}</div>
                      <div>Age Group: {formatAgeGroup(selectedMatchForEdit.match?.ageGroup || '30_39')}</div>
                    </div>
                  </div>

                  {/* Player Results Display */}
                  {selectedMatchForEdit.playerResults && selectedMatchForEdit.playerResults.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Current Player Results ({selectedMatchForEdit.playerResults.length})</h4>
                      <div className="space-y-1">
                        {selectedMatchForEdit.playerResults.map((result: any) => (
                          <div key={result.id} className="flex justify-between text-sm">
                            <span>
                              {result.playerName}
                              {result.isWinner && <Badge className="ml-2" variant="default">Winner</Badge>}
                            </span>
                            <span className="font-medium">{result.pointsAwarded} points</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Form */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Update Match Scores</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Player 1 Score</Label>
                        <Input
                          type="number"
                          placeholder="Enter score"
                          value={editMatchData.player1Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, player1Score: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Player 2 Score</Label>
                        <Input
                          type="number"
                          placeholder="Enter score"
                          value={editMatchData.player2Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, player2Score: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Team 1 Score (if doubles)</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty if not doubles"
                          value={editMatchData.team1Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, team1Score: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Team 2 Score (if doubles)</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty if not doubles"
                          value={editMatchData.team2Score}
                          onChange={(e) => setEditMatchData(prev => ({...prev, team2Score: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Winner Player ID (optional)</Label>
                      <Input
                        type="number"
                        placeholder="Enter player ID of the winner"
                        value={editMatchData.winnerId}
                        onChange={(e) => setEditMatchData(prev => ({...prev, winnerId: e.target.value}))}
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty to auto-determine winner based on scores
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Add notes about this match update (optional)"
                        value={editMatchData.notes}
                        onChange={(e) => setEditMatchData(prev => ({...prev, notes: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMatchForEdit(null)}
                      disabled={updateMatchMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateMatch}
                      disabled={updateMatchMutation.isPending}
                    >
                      {updateMatchMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating & Recalculating...
                        </>
                      ) : (
                        'Update Match & Recalculate Points'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchManagement;