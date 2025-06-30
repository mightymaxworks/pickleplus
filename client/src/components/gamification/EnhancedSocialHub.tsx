import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Search,
  TrendingUp,
  Trophy,
  Star,
  Clock,
  Target,
  Heart,
  Share2,
  Award,
  Crown,
  Zap,
  Eye,
  ThumbsUp
} from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  mutualFriends: number;
  commonInterests: string[];
  stats: {
    level: number;
    totalPicklePoints: number;
    achievements: number;
    winRate: number;
  };
  recentActivity?: FriendActivity[];
  isFollowing?: boolean;
  relationship: 'friend' | 'following' | 'follower' | 'suggested';
}

interface FriendActivity {
  id: string;
  type: 'achievement' | 'match' | 'challenge' | 'level_up' | 'badge';
  description: string;
  timestamp: Date;
  picklePoints?: number;
}

interface SocialPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'achievement' | 'match_result' | 'challenge_completion' | 'level_up' | 'community_event';
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  achievement?: {
    name: string;
    badge: string;
    tier: string;
  };
  challenge?: {
    name: string;
    picklePointsEarned: number;
  };
}

interface MentorshipRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    rating: number;
  };
  type: 'seeking_mentor' | 'offering_mentorship';
  focus: string[];
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

interface EnhancedSocialHubProps {
  userId: number;
  onSendFriendRequest?: (userId: string) => void;
  onAcceptMentorship?: (requestId: string) => void;
  onShareAchievement?: (achievementId: string) => void;
}

export function EnhancedSocialHub({
  userId,
  onSendFriendRequest,
  onAcceptMentorship,
  onShareAchievement
}: EnhancedSocialHubProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'discover' | 'mentorship'>('feed');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSocialData = async () => {
      try {
        // For now, show empty state until real social features are implemented
        setFriends([]);
        setSocialFeed([]);
        setMentorshipRequests([]);
      } catch (error) {
        console.error('Error loading social data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialData();
  }, []);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>No {type} available yet</p>
      <p className="text-sm">Social features are coming soon!</p>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading social features...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <EmptyState type="posts" />
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <EmptyState type="friends" />
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <EmptyState type="suggested players" />
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-4">
            <EmptyState type="mentorship opportunities" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}