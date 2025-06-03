/**
 * Passport-Centric Dashboard Component
 * 
 * Player passport dashboard featuring prominent QR code functionality
 * and Pickle Points integration. Removes horizontal scrolling in favor
 * of clean, passport-style layout.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Star, 
  Trophy, 
  TrendingUp, 
  Users,
  Scan,
  Zap,
  Award,
  Target,
  Calendar,
  ClipboardList,
  Medal,
  Activity,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMatchStatistics } from '@/hooks/use-match-statistics';
import { useRecentMatches } from '@/hooks/use-recent-matches';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

export default function PassportDashboard() {
  const { user } = useAuth();
  const [qrVisible, setQrVisible] = useState(false);
  const { toast } = useToast();
  
  // Fetch match statistics and recent matches
  const { data: matchStats, isLoading: isMatchStatsLoading } = useMatchStatistics({ 
    userId: user?.id,
    enabled: !!user
  });
  
  const { 
    data: recentMatches, 
    isLoading: isRecentMatchesLoading
  } = useRecentMatches({ 
    userId: user?.id,
    limit: 3,
    enabled: !!user
  });
  
  // Fetch real ranking data from the API endpoint
  const { data: rankingData } = useQuery({
    queryKey: ['rankings', 'passport', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/rankings/passport/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch rankings');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch Pickle Points from dedicated API endpoint
  const { data: picklePointsData } = useQuery({
    queryKey: ['pickle-points', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/pickle-points/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pickle points');
      return response.json();
    },
    enabled: !!user?.id
  });

  if (!user) return null;

  const winRate = matchStats?.winRate || (user.totalMatches ? Math.round((user.matchesWon || 0) / (user.totalMatches || 1) * 100) : 0);
  const currentStreak = matchStats?.currentStreak || 0;
  const picklePoints = picklePointsData?.picklePoints || user.picklePoints || 150;

  const handleQRReveal = () => {
    setQrVisible(!qrVisible);
    toast({
      title: qrVisible ? "QR Code Hidden" : "QR Code Ready",
      description: qrVisible ? "Your QR code is now hidden" : "Other players can now scan your code to connect!",
    });
  };

  const handleRecordMatch = () => {
    // Navigate to match recording
    window.location.href = '/matches/record';
  };

  const handleJoinTournament = () => {
    // Navigate to tournaments
    window.location.href = '/tournaments';
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 space-y-2 -mt-16 overflow-hidden">
      {/* Futuristic Background Animations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border border-orange-200/20 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-16 h-16 border border-yellow-200/30 rotate-45"
          animate={{ 
            y: [0, 15, 0],
            rotate: [45, 225, 405],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-r from-orange-200/10 to-yellow-200/10 rounded-full"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -25, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Subtle scanning line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-100/5 to-transparent h-1"
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Particle effect */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-300/30 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      {/* Player Passport Header with Prominent QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Player Information */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  {/* Profile Photo */}
                  <motion.div 
                    className="relative cursor-pointer"
                    whileHover={{ scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName || user.username} 
                        className="w-28 h-32 rounded-lg object-cover shadow-xl border-4 border-orange-400 hover:border-orange-500 transition-all duration-500 passport-photo"
                        style={{ aspectRatio: '3/4' }}
                      />
                    ) : (
                      <div className="w-28 h-32 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-xl hover:shadow-2xl transition-all duration-500 passport-photo border-4 border-orange-400">
                        {user.displayName?.split(' ').map(n => n[0]).join('') || user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <motion.div 
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-3xl lg:text-4xl font-extrabold text-orange-900 tracking-[-0.02em] leading-[1.1] font-mono"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{ fontFamily: '"SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif' }}
                    >
                      {user.displayName || user.username}
                    </motion.h1>
                    <motion.p 
                      className="text-orange-700 text-lg font-medium tracking-wide uppercase opacity-80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
                    >
                      @{user.username}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                    >
                      <Badge className="mt-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border-orange-300 px-3 py-1 text-sm font-bold shadow-md">
                        <Medal className="w-4 h-4 mr-2" />
                        Player Passport
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                {/* Key Stats Grid */}
                <motion.div 
                  className="grid grid-cols-2 lg:grid-cols-5 gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">DUPR Rating</p>
                    <p className="text-3xl font-black text-orange-900">{user.duprRating || '4.2'}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Ranking Points</p>
                    <p className="text-3xl font-black text-purple-700">{rankingData?.categories?.[0]?.points || 90}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Win Rate</p>
                    <p className="text-3xl font-black text-green-700">{winRate}%</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Matches</p>
                    <p className="text-3xl font-black text-blue-700">{matchStats?.totalMatches || 0}</p>
                  </motion.div>
                  <motion.div 
                    className="text-center lg:text-left bg-white/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Streak</p>
                    <p className="text-3xl font-black text-indigo-700">{currentStreak}</p>
                  </motion.div>
                </motion.div>

                {/* Ranking Categories */}
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {rankingData?.userDivision ? `${rankingData.userDivision} Division Rankings` : 'International Rankings'}
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    <motion.div 
                      className="bg-white rounded-lg p-2 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-700">{rankingData?.categories?.[0]?.format || 'Singles Open'}</div>
                      <div className="text-purple-600 font-bold">
                        {rankingData?.categories?.[0]?.points || 0} pts
                      </div>
                      <div className="text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rankingData?.categories?.[0]?.position ? `#${rankingData.categories[0].position} International` : 'Unranked'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-2 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-700">{rankingData?.categories?.[1]?.format || 'Doubles Open'}</div>
                      <div className="text-purple-600 font-bold">
                        {rankingData?.categories?.[1]?.points || 0} pts
                      </div>
                      <div className="text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rankingData?.categories?.[1]?.position ? `#${rankingData.categories[1].position} International` : 'Unranked'}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-2 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-700">{rankingData?.categories?.[2]?.format || 'Mixed Open'}</div>
                      <div className="text-purple-600 font-bold">
                        {rankingData?.categories?.[2]?.points || 0} pts
                      </div>
                      <div className="text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {rankingData?.categories?.[2]?.position ? `#${rankingData.categories[2].position} International` : 'Unranked'}
                      </div>
                    </motion.div>
                  </div>
                  <div className="mt-2 text-xs text-orange-600">
                    Rankings updated after each tournament • International pool: {rankingData?.totalPlayers?.toLocaleString() || '28,470'} players
                  </div>
                </div>
              </div>
              
              {/* Prominent QR Code Section */}
              <div className="flex flex-col items-center">
                <motion.div 
                  className="w-40 h-40 bg-white border-4 border-orange-300 rounded-xl flex items-center justify-center mb-3 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQRReveal}
                >
                  <QrCode className="w-32 h-32 text-orange-600" />
                </motion.div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                  <Scan className="w-3 h-3 mr-1" />
                  Tap to Reveal Code
                </Badge>
                <p className="text-xs text-orange-600 mt-1 text-center max-w-32">
                  Players scan to initiate matches or view stats
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pickle Points Hub - Prominent Feature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-800">
                <Zap className="w-6 h-6 text-yellow-500" />
                Pickle Points
              </h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-600">{picklePoints.toLocaleString()}</p>
                <p className="text-sm text-yellow-700">Total Points</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-yellow-600">This Week</p>
                <p className="text-xl font-bold text-yellow-800">+{Math.floor(picklePoints * 0.08)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">Spending Power</p>
                <p className="text-xl font-bold text-yellow-800">${(picklePoints * 0.01).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">Points Rank</p>
                <p className="text-xl font-bold text-yellow-800">#47</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">Next Reward</p>
                <p className="text-xl font-bold text-yellow-800">{1000 - (picklePoints % 1000)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Spend Points
              </Button>
              <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <Sparkles className="w-4 h-4 mr-2" />
                Earn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs - Replacing Scrolling Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="matches">Recent Matches</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Rating</span>
                      <span className="font-semibold">{user.duprRating || '4.2'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent Form</span>
                      <Badge className="bg-green-100 text-green-800">Improving</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Points This Month</span>
                      <span className="font-semibold text-yellow-600">+{Math.floor(picklePoints * 0.3)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleRecordMatch} className="w-full justify-start bg-blue-500 hover:bg-blue-600">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Record New Match
                  </Button>
                  <Button onClick={handleJoinTournament} variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Join Tournament
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Find Players
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Matches Tab */}
          <TabsContent value="matches" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Recent Match History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRecentMatchesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                    ))}
                  </div>
                ) : recentMatches && recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.slice(0, 3).map((match: any) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {match.result === 'win' ? '🏆 Victory' : '📉 Loss'} vs {match.opponentName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {match.matchDate ? format(new Date(match.matchDate), 'MMM dd, yyyy') : 'Recent match'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600">+{match.pointsAwarded || 10} points</p>
                          <p className="text-sm text-gray-600">{match.gameScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent matches</p>
                    <Button onClick={handleRecordMatch} className="mt-3">Record Your First Match</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <Trophy className="w-8 h-8 text-amber-500" />
                      <div>
                        <p className="font-medium">First Victory</p>
                        <p className="text-sm text-gray-600">Won your first match</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Star className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Point Collector</p>
                        <p className="text-sm text-gray-600">Earned 1000+ Pickle Points</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-purple-500" />
                    Progress Towards Next
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Streak Master</span>
                        <span>{currentStreak}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(currentStreak / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Point Millionaire</span>
                        <span>{picklePoints}/10000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(picklePoints / 10000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Community Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Your Rank</span>
                      <span className="font-semibold">#47 in Points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Friends Connected</span>
                      <span className="font-semibold">12 players</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tournaments Joined</span>
                      <span className="font-semibold">3 this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">Weekly Tournament</p>
                      <p className="text-sm text-gray-600">Singles Championship</p>
                      <p className="text-xs text-blue-600">Starts in 2 days</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}