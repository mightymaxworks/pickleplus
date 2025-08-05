// Enhanced Match Recorder - Admin interface using exact QuickMatchRecorder component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, AlertCircle, Plus, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';

interface Competition {
  id: number;
  name: string;
  type: 'league' | 'tournament';
  startDate: string;
  endDate: string;
  venue?: string;
  pointsMultiplier: number;
}

export default function EnhancedMatchRecorder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.isAdmin || false;
  
  // Tab state - Competitions comes FIRST for admins (logical flow)
  const [currentTab, setCurrentTab] = useState<string>(isAdmin ? 'competitions' : 'create');

  // Competition creation state
  const [competitionData, setCompetitionData] = useState({
    name: '',
    type: 'tournament' as 'tournament' | 'league',
    startDate: '',
    endDate: '',
    venue: '',
    pointsMultiplier: 2.0
  });

  // Mock data for competitions (in real app this would come from API)
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  // Fetch pending verifications for badge display
  const pendingVerifications = useQuery({
    queryKey: ['/api/admin/match-management/pending'],
    enabled: !!user,
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (data: typeof competitionData) => {
      const response = await apiRequest('POST', '/api/admin/competitions', data);
      return response.json();
    },
    onSuccess: (newCompetition) => {
      setCompetitions(prev => [...prev, newCompetition]);
      setCompetitionData({
        name: '',
        type: 'tournament',
        startDate: '',
        endDate: '',
        venue: '',
        pointsMultiplier: 2.0
      });
      toast({
        title: "Competition Created",
        description: `${newCompetition.name} has been successfully created.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Competition",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin ? 'Enhanced Match Management' : 'Match Recorder'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin 
            ? 'Create competitions, record matches for any players, and manage verifications with enhanced admin capabilities.'
            : 'Record your matches and manage verification requests from opponents.'
          }
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {isAdmin && (
            <TabsTrigger value="competitions" className="text-xs sm:text-sm px-2 py-2 flex-col">
              <Trophy className="h-4 w-4 mb-1" />
              <span className="hidden sm:inline">Competitions</span>
              <span className="sm:hidden">Comp</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="create" className="text-xs sm:text-sm px-2 py-2 flex-col">
            <Plus className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Record Match</span>
            <span className="sm:hidden">Record</span>
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-xs sm:text-sm px-2 py-2 flex-col">
            <AlertCircle className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">{isAdmin ? 'Manage' : 'Verify'}</span>
            <span className="sm:hidden">{isAdmin ? 'Manage' : 'Verify'}</span>
            {!isAdmin && (pendingVerifications.data as any)?.data?.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {(pendingVerifications.data as any).data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-2 flex-col">
            <Clock className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Competition Management Tab (Admin Only) - Must come FIRST */}
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

        {/* Match Recording Tab - Uses EXACT QuickMatchRecorder component */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Record Match
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Create matches for any players with enhanced admin capabilities - exact replica of player interface with admin features'
                  : 'Record a match you played - opponents will be notified to verify'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickMatchRecorder 
                onSuccess={(matchData) => {
                  toast({
                    title: "Match Recorded",
                    description: isAdmin 
                      ? "Match has been successfully created and recorded." 
                      : "Match recorded! Waiting for opponent verification.",
                  });
                  // Refresh any relevant queries
                  queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/match-management/recent'] });
                  // Switch to verify tab to see the recorded match
                  setCurrentTab('verify');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification/Management Tab */}
        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAdmin ? 'Match Management' : 'Match Verification'}</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Manage all matches, verify disputes, and handle administrative tasks'
                  : 'Verify matches recorded by opponents and handle disputes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                {isAdmin ? 'Admin match management' : 'Match verification'} interface will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Match History Tab */}
        <TabsContent value="history" className="space-y-6">
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