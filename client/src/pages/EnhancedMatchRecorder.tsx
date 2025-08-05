// Enhanced Match Recorder - Works for both players and admins
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, Trophy, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  gender: 'male' | 'female';
  yearOfBirth?: number;
  ageGroup?: string;
}

interface Competition {
  id: number;
  name: string;
  type: 'league' | 'tournament' | 'casual';
  pointsMultiplier: string;
}

interface MatchData {
  player1Id: number;
  player2Id: number;
  player1PartnerId?: number;
  player2PartnerId?: number;
  format: 'singles' | 'doubles';
  matchDate: string;
  notes?: string;
  competitionId?: number;
  // Score data
  player1Score?: number;
  player2Score?: number;
  team1Score?: number;
  team2Score?: number;
  winnerId?: number;
  winningTeamPlayer1Id?: number;
  winningTeamPlayer2Id?: number;
}

export default function EnhancedMatchRecorder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState('create');
  const [matchData, setMatchData] = useState<MatchData>({
    player1Id: 0,
    player2Id: 0,
    format: 'singles',
    matchDate: new Date().toISOString().split('T')[0]
  });

  const isAdmin = user?.isAdmin;

  // API endpoint selection based on user role
  const apiBase = isAdmin ? '/api/admin/match-management' : '/api/player-match-verification';

  // Fetch available players
  const { data: playersData } = useQuery({
    queryKey: [isAdmin ? '/api/admin/match-management/players/available' : '/api/players'],
    enabled: true
  });

  // Fetch competitions (admin only)
  const { data: competitionsData } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    enabled: isAdmin
  });

  // Fetch pending verifications (player only)
  const pendingVerifications = useQuery({
    queryKey: ['/api/player-match-verification/matches/pending-verification'],
    enabled: !isAdmin
  });

  const players: Player[] = (playersData as any)?.data || [];
  const competitions: Competition[] = (competitionsData as any)?.data || [];

  // Create match mutation
  const createMatchMutation = useMutation({
    mutationFn: async (data: MatchData) => {
      const response = await apiRequest('POST', `${apiBase}/matches`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isAdmin ? 'Match Created' : 'Match Recorded',
        description: isAdmin 
          ? 'Match created successfully' 
          : 'Match recorded and sent for verification',
      });
      queryClient.invalidateQueries({ queryKey: [isAdmin ? '/api/admin/matches' : '/api/player-matches'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create match',
        variant: 'destructive',
      });
    },
  });

  // Verify match mutation (player only)
  const verifyMatchMutation = useMutation({
    mutationFn: async ({ matchId, status, disputeReason }: { 
      matchId: number; 
      status: 'verified' | 'disputed'; 
      disputeReason?: string;
    }) => {
      const response = await apiRequest('PATCH', `/api/player-match-verification/matches/${matchId}/verify`, {
        status,
        disputeReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Verification Complete',
        description: 'Your response has been recorded',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/player-match-verification/matches/pending-verification'] });
    }
  });

  const resetForm = () => {
    setMatchData({
      player1Id: 0,
      player2Id: 0,
      format: 'singles',
      matchDate: new Date().toISOString().split('T')[0]
    });
  };

  // Competition form state
  const [competitionData, setCompetitionData] = useState({
    name: '',
    type: 'tournament' as 'tournament' | 'league',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week later
    venue: '',
    pointsMultiplier: 1.0
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (data: typeof competitionData) => {
      const response = await apiRequest('POST', '/api/admin/match-management/competitions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Competition Created',
        description: 'New competition created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/competitions'] });
      setCompetitionData({
        name: '',
        type: 'tournament',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        venue: '',
        pointsMultiplier: 1.0
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create competition',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Date is required
    if (!matchData.matchDate) {
      toast({
        title: 'Validation Error',
        description: 'Match date is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!matchData.player1Id || !matchData.player2Id) {
      toast({
        title: 'Validation Error',
        description: 'Please select both players',
        variant: 'destructive',
      });
      return;
    }
    
    if (matchData.format === 'doubles' && (!matchData.player1PartnerId || !matchData.player2PartnerId)) {
      toast({
        title: 'Validation Error',
        description: 'Please select partners for doubles match',
        variant: 'destructive',
      });
      return;
    }

    createMatchMutation.mutate(matchData);
  };

  const calculateAgeFromBirthYear = (yearOfBirth?: number) => {
    if (!yearOfBirth) return 'Unknown';
    const age = new Date().getFullYear() - yearOfBirth;
    if (age < 19) return 'Youth';
    if (age < 35) return 'Open';
    if (age < 50) return '35+';
    if (age < 60) return '50+';
    if (age < 70) return '60+';
    return '70+';
  };

  const getGenderIcon = (gender: string) => {
    return (
      <Badge variant={gender === 'female' ? 'secondary' : 'outline'} className="text-xs">
        {gender === 'female' ? '♀' : '♂'}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isAdmin ? 'Admin Match Management' : 'Match Recorder'}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? 'Create and manage matches with full administrative control'
            : 'Record your matches and verify opponent results'
          }
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Record Match</TabsTrigger>
          <TabsTrigger value="verify">
            {isAdmin ? 'Manage' : 'Verify'}
            {!isAdmin && (pendingVerifications.data as any)?.data?.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {(pendingVerifications.data as any).data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          {isAdmin && <TabsTrigger value="competitions">Competitions</TabsTrigger>}
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                New Match
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Create matches for any players with optional competition linking'
                  : 'Record a match you played - opponents will be notified to verify'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Match Format */}
                <div className="space-y-2">
                  <Label>Match Format</Label>
                  <Select 
                    value={matchData.format} 
                    onValueChange={(value: 'singles' | 'doubles') => 
                      setMatchData(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Player Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Player 1</Label>
                    <Select 
                      value={matchData.player1Id.toString()} 
                      onValueChange={(value) => 
                        setMatchData(prev => ({ ...prev, player1Id: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player: Player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            <div className="flex items-center gap-2">
                              {getGenderIcon(player.gender)}
                              <span>{player.firstName} {player.lastName}</span>
                              <span className="text-xs text-muted-foreground">
                                {calculateAgeFromBirthYear(player.yearOfBirth)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Player 2</Label>
                    <Select 
                      value={matchData.player2Id.toString()} 
                      onValueChange={(value) => 
                        setMatchData(prev => ({ ...prev, player2Id: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player: Player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            <div className="flex items-center gap-2">
                              {getGenderIcon(player.gender)}
                              <span>{player.firstName} {player.lastName}</span>
                              <span className="text-xs text-muted-foreground">
                                {calculateAgeFromBirthYear(player.yearOfBirth)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doubles Partners */}
                  {matchData.format === 'doubles' && (
                    <>
                      <div className="space-y-2">
                        <Label>Player 1 Partner</Label>
                        <Select 
                          value={matchData.player1PartnerId?.toString() || ''} 
                          onValueChange={(value) => 
                            setMatchData(prev => ({ ...prev, player1PartnerId: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player: Player) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {getGenderIcon(player.gender)}
                                  <span>{player.firstName} {player.lastName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {calculateAgeFromBirthYear(player.yearOfBirth)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Player 2 Partner</Label>
                        <Select 
                          value={matchData.player2PartnerId?.toString() || ''} 
                          onValueChange={(value) => 
                            setMatchData(prev => ({ ...prev, player2PartnerId: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player: Player) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {getGenderIcon(player.gender)}
                                  <span>{player.firstName} {player.lastName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {calculateAgeFromBirthYear(player.yearOfBirth)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {/* Match Details */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Match Date (Required)
                  </Label>
                  <Input 
                    type="date"
                    value={matchData.matchDate}
                    onChange={(e) => setMatchData(prev => ({ ...prev, matchDate: e.target.value }))}
                    required
                  />
                </div>

                {/* Competition Venue Display (if linked to competition) */}
                {isAdmin && matchData.competitionId && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Venue and court details will be set from the selected competition</span>
                    </div>
                  </div>
                )}

                {/* Competition Linking (Admin Only) */}
                {isAdmin && competitions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Link to Competition (Optional)</Label>
                    <Select 
                      value={matchData.competitionId?.toString() || ''} 
                      onValueChange={(value) => 
                        setMatchData(prev => ({ 
                          ...prev, 
                          competitionId: value ? parseInt(value) : undefined 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select competition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No competition</SelectItem>
                        {competitions.map((comp: Competition) => (
                          <SelectItem key={comp.id} value={comp.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Badge variant={comp.type === 'tournament' ? 'default' : 'outline'}>
                                {comp.type}
                              </Badge>
                              <span>{comp.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {comp.pointsMultiplier}x points
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Score Recording */}
                <div className="space-y-4 p-4 border border-dashed border-muted-foreground/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-orange-600" />
                    <Label className="font-semibold">Match Score Recording</Label>
                  </div>
                  
                  {matchData.format === 'singles' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Player 1 Score</Label>
                        <Input 
                          type="number"
                          min="0"
                          max="21"
                          placeholder="Score"
                          value={matchData.player1Score || ''}
                          onChange={(e) => setMatchData(prev => ({ 
                            ...prev, 
                            player1Score: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Player 2 Score</Label>
                        <Input 
                          type="number"
                          min="0"
                          max="21"
                          placeholder="Score"
                          value={matchData.player2Score || ''}
                          onChange={(e) => setMatchData(prev => ({ 
                            ...prev, 
                            player2Score: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Team 1 Score</Label>
                        <Input 
                          type="number"
                          min="0"
                          max="21"
                          placeholder="Score"
                          value={matchData.team1Score || ''}
                          onChange={(e) => setMatchData(prev => ({ 
                            ...prev, 
                            team1Score: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Team 2 Score</Label>
                        <Input 
                          type="number"
                          min="0"
                          max="21"
                          placeholder="Score"
                          value={matchData.team2Score || ''}
                          onChange={(e) => setMatchData(prev => ({ 
                            ...prev, 
                            team2Score: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Winner Selection */}
                  {((matchData.format === 'singles' && matchData.player1Score !== undefined && matchData.player2Score !== undefined) ||
                    (matchData.format === 'doubles' && matchData.team1Score !== undefined && matchData.team2Score !== undefined)) && (
                    <div className="space-y-2">
                      <Label>Winner</Label>
                      <Select 
                        value={matchData.winnerId?.toString() || ''} 
                        onValueChange={(value) => {
                          if (value) {
                            const winnerId = parseInt(value);
                            setMatchData(prev => ({ 
                              ...prev, 
                              winnerId,
                              // Set winning team for doubles
                              winningTeamPlayer1Id: matchData.format === 'doubles' && winnerId === matchData.player1Id 
                                ? matchData.player1Id 
                                : undefined,
                              winningTeamPlayer2Id: matchData.format === 'doubles' && winnerId === matchData.player1Id 
                                ? matchData.player1PartnerId 
                                : (matchData.format === 'doubles' && winnerId === matchData.player2Id 
                                  ? matchData.player2PartnerId 
                                  : undefined)
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select winner" />
                        </SelectTrigger>
                        <SelectContent>
                          {matchData.format === 'singles' ? (
                            <>
                              <SelectItem value={matchData.player1Id.toString()}>
                                {players.find(p => p.id === matchData.player1Id)?.firstName} {players.find(p => p.id === matchData.player1Id)?.lastName}
                              </SelectItem>
                              <SelectItem value={matchData.player2Id.toString()}>
                                {players.find(p => p.id === matchData.player2Id)?.firstName} {players.find(p => p.id === matchData.player2Id)?.lastName}
                              </SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value={matchData.player1Id.toString()}>
                                Team 1: {players.find(p => p.id === matchData.player1Id)?.firstName} & {players.find(p => p.id === matchData.player1PartnerId)?.firstName}
                              </SelectItem>
                              <SelectItem value={matchData.player2Id.toString()}>
                                Team 2: {players.find(p => p.id === matchData.player2Id)?.firstName} & {players.find(p => p.id === matchData.player2PartnerId)?.firstName}
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea 
                    placeholder="Match notes, special conditions..."
                    value={matchData.notes || ''}
                    onChange={(e) => setMatchData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createMatchMutation.isPending}
                >
                  {createMatchMutation.isPending ? 'Recording...' : 'Record Match & Score'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          {!isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Pending Verifications
                </CardTitle>
                <CardDescription>
                  These matches require your verification before points are awarded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(pendingVerifications.data as any)?.data?.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No matches pending your verification
                  </p>
                )}
                
                {(pendingVerifications.data as any)?.data?.map((verification: any) => (
                  <Card key={verification.matchId} className="mb-4">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium">
                            Match recorded by {verification.recordedBy.firstName} {verification.recordedBy.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(verification.match.matchDate).toLocaleDateString()}
                          </p>
                          {verification.match.venue && (
                            <p className="text-sm text-muted-foreground">
                              📍 {verification.match.venue}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {verification.match.format}
                        </Badge>
                      </div>
                      
                      {verification.match.player1Score !== null && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          {verification.match.format === 'singles' ? (
                            <p className="text-center">
                              Score: {verification.match.player1Score} - {verification.match.player2Score}
                            </p>
                          ) : (
                            <p className="text-center">
                              Team Score: {verification.match.team1Score} - {verification.match.team2Score}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => verifyMatchMutation.mutate({
                            matchId: verification.matchId,
                            status: 'verified'
                          })}
                          disabled={verifyMatchMutation.isPending}
                        >
                          ✓ Verify
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Why do you dispute this match?');
                            if (reason) {
                              verifyMatchMutation.mutate({
                                matchId: verification.matchId,
                                status: 'disputed',
                                disputeReason: reason
                              });
                            }
                          }}
                          disabled={verifyMatchMutation.isPending}
                        >
                          ⚠ Dispute
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
              <CardDescription>
                View all your {isAdmin ? 'managed' : 'recorded'} matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Match history will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competition Management Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="competitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Create New Competition
                </CardTitle>
                <CardDescription>
                  Create tournaments and competitions for linking to matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createCompetitionMutation.mutate(competitionData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Competition Name</Label>
                      <Input 
                        placeholder="e.g., Summer Championship 2025"
                        value={competitionData.name}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={competitionData.type} 
                        onValueChange={(value: 'tournament' | 'league') => 
                          setCompetitionData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="league">League</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="date"
                        value={competitionData.startDate}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="date"
                        value={competitionData.endDate}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Venue (Optional)</Label>
                      <Input 
                        placeholder="e.g., Central Sports Complex"
                        value={competitionData.venue}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, venue: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Points Multiplier</Label>
                      <Select 
                        value={competitionData.pointsMultiplier.toString()} 
                        onValueChange={(value) => 
                          setCompetitionData(prev => ({ ...prev, pointsMultiplier: parseFloat(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.0">1.0x (Standard)</SelectItem>
                          <SelectItem value="1.5">1.5x (Premium)</SelectItem>
                          <SelectItem value="2.0">2.0x (Championship)</SelectItem>
                          <SelectItem value="3.0">3.0x (Major Tournament)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createCompetitionMutation.isPending}
                  >
                    {createCompetitionMutation.isPending ? 'Creating...' : 'Create Competition'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Competitions</CardTitle>
                <CardDescription>
                  Manage your current competitions and tournaments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {competitions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No competitions created yet. Create your first competition above.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {competitions.map((comp: Competition) => (
                      <Card key={comp.id} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{comp.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{comp.type}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">
                                  {comp.pointsMultiplier}x Points
                                </Badge>
                                {comp.venue && (
                                  <Badge variant="outline">
                                    📍 {comp.venue}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {new Date(comp.startDate).toLocaleDateString()} - {new Date(comp.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}