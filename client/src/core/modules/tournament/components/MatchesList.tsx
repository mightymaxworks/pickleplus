/**
 * PKL-278651-TOURN-0003-MATCH
 * Matches List Component
 * 
 * This component displays a list of matches in a tournament bracket,
 * allowing admins to manage and record match results.
 */

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TournamentTeam {
  id: number;
  teamName: string;
}

interface TournamentMatch {
  id: number;
  roundId: number;
  roundName?: string;
  matchNumber: number;
  team1Id: number | null;
  team2Id: number | null;
  team1: TournamentTeam | null;
  team2: TournamentTeam | null;
  winnerId: number | null;
  score: string | null;
  status: string;
  matchDate: string | null;
}

interface MatchesListProps {
  matches: TournamentMatch[];
  onRecordResult: (matchId: number) => void;
}

export function MatchesList({ matches, onRecordResult }: MatchesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Filter matches based on search query and status filters
  const filteredMatches = matches.filter((match) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      match.roundName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team1?.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team2?.teamName.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilters.length === 0 || statusFilters.includes(match.status);

    return matchesSearch && matchesStatus;
  });

  // Get all available statuses from matches
  const availableStatuses = Array.from(
    new Set(matches.map((match) => match.status))
  );

  const formatMatchDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {statusFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 rounded-sm px-1">
                  {statusFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {availableStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setStatusFilters([...statusFilters, status]);
                  } else {
                    setStatusFilters(statusFilters.filter((s) => s !== status));
                  }
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableCaption>List of matches in the tournament bracket</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Round</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMatches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No matches found
              </TableCell>
            </TableRow>
          ) : (
            filteredMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">{match.roundName || `Round ${match.roundId}`}</TableCell>
                <TableCell>{match.matchNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center">
                      {match.winnerId === match.team1Id && (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      )}
                      <span className={match.winnerId === match.team1Id ? "text-green-700 font-medium" : ""}>
                        {match.team1 ? match.team1.teamName : "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {match.winnerId === match.team2Id && (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      )}
                      <span className={match.winnerId === match.team2Id ? "text-green-700 font-medium" : ""}>
                        {match.team2 ? match.team2.teamName : "TBD"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getMatchStatusBadge(match.status)}</TableCell>
                <TableCell>{match.score || "-"}</TableCell>
                <TableCell>{formatMatchDate(match.matchDate)}</TableCell>
                <TableCell className="text-right">
                  {match.status !== "completed" && match.team1Id && match.team2Id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecordResult(match.id)}
                      className="whitespace-nowrap"
                    >
                      Record Result
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}