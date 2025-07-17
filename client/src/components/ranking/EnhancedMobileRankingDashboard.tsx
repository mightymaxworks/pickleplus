/**
 * Enhanced Mobile Ranking Dashboard - PKL-278651 Interactive Visualization
 * Touch-friendly ranking displays with swipe gestures and progress animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, PanInfo } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Users, 
  Medal, 
  Crown, 
  Flame, 
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  BarChart3,
  Calendar,
  Globe,
  MapPin,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Share2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RankingDivision {
  id: string;
  name: string;
  format: 'singles' | 'doubles' | 'mixed';
  division: string;
  currentRank: number;
  totalPlayers: number;
  points: number;
  trend: 'up' | 'down' | 'stable';
  recentChange: number;
  nextRankPoints?: number;
  matches: {
    played: number;
    required: number;
  };
  topPlayers?: {
    rank: number;
    name: string;
    points: number;
    change: number;
  }[];
}

interface EnhancedMobileRankingDashboardProps {
  onViewFullRankings?: () => void;
  onChallengePlayer?: (playerId: string) => void;
}

export default function EnhancedMobileRankingDashboard({
  onViewFullRankings,
  onChallengePlayer
}: EnhancedMobileRankingDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDivision, setSelectedDivision] = useState(0);
  const [viewMode, setViewMode] = useState<'personal' | 'leaderboard' | 'trends'>('personal');
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Animated swipe tracking
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const rotate = useTransform(x, [-100, 0, 100], [-5, 0, 5]);

  // Fetch ranking data
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['/api/rankings/user-divisions'],
    queryFn: async (): Promise<RankingDivision[]> => ([
      {
        id: 'open-singles',
        name: 'Open Singles',
        format: 'singles',
        division: 'Open',
        currentRank: 15,
        totalPlayers: 124,
        points: 1247,
        trend: 'up',
        recentChange: 23,
        nextRankPoints: 1280,
        matches: { played: 7, required: 10 },
        topPlayers: [
          { rank: 1, name: 'Alex Champion', points: 1890, change: 12 },
          { rank: 2, name: 'Sarah Pro', points: 1875, change: -5 },
          { rank: 3, name: 'Mike Elite', points: 1834, change: 8 }
        ]
      },
      {
        id: '35-doubles',
        name: '35+ Doubles',
        format: 'doubles',
        division: '35+',
        currentRank: 8,
        totalPlayers: 89,
        points: 1456,
        trend: 'up',
        recentChange: 34,
        nextRankPoints: 1490,
        matches: { played: 9, required: 10 },
        topPlayers: [
          { rank: 1, name: 'Team Thunder', points: 1720, change: 15 },
          { rank: 2, name: 'Power Pair', points: 1698, change: -8 },
          { rank: 3, name: 'Net Masters', points: 1665, change: 22 }
        ]
      },
      {
        id: 'mixed-open',
        name: 'Mixed Doubles',
        format: 'mixed',
        division: 'Open',
        currentRank: 23,
        totalPlayers: 156,
        points: 1123,
        trend: 'stable',
        recentChange: 0,
        nextRankPoints: 1180,
        matches: { played: 4, required: 10 }
      }
    ])
  });

  // Handle division swipe
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && selectedDivision > 0) {
      setSelectedDivision(selectedDivision - 1);
      x.set(0);
    } else if (info.offset.x < -threshold && rankingData && selectedDivision < rankingData.length - 1) {
      setSelectedDivision(selectedDivision + 1);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  // Get trend icon and color
  const getTrendDisplay = (trend: string, change: number) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return {
      icon: isPositive ? ArrowUp : isNegative ? ArrowDown : Minus,
      color: isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400',
      bgColor: isPositive ? 'bg-green-50' : isNegative ? 'bg-red-50' : 'bg-gray-50'
    };
  };

  // Render ranking progress
  const renderProgressToNextRank = (division: RankingDivision) => {
    if (!division.nextRankPoints) return null;
    
    const progress = ((division.points / division.nextRankPoints) * 100);
    const pointsNeeded = division.nextRankPoints - division.points;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progress to Rank {division.currentRank - 1}</span>
          <span className="text-sm font-medium text-gray-800">{pointsNeeded} points needed</span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <motion.div
            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  if (isLoading || !rankingData) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentDivision = rankingData[selectedDivision];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header with View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Rankings</h2>
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-auto">
          <TabsList className="grid w-full grid-cols-3 text-xs">
            <TabsTrigger value="personal" className="px-2">My Rank</TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-2">Leaders</TabsTrigger>
            <TabsTrigger value="trends" className="px-2">Trends</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Division Cards Container */}
      <div className="relative h-[400px]" ref={constraintsRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDivision}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x, rotate }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Card className="w-full h-full border-2 border-gray-200 overflow-hidden">
              <CardHeader className={cn(
                "pb-4",
                currentDivision.format === 'singles' && "bg-gradient-to-r from-blue-500 to-blue-600",
                currentDivision.format === 'doubles' && "bg-gradient-to-r from-purple-500 to-purple-600", 
                currentDivision.format === 'mixed' && "bg-gradient-to-r from-pink-500 to-pink-600"
              )}>
                <div className="flex items-center justify-between text-white">
                  <div>
                    <CardTitle className="text-lg font-bold">{currentDivision.name}</CardTitle>
                    <p className="text-white/80 text-sm">{currentDivision.division} Division</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">#{currentDivision.currentRank}</div>
                    <div className="text-white/80 text-xs">of {currentDivision.totalPlayers}</div>
                  </div>
                </div>
                
                {/* Division Indicators */}
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {rankingData.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === selectedDivision ? "bg-white" : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {viewMode === 'personal' && (
                  <>
                    {/* Current Points and Trend */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{currentDivision.points}</div>
                        <div className="text-sm text-gray-600">Ranking Points</div>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-1 px-3 py-1 rounded-full",
                        getTrendDisplay(currentDivision.trend, currentDivision.recentChange).bgColor
                      )}>
                        {React.createElement(
                          getTrendDisplay(currentDivision.trend, currentDivision.recentChange).icon,
                          { 
                            className: cn(
                              "w-4 h-4",
                              getTrendDisplay(currentDivision.trend, currentDivision.recentChange).color
                            )
                          }
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          getTrendDisplay(currentDivision.trend, currentDivision.recentChange).color
                        )}>
                          {currentDivision.recentChange !== 0 ? Math.abs(currentDivision.recentChange) : 'No change'}
                        </span>
                      </div>
                    </div>

                    {/* Progress to Next Rank */}
                    {renderProgressToNextRank(currentDivision)}

                    {/* Match Requirements */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Match Requirements</span>
                        <Badge variant={currentDivision.matches.played >= currentDivision.matches.required ? "default" : "secondary"}>
                          {currentDivision.matches.played >= currentDivision.matches.required ? "Qualified" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-orange-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentDivision.matches.played / currentDivision.matches.required) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {currentDivision.matches.played}/{currentDivision.matches.required}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {viewMode === 'leaderboard' && currentDivision.topPlayers && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 mb-3">Top Players</h4>
                    {currentDivision.topPlayers.map((player, index) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                            index === 0 && "bg-yellow-500 text-white",
                            index === 1 && "bg-gray-400 text-white",
                            index === 2 && "bg-orange-600 text-white",
                            index > 2 && "bg-gray-200 text-gray-700"
                          )}>
                            {index === 0 ? <Crown className="w-4 h-4" /> : player.rank}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.points} points</div>
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center space-x-1",
                          player.change > 0 ? "text-green-600" : player.change < 0 ? "text-red-600" : "text-gray-400"
                        )}>
                          {player.change > 0 && <ArrowUp className="w-3 h-3" />}
                          {player.change < 0 && <ArrowDown className="w-3 h-3" />}
                          {player.change === 0 && <Minus className="w-3 h-3" />}
                          <span className="text-xs font-medium">
                            {player.change !== 0 ? Math.abs(player.change) : '0'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'trends' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Ranking Trends</h4>
                    
                    {/* Simplified trend visualization */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center space-y-2">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Detailed trend analysis coming soon
                        </p>
                      </div>
                    </div>

                    {/* Recent Performance Summary */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Flame className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-800">5</div>
                        <div className="text-xs text-blue-600">Win Streak</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-800">+12</div>
                        <div className="text-xs text-green-600">Rank Change</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectedDivision > 0 && setSelectedDivision(selectedDivision - 1)}
          disabled={selectedDivision === 0}
          className="w-10 h-10 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          onClick={onViewFullRankings}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          <Eye className="w-4 h-4 mr-2" />
          View All Rankings
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => selectedDivision < rankingData.length - 1 && setSelectedDivision(selectedDivision + 1)}
          disabled={selectedDivision === rankingData.length - 1}
          className="w-10 h-10 rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              toast({
                title: "Challenge System",
                description: "Player challenging feature coming soon!",
              });
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Challenge
          </Button>
        </motion.div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              toast({
                title: "Ranking Shared",
                description: "Your ranking progress has been shared!",
              });
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </div>
    </div>
  );
}