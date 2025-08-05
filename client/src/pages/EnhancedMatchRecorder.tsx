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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Match</TabsTrigger>
          <TabsTrigger value="verify">
            {isAdmin ? 'Manage' : 'Verify'}
            {!isAdmin && (pendingVerifications.data as any)?.data?.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {(pendingVerifications.data as any).data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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
                  {createMatchMutation.isPending ? 'Creating...' : 
                   isAdmin ? 'Create Match' : 'Record Match'}
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
      </Tabs>
    </div>
  );
}