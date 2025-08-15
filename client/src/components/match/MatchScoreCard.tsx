import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, TrendingUp, Calendar, MapPin, Users } from "lucide-react";
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
  rankings?: {
    overall?: number;
    singles?: number;
    doubles?: number;
    ageGroup?: number;
    [key: string]: number | undefined;
  };
}

interface MatchData {
  id: number;
  matchDate: string;
  matchType: 'casual' | 'tournament';
  formatType: 'singles' | 'doubles';
  scorePlayerOne: string; // Games won by Team 1
  scorePlayerTwo: string; // Games won by Team 2
  winnerId: number;
  location?: string;
  notes?: string;
  playerOne: Player;
  playerTwo: Player;
  playerOnePartner?: Player;
  playerTwoPartner?: Player;
  pointsAllocated?: {
    playerId: number;
    points: number;
    category: string;
    reason: string;
  }[];
}

interface MatchScoreCardProps {
  match: MatchData;
  showPointsBreakdown?: boolean;
  compact?: boolean;
  className?: string;
}

export function MatchScoreCard({ 
  match, 
  showPointsBreakdown = true, 
  compact = false,
  className 
}: MatchScoreCardProps) {
  const { t } = useLanguage();
  
  // Extract actual game scores from notes if available
  const gameScoresMatch = match.notes?.match(/\[Game Scores: ([^\]]+)\]/);
  const gameScores = gameScoresMatch ? gameScoresMatch[1].split(', ') : [];
  
  // Use the actual game scores for display instead of games won
  let team1Score = parseInt(match.scorePlayerOne || '0');
  let team2Score = parseInt(match.scorePlayerTwo || '0');
  
  // If we have detailed game scores, use the final game score for display
  if (gameScores.length > 0) {
    const finalGameScore = gameScores[gameScores.length - 1]; // Get last game
    const [finalTeam1Score, finalTeam2Score] = finalGameScore.split('-').map(s => parseInt(s.trim()));
    if (!isNaN(finalTeam1Score) && !isNaN(finalTeam2Score)) {
      team1Score = finalTeam1Score;
      team2Score = finalTeam2Score;
    }
  }
  
  const isTeam1Winner = team1Score > team2Score;
  
  // Calculate Ranking Points (Competitive System) based on PICKLE_PLUS_ALGORITHM_DOCUMENT
  const calculateRankingPoints = (playerId: number, isWinner: boolean) => {
    const basePoints = isWinner ? 3 : 1;
    const tournamentMultiplier = match.matchType === 'tournament' ? 2.0 : 1.0;
    // Age/Gender multipliers would be calculated based on player data in real implementation
    const ageMultiplier = 1.2; // Example multiplier
    const genderMultiplier = 1.0; // Example multiplier
    
    const total = Math.round(basePoints * tournamentMultiplier * ageMultiplier * genderMultiplier);
    
    return {
      basePoints,
      tournamentMultiplier,
      ageMultiplier,
      genderMultiplier,
      total
    };
  };

  // Calculate Pickle Points (Gamification System) 
  const calculatePicklePoints = (rankingPoints: number) => {
    const conversionRate = 10; // 10x conversion rate per algorithm documentation
    const picklePointsFromMatch = Math.ceil(rankingPoints * conversionRate);
    const bonusPicklePoints = 2; // Example bonus
    const totalPicklePoints = picklePointsFromMatch + bonusPicklePoints;
    
    return {
      rankingPointsEarned: rankingPoints,
      conversionRate,
      picklePointsFromMatch,
      bonusPicklePoints,
      totalPicklePoints
    };
  };
  
  const team1Players = [match.playerOne, match.playerOnePartner].filter(Boolean);
  const team2Players = [match.playerTwo, match.playerTwoPartner].filter(Boolean);
  
  const formatPlayerName = (player: Player) => {
    return player.fullName || player.username;
  };
  
  const getAgeGroupDisplay = (ageGroup?: string) => {
    if (!ageGroup) return null;
    const ageMap: Record<string, string> = {
      'pro': 'Pro',
      '19+': '19+',
      '35+': '35+',
      '50+': '50+',
      '60+': '60+',
      '70+': '70+',
      // Legacy support
      'under-30': '19+',
      '30-39': '35+',
      '40-49': '35+',
      '50-59': '50+',
      '60-plus': '60+'
    };
    return ageMap[ageGroup] || ageGroup;
  };

  // Get highest ranking for a player (for display purposes)
  const getHighestRanking = (player: Player): { value: number; category: string } => {
    if (!player.rankings) {
      return { value: player.rankingPoints || 0, category: 'Overall' };
    }
    
    let highest = { value: 0, category: 'Overall' };
    
    Object.entries(player.rankings).forEach(([category, value]) => {
      if (value && value > highest.value) {
        highest = { value, category: category.charAt(0).toUpperCase() + category.slice(1) };
      }
    });
    
    return highest;
    
    return highest.value > 0 ? highest : { value: player.rankingPoints || 0, category: 'Overall' };
  };

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {gameScores.length > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    {gameScores.map((score, index) => {
                      const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                      const gameWinner = team1Game > team2Game;
                      
                      return (
                        <div key={index} className={cn(
                          "font-bold text-lg px-2 py-1 rounded border",
                          gameWinner 
                            ? "text-green-600 border-green-300 bg-green-50" 
                            : "text-gray-500 border-gray-200"
                        )}>
                          {team1Game}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {formatPlayerName(match.playerOne)} {match.playerOnePartner ? `& ${formatPlayerName(match.playerOnePartner)}` : ''}
                  </div>
                </div>
                <div className="text-sm text-gray-400">vs</div>
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    {gameScores.map((score, index) => {
                      const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                      const gameWinner = team2Game > team1Game;
                      
                      return (
                        <div key={index} className={cn(
                          "font-bold text-lg px-2 py-1 rounded border",
                          gameWinner 
                            ? "text-green-600 border-green-300 bg-green-50" 
                            : "text-gray-500 border-gray-200"
                        )}>
                          {team2Game}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {formatPlayerName(match.playerTwo)} {match.playerTwoPartner ? `& ${formatPlayerName(match.playerTwoPartner)}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "text-2xl font-bold",
                  isTeam1Winner ? "text-green-600" : "text-gray-500"
                )}>
                  {team1Score}
                </div>
                <div className="text-sm text-gray-500">vs</div>
                <div className={cn(
                  "text-2xl font-bold",
                  !isTeam1Winner ? "text-green-600" : "text-gray-500"
                )}>
                  {team2Score}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Badge variant={match.matchType === 'tournament' ? 'default' : 'secondary'}>
                {match.matchType}
              </Badge>
              <Badge variant="outline">
                {match.formatType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto", 
      "bg-gradient-to-br from-white via-gray-50/30 to-emerald-50/20",
      "border border-gray-200/60 shadow-lg shadow-emerald-500/5",
      "backdrop-blur-sm",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">
              PCP Verified Scores
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={match.matchType === 'tournament' ? 'default' : 'secondary'}
              className={cn(
                "font-semibold px-3 py-1",
                match.matchType === 'tournament' 
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0" 
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              )}
            >
              {match.matchType.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="font-medium px-3 py-1 border-emerald-200 text-emerald-700 bg-emerald-50">
              {match.formatType.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(match.matchDate).toLocaleDateString()}</span>
          </div>
          {match.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{match.location}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-center space-x-8">
          {/* Team 1 */}
          <div className={cn(
            "text-center p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02]",
            isTeam1Winner 
              ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 shadow-lg shadow-emerald-500/20" 
              : "border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50/50"
          )}>
            <div className="space-y-2">
              {team1Players.map((player, index) => player && (
                <div key={player.id} className="space-y-1">
                  <div className="font-semibold">{formatPlayerName(player)}</div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const highestRanking = getHighestRanking(player);
                      return (
                        <Badge variant="default" className="text-xs bg-emerald-600 text-white">
                          #{highestRanking.value} {highestRanking.category}
                        </Badge>
                      );
                    })()}
                    {player.ageGroup && (
                      <Badge variant="secondary" className="text-xs">
                        {getAgeGroupDisplay(player.ageGroup)}
                      </Badge>
                    )}
                    {player.gender && (
                      <Badge variant="outline" className="text-xs">
                        {player.gender.charAt(0).toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Display game scores prominently like DUPR/ATP */}
            {gameScores.length > 0 ? (
              <div className="mt-3 space-y-1">
                <div className="flex space-x-2 justify-center">
                  {gameScores.map((score, index) => {
                    const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                    const gameWinner = team1Game > team2Game;
                    
                    return (
                      <div key={index} className={cn(
                        "font-bold text-2xl px-3 py-1 rounded border-2",
                        gameWinner 
                          ? "text-green-600 border-green-200 bg-green-50" 
                          : "text-gray-500 border-gray-200"
                      )}>
                        {team1Game}
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Games Won: {gameScores.filter(score => {
                    const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                    return team1Game > team2Game;
                  }).length}
                </div>
              </div>
            ) : (
              <div className={cn(
                "text-4xl font-bold mt-2",
                isTeam1Winner ? "text-green-600" : "text-gray-500"
              )}>
                {team1Score}
              </div>
            )}
            {isTeam1Winner && (
              <Badge className="mt-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white border-0 px-4 py-2 font-bold text-sm shadow-lg shadow-emerald-500/30">
                <Trophy className="h-4 w-4 mr-2" />
                WINNER
              </Badge>
            )}
          </div>

          <div className="text-2xl font-light text-gray-400">VS</div>

          {/* Team 2 */}
          <div className={cn(
            "text-center p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02]",
            !isTeam1Winner 
              ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 shadow-lg shadow-emerald-500/20" 
              : "border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-50/50"
          )}>
            <div className="space-y-2">
              {team2Players.map((player, index) => player && (
                <div key={player.id} className="space-y-1">
                  <div className="font-semibold">{formatPlayerName(player)}</div>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const highestRanking = getHighestRanking(player);
                      return (
                        <Badge variant="default" className="text-xs bg-emerald-600 text-white">
                          #{highestRanking.value} {highestRanking.category}
                        </Badge>
                      );
                    })()}
                    {player.ageGroup && (
                      <Badge variant="secondary" className="text-xs">
                        {getAgeGroupDisplay(player.ageGroup)}
                      </Badge>
                    )}
                    {player.gender && (
                      <Badge variant="outline" className="text-xs">
                        {player.gender.charAt(0).toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Display game scores prominently like DUPR/ATP */}
            {gameScores.length > 0 ? (
              <div className="mt-3 space-y-1">
                <div className="flex space-x-2 justify-center">
                  {gameScores.map((score, index) => {
                    const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                    const gameWinner = team2Game > team1Game;
                    
                    return (
                      <div key={index} className={cn(
                        "font-bold text-2xl px-3 py-1 rounded border-2",
                        gameWinner 
                          ? "text-green-600 border-green-200 bg-green-50" 
                          : "text-gray-500 border-gray-200"
                      )}>
                        {team2Game}
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Games Won: {gameScores.filter(score => {
                    const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                    return team2Game > team1Game;
                  }).length}
                </div>
              </div>
            ) : (
              <div className={cn(
                "text-4xl font-bold mt-2",
                !isTeam1Winner ? "text-green-600" : "text-gray-500"
              )}>
                {team2Score}
              </div>
            )}
            {!isTeam1Winner && (
              <Badge className="mt-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white border-0 px-4 py-2 font-bold text-sm shadow-lg shadow-emerald-500/30">
                <Trophy className="h-4 w-4 mr-2" />
                WINNER
              </Badge>
            )}
          </div>
        </div>

        {/* Game-by-Game Breakdown */}
        {gameScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Game Breakdown</h4>
            <div className="grid grid-cols-3 gap-2">
              {gameScores.map((score, index) => {
                const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                const gameWinner = team1Game > team2Game ? 'team1' : 'team2';
                
                return (
                  <div key={index} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 mb-1">Game {index + 1}</div>
                    <div className="font-mono">
                      <span className={cn(gameWinner === 'team1' ? 'text-green-600 font-bold' : '')}>
                        {team1Game}
                      </span>
                      <span className="mx-1">-</span>
                      <span className={cn(gameWinner === 'team2' ? 'text-green-600 font-bold' : '')}>
                        {team2Game}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Points Allocation Breakdown */}
        {showPointsBreakdown && (
          <>
            <Separator />
            <div className="space-y-4">
              {/* Dual System Points Display */}
              <div className="space-y-6">
                {/* Ranking Points Section */}
                <div>
                  <h4 className="font-semibold flex items-center space-x-2 mb-3">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span>Ranking Points (Competitive)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team 1 Ranking Points */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Team 1</h5>
                      {team1Players.map(player => {
                        if (!player) return null;
                        const rankingPoints = calculateRankingPoints(player.id, isTeam1Winner);
                        return (
                          <div key={player.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div>Base: {rankingPoints.basePoints} ({isTeam1Winner ? 'Win' : 'Loss'})</div>
                              <div>Tournament: ×{rankingPoints.tournamentMultiplier}</div>
                              <div>Age Group: ×{rankingPoints.ageMultiplier}</div>
                              <div>Gender: ×{rankingPoints.genderMultiplier}</div>
                              <div className="font-semibold text-blue-600 border-t pt-1">
                                Total: {rankingPoints.total} Ranking Points
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Team 2 Ranking Points */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Team 2</h5>
                      {team2Players.map(player => {
                        if (!player) return null;
                        const rankingPoints = calculateRankingPoints(player.id, !isTeam1Winner);
                        return (
                          <div key={player.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div>Base: {rankingPoints.basePoints} ({!isTeam1Winner ? 'Win' : 'Loss'})</div>
                              <div>Tournament: ×{rankingPoints.tournamentMultiplier}</div>
                              <div>Age Group: ×{rankingPoints.ageMultiplier}</div>
                              <div>Gender: ×{rankingPoints.genderMultiplier}</div>
                              <div className="font-semibold text-blue-600 border-t pt-1">
                                Total: {rankingPoints.total} Ranking Points
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pickle Points Section */}
                <div>
                  <h4 className="font-semibold flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Pickle Points (Gamification)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team 1 Pickle Points */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Team 1</h5>
                      {team1Players.map(player => {
                        if (!player) return null;
                        const rankingPoints = calculateRankingPoints(player.id, isTeam1Winner);
                        const picklePoints = calculatePicklePoints(rankingPoints.total);
                        return (
                          <div key={player.id} className="bg-green-50 p-3 rounded border border-green-200">
                            <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div>From Ranking: {picklePoints.rankingPointsEarned} × {picklePoints.conversionRate} = {picklePoints.picklePointsFromMatch}</div>
                              <div>Bonus: +{picklePoints.bonusPicklePoints}</div>
                              <div className="font-semibold text-green-600 border-t pt-1">
                                Total: {picklePoints.totalPicklePoints} Pickle Points
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Team 2 Pickle Points */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Team 2</h5>
                      {team2Players.map(player => {
                        if (!player) return null;
                        const rankingPoints = calculateRankingPoints(player.id, !isTeam1Winner);
                        const picklePoints = calculatePicklePoints(rankingPoints.total);
                        return (
                          <div key={player.id} className="bg-green-50 p-3 rounded border border-green-200">
                            <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                            <div className="text-xs text-gray-700 space-y-1">
                              <div>From Ranking: {picklePoints.rankingPointsEarned} × {picklePoints.conversionRate} = {picklePoints.picklePointsFromMatch}</div>
                              <div>Bonus: +{picklePoints.bonusPicklePoints}</div>
                              <div className="font-semibold text-green-600 border-t pt-1">
                                Total: {picklePoints.totalPicklePoints} Pickle Points
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Algorithm Reference */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <strong>Dual System Algorithm:</strong>
                  <br />• <strong>Ranking Points:</strong> Win 3pts, Loss 1pt with Tournament (2x), Age Group (1.2-1.6x), Gender Balance (1.15x) multipliers
                  <br />• <strong>Pickle Points:</strong> Converted from ranking points at 1.5x rate + activity bonuses
                  <br />• <em>Based on PICKLE_PLUS_ALGORITHM_DOCUMENT.md</em>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchScoreCard;