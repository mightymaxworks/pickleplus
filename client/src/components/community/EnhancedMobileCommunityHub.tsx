/**
 * Enhanced Mobile Community Hub - PKL-278651 Social Engagement Interface
 * Modern community features with social sharing, challenges, and group activities
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Trophy, 
  Calendar,
  MapPin,
  Star,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Fire,
  Award,
  Target,
  Clock,
  ChevronRight,
  Eye,
  ThumbsUp,
  Flag,
  Bookmark,
  BookmarkCheck,
  Send,
  Smile,
  Image,
  Video,
  Mic,
  Globe,
  Lock,
  Users2,
  Zap,
  Crown,
  Medal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    rank: string;
    verified: boolean;
  };
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  type: 'achievement' | 'match-result' | 'tip' | 'question' | 'event';
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  maxParticipants?: number;
  reward: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLeft: string;
  progress?: number;
  isJoined: boolean;
  category: 'skill' | 'fitness' | 'social' | 'tournament';
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  price?: number;
  difficulty: string;
  isJoined: boolean;
  category: 'social' | 'tournament' | 'training' | 'clinic';
}

export default function EnhancedMobileCommunityHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('feed');
  const [postContent, setPostContent] = useState('');
  const [isPostingVisible, setIsPostingVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch community data
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/community/posts', filter],
    queryFn: async (): Promise<CommunityPost[]> => ([
      {
        id: '1',
        author: {
          name: 'Sarah Champions',
          avatar: '/avatars/sarah.jpg',
          rank: 'Pro Player',
          verified: true
        },
        content: 'Just hit my first perfect game! 11-0, 11-2, 11-1. The mental training really paid off! 🏆',
        images: ['/posts/perfect-game.jpg'],
        timestamp: '2 hours ago',
        likes: 47,
        comments: 12,
        shares: 8,
        isLiked: false,
        isBookmarked: true,
        tags: ['achievement', 'mental-game'],
        type: 'achievement'
      },
      {
        id: '2',
        author: {
          name: 'Mike Strategy',
          avatar: '/avatars/mike.jpg',
          rank: 'Coach',
          verified: true
        },
        content: 'Pro tip: When your opponent loves crosscourt dinks, try the surprise down-the-line attack. Works 80% of the time!',
        timestamp: '4 hours ago',
        likes: 23,
        comments: 7,
        shares: 15,
        isLiked: true,
        isBookmarked: false,
        tags: ['strategy', 'tips'],
        type: 'tip'
      },
      {
        id: '3',
        author: {
          name: 'Local Tournament',
          avatar: '/avatars/tournament.jpg',
          rank: 'Event Organizer',
          verified: true
        },
        content: 'RESULTS: Summer Championship Finals! Amazing matches today. Congratulations to all players! 🎾',
        images: ['/posts/tournament-results.jpg'],
        timestamp: '6 hours ago',
        likes: 89,
        comments: 34,
        shares: 22,
        isLiked: false,
        isBookmarked: false,
        tags: ['tournament', 'results'],
        type: 'match-result'
      }
    ])
  });

  const { data: challenges } = useQuery({
    queryKey: ['/api/community/challenges'],
    queryFn: async (): Promise<CommunityChallenge[]> => ([
      {
        id: '1',
        title: '30-Day Consistency Challenge',
        description: 'Play at least 3 times per week for 30 days',
        participants: 234,
        maxParticipants: 500,
        reward: '500 Pickle Points + Badge',
        difficulty: 'beginner',
        timeLeft: '23 days',
        progress: 60,
        isJoined: true,
        category: 'fitness'
      },
      {
        id: '2',
        title: 'Perfect Serve Challenge',
        description: 'Land 10 consecutive serves in the target zone',
        participants: 89,
        reward: '250 Pickle Points',
        difficulty: 'intermediate',
        timeLeft: '5 days',
        isJoined: false,
        category: 'skill'
      }
    ])
  });

  const { data: events } = useQuery({
    queryKey: ['/api/community/events'],
    queryFn: async (): Promise<CommunityEvent[]> => ([
      {
        id: '1',
        title: 'Weekend Social Tournament',
        description: 'Fun doubles tournament for all skill levels',
        date: '2025-07-19T10:00:00Z',
        location: 'Central Pickleball Club',
        organizer: 'Sarah Johnson',
        attendees: 24,
        maxAttendees: 32,
        price: 25,
        difficulty: 'All Levels',
        isJoined: true,
        category: 'tournament'
      },
      {
        id: '2',
        title: 'Beginner Skills Clinic',
        description: 'Learn the fundamentals with pro coaches',
        date: '2025-07-20T14:00:00Z',
        location: 'North Court Complex',
        organizer: 'Mike Chen',
        attendees: 8,
        maxAttendees: 12,
        price: 40,
        difficulty: 'Beginner',
        isJoined: false,
        category: 'clinic'
      }
    ])
  });

  // Like post mutation
  const likePost = useMutation({
    mutationFn: async ({ postId, liked }: { postId: string, liked: boolean }) => {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/like`, { liked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    }
  });

  // Join challenge mutation
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await apiRequest('POST', `/api/community/challenges/${challengeId}/join`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Joined!",
        description: "You've successfully joined the challenge. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/challenges'] });
    }
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/community/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      setPostContent('');
      setIsPostingVisible(false);
      toast({
        title: "Posted!",
        description: "Your post has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    }
  });

  // Handle post interaction
  const handleLike = (post: CommunityPost) => {
    likePost.mutate({ postId: post.id, liked: !post.isLiked });
  };

  const handleShare = (post: CommunityPost) => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author.name}`,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(post.content);
      toast({
        title: "Copied!",
        description: "Post content copied to clipboard",
      });
    }
  };

  // Render post card
  const renderPostCard = (post: CommunityPost) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Post Header */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{post.author.name}</span>
                {post.author.verified && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    {post.author.rank}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">{post.timestamp}</div>
            </div>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <p className="text-gray-900">{post.content}</p>
            
            {post.images && post.images.length > 0 && (
              <div className="rounded-lg overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Image placeholder</span>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => handleLike(post)}
                className={cn(
                  "flex items-center space-x-1 text-sm",
                  post.isLiked ? "text-red-500" : "text-gray-500"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                <span>{post.likes}</span>
              </motion.button>

              <button className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>

              <motion.button
                onClick={() => handleShare(post)}
                className="flex items-center space-x-1 text-sm text-gray-500"
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </motion.button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Bookmark functionality
                toast({
                  title: post.isBookmarked ? "Bookmark Removed" : "Bookmarked",
                  description: post.isBookmarked ? "Post removed from bookmarks" : "Post saved to bookmarks",
                });
              }}
            >
              {post.isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-orange-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Render challenge card
  const renderChallengeCard = (challenge: CommunityChallenge) => (
    <motion.div
      key={challenge.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4"
    >
      <Card className={cn(
        "border-l-4",
        challenge.difficulty === 'beginner' && "border-l-green-500",
        challenge.difficulty === 'intermediate' && "border-l-yellow-500",
        challenge.difficulty === 'advanced' && "border-l-red-500"
      )}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
              </div>
              <Badge 
                className={cn(
                  "text-xs",
                  challenge.difficulty === 'beginner' && "bg-green-100 text-green-800",
                  challenge.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-800",
                  challenge.difficulty === 'advanced' && "bg-red-100 text-red-800"
                )}
              >
                {challenge.difficulty}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{challenge.participants} joined</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{challenge.timeLeft}</span>
              </div>
            </div>

            {challenge.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Your Progress</span>
                  <span>{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-sm text-orange-600">
                <Award className="w-4 h-4" />
                <span>{challenge.reward}</span>
              </div>
              
              <Button
                size="sm"
                onClick={() => !challenge.isJoined && joinChallenge.mutate(challenge.id)}
                disabled={challenge.isJoined}
                className={cn(
                  challenge.isJoined
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-orange-500 hover:bg-orange-600"
                )}
              >
                {challenge.isJoined ? (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Joined
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <Button
          onClick={() => setIsPostingVisible(!isPostingVisible)}
          className="bg-orange-500 hover:bg-orange-600"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Post
        </Button>
      </div>

      {/* Quick Post */}
      <AnimatePresence>
        {isPostingVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Share your pickleball experience..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => createPost.mutate({ content: postContent })}
                    disabled={!postContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" className="text-xs">Feed</TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs">Challenges</TabsTrigger>
          <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Filter Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['all', 'achievements', 'tips', 'questions', 'tournaments'].map((filterOption) => (
              <motion.button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  filter === filterOption
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Posts */}
          <div>
            {postsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              posts?.map(renderPostCard)
            )}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4 mt-4">
          <div className="text-center py-2">
            <h3 className="font-medium text-gray-900">Active Challenges</h3>
            <p className="text-sm text-gray-600">Join challenges to earn rewards and improve your game</p>
          </div>
          {challenges?.map(renderChallengeCard)}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="text-center py-2">
            <h3 className="font-medium text-gray-900">Upcoming Events</h3>
            <p className="text-sm text-gray-600">Join local tournaments and social events</p>
          </div>
          {events?.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      </div>
                      {event.price && (
                        <Badge className="bg-green-100 text-green-800">
                          ${event.price}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {event.attendees}{event.maxAttendees && `/${event.maxAttendees}`} attending
                      </div>
                      <Button
                        size="sm"
                        className={cn(
                          event.isJoined
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-orange-500 hover:bg-orange-600"
                        )}
                      >
                        {event.isJoined ? 'Joined' : 'Join Event'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}