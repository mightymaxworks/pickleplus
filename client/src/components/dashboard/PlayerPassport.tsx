import React from 'react';
import { User } from '@shared/schema';
import { OfficialPicklePlusWhiteLogo } from '@/components/icons/OfficialPicklePlusLogo';
import { Trophy } from 'lucide-react';

interface PlayerPassportProps {
  user: User;
}

export function PlayerPassport({ user }: PlayerPassportProps) {
  // Function to get initials from display name
  const getInitials = () => {
    if (!user.displayName) return user.username.substring(0, 2).toUpperCase();
    
    const nameParts = user.displayName.split(' ');
    return nameParts.length > 1 
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();
  };
  
  // Determine if user is a founding member (could be based on a field in user object)
  const isFoundingMember = user.id === 1; // Example condition
  
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl min-h-[200px]">
      {/* Top border accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
      
      {/* Header with orange gradient */}
      <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-4">
        <div className="flex justify-between items-center text-white">
          <div className="font-bold text-lg">
            {isFoundingMember ? "Founding Member" : "Player Passport"}
          </div>
          <OfficialPicklePlusWhiteLogo className="h-8 w-auto" />
        </div>
        
        {/* Player info */}
        <div className="flex items-center mt-3">
          <div className="h-16 w-16 rounded-full bg-white p-0.5 mr-3 shadow">
            <div className={`h-full w-full rounded-full flex items-center justify-center text-white font-bold text-xl ${
              isFoundingMember 
                ? 'bg-gradient-to-r from-[#BF953F] to-[#FBF5B7] via-[#AA771C]' 
                : 'bg-gradient-to-r from-[#2196F3] to-[#03A9F4]'
            }`}>
              {getInitials()}
            </div>
          </div>
          
          <div>
            <div className="font-bold text-lg text-white">
              {user.displayName || user.username}
            </div>
            <div className="text-sm text-white/90">
              <div className="bg-white/20 rounded-full px-2 py-0.5 flex items-center inline-block">
                <Trophy size={12} className="text-yellow-300 mr-1" />
                {user.skillLevel || '3.5 Intermediate+'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats section with glass morphism effect */}
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Level {user.level || 5} • {user.xp || 520} XP
        </div>
        
        {/* XP Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF9800] rounded-full"
            style={{ width: `${Math.min((user.xp || 520) / 10, 100)}%` }}
          ></div>
        </div>
        
        {/* Simple stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">1,248</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Matches</div>
            <div className="font-bold text-green-600 dark:text-green-400">{user.totalMatches || 24}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
            <div className="font-bold text-purple-600 dark:text-purple-400">7th</div>
          </div>
        </div>
      </div>
    </div>
  );
}