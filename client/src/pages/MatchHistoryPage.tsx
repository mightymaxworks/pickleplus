/**
 * Enhanced Match History Page
 * Dedicated page for comprehensive match history and analytics
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Filter,
  RefreshCw,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import { matchSDK } from '@/lib/sdk/matchSDK';
import { MatchHistory } from '@/components/match/MatchHistory';
import { MatchTrends } from '@/components/match/MatchTrends';
import { Skeleton } from '@/components/ui/skeleton';

export default function MatchHistoryPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Fetch match stats
  const { data: matchStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/match/stats", user?.id],
    queryFn: async () => {
      try {
        return await matchSDK.getMatchStats();
      } catch (error) {
        console.error("Error fetching match stats:", error);
        return {
          totalMatches: 0,
          matchesWon: 0,
          winRate: 0,
          matchesLost: 0,
          singlesMatches: 0,
          doublesMatches: 0,
          currentWinStreak: 0,
          bestWinStreak: 0
        };
      }
    },
    enabled: !!user,
  });

  // Fetch recent matches
  const { data: recentMatches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ["/api/match/recent", user?.id],
    queryFn: async () => {
      try {
        return await matchSDK.getRecentMatches(undefined, 20);
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchMatches();
  };

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('nav.matches')} {t('training.history')}</h1>
            <p className="text-muted-foreground">
              Comprehensive match analytics and performance tracking
            </p>
          </div>
          
          <Button onClick={handleRefreshAll} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{matchStats?.totalMatches || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{matchStats?.winRate || 0}%</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{matchStats?.currentWinStreak || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{matchStats?.bestWinStreak || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Match History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            {matchesLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <MatchHistory 
                matches={recentMatches} 
                userId={user?.id}
                showFilters={true}
                showTrends={false}
                onMatchesRefresh={refetchMatches}
                className="mt-0"
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Format Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Singles Matches</span>
                      <Badge variant="outline">{matchStats?.singlesMatches || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Doubles Matches</span>
                      <Badge variant="outline">{matchStats?.doublesMatches || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Matches Won</span>
                      <Badge variant="secondary">{matchStats?.matchesWon || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Matches Lost</span>
                      <Badge variant="outline">{matchStats?.matchesLost || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            {recentMatches && recentMatches.length > 0 ? (
              <MatchTrends matches={recentMatches} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Trend Data Available</h3>
                  <p className="text-muted-foreground">
                    Record more matches to see your performance trends and analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}