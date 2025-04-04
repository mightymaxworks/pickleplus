import { useQuery } from "@tanstack/react-query";
import { User, Achievement, UserAchievement } from "@/lib/types";
import AchievementList from "@/components/achievements/AchievementList";
import AchievementProgress from "@/components/achievements/AchievementProgress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PlayerProgress from "@/components/dashboard/PlayerProgress";

const Achievements = () => {
  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<{ achievement: Achievement; userAchievement: UserAchievement }[]>({
    queryKey: ['/api/achievements/user', user?.id],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Error loading user data</div>;
  }

  // Separate completed and in-progress achievements
  const completedAchievements = achievements?.filter(a => a.userAchievement.completed) || [];
  const inProgressAchievements = achievements?.filter(a => !a.userAchievement.completed) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Achievements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Achievements Progress</h2>
                <p className="text-gray-500">
                  Complete challenges and earn XP bonuses to level up your player
                </p>
              </div>
              <AchievementProgress 
                total={achievements?.length || 0} 
                completed={completedAchievements.length} 
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <PlayerProgress user={user} />
        </div>
      </div>

      <Card className="bg-white shadow-sm">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {achievementsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <AchievementList achievements={achievements || []} />
            )}
          </TabsContent>
          <TabsContent value="completed">
            {achievementsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <AchievementList achievements={completedAchievements} />
            )}
          </TabsContent>
          <TabsContent value="inprogress">
            {achievementsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <AchievementList achievements={inProgressAchievements} />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Achievements;
