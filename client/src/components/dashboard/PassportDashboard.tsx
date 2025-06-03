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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Camera,
  Calendar,
  ClipboardList,
  Medal,
  Activity,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin,
  Info,
  Upload
} from 'lucide-react';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import { useToast } from '@/hooks/use-toast';
import { useMatchStatistics } from '@/hooks/use-match-statistics';
import { useRecentMatches } from '@/hooks/use-recent-matches';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

export default function PassportDashboard() {
  const { user } = useAuth();
  const [qrVisible, setQrVisible] = useState(false);
  const [showPassportCode, setShowPassportCode] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
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
  
  // Fetch ATP ranking data (new system)
  const { data: atpRankingData } = useQuery({
    queryKey: ['atp-ranking', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/atp-ranking/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ATP ranking');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch Pickle Points data (new pure activity-based system)
  const { data: picklePointsData } = useQuery({
    queryKey: ['pickle-points', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/pickle-points/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pickle points');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch PCP Global Ranking data 
  const { data: pcpRankingData } = useQuery({
    queryKey: ['pcp-ranking', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/pcp-ranking/${user?.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch PCP rankings');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch legacy ranking data for comparison
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

  if (!user) return null;

  const winRate = matchStats?.winRate || (user.totalMatches ? Math.round((user.matchesWon || 0) / (user.totalMatches || 1) * 100) : 0);
  const currentStreak = matchStats?.currentStreak || 0;
  const picklePoints = picklePointsData?.picklePoints || user.picklePoints || 150;

  const handleQRReveal = () => {
    setQrVisible(!qrVisible);
    setShowPassportCode(!showPassportCode);
    toast({
      title: qrVisible ? "Code Hidden" : "Code Revealed",
      description: qrVisible ? "Your passport code is now hidden" : `Your passport code: ${user.passportCode}`,
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

  const handlePhotoUploadSuccess = (avatarUrl: string) => {
    setIsPhotoUploadOpen(false);
    toast({
      title: "Profile Photo Updated",
      description: "Your new profile photo has been uploaded successfully.",
    });
    // Refresh user data to show new avatar
    window.location.reload();
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 space-y-2 -mt-16 overflow-hidden">
      {/* Enhanced Futuristic Background Animations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Large floating geometric shapes - much more visible */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 border-2 border-orange-400/60 rounded-full bg-orange-100/20"
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-16 w-24 h-24 border-2 border-yellow-400/70 rotate-45 bg-yellow-100/25"
          animate={{ 
            y: [0, 25, 0],
            rotate: [45, 225, 405],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-r from-orange-300/40 to-yellow-300/40 rounded-full border border-orange-300/50"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* More visible scanning line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-200/30 to-transparent h-3"
          animate={{ y: ["-10vh", "110vh"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Enhanced particle effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-400/60 rounded-full shadow-lg"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Pulsing background orbs */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-200/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-yellow-200/25 rounded-full blur-lg"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
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
                  {/* Profile Photo with Upload Functionality */}
                  <motion.div 
                    className="relative cursor-pointer group"
                    whileHover={{ scale: 1.08, rotate: 2 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setIsPhotoUploadOpen(true)}
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
                    
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center text-white">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Update Photo</span>
                      </div>
                    </div>
                    
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
                  className="grid grid-cols-2 lg:grid-cols-6 gap-3"
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
                  <motion.div 
                    className="text-center lg:text-left bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,165,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => {
                      if (user.passportCode) {
                        navigator.clipboard.writeText(user.passportCode);
                        toast({
                          title: "Passport Code Copied!",
                          description: `${user.passportCode} copied to clipboard`,
                        });
                      }
                    }}
                  >
                    <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">Passport Code</p>
                    <p className="text-2xl font-mono font-black text-orange-800">
                      {user.passportCode || 'LOADING...'}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Tap to Copy</p>
                  </motion.div>
                </motion.div>

                {/* PCP Global Ranking Display */}
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    PCP Global Ranking System
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Render eligible categories */}
                    {(() => {
                      // Create eligible categories based on user age - younger players cannot play in older divisions
                      const userAge = pcpRankingData?.userAge || 25; // Default to 25 if age not available
                      const eligibleCategories = [
                        { format: 'mens_singles', division: 'open' },
                        { format: 'mens_doubles', division: 'open' },
                        { format: 'mixed_doubles', division: 'open' }
                      ];

                      // Add age-restricted divisions only if player is old enough
                      if (userAge >= 35) {
                        eligibleCategories.push(
                          { format: 'mens_singles', division: '35+' },
                          { format: 'mens_doubles', division: '35+' },
                          { format: 'mixed_doubles', division: '35+' }
                        );
                      }
                      
                      if (userAge >= 40) {
                        eligibleCategories.push(
                          { format: 'mens_singles', division: '40+' },
                          { format: 'mens_doubles', division: '40+' },
                          { format: 'mixed_doubles', division: '40+' }
                        );
                      }
                      
                      if (userAge >= 50) {
                        eligibleCategories.push(
                          { format: 'mens_singles', division: '50+' },
                          { format: 'mens_doubles', division: '50+' },
                          { format: 'mixed_doubles', division: '50+' }
                        );
                      }

                      return eligibleCategories.map((category, index) => {
                        // Find if user has data for this category
                        const categoryData = pcpRankingData?.allCategories?.find(
                          (c: any) => c.format === category.format && c.division === category.division
                        );

                        const isRanked = categoryData && categoryData.rankingPoints > 0;
                        const colorScheme = index % 3 === 0 ? 'purple' : index % 3 === 1 ? 'blue' : 'indigo';

                        return (
                          <motion.div 
                            key={`${category.format}-${category.division}`}
                            className={`bg-gradient-to-r from-${colorScheme}-50 to-${colorScheme}-100 rounded-lg p-2 border-2 border-${colorScheme}-200 hover:shadow-md transition-all duration-200`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="text-center">
                              <div className={`font-bold text-xs text-${colorScheme}-800`}>
                                {category.format?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • {category.division}
                              </div>
                              <div className={`text-lg font-black my-1 text-${colorScheme}-600`}>
                                {isRanked ? `${categoryData.rankingPoints} pts` : 'Not Ranked'}
                              </div>
                              {isRanked ? (
                                <div className={`text-xs mb-1 text-${colorScheme}-700`}>
                                  T: {categoryData.breakdown?.tournamentPoints || 0} • M: {categoryData.breakdown?.matchPoints || 0}
                                </div>
                              ) : (
                                <div className={`text-xs mb-1 text-${colorScheme}-600`}>
                                  No tournament participation
                                </div>
                              )}
                              {isRanked && (
                                <div className={`mt-1 rounded-full h-1 overflow-hidden bg-${colorScheme}-100`}>
                                  <div 
                                    className={`h-full transition-all duration-1000 ease-out bg-${colorScheme}-500`}
                                    style={{ 
                                      width: categoryData.milestone ? 
                                        `${Math.max(10, (categoryData.milestone.current / categoryData.milestone.next) * 100)}%` : 
                                        '10%' 
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-2 text-xs text-orange-600 flex items-center justify-between">
                    <span>{pcpRankingData?.system || 'PCP Global Ranking System v2.0 (52-week rolling)'}</span>
                    {pcpRankingData?.totalCategories > 3 && (
                      <span className="text-orange-500 font-medium">
                        +{pcpRankingData.totalCategories - 3} more categories
                      </span>
                    )}
                  </div>
                  {pcpRankingData?.userAge && (
                    <div className="mt-1 text-xs text-orange-500">
                      Age {pcpRankingData.userAge} • Eligible for {pcpRankingData?.totalCategories || 1} ranking categories
                    </div>
                  )}
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
                  {showPassportCode ? (
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-orange-600 mx-auto mb-2" />
                      <div className="font-mono font-bold text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded border">
                        {user.passportCode || 'LOADING...'}
                      </div>
                    </div>
                  ) : (
                    <QrCode className="w-32 h-32 text-orange-600" />
                  )}
                </motion.div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                  <Scan className="w-3 h-3 mr-1" />
                  {showPassportCode ? 'Code Visible' : 'Tap to Reveal Code'}
                </Badge>
                <p className="text-xs text-orange-600 mt-1 text-center max-w-32">
                  {showPassportCode ? 'Share this code with other players' : 'Players scan to initiate matches or view stats'}
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
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-800">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Pickle Points
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-yellow-100 transition-colors">
                      <Info className="w-4 h-4 text-yellow-600" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <Zap className="w-5 h-5" />
                        What are Pickle Points?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h3 className="font-semibold text-orange-800 mb-2">Your Digital Pickleball Currency</h3>
                        <p className="text-orange-700 text-sm">
                          Pickle Points are rewards you earn for being active in the pickleball community. Play matches, 
                          complete your profile, participate in tournaments, and engage with other players to earn points.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-green-800">Win Matches</p>
                          <p className="text-xs text-green-600">+15-25 pts</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-blue-800">Profile Updates</p>
                          <p className="text-xs text-blue-600">+5-10 pts</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-purple-800">Join Tournaments</p>
                          <p className="text-xs text-purple-600">+20-50 pts</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <Star className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                          <p className="text-xs font-medium text-pink-800">Daily Activity</p>
                          <p className="text-xs text-pink-600">+3-8 pts</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Redeem for Rewards
                        </h3>
                        <p className="text-amber-700 text-sm mb-2">
                          Use your points for exclusive rewards from our partner merchants:
                        </p>
                        <ul className="text-xs text-amber-600 space-y-1">
                          <li>• Court time discounts</li>
                          <li>• Equipment and gear</li>
                          <li>• Tournament entry fees</li>
                          <li>• Coaching sessions</li>
                          <li>• Special events access</li>
                        </ul>
                      </div>
                      
                      <div className="text-center text-xs text-gray-500">
                        Points are earned through verified activities and cannot be transferred between accounts.
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-600">{picklePoints.toLocaleString()}</p>
                <p className="text-sm text-yellow-700">Total Points</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-yellow-600">Match Wins</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.matchWinPoints || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">Participation</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.matchParticipationPoints || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">Profile Bonus</p>
                <p className="text-xl font-bold text-yellow-800">{picklePointsData?.breakdown?.profileBonus || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-yellow-600">System</p>
                <p className="text-xs font-bold text-yellow-800">{picklePointsData?.system?.split(' ')[0] || 'Activity'}</p>
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
                      <span className="text-sm text-gray-600">Passport Code</span>
                      <div className="flex items-center gap-2">
                        {showPassportCode ? (
                          <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border">
                            {user.passportCode || 'Not Set'}
                          </span>
                        ) : (
                          <span className="font-mono text-gray-400">••••••••</span>
                        )}
                        <button 
                          onClick={handleQRReveal}
                          className="text-xs text-orange-600 hover:text-orange-700 underline"
                        >
                          {showPassportCode ? 'Hide' : 'Show'}
                        </button>
                      </div>
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
      
      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        onUploadSuccess={handlePhotoUploadSuccess}
        currentAvatar={user.avatarUrl || undefined}
      />
    </div>
  );
}