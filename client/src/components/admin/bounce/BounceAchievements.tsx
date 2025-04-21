/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Component
 * 
 * This component displays user achievements and progress in the Bounce testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Award, Medal, Star, Trophy, Target, CheckCircle, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  icon: string | null;
  badgeImageUrl: string | null;
  requiredPoints: number | null;
  requiredInteractions: number | null;
  xpReward: number | null;
  progress: number;
  isComplete: boolean;
  awardedAt?: Date;
}

interface AchievementStats {
  totalEarned: number;
  totalAvailable: number;
  percentComplete: number;
}

interface AchievementResponse {
  success: boolean;
  data: {
    achievements: Achievement[];
    stats: AchievementStats;
  };
  error?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  totalPoints: number;
  totalFindings: number;
  lastInteractionAt?: Date;
}

interface LeaderboardResponse {
  success: boolean;
  data: {
    leaderboard: LeaderboardEntry[];
    totalUsers: number;
  };
  error?: string;
}

interface RecentAchievement {
  achievementId: number;
  achievementName: string;
  achievementDescription: string;
  achievementIcon?: string;
  userId: number;
  username: string;
  displayName?: string;
  awardedAt: Date;
}

interface RecentAchievementsResponse {
  success: boolean;
  data: RecentAchievement[];
  error?: string;
}

/**
 * Component for displaying Bounce achievements
 */
const BounceAchievements = () => {
  const [currentTab, setCurrentTab] = useState('achievements');
  
  // Query user achievements
  const {
    data: achievementsData,
    isLoading: isLoadingAchievements,
    error: achievementsError
  } = useQuery<AchievementResponse>({
    queryKey: ['/api/bounce/gamification/achievements'],
    enabled: currentTab === 'achievements'
  });
  
  // Query leaderboard
  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    error: leaderboardError
  } = useQuery<LeaderboardResponse>({
    queryKey: ['/api/bounce/gamification/leaderboard'],
    enabled: currentTab === 'leaderboard'
  });
  
  // Query recent achievements
  const {
    data: recentAchievementsData,
    isLoading: isLoadingRecent,
    error: recentError
  } = useQuery<RecentAchievementsResponse>({
    queryKey: ['/api/bounce/gamification/recent-achievements'],
    enabled: currentTab === 'recent'
  });
  
  // Query user's leaderboard position
  const {
    data: userPositionData,
    isLoading: isLoadingPosition,
    error: positionError
  } = useQuery({
    queryKey: ['/api/bounce/gamification/my-position'],
    enabled: currentTab === 'leaderboard'
  });

  /**
   * Get icon component based on name
   */
  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'User':
        return <User className="h-6 w-6" />;
      case 'Award':
        return <Award className="h-6 w-6" />;
      case 'Medal':
        return <Medal className="h-6 w-6" />;
      case 'Star':
        return <Star className="h-6 w-6" />;
      case 'Trophy':
        return <Trophy className="h-6 w-6" />;
      case 'Target':
        return <Target className="h-6 w-6" />;
      case 'CheckCircle':
        return <CheckCircle className="h-6 w-6" />;
      case 'Users':
        return <Users className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  /**
   * Get color for achievement type
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tester_participation':
        return 'bg-blue-100 text-blue-800';
      case 'issue_discovery':
        return 'bg-red-100 text-red-800';
      case 'verification':
        return 'bg-green-100 text-green-800';
      case 'feedback':
        return 'bg-purple-100 text-purple-800';
      case 'fixing':
        return 'bg-orange-100 text-orange-800';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format achievement type for display
   */
  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Bounce Gamification
          </CardTitle>
          <CardDescription>
            Track your achievements, see your progress, and check the leaderboard in the Bounce testing system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements">My Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="recent">Recent Awards</TabsTrigger>
            </TabsList>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4 mt-4">
              {isLoadingAchievements ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-8" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                </div>
              ) : achievementsError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading achievements. Please try again later.
                </div>
              ) : achievementsData?.success ? (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-lg mb-6">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold">Your Achievement Progress</h3>
                      <p className="text-sm text-slate-600">
                        {achievementsData.data.stats.totalEarned} of {achievementsData.data.stats.totalAvailable} achievements earned
                      </p>
                    </div>
                    <div className="w-full md:w-1/2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{achievementsData.data.stats.percentComplete}%</span>
                        <span>{achievementsData.data.stats.totalEarned}/{achievementsData.data.stats.totalAvailable}</span>
                      </div>
                      <Progress value={achievementsData.data.stats.percentComplete} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievementsData.data.achievements.map(achievement => (
                      <Card key={achievement.id} className={`border ${achievement.isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getIconComponent(achievement.icon)}
                              <CardTitle className="text-base">{achievement.name}</CardTitle>
                            </div>
                            {achievement.isComplete && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <Badge className={`${getTypeColor(achievement.type)} mt-1`}>
                            {formatType(achievement.type)}
                          </Badge>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm">{achievement.description}</p>
                          {achievement.xpReward && (
                            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                              +{achievement.xpReward} XP
                            </Badge>
                          )}
                        </CardContent>
                        <CardFooter className="flex flex-col items-start pt-0">
                          <div className="w-full">
                            {achievement.requiredPoints && (
                              <>
                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.requiredPoints} Points</span>
                                </div>
                                <Progress value={(achievement.progress / achievement.requiredPoints) * 100} />
                              </>
                            )}
                            {achievement.requiredInteractions && (
                              <>
                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.requiredInteractions} Interactions</span>
                                </div>
                                <Progress value={(achievement.progress / achievement.requiredInteractions) * 100} />
                              </>
                            )}
                            {achievement.awardedAt && (
                              <p className="text-xs text-gray-500 mt-2">
                                Awarded: {formatDate(achievement.awardedAt)}
                              </p>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4 text-amber-500 bg-amber-50 rounded-md">
                  No achievements data available. Start testing with Bounce to earn achievements!
                </div>
              )}
            </TabsContent>
            
            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-4">
              {isLoadingLeaderboard || isLoadingPosition ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-16" />
                  <Skeleton className="w-full h-64" />
                </div>
              ) : leaderboardError || positionError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading leaderboard. Please try again later.
                </div>
              ) : leaderboardData?.success ? (
                <>
                  {userPositionData?.data?.found && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-2">Your Position</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-bold text-blue-600">
                            #{userPositionData.data.rank}
                          </span>
                          <span className="ml-2 text-slate-600">
                            of {userPositionData.data.totalUsers} testers
                          </span>
                        </div>
                        <div>
                          <span className="text-xl font-semibold">
                            {userPositionData.data.totalPoints} points
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Findings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboardData.data.leaderboard.map((entry) => (
                          <tr key={entry.userId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold">
                                {entry.rank === 1 && <Trophy className="inline h-4 w-4 text-yellow-500 mr-1" />}
                                {entry.rank === 2 && <Medal className="inline h-4 w-4 text-gray-400 mr-1" />}
                                {entry.rank === 3 && <Medal className="inline h-4 w-4 text-amber-600 mr-1" />}
                                #{entry.rank}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.displayName || entry.username}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.totalPoints}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.totalFindings}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-4 text-amber-500 bg-amber-50 rounded-md">
                  No leaderboard data available yet!
                </div>
              )}
            </TabsContent>
            
            {/* Recent Achievements Tab */}
            <TabsContent value="recent" className="mt-4">
              {isLoadingRecent ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading recent achievements. Please try again later.
                </div>
              ) : recentAchievementsData?.success && recentAchievementsData.data.length > 0 ? (
                <div className="space-y-4">
                  {recentAchievementsData.data.map((item) => (
                    <Card key={`${item.userId}-${item.achievementId}-${item.awardedAt}`} className="bg-slate-50">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getIconComponent(item.achievementIcon)}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.achievementName}</h4>
                              <p className="text-sm text-slate-600">{item.achievementDescription}</p>
                              <p className="text-sm font-medium mt-1">
                                Awarded to <span className="text-blue-600">{item.displayName || item.username}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 mt-2 md:mt-0">
                            {formatDate(item.awardedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-amber-500 bg-amber-50 rounded-md">
                  No recent achievements yet! Start testing to be the first one on the board.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BounceAchievements;