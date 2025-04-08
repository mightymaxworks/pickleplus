import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Medal, ChevronRight, Crown, Award } from 'lucide-react';
import { User } from '@shared/schema';

interface PCPRankingsProps {
  user: User;
}

export function PCPRankings({ user }: PCPRankingsProps) {
  // Example PCP data - in a real app this would come from API
  const pcpData = {
    points: 1248,
    rank: 7,
    tier: 'Silver',
    percentile: 85,
    recentGain: 24,
    topPlayers: [
      { name: 'JaneDoe', points: 2145, rank: 1 },
      { name: 'JohnSmith', points: 1964, rank: 2 },
      { name: 'MikeTyson', points: 1858, rank: 3 },
    ]
  };

  // Get proper tier color
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
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
    const duration = 1500;
    const pointsInterval = 30;
    const rankInterval = 30;
    const percentileInterval = 30;
    
    let pointsTimer: NodeJS.Timeout;
    let rankTimer: NodeJS.Timeout;
    let percentileTimer: NodeJS.Timeout;
    
    // Animate points counting up
    const pointsStep = Math.ceil(pcpData.points / (duration / pointsInterval));
    pointsTimer = setInterval(() => {
      setAnimatedPoints(prev => {
        if (prev + pointsStep >= pcpData.points) {
          clearInterval(pointsTimer);
          return pcpData.points;
        }
        return prev + pointsStep;
      });
    }, pointsInterval);
    
    // Animate rank counting down
    const rankStep = Math.ceil((100 - pcpData.rank) / (duration / rankInterval));
    rankTimer = setInterval(() => {
      setAnimatedRank(prev => {
        if (prev - rankStep <= pcpData.rank) {
          clearInterval(rankTimer);
          return pcpData.rank;
        }
        return prev - rankStep;
      });
    }, rankInterval);
    
    // Animate percentile counting up
    const percentileStep = Math.ceil(pcpData.percentile / (duration / percentileInterval));
    percentileTimer = setInterval(() => {
      setAnimatedPercentile(prev => {
        if (prev + percentileStep >= pcpData.percentile) {
          clearInterval(percentileTimer);
          return pcpData.percentile;
        }
        return prev + percentileStep;
      });
    }, percentileInterval);
    
    return () => {
      clearInterval(pointsTimer);
      clearInterval(rankTimer);
      clearInterval(percentileTimer);
    };
  }, []);
  
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
      
      {/* Main Content */}
      <div className="p-4">
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
              {animatedPoints.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">pts</span>
            </div>
            <div className="mt-1 flex items-center text-xs">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full flex items-center">
                <TrendingUp size={10} className="mr-0.5" />
                +{pcpData.recentGain} this week
              </div>
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
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              #{animatedRank}
              <span className="ml-2 px-2 py-0.5 text-sm bg-gradient-to-r text-white rounded-full font-normal flex items-center justify-center" 
                style={{ 
                  background: `linear-gradient(to right, var(--${pcpData.tier.toLowerCase()}-start), var(--${pcpData.tier.toLowerCase()}-end))`,
                  '--bronze-start': '#CD7F32',
                  '--bronze-end': '#A47449',
                  '--silver-start': '#C0C0C0',
                  '--silver-end': '#A9A9A9',
                  '--gold-start': '#FFD700',
                  '--gold-end': '#FFC107',
                  '--platinum-start': '#89CFF0',
                  '--platinum-end': '#61A2DA',
                  '--diamond-start': '#82CAFF',
                  '--diamond-end': '#4169E1',
                  '--master-start': '#9400D3',
                  '--master-end': '#800080',
                } as React.CSSProperties}
              >
                {pcpData.tier}
              </span>
            </div>
            <div className="mt-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Better than {animatedPercentile}% of players
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Top Players */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center">
            <Crown size={14} className="mr-1 text-yellow-500" />
            Top Players
          </h4>
          
          <div className="space-y-2">
            {pcpData.topPlayers.map((player, index) => (
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
                </div>
                <span className="font-bold text-[#FF5722]">{player.points.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
          
          {/* View More Button */}
          <motion.button
            className="w-full mt-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            View Full Leaderboard
            <ChevronRight size={14} className="ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}