/**
 * PKL-278651-TOURN-0015-SYNC
 * Enhanced Seed Teams Dialog Component with Robust State Synchronization
 * 
 * Dialog for manually seeding teams into a tournament bracket
 * Updated to use Framework 5.0 enhanced state synchronization patterns with
 * multiple independent refresh mechanisms and improved cache invalidation
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Loader2,
  ShuffleIcon,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTournamentChanges } from '../context/TournamentChangeContext';

interface SeedTeamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bracketId: number;
  tournamentId: number;
}

interface TeamOption {
  id: number;
  teamName: string;
  players: string;
}

export function SeedTeamsDialog({ 
  open, 
  onOpenChange, 
  bracketId,
  tournamentId
}: SeedTeamsDialogProps) {
  const queryClient = useQueryClient();
  const tournamentChanges = useTournamentChanges();
  const [seedMethod, setSeedMethod] = useState<'manual' | 'rating' | 'random'>('manual');
  const [teamAssignments, setTeamAssignments] = useState<{[key: number]: number | null}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get bracket data
  const { 
    data: bracketData, 
    isLoading: isLoadingBracket,
    isError: isBracketError 
  } = useQuery({
    queryKey: [`bracket-${bracketId}`],
    queryFn: async () => {
      if (!bracketId) {
        return Promise.reject('No bracket ID provided');
      }
      const response = await apiRequest('GET', `/api/brackets/${bracketId}`);
      return response.json();
    },
    enabled: !!bracketId,
  });
  
  // Get tournament teams
  const {
    data: teamsData,
    isLoading: isLoadingTeams,
    isError: isTeamsError
  } = useQuery({
    queryKey: [`tournament-${tournamentId}-teams`],
    queryFn: async () => {
      if (!tournamentId) {
        return Promise.reject('No tournament ID provided');
      }
      const response = await apiRequest('GET', `/api/tournaments/${tournamentId}/teams`);
      return response.json();
    },
    enabled: !!tournamentId,
  });
  
  // Seed teams mutation with Framework 5.0 comprehensive state synchronization
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: {assignments: {[key: number]: number | null}, method: string}) => {
      console.log(`[PKL-278651-TOURN-0015-SYNC] Saving team seeds for bracket ${bracketId}`);
      const response = await apiRequest('POST', `/api/brackets/${bracketId}/seed`, data);
      return response.json();
    },
    onSuccess: (response) => {
      // Reset and close dialog
      onOpenChange(false);
      
      console.log(`[PKL-278651-TOURN-0015-SYNC] Teams seeded successfully, triggering comprehensive refresh mechanisms`);
      
      // 1. First independent refresh mechanism: granular query invalidation with specific keys
      // Invalidate all potential queryKeys that might contain bracket information
      queryClient.invalidateQueries({ queryKey: [`bracket-${bracketId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournament/brackets', bracketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/brackets', bracketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournament/brackets', bracketId, 'matches'] });
      
      // 2. Second independent refresh mechanism: context notification with detailed metadata
      // This allows components to selectively refresh based on the type and scope of change
      tournamentChanges.notifySpecificChange('teams_seeded', bracketId, {
        timestamp: Date.now(),
        method: data.method,
        teamCount: Object.keys(data.assignments).length,
        changedMatches: Object.keys(data.assignments).map(key => key.split('-')[0])
      });
      
      // 3. Third independent refresh mechanism: global tournament data refresh
      // This ensures any components displaying tournament lists or summaries are updated
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: [`tournament-${tournamentId}`] });
      
      // 4. Fourth refresh mechanism: UI feedback with completion notification
      toast({
        title: "Teams seeded successfully",
        description: "The bracket has been updated with your team assignments.",
        variant: "default",
      });
      
      // 5. Fifth refresh mechanism: Delayed secondary notification to handle race conditions
      setTimeout(() => {
        console.log(`[PKL-278651-TOURN-0015-SYNC] Sending delayed secondary notification for bracket ${bracketId}`);
        tournamentChanges.notifySpecificChange('teams_seeded', bracketId, {
          timestamp: Date.now(),
          isDelayedNotification: true
        });
      }, 300);
    },
    onError: (err) => {
      console.error("[PKL-278651-TOURN-0015-SYNC] Error seeding teams:", err);
      toast({
        title: "Failed to seed teams",
        description: "There was an error assigning teams to the bracket.",
        variant: "destructive",
      });
    }
  });
  
  // Initialize team assignments based on existing bracket data
  useEffect(() => {
    if (bracketData?.matches) {
      const initialAssignments: {[key: number]: number | null} = {};
      
      bracketData.matches.forEach(match => {
        if (match.team1Id) {
          initialAssignments[match.id + '-1'] = match.team1Id;
        }
        if (match.team2Id) {
          initialAssignments[match.id + '-2'] = match.team2Id;
        }
      });
      
      setTeamAssignments(initialAssignments);
    }
  }, [bracketData]);
  
  // Filter for first round matches only (for seeding)
  const firstRoundMatches = bracketData?.matches?.filter(match => {
    return bracketData.rounds.find(r => r.id === match.roundId)?.roundNumber === 1;
  }) || [];
  
  // Auto-generate seeds based on method
  const generateSeeds = () => {
    setIsProcessing(true);
    
    // Create a copy of available teams
    const availableTeams = [...(teamsData || [])];
    
    if (seedMethod === 'rating') {
      // Sort by team rating (assuming teams have ratings)
      availableTeams.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (seedMethod === 'random') {
      // Shuffle array
      for (let i = availableTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTeams[i], availableTeams[j]] = [availableTeams[j], availableTeams[i]];
      }
    }
    
    // Create new assignments
    const newAssignments: {[key: number]: number | null} = {};
    
    // Assign teams to first round matches
    let teamIndex = 0;
    firstRoundMatches.forEach(match => {
      if (teamIndex < availableTeams.length) {
        newAssignments[match.id + '-1'] = availableTeams[teamIndex].id;
        teamIndex++;
      }
      
      if (teamIndex < availableTeams.length) {
        newAssignments[match.id + '-2'] = availableTeams[teamIndex].id;
        teamIndex++;
      }
    });
    
    setTeamAssignments(newAssignments);
    setIsProcessing(false);
  };
  
  // Handle team selection change
  const handleTeamChange = (matchId: number, position: 1 | 2, teamId: number | null) => {
    setTeamAssignments(prev => ({
      ...prev,
      [`${matchId}-${position}`]: teamId === 0 ? null : teamId,
    }));
  };
  
  // Submit team assignments
  const handleSubmit = () => {
    // Convert team assignments to the format expected by the API
    const formattedAssignments: {matchId: number, position: 1 | 2, teamId: number | null}[] = [];
    
    Object.entries(teamAssignments).forEach(([key, teamId]) => {
      const [matchId, position] = key.split('-');
      formattedAssignments.push({
        matchId: parseInt(matchId),
        position: parseInt(position) as 1 | 2,
        teamId
      });
    });
    
    mutate({
      assignments: teamAssignments,
      method: seedMethod
    });
  };
  
  // Loading state
  if (isLoadingBracket || isLoadingTeams) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seeding Teams</DialogTitle>
            <DialogDescription>
              Loading bracket and team data...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Error state
  if (isBracketError || isTeamsError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Data</DialogTitle>
            <DialogDescription>
              We couldn't load the necessary data to seed teams.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load bracket or team data. Please try again later.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Build team options list
  const teamOptions: TeamOption[] = (teamsData || []).map(team => ({
    id: team.id,
    teamName: team.teamName,
    players: `${team.playerOne?.displayName || 'TBD'} & ${team.playerTwo?.displayName || 'TBD'}`
  }));
  
  // Add "None" option
  teamOptions.unshift({
    id: 0,
    teamName: "None (Empty Slot)",
    players: ""
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seed Teams in Bracket</DialogTitle>
          <DialogDescription>
            Assign teams to specific positions in the tournament bracket
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="manual" value={seedMethod} onValueChange={(value) => setSeedMethod(value as any)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="manual">Manual Seeding</TabsTrigger>
              <TabsTrigger value="rating">Seed by Rating</TabsTrigger>
              <TabsTrigger value="random">Random Seeding</TabsTrigger>
            </TabsList>
            
            {seedMethod !== 'manual' && (
              <Button 
                onClick={generateSeeds} 
                variant="outline" 
                className="gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShuffleIcon className="h-4 w-4" />
                )}
                Generate {seedMethod === 'rating' ? 'Rating-Based' : 'Random'} Seeds
              </Button>
            )}
          </div>
          
          <TabsContent value="manual" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manually assign teams to specific positions in the bracket.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="rating" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Seed teams based on their CourtIQ™ ratings, with highest rated teams placed in favorable positions.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="random" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Randomly assign teams to positions in the bracket.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">First Round Assignments</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Assign teams to first-round matches. Teams in later rounds will be determined by match results.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Position 1 Team</TableHead>
                  <TableHead>Position 2 Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firstRoundMatches.map(match => (
                  <TableRow key={match.id}>
                    <TableCell>Match {match.matchNumber}</TableCell>
                    <TableCell>
                      <Select
                        value={teamAssignments[`${match.id}-1`]?.toString() || ""}
                        onValueChange={(value) => handleTeamChange(match.id, 1, value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamOptions.map(team => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              <div>
                                <div>{team.teamName}</div>
                                {team.players && (
                                  <div className="text-xs text-muted-foreground">{team.players}</div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={teamAssignments[`${match.id}-2`]?.toString() || ""}
                        onValueChange={(value) => handleTeamChange(match.id, 2, value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamOptions.map(team => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              <div>
                                <div>{team.teamName}</div>
                                {team.players && (
                                  <div className="text-xs text-muted-foreground">{team.players}</div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "An error occurred while seeding teams"}
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Save Team Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}