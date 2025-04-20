/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Leaderboard Component
 * 
 * Displays the community leaderboard with different time periods and types.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Calendar, Clock, TrendingUp, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommunityLeaderboardProps {
  communityId: number;
}

interface LeaderboardEntry {
  id: number;
  userId: number;
  communityId: number;
  leaderboardType: string;
  points: number;
  rank: number;
  timePeriod: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface UserPosition {
  rank: number;
  total: number;
  points: number;
}

const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({ communityId }) => {
  const [activeType, setActiveType] = useState<string>('overall');
  const [timePeriod, setTimePeriod] = useState<string>('week');
  const { user } = useAuth();
  
  // Get leaderboard data
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'leaderboard', activeType, timePeriod],
    queryFn: async () => {
      const res = await apiRequest(
        'GET',
        `/api/communities/${communityId}/engagement/leaderboard?type=${activeType}&period=${timePeriod}`
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });
  
  // Get current user position if logged in
  const { data: userPosition, isLoading: isLoadingPosition } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'leaderboard', 'position', activeType, timePeriod],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const res = await apiRequest(
          'GET',
          `/api/communities/${communityId}/engagement/leaderboard/position?type=${activeType}&period=${timePeriod}`
        );
        
        if (!res.ok) {
          if (res.status === 404) {
            console.log('User not found in leaderboard');
            return null;
          }
          throw new Error(`Failed to fetch position: ${res.status}`);
        }
        
        return await res.json() as UserPosition;
      } catch (error) {
        console.error('Error fetching user position:', error);
        return null;
      }
    },
    enabled: !!user
  });
  
  // Time period options
  const timePeriodOptions = [
    { value: 'day', label: 'Today', icon: <Clock className="h-4 w-4" /> },
    { value: 'week', label: 'This Week', icon: <Calendar className="h-4 w-4" /> },
    { value: 'month', label: 'This Month', icon: <Calendar className="h-4 w-4" /> },
    { value: 'all-time', label: 'All Time', icon: <TrendingUp className="h-4 w-4" /> }
  ];
  
  // Leaderboard type icons
  const typeIcons = {
    overall: <Trophy className="h-4 w-4" />,
    posts: <TrendingUp className="h-4 w-4" />,
    comments: <Users className="h-4 w-4" />,
    events: <Calendar className="h-4 w-4" />
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>
          See top contributors and your ranking in the community
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overall">
                <Trophy className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Overall</span>
              </TabsTrigger>
              <TabsTrigger value="posts">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="comments">
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Comments</span>
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Events</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="mb-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {user && userPosition && (
          <div className="border rounded-lg p-3 mb-4 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || ''} />
                <AvatarFallback>
                  {user.firstName?.[0] || user.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Your Position</p>
                <div className="text-sm text-muted-foreground">
                  {userPosition.rank === 0 
                    ? 'Not ranked yet'
                    : `Rank #${userPosition.rank} of ${userPosition.total}`
                  }
                </div>
              </div>
            </div>
            <Badge variant="outline" className="font-bold">
              {userPosition.points} points
            </Badge>
          </div>
        )}
        
        {isLoading ? (
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
            {leaderboard?.map((entry: LeaderboardEntry, index) => (
              <div 
                key={entry.id} 
                className={`flex items-center p-2 rounded transition-colors ${
                  user && entry.userId === user.id 
                    ? 'bg-primary/10 hover:bg-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-8 text-center font-semibold text-muted-foreground">
                  {entry.rank}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.user?.avatarUrl || ''} />
                  <AvatarFallback>
                    {entry.user?.firstName?.[0] || entry.user?.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">
                    {entry.user?.firstName 
                      ? `${entry.user.firstName} ${entry.user.lastName || ''}`
                      : entry.user?.username || 'Unknown user'}
                  </p>
                </div>
                <div className="ml-auto font-semibold">
                  {entry.points} {entry.points === 1 ? 'point' : 'points'}
                </div>
              </div>
            ))}
            
            {(!leaderboard || leaderboard.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No entries in this leaderboard yet</p>
                <p className="text-sm">Be the first to contribute!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityLeaderboard;