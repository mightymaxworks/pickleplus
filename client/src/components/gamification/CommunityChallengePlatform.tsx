import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Flame,
  Star,
  Award,
  TrendingUp,
  Crown,
  Timer,
  MapPin,
  Gift,
  Zap,
  Medal
} from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'technical' | 'tactical' | 'social' | 'consistency' | 'special';
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number; // in days
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participantCount: number;
  maxParticipants?: number;
  requirements: string[];
  rewards: {
    picklePoints: number;
    points: number;
    badges?: string[];
    specialReward?: string;
  };
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  leaderboard?: ChallengeParticipant[];
  createdBy?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'system' | 'admin' | 'coach' | 'player';
  };
  facilities?: string[];
  isJoined?: boolean;
  teamSize?: number;
  tags: string[];
}

interface ChallengeParticipant {
  userId: string;
  name: string;
  avatar?: string;
  progress: number;
  rank: number;
  score: number;
  joinedDate: Date;
  teamId?: string;
  teamName?: string;
}

interface CommunityEvent {
  id: string;
  name: string;
  description: string;
  type: 'tournament' | 'social' | 'training' | 'special';
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  participantCount: number;
  maxParticipants?: number;
  isRegistered?: boolean;
  organizer: {
    name: string;
    avatar?: string;
    role: string;
  };
  rewards?: {
    picklePoints: number;
    points: number;
    specialRewards: string[];
  };
  requirements?: string[];
  tags: string[];
}

interface CommunityChallengePlatformProps {
  userId: number;
  onJoinChallenge?: (challengeId: string) => void;
  onCreateChallenge?: () => void;
  onJoinEvent?: (eventId: string) => void;
  onClose?: () => void;
}

export default function CommunityChallengePlatform({
  userId,
  onJoinChallenge,
  onCreateChallenge,
  onJoinEvent,
  onClose
}: CommunityChallengePlatformProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'events' | 'leaderboard'>('active');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load challenges and events
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch real challenges from API
        const challengesResponse = await fetch('/api/community/challenges?status=active');
        const challengesData = await challengesResponse.json();
        
        if (challengesData.success) {
          setChallenges(challengesData.challenges || []);
        } else {
          console.error('Failed to fetch challenges:', challengesData.message);
          setChallenges([]);
        }

        // Fetch real events from API
        const eventsResponse = await fetch('/api/community/events?status=upcoming');
        const eventsData = await eventsResponse.json();
        
        if (eventsData.success) {
          setEvents(eventsData.events || []);
        } else {
          console.error('Failed to fetch events:', eventsData.message);
          setEvents([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading community data:', error);
        // Fall back to empty arrays instead of mock data
        setChallenges([]);
        setEvents([]);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Since we removed mock data, let me add some sample challenges for demonstration
  useEffect(() => {
    const addSampleData = async () => {
      if (challenges.length === 0 && !isLoading) {
        // Create sample challenges for demonstration
        const sampleChallenges: Challenge[] = [
        {
          id: 'weekly_consistency',
          name: 'Weekly Consistency Champion',
          description: 'Play at least one match every day for 7 consecutive days',
          type: 'individual',
          category: 'consistency',
          difficulty: 2,
          duration: 7,
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          isActive: true,
          participantCount: 156,
          requirements: ['Play 1 match per day', 'No missed days allowed'],
          rewards: {
            picklePoints: 500,
            points: 150,
            badges: ['Consistency Master'],
            specialReward: 'Weekly Champion Badge'
          },
          progress: {
            current: 4,
            target: 7,
            percentage: 57
          },
          createdBy: {
            id: 'system',
            name: 'Pickle+ System',
            role: 'system'
          },
          isJoined: true,
          tags: ['weekly', 'consistency', 'daily']
        },
        {
          id: 'serve_ace_challenge',
          name: 'Ace Serve Mastery',
          description: 'Hit 25 aces in competitive matches this month',
          type: 'individual',
          category: 'technical',
          difficulty: 4,
          duration: 30,
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          isActive: true,
          participantCount: 89,
          maxParticipants: 100,
          requirements: ['Competitive matches only', 'Verified aces count'],
          rewards: {
            picklePoints: 1000,
            points: 300,
            badges: ['Ace Specialist', 'Serve Master'],
            specialReward: 'Golden Paddle Award'
          },
          progress: {
            current: 12,
            target: 25,
            percentage: 48
          },
          leaderboard: [
            { userId: '1', name: 'Sarah Chen', avatar: '/uploads/profiles/avatar-2.jpg', progress: 23, rank: 1, score: 2300, joinedDate: new Date(), teamId: undefined, teamName: undefined },
            { userId: '2', name: 'Mike Rodriguez', progress: 19, rank: 2, score: 1900, joinedDate: new Date(), teamId: undefined, teamName: undefined },
            { userId: '3', name: 'Alex Johnson', progress: 15, rank: 3, score: 1500, joinedDate: new Date(), teamId: undefined, teamName: undefined }
          ],
          createdBy: {
            id: 'coach_1',
            name: 'Coach Maria',
            avatar: '/uploads/profiles/coach-1.jpg',
            role: 'coach'
          },
          isJoined: true,
          tags: ['technical', 'serving', 'competitive']
        },
        {
          id: 'team_tournament',
          name: 'Spring Team Championship',
          description: 'Form a team of 4 players and compete in the seasonal tournament',
          type: 'team',
          category: 'special',
          difficulty: 5,
          duration: 14,
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
          isActive: false,
          participantCount: 28,
          maxParticipants: 64,
          teamSize: 4,
          requirements: ['Team of 4 players', 'All team members must be verified'],
          rewards: {
            picklePoints: 2000,
            points: 500,
            badges: ['Team Champion', 'Spring Winner'],
            specialReward: 'Team Trophy + Individual Medals'
          },
          createdBy: {
            id: 'admin_1',
            name: 'Tournament Director',
            role: 'admin'
          },
          facilities: ['Elite Courts', 'Champions Arena'],
          isJoined: false,
          tags: ['team', 'tournament', 'spring', 'championship']
        }
      ];

      const mockEvents: CommunityEvent[] = [
        {
          id: 'social_mixer',
          name: 'Monthly Social Mixer',
          description: 'Meet fellow players, enjoy refreshments, and participate in fun mini-games',
          type: 'social',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          location: 'Community Center Court',
          isVirtual: false,
          participantCount: 45,
          maxParticipants: 60,
          isRegistered: false,
          organizer: {
            name: 'Community Team',
            avatar: '/uploads/profiles/community.jpg',
            role: 'Community Manager'
          },
          rewards: {
            picklePoints: 200,
            points: 50,
            specialRewards: ['Social Butterfly Badge', 'Community Spirit']
          },
          tags: ['social', 'networking', 'fun']
        },
        {
          id: 'skills_clinic',
          name: 'Advanced Skills Clinic',
          description: 'Master advanced techniques with professional coaches',
          type: 'training',
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          location: 'Training Center Alpha',
          isVirtual: false,
          participantCount: 12,
          maxParticipants: 16,
          isRegistered: true,
          organizer: {
            name: 'Coach Elena',
            avatar: '/uploads/profiles/coach-elena.jpg',
            role: 'Head Coach'
          },
          requirements: ['Intermediate level or above', 'Own equipment required'],
          rewards: {
            picklePoints: 400,
            points: 100,
            specialRewards: ['Skills Master Certificate', 'Advanced Techniques Badge']
          },
          tags: ['training', 'skills', 'advanced', 'coaching']
        }
      ];

      setChallenges(mockChallenges);
      setEvents(mockEvents);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < difficulty ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="w-4 h-4" />;
      case 'tactical': return <TrendingUp className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'consistency': return <Calendar className="w-4 h-4" />;
      case 'special': return <Crown className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return <Users className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'community': return <Trophy className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  const filteredChallenges = challenges.filter(challenge => {
    const difficultyMatch = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory;
    const statusMatch = activeTab === 'active' ? challenge.isActive : !challenge.isActive;
    return difficultyMatch && categoryMatch && statusMatch;
  });

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
    <Card className="w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Community Challenges & Events
          </CardTitle>
          <Button onClick={onCreateChallenge} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Create Challenge
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-2 sm:px-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="active" className="text-xs sm:text-sm px-1 sm:px-3">Active</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-1 sm:px-3">Upcoming</TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm px-1 sm:px-3">Events</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm px-1 sm:px-3">Board</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2 min-w-fit">
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Difficulty:</span>
                {['all', 1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={selectedDifficulty === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(level as number | "all")}
                    className="text-xs px-2 py-1 h-7 flex-shrink-0"
                  >
                    {level === 'all' ? 'All' : getDifficultyStars(level as number)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {filteredChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white flex-shrink-0">
                        {getCategoryIcon(challenge.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base">
                          <span className="truncate block">{challenge.name}</span>
                          <Badge variant={challenge.type === 'team' ? 'default' : 'secondary'} className="mt-1 text-xs">
                            {challenge.type}
                          </Badge>
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:text-right text-xs sm:text-sm flex-shrink-0">
                      <div className="flex items-center gap-1">
                        {getDifficultyStars(challenge.difficulty)}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        <span className="text-xs">{formatTimeRemaining(challenge.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  {challenge.progress && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Your Progress</span>
                        <span>{challenge.progress.current}/{challenge.progress.target}</span>
                      </div>
                      <Progress value={challenge.progress.percentage} className="h-2" />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mb-3 gap-2">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Users className="w-3 h-3" />
                        {challenge.participantCount}
                        {challenge.maxParticipants && `/${challenge.maxParticipants}`}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {challenge.rewards.picklePoints} Pts
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {challenge.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-xs text-muted-foreground truncate">
                      by {challenge.createdBy?.name}
                    </div>
                    <Button
                      size="sm"
                      variant={challenge.isJoined ? "outline" : "default"}
                      onClick={() => onJoinChallenge?.(challenge.id)}
                      disabled={Boolean(challenge.maxParticipants && challenge.participantCount >= challenge.maxParticipants)}
                      className="text-xs px-3 py-1.5 h-auto w-full sm:w-auto"
                    >
                      {challenge.isJoined ? 'Joined' : 'Join Challenge'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {challenges.filter(c => !c.isActive).map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-muted/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
                        {getCategoryIcon(challenge.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.name}
                          <Badge variant="outline">
                            Starting {new Date(challenge.startDate).toLocaleDateString()}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participantCount} interested
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {challenge.duration} days
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      Notify Me
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={event.isRegistered ? "default" : "outline"}>
                      {event.type}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.startDate).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                      {event.isVirtual && <Badge variant="secondary" className="text-xs">Virtual</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {event.participantCount}
                      {event.maxParticipants && `/${event.maxParticipants}`} participants
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      by {event.organizer.name}
                    </div>
                    <Button
                      size="sm"
                      variant={event.isRegistered ? "outline" : "default"}
                      onClick={() => onJoinEvent?.(event.id)}
                      disabled={Boolean(event.maxParticipants && event.participantCount >= event.maxParticipants)}
                    >
                      {event.isRegistered ? 'Registered' : 'Register'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {challenges
              .filter(c => c.leaderboard && c.leaderboard.length > 0)
              .map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      {challenge.name} - Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {challenge.leaderboard?.slice(0, 10).map((participant, index) => (
                        <div
                          key={participant.userId}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-muted/30'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-muted-foreground'
                          }`}>
                            {index < 3 ? <Medal className="w-4 h-4" /> : participant.rank}
                          </div>
                          
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h5 className="font-medium">{participant.name}</h5>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Progress: {participant.progress}</span>
                              <span>Score: {participant.score}</span>
                            </div>
                          </div>
                          
                          {index < 3 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Top {index + 1}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}