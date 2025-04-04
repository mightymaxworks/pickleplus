import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Achievement, UserAchievement, Match } from "@/lib/types";
import ProfileDetails from "@/components/profile/ProfileDetails";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEdit from "@/components/profile/ProfileEdit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import QRCodeCard from "@/components/dashboard/QRCodeCard";
import AchievementCard from "@/components/dashboard/AchievementCard";
import MatchesHistory from "@/components/dashboard/MatchesHistory";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<{ achievement: Achievement; userAchievement: UserAchievement }[]>({
    queryKey: ['/api/achievements/user', user?.id],
    enabled: !!user,
  });

  // Fetch user matches
  const { data: matches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/user', user?.id],
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-secondary">
            <i className="fas fa-edit mr-2"></i>
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <ProfileEdit user={user} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white shadow-sm">
              <ProfileDetails user={user} />
            </Card>
          </div>
          <div>
            <QRCodeCard user={user} />
          </div>
        </div>
      )}

      {!isEditing && (
        <>
          <h2 className="text-xl font-bold mb-4">Player Statistics</h2>
          <div className="mb-8">
            <ProfileStats user={user} />
          </div>

          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="mb-8">
            <AchievementCard achievements={achievements || []} />
          </div>

          <h2 className="text-xl font-bold mb-4">Match History</h2>
          <div>
            {matchesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MatchesHistory matches={matches || []} currentUser={user} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
