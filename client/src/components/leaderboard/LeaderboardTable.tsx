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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-sm text-gray-500 border-b border-gray-100">
            <th className="p-3 text-center">Rank</th>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-center">Rating</th>
            <th className="p-3 text-center">W/L</th>
            <th className="p-3 text-center">XP</th>
            <th className="p-3 text-center">Level</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => {
            const isCurrentUser = currentUser && user.id === currentUser.id;
            
            return (
              <tr 
                key={user.id} 
                className={`border-b border-gray-100 ${isCurrentUser ? 'bg-primary bg-opacity-5' : ''} hover:bg-gray-50`}
              >
                <td className="p-3 text-center font-medium w-16">{index + 1}</td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full ${isCurrentUser ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center text-white text-sm mr-3`}>
                      <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.displayName}{isCurrentUser ? ' (You)' : ''}
                      </div>
                      <div className="text-xs text-gray-500">{user.skillLevel} Skill Level</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-bold">{(user.rating / 1000).toFixed(1)}</td>
                <td className="p-3 text-center">{user.wins}/{user.losses}</td>
                <td className="p-3 text-center font-medium text-secondary">{user.xp.toLocaleString()}</td>
                <td className="p-3 text-center">
                  <div className="inline-block bg-primary bg-opacity-10 text-primary text-xs font-medium rounded-full px-2 py-1">
                    Level {user.level}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
