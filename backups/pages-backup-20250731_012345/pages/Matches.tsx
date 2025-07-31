/**
 * Matches Page - Match Recording and History Hub
 * Modernized design following dashboard style with enhanced UI/UX
 */

import React, { useState } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Trophy, 
  Clock, 
  Target, 
  Plus,
  Activity,
  TrendingUp,
  Users,
  Star,
  ChevronRight
} from 'lucide-react';
import { QuickMatchRecorder } from '@/components/match/QuickMatchRecorder';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { matchSDK } from '@/lib/sdk/matchSDK';
import { useAuth } from '@/lib/auth';

export default function Matches() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);

  // Fetch recent match stats for preview
  const { data: matchStats, isLoading: statsLoading } = useQuery({
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
          currentWinStreak: 0
        };
      }
    },
    enabled: !!user,
  });

  // Fetch recent matches for preview
  const { data: recentMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/match/recent", user?.id],
    queryFn: async () => {
      try {
        return await matchSDK.getRecentMatches(undefined, 3);
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  const handleMatchRecorded = () => {
    setMatchDialogOpen(false);
    toast({
      title: "Match Recorded",
      description: "Your match has been successfully recorded",
    });
  };

  const handleRecordMatch = () => {
    setMatchDialogOpen(true);
  };

  const handleViewHistory = () => {
    navigate('/match-history');
  };

  const handleViewStats = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20">
      <StandardLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Modern Header Section */}
          <div className="mb-8 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{t('nav.matches')}</h1>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-lg">
                    Record matches, track performance, and analyze your game
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={handleRecordMatch} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-5 w-5" />
                {t('match.record')}
              </Button>
            </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-blue-950/80 dark:to-indigo-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Matches</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {statsLoading ? "..." : matchStats?.totalMatches || 0}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-emerald-100/80 dark:from-green-950/80 dark:to-emerald-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Win Rate</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {statsLoading ? "..." : `${matchStats?.winRate || 0}%`}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-violet-100/80 dark:from-purple-950/80 dark:to-violet-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Current Streak</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {statsLoading ? "..." : matchStats?.currentWinStreak || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-orange-50/80 to-amber-100/80 dark:from-orange-950/80 dark:to-amber-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Matches Won</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {statsLoading ? "..." : matchStats?.matchesWon || 0}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-primary" />
                  Detailed Match History
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View comprehensive match analytics, performance trends, and detailed statistics.
              </p>
              <Button variant="outline" onClick={handleViewHistory} className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Detailed Match History
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Performance Analytics
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access your complete performance dashboard with rankings and progress tracking.
              </p>
              <Button variant="outline" onClick={handleViewStats} className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Performance Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="h-6 w-6 mr-3 text-primary" />
                Recent Matches
              </div>
              {recentMatches && recentMatches.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleViewHistory} className="text-primary hover:text-primary/80">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-muted rounded" />
                        <div className="w-24 h-3 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : recentMatches && recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.slice(0, 3).map((match, index) => (
                  <div key={match.id || index} className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {match.formatType === 'singles' ? 'Singles Match' : 'Doubles Match'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={match.players?.find(p => p.userId === user?.id)?.isWinner ? "default" : "secondary"}>
                        {match.players?.find(p => p.userId === user?.id)?.isWinner ? "Won" : "Lost"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Matches Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your pickleball journey by recording your first match
                </p>
                <Button onClick={handleRecordMatch} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Record Your First Match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Recording Dialog */}
        <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Match Results</DialogTitle>
            </DialogHeader>
            <QuickMatchRecorder onSuccess={handleMatchRecorded} />
          </DialogContent>
        </Dialog>
        </div>
      </StandardLayout>
    </div>
  );
}