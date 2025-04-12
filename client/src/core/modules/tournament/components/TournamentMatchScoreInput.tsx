/**
 * PKL-278651-TOURN-0017-UI
 * Enhanced Tournament Match Score Input Component with Multi-Game Support
 * 
 * UI-optimized component for tournament match score recording, supporting:
 * - Single game, best of 3, best of 5, and custom match formats
 * - Traditional and rally scoring formats
 * - Game-by-game score tracking with winner detection
 * - Responsive design optimized for both desktop and mobile
 * - Visual indicators for completed games and match winners
 * 
 * Follows Framework 5.0 principles with explicit state management 
 * and consistent visual language.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Scoring format types - exported for use in other components
export type ScoringFormat = 'traditional' | 'rally' | 'custom';
export type MatchFormat = 'single' | 'best_of_3' | 'best_of_5' | 'custom';

// Individual game score
export interface GameScore {
  team1Score: number;
  team2Score: number;
  winner?: 'team1' | 'team2';
}

// Complete match score with multiple games
export interface MatchScore {
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

  // Determine winner for single game (for UI only)
  const winner = isGameWon(value.team1Score, value.team2Score)
    ? value.team1Score > value.team2Score 
      ? "team1" 
      : "team2"
    : null;
    
  // Determine match winner for multi-game formats
  const getMatchWinner = (): 'team1' | 'team2' | null => {
    if (!value.matchFormat || value.matchFormat === 'single') {
      return winner;
    }
    
    // For multi-game formats, check if a team has won enough games
    const winThreshold = value.matchFormat === 'best_of_3' ? 2 : 
                        value.matchFormat === 'best_of_5' ? 3 : 
                        null;
                        
    if (!winThreshold || value.team1GamesWon === undefined || value.team2GamesWon === undefined) {
      return null;
    }
    
    if (value.team1GamesWon >= winThreshold) {
      return 'team1';
    } else if (value.team2GamesWon >= winThreshold) {
      return 'team2';
    }
    
    return null;
  };

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
    
    // Check if the match has been won based on the new games state
    const matchWinner = getMatchWinner();
    if (matchWinner && onWinnerSelected && team1Id && team2Id) {
      const winnerId = matchWinner === 'team1' ? team1Id : team2Id;
      onWinnerSelected(winnerId);
    }
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
      
      {/* Enhanced Mobile-Friendly Match Format Controls */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        {/* Match Progress Summary */}
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className="font-normal py-1">
            Match Progress
          </Badge>
          
          <Badge 
            variant={value.team1GamesWon === 0 && value.team2GamesWon === 0 ? "outline" : "secondary"}
            className="font-normal py-1"
          >
            {value.team1GamesWon === 0 && value.team2GamesWon === 0 
              ? "In progress" 
              : `${value.team1GamesWon ?? 0} - ${value.team2GamesWon ?? 0}`}
          </Badge>
        </div>
        
        {/* Visual Team Progress */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className={`text-center p-2 rounded ${getMatchWinner() === 'team1' ? 'bg-primary/20 shadow-sm' : 'bg-gray-100'}`}>
            <div className="text-xs font-medium mb-1 truncate">{team1Name}</div>
            <div className={`text-xl font-bold ${getMatchWinner() === 'team1' ? 'text-primary' : ''}`}>
              {value.team1GamesWon || 0}
              {getMatchWinner() === 'team1' && <Trophy className="h-4 w-4 inline ml-1 text-primary" />}
            </div>
            <div className="text-xs mt-1">games won</div>
          </div>
          
          <div className={`text-center p-2 rounded ${getMatchWinner() === 'team2' ? 'bg-primary/20 shadow-sm' : 'bg-gray-100'}`}>
            <div className="text-xs font-medium mb-1 truncate">{team2Name}</div>
            <div className={`text-xl font-bold ${getMatchWinner() === 'team2' ? 'text-primary' : ''}`}>
              {value.team2GamesWon || 0}
              {getMatchWinner() === 'team2' && <Trophy className="h-4 w-4 inline ml-1 text-primary" />}
            </div>
            <div className="text-xs mt-1">games won</div>
          </div>
        </div>
        
        {/* Format Selectors - 2 Column Layout on Desktop, 1 Column on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Match Format Selector */}
          <div>
            <div className="text-sm font-medium mb-1">Match Format</div>
            <Select
              value={value.matchFormat || 'single'}
              onValueChange={(format) => handleMatchFormatChange(format as MatchFormat)}
            >
              <SelectTrigger className="w-full touch-manipulation">
                <SelectValue placeholder="Select match format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Game</SelectItem>
                <SelectItem value="best_of_3">Best of 3 Games</SelectItem>
                <SelectItem value="best_of_5">Best of 5 Games</SelectItem>
                <SelectItem value="custom">Custom Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Scoring Format Selector */}
          <div>
            <div className="text-sm font-medium mb-1">Scoring Type</div>
            <Select
              value={value.scoringType || 'traditional'}
              onValueChange={(format) => handleScoringFormatChange(format as ScoringFormat)}
            >
              <SelectTrigger className="w-full touch-manipulation">
                <SelectValue placeholder="Select scoring type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traditional">Traditional</SelectItem>
                <SelectItem value="rally">Rally</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Format Description */}
        <div className="text-xs text-gray-600 mt-3 text-center">
          {value.scoringType === 'traditional' && (
            <div>Side-out scoring: Only the serving team can score points</div>
          )}
          {value.scoringType === 'rally' && (
            <div>Rally scoring: Points awarded on every rally regardless of server</div>
          )}
          {value.matchFormat === 'single' && (
            <div className="mt-1">Single game: First to win one game wins the match</div>
          )}
          {value.matchFormat === 'best_of_3' && (
            <div className="mt-1">Best of 3: First to win 2 games wins the match</div>
          )}
          {value.matchFormat === 'best_of_5' && (
            <div className="mt-1">Best of 5: First to win 3 games wins the match</div>
          )}
        </div>
      </div>
      
      {/* Multi-Game Interface (when match format is not single) */}
      {value.matchFormat !== 'single' && (
        <div className="space-y-4 mt-4 mb-2">
          {/* Match Progress Summary */}
          <div className={`p-4 rounded-md ${getMatchWinner() ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Match Progress</div>
                <Badge variant={getMatchWinner() ? "default" : "outline"} className="ml-2">
                  {value.matchFormat === 'best_of_3' ? 'Best of 3' : value.matchFormat === 'best_of_5' ? 'Best of 5' : 'Custom'}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs font-medium text-gray-700">
                {value.matchFormat === 'best_of_3' 
                  ? 'First to win 2 games wins' 
                  : value.matchFormat === 'best_of_5' 
                    ? 'First to win 3 games wins' 
                    : 'Custom format'}
              </div>
            </div>
            
            {/* Score Indicator */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {/* Games Won Indicators */}
              <div className="flex items-center gap-2 flex-grow">
                <div className={`px-4 py-1.5 rounded-md flex-grow text-center ${value.team1GamesWon && value.team1GamesWon > (value.team2GamesWon || 0) ? 'bg-primary text-white font-bold shadow-sm' : 'bg-gray-100'}`}>
                  <div className="text-xs uppercase tracking-wide mb-1 opacity-80">Team 1</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold">{team1Name}</span>
                    <span className="font-bold text-lg">{value.team1GamesWon || 0}</span>
                  </div>
                </div>
                
                <div className="text-gray-400 text-xl font-light">vs</div>
                
                <div className={`px-4 py-1.5 rounded-md flex-grow text-center ${value.team2GamesWon && value.team2GamesWon > (value.team1GamesWon || 0) ? 'bg-primary text-white font-bold shadow-sm' : 'bg-gray-100'}`}>
                  <div className="text-xs uppercase tracking-wide mb-1 opacity-80">Team 2</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold">{team2Name}</span>
                    <span className="font-bold text-lg">{value.team2GamesWon || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Match Status */}
              {value.team1GamesWon !== undefined && value.team2GamesWon !== undefined && (
                <Badge variant={getMatchWinner() ? "default" : "outline"} className={`${getMatchWinner() ? 'text-base px-3 py-1.5' : ''} flex items-center gap-1.5`}>
                  {getMatchWinner() 
                    ? (
                      <>
                        <Trophy className="h-4 w-4" />
                        <span>{getMatchWinner() === 'team1' ? team1Name : team2Name} wins match!</span>
                      </>
                    ) 
                    : `In progress`}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Game Scores Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium flex items-center justify-between">
              <span>Game Scores</span>
              <Badge variant="outline" className="font-normal">
                {value.matchFormat === 'best_of_3' 
                  ? 'Best of 3' 
                  : value.matchFormat === 'best_of_5' 
                    ? 'Best of 5'
                    : 'Single Game'}
              </Badge>
            </div>
            
            {/* Game scores list - Enhanced Mobile Layout */}
            <div className="space-y-3">
              {value.games && value.games.map((game, index) => {
                const gameWinner = isGameWon(game.team1Score, game.team2Score)
                  ? game.team1Score > game.team2Score ? 'team1' : 'team2'
                  : null;
                  
                return (
                  <div key={index} 
                    className={`border rounded-md p-3 transition-all ${
                      gameWinner 
                        ? (gameWinner === 'team1' 
                           ? 'border-l-4 border-l-primary bg-primary/5' 
                           : 'border-r-4 border-r-primary bg-primary/5') 
                        : 'border-gray-200'
                      } ${
                      getMatchWinner() && game.winner 
                        ? 'shadow-sm' 
                        : ''
                    }`}>
                    
                    {/* Game Header with Winner Badge */}
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <div className="flex items-center flex-wrap gap-1">
                        <div className="font-medium text-sm bg-gray-100 px-2 py-0.5 rounded-md">
                          Game {index + 1}
                        </div>
                        {gameWinner && (
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            <span className="text-xs">{gameWinner === 'team1' ? team1Name : team2Name} won</span>
                          </Badge>
                        )}
                      </div>
                      
                      {/* Score Display for Quick View */}
                      <div className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">
                        {game.team1Score} - {game.team2Score}
                      </div>
                    </div>
                    
                    {/* Score Controls - Two Column Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Team 1 score controls */}
                      <div className={`flex items-center space-x-1 rounded-md p-2 ${
                        gameWinner === 'team1' ? 'bg-primary/10' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm font-medium truncate max-w-[100px] ${
                          gameWinner === 'team1' ? 'text-primary font-semibold' : ''
                        }`}>
                          {team1Name}
                        </div>
                        <div className="flex items-center ml-auto touch-manipulation">
                          <Button
                            variant={gameWinner === 'team1' ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full"
                            onClick={() => updateGameScore(index, 'team1', -1)}
                            disabled={game.team1Score <= 0}
                          >
                            <Minus className="h-4 w-4" />
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
                              
                              // Check if game has a winner after score change
                              updateGameScore(index, 'team1', 0);
                            }}
                            className={`text-center w-12 h-10 text-sm font-medium border ${gameWinner === 'team1' ? 'border-primary bg-white' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                          />
                          
                          <Button
                            variant={gameWinner === 'team1' ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full"
                            onClick={() => updateGameScore(index, 'team1', 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Team 2 score controls */}
                      <div className={`flex items-center space-x-1 rounded-md p-2 ${
                        gameWinner === 'team2' ? 'bg-primary/10' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm font-medium truncate max-w-[100px] ${
                          gameWinner === 'team2' ? 'text-primary font-semibold' : ''
                        }`}>
                          {team2Name}
                        </div>
                        <div className="flex items-center ml-auto touch-manipulation">
                          <Button
                            variant={gameWinner === 'team2' ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full"
                            onClick={() => updateGameScore(index, 'team2', -1)}
                            disabled={game.team2Score <= 0}
                          >
                            <Minus className="h-4 w-4" />
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
                              
                              // Check if game has a winner after score change
                              updateGameScore(index, 'team2', 0);
                            }}
                            className={`text-center w-12 h-10 text-sm font-medium border ${gameWinner === 'team2' ? 'border-primary bg-white' : 'border-gray-200'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                          />
                          
                          <Button
                            variant={gameWinner === 'team2' ? "default" : "outline"}
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full"
                            onClick={() => updateGameScore(index, 'team2', 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <div className={`p-3 mt-3 rounded-md ${
        (value.matchFormat === 'single' && winner) || getMatchWinner() 
          ? 'bg-primary/10 border border-primary/20' 
          : scoreWarning 
            ? 'bg-red-50 border border-red-100' 
            : 'bg-gray-50'
      }`}>
        <div className="flex flex-col items-center justify-center">
          {/* Match Format Icon */}
          <div className="mb-1.5">
            {value.matchFormat === 'single' ? (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
            ) : value.matchFormat === 'best_of_3' ? (
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
              </div>
            ) : value.matchFormat === 'best_of_5' ? (
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">5</span>
                </div>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">C</span>
              </div>
            )}
          </div>
          
          {value.matchFormat !== 'single' ? (
            // Multi-game format explanation
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium mb-1">
                {value.matchFormat === 'best_of_3' 
                  ? 'Best of 3 Games Format' 
                  : value.matchFormat === 'best_of_5' 
                    ? 'Best of 5 Games Format'
                    : 'Custom Multiple Games Format'}
              </div>
              <div className="text-xs text-gray-600">
                {getMatchWinner() ? (
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{getMatchWinner() === 'team1' ? team1Name : team2Name} has won the match!</span>
                  </div>
                ) : (
                  <span>
                    {value.matchFormat === 'best_of_3' 
                      ? 'First team to win 2 games wins the match' 
                      : value.matchFormat === 'best_of_5' 
                        ? 'First team to win 3 games wins the match'
                        : 'Multiple games format'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            // Single game format
            <>
              {winner ? (
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-primary mb-1 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4" />
                    <span>Match Complete!</span>
                  </div>
                  <div className="text-xs font-medium">
                    {winner === "team1" ? team1Name : team2Name} has won with a score of {value.team1Score}-{value.team2Score}
                  </div>
                </div>
              ) : scoreWarning ? (
                <div className="flex items-center justify-center gap-1.5 text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{scoreWarning}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium mb-1">Single Game Format</div>
                  <div className="text-xs text-gray-600">
                    First to {pointsToWin} points with a 2-point lead wins
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}