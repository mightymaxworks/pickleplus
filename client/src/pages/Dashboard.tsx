import { useQuery } from "@tanstack/react-query";
import { User, Tournament, Match, Achievement, UserAchievement, StatItem } from "@/lib/types";
import StatCard from "@/components/dashboard/StatCard";
import PlayerProgress from "@/components/dashboard/PlayerProgress";
import QRCodeCard from "@/components/dashboard/QRCodeCard";
import AchievementCard from "@/components/dashboard/AchievementCard";
import TournamentCard from "@/components/dashboard/TournamentCard";
import MatchesHistory from "@/components/dashboard/MatchesHistory";
import CodeRedemption from "@/components/dashboard/CodeRedemption";
import LeaderboardPreview from "@/components/dashboard/LeaderboardPreview";

const Dashboard = () => {
  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Fetch tournaments data
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Fetch user tournaments
  const { data: userTournaments, isLoading: userTournamentsLoading } = useQuery<{ tournament: Tournament; participant: any }[]>({
    queryKey: ['/api/tournaments/user', user?.id],
    enabled: !!user,
  });

  // Fetch user matches
  const { data: matches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches/user', user?.id],
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery<{ achievement: Achievement; userAchievement: UserAchievement }[]>({
    queryKey: ['/api/achievements/user', user?.id, 'recent'],
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

  // Generate stats data for the dashboard
  const stats: StatItem[] = [
    {
      title: "Weekly XP",
      value: "1,250",
      change: "12%",
      icon: "fas fa-bolt text-primary",
      iconBgClass: "bg-primary bg-opacity-10",
    },
    {
      title: "Win Ratio",
      value: user.wins > 0 ? `${Math.round((user.wins / (user.wins + user.losses)) * 100)}%` : "0%",
      change: "5%",
      icon: "fas fa-chart-line text-secondary",
      iconBgClass: "bg-secondary bg-opacity-10",
    },
    {
      title: "Total Matches",
      value: user.totalMatches,
      change: "3 this week",
      icon: "fas fa-table-tennis text-accent",
      iconBgClass: "bg-accent bg-opacity-10",
    },
    {
      title: "Tournaments",
      value: userTournaments?.length || 0,
      change: "Next in 2 days",
      icon: "fas fa-trophy text-primary",
      iconBgClass: "bg-primary bg-opacity-10",
    },
  ];

  return (
    <>
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.displayName.split(' ')[0]}!</h2>
        <p className="text-gray-500">Your pickleball journey continues...</p>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
      
      {/* Player Progress & Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Player Level Progress */}
        <PlayerProgress user={user} />
        
        {/* QR Code Profile Card */}
        <QRCodeCard user={user} />
        
        {/* Recent Achievements */}
        <AchievementCard achievements={achievements || []} />
      </div>
      
      {/* Upcoming Tournaments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-900">Upcoming Tournaments</h3>
          <a href="/tournaments" className="text-secondary text-sm">View All</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournamentsLoading ? (
            [1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white rounded-md shadow-sm h-64 animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : tournaments && tournaments.length > 0 ? (
            tournaments.slice(0, 3).map((tournament) => {
              const userTournament = userTournaments?.find(
                (ut) => ut.tournament.id === tournament.id
              );
              return (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={!!userTournament}
                  userStatus={userTournament?.participant.status.toUpperCase()}
                />
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 bg-white rounded-md shadow-sm">
              <p className="text-gray-500">No upcoming tournaments available.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Matches */}
      {matchesLoading ? (
        <div className="mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border-b border-gray-100 p-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <MatchesHistory matches={matches || []} currentUser={user} />
      )}
      
      {/* XP Bonus Code Redemption */}
      <CodeRedemption />
      
      {/* Leaderboard Preview */}
      <LeaderboardPreview currentUser={user} />
    </>
  );
};

export default Dashboard;
