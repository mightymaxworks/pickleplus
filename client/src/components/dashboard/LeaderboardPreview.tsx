import { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface LeaderboardPreviewProps {
  currentUser: User;
}

const LeaderboardPreview = ({ currentUser }: LeaderboardPreviewProps) => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/leaderboard'],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-3 border-b border-gray-100 flex items-center">
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 flex items-center ml-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
                <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-4 bg-gray-200 rounded mx-4"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users) {
    return null;
  }

  // Find current user's position in the leaderboard
  const currentUserRank = users.findIndex((user) => user.id === currentUser.id) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-gray-900">Leaderboard</h3>
        <Link href="/leaderboard" className="text-secondary text-sm">View Full Rankings</Link>
      </div>
      
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center text-sm font-medium text-gray-500">
          <div className="w-12 text-center">Rank</div>
          <div className="flex-1">Player</div>
          <div className="w-16 text-center">Rating</div>
          <div className="w-16 text-center">W/L</div>
          <div className="w-20 text-center">XP</div>
        </div>
        
        {users.map((user, index) => (
          <div 
            key={user.id} 
            className={`p-3 border-b border-gray-100 flex items-center ${user.id === currentUser.id ? 'bg-primary bg-opacity-5' : ''}`}
          >
            <div className="w-12 text-center font-medium">{index + 1}</div>
            <div className="flex-1 flex items-center">
              <div className={`h-8 w-8 rounded-full ${user.id === currentUser.id ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center text-white text-xs mr-3`}>
                <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user.displayName}{user.id === currentUser.id ? ' (You)' : ''}
                </div>
                <div className="text-xs text-gray-500">Level {user.level}</div>
              </div>
            </div>
            <div className="w-16 text-center font-bold">{(user.rating / 1000).toFixed(1)}</div>
            <div className="w-16 text-center">{user.wins}/{user.losses}</div>
            <div className="w-20 text-center font-medium text-secondary">{user.xp.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPreview;
