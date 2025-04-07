import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PlayerScore {
  playerOneScore: number;
  playerTwoScore: number;
}

interface VisualScoreInputProps {
  value: PlayerScore;
  onChange: (value: PlayerScore) => void;
  playerOneName?: string;
  playerTwoName?: string;
  playerOneInitials?: string;
  playerTwoInitials?: string;
  pointsToWin?: number;
  className?: string;
}

export function VisualScoreInput({
  value,
  onChange,
  playerOneName = "Player 1",
  playerTwoName = "Player 2",
  playerOneInitials,
  playerTwoInitials,
  pointsToWin = 11,
  className,
}: VisualScoreInputProps) {
  const [playerOneScore, setPlayerOneScore] = useState(value.playerOneScore);
  const [playerTwoScore, setPlayerTwoScore] = useState(value.playerTwoScore);

  // Handle score updates with validation (non-negative)
  const updatePlayerOneScore = (newScore: number) => {
    if (newScore >= 0) {
      setPlayerOneScore(newScore);
      onChange({ playerOneScore: newScore, playerTwoScore });
    }
  };

  const updatePlayerTwoScore = (newScore: number) => {
    if (newScore >= 0) {
      setPlayerTwoScore(newScore);
      onChange({ playerOneScore, playerTwoScore: newScore });
    }
  };

  // Handle manual score input
  const handlePlayerOneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value);
    if (!isNaN(newScore) && newScore >= 0) {
      updatePlayerOneScore(newScore);
    } else if (e.target.value === "") {
      setPlayerOneScore(0);
      onChange({ playerOneScore: 0, playerTwoScore });
    }
  };

  const handlePlayerTwoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value);
    if (!isNaN(newScore) && newScore >= 0) {
      updatePlayerTwoScore(newScore);
    } else if (e.target.value === "") {
      setPlayerTwoScore(0);
      onChange({ playerOneScore, playerTwoScore: 0 });
    }
  };

  // Determine if a player has won
  const playerOneWon = playerOneScore >= pointsToWin && playerOneScore >= playerTwoScore + 2;
  const playerTwoWon = playerTwoScore >= pointsToWin && playerTwoScore >= playerOneScore + 2;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Player One Score Card */}
      <Card className={cn(
        "overflow-hidden",
        playerOneWon && "ring-2 ring-green-500 shadow-lg"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {playerOneInitials || playerOneName.charAt(0)}
              </div>
              <div className="font-medium">{playerOneName}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => updatePlayerOneScore(playerOneScore - 1)}
                disabled={playerOneScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min="0"
                value={playerOneScore}
                onChange={handlePlayerOneInput}
                className="w-16 text-center"
              />
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => updatePlayerOneScore(playerOneScore + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Two Score Card */}
      <Card className={cn(
        "overflow-hidden",
        playerTwoWon && "ring-2 ring-green-500 shadow-lg"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {playerTwoInitials || playerTwoName.charAt(0)}
              </div>
              <div className="font-medium">{playerTwoName}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => updatePlayerTwoScore(playerTwoScore - 1)}
                disabled={playerTwoScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min="0"
                value={playerTwoScore}
                onChange={handlePlayerTwoInput}
                className="w-16 text-center"
              />
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => updatePlayerTwoScore(playerTwoScore + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Status Message */}
      {(playerOneWon || playerTwoWon) && (
        <div className="bg-green-50 p-3 rounded-md text-sm text-green-700 border border-green-200">
          <strong>{playerOneWon ? playerOneName : playerTwoName}</strong> has won this game!
        </div>
      )}
      
      {/* Win by 2 Message */}
      {!playerOneWon && !playerTwoWon && (
        (playerOneScore >= pointsToWin || playerTwoScore >= pointsToWin) && 
        Math.abs(playerOneScore - playerTwoScore) < 2
      ) && (
        <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700 border border-yellow-200">
          Remember: Players must win by at least 2 points
        </div>
      )}
    </div>
  );
}