import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VisualScoreInput } from "./VisualScoreInput";
import { Badge } from "@/components/ui/badge";

interface GameScore {
  playerOneScore: number;
  playerTwoScore: number;
}

interface MultiGameScoreInputProps {
  games: GameScore[];
  onChange: (games: GameScore[]) => void;
  totalGames: number;
  playerOneName?: string;
  playerTwoName?: string;
  playerOneInitials?: string;
  playerTwoInitials?: string;
  pointsToWin?: number;
  onTotalGamesChange?: (totalGames: number) => void;
}

export function MultiGameScoreInput({
  games,
  onChange,
  totalGames,
  playerOneName = "Player 1",
  playerTwoName = "Player 2",
  playerOneInitials,
  playerTwoInitials,
  pointsToWin = 11,
  onTotalGamesChange,
}: MultiGameScoreInputProps) {
  const [activeTab, setActiveTab] = useState("1");

  // Validate individual game score based on pickleball rules
  const validateGameScore = (score: GameScore) => {
    const { playerOneScore, playerTwoScore } = score;
    const winnerScore = Math.max(playerOneScore, playerTwoScore);
    const loserScore = Math.min(playerOneScore, playerTwoScore);
    
    // No tied scores allowed
    if (playerOneScore === playerTwoScore) {
      return { isValid: false, message: "Scores cannot be tied - one player must win" };
    }
    
    // Winner must reach minimum points to win
    if (winnerScore < pointsToWin) {
      return { isValid: false, message: `Winner must score at least ${pointsToWin} points` };
    }
    
    // Win by 2 rule when opponent reaches pointsToWin-1 or more
    if (loserScore >= pointsToWin - 1 && winnerScore - loserScore < 2) {
      return { isValid: false, message: `Must win by 2 points when opponent reaches ${pointsToWin - 1} or more` };
    }
    
    return { isValid: true, message: "" };
  };

  // Update a specific game's score
  const updateGameScore = (index: number, newScore: GameScore) => {
    const updatedGames = [...games];
    updatedGames[index] = newScore;
    onChange(updatedGames);
  };

  // Calculate number of wins using proper validation
  const playerOneWins = games.filter(game => {
    const validation = validateGameScore(game);
    return validation.isValid && game.playerOneScore > game.playerTwoScore;
  }).length;
  
  const playerTwoWins = games.filter(game => {
    const validation = validateGameScore(game);
    return validation.isValid && game.playerTwoScore > game.playerOneScore;
  }).length;

  // Calculate games needed to win
  const gamesToWin = Math.ceil(totalGames / 2);
  const playerOneHasWon = playerOneWins >= gamesToWin;
  const playerTwoHasWon = playerTwoWins >= gamesToWin;
  const matchIsComplete = playerOneHasWon || playerTwoHasWon;

  // Change total games (best of 3, 5, or 7)
  const setNewTotalGames = (newTotal: number) => {
    // Ensure we have enough game objects
    const newGames = [...games];
    while (newGames.length < newTotal) {
      newGames.push({ playerOneScore: 0, playerTwoScore: 0 });
    }
    
    onChange(newGames);
    if (onTotalGamesChange) {
      onTotalGamesChange(newTotal);
    }
  };

  return (
    <div className="space-y-4">
      {/* Game format selection */}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">Format</div>
        <div className="flex gap-2">
          <Button 
            variant={totalGames === 1 ? "default" : "outline"} 
            size="sm"
            onClick={() => setNewTotalGames(1)}
          >
            Single Game
          </Button>
          <Button 
            variant={totalGames === 3 ? "default" : "outline"} 
            size="sm"
            onClick={() => setNewTotalGames(3)}
          >
            Best of 3
          </Button>
          <Button 
            variant={totalGames === 5 ? "default" : "outline"} 
            size="sm"
            onClick={() => setNewTotalGames(5)}
          >
            Best of 5
          </Button>
          <Button 
            variant={totalGames === 7 ? "default" : "outline"} 
            size="sm"
            onClick={() => setNewTotalGames(7)}
          >
            Best of 7
          </Button>
        </div>
      </div>

      {/* Match status summary */}
      {totalGames > 1 && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
          <div className="flex items-center gap-3">
            <Badge variant={playerOneHasWon ? "default" : "outline"}>
              {playerOneName}: {playerOneWins}
            </Badge>
            <Badge variant={playerTwoHasWon ? "default" : "outline"}>
              {playerTwoName}: {playerTwoWins}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            First to {gamesToWin} games wins
          </div>
        </div>
      )}

      {/* Single game view */}
      {totalGames === 1 ? (
        <VisualScoreInput
          value={games[0]}
          onChange={(newScore) => updateGameScore(0, newScore)}
          playerOneName={playerOneName}
          playerTwoName={playerTwoName}
          playerOneInitials={playerOneInitials}
          playerTwoInitials={playerTwoInitials}
          pointsToWin={pointsToWin}
        />
      ) : (
        /* Multi-game tabbed view */
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-7 h-auto p-1">
            {Array.from({ length: totalGames }).map((_, i) => (
              <TabsTrigger
                key={i + 1}
                value={(i + 1).toString()}
                className="text-xs py-1"
                disabled={i > 0 && !games[i-1]?.playerOneScore && !games[i-1]?.playerTwoScore}
              >
                Game {i + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Array.from({ length: totalGames }).map((_, i) => (
            <TabsContent key={i + 1} value={(i + 1).toString()}>
              <VisualScoreInput
                value={games[i] || { playerOneScore: 0, playerTwoScore: 0 }}
                onChange={(newScore) => updateGameScore(i, newScore)}
                playerOneName={playerOneName}
                playerTwoName={playerTwoName}
                playerOneInitials={playerOneInitials}
                playerTwoInitials={playerTwoInitials}
                pointsToWin={pointsToWin}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Match result message */}
      {matchIsComplete && (
        <div className="bg-green-50 p-4 rounded-md text-green-700 border border-green-200">
          <div className="font-semibold text-lg">
            {playerOneHasWon ? playerOneName : playerTwoName} has won the match!
          </div>
          <div className="text-sm">
            Final score: {playerOneWins}-{playerTwoWins}
          </div>
        </div>
      )}
    </div>
  );
}