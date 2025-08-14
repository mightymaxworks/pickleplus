import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

interface ScoreDisplayProps {
  team1Score: number;
  team2Score: number;
  team1Players: string[];
  team2Players: string[];
  gameScores?: string[];
  matchType?: 'casual' | 'tournament';
  formatType?: 'singles' | 'doubles';
  size?: 'sm' | 'md' | 'lg';
  showWinnerIcon?: boolean;
  className?: string;
}

export function MatchScoreDisplay({
  team1Score,
  team2Score,
  team1Players,
  team2Players,
  gameScores = [],
  matchType = 'casual',
  formatType = 'singles',
  size = 'md',
  showWinnerIcon = true,
  className
}: ScoreDisplayProps) {
  const isTeam1Winner = team1Score > team2Score;
  
  const sizeClasses = {
    sm: {
      score: 'text-xl',
      playerName: 'text-xs',
      container: 'p-2',
      spacing: 'space-x-2'
    },
    md: {
      score: 'text-3xl',
      playerName: 'text-sm',
      container: 'p-3',
      spacing: 'space-x-4'
    },
    lg: {
      score: 'text-4xl',
      playerName: 'text-base',
      container: 'p-4',
      spacing: 'space-x-6'
    }
  };
  
  const classes = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center justify-center", classes.spacing, className)}>
      {/* Team 1 */}
      <div className={cn(
        "text-center rounded-lg border-2 transition-all",
        classes.container,
        isTeam1Winner 
          ? "border-green-500 bg-green-50 shadow-lg" 
          : "border-gray-200 bg-white"
      )}>
        <div className="space-y-1">
          {team1Players.map((player, index) => (
            <div key={index} className={cn("font-medium", classes.playerName)}>
              {player}
            </div>
          ))}
        </div>
        
        <div className={cn(
          "font-bold mt-2",
          classes.score,
          isTeam1Winner ? "text-green-600" : "text-gray-500"
        )}>
          {team1Score}
        </div>
        
        {showWinnerIcon && isTeam1Winner && (
          <div className="mt-2">
            {matchType === 'tournament' ? (
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
            ) : (
              <Medal className="h-4 w-4 text-green-500 mx-auto" />
            )}
          </div>
        )}
      </div>

      {/* VS Separator */}
      <div className="text-gray-400 font-light text-lg">VS</div>

      {/* Team 2 */}
      <div className={cn(
        "text-center rounded-lg border-2 transition-all",
        classes.container,
        !isTeam1Winner 
          ? "border-green-500 bg-green-50 shadow-lg" 
          : "border-gray-200 bg-white"
      )}>
        <div className="space-y-1">
          {team2Players.map((player, index) => (
            <div key={index} className={cn("font-medium", classes.playerName)}>
              {player}
            </div>
          ))}
        </div>
        
        <div className={cn(
          "font-bold mt-2",
          classes.score,
          !isTeam1Winner ? "text-green-600" : "text-gray-500"
        )}>
          {team2Score}
        </div>
        
        {showWinnerIcon && !isTeam1Winner && (
          <div className="mt-2">
            {matchType === 'tournament' ? (
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
            ) : (
              <Medal className="h-4 w-4 text-green-500 mx-auto" />
            )}
          </div>
        )}
      </div>
      
      {/* Game Scores Breakdown */}
      {gameScores.length > 0 && size !== 'sm' && (
        <div className="ml-4 space-y-1">
          <div className="text-xs text-gray-500 font-medium">Games</div>
          {gameScores.map((score, index) => {
            const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
            const gameWinner = team1Game > team2Game ? 'team1' : 'team2';
            
            return (
              <div key={index} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                <span className={cn(gameWinner === 'team1' ? 'text-green-600 font-bold' : '')}>
                  {team1Game}
                </span>
                <span className="mx-1">-</span>
                <span className={cn(gameWinner === 'team2' ? 'text-green-600 font-bold' : '')}>
                  {team2Game}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MatchScoreDisplay;