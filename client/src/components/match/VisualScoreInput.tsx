import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

interface Score {
  playerOneScore: number;
  playerTwoScore: number;
}

interface VisualScoreInputProps {
  value: Score;
  onChange: (value: Score) => void;
  playerOneName?: string;
  playerTwoName?: string;
  playerOneInitials?: string;
  playerTwoInitials?: string;
  pointsToWin?: number;
}

export function VisualScoreInput({
  value,
  onChange,
  playerOneName = "Player 1",
  playerTwoName = "Player 2",
  playerOneInitials,
  playerTwoInitials,
  pointsToWin = 11
}: VisualScoreInputProps) {
  // Handle score changes within the boundaries
  const updateScore = (player: 'playerOne' | 'playerTwo', amount: number) => {
    const newValue = { ...value };
    const scoreField = player === 'playerOne' ? 'playerOneScore' : 'playerTwoScore';
    const newScore = Math.max(0, newValue[scoreField] + amount);
    newValue[scoreField] = newScore;
    onChange(newValue);
  };

  // Determine if a player has won
  const isGameWon = (playerOneScore: number, playerTwoScore: number): boolean => {
    // In pickleball, a player wins when they have at least `pointsToWin` points AND a 2-point lead
    const maxScore = Math.max(playerOneScore, playerTwoScore);
    const minScore = Math.min(playerOneScore, playerTwoScore);
    return maxScore >= pointsToWin && (maxScore - minScore) >= 2;
  };

  // Determine winner
  const winner = isGameWon(value.playerOneScore, value.playerTwoScore)
    ? value.playerOneScore > value.playerTwoScore 
      ? "playerOne" 
      : "playerTwo"
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Player One Score */}
        <Card className={`p-4 flex flex-col items-center ${winner === "playerOne" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {playerOneInitials || playerOneName.charAt(0)}
            </div>
            <div className="ml-2 text-sm font-medium">{playerOneName}</div>
            {winner === "playerOne" && (
              <Badge className="ml-2" variant="default">
                Winner
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateScore('playerOne', -1)}
              disabled={value.playerOneScore <= 0 || winner !== null}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-4xl font-bold w-12 text-center">
              {value.playerOneScore}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateScore('playerOne', 1)}
              disabled={winner !== null}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        {/* Player Two Score */}
        <Card className={`p-4 flex flex-col items-center ${winner === "playerTwo" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {playerTwoInitials || playerTwoName.charAt(0)}
            </div>
            <div className="ml-2 text-sm font-medium">{playerTwoName}</div>
            {winner === "playerTwo" && (
              <Badge className="ml-2" variant="default">
                Winner
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateScore('playerTwo', -1)}
              disabled={value.playerTwoScore <= 0 || winner !== null}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-4xl font-bold w-12 text-center">
              {value.playerTwoScore}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateScore('playerTwo', 1)}
              disabled={winner !== null}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      {!winner && (
        <div className="text-center text-xs text-muted-foreground">
          First to {pointsToWin} points with a 2-point lead wins
        </div>
      )}
    </div>
  );
}