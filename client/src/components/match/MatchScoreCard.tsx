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
  ageGroup?: string;
  gender?: string;
  level?: string;
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
  
  const team1Score = parseInt(match.scorePlayerOne || '0');
  const team2Score = parseInt(match.scorePlayerTwo || '0');
  const isTeam1Winner = team1Score > team2Score;
  
  // Extract game scores from notes if available
  const gameScoresMatch = match.notes?.match(/\[Game Scores: ([^\]]+)\]/);
  const gameScores = gameScoresMatch ? gameScoresMatch[1].split(', ') : [];
  
  // Calculate points based on PICKLE_PLUS_ALGORITHM_DOCUMENT
  const calculatePoints = (playerId: number, isWinner: boolean) => {
    const basePoints = isWinner ? 3 : 1;
    const tournamentBonus = match.matchType === 'tournament' ? 2 : 0;
    const doublesBonus = match.formatType === 'doubles' ? 0.5 : 0;
    
    return {
      base: basePoints,
      tournament: tournamentBonus,
      doubles: doublesBonus,
      total: basePoints + tournamentBonus + doublesBonus
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
      'under-30': 'U30',
      '30-39': '30-39',
      '40-49': '40-49',
      '50-59': '50-59',
      '60-plus': '60+'
    };
    return ageMap[ageGroup] || ageGroup;
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
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{t('match.scoreCard')}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={match.matchType === 'tournament' ? 'default' : 'secondary'}>
              {match.matchType.toUpperCase()}
            </Badge>
            <Badge variant="outline">
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
            "text-center p-4 rounded-lg border-2 transition-colors",
            isTeam1Winner ? "border-green-500 bg-green-50" : "border-gray-200"
          )}>
            <div className="space-y-2">
              {team1Players.map((player, index) => player && (
                <div key={player.id} className="flex items-center space-x-2">
                  <div className="font-semibold">{formatPlayerName(player)}</div>
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
              <Badge className="mt-2 bg-green-600">
                <Trophy className="h-3 w-3 mr-1" />
                WINNER
              </Badge>
            )}
          </div>

          <div className="text-2xl font-light text-gray-400">VS</div>

          {/* Team 2 */}
          <div className={cn(
            "text-center p-4 rounded-lg border-2 transition-colors",
            !isTeam1Winner ? "border-green-500 bg-green-50" : "border-gray-200"
          )}>
            <div className="space-y-2">
              {team2Players.map((player, index) => player && (
                <div key={player.id} className="flex items-center space-x-2">
                  <div className="font-semibold">{formatPlayerName(player)}</div>
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
              <Badge className="mt-2 bg-green-600">
                <Trophy className="h-3 w-3 mr-1" />
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
              <h4 className="font-semibold flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Pickle Points Allocation</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team 1 Points */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Team 1</h5>
                  {team1Players.map(player => {
                    if (!player) return null;
                    const points = calculatePoints(player.id, isTeam1Winner);
                    return (
                      <div key={player.id} className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Base Points: +{points.base} ({isTeam1Winner ? 'Win' : 'Loss'})</div>
                          {points.tournament > 0 && (
                            <div>Tournament Bonus: +{points.tournament}</div>
                          )}
                          {points.doubles > 0 && (
                            <div>Doubles Bonus: +{points.doubles}</div>
                          )}
                          <div className="font-semibold text-green-600">
                            Total: +{points.total} Pickle Points
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Team 2 Points */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Team 2</h5>
                  {team2Players.map(player => {
                    if (!player) return null;
                    const points = calculatePoints(player.id, !isTeam1Winner);
                    return (
                      <div key={player.id} className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-sm">{formatPlayerName(player)}</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Base Points: +{points.base} ({!isTeam1Winner ? 'Win' : 'Loss'})</div>
                          {points.tournament > 0 && (
                            <div>Tournament Bonus: +{points.tournament}</div>
                          )}
                          {points.doubles > 0 && (
                            <div>Doubles Bonus: +{points.doubles}</div>
                          )}
                          <div className="font-semibold text-green-600">
                            Total: +{points.total} Pickle Points
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Algorithm Reference */}
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                <strong>Algorithm Reference:</strong> Win: 3 points, Loss: 1 point, Tournament Bonus: +2, Doubles Bonus: +0.5
                <br />
                <em>Based on PICKLE_PLUS_ALGORITHM_DOCUMENT.md</em>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchScoreCard;