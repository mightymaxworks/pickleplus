import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trophy, TrendingUp, TrendingDown, Edit, Users, User } from 'lucide-react';
import { format } from 'date-fns';

interface DUPRMatchHistoryProps {
  matches: any[];
  onEditMatch?: (match: any) => void;
  isAdmin?: boolean;
}

const DUPRStyleMatchHistory: React.FC<DUPRMatchHistoryProps> = ({ 
  matches, 
  onEditMatch,
  isAdmin = false 
}) => {
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Matches Yet</h3>
          <p className="text-sm text-muted-foreground">
            Match history will appear here once matches are recorded
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatScore = (scores: string | any[]): string => {
    if (!scores) return 'N/A';
    if (typeof scores === 'string') {
      try {
        const parsed = JSON.parse(scores);
        if (Array.isArray(parsed)) {
          return parsed.map(game => `${game.playerOneScore}-${game.playerTwoScore}`).join(', ');
        }
      } catch {
        return scores;
      }
    }
    if (Array.isArray(scores)) {
      return scores.map(game => `${game.playerOneScore}-${game.playerTwoScore}`).join(', ');
    }
    return 'N/A';
  };

  const getMatchResult = (match: any): 'win' | 'loss' | 'unknown' => {
    if (!match.playerResults || match.playerResults.length === 0) return 'unknown';
    
    // For now, we'll use a simple heuristic based on points awarded
    const playerResult = match.playerResults[0];
    return playerResult.pointsAwarded > 0 ? 'win' : 'loss';
  };

  const getRatingChange = (match: any): { change: number; before: number; after: number } => {
    // Mock rating calculation - in real app, this would come from the match data
    const baseChange = Math.random() * 0.3 - 0.15; // -0.15 to +0.15
    const change = Math.round(baseChange * 100) / 100;
    const before = 4.25 + Math.random() * 0.5;
    const after = before + change;
    
    return { change, before: Math.round(before * 100) / 100, after: Math.round(after * 100) / 100 };
  };

  // Group matches by date to avoid duplicates
  const uniqueMatches = matches.reduce((acc, match) => {
    const key = `${match.id}-${match.createdAt}`;
    if (!acc.find(m => `${m.id}-${m.createdAt}` === key)) {
      acc.push(match);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          Match History
          <Badge variant="secondary">{uniqueMatches.length} matches</Badge>
        </CardTitle>
      </CardHeader>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {uniqueMatches.map((match, index) => {
          const result = getMatchResult(match);
          const rating = getRatingChange(match);
          const isDoubles = match.format?.includes('doubles') || 
                           (match.playerResults && match.playerResults.length > 2);
          
          return (
            <Card key={`${match.id}-${index}`} className={`border transition-all hover:shadow-md ${
              result === 'win' ? 'border-green-200 bg-green-50/50' : 
              result === 'loss' ? 'border-red-200 bg-red-50/50' : 
              'border-gray-200'
            }`}>
              <CardContent className="p-4">
                {/* Header: Date, Time, Match Type */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(match.createdAt || match.scheduledDate), 'MMM d, yyyy')}
                    </div>
                    
                    {match.scheduledTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {match.scheduledTime}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isDoubles ? "default" : "secondary"} className="text-xs">
                      {isDoubles ? (
                        <><Users className="h-3 w-3 mr-1" />Doubles</>
                      ) : (
                        <><User className="h-3 w-3 mr-1" />Singles</>
                      )}
                    </Badge>
                    
                    {match.competitionName && (
                      <Badge variant="outline" className="text-xs">
                        {match.competitionName}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Players */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDoubles ? (
                        <div className="flex -space-x-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {match.playerOneName?.substring(0, 2) || 'P1'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {match.partnerOneName?.substring(0, 2) || 'P+'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                            {match.playerOneName?.substring(0, 2) || 'P1'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div>
                        <p className="font-medium text-sm">
                          {isDoubles ? (
                            `${match.playerOneName || 'Player 1'} & ${match.partnerOneName || 'Partner'}`
                          ) : (
                            match.playerOneName || 'Player 1'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center text-xs text-muted-foreground">vs</div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {isDoubles ? (
                            `${match.playerTwoName || 'Player 2'} & ${match.partnerTwoName || 'Partner'}`
                          ) : (
                            match.playerTwoName || 'Player 2'
                          )}
                        </p>
                      </div>
                      
                      {isDoubles ? (
                        <div className="flex -space-x-2">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                              {match.playerTwoName?.substring(0, 2) || 'P2'}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                              {match.partnerTwoName?.substring(0, 2) || 'P+'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                            {match.playerTwoName?.substring(0, 2) || 'P2'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score and Rating Impact */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Game Scores */}
                    <div className="bg-white rounded-lg px-3 py-2 border">
                      <p className="text-sm font-mono font-bold">
                        Score: {formatScore(match.scores)}
                      </p>
                    </div>
                    
                    {/* Result Badge */}
                    <Badge variant={result === 'win' ? 'default' : result === 'loss' ? 'destructive' : 'secondary'}>
                      {result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'DRAW'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Rating Impact */}
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      rating.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rating.change > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{rating.change > 0 ? '+' : ''}{rating.change.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({rating.before} → {rating.after})
                      </span>
                    </div>

                    {/* Points Awarded */}
                    {match.playerResults && match.playerResults.length > 0 && (
                      <div className="text-sm font-medium text-orange-600">
                        +{match.playerResults[0].pointsAwarded || 0} pts
                      </div>
                    )}

                    {/* Admin Edit Button */}
                    {isAdmin && onEditMatch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMatch(match)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                {(match.ageGroup || match.competitionType) && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    {match.ageGroup && (
                      <Badge variant="outline" className="text-xs">
                        {match.ageGroup.replace('_', '-')} years
                      </Badge>
                    )}
                    {match.competitionType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {match.competitionType}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {uniqueMatches.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm">
            Load More Matches
          </Button>
        </div>
      )}
    </div>
  );
};

export default DUPRStyleMatchHistory;