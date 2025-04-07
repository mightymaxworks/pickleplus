import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Crown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [scoreWarning, setScoreWarning] = useState<string | null>(null);
  const { toast } = useToast();

  // Track previous warnings to prevent excessive toast notifications
  const [prevWarningState, setPrevWarningState] = useState<string | null>(null);
  
  // Check for score warnings
  useEffect(() => {
    const p1Score = value.playerOneScore;
    const p2Score = value.playerTwoScore;
    let newWarning: string | null = null;
    
    // Check if any score is above the points to win threshold
    if (p1Score > pointsToWin && p1Score - p2Score < 2) {
      newWarning = `${playerOneName}'s score exceeds ${pointsToWin} without a 2-point lead`;
    } else if (p2Score > pointsToWin && p2Score - p1Score < 2) {
      newWarning = `${playerTwoName}'s score exceeds ${pointsToWin} without a 2-point lead`;
    } else if (p1Score > pointsToWin + 5 || p2Score > pointsToWin + 5) {
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
  }, [value.playerOneScore, value.playerTwoScore, pointsToWin, playerOneName, playerTwoName, toast, prevWarningState]);

  // Handle score changes within the boundaries
  const updateScore = (player: 'playerOne' | 'playerTwo', amount: number) => {
    const newValue = { ...value };
    const scoreField = player === 'playerOne' ? 'playerOneScore' : 'playerTwoScore';
    const newScore = Math.max(0, newValue[scoreField] + amount);
    newValue[scoreField] = newScore;
    onChange(newValue);
  };

  // Determine if a player has won (for UI highlighting only, not for disabling inputs)
  const isGameWon = (playerOneScore: number, playerTwoScore: number): boolean => {
    // In pickleball, a player wins when they have at least `pointsToWin` points AND a 2-point lead
    const maxScore = Math.max(playerOneScore, playerTwoScore);
    const minScore = Math.min(playerOneScore, playerTwoScore);
    return maxScore >= pointsToWin && (maxScore - minScore) >= 2;
  };

  // Determine winner (for UI only)
  const winner = isGameWon(value.playerOneScore, value.playerTwoScore)
    ? value.playerOneScore > value.playerTwoScore 
      ? "playerOne" 
      : "playerTwo"
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player One Score */}
        <Card className={`p-3 sm:p-4 flex flex-col items-center ${winner === "playerOne" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
              {playerOneInitials || playerOneName.charAt(0)}
            </div>
            <div className="ml-2 text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {playerOneName}
            </div>
            {winner === "playerOne" && (
              <Badge className="ml-auto flex items-center gap-1" variant="default">
                <Crown className="h-3 w-3" />
                <span className="hidden sm:inline">Winner</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 mt-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateScore('playerOne', -1)}
              disabled={value.playerOneScore <= 0}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.playerOneScore || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow empty string (for deleting)
                if (newValue === '') {
                  onChange({
                    ...value,
                    playerOneScore: 0
                  });
                  return;
                }
                // Only allow numeric input
                if (/^\d+$/.test(newValue)) {
                  const newScore = parseInt(newValue);
                  onChange({
                    ...value,
                    playerOneScore: newScore
                  });
                }
              }}
              className={`text-3xl sm:text-4xl font-bold w-12 sm:w-16 text-center bg-transparent border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary rounded-md ${value.playerOneScore > pointsToWin && !winner ? 'border-red-500' : ''}`}
            />
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateScore('playerOne', 1)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </Card>
        
        {/* Player Two Score */}
        <Card className={`p-3 sm:p-4 flex flex-col items-center ${winner === "playerTwo" ? "bg-primary/10 border-primary" : ""}`}>
          <div className="flex items-center justify-center mb-2 w-full">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
              {playerTwoInitials || playerTwoName.charAt(0)}
            </div>
            <div className="ml-2 text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {playerTwoName}
            </div>
            {winner === "playerTwo" && (
              <Badge className="ml-auto flex items-center gap-1" variant="default">
                <Crown className="h-3 w-3" />
                <span className="hidden sm:inline">Winner</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 mt-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateScore('playerTwo', -1)}
              disabled={value.playerTwoScore <= 0}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.playerTwoScore || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow empty string (for deleting)
                if (newValue === '') {
                  onChange({
                    ...value,
                    playerTwoScore: 0
                  });
                  return;
                }
                // Only allow numeric input
                if (/^\d+$/.test(newValue)) {
                  const newScore = parseInt(newValue);
                  onChange({
                    ...value,
                    playerTwoScore: newScore
                  });
                }
              }}
              className={`text-3xl sm:text-4xl font-bold w-12 sm:w-16 text-center bg-transparent border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary rounded-md ${value.playerTwoScore > pointsToWin && !winner ? 'border-red-500' : ''}`}
            />
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateScore('playerTwo', 1)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        {winner ? (
          <span className="text-green-600 font-medium">
            Game complete! {winner === "playerOne" ? playerOneName : playerTwoName} has won.
          </span>
        ) : scoreWarning ? (
          <div className="flex items-center justify-center gap-1 text-red-500">
            <AlertCircle className="h-3 w-3" />
            <span>{scoreWarning}</span>
          </div>
        ) : (
          <span>First to {pointsToWin} points with a 2-point lead wins</span>
        )}
      </div>
    </div>
  );
}