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
import { Loader2, Plus, Users, Trophy, Calendar, Target } from 'lucide-react';
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

  // Fetch competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/match-management/competitions');
      return response.json();
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

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competitionData: any) => {
      const response = await apiRequest('POST', '/api/admin/match-management/competitions', competitionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      setShowCreateCompetition(false);
      toast({
        title: "Competition Created",
        description: "New competition has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
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
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
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
      </Tabs>
    </div>
  );
};

export default MatchManagement;