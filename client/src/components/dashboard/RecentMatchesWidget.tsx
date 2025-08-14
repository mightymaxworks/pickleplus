import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchScoreCard } from "@/components/match/MatchScoreCard";
import { Trophy, Calendar, Users, TrendingUp, Loader2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface RecentMatchesWidgetProps {
  className?: string;
  limit?: number;
}

export function RecentMatchesWidget({ className, limit = 3 }: RecentMatchesWidgetProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  // Fetch recent matches
  const { data: recentMatches, isLoading } = useQuery({
    queryKey: ['/api/matches/recent', limit],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/matches/recent?limit=${limit}`);
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">
              PCP Verified Scores
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const matches = recentMatches?.data || [];

  if (matches.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">
              PCP Verified Scores
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="rounded-full bg-emerald-100 p-3 mx-auto w-fit mb-4">
              <Trophy className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Record your first match to see your verified scores here
            </p>
            <Link href="/record-match">
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
                Record Match
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full",
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
            <Badge variant="outline" className="font-medium border-emerald-200 text-emerald-700 bg-emerald-50">
              Recent {matches.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Match Score Cards - Updated to use UDF MatchScoreCard */}
        <div className="space-y-3">
          {matches.slice(0, expanded ? matches.length : limit).map((match: any) => (
            <MatchScoreCard 
              key={match.id} 
              match={match} 
              compact={true}
              showPointsBreakdown={false}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-gray-200/60">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-emerald-600">
                {matches.filter((m: any) => m.winnerId === m.userId).length}
              </div>
              <div className="text-xs text-gray-500">Wins</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">
                {matches.length}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-purple-600">
                {Math.round((matches.filter((m: any) => m.winnerId === m.userId).length / matches.length) * 100) || 0}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="pt-2">
          <Link href="/matches">
            <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Calendar className="h-4 w-4 mr-2" />
              View All Matches
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact match card for the widget
function CompactMatchCard({ match }: { match: any }) {
  const team1Score = parseInt(match.scorePlayerOne || '0');
  const team2Score = parseInt(match.scorePlayerTwo || '0');
  const isTeam1Winner = team1Score > team2Score;
  const isUserWinner = match.winnerId === match.userId;

  // Extract game scores from notes if available
  const gameScoresMatch = match.notes?.match(/\[Game Scores: ([^\]]+)\]/);
  const gameScores = gameScoresMatch ? gameScoresMatch[1].split(', ') : [];

  return (
    <div className={cn(
      "p-4 rounded-xl border-2 transition-all duration-300",
      isUserWinner
        ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50/50"
        : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50/50"
    )}>
      <div className="flex items-center justify-between">
        {/* Match Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge 
              variant={match.matchType === 'tournament' ? 'default' : 'secondary'}
              className={cn(
                "text-xs font-medium",
                match.matchType === 'tournament' 
                  ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700"
              )}
            >
              {match.matchType}
            </Badge>
            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
              {match.formatType}
            </Badge>
            {isUserWinner && (
              <Badge className="text-xs bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                <Trophy className="h-3 w-3 mr-1" />
                WIN
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            vs {match.opponentName || 'Unknown'}
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {new Date(match.matchDate).toLocaleDateString()}
          </div>
        </div>

        {/* Score Display */}
        <div className="text-right">
          {gameScores.length > 0 ? (
            <div className="flex space-x-1">
              {gameScores.map((score: string, index: number) => {
                const [team1Game, team2Game] = score.split('-').map(s => parseInt(s));
                const gameWinner = team1Game > team2Game;
                
                return (
                  <div key={index} className={cn(
                    "text-sm font-bold px-2 py-1 rounded border",
                    gameWinner 
                      ? "text-emerald-600 border-emerald-300 bg-emerald-50" 
                      : "text-gray-500 border-gray-200"
                  )}>
                    {team1Game}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className={cn(
                "text-2xl font-bold",
                isTeam1Winner ? "text-emerald-600" : "text-gray-500"
              )}>
                {team1Score}
              </div>
              <div className="text-sm text-gray-400">-</div>
              <div className={cn(
                "text-2xl font-bold",
                !isTeam1Winner ? "text-emerald-600" : "text-gray-500"
              )}>
                {team2Score}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}