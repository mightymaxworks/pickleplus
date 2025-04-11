/**
 * PKL-278651-TOURN-0001-BRCKT
 * Bracket Viewer Component
 * 
 * Visual display of a tournament bracket with matches and progression
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

type Team = {
  id: number;
  teamName: string;
  playerOne: {
    id: number;
    displayName: string;
    avatarUrl?: string;
    avatarInitials?: string;
  };
  playerTwo: {
    id: number;
    displayName: string;
    avatarUrl?: string;
    avatarInitials?: string;
  };
  seedNumber?: number;
};

type Match = {
  id: number;
  roundNumber: number;
  matchNumber: number;
  team1Id: number | null;
  team2Id: number | null;
  winnerId: number | null;
  loserId: number | null;
  score: string | null;
  team1?: Team;
  team2?: Team;
  nextMatchId: number | null;
  consolationMatchId: number | null;
  isBye: boolean;
};

type Round = {
  id: number;
  roundNumber: number;
  roundName: string;
  matches: Match[];
};

type Bracket = {
  id: number;
  tournamentId: number;
  name: string;
  bracketType: string;
  teams: Team[];
  rounds: Round[];
};

type BracketViewerProps = {
  bracket: Bracket;
};

type MatchCardProps = {
  match: Match;
  onClick: (match: Match) => void;
  isLoading?: boolean;
};

function MatchCard({ match, onClick, isLoading = false }: MatchCardProps) {
  if (isLoading) {
    return (
      <Card className="w-64 mb-4">
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-16 mx-auto mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isBye = match.isBye || (!match.team1Id || !match.team2Id);
  const isCompleted = match.winnerId !== null;
  const isPending = !isBye && match.team1Id !== null && match.team2Id !== null && !isCompleted;
  const isUpcoming = !isBye && (match.team1Id === null || match.team2Id === null);

  const getStatusBadge = () => {
    if (isBye) {
      return <Badge variant="outline">BYE</Badge>;
    } else if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    } else if (isPending) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready</Badge>;
    } else {
      return <Badge variant="outline">Waiting</Badge>;
    }
  };

  const renderTeam = (team: Team | undefined, isWinner: boolean) => {
    if (!team) {
      return (
        <div className="h-8 flex items-center text-muted-foreground italic">
          TBD
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 h-8 ${isWinner ? 'font-medium' : ''}`}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={team.playerOne.avatarUrl} />
          <AvatarFallback>{team.playerOne.avatarInitials || team.teamName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="truncate">{team.teamName}</span>
      </div>
    );
  };

  return (
    <Card 
      className={`w-64 mb-4 ${isPending ? 'border-blue-300 shadow-sm' : ''}`}
      onClick={() => isPending && onClick(match)}
    >
      <CardContent className={`p-4 ${isPending ? 'cursor-pointer hover:bg-muted/50' : ''}`}>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {renderTeam(match.team1, match.winnerId === match.team1Id)}
            {renderTeam(match.team2, match.winnerId === match.team2Id)}
          </div>
          
          <div className="flex justify-center pt-1">
            {match.score ? (
              <Badge variant="outline" className="text-xs">
                {match.score}
              </Badge>
            ) : (
              <div className="flex justify-center gap-1">
                {getStatusBadge()}
                {isPending && (
                  <Badge variant="outline" className="bg-blue-50 text-xs">
                    Click to record
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BracketViewer({ bracket }: BracketViewerProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoreValue, setScoreValue] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: { 
      matchId: number; 
      winnerId: number; 
      loserId: number; 
      score: string;
    }) => {
      return apiRequest(`/api/brackets/matches/${values.matchId}/result`, {
        method: 'POST',
        data: values,
      });
    },
    onSuccess: () => {
      setSelectedMatch(null);
      setScoreValue('');
      setSelectedWinnerId(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/brackets/${bracket.id}`] });
      
      toast({
        title: 'Score recorded',
        description: 'Match result has been saved successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error recording match result:', error);
      toast({
        title: 'Failed to record result',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const handleScoreSubmit = () => {
    if (!selectedMatch || !selectedWinnerId || !scoreValue) return;
    
    const loserId = selectedWinnerId === selectedMatch.team1Id 
      ? selectedMatch.team2Id 
      : selectedMatch.team1Id;
    
    if (!loserId) return;
    
    mutate({
      matchId: selectedMatch.id,
      winnerId: selectedWinnerId,
      loserId,
      score: scoreValue,
    });
  };

  // Group matches by round for easier rendering
  const roundsWithMatches = bracket.rounds.sort((a, b) => a.roundNumber - b.roundNumber);
  
  // Calculate the width of the bracket based on the number of rounds
  const bracketWidth = roundsWithMatches.length * 300;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">{bracket.name}</h2>
      <div className="mb-6 flex gap-2 items-center">
        <Badge className="text-sm py-1">
          {bracket.bracketType === 'single_elimination' ? 'Single Elimination' : bracket.bracketType}
        </Badge>
        <Badge variant="outline" className="text-sm py-1">
          {bracket.teams.length} Teams
        </Badge>
        <Badge variant="outline" className="text-sm py-1">
          {roundsWithMatches.length} Rounds
        </Badge>
      </div>

      {/* Bracket visualization */}
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex gap-8 pb-6 mt-4" style={{ width: `${bracketWidth}px`, minWidth: '100%' }}>
          {roundsWithMatches.map((round) => (
            <div key={round.id} className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">{round.roundName}</h3>
              <div className="flex flex-col gap-y-8">
                {round.matches.map((match) => (
                  <div key={match.id} className="flex flex-col items-center">
                    <MatchCard 
                      match={match} 
                      onClick={() => {
                        setSelectedMatch(match);
                        setScoreValue('');
                        setSelectedWinnerId(null);
                      }} 
                    />
                    {match.nextMatchId && (
                      <div className="flex items-center justify-center h-8">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Score entry dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Match Result</DialogTitle>
            <DialogDescription>
              Enter the final score and select the winning team.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <Label>Select Winner</Label>
                <div className="space-y-2">
                  {selectedMatch.team1 && (
                    <div 
                      className={`p-3 border rounded-md cursor-pointer flex items-center gap-3 
                        ${selectedWinnerId === selectedMatch.team1Id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedWinnerId(selectedMatch.team1Id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedMatch.team1.playerOne.avatarUrl} />
                        <AvatarFallback>
                          {selectedMatch.team1.playerOne.avatarInitials || selectedMatch.team1.teamName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMatch.team1.teamName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMatch.team1.playerOne.displayName} / {selectedMatch.team1.playerTwo.displayName}
                        </p>
                      </div>
                      {selectedWinnerId === selectedMatch.team1Id && (
                        <Trophy className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </div>
                  )}
                  
                  {selectedMatch.team2 && (
                    <div 
                      className={`p-3 border rounded-md cursor-pointer flex items-center gap-3 
                        ${selectedWinnerId === selectedMatch.team2Id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedWinnerId(selectedMatch.team2Id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedMatch.team2.playerOne.avatarUrl} />
                        <AvatarFallback>
                          {selectedMatch.team2.playerOne.avatarInitials || selectedMatch.team2.teamName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedMatch.team2.teamName}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMatch.team2.playerOne.displayName} / {selectedMatch.team2.playerTwo.displayName}
                        </p>
                      </div>
                      {selectedWinnerId === selectedMatch.team2Id && (
                        <Trophy className="h-4 w-4 ml-auto text-primary" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="score">Match Score</Label>
                <Input 
                  id="score" 
                  placeholder="e.g. 21-15, 18-21, 21-19" 
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the score in the format: set1, set2, set3, etc.
                </p>
              </div>
              
              {isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error ? error.message : 'Failed to record score'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleScoreSubmit}
              disabled={!selectedWinnerId || !scoreValue || isPending}
            >
              {isPending ? 'Saving...' : 'Save Result'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}