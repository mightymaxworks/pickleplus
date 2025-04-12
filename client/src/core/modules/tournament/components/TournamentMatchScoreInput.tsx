/**
 * PKL-278651-TOURN-0017-SCORE
 * Enhanced Tournament Match Score Input Component
 * 
 * Visual score input component for tournament matches with team-specific UI
 * and integrated validation following Framework 5.0 principles.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchScore {
  team1Score: number;
  team2Score: number;
  scoreFormat?: string; // e.g., "21-10, 19-21, 21-15"
}

interface TournamentMatchScoreInputProps {
  value: MatchScore;
  onChange: (value: MatchScore) => void;
  team1Name?: string;
  team2Name?: string;
  team1Initials?: string;
  team2Initials?: string;
  pointsToWin?: number;
  onWinnerSelected?: (winnerId: number) => void;
  team1Id?: number;
  team2Id?: number;
}

export function TournamentMatchScoreInput({
  value,
  onChange,
  team1Name = "Team 1",
  team2Name = "Team 2",
  team1Initials,
  team2Initials,
  pointsToWin = 21,
  onWinnerSelected,
  team1Id,
  team2Id
}: TournamentMatchScoreInputProps) {
  const [scoreWarning, setScoreWarning] = useState<string | null>(null);
  const { toast } = useToast();

  // Track previous warnings to prevent excessive toast notifications
  const [prevWarningState, setPrevWarningState] = useState<string | null>(null);
  
  // Auto-update score format when scores change
  useEffect(() => {
    const scoreFormat = `${value.team1Score}-${value.team2Score}`;
    if (value.scoreFormat !== scoreFormat) {
      onChange({
        ...value,
        scoreFormat
      });
    }
  }, [value.team1Score, value.team2Score]);
  
  // Check for score warnings
  useEffect(() => {
    const t1Score = value.team1Score;
    const t2Score = value.team2Score;
    let newWarning: string | null = null;
    
    // Check if any score is above the points to win threshold
    if (t1Score > pointsToWin && t1Score - t2Score < 2) {
      newWarning = `${team1Name}'s score exceeds ${pointsToWin} without a 2-point lead`;
    } else if (t2Score > pointsToWin && t2Score - t1Score < 2) {
      newWarning = `${team2Name}'s score exceeds ${pointsToWin} without a 2-point lead`;
    } else if (t1Score > pointsToWin + 10 || t2Score > pointsToWin + 10) {
      newWarning = `Score seems unusually high for a ${pointsToWin}-point game`;
    }
    
    // Update warning state
    setScoreWarning(newWarning);
    
    // Only show toast if the warning state has changed to prevent spam
    if (newWarning && newWarning !== prevWarningState) {
      toast({
        title: "Score Warning",
        description: newWarning,
        variant: "destructive",
      });
      // Update previous warning state
      setPrevWarningState(newWarning);
    } else if (!newWarning) {
      // Reset previous warning state when there's no warning
      setPrevWarningState(null);
    }
  }, [value.team1Score, value.team2Score, pointsToWin, team1Name, team2Name, toast, prevWarningState]);

  // Determine if a match has been won (for UI highlighting and winner selection)
  const isGameWon = (team1Score: number, team2Score: number): boolean => {
    // In pickleball, a team wins when they have at least `pointsToWin` points AND a 2-point lead
    const maxScore = Math.max(team1Score, team2Score);
    const minScore = Math.min(team1Score, team2Score);
    return maxScore >= pointsToWin && (maxScore - minScore) >= 2;
  };

  // Update winner when scores change (if one team has won)
  useEffect(() => {
    if (onWinnerSelected && team1Id && team2Id) {
      if (isGameWon(value.team1Score, value.team2Score)) {
        const winnerId = value.team1Score > value.team2Score ? team1Id : team2Id;
        onWinnerSelected(winnerId);
      }
    }
  }, [value.team1Score, value.team2Score, onWinnerSelected, team1Id, team2Id, pointsToWin, isGameWon]);

  // Handle score changes within the boundaries
  const updateScore = (team: 'team1' | 'team2', amount: number) => {
    const newValue = { ...value };
    const scoreField = team === 'team1' ? 'team1Score' : 'team2Score';
    const newScore = Math.max(0, newValue[scoreField] + amount);
    newValue[scoreField] = newScore;
    onChange(newValue);
  };

  // Determine winner (for UI only)
  const winner = isGameWon(value.team1Score, value.team2Score)
    ? value.team1Score > value.team2Score 
      ? "team1" 
      : "team2"
    : null;

  // Get team initials or first letters
  const getTeamInitials = (teamName: string, providedInitials?: string): string => {
    if (providedInitials) return providedInitials;
    
    // If team name contains "/", use first letters of first names
    if (teamName.includes('/')) {
      return teamName.split('/')
        .map(name => name.trim()[0])
        .join('');
    }
    
    // Otherwise use first letter
    return teamName.charAt(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Team One Score */}
        <Card className={`p-3 sm:p-4 flex flex-col items-center ${winner === "team1" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
              {getTeamInitials(team1Name, team1Initials)}
            </div>
            <div className="ml-2 text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {team1Name}
            </div>
            {winner === "team1" && (
              <Badge className="ml-auto flex items-center gap-1" variant="default">
                <Trophy className="h-3 w-3" />
                <span className="hidden sm:inline">Winner</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 mt-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full"
              onClick={() => updateScore('team1', -1)}
              disabled={value.team1Score <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.team1Score || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow empty string (for deleting)
                if (newValue === '') {
                  onChange({
                    ...value,
                    team1Score: 0
                  });
                  return;
                }
                // Only allow numeric input
                if (/^\d+$/.test(newValue)) {
                  const newScore = parseInt(newValue);
                  onChange({
                    ...value,
                    team1Score: newScore
                  });
                }
              }}
              className={`text-3xl sm:text-4xl font-bold w-16 h-14 sm:h-16 text-center bg-transparent border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary rounded-md ${value.team1Score > pointsToWin && !winner ? 'border-red-500' : ''}`}
            />
            
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full"
              onClick={() => updateScore('team1', 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        {/* Team Two Score */}
        <Card className={`p-3 sm:p-4 flex flex-col items-center ${winner === "team2" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
              {getTeamInitials(team2Name, team2Initials)}
            </div>
            <div className="ml-2 text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {team2Name}
            </div>
            {winner === "team2" && (
              <Badge className="ml-auto flex items-center gap-1" variant="default">
                <Trophy className="h-3 w-3" />
                <span className="hidden sm:inline">Winner</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 mt-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full"
              onClick={() => updateScore('team2', -1)}
              disabled={value.team2Score <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.team2Score || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow empty string (for deleting)
                if (newValue === '') {
                  onChange({
                    ...value,
                    team2Score: 0
                  });
                  return;
                }
                // Only allow numeric input
                if (/^\d+$/.test(newValue)) {
                  const newScore = parseInt(newValue);
                  onChange({
                    ...value,
                    team2Score: newScore
                  });
                }
              }}
              className={`text-3xl sm:text-4xl font-bold w-16 h-14 sm:h-16 text-center bg-transparent border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary rounded-md ${value.team2Score > pointsToWin && !winner ? 'border-red-500' : ''}`}
            />
            
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-full"
              onClick={() => updateScore('team2', 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="text-center text-xs sm:text-sm p-2 mt-1 bg-gray-50 rounded-md">
        {winner ? (
          <span className="text-green-600 font-medium">
            Match complete! {winner === "team1" ? team1Name : team2Name} has won.
          </span>
        ) : scoreWarning ? (
          <div className="flex items-center justify-center gap-1 text-red-500">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{scoreWarning}</span>
          </div>
        ) : (
          <span>First to {pointsToWin} points with a 2-point lead wins</span>
        )}
      </div>
    </div>
  );
}