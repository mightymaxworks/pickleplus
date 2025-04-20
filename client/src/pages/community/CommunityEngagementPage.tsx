/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Page
 * 
 * Displays community engagement features including leaderboards,
 * badges, and activity metrics.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import CommunityLeaderboard from '@/components/community/CommunityLeaderboard';
import EngagementBadges from '@/components/community/EngagementBadges';
import CommunityEngagementMetrics from '@/components/community/CommunityEngagementMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Award, BarChart, Clock, TrendingUp, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { ActivityData } from '@shared/schema/community-engagement';

const CommunityEngagementPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const communityIdNum = parseInt(communityId);
  
  // Get community details
  const { data: community, isLoading: loadingCommunity } = useQuery({
    queryKey: ['/api/communities', communityIdNum],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/communities/${communityIdNum}`);
      return await res.json();
    },
    enabled: !isNaN(communityIdNum)
  });
  
  // Get activity stats
  const { data: activityStats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/communities', communityIdNum, 'engagement', 'summary'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/communities/${communityIdNum}/engagement/summary`);
        return await res.json();
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        return {
          total_activities: 0,
          post_created: 0,
          comment_added: 0,
          event_attended: 0,
          active_members: 0
        };
      }
    },
    enabled: !isNaN(communityIdNum)
  });
  
  // Get activity trends
  const { data: activityTrends, isLoading: loadingTrends } = useQuery<ActivityData[]>({
    queryKey: ['/api/communities', communityIdNum, 'engagement', 'trends'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/communities/${communityIdNum}/engagement/trends`);
        return await res.json();
      } catch (error) {
        console.error('Error fetching activity trends:', error);
        return [];
      }
    },
    enabled: !isNaN(communityIdNum)
  });
  
  // Format recent dates for the activity chart
  const formatRecentDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  // Prepare activity chart data
  const activityChartData: ActivityData[] = React.useMemo(() => {
    if (!activityTrends || activityTrends.length === 0) {
      // Return empty data for each of the last 7 days
      return formatRecentDates().map(date => ({
        date,
        count: 0
      }));
    }
    
    // Map the API data to the chart format
    return activityTrends;
  }, [activityTrends]);
  
  return (
    <>
      {loadingCommunity ? (
        <div className="container my-6 space-y-4">
          <Skeleton className="h-12 w-3/4 max-w-lg" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ) : (
        <CommunityHeader 
          community={community} 
          currentTab="engagement"
        />
      )}
      
      <div className="container my-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="mr-2 h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Total Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      activityStats?.total_activities || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">All community interactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Posts Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      activityStats?.post_created || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Content shared by members</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Active Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      activityStats?.active_members || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Members who contribute</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Last 7 Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingTrends ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      activityChartData
                        .filter((d: ActivityData) => new Date(d.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .reduce((sum: number, day: ActivityData) => sum + day.count, 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Recent activity volume</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Activity Trends
                  </CardTitle>
                  <CardDescription>
                    Community engagement over the past 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTrends ? (
                    <div className="w-full h-64 flex items-center justify-center">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  ) : (
                    <div className="w-full h-64 relative">
                      {activityChartData.length > 0 ? (
                        // Simple chart visualization 
                        <div className="flex items-end justify-between h-48 w-full gap-2">
                          {activityChartData.slice(-7).map((day: ActivityData, i: number) => {
                            const maxValue = Math.max(...activityChartData.map((d: ActivityData) => d.count), 5);
                            const heightPercent = day.count ? (day.count / maxValue) * 100 : 0;
                            
                            return (
                              <div key={i} className="flex flex-col items-center justify-end flex-1">
                                <div 
                                  className="bg-primary/80 w-full rounded-t-sm transition-all duration-500 ease-out"
                                  style={{ height: `${heightPercent}%` }}
                                />
                                <div className="text-xs mt-2 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <BarChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>No activity data available yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Top Contributors
                  </CardTitle>
                  <CardDescription>
                    Most active community members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Simplified mini version of the leaderboard */}
                  <div className="space-y-3">
                    <CommunityLeaderboard 
                      communityId={communityIdNum}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <div className="space-y-6">
              <CommunityEngagementMetrics communityId={communityIdNum} />
              <CommunityLeaderboard communityId={communityIdNum} />
            </div>
          </TabsContent>
          
          <TabsContent value="badges">
            <div className="space-y-6">
              <CommunityEngagementMetrics communityId={communityIdNum} />
              <EngagementBadges communityId={communityIdNum} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CommunityEngagementPage;