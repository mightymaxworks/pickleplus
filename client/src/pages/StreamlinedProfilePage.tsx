/**
 * PKL-278651-SPUI-0001: Streamlined Profile User Interface
 * A sleek, modern profile interface with persistent top navigation and mobile-optimized experience
 */
import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  UserCircle, Settings, Award, Clock, Info, Dumbbell, BookOpen,
  Trophy, MapPin, BadgeCheck, Medal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * Streamlined Profile Page
 * A comprehensive profile page with mobile-first design and persistent navigation
 */
const StreamlinedProfilePage: FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch current user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/current-user'],
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    toast({
      title: 'Error',
      description: 'Failed to load profile data',
      variant: 'destructive',
    });
    return <div className="p-4">Failed to load profile data</div>;
  }

  return (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      {/* Hero Section with Profile Header */}
      <Card className="w-full overflow-hidden relative">
        {/* Banner/Background */}
        <div className="h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40 flex items-end justify-end p-4">
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-14 relative">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
                ) : null}
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {user.avatarInitials || user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* User Info */}
          <div className="ml-28 sm:ml-0 sm:mt-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold truncate">
                  {user.displayName || user.username}
                </h1>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.location || 'No location set'}
                </div>
              </div>
              
              <div className="flex mt-2 sm:mt-0 gap-2">
                {user.isFoundingMember && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    Founding Member
                  </Badge>
                )}
                {user.skillLevel && (
                  <Badge variant="outline" className="bg-primary/10">
                    {user.skillLevel} Skill Level
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        {/* XP Level Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">XP Level</div>
              <Badge variant="outline" className="text-xs">
                Level {user.level || 1}
              </Badge>
            </div>
            <div className="mb-2">
              <Progress value={75} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              {user.xp || 0} XP total
            </div>
          </div>
        </Card>
        
        {/* Skill Level Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">Skill Level</div>
              <BadgeCheck className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="mb-2">
              <Progress value={user.skillLevel ? (parseFloat(user.skillLevel) / 7) * 100 : 0} className="h-2" />
            </div>
            <div className="text-sm font-semibold">
              {user.skillLevel || 'Not set'}
            </div>
          </div>
        </Card>
        
        {/* Rating Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">CourtIQ™</div>
              <Trophy className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm font-semibold mb-1">
              {user.rankingPoints || 0} pts
            </div>
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-800 hover:bg-blue-100"
            >
              Beginner
            </Badge>
          </div>
        </Card>
        
        {/* Match Stats Card */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">Match Stats</div>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm mb-1">
                {user.totalMatches || 0} matches played
              </div>
              <div className="text-sm font-semibold">
                {user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}% win rate
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Tabbed Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <div className="sticky top-16 z-10 bg-background pt-2 pb-2 border-b">
          <TabsList className="w-full h-auto justify-start gap-1 overflow-x-auto flex-nowrap scrollbar-hide p-1 mb-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Stats & Ratings</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Play Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Match History</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="overview" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Bio</h4>
                    <p>{user.bio || 'No bio specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Playing Style</h4>
                    <p>{user.playingStyle || 'Not specified'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Playing Since</h4>
                  <p>{user.playingSince || 'Not specified'}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Statistics</h3>
                <p className="text-muted-foreground">
                  Detailed statistics about your performance will appear here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">CourtIQ™ Rating</h4>
                    <div className="text-3xl font-bold">{user.rankingPoints || 0}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Win Rate</h4>
                    <div className="text-3xl font-bold">{user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Equipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Paddle</h4>
                    <p>
                      {user.paddleBrand ? `${user.paddleBrand} ${user.paddleModel || ''}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Backup Paddle</h4>
                    <p>
                      {user.backupPaddleBrand ? `${user.backupPaddleBrand} ${user.backupPaddleModel || ''}` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Other Equipment</h4>
                  <p>{user.otherEquipment || 'Not specified'}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Play Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Format Preference</h4>
                    <p>{user.preferredFormat || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Dominant Hand</h4>
                    <p>{user.dominantHand || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Looking for Partners</h4>
                    <p>{user.lookingForPartners ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Mentorship Interest</h4>
                    <p>{user.mentorshipInterest ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Achievements</h3>
                <p className="text-muted-foreground">
                  Your achievements will be displayed here as you earn them.
                </p>
                <div className="flex items-center gap-2 mt-4 p-4 border rounded-md bg-green-50">
                  <Award className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium">Profile Progress</h4>
                    <p className="text-sm">Complete your profile to earn XP and unlock achievements.</p>
                  </div>
                  <Badge className="ml-auto">{user.profileCompletionPct || 0}%</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Match History</h3>
                <p className="text-muted-foreground">
                  {user.totalMatches ? 'Your recent matches will appear here.' : 'You have not played any matches yet.'}
                </p>
                <div className="mt-4">
                  {user.totalMatches ? (
                    <div className="border rounded-md p-4">
                      <div className="grid grid-cols-3 font-medium mb-2">
                        <div>Date</div>
                        <div>Opponent</div>
                        <div>Result</div>
                      </div>
                      {/* Sample match history row */}
                      <div className="grid grid-cols-3 border-t py-2">
                        <div>2025-04-02</div>
                        <div>John Smith</div>
                        <div><Badge variant="success">Win</Badge></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Matches Yet</h4>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Start recording your matches to build your history and track your progress.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

/**
 * Profile Skeleton Loading State
 */
const ProfileSkeleton: FC = () => {
  return (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      {/* Hero Section Skeleton */}
      <Card className="w-full overflow-hidden relative">
        <div className="h-40 bg-muted"></div>
        <div className="px-6 pb-6 pt-14 relative">
          <div className="absolute -top-12 left-6">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </Card>
      
      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
      
      {/* Tab Navigation Skeleton */}
      <div className="my-6">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-md shrink-0" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StreamlinedProfilePage;