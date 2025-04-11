/**
 * PKL-278651-TOURN-0001-BRCKT
 * Bracket Visualization Component
 * 
 * Renders a visual representation of a tournament bracket
 */

import { useState, useEffect } from 'react';
import { Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Match = {
  id: number;
  roundId: number;
  matchNumber: number;
  team1Id?: number | null;
  team2Id?: number | null;
  team1?: {
    id: number;
    teamName: string;
    playerOne: {
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
    playerTwo: {
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
  } | null;
  team2?: {
    id: number;
    teamName: string;
    playerOne: {
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
    playerTwo: {
      displayName: string;
      avatarUrl?: string;
      avatarInitials?: string;
    };
  } | null;
  score?: string;
  winnerId?: number | null;
  loserId?: number | null;
  nextMatchId?: number | null;
  status: string;
};

type Round = {
  id: number;
  bracketId: number;
  roundNumber: number;
  name: string;
};

type BracketVisualizationProps = {
  rounds: Round[];
  matches: Match[];
  onRecordResult: (matchId: number) => void;
};

export function BracketVisualization({ rounds, matches, onRecordResult }: BracketVisualizationProps) {
  const [organizedMatches, setOrganizedMatches] = useState<{ [key: string]: Match[] }>({});
  
  // Organize matches by round
  useEffect(() => {
    const matchesByRound: { [key: string]: Match[] } = {};
    
    if (rounds && matches) {
      rounds.forEach(round => {
        matchesByRound[round.roundNumber] = matches.filter(match => match.roundId === round.id)
          .sort((a, b) => a.matchNumber - b.matchNumber);
      });
    }
    
    setOrganizedMatches(matchesByRound);
  }, [rounds, matches]);
  
  // If no data yet, show placeholder
  if (!rounds || !rounds.length || !matches || !matches.length) {
    return (
      <div className="flex items-center justify-center h-[400px] text-center">
        <div>
          <Trophy className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-xl font-semibold">No bracket data available</h3>
          <p className="text-muted-foreground mt-2">
            The bracket hasn't been generated yet or contains no matches
          </p>
        </div>
      </div>
    );
  }
  
  // Sort rounds by round number
  const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
  
  return (
    <div className="relative overflow-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {sortedRounds.map((round) => (
          <div key={round.id} className="flex flex-col w-[280px]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{round.name}</h3>
              <p className="text-sm text-muted-foreground">Round {round.roundNumber}</p>
            </div>
            
            <div className="space-y-8">
              {organizedMatches[round.roundNumber]?.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onRecordResult={() => onRecordResult(match.id)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, onRecordResult }: { match: Match; onRecordResult: () => void }) {
  // Match has teams assigned
  const hasTeams = match.team1 || match.team2;
  
  // Match has a result
  const hasResult = match.winnerId !== undefined && match.winnerId !== null;
  
  // Get match status badge
  const getStatusBadge = () => {
    if (hasResult) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
    } else if (hasTeams) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
    } else {
      return <Badge variant="outline">Waiting</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Match number and status */}
        <div className="bg-muted px-4 py-2 flex justify-between items-center">
          <span className="text-sm font-medium">Match #{match.matchNumber}</span>
          {getStatusBadge()}
        </div>
        
        {/* Team slots */}
        <div className="p-4 space-y-2">
          {/* Team 1 */}
          <div className={`p-3 rounded-md ${match.winnerId === match.team1?.id ? 'bg-green-50 border border-green-200' : 'bg-muted/50'}`}>
            {match.team1 ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{match.team1.teamName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={match.team1.playerOne.avatarUrl} />
                      <AvatarFallback>{match.team1.playerOne.avatarInitials || match.team1.playerOne.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-5 w-5 -ml-2">
                      <AvatarImage src={match.team1.playerTwo.avatarUrl} />
                      <AvatarFallback>{match.team1.playerTwo.avatarInitials || match.team1.playerTwo.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {match.team1.playerOne.displayName.split(' ')[0]} / {match.team1.playerTwo.displayName.split(' ')[0]}
                    </span>
                  </div>
                </div>
                {hasResult && (
                  <span className="font-bold">{match.score?.split('-')[0]}</span>
                )}
              </div>
            ) : (
              <div className="h-12 flex items-center justify-center text-muted-foreground">
                <span>TBD</span>
              </div>
            )}
          </div>
          
          {/* Team 2 */}
          <div className={`p-3 rounded-md ${match.winnerId === match.team2?.id ? 'bg-green-50 border border-green-200' : 'bg-muted/50'}`}>
            {match.team2 ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{match.team2.teamName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={match.team2.playerOne.avatarUrl} />
                      <AvatarFallback>{match.team2.playerOne.avatarInitials || match.team2.playerOne.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-5 w-5 -ml-2">
                      <AvatarImage src={match.team2.playerTwo.avatarUrl} />
                      <AvatarFallback>{match.team2.playerTwo.avatarInitials || match.team2.playerTwo.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {match.team2.playerOne.displayName.split(' ')[0]} / {match.team2.playerTwo.displayName.split(' ')[0]}
                    </span>
                  </div>
                </div>
                {hasResult && (
                  <span className="font-bold">{match.score?.split('-')[1]}</span>
                )}
              </div>
            ) : (
              <div className="h-12 flex items-center justify-center text-muted-foreground">
                <span>TBD</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-4 py-3 bg-muted/50 border-t">
          {hasTeams && !hasResult ? (
            <Button 
              onClick={onRecordResult} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Record Result
            </Button>
          ) : hasResult ? (
            <div className="text-center text-sm text-muted-foreground">
              {match.team1 && match.team2 && (
                <span>
                  {match.winnerId === match.team1.id ? match.team1.teamName : match.team2.teamName} won
                </span>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Waiting for previous matches
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}