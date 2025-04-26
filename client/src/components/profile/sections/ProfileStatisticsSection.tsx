/**
 * PKL-278651-PROF-0009.3-SECT - Profile Statistics Section
 * 
 * This component displays user statistics and performance metrics
 * with frontend-first calculations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Trophy, Activity, BarChart3, TrendingUp, Zap, Target } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { CourtIQMetrics, CalculatedUserMetrics } from "@/services/DataCalculationService";
import { PCPRankingCard } from "@/components/profile/PCPRankingCard";
import { useMemo } from "react";

interface ProfileStatisticsSectionProps {
  user: EnhancedUser;
  calculatedMetrics: CalculatedUserMetrics;
}

export function ProfileStatisticsSection({ user, calculatedMetrics }: ProfileStatisticsSectionProps) {
  const winRate = useMemo(() => {
    if (!user.totalMatches) return 0;
    return Math.round((user.matchesWon / user.totalMatches) * 100);
  }, [user.matchesWon, user.totalMatches]);

  const renderDimensionRating = (
    name: string, 
    value: number | undefined, 
    icon: React.ReactNode,
    color: string
  ) => {
    if (value === undefined) return null;
    const percentage = Math.round((value / 5) * 100);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{name}</span>
          </div>
          <span className="text-sm font-medium">{value.toFixed(1)}</span>
        </div>
        <Progress value={percentage} className={`h-2 ${color}`} />
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Main stats cards (Col 1-8) */}
      <div className="md:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Win Rate Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{winRate}%</div>
              <div className="text-xs text-muted-foreground">
                {user.matchesWon} wins / {user.totalMatches} matches
              </div>
              <Progress value={winRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          {/* XP Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Zap className="h-4 w-4 text-amber-500 mr-2" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{user.xp} XP</div>
              <div className="text-xs text-muted-foreground">
                Level {calculatedMetrics.level} • {calculatedMetrics.xpProgressPercentage}% to next level
              </div>
              <Progress 
                value={calculatedMetrics.xpProgressPercentage} 
                className="mt-2 h-2 bg-amber-100"
              />
            </CardContent>
          </Card>
          
          {/* Recent Performance Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Activity className="h-4 w-4 text-blue-500 mr-2" />
                Recent Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {calculatedMetrics.recentPerformance > 0 ? '+' : ''}
                {calculatedMetrics.recentPerformance.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {calculatedMetrics.recentPerformance > 0 ? 'Improving' : 
                  calculatedMetrics.recentPerformance < 0 ? 'Declining' : 'Consistent'}
              </div>
              <Progress 
                value={50 + calculatedMetrics.recentPerformance / 2} 
                className="mt-2 h-2 bg-blue-100" 
              />
            </CardContent>
          </Card>
        </div>
        
        {/* CourtIQ Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              CourtIQ™ Performance Metrics
            </CardTitle>
            <CardDescription>
              Your multi-dimensional performance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculatedMetrics.dimensionRatings ? (
              <div className="space-y-4">
                {renderDimensionRating(
                  "Technical", 
                  calculatedMetrics.dimensionRatings.technical,
                  <Target className="h-4 w-4 text-blue-500" />,
                  "bg-blue-100"
                )}
                {renderDimensionRating(
                  "Tactical", 
                  calculatedMetrics.dimensionRatings.tactical,
                  <TrendingUp className="h-4 w-4 text-green-500" />,
                  "bg-green-100"
                )}
                {renderDimensionRating(
                  "Physical", 
                  calculatedMetrics.dimensionRatings.physical,
                  <Zap className="h-4 w-4 text-orange-500" />,
                  "bg-orange-100"
                )}
                {renderDimensionRating(
                  "Mental", 
                  calculatedMetrics.dimensionRatings.mental,
                  <Activity className="h-4 w-4 text-purple-500" />,
                  "bg-purple-100"
                )}
                {renderDimensionRating(
                  "Consistency", 
                  calculatedMetrics.dimensionRatings.consistency,
                  <BarChart3 className="h-4 w-4 text-red-500" />,
                  "bg-red-100"
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Not enough match data to calculate performance metrics
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Rating and Ranking Cards (Col 9-12) */}
      <div className="md:col-span-4 space-y-6">
        {/* Overall Rating Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold mb-2">
                {calculatedMetrics.overallRating || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                {calculatedMetrics.ratingTier ? 
                  `Tier ${calculatedMetrics.ratingTier}` : 
                  'Not enough data'}
              </div>
              {calculatedMetrics.overallRating && (
                <div className="mt-4 w-full">
                  <Progress 
                    value={((calculatedMetrics.overallRating - 1000) / 2000) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* PCP Ranking Card - Displays when PCP ranking info is available */}
        {calculatedMetrics.pcpRanking && (
          <PCPRankingCard rankingInfo={calculatedMetrics.pcpRanking} />
        )}
        
        {/* Tournament Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tournament Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tournaments</span>
                <span className="font-medium">{user.totalTournaments || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mastery Level</span>
                <span className="font-medium">{calculatedMetrics.masteryLevel || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}