/**
 * PKL-278651-COMM-0021-ENGAGE
 * Engagement Badges Component
 * 
 * Displays engagement badges that users can earn through participation
 * in community activities. Shows badge progress and requirements.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Calendar, Check, Clock, FileText, Lock, MessageSquare, Star, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EngagementBadgesProps {
  communityId: number;
  userId?: number; // If not provided, shows current user's badges
}

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  requirementType: string;
  requirementValue: number;
  category: string;
  isEarned: boolean;
  progress: number;
  earnedAt: string | null;
}

const defaultBadges = [
  {
    category: 'Posts',
    badges: [
      { name: 'First Post', requirementValue: 1, icon: <FileText className="h-5 w-5" /> },
      { name: 'Regular Poster', requirementValue: 5, icon: <FileText className="h-5 w-5" /> },
      { name: 'Content Creator', requirementValue: 15, icon: <FileText className="h-5 w-5" /> },
      { name: 'Influential Author', requirementValue: 30, icon: <FileText className="h-5 w-5" /> },
    ]
  },
  {
    category: 'Comments',
    badges: [
      { name: 'First Comment', requirementValue: 1, icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Active Commenter', requirementValue: 10, icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Conversation Starter', requirementValue: 25, icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Community Voice', requirementValue: 50, icon: <MessageSquare className="h-5 w-5" /> },
    ]
  },
  {
    category: 'Events',
    badges: [
      { name: 'Event Participant', requirementValue: 1, icon: <Calendar className="h-5 w-5" /> },
      { name: 'Regular Attendee', requirementValue: 5, icon: <Calendar className="h-5 w-5" /> },
      { name: 'Event Enthusiast', requirementValue: 10, icon: <Calendar className="h-5 w-5" /> },
      { name: 'Event Champion', requirementValue: 15, icon: <Calendar className="h-5 w-5" /> },
    ]
  },
  {
    category: 'Consistency',
    badges: [
      { name: '3-Day Streak', requirementValue: 3, icon: <Clock className="h-5 w-5" /> },
      { name: 'Weekly Dedication', requirementValue: 7, icon: <Clock className="h-5 w-5" /> },
      { name: 'Monthly Commitment', requirementValue: 30, icon: <Clock className="h-5 w-5" /> },
      { name: 'Season Veteran', requirementValue: 90, icon: <Clock className="h-5 w-5" /> },
    ]
  }
];

const EngagementBadges: React.FC<EngagementBadgesProps> = ({ communityId, userId }) => {
  // Fetch user's badges and progress
  const { data: badgesData, isLoading } = useQuery({
    queryKey: ['/api/communities', communityId, 'engagement', 'badges', userId],
    queryFn: async () => {
      try {
        const endpoint = userId
          ? `/api/communities/${communityId}/engagement/badges/${userId}`
          : `/api/communities/${communityId}/engagement/badges/me`;
          
        const res = await apiRequest('GET', endpoint);
        
        if (!res.ok) {
          // API may not be implemented yet, return default data with no earned badges
          return generateDefaultBadgesData();
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching badges:', error);
        // Return default data if API fails
        return generateDefaultBadgesData();
      }
    }
  });
  
  // Generate default badges data with no progress (for initial implementation)
  const generateDefaultBadgesData = () => {
    // Flatten the default badges array and add missing properties
    return defaultBadges.flatMap(category => 
      category.badges.map((badge, index) => ({
        id: `${category.category}-${index}`,
        name: badge.name,
        description: `Earn this badge by completing ${badge.requirementValue} ${category.category.toLowerCase()}`,
        imageUrl: null,
        requirementType: category.category.toLowerCase(),
        requirementValue: badge.requirementValue,
        category: category.category,
        isEarned: false,
        progress: 0,
        earnedAt: null,
        icon: badge.icon
      }))
    );
  };
  
  // Group badges by category
  const groupedBadges = React.useMemo(() => {
    if (!badgesData) return [];
    
    const grouped: Record<string, any[]> = {};
    
    badgesData.forEach((badge: any) => {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    });
    
    return Object.entries(grouped).map(([category, badges]) => ({
      category,
      badges
    }));
  }, [badgesData]);
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Engagement Badges
        </CardTitle>
        <CardDescription>
          Earn badges through your participation in this community
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array(4).fill(0).map((_, j) => (
                    <Skeleton key={j} className="h-24 w-full rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {defaultBadges.map((category) => (
              <div key={category.category} className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {category.category}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {category.badges.map((badge, index) => {
                    // Find matching badge in actual data if available
                    const actualBadge = badgesData?.find((b: any) => 
                      b.name === badge.name || (b.category === category.category && b.requirementValue === badge.requirementValue)
                    );
                    
                    const isEarned = actualBadge?.isEarned || false;
                    const progress = actualBadge?.progress || 0;
                    const requirementValue = badge.requirementValue;
                    const progressPercent = Math.min(100, Math.round((progress / requirementValue) * 100)) || 0;
                    
                    return (
                      <TooltipProvider key={badge.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`border rounded-md p-3 flex flex-col items-center justify-center text-center h-28 
                                ${isEarned 
                                  ? 'bg-primary/10 border-primary/30' 
                                  : 'bg-muted/30 hover:bg-muted/50'
                                }`}
                            >
                              <div className={`relative mb-1 ${!isEarned && 'text-muted-foreground'}`}>
                                {badge.icon || <Award className="h-8 w-8" />}
                                {isEarned && (
                                  <span className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5">
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm font-medium ${!isEarned && 'text-muted-foreground'}`}>
                                {badge.name}
                              </p>
                              <Progress 
                                value={progressPercent} 
                                className="h-1.5 w-full mt-2" 
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 max-w-xs">
                              <p className="font-semibold">{badge.name}</p>
                              <p className="text-xs">
                                {`Complete ${requirementValue} ${category.category.toLowerCase()}`}
                              </p>
                              <div className="flex justify-between items-center text-xs mt-1">
                                <span>{progress} / {requirementValue}</span>
                                <span>{progressPercent}%</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4 text-sm text-muted-foreground">
        <p>Continue participating to earn more badges and rewards</p>
      </CardFooter>
    </Card>
  );
};

export default EngagementBadges;