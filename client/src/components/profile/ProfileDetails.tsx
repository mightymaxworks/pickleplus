import { User } from "@/lib/types";

interface ProfileDetailsProps {
  user: User;
}

const ProfileDetails = ({ user }: ProfileDetailsProps) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-8">
        <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center text-white text-4xl mb-4">
          <span>{user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
        </div>
        <div className="text-center">
          <div className="bg-primary bg-opacity-10 text-primary text-sm font-medium rounded-full px-3 py-1">
            Level {user.level}
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{user.displayName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Username</div>
            <div className="font-medium">{user.username}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-sm">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-sm">Player ID</div>
            <div className="font-medium">{user.playerId}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-sm">Skill Level</div>
            <div className="font-medium">{user.skillLevel}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-sm">Rating</div>
            <div className="font-medium">{(user.rating / 1000).toFixed(1)}</div>
          </div>
          
          <div>
            <div className="text-gray-500 text-sm">Total XP</div>
            <div className="font-medium">{user.xp.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
