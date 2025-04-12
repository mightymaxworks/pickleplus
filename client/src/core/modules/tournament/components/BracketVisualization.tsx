/**
 * PKL-278651-TOURN-0014-SEED
 * Enhanced Bracket Visualization Component
 * 
 * This component visualizes a tournament bracket structure with rounds and matches,
 * allowing users to view the bracket progress and record match results.
 * Updated with Framework 5.0 enhanced refresh mechanisms for team seeding.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, ArrowRight } from "lucide-react";
import { useTournamentChanges } from "../context/TournamentChangeContext";

interface TournamentRound {
  id: number;
  bracketId: number;
  roundNumber: number;
  name: string;
}

interface TournamentTeam {
  id: number;
  teamName: string;
}

interface TournamentMatch {
  id: number;
  roundId: number;
  matchNumber: number;
  team1Id: number | null;
  team2Id: number | null;
  team1: TournamentTeam | null;
  team2: TournamentTeam | null;
  winnerId: number | null;
  score: string | null;
  status: string;
}

interface BracketVisualizationProps {
  rounds: TournamentRound[];
  matches: TournamentMatch[];
  onRecordResult: (matchId: number) => void;
}

export function BracketVisualization({
  rounds,
  matches,
  onRecordResult,
}: BracketVisualizationProps) {
  const [hoveredMatchId, setHoveredMatchId] = useState<number | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState<number>(0);
  const tournamentChanges = useTournamentChanges();
  const lastRender = useRef<number>(Date.now());
  const bracketId = rounds?.[0]?.bracketId; // Get bracket ID from the first round
  
  // PKL-278651-TOURN-0014-SEED: Listen for tournament changes and refresh when teams are seeded
  useEffect(() => {
    console.log(`[PKL-278651-TOURN-0014-SEED] BracketVisualization mounted for bracket ${bracketId}`);
    
    // Set the current time as our reference point
    lastRender.current = Date.now();
    
    // Check for tournament changes periodically
    const checkInterval = setInterval(() => {
      // Check for any changes related to this bracket - both teams_seeded and match_result_recorded
      const hasTeamsSeededChange = tournamentChanges.isChangedSince(
        lastRender.current,
        'teams_seeded',
        bracketId
      );
      
      const hasMatchResultChange = tournamentChanges.isChangedSince(
        lastRender.current,
        'match_result_recorded',
        bracketId
      );
      
      // If any relevant change is detected, force a re-render
      if (hasTeamsSeededChange || hasMatchResultChange) {
        console.log(
          `[PKL-278651-TOURN-0014-SEED] Detected bracket change for bracket ${bracketId}, forcing visualization update`
        );
        // Increment our key to force a complete re-render of the component
        setForceUpdateKey(prev => prev + 1);
        // Update our last render timestamp
        lastRender.current = Date.now();
      }
    }, 300); // Check more frequently (300ms) for better responsiveness
    
    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, [tournamentChanges, bracketId]);
  
  // Also re-render when rounds or matches change
  useEffect(() => {
    console.log(`[PKL-278651-TOURN-0014-SEED] BracketVisualization data updated, forcing refresh`);
    setForceUpdateKey(prev => prev + 1);
  }, [rounds, matches]);

  console.log(`[PKL-278651-TOURN-0014-SEED] Rendering BracketVisualization with key ${forceUpdateKey}`);
  
  // Sort rounds by number
  const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);

  // Group matches by round
  const matchesByRound = sortedRounds.map(round => {
    const roundMatches = matches
      .filter(match => match.roundId === round.id)
      .sort((a, b) => a.matchNumber - b.matchNumber);
    
    return {
      round,
      matches: roundMatches,
    };
  });

  // Maximum number of matches in any round
  const maxMatches = Math.max(
    ...matchesByRound.map(round => round.matches.length),
    1
  );

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="ml-2">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 ml-2">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-2">Completed</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">{status}</Badge>;
    }
  };

  const getMatchClass = (match: TournamentMatch) => {
    let baseClass = "relative p-4 rounded-md border transition-all duration-200 ";
    
    if (match.id === hoveredMatchId) {
      baseClass += "border-primary shadow-md ";
    } else {
      baseClass += "border-border hover:border-primary/50 ";
    }

    if (match.status === "completed") {
      baseClass += "bg-green-50/30 ";
    } else if (match.team1Id && match.team2Id) {
      baseClass += "bg-card ";
    } else {
      baseClass += "bg-muted/40 ";
    }

    return baseClass;
  };

  // No rounds to display
  if (sortedRounds.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold">No bracket structure yet</h3>
        <p className="text-muted-foreground mt-2">
          This tournament bracket hasn't been structured yet
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div 
        className="flex items-start gap-10 min-w-max" 
        style={{ minWidth: `${sortedRounds.length * 280}px` }}
      >
        {matchesByRound.map(({ round, matches: roundMatches }) => (
          <div 
            key={round.id} 
            className="flex-1 flex flex-col items-center"
            style={{ minWidth: "250px" }}
          >
            <div className="mb-4 text-center">
              <h3 className="font-semibold text-lg">{round.name}</h3>
              <p className="text-sm text-muted-foreground">
                {roundMatches.length} {roundMatches.length === 1 ? "match" : "matches"}
              </p>
            </div>
            
            <div 
              className="w-full flex flex-col gap-8"
              style={{ 
                minHeight: `${maxMatches * 140}px`,
                justifyContent: roundMatches.length === 1 ? "center" : "space-between" 
              }}
            >
              {roundMatches.map((match) => (
                <div 
                  key={match.id}
                  className={getMatchClass(match)}
                  onMouseEnter={() => setHoveredMatchId(match.id)}
                  onMouseLeave={() => setHoveredMatchId(null)}
                >
                  {/* Match header with status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Match {match.matchNumber}
                    </span>
                    {getMatchStatusBadge(match.status)}
                  </div>
                  
                  {/* Team 1 */}
                  <div className={`mb-2 flex items-center ${match.winnerId === match.team1Id ? "font-semibold" : ""}`}>
                    {match.winnerId === match.team1Id && (
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    )}
                    <span className={match.winnerId === match.team1Id ? "text-green-700" : ""}>
                      {match.team1 ? match.team1.teamName : "TBD"}
                    </span>
                  </div>
                  
                  {/* Team 2 */}
                  <div className={`mb-3 flex items-center ${match.winnerId === match.team2Id ? "font-semibold" : ""}`}>
                    {match.winnerId === match.team2Id && (
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    )}
                    <span className={match.winnerId === match.team2Id ? "text-green-700" : ""}>
                      {match.team2 ? match.team2.teamName : "TBD"}
                    </span>
                  </div>
                  
                  {/* Score */}
                  {match.score && (
                    <div className="text-sm text-muted-foreground mb-3">
                      Score: {match.score}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-end mt-2">
                    {match.status !== "completed" && match.team1Id && match.team2Id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRecordResult(match.id)}
                        className="text-xs"
                      >
                        Record Result
                      </Button>
                    )}
                    
                    {match.status === "completed" && (
                      <Badge variant="outline" className="bg-green-50">
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  {/* Connector lines for the bracket visualization */}
                  {round.roundNumber < sortedRounds.length && (
                    <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}