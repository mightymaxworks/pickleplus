import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, TrendingUp, Award, Filter } from 'lucide-react';
import { User } from '@shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PCPRankingsProps {
  user: User;
}

export function PCPRankings({ user }: PCPRankingsProps) {
  const { toast } = useToast();
  
  // State for selected format  
  const [format, setFormat] = React.useState<'singles' | 'doubles'>('singles');
  
  // Fetch ranking data using the same API as the enhanced leaderboard
  const { data: rankingData, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/enhanced-leaderboard`, format, 'open', 'all', 1, 10],
    queryFn: async () => {
      const response = await fetch(`/api/enhanced-leaderboard?format=${format}&division=open&gender=all&page=1&limit=10`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ranking data');
      }
      return response.json();
    }
  });
  
  // Find current user in the ranking data
  const userRanking = React.useMemo(() => {
    if (!rankingData?.players || !user) return null;
    
    return rankingData.players.find((player: any) => 
      player.id === user.id || player.username === user.username
    );
  }, [rankingData, user]);
  
  // Get user's ranking information
  const userStats = React.useMemo(() => {
    const points = format === 'singles' ? 
      (user?.singlesRankingPoints || 0) : 
      (user?.doublesRankingPoints || 0);
    
    const rank = userRanking?.ranking || 0;
    const totalPlayers = rankingData?.totalCount || 0;
    const percentile = totalPlayers > 0 && rank > 0 ? 
      Math.round(((totalPlayers - rank) / totalPlayers) * 100) : 0;
      
    return {
      points,
      rank,
      percentile,
      isRanked: points > 0 && rank > 0
    };
  }, [user, format, userRanking, rankingData]);
  
  // Get top 3 players for display
  const topPlayers = React.useMemo(() => {
    if (!rankingData?.players) return [];
    
    return rankingData.players.slice(0, 3).map((player: any) => ({
      name: player.displayName || player.username,
      points: player.points || 0,
      rank: player.ranking || 0,
      userId: player.id
    }));
  }, [rankingData]);

  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center">
            <Award className="mr-2 h-5 w-5" />
            PCP Rankings
          </h3>
        </div>
        <p className="text-white/80 text-xs mt-1">Competitive Points determine your global ranking</p>
      </div>
      
      {/* Format Selector */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as 'singles' | 'doubles')}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singles">Singles</SelectItem>
              <SelectItem value="doubles">Doubles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-6">
            <p className="text-red-500 dark:text-red-400 text-sm">
              Failed to load ranking data
            </p>
            <button 
              className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-[#FF5722] mr-1" />
                  <span className="text-xs text-gray-500">Points</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {userStats.isRanked ? userStats.points.toLocaleString() : '0'}
                </div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-500">Rank</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {userStats.isRanked ? `#${userStats.rank}` : 'Unranked'}
                </div>
              </div>
            </div>
            
            {/* Top Players */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                {format === 'singles' ? (
                  <Trophy className="h-4 w-4 mr-1" />
                ) : (
                  <Users className="h-4 w-4 mr-1" />
                )}
                Top {format.charAt(0).toUpperCase() + format.slice(1)} Players
              </h4>
              
              <div className="space-y-2">
                {topPlayers.length > 0 ? (
                  topPlayers.map((player, index) => (
                    <div key={player.userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        {player.points.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No {format} rankings available yet
                  </div>
                )}
              </div>
            </div>
            
            {!userStats.isRanked && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                  Play {format} matches to earn ranking points!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}