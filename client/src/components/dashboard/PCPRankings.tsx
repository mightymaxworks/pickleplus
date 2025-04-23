import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Medal, ChevronRight, Crown, Award, Filter, ArrowUp, ArrowDown, LineChart as ChartLineIcon } from 'lucide-react';
import { User } from '@shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AgeDivision, 
  PlayFormat, 
  LeaderboardEntry,
  RatingTier 
} from "@shared/multi-dimensional-rankings";
import { usePCPGlobalRankingData } from "@/hooks/use-pcp-global-rankings";

interface PCPRankingsProps {
  user: User;
}

export function PCPRankings({ user }: PCPRankingsProps) {
  // State for selected format and division
  const [format, setFormat] = React.useState<PlayFormat>('singles');
  const [ageDivision, setAgeDivision] = React.useState<AgeDivision>('19plus');
  
  // Use the custom hook to fetch data from the API
  const {
    leaderboard,
    position,
    history,
    tiers,
    // PKL-278651-RANK-0004-THRESH - Ranking Table Threshold fields
    leaderboardStatus,
    playerCount,
    requiredCount,
    leaderboardMessage,
    leaderboardGuidance,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = usePCPGlobalRankingData(user.id, format, ageDivision);
  
  // Calculate recent gain (last 7 days)
  const sevenDaysAgo = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);
  
  // Prepare the ranking data
  const rankingData = React.useMemo(() => {
    // If data is loading or there's an error, return default values
    if (isLoading || isError || !position || !leaderboard) {
      return {
        points: 0,
        rank: 0,
        tier: 'Bronze',
        percentile: 0,
        recentGain: 0,
        topPlayers: [],
        hasInsufficientData: false,
        isNotRanked: false,
        showEncouragement: true
      };
    }
    
    // Check for insufficient data or not ranked status
    const hasInsufficientData = position.status === "insufficient_data";
    const isNotRanked = position.status === "not_ranked";
    
    // If we have insufficient data or not ranked status, return default values with flags
    if (hasInsufficientData || isNotRanked) {
      // Get top players for visibility even if user isn't ranked
      const topPlayers = Array.isArray(leaderboard) ? leaderboard.slice(0, 3).map(player => ({
        name: player.displayName || player.username,
        points: player.pointsTotal || player.rankingPoints || 0,
        rank: player.position || player.rank || 0,
        userId: player.userId
      })) : [];
      
      return {
        points: 0,
        rank: 0,
        tier: 'Bronze',
        percentile: 0,
        recentGain: 0,
        topPlayers, // Show top players even when user isn't ranked
        hasInsufficientData,
        isNotRanked,
        showEncouragement: true,
        message: hasInsufficientData 
          ? "Play a few more matches to receive your initial ranking"
          : "Complete your first match to join the rankings!"
      };
    }
    
    // Calculate percentile
    const totalPlayers = position.totalPlayers || 0;
    const rank = position.rank || 0;
    const percentile = totalPlayers > 0 ? Math.round(((totalPlayers - rank) / totalPlayers) * 100) : 0;
    
    // Calculate recent ranking gains/losses
    const recentHistory = history
      .filter(entry => new Date(entry.timestamp || '') >= sevenDaysAgo)
      .filter(entry => entry.format === format && entry.ageDivision === ageDivision);
    
    const recentGain = recentHistory.reduce((acc, entry) => {
      // If we don't have old/new ranking fields, use a default gain of 0
      if (!entry.oldRanking || !entry.newRanking) return acc;
      return acc + (entry.newRanking - entry.oldRanking);
    }, 0);
    
    // Determine tier based on points
    const rankingPoints = position.rankingPoints || 0;
    const userTier = tiers.find(tier => 
      rankingPoints >= tier.minRating && 
      rankingPoints <= (tier.maxRating || 5.0)
    ) || tiers[0];
    
    // Format top players from leaderboard
    const topPlayers = Array.isArray(leaderboard) ? leaderboard.slice(0, 3).map(player => ({
      name: player.displayName || player.username,
      points: player.pointsTotal || player.rankingPoints || 0,
      rank: player.position || player.rank || 0,
      userId: player.userId
    })) : [];
    
    return {
      points: position.rankingPoints || 0,
      rank: position.rank || 0,
      tier: userTier?.name || 'Bronze',
      percentile: percentile || 0,
      recentGain: recentGain,
      topPlayers,
      hasInsufficientData: false,
      isNotRanked: false,
      showEncouragement: false
    };
  }, [isLoading, isError, position, leaderboard, history, tiers, format, ageDivision, sevenDaysAgo]);
  
  // Get proper tier color
  const getTierColor = (tierName: string) => {
    const tier = tiers.find(t => t.name === tierName);
    if (tier?.colorCode) {
      return tier.colorCode;
    }
    
    // Fallback colors if not found in data
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-cyan-600';
      case 'diamond': return 'from-blue-400 to-purple-500';
      case 'master': return 'from-purple-600 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Animations for numbers counting up
  const [animatedPoints, setAnimatedPoints] = React.useState(0);
  const [animatedRank, setAnimatedRank] = React.useState(100);
  const [animatedPercentile, setAnimatedPercentile] = React.useState(0);

  React.useEffect(() => {
    if (isLoading) return;
    
    const duration = 1500;
    const pointsInterval = 30;
    const rankInterval = 30;
    const percentileInterval = 30;
    
    let pointsTimer: NodeJS.Timeout;
    let rankTimer: NodeJS.Timeout;
    let percentileTimer: NodeJS.Timeout;
    
    // Animate points counting up
    const pointsStep = Math.ceil(rankingData.points / (duration / pointsInterval));
    pointsTimer = setInterval(() => {
      setAnimatedPoints(prev => {
        if (prev + pointsStep >= rankingData.points) {
          clearInterval(pointsTimer);
          return rankingData.points;
        }
        return prev + pointsStep;
      });
    }, pointsInterval);
    
    // Animate rank counting down
    const rankStart = 100; // Higher starting rank for better animation
    const rankStep = Math.ceil((rankStart - rankingData.rank) / (duration / rankInterval));
    rankTimer = setInterval(() => {
      setAnimatedRank(prev => {
        if (prev - rankStep <= rankingData.rank) {
          clearInterval(rankTimer);
          return rankingData.rank;
        }
        return prev - rankStep;
      });
    }, rankInterval);
    
    // Animate percentile counting up
    const percentileStep = Math.ceil(rankingData.percentile / (duration / percentileInterval));
    percentileTimer = setInterval(() => {
      setAnimatedPercentile(prev => {
        if (prev + percentileStep >= rankingData.percentile) {
          clearInterval(percentileTimer);
          return rankingData.percentile;
        }
        return prev + percentileStep;
      });
    }, percentileInterval);
    
    return () => {
      clearInterval(pointsTimer);
      clearInterval(rankTimer);
      clearInterval(percentileTimer);
    };
  }, [rankingData, isLoading]);
  
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
          <motion.button 
            className="bg-white/20 rounded-full p-1.5 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
        <p className="text-white/80 text-xs mt-1">Pickle+ Competitive Points determine your global ranking</p>
      </div>
      
      {/* Format and Division Selector */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            <Filter className="h-3 w-3 mr-1" />
            Format
          </label>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as PlayFormat)}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singles">Singles</SelectItem>
              <SelectItem value="doubles">Doubles</SelectItem>
              <SelectItem value="mixed">Mixed Doubles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            <Filter className="h-3 w-3 mr-1" />
            Division
          </label>
          <Select
            value={ageDivision}
            onValueChange={(value) => setAgeDivision(value as AgeDivision)}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="19plus">Open (19+)</SelectItem>
              <SelectItem value="35plus">35+</SelectItem>
              <SelectItem value="50plus">50+</SelectItem>
              <SelectItem value="60plus">60+</SelectItem>
              <SelectItem value="70plus">70+</SelectItem>
              <SelectItem value="U19">Junior U19</SelectItem>
              <SelectItem value="U16">Junior U16</SelectItem>
              <SelectItem value="U14">Junior U14</SelectItem>
              <SelectItem value="U12">Junior U12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-8 w-32 mt-4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-2" />
          </div>
        ) : isError ? (
          // Error state
          <div className="text-center py-6">
            <p className="text-red-500 dark:text-red-400">
              Failed to load ranking data. Please try again.
            </p>
            <button 
              className="mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* User's PCP stats with animations */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Points */}
              <motion.div 
                className="flex-1 border border-gray-200 dark:border-gray-800 rounded-xl p-3 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF5722]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center mb-1">
                  <TrendingUp size={16} className="text-[#FF5722] mr-1" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">PCP Score</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {rankingData.showEncouragement ? (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">
                        {rankingData.hasInsufficientData ? "Ready to Climb!" : "Start Your Journey!"}
                      </span>
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                        {rankingData.message || "Play matches to earn points"}
                      </span>
                    </div>
                  ) : (
                    <>
                      {animatedPoints.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">pts</span>
                    </>
                  )}
                </div>
                <div className="mt-1 flex items-center text-xs">
                  {rankingData.showEncouragement ? (
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                      Track your progress here!
                    </div>
                  ) : rankingData.recentGain > 0 ? (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full flex items-center">
                      <ArrowUp size={10} className="mr-0.5" />
                      +{rankingData.recentGain} this week
                    </div>
                  ) : rankingData.recentGain < 0 ? (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full flex items-center">
                      <ArrowDown size={10} className="mr-0.5" />
                      {rankingData.recentGain} this week
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                      No change this week
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Rank & Tier */}
              <motion.div 
                className="flex-1 border border-gray-200 dark:border-gray-800 rounded-xl p-3 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center mb-1">
                  <Medal size={16} className="text-blue-500 mr-1" />
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Global Rank</div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {rankingData.showEncouragement ? (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                        {rankingData.hasInsufficientData ? "Keep Competing!" : "Future Champion!"}
                      </span>
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
                        Complete more matches to rank up
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      #{animatedRank}
                      <span className="ml-2 px-2 py-0.5 text-sm text-white rounded-full font-normal flex items-center justify-center" 
                        style={{ 
                          background: tiers.find(t => t.name === rankingData.tier)?.colorCode || 'linear-gradient(to right, var(--tier-start), var(--tier-end))',
                          '--tier-start': '#C0C0C0',
                          '--tier-end': '#A9A9A9',
                        } as React.CSSProperties}
                      >
                        {rankingData.tier}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-xs">
                  {rankingData.showEncouragement ? (
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                      Your journey begins here!
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Better than {animatedPercentile}% of players
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Top Players */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                <Crown size={14} className="mr-1 text-yellow-500" />
                Top Players • {format.charAt(0).toUpperCase() + format.slice(1)} • {ageDivision === '19plus' ? 'Open' : ageDivision}
              </h4>
              
              {/* PKL-278651-RANK-0004-THRESH - Ranking Table Threshold System */}
              {leaderboardStatus === "insufficient_players" ? (
                <motion.div 
                  className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 text-center space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg inline-block">
                    <ChartLineIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {leaderboardGuidance?.title || "Coming Soon!"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {leaderboardMessage || `This leaderboard will be available once ${requiredCount || 20} players have competed in this category. Currently ${playerCount || 0} players.`}
                  </p>
                  {/* Invite Friends Button - Replace existing action */}
                  <motion.button
                    onClick={() => {
                      // Generate a referral link with the current user's ID
                      const referralLink = `${window.location.origin}/register?ref=${user.id}`;
                      
                      // Copy to clipboard
                      navigator.clipboard.writeText(referralLink).then(() => {
                        // Show success message using toast notification
                        const { toast } = require('@/hooks/use-toast');
                        toast({
                          title: "Referral Link Copied!",
                          description: "Share this link with friends and earn XP when they register!",
                          variant: "default",
                          duration: 5000,
                        });
                      }, (err) => {
                        console.error('Failed to copy: ', err);
                        // Handle fallback if clipboard fails
                        prompt("Copy this referral link to invite friends (you'll earn XP when they register):", referralLink);
                      });
                    }}
                    className="mt-2 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Invite Friends (Earn XP)
                  </motion.button>
                  
                  {/* Secondary Action - If still needed */}
                  {leaderboardGuidance?.secondaryAction && (
                    <motion.a
                      href={leaderboardGuidance.secondaryActionPath}
                      className="mt-2 block text-blue-500 hover:text-blue-600 text-sm"
                      whileHover={{ x: 2 }}
                    >
                      {leaderboardGuidance.secondaryAction}
                    </motion.a>
                  )}
                </motion.div>
              ) : (
                <>
                  <div className="space-y-2">
                    {rankingData.topPlayers.length > 0 ? (
                      rankingData.topPlayers.map((player, index) => (
                        <motion.div 
                          key={player.rank}
                          className="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-lg p-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 + 0.5 }}
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                              style={{
                                background: index === 0 
                                  ? 'linear-gradient(to bottom right, #FFD700, #FFC107)' 
                                  : index === 1 
                                  ? 'linear-gradient(to bottom right, #C0C0C0, #A9A9A9)' 
                                  : 'linear-gradient(to bottom right, #CD7F32, #A47449)'
                              }}
                            >
                              <span className="text-white text-xs font-bold">{player.rank}</span>
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{player.name}</span>
                            {/* Highlight if it's current user */}
                            {player.userId === user.id && (
                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-[#FF5722]">{player.points.toLocaleString()}</span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No players found in this category
                      </div>
                    )}
                  </div>
                  
                  {/* View More Button */}
                  {rankingData.topPlayers.length > 0 && (
                    <motion.a
                      href={`/leaderboard?format=${format}&division=${ageDivision}`}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      View Full Leaderboard
                      <ChevronRight size={14} className="ml-1" />
                    </motion.a>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}