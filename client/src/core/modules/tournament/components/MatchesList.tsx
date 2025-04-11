/**
 * PKL-278651-TOURN-0001-BRCKT
 * Matches List Component
 * 
 * Displays a list of matches in a tournament bracket
 */

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type Match = {
  id: number;
  roundId: number;
  matchNumber: number;
  team1Id?: number | null;
  team2Id?: number | null;
  team1?: {
    id: number;
    teamName: string;
  } | null;
  team2?: {
    id: number;
    teamName: string;
  } | null;
  score?: string;
  winnerId?: number | null;
  loserId?: number | null;
  nextMatchId?: number | null;
  status: string;
  scheduledTime?: string | Date | null;
  completedTime?: string | Date | null;
  round?: {
    name: string;
    roundNumber: number;
  };
};

type MatchesListProps = {
  matches: Match[];
  onRecordResult: (matchId: number) => void;
};

export function MatchesList({ matches, onRecordResult }: MatchesListProps) {
  // Sort matches by round number, then match number
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.round?.roundNumber !== b.round?.roundNumber) {
      return (a.round?.roundNumber || 0) - (b.round?.roundNumber || 0);
    }
    return a.matchNumber - b.matchNumber;
  });
  
  const getStatusBadge = (match: Match) => {
    if (match.winnerId) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
    } else if (match.team1 && match.team2) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
    } else {
      return <Badge variant="outline">Waiting</Badge>;
    }
  };
  
  const formatTeamName = (team: { id: number; teamName: string } | null | undefined) => {
    return team ? team.teamName : 'TBD';
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Round</TableHead>
          <TableHead>Match</TableHead>
          <TableHead>Team 1</TableHead>
          <TableHead>Team 2</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedMatches.map((match) => (
          <TableRow key={match.id}>
            <TableCell>{match.round?.name || `Round ${match.round?.roundNumber}`}</TableCell>
            <TableCell>{match.matchNumber}</TableCell>
            <TableCell className={match.winnerId === match.team1?.id ? 'font-bold' : ''}>
              {formatTeamName(match.team1)}
            </TableCell>
            <TableCell className={match.winnerId === match.team2?.id ? 'font-bold' : ''}>
              {formatTeamName(match.team2)}
            </TableCell>
            <TableCell>{match.score || '-'}</TableCell>
            <TableCell>{getStatusBadge(match)}</TableCell>
            <TableCell className="text-right">
              {match.team1 && match.team2 && !match.winnerId ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRecordResult(match.id)}
                >
                  Record Result
                </Button>
              ) : match.winnerId ? (
                <span className="text-sm text-muted-foreground">Completed</span>
              ) : (
                <span className="text-sm text-muted-foreground">Waiting</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}