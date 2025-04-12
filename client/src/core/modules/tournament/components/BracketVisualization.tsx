/**
 * PKL-278651-TOURN-0015-SYNC
 * Enhanced Bracket Visualization Component with Framework 5.0 State Synchronization
 * 
 * This component visualizes a tournament bracket structure with rounds and matches,
 * allowing users to view the bracket progress and record match results.
 * Updated with Framework 5.0 optimized refresh mechanisms and synchronization patterns.
 */

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { useTournamentChanges } from "../context/TournamentChangeContext";
import { TournamentMatch, TournamentRound } from "../types";

interface BracketVisualizationProps {
  rounds: TournamentRound[];
  matches: TournamentMatch[];
  onRecordResult: (matchId: number) => void;
  bracketId?: number;
}

// Memoized match card component to prevent unnecessary re-renders
const MatchCard = memo(({ 
  match, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  onRecordResult,
  hasConnector
}: { 
  match: TournamentMatch; 
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onRecordResult: (matchId: number) => void;
  hasConnector: boolean;
}) => {
  // Generate appropriate class for the match card based on status and hover state
  const getMatchClass = () => {
    let baseClass = "relative p-4 rounded-md border transition-all duration-200 ";
    
    if (isHovered) {
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

  // Generate badge for match status
  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="ml-2">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 ml-2">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ml-2">Completed</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">{status}</Badge>;
    }
  };

  return (
    <div 
      className={getMatchClass()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-match-id={match.id} // Make match ID available in the DOM for debugging
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
      {hasConnector && (
        <div className="absolute right-[-30px] top-1/2 transform -translate-y-1/2">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
});

MatchCard.displayName = 'MatchCard';

const REFRESH_INTERVAL = 300; // 300ms check interval

export function BracketVisualization({
  rounds,
  matches,
  onRecordResult,
  bracketId: propsBracketId,
}: BracketVisualizationProps) {
  const [hoveredMatchId, setHoveredMatchId] = useState<number | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState<number>(0);
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState<number>(Date.now());
  const tournamentChanges = useTournamentChanges();
  const lastRender = useRef<number>(Date.now());
  const changeDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get bracket ID from props or from the first round
  const bracketId = propsBracketId || rounds?.[0]?.bracketId;
  
  // Memoized function to check for changes
  const checkForChanges = useCallback(() => {
    const currentTime = Date.now();
    
    // Get all recent changes
    const recentChanges = tournamentChanges.getChangesSince(lastRender.current);
    
    // Filter for relevant changes to this bracket
    const relevantChanges = recentChanges.filter(event => {
      // If we don't have a bracket ID, all changes are relevant
      if (!bracketId) return true;
      
      // If the event doesn't have an entity ID, it's a global change
      if (event.entityId === undefined) return true;
      
      // Check if this event is for our bracket
      return event.entityId === bracketId;
    });
    
    // If we have relevant changes, force a refresh
    if (relevantChanges.length > 0) {
      console.log(
        `[PKL-278651-TOURN-0015-SYNC] Detected ${relevantChanges.length} relevant changes for bracket ${bracketId}, forcing visualization update`
      );
      
      // Log detected changes for debugging
      relevantChanges.forEach(change => {
        console.log(`[PKL-278651-TOURN-0015-SYNC] Change type: ${change.type}, entity: ${change.entityId}, time: ${new Date(change.timestamp).toISOString()}`);
      });
      
      // Increment our key to force a complete re-render of the component
      setForceUpdateKey(prev => prev + 1);
      
      // Update our timestamp to trigger dependent effects
      setLastChangeTimestamp(currentTime);
      
      // Update our last render timestamp
      lastRender.current = currentTime;
    }
  }, [tournamentChanges, bracketId]);
  
  // PKL-278651-TOURN-0015-SYNC: Enhanced change detection system
  useEffect(() => {
    console.log(`[PKL-278651-TOURN-0015-SYNC] BracketVisualization mounted for bracket ${bracketId}`);
    
    // Set the current time as our reference point
    lastRender.current = Date.now();
    
    // Start polling for changes
    changeDetectionIntervalRef.current = setInterval(checkForChanges, REFRESH_INTERVAL);
    
    // Cleanup
    return () => {
      if (changeDetectionIntervalRef.current) {
        clearInterval(changeDetectionIntervalRef.current);
        changeDetectionIntervalRef.current = null;
      }
    };
  }, [checkForChanges, bracketId]);
  
  // Force refresh when direct props change
  useEffect(() => {
    console.log(`[PKL-278651-TOURN-0015-SYNC] BracketVisualization data updated, forcing refresh`);
    setForceUpdateKey(prev => prev + 1);
    lastRender.current = Date.now();
  }, [rounds, matches]);
  
  // Add one-time immediate check on mount and after any changes
  useEffect(() => {
    // Small delay to ensure context is updated first
    const timeoutId = setTimeout(() => {
      checkForChanges();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [checkForChanges]);

  // Debug output 
  useEffect(() => {
    console.log(`[PKL-278651-TOURN-0015-SYNC] Rendering BracketVisualization with key ${forceUpdateKey}`);
    
    // Log the teams/matches that have been assigned
    const assignedMatches = matches.filter(m => m.team1Id || m.team2Id);
    console.log(`[PKL-278651-TOURN-0015-SYNC] Bracket has ${assignedMatches.length} matches with assigned teams`);
  }, [forceUpdateKey, matches]);
  
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

  // Manual refresh handler
  const handleManualRefresh = () => {
    console.log(`[PKL-278651-TOURN-0015-SYNC] Manual refresh triggered for bracket ${bracketId}`);
    setForceUpdateKey(prev => prev + 1);
    lastRender.current = Date.now();
    setLastChangeTimestamp(Date.now());
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          className="text-xs flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>
      
      <div 
        className="flex items-start gap-10 min-w-max" 
        style={{ minWidth: `${sortedRounds.length * 280}px` }}
        key={`bracket-view-${forceUpdateKey}`}
      >
        {matchesByRound.map(({ round, matches: roundMatches }) => (
          <div 
            key={`round-${round.id}-${forceUpdateKey}`}
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
                <MatchCard
                  key={`match-${match.id}-${forceUpdateKey}`}
                  match={match}
                  isHovered={match.id === hoveredMatchId}
                  onMouseEnter={() => setHoveredMatchId(match.id)}
                  onMouseLeave={() => setHoveredMatchId(null)}
                  onRecordResult={onRecordResult}
                  hasConnector={round.roundNumber < sortedRounds.length}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}