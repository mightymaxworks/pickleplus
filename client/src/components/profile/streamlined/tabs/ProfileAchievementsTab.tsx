/**
 * PKL-278651-SPUI-0001: Profile Achievements Tab
 * Displays user achievements, badges and milestones
 */
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award, Gift, Trophy, Star, Calendar, BarChart, 
  Users, CheckCircle2, MapPin, Clock, Shield
} from 'lucide-react';

interface ProfileAchievementsTabProps {
  user: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  xpValue: number;
  category: 'milestone' | 'skill' | 'social' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const ProfileAchievementsTab: FC<ProfileAchievementsTabProps> = ({ user }) => {
  // Fetch achievements data (would typically come from API)
  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['/api/achievements'],
    enabled: false, // Disabled for now until API is ready
  });
  
  // Sample achievements data (for now, would be replaced with actual data)
  const achievements: Achievement[] = [
    // Special achievements
    {
      id: 'founding-member',
      title: 'Founding Member',
      description: 'One of the first members to join the Pickle+ platform.',
      icon: <Star className="h-6 w-6 text-amber-500" />,
      earned: !!user.isFoundingMember,
      xpValue: 500,
      category: 'special',
      rarity: 'legendary',
    },
    {
      id: 'profile-completer',
      title: 'Profile Perfectionist',
      description: 'Complete 100% of your profile details.',
      icon: <CheckCircle2 className="h-6 w-6 text-blue-500" />,
      earned: (user.profileCompletionPct || 0) >= 100,
      progress: user.profileCompletionPct || 0,
      maxProgress: 100,
      xpValue: 200,
      category: 'milestone',
      rarity: 'uncommon',
    },
    
    // Milestone achievements
    {
      id: 'first-match',
      title: 'First Match',
      description: 'Play your first match on Pickle+.',
      icon: <Trophy className="h-6 w-6 text-green-500" />,
      earned: (user.totalMatches || 0) >= 1,
      progress: Math.min(user.totalMatches || 0, 1),
      maxProgress: 1,
      xpValue: 50,
      category: 'milestone',
      rarity: 'common',
    },
    {
      id: 'match-master',
      title: 'Match Master',
      description: 'Play 100 matches on Pickle+.',
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      earned: (user.totalMatches || 0) >= 100,
      progress: Math.min(user.totalMatches || 0, 100),
      maxProgress: 100,
      xpValue: 500,
      category: 'milestone',
      rarity: 'epic',
    },
    {
      id: 'streak-warrior',
      title: 'Streak Warrior',
      description: 'Win 5 matches in a row.',
      icon: <BarChart className="h-6 w-6 text-red-500" />,
      earned: false, // Would be based on streak data
      progress: 0, // Would be based on current streak
      maxProgress: 5,
      xpValue: 150,
      category: 'milestone',
      rarity: 'rare',
    },
    {
      id: 'tournament-participant',
      title: 'Tournament Debut',
      description: 'Participate in your first tournament.',
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      earned: (user.totalTournaments || 0) >= 1,
      progress: Math.min(user.totalTournaments || 0, 1),
      maxProgress: 1,
      xpValue: 100,
      category: 'milestone',
      rarity: 'uncommon',
    },
    
    // Social achievements
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Connect with 10 other players.',
      icon: <Users className="h-6 w-6 text-sky-500" />,
      earned: false, // Would be based on connection count
      progress: 0, // Would be from API
      maxProgress: 10,
      xpValue: 100,
      category: 'social',
      rarity: 'uncommon',
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Help a new player improve their game through coaching.',
      icon: <Gift className="h-6 w-6 text-orange-500" />,
      earned: false, // Would be based on mentorship data
      xpValue: 200,
      category: 'social',
      rarity: 'rare',
    },
    
    // Skill achievements
    {
      id: 'skill-climber',
      title: 'Skill Climber',
      description: 'Increase your skill level rating.',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      earned: user.skillLevel && parseFloat(user.skillLevel) >= 4.0,
      progress: user.skillLevel ? Math.min(parseFloat(user.skillLevel) * 10, 70) : 0,
      maxProgress: 70, // 7.0 max skill
      xpValue: 150,
      category: 'skill',
      rarity: 'uncommon',
    },
  ];
  
  // Group achievements by category
  const specialAchievements = achievements.filter(a => a.category === 'special');
  const milestoneAchievements = achievements.filter(a => a.category === 'milestone');
  const skillAchievements = achievements.filter(a => a.category === 'skill');
  const socialAchievements = achievements.filter(a => a.category === 'social');
  
  // Count earned achievements
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const earnedPercentage = Math.round((earnedCount / totalCount) * 100);
  
  return (
    <div className="space-y-6">
      {/* Achievements Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="mr-4">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">{earnedCount}</span>
                  <span className="text-sm text-muted-foreground">Earned</span>
                </div>
              </div>
              <div className="h-12 w-px bg-muted mx-4 hidden sm:block"></div>
              <div className="mx-4">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">{totalCount - earnedCount}</span>
                  <span className="text-sm text-muted-foreground">Locked</span>
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-1/3">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>{earnedCount} / {totalCount} Achievements</span>
                  <span>{earnedPercentage}%</span>
                </div>
                <Progress value={earnedPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Special Achievements */}
      {specialAchievements.some(a => a.earned) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Special Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialAchievements
                .filter(a => a.earned)
                .map(achievement => (
                  <div 
                    key={achievement.id} 
                    className="flex p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-transparent"
                  >
                    <div className="mr-4">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge 
                          className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100"
                          variant="outline"
                        >
                          {achievement.xpValue} XP
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Milestone Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Milestone Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestoneAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`flex p-4 rounded-lg border ${achievement.earned ? 'bg-gradient-to-br from-green-50 to-transparent' : 'opacity-70'}`}
              >
                <div className="mr-4">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <Badge 
                      className={`ml-2 ${achievement.earned ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800'}`}
                      variant="outline"
                    >
                      {achievement.xpValue} XP
                    </Badge>
                    {achievement.rarity === 'rare' && (
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                        Rare
                      </Badge>
                    )}
                    {achievement.rarity === 'epic' && (
                      <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800">
                        Epic
                      </Badge>
                    )}
                    {achievement.rarity === 'legendary' && (
                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                        Legendary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Skill Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Skill Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`flex p-4 rounded-lg border ${achievement.earned ? 'bg-gradient-to-br from-blue-50 to-transparent' : 'opacity-70'}`}
              >
                <div className="mr-4">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <Badge 
                      className={`ml-2 ${achievement.earned ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-800'}`}
                      variant="outline"
                    >
                      {achievement.xpValue} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Social Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Social Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`flex p-4 rounded-lg border ${achievement.earned ? 'bg-gradient-to-br from-purple-50 to-transparent' : 'opacity-70'}`}
              >
                <div className="mr-4">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <Badge 
                      className={`ml-2 ${achievement.earned ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : 'bg-gray-100 text-gray-800'}`}
                      variant="outline"
                    >
                      {achievement.xpValue} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAchievementsTab;