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
  metadata?: any;
}

interface SocialPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'achievement' | 'match_result' | 'challenge_completion' | 'milestone';
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  achievement?: {
    name: string;
    badge: string;
    tier: string;
  };
}

interface MentorshipRequest {
  id: string;
  from: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  to: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
  skillAreas: string[];
}

interface EnhancedSocialHubProps {
  userId: number;
  onSendFriendRequest?: (userId: string) => void;
  onAcceptMentorship?: (requestId: string) => void;
  onShareAchievement?: (achievementId: string) => void;
}

export default function EnhancedSocialHub({
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
      // Mock data for demonstration
      const mockFriends: Friend[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: '/uploads/profiles/avatar-1.jpg',
          isOnline: true,
          mutualFriends: 5,
          commonInterests: ['Competitive Play', 'Strategy'],
          stats: {
            level: 15,
            totalPicklePoints: 12450,
            achievements: 28,
            winRate: 73
          },
          recentActivity: [
            {
              id: 'act1',
              type: 'achievement',
              description: 'Earned "Serve Master" achievement',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
          ],
          relationship: 'friend'
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          avatar: '/uploads/profiles/avatar-2.jpg',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000),
          mutualFriends: 3,
          commonInterests: ['Social Play', 'Training'],
          stats: {
            level: 12,
            totalPicklePoints: 8900,
            achievements: 19,
            winRate: 68
          },
          relationship: 'friend'
        },
        {
          id: '3',
          name: 'Alex Johnson',
          avatar: '/uploads/profiles/avatar-3.jpg',
          isOnline: true,
          mutualFriends: 0,
          commonInterests: ['Beginner Friendly'],
          stats: {
            level: 8,
            totalPicklePoints: 4200,
            achievements: 12,
            winRate: 55
          },
          relationship: 'suggested'
        }
      ];

      const mockSocialFeed: SocialPost[] = [
        {
          id: '1',
          author: {
            id: '1',
            name: 'Sarah Chen',
            avatar: '/uploads/profiles/avatar-1.jpg'
          },
          type: 'achievement',
          content: 'Just unlocked the Serve Master achievement! 25 aces in competitive matches 🎾',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          likes: 12,
          comments: 3,
          isLiked: false,
          achievement: {
            name: 'Serve Master',
            badge: 'serve-master-gold',
            tier: 'gold'
          }
        },
        {
          id: '2',
          author: {
            id: '2',
            name: 'Mike Rodriguez',
            avatar: '/uploads/profiles/avatar-2.jpg'
          },
          type: 'match_result',
          content: 'Great match today! Won 11-9, 11-7 against a tough opponent. The serve practice is paying off!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likes: 8,
          comments: 2,
          isLiked: true
        },
        {
          id: '3',
          author: {
            id: '4',
            name: 'Coach Elena',
            avatar: '/uploads/profiles/coach-elena.jpg'
          },
          type: 'challenge_completion',
          content: 'Completed the Weekly Consistency Challenge! 7 days of practice in a row. Remember, consistency beats intensity!',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          likes: 24,
          comments: 8,
          isLiked: false
        }
      ];

      const mockMentorshipRequests: MentorshipRequest[] = [
        {
          id: '1',
          from: {
            id: '5',
            name: 'Emma Wilson',
            avatar: '/uploads/profiles/avatar-5.jpg',
            level: 6
          },
          to: {
            id: userId.toString(),
            name: 'You',
            level: 12
          },
          message: 'Hi! I\'ve been following your progress and would love to learn from your serve technique. Would you be open to mentoring me?',
          status: 'pending',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          skillAreas: ['Serving', 'Court Positioning']
        }
      ];

      setFriends(mockFriends);
      setSocialFeed(mockSocialFeed);
      setMentorshipRequests(mockMentorshipRequests);
      setIsLoading(false);
    };

    loadSocialData();
  }, [userId]);

  const toggleLike = (postId: string) => {
    setSocialFeed(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-3 h-3 text-yellow-500" />;
      case 'match': return <Target className="w-3 h-3 text-blue-500" />;
      case 'challenge': return <Star className="w-3 h-3 text-purple-500" />;
      case 'level_up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'badge': return <Award className="w-3 h-3 text-orange-500" />;
      default: return <Zap className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.commonInterests.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Enhanced Social Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="mentorship">
              Mentorship
              {mentorshipRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {mentorshipRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <div className="space-y-4">
              {socialFeed.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{post.author.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {post.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {post.content}
                      </p>
                      
                      {post.achievement && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">
                            {post.achievement.name}
                          </span>
                          <Badge variant="outline" className="text-xs bg-white">
                            {post.achievement.tier}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Find Friends
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFriends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {friend.name}
                        {friend.stats.level >= 15 && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        Level {friend.stats.level} • {friend.stats.totalPicklePoints.toLocaleString()} Pickle Points
                      </div>
                      {!friend.isOnline && friend.lastSeen && (
                        <div className="text-xs text-muted-foreground">
                          Last seen {formatTimeAgo(friend.lastSeen)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{friend.stats.achievements}</div>
                      <div className="text-xs text-muted-foreground">Achievements</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{friend.stats.winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="text-sm font-semibold">{friend.mutualFriends}</div>
                      <div className="text-xs text-muted-foreground">Mutual</div>
                    </div>
                  </div>

                  {friend.commonInterests.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Common Interests:</div>
                      <div className="flex flex-wrap gap-1">
                        {friend.commonInterests.slice(0, 2).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {friend.recentActivity && friend.recentActivity.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Recent Activity:</div>
                      <div className="flex items-center gap-2 text-xs">
                        {getActivityIcon(friend.recentActivity[0].type)}
                        <span className="truncate">{friend.recentActivity[0].description}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {friend.relationship === 'friend' ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View Profile
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => onSendFriendRequest?.(friend.id)}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Add Friend
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Discover New Players</h3>
              <p className="text-muted-foreground mb-4">
                Find players with similar interests and skill levels
              </p>
              <Button className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Start Discovering
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-4">
            {mentorshipRequests.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Mentorship Program</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with experienced players or help newcomers improve their game
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">Find a Mentor</Button>
                  <Button>Become a Mentor</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Mentorship Requests</h3>
                {mentorshipRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.from.avatar} />
                        <AvatarFallback>{request.from.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {request.from.name} 
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            Level {request.from.level}
                          </span>
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.message}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.skillAreas.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(request.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onAcceptMentorship?.(request.id)}
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Decline
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}