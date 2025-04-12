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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Scoring format types
type ScoringFormat = 'traditional' | 'rally' | 'custom';
type MatchFormat = 'single' | 'best_of_3' | 'best_of_5' | 'custom';

// Individual game score
interface GameScore {
  team1Score: number;
  team2Score: number;
  winner?: 'team1' | 'team2';
}

// Complete match score with multiple games
interface MatchScore {
  team1Score: number;
  team2Score: number;
  games: GameScore[];
  scoreFormat?: string; // e.g., "21-10, 19-21, 21-15"
  scoringType?: ScoringFormat; // The scoring format to use
  matchFormat?: MatchFormat; // Single game, best of 3, best of 5, etc.
  team1GamesWon?: number; // Counter for games won by team 1
  team2GamesWon?: number; // Counter for games won by team 2
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
  
  // Initialize scoring type and games array if not set
  useEffect(() => {
    const updates: Partial<MatchScore> = {};
    
    // Set default scoring type if not present
    if (!value.scoringType) {
      updates.scoringType = 'traditional';
    }
    
    // Initialize games array if not set
    if (!value.games || !Array.isArray(value.games) || value.games.length === 0) {
      // Create default first game with current scores
      updates.games = [
        {
          team1Score: value.team1Score || 0,
          team2Score: value.team2Score || 0
        }
      ];
    }
    
    // Set default match format if not present
    if (!value.matchFormat) {
      updates.matchFormat = 'single';
    }
    
    // Initialize game win counters if not set
    if (value.team1GamesWon === undefined) {
      updates.team1GamesWon = 0;
    }
    
    if (value.team2GamesWon === undefined) {
      updates.team2GamesWon = 0;
    }
    
    // Apply updates if any changes are needed
    if (Object.keys(updates).length > 0) {
      onChange({
        ...value,
        ...updates
      });
    }
  }, []);
  
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
  
  // Handle scoring format change
  const handleScoringFormatChange = (format: ScoringFormat) => {
    // Update scoring type
    onChange({
      ...value,
      scoringType: format
    });
    
    // Update points to win and format based on scoring type
    let formattedScore: string;
    
    if (format === 'rally') {
      // Rally scoring typically uses different point sequences
      formattedScore = `${value.team1Score}-${value.team2Score} (Rally)`;
    } else if (format === 'traditional') {
      // Traditional scoring
      formattedScore = `${value.team1Score}-${value.team2Score} (Traditional)`;
    } else {
      // Custom format
      formattedScore = `${value.team1Score}-${value.team2Score}`;
    }
    
    // Update the formatted score
    onChange({
      ...value,
      scoringType: format,
      scoreFormat: formattedScore
    });
  };

  // Handle match format change
  const handleMatchFormatChange = (format: MatchFormat) => {
    // Update match format
    const updatedValue = {
      ...value,
      matchFormat: format
    };
    
    // Adjust games array based on the selected format
    if (format === 'single' && (!value.games || value.games.length !== 1)) {
      // Single game format should have exactly one game
      updatedValue.games = [
        {
          team1Score: value.team1Score || 0,
          team2Score: value.team2Score || 0
        }
      ];
    } else if (format === 'best_of_3' && (!value.games || value.games.length < 3)) {
      // Best of 3 format should have up to 3 games
      // Keep existing games and add empty ones if needed
      const existingGames = value.games || [];
      const newGames = [...existingGames];
      
      // Add empty games if needed
      while (newGames.length < 3) {
        newGames.push({
          team1Score: 0,
          team2Score: 0
        });
      }
      
      updatedValue.games = newGames;
    } else if (format === 'best_of_5' && (!value.games || value.games.length < 5)) {
      // Best of 5 format should have up to 5 games
      // Keep existing games and add empty ones if needed
      const existingGames = value.games || [];
      const newGames = [...existingGames];
      
      // Add empty games if needed
      while (newGames.length < 5) {
        newGames.push({
          team1Score: 0,
          team2Score: 0
        });
      }
      
      updatedValue.games = newGames;
    }
    
    // Update the match format and games array
    onChange(updatedValue);
  };
  
  // Update game score for a specific game
  const updateGameScore = (gameIndex: number, team: 'team1' | 'team2', amount: number) => {
    if (!value.games || gameIndex >= value.games.length) return;
    
    // Clone the games array
    const newGames = [...value.games];
    
    // Update the score for the specific game
    const currentGame = { ...newGames[gameIndex] };
    const scoreField = team === 'team1' ? 'team1Score' : 'team2Score';
    currentGame[scoreField] = Math.max(0, currentGame[scoreField] + amount);
    
    // Check if this game has a winner
    if (isGameWon(currentGame.team1Score, currentGame.team2Score)) {
      currentGame.winner = currentGame.team1Score > currentGame.team2Score ? 'team1' : 'team2';
    } else {
      // Clear winner if scores change and no longer meet winning criteria
      currentGame.winner = undefined;
    }
    
    // Update the game in the array
    newGames[gameIndex] = currentGame;
    
    // Count wins for each team
    let team1Wins = 0;
    let team2Wins = 0;
    
    newGames.forEach(game => {
      if (game.winner === 'team1') team1Wins++;
      if (game.winner === 'team2') team2Wins++;
    });
    
    // Update the match score based on all games
    onChange({
      ...value,
      games: newGames,
      team1GamesWon: team1Wins,
      team2GamesWon: team2Wins,
      // Update the overall score display for backward compatibility
      team1Score: newGames[0]?.team1Score || 0,
      team2Score: newGames[0]?.team2Score || 0
    });
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
      
      {/* Match Format Selector */}
      <div className="mb-2">
        <div className="text-sm font-medium mb-2">Match Format</div>
        <Select
          value={value.matchFormat || 'single'}
          onValueChange={(format) => handleMatchFormatChange(format as MatchFormat)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select match format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Game</SelectItem>
            <SelectItem value="best_of_3">Best of 3 Games</SelectItem>
            <SelectItem value="best_of_5">Best of 5 Games</SelectItem>
            <SelectItem value="custom">Custom Format</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 mt-1">
          {value.matchFormat === 'single' ? (
            'Single game format: First to win one game wins the match'
          ) : value.matchFormat === 'best_of_3' ? (
            'Best of 3: First to win 2 games wins the match'
          ) : value.matchFormat === 'best_of_5' ? (
            'Best of 5: First to win 3 games wins the match'
          ) : (
            'Custom match format'
          )}
        </div>
      </div>
      
      {/* Scoring Format Selector */}
      <div className="mb-2">
        <div className="text-sm font-medium mb-2">Scoring Format</div>
        <Select
          value={value.scoringType || 'traditional'}
          onValueChange={(format) => handleScoringFormatChange(format as ScoringFormat)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select scoring format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="traditional">Traditional Scoring</SelectItem>
            <SelectItem value="rally">Rally Scoring</SelectItem>
            <SelectItem value="custom">Custom Format</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 mt-1">
          {value.scoringType === 'traditional' ? (
            'Side-out scoring: Only the serving team can score points'
          ) : value.scoringType === 'rally' ? (
            'Rally scoring: Points awarded on every rally regardless of server'
          ) : (
            'Custom scoring format'
          )}
        </div>
      </div>
      
      {/* Multi-Game Interface (when match format is not single) */}
      {value.matchFormat !== 'single' && (
        <div className="space-y-4 mt-4 mb-2">
          <div className="text-sm font-medium mb-2">Game Scores</div>
          
          <div className="space-y-3">
            {/* Game scores list */}
            {value.games && value.games.map((game, index) => {
              const gameWinner = isGameWon(game.team1Score, game.team2Score)
                ? game.team1Score > game.team2Score ? 'team1' : 'team2'
                : null;
                
              return (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">Game {index + 1}</div>
                    {gameWinner && (
                      <Badge variant="outline" className={gameWinner === 'team1' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}>
                        {gameWinner === 'team1' ? team1Name : team2Name} won
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Team 1 score controls */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">{team1Name}</div>
                      <div className="flex items-center ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateGameScore(index, 'team1', -1)}
                          disabled={game.team1Score <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={game.team1Score || ''}
                          onChange={(e) => {
                            if (!value.games) return;
                            const newValue = e.target.value;
                            
                            // Allow empty string or convert to number
                            let newScore: number;
                            if (newValue === '') {
                              newScore = 0;
                            } else if (/^\d+$/.test(newValue)) {
                              newScore = parseInt(newValue);
                            } else {
                              return;
                            }
                            
                            // Clone games array and update this game
                            const newGames = [...value.games];
                            newGames[index] = {
                              ...newGames[index],
                              team1Score: newScore
                            };
                            
                            onChange({
                              ...value,
                              games: newGames
                            });
                          }}
                          className={`text-center w-10 h-8 text-sm font-medium border ${gameWinner === 'team1' ? 'border-primary bg-primary/5' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateGameScore(index, 'team1', 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Team 2 score controls */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">{team2Name}</div>
                      <div className="flex items-center ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateGameScore(index, 'team2', -1)}
                          disabled={game.team2Score <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={game.team2Score || ''}
                          onChange={(e) => {
                            if (!value.games) return;
                            const newValue = e.target.value;
                            
                            // Allow empty string or convert to number
                            let newScore: number;
                            if (newValue === '') {
                              newScore = 0;
                            } else if (/^\d+$/.test(newValue)) {
                              newScore = parseInt(newValue);
                            } else {
                              return;
                            }
                            
                            // Clone games array and update this game
                            const newGames = [...value.games];
                            newGames[index] = {
                              ...newGames[index],
                              team2Score: newScore
                            };
                            
                            onChange({
                              ...value,
                              games: newGames
                            });
                          }}
                          className={`text-center w-10 h-8 text-sm font-medium border ${gameWinner === 'team2' ? 'border-primary bg-primary/5' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => updateGameScore(index, 'team2', 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Match summary - who's winning overall */}
          <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
            <div className="text-sm font-medium">Match Summary</div>
            <div className="flex gap-4">
              <div className={`text-sm ${value.team1GamesWon && value.team1GamesWon > (value.team2GamesWon || 0) ? 'font-bold text-primary' : ''}`}>
                {team1Name}: {value.team1GamesWon || 0} games
              </div>
              <div className={`text-sm ${value.team2GamesWon && value.team2GamesWon > (value.team1GamesWon || 0) ? 'font-bold text-primary' : ''}`}>
                {team2Name}: {value.team2GamesWon || 0} games
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center text-xs sm:text-sm p-2 mt-1 bg-gray-50 rounded-md">
        {value.matchFormat !== 'single' ? (
          // Multi-game format explanation
          <span>
            {value.matchFormat === 'best_of_3' 
              ? 'First team to win 2 games wins the match' 
              : value.matchFormat === 'best_of_5' 
                ? 'First team to win 3 games wins the match'
                : 'Multiple games format'}
          </span>
        ) : (
          // Single game format
          <>
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
          </>
        )}
      </div>
    </div>
  );
}