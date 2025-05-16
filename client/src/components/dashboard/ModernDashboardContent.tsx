/**
 * PKL-278651-DASH-0010-REDESIGN
 * Modern Dashboard Content Component
 * 
 * A streamlined, ranking-focused dashboard implementation 
 * that centralizes ranking points as the main user metric.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-05-16
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  UserPlus, 
  ClipboardList,
  Calendar,
  Zap,
  Users,
  Star,
  Medal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BounceStatusTicker } from '@/components/bounce/BounceStatusTicker';
import { BounceAssistancePanel } from '@/components/bounce/BounceAssistancePanel';
import { useToast } from '@/hooks/use-toast';
import { RankingPointsCard } from './RankingPointsCard';
import { useMatchStatistics } from '@/hooks/use-match-statistics';
import { calculateLevelFromDb, getLevelInfoFromDb } from '@/lib/calculateLevelFromDatabase';
import SimpleSageWidget from '@/components/sage/SimpleSageWidget';
import { Skeleton } from '@/components/ui/skeleton';

export default function ModernDashboardContent() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Fetch match statistics data
  const { data: matchStats, isLoading: isMatchStatsLoading } = useMatchStatistics({ 
    userId: user?.id,
    enabled: !!user
  });
  
  // Animate elements in sequence after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!user) return null;
  
  // Calculate the correct level based on XP
  const dbLevel = calculateLevelFromDb(user.xp || 0);
  const levelInfo = getLevelInfoFromDb(user.xp || 0);
  
  // Calculate win rate only when match data is available
  const hasMatchData = (matchStats && matchStats.totalMatches && matchStats.totalMatches > 0) || (user.totalMatches && user.totalMatches > 0);
  const winRate = hasMatchData 
    ? matchStats?.winRate || (user.totalMatches ? Math.round((user.matchesWon || 0) / (user.totalMatches || 1) * 100) : 0)
    : null;
  
  return (
    <>
      {/* Background with subtle particle effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/10"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`
            }}
          ></div>
        ))}
      </div>
      
      {/* Main content with animated entrance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Bounce Testing Status Ticker - Moved above Welcome section */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
        >
          <BounceStatusTicker />
        </motion.div>
        
        {/* Bounce Assistance Requests - Display user testing assistance requests */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <BounceAssistancePanel />
        </motion.div>
        
        {/* Welcome Section */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                Welcome, <span className="text-indigo-500 dark:text-indigo-400">{user.displayName || user.username}</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl">
                Track your progress, earn ranking points, and climb the leaderboards.
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ranking Points Card - Primary Focus */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <RankingPointsCard user={user} />
          </motion.div>
          
          {/* Action Panel */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="shadow-md border-0 dark:border-gray-800 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-indigo-500" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 justify-start">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Record Match
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                  Join Tournament
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-5 w-5 text-indigo-500" />
                  Community Challenges
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Medal className="mr-2 h-5 w-5 text-indigo-500" />
                  Skill Development
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Recent Match History */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow-md border-0 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isMatchStatsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : !matchStats || matchStats.totalMatches === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No matches recorded yet</p>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Record Your First Match
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* This is a placeholder for recent matches - will be implemented in Sprint 4 */}
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">vs. JohnDoe123</div>
                        <div className="text-sm text-gray-500">Singles • 2 days ago</div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-green-500 font-medium mr-2">Win</div>
                        <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          +15 pts
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">vs. PicklePro</div>
                        <div className="text-sm text-gray-500">Doubles • 5 days ago</div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-red-500 font-medium mr-2">Loss</div>
                        <div className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                          -5 pts
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">vs. PaddleMaster</div>
                        <div className="text-sm text-gray-500">Singles • 1 week ago</div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-green-500 font-medium mr-2">Win</div>
                        <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          +12 pts
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Button variant="link" className="text-indigo-500 dark:text-indigo-400">
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Secondary Metrics Panel */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow-md border-0 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
                  Secondary Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* DUPR Rating */}
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">DUPR Rating</div>
                    <div className="text-2xl font-bold">{user.duprRating || "4.5"}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">External verified rating</div>
                  </div>
                  
                  {/* Win/Loss Ratio */}
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Win Rate</div>
                    <div className="text-2xl font-bold">{winRate ? `${winRate}%` : "N/A"}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Based on {matchStats?.totalMatches || 0} matches
                    </div>
                  </div>
                  
                  {/* XP Level */}
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">XP Level</div>
                    <div className="text-2xl font-bold">Level {dbLevel}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {levelInfo.xpProgressPercentage}% to Level {dbLevel + 1}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* SAGE - Platform Assistant */}
          <motion.div 
            className="lg:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-indigo-600 text-transparent bg-clip-text">
                SAGE
              </h3>
              <div className="ml-2 text-xs bg-gradient-to-r from-blue-400 to-indigo-600 text-white px-2 py-0.5 rounded-full">
                Platform Assistant
              </div>
            </div>
            <SimpleSageWidget />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}