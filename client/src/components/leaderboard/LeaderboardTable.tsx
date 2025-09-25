import { User } from "@/lib/types";

interface LeaderboardTableProps {
  users: User[];
  currentUser?: User;
  sortBy: 'rating' | 'xp' | 'wins';
}

const LeaderboardTable = ({ users, currentUser, sortBy }: LeaderboardTableProps) => {
  // Sort users based on selected criteria
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'xp') return b.xp - a.xp;
    return b.wins - a.wins;
  });

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No players found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mobile-first card layout */}
      {sortedUsers.map((user, index) => {
        const isCurrentUser = currentUser && user.id === currentUser.id;
        
        return (
          <div 
            key={user.id} 
            className={`p-4 rounded-lg border transition-colors ${
              isCurrentUser ? 'bg-primary bg-opacity-5 border-primary border-opacity-20' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Rank badge */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  index < 3 
                    ? index === 0 
                      ? 'bg-yellow-500 text-white' 
                      : index === 1 
                        ? 'bg-gray-400 text-white' 
                        : 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Player avatar */}
              <div className="flex-shrink-0">
                <div className={`h-12 w-12 rounded-full ${isCurrentUser ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center text-white text-sm`}>
                  <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                </div>
              </div>

              {/* Player info - takes remaining space */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="font-medium text-gray-900 truncate">
                    {user.displayName}{isCurrentUser ? ' (You)' : ''}
                  </div>
                  <div className="inline-block bg-primary bg-opacity-10 text-primary text-xs font-medium rounded-full px-2 py-1 flex-shrink-0">
                    Level {user.level}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{user.skillLevel} Skill Level</div>
                
                {/* Stats row - mobile optimized */}
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-semibold text-gray-900">{(user.rating / 1000).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">W/L:</span>
                    <span className="font-medium">{user.wins}/{user.losses}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">XP:</span>
                    <span className="font-medium text-secondary">{user.xp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardTable;
