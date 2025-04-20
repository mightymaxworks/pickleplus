/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Metrics Component
 * 
 * This component displays engagement metrics for a community, including:
 * - Top contributors
 * - Recent activities
 * - Activity summary
 * - Engagement levels
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Star, TrendingUp, Users, Award, FileText, Activity, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityEngagementMetricsProps {
  communityId: number;
}

interface Activity {
  id: number;
  userId: number;
  communityId: number;
  activityType: string;
  activityData: any;
  points: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Contributor {
  id: number;
  userId: number;
  communityId: number;
  totalPoints: number;
  totalActivities: number;
  engagementLevel: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface EngagementLevel {
  id: number;
  communityId: number;
  levelName: string;
  pointThreshold: number;
  description: string | null;
  benefits: string[] | null;
  badgeImageUrl: string | null;
}

interface UserEngagement {
  metrics: {
    id: number;
    userId: number;
    communityId: number;
    totalPoints: number;
    totalActivities: number;
    engagementLevel: string;
    postCount: number;
    commentCount: number;
    eventAttendance: number;
    streakDays: number;
  };
  currentLevel: EngagementLevel | null;
  nextLevel: EngagementLevel | null;
  pointsToNextLevel: number;
}

const CommunityEngagementMetrics: React.FC<CommunityEngagementMetricsProps> = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState('top-contributors');
  const { toast } = useToast();
  
  // Get top contributors for the community
  const { data: topContributors, isLoading: isLoadingContributors } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'top-contributors'],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          'GET', 
          `/api/communities/${communityId}/engagement/top-contributors?limit=10`
        );
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching contributors:', error);
        return [];
      }
    }
  });
  
  // Get recent activities in the community
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'recent-activities'],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          'GET', 
          `/api/communities/${communityId}/engagement/recent-activities?limit=10`
        );
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
    }
  });
  
  // Get engagement levels for the community
  const { data: engagementLevels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'levels'],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          'GET', 
          `/api/communities/${communityId}/engagement/levels`
        );
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching engagement levels:', error);
        return [];
      }
    }
  });
  
  // Get current user's engagement metrics
  const { data: userEngagement, isLoading: isLoadingUserEngagement } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'me'],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          'GET', 
          `/api/communities/${communityId}/engagement/me`
        );
        
        // Check if the response is successful
        if (!res.ok) {
          if (res.status === 404) {
            console.log('User engagement metrics not found - user may be new to community');
            return null;
          }
          throw new Error(`Failed to fetch user engagement: ${res.status}`);
        }
        
        return await res.json() as UserEngagement;
      } catch (error) {
        console.error('Error fetching user engagement metrics:', error);
        // User might not be authenticated or not a member yet
        return null;
      }
    }
  });
  
  // Activity type icons and labels
  const activityTypeIcons: Record<string, React.ReactNode> = {
    POST_CREATED: <FileText className="w-4 h-4" />,
    COMMENT_ADDED: <MessageSquare className="w-4 h-4" />,
    EVENT_CREATED: <Calendar className="w-4 h-4" />,
    EVENT_ATTENDED: <Users className="w-4 h-4" />,
    REACTION_ADDED: <Star className="w-4 h-4" />,
    RESOURCE_SHARED: <FileText className="w-4 h-4" />,
    QUESTION_ASKED: <MessageSquare className="w-4 h-4" />,
    QUESTION_ANSWERED: <MessageSquare className="w-4 h-4" />,
    POLL_CREATED: <Activity className="w-4 h-4" />,
    POLL_VOTED: <Activity className="w-4 h-4" />
  };
  
  const activityTypeLabels: Record<string, string> = {
    POST_CREATED: 'created a post',
    COMMENT_ADDED: 'commented on a post',
    EVENT_CREATED: 'created an event',
    EVENT_ATTENDED: 'attended an event',
    REACTION_ADDED: 'reacted to a post',
    RESOURCE_SHARED: 'shared a resource',
    QUESTION_ASKED: 'asked a question',
    QUESTION_ANSWERED: 'answered a question',
    POLL_CREATED: 'created a poll',
    POLL_VOTED: 'voted on a poll'
  };
  
  // Mutation to record a community activity
  const recordActivityMutation = useMutation({
    mutationFn: async (data: { activityType: string, activityData?: Record<string, any> }) => {
      const res = await apiRequest(
        'POST',
        `/api/communities/${communityId}/engagement/activity`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/communities', communityId, 'engagement'] });
      toast({
        title: 'Activity recorded',
        description: 'Your activity in this community has been recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to record activity',
        description: 'There was a problem recording your activity.',
        variant: 'destructive',
      });
    }
  });
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Community Engagement
        </CardTitle>
        <CardDescription>
          Track participation, view top contributors, and increase your engagement level
        </CardDescription>
      </CardHeader>
      
      {!isLoadingUserEngagement && (
        userEngagement ? (
          // User has engagement data
          <CardContent className="border rounded-lg p-4 mb-4 bg-muted/30">
            <div className="flex items-center gap-4 mb-3">
              <div>
                <h4 className="font-semibold">Your Engagement</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-semibold">
                    {userEngagement?.currentLevel?.levelName || 'Newcomer'}
                  </Badge>
                  <span className="text-xs">•</span>
                  <span>{userEngagement?.metrics?.totalPoints || 0} points</span>
                </div>
              </div>
              
              {userEngagement?.nextLevel && (
                <div className="ml-auto text-right">
                  <span className="text-xs text-muted-foreground">Next level: {userEngagement.nextLevel.levelName}</span>
                  <Progress 
                    value={Math.round(
                      ((userEngagement?.metrics?.totalPoints || 0) - (userEngagement?.currentLevel?.pointThreshold || 0)) / 
                      Math.max(1, (userEngagement.nextLevel.pointThreshold - (userEngagement?.currentLevel?.pointThreshold || 0))) * 100
                    )} 
                    className="w-32 h-2" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {userEngagement.pointsToNextLevel || 0} points needed
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2 text-center">
              <div className="space-y-1">
                <span className="text-sm font-semibold">{userEngagement?.metrics?.totalActivities || 0}</span>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">{userEngagement?.metrics?.postCount || 0}</span>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">{userEngagement?.metrics?.commentCount || 0}</span>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">{userEngagement?.metrics?.streakDays || 0}</span>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
          </CardContent>
        ) : (
          // New user without engagement data yet
          <CardContent className="border rounded-lg p-4 mb-4 bg-muted/30">
            <div className="flex items-center gap-4 mb-3">
              <div>
                <h4 className="font-semibold">Your Engagement</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-semibold">
                    Newcomer
                  </Badge>
                  <span className="text-xs">•</span>
                  <span>0 points</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2 text-center">
              <div className="space-y-1">
                <span className="text-sm font-semibold">0</span>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">0</span>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">0</span>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold">0</span>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button size="sm" variant="outline" className="text-xs">
                Start Engaging
              </Button>
            </div>
          </CardContent>
        )
      )}
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="top-contributors">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Top Contributors</span>
              <span className="inline md:hidden">Top</span>
            </TabsTrigger>
            <TabsTrigger value="recent-activities">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Recent Activities</span>
              <span className="inline md:hidden">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="engagement-levels">
              <Award className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Engagement Levels</span>
              <span className="inline md:hidden">Levels</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="top-contributors" className="mt-0">
            {isLoadingContributors ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-14" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {topContributors?.map((contributor, index) => (
                  <div 
                    key={contributor.id} 
                    className="flex items-center p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 text-center font-semibold text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contributor.user?.avatarUrl || ''} />
                      <AvatarFallback>
                        {contributor.user?.firstName?.[0] || contributor.user?.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">
                        {contributor.user?.firstName 
                          ? `${contributor.user.firstName} ${contributor.user.lastName || ''}`
                          : contributor.user?.username || 'Unknown user'}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {contributor.engagementLevel}
                        </Badge>
                        <span className="ml-2">{contributor.totalActivities} activities</span>
                      </div>
                    </div>
                    <div className="ml-auto font-semibold">
                      {contributor.totalPoints} points
                    </div>
                  </div>
                ))}
                
                {(!topContributors || topContributors.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No contributors yet</p>
                    <p className="text-sm">Be the first to contribute to this community!</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent-activities" className="mt-0">
            {isLoadingActivities ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-2 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[120px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user?.avatarUrl || ''} />
                      <AvatarFallback>
                        {activity.user?.firstName?.[0] || activity.user?.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user?.firstName 
                            ? `${activity.user.firstName} ${activity.user.lastName || ''}`
                            : activity.user?.username || 'Unknown user'}
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {activityTypeLabels[activity.activityType] || activity.activityType.toLowerCase()}
                        </span>
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <div className="flex items-center mr-2">
                          {activityTypeIcons[activity.activityType] || <Activity className="w-3 h-3 mr-1" />}
                          <span className="ml-1">+{activity.points} points</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="w-3 h-3 mr-1" />
                          <span>
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!recentActivities || recentActivities.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No recent activities</p>
                    <p className="text-sm">Activity will appear here as community members engage</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="engagement-levels" className="mt-0">
            {isLoadingLevels ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-5 w-[140px]" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-3 w-[60px]" />
                    </div>
                    <Skeleton className="h-2 w-full mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {engagementLevels && engagementLevels.length > 0 ? (
                  engagementLevels.sort((a, b) => a.pointThreshold - b.pointThreshold).map((level, index) => (
                    <div 
                      key={level.id} 
                      className={`p-3 rounded-lg border ${userEngagement?.currentLevel?.id === level.id 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-card'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={userEngagement?.currentLevel?.id === level.id ? "default" : "outline"} 
                            className="px-2 py-0.5"
                          >
                            {level.levelName}
                          </Badge>
                          
                          {userEngagement?.currentLevel?.id === level.id && (
                            <Badge variant="secondary" className="text-xs">Your level</Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{level.pointThreshold}+ points</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {level.description || `${level.levelName} community members`}
                      </p>
                      
                      {level.benefits && level.benefits.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Benefits:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {level.benefits.map((benefit: string, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {index < (engagementLevels.length - 1) && (
                        <div className="mt-3 flex items-center text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>
                            Need {engagementLevels[index + 1].pointThreshold - level.pointThreshold} more points 
                            to reach {engagementLevels[index + 1].levelName}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No engagement levels defined</p>
                    <p className="text-sm">Levels will appear here when they are defined</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Engage with the community to earn points and increase your level
        </p>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('engagement-levels')}>
          <Award className="w-4 h-4 mr-2" />
          View levels
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityEngagementMetrics;