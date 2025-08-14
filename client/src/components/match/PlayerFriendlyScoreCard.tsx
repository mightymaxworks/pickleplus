import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Star, Users, Calendar, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Player {
  id: number;
  username: string;
  fullName?: string;
  picklePoints?: number;
  rankingPoints?: number;
  ageGroup?: string;
  gender?: string;
  level?: string;
  rankings?: Record<string, number>;
}

interface MatchData {
  id: number;
  matchDate: string;
  matchType: 'casual' | 'tournament';
  formatType: 'singles' | 'doubles';
  scorePlayerOne: string;
  scorePlayerTwo: string;
  winnerId: number;
  location?: string;
  notes?: string;
  playerOne: Player;
  playerTwo: Player;
  playerOnePartner?: Player;
  playerTwoPartner?: Player;
}

interface PlayerFriendlyScoreCardProps {
  match: MatchData;
  currentPlayerId: number; // The viewing player's ID
  showDetails?: boolean;
  className?: string;
}

export function PlayerFriendlyScoreCard({ 
  match, 
  currentPlayerId,
  showDetails = false,
  className 
}: PlayerFriendlyScoreCardProps) {
  const { t } = useLanguage();
  
  const team1Score = parseInt(match.scorePlayerOne || '0');
  const team2Score = parseInt(match.scorePlayerTwo || '0');
  const isTeam1Winner = team1Score > team2Score;
  
  const isPlayerInTeam1 = match.playerOne.id === currentPlayerId || match.playerOnePartner?.id === currentPlayerId;
  const isPlayerInTeam2 = match.playerTwo.id === currentPlayerId || match.playerTwoPartner?.id === currentPlayerId;
  const isPlayerWinner = (isPlayerInTeam1 && isTeam1Winner) || (isPlayerInTeam2 && !isTeam1Winner);
  
  // Extract game scores from notes if available
  const gameScoresMatch = match.notes?.match(/\[Game Scores: ([^\]]+)\]/);
  const gameScores = gameScoresMatch ? gameScoresMatch[1].split(', ') : [];
  
  // Calculate player-friendly points (simplified display)
  const getPlayerPoints = (isWinner: boolean) => {
    // Simple display logic - don't reveal exact multipliers
    let baseReward = isWinner ? "Strong Performance" : "Good Effort";
    let pointsEarned = isWinner ? 6 : 2; // Simplified display points
    let picklePointsEarned = Math.ceil(pointsEarned * 1.5);
    
    if (match.matchType === 'tournament') {
      baseReward = isWinner ? "Tournament Victory!" : "Tournament Experience";
      pointsEarned *= 2;
      picklePointsEarned *= 2;
    }
    
    return {
      performance: baseReward,
      rankingProgress: pointsEarned,
      rewardsEarned: picklePointsEarned,
      category: getPerformanceCategory(pointsEarned)
    };
  };
  
  const getPerformanceCategory = (points: number) => {
    if (points >= 12) return { label: "Exceptional", color: "bg-purple-100 text-purple-800" };
    if (points >= 8) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (points >= 4) return { label: "Good", color: "bg-blue-100 text-blue-800" };
    return { label: "Learning", color: "bg-gray-100 text-gray-600" };
  };
  
  const formatPlayerName = (player: Player) => {
    return player.fullName || player.username;
  };
  
  const playerPerformance = getPlayerPoints(isPlayerWinner);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {isPlayerWinner ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : (
              <Target className="h-5 w-5 text-blue-500" />
            )}
            <span>{isPlayerWinner ? 'Victory!' : 'Match Complete'}</span>
          </CardTitle>
          <Badge variant={match.matchType === 'tournament' ? 'default' : 'secondary'}>
            {match.matchType === 'tournament' ? 'Tournament' : 'Casual'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Match Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {gameScores.length > 0 ? (
              <div className="flex space-x-2">
                {gameScores.map((score, index) => {
                  const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                  const isTeam1GameWinner = team1Game > team2Game;
                  const isPlayerGameWinner = (isPlayerInTeam1 && isTeam1GameWinner) || 
                                           (isPlayerInTeam2 && !isTeam1GameWinner);
                  
                  return (
                    <div key={index} className={cn(
                      "text-lg font-bold px-3 py-2 rounded border",
                      isPlayerGameWinner 
                        ? "text-green-600 border-green-300 bg-green-50" 
                        : "text-gray-500 border-gray-200"
                    )}>
                      {isPlayerInTeam1 ? team1Game : team2Game}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-3xl font-bold text-center">
                <span className={isPlayerWinner ? "text-green-600" : "text-gray-500"}>
                  {isPlayerInTeam1 ? team1Score : team2Score}
                </span>
                <span className="text-gray-400 mx-4">-</span>
                <span className={!isPlayerWinner ? "text-green-600" : "text-gray-500"}>
                  {isPlayerInTeam1 ? team2Score : team1Score}
                </span>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {match.formatType === 'doubles' ? 'Doubles Match' : 'Singles Match'} • {match.location || 'Local Court'}
          </div>
        </div>
        
        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Your Performance</span>
            </h4>
            <Badge className={playerPerformance.category.color}>
              {playerPerformance.category.label}
            </Badge>
          </div>
          
          <div className="text-lg font-medium text-gray-800 mb-2">
            {playerPerformance.performance}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                +{playerPerformance.rankingProgress}
              </div>
              <div className="text-xs text-gray-600">Ranking Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{playerPerformance.rewardsEarned}
              </div>
              <div className="text-xs text-gray-600">Pickle Points</div>
            </div>
          </div>
        </div>
        
        {/* Achievement Hints (without revealing algorithm) */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Progress Insights</span>
          </h4>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            {match.matchType === 'tournament' && (
              <div className="flex items-center space-x-2 text-purple-700">
                <Star className="h-4 w-4" />
                <span>Tournament participation bonus applied</span>
              </div>
            )}
            
            {match.formatType === 'doubles' && (
              <div className="flex items-center space-x-2 text-blue-700">
                <Users className="h-4 w-4" />
                <span>Teamwork experience gained</span>
              </div>
            )}
            
            {isPlayerWinner && (
              <div className="flex items-center space-x-2 text-green-700">
                <Trophy className="h-4 w-4" />
                <span>Victory achievement unlocked</span>
              </div>
            )}
            
            {!isPlayerWinner && (
              <div className="flex items-center space-x-2 text-blue-700">
                <Target className="h-4 w-4" />
                <span>Valuable learning experience gained</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Optional: Next Steps/Encouragement */}
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
          <strong>Keep Growing:</strong> {
            isPlayerWinner 
              ? "Great match! Continue building on this momentum with more tournament play."
              : "Every match is progress! Focus on consistent play to see steady improvement."
          }
        </div>
        
        {/* Admin/Debug View (only in development) */}
        {showDetails && process.env.NODE_ENV === 'development' && (
          <details className="bg-yellow-50 p-3 rounded text-xs">
            <summary className="cursor-pointer font-medium">Debug Info (Dev Only)</summary>
            <div className="mt-2 space-y-1">
              <div>Match Type: {match.matchType}</div>
              <div>Format: {match.formatType}</div>
              <div>Player Winner: {isPlayerWinner ? 'Yes' : 'No'}</div>
              <div>Team 1 Winner: {isTeam1Winner ? 'Yes' : 'No'}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export default PlayerFriendlyScoreCard;