/**
 * PKL-278651-UI-0001-STDLAYOUT-DASH
 * Dashboard Content Component
 * 
 * Extracts the dashboard content into a separate component to be used
 * with the standard layout system, preventing header duplication.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PlayerPassport } from '@/components/dashboard/PlayerPassport';
import { PCPRankings } from '@/components/dashboard/PCPRankings';
import MasteryPathsDisplay from '@/components/mastery/MasteryPathsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bolt, BarChart3, Trophy, Award, Star, TrendingUp, Activity, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { BounceStatusTicker } from '@/components/bounce/BounceStatusTicker';
import { BounceAssistancePanel } from '@/components/bounce/BounceAssistancePanel';
import { useToast } from '@/hooks/use-toast';
import { useMatchStatistics } from '@/hooks/use-match-statistics';
import { useCourtIQPerformance } from '@/hooks/use-courtiq-performance';

export default function DashboardContent() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Fetch match statistics and CourtIQ performance data
  const { data: matchStats, isLoading: isMatchStatsLoading } = useMatchStatistics({ 
    userId: user?.id,
    enabled: !!user
  });
  const { data: courtIQData, isLoading: isCourtIQLoading } = useCourtIQPerformance({
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
  
  // Dynamic stats for animations
  const xpPercentage = Math.min((user.xp || 520) / 10, 100);
  const winRate = matchStats?.winRate || 
    (user.totalMatches ? Math.round((user.matchesWon || 16) / (user.totalMatches || 24) * 100) : 67);
  
  return (
    <>
      {/* Background with subtle particle effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Welcome Section */}
          <motion.div 
            className="md:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">
                  Welcome, <span className="text-indigo-500 dark:text-indigo-400">{user.displayName || user.username}</span>
                </h2>
                <div className="flex items-center gap-3 mb-2">
                  {user.passportId && (
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Passport Code:</span>
                      <code className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">
                        {user.passportId?.replace(/^PKL-/, '').replace(/-/g, '')}
                      </code>
                      <button 
                        onClick={() => {
                          const rawPassportId = user.passportId?.replace(/^PKL-/, '').replace(/-/g, '') || '';
                          navigator.clipboard.writeText(rawPassportId);
                          setCodeCopied(true);
                          toast({
                            title: "Copied!",
                            description: "Passport code copied to clipboard",
                            duration: 2000,
                          });
                          setTimeout(() => setCodeCopied(false), 2000);
                        }}
                        className="ml-1 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Copy code"
                      >
                        {codeCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl">
                  Your pickleball journey continues. Track your progress, join tournaments, and connect with the community.
                </p>
              </div>
              {/* Show recent activity notification - disabled for now */}
              {false && (
                <div className="hidden md:block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30 max-w-xs">
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    <Activity size={14} className="mr-1" />
                    Recent Activity
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your rating increased after recent matches. Keep it up!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Player Passport Section */}
          <motion.div 
            className="md:col-span-12 lg:col-span-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">
                Your Digital Passport
              </h3>
              <div className="ml-2 text-xs bg-gradient-to-r from-orange-400 to-pink-500 text-white px-2 py-0.5 rounded-full">
                Interactive
              </div>
            </div>
            
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-900/90 backdrop-blur-sm overflow-hidden relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
              <CardContent className="p-4 relative z-10">
                <div className="w-full max-w-md mx-auto">
                  <PlayerPassport user={user} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* PCP Rankings Section */}
          <motion.div 
            className="md:col-span-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <PCPRankings user={user} />
          </motion.div>
          
          {/* Mastery Paths Section */}

          <motion.div 
            className="md:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
                CourtIQ™ Mastery Status
              </h3>
              <div className="ml-2 text-xs bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                Adaptive System
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <MasteryPathsDisplay />
              </div>
              <div className="md:col-span-2 hidden md:block">
                <Card className="shadow-lg border border-gray-100/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <div className="text-center p-6">
                        <h3 className="text-lg font-semibold mb-3">Your CourtIQ™ Journey</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          The CourtIQ™ Mastery Path system adapts to your playing style and skill level, 
                          providing personalized tier recommendations and progression paths.
                        </p>
                        <div className="flex justify-center">
                          <a 
                            href="/mastery-paths" 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all"
                          >
                            <Award size={16} />
                            Explore All Paths
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div 
            className="md:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Performance Metrics header removed from here to reduce duplication */}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* XP Card with circular progress */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="shadow-lg border border-gray-100/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <span className="bg-gradient-to-br from-[#FF5722] to-[#FF9800] p-1.5 rounded-lg mr-2 text-white">
                        <Bolt size={18} />
                      </span>
                      <span className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] text-transparent bg-clip-text">
                        Experience Points
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="relative w-20 h-20 mr-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="10"
                          />
                          {/* Progress circle with animation */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#xpGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: 251, strokeDashoffset: 251 }}
                            animate={{ 
                              strokeDashoffset: isLoaded ? 251 - (251 * xpPercentage / 100) : 251
                            }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#FF5722" />
                              <stop offset="100%" stopColor="#FF9800" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm font-bold">{user.level || 5}</div>
                            <div className="text-xs text-gray-500">Level</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="space-y-2 mb-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current XP</span>
                            <motion.span 
                              className="font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.6, duration: 0.3 }}
                            >
                              {user.xp || 520}
                            </motion.span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Next Level</span>
                            <motion.span 
                              className="font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.7, duration: 0.3 }}
                            >
                              {(user.level || 5) + 1}
                            </motion.span>
                          </div>
                        </div>
                        
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block text-orange-500">
                                Level Progress
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-orange-500">
                                {Math.round(xpPercentage)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex h-2 mb-0 overflow-hidden rounded bg-gray-200">
                            <motion.div
                              className="bg-gradient-to-r from-orange-500 to-yellow-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${xpPercentage}%` }}
                              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Win Rate Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="shadow-lg border border-gray-100/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2196F3] to-[#03A9F4]"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <span className="bg-gradient-to-br from-[#2196F3] to-[#03A9F4] p-1.5 rounded-lg mr-2 text-white">
                        <Trophy size={18} />
                      </span>
                      <span className="bg-gradient-to-r from-[#2196F3] to-[#03A9F4] text-transparent bg-clip-text">
                        Win Rate
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="relative w-20 h-20 mr-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#f3f4f6"
                            strokeWidth="10"
                          />
                          {/* Progress circle with animation */}
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#winRateGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: 251, strokeDashoffset: 251 }}
                            animate={{ 
                              strokeDashoffset: isLoaded ? 251 - (251 * Math.min(winRate, 100) / 100) : 251
                            }}
                            transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2196F3" />
                              <stop offset="100%" stopColor="#03A9F4" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <motion.div 
                              className="text-xl font-bold"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 1, duration: 0.5 }}
                            >
                              {isMatchStatsLoading ? (
                                <Loader2 size={16} className="animate-spin mx-auto" />
                              ) : (
                                `${Math.round(winRate)}%`
                              )}
                            </motion.div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Matches Won</span>
                            <motion.span
                              className="font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 0.9, duration: 0.3 }}
                            >
                              {isMatchStatsLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                matchStats?.wins || user.matchesWon || 16
                              )}
                            </motion.span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Matches</span>
                            <motion.span
                              className="font-medium"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 1, duration: 0.3 }}
                            >
                              {isMatchStatsLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                matchStats?.total || user.totalMatches || 24
                              )}
                            </motion.span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Recent Performance</span>
                            <motion.span
                              className="font-medium flex items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isLoaded ? 1 : 0 }}
                              transition={{ delay: 1.1, duration: 0.3 }}
                            >
                              <TrendingUp size={14} className="mr-1 text-green-500" />
                              <span className="text-green-500">+2.3%</span>
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Court IQ Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="shadow-lg border border-gray-100/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#673AB7] to-[#9C27B0]"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <span className="bg-gradient-to-br from-[#673AB7] to-[#9C27B0] p-1.5 rounded-lg mr-2 text-white">
                        <BarChart3 size={18} />
                      </span>
                      <span className="bg-gradient-to-r from-[#673AB7] to-[#9C27B0] text-transparent bg-clip-text">
                        CourtIQ™ Performance
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="relative w-20 h-20 mr-4 flex items-center justify-center">
                        {isCourtIQLoading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-purple-500/70" />
                        ) : !courtIQData ? (
                          <div className="text-center">
                            <AlertCircle className="w-8 h-8 mx-auto text-amber-500/70" />
                            <span className="text-xs text-gray-500 block mt-1">No data</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-[#673AB7] to-[#9C27B0] text-transparent bg-clip-text">{courtIQData.overallRating ? Math.round(courtIQData.overallRating / 25) : "--"}</div>
                            <div className="text-xs text-gray-500">of 100</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="space-y-2">
                          {!isCourtIQLoading && courtIQData && (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                                  <span className="text-gray-600">Technique</span>
                                </div>
                                <span className="font-medium">{courtIQData.dimensions?.technique?.score || 0}/10</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                                  <span className="text-gray-600">Strategy</span>
                                </div>
                                <span className="font-medium">{courtIQData.dimensions?.strategy?.score || 0}/10</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                  <span className="text-gray-600">Consistency</span>
                                </div>
                                <span className="font-medium">{courtIQData.dimensions?.consistency?.score || 0}/10</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
                                  <span className="text-gray-600">Focus</span>
                                </div>
                                <span className="font-medium">{courtIQData.dimensions?.focus?.score || 0}/10</span>
                              </div>
                            </>
                          )}
                          
                          {(isCourtIQLoading || !courtIQData) && (
                            <div className="py-2">
                              <div className="text-sm text-gray-500 mb-2">
                                {isCourtIQLoading 
                                  ? "Loading your performance data..." 
                                  : "No CourtIQ™ performance data available yet."}
                              </div>
                              
                              {!isCourtIQLoading && !courtIQData && (
                                <div className="text-xs text-gray-400">
                                  Record matches to see your CourtIQ™ performance metrics
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {!isCourtIQLoading && courtIQData && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium bg-gradient-to-r from-[#673AB7] to-[#9C27B0] text-transparent bg-clip-text">Overall Rating</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={`${
                                      i < Math.round(courtIQData.overallRating / 200)
                                        ? "text-purple-500 fill-purple-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* CSS Animation is now in index.css */}
    </>
  );
}