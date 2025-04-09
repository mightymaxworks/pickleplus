/**
 * PKL-278651-SPUI-0001: Streamlined Profile User Interface
 * A sleek, modern profile interface with persistent top navigation and mobile-optimized experience
 */
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  UserCircle, Settings, Award, Clock, Dumbbell, BookOpen,
  Trophy, MapPin, BadgeCheck, Medal, Edit2 
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EnhancedUser } from '@/types/enhanced-user';
import { AppHeader } from '@/components/layout/AppHeader';

/**
 * Streamlined Profile Page with color-coded tab navigation
 */
const StreamlinedProfilePage: FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();
  
  // Fetch current user data
  const { data: user, isLoading, error } = useQuery<EnhancedUser>({
    queryKey: ['/api/auth/current-user'],
  });

  // Define a skeleton loading state component
  const ProfileSkeleton = () => (
    <div className="container px-4 pb-16 max-w-screen-xl mx-auto">
      <div className="mt-4">
        <Skeleton className="h-40 w-full" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="mt-6">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
  
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
      {/* Standardized Header using AppHeader component */}
      <AppHeader />
      
      {/* Hero Section with Profile Header */}
      <Card className="w-full overflow-hidden relative mt-4">
        {/* Banner/Background */}
        <div className="h-40 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40">
          {user.bannerUrl && (
            <img 
              src={user.bannerUrl} 
              alt="Profile banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-4 relative flex items-center">
          <div className="mr-4">
            <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl border-4 border-background">
              {user.displayName?.substring(0, 2) || user.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.displayName || user.username}
            </h1>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {user.location || 'No location set'}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabbed Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TooltipProvider>
          <div className="sticky top-16 z-10 bg-background pt-2 pb-2 border-b">
            <TabsList className="w-full h-auto justify-between sm:justify-start gap-1 overflow-x-auto flex-nowrap p-2 mb-2 rounded-lg bg-muted/30">
              {/* Overview Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium">Overview</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Player information and bio</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Stats & Ratings Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="stats" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <Dumbbell className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-medium">Stats</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Performance stats and ratings</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Equipment Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="equipment" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-1">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-[11px] font-medium">Gear</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Paddles, apparel and gear</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Preferences Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="preferences" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-[11px] font-medium">Style</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Play style and preferences</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Achievements Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="achievements" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-1">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-[11px] font-medium">Badges</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Badges and accomplishments</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Match History Tab */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 sm:flex-initial flex flex-col items-center data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-sm rounded-md px-3 py-2 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-1">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-[11px] font-medium">History</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Recent matches and records</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </div>
        </TooltipProvider>

        <div className="mt-4">
          <TabsContent value="overview" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Player Information</h3>
              <p>{user.bio || 'No bio specified'}</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Equipment</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium">Primary Paddle</h4>
                  <p className="text-sm mt-1">
                    {user.paddleBrand ? `${user.paddleBrand} ${user.paddleModel || ''}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stats & Ratings</h3>
              <p>Skill Level: {user.skillLevel || 'Not set'}</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Play Style & Preferences</h3>
              <p>Format: {user.preferredFormat || 'Not specified'}</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Achievements & Badges</h3>
              <p>Coming soon!</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Match History</h3>
              <p>Coming soon!</p>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StreamlinedProfilePage;